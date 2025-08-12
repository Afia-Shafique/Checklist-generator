import os
import json
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from ..ocr.ocr_processor import extract_text_from_file
from ..services import filter_utils

match_bp = Blueprint('match_routes', __name__)
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'shared', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

sections_file_path = os.path.join(
    os.getcwd(),
    'shared',
    'Dubai Book',
    'dubai_building_code_sections.json'
)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'csv', 'txt', 'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@match_bp.route('/match', methods=['POST'])
def match_sections_with_codebooks():
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'status': 'error', 'message': 'Unsupported file format'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Extract sections from uploaded document
    result = extract_text_from_file(file_path)
    sections = result.get('sections')
    if not sections or not isinstance(sections, list):
        return jsonify({'status': 'error', 'message': 'No sections extracted'}), 500

    region = request.form.get('region', '').strip().lower()

    from ..services.openai_matcher import (
        get_matching_clauses_openai_unified,
        generate_checklist_openai,
        load_dubai_code_sections,
        extract_pdf_text
    )

    import traceback
    try:
        # ---------- SAUDI ----------
        if region == 'saudi':
            codebook_ids = request.form.getlist('codebook_ids[]')
            if not codebook_ids:
                return jsonify({'status': 'error', 'message': 'codebook_ids are required for Saudi'}), 400

            all_matches = []
            for codebook_id in codebook_ids:
                codebook_dir = os.path.join(os.getcwd(), 'shared', 'codebooks')
                codebook_path = None
                for fname in os.listdir(codebook_dir):
                    if fname.startswith(codebook_id) and fname.lower().endswith('.pdf'):
                        codebook_path = os.path.join(codebook_dir, fname)
                        break
                if not codebook_path:
                    continue

                codebook_text = extract_pdf_text(codebook_path)
                matches = get_matching_clauses_openai_unified(
                    sections, 'saudi', codebook_text, codebook_id
                )
                all_matches.extend(matches)

            checklist = generate_checklist_openai(all_matches, 'saudi')
            return jsonify({
                'status': 'success',
                'region': region,
                'codebook_ids': codebook_ids,
                'sections': sections,
                'matched_clauses': all_matches,
                'checklist': checklist
            })

        # ---------- DUBAI ----------
        elif region == 'dubai':
            try:
                selected_chapters = json.loads(request.form.get('selected_chapters', '[]'))
            except Exception:
                selected_chapters = []

            try:
                selected_subcategories = json.loads(request.form.get('selected_subcategories', '[]'))
            except Exception:
                selected_subcategories = []

            if not selected_subcategories and not selected_chapters:
                return jsonify({
                    'status': 'error',
                    'message': 'At least one chapter or subcategory is required for Dubai'
                }), 400

            # Prefer subcategories over chapters
            selected_ids = selected_subcategories if selected_subcategories else selected_chapters
            print(f"Selected chapters: {selected_chapters}")
            print(f"Selected subcategories: {selected_subcategories}")
            print(f"Using selected IDs for matching: {selected_ids}")

            # Load subcategory mapping
            sub_map_path = os.path.join(os.getcwd(), 'shared', 'Dubai Book', 'dubai_dbc_subcategories.json')
            with open(sub_map_path, 'r', encoding='utf-8') as f:
                sub_map = json.load(f)

            # Build allowed prefixes & keywords
            allowed_prefixes = []
            allowed_keywords = []
            for part_letter, cat_data in sub_map.items():
                for sub in cat_data.get("subcategories", []):
                    if sub["id"] in selected_ids:
                        # Prefixes
                        allowed_prefixes.extend(sub.get("prefixes", []))

                        # Keywords from JSON or auto-generate
                        if "keywords" in sub and sub["keywords"]:
                            allowed_keywords.extend(sub["keywords"])
                        else:
                            # Auto-generate from name/id
                            name_parts = sub.get("name", "").lower().replace("&", " ").replace("/", " ").split()
                            id_parts = sub.get("id", "").lower().split(".")
                            auto_keywords = list(set(name_parts + id_parts))
                            allowed_keywords.extend(auto_keywords)

            # Remove duplicates and clean
            allowed_prefixes = sorted(set([p.strip() for p in allowed_prefixes if p.strip()]))
            allowed_keywords = sorted(set([k.strip().lower() for k in allowed_keywords if k.strip()]))

            print("Mapped prefixes:", allowed_prefixes)
            print("Derived keywords:", allowed_keywords)

            # Load Dubai sections for allowed prefixes
            dubai_sections = load_dubai_code_sections(allowed_prefixes)
            if not dubai_sections:
                return jsonify({'status': 'error', 'message': 'No matching Dubai sections found'}), 400

            codebook_text = "\n".join(
                f"{sec['section_id']} {sec['section_title']}\n{sec.get('content','')}"
                for sec in dubai_sections
            )


            # Get GPT matches
            matches = get_matching_clauses_openai_unified(
                sections, 'dubai', codebook_text, 'Dubai Building Code'
            )
            print("Matched before filtering:", len(matches))

            # Filter matches using prefixes & keywords
            filtered_matches = filter_utils.filter_matches_by_subcategory(
                matches=matches,
                selected_subcategories=selected_ids,
                sub_map=sub_map,
                sections_file_path=sections_file_path,
                allowed_keywords=allowed_keywords
            )
            print("Matched after filtering:", len(filtered_matches))

            # Generate checklist from filtered matches
            checklist = generate_checklist_openai(filtered_matches, 'dubai')

            # Enrich checklist
            enriched_checklist = []
            for chk in checklist:
                chk_id_clean = str(chk.get("id", "")).replace("Section ", "").strip()
                related_match = next(
                    (m for m in filtered_matches if str(m.get("user_section_id", "")).strip() == chk_id_clean),
                    None
                )
                if related_match:
                    user_section_text = next(
                        (sec.get("text") for sec in sections if sec.get("id") == chk.get("id")), ""
                    )
                    chk["title"] = user_section_text or related_match.get("user_section_title") or f"Section {chk.get('id')}"
                    chk["title_short"] = (
                        (user_section_text[:100].rsplit(" ", 1)[0] + "...") if len(user_section_text) > 100 else user_section_text
                    ) if user_section_text else chk["title"]
                    chk["reference"] = related_match.get("matched_section_id", "")
                    chk["description"] = related_match.get("matched_clause_text", "")
                    chk["category"] = related_match.get("category", "")
                    chk["subcategory"] = related_match.get("subcategory", "")
                else:
                    chk["title"] = str(chk.get("title", "")).replace("Section ", "Requirement ")
                enriched_checklist.append(chk)

            return jsonify({
                'status': 'success',
                'region': region,
                'selected_ids': selected_ids,
                'sections': sections,
                'matched_clauses': filtered_matches,
                'checklist': enriched_checklist
            })

        else:
            return jsonify({'status': 'error', 'message': f'Unsupported region: {region}'}), 400

    except Exception as e:
        print('Exception in /api/match:', str(e))
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': str(e),
            'traceback': traceback.format_exc()
        }), 500
