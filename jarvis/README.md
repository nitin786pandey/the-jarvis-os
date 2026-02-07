# Jarvis Life Planner

Autonomous daily planner that reads your PARA Life OS, generates adaptive daily tasklists via Qwen LLM, delivers them on Telegram, and accepts journal input for plan adjustment.

## Features

- **Evening (9 PM IST):** Generates tomorrow's plan from your `Life/` PARA files and sends it to Telegram.
- **Morning (7 AM IST):** Sends a "get ready" checklist (prep items) to Telegram.
- **Telegram bot:** Commands `/today`, `/tomorrow`, `/done`, `/skip`, `/journal`, `/adjust`, `/review`, `/progress`, `/help`.
- **PWA:** Installable on iOS; Today's plan, History (calendar), Progress (project rings), and journal input.

## Prerequisites

- Node 18+
- [Upstash Redis](https://upstash.com) (free tier)
- [Qwen/DashScope](https://dashscope.aliyun.com) API key (OpenAI-compatible)
- Telegram bot token from [@BotFather](https://t.me/BotFather)
- Your Telegram chat ID

## Setup

1. **Clone and install**

   ```bash
   cd jarvis && npm install
   ```

2. **Environment**

   Copy `.env.local.example` to `.env.local` and set:

   - `QWEN_API_KEY` — DashScope API key
   - `QWEN_BASE_URL` — `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
   - `QWEN_MODEL` — e.g. `qwen-plus`
   - `TELEGRAM_BOT_TOKEN` — from BotFather
   - `TELEGRAM_CHAT_ID` — your chat ID (send a message to the bot, then `GET https://api.telegram.org/bot<TOKEN>/getUpdates`)
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — from Upstash dashboard
   - `CRON_SECRET` — random string to protect cron endpoints

3. **Life/ path**

   The app reads `Life/` (Projects, Areas, Daily/system, Resources) to build context. By default it looks for `../Life` (parent of `jarvis/`). On Vercel, set **Root Directory** to the folder that contains both `jarvis` and `Life` (e.g. `The Jarvis OS`), and set **Build command** to `cd jarvis && npm run build`, **Output directory** to `jarvis/.next`. Alternatively set `LIFE_PATH=./Life` and copy the `Life` folder into `jarvis/` for deployment.

## Local run

```bash
npm run dev
```

- App: http://localhost:3000
- Cron are not run locally; trigger manually: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" "http://localhost:3000/api/cron/evening-plan"`

## Deploy to Vercel

1. Push the repo and import the project on [Vercel](https://vercel.com). Set root to the directory that contains `jarvis` (and `Life` if you use parent path).
2. Add all env vars in Project → Settings → Environment Variables.
3. Deploy. Cron jobs will run on the schedule in `vercel.json` (9 PM and 7 AM IST).
4. **Register Telegram webhook** (once):

   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_VERCEL_DOMAIN>/api/telegram/webhook"
   ```

5. **PWA on iOS:** Open your Vercel URL in Safari → Share → Add to Home Screen.

## Cron schedule (UTC)

- `30 15 * * *` — 15:30 UTC = 9:00 PM IST (evening plan)
- `30 1 * * *` — 01:30 UTC = 7:00 AM IST (morning prep)

Vercel cron calls must include header: `Authorization: Bearer <CRON_SECRET>`.

## API

- `GET /api/plan/[date]` — get plan for date (YYYY-MM-DD)
- `PATCH /api/plan/[date]` — body `{ taskId, done }` to toggle task
- `GET /api/journal?date=YYYY-MM-DD` — get journal for date
- `POST /api/journal` — body `{ date, text, completedTaskIds?, skippedTaskIds? }`
- `GET /api/plans?from=...&to=...` or `?days=28` — plans and journals for range
- `GET /api/progress/[project]` — progress entries for project key

## Icons

Add `public/icons/icon-192.png` and `icon-512.png` for PWA icons (optional; app works without them).
