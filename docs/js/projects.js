(function () {
  const { esc, API, state } = Site;
  const list = document.getElementById("list"), cats = document.getElementById("cats"), q = document.getElementById("q"), count = document.getElementById("count");
  let all = [], cat = "";
  function render() {
    const term = q.value.trim().toLowerCase();
    const rows = all.filter((p) => (!cat || p.category === cat) && (!term || (p.title + " " + p.description + " " + (p.tech_stack || []).join(" ")).toLowerCase().includes(term)));
    count.textContent = all.length ? rows.length + " of " + all.length + " projects" : "";
    if (!rows.length) return state.empty(list, all.length ? "No projects match your filters." : "Projects will appear here soon.");
    list.innerHTML = rows.map(Cards.project).join(""); state.done(list);
  }
  function chips() {
    const names = [...new Set(all.map((p) => p.category))].sort();
    cats.hidden = names.length < 2;
    cats.innerHTML = ["", ...names].map((n) => '<button type="button" class="chip chip-btn" data-cat="' + esc(n) + '" aria-pressed="' + (n === cat) + '">' + (n ? esc(n) : "All") + "</button>").join("");
  }
  cats.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (!b) return; cat = b.dataset.cat; chips(); render(); });
  let t; q.addEventListener("input", () => { clearTimeout(t); t = setTimeout(render, 150); });
  async function load() {
    state.loading(list, 3);
    try { all = await API.get("/api/projects"); chips(); render(); } catch (_) { state.error(list, "Couldn't load projects.", load); }
  }
  load();
})();
