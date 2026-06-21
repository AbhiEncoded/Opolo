# opolo — Find Your Study City

AI-powered city matching for international students choosing between Boston, Paris, and the Netherlands.

## Run instantly (no setup needed)

```bash
npm install
npm run dev
```

Open http://localhost:5173

The app works fully out of the box. The `.env` file with the Gemini API key is already included.

## What the AI does

- **Matching transparency** — after your quiz, Claude/Gemini explains *why* each city scored what it did, with inline source citations (`[city_data]`, `[general_knowledge]`, `[profile_inference]`)
- **Pros, cons, and mismatches** — not just a score, but an honest breakdown of what works and what doesn't for *your specific profile*
- **Why not the other cities** — explains the concrete reasons the runner-up cities scored lower
- **Data validation** — flags any dataset values that might be stale and tells you what to verify independently
- **Follow-up refinement** — after seeing results, 3 targeted questions adjust your weights and re-rank cities
- **Peer intro messages** — one-click AI-drafted email to a peer student in your top city
- **Full AI Insights page** — visa assessment, personalised budget breakdown, relocation checklist

## Tech stack

React 18 · Vite · Tailwind CSS · React Router v6 · Recharts · Google Gemini 1.5 Flash

## Changing the AI model

Edit `GEMINI_MODEL` in `src/lib/aiService.js`:
```js
const GEMINI_MODEL = 'gemini-1.5-flash'  // or gemini-2.0-flash, gemini-2.5-flash
```
