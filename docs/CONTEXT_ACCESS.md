# Context access by command and route

## Life/PARA (files in `Life/`)

| Command or route | Uses Life/PARA? | Notes |
|------------------|-----------------|--------|
| **/talk** (and messages in talk mode) | Yes | Full context: PARA + recent plans + recent journals. Needs `Life/` in serverless bundle. |
| **Cron: evening-plan** (`/api/cron/evening-plan`) | Yes | `generatePlan()` uses `getPARAContext()` and `getDayTemplate()` to build tomorrow's plan. |
| **Cron: morning-prep** | No | Only reads tomorrow's plan from Redis. |
| **/today, /tomorrow** | No | Read plan from Redis only. |
| **/done, /skip, /journal, /adjust, /approve, /review, /progress** | No | Read/write Redis (plans, journals, user state) only. |
| **Journal mode** (when you send text after /journal) | No | `analyzeJournal()` uses LLM with journal text + today's plan theme only; no PARA. |
| **PWA** (plan, journal, progress APIs) | No | Plan generation is triggered by cron or by requesting a date that has no plan (then it may call planner—see below). |

## Plan generation (PARA + LLM)

- **Evening cron** (9 PM IST): Calls `generatePlan(tomorrow)` → uses:
  - **PARA** (Life/ goals, projects, areas, daily system)
  - **Day template** (weekday/weekend theme from system.md)
  - **Adjustment context**: last 3 days journal text, mood, energy, and **adjustment suggestions** from journal analysis (e.g. "If still tired, suggest lighter cardio")
  - **Recent plan completion**: last 3 days — which task IDs were done vs not done (so the plan can avoid overloading or reinforce habits)
  - **Recent journals** (raw text, last 3 days)
  - LLM
- **On-demand**: If the PWA or an API requests a plan for a date that doesn't exist, the app does not auto-generate; it returns 404/empty. So only the cron and (if you add one) an explicit “generate plan” endpoint use PARA.

## Summary

- **Life/PARA context** is used only by: **/talk** and **evening-plan cron**.
- All other Telegram commands use **Redis only** (stored plans, journals, user state). They do not need the `Life/` folder at runtime.
- `next.config.mjs` includes `Life/` in the serverless bundle for `/api/telegram/webhook`, `/api/cron/**`, and `/api/plan/**` so that /talk and the evening cron have access to PARA on Vercel.
