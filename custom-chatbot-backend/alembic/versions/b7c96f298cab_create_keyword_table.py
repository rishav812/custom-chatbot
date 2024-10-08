"""create keyword table

Revision ID: b7c96f298cab
Revises: 344d5e7254bd
Create Date: 2024-09-25 22:46:27.215333

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b7c96f298cab'
down_revision: Union[str, None] = '344d5e7254bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        'keywords',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('chunk_id', sa.Integer(), sa.ForeignKey('chunks.id'), nullable=True),
        sa.Column('created_ts', sa.DateTime(), default=sa.func.now(), nullable=True),
        sa.Column('updated_ts', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    # Drop the `keywords` table
    op.drop_table('keywords')
    # ### end Alembic commands ###
