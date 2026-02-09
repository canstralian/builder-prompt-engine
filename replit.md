# PromptCrafting - AI Prompt Engineering SaaS

## Overview
PromptCrafting is a professional-grade SaaS application for designing, testing, and versioning AI prompts. Originally built with Lovable (Supabase backend), now migrated to Replit's fullstack JavaScript template.

## Recent Changes
- **Feb 2026**: Security & performance hardening
  - Added helmet middleware for HTTP security headers
  - Added rate limiting on auth routes (20 req/15min) and API routes (200 req/15min)
  - Improved session security: httpOnly cookies, sameSite=lax, secure cookie name
  - Added Zod-based input validation on auth routes with password strength requirements
  - Sanitized error responses to prevent leaking internal details in production
  - Created reusable auth middleware (requireAuth, requireAdmin) for route protection
  - Added request body size limits (1MB)
  - Increased bcrypt salt rounds from 10 to 12
  - Added parameter validation on ID-based routes
- **Feb 2026**: Migrated from Supabase to Replit fullstack JS template
  - Replaced Supabase Auth with session-based auth (bcrypt + express-session)
  - Replaced Supabase edge functions with Express API routes
  - Replaced Supabase client calls with fetch-based API calls
  - Added Drizzle ORM with PostgreSQL
  - Seeded learn categories and posts

## Project Architecture

### Directory Structure
```
client/                  # Frontend (React + Vite)
  src/
    components/          # Reusable UI components (shadcn/ui based)
      auth/              # AuthForm, ProtectedRoute, AdminRoute
      layout/            # AppLayout, PublicLayout, AppHeader, AppSidebar
      ui/                # shadcn components + custom motion components
    hooks/               # React hooks (useAuth, useLearnPosts, useTestRuns, etc.)
    lib/                 # Utilities (queryClient, utils, stripe config)
    pages/               # Route pages
      app/               # Protected app pages (Dashboard, Library, Tests, Billing, Admin)
      LandingPage.tsx    # Public landing page
      LearnPage.tsx      # Public learn/blog page
      AuthPage.tsx       # Login/signup page
  index.html

server/                  # Backend (Express + Node.js)
  index.ts               # Express app setup with security middleware, session config
  routes.ts              # API routes (auth, learn, drafts, test-runs, admin)
  middleware.ts           # Security middleware (helmet, rate limiting, auth guards, error sanitization)
  storage.ts             # IStorage interface + DatabaseStorage implementation
  db.ts                  # Drizzle + pg Pool setup
  vite.ts                # Vite dev server middleware
  seed.ts                # Database seed script for learn content

shared/                  # Shared between frontend and backend
  schema.ts              # Drizzle schema (users, learn_categories, learn_posts, drafts, test_runs)

attached_assets/         # Static assets referenced in frontend
```

### Tech Stack
- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui, React Router, TanStack Query
- **Backend**: Express.js, TypeScript, Drizzle ORM, bcrypt, express-session
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Routing**: react-router-dom (kept from original Lovable app)
- **State**: TanStack Query for server state, React context for auth

### Key Design Decisions
- Used react-router-dom instead of wouter to preserve existing component structure
- Session-based auth with bcrypt password hashing (no OAuth yet)
- Stripe integration present but not connected (placeholder toasts)
- AI test generation not connected (returns placeholder outputs)

### Database Models
- **users**: id, email, password, fullName, avatarUrl, role, timestamps
- **learn_categories**: id, name, slug, description, timestamps
- **learn_posts**: id, title, slug, categoryId, tags[], summary, bodyMarkdown, isPublished, timestamps
- **drafts**: id, userId, sessionId, source, goal, context, outputFormat, sectionsJson, compiledPrompt, metaJson, timestamps, expiresAt
- **test_runs**: id, userId, draftId, promptTitle, systemPrompt, userPrompt, inputVariables, outputs, ratings (clarity/completeness/correctness/styleMatch), notes, timestamps

### API Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/learn/categories` - List learn categories
- `GET /api/learn/posts` - List learn posts (optional ?categorySlug=)
- `GET /api/learn/posts/:slug` - Get single post by slug
- `POST /api/drafts` - Create draft
- `GET /api/drafts/:id` - Get draft
- `GET /api/test-runs` - List user's test runs
- `GET /api/test-runs/:id` - Get single test run
- `POST /api/test-runs` - Create test run
- `PATCH /api/test-runs/:id/ratings` - Update test run ratings
- `GET /api/admin/stats` - Admin statistics

## User Preferences
- Dark mode support via next-themes
- Theme toggle in header

## Running the Project
- `npm run dev` starts the Express server with Vite middleware on port 5000
- `npm run db:push` pushes Drizzle schema to database
- `npm run db:seed` seeds learn categories and posts
