# GreenGrows — Progress Task Tracker

Audit snapshot from 2026-05-10. Check items off as they ship.

---

## Chosen Stack

| Concern | Tool | Notes |
|---|---|---|
| Hosting | **Vercel** | Free tier; Vite preset; env vars in dashboard; preview deploys per branch |
| Database, auth, storage | **Supabase** | Free tier; Postgres + Auth + Edge Functions |
| Transactional email | **Resend** | Free tier 3k/mo, 100/day; needs SPF/DKIM on domain |
| Forms & validation | **React Hook Form + Zod** | Pairs with existing shadcn `<Form>` primitive |
| Server state | **TanStack Query** *(already installed)* | Used in AdminQuotes for quotes table |
| SEO meta | **react-helmet-async** | Per-route titles, descriptions, OG tags |
| Analytics | **Vercel Analytics** *(or GA4)* | Vercel Analytics is one toggle; decide before step 7 |
| Error tracking | **Sentry Free** | 5k errors/mo, Vite source-map plugin |
| Testing | **Vitest + React Testing Library** | Set up; Playwright deferred until later |

---

## Build Order — Remaining

### Step 4b — Customer "Request a Quote" form (P1) ← **NEXT**

- [ ] Add **Request Quote** button on each product card in [src/pages/Products.tsx](src/pages/Products.tsx).
- [ ] Open shadcn Dialog with a form (name, email, phone, quantity, message — product pre-filled).
- [ ] Submit → `supabase.from("quotes").insert(...)` with toast success/error.
- [ ] Tests alongside the feature (validation, successful submit, error path).

### Step 5 — Email notifications (P1)

- [ ] Set up Resend account; verify sending domain (SPF + DKIM DNS records).
- [ ] Write a Supabase Edge Function `notify-quote` that calls Resend on `quotes` insert.
  - Owner email → mustardseedlabsph@gmail.com.
  - Customer confirmation email → submitted address.
- [ ] Trigger via Database Webhook (Supabase → Edge Function on row insert).
- [ ] Replace placeholder contact info in [src/components/Contact.tsx](src/components/Contact.tsx) with real GreenGrows details.

### Step 6 — SEO (P2)

- [ ] `npm i react-helmet-async`; wrap `App` in `<HelmetProvider>` and add `<Helmet>` blocks on each page.
- [ ] Replace placeholder OG image in [index.html:25](index.html#L25) and [index.html:31](index.html#L31) (still points at `lovable.dev`).
- [ ] Add `public/robots.txt` and `public/sitemap.xml`.
- [ ] Add Organization + Product JSON-LD on `/` and `/products`.

### Step 7 — Analytics, error tracking, CI (P2)

- [ ] Decide Vercel Analytics vs GA4. Vercel Analytics is one toggle in the dashboard + `@vercel/analytics` package; GA4 needs a tag in [index.html](index.html).
- [ ] `npm i @sentry/react`; init in [src/main.tsx](src/main.tsx); add Vite source-map plugin.
- [ ] Configure Sentry release tagging via Vercel build env (`VERCEL_GIT_COMMIT_SHA`).
- [ ] Add a GitHub Actions workflow that runs `npm run test:run` on every PR — bundled with Playwright when E2E tests are added.

### Step 8 — Quality / cleanup (P3)

- [ ] Delete stale [src/components/Navbar-backup.tsx](src/components/Navbar-backup.tsx).
- [ ] Delete `.github/workflows/deploy.yml.txt` once Vercel deploys are stable (or move out of repo).
- [ ] Update [CLAUDE.md](CLAUDE.md) deployment section — still describes the VPS flow which is no longer in use.
- [ ] Delete the Supabase keepalive workflow + `keepalive` table once the site has consistent real traffic (≥1 form submission/week for a month).
- [ ] Backfill tests: AdminLogin sign-in flow, AdminQuotes filter/search, AdminQuotes mutations.
- [ ] Decide whether to tighten [tsconfig.json](tsconfig.json) (`strictNullChecks`, `noImplicitAny`) — progressive opt-in by file is fine.
- [ ] Image optimization audit (lazy-loading, sizing, modern formats).
- [ ] (Optional) Add Playwright for end-to-end tests + bundle CI workflow with it.

---

## Done

### 2026-05-11 — Step 4a: AdminQuotes wired to Supabase (PR #5)
- [x] Replaced `mockQuotes` with `useQuery` against `supabase.from("quotes")`, ordered by `created_at` desc.
- [x] Status updates and delete became `useMutation` with cache invalidation + destructive toast on error.
- [x] Loading skeleton, error banner, empty-list state distinguishing "no rows" vs "no matches".
- [x] Tightened types using `Database["public"]["Tables"]["quotes"]["Row"]` and `QuoteStatus` union.
- [x] Made stats cards clickable as filter chips (Total / Pending / Processed / Cancelled).

### 2026-05-11 — Test infrastructure (PR #6)
- [x] Installed Vitest, React Testing Library, jest-dom, user-event, jsdom as dev deps.
- [x] Configured [vite.config.ts](vite.config.ts) `test` block (globals, jsdom env, setup file).
- [x] [src/test/setup.ts](src/test/setup.ts) — jest-dom matchers, auto-cleanup, IntersectionObserver stub.
- [x] First test suite at [src/components/Contact.test.tsx](src/components/Contact.test.tsx) — 4 tests covering render, validation, successful submit, error path.
- [x] `npm test` (watch) + `npm run test:run` (single pass) scripts.

### 2026-05-11 — Step 1: Foundation (Supabase + Vercel + Keepalive)
- [x] Created Supabase project; populated `.env.local` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [x] Applied [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) — `contacts` + `quotes` tables with RLS (anon `INSERT`-only, authenticated full access).
- [x] Installed `@supabase/supabase-js`.
- [x] Scaffolded [src/lib/supabase.ts](src/lib/supabase.ts), [src/types/database.ts](src/types/database.ts), typed `import.meta.env` in [src/vite-env.d.ts](src/vite-env.d.ts).
- [x] Migrated hosting from VPS to Vercel; old workflow disabled (`.github/workflows/deploy.yml.txt`).
- [x] [vercel.json](vercel.json) SPA rewrite so `/products`, `/admin` don't 404 on refresh.
- [x] Imported repo into Vercel; env vars set across Production / Preview / Development.
- [x] Applied [supabase/migrations/0002_keepalive.sql](supabase/migrations/0002_keepalive.sql) + [.github/workflows/supabase-keepalive.yml](.github/workflows/supabase-keepalive.yml) cron.

### 2026-05-11 — Step 2: Contact form wired to Supabase (PR #1)
- [x] Replaced toast-only handler in [src/components/Contact.tsx](src/components/Contact.tsx) with Supabase `INSERT` into `contacts`.
- [x] React Hook Form + Zod typed validation, proper `<Label>` pairs (a11y fix).
- [x] Loading state ("Sending…"), destructive toast on error, success toast + form reset.

### 2026-05-11 — WhatsApp UX shift (PR #2 → PR #3)
- [x] Response-time subtitle on contact form (PR #2).
- [x] Floating WhatsApp FAB (Tawk.to-style) bottom-right, hidden on `/admin*` (PR #3).
- [x] Removed redundant form-bottom WhatsApp button (PR #3); shared module at [src/components/whatsapp.tsx](src/components/whatsapp.tsx).

### 2026-05-11 — Step 3: Admin auth (PR #4)
- [x] **Fixed route ordering bug** — catch-all `*` was above `/admin` and made it resolve to `NotFound`.
- [x] [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) + [src/components/RequireAuth.tsx](src/components/RequireAuth.tsx) + [src/pages/AdminLogin.tsx](src/pages/AdminLogin.tsx).
- [x] Sign-out button in AdminQuotes header.
- [x] Show/hide password toggle on login.
- [x] Disabled red FormLabel on validation error project-wide ([src/components/ui/form.tsx](src/components/ui/form.tsx)).
- [x] Disabled public sign-ups in Supabase Auth dashboard; manually created owner account.
