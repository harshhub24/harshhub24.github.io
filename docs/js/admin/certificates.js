// Admin certificates CRUD.
(async function () {
  const tbody = document.getElementById("certRows");
  const form = document.getElementById("certForm");
  const modal = "certModal";
  let editingId = null;

  function row(c) {
    return `<tr>
      <td><strong>${escapeHTML(c.title)}</strong></td>
      <td>${escapeHTML(c.issuer)}</td>
      <td>${escapeHTML(c.issued_date || "")}</td>
      <td>${c.featured ? "★" : ""}</td>
      <td><div class="row-actions">
        <button class="btn btn-ghost btn-sm" data-edit='${JSON.stringify(c).replace(/'/g, "&#39;")}'>Edit</button>
        <button class="btn btn-danger btn-sm" data-del="${c.id}">Delete</button>
      </div></td>
    </tr>`;
  }

  async function load() {
    try {
      const items = await API.get("/api/certificates");
      tbody.innerHTML = items.length ? items.map(row).join("") : `<tr><td colspan="5" class="muted">No certificates yet.</td></tr>`;
    } catch (_) { toast("Load failed", "error"); }
  }

  document.getElementById("newCertBtn").addEventListener("click", () => {
    editingId = null;
    form.reset();
    document.getElementById("certModalTitle").textContent = "New certificate";
    openModal(modal);
  });

  tbody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-del]");
    if (editBtn) {
      const c = JSON.parse(editBtn.getAttribute("data-edit").replace(/&#39;/g, "'"));
      editingId = c.id;
      for (const k of ["title", "issuer", "issued_date", "credential_id", "credential_url", "image"]) {
        form.elements[k].value = c[k] || "";
      }
      form.elements.featured.checked = !!c.featured;
      document.getElementById("certModalTitle").textContent = "Edit certificate";
      openModal(modal);
    }
    if (delBtn) {
      if (!confirm("Delete this certificate?")) return;
      try { await API.del(`/api/admin/certificates/${delBtn.dataset.del}`); toast("Deleted.", "success"); load(); }
      catch (_) { toast("Delete failed", "error"); }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title: form.elements.title.value,
      issuer: form.elements.issuer.value,
      issued_date: form.elements.issued_date.value,
      credential_id: form.elements.credential_id.value,
      credential_url: form.elements.credential_url.value,
      image: form.elements.image.value,
      featured: form.elements.featured.checked,
    };
    try {
      if (editingId) await API.put(`/api/admin/certificates/${editingId}`, payload);
      else await API.post("/api/admin/certificates", payload);
      closeModal(modal);
      toast("Saved.", "success");
      load();
    } catch (err) { toast(err.message || "Save failed", "error"); }
  });

  load();
})();
