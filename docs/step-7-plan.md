# Step 7 — Analytics, error tracking, CI improvements

> Draft plan for review. Mirrors the `docs/seo-plan.md` convention — kept in-repo so future audits can see what shipped and why.

## Context

Step 7 from [TASKS.md](../TASKS.md) bundles four loosely-related observability and CI items:

1. Decide Vercel Analytics vs GA4; install
2. Sentry for error tracking + Vite source-map plugin
3. Sentry release tagging via Vercel build env (`VERCEL_GIT_COMMIT_SHA`)
4. Add `npm run lint` to PR CI (would have caught the 3 lint errors that slipped into PR #14)
5. Add `npm run e2e:headless` (Playwright) to PR CI (currently only runs locally)

PR #12 already shipped the base CI workflow (Vitest + build); this PR series extends it.

**The items aren't tightly coupled** — Sentry doesn't need Analytics, CI improvements don't need either. I'd suggest splitting into separate PRs for cleaner review, easier revert, and so each can ship independently.

## Recommended scope split

Three PRs in this order — easiest/lowest-risk first, biggest/most-config last:

### PR A — CI improvements (lint + Playwright in PR CI) 🟢 small

- Add `npm run lint` step to [.github/workflows/ci.yml](../.github/workflows/ci.yml) (~3 lines)
- Add a new Playwright job that installs chromium with `--with-deps`, runs `npm run e2e:headless` against localhost (Playwright auto-starts dev server via existing `webServer` config), uploads report artifact on failure (~25 lines)
- **Trade-off to accept:** every PR run will create one `contacts` row + one `quotes` row in the live Supabase from the existing form-submit specs (they use `cyrildave.legaspi+e2e@gmail.com`). Test pollution rate ≈ 2 rows × N PRs/week. Acceptable for now; can add a "filter out +e2e@" toggle in admin later if it gets noisy. Alternative is running only `admin-smoke.spec.ts` in PR CI, but that gives up the contact/quote regression coverage.

### PR B — Vercel Analytics 🟢 small

- `npm i @vercel/analytics`
- Add `<Analytics />` from `@vercel/analytics/react` inside the provider tree in [src/App.tsx](../src/App.tsx)
- That's it — Vercel auto-enables the project's Analytics dashboard once the package is detected on a deploy
- No env vars, no config, no consent banner needed (Vercel Analytics is cookie-less)

**Why Vercel Analytics over GA4 (my recommendation):**

| | Vercel Analytics | GA4 |
|---|---|---|
| Setup | `npm i` + 2 lines in App.tsx | gtag script in [index.html](../index.html), measurement ID, account setup |
| Privacy | Cookieless, GDPR-friendly, no consent banner | Cookies, needs consent banner for EU traffic |
| Free tier | 2,500 events/month (Hobby plan) — fine for early traffic | Unlimited |
| Features | Page views, top routes, referrers, country, device | Full funnels, audiences, custom events, attribution |
| Reality for GreenGrows | Right-sized for a low-traffic B2B marketing site; swap later if marketing needs grow | Overkill for current volume; setup overhead doesn't pay off yet |

GA4 is worth it if you ever need conversion tracking with paid ads, custom event funnels, or deep cohort analysis. Vercel Analytics covers the "how many people visited /products this week" question, which is the actual current need.

### PR C — Sentry error tracking 🟡 medium

This is the biggest of the three because Sentry needs an account + DSN + Vite plugin setup.

**Prereqs (manual, before PR can be merged usefully):**
- Sign up at sentry.io (free tier: 5k errors/month, 1 user)
- Create a new project (React/Vite preset)
- Get the **DSN** (a public URL like `https://abc123@o12345.ingest.sentry.io/678910`)
- Create a Sentry **auth token** with scope `project:releases` + `project:write` (for source-map uploads + release tagging)

**Code changes:**

1. `npm i @sentry/react @sentry/vite-plugin`
2. Update [src/main.tsx](../src/main.tsx) to init Sentry before render:
   ```ts
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     release: import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA,
     tracesSampleRate: 0.1,  // 10% of transactions (free-tier safe)
     replaysSessionSampleRate: 0,  // session replay disabled (paid feature)
   });
   ```
3. Update [vite.config.ts](../vite.config.ts) to add `@sentry/vite-plugin` for source-map upload at build time:
   ```ts
   import { sentryVitePlugin } from "@sentry/vite-plugin";

   plugins: [
     react(),
     mode === "development" && componentTagger(),
     sentryVitePlugin({
       org: "<your-sentry-org>",
       project: "<your-sentry-project>",
       authToken: process.env.SENTRY_AUTH_TOKEN,  // build-time only
       release: { name: process.env.VERCEL_GIT_COMMIT_SHA },
       sourcemaps: { assets: "./dist/**" },
       disable: !process.env.SENTRY_AUTH_TOKEN,  // skip in PRs without the token
     }),
   ],
   build: { sourcemap: true },
   ```
4. Update [src/vite-env.d.ts](../src/vite-env.d.ts) to type the new env vars

**Secrets to add (Vercel + GitHub):**
- **Vercel** project env vars (Production + Preview): `VITE_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- Optionally: `VITE_VERCEL_GIT_COMMIT_SHA` (Vercel exposes `VERCEL_GIT_COMMIT_SHA` automatically — we just re-expose it with the `VITE_` prefix so Vite includes it in the client bundle)
- **GitHub Actions** (if CI uploads source maps too): `SENTRY_AUTH_TOKEN`. For now, only Vercel does the build that uploads source maps — CI builds locally and discards the dist, so the auth token isn't needed there.

**Trade-off:** Sentry adds ~30 KB gzipped to the bundle (already 235 KB per the latest build). Not a deal-breaker but worth noting. If bundle size becomes a problem, Sentry can be lazy-loaded — separate concern.

## Files that get modified per PR

| File | PR A | PR B | PR C |
|---|---|---|---|
| `.github/workflows/ci.yml` | ✅ add lint + e2e steps | | |
| `src/App.tsx` | | ✅ add `<Analytics />` | |
| `src/main.tsx` | | | ✅ Sentry.init |
| `vite.config.ts` | | | ✅ sentryVitePlugin |
| `src/vite-env.d.ts` | | | ✅ type new env vars |
| `package.json` + lock | | ✅ +@vercel/analytics | ✅ +@sentry/react +@sentry/vite-plugin |

## Existing patterns to reuse

- [.github/workflows/daily-smoke.yml](../.github/workflows/daily-smoke.yml) is the template for the new Playwright step in `ci.yml` — same `npx playwright install --with-deps chromium` invocation, same artifact-upload-on-failure step.
- [playwright.config.ts](../playwright.config.ts) already handles "headless in CI, headed locally" via `headless: !!process.env.CI` — no changes needed there.

## Verification (per PR)

**PR A:** Trigger a PR with a deliberate lint error → CI should now fail. Trigger a PR that breaks an e2e test (e.g., remove a selector) → CI should fail with the report artifact attached.

**PR B:** Deploy to Vercel preview → open the page → after a minute, the project's Vercel Analytics dashboard should show the visit. No new globals on `window` (Analytics uses Beacon API, not gtag).

**PR C:** Build locally with the auth token → source maps uploaded to Sentry (visible in their dashboard). Throw a test error in dev → see it appear in Sentry within seconds with original-source stack trace. After a merge + Vercel deploy, the Sentry release should be tagged with the commit SHA.

## Out of scope (deferred)

- GA4 — see decision matrix above. Can be added later if Vercel Analytics proves insufficient.
- Sentry session replay — paid feature, not needed for current volume.
- Sentry user feedback widget — not needed.
- Hotjar / FullStory — heavyweight and not needed at this stage.
- Real User Monitoring (RUM) — Vercel includes basic Web Vitals in Analytics, sufficient for now.
- Custom Sentry tagging by route or user role — implement when you have a specific question to answer (premature optimization otherwise).

## Risk callouts

- **Sentry free tier ceiling**: 5k errors/month. If the app starts erroring in a loop, the quota could be exhausted in hours. `tracesSampleRate: 0.1` keeps performance-event volume manageable. Set up the email alert in Sentry settings so you know if you hit the limit.
- **Playwright CI runtime cost**: each PR run will be ~3-5 minutes longer due to chromium install + browser startup. Acceptable for a small repo.
- **e2e test pollution in Supabase**: see PR A trade-off above.

## Open question for you

**The analytics choice** — I've recommended Vercel Analytics. If you have any reason to prefer GA4 (e.g., specific marketing requirement, existing GA property to consolidate into), say so and I'll switch the plan for PR B. Otherwise I'll go with Vercel Analytics as the default.

**Scope** — I've recommended three PRs (A → B → C) for cleanest review. If you'd prefer one bundled PR, say so and I'll consolidate. The trade-off is that a bundled PR is harder to revert if any one piece misbehaves.
