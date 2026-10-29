// Shared public-site helpers: API client, escaping, toasts, nav, privacy-minimal tracking.
(function () {
  "use strict";
  const cfg = window.SITE_CONFIG || { apiBase: "", siteBase: "", trailingSlash: false };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Only http(s) URLs may reach an href/src. Blocks javascript:, data: etc.
  const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
  const link = (p) => cfg.siteBase + (p === "/" ? "/" : p + (cfg.trailingSlash ? "/" : ""));
  const media = (u) => (u && u.startsWith("/uploads/") ? cfg.apiBase + u : safeUrl(u));
  const fmtDate = (s) => {
    if (!s) return "";
    const d = new Date(/^\d{4}(-\d{2})?$/.test(s) ? s + (s.length === 4 ? "-01-01" : "-01") : s.replace(" ", "T") + (s.length > 10 ? "Z" : ""));
    return isNaN(d) ? s : d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  };

  class ApiError extends Error {
    constructor(message, status, fields, code) { super(message); this.status = status; this.fields = fields || {}; this.code = code; }
  }
  const API = {
    async request(method, path, body, opts) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      try {
        const res = await fetch(cfg.apiBase + path, {
          method, signal: (opts && opts.signal) || ctrl.signal, headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });
        let json = null;
        try { json = await res.json(); } catch (_) { /* non-JSON */ }
        if (!res.ok || !json || json.ok === false) {
          const e = json && json.error;
          throw new ApiError((e && e.message) || "Something went wrong. Please try again.", res.status, e && e.fields, e && e.code);
        }
        return json.data;
      } catch (err) {
        if (err instanceof ApiError) throw err;
        if (err.name === "AbortError") throw err;
        throw new ApiError("Can't reach the server right now. Please try again shortly.", 0);
      } finally { clearTimeout(timer); }
    },
    get(path, opts) { return this.request("GET", path, null, opts); },
    post(path, body) { return this.request("POST", path, body || {}); },
  };

  function toast(msg, type) {
    const region = document.getElementById("toastRegion");
    if (!region) return;
    const t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.textContent = msg;
    region.appendChild(t);
    setTimeout(() => t.remove(), 4500);
  }

  const state = {
    loading(el, n) { el.innerHTML = Array.from({ length: n || 3 }, () => '<div class="skeleton" aria-hidden="true"></div>').join(""); el.setAttribute("aria-busy", "true"); },
    done(el) { el.removeAttribute("aria-busy"); },
    empty(el, msg) { el.innerHTML = '<div class="state">' + esc(msg) + "</div>"; state.done(el); },
    error(el, msg, retry) {
      el.innerHTML = '<div class="state" role="alert">' + esc(msg) + (retry ? ' <button type="button" class="btn btn-ghost btn-sm" data-retry>Try again</button>' : "") + "</div>";
      state.done(el);
      const b = el.querySelector("[data-retry]");
      if (b) b.addEventListener("click", retry);
    },
  };

  // ---- tracking: sendBeacon, no cookies, respects Do Not Track, failures are silent ----
  const track = {
    send(payload) {
      try {
        if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
        const body = JSON.stringify(payload);
        const url = cfg.apiBase + "/api/track";
        if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }));
        else fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
      } catch (_) { /* never break the page */ }
    },
    route() {
      let p = location.pathname;
      if (cfg.siteBase && p.startsWith(cfg.siteBase)) p = p.slice(cfg.siteBase.length) || "/";
      return p;
    },
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-track-kind]");
    if (a) track.send({ path: track.route(), kind: a.dataset.trackKind, ref: a.dataset.trackRef });
  });

  let _profile;
  const profile = () => (_profile = _profile || API.get("/api/profile"));
  window.Site = { profile, cfg, esc, safeUrl, link, media, fmtDate, API, ApiError, toast, state, track };

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("navToggle"), menu = document.getElementById("navLinks");
    if (btn && menu) {
      btn.addEventListener("click", () => { const o = menu.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("open")) { menu.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.focus(); } });
    }
    track.send({ path: track.route(), kind: "page" });
    // Footer socials + brand name from the profile (non-critical, best effort).
    profile().then((p) => {
      if (!p) return;
      const ul = document.getElementById("footerSocials");
      if (ul && p.socials) ul.innerHTML = Object.entries(p.socials).map(([k, v]) => safeUrl(v) ? '<li><a href="' + esc(v) + '" rel="noopener noreferrer" target="_blank">' + esc(k[0].toUpperCase() + k.slice(1)) + "</a></li>" : "").join("");
    }).catch(() => {});
  });
})();
