"""add study day start time

Revision ID: c6e4b7a9d012
Revises: b4e8d9a1c2f3
Create Date: 2026-07-08 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "c6e4b7a9d012"
down_revision = "b4e8d9a1c2f3"
branch_labels = None
depends_on = None


def upgrade():
    op.execute('UPDATE "user" SET timezone = \'Asia/Kolkata\' WHERE timezone IS NULL OR timezone = \'\' OR timezone = \'IST\'')

    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.alter_column(
            "timezone",
            existing_type=sa.String(length=80),
            server_default="Asia/Kolkata",
        )
        batch_op.add_column(
            sa.Column("study_day_start_time", sa.String(length=5), nullable=False, server_default="00:00")
        )

    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.alter_column("study_day_start_time", server_default=None)


def downgrade():
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.drop_column("study_day_start_time")
