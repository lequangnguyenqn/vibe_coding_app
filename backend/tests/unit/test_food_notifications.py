from datetime import date

from app.services.food_notifications import (
    build_expiry_email_html,
    classify_expiry_items,
    normalize_food_name,
)


def test_normalize_food_name_collapses_space_and_case() -> None:
    assert normalize_food_name("  Fresh   Milk  ") == "fresh milk"


def test_classify_expiry_items_splits_expiring_and_expired() -> None:
    today = date(2026, 8, 27)
    rows = [
        ("admin", "Milk", date(2026, 8, 29)),
        ("admin", "Bread", date(2026, 8, 20)),
        ("user", "Cheese", date(2026, 9, 15)),
    ]

    expiring_soon, expired = classify_expiry_items(rows, today, alert_days=7)

    assert len(expiring_soon) == 1
    assert expiring_soon[0][1] == "Milk"
    assert len(expired) == 1
    assert expired[0][1] == "Bread"


def test_build_expiry_email_html_contains_expected_sections() -> None:
    today = date(2026, 8, 27)
    expiring_soon = [("admin", "Milk", date(2026, 8, 29), 2)]
    expired = [("admin", "Bread", date(2026, 8, 20), -7)]

    html = build_expiry_email_html(expiring_soon, expired, today)

    assert "Expiring Within 7 Days" in html
    assert "Already Expired" in html
    assert "Milk" in html
    assert "Bread" in html
