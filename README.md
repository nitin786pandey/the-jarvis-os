# The Jarvis OS

Life planner (PARA + daily plans, Telegram, PWA). App lives in **`jarvis/`**.

## Vercel deployment (fix 404)

**You must set Root Directory to `jarvis`** in Vercel, or you will get 404.

1. [Vercel Dashboard](https://vercel.com) → your project (the-jarvis-os / Jarvis)
2. **Settings** → **General**
3. **Root Directory** → click **Edit**
4. Enter: **`jarvis`** (only that, no slash before/after)
5. **Save**
6. **Deployments** → **⋮** on latest → **Redeploy**

After redeploy, the site should load. See `jarvis/VERCEL_DEPLOY.md` for more.
