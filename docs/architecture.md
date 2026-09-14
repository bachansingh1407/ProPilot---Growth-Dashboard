# Personal Engineering Career OS — Phase 1 Architecture Plan

Status: **draft for review, not yet implemented.** Nothing below has been built —
this is the plan the build spec requires before any code is written.

## 1. Stack decision

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server Components by default; client components only where interactivity requires it |
| Language | TypeScript (strict) | |
| Styling | Tailwind CSS + shadcn/ui | Custom design tokens, not default shadcn theme |
| Icons | lucide-react | |
| Data fetching | Server Components + Server Actions; React Query only for client-side mutations/optimistic UI (e.g. inline skill editing, command palette) | |
| Validation | Zod, shared between client forms and server actions | |
| ORM | Prisma 7 (driver adapters / Rust-free query engine) | `@prisma/adapter-pg` + `pg`, `engineType = "client"` in the generator block — no native query-engine binary at runtime |
| Database | PostgreSQL | |
| Auth | Auth.js (NextAuth) credentials provider, single user, bcrypt password hash | No OAuth needed but the schema doesn't preclude it later |
| Charts | Recharts | |
| Diagrams | Mermaid (via `mermaid` npm package, rendered client-side) | |

## 2. Authentication architecture

- Single row in `User`. On first boot, a setup flow creates that one account (email + password) — after that, the signup route is disabled/hidden.
- Auth.js credentials provider, sessions stored in DB (`Session` table) rather than JWT-only, so sessions can be revoked from Settings → Account.
- Middleware (`middleware.ts`) protects every route except `/login`, `/setup`, `/portfolio/[slug]` (public), and static assets.
- Every Server Action re-checks `session.user.id` server-side — never trusts a client-supplied user id. Since there's one user, this is mostly a defense-in-depth / future-proofing measure, not a real authorization matrix.
- CSRF handled by Auth.js defaults; Server Actions get same-origin protection from Next.js by default.
- Rate limiting on `/login` and `/api/auth/*` (simple in-memory or Upstash-style token bucket — no need for infra beyond Postgres).

## 3. Route map

```
/                              → redirect to /dashboard or /login
/login
/setup                         (first-run only, disabled after User exists)

/dashboard

/career/experience
/career/experience/[id]
/career/achievements
/career/achievements/[id]
/career/timeline
/career/goals

/engineering/skills
/engineering/skills/[id]
/engineering/improvements
/engineering/projects
/engineering/projects/[id]
/engineering/architecture
/engineering/architecture/[id]
/engineering/adrs
/engineering/adrs/[id]
/engineering/notes
/engineering/notes/[id]
/engineering/metrics

/prep/resume-lab
/prep/resume-lab/[resumeId]/[versionId]
/prep/ats-analysis
/prep/ats-analysis/[analysisId]
/prep/applications
/prep/applications/[id]
/prep/interviews
/prep/interviews/[id]
/prep/interview-questions
/prep/story-bank
/prep/story-bank/[id]

/research/companies
/research/companies/[id]
/research/roles
/research/roles/[id]

/readiness                     (Senior Engineer Readiness — Section 28)

/portfolio/[slug]              (PUBLIC — no auth, reads only isPublic=true data)

/settings/account
/settings/privacy
/settings/import-export
/settings/preferences
```

Every list route (`/engineering/projects`, `/prep/applications`, etc.) supports
`?q=`, pagination, and relevant filters as searchParams — server-rendered, not
client-fetched-on-mount, so back/forward and shareable URLs work.

## 4. Component architecture

```
app/
  (auth)/login, /setup
  (app)/                        ← authenticated shell (sidebar + topbar)
    dashboard/
    career/...
    engineering/...
    prep/...
    research/...
    readiness/
    settings/...
  (public)/portfolio/[slug]/    ← separate layout, no sidebar, no auth

components/
  ui/                # shadcn primitives, unmodified except theme tokens
  navigation/         # AppShell, Sidebar, Topbar, MobileNav (Sheet-based)
  command/            # CommandPalette (cmdk via shadcn Command), GlobalSearch
  date-range/         # DateRangeFilter (shared, see §7)
  charts/             # thin Recharts wrappers: TrendLine, EvidenceBar, DistributionPie
                       # each wrapper owns empty/loading/"not enough data" states
  data-display/       # DataTable (responsive: table → card list on mobile), EmptyState, StatCard
  forms/              # form primitives wired to react-hook-form + Zod resolvers
  evidence/           # EvidenceGraphPanel, EvidenceBadge, EvidenceGapList — the reusable
                       # "trace this claim" component used on Skill/Project/Achievement/Resume pages
  projects/           # ProjectStepper (progressive disclosure), ArchitectureCard, ADRCard, MetricChart
  skills/             # SkillCard, SkillStatePill, SkillRelationshipPanel
  resume/             # BulletEditor, EvidenceLinker, ATSResultPanel
  interviews/         # InterviewTimeline, QuestionBank, FeedbackForm
  shared/             # Markdown renderer, MermaidRenderer, ConfirmDialog, PageHeader

lib/
  auth/               # Auth.js config, session helpers
  db/                 # Prisma client singleton
  validation/         # Zod schemas (mirrored to Server Action inputs)
  analysis/           # pure functions: computeSkillLevel(), atsAnalyze(), readinessScore()
                       # — deliberately pure/testable, no DB calls, so they're unit-testable
  actions/            # Server Actions grouped by domain (skills.ts, projects.ts, resumes.ts...)
```

Rule enforced throughout: **pages fetch data and compose; `components/*` render
props they're given; `lib/analysis/*` holds the actual business logic** (skill
state derivation, evidence-gap detection, ATS scoring, readiness calculation).
This is what makes those calculations unit-testable per Section 46.

## 5. Data flow (example: viewing a Skill)

```
GET /engineering/skills/[id]  (Server Component)
  → lib/db: fetch skill + evidence + linked projects/experience/achievements/
    interview questions/stories/improvements in one query (Prisma `include`)
  → lib/analysis/computeSkillLevel(skill, evidence) → derived SkillLevel
    (falls back to manualLevelOverride if the user has set one)
  → render SkillDetailPage, passing plain serializable data down to
    client components only where interaction is needed (e.g. inline edit,
    "link new evidence" dialog using useOptimistic)
```

No skill "level" is ever hand-typed by a form as a free choice from Strong →
Not Enough Data without evidence backing it — the computed state is shown,
with an explicit, clearly-labeled override option if the user disagrees.

## 6. Design system direction

- Typography: one technical monospace-adjacent display face for numbers/metrics
  (e.g. tabular figures), one clean sans for body — not a generic Inter-only look.
- Color: a small neutral gray scale (not pure Tailwind slate defaults reused
  verbatim) plus a single accent hue used sparingly for primary actions and
  evidence-strength indicators (strong/developing/weak/needs-evidence get
  distinct, accessible colors — not a red/yellow/green traffic light cliché;
  more like GitHub's issue-label palette: precise, desaturated, legible in both themes).
- Density: tables and evidence chains are dense; long-form content (ADRs, notes,
  story bodies) gets generous line-length and spacing.
- No large hero sections anywhere inside the authenticated app. The public
  portfolio is the only place a "hero" treatment is appropriate, and even there,
  restrained.
- Motion: 150–200ms ease transitions for dialogs/sheets/hover states only;
  respects `prefers-reduced-motion`.

## 7. Shared DateRangeFilter contract

```ts
type DateRange =
  | { preset: '24h' | '7d' | '30d' }
  | { preset: 'custom'; from: Date; to: Date }

// URL-synced via searchParams (?range=7d or ?from=...&to=...) so it's
// shareable/bookmarkable and survives refresh. One hook:
useDateRangeFilter(): { range: DateRange; setRange: (r: DateRange) => void }
```

Consumed by dashboard, metrics, interview analytics, application analytics,
activity, timeline, and engineering trend charts. Not added to pages with no
genuinely time-series data (e.g. a single Skill detail page).

## 8. Evidence-gap computation (no fabrication)

`lib/analysis/evidenceGaps.ts` runs pure queries like:
- skills with zero `SkillEvidence` rows
- projects with zero `ProjectArchitecture` rows
- resume bullets with zero `ResumeEvidence` rows

These feed the Dashboard "Evidence Gaps" panel and the Readiness page. If a
query returns an empty gap list, the UI says so plainly rather than inventing
insights.

## 9. What Phase 1 does NOT decide yet

- Exact shadcn component list per page (deferred to each phase's page build)
- AI provider/integration wiring (Phase 6, optional, isolated behind a single
  `lib/ai/` interface so it can be a no-op in environments without an API key)
- Exact seed data content (Phase 2, clearly marked `isSample: true` semantics
  — noting the schema currently doesn't have a literal `isSample` flag; that's
  a one-line addition if you want seed rows to be filterable/removable as a set)

## 10. Proposed build order (matches spec §53)

1. **Foundation** — Next.js scaffold, Prisma schema + migration, Auth.js, app
   shell (sidebar/topbar/mobile nav), theme (light/dark/system), DateRangeFilter,
   CommandPalette shell, global search stub.
2. **Engineering core** — Skills, Skill Evidence, Projects (progressive
   disclosure), Architecture, ADRs, Metrics, Achievements, Experience.
3. **Career prep** — Resume Lab, Resume Evidence, ATS Analyzer (rule-based
   first, AI-assisted second), Applications, Companies, Roles.
4. **Interview system** — Interviews, Questions, Answers, Feedback, Story
   Bank, Interview Analytics.
5. **Intelligence** — Senior Readiness, Evidence Graph views, Dashboard
   insights, full global search + command palette.
6. **Public portfolio** — separate layout, visibility controls, slug routing.
7. **Polish** — accessibility, performance, responsive, empty/loading/error
   state audit, tests, docs.

Each phase ships as a runnable increment (migrations + working pages), verified
before moving to the next — per the spec's explicit instruction not to generate
the whole app in one pass.
