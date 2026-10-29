// Shared card renderers (projects, services, certificates).
(function () {
  const { esc, safeUrl, media, link, fmtDate } = Site;
  const ICONS = {
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2.3-.7-.7-2.3z"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
    slides: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M13 15h4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  };
  const icon = (k) => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[k] || ICONS.code) + "</svg>";

  function project(p) {
    const img = media(p.image);
    const tech = (p.tech_stack || []).map((t) => '<li class="tag">' + esc(t) + "</li>").join("");
    const repo = safeUrl(p.repo_url), live = safeUrl(p.live_url);
    return '<article class="card' + (p.featured ? " card--featured" : "") + '">' +
      (img ? '<div class="card-media"><img src="' + esc(img) + '" alt="' + esc(p.image_alt || p.title) + '" loading="lazy" decoding="async"></div>' : "") +
      '<div class="card-meta"><span>' + esc(p.category) + "</span>" + (p.featured ? '<span class="pill pill-featured">Featured</span>' : "") + "</div>" +
      "<h3>" + esc(p.title) + "</h3><p>" + esc(p.description) + "</p>" +
      (tech ? '<ul class="tags" aria-label="Technologies">' + tech + "</ul>" : "") +
      ((repo || live) ? '<div class="card-actions">' +
        (repo ? '<a class="btn btn-ghost btn-sm" href="' + esc(repo) + '" target="_blank" rel="noopener noreferrer" data-track-kind="project" data-track-ref="' + esc(p.slug) + '">GitHub<span class="sr-only"> repository for ' + esc(p.title) + "</span></a>" : "") +
        (live ? '<a class="btn btn-primary btn-sm" href="' + esc(live) + '" target="_blank" rel="noopener noreferrer" data-track-kind="project" data-track-ref="' + esc(p.slug) + '">Live demo<span class="sr-only"> of ' + esc(p.title) + "</span></a>" : "") +
        "</div>" : "") + "</article>";
  }

  function service(s, full) {
    const list = (arr, cls) => (arr && arr.length ? '<ul class="checklist ' + (cls || "") + '">' + arr.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>" : "");
    return '<article class="card" id="svc-' + esc(s.slug) + '">' + icon(s.icon) + "<h3>" + esc(s.title) + "</h3><p>" + esc(s.summary) + "</p>" +
      (full ? (s.description ? "<p>" + esc(s.description) + "</p>" : "") +
        (s.deliverables.length ? "<h4>What you get</h4>" + list(s.deliverables) : "") +
        (s.limitations.length ? "<h4>Good to know</h4>" + list(s.limitations, "limits") : "") +
        '<div class="card-meta"><span>Pricing</span><strong>' + esc(s.pricing_note) + "</strong></div>" : "") +
      '<div class="card-actions"><a class="btn ' + (full ? "btn-primary" : "btn-ghost") + ' btn-sm" href="' + esc(link("/contact")) + "?service=" + encodeURIComponent(s.slug) +
      '" data-track-kind="service" data-track-ref="' + esc(s.slug) + '">' + (full ? "Request a quote" : "Learn more") + "</a></div></article>";
  }

  function cert(c) {
    const img = media(c.image), url = safeUrl(c.credential_url);
    return '<article class="card">' +
      (img ? '<div class="card-media"><img src="' + esc(img) + '" alt="' + esc(c.image_alt || c.title + " certificate") + '" loading="lazy" decoding="async"></div>' : "") +
      '<div class="card-meta"><span>' + esc(c.issuer) + "</span>" + (c.issued_date ? "<span>" + esc(fmtDate(c.issued_date)) + "</span>" : "") + "</div>" +
      "<h3>" + esc(c.title) + "</h3>" +
      (c.credential_id ? '<p>Credential ID: <code>' + esc(c.credential_id) + "</code></p>" : "") +
      (url ? '<div class="card-actions"><a class="btn btn-ghost btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">Verify credential<span class="sr-only"> for ' + esc(c.title) + "</span></a></div>" : "") +
      "</article>";
  }
  window.Cards = { project, service, cert };
})();
