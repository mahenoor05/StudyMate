import os

from flask import Flask

from .extensions import db, login_manager
from .models import User


def create_app():
    app = Flask(__name__, instance_relative_config=True)

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only-change-this-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(app.instance_path, 'studymate.sqlite')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message = "Please log in to open StudyMate."

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    from .auth.routes import auth_bp
    from .main.routes import main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    @app.cli.command("init-db")
    def init_db_command():
        """Create local development database tables."""
        db.create_all()
        print("Initialized the StudyMate database.")

    return app
