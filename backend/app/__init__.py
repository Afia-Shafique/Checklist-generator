from flask import Flask
from flask_cors import CORS
from .routes.document_routes import document_bp  # ✅ relative import
from .routes.dubai_categories import categories_bp


def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['UPLOAD_FOLDER'] = 'shared/saudi-specs'

    # Enable CORS for cross-origin requests (e.g., from frontend)
    CORS(app)

    # Register blueprints
    app.register_blueprint(document_bp, url_prefix='/api')
    from .routes.match_routes import match_bp
    app.register_blueprint(match_bp, url_prefix='/api')
    from .routes.dubai_categories import categories_bp
    app.register_blueprint(categories_bp, url_prefix='/api')
    return app
