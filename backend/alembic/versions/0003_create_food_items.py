"""create food items table

Revision ID: 0003_create_food_items
Revises: 0002_create_users
Create Date: 2026-08-27 00:10:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0003_create_food_items"
down_revision: Union[str, None] = "0002_create_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "food_items" not in inspector.get_table_names():
        op.create_table(
            "food_items",
            sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
            sa.Column("owner_id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=120), nullable=False),
            sa.Column("expiration_date", sa.Date(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )

    op.execute("CREATE INDEX IF NOT EXISTS ix_food_items_owner_id ON food_items (owner_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_food_items_expiration_date ON food_items (expiration_date)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_food_items_owner_name_lower ON food_items (owner_id, lower(name))")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS uq_food_items_owner_name_lower")
    op.execute("DROP INDEX IF EXISTS ix_food_items_expiration_date")
    op.execute("DROP INDEX IF EXISTS ix_food_items_owner_id")
    op.execute("DROP TABLE IF EXISTS food_items")
