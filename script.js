const navToggleButtons = document.querySelectorAll('.nav-toggle');

navToggleButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const navLinks = btn.parentElement.querySelector('.nav-links');
    if (!navLinks) return;

    const willOpen = !navLinks.classList.contains('show');
    navLinks.classList.toggle('show');
    btn.setAttribute('aria-expanded', String(willOpen));
  });
});
