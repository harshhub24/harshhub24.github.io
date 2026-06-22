// Admin projects CRUD.
(async function () {
  const tbody = document.getElementById("projectRows");
  const form = document.getElementById("projectForm");
  const modal = "projectModal";
  let editingId = null;

  function row(p) {
    const tech = (p.tech_stack || []).join(", ");
    return `<tr>
      <td><strong>${escapeHTML(p.title)}</strong><div class="muted" style="font-size:.8rem">${escapeHTML(p.slug)}</div></td>
      <td>${escapeHTML(p.category)}</td>
      <td>${escapeHTML(tech)}</td>
      <td>${p.featured ? "★" : ""}</td>
      <td><div class="row-actions">
        <button class="btn btn-ghost btn-sm" data-edit='${JSON.stringify(p).replace(/'/g, "&#39;")}'>Edit</button>
        <button class="btn btn-danger btn-sm" data-del="${p.id}">Delete</button>
      </div></td>
    </tr>`;
  }

  async function load() {
    try {
      const items = await API.get("/api/projects");
      tbody.innerHTML = items.length ? items.map(row).join("") : `<tr><td colspan="5" class="muted">No projects yet.</td></tr>`;
    } catch (_) { toast("Load failed", "error"); }
  }

  document.getElementById("newProjectBtn").addEventListener("click", () => {
    editingId = null;
    form.reset();
    document.getElementById("projectModalTitle").textContent = "New project";
    openModal(modal);
  });

  tbody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-del]");
    if (editBtn) {
      const p = JSON.parse(editBtn.getAttribute("data-edit").replace(/&#39;/g, "'"));
      editingId = p.id;
      for (const k of ["title", "slug", "description", "category", "image", "repo_url", "live_url"]) {
        form.elements[k].value = p[k] || "";
      }
      form.elements.tech_stack.value = (p.tech_stack || []).join(", ");
      form.elements.featured.checked = !!p.featured;
      document.getElementById("projectModalTitle").textContent = "Edit project";
      openModal(modal);
    }
    if (delBtn) {
      if (!confirm("Delete this project?")) return;
      try { await API.del(`/api/admin/projects/${delBtn.dataset.del}`); toast("Deleted.", "success"); load(); }
      catch (_) { toast("Delete failed", "error"); }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title: form.elements.title.value,
      slug: form.elements.slug.value,
      description: form.elements.description.value,
      category: form.elements.category.value,
      tech_stack: form.elements.tech_stack.value.split(",").map((s) => s.trim()).filter(Boolean),
      image: form.elements.image.value,
      repo_url: form.elements.repo_url.value,
      live_url: form.elements.live_url.value,
      featured: form.elements.featured.checked,
    };
    try {
      if (editingId) await API.put(`/api/admin/projects/${editingId}`, payload);
      else await API.post("/api/admin/projects", payload);
      closeModal(modal);
      toast("Saved.", "success");
      load();
    } catch (err) {
      toast(err.message || "Save failed", "error");
    }
  });

  load();
})();
