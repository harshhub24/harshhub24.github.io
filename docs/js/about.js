(function () {
  const { esc, media, safeUrl, state, profile } = Site;
  const body = document.getElementById("aboutBody");
  const para = (t) => String(t || "").split(/\n{2,}|\n/).filter(Boolean).map((x) => "<p>" + esc(x) + "</p>").join("");
  const chips = (arr) => '<ul class="chips">' + arr.map((x) => '<li class="chip">' + esc(typeof x === "string" ? x : x.name) + "</li>").join("") + "</ul>";
  const section = (title, html) => (html ? '<section class="band on-light"><div class="container"><h2>' + title + "</h2>" + html + "</div></section>" : "");
  profile().then((p) => {
    if (!p) return state.empty(body, "Profile details will appear here soon.");
    document.getElementById("name").textContent = p.full_name;
    document.getElementById("title").textContent = p.title;
    const img = media(p.avatar);
    body.innerHTML =
      section("Background", (img ? '<img class="hero-avatar" src="' + esc(img) + '" alt="' + esc(p.avatar_alt || p.full_name) + '" width="220" height="220" loading="lazy">' : "") + para(p.bio)) +
      section("Learning journey", para(p.learning)) +
      section("Skills", (p.skills || []).length ? chips(p.skills) : "") +
      section("Tools", (p.tools || []).length ? chips(p.tools) : "") +
      section("Interests", (p.interests || []).length ? chips(p.interests) : "") +
      section("Elsewhere", Object.entries(p.socials || {}).filter(([, v]) => safeUrl(v)).length
        ? '<ul class="footer-links">' + Object.entries(p.socials).filter(([, v]) => safeUrl(v)).map(([k, v]) => '<li><a href="' + esc(v) + '" target="_blank" rel="noopener noreferrer">' + esc(k[0].toUpperCase() + k.slice(1)) + "</a></li>").join("") + "</ul>" : "");
  }).catch(() => state.error(body, "Couldn't load this page.", () => location.reload()));
})();
