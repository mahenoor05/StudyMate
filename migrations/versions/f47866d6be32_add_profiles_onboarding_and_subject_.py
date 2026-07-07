"""add profiles onboarding and subject colors

Revision ID: f47866d6be32
Revises: 0477a61442fe
Create Date: 2026-07-07 17:11:46.921839

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f47866d6be32'
down_revision = '0477a61442fe'
branch_labels = None
depends_on = None


def has_column(table_name, column_name):
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade():
    if not has_column("subject", "color_key"):
        op.add_column(
            "subject",
            sa.Column("color_key", sa.String(length=40), nullable=False, server_default="blue"),
        )
    op.execute("UPDATE subject SET color_key = 'blue' WHERE color_key IS NULL OR color_key = ''")

    if not has_column("user", "avatar_style"):
        op.add_column(
            "user",
            sa.Column("avatar_style", sa.String(length=40), nullable=False, server_default="initials"),
        )
    if not has_column("user", "avatar_color"):
        op.add_column(
            "user",
            sa.Column("avatar_color", sa.String(length=40), nullable=False, server_default="violet"),
        )
    if not has_column("user", "onboarding_completed"):
        op.add_column(
            "user",
            sa.Column("onboarding_completed", sa.Boolean(), nullable=False, server_default=sa.false()),
        )

    op.execute('UPDATE "user" SET avatar_style = \'initials\' WHERE avatar_style IS NULL OR avatar_style = \'\'')
    op.execute('UPDATE "user" SET avatar_color = \'violet\' WHERE avatar_color IS NULL OR avatar_color = \'\'')
    op.execute('UPDATE "user" SET onboarding_completed = false WHERE onboarding_completed IS NULL')


def downgrade():
    user_has_onboarding_completed = has_column("user", "onboarding_completed")
    user_has_avatar_color = has_column("user", "avatar_color")
    user_has_avatar_style = has_column("user", "avatar_style")
    subject_has_color_key = has_column("subject", "color_key")

    with op.batch_alter_table('user', schema=None) as batch_op:
        if user_has_onboarding_completed:
            batch_op.drop_column('onboarding_completed')
        if user_has_avatar_color:
            batch_op.drop_column('avatar_color')
        if user_has_avatar_style:
            batch_op.drop_column('avatar_style')

    with op.batch_alter_table('subject', schema=None) as batch_op:
        if subject_has_color_key:
            batch_op.drop_column('color_key')
