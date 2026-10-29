(function () {
  const { esc, API, link, fmtDate, state } = Site;
  const list = document.getElementById("blogList"), empty = document.getElementById("blogEmpty"), search = document.getElementById("blogSearch");
  const href = (slug) => link("/blog/post") + "?slug=" + encodeURIComponent(slug);
  let ctrl, t;
  async function load() {
    const q = search.value.trim();
    if (ctrl) ctrl.abort();
    ctrl = new AbortController();
    state.loading(list, 2);
    try {
      const items = await API.get("/api/posts" + (q ? "?q=" + encodeURIComponent(q) : ""), { signal: ctrl.signal });
      if (!items.length) { list.innerHTML = ""; empty.hidden = false; state.done(list); return; }
      empty.hidden = true;
      list.innerHTML = items.map((p) => '<a class="blog-card" href="' + esc(href(p.slug)) + '"><h3>' + esc(p.title) + '</h3><p class="muted">' + esc((p.excerpt || "").replace(/\s+/g, " ").slice(0, 180)) + '</p><div class="card-meta"><span>' + esc(fmtDate(p.created_at)) + '</span><span>♥ ' + (p.likes_count | 0) + "</span></div></a>").join("");
      state.done(list);
    } catch (e) { if (e.name !== "AbortError") state.error(list, "Couldn't load posts.", load); }
  }
  search.addEventListener("input", () => { clearTimeout(t); t = setTimeout(load, 250); });
  load();
})();
