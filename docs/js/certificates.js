(function () {
  const { API, state } = Site, list = document.getElementById("list");
  async function load() {
    state.loading(list, 3);
    try {
      const rows = await API.get("/api/certificates");
      if (!rows.length) return state.empty(list, "Certificates will appear here once added.");
      list.innerHTML = rows.map(Cards.cert).join(""); state.done(list);
    } catch (_) { state.error(list, "Couldn't load certificates.", load); }
  }
  load();
})();
