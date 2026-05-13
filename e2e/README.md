# E2E Tests

Playwright tests that drive a real browser through the contact and quote-request forms. Used to verify the full lead pipeline (form → Supabase → webhook → Edge Function → Resend → inbox) without manually filling forms every time.

## Run

| Command | Mode |
|---|---|
| `npm run e2e` | Headed Chromium, watch the browser do its thing. Default for local testing. |
| `npm run e2e:ui` | Playwright's interactive UI mode — see tests run side-by-side with a DOM inspector. Best for debugging. |
| `npm run e2e:headless` | Headless. Faster; use when you don't need to watch. |

Playwright auto-starts the dev server (`npm run dev` on port 8080), so you don't need a separate terminal. If the dev server is already running, Playwright reuses it.

## What the tests do

- **`contact-form.spec.ts`** — fills the homepage Contact form with test data, submits, asserts the success toast appears, asserts the form clears. Also a validation test that asserts inline error messages on empty submit.
- **`quote-form.spec.ts`** — opens the Request Quote dialog on `/products`, fills it, submits, asserts toast appears and the dialog closes. Plus a validation test.

## Real Supabase / real emails

These tests hit your **production Supabase** (the project pointed at by `.env.local`). Each successful run:
- Creates one real row in `contacts` or `quotes`.
- Triggers the deployed Edge Functions.
- Sends real emails through Resend.

All tests use the email `cyrildave.legaspi+e2e@gmail.com`. Gmail's `+e2e` sub-addressing routes those messages to your main inbox where you can filter or auto-archive them.

### Clean up the test rows occasionally

Run this in Supabase **SQL Editor** when test rows pile up:

```sql
DELETE FROM public.contacts WHERE email = 'cyrildave.legaspi+e2e@gmail.com';
DELETE FROM public.quotes   WHERE email = 'cyrildave.legaspi+e2e@gmail.com';
```

Or apply a Gmail filter to archive emails to/from that address automatically.

## Troubleshooting

- **`webServer timed out`** — port 8080 is busy from something else, or `npm run dev` is failing. Run `npm run dev` manually first to confirm it works, then re-run tests.
- **Selectors not found** — UI changed since the test was written. The `npm run e2e:ui` mode is the fastest way to debug; it shows what Playwright sees at each step.
- **Toast assertion times out** — Supabase or Resend is slow today, or the form submission is failing silently. Check browser DevTools console / network tab during a headed run.
