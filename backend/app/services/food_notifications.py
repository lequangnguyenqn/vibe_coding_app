from __future__ import annotations

from datetime import date
import json
from urllib import request

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.food_item import FoodItem
from app.models.user import User


def normalize_food_name(name: str) -> str:
    return " ".join(name.strip().split()).lower()


def calculate_days_until_expiration(expiration_date: date, reference_date: date) -> int:
    return (expiration_date - reference_date).days


def classify_expiry_items(
    items: list[tuple[str, str, date]],
    reference_date: date,
    alert_days: int,
) -> tuple[list[tuple[str, str, date, int]], list[tuple[str, str, date, int]]]:
    expiring_soon: list[tuple[str, str, date, int]] = []
    expired: list[tuple[str, str, date, int]] = []

    for username, name, expiration_date in items:
        days_until = calculate_days_until_expiration(expiration_date, reference_date)
        row = (username, name, expiration_date, days_until)
        if days_until < 0:
            expired.append(row)
        elif days_until <= alert_days:
            expiring_soon.append(row)

    return expiring_soon, expired


def build_expiry_email_html(
    expiring_soon: list[tuple[str, str, date, int]],
    expired: list[tuple[str, str, date, int]],
    reference_date: date,
) -> str:
    sections: list[str] = [f"<h2>Food Expiry Digest ({reference_date.isoformat()})</h2>"]

    if expiring_soon:
        sections.append("<h3>Expiring Within 7 Days</h3><ul>")
        for username, name, expiration_date, days_until in expiring_soon:
            sections.append(
                f"<li><strong>{name}</strong> (owner: {username}) expires on {expiration_date.isoformat()} ({days_until} day(s))</li>"
            )
        sections.append("</ul>")

    if expired:
        sections.append("<h3>Already Expired</h3><ul>")
        for username, name, expiration_date, days_until in expired:
            sections.append(
                f"<li><strong>{name}</strong> (owner: {username}) expired on {expiration_date.isoformat()} ({abs(days_until)} day(s) ago)</li>"
            )
        sections.append("</ul>")

    return "".join(sections)


def fetch_alert_candidates_stmt(reference_date: date, alert_days: int) -> Select[tuple[str, str, date]]:
    max_date = date.fromordinal(reference_date.toordinal() + alert_days)
    return (
        select(User.username, FoodItem.name, FoodItem.expiration_date)
        .join(User, User.id == FoodItem.owner_id)
        .where(FoodItem.expiration_date <= max_date)
        .order_by(FoodItem.expiration_date.asc(), FoodItem.id.asc())
    )


def send_resend_email(subject: str, html: str) -> bool:
    if not settings.resend_api_key or not settings.resend_to_emails.strip():
        return False

    recipients = [email.strip() for email in settings.resend_to_emails.split(",") if email.strip()]
    if not recipients:
        return False

    payload = {
        "from": settings.resend_from_email,
        "to": recipients,
        "subject": subject,
        "html": html,
    }

    req = request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.resend_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with request.urlopen(req, timeout=10) as response:  # noqa: S310
        return 200 <= response.status < 300


async def send_daily_expiry_alerts(
    session: AsyncSession,
    reference_date: date | None = None,
    alert_days: int | None = None,
) -> bool:
    current_date = reference_date or date.today()
    days = alert_days if alert_days is not None else settings.expiry_alert_days

    rows = (await session.execute(fetch_alert_candidates_stmt(current_date, days))).all()
    if not rows:
        return False

    expiring_soon, expired = classify_expiry_items(list(rows), current_date, days)
    if not expiring_soon and not expired:
        return False

    html = build_expiry_email_html(expiring_soon, expired, current_date)
    subject = "Food Expiry Alert Digest"
    return send_resend_email(subject, html)
