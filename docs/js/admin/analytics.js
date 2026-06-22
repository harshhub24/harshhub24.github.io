// Admin analytics (full 30-day chart + top paths table).
(async function () {
  try {
    const data = await API.get("/api/admin/analytics");
    const ctx = document.getElementById("analyticsChart");
    if (ctx && window.Chart) {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.series.map((s) => s.date),
          datasets: [{ label: "Visitors", data: data.series.map((s) => s.count), backgroundColor: "#4F46E5" }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } },
      });
    }
    const tbody = document.getElementById("topPathRows");
    tbody.innerHTML = data.top_paths.length
      ? data.top_paths.map((r) => `<tr><td>${escapeHTML(r.path)}</td><td>${r.count}</td></tr>`).join("")
      : `<tr><td colspan="2" class="muted">No traffic yet.</td></tr>`;
  } catch (_) { toast("Failed to load analytics.", "error"); }
})();
