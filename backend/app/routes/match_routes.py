import os
import openai
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
    # Expecting: file, region, codebook_ids[]
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

    # Extract text/sections from the uploaded spec document
    result = extract_text_from_file(file_path)
    sections = result.get('sections')
    if not sections or not isinstance(sections, list) or len(sections) == 0:
        return jsonify({'status': 'error', 'message': 'No sections extracted'}), 500

    # Get user-selected region and codebook IDs
    region = request.form.get('region')
    codebook_ids = request.form.getlist('codebook_ids[]')
    if not region or not codebook_ids:
        return jsonify({'status': 'error', 'message': 'Region and codebook_ids are required'}), 400

    # Call OpenAI matcher service (two-step)
    from ..services.openai_matcher import get_matching_clauses_openai, generate_checklist_openai
    import traceback
    try:
        matched_clauses = get_matching_clauses_openai(sections, codebook_ids, region)
        checklist = generate_checklist_openai(matched_clauses, region)
        return jsonify({
            'status': 'success',
            'message': 'Matching complete',
            'region': region,
            'codebook_ids': codebook_ids,
            'sections': sections,
            'matched_clauses': matched_clauses,
            'checklist': checklist
        })
    except Exception as e:
        print('Exception in /api/match:', str(e))
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': str(e), 'traceback': traceback.format_exc()}), 500
