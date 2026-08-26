from fastapi import APIRouter, HTTPException

from app.db.session import check_database

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/db")
async def health_db() -> dict[str, str]:
    try:
        await check_database()
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=503, detail="database_unavailable") from exc
    return {"status": "ok"}
