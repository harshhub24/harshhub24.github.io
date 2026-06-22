// Home page hydration: profile, skills, featured projects/certs, stats.
(async function () {
  const $ = (s) => document.querySelector(s);

  function projectCard(p) {
    const tech = (p.tech_stack || []).slice(0, 4).map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join("");
    const media = p.image
      ? `<img loading="lazy" decoding="async" alt="${escapeHTML(p.title)}" src="${escapeHTML(p.image)}">`
      : escapeHTML(p.title.charAt(0));
    return `
      <a href="/projects" class="card project-card reveal">
        <div class="card-media">${media}</div>
        <div class="card-meta">${escapeHTML(p.category)}</div>
        <div class="card-title">${escapeHTML(p.title)}</div>
        <p class="card-desc">${escapeHTML(p.description)}</p>
        <div class="tag-row">${tech}</div>
      </a>`;
  }

  function certCard(c) {
    return `
      <div class="card reveal">
        <div class="card-meta">${escapeHTML(c.issuer)} · ${escapeHTML(c.issued_date || "")}</div>
        <div class="card-title">${escapeHTML(c.title)}</div>
        ${c.credential_id ? `<p class="card-desc">ID: ${escapeHTML(c.credential_id)}</p>` : ""}
        ${c.credential_url ? `<div class="card-actions"><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="${escapeHTML(c.credential_url)}">Verify</a></div>` : ""}
      </div>`;
  }

  try {
    const [profile, projects, certs, stats] = await Promise.all([
      API.get("/api/profile"),
      API.get("/api/projects?featured=1"),
      API.get("/api/certificates?featured=1"),
      API.get("/api/stats"),
    ]);

    if (profile) {
      $("#heroName").textContent = profile.full_name || "";
      $("#heroTitle").textContent = profile.title || "";
      $("#heroTagline").textContent = profile.tagline || "";
      $("#aboutBio").textContent = profile.bio || "";
      $("#aboutLocation").textContent = profile.location || "—";
      $("#aboutEmail").textContent = profile.email || "—";

      const skillsHost = $("#skills");
      (profile.skills || []).forEach((s, i) => {
        const el = document.createElement("div");
        el.className = "skill reveal";
        el.style.transitionDelay = (i % 6) * 60 + "ms";
        el.textContent = s;
        skillsHost.appendChild(el);
      });

      const socials = profile.socials || {};
      const socialHost = $("#socials");
      const items = [
        ["github", "GitHub", "GH"],
        ["linkedin", "LinkedIn", "in"],
        ["twitter", "Twitter", "X"],
        ["website", "Website", "W"],
      ];
      socialHost.innerHTML = items
        .filter(([k]) => socials[k])
        .map(([k, label, glyph]) =>
          `<a href="${escapeHTML(socials[k])}" target="_blank" rel="noopener" aria-label="${label}"><span aria-hidden="true">${glyph}</span></a>`
        ).join("");
    }

    $("#statProjects").textContent = stats.projects;
    $("#statCerts").textContent = stats.certificates;
    $("#statCategories").textContent = stats.categories;
    $("#statYears").textContent = new Date().getFullYear() - 2022;

    $("#featuredProjects").innerHTML = (projects || []).slice(0, 3).map(projectCard).join("")
      || `<div class="empty">No featured projects yet.</div>`;
    $("#featuredCerts").innerHTML = (certs || []).slice(0, 3).map(certCard).join("")
      || `<div class="empty">No featured certificates yet.</div>`;

    observeReveal();
  } catch (e) {
    console.error(e);
    toast("Could not load profile data.", "error");
  }
})();
