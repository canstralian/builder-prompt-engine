# Builder-Prompt-Engine

A professional web application for prompt engineering and management. Design, test, version, and share high-quality prompts for Large Language Models (LLMs) with full collaboration features and production-ready export capabilities.

## Overview

Builder-Prompt-Engine treats prompts as first-class engineering artifacts. Whether you're a solo builder experimenting with LLMs or an enterprise team managing production prompts at scale, this platform provides the tools to create reliable, tested, and version-controlled prompts.

### Key Features

- **Prompt Library** - Centralized repository for organizing, versioning, and sharing prompts with tagging, folders, and full-text search
- **Prompt Builder** - Guided 5-step wizard for structured prompt creation:
  - Goal: Define output requirements
  - Context: Set inputs and variables
  - Style: Configure tone and formatting
  - Safety: Add guardrails and constraints
  - Output: Specify schema and format
- **Test & Iterate** - Run test variants, evaluate outputs, and track improvements across versions
- **Team Workspaces** - Collaborate with role-based access control (RBAC), approvals, and audit trails
- **Production-Ready Export** - JSON and Markdown export with version control and immutable history
- **Learning Resources** - Educational content with categorized tutorials and best practices

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI with hooks for state management |
| **TypeScript** | Type-safe development with auto-generated Supabase types |
| **Vite** | Fast build tool with hot module replacement (HMR) |
| **Tailwind CSS** | Utility-first styling with custom animations and dark mode |
| **shadcn/ui** | Accessible, customizable component library built on Radix UI |
| **Supabase** | Backend-as-a-service with PostgreSQL, authentication, and real-time subscriptions |
| **TanStack Query** | Server state management with caching and automatic invalidation |
| **React Hook Form + Zod** | Performant form handling with schema validation |
| **React Router** | Client-side routing with protected and admin route guards |

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** package manager
- **Supabase account** (for backend services)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/<your-github-username>/builder-prompt-engine.git
   cd builder-prompt-engine
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or with bun
   bun install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```sh
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create production build |
| `npm run build:dev` | Create development build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Run tests in watch mode |

---

## Project Structure

```
src/
├── pages/                    # Route components
│   ├── LandingPage.tsx       # Marketing homepage
│   ├── PricingPage.tsx       # Pricing tiers
│   ├── AuthPage.tsx          # Authentication
│   ├── LearnPage.tsx         # Learning resources
│   ├── LearnPostPage.tsx     # Individual learn post view
│   ├── PublicLibraryPage.tsx # Public prompt library
│   ├── NotFound.tsx          # 404 page
│   └── app/                  # Protected application pages
│       ├── DashboardPage.tsx
│       ├── PromptBuilderPage.tsx
│       ├── PromptLibraryPage.tsx
│       ├── BillingPage.tsx
│       ├── TestRunsPage.tsx
│       ├── WorkspacePage.tsx
│       └── AdminPage.tsx
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Layout components (headers, sidebars)
│   └── auth/                 # Authentication components
├── hooks/                    # Custom React hooks
│   ├── useAuth.tsx           # Authentication context
│   ├── useAdminRole.ts       # RBAC role checking
│   └── useLearnPosts.ts      # Data fetching hooks
├── integrations/
│   └── supabase/             # Supabase client and types
├── lib/                      # Utility functions
├── App.tsx                   # Main routing configuration
└── main.tsx                  # Application entry point

supabase/
├── config.toml               # Supabase local configuration
└── migrations/               # Database migrations
```

---

## Deployment

### Static Hosting (Vercel, Netlify, etc.)

1. **Build the application**
   ```sh
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting provider

**Vercel:**
```sh
npx vercel --prod
```

**Netlify:**
```sh
npx netlify deploy --prod --dir=dist
```

### Environment Variables for Production

Ensure these environment variables are configured in your hosting provider:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anonymous/public key

### SPA Routing Configuration

This is a Single Page Application. Configure your hosting to redirect all routes to `index.html`:

**Netlify** - Create `public/_redirects`:
```
/* /index.html   200
```

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Database Setup

This project uses Supabase for backend services. The database schema includes:

- **profiles** - User profile information
- **user_roles** - Role-based access control mappings
- **learn_posts** - Educational content and tutorials
- **learn_categories** - Content categorization

Database migrations are located in `supabase/migrations/`. Apply them using the Supabase CLI:

```sh
npx supabase db push
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow the existing code style** - TypeScript strict mode, ESLint rules
3. **Write tests** for new functionality using Vitest
4. **Submit a pull request** with a clear description of changes

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing component structure and naming conventions
- Ensure accessibility by using Radix UI primitives where applicable
- Run `npm run lint` and `npm run test` before submitting PRs

---

## License

This project is open source. See the repository for license details.

---

## Acknowledgments

Built with modern web technologies including React, Vite, Tailwind CSS, shadcn/ui, and Supabase.
