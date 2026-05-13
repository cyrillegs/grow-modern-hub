import { test, expect } from "@playwright/test";

const TEST_EMAIL = "cyrildave.legaspi+e2e@gmail.com";

test("contact form submits and shows success toast", async ({ page }) => {
  await page.goto("/");

  // Scroll to the contact section
  const contactHeading = page.getByRole("heading", { name: /get in touch/i });
  await contactHeading.scrollIntoViewIfNeeded();
  await expect(contactHeading).toBeVisible();

  const timestamp = new Date().toISOString();
  const messageBody = `E2E test submission at ${timestamp}`;

  // Fill the form
  await page.getByLabel(/^name/i).fill("E2E Test (Contact)");
  await page.getByLabel(/^email/i).fill(TEST_EMAIL);
  await page.getByLabel(/^phone/i).fill("+63 999 000 0000");
  await page.getByLabel(/^message/i).fill(messageBody);

  // Submit
  await page.getByRole("button", { name: /^send message$/i }).click();

  // Verify the success toast appears.
  // Use exact match — shadcn/Radix also renders a screen-reader-only
  // aria-live announcement that contains the same text concatenated with
  // other content, which would otherwise trip Playwright's strict mode.
  await expect(page.getByText("Message sent!", { exact: true })).toBeVisible({ timeout: 10000 });

  // Form should clear after success
  await expect(page.getByLabel(/^name/i)).toHaveValue("");
  await expect(page.getByLabel(/^email/i)).toHaveValue("");
});

test("contact form shows validation errors on empty submit", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("heading", { name: /get in touch/i }).scrollIntoViewIfNeeded();

  await page.getByRole("button", { name: /^send message$/i }).click();

  await expect(page.getByText(/name is required/i)).toBeVisible();
  await expect(page.getByText(/please enter a valid email/i)).toBeVisible();
  await expect(page.getByText(/message is required/i)).toBeVisible();
});
