/**
 * OurHospitals.jsx — /our-hospitals
 * Dedicated hospital showcase page with 3 tabs:
 * ⭐ Strategic | 🚀 Growth | 🌿 All Network
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes oh-fadein{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.oh *{box-sizing:border-box;font-family:'DM Sans',sans-serif;}
.oh-tab{padding:10px 22px;border-radius:50px;border:1.5px solid #e2eaf4;background:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;color:#64748b;
  cursor:pointer;transition:all .2s;}
.oh-tab.on{background:#0b1f3a;color:#fff;border-color:#0b1f3a;
  box-shadow:0 4px 14px rgba(11,31,58,.2);}
.oh-tab:hover:not(.on){border-color:#0b1f3a;color:#0b1f3a;}
.oh-card{animation:oh-fadein .4s ease both;transition:transform .22s,box-shadow .22s;}
.oh-card:hover{transform:translateY(-5px);}
.oh-spec{display:inline-block;padding:4px 11px;border-radius:50px;font-size:11px;
  font-weight:600;background:#f0fdf4;color:#047857;border:1px solid #bbf7d0;}
.oh-accr{display:inline-block;padding:3px 10px;border-radius:50px;font-size:10.5px;
  font-weight:700;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;}
.oh-banner-dot{width:8px;height:8px;border-radius:50%;border:none;cursor:pointer;
  padding:0;transition:all .25s;}
/* Tab bar scrollable on mobile */
.oh-tabbar{display:flex;gap:8px;overflow-x:auto;padding:12px 16px;
  -ms-overflow-style:none;scrollbar-width:none;}
.oh-tabbar::-webkit-scrollbar{display:none;}
/* Mobile responsive */
@media(max-width:600px){
  .oh-stats-chips{flex-direction:column!important;align-items:center!important;}
  .oh-stats-chips>div{width:100%!important;max-width:280px!important;}
  .oh-content-pad{padding:20px 16px 48px!important;}
  .oh-hero{padding:36px 16px 32px!important;}
  .oh-growth-grid{grid-template-columns:1fr!important;}
  .oh-basic-grid{grid-template-columns:1fr!important;}
  .oh-basic-card{flex-direction:column!important;align-items:flex-start!important;}
  .oh-basic-card-logo{width:100%!important;height:120px!important;border-radius:10px!important;}
  .oh-basic-card-btn{width:100%!important;justify-content:center!important;margin-top:8px!important;}
  .oh-strategic-hero{height:200px!important;}
}
`;

/* ── Banner slider ── */
function BannerSlider({ banners }) {
  const [idx, setIdx] = useState(0);
  if (!banners || banners.length === 0) return null;
  const url = banners[idx]?.url || banners[idx];
  return (
    <div style={{position:"relative",borderRadius:"12px",overflow:"hidden",marginBottom:"20px"}}>
      <img src={url} alt={`Banner ${idx+1}`}
        style={{width:"100%",height:"220px",objectFit:"cover",display:"block"}}/>
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(to top,rgba(11,31,58,.35),transparent)"}}/>
      {banners.length > 1 && (
        <>
          <button onClick={()=>setIdx(i=>(i-1+banners.length)%banners.length)}
            style={{position:"absolute",top:"50%",left:"10px",transform:"translateY(-50%)",
              width:"30px",height:"30px",borderRadius:"50%",background:"rgba(255,255,255,.85)",
              border:"none",cursor:"pointer",fontSize:"16px",display:"flex",
              alignItems:"center",justifyContent:"center"}}>‹</button>
          <button onClick={()=>setIdx(i=>(i+1)%banners.length)}
            style={{position:"absolute",top:"50%",right:"10px",transform:"translateY(-50%)",
              width:"30px",height:"30px",borderRadius:"50%",background:"rgba(255,255,255,.85)",
              border:"none",cursor:"pointer",fontSize:"16px",display:"flex",
              alignItems:"center",justifyContent:"center"}}>›</button>
          <div style={{position:"absolute",bottom:"10px",left:"50%",
            transform:"translateX(-50%)",display:"flex",gap:"6px"}}>
            {banners.map((_,i)=>(
              <button key={i} className="oh-banner-dot" onClick={()=>setIdx(i)}
                style={{background:i===idx?"#fff":"rgba(255,255,255,.5)",
                  width:i===idx?"20px":"8px"}}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Video player card ── */
function VideoCard({ item, label }) {
  const [playing, setPlaying] = useState(false);
  const url = item?.url || item;
  return (
    <div style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #e2eaf4",background:"#fff",
      boxShadow:"0 2px 10px rgba(11,31,58,.06)"}}>
      <div style={{position:"relative",height:"160px",background:"#0b1f3a"}}>
        {!playing ? (
          <>
            <video src={url} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.7}}/>
            <button onClick={()=>setPlaying(true)}
              style={{position:"absolute",inset:0,background:"transparent",border:"none",
                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:"52px",height:"52px",borderRadius:"50%",
                background:"rgba(255,255,255,.92)",display:"flex",
                alignItems:"center",justifyContent:"center",
                boxShadow:"0 4px 20px rgba(0,0,0,.3)"}}>
                <span style={{fontSize:"22px",marginLeft:"4px"}}>▶</span>
              </div>
            </button>
          </>
        ) : (
          <video src={url} controls autoPlay
            style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        )}
      </div>
      <div style={{padding:"10px 14px"}}>
        {label && <span style={{fontSize:"9.5px",fontWeight:"700",color:"#7c3aed",
          textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:"2px"}}>{label}</span>}
        <p style={{margin:0,fontSize:"12.5px",fontWeight:"600",color:"#0b1f3a",
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {item?.title || "Video"}
        </p>
      </div>
    </div>
  );
}

/* ── Stats bar ── */
function StatsBar({ beds, specCount, accrCount }) {
  const items = [
    beds && Number(beds) > 0     ? { val: beds,      label:"Beds"           } : null,
    specCount > 0                ? { val: specCount,  label:"Specialties"    } : null,
    accrCount > 0                ? { val: accrCount,  label:"Certifications" } : null,
  ].filter(Boolean);
  if (items.length === 0) return null;
  return (
    <div style={{display:"flex",borderTop:"1px solid #f1f5f9",
      borderBottom:"1px solid #f1f5f9",background:"#fafbff",marginBottom:"16px"}}>
      {items.map((item,i) => (
        <div key={i} style={{flex:1,padding:"12px 0",textAlign:"center",
          borderRight: i<items.length-1?"1px solid #f1f5f9":"none"}}>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
            fontWeight:"700",color:"#0b1f3a",margin:0,lineHeight:1}}>
            {item.val}
          </p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",fontWeight:"600",
            color:"#94a3b8",margin:"3px 0 0",textTransform:"uppercase",letterSpacing:"0.8px"}}>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Strategic Hospital Card (full featured) ── */
function StrategicCard({ h, idx }) {
  const [activeTab, setActiveTab] = useState("about");
  const photo      = h.photos?.[0] || null;
  const banners    = h.banners || [];
  const videos     = h.videos || [];
  const interviews = h.doctor_interviews || [];
  const specs      = h.specialties || [];
  const accrs      = h.accreditations || [];

  const mediaTabs = [
    { id:"about", label:"About" },
    ...(banners.length    > 0 ? [{ id:"banners",    label:`🖼️ Promotions (${banners.length})` }]    : []),
    ...(videos.length     > 0 ? [{ id:"videos",     label:`🎬 Videos (${videos.length})` }]         : []),
    ...(interviews.length > 0 ? [{ id:"interviews", label:`🩺 Doctors (${interviews.length})` }]    : []),
  ];

  return (
    <div className="oh-card" style={{
      background:"#fff",borderRadius:"20px",overflow:"hidden",
      border:"2px solid #bfdbfe",
      boxShadow:"0 8px 40px rgba(29,78,216,.10)",
      animationDelay:`${idx*0.07}s`,
    }}>
      {/* Hero */}
      <div style={{height:"260px",position:"relative",
        background: photo
          ? `url(${photo}) center/cover`
          : "linear-gradient(135deg,#0f2d55 0%,#1565c0 100%)"}}>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,.65) 100%)"}}/>
        {/* Tier ribbon */}
        <div style={{position:"absolute",top:0,left:0,
          background:"linear-gradient(90deg,#1d4ed8,#3b82f6)",
          padding:"6px 20px 6px 16px",borderBottomRightRadius:"16px",
          display:"flex",alignItems:"center",gap:"6px"}}>
          <span style={{fontSize:"14px"}}>⭐</span>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
            fontWeight:"700",color:"#fff",letterSpacing:"0.5px"}}>
            STRATEGIC PARTNER
          </span>
        </div>
        {/* Accreditations top right */}
        {accrs.length > 0 && (
          <div style={{position:"absolute",top:"10px",right:"14px",
            display:"flex",gap:"5px",flexWrap:"wrap",justifyContent:"flex-end"}}>
            {accrs.slice(0,2).map((a,i)=>(
              <span key={i} style={{background:"rgba(255,255,255,.92)",color:"#1d4ed8",
                fontFamily:"'DM Sans',sans-serif",fontSize:"9.5px",fontWeight:"700",
                padding:"3px 9px",borderRadius:"5px"}}>✓ {a}</span>
            ))}
          </div>
        )}
        {/* Name */}
        <div style={{position:"absolute",bottom:"20px",left:"22px",right:"22px"}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(22px,2.5vw,28px)",fontWeight:"700",color:"#fff",
            margin:"0 0 6px",textShadow:"0 2px 8px rgba(0,0,0,.4)"}}>
            {h.hospital_name}
          </h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"rgba(255,255,255,.85)",margin:0}}>
            📍 {[h.city,h.state].filter(Boolean).join(", ")}
            {h.bed_count && Number(h.bed_count)>0 &&
              <span style={{marginLeft:"14px"}}>🏥 {h.bed_count} beds</span>}
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsBar beds={h.bed_count} specCount={specs.length} accrCount={accrs.length}/>

      {/* Media tabs */}
      {mediaTabs.length > 1 && (
        <div style={{padding:"0 20px 16px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {mediaTabs.map(t=>(
            <button key={t.id} className={`oh-tab${activeTab===t.id?" on":""}`}
              onClick={()=>setActiveTab(t.id)} style={{padding:"7px 16px",fontSize:"12px"}}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      <div style={{padding:"0 20px 22px"}}>
        {activeTab==="about" && (
          <div>
            {specs.length > 0 && (
              <>
                <p style={{fontSize:"10.5px",fontWeight:"700",color:"#047857",
                  textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:"8px"}}>
                  Specialties
                </p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"16px"}}>
                  {specs.map((s,i)=><span key={i} className="oh-spec">{s}</span>)}
                </div>
              </>
            )}
            {accrs.length > 0 && (
              <>
                <p style={{fontSize:"10.5px",fontWeight:"700",color:"#1d4ed8",
                  textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:"8px"}}>
                  Accreditations
                </p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"16px"}}>
                  {accrs.map((a,i)=><span key={i} className="oh-accr">✓ {a}</span>)}
                </div>
              </>
            )}
            {h.website && (
              <a href={h.website} target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:"6px",
                  background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",color:"#fff",
                  padding:"10px 22px",borderRadius:"9px",fontFamily:"'DM Sans',sans-serif",
                  fontWeight:"700",fontSize:"13px",textDecoration:"none",
                  boxShadow:"0 4px 14px rgba(29,78,216,.25)"}}>
                🌐 Visit Website
              </a>
            )}
            <a href={`/our-hospitals/${h.id}`}
              style={{display:"inline-flex",alignItems:"center",gap:"6px",
                background:"#f8faff",border:"1.5px solid #bfdbfe",color:"#1d4ed8",
                padding:"10px 22px",borderRadius:"9px",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"700",fontSize:"13px",textDecoration:"none"}}>
              View Full Profile →
            </a>
          </div>
        )}
        {activeTab==="banners" && <BannerSlider banners={banners}/>}
        {activeTab==="videos" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:"14px"}}>
            {videos.map((v,i)=><VideoCard key={i} item={v}/>)}
          </div>
        )}
        {activeTab==="interviews" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:"14px"}}>
            {interviews.map((v,i)=><VideoCard key={i} item={v} label="Doctor Interview"/>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Growth Hospital Card ── */
function GrowthCard({ h, idx }) {
  const photo   = h.photos?.[0] || null;
  const banners = h.banners || [];
  const specs   = h.specialties || [];
  const accrs   = h.accreditations || [];
  const [banIdx, setBanIdx] = useState(0);

  return (
    <div className="oh-card" style={{
      background:"#fff",borderRadius:"18px",overflow:"hidden",
      border:"1.5px solid #bbf7d0",
      boxShadow:"0 4px 24px rgba(4,120,87,.09)",
      display:"flex",flexDirection:"column",
      animationDelay:`${idx*0.06}s`,
    }}>
      {/* Hero */}
      <div style={{height:"180px",position:"relative",overflow:"hidden",
        background: (banners[banIdx]?.url||banners[banIdx]||photo)
          ? `url(${banners[banIdx]?.url||banners[banIdx]||photo}) center/cover`
          : "linear-gradient(135deg,#064e3b,#059669)"}}>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(180deg,rgba(0,0,0,.04) 0%,rgba(0,0,0,.55) 100%)"}}/>
        {/* Ribbon */}
        <div style={{position:"absolute",top:0,left:0,
          background:"linear-gradient(90deg,#047857,#10b981)",
          padding:"5px 16px 5px 12px",borderBottomRightRadius:"12px"}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
            fontWeight:"700",color:"#fff",letterSpacing:"0.5px"}}>
            🚀 GROWTH PARTNER
          </span>
        </div>
        {/* Banner dots */}
        {banners.length > 1 && (
          <div style={{position:"absolute",bottom:"10px",right:"12px",display:"flex",gap:"5px"}}>
            {banners.map((_,i)=>(
              <button key={i} className="oh-banner-dot" onClick={()=>setBanIdx(i)}
                style={{background:i===banIdx?"#fff":"rgba(255,255,255,.5)",
                  width:i===banIdx?"16px":"7px"}}/>
            ))}
          </div>
        )}
        <div style={{position:"absolute",bottom:"12px",left:"14px",right:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"19px",
            fontWeight:"700",color:"#fff",margin:"0 0 3px",
            textShadow:"0 1px 5px rgba(0,0,0,.45)",
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {h.hospital_name}
          </h3>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
            color:"rgba(255,255,255,.85)",margin:0}}>
            📍 {[h.city,h.state].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsBar beds={h.bed_count} specCount={specs.length} accrCount={accrs.length}/>

      <div style={{padding:"0 16px 18px",flex:1,display:"flex",flexDirection:"column"}}>
        {specs.length > 0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>
            {specs.slice(0,5).map((s,i)=><span key={i} className="oh-spec">{s}</span>)}
            {specs.length>5 && <span className="oh-spec" style={{background:"#f8fafc",
              color:"#94a3b8",border:"1px solid #e2eaf4"}}>+{specs.length-5}</span>}
          </div>
        )}
        {accrs.length > 0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>
            {accrs.slice(0,3).map((a,i)=><span key={i} className="oh-accr">✓ {a}</span>)}
          </div>
        )}
        <div style={{marginTop:"auto"}}>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {h.website && (
              <a href={h.website} target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",
                  background:"linear-gradient(135deg,#047857,#10b981)",color:"#fff",
                  padding:"10px 0",borderRadius:"9px",fontFamily:"'DM Sans',sans-serif",
                  fontWeight:"700",fontSize:"12.5px",textDecoration:"none",
                  boxShadow:"0 4px 14px rgba(4,120,87,.22)"}}>
                🌐 Visit Website
              </a>
            )}
            <a href={`/our-hospitals/${h.id}`}
              style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",
                background:"#f0fdf4",border:"1.5px solid #86efac",color:"#047857",
                padding:"10px 0",borderRadius:"9px",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"12.5px",
                textDecoration:"none"}}>
              View Full Profile →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Basic Hospital Card (compact) ── */
function BasicCard({ h, idx }) {
  const photo = h.photos?.[0] || null;
  const specs = h.specialties || [];
  const initial = (h.hospital_name||"H")[0].toUpperCase();

  return (
    <div className="oh-card oh-basic-card" style={{
      background:"#fff",borderRadius:"14px",overflow:"hidden",
      border:"1px solid #e8f0fb",
      boxShadow:"0 2px 12px rgba(11,31,58,.06)",
      display:"flex",gap:"14px",alignItems:"center",
      padding:"16px",
      animationDelay:`${idx*0.04}s`,
    }}>
      {/* Logo */}
      <div className="oh-basic-card-logo" style={{width:"52px",height:"52px",borderRadius:"12px",flexShrink:0,
        overflow:"hidden",border:"1px solid #e2eaf4",
        background: photo
          ? `url(${photo}) center/cover`
          : "linear-gradient(135deg,#f1f5f9,#e2eaf4)",
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        {!photo && (
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
            fontWeight:"700",color:"#94a3b8"}}>{initial}</span>
        )}
      </div>
      {/* Info */}
      <div style={{flex:1,minWidth:0}}>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"15px",
          fontWeight:"700",color:"#0b1f3a",margin:"0 0 2px",
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {h.hospital_name}
        </h3>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
          color:"#94a3b8",margin:"0 0 5px"}}>
          📍 {[h.city,h.state].filter(Boolean).join(", ")}
        </p>
        {specs.length > 0 && (
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
            color:"#64748b",margin:0}}>
            {specs.slice(0,3).join(" · ")}
          </p>
        )}
      </div>
      {/* View Profile */}
      <a href={`/our-hospitals/${h.id}`}
        className="oh-basic-card-btn"
        style={{flexShrink:0,display:"inline-flex",alignItems:"center",
          padding:"7px 14px",borderRadius:"8px",
          background:"#f0fdf4",border:"1.5px solid #86efac",
          color:"#047857",fontFamily:"'DM Sans',sans-serif",
          fontWeight:"700",fontSize:"12px",textDecoration:"none",
          whiteSpace:"nowrap"}}>
        View →
      </a>
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ tab }) {
  return (
    <div style={{textAlign:"center",padding:"60px 24px"}}>
      <div style={{fontSize:"48px",marginBottom:"16px"}}>🏥</div>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
        color:"#0b1f3a",marginBottom:"8px"}}>No hospitals yet</h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#94a3b8"}}>
        {tab === "strategic"
          ? "No Strategic Partner hospitals currently. Check back soon."
          : tab === "growth"
            ? "No Growth Partner hospitals currently."
            : "No hospitals in the network yet."}
      </p>
    </div>
  );
}

/* ── Main Page ── */
export default function OurHospitals() {
  const [hospitals, setHospitals] = useState(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    document.title = "Our Partner Hospitals — We Care 4 'all'";
    (async () => {
      try {
        const res  = await fetch(`${API}/empanelment/partner-hospitals`);
        const json = await res.json();
        setHospitals(json.hospitals || []);
      } catch { setHospitals([]); }
    })();
  }, []);

  const strategic = (hospitals||[]).filter(h=>h.tier==="strategic");
  const growth    = (hospitals||[]).filter(h=>h.tier==="growth");
  const basic     = (hospitals||[]).filter(h=>h.tier==="basic");
  const visible   = tab==="strategic" ? strategic
                  : tab==="growth"    ? growth
                  : tab==="basic"     ? basic
                  : hospitals||[];

  return (
    <div className="oh" style={{background:"#f8faff",minHeight:"100vh"}}>
      <style>{CSS}</style>
      <SEO title="Our Partner Hospitals" path="/our-hospitals"
        description="Browse our verified partner hospital network — Strategic, Growth, and Basic tier hospitals across India."/>

      {/* Hero */}
      <div className="oh-hero" style={{background:"linear-gradient(135deg,#0b1f3a 0%,#112d52 60%,#0a2840 100%)",
        padding:"56px 24px 48px"}}>
        <div style={{maxWidth:"800px",margin:"0 auto",textAlign:"center"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
            color:"rgba(52,211,153,.8)",letterSpacing:"2.5px",textTransform:"uppercase",
            marginBottom:"12px"}}>
            VERIFIED HEALTHCARE NETWORK
          </p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(28px,5vw,48px)",fontWeight:"700",color:"#fff",
            margin:"0 0 14px",lineHeight:1.1}}>
            Our Partner Hospitals
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",
            color:"rgba(255,255,255,.65)",margin:"0 auto",maxWidth:"520px",lineHeight:1.7}}>
            A curated network of hospitals committed to ethical, patient-centred care across India.
          </p>

          {/* Stats chips */}
          {hospitals && (
            <div className="oh-stats-chips" style={{display:"flex",justifyContent:"center",gap:"16px",
              marginTop:"28px",flexWrap:"wrap"}}>
              {[
                { val:hospitals.length, label:"Total Hospitals" },
                { val:strategic.length, label:"Strategic Partners" },
                { val:growth.length,    label:"Growth Partners"   },
              ].map((s,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.10)",
                  borderRadius:"12px",padding:"12px 24px",backdropFilter:"blur(4px)",
                  border:"1px solid rgba(255,255,255,.12)"}}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",
                    fontWeight:"700",color:"#fff",margin:0,lineHeight:1}}>{s.val}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10.5px",
                    color:"rgba(255,255,255,.55)",margin:"3px 0 0",
                    textTransform:"uppercase",letterSpacing:"0.8px",fontWeight:"600"}}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

        <div style={{background:"#fff",borderBottom:"1px solid #e8f0fb",
        position:"sticky",top:"72px",zIndex:10}}>
        <div className="oh-tabbar" style={{maxWidth:"1200px",margin:"0 auto"}}>
          {[
            { id:"all",       label:`All (${(hospitals||[]).length})`       },
            { id:"strategic", label:`⭐ Strategic (${strategic.length})`    },
            { id:"growth",    label:`🚀 Growth (${growth.length})`          },
            { id:"basic",     label:`🌿 Network (${basic.length})`          },
          ].map(t=>(
            <button key={t.id} className={`oh-tab${tab===t.id?" on":""}`}
              onClick={()=>setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="oh-content-pad" style={{maxWidth:"1200px",margin:"0 auto",padding:"36px 24px 72px"}}>

        {hospitals === null ? (
          <div style={{textAlign:"center",padding:"80px"}}>
            <div style={{width:"36px",height:"36px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #047857",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto"}}/>
          </div>
        ) : (
          <>
            {/* Strategic */}
            {(tab==="all"||tab==="strategic") && strategic.length > 0 && (
              <div style={{marginBottom:"48px"}}>
                {tab==="all" && (
                  <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
                    <div style={{width:"3px",height:"24px",borderRadius:"2px",
                      background:"linear-gradient(180deg,#1d4ed8,#3b82f6)"}}/>
                    <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
                      fontWeight:"700",color:"#0b1f3a",margin:0}}>Featured Strategic Partners</h2>
                  </div>
                )}
                <div style={{display:"grid",gap:"28px"}}>
                  {strategic.map((h,i)=><StrategicCard key={h.id} h={h} idx={i}/>)}
                </div>
              </div>
            )}

            {/* Growth */}
            {(tab==="all"||tab==="growth") && growth.length > 0 && (
              <div style={{marginBottom:"48px"}}>
                {tab==="all" && (
                  <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
                    <div style={{width:"3px",height:"24px",borderRadius:"2px",
                      background:"linear-gradient(180deg,#047857,#10b981)"}}/>
                    <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
                      fontWeight:"700",color:"#0b1f3a",margin:0}}>Growth Partners</h2>
                  </div>
                )}
                <div className="oh-growth-grid" style={{display:"grid",
                  gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"22px"}}>
                  {growth.map((h,i)=><GrowthCard key={h.id} h={h} idx={i}/>)}
                </div>
              </div>
            )}

            {/* Basic */}
            {(tab==="all"||tab==="basic") && basic.length > 0 && (
              <div>
                {tab==="all" && (
                  <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
                    <div style={{width:"3px",height:"24px",borderRadius:"2px",
                      background:"linear-gradient(180deg,#64748b,#94a3b8)"}}/>
                    <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
                      fontWeight:"700",color:"#0b1f3a",margin:0}}>Network Hospitals</h2>
                  </div>
                )}
                <div className="oh-basic-grid" style={{display:"grid",
                  gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"12px"}}>
                  {basic.map((h,i)=><BasicCard key={h.id} h={h} idx={i}/>)}
                </div>
              </div>
            )}

            {visible.length === 0 && <EmptyState tab={tab}/>}
          </>
        )}
      </div>
    </div>
  );
}
