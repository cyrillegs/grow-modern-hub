# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server on port **8080** (host `::`, configured in [vite.config.ts](vite.config.ts))
- `npm run build` — production build to `dist/`
- `npm run build:dev` — development-mode build (keeps `lovable-tagger` component tagging enabled)
- `npm run lint` — ESLint over the whole repo
- `npm run preview` — serve the built `dist/` for smoke-testing before deploy

There is no test runner configured. Don't claim test coverage you can't actually run.

## Architecture

This is a Vite + React 18 + TypeScript SPA for **GreenGrows**, a fertilizer marketing site with a small admin surface. It's a static frontend — there is no backend in this repo, and `AdminQuotes` operates purely on in-memory mock data ([src/pages/AdminQuotes.tsx](src/pages/AdminQuotes.tsx#L43)).

### Routing
All routes are declared in [src/App.tsx](src/App.tsx). The catch-all `*` route is intentionally placed *above* `/admin` in the current source — keep new routes above the catch-all or they will resolve to `NotFound`.

- `/` → [Index](src/pages/Index.tsx) — single-page composition: `Hero` → `Products` → `Benefits` → `About` → `Contact`, wrapped by `Navbar` + `Footer`. The Navbar uses `scrollIntoView` to jump between sections, so section components must keep their `id` attributes stable.
- `/products` → [Products](src/pages/Products.tsx) — full product catalog page (different from the in-page `Products` *component* used on the home page; both exist).
- `/admin` → [AdminQuotes](src/pages/AdminQuotes.tsx) — quote-request management UI backed by `mockQuotes`. No auth.

### UI system
shadcn/ui (Radix primitives + Tailwind), configured in [components.json](components.json). All primitives live under [src/components/ui/](src/components/ui/) and are imported via the `@/` alias (mapped to `src/` in both [tsconfig.json](tsconfig.json#L7) and [vite.config.ts](vite.config.ts#L15)). Use `@/components/ui/*` rather than relative paths.

Tailwind theme uses CSS variables (`hsl(var(--...))`) defined in [src/index.css](src/index.css) — change colors there, not in [tailwind.config.ts](tailwind.config.ts). Custom animations `fade-up`, `fade-in`, `scale-in` are defined in the Tailwind config and triggered by [src/hooks/use-scroll-animation.tsx](src/hooks/use-scroll-animation.tsx).

### Providers
[App.tsx](src/App.tsx) wraps the tree in `QueryClientProvider` (TanStack Query) → `TooltipProvider` → `BrowserRouter`. Both `Toaster` (Radix-based, [src/components/ui/toaster.tsx](src/components/ui/toaster.tsx)) and `Sonner` are mounted; `useToast` from [src/hooks/use-toast.ts](src/hooks/use-toast.ts) drives the Radix toaster.

### TypeScript config
Strictness is intentionally relaxed in [tsconfig.json](tsconfig.json): `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters` are all off, and ESLint disables `@typescript-eslint/no-unused-vars` ([eslint.config.js](eslint.config.js#L23)). Don't assume strict-mode invariants when reading existing code.

## Deployment

Pushes to `main` trigger [.github/workflows/deploy.yml](.github/workflows/deploy.yml), which builds and SCPs `dist/*` to a VPS then restarts Nginx. Required GitHub secrets: `SSH_PRIVATE_KEY`, `SERVER_HOST`, `SERVER_USER`, `SERVER_PATH`. Nginx must be configured with `try_files $uri /index.html;` for SPA routing — see [README.md](README.md) for the full VPS setup.

## Conventions

- Use the `@/` import alias, never relative paths into `src/`.
- Lucide icons (`lucide-react`) are the icon system — don't introduce a second icon library.
- File [src/components/Navbar-backup.tsx](src/components/Navbar-backup.tsx) is a stale backup, not in use; prefer [Navbar.tsx](src/components/Navbar.tsx).
- `lovable-tagger` runs only in development mode and is harmless in builds — don't remove it without confirming with the user (this project was scaffolded via Lovable).
