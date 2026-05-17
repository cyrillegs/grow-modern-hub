import { test, expect } from "@playwright/test";

/**
 * Daily smoke test. Runs against the deployed site via the daily-smoke
 * GitHub Actions workflow. Doubles as Supabase keepalive — the dashboard
 * load fires a SELECT against the `quotes` table (public schema), which
 * is the DB activity that prevents free-tier auto-pause.
 *
 * Requires E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD env vars (set as GitHub
 * Actions secrets in CI). Skips cleanly when they're absent so local
 * `npm run e2e` doesn't fail for other devs.
 */

const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test("daily smoke: homepage up, admin signs in, dashboard loads, sign out works", async ({
  page,
}) => {
  test.skip(
    !E2E_ADMIN_EMAIL || !E2E_ADMIN_PASSWORD,
    "Requires E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD env vars (provided by the daily-smoke workflow in CI).",
  );

  // 1. Frontend uptime — homepage renders the Hero
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /grow your future/i }),
  ).toBeVisible();

  // 2. Auth gate — unauthenticated /admin redirects to /admin/login
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("heading", { name: /admin sign in/i }),
  ).toBeVisible();

  // 3. Sign in with the dedicated e2e user.
  // Target inputs by type attribute — more reliable than getByLabel here,
  // which can pick up the eye-icon toggle button's aria-label or fail to
  // resolve the input when there are multiple elements near "password".
  await page.locator('input[type="email"]').fill(E2E_ADMIN_EMAIL!);
  await page.locator('input[type="password"]').fill(E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /^sign in$/i }).click();

  // 4. Dashboard mounts — proves auth succeeded and SPA hydrated
  await expect(page).toHaveURL(/\/admin(\?|$|\/)/);
  await expect(
    page.getByRole("heading", { name: /admin dashboard/i }),
  ).toBeVisible({ timeout: 15000 });

  // 5. Real public-schema DB read — load the Quotes tab and assert
  // the panel did not error. Quotes are the longest-lived table in
  // the project, so SELECT-on-quotes is the most reliable keepalive.
  await page.getByRole("tab", { name: /^quotes$/i }).click();
  await expect(page.getByText(/failed to load quotes/i)).not.toBeVisible();

  // 6. Sign out — back at login
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
});
