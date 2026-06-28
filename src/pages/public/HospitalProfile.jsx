/**
 * HospitalProfile.jsx — /our-hospitals/:id
 * Full Apollo-style hospital profile page with:
 * - Hero banner/photo
 * - Stats bar (beds, ICU, doctors, nurses, year est.)
 * - Tabs: About | Specialties | Infrastructure | Gallery | Videos
 * - Banners carousel (Growth+)
 * - Doctor interview videos (Strategic)
 * - Insurance & international info
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.hp-wrap *{box-sizing:border-box;font-family:'DM Sans',sans-serif;}
.hp-tab{padding:12px 24px;border:none;background:transparent;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;color:#64748b;
  border-bottom:3px solid transparent;transition:all .2s;white-space:nowrap;}
.hp-tab.on{color:#047857;border-bottom-color:#047857;}
.hp-tab:hover:not(.on){color:#0b1f3a;}
.hp-chip{display:inline-flex;align-items:center;padding:5px 13px;border-radius:50px;
  font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;}
.hp-card{animation:fadeIn .4s ease both;}
.hp-section{padding:32px 0;border-bottom:1px solid #f1f5f9;}
.hp-section:last-child{border-bottom:none;}
`;

/* ── Banner Slider ── */
function BannerSlider({ banners }) {
  const [idx, setIdx] = useState(0);
  if (!banners?.length) return null;
  const url = banners[idx]?.url || banners[idx];
  return (
    <div style={{position:"relative",borderRadius:"14px",overflow:"hidden",
      boxShadow:"0 4px 20px rgba(11,31,58,.12)"}}>
      <img src={url} alt={`Banner ${idx+1}`}
        style={{width:"100%",height:"280px",objectFit:"cover",display:"block"}}/>
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(to top,rgba(11,31,58,.3),transparent)"}}/>
      {banners.length > 1 && (
        <>
          <button onClick={()=>setIdx(i=>(i-1+banners.length)%banners.length)}
            style={{position:"absolute",top:"50%",left:"12px",transform:"translateY(-50%)",
              width:"34px",height:"34px",borderRadius:"50%",background:"rgba(255,255,255,.85)",
              border:"none",cursor:"pointer",fontSize:"18px",display:"flex",
              alignItems:"center",justifyContent:"center"}}>‹</button>
          <button onClick={()=>setIdx(i=>(i+1)%banners.length)}
            style={{position:"absolute",top:"50%",right:"12px",transform:"translateY(-50%)",
              width:"34px",height:"34px",borderRadius:"50%",background:"rgba(255,255,255,.85)",
              border:"none",cursor:"pointer",fontSize:"18px",display:"flex",
              alignItems:"center",justifyContent:"center"}}>›</button>
          <div style={{position:"absolute",bottom:"12px",left:"50%",
            transform:"translateX(-50%)",display:"flex",gap:"6px"}}>
            {banners.map((_,i)=>(
              <button key={i} onClick={()=>setIdx(i)}
                style={{width:i===idx?"20px":"8px",height:"8px",borderRadius:"4px",
                  border:"none",cursor:"pointer",padding:0,transition:"all .25s",
                  background:i===idx?"#fff":"rgba(255,255,255,.5)"}}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Video Player ── */
function VideoCard({ item, label }) {
  const [playing, setPlaying] = useState(false);
  const url = item?.url || item;
  return (
    <div style={{borderRadius:"12px",overflow:"hidden",border:"1px solid #e2eaf4",
      background:"#fff",boxShadow:"0 2px 10px rgba(11,31,58,.06)"}}>
      <div style={{position:"relative",height:"180px",background:"#0b1f3a"}}>
        {!playing ? (
          <>
            <video src={url} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.7}}/>
            <button onClick={()=>setPlaying(true)}
              style={{position:"absolute",inset:0,background:"transparent",border:"none",
                cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:"56px",height:"56px",borderRadius:"50%",
                background:"rgba(255,255,255,.92)",display:"flex",
                alignItems:"center",justifyContent:"center",
                boxShadow:"0 4px 20px rgba(0,0,0,.3)"}}>
                <span style={{fontSize:"24px",marginLeft:"4px"}}>▶</span>
              </div>
            </button>
          </>
        ) : (
          <video src={url} controls autoPlay
            style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        )}
      </div>
      <div style={{padding:"10px 14px"}}>
        {label && <span style={{fontSize:"10px",fontWeight:"700",color:"#7c3aed",
          textTransform:"uppercase",letterSpacing:"1px",display:"block",marginBottom:"3px"}}>{label}</span>}
        <p style={{margin:0,fontSize:"13px",fontWeight:"600",color:"#0b1f3a",
          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {item?.title || "Video"}
        </p>
      </div>
    </div>
  );
}

/* ── Stat Box ── */
function StatBox({ val, label, color="#0b1f3a" }) {
  if (!val && val !== 0) return null;
  return (
    <div style={{textAlign:"center",padding:"16px 8px",flex:1}}>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",fontWeight:"700",
        color,margin:0,lineHeight:1}}>{val}</p>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",fontWeight:"600",
        color:"#94a3b8",margin:"4px 0 0",textTransform:"uppercase",letterSpacing:"0.8px"}}>
        {label}
      </p>
    </div>
  );
}

export default function HospitalProfile() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [h, setH]  = useState(null);
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState("about");

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        const res  = await fetch(`${API}/empanelment/partner-hospitals/${id}`);
        if (!res.ok) { setErr("Hospital not found"); return; }
        const json = await res.json();
        setH(json);
        document.title = `${json.hospital_name} — We Care 4 'all'`;
      } catch { setErr("Failed to load hospital details"); }
    })();
  }, [id]);

  if (err) return (
    <div style={{minHeight:"60vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:"16px"}}>
      <div style={{fontSize:"48px"}}>🏥</div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",color:"#0b1f3a",margin:0}}>{err}</h2>
      <button onClick={()=>navigate("/our-hospitals")}
        style={{padding:"10px 24px",borderRadius:"9px",background:"#047857",color:"#fff",
          border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:"700"}}>
        ← Back to Hospitals
      </button>
    </div>
  );

  if (!h) return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{width:"40px",height:"40px",border:"3px solid #e2eaf4",
        borderTop:"3px solid #047857",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
    </div>
  );

  const isStrat  = h.tier === "strategic";
  const isGrowth = h.tier === "growth" || isStrat;
  const photo    = h.photos?.[0] || null;
  const banners  = h.banners || [];
  const videos   = h.videos || [];
  const interviews = h.doctor_interviews || [];
  const specs    = h.specialties || [];
  const accrs    = h.accreditations || [];
  const infra    = Array.isArray(h.infrastructure) ? h.infrastructure
                   : typeof h.infrastructure === "object" && h.infrastructure
                     ? Object.keys(h.infrastructure).filter(k=>h.infrastructure[k])
                     : [];

  const tierColor = isStrat ? "#1d4ed8" : isGrowth ? "#047857" : "#64748b";
  const tierLabel = isStrat ? "⭐ Strategic Partner" : isGrowth ? "🚀 Growth Partner" : "🌿 Network Hospital";
  const tierBg    = isStrat ? "linear-gradient(135deg,#1d4ed8,#3b82f6)"
                             : isGrowth ? "linear-gradient(135deg,#047857,#10b981)"
                             : "linear-gradient(135deg,#64748b,#94a3b8)";

  const hasStats  = h.bed_count || h.icu_beds || h.doctors_count || h.nurses_count || h.year_established;
  const hasBanners = banners.length > 0;
  const hasVideos  = videos.length > 0 || interviews.length > 0;
  const hasGallery = (h.photos || []).length > 1;

  const tabs = [
    { id:"about",        label:"About"              },
    ...(specs.length > 0 ? [{ id:"specialties", label:`Specialties (${specs.length})` }] : []),
    ...(infra.length > 0 ? [{ id:"infra",       label:"Infrastructure"               }] : []),
    ...(hasBanners       ? [{ id:"banners",     label:"Promotions"                   }] : []),
    ...(hasGallery       ? [{ id:"gallery",     label:`Gallery (${(h.photos||[]).length})` }] : []),
    ...(hasVideos        ? [{ id:"videos",      label:"Videos"                       }] : []),
  ];

  return (
    <div className="hp-wrap" style={{background:"#f8faff",minHeight:"100vh"}}>
      <style>{CSS}</style>
      <SEO title={h.hospital_name} path={`/our-hospitals/${id}`}
        description={h.about_hospital || `${h.hospital_name} — verified partner hospital in ${h.city}, ${h.state}.`}/>

      {/* ── HERO ── */}
      <div style={{
        height:"320px",position:"relative",overflow:"hidden",
        background: photo
          ? `url(${photo}) center/cover`
          : tierBg,
      }}>
        <div style={{position:"absolute",inset:0,
          background:"linear-gradient(180deg,rgba(0,0,0,.1) 0%,rgba(0,0,0,.7) 100%)"}}/>

        {/* Back button */}
        <button onClick={()=>navigate("/our-hospitals")}
          style={{position:"absolute",top:"20px",left:"20px",
            background:"rgba(255,255,255,.15)",backdropFilter:"blur(8px)",
            border:"1px solid rgba(255,255,255,.25)",color:"#fff",padding:"8px 16px",
            borderRadius:"50px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"600",fontSize:"13px",display:"flex",alignItems:"center",gap:"6px"}}>
          ← Our Hospitals
        </button>

        {/* Tier badge */}
        <div style={{position:"absolute",top:"20px",right:"20px",
          background:tierBg,color:"#fff",padding:"5px 16px",borderRadius:"50px",
          fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
          letterSpacing:"0.4px"}}>
          {tierLabel}
        </div>

        {/* Accreditations */}
        {accrs.length > 0 && (
          <div style={{position:"absolute",bottom:"80px",right:"20px",
            display:"flex",gap:"6px",flexWrap:"wrap",justifyContent:"flex-end"}}>
            {accrs.slice(0,3).map((a,i)=>(
              <span key={i} style={{background:"rgba(255,255,255,.92)",color:"#1d4ed8",
                fontFamily:"'DM Sans',sans-serif",fontSize:"10px",fontWeight:"700",
                padding:"3px 10px",borderRadius:"6px"}}>✓ {a}</span>
            ))}
          </div>
        )}

        {/* Name + location */}
        <div style={{position:"absolute",bottom:"24px",left:"24px",right:"24px"}}>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(24px,4vw,40px)",fontWeight:"700",color:"#fff",
            margin:"0 0 6px",textShadow:"0 2px 8px rgba(0,0,0,.4)"}}>
            {h.hospital_name}
          </h1>
          <div style={{display:"flex",alignItems:"center",gap:"16px",flexWrap:"wrap"}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              color:"rgba(255,255,255,.85)"}}>
              📍 {[h.city,h.state].filter(Boolean).join(", ")}
            </span>
            {h.hospital_type && (
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"rgba(255,255,255,.7)"}}>· {h.hospital_type}</span>
            )}
            {h.year_established && (
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"rgba(255,255,255,.7)"}}>· Est. {h.year_established}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      {hasStats && (
        <div style={{background:"#fff",borderBottom:"1px solid #f1f5f9",
          boxShadow:"0 2px 12px rgba(11,31,58,.06)"}}>
          <div style={{maxWidth:"1100px",margin:"0 auto",
            display:"flex",flexWrap:"wrap",divideX:"1px solid #f1f5f9"}}>
            {h.bed_count     && <StatBox val={h.bed_count}     label="Total Beds"/>}
            {h.icu_beds      && <StatBox val={h.icu_beds}      label="ICU Beds" color="#dc2626"/>}
            {h.doctors_count && <StatBox val={h.doctors_count} label="Doctors"  color="#047857"/>}
            {h.nurses_count  && <StatBox val={h.nurses_count}  label="Nurses"   color="#0369a1"/>}
            {specs.length > 0 && <StatBox val={specs.length}   label="Specialties" color="#7c3aed"/>}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 20px 60px"}}>

        {/* Quick action bar */}
        <div style={{display:"flex",gap:"12px",flexWrap:"wrap",
          padding:"20px 0",borderBottom:"1px solid #f1f5f9",marginBottom:"4px"}}>
          {h.website && (
            <a href={h.website} target="_blank" rel="noopener noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:"7px",
                background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                padding:"10px 22px",borderRadius:"9px",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"700",fontSize:"13.5px",textDecoration:"none",
                boxShadow:"0 4px 14px rgba(4,120,87,.25)"}}>
              🌐 Visit Website
            </a>
          )}
          {h.treats_international && (
            <span style={{display:"inline-flex",alignItems:"center",gap:"7px",
              background:"#eff6ff",border:"1.5px solid #bfdbfe",color:"#1d4ed8",
              padding:"10px 18px",borderRadius:"9px",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"700",fontSize:"13px"}}>
              🌍 International Patients Welcome
            </span>
          )}
          {h.ins_status && h.ins_status !== "none" && (
            <span style={{display:"inline-flex",alignItems:"center",gap:"7px",
              background:"#f0fdf4",border:"1.5px solid #86efac",color:"#047857",
              padding:"10px 18px",borderRadius:"9px",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"700",fontSize:"13px"}}>
              🏥 Insurance Accepted
            </span>
          )}
        </div>

        {/* ── TABS ── */}
        <div style={{borderBottom:"1px solid #e8f0fb",marginBottom:"28px",
          display:"flex",overflowX:"auto",gap:"4px"}}>
          {tabs.map(t=>(
            <button key={t.id} className={`hp-tab${tab===t.id?" on":""}`}
              onClick={()=>setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ABOUT ── */}
        {tab==="about" && (
          <div className="hp-card">
            {(h.about_hospital || h.notes) && (
              <div className="hp-section">
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
                  fontWeight:"700",color:"#0b1f3a",margin:"0 0 14px"}}>About</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#475569",
                  lineHeight:"1.8",fontWeight:"300",margin:0}}>
                  {h.about_hospital || h.notes}
                </p>
              </div>
            )}

            {/* Key info grid */}
            <div className="hp-section">
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
                fontWeight:"700",color:"#0b1f3a",margin:"0 0 16px"}}>Hospital Details</h2>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:"12px"}}>
                {[
                  h.hospital_type      && ["🏥","Type",            h.hospital_type],
                  h.ownership          && ["🏛️","Ownership",       h.ownership],
                  h.year_established   && ["📅","Established",      h.year_established],
                  h.bed_count          && ["🛏️","Total Beds",       h.bed_count],
                  h.icu_beds           && ["🚨","ICU Beds",         h.icu_beds],
                  h.doctors_count      && ["👨‍⚕️","Doctors",        h.doctors_count],
                  h.nurses_count       && ["👩‍⚕️","Nurses",         h.nurses_count],
                  h.city               && ["📍","Location",          `${h.city}, ${h.state}`],
                ].filter(Boolean).map(([ic,label,val])=>(
                  <div key={label} style={{background:"#f8faff",border:"1px solid #e8f0fb",
                    borderRadius:"10px",padding:"14px 16px",display:"flex",
                    alignItems:"center",gap:"12px"}}>
                    <span style={{fontSize:"20px",flexShrink:0}}>{ic}</span>
                    <div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10.5px",
                        fontWeight:"700",color:"#94a3b8",textTransform:"uppercase",
                        letterSpacing:"0.8px",margin:0}}>{label}</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                        fontWeight:"700",color:"#0b1f3a",margin:"2px 0 0"}}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accreditations */}
            {accrs.length > 0 && (
              <div className="hp-section">
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
                  fontWeight:"700",color:"#0b1f3a",margin:"0 0 14px"}}>Accreditations</h2>
                <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
                  {accrs.map((a,i)=>(
                    <span key={i} className="hp-chip"
                      style={{background:"#eff6ff",border:"1.5px solid #bfdbfe",color:"#1d4ed8"}}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance */}
            {h.ins_list && (
              <div className="hp-section">
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
                  fontWeight:"700",color:"#0b1f3a",margin:"0 0 10px"}}>Insurance Accepted</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                  color:"#475569",lineHeight:"1.7",margin:0}}>{h.ins_list}</p>
              </div>
            )}

            {/* International */}
            {(h.treats_international || h.interpreter_languages) && (
              <div className="hp-section">
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
                  fontWeight:"700",color:"#0b1f3a",margin:"0 0 12px"}}>International Patients</h2>
                <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
                  {h.treats_international && (
                    <span className="hp-chip"
                      style={{background:"#f0fdf4",border:"1px solid #86efac",color:"#047857"}}>
                      🌍 International patients welcome
                    </span>
                  )}
                  {h.interpreter_languages && (
                    <span className="hp-chip"
                      style={{background:"#faf5ff",border:"1px solid #ddd6fe",color:"#7c3aed"}}>
                      🗣️ Interpreter: {h.interpreter_languages}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SPECIALTIES ── */}
        {tab==="specialties" && (
          <div className="hp-card">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
              fontWeight:"700",color:"#0b1f3a",margin:"0 0 20px"}}>Medical Specialties</h2>

            {/* Key specialists */}
            {Array.isArray(h.key_specialists) && h.key_specialists.length > 0 && (
              <div style={{marginBottom:"24px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
                  color:"#047857",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:"12px"}}>
                  Key Specialists
                </p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px",marginBottom:"24px"}}>
                  {h.key_specialists.map((s,i)=>(
                    <div key={i} style={{background:"#f8faff",border:"1px solid #e8f0fb",
                      borderRadius:"10px",padding:"12px 14px",display:"flex",alignItems:"center",gap:"10px"}}>
                      <span style={{fontSize:"20px"}}>👨‍⚕️</span>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                        fontWeight:"600",color:"#0b1f3a",margin:0}}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"#64748b",textTransform:"uppercase",letterSpacing:"1.2px",marginBottom:"12px"}}>
              All Specialties
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
              {specs.map((s,i)=>(
                <span key={i} className="hp-chip"
                  style={{background:"#f0fdf4",border:"1.5px solid #bbf7d0",color:"#047857",
                    fontSize:"13px",padding:"7px 16px"}}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── INFRASTRUCTURE ── */}
        {tab==="infra" && (
          <div className="hp-card">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
              fontWeight:"700",color:"#0b1f3a",margin:"0 0 20px"}}>Infrastructure & Facilities</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"12px"}}>
              {infra.map((item,i)=>(
                <div key={i} style={{background:"#fff",border:"1px solid #e8f0fb",
                  borderRadius:"10px",padding:"14px 16px",display:"flex",
                  alignItems:"center",gap:"10px",
                  boxShadow:"0 2px 8px rgba(11,31,58,.05)"}}>
                  <span style={{fontSize:"20px"}}>✅</span>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    fontWeight:"600",color:"#0b1f3a",margin:0}}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BANNERS ── */}
        {tab==="banners" && (
          <div className="hp-card">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
              fontWeight:"700",color:"#0b1f3a",margin:"0 0 20px"}}>Promotions & Campaigns</h2>
            <BannerSlider banners={banners}/>
          </div>
        )}

        {/* ── GALLERY ── */}
        {tab==="gallery" && (
          <div className="hp-card">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
              fontWeight:"700",color:"#0b1f3a",margin:"0 0 20px"}}>Photo Gallery</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"14px"}}>
              {(h.photos||[]).map((p,i)=>(
                <img key={i} src={p} alt={`Photo ${i+1}`}
                  style={{width:"100%",height:"200px",objectFit:"cover",
                    borderRadius:"12px",border:"1px solid #e2eaf4"}}/>
              ))}
            </div>
          </div>
        )}

        {/* ── VIDEOS ── */}
        {tab==="videos" && (
          <div className="hp-card">
            {videos.length > 0 && (
              <div style={{marginBottom:"32px"}}>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
                  fontWeight:"700",color:"#0b1f3a",margin:"0 0 16px"}}>🎬 Promotional Videos</h2>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
                  {videos.map((v,i)=><VideoCard key={i} item={v}/>)}
                </div>
              </div>
            )}
            {interviews.length > 0 && (
              <div>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",
                  fontWeight:"700",color:"#0b1f3a",margin:"0 0 16px"}}>🩺 Doctor Interviews</h2>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"14px"}}>
                  {interviews.map((v,i)=><VideoCard key={i} item={v} label="Doctor Interview"/>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
