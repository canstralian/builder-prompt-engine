# PromptCrafting Project Rules (Source of Truth)

## Product intent
Build a premium, trustworthy SaaS for prompt-engineering workflows. Prioritise correctness, security, clarity, and a calm UX over feature volume. Favour small, reliable primitives (prompts, versions, test runs, posts) that evolve cleanly.

## Engineering principles
1. **Strict multi-tenancy**
   - Every read/write is scoped by `workspace_id` unless explicitly global (learn content).
   - Never trust client-provided `workspace_id`; validate membership server-side.

2. **Idempotent seed data**
   - Seed functions are safe to run repeatedly.
   - Use upserts/unique constraints; never create duplicates.

3. **Low-impact execution**
   - Avoid heavy operations or disruptive background jobs in request flows.
   - Default test runs are simulated; no external model calls required.

4. **Validation + safe rendering**
   - Validate all inputs server-side.
   - Sanitize markdown and user content.
   - Treat templates/variables as untrusted input.

5. **Clear errors**
   - No silent failures.
   - User-facing messages are clear; developer logs are detailed and safe.

## Architecture conventions
### Routes
- Public: `/`, `/pricing`, `/learn`, `/learn/{slug}`, `/library`, `/p/{slug}`, `/auth`
- App (auth required): `/app/*`

> **Note:** `/auth` is a standalone public page (outside the marketing layout) that handles
> sign-in and sign-up (`/auth?mode=signup`). Authenticated users are automatically
> redirected to `/app/dashboard`.

### App shell
- Under `/app`: left sidebar with workspace switcher + primary navigation.

### Data access
- Centralise DB access under `/lib/db/*`. UI components must not query DB directly.
- Helpers: `requireUser()`, `requireWorkspaceMembership(workspaceId)`, `requireSiteAdmin()`.

### Global vs workspace-scoped
- Global: `learn_categories`, `posts`, `newsletter_signups`
- Workspace-scoped: `prompt_categories`, `tags`, `prompts`, `prompt_versions`, `collections`,
  `test_runs`, `memberships`, `invites`, `audit_log`, `usage`, `workspace_plan`

## Naming & style
- TypeScript strict; avoid `any`.
- Route folders: kebab-case; functions: camelCase; components: PascalCase.
- Models singular in code; tables plural in DB.
- Enums:
  - `target_model`: `"any" | "openai-compatible" | "local"`
  - `prompt_status`: `"Draft" | "Reviewed" | "Approved"`
  - `roles`: `"owner" | "admin" | "member" | "viewer"`
- Prefer early returns and small, readable functions.

## Security requirements
- `/app/*` enforces server-side session checks.
- Roles:
  - Viewer: read-only
  - Member: create/edit own content
  - Admin/Owner: manage members, approvals, workspace settings
  - Site admin: `/app/admin` + global learn management
- Rate-limit auth endpoints and invite creation.
- Never log plaintext secrets; mask API keys.
- Provider settings optional and disabled by default.
- Public sharing:
  - `/p/{slug}` read-only; no workspace metadata leaks.
  - Public prompt pages show only latest version display fields.

## Seed data (critical)
### Admin-only seed panel (`/app/admin`)
Actions:
- Seed Workspace Prompts (categories, tags, prompts, versions)
- Seed Global Learn Posts
- Show counts created/skipped/errors

Idempotency keys:
- `prompt_categories`: (`workspace_id`, `slug`)
- `tags`: (`workspace_id`, `name`)
- `prompts`: (`workspace_id`, `public_slug`)
- `prompt_versions`: (`prompt_id`, `version_number`)
- `learn_categories`: (`slug`)
- `posts`: (`slug`)
- `newsletter_signups`: (`email`)

Rules:
- Create missing referenced categories/tags.
- Never overwrite existing content by default.
- Only learn posts may provide an overwrite toggle.

## UX guidelines
- Premium calm UI: whitespace, hierarchy, minimal clutter.
- Empty states include a primary CTA.
- Complex screens include inline help (variables, versions, sharing).
- Fast forms: client hints + server validation.
- Prefer predictable lists/tables with filters over dashboards.

## Testing & reliability
- Simulated test outputs by default; no external calls required.
- Live model calls behind explicit toggle + warnings.
- Unit tests: permission logic + seed idempotency.

## Content guidelines
- Microcopy: practical, concise, non-salesy.
- Learn posts: short sections, checklists, templates.

## Change policy
- Incremental changes; avoid refactors unless essential.
- Preserve existing routes/components unless stability improves.
- When uncertain, implement the simplest working version first.
