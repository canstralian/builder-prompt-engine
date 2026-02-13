# CLAUDE.md

## Quick Reference

```bash
npm run dev          # Start Express dev server (Vite HMR middleware) on port 5000
npm run build        # Production build: Vite (client) + esbuild (server → dist/index.cjs)
npm run lint         # ESLint (flat config, TS + React)
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run test         # Vitest (single run)
npm run test:watch   # Vitest in watch mode
npm run db:push      # Push Drizzle schema to PostgreSQL (drizzle-kit push)
npm run db:seed      # Seed learn categories and posts (tsx server/seed.ts)
```

## Tech Stack

- **Frontend:** React 18 + TypeScript 5.8 + Vite 7
- **Backend:** Express 5 + TypeScript (bundled with esbuild)
- **Database:** PostgreSQL via Drizzle ORM (schema in `shared/schema.ts`)
- **Auth:** express-session (PostgreSQL-backed via connect-pg-simple) + bcrypt
- **UI:** shadcn/ui (55+ Radix primitives) + TailwindCSS 3 + Framer Motion
- **State/Data:** TanStack React Query (client) + Drizzle ORM (server)
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router DOM 7
- **Security:** Helmet, express-rate-limit, CSRF origin checking, DOMPurify (client-side HTML sanitization)
- **Hosting:** Cloudflare Pages (wrangler.toml)

## Project Structure

```
client/
  src/
    components/
      ui/              # 55+ shadcn components — do not manually edit, use shadcn CLI
      auth/            # AuthForm, AuthBranding, ProtectedRoute, AdminRoute
      layout/          # PublicLayout, AppLayout, Header, AppHeader, AppSidebar, Footer
      test-runs/       # NewTestRunDialog
      ErrorBoundary.tsx
    pages/
      app/             # Protected routes: Dashboard, PromptLibrary, PromptBuilder, Tests, Billing, Admin, Workspace
      *.tsx            # Public routes: Landing, Pricing, Learn, LearnPost, PublicLibrary, Auth, NotFound
    hooks/             # useAuth, useSubscription, useTestRuns, useLearnPosts, useAdminStats, etc.
    lib/               # Utilities (utils.ts, stripe.ts, queryClient.ts)
    test/              # Vitest setup (setup.ts)
    App.tsx            # Route definitions
    main.tsx           # Entry point
server/
  index.ts             # Express app setup, session config, middleware, port 5000
  routes.ts            # All API route handlers (/api/auth/*, /api/learn/*, /api/drafts/*, /api/test-runs/*, /api/admin/*)
  middleware.ts        # requireAuth, requireAdmin, csrfProtection, rate limiters, securityHeaders
  storage.ts           # DatabaseStorage class (data access layer implementing IStorage)
  db.ts                # Drizzle ORM + pg Pool initialization
  seed.ts              # Seed learn_categories and learn_posts
  vite.ts              # Vite dev middleware + static file serving
shared/
  schema.ts            # Drizzle ORM table definitions + Zod validation schemas (shared between client and server)
migrations/            # Drizzle-kit generated SQL migrations
data/                  # Seed datasets (prompt-stress-test-dataset.json)
.github/
  workflows/ci.yml     # CI pipeline
  actions/setup-app/   # Reusable checkout + Node + npm ci action
```

## Path Aliases

- `@/*` → `./client/src/*` — use `@/components/ui/button` not relative paths
- `@shared/*` → `./shared/*` — use `@shared/schema` for shared types/schemas

## Environment Variables

Required:
- `DATABASE_URL` — PostgreSQL connection string (used by Drizzle ORM and session store)
- `SESSION_SECRET` — Express session encryption key (falls back to dev default in development)

Optional:
- `NODE_ENV` — `development` | `production` (affects error verbosity, secure cookies, static serving)

## API Routes

All routes are prefixed with `/api/`:

| Route | Auth | Description |
|---|---|---|
| `POST /api/auth/register` | No (rate-limited) | Register with email/password |
| `POST /api/auth/login` | No (rate-limited) | Login, sets session |
| `POST /api/auth/logout` | No | Destroy session |
| `GET /api/auth/me` | No | Current user or null |
| `GET /api/learn/categories` | No | All learn categories |
| `GET /api/learn/posts` | No | Published posts (optional `?categorySlug=`) |
| `GET /api/learn/posts/:slug` | No | Single published post |
| `POST /api/drafts` | No | Create prompt draft |
| `GET /api/drafts/:id` | No | Retrieve draft |
| `GET /api/test-runs` | Yes | User's test runs |
| `GET /api/test-runs/:id` | Yes | Single test run (must own) |
| `POST /api/test-runs` | Yes | Create test run |
| `PATCH /api/test-runs/:id/ratings` | Yes | Update ratings |
| `GET /api/admin/stats` | Admin | User/post/category counts |

## Database Schema

Defined in `shared/schema.ts` using Drizzle ORM:

- **users** — email (unique), hashed password, fullName, role (`user` | `admin`), timestamps
- **learn_categories** — name, slug (unique), description
- **learn_posts** — title, slug (unique), category_id (FK), tags (text[]), summary, body (markdown), is_published
- **drafts** — user_id (FK, optional), session_id, source, goal, output_format, sections_json (JSONB), compiled_prompt
- **test_runs** — user_id (FK), draft_id (FK, optional), promptTitle, systemPrompt, userPrompt, ratings (clarity/completeness/correctness/styleMatch 1-5), notes

## Key Conventions

- **Naming:** Components PascalCase, functions camelCase, route folders kebab-case, DB tables plural, models singular
- **Imports:** Use `@/` alias for client code, `@shared/` for shared code
- **Components:** Prefer Radix/shadcn primitives over custom implementations
- **Data fetching:** Use TanStack React Query hooks on the client, never call the DB directly from components
- **Data access:** Server-side DB queries go through the `DatabaseStorage` class in `server/storage.ts`
- **Validation:** Zod schemas on all API request handlers; shared schemas in `shared/schema.ts`
- **Styling:** TailwindCSS utility classes; dark mode via class strategy (`next-themes`)
- **Sanitization:** Always sanitize user HTML/markdown with DOMPurify on the client
- **Error handling:** No silent failures; production errors are sanitized, dev errors show full details

## TypeScript Config Notes

> **Technical debt:** The settings below contradict the README's principle of "TypeScript strict; avoid `any`." New code should use explicit types and handle `null`/`undefined` properly even though the compiler does not enforce it yet.

- `strictNullChecks: false` — null checks not enforced (write null-safe code anyway)
- `noImplicitAny: false` — implicit `any` allowed (avoid `any` in new code)
- `@typescript-eslint/no-unused-vars: off` — unused vars don't trigger lint errors (clean up dead code when touching a file)

## Authentication & Authorization

- **Method:** Session-based (not JWT). Sessions stored in PostgreSQL via `connect-pg-simple`.
- **Password hashing:** bcrypt with cost factor 12
- **Registration validation:** 8+ chars, uppercase, lowercase, number required
- **Middleware:** `requireAuth` checks `session.userId`; `requireAdmin` checks `user.role === "admin"`
- **Rate limiting:** Auth endpoints: 20 req/15 min. General API: 200 req/15 min.
- **CSRF protection:** Origin/referer validation on state-changing requests

## Frontend Routes

**Public** (via `PublicLayout`):
- `/` — Landing
- `/pricing` — Pricing
- `/learn` — Learn posts
- `/learn/:slug` — Individual post
- `/library` — Public library

**Auth** (standalone):
- `/auth` — Login/signup (`?mode=signup`); redirects authenticated users to dashboard

**Protected** (via `ProtectedRoute` + `AppLayout`):
- `/app/dashboard`, `/app/library`, `/app/prompts/new`, `/app/prompts/:id`
- `/app/tests`, `/app/tests/:id`, `/app/workspace`, `/app/billing`
- `/app/admin` — Admin-only (via `AdminRoute`)

## Testing

- **Framework:** Vitest 3.2 with jsdom environment
- **Libraries:** @testing-library/react + @testing-library/jest-dom
- **Location:** Co-located as `*.test.{ts,tsx}` or `*.spec.{ts,tsx}` under `client/src/`
- **Globals:** Vitest globals enabled (no need to import `describe`, `it`, `expect`)
- **Setup:** `client/src/test/setup.ts` (defines `window.matchMedia` mock)
- **Config:** `vitest.config.ts` at project root (separate from `vite.config.ts`)
- **Test runs feature:** Simulated by default — no external model calls required

## CI Pipeline

CI runs on push to main/master and on PRs (`.github/workflows/ci.yml`). All must pass before build:
1. **Lint** — `npm run lint` (Node 20)
2. **Type Check** — `npm run typecheck` (Node 20)
3. **Test** — `npm run test` (Node 18, 20, 22 matrix, fail-fast: false)
4. **Security Audit** — `npm audit --audit-level=high --omit=dev` (Node 20)
5. **Build** — `npm run build` (depends on all above; uploads `dist/` artifact, 7-day retention)

## Architecture Rules

- **Data access:** All DB queries go through `server/storage.ts`. UI components must not query DB directly.
- **Shared types:** Drizzle schemas and Zod validators live in `shared/schema.ts` and are imported by both client and server.
- **Seed data:** Must be idempotent — use upserts/unique constraints, never create duplicates.
- **Roles:** `user` (standard) → `admin` (manage content, view stats via `/app/admin`)
- **Dual access:** Drafts support both authenticated (user_id) and anonymous (session_id) access.

## Change Policy

- Incremental changes only; avoid unnecessary refactors
- Preserve existing routes/components unless stability improves
- When uncertain, implement the simplest working version first
- See `README.md` for full project rules and engineering principles
