(function () {
  const { esc, API, state, media, safeUrl, profile } = Site;
  const show = (id, html, target) => { const sec = document.getElementById(id); if (!html) return; sec.hidden = false; document.getElementById(target).innerHTML = html; };

  // Code-style card built ONLY from real profile fields; nothing is invented.
  const q = (t) => '<span class="s">"' + esc(t) + '"</span>';
  function terminal(p, skills, s) {
    const rows = [];
    if (p) {
      rows.push('  name: ' + q(p.full_name) + ",", '  role: ' + q(p.title) + ",");
      if (skills.length) rows.push('  skills: [' + skills.slice(0, 6).map(q).join(", ") + "],");
      const tools = (p.tools || []).slice(0, 4);
      if (tools.length) rows.push('  tools: [' + tools.map(q).join(", ") + "],");
      if (s && s.availability) rows.push('  status: ' + q(s.availability) + ",");
    } else rows.push('  <span class="c">// profile not published yet</span>');
    document.getElementById("termCode").innerHTML = '<span class="c">// about me</span>\n<span class="k">const</span> <span class="p">developer</span> = {\n' + rows.join("\n") + "\n};";
  }

  async function init() {
    const [p, site, projects, services, certs, stats] = await Promise.allSettled([
      profile(), API.get("/api/site"), API.get("/api/projects"), API.get("/api/services"), API.get("/api/certificates"), API.get("/api/stats"),
    ]);
    const val = (r) => (r.status === "fulfilled" ? r.value : null);
    const prof = val(p), s = val(site);

    if (prof) {
      document.getElementById("heroTitle").textContent = prof.tagline || prof.title;
      const bio = (prof.bio || "").split("\n")[0].slice(0, 220);
      document.getElementById("heroLead").innerHTML = "<strong>" + esc(prof.full_name) + "</strong>" + (prof.tagline ? " · " + esc(prof.title) : "") + (bio ? " — " + esc(bio) : "");
      const img = media(prof.avatar);
      if (img) document.getElementById("heroAvatar").innerHTML = '<img class="hero-avatar" src="' + esc(img) + '" alt="' + esc(prof.avatar_alt || prof.full_name) + '" width="160" height="160">';
      const names = (prof.skills || []).map((x) => (typeof x === "string" ? x : x.name)).filter(Boolean);
      show("skillsSection", names.slice(0, 16).map((n) => '<li class="chip">' + esc(n) + "</li>").join(""), "homeSkills");
      const socials = Object.entries(prof.socials || {}).filter(([, u]) => safeUrl(u));
      document.getElementById("heroSocials").innerHTML = socials.map(([k, u]) => '<li><a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(k[0].toUpperCase() + k.slice(1)) + " ↗</a></li>").join("");
      terminal(prof, names, s);
    } else terminal(null, [], s);
    if (s && s.availability) document.getElementById("heroAvail").innerHTML = '<span class="badge-avail">' + esc(s.availability) + "</span>";

    const pr = val(projects) || [];
    const picks = pr.filter((x) => x.featured).slice(0, 3);
    show("projectsSection", (picks.length ? picks : pr.slice(0, 3)).map(Cards.project).join(""), "homeProjects");
    const sv = val(services) || [];
    show("servicesSection", sv.slice(0, 3).map((x) => Cards.service(x, false)).join(""), "homeServices");
    show("certsSection", (val(certs) || []).slice(0, 3).map(Cards.cert).join(""), "homeCerts");

    const st = val(stats);
    if (st) {
      // Only counts that mean something and are real; nothing is shown when zero.
      const facts = [["projects", "Projects"], ["certificates", "Certificates"], ["services", "Services offered"]].filter(([k]) => st[k] > 0);
      document.getElementById("facts").innerHTML = facts.map(([k, l]) => '<div class="fact"><strong>' + st[k] + "</strong><span>" + l + "</span></div>").join("");
    }
  }
  init();
})();
