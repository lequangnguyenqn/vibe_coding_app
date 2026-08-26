from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.core.config import settings

scheduler = AsyncIOScheduler()


def noop_daily_check() -> None:
    """Placeholder daily job; real expiry notifications are implemented in Part 4."""


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler.add_job(noop_daily_check, "cron", hour=8, minute=0, id="daily-expiry-check", replace_existing=True)
    scheduler.start()
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.include_router(health_router, prefix="/api")
