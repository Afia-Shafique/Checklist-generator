import os
import re
import json
from PyPDF2 import PdfReader
import openai

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# ---------- UTILITIES ----------
def extract_json_array(text):
    """Robust JSON array extraction from GPT output."""
    text = text.strip()
    json_match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group(0))

    array_start = text.find('[')
    array_end = text.rfind(']')
    if array_start != -1 and array_end != -1 and array_end > array_start:
        return json.loads(text[array_start:array_end+1])

    raise ValueError("Unable to extract JSON array from response")


def extract_pdf_text(pdf_path):
    """Extracts all text from a PDF file."""
    text = []
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            text.append(page.extract_text() or "")
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    return "\n".join(text)


# ---------- DUBAI HELPER ----------
def load_dubai_code_sections(selected_ids):
    """
    Load Dubai Building Code sections for the selected subcategories/chapters.
    Expands each prefix to include its direct children (one level down).
    """
    base_path = os.path.join(os.getcwd(), 'shared', 'Dubai Book')
    sections_file = os.path.join(base_path, 'dubai_building_code_sections.json')

    if not os.path.exists(sections_file):
        raise FileNotFoundError(f"Dubai building code sections file not found at {sections_file}")

    with open(sections_file, 'r', encoding='utf-8') as f:
        all_sections = json.load(f)

    matched_sections = []
    for sec in all_sections:
        sec_id = sec.get("section_id", "")
        for sel in selected_ids:
            # Include exact match
            if sec_id == sel:
                matched_sections.append(sec)
            # Include one-level children like H.3.1 of H.3
            elif sec_id.startswith(sel + ".") and sec_id.count(".") == sel.count(".") + 1:
                matched_sections.append(sec)

    return matched_sections


# ---------- PROMPTS ----------
def build_match_prompt(user_sections, codebook_text, region, codebook_label):
    """
    Builds the strict GPT prompt for matching clauses to user specs.
    """
    return f"""
You are a senior building code compliance officer specializing in {region.capitalize()} Building Code.

TASK:
Match each user project specification section with the most relevant clause(s) from the provided {region.capitalize()} Building Code text.

ONLY consider a "match" if:
- The clause contains enforceable, measurable, site-verifiable requirements.
- It is directly relevant to the specification.

IGNORE:
- Clauses that are administrative only.
- Requirements without measurable criteria.

For each match:
1. Provide the matched clause details (section_id, title, content, codebook="{codebook_label}").
2. Assign a similarity_score between 0 and 1.
3. Do NOT include matches with similarity_score < 0.70.

OUTPUT FORMAT:
[
  {{
    "user_section": {{
      "section_id": "...",
      "title": "...",
      "content": "..."
    }},
    "matched_clause": {{
      "section_id": "...",
      "title": "...",
      "content": "...",
      "codebook": "{codebook_label}"
    }},
    "similarity_score": 0.0
  }}
]

USER PROJECT SPEC SECTIONS:
{json.dumps(user_sections, ensure_ascii=False, indent=2)}

RELEVANT {region.upper()} BUILDING CODE TEXT:
{codebook_text[:12000]}
"""


def build_checklist_prompt(matched_data, region):
    """
    Builds the GPT prompt for checklist generation with enriched details.
    """
    return f"""
You are an expert construction compliance officer working in the {region.upper()} region.

You are given matched clauses between the user's project specifications and the building code.
For EACH matched section, generate a compliance checklist.

IMPORTANT:
1. Use the EXACT title from "user_section.title" as the "title" field.
2. Keep the title short (max 12 words).
3. Each checklist item MUST be:
     - Specific, measurable, and verifiable on site.
     - No vague statements or administrative notes.
4. Each checklist item must have:
     - "item": sequential number starting from 1
     - "requirement": explicit measurable requirement
     - "status": one of ["Compliant", "Non-Compliant", "Not Specified"]
     - "comments": optional notes for clarification

5. For the section-level "status" (shown in main results table):
     - If ALL checklist items are "Compliant", status = "Compliant"
     - If ANY checklist item is "Non-Compliant", status = "Non-Compliant"
     - Otherwise, "Not Specified"

OUTPUT JSON FORMAT (no text before or after):
[
    {{
        "section_id": "...",
        "title": "Short title from user spec",
        "status": "Compliant / Non-Compliant / Not Specified",
        "checklist": [
            {{
                "item": "1",
                "requirement": "...",
                "status": "Compliant / Non-Compliant / Not Specified",
                "comments": "..."
            }}
        ]
    }}
]

Matched Data:
{json.dumps(matched_data, ensure_ascii=False)}
"""


# ---------- MAIN MATCHER ----------
def get_matching_clauses_openai_unified(user_sections, region, codebook_text, codebook_label):
    """
    Single matcher for both Saudi and Dubai.
    Returns matches in the nested structure that frontend expects.
    """
    processable_sections = user_sections[:10] if len(user_sections) > 10 else user_sections
    prompt = build_match_prompt(processable_sections, codebook_text, region, codebook_label)

    response = client.chat.completions.create(
        model='gpt-4-turbo',
        messages=[
            {"role": "system", "content": "You are an expert in construction specifications and building codes. Output valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0
    )

    # Raw GPT matches
    raw_matches = extract_json_array(response.choices[0].message.content)

    # --- Normalize into the structure frontend expects ---
    normalized_matches = []
    for m in raw_matches:
        user_sec = m.get("user_section", {})
        clause = m.get("matched_clause", {})

        # Skip if clause totally empty
        if not clause.get("section_id") and not clause.get("content", "").strip():
            continue

        normalized_matches.append({
            "user_section": {
                "section_id": user_sec.get("section_id", ""),
                "title": user_sec.get("title", ""),
                "content": user_sec.get("content", "")
            },
            "matched_clause": {
                "section_id": clause.get("section_id", ""),
                "title": clause.get("title", ""),
                "content": clause.get("content", ""),
                "codebook": clause.get("codebook", codebook_label)
            },
            "similarity_score": m.get("similarity_score", 0.0)
        })

    # --- Apply similarity threshold ---
    normalized_matches = [
        m for m in normalized_matches if m.get("similarity_score", 0) >= 0.7
    ]

    return normalized_matches




# ---------- CHECKLIST ----------
def generate_checklist_openai(matched_clauses, region):
    top_matches = matched_clauses[:10] if len(matched_clauses) > 10 else matched_clauses
    prompt = build_checklist_prompt(top_matches, region)

    response = client.chat.completions.create(
        model='gpt-4-turbo',
        messages=[
            {"role": "system", "content": "You are a construction compliance expert."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0
    )

    checklist_raw = extract_json_array(response.choices[0].message.content)
    enriched_checklist = []

    for entry in checklist_raw:
        sec_id = (entry.get('section_id') or 'N/A').strip()
        clean_sec_id = sec_id.replace("Requirement", "").strip()

        # ✅ Match by nested structure keys
        match = next(
            (m for m in matched_clauses
             if clean_sec_id in (m.get('user_section', {}).get('section_id') or '') 
             or clean_sec_id in (m.get('matched_clause', {}).get('section_id') or '')
             or (m.get('matched_clause', {}).get('section_id') or '').startswith(clean_sec_id)),
            None
        )

        # ✅ Always get title from user_section.title if possible
        display_title = None
        if match:
            display_title = match.get('user_section', {}).get('title') \
                             or match.get('user_section', {}).get('content', '')[:60]

        # 🚨 Fallback — if title is still just a number (like '2.1'), use content snippet
        if display_title and re.match(r'^\d+(\.\d+)*$', display_title.strip()):
            display_title = match.get('user_section', {}).get('content', '')[:60]

        if not display_title:
            display_title = f"Section {sec_id}"

        checklist_items = [
            {
                "id": str(idx),
                "requirement": item.get("requirement", ""),
                "status": item.get("status", "") or "Not Specified",
                "comments": item.get("comments", "")
            }
            for idx, item in enumerate(entry.get('checklist', []), start=1)
        ]

        enriched_checklist.append({
            "id": sec_id,
            "title": display_title,
            "items": checklist_items,
            "status": entry.get("status", "Not Specified")
        })

    return enriched_checklist
