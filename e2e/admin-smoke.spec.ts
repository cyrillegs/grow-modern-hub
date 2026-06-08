import { test, expect, Page } from "@playwright/test";

/**
 * Daily smoke test. Runs against the deployed site via the daily-smoke
 * GitHub Actions workflow. Doubles as Supabase keepalive — the run hits
 * every key table with realistic activity:
 *   - anon SELECT on `products` (homepage + /products)
 *   - anon INSERT on `contacts` (homepage Contact form)
 *   - anon INSERT on `quotes` (Request Quote dialog on /products)
 *   - authenticated SELECT on `products`, `quotes`, `contacts`
 *     (admin dashboard tab tour)
 *   - auth signin + signout
 *
 * Shaped to look like a realistic visitor session — browses, fills the
 * contact form, browses the catalog, requests a quote, then signs in
 * as the admin and clicks through every tab — with brief reading
 * pauses between actions so the activity profile mirrors a real user
 * rather than a bot. The pauses are short (~600–1200ms) so the whole
 * test still finishes well under the 10-min CI budget.
 *
 * The contact + quote submissions use the `E2E-SMOKE-` name prefix.
 * The `notify-contact` and `notify-quote` Edge Functions check for
 * that prefix and skip sending notification emails for these rows,
 * so daily smoke runs don't pollute the owner inbox. The rows do
 * persist (they're recognizable and few; clean up via SQL if needed).
 *
 * Requires E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD env vars (set as GitHub
 * Actions secrets in CI). Skips cleanly when they're absent so local
 * `npm run e2e` doesn't fail for other devs.
 */

const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

const SMOKE_TAG = `E2E-SMOKE-${new Date().toISOString().slice(0, 10)}`;
const SMOKE_EMAIL = "e2e-smoke@example.com";
const SMOKE_PHONE = "+63 000 0000000";

// Brief, jittered pause to simulate a human reading the page between
// actions. Kept short so the whole smoke finishes in well under a minute.
const humanPause = (page: Page, minMs = 600, maxMs = 1200) =>
  page.waitForTimeout(minMs + Math.random() * (maxMs - minMs));

test("daily smoke: visitor browses, submits contact + quote, admin tours every tab", async ({
  page,
}) => {
  test.skip(
    !E2E_ADMIN_EMAIL || !E2E_ADMIN_PASSWORD,
    "Requires E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD env vars (provided by the daily-smoke workflow in CI).",
  );

  // --- Visitor flow ---

  // 1. Land on homepage and see the hero.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /grow your future/i }),
  ).toBeVisible();
  await humanPause(page);

  // 2. Scroll down to skim the in-page Products section, then the
  //    Contact section — no API calls here, but mirrors how a real
  //    visitor moves around before submitting a form.
  await page.evaluate(() => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  });
  await humanPause(page);
  await page.evaluate(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  });
  await humanPause(page, 1000, 1800);

  // 3. Fill and submit the Contact form. anon INSERT on `contacts`.
  //    The `E2E-SMOKE-` name prefix tells notify-contact to skip email.
  await page.getByLabel(/name/i).fill(`${SMOKE_TAG} Contact`);
  await page.getByLabel(/email/i).fill(SMOKE_EMAIL);
  await page
    .getByLabel(/phone/i)
    .fill(SMOKE_PHONE);
  await page.getByLabel(/message/i).fill("Daily smoke test — please ignore.");
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(
    page.getByText(/message sent/i).first(),
  ).toBeVisible({ timeout: 10000 });
  await humanPause(page, 1000, 1800);

  // 4. Jump to the full catalog. /products fetches active rows from
  //    `public.products` via anon-key — first real DB read of the run.
  await page.goto("/products");
  await expect(
    page.getByRole("heading", { name: /our.+products|product catalog/i }),
  ).toBeVisible({ timeout: 15000 });
  await humanPause(page, 1000, 1800);

  // 5. Open the Request Quote dialog on the first product card and
  //    submit a quote. anon INSERT on `quotes`. The `E2E-SMOKE-` name
  //    prefix tells notify-quote to skip email.
  await page
    .getByRole("button", { name: /request quote/i })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: /request quote/i }),
  ).toBeVisible({ timeout: 10000 });
  // The dialog reuses Name/Email/Phone labels from the contact form;
  // scope each fill to within the dialog to avoid matching the page
  // background's contact form (which uses the same labels).
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel(/name/i).fill(`${SMOKE_TAG} Quote`);
  await dialog.getByLabel(/email/i).fill(SMOKE_EMAIL);
  await dialog.getByLabel(/phone/i).fill(SMOKE_PHONE);
  await dialog.getByLabel(/quantity/i).fill("1 bag (smoke test)");
  await dialog
    .getByRole("button", { name: /submit quote request/i })
    .click();
  await expect(
    page.getByText(/quote request sent/i).first(),
  ).toBeVisible({ timeout: 10000 });
  await humanPause(page, 1000, 1800);

  // --- Admin flow ---

  // 6. Auth gate — unauthenticated /admin redirects to /admin/login.
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("heading", { name: /admin sign in/i }),
  ).toBeVisible();
  await humanPause(page);

  // 7. Sign in with the dedicated e2e user. Target inputs by type
  //    attribute — more reliable than getByLabel here, which can pick
  //    up the eye-icon toggle button's aria-label or fail to resolve
  //    the input when there are multiple elements near "password".
  await page.locator('input[type="email"]').fill(E2E_ADMIN_EMAIL!);
  await page.locator('input[type="password"]').fill(E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /^sign in$/i }).click();

  // 8. Dashboard mounts — proves auth succeeded and SPA hydrated.
  //    Products tab is the default and triggers a SELECT on `products`.
  await expect(page).toHaveURL(/\/admin(\?|$|\/)/);
  await expect(
    page.getByRole("heading", { name: /admin dashboard/i }),
  ).toBeVisible({ timeout: 15000 });
  await humanPause(page, 1000, 1800);

  // 9. Tour Quotes — SELECT on `quotes`. Should now include the row we
  //    just inserted in step 5. Assert no error banner.
  await page.getByRole("tab", { name: /^quotes$/i }).click();
  await expect(page.getByText(/failed to load quotes/i)).not.toBeVisible();
  await humanPause(page);

  // 10. Tour Contacts — SELECT on `contacts`. Should include the row
  //     from step 3. Assert no error banner.
  await page.getByRole("tab", { name: /^contacts$/i }).click();
  await expect(page.getByText(/failed to load contacts/i)).not.toBeVisible();
  await humanPause(page);

  // 11. Sign out — back at login.
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
});
