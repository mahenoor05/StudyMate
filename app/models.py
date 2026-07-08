from datetime import datetime, timezone

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(120), nullable=False)
    avatar_url = db.Column(db.String(255), nullable=True)
    banner_url = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    avatar_style = db.Column(db.String(40), default="initials", nullable=False)
    avatar_color = db.Column(db.String(40), default="violet", nullable=False)
    onboarding_completed = db.Column(db.Boolean, default=False, nullable=False)
    country = db.Column(db.String(80), nullable=True)
    timezone = db.Column(db.String(80), default="Asia/Kolkata", nullable=False)
    study_day_start_time = db.Column(db.String(5), default="00:00", nullable=False)
    # Deprecated compatibility fields. DailyGoal, Exam, and Subject are the normal sources of truth.
    preferred_study_goal = db.Column(db.Float, nullable=True)
    preferred_theme = db.Column(db.String(40), default="system", nullable=False)
    profile_visibility = db.Column(db.String(30), default="private", nullable=False)
    group_visibility = db.Column(db.String(30), default="members", nullable=False)
    leaderboard_visibility = db.Column(db.String(30), default="public", nullable=False)
    selected_exams = db.Column(db.JSON, default=list, nullable=False)
    preferred_subjects = db.Column(db.JSON, default=list, nullable=False)
    last_login_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    color_key = db.Column(db.String(40), default="blue", nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)


class StudySession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    subject_id = db.Column(db.Integer, db.ForeignKey("subject.id"), nullable=True)
    subject_name = db.Column(db.String(120), nullable=False)
    timer_mode = db.Column(db.String(80), nullable=False)
    started_at = db.Column(db.DateTime, nullable=False)
    ended_at = db.Column(db.DateTime, nullable=True)
    study_seconds = db.Column(db.Integer, default=0, nullable=False)
    break_seconds = db.Column(db.Integer, default=0, nullable=False)
    session_goal = db.Column(db.String(255), nullable=True)
    goal_result = db.Column(db.String(30), nullable=True)
    source_type = db.Column(db.String(30), default="tracked", nullable=False)
    was_edited = db.Column(db.Boolean, default=False, nullable=False)
    edited_at = db.Column(db.DateTime, nullable=True)
    original_duration_seconds = db.Column(db.Integer, nullable=True)
    note = db.Column(db.Text, nullable=True)
    payload = db.Column(db.JSON, default=dict, nullable=False)


class ActiveFocusSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, unique=True, index=True)
    subject_id = db.Column(db.Integer, db.ForeignKey("subject.id"), nullable=True)
    subject_client_id = db.Column(db.String(80), nullable=True)
    subject_name = db.Column(db.String(120), nullable=False)
    timer_mode = db.Column(db.String(80), nullable=False)
    mode_id = db.Column(db.String(40), nullable=False)
    phase = db.Column(db.String(30), default="focus", nullable=False)
    session_goal = db.Column(db.String(255), nullable=True)
    started_at = db.Column(db.DateTime, nullable=False)
    paused_at = db.Column(db.DateTime, nullable=True)
    total_paused_seconds = db.Column(db.Integer, default=0, nullable=False)
    state = db.Column(db.String(30), default="running", nullable=False)
    focus_seconds = db.Column(db.Integer, nullable=True)
    break_seconds = db.Column(db.Integer, default=0, nullable=False)
    room_id = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    subject_id = db.Column(db.Integer, db.ForeignKey("subject.id"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    repeat_type = db.Column(db.String(20), default="never", nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)


class DailyGoal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    target_minutes = db.Column(db.Integer, default=120, nullable=False)
    intention = db.Column(db.String(255), nullable=True)
    payload = db.Column(db.JSON, default=dict, nullable=False)


class Distraction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    study_session_id = db.Column(db.Integer, db.ForeignKey("study_session.id"), nullable=True)
    category = db.Column(db.String(80), nullable=False)
    note = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)


class PlannerEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)


class Exam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    exam_type = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    exam_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)
    subjects = db.relationship("ExamSubject", backref="exam", cascade="all, delete-orphan")
    milestones = db.relationship("ExamMilestone", backref="exam", cascade="all, delete-orphan")


class ExamSubject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("exam.id"), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)
    chapters = db.relationship("ExamChapter", backref="exam_subject", cascade="all, delete-orphan")


class ExamChapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    exam_subject_id = db.Column(db.Integer, db.ForeignKey("exam_subject.id"), nullable=False, index=True)
    name = db.Column(db.String(160), nullable=False)
    position = db.Column(db.Integer, default=0, nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)
    topics = db.relationship("ExamTopic", backref="exam_chapter", cascade="all, delete-orphan")


class ExamTopic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    exam_chapter_id = db.Column(db.Integer, db.ForeignKey("exam_chapter.id"), nullable=False, index=True)
    name = db.Column(db.String(160), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)


class ExamMilestone(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(80), nullable=False, index=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("exam.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    payload = db.Column(db.JSON, default=dict, nullable=False)


class UserAppState(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), unique=True, nullable=False, index=True)
    payload = db.Column(db.JSON, default=dict, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class StudyGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    logo_style = db.Column(db.String(40), nullable=True)
    invite_code = db.Column(db.String(40), unique=True, nullable=False, index=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    memberships = db.relationship("GroupMembership", backref="group", cascade="all, delete-orphan")
    messages = db.relationship("GroupMessage", backref="group", cascade="all, delete-orphan")


class GroupMembership(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("study_group.id"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    role = db.Column(db.String(20), default="member", nullable=False)
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    user = db.relationship("User")
    __table_args__ = (db.UniqueConstraint("group_id", "user_id", name="uq_group_membership_user"),)


class GroupMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("study_group.id"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False, index=True)
    message = db.Column(db.String(1000), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    user = db.relationship("User")
