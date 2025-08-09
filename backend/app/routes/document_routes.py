from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from ..ocr.ocr_processor import extract_text_from_file  # ✅ relative import
document_bp = Blueprint('document', __name__, url_prefix='/api')



document_bp = Blueprint('document_routes', __name__)
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'shared', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'csv', 'txt', 'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@document_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part in the request'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        print("Processing file:", file_path)
        result = extract_text_from_file(file_path)

        sections = result.get("sections")
        project_name = result.get("project_name")

        if not sections or not isinstance(sections, list) or len(sections) == 0:
            return jsonify({'status': 'error', 'message': 'No sections extracted'}), 500
        



        return jsonify({
    'status': 'success',
    'message': 'Document uploaded and processed successfully',
    'metadata': {
        'project_name': project_name
    },
    'sections': sections
})
        
        

    return jsonify({'status': 'error', 'message': 'Unsupported file format'}), 400
