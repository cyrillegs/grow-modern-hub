# Step 6 — SEO

> Plan that drove PR #17 ([feat/seo](https://github.com/cyrillegs/grow-modern-hub/pull/17)). Kept in the repo as a reference for future SEO follow-ups and for anyone auditing why each meta tag exists.

## Context

The site previously had placeholder OG metadata pointing at `lovable.dev` (the scaffolding tool's domain), no per-page `<title>` or description, no sitemap, no structured data, and the [index.html](../index.html) title misnamed the brand ("GreenGrow" vs the project-wide "GreenGrows"). This blocked search-engine discovery, broke social-media link previews, and looked unprofessional when shared. Step 6 from [TASKS.md](../TASKS.md) asked for: react-helmet-async + per-page meta, real OG image, robots.txt + sitemap.xml, and JSON-LD structured data on `/` and `/products`.

Skipped Step 5d (placeholder business info + Resend domain — both blocked on user inputs) and proceeded to Step 6, which was fully implementable in code.

**Brand decision locked in:** "GreenGrows" (with s) everywhere — the `index.html` title was the outlier and got fixed as part of this PR.

## Approach

Single PR delivering all four sub-items together (they're all SEO and share a brand-constants module). Pragmatic for a small marketing site — no SSR, no @vercel/og, no advanced infrastructure. Helmet handles per-route head mutations client-side; Google indexes JS-rendered JSON-LD reliably.

## Files created

### `src/lib/seo.ts`
Single source of truth for brand + URL constants.
```ts
export const SITE_URL = "https://grow-modern-hub.vercel.app";
export const BRAND_NAME = "GreenGrows";
export const DEFAULT_TITLE = "GreenGrows Fertilizers — Premium Agricultural Solutions";
export const DEFAULT_DESCRIPTION = "Premium fertilizers engineered for maximum yield and sustainable growth in the Philippines. Science-backed solutions for farmers and agribusinesses.";
export const DEFAULT_OG_IMAGE = "/og-image.jpg";
export const WHATSAPP_PROFILE_URL = "https://wa.me/639954115063";
export const WHATSAPP_PHONE = "+63 995 411 5063";
export const OWNER_EMAIL = "cyrildave.legaspi@gmail.com";

export const buildCanonical = (path: string) => ...;
export const buildAbsoluteUrl = (relativePath: string) => ...;
```

### `src/components/seo/PageMeta.tsx`
Reusable wrapper around `<Helmet>` to keep per-page calls DRY. Props:
- `path: string` (required) — drives canonical + og:url
- `title?: string` — defaults to `DEFAULT_TITLE`
- `description?: string` — defaults to `DEFAULT_DESCRIPTION`
- `image?: string` — defaults to `DEFAULT_OG_IMAGE` (resolved to absolute URL)
- `noindex?: boolean` — emits `<meta name="robots" content="noindex,nofollow">` for admin/404 pages
- `type?: "website" | "article"` — defaults to `"website"`
- `children?` — slot for JSON-LD `<script>` tags

Emits: `<title>`, meta description, canonical link, og:title/description/image/url/type/site_name, twitter:card/title/description/image.

### `public/og-image.jpg`
Copy of [src/assets/hero-agriculture.jpg](../src/assets/hero-agriculture.jpg) placed in `public/` so it's served at `/og-image.jpg`. Swappable with a custom 1200×630 image later without code changes.

### `public/sitemap.xml`
Static XML with two `<url>` entries (`/` priority 1.0, `/products` priority 0.8). No `lastmod` initially — can be added later via hand-edit or build script. Excludes `/admin*`.

## Files modified

### `src/App.tsx`
- Imports `HelmetProvider` from `react-helmet-async`
- Wraps the existing provider tree as the outermost provider

### `src/pages/Index.tsx`
- `<PageMeta path="/" />` (uses all defaults)
- Child `<script type="application/ld+json">` with Organization schema: `name`, `url`, `logo`, `email: cyrildave.legaspi@gmail.com`, `telephone: +63 995 411 5063`, `areaServed: "PH"`, `sameAs: [WhatsApp profile URL]`

### `src/pages/Products.tsx`
- `<PageMeta path="/products" title="Products | GreenGrows Fertilizers" ... />`
- When `products` are loaded, renders a JSON-LD `ItemList` whose `itemListElement` are `Product` entities with `name`, `description`, `image` (absolute URL via `getProductImageSrc` + `buildAbsoluteUrl`), `brand: "GreenGrows"`. **No `offers` field** — pricing is B2B-indicative strings, not real e-commerce.
- Renders JSON-LD only when `products.length > 0`

### `src/pages/AdminLogin.tsx`, `src/pages/AdminDashboard.tsx`, `src/pages/NotFound.tsx`
- `<PageMeta noindex />` to keep admin and 404 pages out of search indexes

### [index.html](../index.html)
- "GreenGrow" → "GreenGrows" (title, author, og:title)
- OG block: swap og:image URL from lovable.dev to `/og-image.jpg`, add og:site_name + og:url
- Twitter block: drop the `@lovable_dev` site handle, swap twitter:image
- Add `<link rel="canonical" href="https://grow-modern-hub.vercel.app/" />` as fallback (per-page Helmet overrides)
- These static tags serve as fallback for crawlers that don't execute JS

### [public/robots.txt](../public/robots.txt)
Append:
```
Disallow: /admin
Disallow: /admin/

Sitemap: https://grow-modern-hub.vercel.app/sitemap.xml
```

### `package.json`
- Add `react-helmet-async` as a dependency (runtime, not dev)
- Lock file canary check: `grep -c '"@emnapi/core": "1\.' package-lock.json` must be ≥ 1 before commit (per the recurring Windows-vs-Linux lockfile issue documented in PR #14 / PR #16)

## Existing utilities reused

- [src/lib/products.ts](../src/lib/products.ts) — `fetchPublicProducts`, `getProductImageSrc`, `PRODUCTS_QUERY_KEY` already in place; Products page already wires `useQuery` against this. JSON-LD just consumes the already-fetched list.
- [src/components/whatsapp.tsx](../src/components/whatsapp.tsx) — has its own `WHATSAPP_URL` constant with a pre-filled message query param (not suitable for JSON-LD `sameAs`). `seo.ts` exports a cleaner `WHATSAPP_PROFILE_URL` for structured data; both intentionally coexist for their different use cases.

## Verification

- ✅ `npm run lint` → 0 errors
- ✅ `npm run test:run` → 21/21 pass (no test currently mounts the routes that get PageMeta)
- ✅ `npm run build` → clean; `dist/` contains `og-image.jpg`, `robots.txt`, `sitemap.xml`
- ⏳ `npm run preview` → open each route, View Source, confirm Helmet has updated `<title>`, meta description, canonical, og:*, twitter:*, and JSON-LD
- ⏳ Visit `<preview>/sitemap.xml` and `/robots.txt` — they resolve as static files (not rewritten to `index.html` by SPA fallback)
- ⏳ Validate JSON-LD by pasting rendered HTML into [Google Rich Results Test](https://search.google.com/test/rich-results) for `/` (Organization) and `/products` (Product/ItemList)
- ⏳ After Vercel preview deploy: spot-check the deployed `/sitemap.xml`, `/robots.txt`, `/og-image.jpg`, and a social-card preview tool like https://opengraph.dev
- ⏳ After merge: submit sitemap.xml URL to Google Search Console (manual, post-PR)

## Out of scope (deferred)

- Custom dimensioned OG image (1200×630 with brand overlay) — using hero-agriculture.jpg as-is is acceptable for launch
- Per-product schema with `offers` and real pricing — blocked on real pricing model; "indicative" string pricing doesn't fit Product/Offer schema
- Multi-language (`hreflang`) — site is English-only for now
- Dynamic sitemap generation — static is fine until catalog growth makes it tedious
- SEO meta on `/admin?tab=...` URL variants — `noindex` on `/admin` covers it

## Risk callouts handled

- **Vercel SPA rewrite**: confirmed [vercel.json](../vercel.json) has a catch-all rewrite (`"/(.*)" → "/index.html"`) but Vercel serves `public/*` files **before** applying rewrites, so `/sitemap.xml`, `/robots.txt`, and `/og-image.jpg` are not affected.
- **react-helmet-async + React 18**: no double-render warnings observed in dev or test runs. Library is React-18-compatible per its v2 release notes.
- **Windows-vs-Linux lock file**: ran the `@emnapi/core` canary check before commit; lock entries intact. CI's `npm ci` on Ubuntu will not break.
