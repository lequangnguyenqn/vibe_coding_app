import pytest
from fastapi import HTTPException

from app.core.auth import require_role
from app.models.user import User
from app.schemas.user_management import UserCreateRequest


def test_user_create_request_rejects_invalid_email() -> None:
    with pytest.raises(ValueError):
        UserCreateRequest(
            username="tester",
            password="password",
            email="invalid-email",
        )


def test_user_create_request_accepts_valid_email() -> None:
    payload = UserCreateRequest(
        username="tester",
        password="password",
        email="Tester@Example.com",
    )
    assert payload.email == "tester@example.com"


@pytest.mark.asyncio
async def test_require_role_blocks_non_admin_user() -> None:
    checker = require_role("admin")
    non_admin = User(username="member", password_hash="x", role="user", is_active=True)

    with pytest.raises(HTTPException) as exc_info:
        await checker(user=non_admin)

    assert exc_info.value.status_code == 403
