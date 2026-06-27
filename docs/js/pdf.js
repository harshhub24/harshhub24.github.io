// Generates a printable PDF summary of projects + certificates.
// Uses jsPDF + autoTable loaded on-demand from cdn.jsdelivr.net.
(function () {
  const CDN_JSPDF = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
  const CDN_AUTOTABLE = "https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js";

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }

  async function ensureLibs() {
    if (!window.jspdf) await loadScript(CDN_JSPDF);
    if (!window.jspdf.jsPDF.API.autoTable) await loadScript(CDN_AUTOTABLE);
  }

  async function buildPDF() {
    await ensureLibs();
    const [profile, projects, certs] = await Promise.all([
      API.get("/api/profile").catch(() => null),
      API.get("/api/projects").catch(() => []),
      API.get("/api/certificates").catch(() => []),
    ]);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont("helvetica", "bold"); doc.setFontSize(22);
    doc.text((profile && profile.full_name) || "Portfolio", 40, 56);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(100);
    if (profile && profile.title) doc.text(profile.title, 40, 74);
    if (profile && profile.email) doc.text(profile.email, pageW - 40, 56, { align: "right" });
    doc.setDrawColor(220); doc.line(40, 88, pageW - 40, 88);
    doc.setTextColor(20);

    // Projects
    doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("Projects", 40, 116);
    doc.autoTable({
      startY: 126,
      head: [["Title", "Category", "Tech", "Link"]],
      body: (projects || []).map((p) => [
        p.title || "",
        p.category || "",
        Array.isArray(p.tech) ? p.tech.join(", ") : (p.tech || ""),
        p.url || p.repo_url || "",
      ]),
      styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 40, right: 40 },
    });

    // Certificates
    const y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 28 : 160;
    doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("Certificates", 40, y);
    doc.autoTable({
      startY: y + 10,
      head: [["Title", "Issuer", "Issued", "Credential"]],
      body: (certs || []).map((c) => [
        c.title || "",
        c.issuer || "",
        c.issued_at || c.date || "",
        c.credential_id || c.credential_url || "",
      ]),
      styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
      headStyles: { fillColor: [14, 165, 233] },
      margin: { left: 40, right: 40 },
    });

    // Footer
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(140);
      doc.text(
        `Generated ${new Date().toLocaleDateString()} — page ${i} / ${pages}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: "center" }
      );
    }

    const safe = ((profile && profile.full_name) || "portfolio").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    doc.save(`${safe}-portfolio.pdf`);
  }

  function bind() {
    document.querySelectorAll("[data-download-pdf]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const original = btn.textContent;
        btn.disabled = true; btn.textContent = "Building PDF…";
        try {
          await buildPDF();
          if (window.toast) toast("PDF downloaded.", "success");
        } catch (err) {
          if (window.toast) toast(err.message || "Could not generate PDF.", "error");
        } finally {
          btn.disabled = false; btn.textContent = original;
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
