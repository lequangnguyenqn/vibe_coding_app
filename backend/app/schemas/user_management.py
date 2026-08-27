from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


class UserListItemResponse(BaseModel):
    id: int
    username: str
    full_name: str | None
    email: str | None
    sex: str | None
    birthday: date | None
    role: str
    is_active: bool
    created_at: datetime


class UserListResponse(BaseModel):
    items: list[UserListItemResponse]
    total: int
    page: int
    page_size: int


class UserCreateRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)
    full_name: str | None = Field(default=None, max_length=120)
    email: str | None = Field(default=None, max_length=255)
    sex: str | None = Field(default=None, max_length=16)
    birthday: date | None = None
    role: str = Field(default="user", max_length=32)
    is_active: bool = True

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().lower()
        if not normalized:
            return None
        if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
            raise ValueError("invalid_email")
        return normalized


class UserUpdateRequest(BaseModel):
    username: str | None = Field(default=None, min_length=1, max_length=64)
    password: str | None = Field(default=None, min_length=1, max_length=128)
    full_name: str | None = Field(default=None, max_length=120)
    email: str | None = Field(default=None, max_length=255)
    sex: str | None = Field(default=None, max_length=16)
    birthday: date | None = None
    role: str | None = Field(default=None, max_length=32)
    is_active: bool | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().lower()
        if not normalized:
            return None
        if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
            raise ValueError("invalid_email")
        return normalized


class UserActiveUpdateRequest(BaseModel):
    is_active: bool
