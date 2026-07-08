"""allow exam date to be optional

Revision ID: 6a4b2c9d0e71
Revises: 3b7c9e1a6d2f
Create Date: 2026-07-08 12:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '6a4b2c9d0e71'
down_revision = '3b7c9e1a6d2f'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("exam", schema=None) as batch_op:
        batch_op.alter_column("exam_date", existing_type=sa.Date(), nullable=True)


def downgrade():
    with op.batch_alter_table("exam", schema=None) as batch_op:
        batch_op.alter_column("exam_date", existing_type=sa.Date(), nullable=False)
