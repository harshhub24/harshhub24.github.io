// Projects page: search + category filter, debounced.
(function () {
  const grid = document.getElementById("projectGrid");
  const searchInput = document.getElementById("searchInput");
  const catSelect = document.getElementById("categorySelect");
  let controller = null;

  function skeleton(n = 6) {
    grid.innerHTML = Array.from({ length: n }).map(() => `<div class="skeleton skeleton-card"></div>`).join("");
  }

  function render(items) {
    if (!items.length) {
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
        <h3 style="margin-bottom:8px">No projects found</h3>
        <p>Try a different search or category.</p>
      </div>`;
      return;
    }
    grid.innerHTML = items.map((p) => {
      const tech = (p.tech_stack || []).map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join("");
      const media = p.image
        ? `<img loading="lazy" decoding="async" alt="${escapeHTML(p.title)}" src="${escapeHTML(p.image)}">`
        : escapeHTML(p.title.charAt(0));
      const repo = p.repo_url ? `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${escapeHTML(p.repo_url)}">Source</a>` : "";
      const live = p.live_url ? `<a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${escapeHTML(p.live_url)}">Live</a>` : "";
      return `
        <article class="card project-card reveal" style="position:relative">
          ${p.featured ? `<span class="badge-featured">Featured</span>` : ""}
          <div class="card-media">${media}</div>
          <div class="card-meta">${escapeHTML(p.category)}</div>
          <div class="card-title">${escapeHTML(p.title)}</div>
          <p class="card-desc">${escapeHTML(p.description)}</p>
          <div class="tag-row">${tech}</div>
          <div class="card-actions">${live}${repo}</div>
        </article>`;
    }).join("");
    observeReveal();
  }

  async function load() {
    if (controller) controller.abort();
    controller = new AbortController();
    skeleton();
    const params = new URLSearchParams();
    if (searchInput.value) params.set("q", searchInput.value);
    if (catSelect.value) params.set("category", catSelect.value);
    try {
      const items = await API.get(`/api/projects?${params}`, { signal: controller.signal });
      render(items);
    } catch (e) {
      if (e.name === "AbortError") return;
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1">Failed to load projects.</div>`;
    }
  }

  async function loadCategories() {
    try {
      const cats = await API.get("/api/categories");
      catSelect.innerHTML = `<option value="">All categories</option>` +
        cats.map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
    } catch (_) {/* non-fatal */}
  }

  searchInput.addEventListener("input", debounce(load, 250));
  catSelect.addEventListener("change", load);
  loadCategories().then(load);
})();
