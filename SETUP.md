# Setting up the HCSC website (first-time walkthrough)

This is the one-time setup. Day-to-day editing is covered in `GUIDE.md`.

## What's in this folder

- **Pages** — `index.html` (home), `about.html`, `jiu-jitsu.html`, `wrestling.html`, `schedule.html`, `leadership.html`, `faq.html`, `photos.html`, `join.html` (join, dues, donate, contact), `404.html`. `branch-template.html` is not a live page; copy it when adding a new discipline.
- **`assets/`** — `style.css` (design; colors are the first ~15 lines), `site.js` (builds header/nav/footer and fills pages from the data files), `logo.svg` (placeholder — replace with the Club Sports shield).
- **`admin.html`** — the Site Editor officers use (password-protected via the Cloudflare Worker).
- **`worker/`** — `worker.js` is the Cloudflare Worker code; `README.md` is its setup guide.
- **`data/`** — the club's data (`schedule.json`, `leadership.json`, `branches.json`, `site.json`, which also holds the Worker address). The editor writes these. `photos.json` is generated automatically — never edit it.
- **`photos/`** — drop images here; `photos/people/` for officer headshots; `photos/thumbs/` is auto-generated.
- **`scripts/build_photos.py`** + **`.github/workflows/photos.yml`** — automation that turns uploaded photos into the gallery.
- `.nojekyll`, `.gitignore` — housekeeping. Files starting with a dot are hidden by Finder/Explorer but are present.

## 1. Club GitHub account and repo

Create a GitHub account for the club (e.g. `harvardcombatsports`, registered to the club Gmail) so it survives graduation. Then: **+ → New repository**, name `website`, **Public** (Pages is free only on public repos), leave the "initialize" boxes unticked, **Create**.

## 2. Put the files in the repo

**GitHub Desktop (easiest):** install from desktop.github.com, sign in as the club, **File → Clone Repository → `harvardcombatsports/website`**. Open the unzipped `hcsc-site` folder, select everything *inside* it (Cmd/Ctrl-A includes the dot-files), drag into the cloned repo folder. You want `website/index.html`, not `website/hcsc-site/index.html`. In GitHub Desktop: summary "Initial site" → **Commit to main** → **Push origin**.

**Terminal alternative:**
```bash
cd hcsc-site
git init && git add . && git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/harvardcombatsports/website.git
git push -u origin main
```

Refresh the repo on github.com and confirm you see `index.html`, `data/`, and `.github/`.

## 3. Turn on GitHub Pages

**Settings → Pages → Build and deployment:** Source *Deploy from a branch*, Branch `main`, folder `/ (root)`, **Save**. Within a minute the site is live at `https://harvardcombatsports.github.io/website/`.

**Settings → Actions → General → Workflow permissions:** choose *Read and write permissions*, **Save**. (Required for the photo automation.)

## 4. Set up the Site Editor backend on Cloudflare

Follow `worker/README.md` (about 15 minutes, no software to install). In short: create a classic GitHub token on the club account with only `public_repo` and no expiration; create a Cloudflare account with the club Gmail; create a Worker named `hcsc-editor`, paste in `worker/worker.js`, add the four settings (`ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_REPO`, `ALLOWED_ORIGINS`); then put the Worker's address into `data/site.json` as `"editor"`. Open `/admin.html` on the live site and log in with the club password.

## 5. Test the photo gallery

On github.com open `photos/` → **Add file → Upload files** → drag in a JPG → **Commit changes**. Watch the **Actions** tab; when "Rebuild photo gallery" is green, reload the live Photos page.

## 6. Fill in remaining content

In the Site Editor:
- **Leadership** tab: add each officer's Role.
- **Club info** tab: upload the official Club Sports shield with *Replace logo*, then Save. (For the browser-tab icon too, replace `assets/logo.svg` with `assets/shield.png` in each `.html` file's `<link rel="icon">` on GitHub.)
- **Disciplines** tab: confirm the wrestling Instagram handle.
- The current Tuesday cancellation and banner expire on their own.

## 7. Custom domain (optional)

**Before buying:** Harvard's Trademark Program requires DSO/Trademark clearance for domains containing "harvard" and prefers they be registered to the University. Either get clearance or choose a name without it (e.g. `hcsc.club`). Register under the club account.

1. Create a free Cloudflare account; buy the domain via **Domain Registration → Register Domains** (DNS is then already in Cloudflare).
2. **DNS → Records**, add — all with the cloud set to **grey / DNS only**:
   | Type | Name | Content |
   |---|---|---|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `harvardcombatsports.github.io` |
   (An orange cloud blocks GitHub from issuing the HTTPS certificate.)
3. GitHub **Settings → Pages → Custom domain**: `www.yourdomain.org`, **Save**. Wait for the DNS check (minutes to an hour), then tick **Enforce HTTPS**.

## 8. Hand-off

Give the e-board the club password, store the club GitHub and Cloudflare logins where the e-board keeps passwords, and point new officers at `GUIDE.md` (also live at `/guide.html`).
