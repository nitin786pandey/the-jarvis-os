# Vercel deployment fix (404)

**Set Root Directory to `jarvis`** in your Vercel project:

1. Vercel dashboard → your project → **Settings** → **General**
2. **Root Directory** → click **Edit** → enter **`jarvis`** → Save
3. **Redeploy** (Deployments → ⋮ on latest → Redeploy)

The app lives in the `jarvis/` folder; with root set to `jarvis`, Vercel will build and serve the Next.js app. The `Life/` folder is now inside `jarvis/` so the planner can read your PARA files.
