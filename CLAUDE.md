# Elora — Project Context

Election education AI chatbot. Next.js 16 App Router. Gemini 1.5 Pro for AI.
Civic Information API for voter data. Voice I/O via Web Speech API.

## Architecture

```
src/
├── app/
│   ├── chat/page.tsx          ← Main chat UI (client component, 3-column layout)
│   ├── api/chat/route.ts      ← Gemini streaming POST endpoint
│   ├── api/elections/route.ts ← Google Civic API proxy (GET)
│   └── layout.tsx             ← Root layout with Providers
├── components/
│   ├── chat/
│   │   ├── chat_layout.tsx    ← 3-column layout wrapper
│   │   ├── chat_window.tsx    ← Message list + input area
│   │   ├── chat_message.tsx   ← Individual message bubble
│   │   ├── chat_input.tsx     ← Input bar with voice + send
│   │   ├── voice_button.tsx   ← Mic button with waveform
│   │   ├── response_renderer.tsx ← ReactMarkdown with election theme
│   │   └── suggested_questions_bar.tsx ← Follow-up question chips
│   ├── sidebar/
│   │   ├── election_calendar_sidebar.tsx ← Election events list
│   │   └── deadline_countdown.tsx ← Single deadline timer
│   ├── panels/
│   │   └── info_panel.tsx     ← Sources / Polling / About tabs
│   └── ui/
│       └── providers.tsx      ← QueryClientProvider
├── hooks/
│   ├── use_chat.ts            ← Core chat send/stream hook
│   ├── use_voice.ts           ← Web Speech API hook
│   └── use_election_data.ts   ← React Query hooks for election API
├── lib/
│   ├── gemini_client.ts       ← Gemini 1.5 Pro streaming client
│   ├── civic_api_client.ts    ← Google Civic API wrapper
│   ├── prompt_loader.ts       ← Loads /prompts/Elora_system_prompt.txt
│   ├── query_client_config.ts ← TanStack Query config
│   └── utils.ts               ← cn(), generate_id(), sanitise_input(), etc.
├── stores/
│   └── chat_store.ts          ← Zustand session + voice + location state
└── types/
    ├── chat_types.ts
    ├── election_types.ts
    └── voice_types.ts
prompts/
└── Elora_system_prompt.txt    ← Elora persona + rules (loaded at runtime)
```

## Key Constraints

- AI must never take political positions — see prompts/Elora_system_prompt.txt
- All election data must cite source — handled in system prompt
- Voice feature degrades gracefully if browser unsupported (use_voice.ts checks support)
- Gemini system prompt lives in /prompts/Elora_system_prompt.txt — never hardcode
- API keys are server-side only — civic API calls go through /api/elections proxy
- Rate limiting on /api/chat: 60 req/min per IP (in-memory; use Redis in production)

## Naming Convention

All file names and variables use snake_case.

## Testing

Run: npm run typecheck  
Run: npm run lint
