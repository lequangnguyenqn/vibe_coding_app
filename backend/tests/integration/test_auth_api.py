import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import engine
from app.main import app
from app.services.bootstrap import seed_default_users


@pytest.fixture(autouse=True)
async def dispose_engine_between_tests() -> None:
    yield
    await engine.dispose()


@pytest.mark.asyncio
async def test_login_and_admin_authorization_flow() -> None:
    await seed_default_users()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_response = await client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "password"},
        )
        assert login_response.status_code == 200

        token = login_response.json()["access_token"]
        admin_response = await client.get(
            "/api/admin/overview",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert admin_response.status_code == 200


@pytest.mark.asyncio
async def test_non_admin_forbidden_on_admin_route() -> None:
    await seed_default_users()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        login_response = await client.post(
            "/api/auth/login",
            json={"username": "user", "password": "password"},
        )
        assert login_response.status_code == 200

        token = login_response.json()["access_token"]
        admin_response = await client.get(
            "/api/admin/overview",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert admin_response.status_code == 403
