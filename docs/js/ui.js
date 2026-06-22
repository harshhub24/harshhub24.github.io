// Toast, scroll-reveal, modal, helpers
(function () {
  // Toast
  let host;
  function ensureHost() {
    if (host) return host;
    host = document.createElement("div");
    host.className = "toast-host";
    document.body.appendChild(host);
    return host;
  }
  window.toast = function (msg, type = "info", ms = 3500) {
    const el = document.createElement("div");
    el.className = "toast " + type;
    el.textContent = msg;
    ensureHost().appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(8px)"; el.style.transition = "all .25s"; }, ms - 250);
    setTimeout(() => el.remove(), ms);
  };

  // Scroll-reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  window.observeReveal = function (root = document) {
    root.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
  };
  document.addEventListener("DOMContentLoaded", () => window.observeReveal());

  // Helpers
  window.escapeHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  };
  window.debounce = function (fn, ms) {
    let t;
    return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
  };

  // Modal helpers
  window.openModal = function (id) { document.getElementById(id)?.classList.add("open"); };
  window.closeModal = function (id) { document.getElementById(id)?.classList.remove("open"); };
  document.addEventListener("click", (e) => {
    if (e.target.classList?.contains("modal-backdrop")) e.target.classList.remove("open");
    if (e.target.dataset?.modalClose) {
      e.target.closest(".modal-backdrop")?.classList.remove("open");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".modal-backdrop.open").forEach((m) => m.classList.remove("open"));
  });
})();
