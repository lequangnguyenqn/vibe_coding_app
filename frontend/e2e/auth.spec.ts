import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test("admin can log in and access /admin", async ({ page }) => {
  await login(page, "admin", "password");

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
});

test("non-admin user is redirected away from /admin", async ({ page }) => {
  await login(page, "user", "password");

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /Track food expiry dates/i })).toBeVisible();
});
