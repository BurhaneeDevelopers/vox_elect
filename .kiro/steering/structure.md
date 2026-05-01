# Project Structure & Conventions

## Directory Organization

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (server-side)
│   │   ├── chat/          # Gemini streaming endpoint
│   │   ├── elections/     # Election data endpoints
│   │   ├── profile/       # User profile endpoints
│   │   └── razorpay/      # Payment endpoints
│   ├── chat/              # Chat pages
│   ├── login/             # Auth pages
│   └── register/
├── components/            # React components
│   ├── auth/              # Auth forms, guards, user menu
│   ├── chat/              # Chat UI (messages, input, window)
│   ├── panels/            # Info panels
│   ├── sidebar/           # Sidebar components
│   └── ui/                # UI providers
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Core libraries & utilities
│   ├── db/                # Database utilities
│   ├── search/            # Web search integration
│   ├── gemini_client.ts   # Gemini API client
│   ├── civic_data.ts      # Civic APIs client
│   └── supabase_client.ts # Supabase client
├── services/              # Business logic layer
├── stores/                # Zustand state stores
└── types/                 # TypeScript type definitions
```

## Naming Conventions

### Files & Folders
- **snake_case** for all files and folders: `chat_window.tsx`, `use_chat.ts`, `gemini_client.ts`
- Component files match component name: `chat_header.tsx` exports `ChatHeader`
- Hook files prefixed with `use_`: `use_chat.ts`, `use_voice.ts`

### Code
- **PascalCase** for React components: `ChatWindow`, `AuthGuard`
- **snake_case** for functions, variables, props: `send_message`, `is_loading`, `user_id`
- **SCREAMING_SNAKE_CASE** for constants: `RATE_LIMIT_MAX`, `AI_STATUS_MESSAGES`
- **snake_case** for TypeScript types/interfaces: `gemini_chat_request`, `chat_message`

## Architecture Patterns

### API Routes (`src/app/api/`)
- Server-side only, never called directly from components
- Use `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`
- Return `NextResponse` for JSON or `Response` for streams
- Handle rate limiting, validation, error handling

### Client Components
- Mark with `'use client'` directive at top
- Use hooks for state management (Zustand stores, React Query)
- Keep components focused and composable
- Extract business logic to hooks or services

### State Management
- **Zustand** for global state (chat store)
- **React Query** for server state (elections, user data)
- **React Context** for scoped state (location, chat history)
- Local `useState` for component-only state

### API Client Pattern
- Centralized clients in `src/lib/`: `gemini_client.ts`, `supabase_client.ts`
- Never call external APIs directly from components
- All Gemini interactions route through `gemini_client.ts`
- All Supabase queries route through `supabase_client.ts`

### Type Safety
- Define types in `src/types/` by domain: `chat_types.ts`, `auth_types.ts`
- Use TypeScript strict mode
- Avoid `any` - use `unknown` or proper types
- Export types for reuse across modules

## Code Style

### Imports
- Group imports: external packages → internal modules → types
- Use path alias `@/` for src imports: `import { use_chat } from '@/hooks/use_chat'`

### Comments
- JSDoc comments for exported functions and complex logic
- Inline comments for non-obvious code
- Module-level comments explaining purpose

### Error Handling
- Try-catch for async operations
- Graceful degradation for optional features
- User-friendly error messages (never expose stack traces)

## Key Conventions

### Chat System
- Messages have `role` (user/assistant/system) and `content`
- Streaming responses append chunks to message content
- Message status: `streaming`, `complete`, `error`
- Always sanitize user input before processing

### Location Context
- ZIP code + state stored in chat store
- 7-day cache in localStorage
- Auto-extracted from user messages
- Used for localized election queries

### Voice Features
- Web Speech API (browser-dependent)
- Strip markdown before TTS
- Graceful fallback if unsupported

### Rate Limiting
- In-memory map for development (60 req/min per IP)
- Replace with Redis/Upstash for production
- Applied at API route level
