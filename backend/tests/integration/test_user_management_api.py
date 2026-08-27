from datetime import date
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


async def login(client: AsyncClient, username: str, password: str) -> str:
    response = await client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_admin_can_create_filter_update_and_toggle_users() -> None:
    await seed_default_users()
    suffix = str(uuid4())[:8]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await login(client, "admin", "password")
        headers = {"Authorization": f"Bearer {token}"}

        create_response = await client.post(
            "/api/admin/users",
            json={
                "username": f"member_{suffix}",
                "password": "password",
                "full_name": "Member One",
                "email": f"member_{suffix}@example.com",
                "sex": "other",
                "birthday": str(date(1995, 5, 10)),
                "role": "user",
                "is_active": True,
            },
            headers=headers,
        )
        assert create_response.status_code == 201
        created_user_id = create_response.json()["id"]

        list_response = await client.get("/api/admin/users?page=1&page_size=10&role=user&active=true", headers=headers)
        assert list_response.status_code == 200
        listed = list_response.json()
        assert listed["total"] >= 1
        assert any(item["id"] == created_user_id for item in listed["items"])

        update_response = await client.put(
            f"/api/admin/users/{created_user_id}",
            json={
                "full_name": "Member One Updated",
                "role": "admin",
            },
            headers=headers,
        )
        assert update_response.status_code == 200
        assert update_response.json()["full_name"] == "Member One Updated"
        assert update_response.json()["role"] == "admin"

        deactivate_response = await client.patch(
            f"/api/admin/users/{created_user_id}/active",
            json={"is_active": False},
            headers=headers,
        )
        assert deactivate_response.status_code == 200
        assert deactivate_response.json()["is_active"] is False


@pytest.mark.asyncio
async def test_non_admin_cannot_access_user_management() -> None:
    await seed_default_users()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await login(client, "user", "password")
        headers = {"Authorization": f"Bearer {token}"}

        list_response = await client.get("/api/admin/users", headers=headers)
        assert list_response.status_code == 403
