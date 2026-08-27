from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class FoodItemBaseRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    expiration_date: date


class FoodItemCreateRequest(FoodItemBaseRequest):
    pass


class FoodItemUpdateRequest(FoodItemBaseRequest):
    pass


class FoodItemResponse(BaseModel):
    id: int
    name: str
    expiration_date: date
    is_expired: bool
    days_until_expiration: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FoodItemListResponse(BaseModel):
    items: list[FoodItemResponse]
    total: int
    page: int
    page_size: int
