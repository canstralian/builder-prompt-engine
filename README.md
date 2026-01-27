# Builder Prompt Engine

A modern SaaS platform for building, testing, and managing AI prompts. Built with React, TypeScript, Vite, and Supabase.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL + Auth)
- **State**: TanStack React Query
- **Testing**: Vitest, React Testing Library

## Quick Start

### Prerequisites

- Node.js 20+ (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm 10+
- Supabase project (for backend)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd builder-prompt-engine

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:8080

### Environment Setup

Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run test     # Run tests once
npm run test:watch  # Run tests in watch mode
```

### Verification Checklist

Before committing changes, run the full verification suite:

```bash
# 1. Lint check (should pass with only warnings)
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Run tests (all tests should pass)
npm run test

# 4. Production build
npm run build
```

All checks must pass before merging to main.

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Layout components
│   └── auth/        # Auth-related components
├── hooks/           # Custom React hooks
├── integrations/    # External service integrations
│   └── supabase/    # Supabase client and types
├── lib/             # Utility functions
├── pages/           # Page components
│   └── app/         # Protected app pages
└── test/            # Test setup
```

## Architecture

### Authentication

- Uses Supabase Auth with email/password
- `AuthProvider` context for auth state management
- `ProtectedRoute` for authenticated routes
- `AdminRoute` for admin-only routes
- Role-based access control via `user_roles` table

### Error Handling

- `ErrorBoundary` component wraps the entire app
- React Query handles async error states
- Graceful fallbacks for failed data fetches

### Security

- HTML escaping and DOMPurify sanitization for user content
- Row-Level Security (RLS) enabled on all Supabase tables
- Input validation via Zod schemas
- XSS prevention in markdown rendering

## CI/CD

GitHub Actions runs on every push and PR:
- **Lint**: ESLint validation
- **Type Check**: TypeScript compilation
- **Test**: Vitest unit tests
- **Build**: Production build
- **Security**: npm audit

## Testing

Tests are located next to the files they test (`*.test.ts` or `*.test.tsx`).

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest run src/lib/utils.test.ts
```

### Test Coverage

Currently tested:
- `cn()` utility function
- `escapeHtml()` XSS prevention
- `estimateReadTime()` calculations
- `useAuth()` context validation

## Deployment

### Via Lovable

1. Open [Lovable](https://lovable.dev)
2. Navigate to your project
3. Click Share > Publish

### Manual Deployment

```bash
npm run build
# Deploy the `dist/` folder to your hosting provider
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run verification checklist
4. Submit PR
5. CI must pass before merge

## License

Private - All rights reserved
