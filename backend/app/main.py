from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.admin import router as admin_router
from app.api.routes.auth import router as auth_router
from app.api.routes.food_items import router as food_items_router
from app.api.routes.health import router as health_router
from app.api.routes.user_management import router as user_management_router
from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.services.food_notifications import send_daily_expiry_alerts
from app.services.bootstrap import seed_default_users

scheduler = AsyncIOScheduler()


async def run_daily_expiry_check() -> None:
    async with AsyncSessionLocal() as session:
        await send_daily_expiry_alerts(session)


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler.add_job(run_daily_expiry_check, "cron", hour=8, minute=0, id="daily-expiry-check", replace_existing=True)
    scheduler.start()
    await seed_default_users()
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(food_items_router, prefix="/api")
app.include_router(user_management_router, prefix="/api")
