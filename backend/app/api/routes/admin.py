from fastapi import APIRouter, Depends

from app.core.auth import require_role
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/overview")
async def admin_overview(_: User = Depends(require_role("admin"))) -> dict[str, str]:
    return {"status": "ok", "message": "admin_dashboard_ready"}
