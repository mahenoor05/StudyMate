"""add session source audit fields

Revision ID: b4e8d9a1c2f3
Revises: 7d2a1f4c9b80
Create Date: 2026-07-08 17:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b4e8d9a1c2f3'
down_revision = '7d2a1f4c9b80'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('study_session', schema=None) as batch_op:
        batch_op.add_column(sa.Column('source_type', sa.String(length=30), nullable=False, server_default='tracked'))
        batch_op.add_column(sa.Column('was_edited', sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.add_column(sa.Column('edited_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('original_duration_seconds', sa.Integer(), nullable=True))


def downgrade():
    with op.batch_alter_table('study_session', schema=None) as batch_op:
        batch_op.drop_column('original_duration_seconds')
        batch_op.drop_column('edited_at')
        batch_op.drop_column('was_edited')
        batch_op.drop_column('source_type')
