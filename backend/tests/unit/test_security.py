import jwt

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password


def test_hash_and_verify_password() -> None:
    password = "password"
    password_hash = hash_password(password)

    assert password_hash != password
    assert verify_password(password, password_hash)


def test_create_access_token_contains_subject_and_role() -> None:
    token = create_access_token(subject="admin", role="admin")
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])

    assert payload["sub"] == "admin"
    assert payload["role"] == "admin"
    assert "exp" in payload
