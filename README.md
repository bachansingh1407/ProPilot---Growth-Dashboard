# Career OS

A private, single-user "Personal Engineering Career OS" that turns your
projects, skills, and experience into a connected evidence graph — see
`docs/architecture.md` for the full architecture plan.

All 7 phases of the original build order are implemented: Foundation →
Engineering core → Career prep → Interview system → Intelligence → Public
portfolio → Polish. It has been run end-to-end against a real PostgreSQL
database and a real Next.js dev server (see "Verified working" below), not
just type-checked.

## What's built

- **Foundation** — Auth.js (single-user credentials + bcrypt), responsive app
  shell (sidebar/mobile nav/topbar), light/dark/system theme, Cmd/Ctrl+K
  command palette, the shared `DateRangeFilter` system
- **Engineering core** — Skills with evidence-derived state (never a
  hand-typed score), Projects with progressive disclosure (Architecture/
  ADRs/Metrics/Achievements tabs), an Architecture hub and ADRs hub
  aggregating across projects, Experience
- **Career prep** — Resume Lab (Resume → Version → Bullet → Evidence),
  a genuinely rule-based ATS Analyzer (keyword/skill alignment, weak-bullet
  detection — unit-tested, no fabricated match score), Applications, Company
  and Role research
- **Interview system** — Interviews with inline Q&A capture, a reusable
  Interview Question bank, real interview analytics (topic frequency,
  self-flagged weak topics, outcome breakdown), a STAR-format Story Bank
- **Intelligence** — Senior Engineer Readiness across 15 categories (each
  backed by real matched evidence, with an open Improvement always able to
  force "Needs Improvement" regardless of evidence volume), a real Dashboard
  (Engineering Strength, Evidence Gaps, Recent Activity), and global search
  wired into the command palette
- **Public portfolio** — visibility toggles per Project/Experience/
  Achievement, a publish/slug control, and a portfolio page that only ever
  reads explicitly public rows (it doesn't even import Application/Interview/
  ResumeAnalysis models)
- **Polish** — see "Verified working" below for the real bugs this phase
  caught and fixed

## Verified working — what was actually tested

This isn't a "should work" claim. The full stack was stood up for real in a
sandboxed Linux environment (real PostgreSQL 16, real Prisma 7 client, real
Next.js dev server) and exercised end-to-end over HTTP, including:

- Sign up via `/setup` → real row created in `users`/`profiles`
- Sign in via `/login` → real Auth.js session cookie issued, verified against the DB
- Authenticated access to `/dashboard`, `/readiness`, `/settings/account`,
  `/settings/privacy`, and every list page across Engineering/Career/Prep/Research
  (all returned HTTP 200 with real, DB-backed content)
- Creating a Skill and a Project through the real Server Actions → confirmed the
  rows landed correctly in Postgres, with correct foreign keys
- The computed Skill state (`resolveSkillLevel`) showing "Needs Evidence" for a
  skill with claimed years but no linked evidence — confirmed the derivation logic
  is correct against live data, not just its unit tests
- Duplicate-prevention guards firing correctly (re-running setup after a user
  exists, re-adding a skill with the same name) instead of crashing
- `/api/search` returning real matching results when authenticated, and correctly
  redirecting to `/login` when not — confirming the search endpoint doesn't leak
  data to unauthenticated requests
- `npx tsc --noEmit` passing with **zero errors** across the entire codebase
- `npx vitest run` passing all **23 unit tests** across skill-level, ATS
  analysis, interview analytics, and readiness logic

Three real bugs were found and fixed this way that static type-checking alone
could never have caught:

1. **Middleware crash** — `middleware.ts` pulled in the full Prisma/`pg` stack via
   `auth()`, but Next.js middleware runs on the Edge runtime, which can't load
   Node's `pg` driver. Fixed by splitting into an edge-safe auth config (no
   providers/adapter, used only by middleware) and the full Node-only config used
   everywhere else — see `lib/auth/config.ts`, `lib/auth/edge.ts`, `lib/auth/index.ts`.
2. **Server/Client Component serialization crash** — `Sidebar` was a Server
   Component passing Lucide icon components as props into the Client Component
   `NavLink`; React can't serialize functions across that boundary. Fixed by
   marking `Sidebar` `'use client'` (matching `MobileNav`'s existing pattern).
3. **Next.js 15's async `params`/`searchParams` breaking change** — every
   dynamic route and every page reading `searchParams` was written against the
   Next.js 14 synchronous API. Audited and fixed all 12 `params`-consuming pages
   and all 6 `searchParams`-consuming pages (plus one converted to the
   `useSearchParams()` client hook instead, since it's a Client Component).
4. **Broken fresh-install DX** — a `postinstall: prisma generate` hook meant a
   brand-new `npm install` (before `.env` exists) would hard-fail, because
   `prisma.config.ts` resolves `DATABASE_URL` at config-load time. Removed the
   postinstall hook; `db:generate` is now an explicit, ordered step in setup.

### Known gaps (honest, not hidden)

- **Accessibility/performance**: Radix primitives (Dialog, Select, Switch,
  Tabs, Popover) give correct keyboard nav and ARIA out of the box, and every
  form input uses a paired `<Label htmlFor>`, but there's been no dedicated
  axe/Lighthouse audit pass.
- **E2E test suite**: validated manually via a real HTTP-driven script during
  development (see the bug list above), but that script isn't checked into
  the repo as a maintained Playwright/Cypress suite yet.
- **Backup import** and per-section Markdown/CSV export are intentionally not
  built (see `/settings/import-export` in-app — it says so directly rather
  than faking it). Full JSON export works.
- **Achievements** aren't editable after creation (no edit page yet, only
  create + view) — same for a few other entities. Every entity supports
  create + list + detail; not all support in-place edit yet.

## Getting started

### 1. Prerequisites
- Node.js 20+
- A PostgreSQL database (local, Docker, or hosted — e.g. Supabase/Neon/Railway)

### 2. Install
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Fill in:
- `DATABASE_URL` — your Postgres connection string
- `AUTH_SECRET` — generate one with `npx auth secret`
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev

### 4. Generate the Prisma Client
```bash
npm run db:generate
```
This must come after step 3, not before — the new `prisma.config.ts` resolves
`DATABASE_URL` at config-load time, so generating before `.env` exists will
fail. (This is also why there's no `postinstall` hook running this
automatically — it would break a fresh `npm install` before you've
configured anything.)

### 5. Run the database migration
```bash
npm run db:migrate
```
This creates every table in `prisma/schema.prisma`, including the
`Session`/`User`/`Profile` auth tables (Auth.js Prisma adapter reads from
these directly — no separate auth DB needed). On a normal machine with regular
internet access this downloads Prisma's schema-engine binary automatically the
first time — that part of Prisma's toolchain isn't Rust-free yet, only the
query engine used at runtime is (via `@prisma/adapter-pg`, no binary needed there).

### 6. Start the app
```bash
npm run dev
```
Visit `http://localhost:3000` — you'll be redirected to `/setup` on first
run (no user exists yet). Create your one account there, then sign in.

### 7. (Optional) seed sample data
```bash
npm run db:seed
```
Creates one sample skill + one sample project, clearly named `Sample …` so
it's trivially identifiable and deletable (see `prisma/seed.ts`).

### 8. Run the tests
```bash
npm test
```
Runs the Vitest suite (skill-level derivation, ATS analysis, interview
analytics, readiness state — all pure, unit-tested business logic).

### 9. Fill out remaining shadcn/ui primitives as needed
Button, Input, Textarea, Label, Select, Badge, Dialog, Popover, Tabs, Switch,
and a lightweight Toaster are hand-written already (`components/ui/`). If you
want the rest of the shadcn catalog (Sheet, Table, Calendar, Command, etc. —
some already have bespoke equivalents in this app), pull them in with:
```bash
npx shadcn@latest init
npx shadcn@latest add sheet table calendar
```
and wire the generated components' CSS variables to the tokens already
defined in `app/globals.css` (they use the same `--border`, `--primary`,
etc. variable names by convention).

## Project structure
```
app/
  (auth)/login, /setup        — public, unauthenticated
  (app)/...                   — authenticated shell (middleware-protected):
                                 dashboard, career/*, engineering/*, prep/*,
                                 research/*, readiness, settings/*
  (public)/portfolio/[slug]   — public, unauthenticated, reads only public data
  api/auth/[...nextauth]      — Auth.js route handler
  api/search                  — global search (Section 29)
  api/export                  — full JSON data export (Section 33)
components/
  ui/            shadcn-style primitives
  navigation/    Sidebar, Topbar, MobileNav, AppShell, ThemeToggle
  command/       CommandPalette (Cmd/Ctrl+K, live search)
  date-range/    the shared DateRangeFilter system
  data-display/  EmptyState, status selects, dialogs
  evidence/      evidence-linking dialogs shared by Skills/Resume bullets
  projects/      per-project "add architecture/ADR/metric" dialogs
  skills/        SkillLevelBadge
  charts/        Recharts wrappers (TrendLine)
  shared/        ThemeProvider, QueryProvider, PageHeader
lib/
  auth/          config.ts (edge-safe) / edge.ts (middleware) / index.ts (full, Node-only)
  db/            Prisma client singleton (driver-adapter based)
  validation/    Zod schemas, one file per domain
  actions/       Server Actions, one file per domain
  analysis/      pure, unit-tested business logic (skill-level, ats,
                 interview-analytics, readiness, evidence-gaps)
  navigation.ts  single source of truth for sidebar/mobile-nav/command-palette items
prisma/
  schema.prisma  full data model (44 models)
  seed.ts        sample dev data
docs/
  architecture.md  full architecture plan (routes, components, auth, data flow, design system)
```

## Design tokens

Colors live in `app/globals.css` as CSS variables (`--background`, `--primary`,
`--evidence-strong/developing/weak/gap/unknown`, etc.) consumed by
`tailwind.config.ts`. The evidence-strength palette is intentionally
desaturated (GitHub-label-like) rather than a red/yellow/green traffic light.

## Security notes

- Middleware blocks every route except `/login`, `/setup`, `/portfolio/*`,
  and `/api/auth/*`.
- Every authenticated Server Component/Action re-verifies the session
  (`requireUser()`) rather than trusting middleware alone.
- Passwords are hashed with bcrypt (cost factor 12); never logged or returned
  from any query.
- The public portfolio route only imports `Profile`, `Experience`, `Project`,
  and `Achievement` (each filtered by `isPublic`) — it does not import
  `Application`, `Interview`, or `ResumeAnalysis` models at all, so there's no
  path for private data to leak through that page even by mistake.
- `/api/search` and `/api/export` both call `requireUser()` before touching
  the database — verified by testing both authenticated and unauthenticated.
