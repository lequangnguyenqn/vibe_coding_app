from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_role
from app.core.security import hash_password
from app.db.session import get_session
from app.models.user import User
from app.schemas.user_management import (
    UserActiveUpdateRequest,
    UserCreateRequest,
    UserListItemResponse,
    UserListResponse,
    UserUpdateRequest,
)

router = APIRouter(prefix="/admin/users", tags=["user-management"])


def to_user_list_item(user: User) -> UserListItemResponse:
    return UserListItemResponse(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        sex=user.sex,
        birthday=user.birthday,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )


async def ensure_unique_fields(
    session: AsyncSession,
    username: str | None,
    email: str | None,
    exclude_user_id: int | None = None,
) -> None:
    if username is not None:
        username_stmt = select(User.id).where(User.username == username)
        if exclude_user_id is not None:
            username_stmt = username_stmt.where(User.id != exclude_user_id)
        existing_user_id = await session.scalar(username_stmt)
        if existing_user_id is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="duplicate_username")

    if email:
        email_stmt = select(User.id).where(func.lower(User.email) == email.lower())
        if exclude_user_id is not None:
            email_stmt = email_stmt.where(User.id != exclude_user_id)
        existing_email_user_id = await session.scalar(email_stmt)
        if existing_email_user_id is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="duplicate_email")


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    role: str | None = Query(default=None),
    active: bool | None = Query(default=None),
    _: User = Depends(require_role("admin")),
    session: AsyncSession = Depends(get_session),
) -> UserListResponse:
    stmt = select(User)
    count_stmt = select(func.count()).select_from(User)

    if role:
        stmt = stmt.where(User.role == role)
        count_stmt = count_stmt.where(User.role == role)

    if active is not None:
        stmt = stmt.where(User.is_active == active)
        count_stmt = count_stmt.where(User.is_active == active)

    stmt = stmt.order_by(User.id.asc()).offset((page - 1) * page_size).limit(page_size)

    total = int((await session.scalar(count_stmt)) or 0)
    users = (await session.scalars(stmt)).all()
    return UserListResponse(
        items=[to_user_list_item(user) for user in users],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=UserListItemResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreateRequest,
    _: User = Depends(require_role("admin")),
    session: AsyncSession = Depends(get_session),
) -> UserListItemResponse:
    username = payload.username.strip()
    full_name = payload.full_name.strip() if payload.full_name else None
    email = payload.email.strip().lower() if payload.email else None
    sex = payload.sex.strip().lower() if payload.sex else None

    await ensure_unique_fields(session, username=username, email=email)

    user = User(
        username=username,
        password_hash=hash_password(payload.password),
        full_name=full_name,
        email=email,
        sex=sex,
        birthday=payload.birthday,
        role=payload.role,
        is_active=payload.is_active,
    )
    session.add(user)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="duplicate_user") from exc

    await session.refresh(user)
    return to_user_list_item(user)


@router.put("/{user_id}", response_model=UserListItemResponse)
async def update_user(
    user_id: int,
    payload: UserUpdateRequest,
    _: User = Depends(require_role("admin")),
    session: AsyncSession = Depends(get_session),
) -> UserListItemResponse:
    user = await session.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user_not_found")

    next_username = payload.username.strip() if payload.username is not None else None
    next_email = payload.email.strip().lower() if payload.email is not None else None
    await ensure_unique_fields(session, username=next_username, email=next_email, exclude_user_id=user_id)

    if payload.username is not None:
        user.username = next_username
    if payload.password is not None:
        user.password_hash = hash_password(payload.password)
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip() or None
    if payload.email is not None:
        user.email = next_email or None
    if payload.sex is not None:
        user.sex = payload.sex.strip().lower() or None
    if payload.birthday is not None:
        user.birthday = payload.birthday
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="duplicate_user") from exc

    await session.refresh(user)
    return to_user_list_item(user)


@router.patch("/{user_id}/active", response_model=UserListItemResponse)
async def update_user_active_state(
    user_id: int,
    payload: UserActiveUpdateRequest,
    actor: User = Depends(require_role("admin")),
    session: AsyncSession = Depends(get_session),
) -> UserListItemResponse:
    user = await session.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user_not_found")

    if actor.id == user.id and payload.is_active is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="cannot_deactivate_self")

    user.is_active = payload.is_active
    await session.commit()
    await session.refresh(user)
    return to_user_list_item(user)
