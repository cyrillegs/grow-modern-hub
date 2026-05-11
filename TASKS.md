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

### Step 5 — Email notifications via Resend (P1) ← **NEXT**

- [ ] Sign up at https://resend.com.
- [ ] Verify the sending domain (SPF + DKIM DNS records on your domain registrar).
- [ ] Write a Supabase Edge Function `notify-quote` that calls Resend on `quotes` insert.
  - Owner notification → mustardseedlabsph@gmail.com (subject + summary + link to /admin).
  - Customer confirmation → submitted address (short "we received your quote" message).
- [ ] Trigger via Database Webhook (Supabase → Edge Function on `quotes` row insert).
- [ ] Mirror for `contacts` table (owner notification only — contacts don't need a separate confirmation, the homepage form already shows a success toast).
- [ ] Replace placeholder contact info in [src/components/Contact.tsx](src/components/Contact.tsx) (still `info@fertilizers.com`, `+1 (555) ...`, `123 Agriculture Ave`).

### Step 6 — SEO (P2)

- [ ] `npm i react-helmet-async`; wrap `App` in `<HelmetProvider>` and add `<Helmet>` per page.
- [ ] Replace placeholder OG image in [index.html:25](index.html#L25) and [index.html:31](index.html#L31) (still points at `lovable.dev`).
- [ ] Add `public/robots.txt` and `public/sitemap.xml`.
- [ ] Add Organization + Product JSON-LD on `/` and `/products`.

### Step 7 — Analytics, error tracking, CI (P2)

- [ ] Decide Vercel Analytics vs GA4. Vercel is one toggle + `@vercel/analytics`; GA4 needs a tag in [index.html](index.html).
- [ ] `npm i @sentry/react`; init in [src/main.tsx](src/main.tsx); add Vite source-map plugin.
- [ ] Configure Sentry release tagging via Vercel build env (`VERCEL_GIT_COMMIT_SHA`).
- [ ] Add a GitHub Actions workflow that runs `npm run test:run` on every PR — bundled with Playwright when E2E tests are added.

### Step 8 — Quality / cleanup (P3)

- [ ] Delete stale [src/components/Navbar-backup.tsx](src/components/Navbar-backup.tsx).
- [ ] Delete `.github/workflows/deploy.yml.txt` once Vercel deploys are stable (or move out of repo).
- [ ] Update [CLAUDE.md](CLAUDE.md) deployment section — still describes the VPS flow which is no longer in use.
- [ ] Delete the Supabase keepalive workflow + `keepalive` table once the site has consistent real traffic (≥1 form submission/week for a month).
- [ ] Backfill tests: `AdminLogin` sign-in flow, `AdminQuotes` filter/search + mutations.
- [ ] Check whether the homepage `Products` *component* (used on `/`, distinct from `/products` page) still has a fake Buy Now or quote flow — clean up consistently if so.
- [ ] Decide whether to tighten [tsconfig.json](tsconfig.json) (`strictNullChecks`, `noImplicitAny`) — progressive opt-in by file is fine.
- [ ] Image optimization audit (lazy-loading, sizing, modern formats).
- [ ] (Optional) Add Playwright for end-to-end tests + bundle CI workflow with it.

### Future (not scheduled)

- [ ] **Real ordering flow** — when GreenGrows has set pricing, delivery zones, payment integration (PayMongo/GCash/Stripe), BIR-compliant invoicing, and order fulfillment, design a proper checkout. Build fresh, not by reviving the removed Buy Now placeholder.

---

## Done

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
