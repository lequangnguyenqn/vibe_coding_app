from datetime import date, timedelta
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import engine
from app.main import app
from app.services.bootstrap import seed_default_users


@pytest.fixture(autouse=True)
async def dispose_engine_between_tests() -> None:
    yield
    await engine.dispose()


async def login_admin(client: AsyncClient) -> str:
    response = await client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "password"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_food_item_crud_flow() -> None:
    await seed_default_users()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await login_admin(client)
        headers = {"Authorization": f"Bearer {token}"}

        create_response = await client.post(
            "/api/food-items",
            json={"name": f"Milk-{uuid4()}", "expiration_date": str(date.today() + timedelta(days=3))},
            headers=headers,
        )
        assert create_response.status_code == 201
        item_id = create_response.json()["id"]

        update_response = await client.put(
            f"/api/food-items/{item_id}",
            json={"name": f"Skim Milk-{uuid4()}", "expiration_date": str(date.today() + timedelta(days=5))},
            headers=headers,
        )
        assert update_response.status_code == 200

        delete_response = await client.delete(f"/api/food-items/{item_id}", headers=headers)
        assert delete_response.status_code == 204


@pytest.mark.asyncio
async def test_duplicate_food_item_is_blocked() -> None:
    await seed_default_users()

    suffix = str(uuid4())[:8]
    base_name = f"Yogurt {suffix}"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await login_admin(client)
        headers = {"Authorization": f"Bearer {token}"}

        first = await client.post(
            "/api/food-items",
            json={"name": base_name, "expiration_date": str(date.today() + timedelta(days=2))},
            headers=headers,
        )
        assert first.status_code == 201

        duplicate = await client.post(
            "/api/food-items",
            json={"name": f"  {base_name.upper()}  ", "expiration_date": str(date.today() + timedelta(days=4))},
            headers=headers,
        )
        assert duplicate.status_code == 409
        assert duplicate.json()["detail"] == "duplicate_food_item"


@pytest.mark.asyncio
async def test_food_item_list_supports_search_and_pagination() -> None:
    await seed_default_users()

    suffix = str(uuid4())[:8]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await login_admin(client)
        headers = {"Authorization": f"Bearer {token}"}

        names = [f"Apple {suffix}", f"Banana {suffix}", f"Cheese {suffix}"]
        for index, name in enumerate(names):
            response = await client.post(
                "/api/food-items",
                json={"name": name, "expiration_date": str(date.today() + timedelta(days=index + 1))},
                headers=headers,
            )
            assert response.status_code == 201

        page_response = await client.get(
            "/api/food-items?page=1&page_size=2",
            headers=headers,
        )
        assert page_response.status_code == 200
        page_data = page_response.json()
        assert page_data["total"] >= 3
        assert len(page_data["items"]) == 2

        search_response = await client.get(
            f"/api/food-items?search=banana%20{suffix}",
            headers=headers,
        )
        assert search_response.status_code == 200
        search_items = search_response.json()["items"]
        assert len(search_items) == 1
        assert "Banana" in search_items[0]["name"]
