/**
 * FloatingAd.jsx — Option 4: Floating Advertisement.
 * Bottom-left on desktop (FloatingFAQ already owns bottom-right), and a
 * slim full-width bar sitting just above the FAQ bubble on mobile so the
 * two never overlap without needing to touch FloatingFAQ.jsx.
 * Dismissible; stays dismissed for the rest of the browser session.
 */
import { useEffect, useState, useRef } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const DISMISS_KEY = "wc4a_floating_ad_dismissed";

const CSS = `
@keyframes faIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fa-wrap{animation:faIn .35s ease both;}
.fa-cta{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;
  border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:700;font-size:11.5px;
  text-decoration:none;white-space:nowrap;}
.fa-close{width:22px;height:22px;border-radius:50%;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  background:rgba(255,255,255,.9);color:#64748b;font-size:13px;line-height:1;}
.fa-desktop{display:flex;}
.fa-mobile{display:none;}
@media(max-width:640px){
  .fa-desktop{display:none!important;}
  .fa-mobile{display:flex!important;}
}
`;

function useHospitals() {
  const [hospitals, setHospitals] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/empanelment/partner-hospitals`);
        const json = await res.json();
        setHospitals((json.hospitals || []).filter(h =>
          h.tier === "strategic" || h.tier === "growth"
        ));
      } catch {}
    })();
  }, []);
  return hospitals;
}

export default function FloatingAd() {
  const hospitals = useHospitals();
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY) === "1"
  );
  const timerRef = useRef(null);

  // Don't appear the instant the page loads — a beat after the page
  // settles reads as far less intrusive than an immediate pop-in.
  useEffect(() => {
    if (dismissed || hospitals.length === 0) return;
    const t = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(t);
  }, [dismissed, hospitals.length]);

  useEffect(() => {
    if (hospitals.length <= 1) return;
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % hospitals.length), 6000);
    return () => clearInterval(timerRef.current);
  }, [hospitals]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  if (dismissed || !visible || hospitals.length === 0) return null;

  const h        = hospitals[idx];
  const isStrat  = h.tier === "strategic";
  const banner   = h.banners?.[0]?.url || h.banners?.[0] || null;
  const photo    = h.photos?.[0] || null;
  const heroImg  = banner || photo;
  const accentBg = isStrat
    ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
    : "linear-gradient(135deg,#047857,#10b981)";

  return (
    <div className="fa-wrap">
      <style>{CSS}</style>

      {/* Desktop — floating card, bottom-left */}
      <div className="fa-desktop" style={{
        position:"fixed", bottom:"24px", left:"20px", zIndex:900,
        width:"260px", background:"#fff", borderRadius:"16px", overflow:"hidden",
        boxShadow:"0 16px 40px rgba(11,31,58,.28)",
        border: isStrat ? "1.5px solid #bfdbfe" : "1.5px solid #bbf7d0",
      }}>
        <div style={{ height:"78px", position:"relative",
          background: heroImg ? `url(${heroImg}) center/cover no-repeat` : accentBg }}>
          {!heroImg && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{position:"absolute",inset:0,opacity:.5,
                backgroundImage:"repeating-linear-gradient(135deg,rgba(255,255,255,.08) 0 2px,transparent 2px 11px)"}}/>
              <span style={{position:"relative",fontSize:"24px",filter:"drop-shadow(0 1px 3px rgba(0,0,0,.3))"}}>🏥</span>
            </div>
          )}
          <button onClick={dismiss} className="fa-close" aria-label="Close ad"
            style={{ position:"absolute", top:"6px", right:"6px" }}>✕</button>
          <span style={{ position:"absolute", bottom:"6px", left:"8px",
            fontFamily:"'DM Sans',sans-serif", fontSize:"9px", fontWeight:"700",
            padding:"2px 8px", borderRadius:"4px", background: accentBg, color:"#fff" }}>
            {isStrat ? "⭐ Featured Partner" : "🚀 Growth Partner"}
          </span>
        </div>
        <div style={{ padding:"12px 14px" }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9.5px", color:"#6b7688",
            letterSpacing:"1px", textTransform:"uppercase", margin:"0 0 3px" }}>Sponsored</p>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"17px", fontWeight:"700",
            color:"#0b1f3a", margin:"0 0 9px" }}>{h.hospital_name}</p>
          {h.website ? (
            <a href={h.website} target="_blank" rel="noopener noreferrer" className="fa-cta"
              style={{ background: accentBg, color:"#fff" }}>Visit Website →</a>
          ) : (
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", color:"#6b7688" }}>Verified Partner</span>
          )}
        </div>
      </div>

      {/* Mobile — slim bar, sits above the FAQ bubble so they never overlap */}
      <div className="fa-mobile" style={{
        position:"fixed", left:"12px", right:"12px", bottom:"88px", zIndex:900,
        alignItems:"center", gap:"10px", background:"#fff", borderRadius:"12px",
        padding:"8px 10px", boxShadow:"0 8px 26px rgba(11,31,58,.22)",
        border: isStrat ? "1.5px solid #bfdbfe" : "1.5px solid #bbf7d0",
      }}>
        <div style={{ width:"42px", height:"42px", borderRadius:"9px", flexShrink:0,
          background: heroImg ? `url(${heroImg}) center/cover no-repeat` : accentBg }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"9px", color:"#6b7688",
            letterSpacing:"1px", textTransform:"uppercase", margin:"0 0 1px" }}>Sponsored</p>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", fontWeight:"700",
            color:"#0b1f3a", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {h.hospital_name}
          </p>
        </div>
        {h.website && (
          <a href={h.website} target="_blank" rel="noopener noreferrer" className="fa-cta"
            style={{ background: accentBg, color:"#fff", padding:"7px 11px" }}>View →</a>
        )}
        <button onClick={dismiss} className="fa-close" aria-label="Close ad">✕</button>
      </div>
    </div>
  );
}
