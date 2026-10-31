from flask import Blueprint, current_app, redirect, render_template, send_from_directory, url_for
from flask_login import current_user, login_required
import os


main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("main.app_home"))
    return redirect(url_for("auth.login"))


@main_bp.route("/health")
def health():
    return {"status": "ok"}


@main_bp.route("/app")
@login_required
def app_home():
    return render_template("app.html")


@main_bp.route("/vendor/three/<path:filename>")
def serve_vendor_three(filename):
    vendor_dir = os.path.join(current_app.root_path, "static", "vendor", "three")
    return send_from_directory(vendor_dir, filename)

