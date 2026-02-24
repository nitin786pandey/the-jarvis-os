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

---

## Build succeeds but still 404?

If the build log shows “Compiled successfully” and “Generating static pages” but the site still shows 404:

1. **Open the deployment that just built**  
   In Vercel → **Deployments** → click the deployment that has the successful build (same commit/time) → click **Visit** (or the deployment URL). Don’t use an old bookmark or a different deployment’s URL.

2. **Set Framework Preset to Next.js**  
   **Settings** → **General** → **Framework Preset** → choose **Next.js** (not “Other” or “Other (Vite, etc.)”). Save and **Redeploy**.

3. **`vercel.json`** in `jarvis/` now includes `"framework": "nextjs"` so Vercel treats the output as Next.js. Commit, push, and let the new deployment finish, then open that deployment’s URL again.
