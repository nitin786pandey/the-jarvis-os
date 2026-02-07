# Cron setup – where to find and manage scheduled runs

**Evening plan (9 PM IST)** and **morning prep (7 AM IST)** are defined in `vercel.json`, but on the Vercel Hobby plan they are **not** executed by Vercel.

## Where the 9 PM cron actually runs: cron-job.org

The **evening plan** is triggered by an external cron:

- **Service:** [cron-job.org](https://cron-job.org)
- **URL:** `https://the-jarvis-os.vercel.app/api/cron/evening-plan`
- **Schedule:** Daily at **15:30 UTC** (9:00 PM IST)
- **Header:** `Authorization: Bearer <CRON_SECRET>` (same value as in Vercel env)

To change the time, pause, or delete the 9 PM run: log in at **cron-job.org** and edit the job there.

## Morning prep (7 AM IST)

If you want 7 AM IST to run without Vercel Pro, add a second job on cron-job.org:

- **URL:** `https://the-jarvis-os.vercel.app/api/cron/morning-prep`
- **Schedule:** Daily at **01:30 UTC** (7:00 AM IST)
- **Header:** `Authorization: Bearer <CRON_SECRET>`

## Debugging

See `DEBUG_EVENING_CRON.md` for manual trigger, logs, and troubleshooting.
