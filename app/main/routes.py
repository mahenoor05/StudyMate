from flask import Blueprint, redirect, render_template, url_for
from flask_login import current_user, login_required


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("main.app_home"))
    return redirect(url_for("auth.login"))


@main_bp.route("/app")
@login_required
def app_home():
    return render_template("app.html")
