import { test, expect } from "@playwright/test";

const TEST_EMAIL = "cyrildave.legaspi+e2e@gmail.com";

test("quote request form submits and shows success toast", async ({ page }) => {
  await page.goto("/products");

  // Click the first product's Request Quote button
  await page.getByRole("button", { name: /request quote/i }).first().click();

  // Dialog opens
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: /request quote/i })).toBeVisible();

  const timestamp = new Date().toISOString();

  // Fill scoped to the dialog (avoids matching contact-form labels on other pages)
  await dialog.getByLabel(/^name/i).fill("E2E Test (Quote)");
  await dialog.getByLabel(/^email/i).fill(TEST_EMAIL);
  await dialog.getByLabel(/^phone/i).fill("+63 999 000 0000");
  await dialog.getByLabel(/estimated quantity/i).fill("100 bags (e2e test)");
  await dialog.getByLabel(/additional details/i).fill(`E2E test submission at ${timestamp}`);

  // Submit
  await dialog.getByRole("button", { name: /submit quote request/i }).click();

  // Success toast and dialog closes
  await expect(page.getByText(/quote request sent!/i)).toBeVisible({ timeout: 10000 });
  await expect(dialog).not.toBeVisible({ timeout: 5000 });
});

test("quote dialog shows validation errors on empty submit", async ({ page }) => {
  await page.goto("/products");

  await page.getByRole("button", { name: /request quote/i }).first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: /submit quote request/i }).click();

  await expect(dialog.getByText(/name is required/i)).toBeVisible();
  await expect(dialog.getByText(/please enter a valid email/i)).toBeVisible();
  await expect(dialog.getByText(/phone is required/i)).toBeVisible();
  await expect(dialog.getByText(/estimated quantity is required/i)).toBeVisible();
});
