import os
import json
import random
import re
import string
from datetime import date, datetime, timedelta, timezone
from uuid import uuid4
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen

from flask import Blueprint, current_app, jsonify, request, url_for
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import (
    DailyGoal,
    Distraction,
    Exam,
    ExamChapter,
    ExamMilestone,
    ExamSubject,
    ExamTopic,
    GroupMembership,
    GroupMessage,
    PlannerEvent,
    StudySession,
    StudyGroup,
    Subject,
    Task,
    User,
    UserAppState,
)


api_bp = Blueprint("api", __name__, url_prefix="/api")

ALLOWED_AVATAR_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
MAX_AVATAR_BYTES = 2 * 1024 * 1024
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_]{3,30}$")
PROFILE_VISIBILITY_OPTIONS = {"public", "friends", "private"}
GROUP_VISIBILITY_OPTIONS = {"public", "members", "private"}
LEADERBOARD_VISIBILITY_OPTIONS = {"public", "groups", "private"}


def parse_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def parse_datetime(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def iso_datetime(value):
    return value.isoformat() if value else None


def clean_payload(value):
    return value if isinstance(value, dict) else {}


def get_avatar_upload_folder():
    folder = os.path.join(current_app.static_folder, "uploads", "avatars")
    os.makedirs(folder, exist_ok=True)
    return folder


def get_supabase_storage_config():
    supabase_url = current_app.config.get("SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    service_key = current_app.config.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    bucket = current_app.config.get("SUPABASE_STORAGE_BUCKET") or os.environ.get("SUPABASE_STORAGE_BUCKET")
    if not supabase_url or not service_key or not bucket:
        return None
    return {
        "url": supabase_url.rstrip("/"),
        "service_key": service_key,
        "bucket": bucket,
    }


def is_allowed_avatar(filename, mimetype):
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return extension in ALLOWED_AVATAR_EXTENSIONS and str(mimetype or "").startswith("image/")


def get_supabase_object_path(avatar_url):
    config = get_supabase_storage_config()
    if not config or not avatar_url:
        return None
    parsed_path = urlparse(avatar_url).path
    marker = f"/storage/v1/object/public/{config['bucket']}/"
    if marker not in parsed_path:
        return None
    return parsed_path.split(marker, 1)[1]


def delete_current_avatar_file():
    delete_user_upload(current_user.avatar_url)


def delete_current_banner_file():
    delete_user_upload(current_user.banner_url)


def delete_user_upload(file_url):
    if not file_url:
        return
    supabase_path = get_supabase_object_path(file_url)
    if supabase_path:
        delete_avatar_from_supabase(supabase_path)
        return
    if "/static/uploads/avatars/" not in file_url:
        return
    filename = secure_filename(file_url.rsplit("/", 1)[-1])
    if not filename:
        return
    upload_folder = get_avatar_upload_folder()
    file_path = os.path.abspath(os.path.join(upload_folder, filename))
    if file_path.startswith(os.path.abspath(upload_folder)) and os.path.exists(file_path):
        os.remove(file_path)


def supabase_headers(content_type=None):
    config = get_supabase_storage_config()
    headers = {
        "Authorization": f"Bearer {config['service_key']}",
        "apikey": config["service_key"],
    }
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def upload_avatar_to_supabase(file_bytes, extension, mimetype):
    config = get_supabase_storage_config()
    object_path = f"profile-photos/{current_user.id}/{uuid4().hex}.{extension}"
    quoted_path = quote(object_path, safe="/")
    upload_url = f"{config['url']}/storage/v1/object/{config['bucket']}/{quoted_path}"
    request = Request(
        upload_url,
        data=file_bytes,
        headers=supabase_headers(mimetype),
        method="POST",
    )
    try:
        with urlopen(request, timeout=15):
            pass
    except (HTTPError, URLError) as error:
        current_app.logger.warning("Supabase avatar upload failed: %s", error)
        raise ValueError("Profile photo upload failed.") from error
    return f"{config['url']}/storage/v1/object/public/{config['bucket']}/{quoted_path}"


def delete_avatar_from_supabase(object_path):
    config = get_supabase_storage_config()
    delete_url = f"{config['url']}/storage/v1/object/{config['bucket']}"
    payload = json.dumps({"prefixes": [object_path]}).encode("utf-8")
    request = Request(
        delete_url,
        data=payload,
        headers=supabase_headers("application/json"),
        method="DELETE",
    )
    try:
        with urlopen(request, timeout=15):
            pass
    except (HTTPError, URLError) as error:
        current_app.logger.warning("Supabase avatar delete failed: %s", error)


def save_avatar_locally(upload, unique_filename):
    upload_folder = get_avatar_upload_folder()
    file_path = os.path.abspath(os.path.join(upload_folder, unique_filename))
    if not file_path.startswith(os.path.abspath(upload_folder)):
        raise ValueError("Invalid upload path.")
    upload.save(file_path)
    return url_for("static", filename=f"uploads/avatars/{unique_filename}")


def serialize_profile(user):
    return {
        "displayName": user.display_name,
        "username": user.username,
        "email": user.email,
        "bio": user.bio or "",
        "avatarUrl": user.avatar_url,
        "bannerUrl": user.banner_url,
        "avatarStyle": user.avatar_style or "initials",
        "avatarColor": user.avatar_color or "violet",
        "onboardingCompleted": bool(user.onboarding_completed),
        "country": user.country or "",
        "timezone": user.timezone or "UTC",
        "preferredStudyGoal": user.preferred_study_goal,
        "preferredTheme": user.preferred_theme or "system",
        "profileVisibility": user.profile_visibility or "private",
        "groupVisibility": user.group_visibility or "members",
        "leaderboardVisibility": user.leaderboard_visibility or "public",
        "selectedExams": user.selected_exams or [],
        "preferredSubjects": user.preferred_subjects or [],
        "createdAt": iso_datetime(user.created_at),
        "lastLoginAt": iso_datetime(user.last_login_at),
    }


def scoped_or_404(model, record_id):
    return model.query.filter_by(id=record_id, user_id=current_user.id).first_or_404()


def nested_exam_or_404(record, path):
    exam = None
    if path == "subject":
        exam = record.exam
    elif path == "chapter":
        exam = record.exam_subject.exam
    elif path == "topic":
        exam = record.exam_chapter.exam_subject.exam
    elif path == "milestone":
        exam = record.exam
    if not exam or exam.user_id != current_user.id:
        return None
    return record


def get_membership_or_404(group_id):
    return GroupMembership.query.filter_by(group_id=group_id, user_id=current_user.id).first_or_404()


def get_owner_membership_or_404(group_id):
    membership = get_membership_or_404(group_id)
    if membership.role != "owner":
        return None
    return membership


def get_range_start(range_name):
    today = datetime.now(timezone.utc).date()
    if range_name == "month":
        return date(today.year, today.month, 1)
    if range_name == "week":
        return today - timedelta(days=today.weekday())
    return today


def get_session_totals_by_user(user_ids, range_name):
    start_date = get_range_start(range_name)
    query = StudySession.query.filter(StudySession.user_id.in_(user_ids))
    totals = {user_id: 0 for user_id in user_ids}
    for session in query.all():
        session_date = session.started_at.date()
        if session_date >= start_date:
            totals[session.user_id] = totals.get(session.user_id, 0) + int(session.study_seconds or 0)
    return totals


def generate_group_invite_code():
    alphabet = string.ascii_uppercase + string.digits
    while True:
        code = "SM-" + "".join(random.choice(alphabet) for _ in range(6))
        if not StudyGroup.query.filter_by(invite_code=code).first():
            return code


def serialize_group_member(membership, totals=None):
    totals = totals or {}
    user = membership.user
    return {
        "id": membership.user_id,
        "name": user.display_name,
        "username": user.username,
        "avatarUrl": user.avatar_url,
        "avatarStyle": user.avatar_style,
        "avatarColor": user.avatar_color,
        "role": membership.role,
        "joinedAt": iso_datetime(membership.joined_at),
        "totalSeconds": totals.get(membership.user_id, 0),
    }


def serialize_group(group, include_messages=False):
    memberships = sorted(group.memberships, key=lambda item: item.joined_at)
    totals = get_session_totals_by_user([item.user_id for item in memberships], "today")
    data = {
        "id": group.id,
        "name": group.name,
        "description": group.description or "",
        "icon": group.logo_style or "",
        "inviteCode": group.invite_code,
        "ownerId": group.owner_id,
        "role": next((item.role for item in memberships if item.user_id == current_user.id), "member"),
        "createdAt": iso_datetime(group.created_at),
        "members": [serialize_group_member(item, totals) for item in memberships],
        "rooms": [],
        "challenges": [],
        "activity": [],
    }
    if include_messages:
        data["messages"] = [serialize_group_message(message) for message in group.messages[-50:]]
    return data


def serialize_group_message(message):
    return {
        "id": message.id,
        "groupId": message.group_id,
        "userId": message.user_id,
        "message": message.message,
        "createdAt": iso_datetime(message.created_at),
        "user": serialize_profile(message.user),
    }


def has_personal_data(user_id):
    checks = [
        Subject.query.filter_by(user_id=user_id).first(),
        StudySession.query.filter_by(user_id=user_id).first(),
        Task.query.filter_by(user_id=user_id).first(),
        DailyGoal.query.filter_by(user_id=user_id).first(),
        PlannerEvent.query.filter_by(user_id=user_id).first(),
        Exam.query.filter_by(user_id=user_id).first(),
        Distraction.query.filter_by(user_id=user_id).first(),
    ]
    return any(checks)


def replace_user_rows(model, user_id):
    model.query.filter_by(user_id=user_id).delete(synchronize_session=False)


def clear_personal_data(user_id):
    exam_ids = [exam.id for exam in Exam.query.filter_by(user_id=user_id).all()]
    if exam_ids:
        subject_ids = [subject.id for subject in ExamSubject.query.filter(ExamSubject.exam_id.in_(exam_ids)).all()]
        chapter_ids = []
        if subject_ids:
            chapter_ids = [
                chapter.id
                for chapter in ExamChapter.query.filter(ExamChapter.exam_subject_id.in_(subject_ids)).all()
            ]
        if chapter_ids:
            ExamTopic.query.filter(ExamTopic.exam_chapter_id.in_(chapter_ids)).delete(synchronize_session=False)
            ExamChapter.query.filter(ExamChapter.id.in_(chapter_ids)).delete(synchronize_session=False)
        if subject_ids:
            ExamSubject.query.filter(ExamSubject.id.in_(subject_ids)).delete(synchronize_session=False)
        ExamMilestone.query.filter(ExamMilestone.exam_id.in_(exam_ids)).delete(synchronize_session=False)
    replace_user_rows(Distraction, user_id)
    replace_user_rows(StudySession, user_id)
    replace_user_rows(Task, user_id)
    replace_user_rows(PlannerEvent, user_id)
    replace_user_rows(DailyGoal, user_id)
    replace_user_rows(Exam, user_id)
    replace_user_rows(Subject, user_id)


def save_app_payload(user_id, payload):
    state = UserAppState.query.filter_by(user_id=user_id).first()
    if not state:
        state = UserAppState(user_id=user_id)
        db.session.add(state)
    state.payload = payload


def save_subjects(user_id, subjects):
    replace_user_rows(Subject, user_id)
    subject_map = {}
    for item in subjects:
        payload = clean_payload(item)
        subject = Subject(
            client_id=str(payload.get("id") or ""),
            user_id=user_id,
            name=payload.get("name") or "Subject",
            color_key=payload.get("colorKey") or "blue",
            payload=payload,
        )
        db.session.add(subject)
        db.session.flush()
        subject_map[subject.client_id] = subject.id
    return subject_map


def save_sessions(user_id, sessions, subject_map):
    replace_user_rows(StudySession, user_id)
    session_map = {}
    for item in sessions:
        payload = clean_payload(item)
        started_at = parse_datetime(payload.get("startedAt")) or datetime.now(timezone.utc)
        ended_at = parse_datetime(payload.get("endedAt"))
        session = StudySession(
            client_id=str(payload.get("id") or ""),
            user_id=user_id,
            subject_id=subject_map.get(str(payload.get("subjectId") or "")),
            subject_name=payload.get("subjectName") or "General Study",
            timer_mode=payload.get("mode") or payload.get("timerMode") or "Timer",
            started_at=started_at,
            ended_at=ended_at,
            study_seconds=int(payload.get("durationSeconds") or payload.get("studySeconds") or 0),
            break_seconds=int(payload.get("breakSeconds") or 0),
            session_goal=payload.get("goal") or None,
            goal_result=payload.get("goalResult") or None,
            note=payload.get("reviewNote") or payload.get("note") or None,
            payload=payload,
        )
        db.session.add(session)
        db.session.flush()
        session_map[session.client_id] = session.id
    return session_map


def save_tasks(user_id, tasks, subject_map):
    replace_user_rows(Task, user_id)
    for item in tasks:
        payload = clean_payload(item)
        completed_at = parse_datetime(payload.get("completedAt"))
        if not completed_at and payload.get("completed"):
            completed_at = datetime.now(timezone.utc)
        db.session.add(Task(
            client_id=str(payload.get("id") or ""),
            user_id=user_id,
            subject_id=subject_map.get(str(payload.get("subjectId") or "")),
            title=payload.get("text") or payload.get("title") or "Untitled task",
            due_date=parse_date(payload.get("date")),
            completed=bool(payload.get("completed")),
            completed_at=completed_at,
            repeat_type=payload.get("repeat") or "never",
            payload=payload,
        ))


def save_daily_goals(user_id, app_data):
    replace_user_rows(DailyGoal, user_id)
    if app_data.get("goalHours") in (None, ""):
        return
    history = app_data.get("dailyHistory") if isinstance(app_data.get("dailyHistory"), dict) else {}
    today_key = app_data.get("date")
    if today_key and today_key not in history:
        history[today_key] = {}
    for key, entry in history.items():
        goal_date = parse_date(key)
        if not goal_date:
            continue
        target_hours = float(entry.get("goalHours") or app_data.get("goalHours"))
        db.session.add(DailyGoal(
            user_id=user_id,
            date=goal_date,
            target_minutes=round(target_hours * 60),
            intention=app_data.get("focusIntention") if key == today_key else None,
            payload=clean_payload(entry),
        ))


def save_distractions(user_id, distractions, session_map):
    replace_user_rows(Distraction, user_id)
    for item in distractions:
        payload = clean_payload(item)
        db.session.add(Distraction(
            client_id=str(payload.get("id") or ""),
            user_id=user_id,
            study_session_id=session_map.get(str(payload.get("sessionId") or "")),
            category=payload.get("category") or "Other",
            note=payload.get("reason") or payload.get("note") or None,
            created_at=parse_datetime(payload.get("timestamp")) or datetime.now(timezone.utc),
            payload=payload,
        ))


def save_planner_events(user_id, planner_items):
    replace_user_rows(PlannerEvent, user_id)
    for item in planner_items:
        payload = clean_payload(item)
        event_date = parse_date(payload.get("date"))
        if not event_date:
            continue
        db.session.add(PlannerEvent(
            client_id=str(payload.get("id") or ""),
            user_id=user_id,
            date=event_date,
            type=payload.get("type") or "task",
            title=payload.get("title") or "Untitled plan",
            payload=payload,
        ))


def save_exams(user_id, exams):
    replace_user_rows(Exam, user_id)
    for item in exams:
        payload = clean_payload(item)
        exam_date = parse_date(payload.get("date"))
        if not exam_date:
            continue
        exam = Exam(
            client_id=str(payload.get("id") or ""),
            user_id=user_id,
            exam_type=payload.get("type") or "Custom Exam",
            name=payload.get("name") or "Untitled Exam",
            exam_date=exam_date,
            created_at=parse_datetime(payload.get("createdAt")) or datetime.now(timezone.utc),
            payload=payload,
        )
        db.session.add(exam)
        db.session.flush()
        for subject_index, subject_payload in enumerate(payload.get("subjects") or []):
            subject = ExamSubject(
                client_id=str(subject_payload.get("id") or f"{exam.client_id}-subject-{subject_index}"),
                exam_id=exam.id,
                name=subject_payload.get("name") or "Subject",
                payload=subject_payload,
            )
            db.session.add(subject)
            db.session.flush()
            for chapter_index, chapter_payload in enumerate(subject_payload.get("chapters") or []):
                chapter = ExamChapter(
                    client_id=str(chapter_payload.get("id") or f"{subject.client_id}-chapter-{chapter_index}"),
                    exam_subject_id=subject.id,
                    name=chapter_payload.get("name") or "Chapter",
                    position=chapter_index,
                    payload=chapter_payload,
                )
                db.session.add(chapter)
                db.session.flush()
                for topic_index, topic_payload in enumerate(chapter_payload.get("topics") or []):
                    db.session.add(ExamTopic(
                        client_id=str(topic_payload.get("id") or f"{chapter.client_id}-topic-{topic_index}"),
                        exam_chapter_id=chapter.id,
                        name=topic_payload.get("name") or "Topic",
                        completed=bool(topic_payload.get("completed")),
                        payload=topic_payload,
                    ))
        for milestone_payload in payload.get("milestones") or []:
            db.session.add(ExamMilestone(
                client_id=str(milestone_payload.get("id") or ""),
                exam_id=exam.id,
                title=milestone_payload.get("title") or "Milestone",
                due_date=parse_date(milestone_payload.get("dueDate")),
                completed=bool(milestone_payload.get("completed")),
                payload=milestone_payload,
            ))


def persist_app_data(user_id, app_data):
    clear_personal_data(user_id)
    subject_map = save_subjects(user_id, app_data.get("subjects") or [])
    session_map = save_sessions(user_id, app_data.get("sessions") or [], subject_map)
    save_tasks(user_id, app_data.get("tasks") or [], subject_map)
    save_daily_goals(user_id, app_data)
    save_distractions(user_id, app_data.get("distractions") or [], session_map)
    save_planner_events(user_id, app_data.get("plannerItems") or [])
    save_exams(user_id, app_data.get("exams") or [])
    save_app_payload(user_id, app_data)
    db.session.commit()


@api_bp.get("/app-data")
@login_required
def get_app_data():
    state = UserAppState.query.filter_by(user_id=current_user.id).first()
    has_data = has_personal_data(current_user.id)
    return jsonify({
        "appData": state.payload if state else None,
        "hasData": has_data,
        "profile": serialize_profile(current_user),
    })


@api_bp.get("/profile")
@login_required
def get_profile():
    return jsonify({"profile": serialize_profile(current_user)})


@api_bp.patch("/profile")
@login_required
def update_profile():
    data = request.get_json(silent=True) or {}
    display_name = str(data.get("displayName") or current_user.display_name).strip()
    if not display_name:
        return jsonify({"error": "Display name is required."}), 400
    username = str(data.get("username") or current_user.username).strip()
    if not USERNAME_PATTERN.match(username):
        return jsonify({"error": "Username must be 3-30 characters and use only letters, numbers, or underscores."}), 400
    existing_user = User.query.filter(User.username == username, User.id != current_user.id).first()
    if existing_user:
        return jsonify({"error": "That username is already taken."}), 409

    current_user.display_name = display_name[:120]
    current_user.username = username
    current_user.bio = str(data.get("bio") or "").strip()[:280]
    current_user.avatar_style = str(data.get("avatarStyle") or "initials")[:40]
    current_user.avatar_color = str(data.get("avatarColor") or "violet")[:40]
    current_user.country = str(data.get("country") or "").strip()[:80]
    current_user.timezone = str(data.get("timezone") or "UTC").strip()[:80] or "UTC"
    current_user.preferred_theme = str(data.get("preferredTheme") or "system").strip()[:40] or "system"

    preferred_goal = data.get("preferredStudyGoal")
    try:
        current_user.preferred_study_goal = float(preferred_goal) if preferred_goal not in (None, "") else None
    except (TypeError, ValueError):
        return jsonify({"error": "Preferred study goal must be a number."}), 400

    profile_visibility = str(data.get("profileVisibility") or "private")
    group_visibility = str(data.get("groupVisibility") or "members")
    leaderboard_visibility = str(data.get("leaderboardVisibility") or "public")
    if profile_visibility not in PROFILE_VISIBILITY_OPTIONS:
        return jsonify({"error": "Invalid profile visibility."}), 400
    if group_visibility not in GROUP_VISIBILITY_OPTIONS:
        return jsonify({"error": "Invalid group visibility."}), 400
    if leaderboard_visibility not in LEADERBOARD_VISIBILITY_OPTIONS:
        return jsonify({"error": "Invalid leaderboard visibility."}), 400
    current_user.profile_visibility = profile_visibility
    current_user.group_visibility = group_visibility
    current_user.leaderboard_visibility = leaderboard_visibility

    if "selectedExams" in data:
        current_user.selected_exams = [str(item).strip()[:80] for item in data.get("selectedExams") or [] if str(item).strip()]
    if "preferredSubjects" in data:
        current_user.preferred_subjects = [str(item).strip()[:80] for item in data.get("preferredSubjects") or [] if str(item).strip()]
    if "onboardingCompleted" in data:
        current_user.onboarding_completed = bool(data.get("onboardingCompleted"))
    db.session.commit()
    return jsonify({"profile": serialize_profile(current_user)})


@api_bp.post("/profile/avatar")
@login_required
def upload_profile_avatar():
    if request.content_length and request.content_length > MAX_AVATAR_BYTES:
        return jsonify({"error": "Profile photo must be 2 MB or smaller."}), 400

    upload = request.files.get("avatar")
    if not upload or not upload.filename:
        return jsonify({"error": "Choose an image to upload."}), 400

    filename = secure_filename(upload.filename)
    if not is_allowed_avatar(filename, upload.mimetype):
        return jsonify({"error": "Use a JPG, PNG, GIF, or WebP image."}), 400
    upload.stream.seek(0, os.SEEK_END)
    file_size = upload.stream.tell()
    upload.stream.seek(0)
    if file_size > MAX_AVATAR_BYTES:
        return jsonify({"error": "Profile photo must be 2 MB or smaller."}), 400

    extension = filename.rsplit(".", 1)[-1].lower()
    unique_filename = f"user-{current_user.id}-{uuid4().hex}.{extension}"
    try:
        if get_supabase_storage_config():
            avatar_url = upload_avatar_to_supabase(upload.read(), extension, upload.mimetype)
        else:
            avatar_url = save_avatar_locally(upload, unique_filename)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    delete_current_avatar_file()
    current_user.avatar_url = avatar_url
    db.session.commit()
    return jsonify({"profile": serialize_profile(current_user)})


@api_bp.delete("/profile/avatar")
@login_required
def remove_profile_avatar():
    delete_current_avatar_file()
    current_user.avatar_url = None
    db.session.commit()
    return jsonify({"profile": serialize_profile(current_user)})


@api_bp.post("/profile/banner")
@login_required
def upload_profile_banner():
    if request.content_length and request.content_length > MAX_AVATAR_BYTES:
        return jsonify({"error": "Banner image must be 2 MB or smaller."}), 400

    upload = request.files.get("banner")
    if not upload or not upload.filename:
        return jsonify({"error": "Choose an image to upload."}), 400

    filename = secure_filename(upload.filename)
    if not is_allowed_avatar(filename, upload.mimetype):
        return jsonify({"error": "Use a JPG, PNG, GIF, or WebP image."}), 400
    upload.stream.seek(0, os.SEEK_END)
    file_size = upload.stream.tell()
    upload.stream.seek(0)
    if file_size > MAX_AVATAR_BYTES:
        return jsonify({"error": "Banner image must be 2 MB or smaller."}), 400

    extension = filename.rsplit(".", 1)[-1].lower()
    unique_filename = f"banner-user-{current_user.id}-{uuid4().hex}.{extension}"
    try:
        if get_supabase_storage_config():
            banner_url = upload_avatar_to_supabase(upload.read(), extension, upload.mimetype)
        else:
            banner_url = save_avatar_locally(upload, unique_filename)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    delete_current_banner_file()
    current_user.banner_url = banner_url
    db.session.commit()
    return jsonify({"profile": serialize_profile(current_user)})


@api_bp.delete("/profile/banner")
@login_required
def remove_profile_banner():
    delete_current_banner_file()
    current_user.banner_url = None
    db.session.commit()
    return jsonify({"profile": serialize_profile(current_user)})


@api_bp.put("/app-data")
@login_required
def update_app_data():
    app_data = request.get_json(silent=True) or {}
    if not isinstance(app_data, dict):
        return jsonify({"error": "Invalid app data."}), 400
    persist_app_data(current_user.id, app_data)
    return jsonify({"ok": True})


@api_bp.post("/import-local")
@login_required
def import_local_data():
    if has_personal_data(current_user.id):
        return jsonify({"error": "This account already has database data."}), 409
    app_data = request.get_json(silent=True) or {}
    if not isinstance(app_data, dict):
        return jsonify({"error": "Invalid import data."}), 400
    persist_app_data(current_user.id, app_data)
    return jsonify({"ok": True})


@api_bp.get("/groups")
@login_required
def list_groups():
    memberships = GroupMembership.query.filter_by(user_id=current_user.id).all()
    return jsonify({"groups": [serialize_group(membership.group) for membership in memberships]})


@api_bp.post("/groups")
@login_required
def create_group():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Group name is required."}), 400
    group = StudyGroup(
        name=name[:120],
        description=str(data.get("description") or "").strip()[:255],
        logo_style=str(data.get("icon") or "")[:40],
        invite_code=generate_group_invite_code(),
        owner_id=current_user.id,
    )
    db.session.add(group)
    db.session.flush()
    db.session.add(GroupMembership(group_id=group.id, user_id=current_user.id, role="owner"))
    db.session.commit()
    return jsonify({"group": serialize_group(group, include_messages=True)}), 201


@api_bp.post("/groups/join")
@login_required
def join_group():
    data = request.get_json(silent=True) or {}
    invite_code = str(data.get("inviteCode") or "").strip().upper()
    group = StudyGroup.query.filter_by(invite_code=invite_code).first()
    if not group:
        return jsonify({"error": "No group found for that invite code."}), 404
    membership = GroupMembership.query.filter_by(group_id=group.id, user_id=current_user.id).first()
    if not membership:
        db.session.add(GroupMembership(group_id=group.id, user_id=current_user.id, role="member"))
        db.session.commit()
    return jsonify({"group": serialize_group(group, include_messages=True)})


@api_bp.get("/groups/<int:group_id>")
@login_required
def get_group(group_id):
    membership = get_membership_or_404(group_id)
    return jsonify({"group": serialize_group(membership.group, include_messages=True)})


@api_bp.patch("/groups/<int:group_id>")
@login_required
def update_group(group_id):
    membership = get_owner_membership_or_404(group_id)
    if not membership:
        return jsonify({"error": "Only the group owner can edit this group."}), 403
    data = request.get_json(silent=True) or {}
    group = membership.group
    if "name" in data:
        name = str(data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Group name is required."}), 400
        group.name = name[:120]
    if "description" in data:
        group.description = str(data.get("description") or "").strip()[:255]
    if "icon" in data:
        group.logo_style = str(data.get("icon") or "").strip()[:40]
    db.session.commit()
    return jsonify({"group": serialize_group(group, include_messages=True)})


@api_bp.delete("/groups/<int:group_id>")
@login_required
def delete_group(group_id):
    membership = get_owner_membership_or_404(group_id)
    if not membership:
        return jsonify({"error": "Only the group owner can delete this group."}), 403
    db.session.delete(membership.group)
    db.session.commit()
    return jsonify({"ok": True})


@api_bp.get("/groups/<int:group_id>/messages")
@login_required
def list_group_messages(group_id):
    membership = get_membership_or_404(group_id)
    messages = GroupMessage.query.filter_by(group_id=membership.group_id).order_by(GroupMessage.created_at.asc()).limit(100).all()
    return jsonify({"messages": [serialize_group_message(message) for message in messages]})


@api_bp.post("/groups/<int:group_id>/messages")
@login_required
def create_group_message(group_id):
    get_membership_or_404(group_id)
    data = request.get_json(silent=True) or {}
    message_text = str(data.get("message") or "").strip()
    if not message_text:
        return jsonify({"error": "Message is required."}), 400
    message = GroupMessage(group_id=group_id, user_id=current_user.id, message=message_text[:1000])
    db.session.add(message)
    db.session.commit()
    return jsonify({"message": serialize_group_message(message)}), 201


@api_bp.get("/leaderboard")
@login_required
def get_leaderboard():
    range_name = request.args.get("range", "today")
    group_id = request.args.get("groupId", type=int)
    if group_id:
        membership = get_membership_or_404(group_id)
        memberships = membership.group.memberships
        users = [item.user for item in memberships]
    else:
        user_ids = [row[0] for row in db.session.query(StudySession.user_id).distinct().all()]
        users = User.query.filter(User.id.in_(user_ids)).all() if user_ids else []
    totals = get_session_totals_by_user([user.id for user in users], range_name)
    rows = [
        {
            "userId": user.id,
            "name": user.display_name,
            "username": user.username,
            "avatarUrl": user.avatar_url,
            "avatarStyle": user.avatar_style,
            "avatarColor": user.avatar_color,
            "totalSeconds": totals.get(user.id, 0),
        }
        for user in users
        if totals.get(user.id, 0) > 0
    ]
    rows.sort(key=lambda item: item["totalSeconds"], reverse=True)
    return jsonify({"rows": rows})


@api_bp.get("/subjects/<int:record_id>")
@login_required
def get_subject(record_id):
    subject = scoped_or_404(Subject, record_id)
    return jsonify({"subject": subject.payload})


@api_bp.patch("/subjects/<int:record_id>")
@login_required
def update_subject(record_id):
    subject = scoped_or_404(Subject, record_id)
    data = request.get_json(silent=True) or {}
    subject.payload = {**subject.payload, **clean_payload(data)}
    subject.name = subject.payload.get("name") or subject.name
    subject.color_key = subject.payload.get("colorKey") or subject.color_key
    db.session.commit()
    return jsonify({"subject": subject.payload})


@api_bp.delete("/subjects/<int:record_id>")
@login_required
def delete_subject(record_id):
    subject = scoped_or_404(Subject, record_id)
    db.session.delete(subject)
    db.session.commit()
    return jsonify({"ok": True})


@api_bp.get("/tasks/<int:record_id>")
@login_required
def get_task(record_id):
    task = scoped_or_404(Task, record_id)
    return jsonify({"task": task.payload})


@api_bp.patch("/tasks/<int:record_id>")
@login_required
def update_task(record_id):
    task = scoped_or_404(Task, record_id)
    data = request.get_json(silent=True) or {}
    task.payload = {**task.payload, **clean_payload(data)}
    task.title = task.payload.get("text") or task.payload.get("title") or task.title
    task.completed = bool(task.payload.get("completed"))
    db.session.commit()
    return jsonify({"task": task.payload})


@api_bp.delete("/tasks/<int:record_id>")
@login_required
def delete_task(record_id):
    task = scoped_or_404(Task, record_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"ok": True})


@api_bp.get("/sessions/<int:record_id>")
@login_required
def get_session(record_id):
    session = scoped_or_404(StudySession, record_id)
    return jsonify({"session": session.payload})


@api_bp.patch("/sessions/<int:record_id>")
@login_required
def update_session(record_id):
    session = scoped_or_404(StudySession, record_id)
    data = request.get_json(silent=True) or {}
    session.payload = {**session.payload, **clean_payload(data)}
    session.subject_name = session.payload.get("subjectName") or session.subject_name
    session.timer_mode = session.payload.get("mode") or session.timer_mode
    db.session.commit()
    return jsonify({"session": session.payload})


@api_bp.delete("/sessions/<int:record_id>")
@login_required
def delete_session(record_id):
    session = scoped_or_404(StudySession, record_id)
    db.session.delete(session)
    db.session.commit()
    return jsonify({"ok": True})


@api_bp.get("/exams/<int:record_id>")
@login_required
def get_exam(record_id):
    exam = scoped_or_404(Exam, record_id)
    return jsonify({"exam": exam.payload})


@api_bp.patch("/exams/<int:record_id>")
@login_required
def update_exam(record_id):
    exam = scoped_or_404(Exam, record_id)
    data = request.get_json(silent=True) or {}
    exam.payload = {**exam.payload, **clean_payload(data)}
    exam.name = exam.payload.get("name") or exam.name
    exam.exam_type = exam.payload.get("type") or exam.exam_type
    db.session.commit()
    return jsonify({"exam": exam.payload})


@api_bp.delete("/exams/<int:record_id>")
@login_required
def delete_exam(record_id):
    exam = scoped_or_404(Exam, record_id)
    db.session.delete(exam)
    db.session.commit()
    return jsonify({"ok": True})
