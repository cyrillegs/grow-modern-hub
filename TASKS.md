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
| Server state | **TanStack Query** *(already installed)* | Reuse for Supabase queries |
| SEO meta | **react-helmet-async** | Per-route titles, descriptions, OG tags |
| Analytics | **Vercel Analytics** *(or GA4)* | Vercel Analytics is one click; decide before step 7 |
| Error tracking | **Sentry Free** | 5k errors/mo, Vite source-map plugin |
| Testing | **Vitest + React Testing Library** | Defer Playwright |

---

## Build Order

### Step 1 — Foundation: Supabase + Vercel (P0)

**Supabase**
- [x] Scaffold `supabase/migrations/0001_init.sql`, [src/lib/supabase.ts](src/lib/supabase.ts), [src/types/database.ts](src/types/database.ts), [.env.example](.env.example), typed `import.meta.env` in [src/vite-env.d.ts](src/vite-env.d.ts).
- [ ] Create Supabase project; populate `.env.local` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Apply [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) via Supabase SQL Editor. Verify RLS is enabled on both tables.
- [ ] `npm install @supabase/supabase-js`.

**Hosting (Vercel)**
- [x] Scaffold [vercel.json](vercel.json) with SPA rewrite (so `/products`, `/admin` don't 404 on refresh).
- [x] Old VPS workflow disabled (renamed to `.github/workflows/deploy.yml.txt`).
- [ ] Import the repo into Vercel; framework preset = Vite.
- [ ] Add Vercel env vars (Production / Preview / Development): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Verify first deploy is green; test that refreshing `/products` works.
- [ ] Point custom GreenGrows domain at Vercel (when ready).

**Keepalive (prevent Supabase free-tier auto-pause after 7 days idle)**
- [x] Scaffold [supabase/migrations/0002_keepalive.sql](supabase/migrations/0002_keepalive.sql) + [.github/workflows/supabase-keepalive.yml](.github/workflows/supabase-keepalive.yml) (Mon/Wed/Fri at 00:00 UTC).
- [ ] Apply [0002_keepalive.sql](supabase/migrations/0002_keepalive.sql) via SQL Editor.
- [ ] Add GitHub repo secrets: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`.
- [ ] Manually trigger the Keepalive workflow once to verify it succeeds.

### Step 2 — Wire the contact form (P0)

- [ ] Replace the toast-only handler in [src/components/Contact.tsx:19-26](src/components/Contact.tsx#L19-L26) with a Supabase `INSERT` into `contacts`.
- [ ] Add **React Hook Form + Zod**: `npm i react-hook-form zod @hookform/resolvers`. Refactor form to use shadcn's `<Form>` primitive at [src/components/ui/form.tsx](src/components/ui/form.tsx).
- [ ] Add proper `<Label>` pairs (currently uses `placeholder`-only — accessibility gap).
- [ ] Loading + error states on submit.

### Step 3 — Auth on `/admin` (P0)

- [ ] **Fix route ordering** — move `/admin` above the catch-all `*` in [src/App.tsx:23-24](src/App.tsx#L23-L24). Right now `/admin` resolves to `NotFound`.
- [ ] Add a Supabase Auth login screen (email + password).
- [ ] Wrap `/admin` in a `<RequireAuth>` route guard that redirects unauthenticated users.
- [ ] Manually create the owner account in the Supabase dashboard (no public signup).

### Step 4 — Real quote pipeline (P1)

- [ ] Replace `mockQuotes` in [src/pages/AdminQuotes.tsx:43](src/pages/AdminQuotes.tsx#L43) with a TanStack Query `useQuery` calling Supabase.
- [ ] Wire status updates / notes / delete actions to Supabase mutations.
- [ ] Add a "Request a Quote" form on `/products` (or wherever the lead funnel lives) that `INSERT`s into `quotes`.

### Step 5 — Email notifications (P1)

- [ ] Set up Resend account; verify your sending domain (SPF + DKIM DNS records).
- [ ] Write a Supabase Edge Function `notify-quote` that calls Resend on `quotes` insert.
  - Owner email → mustardseedlabsph@gmail.com.
  - Customer confirmation email → submitted address.
- [ ] Trigger via Database Webhook (Supabase → Edge Function on row insert).
- [ ] Replace placeholder contact info in [src/components/Contact.tsx:111-134](src/components/Contact.tsx#L111-L134) with real GreenGrows details.

### Step 6 — SEO (P2)

- [ ] `npm i react-helmet-async`; wrap `App` in `<HelmetProvider>` and add `<Helmet>` blocks on each page.
- [ ] Replace placeholder OG image in [index.html:25](index.html#L25) and [index.html:31](index.html#L31) (still points at `lovable.dev`).
- [ ] Add `public/robots.txt` and `public/sitemap.xml`.
- [ ] Add Organization + Product JSON-LD on `/` and `/products`.

### Step 7 — Analytics & error tracking (P2)

- [ ] Decide Vercel Analytics vs GA4. Vercel Analytics is one toggle in the dashboard + `@vercel/analytics` package; GA4 needs a tag in [index.html](index.html).
- [ ] `npm i @sentry/react`; init in [src/main.tsx](src/main.tsx); add Vite source-map plugin.
- [ ] Configure Sentry release tagging via Vercel build env (`VERCEL_GIT_COMMIT_SHA`).

### Step 8 — Quality / cleanup (P3)

- [ ] Delete stale [src/components/Navbar-backup.tsx](src/components/Navbar-backup.tsx).
- [ ] Delete `.github/workflows/deploy.yml.txt` once Vercel deploys are stable (or move out of repo).
- [ ] Update [CLAUDE.md](CLAUDE.md) deployment section — currently describes the VPS flow which is no longer in use.
- [ ] Add Vitest + RTL: `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`. Cover the contact form submission and admin filtering.
- [ ] Decide whether to tighten [tsconfig.json](tsconfig.json) (`strictNullChecks`, `noImplicitAny`) — progressive opt-in by file is fine.
- [ ] Image optimization audit (lazy-loading, sizing, modern formats).

---

## Done

_(move completed items here with the date, e.g. `- [x] 2026-05-12 — Fixed /admin route ordering`)_
