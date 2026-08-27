"""extend users profile fields

Revision ID: 0004_extend_users_profile_fields
Revises: 0003_create_food_items
Create Date: 2026-08-27 09:20:00

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0004_extend_users_profile_fields"
down_revision: Union[str, None] = "0003_create_food_items"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {column["name"] for column in inspector.get_columns("users")}

    if "full_name" not in existing_columns:
        op.add_column("users", sa.Column("full_name", sa.String(length=120), nullable=True))
    if "email" not in existing_columns:
        op.add_column("users", sa.Column("email", sa.String(length=255), nullable=True))
    if "sex" not in existing_columns:
        op.add_column("users", sa.Column("sex", sa.String(length=16), nullable=True))
    if "birthday" not in existing_columns:
        op.add_column("users", sa.Column("birthday", sa.Date(), nullable=True))

    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (lower(email)) WHERE email IS NOT NULL"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS uq_users_email_lower")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS birthday")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS sex")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS email")
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS full_name")
