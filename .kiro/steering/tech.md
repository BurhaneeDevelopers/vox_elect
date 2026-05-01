# Tech Stack

## Framework & Runtime
- **Next.js 16.2** (App Router) with React 19.2
- **TypeScript 5** (strict mode enabled)
- **Node.js 20+** or Bun runtime

## Frontend Stack
- **Tailwind CSS 4** for styling
- **Zustand** for state management
- **React Query (@tanstack/react-query)** for data fetching
- **Framer Motion** for animations
- **Lucide React** for icons
- **react-markdown** + **remark-gfm** for markdown rendering
- **react-syntax-highlighter** for code blocks

## Backend & APIs
- **Google Gemini 1.5 Pro** (`@google/generative-ai`) - AI model
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) - Auth, database, RLS
- **Razorpay** - Payment processing
- **Tavily API** - Web search integration
- **OpenStates API** - State legislature data
- **civicAPI.org** - Election data

## Development Tools
- **ESLint** for linting
- **TypeScript compiler** for type checking

## Common Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
bun dev             # Alternative with Bun

# Type checking
npm run typecheck   # Run TypeScript compiler without emitting

# Linting
npm run lint        # Run ESLint

# Production
npm run build       # Build for production
npm start           # Start production server
```

## Environment Variables

Required:
- `GEMINI_API_KEY` - Google Gemini API key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

Optional:
- `TAVILY_API_KEY` - Web search API
- `OPENSTATES_API_KEY` - State legislature data
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay public key
- `RAZORPAY_KEY_SECRET` - Razorpay secret key

## Database Setup

Run Supabase migrations in order:
1. `001_create_profiles_table.sql`
2. `002_create_chat_history_table.sql`
3. `003_create_analytics_tables.sql`
4. `004_add_message_branching.sql`
5. `005_create_conversations_tables.sql`

Execute in Supabase SQL Editor or via CLI.
