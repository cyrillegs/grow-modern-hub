import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for GreenGrows E2E tests.
 *
 * Default behaviour locally: headed browser, 1 worker, dev server auto-started.
 * Run `npm run e2e:ui` for Playwright's interactive UI mode (recommended).
 *
 * Tests hit your real Supabase (via .env.local) — submissions create real DB
 * rows and trigger real emails. Use `cyrildave.legaspi+e2e@gmail.com` so they
 * land in your inbox but are filterable.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    headless: !!process.env.CI,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
