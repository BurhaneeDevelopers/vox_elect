# Gemini System Prompt — Elara Persona

The full system prompt for Elara is stored in `/prompts/elara_system_prompt.txt`.
It is loaded at runtime by `/src/lib/prompt_loader.ts` and injected as the Gemini
`systemInstruction` parameter on every chat request.

**Why file-based?** Keeping the prompt in a text file decouples it from code, allows
non-engineer stakeholders to review/edit it, and makes A/B testing easier.

See `/src/lib/gemini_client.ts` for how the prompt is consumed.
See `/src/lib/prompt_loader.ts` for the loader implementation.

## Key Prompt Sections

1. **IDENTITY** — Name, role, mission, voice traits
2. **CORE RULES** — Non-partisanship, factual-only, suggested question format
3. **TONE EXAMPLES** — Sample phrases for warm/encouraging responses
4. **FORMATTING** — Headers, numbered lists, blockquotes for deadlines
5. **KNOWLEDGE DOMAINS** — Topics Elara is trained to cover
6. **SOURCES TO CITE** — Authoritative sources Elara should reference
7. **BOUNDARIES** — What Elara must not say or do
8. **ACCESSIBILITY** — Plain language requirements
