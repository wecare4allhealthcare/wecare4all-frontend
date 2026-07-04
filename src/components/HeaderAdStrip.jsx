/**
 * HeaderAdStrip.jsx — Concept #2 from the client's ad-placement options doc:
 * "Header Advertisement Strip" — sits between the navbar and each page's
 * hero/top content, rotating through paid partner hospitals.
 *
 * Lives at the very top of <main> in Layout.jsx (in-flow, not fixed) —
 * scrolls away normally, appears once per page load, same on every public
 * page since Layout.jsx is shared across them.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const CSS = `
.has-wrap{ animation: hasIn .35s ease both; }
@keyframes hasIn{ from{opacity:0} to{opacity:1} }
.has-cta{ display:inline-flex; align-items:center; gap:6px; padding:8px 16px;
  border-radius:8px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif;
  font-weight:700; font-size:12.5px; text-decoration:none; white-space:nowrap;
  color:#fff; background:linear-gradient(135deg,#047857,#059669); flex-shrink:0; }
.has-check{ display:inline-flex; align-items:center; gap:5px; font-family:'DM Sans',sans-serif;
  font-size:12px; font-weight:600; color:rgba(255,255,255,.82); white-space:nowrap; }
@media(max-width:760px){
  .has-specs{ display:none!important; }
}
@media(max-width:560px){
  .has-name{ font-size:13px!important; }
}
`;

export default function HeaderAdStrip() {
  const [hospitals, setHospitals] = useState(null);
  const [idx, setIdx] = useState(0);

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

  useEffect(() => {
    if (!hospitals || hospitals.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % hospitals.length), 8000);
    return () => clearInterval(t);
  }, [hospitals]);

  if (!hospitals || hospitals.length === 0) return null;

  const h        = hospitals[idx];
  const isStrat  = h.tier === "strategic";
  const photo    = h.photos?.[0] || null;
  const banner   = h.banners?.[0]?.url || h.banners?.[0] || null;
  const heroImg  = banner || photo;
  const specs    = (h.specialties || []).slice(0, 3);
  const accentBg = isStrat
    ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
    : "linear-gradient(135deg,#047857,#059669)";

  return (
    <div className="has-wrap" key={h.id} style={{
      background:"linear-gradient(135deg,#0b1f3a,#112d52)",
      borderBottom:"1px solid rgba(255,255,255,.08)",
    }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"10px 24px",
        display:"flex", alignItems:"center", gap:"16px" }}>

        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"10.5px", fontWeight:"700",
          color:"#6ee7b7", letterSpacing:"1px", textTransform:"uppercase", flexShrink:0,
          display:"flex", alignItems:"center", gap:"5px" }}>
          🏥 {isStrat ? "Featured Hospital" : "Growth Partner"}
        </span>

        <div style={{ width:"1px", height:"22px", background:"rgba(255,255,255,.14)", flexShrink:0 }}/>

        <div style={{ width:"34px", height:"34px", borderRadius:"9px", flexShrink:0, overflow:"hidden",
          background: heroImg ? `url(${heroImg}) center/cover no-repeat` : accentBg,
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          {!heroImg && <span style={{ fontSize:"15px" }}>🏥</span>}
        </div>

        <p className="has-name" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14px", fontWeight:"700",
          color:"#fff", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", flexShrink:0 }}>
          {h.hospital_name}
        </p>

        <div className="has-specs" style={{ display:"flex", gap:"14px", flex:1, minWidth:0, overflow:"hidden" }}>
          {specs.map(s => (
            <span key={s} className="has-check">
              <span style={{ color:"#34d399" }}>✓</span>{s}
            </span>
          ))}
        </div>

        <Link to="/doctors" className="has-cta" style={{ marginLeft:"auto" }}>
          Book Appointment →
        </Link>
      </div>
    </div>
  );
}
