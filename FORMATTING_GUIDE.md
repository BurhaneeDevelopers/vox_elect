# VoxElect Formatting Guide

## Design System

### Color Palette
```css
--color-primary: #2D5016;      /* forest green — civic trust */
--color-accent: #C9A84C;       /* warm gold — importance, celebration */
--color-bg: #F5F0E8;           /* warm parchment — base background */
--color-surface: #FFFFFF;      /* pure white — chat surfaces */
--color-text: #1C1917;         /* warm near-black */
--color-text-muted: #6B7280;   /* muted gray — secondary text */
--color-border: #E8E0D0;       /* warm light border */
--color-user-bubble: #FDF3DC;  /* gold-tinted user messages */
--color-elara-border: #2D5016; /* green left-border on Elara messages */
```

### Typography
```css
/* Display / Headers */
font-family: 'Playfair Display', Georgia, serif;

/* Body / UI */
font-family: 'Crimson Pro', Georgia, serif;  /* for Elara's prose */
font-family: 'DM Sans', system-ui, sans-serif; /* for UI elements */
```

---

## Chat Bubble Styles

### User Messages
- Background: `--color-user-bubble` (#FDF3DC)
- Border: 1px solid rgba(201, 168, 76, 0.3)
- Border-radius: 18px 18px 4px 18px
- Alignment: right-aligned, max-width 75%
- Shadow: subtle warm drop shadow

### Elara Messages
- Background: `#FFFFFF`
- Left border: 3px solid `--color-primary` (#2D5016)
- Border-radius: 4px 18px 18px 18px
- Alignment: left-aligned, max-width 80%
- Avatar: shown above first message in a sequence

---

## Markdown Components

### Rendered in Chat

| Markdown | Component |
|---|---|
| `## Header` | `ElectionHeader` — Playfair Display, forest green |
| `1. 2. 3.` ordered list | `StepList` — numbered with gold circles |
| `- ` unordered list | `BulletList` — green bullet points |
| `> blockquote` | `CalloutBox` — parchment bg, gold left-border |
| `` `code` `` | `InlineCode` — monospace, light green bg |
| `**bold**` | Forest green bold text |
| `[link](url)` | Gold underline links |

### Special Components

**Timeline Step** — triggered by numbered lists describing processes:
```
Step 1 → animated circle fills
Step 2 → connects with animated line
...
```
Animation: steps appear sequentially with 200ms delay each

**Deadline Callout:**
```
> ⚠️ **Registration Deadline:** October 7, 2024 — 15 days away
```
Rendered as: amber callout with countdown badge

**Candidate Comparison Card:**
- Two-column layout
- Factual data only (office, party, website)
- No imagery (avoids bias)

**Ballot Measure Card:**
- Title, type (constitutional amendment, statute, etc.)
- What it would do (neutral language)
- Pro/con summary (citing official ballot arguments where available)
- Source link

---

## Animation Tokens

```css
--animation-slide-up: translateY(20px) → translateY(0), opacity 0→1, 300ms ease-out
--animation-pulse-gentle: scale 1.0→1.05→1.0, 3s infinite
--animation-step-enter: opacity 0→1, translateX(-10px)→(0), 200ms ease-out, staggered
--animation-speaking-ring: scale 1.0→1.8, opacity 1→0, 1.2s infinite
```

---

## Suggested Follow-Up Chips

Displayed below each Elara response:
- 3 chips max
- Pill-shaped, forest green outline, forest green text
- Hover: fills with forest green, text turns white
- Click: sends as new message

Example chips:
> "How do I register?" | "What's on my ballot?" | "Where do I vote?"

---

## Layout Breakpoints

| Breakpoint | Layout |
|---|---|
| Mobile (< 768px) | Single column, chat only; sidebars as bottom sheets |
| Tablet (768–1024px) | Chat + left sidebar visible; right panel hidden |
| Desktop (> 1024px) | Full three-panel layout |
