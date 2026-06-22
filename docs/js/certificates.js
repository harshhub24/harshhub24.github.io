// Certificates page: search + verify button.
(function () {
  const grid = document.getElementById("certGrid");
  const searchInput = document.getElementById("certSearch");
  let controller = null;

  function skeleton(n = 6) {
    grid.innerHTML = Array.from({ length: n }).map(() => `<div class="skeleton skeleton-card"></div>`).join("");
  }

  function render(items) {
    if (!items.length) {
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
        <h3 style="margin-bottom:8px">No certificates found</h3>
        <p>Try a different search.</p>
      </div>`;
      return;
    }
    grid.innerHTML = items.map((c) => `
      <article class="card reveal" style="position:relative">
        ${c.featured ? `<span class="badge-featured">Featured</span>` : ""}
        <div class="card-meta">${escapeHTML(c.issuer)}${c.issued_date ? " · " + escapeHTML(c.issued_date) : ""}</div>
        <div class="card-title">${escapeHTML(c.title)}</div>
        ${c.credential_id ? `<p class="card-desc">Credential ID: ${escapeHTML(c.credential_id)}</p>` : ""}
        <div class="card-actions">
          ${c.credential_url ? `<a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="${escapeHTML(c.credential_url)}">Verify credential</a>` : `<span class="muted" style="font-size:.85rem">No verification link</span>`}
        </div>
      </article>`).join("");
    observeReveal();
  }

  async function load() {
    if (controller) controller.abort();
    controller = new AbortController();
    skeleton();
    const params = new URLSearchParams();
    if (searchInput.value) params.set("q", searchInput.value);
    try {
      const items = await API.get(`/api/certificates?${params}`, { signal: controller.signal });
      render(items);
    } catch (e) {
      if (e.name === "AbortError") return;
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1">Failed to load certificates.</div>`;
    }
  }

  searchInput.addEventListener("input", debounce(load, 250));
  load();
})();
