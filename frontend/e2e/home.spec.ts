import { expect, test } from "@playwright/test";

test("home page loads and shows key content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Track food expiry dates/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Login/i })).toBeVisible();
});
