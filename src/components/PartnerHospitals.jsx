/**
 * PartnerHospitals.jsx — Professional hospital showcase
 *
 * Strategic → Full-width hero card with banner slider + video gallery + doctor interviews
 * Growth    → Featured card with banner carousel + specialties
 * Basic     → Clean profile card — name, location, specialties, accreditations
 */
import { useEffect, useState, useRef } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.ph-wrap *{box-sizing:border-box;font-family:'DM Sans',sans-serif;}
.ph-strategic{animation:fadeUp .5s ease both;}
.ph-growth{animation:fadeUp .5s ease .1s both;}
.ph-basic{animation:fadeUp .4s ease .05s both;}
.ph-card-hover{transition:transform .25s,box-shadow .25s;}
.ph-card-hover:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(11,31,58,.14)!important;}
.ph-spec-chip{display:inline-flex;align-items:center;padding:4px 12px;border-radius:50px;
  background:#f0f9f4;border:1px solid #86efac;color:#047857;font-size:11px;font-weight:600;}
.ph-accr-chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:50px;
  background:#eff8ff;border:1px solid #93c5fd;color:#1d4ed8;font-size:10.5px;font-weight:600;}
.ph-tab-btn{padding:8px 18px;border-radius:8px;border:1px solid #e2eaf4;background:#f8fafc;
  font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:600;color:#64748b;cursor:pointer;transition:all .2s;}
.ph-tab-btn.on{background:#0b1f3a;color:#fff;border-color:#0b1f3a;}
.ph-banner-btn{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.85);border:none;
  cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;
  box-shadow:0 2px 8px rgba(0,0,0,.15);transition:all .2s;}
.ph-banner-btn:hover{background:#fff;transform:scale(1.08);}
.ph-video-card{border-radius:12px;overflow:hidden;border:1px solid #e2eaf4;background:#fff;
  box-shadow:0 2px 12px rgba(11,31,58,.06);transition:all .25s;}
.ph-video-card:hover{box-shadow:0 8px 28px rgba(11,31,58,.12);transform:translateY(-3px);}
`;

/* ── Banner Slider ── */
function BannerSlider({ banners }) {
  const [idx, setIdx] = useState(0);
  if (!banners || banners.length === 0) return null;
  const prev = () => setIdx(i => (i - 1 + banners.length) % banners.length);
  const next = () => setIdx(i => (i + 1) % banners.length);
  const url  = banners[idx]?.url || banners[idx];
  return (
    <div style={{position:"relative",borderRadius:"14px",overflow:"hidden",marginBottom:"20px",
      boxShadow:"0 4px 20px rgba(11,31,58,.12)"}}>
      <img loading="lazy" src={url} alt={`Banner ${idx+1}`}
        style={{width:"100%",height:"240px",objectFit:"cover",display:"block",transition:"opacity .3s"}}/>
      {/* Gradient overlay */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"80px",
        background:"linear-gradient(to top,rgba(11,31,58,.5),transparent)"}}/>
      {banners.length > 1 && (
        <>
          <div style={{position:"absolute",top:"50%",left:"12px",transform:"translateY(-50%)"}}>
            <button className="ph-banner-btn" onClick={prev}>‹</button>
          </div>
          <div style={{position:"absolute",top:"50%",right:"12px",transform:"translateY(-50%)"}}>
            <button className="ph-banner-btn" onClick={next}>›</button>
          </div>
          <div style={{position:"absolute",bottom:"12px",left:"50%",transform:"translateX(-50%)",
            display:"flex",gap:"6px"}}>
            {banners.map((_,i) => (
              <button key={i} onClick={()=>setIdx(i)}
                style={{width:i===idx?"20px":"8px",height:"8px",borderRadius:"4px",border:"none",
                  background:i===idx?"#fff":"rgba(255,255,255,.5)",cursor:"pointer",transition:"all .25s",padding:0}}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Video Card ── */
function VideoCard({ item, label }) {
  const [playing, setPlaying] = useState(false);
  const url = item?.url || item;
  return (
    <div className="ph-video-card">
      <div style={{position:"relative"}}>
        {!playing ? (
          <>
            <video src={url} style={{width:"100%",height:"160px",objectFit:"cover",display:"block",background:"#0b1f3a"}}/>
            <button onClick={()=>setPlaying(true)}
              style={{position:"absolute",inset:0,background:"rgba(11,31,58,.45)",border:"none",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:"48px",height:"48px",borderRadius:"50%",background:"rgba(255,255,255,.92)",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 4px 20px rgba(0,0,0,.3)",transition:"transform .2s"}}>
                <span style={{fontSize:"20px",marginLeft:"3px"}}>▶</span>
              </div>
            </button>
          </>
        ) : (
          <video src={url} controls autoPlay style={{width:"100%",height:"160px",objectFit:"cover",display:"block",background:"#000"}}/>
        )}
      </div>
      <div style={{padding:"10px 14px"}}>
        {label && <span style={{fontSize:"10px",fontWeight:"700",color:"#7c3aed",textTransform:"uppercase",
          letterSpacing:"1px",display:"block",marginBottom:"3px"}}>{label}</span>}
        <p style={{margin:0,fontSize:"13px",fontWeight:"600",color:"#0b1f3a",
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {item?.title || "Video"}
        </p>
      </div>
    </div>
  );
}

/* ── Strategic Card (full-width featured) ── */
function StrategicCard({ h }) {
  const [activeTab, setActiveTab] = useState("about");
  const photo      = h.photos?.[0] || null;
  const banners    = h.banners || [];
  const videos     = h.videos || [];
  const interviews = h.doctor_interviews || [];
  const hasMedia   = banners.length > 0 || videos.length > 0 || interviews.length > 0;

  const tabs = [
    { id:"about", label:"About" },
    ...(banners.length > 0    ? [{ id:"banners",    label:`🖼️ Promotions (${banners.length})` }]    : []),
    ...(videos.length > 0     ? [{ id:"videos",     label:`🎬 Videos (${videos.length})` }]         : []),
    ...(interviews.length > 0 ? [{ id:"interviews", label:`🩺 Interviews (${interviews.length})` }] : []),
  ];

  return (
    <div className="ph-strategic ph-card-hover" style={{
      background:"#fff",borderRadius:"20px",overflow:"hidden",
      border:"2px solid #93c5fd",
      boxShadow:"0 8px 36px rgba(3,105,161,.14)",
      gridColumn:"1 / -1", // full width
    }}>
      {/* Top banner/hero */}
      <div style={{position:"relative",height:"260px",
        background:photo?`url(${photo}) center/cover`:"linear-gradient(135deg,#0b1f3a 0%,#0369a1 100%)",
        display:"flex",alignItems:"flex-end"}}>
        {!photo && (
          <div style={{position:"absolute",inset:0,opacity:.5,
            backgroundImage:"repeating-linear-gradient(135deg,rgba(255,255,255,.06) 0 2px,transparent 2px 12px)"}}/>
        )}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(11,31,58,.85) 0%,rgba(11,31,58,.1) 60%)"}}/>
        {/* Featured badge */}
        <div style={{position:"absolute",top:"18px",left:"18px",background:"linear-gradient(135deg,#0369a1,#0ea5e9)",
          color:"#fff",fontSize:"11px",fontWeight:"700",padding:"5px 14px",borderRadius:"50px",
          letterSpacing:"0.5px",boxShadow:"0 4px 14px rgba(3,105,161,.4)"}}>
          ⭐ FEATURED STRATEGIC PARTNER
        </div>
        {/* Hospital name overlay */}
        <div style={{position:"relative",zIndex:1,padding:"24px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(22px,3vw,30px)",
            fontWeight:"700",color:"#fff",margin:"0 0 6px",textShadow:"0 2px 8px rgba(0,0,0,.3)"}}>
            {h.hospital_name}
          </h3>
          <p style={{margin:0,color:"rgba(255,255,255,.8)",fontSize:"13px",display:"flex",alignItems:"center",gap:"6px"}}>
            📍 {[h.city,h.state].filter(Boolean).join(", ")}
            {h.bed_count && <span style={{marginLeft:"10px",color:"rgba(255,255,255,.7)"}}>🏥 {h.bed_count} beds</span>}
          </p>
        </div>
      </div>

      {/* Content area */}
      <div style={{padding:"20px 24px 24px"}}>
        {/* Tabs */}
        {hasMedia && (
          <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
            {tabs.map(t => (
              <button key={t.id} className={`ph-tab-btn${activeTab===t.id?" on":""}`}
                onClick={()=>setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>
        )}

        {/* About tab */}
        {activeTab==="about" && (
          <div>
            <div style={{display:"flex",gap:"24px",flexWrap:"wrap",marginBottom:"16px"}}>
              {h.specialties?.length > 0 && (
                <div style={{flex:1,minWidth:"200px"}}>
                  <p style={{fontSize:"11px",fontWeight:"700",color:"#047857",textTransform:"uppercase",
                    letterSpacing:"1px",marginBottom:"8px"}}>Specialties</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                    {h.specialties.map((s,i) => <span key={i} className="ph-spec-chip">{s}</span>)}
                  </div>
                </div>
              )}
              {h.accreditations?.length > 0 && (
                <div style={{flex:1,minWidth:"200px"}}>
                  <p style={{fontSize:"11px",fontWeight:"700",color:"#1d4ed8",textTransform:"uppercase",
                    letterSpacing:"1px",marginBottom:"8px"}}>Accreditations</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                    {h.accreditations.map((a,i) => <span key={i} className="ph-accr-chip">✓ {a}</span>)}
                  </div>
                </div>
              )}
            </div>
            {h.website && (
              <a href={h.website} target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:"6px",
                  background:"linear-gradient(135deg,#0369a1,#0ea5e9)",color:"#fff",
                  padding:"9px 20px",borderRadius:"8px",fontSize:"13px",fontWeight:"600",
                  textDecoration:"none",boxShadow:"0 4px 14px rgba(3,105,161,.25)"}}>
                🌐 Visit Website →
              </a>
            )}
          </div>
        )}

        {/* Banners tab */}
        {activeTab==="banners" && <BannerSlider banners={banners}/>}

        {/* Videos tab */}
        {activeTab==="videos" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"14px"}}>
            {videos.map((v,i) => <VideoCard key={i} item={v}/>)}
          </div>
        )}

        {/* Interviews tab */}
        {activeTab==="interviews" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"14px"}}>
            {interviews.map((v,i) => <VideoCard key={i} item={v} label="Doctor Interview"/>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Growth Card (medium featured) ── */
function GrowthCard({ h }) {
  const photo   = h.photos?.[0] || null;
  const banners = h.banners || [];
  const [bannerIdx, setBannerIdx] = useState(0);

  return (
    <div className="ph-growth ph-card-hover" style={{
      background:"#fff",borderRadius:"16px",overflow:"hidden",
      border:"1.5px solid #86efac",
      boxShadow:"0 4px 20px rgba(4,120,87,.10)",
      display:"flex",flexDirection:"column",
    }}>
      {/* Header image with banner carousel */}
      <div style={{position:"relative",height:"175px",overflow:"hidden",
        background:photo?`url(${photo}) center/cover`:"linear-gradient(135deg,#047857,#059669)"}}>
        {!photo && banners.length === 0 && (
          <div style={{position:"absolute",inset:0,opacity:.5,
            backgroundImage:"repeating-linear-gradient(135deg,rgba(255,255,255,.07) 0 2px,transparent 2px 11px)"}}/>
        )}
        {/* Cycle banners if exist */}
        {banners.length > 0 && (
          <img loading="lazy" src={banners[bannerIdx]?.url||banners[bannerIdx]} alt="banner"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        )}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(4,120,87,.6) 0%,transparent 60%)"}}/>
        <div style={{position:"absolute",top:"12px",left:"12px",
          background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
          fontSize:"10px",fontWeight:"700",padding:"4px 10px",borderRadius:"50px",letterSpacing:"0.5px"}}>
          🚀 GROWTH PARTNER
        </div>
        {banners.length > 1 && (
          <div style={{position:"absolute",bottom:"10px",right:"10px",display:"flex",gap:"5px"}}>
            {banners.map((_,i) => (
              <button key={i} onClick={()=>setBannerIdx(i)}
                style={{width:i===bannerIdx?"16px":"6px",height:"6px",borderRadius:"3px",
                  background:i===bannerIdx?"#fff":"rgba(255,255,255,.5)",
                  border:"none",cursor:"pointer",padding:0,transition:"all .2s"}}/>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{padding:"16px",flex:1,display:"flex",flexDirection:"column"}}>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",fontWeight:"700",
          color:"#0b1f3a",margin:"0 0 4px"}}>{h.hospital_name}</h3>
        <p style={{margin:"0 0 10px",fontSize:"12px",color:"#64748b"}}>
          📍 {[h.city,h.state].filter(Boolean).join(", ")}
          {h.bed_count && <span style={{marginLeft:"8px"}}>🏥 {h.bed_count} beds</span>}
        </p>
        {h.specialties?.length > 0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"12px"}}>
            {h.specialties.slice(0,4).map((s,i) => <span key={i} className="ph-spec-chip">{s}</span>)}
            {h.specialties.length > 4 && <span className="ph-spec-chip">+{h.specialties.length-4} more</span>}
          </div>
        )}
        {h.accreditations?.length > 0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"12px"}}>
            {h.accreditations.slice(0,2).map((a,i) => <span key={i} className="ph-accr-chip">✓ {a}</span>)}
          </div>
        )}
        <div style={{marginTop:"auto"}}>
          {h.website && (
            <a href={h.website} target="_blank" rel="noopener noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:"5px",color:"#047857",
                fontSize:"12.5px",fontWeight:"600",textDecoration:"none"}}>
              🌐 Visit Website →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Basic Card (clean profile) ── */
function BasicCard({ h }) {
  const initial = h.hospital_name?.[0] || "H";
  return (
    <div className="ph-basic ph-card-hover" style={{
      background:"#fff",borderRadius:"14px",overflow:"hidden",
      border:"1px solid #e2eaf4",
      boxShadow:"0 2px 12px rgba(11,31,58,.06)",
      display:"flex",flexDirection:"column",
    }}>
      <div style={{height:"110px",
        background:`linear-gradient(135deg,#f1f5f9,#e2eaf4)`,
        display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        <div style={{width:"56px",height:"56px",borderRadius:"50%",
          background:"linear-gradient(135deg,#0b1f3a,#1e40af)",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 4px 14px rgba(11,31,58,.2)"}}>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
            color:"#fff",fontWeight:"700"}}>{initial}</span>
        </div>
      </div>
      <div style={{padding:"14px 16px",flex:1,display:"flex",flexDirection:"column"}}>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"15px",fontWeight:"700",
          color:"#0b1f3a",margin:"0 0 4px"}}>{h.hospital_name}</h3>
        <p style={{margin:"0 0 8px",fontSize:"11.5px",color:"#6b7688"}}>
          📍 {[h.city,h.state].filter(Boolean).join(", ")}
        </p>
        {h.specialties?.length > 0 && (
          <p style={{margin:"0 0 8px",fontSize:"11.5px",color:"#64748b",lineHeight:"1.5"}}>
            {h.specialties.slice(0,3).join(" · ")}
          </p>
        )}
        {h.website && (
          <a href={h.website} target="_blank" rel="noopener noreferrer"
            style={{marginTop:"auto",color:"#0369a1",fontSize:"11.5px",fontWeight:"600",textDecoration:"none"}}>
            🌐 Website →
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function PartnerHospitals({ title = "Our Partner Hospitals", limit = null }) {
  const [hospitals, setHospitals] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => setHospitals([]), 5000);
    (async () => {
      try {
        const res  = await fetch(`${API}/empanelment/partner-hospitals`, { signal: controller.signal });
        const json = await res.json();
        setHospitals(json.hospitals || []);
      } catch { setHospitals([]); }
      finally  { clearTimeout(timer); }
    })();
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);

  if (hospitals !== null && hospitals.length === 0) return null;

  const visible    = limit ? (hospitals || []).slice(0, limit) : (hospitals || []);
  const strategic  = visible.filter(h => h.tier === "strategic");
  const growth     = visible.filter(h => h.tier === "growth");
  const basic      = visible.filter(h => h.tier === "basic");

  return (
    <section className="ph-wrap" style={{background:"linear-gradient(180deg,#f8fafc 0%,#fff 100%)",padding:"72px 24px"}}>
      <style>{CSS}</style>
      <div style={{maxWidth:"1200px",margin:"0 auto"}}>

        {/* Section header */}
        <div style={{textAlign:"center",marginBottom:"48px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#047857",
            letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>
            VERIFIED HEALTHCARE NETWORK
          </p>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(26px,4vw,42px)",
            fontWeight:"700",color:"#0b1f3a",margin:"0 0 12px"}}>
            {title}
          </h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#64748b",
            maxWidth:"520px",margin:"0 auto",lineHeight:"1.6"}}>
            A carefully curated network of hospitals committed to ethical, patient-centred care across India.
          </p>
        </div>

        {hospitals === null ? (
          <div style={{textAlign:"center",padding:"48px"}}>
            <div style={{width:"32px",height:"32px",border:"3px solid #e2eaf4",borderTop:"3px solid #047857",
              borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:"32px"}}>

            {/* Strategic — full width cards */}
            {strategic.length > 0 && (
              <div>
                {strategic.length > 0 && (
                  <p style={{fontSize:"11px",fontWeight:"700",color:"#0369a1",textTransform:"uppercase",
                    letterSpacing:"1.5px",marginBottom:"16px"}}>⭐ Featured Strategic Partners</p>
                )}
                <div style={{display:"grid",gap:"24px"}}>
                  {strategic.map(h => <StrategicCard key={h.id} h={h}/>)}
                </div>
              </div>
            )}

            {/* Growth — 2-col grid */}
            {growth.length > 0 && (
              <div>
                <p style={{fontSize:"11px",fontWeight:"700",color:"#047857",textTransform:"uppercase",
                  letterSpacing:"1.5px",marginBottom:"16px"}}>🚀 Growth Partners</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"20px"}}>
                  {growth.map(h => <GrowthCard key={h.id} h={h}/>)}
                </div>
              </div>
            )}

            {/* Basic — compact 3–4 col grid */}
            {basic.length > 0 && (
              <div>
                <p style={{fontSize:"11px",fontWeight:"700",color:"#64748b",textTransform:"uppercase",
                  letterSpacing:"1.5px",marginBottom:"16px"}}>🌿 Network Hospitals</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
                  {basic.map(h => <BasicCard key={h.id} h={h}/>)}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </section>
  );
}
