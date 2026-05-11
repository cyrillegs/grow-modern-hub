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
| Analytics | **Vercel Analytics** *(or GA4)* | Vercel Analytics is one toggle; decide before step 7 |
| Error tracking | **Sentry Free** | 5k errors/mo, Vite source-map plugin |
| Testing | **Vitest + React Testing Library** | Defer Playwright |

---

## Build Order — Remaining

### Step 4 — Real quote pipeline (P1) ← **NEXT**

**4a. Admin side (planned PR #5)**
- [ ] Replace `mockQuotes` in [src/pages/AdminQuotes.tsx:43](src/pages/AdminQuotes.tsx#L43) with TanStack Query `useQuery` calling Supabase.
- [ ] Wire status updates (pending / processed / cancelled) to `useMutation` → `supabase.update`.
- [ ] Wire delete actions to `useMutation` → `supabase.delete`.
- [ ] Loading state (skeleton rows), error state, empty state.
- [ ] Tighten types using `Database` interface from [src/types/database.ts](src/types/database.ts).

**4b. Customer side (planned PR #6)**
- [ ] Add **Request Quote** button on each product card in [src/pages/Products.tsx](src/pages/Products.tsx).
- [ ] Open shadcn Dialog with a form (name, email, phone, quantity, message — product pre-filled).
- [ ] Submit → `supabase.from("quotes").insert(...)` with toast success/error.

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

### Step 7 — Analytics & error tracking (P2)

- [ ] Decide Vercel Analytics vs GA4. Vercel Analytics is one toggle in the dashboard + `@vercel/analytics` package; GA4 needs a tag in [index.html](index.html).
- [ ] `npm i @sentry/react`; init in [src/main.tsx](src/main.tsx); add Vite source-map plugin.
- [ ] Configure Sentry release tagging via Vercel build env (`VERCEL_GIT_COMMIT_SHA`).

### Step 8 — Quality / cleanup (P3)

- [ ] Delete stale [src/components/Navbar-backup.tsx](src/components/Navbar-backup.tsx).
- [ ] Delete `.github/workflows/deploy.yml.txt` once Vercel deploys are stable (or move out of repo).
- [ ] Update [CLAUDE.md](CLAUDE.md) deployment section — still describes the VPS flow which is no longer in use.
- [ ] Delete the Supabase keepalive workflow + `keepalive` table once the site has consistent real traffic (≥1 form submission/week for a month).
- [ ] Add Vitest + RTL: `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`. Cover the contact form submission and admin filtering.
- [ ] Decide whether to tighten [tsconfig.json](tsconfig.json) (`strictNullChecks`, `noImplicitAny`) — progressive opt-in by file is fine.
- [ ] Image optimization audit (lazy-loading, sizing, modern formats).

---

## Done

### 2026-05-11 — Step 1: Foundation (Supabase + Vercel + Keepalive)
- [x] Created Supabase project; populated `.env.local` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [x] Applied [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) — `contacts` + `quotes` tables with RLS (anon `INSERT`-only, authenticated full access).
- [x] Installed `@supabase/supabase-js`.
- [x] Scaffolded [src/lib/supabase.ts](src/lib/supabase.ts), [src/types/database.ts](src/types/database.ts), typed `import.meta.env` in [src/vite-env.d.ts](src/vite-env.d.ts).
- [x] Migrated hosting from VPS to Vercel; old workflow disabled (`.github/workflows/deploy.yml.txt`).
- [x] [vercel.json](vercel.json) SPA rewrite so `/products`, `/admin` don't 404 on refresh.
- [x] Imported repo into Vercel; env vars set across Production / Preview / Development.
- [x] Verified first deploy + SPA refresh behavior.
- [x] Applied [supabase/migrations/0002_keepalive.sql](supabase/migrations/0002_keepalive.sql).
- [x] [.github/workflows/supabase-keepalive.yml](.github/workflows/supabase-keepalive.yml) cron (Mon/Wed/Fri 00:00 UTC).
- [x] Added GitHub repo secrets `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY`; manually triggered keepalive workflow to verify.

### 2026-05-11 — Step 2: Contact form wired to Supabase (PR #1)
- [x] Replaced toast-only handler in [src/components/Contact.tsx](src/components/Contact.tsx) with Supabase `INSERT` into `contacts`.
- [x] React Hook Form + Zod typed validation.
- [x] shadcn `<Form>` primitive with proper `<Label>` pairs (a11y fix — inputs had `placeholder` only before).
- [x] Loading state ("Sending…"), error toast on failure, success toast + form reset on success.

### 2026-05-11 — WhatsApp UX shift (PR #2 → PR #3)
- [x] Added response-time subtitle on contact form: *"We'll get back to you within 1 business day."* (PR #2).
- [x] Built floating WhatsApp FAB (Tawk.to-style) in bottom-right corner — brand green, shadcn Tooltip on hover, opens `wa.me/639954115063` with pre-filled message (PR #3).
- [x] Hidden FAB on `/admin*` routes via `useLocation`.
- [x] Removed the now-redundant form-bottom WhatsApp button + "or for a faster reply" divider (PR #3).
- [x] Refactored shared WhatsApp constants/icon into [src/components/whatsapp.tsx](src/components/whatsapp.tsx).

### 2026-05-11 — Step 3: Admin auth (PR #4)
- [x] **Fixed route ordering bug** — `/admin` was below the catch-all `*` and resolved to `NotFound`. Catch-all is now last.
- [x] [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) — `AuthProvider` + `useAuth()` hook, subscribes to `supabase.auth.onAuthStateChange`.
- [x] [src/components/RequireAuth.tsx](src/components/RequireAuth.tsx) — route guard, preserves intended destination via `location.state.from`.
- [x] [src/pages/AdminLogin.tsx](src/pages/AdminLogin.tsx) — email + password login with RHF + Zod; show/hide password toggle.
- [x] Sign-out button in [AdminQuotes.tsx](src/pages/AdminQuotes.tsx) header.
- [x] Disabled red FormLabel on validation error project-wide ([src/components/ui/form.tsx](src/components/ui/form.tsx)) — `FormMessage` already conveys the error.
- [x] Disabled public sign-ups in Supabase Auth dashboard.
- [x] Manually created owner account (mustardseedlabsph@gmail.com).
