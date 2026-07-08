"""add real groups and messages

Revision ID: 9c8f1d2e7a4b
Revises: f47866d6be32
Create Date: 2026-07-08 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '9c8f1d2e7a4b'
down_revision = 'f47866d6be32'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'study_group',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('logo_style', sa.String(length=40), nullable=True),
        sa.Column('invite_code', sa.String(length=40), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('study_group', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_study_group_invite_code'), ['invite_code'], unique=True)
        batch_op.create_index(batch_op.f('ix_study_group_owner_id'), ['owner_id'], unique=False)

    op.create_table(
        'group_membership',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['study_group.id']),
        sa.ForeignKeyConstraint(['user_id'], ['user.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('group_id', 'user_id', name='uq_group_membership_user'),
    )
    with op.batch_alter_table('group_membership', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_group_membership_group_id'), ['group_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_group_membership_user_id'), ['user_id'], unique=False)

    op.create_table(
        'group_message',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.String(length=1000), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['study_group.id']),
        sa.ForeignKeyConstraint(['user_id'], ['user.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    with op.batch_alter_table('group_message', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_group_message_group_id'), ['group_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_group_message_user_id'), ['user_id'], unique=False)


def downgrade():
    with op.batch_alter_table('group_message', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_group_message_user_id'))
        batch_op.drop_index(batch_op.f('ix_group_message_group_id'))
    op.drop_table('group_message')

    with op.batch_alter_table('group_membership', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_group_membership_user_id'))
        batch_op.drop_index(batch_op.f('ix_group_membership_group_id'))
    op.drop_table('group_membership')

    with op.batch_alter_table('study_group', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_study_group_owner_id'))
        batch_op.drop_index(batch_op.f('ix_study_group_invite_code'))
    op.drop_table('study_group')
