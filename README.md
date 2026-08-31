# GreenGrows

A lead-generation marketing site for **GreenGrows**, a Philippines-based B2B fertilizer business. Public catalog + contact/quote forms feed into a small admin dashboard for manual follow-up.

**Live:** https://grow-modern-hub.vercel.app

## Stack

| Concern | Choice |
|---|---|
| Frontend | Vite, React 18, TypeScript |
| UI | shadcn/ui (Radix primitives) + Tailwind CSS |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query |
| Database / Auth / Storage | Supabase (Postgres + Auth + Edge Functions) |
| Transactional email | Resend (via Supabase Edge Functions) |
| SEO | react-helmet-async + JSON-LD |
| Testing | Vitest + Testing Library (unit), Playwright (e2e) |
| Hosting | Vercel (preview per PR, prod on `main`) |

## Quick start

```bash
git clone https://github.com/cyrillegs/grow-modern-hub.git
cd grow-modern-hub
npm install
cp .env.example .env.local         # then fill in the values
npm run dev
```

The dev server runs on **port 8080** (configured in [vite.config.ts](vite.config.ts)).

### Required env vars in `.env.local`

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

# Optional — only needed if you want to run e2e/admin-smoke.spec.ts locally:
E2E_ADMIN_EMAIL=<your-e2e-test-user@example.com>
E2E_ADMIN_PASSWORD=<your-e2e-test-user-password>
```

`.env.local` is gitignored. The Playwright config auto-loads it via dotenv.

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server on `http://localhost:8080` |
| `npm run build` | Production build → `dist/` |
| `npm run build:dev` | Dev-mode build (keeps `lovable-tagger`) |
| `npm run preview` | Serve the built `dist/` for smoke-testing |
| `npm run lint` | ESLint over the whole repo |
| `npm test` | Vitest watch mode |
| `npm run test:run` | Single Vitest run (used by CI) |
| `npm run e2e` | Playwright tests (headed locally, headless in CI) |
| `npm run e2e:ui` | Playwright interactive UI mode |
| `npm run e2e:headless` | Playwright headless explicitly |

## Project structure

```
src/
├── components/
│   ├── admin/          # Admin dashboard panels (Products, Quotes, Contacts, Reply modal)
│   ├── seo/            # PageMeta wrapper for Helmet
│   ├── ui/             # shadcn primitives (don't edit by hand — use shadcn CLI)
│   ├── Hero.tsx, Navbar.tsx, Products.tsx, Benefits.tsx, About.tsx, Contact.tsx, Footer.tsx
│   ├── RequestQuoteDialog.tsx, RequireAuth.tsx, whatsapp.tsx
├── contexts/           # AuthContext (Supabase session)
├── hooks/              # use-scroll-animation, use-toast
├── lib/                # supabase client, products fetchers, seo constants
├── pages/              # Route components (Index, Products, AdminLogin, AdminDashboard, NotFound)
├── types/              # database.ts — Supabase table types
├── assets/             # Images
└── test/               # Vitest setup (jest-dom, IntersectionObserver/ResizeObserver mocks)

supabase/
├── migrations/         # SQL migrations, applied in numbered order
└── functions/          # Edge Functions: notify-quote, notify-contact, send-reply, _shared/

e2e/                    # Playwright specs (contact-form, quote-form, admin-smoke)
.github/workflows/      # ci.yml (PR validation), daily-smoke.yml (cron)
docs/                   # agents.md, seo-plan.md, step-7-plan.md
```

## How the app works

### Routes
- **`/`** — single-page composition: Hero → Products (featured 3) → Benefits → About → Contact. Navbar uses `scrollIntoView` between sections.
- **`/products`** — full product catalog, fetched from Supabase
- **`/admin/login`** — sign-in for the owner
- **`/admin`** — auth-gated dashboard with three tabs: Products (CRUD), Quotes (incoming quote requests), Contacts (incoming contact messages)

### Data flow

1. Visitor submits the Contact form or Request Quote dialog
2. Form data is written directly to `public.contacts` / `public.quotes` via the Supabase JS client
3. A database webhook fires the `notify-quote` / `notify-contact` Edge Function
4. The function sends an email to the owner via Resend with the lead details
5. Owner signs in to `/admin`, sees the new row in the relevant tab, and either:
   - Clicks **Reply** → opens compose modal → `send-reply` Edge Function sends the email via Resend with `reply_to = OWNER_EMAIL`, then logs the outbound message to `admin_replies`
   - Updates status (new/replied/archived for contacts; pending/processed/cancelled for quotes)

Customer replies land back in the owner's personal Gmail (via the `reply_to` header) — the in-app history shows the *outbound* reply only.

### Edge Functions

All three live under [supabase/functions/](supabase/functions/) and share helpers from `_shared/email.ts`:

- **`notify-quote`** / **`notify-contact`** — triggered by DB webhook on row INSERT; sends owner notification + customer confirmation
- **`send-reply`** — browser-invoked from the admin reply modal; verifies the caller is a signed-in admin, sends via Resend, logs to `admin_replies`

## Deployment

Pushes to `main` automatically deploy to Vercel (production). Every PR gets a Vercel **preview deploy** at a unique URL.

The `public/` directory ships static assets — `og-image.jpg`, `robots.txt`, `sitemap.xml`, favicons. Vercel serves these before applying the SPA rewrite in [vercel.json](vercel.json).

### Manual deploy steps after a release

Some changes need a manual follow-up because they touch infrastructure outside the Vercel build:

- **New Supabase migrations** — apply via Supabase SQL Editor or `supabase db push`
- **New / changed Edge Functions** — `supabase functions deploy <name>`
- **New Edge Function secrets** — set in Supabase dashboard → Project Settings → Edge Functions → Secrets

These are called out in each PR's deployment notes.

## CI / Scheduled workflows

| Workflow | When | Purpose |
|---|---|---|
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | PR + push to main | `npm ci` → Vitest → production build |
| [.github/workflows/daily-smoke.yml](.github/workflows/daily-smoke.yml) | 00:00 UTC daily + manual | Playwright admin auth + dashboard smoke against deployed Vercel URL. Doubles as Supabase keepalive (fires a real SELECT on `public.quotes`). |

The daily smoke needs `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` as GitHub Actions secrets — a dedicated Supabase auth user that doesn't overlap with the real owner account.

## Related documentation

- **[CLAUDE.md](CLAUDE.md)** — short guide for AI assistants working in this repo (conventions, route structure, gotchas)
- **[TASKS.md](TASKS.md)** — running task tracker; what's next, what's done, what's deferred
- **[docs/agents.md](docs/agents.md)** — notes on Claude Code subagents in this project
- **[docs/seo-plan.md](docs/seo-plan.md)** — design intent + risk callouts for the SEO work (PR #17)
- **[docs/step-7-plan.md](docs/step-7-plan.md)** — draft plan for analytics + Sentry + CI improvements
- **[docs/Old README.md](docs/Old%20README.md)** — the previous VPS deployment guide (archived; no longer in use since the move to Vercel)
