"""add active focus session

Revision ID: 7d2a1f4c9b80
Revises: 6a4b2c9d0e71
Create Date: 2026-07-08 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '7d2a1f4c9b80'
down_revision = '6a4b2c9d0e71'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'active_focus_session',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.String(length=80), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('subject_id', sa.Integer(), nullable=True),
        sa.Column('subject_client_id', sa.String(length=80), nullable=True),
        sa.Column('subject_name', sa.String(length=120), nullable=False),
        sa.Column('timer_mode', sa.String(length=80), nullable=False),
        sa.Column('mode_id', sa.String(length=40), nullable=False),
        sa.Column('phase', sa.String(length=30), nullable=False, server_default='focus'),
        sa.Column('session_goal', sa.String(length=255), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('paused_at', sa.DateTime(), nullable=True),
        sa.Column('total_paused_seconds', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('state', sa.String(length=30), nullable=False, server_default='running'),
        sa.Column('focus_seconds', sa.Integer(), nullable=True),
        sa.Column('break_seconds', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('room_id', sa.String(length=80), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['subject_id'], ['subject.id']),
        sa.ForeignKeyConstraint(['user_id'], ['user.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index(op.f('ix_active_focus_session_client_id'), 'active_focus_session', ['client_id'], unique=False)
    op.create_index(op.f('ix_active_focus_session_user_id'), 'active_focus_session', ['user_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_active_focus_session_user_id'), table_name='active_focus_session')
    op.drop_index(op.f('ix_active_focus_session_client_id'), table_name='active_focus_session')
    op.drop_table('active_focus_session')
