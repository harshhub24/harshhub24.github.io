// Admin posts CRUD.
(function () {
  const tbody = document.getElementById("postRows");
  const form = document.getElementById("postForm");
  const modal = "postModal";
  let editingId = null;

  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
  function fmt(s){try{return new Date(s.replace(" ","T")+"Z").toLocaleDateString();}catch(_){return s||"";}}

  function row(p) {
    return `<tr>
      <td><strong>${esc(p.title)}</strong></td>
      <td><code>${esc(p.slug)}</code></td>
      <td><span class="badge ${p.status==='published'?'badge-ok':'badge-muted'}">${esc(p.status)}</span></td>
      <td>${p.likes_count|0}</td>
      <td class="muted">${fmt(p.updated_at || p.created_at)}</td>
      <td><div class="row-actions">
        <a class="btn btn-ghost btn-sm" href="/blog/${encodeURIComponent(p.slug)}" target="_blank" rel="noopener">View</a>
        <button class="btn btn-ghost btn-sm" data-edit="${p.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-del="${p.id}">Delete</button>
      </div></td>
    </tr>`;
  }

  async function load() {
    try {
      const items = await API.get("/api/admin/posts");
      tbody.innerHTML = items.length
        ? items.map(row).join("")
        : `<tr><td colspan="6" class="muted">No posts yet — click “Add post”.</td></tr>`;
    } catch (_) { toast("Load failed", "error"); }
  }

  document.getElementById("newPostBtn").addEventListener("click", () => {
    editingId = null;
    form.reset();
    form.elements.status.value = "published";
    document.getElementById("postModalTitle").textContent = "New post";
    openModal(modal);
  });

  tbody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-del]");
    if (editBtn) {
      try {
        const p = await API.get(`/api/admin/posts/${editBtn.dataset.edit}`);
        editingId = p.id;
        for (const k of ["title", "slug", "author", "content", "status"]) {
          form.elements[k].value = p[k] || "";
        }
        document.getElementById("postModalTitle").textContent = "Edit post";
        openModal(modal);
      } catch (_) { toast("Couldn't load post", "error"); }
    }
    if (delBtn) {
      if (!confirm("Delete this post? Its comments and likes will also be removed.")) return;
      try { await API.del(`/api/admin/posts/${delBtn.dataset.del}`); toast("Deleted.", "success"); load(); }
      catch (_) { toast("Delete failed", "error"); }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title: form.elements.title.value,
      slug: form.elements.slug.value,
      author: form.elements.author.value,
      content: form.elements.content.value,
      status: form.elements.status.value,
    };
    try {
      if (editingId) await API.put(`/api/admin/posts/${editingId}`, payload);
      else await API.post("/api/admin/posts", payload);
      closeModal(modal);
      toast("Saved.", "success");
      load();
    } catch (err) {
      toast(err.message || "Save failed", "error");
    }
  });

  load();
})();
