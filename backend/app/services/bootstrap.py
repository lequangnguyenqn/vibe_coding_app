from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.user import User


DEFAULT_USERS = [
    {"username": "admin", "password": "password", "role": "admin"},
    {"username": "user", "password": "password", "role": "user"},
]


async def _ensure_user(session: AsyncSession, username: str, password: str, role: str) -> None:
    existing = await session.scalar(select(User).where(User.username == username))
    if existing is not None:
        return

    session.add(
        User(
            username=username,
            password_hash=hash_password(password),
            role=role,
            is_active=True,
        )
    )


async def seed_default_users() -> None:
    async with AsyncSessionLocal() as session:
        try:
            for user in DEFAULT_USERS:
                await _ensure_user(session, user["username"], user["password"], user["role"])
            await session.commit()
        except SQLAlchemyError:
            await session.rollback()
