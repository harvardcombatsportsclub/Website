# HCSC Website: The Officer's Guide

This guide assumes you have never touched a website before. If you can fill in a form, you can run this site.

## 1. The big picture (read this once)

The club website has a built-in **Site Editor**. You open it in your browser, type the club password, and change things with normal forms: pick a day, type a time, upload a photo, click Save. About a minute later the live site shows the change. There is nothing to install and no account to create; the only thing you need is the club password.

Behind the scenes the website's files live on **GitHub**, a free service that stores files and shows them to the internet, and the editor talks to a tiny helper program on **Cloudflare** that holds the key to those files. You never need to think about either of them. The only time anyone opens GitHub is to change the *wording* of a page (the FAQ text, the paragraphs on the Jiu-Jitsu page); section 7 covers it.

So the three jobs, in order of how often you'll do them:

1. **Cancel a practice or post a notice** (weekly-ish): Editor → *This week* tab.
2. **Add photos** (whenever): Editor → *Photos* tab.
3. **Update the schedule and e-board** (each semester): Editor → *Weekly schedule* and *Leadership* tabs.

## 2. What you need

- **The club password.** Ask the president. It changes at each hand-off.
- **The website address**, e.g. `https://harvardcombatsports.github.io/website/`, or the custom domain if we have one.
- For the rare page-wording edits only: the club GitHub login.

## 3. Opening the editor

Go to the website and click **Officers** at the very bottom of any page, or go straight to `your-site-address/admin.html`. Type the club password. Tick **Remember me** on your own laptop or phone so you don't have to type it again; don't tick it on a shared computer. Use **Log out** (top right) on a shared machine when you're done.

The editor has six tabs. Every tab has a **Save to website** button; nothing changes on the live site until you click it. A small gold dot next to it means you have unsaved changes. If you try to close the page with unsaved changes, the browser will warn you.

## 4. Cancelling a practice or posting a notice

**This week** tab.

*Banner.* Type your message in the box (e.g. "No practice Thursday: tournament weekend"), pick the last date it should show, click **Save to website**. A gold banner appears at the top of the Home and Schedule pages and disappears by itself the day after that date. To remove a banner early, clear the text and save.

*Cancel a practice.* Click **+ Cancel a practice**, pick the date, choose which discipline (or "All practices that day"), add a short note if you like, **Save**. On the site that practice is crossed out in the week view and "Next practice" skips it. Old cancellations don't hurt anything; remove them whenever you feel like tidying.

For anything people might actually miss, do both: cancel the practice *and* post a banner. Then send it in WhatsApp too. The website is the reference; WhatsApp is the alarm.

## 5. Photos

**Photos** tab.

*Add photos.* Click **Choose photos**, select as many as you like, click **Upload**. Large phone photos are shrunk automatically, so don't worry about size. A progress bar shows each one going up. About a minute after the upload finishes, the public Photos page shows them, newest first, without captions.

*Delete a photo.* Scroll down to **In the gallery**, hover over the photo, click **Delete**, confirm.

*Headshots* for the Leadership page: choose the file, pick the person from the dropdown, click **Upload headshot**. The editor fills in the person's headshot path on the Leadership tab for you; go there and click Save.

Two rules: only upload photos of people who are fine appearing on a public website, and nothing you wouldn't want the Club Sports Office to see.

*iPhone HEIC photos:* Safari uploads them fine. In Chrome or on Windows they may fail; either use Safari, export as JPG first, or set Settings → Camera → Formats → *Most Compatible* so your phone shoots JPG.

## 6. Start-of-semester checklist (15 minutes)

1. **Weekly schedule tab:** change the *Term* (e.g. "Spring 2027"). Fix days, times, and rooms; use **+ Add a practice** and **✕ Remove**. Times must look like `5:30 PM`. If a practice moves to a new building, add it under *Locations* first (short code like `MAC`, full name, room, address, Google Maps link). Save.
2. **This week tab:** delete last semester's cancellations. If the first practice isn't on the usual day, cancel the ones that aren't happening and post a banner saying when things start. Save.
3. **Leadership tab:** update officers, roles, class years; remove graduated officers; update coaches. Save.
4. **Club info tab:** check the email, WhatsApp link, and dues. If the WhatsApp community link was reset, paste the new one here; every button on the site updates. Save.
5. Open the live site on your phone and click through every page.

## 7. Editing page wording on GitHub

For text that isn't a form field (FAQ answers, the story on the About page, paragraphs on a discipline page):

1. Go to github.com, sign in as the club, open the `website` repository.
2. Click the file, e.g. `faq.html`. Click the **pencil icon** (top right of the file view).
3. Find the text (Ctrl/Cmd-F helps). Change only the words between `>` and `<`; everything inside angle brackets is code that tells the browser how to display the words. In `<p>Dues start at $20.</p>`, change `$20`, not `<p>`.
4. Click **Commit changes**, then **Commit changes** again in the popup. The site updates within a minute.

To add an FAQ question, copy an existing block from `<details>` to `</details>`, paste it below, and change the question and answer.

If you make a mess: GitHub keeps every version. Click **History** (the clock icon) on the file, open the last good version, click **⋯ → View file**, then the pencil, and copy the content back.

## 8. Adding a new discipline (Muay Thai, MMA, …)

**Disciplines** tab in the editor. Click **+ Add a discipline** and fill in the full Name, a Short name (what the schedule shows), a Nav label (what the menu shows), an ID (lowercase with dashes, `muay-thai`; never change it later), the Page file (`muay-thai.html`), Who can join, an Instagram handle if it has one, a Color (click the swatch), and a one-line Description for the home-page card. Leave **Active** unticked for now.

Click **Create page from template** next to it. This creates the discipline's page with placeholder text in [BRACKETS]. Click **Save to website**.

Now write the page: on GitHub (section 7) open `muay-thai.html` and replace each [BRACKETED] bit with real text about the sport. Then back in the editor tick **Active**, save, and add its practices on the *Weekly schedule* tab (the new discipline is now in the dropdown). The menu, home page, footer, and schedule colors pick it up automatically.

There's already a hidden Muay Thai entry to use as a starting point.

## 8b. The archived Harvard BJJ site and alumni

Before 2026 the Jiu-Jitsu branch was its own club with its own website. That site is preserved at `legacy/bjj/` (linked quietly from the bottom of the Jiu-Jitsu page) with three extra tabs in its menu: **Past Officers**, **Stories**, and **Photos**.

Alumni can add to both through a separate, smaller editor at `/alumni.html` (linked as "Alumni" in the footer). It uses its own **alumni password**, which only unlocks the archive: alumni can't touch the schedule, current leadership, or anything else on the live site. Officers' password works there too. Share the alumni password in the alumni group chat; change it in Cloudflare (`ALUMNI_PASSWORD`) if it spreads too far. Anything posted there is public, so the usual rule applies: only name people who'd be happy to be named.

## 9. The shield, the name, and Harvard's rules

The site must make clear we're a *student* organization. The footer on every page already says so and includes Harvard's trademark line. Don't remove it. Other rules from the Trademark Program and the Club Sports Office:

- No ads or "sponsored by" logos on the site. If a sponsor deal happens, ask the Club Sports Office how it may be shown.
- No selling Harvard-branded merch through the site without Trademark Program approval; an order form is fine.
- Use only the official Club Sports shield as the logo. To install it: **Club info** tab → *Replace logo* → choose the file → **Upload logo** → **Save to website**.
- If we ever buy a domain with "harvard" in it, clear it with the Club Sports Office first.

## 10. When something looks wrong

**"Wrong password."** Ask the president for the current one; it changes at hand-off.

**"Can't reach the editor backend."** The Cloudflare helper is unreachable or not set up. Check `worker/README.md` in the repository, or ask whoever set the site up. Editing directly on GitHub still works meanwhile (section 7 shows how; the data files are in the `data` folder).

**I saved but the site didn't change.** Wait two minutes and hard-refresh (Ctrl/Cmd-Shift-R). If it's still old, open the file on GitHub (`data/schedule.json`, etc.) and see whether your change is there. If yes, it's just caching; if no, the save failed and the editor will have shown a red message.

**"This file changed since you loaded it."** Two officers edited at once. The editor reloads the latest; redo your change and save again.

**Photos uploaded but the public gallery is empty.** The automatic gallery rebuild needs permission. On GitHub: **Settings → Actions → General → Workflow permissions → Read and write permissions → Save**. Upload one more photo to trigger it. Runs are visible under the **Actions** tab.

**A page shows [BRACKETS].** Someone created a discipline page but hasn't written its text yet. Section 8.

**Times look wrong.** They must be written like `5:30 PM` or `12:00 PM`, with a space before AM/PM. The editor refuses to save anything else.

## 11. Passing it on

Before you graduate or step down: change the club password (Cloudflare → Workers & Pages → `hcsc-editor` → Settings → Variables and Secrets → `ADMIN_PASSWORD`; two minutes, steps in `worker/README.md`), tell the new e-board the new one, make sure two current officers can log in to the club GitHub and Cloudflare accounts, and send them this guide. Sections 3 through 6 are all most officers ever need.

## Appendix: first-time setup

If the site or the editor isn't live yet, the one-time technical steps are in `SETUP.md` (GitHub Pages, the Cloudflare helper, a custom domain). That's a job for whoever is most comfortable with computers; everything in this guide applies after it's done.
