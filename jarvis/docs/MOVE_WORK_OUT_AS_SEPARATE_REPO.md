# Moving Work out of Life as a separate repo (under PRODUCT REPOSITORY)

Goal: **Work** becomes its own Git repository, sibling to **Life**, under the parent folder **PRODUCT REPOSITORY**.

**Target layout:**

```
PRODUCT REPOSITORY/
  Life/                 (git repo – Life + jarvis)
    jarvis/
    Life/
    README.md
    ...
  Work/                 (git repo – Work only)
    Tasks/
    customer-memory-architecture.md
    how-to-write-cursor-rules.mdc
    README.md (optional)
```

---

## Impact

- **jarvis** does not use the `Work/` folder (it only reads Life: Projects, Areas, Daily, Resources). No code or Vercel changes.
- **Life** repo will no longer contain `Work/`; any links or paths that pointed to `Life/Work/` need to be updated.

---

## Steps (mostly terminal)

### 1. Create the Work repo on GitHub (once, in browser)

GitHub → **New repository** → name **Work** → Create (no README). Copy the repo URL, e.g. `https://github.com/nitin786pandey/Work.git`.

### 2. Run these commands (from PRODUCT REPOSITORY)

Replace `YOUR_USERNAME` and `Work` in the URL if your repo name or username differ.

```bash
# Go to parent folder (PRODUCT REPOSITORY)
cd "/Users/shashikanthmanjunath/Downloads/PRODUCT REPOSITORY"

# Copy Work out of Life so it sits next to Life
cp -R Life/Work Work

# Turn Work into its own git repo and push
cd Work
git init
git add .
git commit -m "Initial commit: Work tasks and notes"
git remote add origin https://github.com/YOUR_USERNAME/Work.git
git branch -M main
git push -u origin main
cd ..
```

### 3. Remove Work from the Life repo

```bash
cd "/Users/shashikanthmanjunath/Downloads/PRODUCT REPOSITORY/Life"
git rm -r Work
git commit -m "Move Work to separate repository (now at PRODUCT REPOSITORY/Work)"
git push
cd ..
```

### 4. Update references to Work inside Life

- **AGENTS.md** (in Life) mentions `Knowledge/Work/how-to-write-cursor-rules.mdc`. If you intended that to point at the old `Life/Work/` content, update it to the new location, e.g.:
  - `../Work/how-to-write-cursor-rules.mdc` (relative from Life if both repos are under PRODUCT REPOSITORY in your editor), or
  - A note like “See the Work repo” with the repo URL.
- Search the Life repo for `Work/` or `Life/Work` and fix any other links or paths.

### 5. Optional: README in Work repo

In `Work/README.md` you can add a short description, e.g. work tasks, Cursor rules, and that it lives under PRODUCT REPOSITORY next to Life.

---

## Summary

| Action              | Where        |
|---------------------|-------------|
| New GitHub repo     | **Work** (or work-tasks) |
| Content             | Copy or move `Life/Work/*` into `PRODUCT REPOSITORY/Work/` and push as new repo |
| Life repo           | Remove `Work/` and push; update AGENTS.md (and any other refs) to point to the Work repo or path |
| jarvis / Vercel     | No changes |

After this, **PRODUCT REPOSITORY** holds two repos: **Life** (with jarvis + Life PARA) and **Work** (tasks and notes).
