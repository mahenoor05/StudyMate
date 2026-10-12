import os
import re
import time
from datetime import datetime, timezone

from flask import Blueprint, current_app, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from sqlalchemy import or_

from app.extensions import db
from app.mailer import mail_is_configured, send_email
from app.models import User


auth_bp = Blueprint("auth", __name__)

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_]{3,30}$")

RESET_TOKEN_MAX_AGE_SECONDS = 60 * 60
RESET_REQUEST_COOLDOWN_SECONDS = 60
_last_reset_request = {}


def normalize(value):
    return value.strip()


def is_safe_next_page(next_page):
    return next_page and next_page.startswith("/") and not next_page.startswith("//")


def validate_registration(form):
    display_name = normalize(form.get("display_name", ""))
    username = normalize(form.get("username", ""))
    email = normalize(form.get("email", "")).lower()
    password = form.get("password", "")
    confirm_password = form.get("confirm_password", "")
    errors = []

    if not display_name:
        errors.append("Display name is required.")
    if not USERNAME_PATTERN.match(username):
        errors.append("Username must be 3-30 characters and use only letters, numbers, or underscores.")
    if not EMAIL_PATTERN.match(email):
        errors.append("Please enter a valid email address.")
    if len(password) < 8:
        errors.append("Password must be at least 8 characters.")
    if password != confirm_password:
        errors.append("Passwords do not match.")

    if username and User.query.filter_by(username=username).first():
        errors.append("That username is already taken.")
    if email and User.query.filter_by(email=email).first():
        errors.append("That email is already registered.")

    return errors, {
        "display_name": display_name,
        "username": username,
        "email": email,
        "password": password
    }


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("main.app_home"))

    form_data = {
        "display_name": "",
        "username": "",
        "email": ""
    }

    if request.method == "POST":
        errors, clean_data = validate_registration(request.form)
        form_data.update(clean_data)

        if errors:
            for error in errors:
                flash(error, "error")
        else:
            user = User(
                display_name=clean_data["display_name"],
                username=clean_data["username"],
                email=clean_data["email"],
                timezone="Asia/Kolkata",
            )
            user.set_password(clean_data["password"])
            user.last_login_at = datetime.now(timezone.utc)
            db.session.add(user)
            db.session.commit()
            login_user(user)
            flash("Your account is ready. Welcome to StudyMate.", "success")
            return redirect(url_for("main.app_home"))

    return render_template("register.html", form_data=form_data)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.app_home"))

    login_value = ""

    if request.method == "POST":
        login_value = normalize(request.form.get("login", ""))
        password = request.form.get("password", "")
        user = User.query.filter(
            or_(User.username == login_value, User.email == login_value.lower())
        ).first()

        if user and user.check_password(password):
            user.last_login_at = datetime.now(timezone.utc)
            db.session.commit()
            login_user(user)
            next_page = request.args.get("next")
            if is_safe_next_page(next_page):
                return redirect(next_page)
            return redirect(url_for("main.app_home"))

        flash("Incorrect username/email or password.", "error")

    return render_template("login.html", login_value=login_value)


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("auth.login"))


def _reset_serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="studymate-password-reset")


def make_reset_token(user):
    # The end of the password hash is baked into the token, so the link stops working the moment the password changes.
    return _reset_serializer().dumps({"uid": user.id, "fp": user.password_hash[-16:]})


def read_reset_token(token):
    try:
        data = _reset_serializer().loads(token, max_age=RESET_TOKEN_MAX_AGE_SECONDS)
    except (BadSignature, SignatureExpired):
        return None
    user = db.session.get(User, data.get("uid"))
    if not user or user.password_hash[-16:] != data.get("fp"):
        return None
    return user


def build_reset_link(token):
    base_url = (os.environ.get("APP_BASE_URL") or "").strip().rstrip("/")
    path = url_for("auth.reset_password", token=token)
    return f"{base_url}{path}" if base_url else url_for("auth.reset_password", token=token, _external=True)


@auth_bp.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    if current_user.is_authenticated:
        return redirect(url_for("main.app_home"))

    if request.method == "POST":
        email = normalize(request.form.get("email", "")).lower()
        user = User.query.filter_by(email=email).first() if EMAIL_PATTERN.match(email) else None

        now = time.time()
        recently_sent = now - _last_reset_request.get(email, 0) < RESET_REQUEST_COOLDOWN_SECONDS
        if user and not recently_sent:
            _last_reset_request[email] = now
            link = build_reset_link(make_reset_token(user))
            body = (
                f"Hi {user.display_name},\n\n"
                "Someone asked to reset the password for your StudyMate account. "
                "Open this link to choose a new one (it works for 1 hour):\n\n"
                f"{link}\n\n"
                "If you did not ask for this, you can ignore this email. Your password has not changed."
            )
            if mail_is_configured():
                send_email(user.email, user.display_name, "Reset your StudyMate password", body)
            else:
                from app import is_production_environment

                if is_production_environment():
                    current_app.logger.error("Password reset requested but email is not configured (set BREVO_API_KEY and MAIL_FROM_EMAIL).")
                else:
                    current_app.logger.warning("DEV ONLY - password reset link for %s: %s", user.email, link)

        # Same answer whether or not the email exists, so nobody can use this form to find out who has an account.
        flash("If that email has a StudyMate account, a reset link is on its way. Check your inbox and spam folder.", "success")
        return redirect(url_for("auth.login"))

    return render_template("forgot_password.html")


@auth_bp.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    user = read_reset_token(token)
    if not user:
        flash("That reset link is invalid or has expired. Please request a new one.", "error")
        return redirect(url_for("auth.forgot_password"))

    if request.method == "POST":
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")
        errors = []
        if len(password) < 8:
            errors.append("Password must be at least 8 characters.")
        if password != confirm_password:
            errors.append("Passwords do not match.")
        if errors:
            for error in errors:
                flash(error, "error")
        else:
            user.set_password(password)
            db.session.commit()
            flash("Your password has been changed. You can log in now.", "success")
            return redirect(url_for("auth.login"))

    return render_template("reset_password.html")
