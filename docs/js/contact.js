(function () {
  const { API, ApiError, esc, safeUrl, profile } = Site;
  const form = document.getElementById("contactForm"), send = document.getElementById("send");
  const box = document.getElementById("formError"), ok = document.getElementById("success");
  const F = ["name", "email", "subject", "message"];
  const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  const qs = new URLSearchParams(location.search), svc = (qs.get("service") || "").toLowerCase();
  if (/^[a-z0-9-]{1,100}$/.test(svc)) {
    document.getElementById("service").value = svc;
    API.get("/api/services/" + encodeURIComponent(svc)).then((s) => { const n = document.getElementById("enquiry"); n.textContent = "Enquiry about: " + s.title; n.hidden = false; }).catch(() => { document.getElementById("service").value = ""; });
  }
  document.getElementById("message").addEventListener("input", (e) => { document.getElementById("counter").textContent = e.target.value.length; });

  function setErr(name, msg) {
    const input = form.elements[name], out = document.getElementById(name + "-err");
    if (out) out.textContent = msg || "";
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function validate() {
    const v = Object.fromEntries(F.map((k) => [k, form.elements[k].value.trim()]));
    const e = {};
    if (v.name.length < 2) e.name = "Please enter your name (at least 2 characters).";
    if (!EMAIL.test(v.email)) e.email = "Please enter a valid email address.";
    if (v.message.length < 10) e.message = "Please write at least 10 characters.";
    return { v, e };
  }
  function showErrors(e) {
    F.forEach((k) => setErr(k, e[k]));
    const first = F.find((k) => e[k]);
    if (first) { box.textContent = "Please fix the highlighted fields."; box.hidden = false; form.elements[first].focus(); } else box.hidden = true;
  }
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const { v, e } = validate();
    showErrors(e);
    if (Object.keys(e).length) return;
    send.disabled = true; send.textContent = "Sending…";
    try {
      await API.post("/api/contact", { ...v, service: form.elements.service.value, website: form.elements.website.value });
      form.hidden = true; ok.hidden = false; ok.focus();
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) { showErrors(err.fields || {}); }
      else {
        box.textContent = err.status === 429 ? "You're sending messages too quickly. Please wait a minute and try again."
          : err.status === 0 ? "Couldn't reach the server, so your message was NOT sent. Check your connection and try again."
          : "Something went wrong and your message was NOT sent. Please try again later.";
        box.hidden = false; box.focus();
      }
    } finally { send.disabled = false; send.textContent = "Send message"; }
  });

  profile().then((p) => {
    if (!p) return;
    if (p.email) document.getElementById("direct").innerHTML = 'Prefer email? <a href="mailto:' + esc(p.email) + '">' + esc(p.email) + "</a>";
    document.getElementById("directSocials").innerHTML = Object.entries(p.socials || {}).filter(([, u]) => safeUrl(u)).map(([k, u]) => '<li><a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(k[0].toUpperCase() + k.slice(1)) + "</a></li>").join("");
  }).catch(() => {});
})();
