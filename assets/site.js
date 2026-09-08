/* Harvard Combat Sports Club — shared site script
   - Injects the header/nav and footer on every page
   - Renders the schedule, leadership, and photo gallery from /data/*.json
   Nothing here needs a build step; edit the JSON files and reload. */

(function () {
  "use strict";

  /* Nav order. Discipline pages are inserted where BRANCHES appears,
     generated from data/branches.json. */
  const NAV = [
    { href: "index.html",      label: "Home" },
    { href: "about.html",      label: "About" },
    "BRANCHES",
    { href: "schedule.html",   label: "Schedule" },
    { href: "leadership.html", label: "Leadership" },
    { href: "faq.html",        label: "FAQ" },
    { href: "photos.html",     label: "Photos" },
    { href: "join.html",       label: "Join", cta: true }
  ];

  let BRANCHES = [];            // active disciplines, filled at boot
  const branchById = id => BRANCHES.find(b => b.id === id);
  /* Match a schedule row's "branch" text to a discipline (by name, short, or id). */
  const branchFor = text => BRANCHES.find(b =>
    [b.name, b.short, b.id].some(k => k && k.toLowerCase() === String(text).toLowerCase())
  ) || BRANCHES.find(b => new RegExp(b.short.split(/\s+/).pop(), "i").test(text));
  const escapeHtml = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 5.1 5.1 0 0 0 3.1.6 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'
  };

  const currentFile = () => {
    const f = location.pathname.split("/").pop();
    return f === "" ? "index.html" : f;
  };

  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
    return res.json();
  }

  /* ---------------- Header & footer ---------------- */
  function renderHeader(site) {
    const cur = currentFile();
    const link = p => `<a href="${p.href}" ${p.cta ? 'class="cta"' : ""} ${p.href === cur ? 'aria-current="page"' : ""}>${p.label}</a>`;
    const onBranchPage = BRANCHES.some(b => b.page === cur);
    const sportsMenu = `<div class="nav-group ${onBranchPage ? "current" : ""}">
        <button class="nav-drop" aria-expanded="false" aria-haspopup="true" aria-controls="sports-menu">Sports <span class="chev" aria-hidden="true">▾</span></button>
        <div class="nav-menu" id="sports-menu" role="menu">
          ${BRANCHES.map(b => `<a role="menuitem" href="${b.page}" ${b.page === cur ? 'aria-current="page"' : ""}><span class="dot" style="--b:${b.color || "#2a2a2e"}"></span>${escapeHtml(b.nav || b.short)}</a>`).join("")}
          <a role="menuitem" class="all" href="schedule.html">All practice times →</a>
        </div>
      </div>`;
    const links = NAV.map(p => p === "BRANCHES" ? sportsMenu : link(p)).join("");

    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `
      <div class="wrap">
        <a class="brand" href="index.html" aria-label="${site.name} home">
          <img src="${site.logo || "assets/logo.svg"}" alt="" onerror="this.style.display='none'">
          <span class="brand-text">
            <span class="brand-name">${site.short}</span>
            <span class="brand-sub">${site.name}</span>
          </span>
        </a>
        <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu <span aria-hidden="true">☰</span></button>
        <nav class="nav" id="site-nav" aria-label="Main">${links}</nav>
      </div>`;
    document.body.prepend(header);

    const toggle = header.querySelector(".nav-toggle");
    const nav = header.querySelector(".nav");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    // Sports dropdown: click/tap toggles; hover opens on desktop via CSS; Esc/outside click closes
    const group = header.querySelector(".nav-group"), drop = header.querySelector(".nav-drop");
    if (group && drop) {
      const setOpen = v => { group.classList.toggle("open", v); drop.setAttribute("aria-expanded", String(v)); };
      drop.addEventListener("click", e => { e.preventDefault(); setOpen(!group.classList.contains("open")); });
      document.addEventListener("click", e => { if (!group.contains(e.target)) setOpen(false); });
      document.addEventListener("keydown", e => { if (e.key === "Escape") { setOpen(false); drop.blur(); } });
      group.addEventListener("focusout", e => { if (!group.contains(e.relatedTarget)) setOpen(false); });
    }
  }

  function renderFooter(site) {
    const footer = document.createElement("footer");
    footer.className = "site-footer";
    const year = new Date().getFullYear();
    footer.innerHTML = `
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <h4>${site.name}</h4>
            <p>${site.tagline || ""}</p>
          </div>
          <div>
            <h4>Train</h4>
            <ul>
              <li><a href="schedule.html">Practice schedule</a></li>
              ${BRANCHES.map(b => `<li><a href="${b.page}">${b.short}</a></li>`).join("")}
              <li><a href="faq.html">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4>Connect</h4>
            <ul>
              <li><a href="${site.whatsapp}" target="_blank" rel="noopener">WhatsApp community</a></li>
              ${BRANCHES.filter(b => b.instagram).map(b => `<li><a href="https://instagram.com/${b.instagram}" target="_blank" rel="noopener">@${b.instagram}</a></li>`).join("")}
              <li><a href="mailto:${site.email}">${site.email}</a></li>
            </ul>
          </div>
        </div>
        <div class="disclaimer">
          <p><strong>${site.name}</strong> is an officially recognized student organization of Harvard College and a student-run club sport. Our activities are student activities and not activities of Harvard College or Harvard University. The Harvard name and shield are trademarks of the President and Fellows of Harvard College and are used by permission of Harvard University.</p>
          <p>&copy; ${year} ${site.name} · <a href="admin.html">Officers</a></p>
        </div>
      </div>`;
    document.body.append(footer);
  }

  /* Fill any element with data-site="key" (e.g. email, whatsapp) */
  function fillSiteTokens(site) {
    document.querySelectorAll("[data-site]").forEach(el => {
      const key = el.dataset.site;
      const val = key.split(".").reduce((o, k) => (o ? o[k] : undefined), site);
      if (val === undefined) return;
      if (el.dataset.attr) el.setAttribute(el.dataset.attr, el.dataset.prefix ? el.dataset.prefix + val : val);
      else el.textContent = val;
    });
    document.querySelectorAll("[data-ig]").forEach(el => {
      const b = branchById(el.dataset.ig);
      const handle = b && b.instagram;
      if (!handle) { el.hidden = true; return; }
      el.href = `https://instagram.com/${handle}`;
      el.target = "_blank"; el.rel = "noopener";
      if (!el.hasAttribute("data-keep")) el.innerHTML = `${ICONS.instagram} @${handle}`;
    });
    document.querySelectorAll("[data-whatsapp]").forEach(el => {
      el.href = site.whatsapp; el.target = "_blank"; el.rel = "noopener";
      if (!el.hasAttribute("data-keep")) el.innerHTML = `${ICONS.whatsapp} ${el.textContent.trim() || "Join the WhatsApp community"}`;
    });
    document.querySelectorAll("[data-email]").forEach(el => {
      el.href = `mailto:${site.email}`;
      if (!el.hasAttribute("data-keep")) el.innerHTML = `${ICONS.mail} ${site.email}`;
    });
  }

  /* ---------------- Discipline cards (home page) ---------------- */
  function renderBranchCards() {
    const el = document.getElementById("branch-cards");
    if (!el) return;
    el.innerHTML = BRANCHES.map(b => `
      <a class="branch-card" href="${b.page}" style="--b:${b.color || "#2a2a2e"}">
        <span class="tag">${escapeHtml(b.eligibility || "")}</span>
        <h3>${escapeHtml(b.name)}</h3>
        <p>${escapeHtml(b.tagline || "")}</p>
        <span class="more">Learn about ${escapeHtml(b.short)} →</span>
      </a>`).join("");
    // Keep the grid balanced: 2 columns for 2 or 4 disciplines, 3 otherwise
    el.classList.toggle("grid-2", BRANCHES.length % 3 !== 0);
    el.classList.toggle("grid-3", BRANCHES.length % 3 === 0);
  }

  /* On a discipline page (<body data-branch="id">), fill [data-branch-field="name|eligibility|short"] */
  function fillBranchPage() {
    const id = document.body.dataset.branch;
    const b = id && branchById(id);
    if (!b) return;
    document.querySelectorAll("[data-branch-field]").forEach(el => {
      const v = b[el.dataset.branchField];
      if (v !== undefined) el.textContent = v;
    });
    if (b.color) document.documentElement.style.setProperty("--branch", b.color);
  }

  /* ---------------- Schedule ---------------- */
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const branchStyle = text => {
    const b = branchFor(text);
    return b && b.color ? `style="--b:${b.color}"` : "";
  };

  function parseTime(t) {
    const m = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i.exec(t);
    if (!m) return 0;
    let h = +m[1] % 12; if (/pm/i.test(m[3])) h += 12;
    return h * 60 + (+(m[2] || 0));
  }

  const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const sameBranch = (a, b) => (branchFor(a) || { id: a }).id === (branchFor(b) || { id: b }).id;
  /* Cancellation record for a session on a given date, or undefined */
  function cancellationFor(data, session, date) {
    const iso = isoDate(date);
    return (data.cancellations || []).find(c => c.date === iso && (!c.branch || sameBranch(c.branch, session.branch)));
  }

  /* Next session that isn't cancelled, looking up to 3 weeks ahead */
  function nextSession(data) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    let best = null;
    for (const s of data.sessions) {
      const d = DAYS.indexOf(s.day);
      let delta = (d - now.getDay() + 7) % 7;
      if (delta === 0 && parseTime(s.end) <= nowMin) delta = 7;
      while (delta <= 21 && cancellationFor(data, s, addDays(now, delta))) delta += 7;
      if (delta > 21) continue;
      const score = delta * 1440 + parseTime(s.start);
      if (!best || score < best.score) best = { ...s, score, delta };
    }
    return best;
  }

  function renderAnnouncement(data) {
    const el = document.getElementById("announcement");
    const a = data.announcement;
    if (!el || !a || !a.text) return;
    if (a.until && isoDate(new Date()) > a.until) return;
    el.innerHTML = `<strong>Heads up:</strong> ${escapeHtml(a.text)}`;
    el.hidden = false;
  }

  function renderSchedule(data) {
    renderAnnouncement(data);
    const termEl = document.getElementById("schedule-term");
    if (termEl) termEl.textContent = data.term;
    const ss = document.getElementById("stat-sessions"); if (ss) ss.textContent = data.sessions.length;

    // Table
    const tbody = document.querySelector("#schedule-table tbody");
    if (tbody) {
      tbody.innerHTML = data.sessions.map(s => `
        <tr>
          <td class="day">${s.day}</td>
          <td>${s.start} – ${s.end}</td>
          <td><span class="pill" ${branchStyle(s.branch)}>${s.branch}</span></td>
          <td>${data.locations[s.location] ? `<a href="${data.locations[s.location].map}" target="_blank" rel="noopener">${s.location}</a>` : s.location}</td>
        </tr>`).join("");
    }

    // Week view
    const week = document.getElementById("schedule-week");
    if (week) {
      const now = new Date();
      const today = DAYS[now.getDay()];
      // Monday-first week containing today
      const monday = addDays(now, -((now.getDay() + 6) % 7));
      week.innerHTML = DAYS.slice(1).concat(DAYS[0]).map((day, i) => {
        const date = addDays(monday, i);
        const items = data.sessions.filter(s => s.day === day);
        const dateLabel = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        return `<div class="daycol ${day === today ? "today" : ""}">
          <h4>${day}${day === today ? " · Today" : ""} <span class="date">${dateLabel}</span></h4>
          ${items.length ? items.map(s => {
            const c = cancellationFor(data, s, date);
            return `<div class="sess ${c ? "cancelled" : ""}" ${branchStyle(s.branch)}>
              <strong>${s.branch}</strong>${s.start} – ${s.end}<br><span class="muted small">${s.location}</span>
              ${c ? `<span class="cancel-note">No practice${c.note ? " · " + escapeHtml(c.note) : ""}</span>` : ""}
            </div>`;
          }).join("") : '<div class="rest">Rest day</div>'}
        </div>`;
      }).join("");
    }

    // Next up banner
    const next = document.getElementById("next-up");
    if (next && data.sessions.length) {
      const n = nextSession(data);
      if (!n) { next.hidden = true; return; }
      const when = n.delta === 0 ? "Today" : n.delta === 1 ? "Tomorrow" : n.delta < 7 ? n.day : `${n.day} ${addDays(new Date(), n.delta).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
      next.innerHTML = `<span class="label">Next practice</span><strong>${when} · ${n.start}</strong><span>${n.branch} at ${n.location}</span>`;
    }

    // Notes
    const notes = document.getElementById("schedule-notes");
    if (notes) notes.innerHTML = data.notes.map(n => `<li>${n}</li>`).join("");

    // Locations
    const locs = document.getElementById("schedule-locations");
    if (locs) {
      locs.innerHTML = Object.entries(data.locations).map(([key, l]) => `
        <div class="card">
          <h3>${l.name}</h3>
          <p><strong>${l.room}</strong><br>${l.address}</p>
          <a class="btn btn-outline" href="${l.map}" target="_blank" rel="noopener">Open in Maps</a>
        </div>`).join("");
    }

    // Branch-specific mini schedules (on jiu-jitsu.html / wrestling.html)
    document.querySelectorAll("[data-branch-schedule]").forEach(el => {
      const id = el.dataset.branchSchedule || document.body.dataset.branch;
      const items = data.sessions.filter(s => (branchFor(s.branch) || {}).id === id);
      el.innerHTML = items.length
        ? items.map(s => `<li><strong>${s.day}</strong> — ${s.start} – ${s.end} · ${s.location}</li>`).join("")
        : `<li class="muted">Practice times will be posted here soon.</li>`;
    });
  }

  /* ---------------- Leadership ---------------- */
  function personCard(p) {
    const initials = p.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const avatar = p.photo
      ? `<img class="avatar" src="${p.photo}" alt="${p.name}">`
      : `<div class="avatar" aria-hidden="true">${initials}</div>`;
    return `<div class="person">
      ${avatar}
      <h3>${p.name}</h3>
      ${p.role ? `<div class="role">${p.role}</div>` : ""}
      ${p.year ? `<div class="year">Class of ${p.year}</div>` : ""}
      ${p.bio ? `<p class="small muted">${p.bio}</p>` : ""}
    </div>`;
  }

  function renderLeadership(data) {
    const board = document.getElementById("board-grid");
    if (board) board.innerHTML = data.board.map(personCard).join("");
    const coaches = document.getElementById("coaches-grid");
    const coachesSection = document.getElementById("coaches-section");
    if (coaches) {
      if (data.coaches && data.coaches.length) coaches.innerHTML = data.coaches.map(personCard).join("");
      else if (coachesSection) coachesSection.hidden = true;
    }
  }

  /* ---------------- Gallery ---------------- */
  function renderGallery(data) {
    const grid = document.getElementById("gallery");
    if (!grid) return;
    const photos = (data.photos || []).slice().reverse(); // newest first
    if (!photos.length) {
      grid.outerHTML = `<div class="gallery-empty" id="gallery">
        <p><strong>No photos yet.</strong></p>
        <p class="small">Officers: add photos in the Site Editor and they appear here automatically.</p>
      </div>`;
      return;
    }
    grid.innerHTML = photos.map((p, i) => `
      <a href="${p.full}" data-index="${i}" aria-label="Photo ${i + 1} of ${photos.length}">
        <img src="${p.thumb || p.full}" alt="" loading="lazy" width="${p.w || ""}" height="${p.h || ""}">
      </a>`).join("");

    // Lightbox
    const lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML = `<button class="close" aria-label="Close">×</button>
      <button class="prev" aria-label="Previous">‹</button>
      <img alt="">
      <button class="next" aria-label="Next">›</button>
      <div class="caption"></div>`;
    document.body.append(lb);
    const img = lb.querySelector("img"), cap = lb.querySelector(".caption");
    let idx = 0;
    const show = i => {
      idx = (i + photos.length) % photos.length;
      img.src = photos[idx].full;
      cap.textContent = `${idx + 1} / ${photos.length}`;
      lb.classList.add("open");
    };
    const hide = () => lb.classList.remove("open");
    grid.addEventListener("click", e => { const a = e.target.closest("a"); if (!a) return; e.preventDefault(); show(+a.dataset.index); });
    lb.querySelector(".close").addEventListener("click", hide);
    lb.querySelector(".prev").addEventListener("click", () => show(idx - 1));
    lb.querySelector(".next").addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", e => { if (e.target === lb) hide(); });
    document.addEventListener("keydown", e => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });

    const count = document.getElementById("photo-count");
    if (count) count.textContent = `${photos.length} photo${photos.length === 1 ? "" : "s"}`;
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    let site;
    try {
      site = await loadJSON("data/site.json");
    } catch (e) {
      console.error(e);
      site = { name: "Harvard Combat Sports Club", short: "HCSC", email: "", whatsapp: "#" };
    }
    try {
      const br = await loadJSON("data/branches.json");
      BRANCHES = (br.branches || []).filter(b => b.active !== false);
    } catch (e) { console.error(e); }

    renderHeader(site);
    renderFooter(site);
    fillSiteTokens(site);
    renderBranchCards();
    fillBranchPage();
    const sb = document.getElementById("stat-branches"); if (sb) sb.textContent = BRANCHES.length;
    const igList = document.getElementById("instagram-list");
    if (igList) igList.innerHTML = BRANCHES.filter(b => b.instagram).map(b =>
      `<a href="https://instagram.com/${b.instagram}" target="_blank" rel="noopener">@${b.instagram}</a> · ${escapeHtml(b.short)}`).join("<br>");

    const wants = document.body.dataset.load ? document.body.dataset.load.split(/\s+/) : [];
    const jobs = [];
    if (wants.includes("schedule")) jobs.push(loadJSON("data/schedule.json").then(renderSchedule));
    if (wants.includes("leadership")) jobs.push(loadJSON("data/leadership.json").then(renderLeadership));
    if (wants.includes("photos")) jobs.push(loadJSON("data/photos.json").then(renderGallery));
    await Promise.allSettled(jobs).then(results => results.forEach(r => r.status === "rejected" && console.error(r.reason)));
  });
})();
