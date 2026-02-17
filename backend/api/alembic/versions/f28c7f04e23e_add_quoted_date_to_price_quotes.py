"""add_quoted_date_to_price_quotes

Revision ID: f28c7f04e23e
Revises: 90657e473a4c
Create Date: 2026-02-17 17:39:28.957069
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f28c7f04e23e'
down_revision: Union[str, None] = '90657e473a4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add quoted_date as nullable first, backfill existing rows, then set NOT NULL
    op.add_column('price_quotes', sa.Column('quoted_date', sa.Date(), nullable=True))
    op.execute("UPDATE price_quotes SET quoted_date = CURRENT_DATE WHERE quoted_date IS NULL")
    op.alter_column('price_quotes', 'quoted_date', nullable=False)

    # Backfill NULL configuration before making NOT NULL
    op.execute("UPDATE price_quotes SET configuration = '3 BHK' WHERE configuration IS NULL")
    op.alter_column('price_quotes', 'configuration',
               existing_type=sa.VARCHAR(length=100),
               nullable=False)


def downgrade() -> None:
    op.alter_column('price_quotes', 'configuration',
               existing_type=sa.VARCHAR(length=100),
               nullable=True)
    op.drop_column('price_quotes', 'quoted_date')
