# CLAUDE.md

## Quick Reference

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Production build (Vite)
npm run lint         # ESLint (flat config, TS + React)
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run test         # Vitest (single run)
npm run test:watch   # Vitest in watch mode
```

## Tech Stack

- **Framework:** React 18 + TypeScript 5.8 + Vite 7
- **UI:** shadcn/ui (Radix primitives) + TailwindCSS 3 + Framer Motion
- **State/Data:** TanStack React Query + Supabase (PostgreSQL + Auth + Edge Functions)
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router DOM 6
- **Payments:** Stripe
- **Hosting:** Cloudflare Pages

## Project Structure

```
src/
  components/
    ui/              # 40+ shadcn components — do not manually edit, use shadcn CLI
    auth/            # Authentication components
    layout/          # PublicLayout, AppLayout
    test-runs/       # Test run UI components
  pages/
    app/             # Protected routes (require auth): Dashboard, Library, Builder, Tests, Billing, Admin
    *.tsx            # Public routes: Landing, Pricing, Learn, Library
                     # Auth page (/auth) — unauthenticated access, not listed in README public routes
  hooks/             # Custom hooks (useAuth, useSubscription, useTestRuns, etc.)
  lib/               # Utilities (utils.ts, stripe.ts)
  integrations/
    supabase/        # Supabase client config and types
  test/              # Test setup (setup.ts)
supabase/
  functions/         # Edge Functions (check-subscription, create-checkout, etc.)
  migrations/        # SQL migrations
```

## Path Alias

`@/*` maps to `./src/*` — use `@/components/ui/button` not `../../components/ui/button`.

## Key Conventions

- **Naming:** Components PascalCase, functions camelCase, route folders kebab-case, DB tables plural, models singular
- **Imports:** Use `@/` path alias everywhere in `src/`
- **Components:** Prefer Radix/shadcn primitives over custom implementations
- **Data fetching:** Use TanStack React Query hooks, not direct Supabase calls from components
- **Styling:** TailwindCSS utility classes; dark mode via class strategy (`next-themes`)
- **Sanitization:** Always sanitize user HTML/markdown with DOMPurify
- **Error handling:** No silent failures; user-facing messages must be clear

## TypeScript Config Notes

> **Technical debt:** The settings below contradict the README's principle of "TypeScript strict; avoid `any`." New code should use explicit types and handle `null`/`undefined` properly even though the compiler does not enforce it yet. Enabling stricter checks is a planned follow-up.

- `strictNullChecks: false` — null checks are not enforced (treat as temporary; write null-safe code anyway)
- `noImplicitAny: false` — implicit `any` is allowed (avoid `any` in new code; prefer explicit types)
- `@typescript-eslint/no-unused-vars: off` — unused vars do not trigger lint errors (clean up dead code when you touch a file)

## Architecture Rules

- **Multi-tenancy:** Every read/write scoped by `workspace_id` (except global learn content). Never trust client-provided `workspace_id`.
- **Routes:** Public (`/`, `/pricing`, `/learn`, `/library`, `/p/:slug`) + Auth (`/auth`) vs Protected (`/app/*` — server-side session checks)
- **Roles:** viewer (read-only) → member (create/edit own) → admin/owner (manage workspace) → site admin (`/app/admin`)
- **Seed data:** Must be idempotent — use upserts/unique constraints, never create duplicates

## Testing

- **Framework:** Vitest with jsdom environment
- **Libraries:** @testing-library/react + @testing-library/jest-dom
- **Location:** Co-located with source as `*.test.{ts,tsx}` or `*.spec.{ts,tsx}`
- **Globals:** Vitest globals enabled (no need to import `describe`, `it`, `expect`)
- **Test runs:** Simulated by default — no external model calls required

## CI Pipeline

CI runs on push to main/master and on PRs. All must pass before build:
1. **Lint** — `npm run lint`
2. **Type Check** — `npm run typecheck`
3. **Test** — `npm run test` (Node 18, 20, 22 matrix)
4. **Security Audit** — `npm audit --audit-level=high --omit=dev`
5. **Build** — `npm run build` (depends on all above)

## Change Policy

- Incremental changes only; avoid unnecessary refactors
- Preserve existing routes/components unless stability improves
- When uncertain, implement the simplest working version first
- See `README.md` for full project rules and engineering principles
