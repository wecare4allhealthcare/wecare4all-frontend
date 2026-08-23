/**
 * components/PartnerOverviewPanel.jsx — new (Aug 2026): the
 * "Overview" tab content for both pharmacy/Dashboard.jsx and
 * lab/Dashboard.jsx (see PartnerDashboardShell.jsx's new
 * overviewContent prop). Shared here rather than duplicated per
 * portal since the shape is identical between the two — just the
 * endpoint and a few labels differ (counts/totals passed in as
 * `data`, rather than this component owning its own fetch, so each
 * caller controls exactly when/how often it refreshes).
 */
const G = `
.pov-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr));gap:12px;}
.pov-card{background:#fff;border:1px solid var(--wc-border);border-radius:12px;padding:16px 18px;}
`;

export default function PartnerOverviewPanel({ data, itemLabel, itemLabelPlural }) {
  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <div style={{ width: "28px", height: "28px", border: "3px solid var(--wc-border)",
          borderTop: "3px solid var(--wc-green)", borderRadius: "50%", animation: "pds-spin .8s linear infinite", margin: "0 auto" }} />
      </div>
    );
  }

  const cards = [
    { label: `Total ${itemLabelPlural}`, value: data.total, color: "var(--wc-navy)" },
    { label: `${itemLabelPlural} This Month`, value: data.thisMonth, color: "var(--wc-teal)" },
    { label: "In Progress", value: data.pending, color: "#c2410c" },
    { label: "Completed", value: data.completed, color: "#15803d" },
    { label: "Revenue This Month", value: `₹${data.revenueThisMonth.toLocaleString("en-IN")}`, color: "var(--wc-green)" },
    { label: "Revenue All Time", value: `₹${data.revenueAllTime.toLocaleString("en-IN")}`, color: "var(--wc-green-dark)" },
  ];

  return (
    <div>
      <style>{G}</style>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:"var(--wc-muted)", marginBottom:18 }}>
        A quick snapshot of your {itemLabelPlural.toLowerCase()} and revenue — the full list is under the "{itemLabelPlural}" tab.
      </p>
      <div className="pov-grid">
        {cards.map(c => (
          <div key={c.label} className="pov-card">
            <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:26, fontWeight:700, color:c.color, margin:"0 0 4px" }}>
              {c.value}
            </p>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:"var(--wc-muted)", margin:0 }}>
              {c.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
