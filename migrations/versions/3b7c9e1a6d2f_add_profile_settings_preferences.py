"""add profile settings preferences

Revision ID: 3b7c9e1a6d2f
Revises: 9c8f1d2e7a4b
Create Date: 2026-07-08 11:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '3b7c9e1a6d2f'
down_revision = '9c8f1d2e7a4b'
branch_labels = None
depends_on = None


def has_column(table_name, column_name):
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade():
    additions = [
        ("banner_url", sa.Column("banner_url", sa.String(length=255), nullable=True)),
        ("country", sa.Column("country", sa.String(length=80), nullable=True)),
        ("timezone", sa.Column("timezone", sa.String(length=80), nullable=False, server_default="UTC")),
        ("preferred_study_goal", sa.Column("preferred_study_goal", sa.Float(), nullable=True)),
        ("preferred_theme", sa.Column("preferred_theme", sa.String(length=40), nullable=False, server_default="system")),
        ("profile_visibility", sa.Column("profile_visibility", sa.String(length=30), nullable=False, server_default="private")),
        ("group_visibility", sa.Column("group_visibility", sa.String(length=30), nullable=False, server_default="members")),
        ("leaderboard_visibility", sa.Column("leaderboard_visibility", sa.String(length=30), nullable=False, server_default="public")),
        ("selected_exams", sa.Column("selected_exams", sa.JSON(), nullable=False, server_default="[]")),
        ("preferred_subjects", sa.Column("preferred_subjects", sa.JSON(), nullable=False, server_default="[]")),
        ("last_login_at", sa.Column("last_login_at", sa.DateTime(), nullable=True)),
    ]

    for column_name, column in additions:
        if not has_column("user", column_name):
            op.add_column("user", column)

    op.execute('UPDATE "user" SET timezone = \'UTC\' WHERE timezone IS NULL OR timezone = \'\'')
    op.execute('UPDATE "user" SET preferred_theme = \'system\' WHERE preferred_theme IS NULL OR preferred_theme = \'\'')
    op.execute('UPDATE "user" SET profile_visibility = \'private\' WHERE profile_visibility IS NULL OR profile_visibility = \'\'')
    op.execute('UPDATE "user" SET group_visibility = \'members\' WHERE group_visibility IS NULL OR group_visibility = \'\'')
    op.execute('UPDATE "user" SET leaderboard_visibility = \'public\' WHERE leaderboard_visibility IS NULL OR leaderboard_visibility = \'\'')


def downgrade():
    columns = [
        "last_login_at",
        "preferred_subjects",
        "selected_exams",
        "leaderboard_visibility",
        "group_visibility",
        "profile_visibility",
        "preferred_theme",
        "preferred_study_goal",
        "timezone",
        "country",
        "banner_url",
    ]

    with op.batch_alter_table("user", schema=None) as batch_op:
        for column_name in columns:
            if has_column("user", column_name):
                batch_op.drop_column(column_name)
