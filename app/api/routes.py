from datetime import date, datetime, timezone

from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from app.extensions import db
from app.models import (
    DailyGoal,
    Distraction,
    Exam,
    ExamChapter,
    ExamMilestone,
    ExamSubject,
    ExamTopic,
    PlannerEvent,
    StudySession,
    Subject,
    Task,
    UserAppState,
)


api_bp = Blueprint("api", __name__, url_prefix="/api")


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
    history = app_data.get("dailyHistory") if isinstance(app_data.get("dailyHistory"), dict) else {}
    today_key = app_data.get("date")
    if today_key and today_key not in history:
        history[today_key] = {}
    for key, entry in history.items():
        goal_date = parse_date(key)
        if not goal_date:
            continue
        target_hours = float(entry.get("goalHours") or app_data.get("goalHours") or 2)
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
    })


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
