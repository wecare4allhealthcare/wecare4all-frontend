/**
 * HospitalCarousel.jsx — Apollo/Practo-style professional hospital strip
 */
import { useEffect, useState, useRef } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap');
@keyframes hc-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes hc-fadein{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.hc-track{display:flex;gap:24px;width:max-content;animation:hc-scroll 28s linear infinite;}
.hc-track:hover{animation-play-state:paused;}
.hc-card{flex-shrink:0;width:300px;border-radius:18px;overflow:hidden;background:#fff;
  box-shadow:0 2px 16px rgba(11,31,58,.08);border:1px solid #e8f0fb;
  transition:transform .25s,box-shadow .25s;cursor:default;}
.hc-card:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(11,31,58,.15);}
.hc-fade-l{position:absolute;left:0;top:0;bottom:0;width:100px;
  background:linear-gradient(to right,#f8faff,transparent);pointer-events:none;z-index:3;}
.hc-fade-r{position:absolute;right:0;top:0;bottom:0;width:100px;
  background:linear-gradient(to left,#f8faff,transparent);pointer-events:none;z-index:3;}
.hc-nav{width:40px;height:40px;border-radius:50%;border:1.5px solid #e2eaf4;
  background:#fff;cursor:pointer;font-size:18px;line-height:1;
  transition:all .2s;box-shadow:0 2px 10px rgba(11,31,58,.08);}
.hc-nav:hover{background:#0b1f3a;color:#fff;border-color:#0b1f3a;transform:scale(1.05);}
.hc-spec{display:inline-block;padding:3px 10px;border-radius:50px;font-size:10.5px;
  font-weight:600;background:#f0fdf4;color:#047857;border:1px solid #bbf7d0;
  font-family:'DM Sans',sans-serif;white-space:nowrap;}
.hc-accr{display:inline-block;padding:3px 10px;border-radius:50px;font-size:10px;
  font-weight:700;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;
  font-family:'DM Sans',sans-serif;}
`;

function HospitalCard({ h, delay }) {
  const banner    = h.banners?.[0]?.url || h.banners?.[0] || null;
  const photo     = h.photos?.[0] || null;
  const heroImg   = banner || photo;
  const isStrat   = h.tier === "strategic";
  const initial   = (h.hospital_name || "H")[0].toUpperCase();
  const specs     = h.specialties || [];
  const accrs     = h.accreditations || [];
  const beds      = h.bed_count ? Number(h.bed_count) : null;

  return (
    <div className="hc-card" style={{animationDelay:`${delay}s`,
      border: isStrat ? "1.5px solid #bfdbfe" : "1.5px solid #bbf7d0"}}>

      {/* ── Hero ── */}
      <div style={{height:"160px",position:"relative",overflow:"hidden",flexShrink:0,
        background: heroImg
          ? `url(${heroImg}) center/cover no-repeat`
          : isStrat
            ? "linear-gradient(135deg,#0f2d55 0%,#1565c0 100%)"
            : "linear-gradient(135deg,#064e3b 0%,#059669 100%)"}}>

        {/* Overlay */}
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.55) 100%)"}}/>

        {/* Tier ribbon — top left */}
        <div style={{position:"absolute",top:0,left:0,
          background: isStrat
            ? "linear-gradient(90deg,#1d4ed8,#3b82f6)"
            : "linear-gradient(90deg,#047857,#10b981)",
          padding:"5px 14px 5px 12px",borderBottomRightRadius:"12px"}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",fontWeight:"700",
            color:"#fff",letterSpacing:"0.6px",textTransform:"uppercase"}}>
            {isStrat ? "⭐ Featured Partner" : "🚀 Growth Partner"}
          </span>
        </div>

        {/* Accreditation badges — top right */}
        {accrs.length > 0 && (
          <div style={{position:"absolute",top:"8px",right:"10px",display:"flex",gap:"4px",flexWrap:"wrap",
            justifyContent:"flex-end",maxWidth:"120px"}}>
            {accrs.slice(0,2).map((a,i) => (
              <span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",fontWeight:"700",
                background:"rgba(255,255,255,.92)",color:"#1d4ed8",
                padding:"2px 7px",borderRadius:"4px",letterSpacing:"0.3px"}}>
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Hospital initial watermark */}
        {!heroImg && (
          <div style={{position:"absolute",inset:0,display:"flex",
            alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"80px",
              fontWeight:"700",color:"rgba(255,255,255,.12)",lineHeight:1}}>{initial}</span>
          </div>
        )}

        {/* Name + city on image */}
        <div style={{position:"absolute",bottom:"12px",left:"14px",right:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",fontWeight:"700",
            color:"#fff",margin:"0 0 3px",textShadow:"0 1px 6px rgba(0,0,0,.5)",
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {h.hospital_name}
          </h3>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
            color:"rgba(255,255,255,.85)",margin:0,display:"flex",alignItems:"center",gap:"4px"}}>
            <span>📍</span>
            {[h.city, h.state].filter(Boolean).join(", ") || "India"}
          </p>
        </div>
      </div>

      {/* ── Stats bar ── */}
      {(beds || specs.length > 0) && (
        <div style={{display:"flex",borderBottom:"1px solid #f1f5f9",
          background:"#fafbff"}}>
          {beds && beds > 0 && (
            <div style={{flex:1,padding:"10px 0",textAlign:"center",
              borderRight:"1px solid #f1f5f9"}}>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
                fontWeight:"700",color:"#0b1f3a",margin:0,lineHeight:1}}>{beds}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",fontWeight:"600",
                color:"#94a3b8",margin:"2px 0 0",textTransform:"uppercase",letterSpacing:"0.8px"}}>
                Beds
              </p>
            </div>
          )}
          {specs.length > 0 && (
            <div style={{flex:1,padding:"10px 0",textAlign:"center",
              borderRight: beds && beds > 0 ? "1px solid #f1f5f9" : "none"}}>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
                fontWeight:"700",color:"#0b1f3a",margin:0,lineHeight:1}}>{specs.length}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",fontWeight:"600",
                color:"#94a3b8",margin:"2px 0 0",textTransform:"uppercase",letterSpacing:"0.8px"}}>
                Specialties
              </p>
            </div>
          )}
          {accrs.length > 0 && (
            <div style={{flex:1,padding:"10px 0",textAlign:"center"}}>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
                fontWeight:"700",color:"#1d4ed8",margin:0,lineHeight:1}}>{accrs.length}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",fontWeight:"600",
                color:"#94a3b8",margin:"2px 0 0",textTransform:"uppercase",letterSpacing:"0.8px"}}>
                Certifications
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{padding:"14px 16px 16px"}}>
        {/* Specialties */}
        {specs.length > 0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"12px"}}>
            {specs.slice(0,4).map((s,i) => (
              <span key={i} className="hc-spec">{s}</span>
            ))}
            {specs.length > 4 && (
              <span className="hc-spec" style={{background:"#f8fafc",color:"#94a3b8",
                border:"1px solid #e2eaf4"}}>+{specs.length-4} more</span>
            )}
          </div>
        )}

        {/* Accreditations row */}
        {accrs.length > 0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"12px"}}>
            {accrs.slice(0,3).map((a,i) => (
              <span key={i} className="hc-accr">✓ {a}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        {h.website ? (
          <a href={h.website} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",
              padding:"10px 0",borderRadius:"10px",width:"100%",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"12.5px",
              textDecoration:"none",letterSpacing:"0.2px",
              background: isStrat
                ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
                : "linear-gradient(135deg,#047857,#10b981)",
              color:"#fff",
              boxShadow: isStrat
                ? "0 4px 14px rgba(29,78,216,.25)"
                : "0 4px 14px rgba(4,120,87,.25)"}}>
            🌐 Visit Hospital Website
          </a>
        ) : (
          <div style={{padding:"10px 0",textAlign:"center",
            fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#94a3b8"}}>
            Verified Network Hospital
          </div>
        )}
      </div>
    </div>
  );
}

export default function HospitalCarousel() {
  const [hospitals, setHospitals] = useState(null);
  const viewRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/empanelment/partner-hospitals`);
        const json = await res.json();
        const paid = (json.hospitals || []).filter(h =>
          h.tier === "strategic" || h.tier === "growth"
        );
        setHospitals(paid);
      } catch { setHospitals([]); }
    })();
  }, []);

  const scroll = dir => {
    viewRef.current?.scrollBy({ left: dir * 324, behavior:"smooth" });
  };

  if (!hospitals || hospitals.length === 0) return null;

  const doubled = [...hospitals, ...hospitals];

  return (
    <section style={{background:"#f8faff",padding:"64px 0 56px",overflow:"hidden"}}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 24px",
        display:"flex",justifyContent:"space-between",alignItems:"flex-end",
        marginBottom:"32px",flexWrap:"wrap",gap:"16px"}}>
        <div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
            color:"#047857",letterSpacing:"2px",textTransform:"uppercase",
            marginBottom:"8px",display:"flex",alignItems:"center",gap:"6px"}}>
            <span style={{display:"inline-block",width:"20px",height:"2px",background:"#047857"}}/>
            VERIFIED HEALTHCARE NETWORK
            <span style={{display:"inline-block",width:"20px",height:"2px",background:"#047857"}}/>
          </p>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(24px,3.5vw,36px)",fontWeight:"700",
            color:"#0b1f3a",margin:0,lineHeight:1.1}}>
            Our Featured Healthcare Partners
          </h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"#64748b",
            marginTop:"8px",marginBottom:0}}>
            Trusted hospitals. Verified care. Pan-India network.
          </p>
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          <button className="hc-nav" onClick={()=>scroll(-1)}>‹</button>
          <button className="hc-nav" onClick={()=>scroll(1)}>›</button>
        </div>
      </div>

      {/* Carousel track */}
      <div style={{position:"relative"}}>
        <div className="hc-fade-l"/>
        <div className="hc-fade-r"/>
        <div ref={viewRef} style={{overflow:"hidden",paddingBottom:"8px"}}>
          <div className="hc-track"
            style={{paddingLeft:"max(24px,calc((100vw - 1200px)/2 + 24px))"}}>
            {doubled.map((h, i) => (
              <HospitalCard key={`${h.id}-${i}`} h={h} delay={0}/>
            ))}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p style={{textAlign:"center",fontFamily:"'DM Sans',sans-serif",
        fontSize:"11px",color:"#94a3b8",marginTop:"20px",marginBottom:0}}>
        Hover to pause &nbsp;·&nbsp; Verified & approved partners only
      </p>
    </section>
  );
}
