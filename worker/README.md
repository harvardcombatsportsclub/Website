# Setting up the editor backend on Cloudflare (one time, ~15 minutes)

The Site Editor (`admin.html`) needs a tiny program running on Cloudflare that holds the GitHub key and checks the club password. You paste one file into Cloudflare's website and fill in four settings. No software to install.

## A. Make the GitHub key (done once, never expires)

1. Sign in to github.com as the **club** account.
2. Profile picture (top right) → **Settings** → scroll to **Developer settings** (bottom of left sidebar) → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**.
3. Note: `HCSC site editor`. Expiration: **No expiration**. Tick only the box **`public_repo`**. Click **Generate token**.
4. Copy the token (starts with `ghp_`). Keep this tab open; you'll paste it into Cloudflare in a moment. Nobody else ever needs this token.

## B. Create the Worker

1. Sign in to dash.cloudflare.com as the club (create the account with the club Gmail if it doesn't exist).
2. Left sidebar → **Workers & Pages** → **Create** → **Create Worker**. Name it `hcsc-editor`. Click **Deploy** (it deploys a hello-world first; that's fine).
3. Click **Edit code**. Delete everything in the editor, paste the entire contents of `worker/worker.js` from this repository, and click **Deploy** (top right).
4. Go back to the Worker's page → **Settings** → **Variables and Secrets** → **Add**, four times:

   | Type   | Name              | Value |
   |--------|-------------------|-------|
   | Secret | `ADMIN_PASSWORD`  | The club password officers will type. Make it long-ish and memorable, e.g. a short phrase. |
   | Secret | `GITHUB_TOKEN`    | The `ghp_…` token from step A. |
   | Text   | `GITHUB_REPO`     | `harvardcombatsports/website` (your GitHub account/repo names) |
   | Text   | `ALLOWED_ORIGINS` | Your site address(es) without a trailing slash, comma-separated, e.g. `https://harvardcombatsports.github.io,https://www.hcsc.club` |

   Click **Deploy** after adding them.
5. On the Worker's overview page, copy its address: `https://hcsc-editor.<something>.workers.dev`. Open it in a browser tab; you should see `{"ok":true,"service":"hcsc-editor"}`.

## C. Tell the website where the Worker is

On github.com open `data/site.json` → pencil icon → set `"editor": "https://hcsc-editor.<something>.workers.dev"` → **Commit changes**.

A minute later, open `your-site/admin.html`, type the club password, and you're in.

## Changing the password (at each hand-off)

Cloudflare → Workers & Pages → `hcsc-editor` → Settings → Variables and Secrets → edit `ADMIN_PASSWORD` → Deploy. Tell the new e-board the new password. That's it.

## What the Worker can and can't do

Even with the password, the Worker only allows changes to: the four data files, photos, headshots, the logo file, and *creating* new discipline pages. It refuses to touch existing pages, the Worker itself, workflows, or scripts, so a leaked password can't take down the site. If the password does leak, change it as above.

## Cost

Cloudflare's free plan allows 100,000 requests per day. A busy day for the editor is maybe fifty.
