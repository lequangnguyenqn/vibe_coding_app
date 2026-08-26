# AGENTS.md

This file provides guidance for AI coding agents (Codex, Copilot, Cursor, Zed, OpenCode).

## Project overview

Food Expiry Tracker — a web app to track the expiration dates of food items and
email an alert once an item is within a week of (or past) its expiration date.

## Technical

- **Frontend:** React + Vite + TypeScript + Tailwind CSS, "claymorphism" UI. Don't use marge monolithic component file, split into route-level components and shared UI components.
- **Backend:** FastAPI + SQLAlchemy (async) + Alembic + APScheduler +
  PostgreSQL. Use alembic for database migration whenever new table or column is added or updated.
- **Python deps:** managed with [uv](https://docs.astral.sh/uv/) via
  `backend/pyproject.toml` (do **not** reintroduce `requirements.txt`/pip)
- **JS deps:** npm
- **Orchestration:** `docker-compose.yml` (db, backend, frontend)
- **Testing:** Using robust unit test, integration test, e2e test. The project test coverage should above 80% as minimum.

## UI Style
Create the surface using claymorphism. Defining signals: the clay shadow recipe on cards and buttons — two inner shadows (light at top, darker at bottom) plus one soft outer drop shadow, e.g. box-shadow: 0 24px 40px rgba(x,.18), inset 0 -8px 16px rgba(x,.15), inset 0 8px 16px rgba(255,255,255,.55); oversized corner radii (border-radius roughly 26px on a 56px control); each element independently colored in light pastels, clearly floating above a soft tinted background; chunky friendly type. Keep the exact hues and illustration flexible. Do not drift into neumorphism: the decisive difference is that clay objects have their own color and a visible drop shadow — never the background's color with shadows alone implying shape. Preserve 4.5:1 text contrast on pastel fills, pressed/hover states that deepen the inner shadows rather than removing them, and visible focus rings.

## Structure and run

- Backend code lives in `backend/`, frontend code in `frontend/`.
- `docker-compose.yml` defines all services needed to start the application.
- Start the app with `docker compose up --build`, then open http://localhost:5173.


## Coding standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever
4. When hitting issues, always identify root cause before trying a fix. Do not guess. Prove with evidence, then fix the root cause.

## Working documentation

All documents for planning and executing this project will be in the docs/ directory.
Please review the docs/PLAN.md document before proceeding.