import os
import openai
import re
import json
from PyPDF2 import PdfReader
from typing import List, Dict, Any

def extract_pdf_text(pdf_path: str) -> str:
    text = []
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            text.append(page.extract_text() or "")
    except Exception as e:
        print(f"[extract_pdf_text] Error reading {pdf_path}: {e}")
    return "\n".join(text)


def _extract_json_array_from_text(text: str) -> Any:
    """
    Try several robust ways to extract a JSON array from model output text.
    Returns Python object (usually a list) or raises ValueError if extraction fails.
    """
    text = text.strip()
    # 1) Try direct load (ideal case)
    try:
        return json.loads(text)
    except Exception:
        pass

    # 2) Find first '[' and last ']' and try to load that substring
    array_start = text.find('[')
    array_end = text.rfind(']')
    if array_start != -1 and array_end != -1 and array_end > array_start:
        candidate = text[array_start:array_end + 1]
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # 3) Regex to find JSON-like arrays of objects (non-greedy)
    arrays = re.findall(r'\[[\s\S]*?\]\s*(?=$|\n)', text)
    for a in arrays:
        try:
            return json.loads(a)
        except Exception:
            continue

    # 4) Try single-quote -> double-quote fallback (risky, last resort)
    candidate = text.replace("'", '"')
    try:
        return json.loads(candidate)
    except Exception:
        pass

    # If all fail, raise informative error
    raise ValueError("Unable to reliably extract JSON array from model output.")


def match_sections_with_codebooks_openai(sections: List[Dict[str, Any]],
                                         codebook_ids: List[str],
                                         region: str) -> Dict[str, Any]:
    """
    Matches `sections` with codebooks (by codebook_ids). Returns aggregated matches and checklist entries.
    """

    # Ensure API key is available
    openai.api_key = os.getenv('OPENAI_API_KEY')
    if not openai.api_key:
        raise RuntimeError("OPENAI_API_KEY environment variable is not set")

    # Build codebook_texts map first (do not call API inside file loop)
    codebook_texts: Dict[str, str] = {}
    codebook_dir = os.path.join(os.getcwd(), 'shared', 'codebooks')
    if not os.path.isdir(codebook_dir):
        print(f"[match] Warning: codebook directory not found: {codebook_dir}")

    for codebook_id in codebook_ids:
        found = False
        if os.path.isdir(codebook_dir):
            for fname in os.listdir(codebook_dir):
                # allow both "SBC-501.pdf" or "501-SBC.pdf" style heuristics if needed
                if fname.startswith(codebook_id) and fname.lower().endswith('.pdf'):
                    codebook_path = os.path.join(codebook_dir, fname)
                    codebook_texts[codebook_id] = extract_pdf_text(codebook_path)
                    found = True
                    break
        if not found:
            # if not found, still set an empty string so caller knows it's missing
            codebook_texts[codebook_id] = ""
            print(f"[match] Warning: codebook {codebook_id} not found in {codebook_dir}.")

    # Limit sections to a reasonable number for a single prompt to control tokens
    processable_sections = sections[:10] if len(sections) > 10 else sections

    all_results: List[Dict[str, Any]] = []

    # Iterate over codebooks (now fully built) and call the model per codebook
    for codebook_id, codebook_text in codebook_texts.items():
        codebook_label = codebook_id
        if region and region.lower() == 'saudi':
            # strip common prefix if present
            codebook_label = codebook_id.replace('SBC-', '')

        prompt = f"""
You are an expert in Saudi Building Code ({codebook_label}) compliance analysis.

TASK:
Given:
1. A list of construction document sections (`user_spec_sections`).
2. The text of a specific Saudi Building Code book ({codebook_id} - {codebook_label}).

Your objective:
- For each user_spec_section, determine if it matches a clause in the codebook that contains explicit, enforceable, and measurable requirements.
- Only consider a "match" if:
    - The requirement is measurable on-site (dimension, tolerance, material spec, procedural step, performance method).
    - The codebook clause directly regulates what is described in the user section.

Ignore any user section that:
- Only describes site conditions, coordinates, general background, or administrative instructions.
- Simply states "comply with SBC" without measurable criteria.
- Contains no measurable property, standard, or method.

When a match is found:
1. Provide the matching clause details (section_id, title, content).
2. Generate a checklist ONLY from enforceable requirements:
    - Each checklist item must be independently verifiable on-site.
    - Each must be specific (avoid vague terms).
    - Include only requirements that can be measured, tested, or visually confirmed.

OUTPUT FORMAT:
Return a pure JSON array (no markdown, no explanations) with this structure:
[
  {{
    "user_section": {{ "section_id": "...", "title": "...", "content": "..." }},
    "matched_clause": {{ "section_id": "...", "title": "...", "content": "...", "codebook": "{codebook_label}" }},
    "similarity_score": 0.00,
    "checklist": [
      {{ "item": "1", "requirement": "explicit measurable requirement", "status": "Not Verified", "comments": "" }}
    ]
  }}
]

RULES:
- Only include matches with similarity_score >= 0.70.
- If no match exists, omit that section entirely.
- Output must be strictly valid JSON (parseable).

DATA:
Document Sections (JSON):
{json.dumps(processable_sections, indent=2)}

Relevant Codebook Text:
{codebook_text[:12000]}
"""

        # Call OpenAI (ChatCompletion) - robustly handle exceptions
        try:
            response = openai.ChatCompletion.create(
                model='gpt-4o',  # or 'gpt-4-turbo' depending on your account; change if needed
                messages=[
                    {"role": "system", "content": "You are an expert in construction specifications and building codes. Produce only JSON as specified."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,  # deterministic
                max_tokens=3500
            )
        except Exception as e:
            print(f"[match] OpenAI API error for codebook {codebook_id}: {e}")
            continue

        content = response['choices'][0]['message']['content']
        # Attempt to extract JSON reliably
        try:
            codebook_results = _extract_json_array_from_text(content)
        except ValueError as e:
            print(f"[match] Failed to parse JSON from model for codebook {codebook_id}: {e}")
            print(f"[match] Model raw output (truncated): {content[:1000]}")
            continue

        # Validate type
        if not isinstance(codebook_results, list):
            print(f"[match] Unexpected parsed result type for {codebook_id}: {type(codebook_results)}")
            continue

        # Optionally: validate each object's shape (lightweight)
        for item in codebook_results:
            if not isinstance(item, dict):
                print(f"[match] Skipping non-dict item in results for {codebook_id}: {type(item)}")
                continue
            # Add the codebook id/label to matched_clause if missing or inconsistent
            matched_clause = item.get('matched_clause') or {}
            if isinstance(matched_clause, dict):
                matched_clause.setdefault('codebook', codebook_label)
                item['matched_clause'] = matched_clause
            all_results.append(item)

    # Sort aggregated results by similarity_score desc
    all_results.sort(key=lambda x: x.get('similarity_score', 0), reverse=True)

    # Build final return structure
    return {
        "matched_clauses": all_results,
        "checklist": [r for r in all_results if r.get('checklist')]
    }
