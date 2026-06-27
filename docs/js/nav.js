// Glassmorphism nav: mobile drawer + dark-theme flip when hero is in view.
(function () {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const toggle = nav.querySelector(".nav-toggle");
  toggle?.addEventListener("click", () => nav.classList.toggle("is-open"));
  nav.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));

  const darkAnchor = document.querySelector("[data-nav-dark]");
  if (!darkAnchor) { nav.classList.remove("on-dark"); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => nav.classList.toggle("on-dark", e.isIntersecting));
  }, { rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue("--header-h") || "72px"} 0px 0px 0px`, threshold: 0 });
  io.observe(darkAnchor);
})();
