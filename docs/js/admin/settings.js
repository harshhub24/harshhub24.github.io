// Admin SEO settings.
(async function () {
  const form = document.getElementById("settingsForm");
  try {
    const s = await API.get("/api/admin/settings");
    for (const k of ["site_title", "site_description", "site_keywords", "og_image", "twitter_handle", "canonical_base"]) {
      if (form.elements[k]) form.elements[k].value = s[k] || "";
    }
  } catch (_) { toast("Load failed", "error"); }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {};
    for (const k of ["site_title", "site_description", "site_keywords", "og_image", "twitter_handle", "canonical_base"]) {
      payload[k] = form.elements[k].value.trim();
    }
    try { await API.put("/api/admin/settings", payload); toast("Settings saved.", "success"); }
    catch (err) { toast(err.message || "Save failed", "error"); }
  });
})();
