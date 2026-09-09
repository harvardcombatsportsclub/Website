/* Fills the archived Harvard BJJ pages from ../../data/legacy-bjj.json */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const paras = t => String(t || "").split(/\n\s*\n/).map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");

  fetch("../../data/legacy-bjj.json", { cache: "no-cache" }).then(r => r.json()).then(data => {
    // ---- Past officers (index.html)
    const boards = document.getElementById("past-boards");
    if (boards) {
      const list = (data.boards || []).slice().sort((a, b) => String(b.year).localeCompare(String(a.year)));
      boards.innerHTML = list.length ? list.map(b => `
        <div class="board-year">
          <h3>${esc(b.year)}</h3>
          <div class="leadership-row">
            ${(b.people || []).map(p => `
              <div class="leader-card compact">
                <h3>${esc(p.name)}</h3>
                <h4>${esc(p.role)}</h4>
                ${p.classYear ? `<p>Class of ${esc(p.classYear)}</p>` : ""}
              </div>`).join("")}
          </div>
        </div>`).join("") : "<p>No past boards recorded yet.</p>";
    }

    // ---- Instructors (past-officers.html)
    const ins = document.getElementById("past-instructors");
    if (ins && (data.instructors || []).length) {
      document.getElementById("past-instructors-wrap").hidden = false;
      ins.innerHTML = data.instructors.map(p => `<div class="leader-card compact"><h3>${esc(p.name)}</h3><h4>${esc(p.role)}</h4>${p.note ? `<p>${esc(p.note)}</p>` : ""}</div>`).join("");
    }

    // ---- Stories (stories.html)
    const stories = document.getElementById("stories");
    if (stories) {
      const list = (data.stories || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const count = document.getElementById("story-count");
      if (count) count.textContent = `${list.length} ${list.length === 1 ? "story" : "stories"}`;
      stories.innerHTML = list.length ? list.map((s, i) => `
        <article class="story" id="story-${i}">
          ${s.photo ? `<img class="story-photo" src="../../${esc(s.photo)}" alt="">` : ""}
          <h3>${esc(s.title)}</h3>
          <p class="story-meta">${esc(s.author)}${s.classYear ? ` · Class of ${esc(s.classYear)}` : ""}${s.date ? ` · ${esc(s.date)}` : ""}</p>
          <div class="story-body">${paras(s.body)}</div>
        </article>`).join("") : "<p>No stories yet. Be the first to add one.</p>";
    }
  }).catch(err => console.error(err));
})();
