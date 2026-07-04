/**
 * PartnerHospitalsPanel.jsx — replaces the earlier hero-card and header-strip
 * attempts. A collapsible panel, fixed bottom-right, positioned above the
 * FloatingFAQ chat button so the two never overlap.
 *
 * - Opens automatically on page load (every fresh mount).
 * - A chevron toggles it between full panel and a slim collapsed tab —
 *   collapsing never removes it, just shrinks it; clicking again reopens.
 * - Shows every paid partner (Strategic + Growth) in one scrollable list,
 *   not a rotating single card.
 * - Same behavior on mobile and desktop, just narrower on small screens.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const CSS = `
.php-wrap{ animation: phpIn .35s ease both; }
@keyframes phpIn{ from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
.php-item{ display:flex; gap:10px; align-items:center; padding:10px 12px;
  border-bottom:1px solid #f1f5f9; text-decoration:none; }
.php-item:last-child{ border-bottom:none; }
.php-item:hover{ background:#f8fafc; }
.php-list::-webkit-scrollbar{ width:5px; }
.php-list::-webkit-scrollbar-thumb{ background:#cbd5e1; border-radius:3px; }
@media(max-width:560px){
  .php-panel{ width:250px!important; }
}
`;

export default function PartnerHospitalsPanel() {
  const [hospitals, setHospitals] = useState(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/empanelment/partner-hospitals`);
        const json = await res.json();
        setHospitals((json.hospitals || []).filter(h =>
          h.tier === "strategic" || h.tier === "growth"
        ));
      } catch { setHospitals([]); }
    })();
  }, []);

  if (!hospitals || hospitals.length === 0) return null;

  return (
    <div className="php-wrap" style={{
      position:"fixed", bottom:"100px", right:"20px", zIndex:950,
      fontFamily:"'DM Sans',sans-serif",
    }}>
      <style>{CSS}</style>

      {open ? (
        <div className="php-panel" style={{
          width:"280px", background:"#fff", borderRadius:"14px", overflow:"hidden",
          boxShadow:"0 16px 40px rgba(11,31,58,.24)", border:"1px solid #e2eaf4",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"12px 14px", background:"linear-gradient(135deg,#0b1f3a,#112d52)" }}>
            <div>
              <p style={{ fontSize:"13px", fontWeight:"700", color:"#fff", margin:0 }}>Partner Hospitals</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Collapse"
              style={{ width:"26px", height:"26px", borderRadius:"50%", border:"none",
                background:"rgba(255,255,255,.14)", color:"#fff", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", flexShrink:0 }}>
              ⌄
            </button>
          </div>

          <div className="php-list" style={{ maxHeight:"320px", overflowY:"auto" }}>
            {hospitals.map(h => {
              const isStrat  = h.tier === "strategic";
              const photo    = h.photos?.[0] || null;
              const banner   = h.banners?.[0]?.url || h.banners?.[0] || null;
              const heroImg  = banner || photo;
              const accentBg = isStrat
                ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
                : "linear-gradient(135deg,#047857,#059669)";
              return (
                <Link key={h.id} to="/our-hospitals" className="php-item">
                  <div style={{ width:"48px", height:"48px", borderRadius:"9px", flexShrink:0, position:"relative",
                    overflow:"hidden", background: heroImg ? `url(${heroImg}) center/cover no-repeat` : accentBg,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {!heroImg && <span style={{ fontSize:"18px" }}>🏥</span>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:"9px", fontWeight:"700", margin:"0 0 2px",
                      color: isStrat ? "#1d4ed8" : "#047857" }}>
                      {isStrat ? "⭐ FEATURED" : "🚀 GROWTH"}
                    </p>
                    <p style={{ fontSize:"12.5px", fontWeight:"700", color:"#0b1f3a", margin:0,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {h.hospital_name}
                    </p>
                  </div>
                  <span style={{ fontSize:"11px", color:"#94a3b8", flexShrink:0 }}>→</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} aria-label="Show partner hospitals" style={{
          display:"flex", alignItems:"center", gap:"7px", padding:"9px 14px",
          borderRadius:"50px", border:"1px solid #e2eaf4", background:"#fff",
          boxShadow:"0 8px 24px rgba(11,31,58,.18)", cursor:"pointer",
        }}>
          <span style={{ fontSize:"15px" }}>🏥</span>
          <span style={{ fontSize:"12px", fontWeight:"700", color:"#0b1f3a" }}>Partner Hospitals</span>
          <span style={{ fontSize:"11px", color:"#94a3b8" }}>⌃</span>
        </button>
      )}
    </div>
  );
}
