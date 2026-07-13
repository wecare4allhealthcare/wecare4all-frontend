/**
 * Home.jsx — We Care 4 'all'
 * FIXED:
 * - Stats shown ONCE only (in StatsBand, not repeated in hero)
 * - Ticker always visible with dark green background
 * - Hero padding accounts for ticker(38px) + navbar(66px) = 104px
 * - Hospital consultancy blocks added
 * - Google Reviews widget placeholder
 * - Disclaimer section
 * - Scroll animations throughout
 */
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { RoleModal, useRoleBooking } from "../../components/RoleModal";
import { useScrollAnimation, useCountUp } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
:root{
  --green:#047857; --green-l:#059669; --green-bg:#f0fdf4;
  --navy:#0b1f3a; --navy-d:#071524; --navy-m:#112d52;
  --text:#1e293b; --muted:#64748b; --border:#e2eaf4;
  --bg:#f0f6fc; --white:#fff;
  --sh-sm:0 2px 8px rgba(11,31,58,.06);
  --sh-md:0 4px 20px rgba(11,31,58,.09);
  --sh-lg:0 12px 36px rgba(11,31,58,.13);
  --sh-xl:0 20px 60px rgba(11,31,58,.16);
}
.hr{font-family:'DM Sans',sans-serif;color:var(--text);overflow-x:hidden;}
.hr *{box-sizing:border-box;}
.hr a{text-decoration:none;}
.hr h1,.hr h2,.hr h3{font-family:'Cormorant Garamond',Georgia,serif;}

/* ── Ticker — dark green, always visible ── */
.tk-wrap{
  background:#0b4d2e;
  overflow:hidden;
  padding:9px 0;
  white-space:nowrap;
}
.tk-inner{display:inline-flex;animation:ticker 35s linear infinite;white-space:nowrap;}
.tk-item{
  font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;
  color:#ffffff;padding:0 44px;
  border-right:1px solid rgba(255,255,255,.20);
  letter-spacing:.3px;flex-shrink:0;
}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* Mobile background — shown only when video is hidden */
.vh-mobile-bg{
  display:none; /* hidden on desktop */
  position:absolute; inset:0; z-index:0;
  background:linear-gradient(145deg,#071524 0%,#0b2d1a 40%,#0b1f3a 70%,#062818 100%);
}

/* ── Hero video ── */
.vh{
  position:relative;
  min-height:92vh;
  display:flex;align-items:center;
  /* 38px ticker + 66px navbar = 104px total offset */
  padding-top:80px;
  overflow:hidden;
  background:#060f1c;
}
.vh-vid{
  position:absolute;inset:0;width:100%;height:100%;
  object-fit:cover;object-position:center 20%;z-index:0;
  transition:opacity 1.4s ease;
}
/* Overlay: lighter so video is VISIBLE */
.vh-ov{
  position:absolute;inset:0;z-index:1;
  background:linear-gradient(105deg,
    rgba(4,10,20,.80) 0%,
    rgba(4,10,20,.62) 38%,
    rgba(4,18,10,.50) 65%,
    rgba(3,8,15,.32) 100%);
}
/* Extra left-band so text is always readable */
.vh-lb{
  position:absolute;left:0;top:0;bottom:0;width:55%;z-index:1;
  background:linear-gradient(90deg,rgba(3,8,18,.68) 0%,transparent 100%);
}
.vh-dots{
  position:absolute;inset:0;z-index:1;pointer-events:none;
  background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px);
  background-size:40px 40px;
}
.vh-content{position:relative;z-index:2;width:100%;}

/* Hero text entrance */
@keyframes hfu{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
.hfu1{animation:hfu .7s ease .08s both;}
.hfu2{animation:hfu .7s ease .22s both;}
.hfu3{animation:hfu .7s ease .36s both;}
.hfu4{animation:hfu .7s ease .50s both;}
.hfu5{animation:hfu .7s ease .64s both;}

/* Shimmer text */
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
.sh{
  background:linear-gradient(90deg,#34d399,#6ee7b7,#34d399);
  background-size:200% auto;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;animation:shimmer 3s linear infinite;
}

/* Pulse dot */
@keyframes pulseDot{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.5)}50%{box-shadow:0 0 0 8px rgba(16,185,129,0)}}

/* Float */
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.float{animation:floatY 5s ease-in-out infinite;}

/* Wave bottom */
.wave-bot{position:absolute;bottom:0;left:0;right:0;line-height:0;z-index:3;}

/* ── Scroll reveal ── */
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease;}
.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
.stagger.in>*:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.05s}
.stagger.in>*:nth-child(2){opacity:1;transform:translateY(0);transition-delay:.13s}
.stagger.in>*:nth-child(3){opacity:1;transform:translateY(0);transition-delay:.21s}
.stagger.in>*:nth-child(4){opacity:1;transform:translateY(0);transition-delay:.29s}
.stagger.in>*:nth-child(5){opacity:1;transform:translateY(0);transition-delay:.37s}
.stagger.in>*:nth-child(6){opacity:1;transform:translateY(0);transition-delay:.45s}
.stagger.in>*:nth-child(7){opacity:1;transform:translateY(0);transition-delay:.53s}
.stagger.in>*:nth-child(8){opacity:1;transform:translateY(0);transition-delay:.61s}

/* ── Stats band ── */
.sb{display:grid;grid-template-columns:repeat(6,1fr);}
.sb-cell{padding:24px 10px;text-align:center;transition:background .2s;cursor:default;}
.sb-cell:hover{background:rgba(4,120,87,.05);}

/* ── Quick book ── */
.qb-tab{
  border:1.5px solid;font-family:'DM Sans',sans-serif;font-size:13px;
  font-weight:500;cursor:pointer;transition:all .2s;border-radius:50px;
  padding:7px 16px;display:inline-flex;align-items:center;gap:6px;
}

/* ── Cards ── */
.svc-card{transition:transform .28s,box-shadow .28s;}
.svc-card:hover{transform:translateY(-6px);box-shadow:var(--sh-xl)!important;}
.con-card{transition:all .3s;}
.con-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(11,31,58,.13)!important;border-left-width:5px!important;}
.trust-card{transition:all .25s;}
.trust-card:hover{transform:translateY(-4px);background:rgba(255,255,255,.09)!important;border-color:rgba(52,211,153,.3)!important;}
.rev-card{transition:all .28s;}
.rev-card:hover{transform:translateY(-4px);box-shadow:var(--sh-lg)!important;}
.spec-chip{
  border-radius:50px;padding:8px 17px;cursor:pointer;transition:all .2s;
  font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;border:1.5px solid;
}
.spec-chip:hover{background:#0b1f3a!important;color:#fff!important;border-color:#0b1f3a!important;transform:scale(1.04);}

/* ── Buttons ── */
.btn-p{
  display:inline-flex;align-items:center;gap:8px;
  background:linear-gradient(135deg,#047857,#059669);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;
  padding:13px 28px;border-radius:8px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(4,120,87,.40);transition:all .25s;text-decoration:none;
}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(4,120,87,.50);}
.btn-ol{
  display:inline-flex;align-items:center;gap:8px;
  background:rgba(255,255,255,.10);border:1.5px solid rgba(255,255,255,.30);
  color:#fff;font-family:'DM Sans',sans-serif;font-weight:500;font-size:15px;
  padding:13px 26px;border-radius:8px;cursor:pointer;transition:all .25s;text-decoration:none;
}
.btn-ol:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.55);}
.btn-w{
  display:inline-flex;align-items:center;gap:8px;
  background:#fff;color:#065f46;font-family:'DM Sans',sans-serif;
  font-weight:700;font-size:15px;padding:13px 28px;border-radius:8px;
  border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.14);
  transition:all .25s;text-decoration:none;
}
.btn-w:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.20);}

/* ── Disclaimer ── */
.disc{border-left:4px solid #047857;background:linear-gradient(135deg,#fffbeb,#fefce8);border-radius:0 12px 12px 0;}

/* ── Responsive ── */
@media(max-width:960px){
  .hero-cols{grid-template-columns:1fr!important;}
  .hero-right{display:none!important;}
  .g3{grid-template-columns:1fr 1fr!important;}
  .g4{grid-template-columns:1fr 1fr!important;}
  .g2{grid-template-columns:1fr!important;}
  .sb{grid-template-columns:repeat(3,1fr)!important;}
  .cg{grid-template-columns:1fr 1fr!important;}
  .vh{padding-top:76px!important;}
  /* Mobile: hide video for better performance & UI */
  .vh-vid{display:none!important;}
  .vh-mobile-bg{display:block!important;}
}
@media(max-width:600px){
  .g3,.g4,.cg{grid-template-columns:1fr!important;}
  .sb{grid-template-columns:repeat(2,1fr)!important;}
  .vh{min-height:100svh!important;padding-top:72px!important;}
  .vh-vid{display:none!important;}
  .vh-mobile-bg{display:block!important;}
}
`;

/* ── Wrapper ── */
const W = ({ children, s = {} }) => (
  <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px", ...s }}>{children}</div>
);

/* ── Section heading ── */
function SH({ badge, title, sub, dark=false, center=true }) {
  const [ref, vis] = useScrollAnimation();
  return (
    <div ref={ref} className={`reveal${vis?" in":""}`}
      style={{ textAlign:center?"center":"left", marginBottom:"48px" }}>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:"700",
        color: dark?"#6ee7b7":"#047857", letterSpacing:"2px",
        textTransform:"uppercase", marginBottom:"10px" }}>{badge}</p>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif",
        fontSize:"clamp(26px,3.5vw,42px)", fontWeight:"700",
        color: dark?"#fff":"#0b1f3a", margin:"0 0 12px", lineHeight:1.15 }}>{title}</h2>
      {sub && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"16px",
        color: dark?"rgba(255,255,255,.62)":"#64748b",
        maxWidth:"520px", margin:center?"0 auto":"0",
        lineHeight:1.75, fontWeight:"300" }}>{sub}</p>}
    </div>
  );
}

/* ══ TICKER ══ */
function Ticker() {
  const { t } = useTranslation();
  const ticks = Array.isArray(t("home.ticker", { returnObjects: true })) ? t("home.ticker", { returnObjects: true }) : [];
  const items = [...ticks, ...ticks];
  return (
    <div className="tk-wrap">
      <div className="tk-inner">
        {items.map((t, i) => <span key={i} className="tk-item">{t}</span>)}
      </div>
    </div>
  );
}


/* ══ HERO ══ */

function Hero() {
  const { t } = useTranslation();
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const vRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("video");

  const [showRoleModal, setShowRoleModal] = useState(false);
  // Same "Hospital Consultancy" patients are technically role=patient but
  // have no dashboard of their own (see Navbar.jsx / Login.jsx) — don't
  // send them into the real patient booking flow.
  const isHospitalIntent = role === "patient" &&
    (typeof window !== "undefined" && localStorage.getItem("wc4a_login_portal") === "hospital");
  const handleBookingClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate("/login"); return; }
    if (isHospitalIntent) { navigate("/partner-with-us"); return; }
    if (role === "patient") { navigate("/patient/dashboard"); return; }
    // Admin isn't a "wrong account" the way doctor/hospital accounts are
    // here — admin needs to be able to see and click through every page
    // on the site, including the booking flow, without hitting a modal
    // that assumes they've mistakenly logged in with the wrong role.
    if (role === "admin") { navigate("/doctors"); return; }
    setShowRoleModal(true);
  };
  // The Quick-Book widget's "Schedule {tab} →" button used to call
  // handleBookingClick regardless of which tab (Video / In-Person / Home
  // Visit) was selected — so picking "Home Visit" and clicking Schedule
  // still sent a patient to /patient/dashboard and an admin to /doctors
  // instead of to Home Healthcare. This routes by the selected tab.
  const handleScheduleClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) { navigate("/login"); return; }
    if (isHospitalIntent) { navigate("/partner-with-us"); return; }
    if (tab === "home") {
      if (role === "patient" || role === "admin") { navigate("/home-healthcare"); return; }
      setShowRoleModal(true); return;
    }
    if (role === "patient") { navigate("/patient/dashboard"); return; }
    if (role === "admin") { navigate("/doctors"); return; }
    setShowRoleModal(true);
  };
  const tabLabels = Array.isArray(t("home.hero.tabs", { returnObjects: true })) ? t("home.hero.tabs", { returnObjects: true }) : ["Video Consult","In-Person","Home Visit"];
  const TABS = [
    { id:"video",    icon:"🎥", label:tabLabels[0] },
    { id:"inperson", icon:"🏥", label:tabLabels[1] },
    { id:"home",     icon:"🏠", label:tabLabels[2] },
  ];
  const cardItems = Array.isArray(t("home.hero.cardItems", { returnObjects: true })) ? t("home.hero.cardItems", { returnObjects: true }) : [["",""],["",""],["",""]];
  const CARD_ITEMS = [
    { icon:"🎥",label:cardItems[0][0],sub:cardItems[0][1],c:"#38bdf8" },
    { icon:"🏠",label:cardItems[1][0],sub:cardItems[1][1],c:"#10b981" },
    { icon:"🤝",label:cardItems[2][0],sub:cardItems[2][1],c:"#a78bfa" },
  ];
  useEffect(() => { vRef.current?.play().catch(() => {}); }, []);

  return (
    <section className="vh">
      <video ref={vRef} className="vh-vid" autoPlay muted loop playsInline preload="auto"
        onLoadedData={() => setLoaded(true)} style={{ opacity: loaded ? 1 : 0 }}>
        <source src="/assets/video/hero.mp4" type="video/mp4" />
      </video>
      {/* Mobile fallback background (shown when video hidden on mobile) */}
      <div className="vh-mobile-bg" />
      <div className="vh-ov" /><div className="vh-lb" /><div className="vh-dots" />
      {/* Glow */}
      <div style={{ position:"absolute",top:"10%",right:"6%",zIndex:1,pointerEvents:"none",
        width:"420px",height:"420px",borderRadius:"50%",
        background:"radial-gradient(circle,rgba(4,120,87,.18) 0%,transparent 65%)" }} />

      <div className="vh-content">
        <W>
          <div className="hero-cols" style={{ display:"grid", gridTemplateColumns:"1.05fr 0.95fr",
            gap:"52px", alignItems:"center", padding:"24px 0 60px" }}>

            {/* LEFT */}
            <div>
              <div className="hfu1" style={{ display:"inline-flex", alignItems:"center", gap:"8px",
                background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.30)",
                borderRadius:"50px", padding:"7px 16px", marginBottom:"24px" }}>
                <span style={{ width:"7px",height:"7px",background:"#10b981",borderRadius:"50%",
                  display:"block",animation:"pulseDot 2s infinite" }} />
                <span style={{ fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",
                  fontSize:"12px",fontWeight:"600",letterSpacing:".3px" }}>
                  {t("home.hero.badge")}
                </span>
              </div>

              <h1 className="hfu2" style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:"clamp(38px,5vw,66px)", fontWeight:"700", color:"#fff",
                lineHeight:"1.1", marginBottom:"20px", letterSpacing:"-.5px" }}>
                {t("home.hero.title1")}{" "}
                <span className="sh">{t("home.hero.title2")}</span>
                <br />
                <em style={{ fontStyle:"italic", fontSize:".70em",
                  fontWeight:"400", color:"rgba(255,255,255,.75)" }}>{t("home.hero.titleAlways")}</em>
              </h1>

              <p className="hfu3" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"17px",
                color:"rgba(255,255,255,.72)", lineHeight:"1.78",
                marginBottom:"32px", maxWidth:"460px", fontWeight:"300" }}>
                {t("home.hero.subtitle")}
              </p>

              <div className="hfu4" style={{ display:"flex", gap:"13px", flexWrap:"wrap", marginBottom:"38px" }}>
                <button onClick={handleBookingClick} className="btn-p" style={{cursor:"pointer",border:"none"}}>
                  {t("home.hero.bookAppt")}
                </button>
                <Link to="/healthcare-provider" className="btn-ol">{t("home.hero.ourServices")}</Link>
              </div>

              {/* Quick-book */}
              <div className="hfu5" style={{ background:"rgba(255,255,255,.07)",
                border:"1px solid rgba(255,255,255,.12)", borderRadius:"14px",
                padding:"18px", backdropFilter:"blur(14px)" }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"10px", fontWeight:"700",
                  color:"rgba(255,255,255,.40)", letterSpacing:"1.5px",
                  textTransform:"uppercase", marginBottom:"11px" }}>{t("home.hero.quickBook")}</p>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"12px" }}>
                  {TABS.map(tb => (
                    <button key={tb.id} onClick={() => setTab(tb.id)} className="qb-tab" style={{
                      background: tab===tb.id?"rgba(4,120,87,.30)":"transparent",
                      borderColor: tab===tb.id?"#10b981":"rgba(255,255,255,.22)",
                      color: tab===tb.id?"#6ee7b7":"rgba(255,255,255,.65)",
                    }}>{tb.icon} {tb.label}</button>
                  ))}
                </div>
                <button onClick={handleScheduleClick} className="btn-p" style={{display:"flex",justifyContent:"center",borderRadius:"8px",padding:"12px",cursor:"pointer",border:"none",width:"100%"}}>
                  {t("home.hero.schedule")} {TABS.find(tb=>tb.id===tab)?.label} →
                </button>
              </div>
            </div>

            {/* RIGHT card — NO stats (shown in StatsBand) */}
            <div className="hero-right float">
              <div style={{ background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.14)", borderRadius:"20px",
                padding:"26px", backdropFilter:"blur(20px)",
                boxShadow:"0 32px 80px rgba(0,0,0,.45)", position:"relative" }}>

                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", marginBottom:"20px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"36px",height:"36px",
                      background:"linear-gradient(135deg,#047857,#059669)",
                      borderRadius:"9px",display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:"17px" }}>🏥</div>
                    <div>
                      <p style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:"700",color:"#fff",fontSize:"13px",margin:0 }}>We Care 4 'all'</p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",fontSize:"11px",margin:0 }}>{t("home.hero.cardBrand")}</p>
                    </div>
                  </div>
                  <span style={{ background:"rgba(16,185,129,.18)",border:"1px solid rgba(16,185,129,.35)",
                    color:"#6ee7b7",fontSize:"11px",fontWeight:"600",padding:"3px 11px",
                    borderRadius:"50px",fontFamily:"'DM Sans',sans-serif" }}>{t("home.hero.live")}</span>
                </div>

                {CARD_ITEMS.map(({ icon,label,sub,c }) => (
                  <div key={label} style={{ display:"flex",alignItems:"center",gap:"11px",
                    padding:"11px 13px",background:"rgba(255,255,255,.04)",
                    border:"1px solid rgba(255,255,255,.07)",borderRadius:"10px",
                    marginBottom:"8px",cursor:"pointer",transition:"background .2s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.10)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}>
                    <div style={{ width:"36px",height:"36px",background:`${c}18`,
                      border:`1px solid ${c}30`,borderRadius:"9px",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:"17px",flexShrink:0 }}>{icon}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",color:"#fff",margin:0 }}>{label}</p>
                      <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"rgba(255,255,255,.42)",margin:0 }}>{sub}</p>
                    </div>
                    <span style={{ color:c,fontSize:"13px" }}>→</span>
                  </div>
                ))}

                <button onClick={handleBookingClick} style={{display:"block",textAlign:"center",marginTop:"12px",width:"100%",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",padding:"11px",borderRadius:"9px",boxShadow:"0 4px 14px rgba(4,120,87,.40)",border:"none",cursor:"pointer"}}>
                  {t("home.hero.bookNow")}
                </button>

                <div style={{ display:"flex",alignItems:"center",gap:"9px",marginTop:"12px",
                  padding:"10px 13px",background:"rgba(4,120,87,.14)",
                  border:"1px solid rgba(16,185,129,.22)",borderRadius:"9px" }}>
                  <div style={{ width:"28px",height:"28px",background:"#fff",borderRadius:"6px",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    overflow:"hidden",flexShrink:0 }}>
                    <img loading="lazy" src="/assets/img/logo/euro_logo.jpeg" alt="Euro Cert"
                      style={{ width:"24px",height:"24px",objectFit:"contain" }}
                      onError={e=>{e.target.parentElement.innerHTML=`<span style="font-size:7px;font-weight:800;color:#0b1f3a;text-align:center;line-height:1.2">EURO<br/>CERT</span>`;}}/>
                  </div>
                  <p style={{ fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",fontSize:"11px",fontWeight:"600",margin:0 }}>{t("home.hero.euroCertBadge")}</p>
                </div>

                {/* Floating badges */}
                <div style={{ position:"absolute",top:"-14px",right:"-14px",background:"#fff",
                  borderRadius:"11px",padding:"9px 13px",boxShadow:"0 8px 26px rgba(0,0,0,.28)",
                  display:"flex",alignItems:"center",gap:"7px" }}>
                  <div style={{ width:"26px",height:"26px",background:"#0b1f3a",borderRadius:"6px",
                    display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
                    <img loading="lazy" src="/assets/img/logo/euro_logo.jpeg" alt=""
                      style={{ width:"22px",height:"22px",objectFit:"contain" }}
                      onError={e=>{e.target.parentElement.innerHTML=`<span style="font-size:7px;font-weight:800;color:#fff">EC</span>`;}}/>
                  </div>
                  <div>
                    <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"9px",fontWeight:"800",color:"#0b1f3a",margin:0,letterSpacing:".4px" }}>EURO CERT</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"10px",color:"#047857",fontWeight:"700",margin:0 }}>{t("home.hero.euroCertFloat")}</p>
                  </div>
                </div>
                <div style={{ position:"absolute",bottom:"-14px",left:"-14px",background:"#0b1f3a",
                  borderRadius:"11px",padding:"9px 14px",boxShadow:"0 8px 26px rgba(0,0,0,.38)",
                  border:"1px solid rgba(255,255,255,.08)" }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontWeight:"700",color:"#fff",margin:0,lineHeight:1 }}>500+</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"10px",color:"#6ee7b7",fontWeight:"600",margin:0 }}>{t("home.hero.patientsServed")}</p>
                </div>
              </div>
            </div>
          </div>
        </W>
      </div>

      <div className="wave-bot">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display:"block",width:"100%" }}>
          <path d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z" fill="#f0f6fc"/>
        </svg>
      </div>
      {showRoleModal && (
        <RoleModal
          show={true}
          role={role}
          onLogin={() => { setShowRoleModal(false); navigate("/login"); }}
          onCancel={() => setShowRoleModal(false)}
        />
      )}
    </section>
  );
}

/* ══ STATS BAND — shown ONCE here only ══ */
function StatCell({ n, l, ic, c, triggered, last }) {
  const num = useCountUp(n, 1800, triggered);
  const suffix = String(n).replace(/[\d]/g, "");
  return (
    <div className="sb-cell" style={{ borderRight: last ? "none" : "1px solid var(--border)" }}>
      <div style={{ fontSize:"22px", marginBottom:"6px" }}>{ic}</div>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"28px", fontWeight:"700",
        color: c, margin:0, lineHeight:1 }}>
        {triggered ? `${num}${suffix}` : `0${suffix}`}
      </p>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", color:"var(--muted)",
        marginTop:"4px", fontWeight:"500" }}>{l}</p>
    </div>
  );
}
function StatsBand() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation({ threshold:0.3 });
  const labels = Array.isArray(t("home.stats.labels", { returnObjects: true })) ? t("home.stats.labels", { returnObjects: true }) : ["","","","","",""];
  const STATS = [
    { n:"16+",  l:labels[0], ic:"🏆", c:"#047857" },
    { n:"500+", l:labels[1], ic:"❤️",  c:"#0e7490" },
    { n:"50+",  l:labels[2], ic:"🏥", c:"#7c3aed"  },
    { n:"20+",  l:labels[3], ic:"👨‍⚕️",c:"#b45309"  },
    { n:"18+",  l:labels[4], ic:"🔬", c:"#be123c"  },
    { n:"24",   l:labels[5], ic:"⚡", c:"#0369a1"  },
  ];
  return (
    <section ref={ref} style={{ background:"var(--bg)", borderBottom:"1px solid var(--border)" }}>
      <W>
        <div className="sb">
          {STATS.map(({ n,l,ic,c }, i) => (
            <StatCell key={l} n={n} l={l} ic={ic} c={c} triggered={vis} last={i===STATS.length-1} />
          ))}
        </div>
      </W>
    </section>
  );
}

/* ══ SERVICES ══ */
const SVC_META = [
  { ic:"🎥",c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd",link:"/doctors" },
  { ic:"🏠",c:"#047857",bg:"#f0fdf4",bd:"#86efac",link:"/home-healthcare" },
  { ic:"🌍",c:"#be123c",bg:"#fff1f2",bd:"#fecdd3",link:"/international-patients" },
  { ic:"🤝",c:"#b45309",bg:"#fffbeb",bd:"#fde68a",link:"/corporate-wellness" },
];
function Services() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  const { showModal, handleGatedNavigate, closeModal, role, navigate } = useRoleBooking();
  const titles = Array.isArray(t("home.services.titles", { returnObjects: true })) ? t("home.services.titles", { returnObjects: true }) : [];
  const descs = Array.isArray(t("home.services.descs", { returnObjects: true })) ? t("home.services.descs", { returnObjects: true }) : [];
  const SVCS = SVC_META.map((m,i) => ({ ...m, t:titles[i], d:descs[i], link:m.link }));
  return (
    <section style={{ background:"#fff", padding:"80px 0" }}>
      <W>
        <SH badge={t("home.services.eyebrow")} title={t("home.services.heading")}
          sub={t("home.services.sub")} />
        <div ref={ref} className={`g4 stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"22px" }}>
          {SVCS.map(({ ic,t:title,c,bg,bd,d,link }) => (
            <div key={title} className="svc-card" style={{ background:bg,
              border:`1px solid ${bd}`, borderRadius:"16px", padding:"26px 22px",
              boxShadow:"var(--sh-sm)" }}>
              <div style={{ width:"52px",height:"52px",background:`${c}18`,
                border:`1.5px solid ${c}38`,borderRadius:"13px",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"22px",marginBottom:"16px" }}>{ic}</div>
              <h3 style={{ fontSize:"19px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 9px" }}>{title}</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
                lineHeight:"1.72",margin:"0 0 14px",fontWeight:"300" }}>{d}</p>
              <a href={link} onClick={(e)=>handleGatedNavigate(e, link)}
                style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
                  color:c,textDecoration:"none",cursor:"pointer" }}>{t("home.services.learnMore")}</a>
            </div>
          ))}
        </div>
      </W>
      <RoleModal show={showModal} role={role}
        onLogin={()=>{closeModal();navigate("/login");}}
        onCancel={closeModal}/>
    </section>
  );
}

/* ══ HOSPITAL CONSULTANCY BLOCKS ══ */
const CONSULT_META = [
  { ic:"🏗️",c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd" },
  { ic:"📣",c:"#7c3aed",bg:"#faf5ff",bd:"#ddd6fe" },
  { ic:"⚙️",c:"#047857",bg:"#f0fdf4",bd:"#86efac" },
  { ic:"🏦",c:"#b45309",bg:"#fffbeb",bd:"#fde68a" },
  { ic:"🏢",c:"#0e7490",bg:"#ecfeff",bd:"#a5f3fc" },
  { ic:"💰",c:"#be123c",bg:"#fff1f2",bd:"#fecdd3" },
  { ic:"📋",c:"#6d28d9",bg:"#faf5ff",bd:"#ddd6fe" },
  { ic:"✈️",c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd" },
];
function HospitalConsultancy() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  const titles    = Array.isArray(t("home.consult.titles",    { returnObjects: true }))
    ? t("home.consult.titles",    { returnObjects: true }) : [];
  const itemLists = Array.isArray(t("home.consult.items",     { returnObjects: true }))
    ? t("home.consult.items",     { returnObjects: true }) : [];
  const CONSULT = CONSULT_META.map((m,i) => ({
    ...m,
    t:     titles[i]    || "",
    items: Array.isArray(itemLists[i]) ? itemLists[i] : [],
  }));
  return (
    <section style={{ background:"var(--bg)", padding:"80px 0" }}>
      <W>
        <SH badge={t("home.consult.eyebrow")} title={t("home.consult.heading")}
          sub={t("home.consult.sub")} />
        <div ref={ref} className={`cg stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"18px" }}>
          {CONSULT.map(({ ic,t:title,c,bg,bd,items }) => (
            <div key={title} className="con-card" style={{ background:bg,
              border:`1px solid ${bd}`, borderLeft:`4px solid ${c}`,
              borderRadius:"12px", padding:"20px 17px", boxShadow:"var(--sh-sm)" }}>
              <div style={{ fontSize:"26px", marginBottom:"10px" }}>{ic}</div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"16px",
                fontWeight:"700", color:"#0b1f3a", margin:"0 0 11px", lineHeight:"1.3" }}>{title}</h3>
              <ul style={{ paddingLeft:"16px", margin:"0 0 13px" }}>
                {items.map(item => (
                  <li key={item} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                    color:"#64748b", marginBottom:"5px", lineHeight:"1.6" }}>{item}</li>
                ))}
              </ul>
              <Link to="/partner-with-us" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                fontWeight:"600", color:c }}>{t("home.consult.viewMore")}</Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"36px" }}>
          <Link to="/healthcare-provider" className="btn-p">{t("home.consult.exploreAll")}</Link>
        </div>
      </W>
    </section>
  );
}

/* ══ SPECIALTIES ══ */
function Specialties() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  const SPECS = Array.isArray(t("hp.specs.names", { returnObjects: true }))
    ? t("hp.specs.names", { returnObjects: true })
    : [];
  return (
    <section style={{ background:"#fff", padding:"72px 0" }}>
      <W>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-end", marginBottom:"32px", flexWrap:"wrap", gap:"14px" }}>
          <div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:"700",
              color:"#047857", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>{t("home.specs.eyebrow")}</p>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif",
              fontSize:"clamp(22px,3vw,36px)", fontWeight:"700", color:"#0b1f3a", margin:0 }}>
              {t("home.specs.heading")}
            </h2>
          </div>
          <Link to="/healthcare-provider" style={{ fontFamily:"'DM Sans',sans-serif",
            fontSize:"14px", fontWeight:"600", color:"#047857" }}>{t("home.specs.viewAll")}</Link>
        </div>
        <div ref={ref} style={{ display:"flex", flexWrap:"wrap", gap:"9px",
          opacity: vis?1:0, transform: vis?"translateY(0)":"translateY(20px)",
          transition:"opacity .7s ease,transform .7s ease" }}>
          {SPECS.map((s,i) => (
            <button key={s} className="spec-chip" style={{
              background: i%3===0?"#0b1f3a":i%3===1?"#047857":"#fff",
              color: i%3===2?"#0b1f3a":"#fff",
              borderColor: i%3===2?"#d1dce8":"transparent",
              boxShadow: i%3===2?"var(--sh-sm)":"none",
            }}>{s}</button>
          ))}
        </div>
      </W>
    </section>
  );
}



/* ══ SMART BOOK BUTTON — routes by role ══ */
function SmartBookButton({ className, label, style }) {
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  // Same "Hospital Consultancy" patients are technically role=patient but
  // have no dashboard of their own (see Navbar.jsx / Login.jsx) — don't
  // send them into the real patient booking flow.
  const isHospitalIntent = role === "patient" &&
    (typeof window !== "undefined" && localStorage.getItem("wc4a_login_portal") === "hospital");
  const handleClick = () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (isHospitalIntent) { navigate("/partner-with-us"); return; }
    if (role === "patient") { navigate("/patient/dashboard"); return; }
    setShowModal(true);
  };
  return (
    <>
      <button onClick={handleClick} className={className} style={{cursor:"pointer",border:"none",...style}}>{label}</button>
      {showModal && (
        <RoleModal
          show={true}
          role={role}
          onLogin={() => { setShowModal(false); navigate("/login"); }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
}

/* ══ HOW IT WORKS ══ */
function HowItWorks() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  const titles = Array.isArray(t("home.how.titles", { returnObjects: true })) ? t("home.how.titles", { returnObjects: true }) : [];
  const descs = Array.isArray(t("home.how.descs", { returnObjects: true })) ? t("home.how.descs", { returnObjects: true }) : [];
  const icons = ["🔐","🔍","📅","💬"];
  const STEPS = ["01","02","03","04"].map((n,i) => ({ n, ic:icons[i], t:titles[i], d:descs[i] }));
  return (
    <section style={{ background:"var(--bg)", padding:"80px 0" }}>
      <W>
        <SH badge={t("home.how.eyebrow")} title={t("home.how.heading")} sub={t("home.how.sub")} />
        <div ref={ref} className={`g4 stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"26px" }}>
          {STEPS.map(({ n,ic,t:title,d }) => (
            <div key={n} style={{ textAlign:"center" }}>
              <div style={{ width:"70px",height:"70px",
                background:"linear-gradient(135deg,#0b1f3a,#112d52)",
                borderRadius:"18px",display:"flex",alignItems:"center",
                justifyContent:"center",margin:"0 auto 14px",
                boxShadow:"0 8px 24px rgba(11,31,58,.25)",fontSize:"26px",
                transition:"transform .3s" }}
                onMouseEnter={e=>e.currentTarget.style.transform="rotate(-5deg) scale(1.1)"}
                onMouseLeave={e=>e.currentTarget.style.transform=""}>{ic}</div>
              <span style={{ display:"inline-block",background:"#dcfce7",color:"#047857",
                fontSize:"10px",fontWeight:"700",padding:"2px 10px",borderRadius:"50px",
                marginBottom:"9px",fontFamily:"'DM Sans',sans-serif" }}>{t("home.how.step")} {n}</span>
              <h3 style={{ fontSize:"17px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 7px" }}>{title}</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
                lineHeight:"1.72",margin:0,fontWeight:"300" }}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"40px" }}>
          <SmartBookButton className="btn-p" label={t("home.how.getStarted")} />
        </div>
      </W>
    </section>
  );
}

/* ══ TRUST ══ */
const TRUST_ICONS = ["🏅","🔒","👩‍⚕️","🌐","📱","⚡"];
function TrustSection() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  const titles = Array.isArray(t("home.trust.titles", { returnObjects: true })) ? t("home.trust.titles", { returnObjects: true }) : [];
  const descs = Array.isArray(t("home.trust.descs", { returnObjects: true })) ? t("home.trust.descs", { returnObjects: true }) : [];
  const TRUST = TRUST_ICONS.map((ic,i) => ({ ic, t:titles[i], d:descs[i] }));
  return (
    <section style={{ background:"linear-gradient(160deg,#071524,#0b1f3a 55%,#062818)",
      padding:"80px 0", position:"relative" }}>
      <div style={{ position:"absolute",inset:0,
        backgroundImage:"radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)",
        backgroundSize:"36px 36px",pointerEvents:"none" }} />
      <W>
        <SH badge={t("home.trust.eyebrow")} title={t("home.trust.heading")}
          sub={t("home.trust.sub")} dark />
        <div ref={ref} className={`g3 stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"18px" }}>
          {TRUST.map(({ ic,t:title,d }) => (
            <div key={title} className="trust-card" style={{ background:"rgba(255,255,255,.05)",
              border:"1px solid rgba(255,255,255,.08)", borderRadius:"14px", padding:"22px" }}>
              <div style={{ fontSize:"30px", marginBottom:"11px" }}>{ic}</div>
              <h3 style={{ fontSize:"18px",fontWeight:"700",color:"#fff",margin:"0 0 7px" }}>{title}</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"rgba(255,255,255,.55)",lineHeight:"1.72",margin:0,fontWeight:"300" }}>{d}</p>
            </div>
          ))}
        </div>
      </W>
    </section>
  );
}

/* ══ GOOGLE REVIEWS ══ */
function Reviews() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  // Real, verifiable facts — not fabricated testimonial quotes. The
  // Elfsight Google Reviews widget this section used to show has been
  // removed: its free-tier view quota was exhausted (throwing 20+
  // console errors on every page load), and since there's no Google
  // Business Profile set up yet either, it had nothing real to show in
  // the first place. Swap this out for real patient testimonials once
  // GBP is live and reviews start coming in.
  const POINTS = [
    { icon: "🩺", label: "Every doctor is credential-verified", sub: "Registration numbers confirmed by our clinical team" },
    { icon: "🏥", label: "50+ partner hospitals", sub: "Accredited institutions across India" },
    { icon: "🔒", label: "End-to-end data privacy", sub: "Your health records are never sold or shared" },
    { icon: "⏱️", label: "Fast, real response times", sub: "Doctors accept video requests in minutes, not hours" },
  ];
  return (
    <section style={{ background:"#f8fafc", padding:"80px 0" }}>
      <W>
        <SH badge={t("home.reviews.eyebrow")} title={t("home.reviews.heading")}
          sub={t("home.reviews.sub")} />
        <div ref={ref}
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity .7s ease, transform .7s ease",
            display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "18px",
          }}
        >
          {POINTS.map(p => (
            <div key={p.label} style={{ background:"#fff", border:"1px solid #e2eaf4",
              borderRadius:"16px", padding:"26px 22px", boxShadow:"var(--sh-sm)" }}>
              <div style={{ fontSize:"28px", marginBottom:"14px" }}>{p.icon}</div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"15px", fontWeight:"700",
                color:"#0b1f3a", margin:"0 0 6px", lineHeight:1.4 }}>{p.label}</p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", color:"#64748b",
                lineHeight:1.6, margin:0, fontWeight:"300" }}>{p.sub}</p>
            </div>
          ))}
        </div>
      </W>
    </section>
  );
}

/* ══ DISCLAIMER ══ */
function Disclaimer() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"var(--bg)", padding:"52px 0" }}>
      <W>
        <div ref={ref} className={`reveal${vis?" in":""}`}>
          <div className="disc" style={{ padding:"26px 30px" }}>
            <div style={{ display:"flex",alignItems:"flex-start",gap:"15px" }}>
              <div style={{ width:"42px",height:"42px",background:"#fef9c3",
                border:"1.5px solid #fde047",borderRadius:"10px",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"20px",flexShrink:0 }}>⚖️</div>
              <div>
                <h4 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
                  fontWeight:"700",color:"#0b1f3a",margin:"0 0 9px" }}>{t("home.disclaimer.heading")}</h4>
                <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",
                  lineHeight:"1.78",margin:"0 0 10px",fontWeight:"300" }}>
                  {t("home.disclaimer.body")}
                </p>
                <a href="/assets/WeCare4All_Compliance_Consent.pdf" target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color:"#047857",fontWeight:"600",textDecoration:"underline" }}>
                  {t("home.disclaimer.download")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </W>
    </section>
  );
}

/* ══ CTA ══ */
function CTA() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"linear-gradient(135deg,#065f46,#047857,#059669)",
      padding:"78px 28px", textAlign:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",top:"-80px",left:"50%",transform:"translateX(-50%)",
        width:"700px",height:"350px",background:"rgba(255,255,255,.06)",
        borderRadius:"50%",pointerEvents:"none" }} />
      <div ref={ref} className={`reveal${vis?" in":""}`}
        style={{ position:"relative", maxWidth:"580px", margin:"0 auto" }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
          color:"rgba(255,255,255,.65)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"16px" }}>
          {t("home.cta.eyebrow")}
        </p>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(28px,4vw,48px)",fontWeight:"700",color:"#fff",
          margin:"0 0 16px",lineHeight:"1.12" }}>
          {t("home.cta.heading")}
        </h2>
        <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"16px",
          color:"rgba(255,255,255,.78)",marginBottom:"36px",lineHeight:1.7,fontWeight:"300" }}>
          {t("home.cta.subtitle")}
        </p>
        <div style={{ display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap" }}>
          <SmartBookButton className="btn-w" label={t("home.cta.bookBtn")} />
          <Link to="/contact" className="btn-ol">{t("home.cta.contactTeam")}</Link>
        </div>
      </div>
    </section>
  );
}

/* ══ MAIN ══ */

// Static — hoisted out of the component so it's never recreated on
// re-render (an inline object literal here made SEO's meta-tag effect
// re-fire on every re-render — see SEO.jsx for the full story).
const HOME_JSONLD = {
  "@type": "MedicalBusiness",
  "name": "We Care 4 'all'",
  "description": "Healthcare consultancy connecting patients with verified specialist doctors and accredited partner hospitals for video consultations, home healthcare, and in-person appointments.",
  "url": "https://www.wecare4all.in/",
  "telephone": "+91-90257-86467",
  "email": "wecare4allchennai@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Block K, No.31, Kanchi Colony, South Boag Road",
    "addressLocality": "T.Nagar, Chennai",
    "addressRegion": "Tamil Nadu",
    "postalCode": "600017",
    "addressCountry": "IN",
  },
  "areaServed": "Chennai, Tamil Nadu, India",
  // Same placeholder caveat as Contact.jsx — these are only an
  // approximate T.Nagar-area centroid. See the longer note in
  // Contact.jsx (CONTACT_JSONLD) for exactly how to get your real pin;
  // once you update it there, update this one to match.
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 13.0418,
    "longitude": 80.2341,
  },
  "medicalSpecialty": [
    "Cardiology", "Orthopaedics", "Gynaecology", "Paediatrics",
    "Dermatology", "Neurology", "General Medicine",
  ],
  "sameAs": [],
};

export default function Home() {
  return (
    <>
      <SEO
        title="Best Doctors & Hospitals in Chennai — Book Online Consultation"
        path="/"
        description="We Care 4 'all' connects you with verified specialist doctors and 50+ trusted partner hospitals across Chennai. Book video consultations, home healthcare visits, or in-person appointments — trusted healthcare consultancy for patients and international medical tourism."
        jsonLd={HOME_JSONLD}
      />
      <style>{G}</style>
      <Ticker />
      <Hero />
      <StatsBand />
      <HospitalLogoStrip />
      <Services />
      <HospitalConsultancy />
      <Specialties />
      <HowItWorks />
      <TrustSection />
      <Reviews />
      <Disclaimer />
      <CTA />
    </>
  );
}

/* ══ HOSPITAL PARTNER SHOWCASE STRIP ══ */
function HospitalLogoStrip() {
  const [hospitals, setHospitals] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/empanelment/partner-hospitals`);
        const json = await res.json();
        const paid = (json.hospitals || [])
          .filter(h => h.tier === "strategic" || h.tier === "growth")
          .sort((a, b) => (a.tier === "strategic" ? 0 : 1) - (b.tier === "strategic" ? 0 : 1));
        setHospitals(paid);
      } catch { setHospitals([]); }
    })();
  }, []);

  if (!hospitals || hospitals.length === 0) return null;

  const doubled = [...hospitals, ...hospitals, ...hospitals];

  return (
    <section style={{
      background:"linear-gradient(180deg,#07192f 0%,#071627 100%)",
      position:"relative",overflow:"hidden",
    }}>
      <style>{`
        .hs-track{
          display:flex;gap:16px;
          animation:hs-scroll 40s linear infinite;
          width:max-content;
        }
        .hs-track:hover{ animation-play-state:paused; }
        @keyframes hs-scroll{
          0%  { transform:translateX(0); }
          100%{ transform:translateX(-33.333%); }
        }
        .hs-pill{
          display:flex;align-items:center;gap:12px;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.07);
          border-radius:16px;padding:12px 16px;
          min-width:200px;max-width:240px;
          cursor:pointer;flex-shrink:0;
          transition:background .2s,border-color .2s;
          text-decoration:none;
        }
        .hs-pill:hover{
          background:rgba(255,255,255,.07);
          border-color:rgba(255,255,255,.15);
        }
        .hs-fade-l,.hs-fade-r{
          position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none;
        }
        .hs-fade-l{ left:0;background:linear-gradient(90deg,#07192f,transparent); }
        .hs-fade-r{ right:0;background:linear-gradient(270deg,#07192f,transparent); }
      `}</style>

      <div style={{
        padding:"22px 24px 16px",
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"2px",
            background:"linear-gradient(90deg,#34d399,transparent)"}}/>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10.5px",fontWeight:"700",
            color:"rgba(52,211,153,.85)",letterSpacing:"2.5px",
            textTransform:"uppercase",margin:0}}>
            Verified Partner Hospitals
          </p>
          <div style={{width:"32px",height:"2px",
            background:"linear-gradient(90deg,transparent,#34d399)"}}/>
        </div>
        <a href="/our-hospitals" style={{
          display:"inline-flex",alignItems:"center",gap:"6px",
          fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
          color:"#34d399",textDecoration:"none",
          border:"1px solid rgba(52,211,153,.3)",
          padding:"6px 16px",borderRadius:"50px",
          background:"rgba(52,211,153,.06)",
          transition:"all .2s",
        }}>
          View All →
        </a>
      </div>

      {/* Marquee */}
      <div style={{position:"relative",overflow:"hidden",paddingBottom:"22px"}}>
        <div className="hs-fade-l"/>
        <div className="hs-fade-r"/>
        <div className="hs-track">
          {doubled.map((h, i) => {
            const photo    = h.photos?.[0] || null;
            const banner   = h.banners?.[0]?.url || h.banners?.[0] || null;
            const heroImg  = photo || banner;
            const initial  = (h.hospital_name || "H")[0].toUpperCase();
            const isStrat  = h.tier === "strategic";
            const specs    = h.specialties || [];
            const hasVideo = isStrat && ((h.videos?.length || 0) > 0 || (h.doctor_interviews?.length || 0) > 0);
            const avatarSize = isStrat ? "60px" : "52px";

            return (
              <a key={`${h.id}-${i}`} className="hs-pill"
                href={`/our-hospitals/${h.id}`} style={{textDecoration:"none"}}>

                {/* Avatar */}
                <div style={{
                  width:avatarSize,height:avatarSize,borderRadius:"14px",flexShrink:0,
                  overflow:"hidden",position:"relative",
                  border: isStrat
                    ? "2px solid rgba(59,130,246,.6)"
                    : "2px solid rgba(52,211,153,.4)",
                  boxShadow: isStrat
                    ? "0 0 0 1px rgba(59,130,246,.2),0 4px 16px rgba(0,0,0,.3)"
                    : "0 0 0 1px rgba(52,211,153,.15),0 4px 16px rgba(0,0,0,.3)",
                  background: heroImg
                    ? `url(${heroImg}) center/cover`
                    : isStrat
                      ? "linear-gradient(135deg,#1e3a8a,#3b82f6)"
                      : "linear-gradient(135deg,#064e3b,#10b981)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  {!heroImg && (
                    <>
                      <div style={{position:"absolute",inset:0,opacity:.5,
                        backgroundImage:"repeating-linear-gradient(135deg,rgba(255,255,255,.09) 0 2px,transparent 2px 9px)"}}/>
                      <span style={{position:"relative",fontSize:"20px",filter:"drop-shadow(0 1px 2px rgba(0,0,0,.25))"}}>🏥</span>
                      <span style={{position:"absolute",bottom:"3px",right:"4px",
                        fontFamily:"'DM Sans',sans-serif",fontSize:"10px",fontWeight:"800",
                        color:"rgba(255,255,255,.75)"}}>{initial}</span>
                    </>
                  )}
                  {hasVideo && (
                    <div style={{position:"absolute",inset:0,background:"rgba(11,31,58,.3)",
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"rgba(255,255,255,.92)",
                        display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:"10px",marginLeft:"1px"}}>▶</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                    fontSize:"13px",color:"#fff",margin:"0 0 3px",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {h.hospital_name || "Partner Hospital"}
                  </p>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
                    <span style={{
                      display:"inline-flex",alignItems:"center",gap:"3px",
                      fontFamily:"'DM Sans',sans-serif",fontSize:"9.5px",fontWeight:"700",
                      color: isStrat ? "#93c5fd" : "#34d399",
                      background: isStrat ? "rgba(59,130,246,.12)" : "rgba(52,211,153,.1)",
                      border: isStrat ? "1px solid rgba(59,130,246,.25)" : "1px solid rgba(52,211,153,.2)",
                      padding:"2px 7px",borderRadius:"50px",
                    }}>
                      {isStrat ? "★ Strategic" : "✦ Growth"}
                    </span>
                    {hasVideo && (
                      <span style={{
                        display:"inline-flex",alignItems:"center",gap:"3px",
                        fontFamily:"'DM Sans',sans-serif",fontSize:"9.5px",fontWeight:"700",
                        color:"#93c5fd",
                      }}>
                        ▶ Watch
                      </span>
                    )}
                    {specs[0] && (
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                        color:"rgba(255,255,255,.38)",
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                        maxWidth:"90px"}}>
                        {specs[0]}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Bottom glow line */}
      <div style={{height:"1px",background:
        "linear-gradient(90deg,transparent,rgba(52,211,153,.3),transparent)"}}/>
    </section>
  );
}
