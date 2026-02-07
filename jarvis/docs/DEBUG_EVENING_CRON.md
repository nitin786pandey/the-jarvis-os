# Debug: 9 PM evening plan not running

Use this to find **where** it failed: cron not firing, auth, plan generation, Redis, or Telegram.

## 1. Check if the cron ran (Vercel)

- **Vercel Dashboard** → your project (**the-jarvis-os**) → **Logs** (or **Deployments** → select deployment → **Functions** / **Runtime Logs**).
- Filter by time: **9:00 PM IST = 15:30 UTC**.
- Look for a **GET** to `/api/cron/evening-plan`:
  - **No request** → Cron did not run (schedule, timezone, or crons disabled).
  - **401** → Wrong or missing `CRON_SECRET` (Vercel must send `Authorization: Bearer <CRON_SECRET>`).
  - **500** → Check the response body or logs for `generatePlan failed`, `setPlan (Redis) failed`, or `Telegram send failed`.

Cron schedule in `vercel.json`: `30 15 * * *` = 15:30 UTC = 9:00 PM IST.

## 2. Trigger the endpoint manually (recommended)

This tells you whether the **code path** works; if it works here but not at 9 PM, the issue is Vercel cron not invoking.

Use your **production** URL and the **same CRON_SECRET** as in Vercel (Settings → Environment Variables):

```bash
curl -s -w "\nHTTP %{http_code}\n" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://the-jarvis-os.vercel.app/api/cron/evening-plan"
```

Replace `YOUR_CRON_SECRET` with the value from Vercel.

- **200 + `{"ok":true,...}`** → Plan was generated, saved, and sent. If you still didn’t get Telegram at 9 PM, the cron didn’t run.
- **401** → Secret mismatch; fix `CRON_SECRET` in Vercel (and ensure Vercel Crons use it).
- **500 + `{"error":"generatePlan failed", "detail":"..."}`** → Failure in PARA/LLM/context (e.g. Life path, MuleRouter, missing env).
- **500 + `{"error":"setPlan (Redis) failed", "detail":"..."}`** → Redis (Upstash URL/token or key).
- **500 + `{"error":"Telegram send failed", "detail":"..."}`** → Telegram (bot token, chat ID, or network).

## 3. If cron never runs (Vercel not invoking at 9 PM)

- **Vercel** → Project → **Settings** → **Crons**: confirm the cron job exists and schedule is `30 15 * * *`.
- On the **Hobby** plan, Vercel does **not** execute cron jobs—only the config is stored. Cron execution is a **Pro** (or team) feature. So the cron will never run at 9 PM IST unless you upgrade or use an external trigger.

### Workaround: external cron (free, works on Hobby)

Use a free external service to call your endpoint every day at 9:00 PM IST (15:30 UTC).

**Example: cron-job.org**

1. Sign up at [cron-job.org](https://cron-job.org) (free).
2. Create a new cron job:
   - **URL:** `https://the-jarvis-os.vercel.app/api/cron/evening-plan`
   - **Schedule:** Daily at **15:30** (UTC). (Their UI often has a time picker; choose 15:30 UTC, or equivalent 9:00 PM IST.)
   - **Request method:** GET.
   - **Request headers:** Add one header:
     - **Name:** `Authorization`  
     - **Value:** `Bearer YOUR_CRON_SECRET`  
     (Use the same `CRON_SECRET` as in Vercel env.)
3. Save. The job will GET your endpoint at 15:30 UTC every day; your API will generate the plan and send it to Telegram.

**Alternative:** GitHub Actions scheduled workflow (e.g. `schedule: ['30 15 * * *']` UTC) that runs `curl -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" https://the-jarvis-os.vercel.app/api/cron/evening-plan`. Store `CRON_SECRET` in the repo’s Secrets.

## 4. Quick checklist

| Check | What to verify |
|-------|----------------|
| Cron schedule | `30 15 * * *` in `vercel.json` (9 PM IST) |
| CRON_SECRET | Set in Vercel; same as in manual `curl` |
| Env on Vercel | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, Redis, LLM (e.g. QWEN_*) |
| Plan content | `generatePlan` uses Life/PARA from repo (bundle); `LIFE_PATH` optional |
| Logs | Vercel Runtime Logs around 15:30 UTC for stack traces |

After you run the `curl` once, the response body will point to the exact failing step.

---

## DEP0169 `url.parse()` deprecation in logs

If you see:

```text
[DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized...
```

- This comes from a **dependency** (not your code), e.g. Redis or Next.js internals.
- It is a **warning**, not a fatal error: the cron can still complete and send the plan.
- Check whether you received the Telegram plan at that time; if yes, the run succeeded and the log line is noise.

To reduce log noise on Vercel, you can suppress Node deprecation warnings:

- **Vercel** → Project → **Settings** → **Environment Variables**
- Add `NODE_OPTIONS` = `--no-deprecation` (for Production/Preview as needed).

This hides all deprecation warnings; use only if you’re sure the cron is succeeding and you want cleaner logs.
