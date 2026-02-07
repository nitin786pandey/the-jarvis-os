# Vercel deployment fix (404)

If you see **404 NOT_FOUND**, Vercel is building from the repo root instead of the app folder.

## Fix: set Root Directory to `jarvis`

1. Go to **[vercel.com](https://vercel.com)** → open your Jarvis project.
2. Click **Settings** (top).
3. Under **General**, find **Root Directory** (shows "Leave empty to use repository root" or empty).
4. Click **Edit** next to Root Directory.
5. Type exactly: **jarvis** (no leading/trailing slash).
6. Click **Save**.
7. Go to **Deployments** → open the **⋮** menu on the latest deployment → **Redeploy** → confirm.

After the new deployment finishes, open your site URL again. The app should load.

## Why this works

The Next.js app and `package.json` are in the **jarvis/** folder. If Root Directory is empty, Vercel uses the repo root (no `package.json` there), so the build doesn’t run correctly and you get 404. Setting Root Directory to **jarvis** makes Vercel build and serve the app from that folder.
