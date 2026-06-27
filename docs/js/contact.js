// Contact form with inline validation + toast feedback.
(function () {
  const form = document.getElementById("contactForm");
  const fields = ["name", "email", "message"];
  const submitBtn = form.querySelector("button[type=submit]");

  function setError(name, msg) {
    const input = form.elements[name];
    const errEl = form.querySelector(`[data-error-for="${name}"]`);
    if (msg) {
      input.setAttribute("aria-invalid", "true");
      errEl.textContent = msg;
    } else {
      input.removeAttribute("aria-invalid");
      errEl.textContent = "";
    }
  }

  fields.forEach((f) => {
    form.elements[f].addEventListener("blur", () => {
      setError(f, Validators[f](form.elements[f].value));
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;
    const payload = {};
    fields.forEach((f) => {
      const v = form.elements[f].value;
      const err = Validators[f](v);
      setError(f, err);
      if (err) valid = false;
      payload[f] = v.trim();
    });
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      await API.post("/api/contact", payload);
      form.reset();
      toast("Thanks — your message was sent.", "success");
    } catch (err) {
      if (err.fields) Object.entries(err.fields).forEach(([k, v]) => setError(k, v));
      toast(err.message || "Could not send message.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });

  // Hydrate socials/contact info from profile
  (async () => {
    try {
      const p = await API.get("/api/profile");
      if (!p) return;
      document.getElementById("contactEmail").textContent = p.email || "—";
      document.getElementById("contactLocation").textContent = p.location || "—";
      const socials = p.socials || {};
      const host = document.getElementById("contactSocials");
      const items = [["github", "GH"], ["linkedin", "in"], ["twitter", "X"], ["website", "W"]];
      host.innerHTML = items.filter(([k]) => socials[k]).map(([k, g]) =>
        `<a href="${escapeHTML(socials[k])}" target="_blank" rel="noopener" aria-label="${k}"><span aria-hidden="true">${g}</span></a>`
      ).join("");
    } catch (_) {}
  })();
})();
