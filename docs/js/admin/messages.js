// Admin messages.
(async function () {
  const tbody = document.getElementById("msgRows");
  async function load() {
    try {
      const items = await API.get("/api/admin/messages");
      tbody.innerHTML = items.length ? items.map((m) => `
        <tr style="${m.is_read ? "opacity:.65" : ""}">
          <td><strong>${escapeHTML(m.name)}</strong><div class="muted" style="font-size:.8rem">${escapeHTML(m.email)}</div></td>
          <td style="max-width:480px;white-space:pre-wrap">${escapeHTML(m.message)}</td>
          <td class="muted" style="font-size:.82rem">${escapeHTML(m.created_at)}</td>
          <td><div class="row-actions">
            ${m.is_read ? "" : `<button class="btn btn-ghost btn-sm" data-read="${m.id}">Mark read</button>`}
            <button class="btn btn-danger btn-sm" data-del="${m.id}">Delete</button>
          </div></td>
        </tr>`).join("") : `<tr><td colspan="4" class="muted">No messages.</td></tr>`;
    } catch (_) { toast("Load failed", "error"); }
  }
  tbody.addEventListener("click", async (e) => {
    const r = e.target.dataset.read;
    const d = e.target.dataset.del;
    if (r) { try { await API.post(`/api/admin/messages/${r}/read`); load(); } catch (_) { toast("Failed", "error"); } }
    if (d && confirm("Delete message?")) { try { await API.del(`/api/admin/messages/${d}`); load(); } catch (_) { toast("Failed", "error"); } }
  });
  load();
})();
