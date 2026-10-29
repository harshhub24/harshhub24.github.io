(function () {
  const { API, state } = Site, list = document.getElementById("list");
  async function load() {
    state.loading(list, 3);
    try {
      const rows = await API.get("/api/services");
      if (!rows.length) return state.empty(list, "Services are being finalised. Get in touch to discuss what you need.");
      list.innerHTML = rows.map((s) => Cards.service(s, true)).join(""); state.done(list);
      if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
    } catch (_) { state.error(list, "Couldn't load services.", load); }
  }
  load();
})();
