import os

from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

from .extensions import db, login_manager, migrate
from .models import User


def get_database_uri():
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        if database_url.startswith("postgres://"):
            return database_url.replace("postgres://", "postgresql://", 1)
        return database_url
    return None


def is_production_environment():
    return os.environ.get("FLASK_ENV") == "production" or os.environ.get("RENDER") == "true"


def create_app():
    app = Flask(__name__, instance_relative_config=True)

    production = is_production_environment()
    secret_key = os.environ.get("SECRET_KEY")
    if production and not secret_key:
        raise RuntimeError("SECRET_KEY must be set in production.")

    app.config["SECRET_KEY"] = secret_key or "dev-only-change-this-secret"
    app.config["SQLALCHEMY_DATABASE_URI"] = get_database_uri() or f"sqlite:///{os.path.join(app.instance_path, 'studymate.sqlite')}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_COOKIE_SECURE"] = production
    app.config["PREFERRED_URL_SCHEME"] = "https" if production else "http"
    app.config["SUPABASE_URL"] = os.environ.get("SUPABASE_URL")
    app.config["SUPABASE_SERVICE_ROLE_KEY"] = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    app.config["SUPABASE_STORAGE_BUCKET"] = os.environ.get("SUPABASE_STORAGE_BUCKET")

    os.makedirs(app.instance_path, exist_ok=True)

    if production:
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Please log in to open StudyMate."

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from .auth.routes import auth_bp
    from .api.routes import api_bp
    from .main.routes import main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(main_bp)

    @app.cli.command("init-db")
    def init_db_command():
        """Create local development database tables."""
        db.create_all()
        print("Initialized the StudyMate database.")

    return app
