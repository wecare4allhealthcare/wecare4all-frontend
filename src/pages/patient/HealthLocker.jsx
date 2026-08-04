/**
 * pages/patient/HealthLocker.jsx — Digital Health Locker / Unified
 * Timeline. Pulls from GET /patient/health-timeline (see backend
 * app/routes/health_locker.py), which aggregates appointments,
 * prescriptions, documents, and lab reports into one feed — no new
 * data model, just a better view over what already exists.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const TYPE_META = {
  appointment:  { icon: "🩺", color: "#0369a1", bg: "#eff8ff" },
  prescription: { icon: "💊", color: "#15803d", bg: "#f0fdf4" },
  document:     { icon: "📄", color: "#854d0e", bg: "#fefce8" },
  lab_test:     { icon: "🧪", color: "#7c3aed", bg: "#f5f3ff" },
};

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
.hl{font-family:'DM Sans',sans-serif;color:#1e293b;max-width:760px;margin:0 auto;padding:28px 20px 60px;}
.hl h1{font-family:'Cormorant Garamond',serif;color:#0b1f3a;font-size:28px;margin:0 0 4px;}
.hl-filters{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 22px;}
.hl-chip{padding:7px 14px;border-radius:20px;font-size:12.5px;font-weight:700;cursor:pointer;border:1.5px solid #e2eaf4;background:#fff;color:#64748b;}
.hl-chip.on{border-color:#047857;background:#f0fdf4;color:#047857;}
.hl-item{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid #f1f5f9;}
.hl-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;}
`;

export default function HealthLocker() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("wc4a_token");
        const res = await fetch(`${API}/patient/health-timeline`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (res.ok) setTimeline(json.timeline || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === "all" ? timeline : timeline.filter((t) => t.type === filter);

  return (
    <div className="hl">
      <SEO title="Health Locker — We Care 4 'all'" noindex />
      <style>{G}</style>
      <h1>🗂️ My Health Locker</h1>
      <p style={{ color: "#64748b", fontSize: 13.5, margin: 0 }}>
        Every consultation, prescription, document, and lab report — in one place.
      </p>

      <div className="hl-filters">
        {[["all", "All"], ["appointment", "🩺 Consultations"], ["prescription", "💊 Prescriptions"], ["document", "📄 Documents"], ["lab_test", "🧪 Lab Tests"]].map(([id, label]) => (
          <button key={id} className={`hl-chip${filter === id ? " on" : ""}`} onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: 13.5 }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px", color: "#94a3b8" }}>
          <p style={{ fontSize: 36, margin: "0 0 8px" }}>🗂️</p>
          <p style={{ fontSize: 13.5 }}>Nothing here yet.</p>
        </div>
      ) : (
        <div>
          {filtered.map((item, i) => {
            const meta = TYPE_META[item.type] || TYPE_META.document;
            return (
              <div className="hl-item" key={i}>
                <div className="hl-icon" style={{ background: meta.bg }}>{meta.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#0b1f3a", margin: 0 }}>{item.title}</p>
                  {item.subtitle && <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>{item.subtitle}</p>}
                  <p style={{ fontSize: 11.5, color: "#94a3b8", margin: "4px 0 0" }}>
                    {item.date ? new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                  </p>
                  {item.type === "appointment" && (
                    <Link to={`/patient/dashboard`} style={{ fontSize: 12, color: "#047857", fontWeight: 700, textDecoration: "none" }}>
                      View appointment →
                    </Link>
                  )}
                  {item.type === "lab_test" && item.report_url && (
                    <a href={item.report_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>
                      View report →
                    </a>
                  )}
                </div>
                {item.status && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#f1f5f9", color: "#475569", height: "fit-content", whiteSpace: "nowrap" }}>
                    {item.status.replace(/_/g, " ").toUpperCase()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
