# Moving jarvis under a "Life" repository

You can have one repo named **Life** that contains both your Life (PARA) content and the **jarvis** app. Here’s what to change in Git and Vercel.

---

## Option A: Rename the current repo to "Life" (no file move)

**Current:** Repo "The Jarvis OS" with `jarvis/` and `Life/` at root.

**Change:** Keep the same structure; only rename the repo to "Life".

### Git (GitHub)

1. **GitHub** → repo **the-jarvis-os** → **Settings** → **Repository name** → change to **Life** → **Rename**.
2. Locally, update the remote URL (if you use the old name in the URL):
   ```bash
   git remote set-url origin https://github.com/nitin786pandey/Life.git
   ```
3. No need to move any files; `jarvis/` and `Life/` stay as they are.

### Vercel

- **Root Directory** stays **jarvis** (path to the Next.js app unchanged).
- **Project name** can stay "the-jarvis-os" (your deployment URL); no change required.
- If you had connected the repo by name, reconnecting is not required when you only rename the repo; the connection stays.

### cron-job.org

- No change. The job calls `https://the-jarvis-os.vercel.app/...`; that URL is from the Vercel project, not the repo name.

---

## Option B: New repo "Life" and put jarvis inside it

**Current:** Repo "The Jarvis OS" with `jarvis/` and `Life/` at root.

**Target:** New repo "Life" with everything under it, e.g.:

```
Life/                    (new repo root)
  jarvis/                (Next.js app – same as now)
  Life/                  (or Daily/, Areas/, Projects/, Resources/ at root)
  README.md
```

### Git

1. Create a new repo on GitHub named **Life** (empty, no README).
2. Clone it locally (or use a new folder).
3. Copy or move from your current "The Jarvis OS" repo:
   - the whole **jarvis/** folder,
   - the **Life/** folder (PARA content),
   - any root files you want (e.g. README, .gitignore).
4. In the new repo folder:
   ```bash
   git add .
   git commit -m "Move jarvis and Life into Life repo"
   git remote add origin https://github.com/nitin786pandey/Life.git
   git push -u origin main
   ```
5. Going forward, use this "Life" repo; you can archive or delete "the-jarvis-os" if you no longer need it.

### Vercel

- **If you keep using the same Vercel project** and only change the Git repo:
  1. **Settings** → **Git** → **Disconnect** the current repo.
  2. **Connect** the new **Life** repo (same account).
  3. **Root Directory** set to **jarvis** (unchanged).
  4. Redeploy. Env vars are per project; they stay.

- **If you create a new Vercel project** for the Life repo:
  1. Import the **Life** repo as a new project.
  2. Set **Root Directory** to **jarvis**.
  3. Add the same env vars (CRON_SECRET, Telegram, Redis, LLM, etc.).
  4. Redeploy and set the Telegram webhook to the new deployment URL if the domain changes.

### cron-job.org

- If the deployment URL stays **the-jarvis-os.vercel.app** (same Vercel project): no change.
- If you use a new Vercel project and get a new URL (e.g. **life.vercel.app**): edit the cron job URL to the new base (e.g. `https://<new-domain>/api/cron/evening-plan`) and optionally update **CRON_SETUP.md** / **DEBUG_EVENING_CRON.md**.

### App and Life path

- The app resolves Life via `LIFE_PATH` or `./Life` / `../Life` (see `para-reader.ts`). As long as:
  - **Root Directory** is **jarvis**, and  
  - Life content is either inside **jarvis/Life** or at **Life** (sibling of jarvis) with `LIFE_PATH=../Life` if needed,  
  nothing in code needs to change.  
- `next.config.mjs` bundles **./Life** for serverless; if your single source of truth is repo-root **Life/** (sibling to jarvis), keep a copy under **jarvis/Life** for the bundle, or add `outputFileTracingIncludes` for `../Life/**/*` and set `LIFE_PATH=../Life` on Vercel (if your deployment layout allows parent paths).

---

## Summary

| What you do              | Git / GitHub                    | Vercel                          | cron-job.org        |
|--------------------------|----------------------------------|---------------------------------|---------------------|
| Rename repo to "Life"    | Rename repo; update remote URL   | Root Directory = **jarvis**     | No change           |
| New repo "Life", jarvis inside | New repo; push jarvis + Life there | Root Directory = **jarvis**; reconnect or new project | Change only if deployment URL changes |

In all cases, **Root Directory** stays **jarvis** as long as the Next.js app remains in a folder named `jarvis` at the repo root.

---

**See also:** To move **Work** out of Life as a separate repo under PRODUCT REPOSITORY, see `MOVE_WORK_OUT_AS_SEPARATE_REPO.md`.
