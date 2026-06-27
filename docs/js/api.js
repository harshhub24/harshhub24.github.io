// Tiny fetch wrapper. Same-origin, sends cookies, attaches X-CSRFToken on writes.
(function () {
  function getCookie(name) {
    return document.cookie.split("; ").reduce((acc, c) => {
      const [k, ...v] = c.split("=");
      return k === name ? decodeURIComponent(v.join("=")) : acc;
    }, "");
  }

  async function request(method, path, body, opts = {}) {
    const headers = { Accept: "application/json", ...(opts.headers || {}) };
    let payload;
    if (body instanceof FormData) {
      payload = body;
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
    if (!["GET", "HEAD"].includes(method)) {
      const token = getCookie("csrf_token");
      if (token) headers["X-CSRFToken"] = token;
    }
    // When API_BASE is set, the frontend is hosted on a different origin
    // (e.g. GitHub Pages) and we need credentials: "include" so cookies
    // travel cross-origin. Same-origin deployments work either way.
    const credentials = window.API_BASE ? "include" : "same-origin";
    const res = await fetch((window.API_BASE || "") + path, {
      method,
      headers,
      body: payload,
      credentials,
      signal: opts.signal,
    });
    let json = null;
    try { json = await res.json(); } catch (_) { /* non-JSON response */ }
    if (!res.ok || (json && json.ok === false)) {
      const err = new Error((json && json.error && json.error.message) || `Request failed (${res.status})`);
      err.status = res.status;
      err.fields = json && json.error && json.error.fields;
      err.code = json && json.error && json.error.code;
      throw err;
    }
    return json ? json.data : null;
  }

  window.API = {
    get: (p, o) => request("GET", p, undefined, o),
    post: (p, b, o) => request("POST", p, b, o),
    put: (p, b, o) => request("PUT", p, b, o),
    del: (p, o) => request("DELETE", p, undefined, o),
  };
})();
