## High lelve steps for project

Part 1: Plan

Enrich this document to plan out each of these parts in detail, with substeps listed out as a checklist to be checked off by the agent, and with tests and success critieria for each. Ensure the user checks and approves the plan.

Part 2: Scaffolding

Set up the Docker infrastructure including docker ignore, backend code lives in `backend/`, frontend code in `frontend/` with default home page. Allow the frontend to reload whenever any file is changed. Comprehensive unit test, integration tests and e2e test. Test and make sure both backend and frontend able to start without issue.

Part 3: Login page

- Use JWT-based for authenticateion for the frontend/backend flow
- Add login button on top right corner, when user click login button the login page will be shown to allow user login, after login success user navigate to /admin, you also can log out.
- User credentials are stored securely in the database. Use alembic for database migration.
- System contains 2 roles: user and admin.
- Add 2 defaults users: admin/password for admin role and user/password for user role.
- User also able to go to home page from admin page, and from home page user can navigate to admin page.
- Home Page: Initial landing page with Food Tracker overview and navigation to admin panel (for authorized users).
- Build admin dashboard using the TailAdmin React template
- Add a toggle humberger icon to show and hide the left menu in Admin page
- Comprehensive tests.

Part 4: Food Tracker

- User can access it via Food Tracker menu in admin page
- The page shows all previously entered food items.
- New food items can be added with a name and an expiration date.
- Duplicate items are not allowed.
- Add pagination and search filters early
- An email is sent to the configured addresses once an item is within a week of (or past) its expiration date. Using Resend for email sending. APScheduler runs daily to check expiration dates.
- Edit and Delete also support, use custom popup for delete confirmation
- Update database migration
- Comprehensive tests.


Part 5: User Management

- Implement user management that allow user to manage users with some infomation such as Full Name, Email, Sex, Birthday.
- Add pagination and search filters early (page, page_size, role, active)
- Only admin role can see User Managerment menu.
- Update database migration
- Comprehensive tests.