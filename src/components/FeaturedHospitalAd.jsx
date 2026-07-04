/**
 * FeaturedHospitalAd.jsx — Google Ads-style hospital advertisement
 * Sidebar: sticky rotating ad card (NOT a doctor card)
 * Inline: horizontal banner between doctor results
 */
import { useEffect, useState, useRef } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const CSS = `
@keyframes adFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes adDotPulse{0%,100%{opacity:.4}50%{opacity:1}}
.fha-sidebar-wrap{animation:adFadeIn .4s ease both;}
.fha-cta{display:flex;align-items:center;justify-content:center;gap:6px;
  width:100%;padding:10px 0;border-radius:9px;border:none;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:12.5px;
  text-decoration:none;transition:opacity .2s,transform .15s;}
.fha-cta:hover{opacity:.88;transform:translateY(-1px);}
.fha-spec{display:inline-block;padding:3px 9px;border-radius:50px;
  font-size:10px;font-weight:600;font-family:'DM Sans',sans-serif;white-space:nowrap;}
@media(max-width:600px){
  .fha-inline-row{flex-direction:column!important;min-height:0!important;}
  .fha-inline-img{width:100%!important;height:130px!important;}
  .fha-inline-cta{border-left:none!important;border-top:1px solid #f1f5f9;width:100%;}
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

/* ── SIDEBAR AD ── */
export function SidebarAd() {
  const hospitals = useHospitals();
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (hospitals.length <= 1) return;
    timerRef.current = setInterval(() =>
      setIdx(i => (i + 1) % hospitals.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [hospitals]);

  if (hospitals.length === 0) return null;

  const h        = hospitals[idx];
  const isStrat  = h.tier === "strategic";
  const banner   = h.banners?.[0]?.url || h.banners?.[0] || null;
  const photo    = h.photos?.[0] || null;
  const heroImg  = banner || photo;
  const specs    = h.specialties || [];
  const accrs    = h.accreditations || [];
  const beds     = h.bed_count ? Number(h.bed_count) : null;
  const accentBg = isStrat
    ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
    : "linear-gradient(135deg,#047857,#10b981)";

  return (
    <div className="fha-sidebar-wrap">
      <style>{CSS}</style>

      {/* "Sponsored" header — like Google Ads */}
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
        <div style={{flex:1,height:"1px",background:"#e2eaf4"}}/>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9.5px",fontWeight:"700",
          color:"#94a3b8",letterSpacing:"1px",textTransform:"uppercase",whiteSpace:"nowrap"}}>
          Sponsored
        </span>
        <div style={{flex:1,height:"1px",background:"#e2eaf4"}}/>
      </div>

      {/* Ad card */}
      <div style={{borderRadius:"16px",overflow:"hidden",background:"#fff",
        border: isStrat ? "1.5px solid #bfdbfe" : "1.5px solid #bbf7d0",
        boxShadow: isStrat
          ? "0 4px 24px rgba(29,78,216,.10)"
          : "0 4px 24px rgba(4,120,87,.10)"}}>

        {/* Hero image */}
        <div style={{height:"140px",position:"relative",overflow:"hidden",
          background: heroImg
            ? `url(${heroImg}) center/cover no-repeat`
            : isStrat
              ? "linear-gradient(135deg,#0f2d55,#1565c0)"
              : "linear-gradient(135deg,#064e3b,#059669)"}}>

          {/* Dark overlay */}
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,.60) 100%)"}}/>

          {/* Tier pill */}
          <div style={{position:"absolute",top:"10px",left:"10px",
            background: accentBg,
            borderRadius:"6px",padding:"3px 10px"}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9.5px",
              fontWeight:"700",color:"#fff",letterSpacing:"0.5px"}}>
              {isStrat ? "⭐ FEATURED" : "🚀 PARTNER"}
            </span>
          </div>

          {/* No-photo pattern */}
          {!heroImg && (
            <div style={{position:"absolute",inset:0,display:"flex",
              alignItems:"center",justifyContent:"center"}}>
              <div style={{position:"absolute",inset:0,opacity:.5,
                backgroundImage:"repeating-linear-gradient(135deg,rgba(255,255,255,.07) 0 2px,transparent 2px 11px)"}}/>
              <div style={{position:"relative",width:"52px",height:"52px",borderRadius:"14px",
                background:"rgba(255,255,255,.10)",border:"1.5px solid rgba(255,255,255,.22)",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 6px 20px rgba(0,0,0,.15)"}}>
                <span style={{fontSize:"22px",filter:"drop-shadow(0 1px 3px rgba(0,0,0,.3))"}}>🏥</span>
              </div>
            </div>
          )}

          {/* Name overlay */}
          <div style={{position:"absolute",bottom:"10px",left:"12px",right:"12px"}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",
              fontWeight:"700",color:"#fff",margin:"0 0 2px",
              textShadow:"0 1px 5px rgba(0,0,0,.5)",
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {h.hospital_name}
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.8)",margin:0}}>
              📍 {[h.city,h.state].filter(Boolean).join(", ") || "India"}
            </p>
          </div>
        </div>

        {/* Stats row */}
        {(beds > 0 || specs.length > 0 || accrs.length > 0) && (
          <div style={{display:"flex",background:"#fafbff",
            borderBottom:"1px solid #f1f5f9"}}>
            {beds > 0 && (
              <div style={{flex:1,padding:"8px 0",textAlign:"center",
                borderRight:"1px solid #f1f5f9"}}>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"17px",
                  fontWeight:"700",color:"#0b1f3a",margin:0,lineHeight:1}}>{beds}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"8.5px",
                  color:"#94a3b8",margin:"2px 0 0",textTransform:"uppercase",
                  letterSpacing:"0.7px",fontWeight:"600"}}>Beds</p>
              </div>
            )}
            {specs.length > 0 && (
              <div style={{flex:1,padding:"8px 0",textAlign:"center",
                borderRight: accrs.length > 0 ? "1px solid #f1f5f9" : "none"}}>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"17px",
                  fontWeight:"700",color:"#0b1f3a",margin:0,lineHeight:1}}>{specs.length}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"8.5px",
                  color:"#94a3b8",margin:"2px 0 0",textTransform:"uppercase",
                  letterSpacing:"0.7px",fontWeight:"600"}}>Specialties</p>
              </div>
            )}
            {accrs.length > 0 && (
              <div style={{flex:1,padding:"8px 0",textAlign:"center"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                  fontWeight:"700",color:"#1d4ed8",margin:"2px 0 0",lineHeight:1.2,
                  padding:"0 4px"}}>
                  {accrs[0]}
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"8.5px",
                  color:"#94a3b8",margin:"2px 0 0",textTransform:"uppercase",
                  letterSpacing:"0.7px",fontWeight:"600"}}>Certified</p>
              </div>
            )}
          </div>
        )}

        {/* Specialties */}
        <div style={{padding:"12px 14px"}}>
          {specs.length > 0 && (
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"12px"}}>
              {specs.slice(0,3).map((s,i) => (
                <span key={i} className="fha-spec"
                  style={{background:"#f0fdf4",border:"1px solid #bbf7d0",color:"#047857"}}>
                  {s}
                </span>
              ))}
              {specs.length > 3 &&
                <span className="fha-spec"
                  style={{background:"#f8fafc",border:"1px solid #e2eaf4",color:"#94a3b8"}}>
                  +{specs.length-3}
                </span>}
            </div>
          )}

          {/* CTA button */}
          {h.website ? (
            <a href={h.website} target="_blank" rel="noopener noreferrer"
              className="fha-cta"
              style={{background: accentBg, color:"#fff",
                boxShadow: isStrat
                  ? "0 4px 14px rgba(29,78,216,.22)"
                  : "0 4px 14px rgba(4,120,87,.22)"}}>
              🌐 Visit Hospital Website
            </a>
          ) : (
            <div className="fha-cta"
              style={{background:"#f1f5f9",color:"#64748b",cursor:"default"}}>
              Verified Network Hospital
            </div>
          )}
        </div>
      </div>

      {/* Dot indicators */}
      {hospitals.length > 1 && (
        <div style={{display:"flex",justifyContent:"center",gap:"6px",marginTop:"10px"}}>
          {hospitals.map((_,i) => (
            <button key={i}
              onClick={() => { setIdx(i); clearInterval(timerRef.current); }}
              style={{width:i===idx?"18px":"6px",height:"6px",borderRadius:"3px",
                border:"none",padding:0,cursor:"pointer",transition:"all .3s",
                background:i===idx
                  ? (isStrat?"#1d4ed8":"#047857")
                  : "#e2eaf4"}}/>
          ))}
        </div>
      )}

      {/* Ad disclosure */}
      <p style={{textAlign:"center",fontFamily:"'DM Sans',sans-serif",
        fontSize:"9px",color:"#cbd5e1",marginTop:"8px",marginBottom:0,letterSpacing:"0.5px"}}>
        SPONSORED PARTNER
      </p>
    </div>
  );
}

/* ── INLINE AD (between results) ── */
export function InlineAd({ hospitals, cycleIdx }) {
  if (!hospitals || hospitals.length === 0) return null;
  const h       = hospitals[cycleIdx % hospitals.length];
  const isStrat = h.tier === "strategic";
  const banner  = h.banners?.[0]?.url || h.banners?.[0] || null;
  const photo   = h.photos?.[0] || null;
  const heroImg = banner || photo;
  const specs   = h.specialties || [];
  const accentBg = isStrat
    ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
    : "linear-gradient(135deg,#047857,#10b981)";

  return (
    <div style={{gridColumn:"1/-1"}}>
      <style>{CSS}</style>

      {/* Sponsored label */}
      <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
        <div style={{flex:1,height:"1px",background:"#e2eaf4"}}/>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9.5px",
          fontWeight:"700",color:"#94a3b8",letterSpacing:"1px",textTransform:"uppercase"}}>
          Sponsored Hospital Partner
        </span>
        <div style={{flex:1,height:"1px",background:"#e2eaf4"}}/>
      </div>

      {/* Ad banner */}
      <div className="fha-inline-row" style={{borderRadius:"16px",overflow:"hidden",background:"#fff",
        border: isStrat ? "1.5px solid #bfdbfe" : "1.5px solid #bbf7d0",
        boxShadow: isStrat
          ? "0 4px 20px rgba(29,78,216,.09)"
          : "0 4px 20px rgba(4,120,87,.09)",
        display:"flex",alignItems:"stretch",minHeight:"110px"}}>

        {/* Left image strip */}
        <div className="fha-inline-img" style={{width:"160px",flexShrink:0,position:"relative",
          background: heroImg
            ? `url(${heroImg}) center/cover no-repeat`
            : isStrat
              ? "linear-gradient(160deg,#0f2d55,#1565c0)"
              : "linear-gradient(160deg,#064e3b,#059669)"}}>
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(to right,transparent 60%,rgba(255,255,255,.08))"}}/>
          {!heroImg && (
            <div style={{position:"absolute",inset:0,display:"flex",
              alignItems:"center",justifyContent:"center"}}>
              <div style={{position:"absolute",inset:0,opacity:.5,
                backgroundImage:"repeating-linear-gradient(135deg,rgba(255,255,255,.07) 0 2px,transparent 2px 11px)"}}/>
              <div style={{position:"relative",width:"46px",height:"46px",borderRadius:"12px",
                background:"rgba(255,255,255,.10)",border:"1.5px solid rgba(255,255,255,.22)",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 6px 20px rgba(0,0,0,.15)"}}>
                <span style={{fontSize:"20px",filter:"drop-shadow(0 1px 3px rgba(0,0,0,.3))"}}>🏥</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{flex:1,padding:"14px 18px",display:"flex",
          flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9.5px",
                fontWeight:"700",padding:"2px 9px",borderRadius:"4px",
                background: accentBg, color:"#fff",letterSpacing:"0.4px"}}>
                {isStrat ? "⭐ Featured Partner" : "🚀 Growth Partner"}
              </span>
              {(h.accreditations||[]).slice(0,1).map((a,i) => (
                <span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9.5px",
                  fontWeight:"700",color:"#1d4ed8",background:"#eff6ff",
                  border:"1px solid #bfdbfe",padding:"2px 8px",borderRadius:"4px"}}>
                  ✓ {a}
                </span>
              ))}
            </div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"19px",
              fontWeight:"700",color:"#0b1f3a",margin:"0 0 3px"}}>
              {h.hospital_name}
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
              color:"#64748b",margin:"0 0 8px"}}>
              📍 {[h.city,h.state].filter(Boolean).join(", ") || "India"}
              {h.bed_count && Number(h.bed_count) > 0 &&
                <span style={{marginLeft:"10px",color:"#94a3b8"}}>
                  🏥 {h.bed_count} beds
                </span>}
            </p>
            {specs.length > 0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                {specs.slice(0,4).map((s,i) => (
                  <span key={i} className="fha-spec"
                    style={{background:"#f0fdf4",border:"1px solid #bbf7d0",color:"#047857"}}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right CTA */}
        <div className="fha-inline-cta" style={{padding:"14px 18px",display:"flex",alignItems:"center",
          borderLeft:"1px solid #f1f5f9",flexShrink:0}}>
          {h.website ? (
            <a href={h.website} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",
                background: accentBg,color:"#fff",padding:"12px 20px",borderRadius:"10px",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"12.5px",
                textDecoration:"none",whiteSpace:"nowrap",textAlign:"center",
                boxShadow: isStrat
                  ? "0 4px 14px rgba(29,78,216,.25)"
                  : "0 4px 14px rgba(4,120,87,.25)"}}>
              <span style={{fontSize:"20px"}}>🌐</span>
              Visit Website
            </a>
          ) : (
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"#94a3b8",textAlign:"center",padding:"0 8px"}}>
              Verified<br/>Partner
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Default export (backward compat) ── */
export default function FeaturedHospitalAd({ variant = "sidebar" }) {
  const hospitals = useHospitals();
  const [cycleIdx, setCycleIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (hospitals.length <= 1) return;
    timerRef.current = setInterval(() =>
      setCycleIdx(i => (i + 1) % hospitals.length), 5000);
    return () => clearInterval(timerRef.current);
  }, [hospitals]);

  if (variant === "sidebar") return <SidebarAd/>;
  return <InlineAd hospitals={hospitals} cycleIdx={cycleIdx}/>;
}
