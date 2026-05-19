# GreenGrows — Progress Task Tracker

Audit snapshot from 2026-05-10. Check items off as they ship.

---

## Chosen Stack

| Concern | Tool | Notes |
|---|---|---|
| Hosting | **Vercel** | Free tier; Vite preset; env vars in dashboard; preview deploys per branch |
| Database, auth, storage | **Supabase** | Free tier; Postgres + Auth + Edge Functions |
| Transactional email | **Resend** | Free tier 3k/mo, 100/day; needs SPF/DKIM on domain |
| Forms & validation | **React Hook Form + Zod** | Pairs with shadcn `<Form>` primitive |
| Server state | **TanStack Query** | Used in AdminQuotes for quotes table |
| SEO meta | **react-helmet-async** | Per-route titles, descriptions, OG tags |
| Analytics | **Vercel Analytics** *(or GA4)* | Decide before Step 7 |
| Error tracking | **Sentry Free** | 5k errors/mo, Vite source-map plugin |
| Testing | **Vitest + React Testing Library** | Set up; Playwright deferred |

---

## Build Order — Remaining

### Step 5d — Misc follow-ups (P2) ← **NEXT**

- [ ] Replace placeholder contact info in [src/components/Contact.tsx](src/components/Contact.tsx) (still `info@fertilizers.com`, `+1 (555) ...`, `123 Agriculture Ave`).
- [ ] **Finish Resend domain verification.** Subdomain chosen: `mail.greengrows.cdlegaspi.site`. DNS records pending — add SPF + DKIM + MX (bounce) at the registrar for `cdlegaspi.site`, click Verify in Resend, then set Supabase secret `FROM_ADDRESS="GreenGrows <hello@mail.greengrows.cdlegaspi.site>"`. Until this is done, replies via `send-reply` only work to `cyrildave.legaspi@gmail.com` (Resend onboarding restriction).
- [ ] **Apply migration `0004_drop_keepalive.sql`** in the Supabase SQL editor (or via CLI). PR #18 added the migration but it's still pending on the live database.

### Step 7 — Analytics, error tracking, CI (P2)

- [ ] Decide Vercel Analytics vs GA4. Vercel is one toggle + `@vercel/analytics`; GA4 needs a tag in [index.html](index.html).
- [ ] `npm i @sentry/react`; init in [src/main.tsx](src/main.tsx); add Vite source-map plugin.
- [ ] Configure Sentry release tagging via Vercel build env (`VERCEL_GIT_COMMIT_SHA`).
- [x] ~~Add a GitHub Actions workflow that runs `npm run test:run` on every PR.~~ Shipped in PR #12 ([ci.yml](.github/workflows/ci.yml)) — `npm ci` + Vitest + production build.
- [ ] **Add `npm run lint` to the existing CI workflow** — would have caught the 3 lint errors that slipped into PR #14. ~3 lines of YAML.
- [ ] **Add `npm run e2e:headless` (Playwright) to CI** — install browsers + headless. Currently e2e suite only runs locally. ~15 lines of YAML.

### Step 8 — Quality / cleanup (P3)

- [ ] Delete stale [src/components/Navbar-backup.tsx](src/components/Navbar-backup.tsx).
- [ ] Delete `.github/workflows/deploy.yml.txt` once Vercel deploys are stable (or move out of repo).
- [ ] Update [CLAUDE.md](CLAUDE.md) deployment section — still describes the VPS flow which is no longer in use.
- [ ] Backfill tests: `AdminLogin` sign-in flow, `AdminQuotes` filter/search + mutations.
- [ ] Check whether the homepage `Products` *component* (used on `/`, distinct from `/products` page) still has a fake Buy Now or quote flow — clean up consistently if so.
- [ ] Decide whether to tighten [tsconfig.json](tsconfig.json) (`strictNullChecks`, `noImplicitAny`) — progressive opt-in by file is fine.
- [ ] Image optimization audit (lazy-loading, sizing, modern formats).

### Future (not scheduled)

- [ ] **Real ordering flow** — when GreenGrows has set pricing, delivery zones, payment integration (PayMongo/GCash/Stripe), BIR-compliant invoicing, and order fulfillment, design a proper checkout. Build fresh, not by reviving the removed Buy Now placeholder.

---

## Done

### 2026-05-19 — Step 5c (cleanup): drop keepalive workflow + table (PR #18)
- [x] Deleted [.github/workflows/supabase-keepalive.yml](.github/workflows/supabase-keepalive.yml) (the Mon/Wed/Fri curl-against-keepalive cron).
- [x] New migration [0004_drop_keepalive.sql](supabase/migrations/0004_drop_keepalive.sql) — `drop table if exists public.keepalive;` (cascades to RLS policy).
- [x] No app code dependencies on the table — confirmed via grep before deletion.
- [ ] **Post-merge deploy step still pending:** apply 0004_drop_keepalive.sql in Supabase SQL editor to actually drop the live table (tracked in Step 5d).
- [x] Closes the Step 5c two-PR cutover. Daily smoke (PR #15/16) is now the sole keepalive mechanism.

### 2026-05-19 — Step 6: SEO foundation (PR #17)
- [x] Brand reconciliation: "GreenGrow" → "GreenGrows" across [index.html](index.html), meta tags, and OG copy.
- [x] [react-helmet-async](https://www.npmjs.com/package/react-helmet-async) added as a runtime dep; [HelmetProvider](src/App.tsx) wraps the entire provider tree.
- [x] [src/lib/seo.ts](src/lib/seo.ts) — brand + URL constants (SITE_URL, BRAND_NAME, default title/description/og-image, WhatsApp helpers, buildCanonical, buildAbsoluteUrl).
- [x] [src/components/seo/PageMeta.tsx](src/components/seo/PageMeta.tsx) — reusable Helmet wrapper. Emits title, meta description, canonical, og:* and twitter:* tags. Supports noindex + children slot for JSON-LD.
- [x] [src/pages/Index.tsx](src/pages/Index.tsx) — PageMeta with defaults + Organization JSON-LD (name, url, logo, email, phone, areaServed=PH, sameAs WhatsApp).
- [x] [src/pages/Products.tsx](src/pages/Products.tsx) — custom title/description + dynamic ItemList JSON-LD over fetched products (no `offers` field since pricing is B2B-indicative).
- [x] Admin + 404 routes — `<PageMeta noindex />` on [AdminLogin](src/pages/AdminLogin.tsx), [AdminDashboard](src/pages/AdminDashboard.tsx), [NotFound](src/pages/NotFound.tsx).
- [x] Replaced lovable.dev placeholder OG image with [public/og-image.jpg](public/og-image.jpg) (copy of hero-agriculture.jpg, swappable later).
- [x] New [public/sitemap.xml](public/sitemap.xml) — / + /products, /admin* excluded.
- [x] [public/robots.txt](public/robots.txt) — added Disallow: /admin + Sitemap directive.
- [x] [docs/seo-plan.md](docs/seo-plan.md) — implementation plan kept in-repo for reference.

### 2026-05-17 — Step 5c part 1: Daily Playwright smoke workflow (PR #15)
- [x] [e2e/admin-smoke.spec.ts](e2e/admin-smoke.spec.ts) — single spec: homepage uptime, `/admin` redirect-to-login gate, sign-in with `E2E_ADMIN_*` env vars, dashboard mount, Quotes tab SELECT (= keepalive activity), sign-out.
- [x] [.github/workflows/daily-smoke.yml](.github/workflows/daily-smoke.yml) — cron `0 0 * * *` + `workflow_dispatch`. Installs chromium with `--with-deps`, hits `https://grow-modern-hub.vercel.app` via `PLAYWRIGHT_BASE_URL`, uploads Playwright HTML report on failure (7 day retention).
- [x] [playwright.config.ts](playwright.config.ts) — `webServer` now conditional on `PLAYWRIGHT_BASE_URL`. Local `npm run e2e` unchanged; CI smoke run skips the local dev server.
- [x] Dedicated Supabase `e2e@…` user + `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` GitHub Actions secrets (manual, one-time setup).
- [ ] **Still pending:** cron fire green at least once on schedule (see Step 5c for cleanup PR).

### 2026-05-17 — Products catalog: admin CRUD + DB-backed public pages (PR #14)
- [x] Migration 0002_products_catalog.sql: new `public.products` table (15 columns including `image_key` / `icon_key` CHECK-constrained enums, `sort_order`, `is_featured`, `is_active`), RLS (anon reads active only; authenticated admin full access), seeded with the 9 original products.
- [x] [src/lib/products.ts](src/lib/products.ts) — `fetchAdminProducts`, `fetchPublicProducts` (with hardcoded fallback so the public site degrades gracefully if the migration hasn't been applied), `getFeaturedProducts`, slug/icon/image helpers.
- [x] [src/components/admin/ProductsPanel.tsx](src/components/admin/ProductsPanel.tsx) — full CRUD UI: RHF + Zod, search, stats cards as filter chips, slug auto-suggest on name blur, feature/hide/delete via dropdown. Editor dialog handles add + edit.
- [x] [src/pages/AdminDashboard.tsx](src/pages/AdminDashboard.tsx) — Products tab added as default/leftmost.
- [x] [src/components/Products.tsx](src/components/Products.tsx) (homepage teaser) + [src/pages/Products.tsx](src/pages/Products.tsx) (full catalog) — both now read from Supabase with loading skeletons + empty states.
- [x] [src/test/setup.ts](src/test/setup.ts) — added ResizeObserver stub for shadcn `<Select>` mount under jsdom.
- [x] [src/components/admin/ProductsPanel.test.tsx](src/components/admin/ProductsPanel.test.tsx) — 3 tests (render+stats, filter via stats card, submit new product).
- [x] 3 lint errors fixed (empty interfaces → type aliases in command.tsx/textarea.tsx; `require()` → ES import in tailwind.config.ts).
- [x] `supabase/.temp/` added to .gitignore.
- [x] `package-lock.json` regenerated on Node 24 (resolved CI `npm ci` failure; vulnerability count 15 → 2).
- [x] **Deploy notes (post-merge):** apply 0002_products_catalog.sql + 0003_admin_replies.sql in Supabase SQL Editor; `supabase functions deploy send-reply`.

### 2026-05-13 — In-app Reply modal + admin_replies log (PR #13)
- [x] Migration 0003_admin_replies.sql: new table logging every outgoing admin reply with `(source_table, source_id)` pointer back to the quote/contact. RLS authenticated-only.
- [x] Edge Function [send-reply](supabase/functions/send-reply/index.ts) — browser-invoked. Verifies caller is a signed-in admin (not just anon-key holder), sends via Resend with `reply_to = OWNER_EMAIL`, logs to admin_replies. CORS configured.
- [x] [ReplyDialog.tsx](src/components/admin/ReplyDialog.tsx) — shadcn Dialog + RHF + Zod, pre-filled greeting, Send calls `supabase.functions.invoke("send-reply")`.
- [x] [AdminRepliesList.tsx](src/components/admin/AdminRepliesList.tsx) — per-row collapsible history shown in the View dialog of both panels.
- [x] QuotesPanel + ContactsPanel — replaced prior Reply affordance with ReplyDialog trigger; auto-marks row as `replied` (contacts) / `processed` (quotes) on first send.
- [x] 5 tests on ReplyDialog (open + pre-fill, validation, send success, send error, partial-success warning).
- [x] Obsoleted PR #11 (Gmail-link Reply) which was closed without merging.

### 2026-05-13 — Step 7 (partial): CI workflow for PRs (PR #12)
- [x] [.github/workflows/ci.yml](.github/workflows/ci.yml) — runs on PR-to-main and push-to-main.
- [x] Node 20 + npm cache → `npm ci` → `npm run test:run` (Vitest) → `npm run build` with Supabase secrets injected.
- [x] Surfaces as the "Unit tests + production build" check on every PR.
- [ ] Still missing in CI: `npm run lint` + `npm run e2e:headless` (see Step 7 remaining).

### 2026-05-13 — Step 5b: Contacts tab on /admin (PR #10)
- [x] Renamed [src/pages/AdminQuotes.tsx](src/pages/AdminQuotes.tsx) → `AdminDashboard.tsx` with shadcn `<Tabs>` — Quotes (existing) | Contacts (new).
- [x] Tab state persisted in URL search param (`?tab=contacts`) so bookmarks survive refresh.
- [x] New `ContactsPanel.tsx` mirroring QuotesPanel patterns: `useQuery` against `contacts`, status updates (new/replied/archived) + delete via `useMutation`, stats cards as filter chips, search.
- [x] Tests alongside (Vitest + RTL).

### 2026-05-13 — Step 5: Resend email notifications (PR #8)
- [x] Supabase Edge Functions `notify-quote` and `notify-contact` deployed and triggered by Database Webhooks on row INSERT.
- [x] Resend account + API key configured as Supabase secret.
- [x] FROM_ADDRESS uses Resend's `onboarding@resend.dev` for now (no domain DNS required).
- [x] Owner notification (reply-to = customer) + customer confirmation for quotes; owner-only for contacts.
- [x] Polished email templates with branded green header strip, info-table layout, message-quote block, centered CTA button, WhatsApp footer.

### 2026-05-13 — Playwright E2E tests (PR #9, ahead of schedule)
- [x] @playwright/test installed + chromium browser.
- [x] [playwright.config.ts](playwright.config.ts) with auto dev-server, single Chromium worker, headed locally / headless in CI.
- [x] 4 tests across [e2e/contact-form.spec.ts](e2e/contact-form.spec.ts) and [e2e/quote-form.spec.ts](e2e/quote-form.spec.ts) — submit + validation paths.
- [x] npm scripts: `e2e`, `e2e:ui`, `e2e:headless`. README at [e2e/README.md](e2e/README.md).

### 2026-05-11 — Step 4b: Customer Request Quote form + Buy Now removal (PR #7)
- [x] New [src/components/RequestQuoteDialog.tsx](src/components/RequestQuoteDialog.tsx) — self-contained Dialog + RHF + Zod, takes `product` + `trigger` as props.
- [x] Tests at [src/components/RequestQuoteDialog.test.tsx](src/components/RequestQuoteDialog.test.tsx) — open, validation, success, error path.
- [x] Each product card on `/products` now submits real quotes via `supabase.from("quotes").insert(...)` — visible immediately in `/admin`.
- [x] **Removed Buy Now** — was a placeholder showing fake "Order Placed!" toast; B2B fertilizer sales don't fit Amazon-style checkout. Dropped ~110 lines of dialog + handler + state.
- [x] Indicative-price subtitle on each product card ("final pricing depends on quantity & delivery").
- [x] Net Products.tsx: −240 lines.

### 2026-05-11 — Docs: docs/agents.md
- [x] Reference doc on Claude Code subagents — categories, typical large-project workflow, custom agent config, signals for when to add them to this project (none needed yet). Committed direct to main.

### 2026-05-11 — Step 4a: AdminQuotes wired to Supabase (PR #5)
- [x] Replaced `mockQuotes` with `useQuery` against `supabase.from("quotes")`, ordered by `created_at` desc.
- [x] Status updates and delete via `useMutation` with cache invalidation + destructive toast on error.
- [x] Loading skeleton, error banner, empty-list distinguishes "no rows" vs "no matches".
- [x] Stats cards now act as clickable filter chips (Total / Pending / Processed / Cancelled).
- [x] Tightened types using `Database["public"]["Tables"]["quotes"]["Row"]` and `QuoteStatus` union.

### 2026-05-11 — Test infrastructure (PR #6)
- [x] Installed Vitest, React Testing Library, jest-dom, user-event, jsdom.
- [x] Configured [vite.config.ts](vite.config.ts) `test` block (globals, jsdom env, setup file).
- [x] [src/test/setup.ts](src/test/setup.ts) — jest-dom matchers, auto-cleanup, IntersectionObserver stub.
- [x] First test suite at [src/components/Contact.test.tsx](src/components/Contact.test.tsx) — 4 tests.
- [x] `npm test` (watch) + `npm run test:run` (single pass) scripts.

### 2026-05-11 — Step 1: Foundation (Supabase + Vercel + Keepalive)
- [x] Created Supabase project; `.env.local` populated; migrations applied; RLS enabled.
- [x] Scaffolded [src/lib/supabase.ts](src/lib/supabase.ts), [src/types/database.ts](src/types/database.ts), typed `import.meta.env`.
- [x] Migrated hosting from VPS to Vercel; old workflow disabled (`.github/workflows/deploy.yml.txt`).
- [x] [vercel.json](vercel.json) SPA rewrite; env vars set across Production / Preview / Development.
- [x] Keepalive cron (Mon/Wed/Fri 00:00 UTC) prevents free-tier auto-pause.

### 2026-05-11 — Step 2: Contact form wired to Supabase (PR #1)
- [x] Replaced toast-only handler with Supabase `INSERT` into `contacts`.
- [x] RHF + Zod typed validation, proper `<Label>` pairs (a11y fix).
- [x] Loading state, destructive toast on error, success toast + form reset.

### 2026-05-11 — WhatsApp UX shift (PR #2 → PR #3)
- [x] Response-time subtitle on contact form (PR #2).
- [x] Floating WhatsApp FAB (Tawk.to-style) bottom-right, hidden on `/admin*` (PR #3).
- [x] Removed redundant form-bottom WhatsApp button; shared module at [src/components/whatsapp.tsx](src/components/whatsapp.tsx).

### 2026-05-11 — Step 3: Admin auth (PR #4)
- [x] **Fixed route ordering bug** — catch-all `*` was above `/admin` and made it resolve to `NotFound`.
- [x] [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) + [src/components/RequireAuth.tsx](src/components/RequireAuth.tsx) + [src/pages/AdminLogin.tsx](src/pages/AdminLogin.tsx).
- [x] Sign-out button in AdminQuotes header.
- [x] Show/hide password toggle on login.
- [x] Disabled red FormLabel on validation error project-wide.
- [x] Disabled public sign-ups in Supabase Auth dashboard; manually created owner account.
