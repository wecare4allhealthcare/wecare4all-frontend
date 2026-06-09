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
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useScrollAnimation, useCountUp } from "../../hooks/useScrollAnimation";

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
  position:relative;
  z-index:1000;
  /* Ticker is ABOVE navbar */
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
const TICKS = [
  "📞 24×7 Helpline: 90257 86467","🏥 50+ Partner Hospitals",
  "✅ Euro Cert International Quality Certified","🎥 Video Consultations Available Now",
  "🏠 Home Healthcare — Nurse · Physio · Lab at Door","💊 18+ Medical Specialties",
  "🌍 International Patient Coordination — UAE · UK · USA",
];
function Ticker() {
  const items = [...TICKS, ...TICKS];
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
  const { isLoggedIn } = useAuth();
  const vRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("video");
  const TABS = [
    { id:"video",    icon:"🎥", label:"Video Consult" },
    { id:"inperson", icon:"🏥", label:"In-Person"     },
    { id:"home",     icon:"🏠", label:"Home Visit"    },
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
                  Euro Cert Certified · Trusted Since 2009
                </span>
              </div>

              <h1 className="hfu2" style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:"clamp(38px,5vw,66px)", fontWeight:"700", color:"#fff",
                lineHeight:"1.1", marginBottom:"20px", letterSpacing:"-.5px" }}>
                Your Health,{" "}
                <span className="sh">Our Priority.</span>
                <br />
                <em style={{ fontStyle:"italic", fontSize:".70em",
                  fontWeight:"400", color:"rgba(255,255,255,.75)" }}>Always.</em>
              </h1>

              <p className="hfu3" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"17px",
                color:"rgba(255,255,255,.72)", lineHeight:"1.78",
                marginBottom:"32px", maxWidth:"460px", fontWeight:"300" }}>
                Connecting patients with verified specialists, trusted hospitals
                and home healthcare professionals — one secure, compassionate platform.
              </p>

              <div className="hfu4" style={{ display:"flex", gap:"13px", flexWrap:"wrap", marginBottom:"38px" }}>
                <Link to={isLoggedIn?"/patient/dashboard":"/login"} className="btn-p">
                  Book Appointment →
                </Link>
                <Link to="/healthcare-provider" className="btn-ol">Our Services</Link>
              </div>

              {/* Quick-book */}
              <div className="hfu5" style={{ background:"rgba(255,255,255,.07)",
                border:"1px solid rgba(255,255,255,.12)", borderRadius:"14px",
                padding:"18px", backdropFilter:"blur(14px)" }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"10px", fontWeight:"700",
                  color:"rgba(255,255,255,.40)", letterSpacing:"1.5px",
                  textTransform:"uppercase", marginBottom:"11px" }}>Quick Book</p>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"12px" }}>
                  {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className="qb-tab" style={{
                      background: tab===t.id?"rgba(4,120,87,.30)":"transparent",
                      borderColor: tab===t.id?"#10b981":"rgba(255,255,255,.22)",
                      color: tab===t.id?"#6ee7b7":"rgba(255,255,255,.65)",
                    }}>{t.icon} {t.label}</button>
                  ))}
                </div>
                <Link to="/login" className="btn-p" style={{ display:"flex", justifyContent:"center",
                  borderRadius:"8px", padding:"12px" }}>
                  Schedule {TABS.find(t=>t.id===tab)?.label} →
                </Link>
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
                      <p style={{ fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",fontSize:"11px",margin:0 }}>Healthcare Platform</p>
                    </div>
                  </div>
                  <span style={{ background:"rgba(16,185,129,.18)",border:"1px solid rgba(16,185,129,.35)",
                    color:"#6ee7b7",fontSize:"11px",fontWeight:"600",padding:"3px 11px",
                    borderRadius:"50px",fontFamily:"'DM Sans',sans-serif" }}>● Live</span>
                </div>

                {[
                  { icon:"🎥",label:"Video Consultation",sub:"Available now",   c:"#38bdf8" },
                  { icon:"🏠",label:"Home Healthcare",    sub:"Book a visit",   c:"#10b981" },
                  { icon:"🤝",label:"Hospital Network",   sub:"50+ partners",   c:"#a78bfa" },
                ].map(({ icon,label,sub,c }) => (
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

                <Link to="/login" style={{ display:"block",textAlign:"center",marginTop:"12px",
                  background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",
                  padding:"11px",borderRadius:"9px",
                  boxShadow:"0 4px 14px rgba(4,120,87,.40)" }}>
                  Book Appointment Now →
                </Link>

                <div style={{ display:"flex",alignItems:"center",gap:"9px",marginTop:"12px",
                  padding:"10px 13px",background:"rgba(4,120,87,.14)",
                  border:"1px solid rgba(16,185,129,.22)",borderRadius:"9px" }}>
                  <div style={{ width:"28px",height:"28px",background:"#fff",borderRadius:"6px",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    overflow:"hidden",flexShrink:0 }}>
                    <img src="/assets/img/logo/euro_logo.jpeg" alt="Euro Cert"
                      style={{ width:"24px",height:"24px",objectFit:"contain" }}
                      onError={e=>{e.target.parentElement.innerHTML=`<span style="font-size:7px;font-weight:800;color:#0b1f3a;text-align:center;line-height:1.2">EURO<br/>CERT</span>`;}}/>
                  </div>
                  <p style={{ fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",fontSize:"11px",fontWeight:"600",margin:0 }}>✓ Euro Cert Certified</p>
                </div>

                {/* Floating badges */}
                <div style={{ position:"absolute",top:"-14px",right:"-14px",background:"#fff",
                  borderRadius:"11px",padding:"9px 13px",boxShadow:"0 8px 26px rgba(0,0,0,.28)",
                  display:"flex",alignItems:"center",gap:"7px" }}>
                  <div style={{ width:"26px",height:"26px",background:"#0b1f3a",borderRadius:"6px",
                    display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
                    <img src="/assets/img/logo/euro_logo.jpeg" alt=""
                      style={{ width:"22px",height:"22px",objectFit:"contain" }}
                      onError={e=>{e.target.parentElement.innerHTML=`<span style="font-size:7px;font-weight:800;color:#fff">EC</span>`;}}/>
                  </div>
                  <div>
                    <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"9px",fontWeight:"800",color:"#0b1f3a",margin:0,letterSpacing:".4px" }}>EURO CERT</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"10px",color:"#047857",fontWeight:"700",margin:0 }}>✓ Verified</p>
                  </div>
                </div>
                <div style={{ position:"absolute",bottom:"-14px",left:"-14px",background:"#0b1f3a",
                  borderRadius:"11px",padding:"9px 14px",boxShadow:"0 8px 26px rgba(0,0,0,.38)",
                  border:"1px solid rgba(255,255,255,.08)" }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontWeight:"700",color:"#fff",margin:0,lineHeight:1 }}>500+</p>
                  <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"10px",color:"#6ee7b7",fontWeight:"600",margin:0 }}>Patients Served</p>
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
  const [ref, vis] = useScrollAnimation({ threshold:0.3 });
  const STATS = [
    { n:"16+",  l:"Years Active",      ic:"🏆", c:"#047857" },
    { n:"500+", l:"Patients Served",   ic:"❤️",  c:"#0e7490" },
    { n:"50+",  l:"Partner Hospitals", ic:"🏥", c:"#7c3aed"  },
    { n:"20+",  l:"Specialist Doctors",ic:"👨‍⚕️",c:"#b45309"  },
    { n:"18+",  l:"Specializations",   ic:"🔬", c:"#be123c"  },
    { n:"24",   l:"Support /7",        ic:"⚡", c:"#0369a1"  },
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
const SVCS = [
  { ic:"🎥",t:"Video Consultation",    c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd",d:"Consult verified specialists via secure HD video. Same-day slots. Digital prescriptions delivered instantly." },
  { ic:"🏥",t:"Hospital Consultancy",  c:"#7c3aed",bg:"#faf5ff",bd:"#ddd6fe",d:"Accreditation, insurance empanelment, corporate tie-ups and branding strategy for hospitals." },
  { ic:"🏠",t:"Home Healthcare",       c:"#047857",bg:"#f0fdf4",bd:"#86efac",d:"Physiotherapists, nurses and lab technicians at your doorstep. Scheduled, insured, verified." },
  { ic:"🌍",t:"International Patients",c:"#be123c",bg:"#fff1f2",bd:"#fecdd3",d:"End-to-end medical travel — specialists, visa letters, accommodation, airport transfers." },
  { ic:"🤝",t:"Hospital Partnership",  c:"#b45309",bg:"#fffbeb",bd:"#fde68a",d:"Three-tier partner programme — Basic, Growth and Strategic — each with unique visibility." },
  { ic:"🏢",t:"Corporate Health",      c:"#0e7490",bg:"#ecfeff",bd:"#a5f3fc",d:"Employee wellness packages and preventive health programmes for enterprises." },
];
function Services() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"#fff", padding:"80px 0" }}>
      <W>
        <SH badge="What We Offer" title="Comprehensive Healthcare Services"
          sub="From your living room to a specialist's clinic — the right care at the right time" />
        <div ref={ref} className={`g3 stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"22px" }}>
          {SVCS.map(({ ic,t,c,bg,bd,d }) => (
            <div key={t} className="svc-card" style={{ background:bg,
              border:`1px solid ${bd}`, borderRadius:"16px", padding:"26px 22px",
              boxShadow:"var(--sh-sm)" }}>
              <div style={{ width:"52px",height:"52px",background:`${c}18`,
                border:`1.5px solid ${c}38`,borderRadius:"13px",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"22px",marginBottom:"16px" }}>{ic}</div>
              <h3 style={{ fontSize:"19px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 9px" }}>{t}</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
                lineHeight:"1.72",margin:"0 0 14px",fontWeight:"300" }}>{d}</p>
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",color:c }}>Learn More →</span>
            </div>
          ))}
        </div>
      </W>
    </section>
  );
}

/* ══ HOSPITAL CONSULTANCY BLOCKS ══ */
const CONSULT = [
  { ic:"🏗️",t:"Hospital Planning & Management",c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd",
    items:["Feasibility studies & market analysis","Infrastructure & department planning","Workflow & SOP optimisation","Equipment planning & coordination"] },
  { ic:"📣",t:"Branding & Marketing",           c:"#7c3aed",bg:"#faf5ff",bd:"#ddd6fe",
    items:["Hospital branding & positioning","Digital marketing & SEO","Patient acquisition strategies","Online reputation management"] },
  { ic:"⚙️",t:"Operational Efficiency",         c:"#047857",bg:"#f0fdf4",bd:"#86efac",
    items:["OPD, IPD & discharge optimisation","Staff productivity enhancement","Inventory & pharmacy management","Cost reduction strategies"] },
  { ic:"🏦",t:"Insurance Empanelment",           c:"#b45309",bg:"#fffbeb",bd:"#fde68a",
    items:["TPA & insurance empanelment","Cashless workflow setup","Claim documentation guidance","Delay & dispute reduction"] },
  { ic:"🏢",t:"Corporate Tie-Ups",              c:"#0e7490",bg:"#ecfeff",bd:"#a5f3fc",
    items:["Employee healthcare partnerships","Corporate health check programmes","Annual medical contracts","Industrial healthcare alliances"] },
  { ic:"💰",t:"Revenue Cycle Management",       c:"#be123c",bg:"#fff1f2",bd:"#fecdd3",
    items:["Billing optimisation","Payment delay reduction","Revenue leakage audit","MIS & financial reporting"] },
  { ic:"📋",t:"Accreditation & Compliance",     c:"#6d28d9",bg:"#faf5ff",bd:"#ddd6fe",
    items:["NABH & JCI preparation","Documentation & SOPs","Staff training & audits","Quality improvement systems"] },
  { ic:"✈️",t:"Medical Tourism Support",        c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd",
    items:["International patient setup","Visa & travel coordination","Global pricing strategy","End-to-end facilitation"] },
];
function HospitalConsultancy() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"var(--bg)", padding:"80px 0" }}>
      <W>
        <SH badge="Hospital Consultancy" title="End-to-End Hospital Growth Services"
          sub="Expert consultancy to help hospitals improve operations, patient care and business performance" />
        <div ref={ref} className={`cg stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"18px" }}>
          {CONSULT.map(({ ic,t,c,bg,bd,items }) => (
            <div key={t} className="con-card" style={{ background:bg,
              border:`1px solid ${bd}`, borderLeft:`4px solid ${c}`,
              borderRadius:"12px", padding:"20px 17px", boxShadow:"var(--sh-sm)" }}>
              <div style={{ fontSize:"26px", marginBottom:"10px" }}>{ic}</div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"16px",
                fontWeight:"700", color:"#0b1f3a", margin:"0 0 11px", lineHeight:"1.3" }}>{t}</h3>
              <ul style={{ paddingLeft:"16px", margin:"0 0 13px" }}>
                {items.map(item => (
                  <li key={item} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                    color:"#64748b", marginBottom:"5px", lineHeight:"1.6" }}>{item}</li>
                ))}
              </ul>
              <Link to="/contact" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                fontWeight:"600", color:c }}>View More →</Link>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"36px" }}>
          <Link to="/healthcare-provider" className="btn-p">Explore All Hospital Services →</Link>
        </div>
      </W>
    </section>
  );
}

/* ══ SPECIALTIES ══ */
const SPECS = ["Cardiology","Oncology","Neurology","Orthopaedics","Gastroenterology",
  "Nephrology","Pulmonology","Ophthalmology","ENT & Audiology","Dermatology",
  "Gynaecology","Paediatrics","Psychiatry","Endocrinology","Urology",
  "Physiotherapy","General Medicine","Internal Medicine"];
function Specialties() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"#fff", padding:"72px 0" }}>
      <W>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-end", marginBottom:"32px", flexWrap:"wrap", gap:"14px" }}>
          <div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:"700",
              color:"#047857", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Medical Expertise</p>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif",
              fontSize:"clamp(22px,3vw,36px)", fontWeight:"700", color:"#0b1f3a", margin:0 }}>
              Our Specializations
            </h2>
          </div>
          <Link to="/healthcare-provider" style={{ fontFamily:"'DM Sans',sans-serif",
            fontSize:"14px", fontWeight:"600", color:"#047857" }}>View All →</Link>
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

/* ══ HOW IT WORKS ══ */
const STEPS = [
  { n:"01",ic:"🔐",t:"Login with OTP",     d:"Quick secure login via Email or Mobile OTP. Account ready in 60 seconds." },
  { n:"02",ic:"🔍",t:"Choose Specialist",   d:"Browse 20+ verified doctors. Filter by specialty, language, consultation type." },
  { n:"03",ic:"📅",t:"Book & Pay",          d:"Pick your slot and pay via UPI or card. Instant confirmation delivered." },
  { n:"04",ic:"💬",t:"Consult & Recover",   d:"Video call or home visit. Digital prescription and follow-up plan provided." },
];
function HowItWorks() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"var(--bg)", padding:"80px 0" }}>
      <W>
        <SH badge="Simple Process" title="Healthcare Made Effortless" sub="Four steps from concern to consultation" />
        <div ref={ref} className={`g4 stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"26px" }}>
          {STEPS.map(({ n,ic,t,d }) => (
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
                marginBottom:"9px",fontFamily:"'DM Sans',sans-serif" }}>STEP {n}</span>
              <h3 style={{ fontSize:"17px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 7px" }}>{t}</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
                lineHeight:"1.72",margin:0,fontWeight:"300" }}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"40px" }}>
          <Link to="/login" className="btn-p">Get Started Today →</Link>
        </div>
      </W>
    </section>
  );
}

/* ══ TRUST ══ */
const TRUST = [
  { ic:"🏅",t:"Euro Cert Certified",   d:"Internationally recognised quality standard — verified annually." },
  { ic:"🔒",t:"Data Privacy First",    d:"All records encrypted. HTTPS, JWT auth and database-level security." },
  { ic:"👩‍⚕️",t:"Verified Specialists", d:"Every doctor credentialed, background-checked and reviewed." },
  { ic:"🌐",t:"Multi-Language",         d:"English, Tamil and Hindi. More languages on the roadmap." },
  { ic:"📱",t:"Any Device",             d:"Mobile, tablet, desktop — no app download needed." },
  { ic:"⚡",t:"Rapid Response",          d:"Appointments confirmed within 2 hours. 24×7 guidance available." },
];
function TrustSection() {
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"linear-gradient(160deg,#071524,#0b1f3a 55%,#062818)",
      padding:"80px 0", position:"relative" }}>
      <div style={{ position:"absolute",inset:0,
        backgroundImage:"radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)",
        backgroundSize:"36px 36px",pointerEvents:"none" }} />
      <W>
        <SH badge="Why Patients Trust Us" title="Built on Clinical Excellence"
          sub="16+ years guiding patients to the right care — with integrity and compassion" dark />
        <div ref={ref} className={`g3 stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"18px" }}>
          {TRUST.map(({ ic,t,d }) => (
            <div key={t} className="trust-card" style={{ background:"rgba(255,255,255,.05)",
              border:"1px solid rgba(255,255,255,.08)", borderRadius:"14px", padding:"22px" }}>
              <div style={{ fontSize:"30px", marginBottom:"11px" }}>{ic}</div>
              <h3 style={{ fontSize:"18px",fontWeight:"700",color:"#fff",margin:"0 0 7px" }}>{t}</h3>
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
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"#fff", padding:"80px 0" }}>
      <W>
        <SH
          badge="Patient Stories"
          title="What Our Patients Say"
          sub="Real experiences from verified patients — powered by Google Reviews"
        />
        <div
          ref={ref}
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(24px)",
            transition: "opacity .7s ease, transform .7s ease",
            minHeight: "300px",
          }}
        >
          {/* Elfsight Google Reviews Widget */}
          <div
            className="elfsight-app-5382c833-a30b-4a62-a185-5301bd44545f"
            data-elfsight-app-lazy
          />
        </div>
      </W>
    </section>
  );
}

/* ══ DISCLAIMER ══ */
function Disclaimer() {
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
                  fontWeight:"700",color:"#0b1f3a",margin:"0 0 9px" }}>Legal Disclaimer</h4>
                <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",
                  lineHeight:"1.78",margin:0,fontWeight:"300" }}>
                  We Care 4 'all' is an independent healthcare consultancy and patient coordination service.
                  We do not provide medical advice or treatment, nor do we own or operate any medical facility.
                  All medical services are delivered exclusively by licensed physicians and accredited healthcare
                  institutions chosen by the patient. Treatment outcomes, timelines and costs are determined solely
                  by the treatment provider. Cost estimates are indicative and non-binding. Professional service fees
                  relate only to coordination and support services and are disclosed separately.
                  No medical outcomes are guaranteed.
                </p>
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
  const { isLoggedIn } = useAuth();
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
          Start Today
        </p>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(28px,4vw,48px)",fontWeight:"700",color:"#fff",
          margin:"0 0 16px",lineHeight:"1.12" }}>
          Your Health Deserves Expert Attention
        </h2>
        <p style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"16px",
          color:"rgba(255,255,255,.78)",marginBottom:"36px",lineHeight:1.7,fontWeight:"300" }}>
          Join hundreds of patients who've experienced better healthcare through We Care 4 'all'.
        </p>
        <div style={{ display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap" }}>
          <Link to={isLoggedIn?"/patient/dashboard":"/login"} className="btn-w">
            Book an Appointment →
          </Link>
          <Link to="/contact" className="btn-ol">Contact Our Team</Link>
        </div>
      </div>
    </section>
  );
}

/* ══ MAIN ══ */
export default function Home() {
  useEffect(() => {
    document.title = "We Care 4 all";
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="hr">
      <style>{G}</style>
      <Ticker />
      <Hero />
      <StatsBand />
      <Services />
      <HospitalConsultancy />
      <Specialties />
      <HowItWorks />
      <TrustSection />
      <Reviews />
      <Disclaimer />
      <CTA />
    </div>
  );
}
