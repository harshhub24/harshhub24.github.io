// Admin dashboard: stat cards + 30-day visitors chart (Chart.js via CDN).
(async function () {
  const $ = (s) => document.querySelector(s);
  try {
    const [stats, analytics] = await Promise.all([
      API.get("/api/admin/stats"),
      API.get("/api/admin/analytics"),
    ]);
    $("#sProjects").textContent = stats.projects;
    $("#sCerts").textContent = stats.certificates;
    $("#sUnread").textContent = stats.messages_unread;
    $("#sVisitors").textContent = stats.visitors_30d;

    const ctx = document.getElementById("visitorsChart");
    if (ctx && window.Chart) {
      new Chart(ctx, {
        type: "line",
        data: {
          labels: analytics.series.map((s) => s.date),
          datasets: [{
            label: "Visitors",
            data: analytics.series.map((s) => s.count),
            borderColor: "#4F46E5",
            backgroundColor: "rgba(79,70,229,.12)",
            fill: true, tension: 0.35, pointRadius: 3,
          }],
        },
        options: { responsive: true, maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          plugins: { legend: { display: false } } },
      });
    }

    const top = $("#topPaths");
    if (top) {
      top.innerHTML = analytics.top_paths.length
        ? analytics.top_paths.map((r) => `<tr><td>${escapeHTML(r.path)}</td><td>${r.count}</td></tr>`).join("")
        : `<tr><td colspan="2" class="muted">No traffic yet.</td></tr>`;
    }
  } catch (e) {
    toast("Failed to load dashboard data.", "error");
  }
})();
