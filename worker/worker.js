/**
 * HCSC Site Editor backend — a Cloudflare Worker.
 *
 * The editor page (admin.html) sends requests here with the club password.
 * This Worker checks the password, then reads/writes files in the website's
 * GitHub repository using a token that only the Worker knows.
 *
 * Settings (Cloudflare dashboard → Worker → Settings → Variables and Secrets):
 *   ADMIN_PASSWORD   secret   the club password officers type into the editor
 *   GITHUB_TOKEN     secret   classic token from the club GitHub account, scope "public_repo", no expiration
 *   GITHUB_REPO      text     owner/repo, e.g. harvardcombatsports/website
 *   ALLOWED_ORIGINS  text     comma-separated site origins allowed to call this, e.g.
 *                             https://harvardcombatsports.github.io,https://www.hcsc.club
 *   GITHUB_BRANCH    text     optional, default "main"
 *
 * Endpoints (all need header  Authorization: Bearer <password>  except "/"):
 *   GET    /                      health check, no auth
 *   GET    /auth                  200 if the password is right
 *   GET    /file?path=…           { sha, content(base64) }  or 404
 *   PUT    /file?path=…           body { content(base64), message, sha? }  → GitHub response
 *   DELETE /file?path=…           body { sha, message }
 *   GET    /list?dir=photos       [{ name, path, sha, size, download_url }]
 *
 * Which files may be touched is whitelisted below — even with the password,
 * the editor can only change club data, photos, the logo, and add new
 * discipline pages. It can never modify the Worker, workflows, or scripts.
 */

const RULES = {
  read: [
    /^data\/[a-z-]+\.json$/,
    /^branch-template\.html$/,
    /^[a-z0-9-]+\.html$/,
    /^photos\/(people\/)?[^/]+\.(jpe?g|png|webp)$/i,
    /^assets\/(logo|shield)\.(png|svg|jpe?g)$/,
  ],
  write: [
    /^data\/(schedule|leadership|branches|site)\.json$/,
    /^photos\/[a-z0-9._-]+\.(jpe?g|png|webp)$/i,
    /^photos\/people\/[a-z0-9._-]+\.(jpe?g|png)$/i,
    /^assets\/shield\.(png|svg|jpe?g)$/,
    /^[a-z0-9-]+\.html$/,            // new discipline pages (create-only, enforced below)
  ],
  delete: [
    /^photos\/(people\/)?[a-z0-9._-]+\.(jpe?g|png|webp)$/i,
  ],
  list: [/^photos(\/people)?$/],
};
const PROTECTED_PAGES = new Set(["index", "about", "schedule", "leadership", "faq", "photos", "join", "404", "admin", "guide", "branch-template"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(env, origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/") return json({ ok: true, service: "hcsc-editor" }, 200, cors);

    // ---- password check
    const supplied = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!env.ADMIN_PASSWORD || !supplied || !(await safeEqual(supplied, env.ADMIN_PASSWORD))) {
      await new Promise(r => setTimeout(r, 400)); // slow down guessing
      return json({ error: "Wrong password" }, 401, cors);
    }
    if (url.pathname === "/auth") return json({ ok: true }, 200, cors);

    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) return json({ error: "Worker is missing GITHUB_TOKEN or GITHUB_REPO settings" }, 500, cors);
    const branch = env.GITHUB_BRANCH || "main";
    const gh = (path, init = {}) => fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "hcsc-site-editor",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });

    try {
      // ---- list a folder
      if (url.pathname === "/list" && request.method === "GET") {
        const dir = url.searchParams.get("dir") || "";
        if (!allowed(RULES.list, dir)) return json({ error: "Not allowed" }, 403, cors);
        const r = await gh(`${dir}?ref=${branch}&t=${Date.now()}`);
        if (r.status === 404) return json([], 200, cors);
        const items = await r.json();
        return json((Array.isArray(items) ? items : []).filter(i => i.type === "file" && /\.(jpe?g|png|webp)$/i.test(i.name))
          .map(i => ({ name: i.name, path: i.path, sha: i.sha, size: i.size, download_url: i.download_url })), 200, cors);
      }

      // ---- single file
      if (url.pathname === "/file") {
        const path = (url.searchParams.get("path") || "").replace(/^\/+/, "");
        if (path.includes("..")) return json({ error: "Bad path" }, 400, cors);

        if (request.method === "GET") {
          if (!allowed(RULES.read, path)) return json({ error: "Not allowed" }, 403, cors);
          const r = await gh(`${path}?ref=${branch}&t=${Date.now()}`);
          if (r.status === 404) return json({ error: "Not found" }, 404, cors);
          const j = await r.json();
          return json({ sha: j.sha, content: j.content, size: j.size }, r.status, cors);
        }

        if (request.method === "PUT") {
          if (!allowed(RULES.write, path)) return json({ error: "Not allowed" }, 403, cors);
          const body = await request.json().catch(() => ({}));
          if (typeof body.content !== "string") return json({ error: "Missing content" }, 400, cors);
          if (body.content.length > 12 * 1024 * 1024) return json({ error: "File too large (max ~9 MB)" }, 413, cors);
          if (path.endsWith(".html")) {
            const stem = path.replace(/\.html$/, "");
            if (PROTECTED_PAGES.has(stem)) return json({ error: "That page can't be changed from the editor" }, 403, cors);
            const exists = await gh(`${path}?ref=${branch}`);
            if (exists.status === 200) return json({ error: `${path} already exists — edit it on github.com` }, 409, cors);
          }
          const payload = { message: String(body.message || `Update ${path} via site editor`).slice(0, 200), content: body.content, branch };
          if (body.sha) payload.sha = body.sha;
          const r = await gh(path, { method: "PUT", body: JSON.stringify(payload) });
          const j = await r.json();
          if (r.status === 409 || r.status === 422) return json({ error: "This file changed since you loaded it. Reload and try again." }, 409, cors);
          if (!r.ok) return json({ error: `GitHub said ${r.status}: ${j.message || ""}` }, r.status, cors);
          return json({ ok: true, sha: j.content && j.content.sha }, 200, cors);
        }

        if (request.method === "DELETE") {
          if (!allowed(RULES.delete, path)) return json({ error: "Not allowed" }, 403, cors);
          const body = await request.json().catch(() => ({}));
          if (!body.sha) return json({ error: "Missing sha" }, 400, cors);
          const r = await gh(path, { method: "DELETE", body: JSON.stringify({ message: String(body.message || `Delete ${path} via site editor`).slice(0, 200), sha: body.sha, branch }) });
          if (!r.ok) return json({ error: `GitHub said ${r.status}` }, r.status, cors);
          return json({ ok: true }, 200, cors);
        }
      }
      return json({ error: "Unknown endpoint" }, 404, cors);
    } catch (e) {
      return json({ error: `Worker error: ${e.message}` }, 500, cors);
    }
  },
};

function allowed(rules, path) { return rules.some(re => re.test(path)); }

function corsHeaders(env, origin) {
  const list = (env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim().replace(/\/$/, "")).filter(Boolean);
  const ok = list.length === 0 ? origin : (list.includes(origin) ? origin : list[0]);
  return {
    "Access-Control-Allow-Origin": ok || "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...cors } });
}

/* Compare two strings without leaking their length/contents through timing. */
async function safeEqual(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
