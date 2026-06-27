// Public blog index: list published posts with search.
(function () {
  const list = document.getElementById("blogList");
  const empty = document.getElementById("blogEmpty");
  const search = document.getElementById("blogSearch");

  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
  function fmtDate(s){try{return new Date(s.replace(" ","T")+"Z").toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});}catch(_){return s||"";}}

  function postHref(slug){
    // When on Flask backend (same origin), use /blog/<slug>. On static hosts use post.html?slug=…
    if (window.API_BASE || /\.html$/i.test(location.pathname) || location.pathname.endsWith("/blog.html")) {
      return `post.html?slug=${encodeURIComponent(slug)}`;
    }
    return `/blog/${encodeURIComponent(slug)}`;
  }

  function card(p){
    return `<a class="blog-card glass" href="${postHref(p.slug)}">
      <div class="blog-card-body">
        <h3>${esc(p.title)}</h3>
        <p class="muted">${esc((p.excerpt||"").replace(/\s+/g," ").slice(0,180))}${(p.excerpt||"").length>180?"…":""}</p>
        <div class="blog-meta">
          <span>${fmtDate(p.created_at)}</span>
          <span aria-label="Likes">♥ ${p.likes_count|0}</span>
        </div>
      </div>
    </a>`;
  }

  let ctrl=null, t=null;
  async function load(){
    const q = (search.value||"").trim();
    if (ctrl) ctrl.abort();
    ctrl = new AbortController();
    list.innerHTML = `<p class="muted">Loading…</p>`;
    try{
      const items = await API.get(`/api/posts${q?`?q=${encodeURIComponent(q)}`:""}`, {signal:ctrl.signal});
      if (!items || items.length===0){
        list.innerHTML = ""; empty.hidden = false; return;
      }
      empty.hidden = true;
      list.innerHTML = items.map(card).join("");
    }catch(e){
      if (e.name === "AbortError") return;
      list.innerHTML = `<p class="muted">Couldn't load posts.</p>`;
    }
  }

  search.addEventListener("input", ()=>{ clearTimeout(t); t=setTimeout(load,250); });
  load();
})();
