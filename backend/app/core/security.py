import binascii
from datetime import UTC, datetime, timedelta
import base64
import hashlib
import hmac
import os

import jwt

from app.core.config import settings

PBKDF2_ITERATIONS = 390000
PBKDF2_ALGORITHM = "sha256"


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(PBKDF2_ALGORITHM, password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    salt_b64 = base64.b64encode(salt).decode("ascii")
    digest_b64 = base64.b64encode(digest).decode("ascii")
    return f"pbkdf2_{PBKDF2_ALGORITHM}${PBKDF2_ITERATIONS}${salt_b64}${digest_b64}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        scheme, iterations, salt_b64, digest_b64 = hashed_password.split("$")
        if scheme != f"pbkdf2_{PBKDF2_ALGORITHM}":
            return False

        salt = base64.b64decode(salt_b64.encode("ascii"))
        expected_digest = base64.b64decode(digest_b64.encode("ascii"))
        calculated_digest = hashlib.pbkdf2_hmac(
            PBKDF2_ALGORITHM,
            plain_password.encode("utf-8"),
            salt,
            int(iterations),
        )
        return hmac.compare_digest(expected_digest, calculated_digest)
    except (ValueError, TypeError, binascii.Error):
        return False


def create_access_token(subject: str, role: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
