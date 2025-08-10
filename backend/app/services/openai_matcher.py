# Strict, detailed prompt builder for checklist generation
def build_checklist_prompt(matched_data, region):
        """
        Detailed, strict prompt for generating accurate construction checklists.
        """
        import json
        return f"""
You are an expert construction compliance officer working in the {region.upper()} region.
You have deep expertise in the Saudi Building Code (SBC) and other applicable {region.upper()} construction regulations.

You are given:
- Matched data: specification sections from the user's document that have already been matched to clauses in the selected SBC codebooks.
- Each match contains: `user_section`, `matched_clause`, and `codebook`.

Your task:
1. **Only generate checklist items for clauses that have a specific, measurable, and verifiable requirement.**
     - Skip any matches that are purely general statements (e.g., "comply with local laws" or "follow SBC").
     - Skip clauses that do not contain a requirement that can be checked on-site or in documentation.
2. **Checklist Item Rules:**
     - Each checklist item must be actionable and written so an inspector can verify it.
     - Avoid vague statements; be concrete.
     - Where applicable, break a long requirement into multiple checklist items.
     - Do NOT invent requirements — use only what exists in the `matched_clause` and relevant details from `user_section`.
     - If a requirement contains numeric limits (dimensions, loads, pressures, etc.), preserve those values exactly.
3. **Output Format (JSON)**:
     - An array of objects, one per matched clause, with the following fields:
         - `section_id`: The section number or identifier from the `user_section` (if missing, set as "N/A").
         - `checklist`: An array of checklist items, each with:
             - `item`: sequential number as a string ("1", "2", "3", ...)
             - `requirement`: clear and complete requirement statement
             - `status`: leave empty string ("") for now
             - `comments`: leave empty string ("") for now

Example Output:
[
    {{
        "section_id": "2.3.1",
        "checklist": [
            {{
                "item": "1",
                "requirement": "Verify that all potable water piping is constructed from approved materials per SBC-701, Section 4.2.",
                "status": "",
                "comments": ""
            }},
            {{
                "item": "2",
                "requirement": "Confirm installation of backflow prevention devices at all potable water supply inlets.",
                "status": "",
                "comments": ""
            }}
        ]
    }}
]

Matched Data to process:
{json.dumps(matched_data, ensure_ascii=False)}
"""
import os
import openai
import re
import json
from PyPDF2 import PdfReader
from flask import current_app


OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Helper to extract text from a PDF file
def extract_pdf_text(pdf_path):
    text = []
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            text.append(page.extract_text() or "")
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    return "\n".join(text)

# Main OpenAI matching/checklist logic
# sections: list of dicts (from user spec)
# codebook_ids: list of codebook IDs (e.g. ['SBC-501'])
# region: string
# Returns: list of matches with checklists


# Step 1: Get matching clauses from OpenAI
def get_matching_clauses_openai(sections, codebook_ids, region):
    codebook_texts = {}
    codebook_dir = os.path.join(os.getcwd(), 'shared', 'codebooks')
    print('DEBUG: codebook_ids received:', codebook_ids)
    for codebook_id in codebook_ids:
        found = False
        for fname in os.listdir(codebook_dir):
            if fname.startswith(codebook_id) and fname.endswith('.pdf'):
                codebook_path = os.path.join(codebook_dir, fname)
                print(f'DEBUG: Loading codebook for {codebook_id} from {codebook_path}')
                codebook_text = extract_pdf_text(codebook_path)
                print(f'DEBUG: First 500 chars of codebook {codebook_id}:', codebook_text[:500])
                codebook_texts[codebook_id] = codebook_text
                found = True
                break
        if not found:
            print(f'WARNING: No codebook PDF found for codebook_id {codebook_id} in {codebook_dir}')

    results = []
    processable_sections = sections[:10] if len(sections) > 10 else sections
    for codebook_id, codebook_text in codebook_texts.items():
        region_name = region.capitalize()
        codebook_label = codebook_id
        codebook_prompt = ''
        if region.lower() == 'dubai':
            codebook_prompt = f"Dubai Building Code chapter {codebook_id}"
        elif region.lower() == 'saudi':
            codebook_prompt = f"Saudi Building Code (SBC) {codebook_id}"
            codebook_label = codebook_id.replace('SBC-', '')
        else:
            codebook_prompt = f"{region_name} Building Code {codebook_id}"

        prompt = f'''
        I have sections from a construction document specification and need to match them with relevant clauses from the {codebook_prompt}.

        CATEGORY CONTEXT: Only consider clauses from SBC {codebook_id} that relate directly to the selected category: {codebook_label}.
        Ignore general clauses that simply state compliance or scope unless they contain measurable requirements.
        Do not include clauses that only describe overall project scope or general legal compliance.

        Here are the document sections (JSON):
        {json.dumps(processable_sections, indent=2)}

        Here is the full text of the selected codebook:
        {codebook_text[:12000]}

        For each section, find the most relevant clause in the {codebook_prompt} that is specific to the selected category ({codebook_label}) and contains explicit, measurable requirements.
        Return the results in this exact JSON format:
        [
          {{
            "user_section": {{
              "section_id": "section ID from input",
              "title": "section title from input",
              "content": "section content from input"
            }},
            "matched_clause": {{
              "section_id": "matching clause ID",
              "title": "matching clause title",
              "content": "matching clause content",
              "codebook": "{codebook_label}"
            }},
            "similarity_score": 0.XX
          }}
        ]

        Only include sections that have relevant matches with a similarity score of at least 0.7.

        IMPORTANT: Your response MUST be valid JSON only. Do not include any explanatory text before or after the JSON array.
        Do not include markdown formatting, code blocks, or any other text. Return only the JSON array.
        '''

        response = client.chat.completions.create(
            model='gpt-4-turbo',
            messages=[
                {"role": "system", "content": f"You are an expert in construction specifications and building codes. Your task is to match sections from a user specification document with relevant clauses from the {codebook_prompt}."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )
        content = response.choices[0].message.content
        # Try to extract JSON array
        json_match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
        if json_match:
            codebook_results = json.loads(json_match.group(0))
        else:
            cleaned_content = content.strip()
            array_start = cleaned_content.find('[')
            array_end = cleaned_content.rfind(']')
            if array_start != -1 and array_end != -1 and array_end > array_start:
                cleaned_content = cleaned_content[array_start:array_end+1]
            codebook_results = json.loads(cleaned_content)
        if isinstance(codebook_results, list):
            results.extend(codebook_results)
    # Sort by similarity score
    results.sort(key=lambda x: x.get('similarity_score', 0), reverse=True)
    return results

# Step 2: Generate checklist from matched clauses using OpenAI
def generate_checklist_openai(matched_clauses, region):
    # For brevity, only send the top 10 matches to OpenAI for checklist generation
    top_matches = matched_clauses[:10] if len(matched_clauses) > 10 else matched_clauses
    prompt = build_checklist_prompt(top_matches, region)
    response = client.chat.completions.create(
        model='gpt-4-turbo',
        messages=[
            {"role": "system", "content": "You are a construction compliance expert."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
    )
    content = response.choices[0].message.content
    print('DEBUG: Raw OpenAI checklist response:', content[:1000])
    # Try to extract JSON array
    json_match = re.search(r'\[\s*\{.*\}\s*\]', content, re.DOTALL)
    if json_match:
        checklist_raw = json.loads(json_match.group(0))
    else:
        cleaned_content = content.strip()
        array_start = cleaned_content.find('[')
        array_end = cleaned_content.rfind(']')
        if array_start != -1 and array_end != -1 and array_end > array_start:
            cleaned_content = cleaned_content[array_start:array_end+1]
        checklist_raw = json.loads(cleaned_content)

    # Map to frontend format: id, title, items
    checklist = []
    for entry in checklist_raw:
        section_id = entry.get('section_id', 'N/A')
        items = entry.get('checklist', [])
        checklist.append({
            'id': section_id,
            'title': f'Section {section_id}',
            'items': items
        })
    return checklist
