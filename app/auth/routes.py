import re

from flask import Blueprint, flash, redirect, render_template, request, url_for
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy import or_

from app.extensions import db
from app.models import User


auth_bp = Blueprint("auth", __name__)

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_]{3,30}$")


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
                email=clean_data["email"]
            )
            user.set_password(clean_data["password"])
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
