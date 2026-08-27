## Project Plan

This plan is organized into 5 parts. Part 1 is planning and approval. Parts 2-5 are implementation phases.

## Part 1: Planning and Approval

### Checklist

- [x] Convert high-level requirements into detailed, actionable steps.
- [x] Define test scope (unit, integration, e2e) for each implementation part.
- [x] Define success criteria for each implementation part.
- [x] User reviews and approves this plan before any implementation starts.

### Success Criteria

- Plan covers all requested requirements from Parts 2-5.
- Each part contains substeps that are specific enough to execute directly.
- Each part includes concrete verification tests.
- User explicitly approves the plan.

## Part 2: Scaffolding

### Objectives

- Set up backend and frontend foundations.
- Set up Docker-based local orchestration.
- Ensure fast frontend development loop with reload on file changes.
- Establish comprehensive testing baseline.

### Checklist

- [x] Create backend project structure in backend/ using FastAPI, SQLAlchemy async, Alembic, APScheduler, uv.
- [x] Create frontend project structure in frontend/ using React + Vite + TypeScript + Tailwind.
- [x] Implement default homepage shell with claymorphism styling direction.
- [x] Add Docker setup for db, backend, frontend in docker-compose.yml.
- [x] Add .dockerignore files where needed to optimize build context.
- [x] Configure frontend dev server for file-watch reload in containerized development.
- [x] Configure backend environment settings and database connection.
- [x] Add initial test setup:
	- [x] Backend unit/integration test scaffolding.
	- [x] Frontend unit/component test scaffolding.
	- [x] E2E test scaffolding.
- [x] Verify all services boot cleanly with docker compose up --build.

### Tests

- Unit tests:
	- Backend sanity test for health endpoint.
	- Frontend render test for default homepage.
- Integration tests:
	- Backend can connect to PostgreSQL and execute simple DB operation.
- E2E tests:
	- Home page loads and displays key title/CTA.
- Runtime checks:
	- Containers start without crash loops.
	- Frontend reloads on source file change.

### Success Criteria

- docker compose up --build starts db/backend/frontend successfully.
- Homepage is reachable from browser.
- Test commands for unit/integration/e2e run and pass.
- Project structure clearly separates backend and frontend responsibilities.

## Part 3: Login and Admin Entry

### Objectives

- Implement JWT-based authentication end-to-end.
- Add role-aware navigation and protected admin access.
- Introduce admin dashboard shell using TailAdmin template.

### Checklist

- [x] Design auth model and user table schema (username/email, hashed password, role, status fields as needed).
- [x] Create Alembic migration for auth/user tables.
- [x] Implement secure password hashing and verification.
- [x] Implement login API endpoint returning JWT tokens.
- [x] Implement backend auth middleware/dependency for protected routes.
- [x] Seed default users:
	- [x] admin/password (admin role)
	- [x] user/password (user role)
- [x] Add login button at top-right on home page.
- [x] Build login page and submit flow.
- [x] On successful login, navigate to /admin.
- [x] Add logout capability to clear auth state and redirect appropriately.
- [x] Allow navigation home <-> admin with route guards.
- [x] Integrate TailAdmin React template for admin layout.
- [x] Add left-menu hamburger toggle behavior.

### Tests

- Unit tests:
	- Password hash/verify behavior.
	- JWT encode/decode and expiration validation.
- Integration tests:
	- Login API accepts valid credentials and rejects invalid ones.
	- Protected endpoint access control for unauthenticated and authenticated users.
	- Role checks for admin-only resources.
- Frontend tests:
	- Login form validation and submit behavior.
	- Redirect to /admin after successful login.
	- Logout returns user to allowed public page.
	- Menu toggle updates layout state.
- E2E tests:
	- End-to-end login as admin and as user.
	- Unauthorized user cannot access protected admin-only paths.

### Success Criteria

- JWT authentication works from UI through backend.
- User credentials are stored securely (hashed, never plain text).
- Default users are created and usable.
- Admin layout and navigation are functional and test-covered.

## Part 4: Food Tracker

### Objectives

- Implement CRUD for food items with duplicate prevention.
- Add search and pagination from the first release.
- Send daily expiration alerts through Resend.

### Checklist

- [x] Define food item schema and uniqueness constraints (name and scope rules).
- [x] Create Alembic migration for food tracking tables.
- [x] Implement backend APIs:
	- [x] List with pagination and search filters.
	- [x] Create item (name, expiration date) with duplicate checks.
	- [x] Update item.
	- [x] Delete item.
- [x] Build Food Tracker admin page with table/list rendering.
- [x] Add search/filter controls and pagination UI.
- [x] Add create/edit forms with validation.
- [x] Add custom confirmation popup for delete action.
- [x] Integrate Resend email service configuration.
- [x] Implement APScheduler daily job for expiry checks.
- [x] Implement notification logic for:
	- [x] within 7 days to expiration
	- [x] already expired

### Tests

- Unit tests:
	- Duplicate detection rules.
	- Expiration window calculation logic.
	- Email payload formatting logic.
- Integration tests:
	- CRUD API behavior with DB persistence.
	- Search and pagination query behavior.
	- Scheduler job function execution (with mocked email service).
- Frontend tests:
	- Food list rendering and pagination controls.
	- Create/edit/delete flows.
	- Delete confirmation popup behavior.
	- Search filter behavior.
- E2E tests:
	- Admin creates, edits, filters, and deletes food items.
	- Duplicate create attempt is blocked with visible feedback.

### Success Criteria

- Food Tracker page supports full CRUD.
- Duplicates are prevented by backend validation and DB constraints.
- Search and pagination work correctly.
- Daily scheduler triggers expiry checks and sends expected emails.

## Part 5: User Management

### Objectives

- Provide admin-only user management.
- Support user profile fields and management filters.

### Checklist

- [ ] Extend user schema with full name, email, sex, birthday, active status.
- [ ] Create/update Alembic migration for user management fields.
- [ ] Implement backend APIs for user management:
	- [ ] List users with filters: page, page_size, role, active.
	- [ ] Create user.
	- [ ] Update user.
	- [ ] Activate/deactivate user as needed.
- [ ] Add User Management menu item visible only to admin role.
- [ ] Build User Management page with table, filters, and pagination.
- [ ] Add forms for creating and editing user data.
- [ ] Enforce role-based authorization on all user-management endpoints.

### Tests

- Unit tests:
	- User field validation.
	- Role-based access helper logic.
- Integration tests:
	- User management API CRUD/update behavior.
	- Pagination and role/active filters.
	- Authorization checks for admin vs non-admin accounts.
- Frontend tests:
	- Admin sees User Management menu; non-admin does not.
	- User list/filter/pagination behavior.
	- Create/edit form validation and submit behavior.
- E2E tests:
	- Admin can manage users through UI.
	- Non-admin cannot access User Management routes.

### Success Criteria

- User management features are available only to admin users.
- User profile fields are persisted and editable.
- Filtering and pagination behave correctly.
- Test coverage includes permission boundaries and CRUD workflows.

## Global Quality Gates

### Coverage and Reliability

- [ ] Combined test suite demonstrates at least 80% coverage.
- [ ] No critical runtime errors in backend/frontend startup logs.
- [ ] Migrations run cleanly from empty database state.

### Security and Data Integrity

- [ ] Passwords hashed securely.
- [ ] JWT auth enforced on protected APIs.
- [ ] Duplicate food item prevention validated at API and DB layers.

### Developer Experience

- [ ] Local development uses docker compose reliably.
- [ ] Frontend hot reload works in containerized workflow.

## Approval

Plan status: Part 1 approved. Part 2 completed. Part 3 completed. Part 4 completed.

Approval checklist:

- [x] User approves this Part 1 plan.
- [x] Agent proceeds to Part 2 implementation.