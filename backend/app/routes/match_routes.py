import os
import json
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from ..ocr.ocr_processor import extract_text_from_file

match_bp = Blueprint('match_routes', __name__)
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'shared', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'csv', 'txt', 'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@match_bp.route('/match', methods=['POST'])
def match_sections_with_codebooks():
    """
    Handles matching for both Saudi & Dubai:
    - Saudi: needs `codebook_ids[]` (PDFs in shared/codebooks)
    - Dubai: needs `selected_chapters` (chapter IDs from dubai_building_code_sections.json)
    """
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
    if not sections or not isinstance(sections, list) or len(sections) == 0:
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
        if region == 'saudi':
            codebook_ids = request.form.getlist('codebook_ids[]')
            if not codebook_ids:
                return jsonify({'status': 'error', 'message': 'codebook_ids are required for Saudi'}), 400
            all_matches = []
            for codebook_id in codebook_ids:
                # Extract PDF text for each codebook
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
        elif region == 'dubai':
            try:
                selected_chapters = json.loads(request.form.get('selected_chapters', '[]'))
            except Exception:
                selected_chapters = []
            if not selected_chapters:
                return jsonify({'status': 'error', 'message': 'selected_chapters are required for Dubai'}), 400

            dubai_sections = load_dubai_code_sections(selected_chapters)
            codebook_text = "\n".join(
                f"{sec['section_id']} {sec['section_title']}\n{sec.get('content','')}" 
                for sec in dubai_sections
            )

            matches = get_matching_clauses_openai_unified(
                sections, 'dubai', codebook_text, 'Dubai Building Code'
            )

            checklist = generate_checklist_openai(matches, 'dubai')


            # --- ENRICH CHECKLIST TITLES & METADATA ---
            enriched_checklist = []
            for chk in checklist:

                # Normalize section ID for matching
                chk_id_clean = str(chk.get("id", "")).replace("Section ", "").strip()

                related_match = next(
                    (m for m in matches if str(m.get("user_section_id", "")).strip() == chk_id_clean),
                    None
                )

                if related_match:
                    # Get full text from user document
                    user_section_text = next(
                        (sec.get("text") for sec in sections if sec.get("id") == chk.get("id")), ""
                    )

                    chk["title"] = user_section_text or related_match.get("user_section_title") or f"Section {chk.get('id')}"
                    # Short title for table display
                    if user_section_text:
                        chk["title_short"] = (
                            user_section_text[:100].rsplit(" ", 1)[0] + "..."
                            if len(user_section_text) > 100 else user_section_text
                        )
                    else:
                        chk["title_short"] = chk["title"]

                    chk["reference"] = related_match.get("matched_section_id", "")
                    chk["description"] = related_match.get("matched_clause_text", "")
                    chk["category"] = related_match.get("category", "")
                    chk["subcategory"] = related_match.get("subcategory", "")
                else:
                    # If no match, still clean up the title
                    chk["title"] = str(chk.get("title", "")).replace("Section ", "Requirement ")

                enriched_checklist.append(chk)

            return jsonify({
                'status': 'success',
                'region': region,
                'selected_chapters': selected_chapters,
                'sections': sections,
                'matched_clauses': matches,
                'checklist': enriched_checklist
            })
        else:
            return jsonify({'status': 'error', 'message': f'Unsupported region: {region}'}), 400
    except Exception as e:
        print('Exception in /api/match:', str(e))
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e), 'traceback': traceback.format_exc()}), 500
