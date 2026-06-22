// Mobile sidebar toggle + logout helper for admin pages.
(function () {
  const shell = document.querySelector(".admin-shell");
  document.querySelectorAll("[data-sidebar-toggle]").forEach((b) =>
    b.addEventListener("click", () => shell?.classList.toggle("sidebar-open"))
  );
})();
