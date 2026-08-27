from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.db.session import get_session
from app.models.food_item import FoodItem
from app.models.user import User
from app.schemas.food_item import (
    FoodItemCreateRequest,
    FoodItemListResponse,
    FoodItemResponse,
    FoodItemUpdateRequest,
)
from app.services.food_notifications import calculate_days_until_expiration, normalize_food_name

router = APIRouter(prefix="/food-items", tags=["food-items"])


def to_food_item_response(item: FoodItem, reference_date: date | None = None) -> FoodItemResponse:
    today = reference_date or date.today()
    days_until = calculate_days_until_expiration(item.expiration_date, today)
    return FoodItemResponse(
        id=item.id,
        name=item.name,
        expiration_date=item.expiration_date,
        is_expired=days_until < 0,
        days_until_expiration=days_until,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


async def ensure_no_duplicate_name(
    session: AsyncSession,
    owner_id: int,
    name: str,
    exclude_id: int | None = None,
) -> None:
    normalized = normalize_food_name(name)

    stmt = select(FoodItem.id).where(
        FoodItem.owner_id == owner_id,
        func.lower(FoodItem.name) == normalized,
    )
    if exclude_id is not None:
        stmt = stmt.where(FoodItem.id != exclude_id)

    existing_id = await session.scalar(stmt)
    if existing_id is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="duplicate_food_item")


@router.get("", response_model=FoodItemListResponse)
async def list_food_items(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> FoodItemListResponse:
    stmt = select(FoodItem).where(FoodItem.owner_id == user.id)
    count_stmt = select(func.count()).select_from(FoodItem).where(FoodItem.owner_id == user.id)

    if search:
        pattern = f"%{search.strip()}%"
        stmt = stmt.where(FoodItem.name.ilike(pattern))
        count_stmt = count_stmt.where(FoodItem.name.ilike(pattern))

    stmt = stmt.order_by(FoodItem.expiration_date.asc(), FoodItem.id.asc())
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    total = int((await session.scalar(count_stmt)) or 0)
    records = (await session.scalars(stmt)).all()
    items = [to_food_item_response(record) for record in records]

    return FoodItemListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=FoodItemResponse, status_code=status.HTTP_201_CREATED)
async def create_food_item(
    payload: FoodItemCreateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> FoodItemResponse:
    cleaned_name = " ".join(payload.name.strip().split())
    await ensure_no_duplicate_name(session, owner_id=user.id, name=cleaned_name)

    item = FoodItem(owner_id=user.id, name=cleaned_name, expiration_date=payload.expiration_date)
    session.add(item)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="duplicate_food_item") from exc

    await session.refresh(item)
    return to_food_item_response(item)


@router.put("/{item_id}", response_model=FoodItemResponse)
async def update_food_item(
    item_id: int,
    payload: FoodItemUpdateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> FoodItemResponse:
    item = await session.scalar(select(FoodItem).where(FoodItem.id == item_id, FoodItem.owner_id == user.id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="food_item_not_found")

    cleaned_name = " ".join(payload.name.strip().split())
    await ensure_no_duplicate_name(session, owner_id=user.id, name=cleaned_name, exclude_id=item_id)

    item.name = cleaned_name
    item.expiration_date = payload.expiration_date

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="duplicate_food_item") from exc

    await session.refresh(item)
    return to_food_item_response(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food_item(
    item_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    item = await session.scalar(select(FoodItem).where(FoodItem.id == item_id, FoodItem.owner_id == user.id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="food_item_not_found")

    await session.delete(item)
    await session.commit()
