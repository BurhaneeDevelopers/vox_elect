# Elora — Deployment Guide

## Prerequisites

- Node.js 18+
- npm 9+
- Google Gemini API key (aistudio.google.com)
- Google Civic Information API key (console.cloud.google.com)

## Local Development

```bash
# 1. Clone and install
git clone <repo-url>
cd elora
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local and add your API keys

# 3. Start dev server
npm run dev
# App runs at http://localhost:3000
```

## Required Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini 1.5 Pro API key |
| `GOOGLE_CIVIC_API_KEY` | Yes | Google Civic Information API key |
| `OPENSTATES_API_KEY` | Optional | OpenStates API for state legislature data |
| `FEC_API_KEY` | Optional | FEC API for campaign finance |

## Google API Setup

### Gemini API
1. Go to https://aistudio.google.com/
2. Create API key
3. Add as `GEMINI_API_KEY`

### Google Civic Information API
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create/select a project
3. Enable "Google Civic Information API"
4. Create API key under Credentials
5. Restrict key to Civic Information API (recommended)
6. Add as `GOOGLE_CIVIC_API_KEY`

## Production Build

```bash
npm run build
npm run start
```

## Security Checklist

- [ ] API keys are in `.env.local` (never committed to git)
- [ ] `.gitignore` includes `.env.local`
- [ ] Rate limiting configured (default: 60 req/min per IP)
- [ ] CORS headers set appropriately
- [ ] Content Security Policy header added

## Rate Limits (Default)

- `/api/chat`: 60 requests/minute per IP (in-memory, resets on restart)
- Google Civic API: 25,000 requests/day (free tier)
- Gemini API: varies by plan

## Production Rate Limiting

Replace in-memory rate limiting in `/src/app/api/chat/route.ts` with Redis:
```ts
// Use @upstash/ratelimit with Upstash Redis for production
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
```
