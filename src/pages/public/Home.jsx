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
import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { RoleModal, useRoleBooking } from "../../components/RoleModal";
import { useScrollAnimation, useCountUp } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";
import { specialtyToSlug } from "../../utils/specialtySlug";

const G = `
:root{
  --green:var(--wc-green); --green-l:var(--wc-green-dark); --green-bg:var(--wc-sage);
  --navy:var(--wc-navy); --navy-d:var(--wc-navy-deepest); --navy-m:var(--wc-navy-mid);
  --text:#1e293b; --muted:var(--wc-muted); --border:var(--wc-border);
  --bg:#f0f6fc; --white:#fff;
  --sh-sm:0 2px 8px rgba(18,59,74,.06);
  --sh-md:0 4px 20px rgba(18,59,74,.09);
  --sh-lg:0 12px 36px rgba(18,59,74,.13);
  --sh-xl:0 20px 60px rgba(18,59,74,.16);
}
.hr{font-family:'Inter',sans-serif;color:var(--text);overflow-x:hidden;}
.hr *{box-sizing:border-box;}
.hr a{text-decoration:none;}
.hr h1,.hr h2,.hr h3{font-family:'Manrope',sans-serif;}

/* ── Ticker — dark green, always visible ── */
.tk-wrap{
  background:var(--wc-navy-deep);
  overflow:hidden;
  padding:9px 0;
  white-space:nowrap;
}
.tk-inner{display:inline-flex;animation:ticker 35s linear infinite;white-space:nowrap;}
.tk-item{
  font-family:'Inter',sans-serif;font-size:12px;font-weight:500;
  color:#ffffff;padding:0 44px;
  border-right:1px solid rgba(255,255,255,.20);
  letter-spacing:.3px;flex-shrink:0;
}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* Mobile background — shown only when video is hidden */
.vh-mobile-bg{
  display:none; /* hidden on desktop */
  position:absolute; inset:0; z-index:0;
  background:linear-gradient(145deg,var(--wc-navy-deepest) 0%,var(--wc-navy-deepest) 40%,var(--wc-navy) 70%,var(--wc-navy-deep) 100%);
}

/* ── Hero video ── */
.vh{
  position:relative;
  min-height:82vh;
  display:flex;align-items:flex-start;
  /* Was align-items:center with min-height:92vh — vertical centering
     on a tall min-height left a large empty gap above the badge/
     heading whenever the actual content block was shorter than 92vh
     (screenshot feedback, Aug 2026: "above there is a waste space").
     Top-aligning with a shorter min-height removes that gap — content
     now starts right after the navbar/ticker instead of floating
     mid-viewport. */
  /* FIX (Aug 2026, this pass — "top having some empty space"):
     this used to be 112px = navbar(72px, position:fixed) + ticker(38px)
     + 2px. But Ticker renders in *normal document flow* directly before
     Hero (see Home() render order below, and the position:relative note
     in Navbar.jsx's header comment) — it already pushes Hero down by
     its own real height on its own. Adding the ticker's height again
     here double-counted it, producing exactly the extra empty gap at
     the top of the page. .vh only needs to clear the *fixed* navbar
     (72px) plus a small buffer — matching the mobile override below
     (76px/72px), which never had this bug because it was never written
     to include the ticker in the first place. */
  padding-top:80px;
  overflow:hidden;
  background:var(--wc-navy-deepest);
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
  background:linear-gradient(90deg,var(--wc-green-lighter),var(--wc-green-pale),var(--wc-green-lighter));
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

/* ── Stats band ──
   Was a fixed 6-column grid left over from when this band had 6 stats.
   Only 2 remain ("Years of Trust" / "Happy Patients") so the grid left
   4 empty columns and the 2 real cells sat pinned to the left instead
   of centered. Flex + justify-content:center scales correctly no
   matter how many stats are ever added back. */
.sb{display:flex;flex-wrap:wrap;justify-content:center;}
.sb-cell{padding:24px 32px;text-align:center;transition:background .2s;cursor:default;flex:0 1 180px;}
.sb-cell:hover{background:rgba(91,158,50,.05);}

/* ── Quick book ── */
.qb-tab{
  border:1.5px solid;font-family:'Inter',sans-serif;font-size:13px;
  font-weight:500;cursor:pointer;transition:all .2s;border-radius:50px;
  padding:7px 16px;display:inline-flex;align-items:center;gap:6px;
}

/* ── Cards ── */
.svc-card{transition:transform .28s,box-shadow .28s;}
.svc-card:hover{transform:translateY(-6px);box-shadow:var(--sh-xl)!important;}
.con-card{transition:all .3s;}
.con-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(18,59,74,.13)!important;border-left-width:5px!important;}
.trust-card{transition:all .25s;}
.trust-card:hover{transform:translateY(-4px);background:rgba(255,255,255,.09)!important;border-color:rgba(52,211,153,.3)!important;}
.rev-card{transition:all .28s;}
.rev-card:hover{transform:translateY(-4px);box-shadow:var(--sh-lg)!important;}
.spec-chip{
  border-radius:50px;padding:8px 17px;cursor:pointer;transition:all .2s;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:500;border:1.5px solid;
}
.spec-chip:hover{background:var(--wc-navy)!important;color:#fff!important;border-color:var(--wc-navy)!important;transform:scale(1.04);}

/* ── Buttons ── */
.btn-p{
  display:inline-flex;align-items:center;gap:8px;
  background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;
  font-family:'Inter',sans-serif;font-weight:600;font-size:15px;
  padding:13px 28px;border-radius:8px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(91,158,50,.40);transition:all .25s;text-decoration:none;
}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(91,158,50,.50);}
.btn-ol{
  display:inline-flex;align-items:center;gap:8px;
  background:rgba(255,255,255,.10);border:1.5px solid rgba(255,255,255,.30);
  color:#fff;font-family:'Inter',sans-serif;font-weight:500;font-size:15px;
  padding:13px 26px;border-radius:8px;cursor:pointer;transition:all .25s;text-decoration:none;
}
.btn-ol:hover{background:rgba(255,255,255,.18);border-color:rgba(255,255,255,.55);}
.btn-w{
  display:inline-flex;align-items:center;gap:8px;
  background:#fff;color:var(--wc-green-dark);font-family:'Inter',sans-serif;
  font-weight:700;font-size:15px;padding:13px 28px;border-radius:8px;
  border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.14);
  transition:all .25s;text-decoration:none;
}
.btn-w:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.20);}

/* ── Disclaimer ── */
.disc{border-left:4px solid var(--wc-green);background:linear-gradient(135deg,#fffbeb,#fefce8);border-radius:0 12px 12px 0;}

/* ── Responsive ── */
@media(max-width:960px){
  .hero-cols{grid-template-columns:1fr!important;}
  .hero-right{display:none!important;}
  .g3{grid-template-columns:1fr 1fr!important;}
  .g4{grid-template-columns:1fr 1fr!important;}
  .g2{grid-template-columns:1fr!important;}
  .cg{grid-template-columns:1fr 1fr!important;}
  .vh{padding-top:76px!important;}
  /* Mobile: hide video for better performance & UI */
  .vh-vid{display:none!important;}
  .vh-mobile-bg{display:block!important;}
}
@media(max-width:600px){
  .g3,.g4,.cg{grid-template-columns:1fr!important;}
  .sb-cell{flex:0 1 45%;padding:20px 10px;}
  /* Was min-height:100svh!important — forced the hero section to be at
     least full mobile-viewport height. Combined with align-items:
     flex-start (fixed in an earlier round to remove a gap ABOVE the
     content), this just moved the empty space to BELOW the content
     instead — trust badges end, then a large gap, then the next
     section starts (screenshot feedback, Aug 2026). Letting the
     section size itself to its actual content removes the gap
     entirely regardless of how much/little content the hero has. */
  .vh{padding-top:72px!important;}
  .vh-vid{display:none!important;}
  .vh-mobile-bg{display:block!important;}
  .audience-grid{grid-template-columns:1fr!important;}
  /* Founder Trust cards — was a fixed 2-column grid with zero mobile
     override (inline style, React inline styles can't hold media
     queries on their own), squeezing both founder cards into ~half a
     phone-screen's width each — text wrapped one word per line.
     Single column on narrow screens, matching every other grid's
     approach in this file. */
  .team-grid{grid-template-columns:1fr!important;}
  /* Same exact bug, same exact fix — CarePlusPromo and
     MedicalTourismPromo both use a fixed 2-column grid (text column +
     card/step column) with no mobile override. On narrow screens this
     squeezed the two columns into overlapping/collapsed widths — the
     numbered step cards, feature cards, and floating Call/WhatsApp
     buttons all fighting for the same cramped horizontal space
     (screenshots, Aug 2026: cards visibly overlapping each other and
     the floating buttons). Single column fixes both the same way
     .team-grid was fixed above. */
  .careplus-grid,.medtourism-grid{grid-template-columns:1fr!important;}
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
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", fontWeight:"700",
        color: dark?"var(--wc-green-pale)":"var(--wc-green)", letterSpacing:"2px",
        textTransform:"uppercase", marginBottom:"10px" }}>{badge}</p>
      <h2 style={{ fontFamily:"'Manrope',sans-serif",
        fontSize:"clamp(26px,3.5vw,42px)", fontWeight:"700",
        color: dark?"#fff":"var(--wc-navy)", margin:"0 0 12px", lineHeight:1.15 }}>{title}</h2>
      {sub && <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"16px",
        color: dark?"rgba(255,255,255,.62)":"var(--wc-muted)",
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

/* ══ AUDIENCE "LOOKING FOR" DROPDOWN ══
   Small reusable piece for the hero-right card — one per audience
   (patient / hospital), each a labeled dropdown that navigates to the
   right page on selection. Kept as a plain <select> rather than a
   custom-built dropdown for reliability/accessibility (native keyboard
   nav, screen reader support, mobile-native picker UI) — a custom
   dropdown would need to reimplement all of that from scratch for a
   component this small. */
function AudienceLookingFor({ icon, accent, label, placeholder, options }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  const go = () => {
    const opt = options.find(o => o.value === value);
    if (opt) navigate(opt.path);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:"9px", marginBottom:"10px" }}>
        <span style={{ fontSize:"18px" }} aria-hidden="true">{icon}</span>
        <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:"600", fontSize:"13px",
          color:"#fff", margin:0 }}>{label}</p>
      </div>
      <div style={{ display:"flex", gap:"8px" }}>
        <select
          value={value}
          onChange={e => setValue(e.target.value)}
          aria-label={label}
          style={{
            flex:1, minWidth:0, background:"rgba(255,255,255,.06)",
            border:"1px solid rgba(255,255,255,.18)", borderRadius:"9px",
            color: value ? "#fff" : "rgba(255,255,255,.55)",
            fontFamily:"'Inter',sans-serif", fontSize:"12.5px", fontWeight:"500",
            padding:"11px 10px", appearance:"none", cursor:"pointer",
          }}
        >
          <option value="" disabled style={{ color:"var(--wc-navy)" }}>{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ color:"var(--wc-navy)" }}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={go}
          disabled={!value}
          aria-label={`Go — ${label}`}
          style={{
            flexShrink:0, width:"42px", borderRadius:"9px", border:"none",
            background: value ? accent : "rgba(255,255,255,.10)",
            color: value ? "var(--wc-navy)" : "rgba(255,255,255,.35)",
            fontWeight:"700", fontSize:"15px",
            cursor: value ? "pointer" : "not-allowed",
            transition:"background .2s",
          }}
        >→</button>
      </div>
    </div>
  );
}

function Hero() {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language?.startsWith("ta");
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
        background:"radial-gradient(circle,rgba(91,158,50,.18) 0%,transparent 65%)" }} />

      <div className="vh-content">
        <W>
          <div className="hero-cols" style={{ display:"grid", gridTemplateColumns:"1.05fr 0.95fr",
            gap:"52px", alignItems:"center", padding:"24px 0 60px" }}>

            {/* LEFT */}
            <div>
              <div className="hfu1" style={{ display:"inline-flex", alignItems:"center", gap:"8px",
                background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.30)",
                borderRadius:"50px", padding:"7px 16px", marginBottom:"24px" }}>
                <span style={{ width:"7px",height:"7px",background:"var(--wc-green-light)",borderRadius:"50%",
                  display:"block",animation:"pulseDot 2s infinite" }} />
                <span style={{ fontFamily:"'Inter',sans-serif",color:"var(--wc-green-pale)",
                  fontSize:"12px",fontWeight:"600",letterSpacing:".3px" }}>
                  {t("home.hero.badge")}
                </span>
              </div>

              <h1 className="hfu2" style={{ fontFamily: isTamil
                  ? "'Noto Sans Tamil','Manrope',sans-serif"
                  : "'Manrope',sans-serif",
                fontSize: isTamil ? "clamp(26px,3.6vw,46px)" : "clamp(32px,4.2vw,54px)",
                fontWeight:"700", color:"#fff",
                lineHeight: isTamil ? "1.3" : "1.1", marginBottom:"20px",
                letterSpacing: isTamil ? "normal" : "-.5px",
                overflowWrap:"break-word", wordBreak:"break-word" }}>
                {t("home.hero.title1")}{" "}
                <span className="sh">{t("home.hero.title2")}</span>
                {t("home.hero.titleAlways") && (<>
                  <br />
                  <em style={{ fontStyle:"italic", fontSize:".70em",
                    fontWeight:"400", color:"rgba(255,255,255,.75)" }}>{t("home.hero.titleAlways")}</em>
                </>)}
              </h1>

              <p className="hfu3" style={{ fontFamily:"'Inter',sans-serif", fontSize:"17px",
                color:"rgba(255,255,255,.72)", lineHeight:"1.78",
                marginBottom:"32px", maxWidth:"460px", fontWeight:"300" }}>
                {t("home.hero.subtitle")}
              </p>

              <div className="hfu4" style={{ display:"flex", gap:"13px", flexWrap:"wrap", marginBottom:"16px" }}>
                <button onClick={handleBookingClick} className="btn-p" style={{cursor:"pointer",border:"none"}}>
                  {t("home.hero.bookAppt")}
                </button>
                <Link to="/healthcare-provider" className="btn-ol">{t("home.hero.ourServices")}</Link>
              </div>

              {/* Client requirement (Aug 2026 strategy review): a prominent
                  Call/WhatsApp CTA throughout the site, not just buried
                  behind login/forms — this is the hero-level version.
                  A floating call button (CallFloatButton.jsx) already
                  covers every other page; this adds WhatsApp too, right
                  where a first-time visitor's eyes land first. */}
              <div className="hfu4" style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"38px" }}>
                <a href="tel:+919025786467" style={{
                  display:"inline-flex", alignItems:"center", gap:"7px",
                  fontFamily:"'Inter',sans-serif", fontSize:"13px", fontWeight:"600",
                  color:"#fff", background:"rgba(255,255,255,.08)",
                  border:"1px solid rgba(255,255,255,.22)", borderRadius:"9px",
                  padding:"9px 15px", textDecoration:"none",
                }}>
                  <span aria-hidden="true">📞</span> {t("home.hero.callCta")}
                </a>
                <a href="https://wa.me/919025786467?text=Hi%2C%20I%27d%20like%20to%20talk%20to%20a%20Care%20Coordinator"
                  target="_blank" rel="noopener noreferrer" style={{
                  display:"inline-flex", alignItems:"center", gap:"7px",
                  fontFamily:"'Inter',sans-serif", fontSize:"13px", fontWeight:"600",
                  // Was background:"#25D366" (WhatsApp's own official
                  // brand green) — a visibly different shade than the
                  // site's own brand green (var(--wc-green), more
                  // olive/muted) used one button over on "Book
                  // Appointment". Two different greens side-by-side
                  // read as off-theme even though each individually was
                  // "correct" (screenshot feedback, Aug 2026:
                  // "whatsapp button colour not changed" — the text
                  // color WAS already fixed in an earlier round, this
                  // is the actual remaining mismatch). Using the site's
                  // own brand green here instead, matching every other
                  // primary green surface.
                  color:"#fff", background:"var(--wc-green)",
                  border:"1px solid var(--wc-green)", borderRadius:"9px",
                  padding:"9px 15px", textDecoration:"none",
                }}>
                  <span aria-hidden="true">💬</span> {t("home.hero.whatsappCta")}
                </a>
              </div>

              {/* Quick-book */}
              <div className="hfu5" style={{ background:"rgba(255,255,255,.07)",
                border:"1px solid rgba(255,255,255,.12)", borderRadius:"14px",
                padding:"18px", backdropFilter:"blur(14px)" }}>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"10px", fontWeight:"700",
                  color:"rgba(255,255,255,.40)", letterSpacing:"1.5px",
                  textTransform:"uppercase", marginBottom:"11px" }}>{t("home.hero.quickBook")}</p>
                <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"12px" }}>
                  {TABS.map(tb => (
                    <button key={tb.id} onClick={() => setTab(tb.id)} className="qb-tab" style={{
                      background: tab===tb.id?"rgba(91,158,50,.30)":"transparent",
                      borderColor: tab===tb.id?"var(--wc-green-light)":"rgba(255,255,255,.22)",
                      color: tab===tb.id?"var(--wc-green-pale)":"rgba(255,255,255,.65)",
                    }}>{tb.icon} {tb.label}</button>
                  ))}
                </div>
                <button onClick={handleScheduleClick} className="btn-p" style={{display:"flex",justifyContent:"center",borderRadius:"8px",padding:"12px",cursor:"pointer",border:"none",width:"100%"}}>
                  {t("home.hero.schedule")} {TABS.find(tb=>tb.id===tab)?.label} →
                </button>
              </div>
            </div>

            {/* RIGHT card — replaced the "fake app preview" mockup
                (Video Consultation / Home Healthcare / Hospital Network
                list — WhatsApp feedback, Aug 2026: "in left and right
                both side same content is there"). The list items here
                duplicated what the LEFT side's Quick-Book tabs and
                AudienceSplit section below already say. Replaced with
                two real dropdown selectors instead — one per audience,
                each routing straight to the right page on selection,
                which is actually actionable rather than decorative. */}
            <div className="hero-right float">
              <div style={{ background:"rgba(255,255,255,.08)",
                border:"1px solid rgba(255,255,255,.14)", borderRadius:"20px",
                padding:"28px", backdropFilter:"blur(20px)",
                boxShadow:"0 32px 80px rgba(0,0,0,.45)", position:"relative" }}>

                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"10px", fontWeight:"700",
                  color:"rgba(255,255,255,.40)", letterSpacing:"1.5px",
                  textTransform:"uppercase", marginBottom:"18px" }}>
                  {t("home.hero.findWhatYouNeed", "Find What You Need")}
                </p>

                <AudienceLookingFor
                  icon="🧑‍⚕️" accent="var(--wc-green-light)"
                  label={t("home.hero.patientLookingFor", "I'm a Patient looking for")}
                  placeholder={t("home.hero.selectOption", "Select what you need")}
                  options={[
                    { value:"consultation", label:t("home.hero.optConsultation", "Consultation with a Specialist"), path:"/doctors" },
                    { value:"homehealthcare", label:t("home.hero.optHomeHealthcare", "Home Healthcare"), path:"/home-healthcare" },
                    { value:"careplus", label:t("home.hero.optCarePlus", "Geriatric or Hospice Care"), path:"/care-plus" },
                  ]}
                />

                <div style={{ height:"1px", background:"rgba(255,255,255,.10)", margin:"18px 0" }} />

                <AudienceLookingFor
                  icon="🏥" accent="#38bdf8"
                  label={t("home.hero.hospitalLookingFor", "I'm a Hospital / Corporate looking for")}
                  placeholder={t("home.hero.selectOption", "Select what you need")}
                  options={[
                    { value:"marketing",   label:t("home.hero.optMarketing", "Marketing, Branding, Insurance & Corporate Tie-ups"), path:"/hospital-consultancy" },
                    { value:"empanelment", label:t("home.hero.optEmpanelment", "Become a Partner Hospital"), path:"/partner-with-us" },
                    { value:"corporate",   label:t("home.hero.optCorporate", "Corporate Wellness"), path:"/corporate-wellness" },
                  ]}
                />

                {/* Floating badges — kept, real/verifiable trust signals
                    (not decorative "app preview" content like the list
                    items that were removed above). */}
                <div style={{ position:"absolute",top:"-14px",right:"-14px",background:"#fff",
                  borderRadius:"11px",padding:"9px 13px",boxShadow:"0 8px 26px rgba(0,0,0,.28)",
                  display:"flex",alignItems:"center",gap:"7px" }}>
                  <div style={{ width:"26px",height:"26px",background:"var(--wc-navy)",borderRadius:"6px",
                    display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
                    <img loading="lazy" width="22" height="22" src="/assets/img/logo/euro_logo.jpeg" alt=""
                      style={{ width:"22px",height:"22px",objectFit:"contain" }}
                      onError={e=>{e.target.parentElement.innerHTML=`<span style="font-size:7px;font-weight:800;color:#fff">EC</span>`;}}/>
                  </div>
                  <div>
                    <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"9px",fontWeight:"800",color:"var(--wc-navy)",margin:0,letterSpacing:".4px" }}>EURO CERT</p>
                    <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"10px",color:"var(--wc-green)",fontWeight:"700",margin:0 }}>{t("home.hero.euroCertFloat")}</p>
                  </div>
                </div>
                <div style={{ position:"absolute",bottom:"-14px",left:"-14px",background:"var(--wc-navy)",
                  borderRadius:"11px",padding:"9px 14px",boxShadow:"0 8px 26px rgba(0,0,0,.38)",
                  border:"1px solid rgba(255,255,255,.08)" }}>
                  <p style={{ fontFamily:"'Manrope',sans-serif",fontSize:"20px",fontWeight:"700",color:"#fff",margin:0,lineHeight:1 }}>500+</p>
                  <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"10px",color:"var(--wc-green-pale)",fontWeight:"600",margin:0 }}>{t("home.hero.patientsServed")}</p>
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

/* ══ AUDIENCE SPLIT — "I am a Patient" / "I am a Hospital or Corporate" ══
   Added per web-analysis recommendation (Aug 2026): give patients and
   hospital/corporate visitors an immediate, distinct path right below
   the hero instead of making both scroll through the same generic page. */
function AudienceSplit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();

  const goPatient = () => {
    if (isLoggedIn && role === "patient") { navigate("/patient/dashboard"); return; }
    // Client feedback (Aug 2026): now routes to /healthcare-consultancy
    // first — the informational landing page (mirrors what "I am a
    // Hospital" already does with /hospital-consultancy) — instead of
    // going straight to the doctor list. /healthcare-consultancy itself
    // has "Find a Doctor" CTAs throughout, so a visitor reads about the
    // service before jumping into booking.
    navigate("/healthcare-consultancy");
  };
  const goHospital = () => {
    if (isLoggedIn && role === "hospital") { navigate("/hospital/dashboard"); return; }
    // Client feedback (Aug 2026): was going straight to /partner-with-us
    // (the empanelment application form). Now routes to /hospital-
    // consultancy first — the informational landing page, which already
    // has 3 "Partner With Us" buttons of its own (hero, mid-page, and
    // bottom CTA — see HospitalConsultancy.jsx) so a visitor reads about
    // the service before being asked to fill out an application.
    // /hospital-consultancy is now fully public (login gate removed in
    // a later round of the same feedback pass) — this works correctly
    // for a logged-out visitor too, no redirect-to-login detour.
    navigate("/hospital-consultancy");
  };

  return (
    <section style={{ background:"var(--wc-light-teal)", borderBottom:"1px solid var(--border)", padding:"30px 0" }}>
      <W>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px",
          maxWidth:"760px", margin:"0 auto" }} className="audience-grid">
          <button onClick={goPatient} className="audience-btn" style={{
            display:"flex", alignItems:"center", gap:"12px", textAlign:"left",
            padding:"18px 20px", borderRadius:"14px", cursor:"pointer",
            border:"1.5px solid #86efac", background:"var(--wc-sage)",
          }}>
            <span style={{ fontSize:"26px" }} aria-hidden="true">🧑‍⚕️</span>
            <span>
              {/* Small eyebrow label added (Aug 2026, old-site content
                  reference): the legacy PHP site used "Healthcare
                  Seeker"/"Healthcare Provider" as its actual section
                  names (folders literally named Healthcare-Seekers/
                  Healthcare-Providers) — this reintroduces that
                  terminology as a label above the existing, more casual
                  "I am a..." title, rather than replacing it outright. */}
              <span style={{ display:"block", fontFamily:"'Inter',sans-serif",
                fontSize:"10px", fontWeight:"700", letterSpacing:"1px",
                textTransform:"uppercase", color:"var(--wc-green-dark)", marginBottom:"2px" }}>
                {t("home.audience.patientLabel", "Healthcare Seeker")}
              </span>
              <span style={{ display:"block", fontFamily:"'Inter',sans-serif",
                fontWeight:"700", fontSize:"15px", color:"var(--wc-green)" }}>
                {t("home.audience.patientTitle", "I am a Patient")}
              </span>
              <span style={{ display:"block", fontFamily:"'Inter',sans-serif",
                fontSize:"12.5px", color:"#3f6b5a" }}>
                {t("home.audience.patientSub", "Find a doctor & book a consultation")}
              </span>
            </span>
          </button>

          <button onClick={goHospital} className="audience-btn" style={{
            display:"flex", alignItems:"center", gap:"12px", textAlign:"left",
            padding:"18px 20px", borderRadius:"14px", cursor:"pointer",
            border:"1.5px solid #d1dce8", background:"var(--wc-warm-white)",
          }}>
            <span style={{ fontSize:"26px" }} aria-hidden="true">🏥</span>
            <span>
              <span style={{ display:"block", fontFamily:"'Inter',sans-serif",
                fontSize:"10px", fontWeight:"700", letterSpacing:"1px",
                textTransform:"uppercase", color:"var(--wc-navy)", marginBottom:"2px" }}>
                {t("home.audience.hospitalLabel", "Healthcare Provider")}
              </span>
              <span style={{ display:"block", fontFamily:"'Inter',sans-serif",
                fontWeight:"700", fontSize:"15px", color:"var(--wc-navy)" }}>
                {t("home.audience.hospitalTitle", "I am a Hospital / Corporate")}
              </span>
              <span style={{ display:"block", fontFamily:"'Inter',sans-serif",
                fontSize:"12.5px", color:"var(--wc-muted)" }}>
                {t("home.audience.hospitalSub", "Partner with us or explore corporate wellness")}
              </span>
            </span>
          </button>
        </div>
      </W>
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
      <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"28px", fontWeight:"700",
        color: c, margin:0, lineHeight:1 }}>
        {triggered ? `${num}${suffix}` : `0${suffix}`}
      </p>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", color:"var(--muted)",
        marginTop:"4px", fontWeight:"500" }}>{l}</p>
    </div>
  );
}
function StatsBand() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation({ threshold:0.3 });
  const labels = Array.isArray(t("home.stats.labels", { returnObjects: true })) ? t("home.stats.labels", { returnObjects: true }) : ["","","","","",""];
  // NOTE (client-requested correction, Aug 2026): "50+ Partner Hospitals",
  // "20+ Specialist Doctors" and "18+ Medical Specialties" stats were
  // removed (numbers looked inflated/unverifiable next to the real
  // specialty/hospital counts shown elsewhere on the page). The "24/7
  // Support" stat was also removed in a follow-up round — actual call
  // staffing outside business hours wasn't confirmed, so keeping a 24/7
  // claim on the homepage was a trust risk. Only "Years of Trust" and
  // "Happy Patients" remain, and this whole band was moved from just
  // under the hero to just above the footer — see <StatsBand/> placement
  // in Home() below.
  const STATS = [
    { n:"20+",  l:labels[0], ic:"🏆", c:"var(--wc-green)" },
    { n:"500+", l:labels[1], ic:"❤️",  c:"#0e7490" },
  ];
  return (
    <section ref={ref} style={{ background:"var(--wc-sage)", borderBottom:"1px solid var(--border)" }}>
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
  { ic:"🎥",c:"var(--wc-teal)",bg:"#eff8ff",bd:"#bae6fd",link:"/doctors" },
  { ic:"🏠",c:"var(--wc-green)",bg:"var(--wc-sage)",bd:"#86efac",link:"/home-healthcare" },
  { ic:"🌍",c:"#be123c",bg:"#fff1f2",bd:"#fecdd3",link:"/international-patients" },
  { ic:"🤝",c:"#b45309",bg:"#fffbeb",bd:"#fde68a",link:"/corporate-wellness" },
  { ic:"🏘️",c:"#0e7490",bg:"#ecfeff",bd:"#a5f3fc",link:"/residential-healthcare" },
];
function Services() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  const { showModal, handleGatedNavigate, closeModal, role, navigate } = useRoleBooking();
  const titles = Array.isArray(t("home.services.titles", { returnObjects: true })) ? t("home.services.titles", { returnObjects: true }) : [];
  const descs = Array.isArray(t("home.services.descs", { returnObjects: true })) ? t("home.services.descs", { returnObjects: true }) : [];
  const SVCS = SVC_META.map((m,i) => ({ ...m, t:titles[i], d:descs[i], link:m.link }));
  return (
    <section style={{ background:"var(--wc-sage)", padding:"80px 0" }}>
      <W>
        <SH badge={t("home.services.eyebrow")} title={t("home.services.heading")}
          sub={t("home.services.sub")} />
        <div ref={ref} className={`g4 stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(230px,100%),1fr))", gap:"22px" }}>
          {SVCS.map(({ ic,t:title,c,bg,bd,d,link }) => (
            <div key={title} className="svc-card" style={{ background:bg,
              border:`1px solid ${bd}`, borderRadius:"16px", padding:"26px 22px",
              boxShadow:"var(--sh-sm)" }}>
              <div style={{ width:"52px",height:"52px",background:`${c}18`,
                border:`1.5px solid ${c}38`,borderRadius:"13px",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"22px",marginBottom:"16px" }}>{ic}</div>
              <h3 style={{ fontSize:"19px",fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 9px" }}>{title}</h3>
              <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"var(--wc-muted)",
                lineHeight:"1.72",margin:"0 0 14px",fontWeight:"300" }}>{d}</p>
              <a href={link} onClick={(e)=>handleGatedNavigate(e, link)}
                style={{ fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:"600",
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
/* ══ HOSPITAL CONSULTANCY — homepage TEASER only ══
   Web-analysis recommendation (Aug 2026): "Move the deep-dive hospital
   consultancy services to a dedicated sub-domain or separate landing
   page." A full dedicated page already existed at /hospital-consultancy
   (8 detailed service areas + founder bios — see HospitalConsultancy.jsx)
   but the homepage was ALSO showing its own 7-card deep-dive grid with
   full bullet lists — duplicate content, and it pushed B2C patients
   through a wall of B2B detail they don't need. Replaced with a short
   teaser strip + one clear CTA to the real dedicated page. (Also fixed a
   bug while here: the old "Explore All" button pointed at
   /healthcare-provider — the patient "Find Doctors" page — instead of
   /hospital-consultancy.) */
function HospitalConsultancy() {
  const { t } = useTranslation();
  return (
    <section style={{ background:"var(--wc-warm-white)", padding:"56px 0" }}>
      <W>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:"20px", background:"#fff", border:"1px solid var(--border)",
          borderRadius:"16px", padding:"28px 32px" }}>
          <div style={{ maxWidth:"560px" }}>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", fontWeight:"700",
              color:"#6d28d9", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>
              {t("home.consult.eyebrow")}
            </p>
            <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"clamp(20px,2.4vw,28px)",
              fontWeight:"700", color:"var(--wc-navy)", margin:"0 0 8px" }}>
              {t("home.consult.heading")}
            </h2>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13.5px",
              color:"var(--wc-muted)", margin:0, lineHeight:1.6 }}>
              {t("home.consult.sub")}
            </p>
          </div>
          <Link to="/hospital-consultancy" className="wc-btn-secondary" style={{ flexShrink:0 }}>
            {t("home.consult.exploreAll")}
          </Link>
        </div>
      </W>
    </section>
  );
}

/* ══ SPECIALTIES ══ */
// Icons now come live from the admin-managed specialties table (see
// Specialties() below, which fetches GET /specialties) — no more
// hardcoded per-name icon map here, since the real specialty list is
// managed by admin at /admin/dashboard?tab=specialties and can change
// (added/renamed/removed) independently of this frontend code.
// CarePlusPromo(), MedicalTourismPromo(), Specialties(),
// SmartBookButton(), HowItWorks(), and their specNameToSlug() helper
// moved to HealthcareConsultancy.jsx (Aug 2026 client decision —
// detailed patient content belongs on the dedicated Healthcare
// Consultancy page now, not the homepage).

/* ══ TRUST ══ */
const TRUST_ICONS = ["🏅","🔒","👩‍⚕️","🌐","📱","⚡"];
function TrustSection() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  const titles = Array.isArray(t("home.trust.titles", { returnObjects: true })) ? t("home.trust.titles", { returnObjects: true }) : [];
  const descs = Array.isArray(t("home.trust.descs", { returnObjects: true })) ? t("home.trust.descs", { returnObjects: true }) : [];
  const TRUST = TRUST_ICONS.map((ic,i) => ({ ic, t:titles[i], d:descs[i] }));
  return (
    <section style={{ background:"linear-gradient(160deg,var(--wc-navy-deepest),var(--wc-navy) 55%,var(--wc-navy-deep))",
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
              <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"13px",
                color:"rgba(255,255,255,.55)",lineHeight:"1.72",margin:0,fontWeight:"300" }}>{d}</p>
            </div>
          ))}
        </div>
      </W>
    </section>
  );
}

/* ══ GOOGLE REVIEWS ══ */
// 27 real Google review screenshots already committed to the repo
// (public/assets/img/reviews/1.png … 27.png) but never actually wired
// into any page — sitting unused on disk while this section only ever
// showed the Google Places API results (rarely configured — needs paid
// billing enabled) or, failing that, admin-uploaded screenshots via
// ManualReviews.jsx (Reviews table → /reviews/manual). These seed
// screenshots plug that gap: shown as a "static" tier so the section
// never falls back to the plain fact-list below when real proof exists
// on disk, and merged with whatever admin uploads next so both sources
// end up in one grid, same card treatment, without admin needing to
// re-upload the ones already here.
const STATIC_SEED_REVIEW_COUNT = 27;
const STATIC_SEED_REVIEWS = Array.from({ length: STATIC_SEED_REVIEW_COUNT }, (_, i) => ({
  id: `seed-${i + 1}`,
  screenshot_url: `/assets/img/reviews/${i + 1}.png`,
  reviewer_name: null, // name/rating are already visible inside the screenshot itself
  rating: null,
  is_seed: true,
}));
const REVIEWS_INITIAL_SHOWN = 9;

function Reviews() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
  const [data, setData] = useState(null); // null = loading, {configured:false} = not set up, else real data
  const [manual, setManual] = useState(null); // null = loading, {reviews:[]} once fetched
  const [lightbox, setLightbox] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/reviews/google`);
        const json = await res.json();
        setData(json);
      } catch { setData({ configured: false, reviews: [] }); }
    })();
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/reviews/manual`);
        const json = await res.json();
        setManual(json);
      } catch { setManual({ reviews: [] }); }
    })();
  }, []);

  // Real, verifiable facts — not fabricated testimonial quotes. Shown
  // whenever no real reviews (live Google or admin-uploaded screenshots)
  // are available yet, so this section never shows fabricated quotes or
  // a broken widget.
  const POINTS = [
    { icon: "🩺", label: "Every doctor is credential-verified", sub: "Registration numbers confirmed by our clinical team" },
    { icon: "🏥", label: "Growing network of partner hospitals", sub: "Accredited institutions across India" },
    { icon: "🔒", label: "End-to-end data privacy", sub: "Your health records are never sold or shared" },
    { icon: "⏱️", label: "Fast, real response times", sub: "Doctors accept video requests in minutes, not hours" },
  ];

  const hasRealReviews = data?.configured && !data?.error && (data?.reviews?.length > 0);
  // Admin-uploaded screenshots (manual.reviews) appended AFTER the seed
  // set, newest admin uploads last — so future uploads just extend this
  // same grid instead of replacing what's already shown.
  const galleryReviews   = [...STATIC_SEED_REVIEWS, ...(manual?.reviews || [])];
  const hasManualReviews = !hasRealReviews && galleryReviews.length > 0;
  const visibleGallery   = showAll ? galleryReviews : galleryReviews.slice(0, REVIEWS_INITIAL_SHOWN);

  return (

    <section style={{ background:"var(--wc-warm-white)", padding:"80px 0" }}>
      <W>
        <SH badge={t("home.reviews.eyebrow")} title={t("home.reviews.heading")}
          sub={t("home.reviews.sub")} />

        {hasRealReviews ? (
          <div ref={ref}
            style={{
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(24px)",
              transition: "opacity .7s ease, transform .7s ease",
            }}
          >
            {/* Overall rating summary + required Google attribution */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
              gap:"14px", flexWrap:"wrap", marginBottom:"28px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px",
                background:"#fff", border:"1px solid var(--wc-border)", borderRadius:"50px",
                padding:"10px 18px", boxShadow:"var(--sh-sm)" }}>
                <span style={{ fontFamily:"'Manrope',sans-serif", fontSize:"22px",
                  fontWeight:"700", color:"var(--wc-navy)" }}>{data.rating?.toFixed(1)}</span>
                <span style={{ color:"#fbbf24", fontSize:"15px", letterSpacing:"1px" }}>
                  {"★".repeat(Math.round(data.rating||0))}{"☆".repeat(5-Math.round(data.rating||0))}
                </span>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"12.5px",
                  color:"var(--wc-muted)" }}>({data.total_reviews} reviews)</span>
              </div>
              {/* Google attribution — required by Places API policy: must be
                  clearly visible, never removed/altered/hidden, and must
                  identify Google Maps as the content source. */}
              <a href={data.google_maps_url || "https://maps.google.com"} target="_blank" rel="noopener noreferrer"
                style={{ display:"flex", alignItems:"center", gap:"7px", textDecoration:"none",
                  background:"#fff", border:"1px solid var(--wc-border)", borderRadius:"50px",
                  padding:"10px 16px", boxShadow:"var(--sh-sm)" }}>
                <span aria-hidden="true" style={{ fontSize:"16px" }}>🔵</span>
                <span translate="no" style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px",
                  fontWeight:"600", color:"#3c4043" }}>
                  Reviews from <span style={{ color:"#4285F4" }}>G</span><span style={{ color:"#EA4335" }}>o</span><span style={{ color:"#FBBC05" }}>o</span><span style={{ color:"#4285F4" }}>g</span><span style={{ color:"#34A853" }}>l</span><span style={{ color:"#EA4335" }}>e</span>
                </span>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", color:"var(--wc-green)" }}>View all →</span>
              </a>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(280px,100%),1fr))", gap:"18px" }}>
              {data.reviews.map((r, i) => (
                <div key={i} style={{ background:"#fff", border:"1px solid var(--wc-border)",
                  borderRadius:"16px", padding:"22px", boxShadow:"var(--sh-sm)",
                  display:"flex", flexDirection:"column", gap:"10px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    {r.author_photo_url ? (
                      <img src={r.author_photo_url} alt="" loading="lazy" referrerPolicy="no-referrer" width="38" height="38"
                        style={{ width:"38px", height:"38px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
                    ) : (
                      <div style={{ width:"38px", height:"38px", borderRadius:"50%", flexShrink:0,
                        background:"#e0f2fe", color:"var(--wc-teal)", display:"flex", alignItems:"center",
                        justifyContent:"center", fontFamily:"'Inter',sans-serif", fontWeight:"700",
                        fontSize:"15px" }}>
                        {(r.author_name||"G").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth:0 }}>
                      {r.profile_url ? (
                        <a href={r.profile_url} target="_blank" rel="noopener noreferrer"
                          style={{ fontFamily:"'Inter',sans-serif", fontSize:"13.5px", fontWeight:"700",
                            color:"var(--wc-navy)", textDecoration:"none", display:"block",
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {r.author_name}
                        </a>
                      ) : (
                        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"13.5px", fontWeight:"700",
                          color:"var(--wc-navy)" }}>{r.author_name}</span>
                      )}
                      <span style={{ color:"#fbbf24", fontSize:"12px" }}>
                        {"★".repeat(r.rating||0)}{"☆".repeat(5-(r.rating||0))}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px", color:"#475569",
                    lineHeight:"1.65", margin:0,
                    display:"-webkit-box", WebkitLineClamp:5, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {r.text}
                  </p>
                  {r.relative_time && (
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", color:"#94a3b8" }}>
                      {r.relative_time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : hasManualReviews ? (
          <div ref={ref}
            style={{
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(24px)",
              transition: "opacity .7s ease, transform .7s ease",
            }}
          >
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(300px,100%),1fr))", gap:"20px" }}>
              {visibleGallery.map((r) => (
                <div key={r.id} style={{ background:"#fff", border:"1px solid var(--wc-border)",
                  borderRadius:"16px", overflow:"hidden", boxShadow:"var(--sh-sm)",
                  display:"flex", flexDirection:"column", transition:"transform .2s, box-shadow .2s" }}>
                  {/* Letterboxed on a light background rather than cropped —
                      admin-uploaded screenshots come in whatever aspect ratio
                      the source (Google Maps / phone screenshot) happened to
                      produce, so object-fit:cover with a fixed height was
                      randomly zooming into the middle of tall screenshots and
                      cutting off the reviewer's actual words. contain shows
                      the whole thing, same as any review-screenshot gallery
                      (Trustpilot, G2, etc.) does. */}
                  <div style={{ width:"100%", aspectRatio:"4 / 3", background:"#f1f5f9",
                    display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                    <img src={r.screenshot_url} alt={r.reviewer_name ? `Google review from ${r.reviewer_name}` : "Google review screenshot"}
                      loading="lazy" onClick={()=>setLightbox(r.screenshot_url)}
                      style={{ width:"100%", height:"100%", objectFit:"contain", cursor:"zoom-in", display:"block" }}/>
                  </div>
                  {/* Seed screenshots already show the reviewer's name and
                      star rating inside the image itself — a name/rating
                      footer here would just repeat what's already visible.
                      Admin-uploaded ones (r.is_seed is unset) keep the
                      original footer since those come through the upload
                      form's separate name/rating fields. */}
                  {!r.is_seed && (
                    <div style={{ padding:"14px 18px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px" }}>
                        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px", fontWeight:"700",
                          color:"var(--wc-navy)" }}>{r.reviewer_name || "Google User"}</span>
                        {r.rating && (
                          <span style={{ color:"#fbbf24", fontSize:"13px" }}>
                            {"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}
                          </span>
                        )}
                      </div>
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", color:"#94a3b8" }}>
                        From Google Reviews
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {galleryReviews.length > REVIEWS_INITIAL_SHOWN && (
              <div style={{ textAlign:"center", marginTop:"32px" }}>
                <button onClick={() => setShowAll(s => !s)}
                  style={{ fontFamily:"'Inter',sans-serif", fontSize:"13.5px", fontWeight:"700",
                    color:"var(--wc-green)", background:"#fff", border:"1.5px solid var(--wc-green)",
                    borderRadius:"50px", padding:"11px 26px", cursor:"pointer" }}>
                  {showAll ? "Show fewer reviews" : `Show all ${galleryReviews.length} reviews →`}
                </button>
              </div>
            )}
            {lightbox && (
              <div onClick={()=>setLightbox(null)}
                style={{ position:"fixed", inset:0, background:"rgba(18,59,74,.85)", zIndex:10000,
                  display:"flex", alignItems:"center", justifyContent:"center", padding:"30px", cursor:"zoom-out" }}>
                <img src={lightbox} alt="" style={{ maxWidth:"100%", maxHeight:"100%", borderRadius:"10px" }}/>
              </div>
            )}
          </div>
        ) : (
          <div ref={ref}
            style={{
              opacity: vis ? 1 : 0,
              transform: vis ? "translateY(0)" : "translateY(24px)",
              transition: "opacity .7s ease, transform .7s ease",
              display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(230px,100%),1fr))", gap: "18px",
            }}
          >
            {POINTS.map(p => (
              <div key={p.label} style={{ background:"#fff", border:"1px solid var(--wc-border)",
                borderRadius:"16px", padding:"26px 22px", boxShadow:"var(--sh-sm)" }}>
                <div style={{ fontSize:"28px", marginBottom:"14px" }}>{p.icon}</div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"15px", fontWeight:"700",
                  color:"var(--wc-navy)", margin:"0 0 6px", lineHeight:1.4 }}>{p.label}</p>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"12.5px", color:"var(--wc-muted)",
                  lineHeight:1.6, margin:0, fontWeight:"300" }}>{p.sub}</p>
              </div>
            ))}
          </div>
        )}
      </W>
    </section>
  );
}

/* ══ DISCLAIMER ══ */
function Disclaimer() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"#fff", padding:"52px 0" }}>
      <W>
        <div ref={ref} className={`reveal${vis?" in":""}`}>
          <div className="disc" style={{ padding:"26px 30px" }}>
            <div style={{ display:"flex",alignItems:"flex-start",gap:"15px" }}>
              <div style={{ width:"42px",height:"42px",background:"#fef9c3",
                border:"1.5px solid #fde047",borderRadius:"10px",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"20px",flexShrink:0 }}>⚖️</div>
              <div>
                <h4 style={{ fontFamily:"'Manrope',sans-serif",fontSize:"20px",
                  fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 9px" }}>{t("home.disclaimer.heading")}</h4>
                <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-muted)",
                  lineHeight:"1.78",margin:"0 0 10px",fontWeight:"300" }}>
                  {t("home.disclaimer.body")}
                </p>
                <a href="/assets/WeCare4All_Compliance_Consent.pdf" target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily:"'Inter',sans-serif",fontSize:"13px",
                    color:"var(--wc-green)",fontWeight:"600",textDecoration:"underline" }}>
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
// Duplicated here (not shared/imported) after CarePlusPromo() etc moved
// to HealthcareConsultancy.jsx — this CTA section stays on the
// homepage, and still needs its own working copy of the button it
// calls. Identical to the one in HealthcareConsultancy.jsx.
function SmartBookButton({ className, label, style }) {
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const isHospitalIntent = role === "patient" &&
    (typeof window !== "undefined" && localStorage.getItem("wc4a_login_portal") === "hospital");
  const handleClick = () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (isHospitalIntent) { navigate("/partner-with-us"); return; }
    if (role === "patient") { navigate("/patient/dashboard"); return; }
    if (role === "admin") { navigate("/doctors"); return; }
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

function CTA() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"linear-gradient(135deg,var(--wc-green-dark),var(--wc-green),var(--wc-green-dark))",
      padding:"78px 28px", textAlign:"center", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",top:"-80px",left:"50%",transform:"translateX(-50%)",
        width:"700px",height:"350px",background:"rgba(255,255,255,.06)",
        borderRadius:"50%",pointerEvents:"none" }} />
      <div ref={ref} className={`reveal${vis?" in":""}`}
        style={{ position:"relative", maxWidth:"580px", margin:"0 auto" }}>
        <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"11px",fontWeight:"700",
          color:"rgba(255,255,255,.65)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"16px" }}>
          {t("home.cta.eyebrow")}
        </p>
        <h2 style={{ fontFamily:"'Manrope',sans-serif",
          fontSize:"clamp(28px,4vw,48px)",fontWeight:"700",color:"#fff",
          margin:"0 0 16px",lineHeight:"1.12" }}>
          {t("home.cta.heading")}
        </h2>
        <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"16px",
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
    "latitude": 13.0335099,
    "longitude": 80.2411259,
  },
  "medicalSpecialty": [
    "Cardiology", "Orthopaedics", "Gynaecology", "Paediatrics",
    "Dermatology", "Neurology", "General Medicine",
  ],
  // Empty until real profile URLs exist — add them here once available
  // (e.g. Facebook/Instagram/LinkedIn pages, and the Google Maps listing
  // URL now available from GET /reviews/google's `google_maps_url` once
  // Google Reviews is configured — see google_reviews.py). These links
  // help Google connect this listing across platforms for richer search
  // results; leaving this empty isn't broken, just a missed opportunity.
  "sameAs": [],
};

export default function Home() {
  // HOME_JSONLD's own "sameAs"/rating comment already flagged this as a
  // "missed opportunity" — the live rating IS available (same
  // GET /reviews/google endpoint the Reviews() section below already
  // calls), it just was never wired into the schema. AggregateRating in
  // JSON-LD is what actually earns the ⭐ stars shown directly in Google
  // search results (a real click-through-rate lever, not cosmetic) —
  // and Google Business Profile already shows 4.8★ (27 reviews) live,
  // so this isn't speculative content, it's real data that was already
  // being fetched one component down and just never reached the <head>.
  // useMemo (not a plain inline object) matters here — SEO.jsx's own
  // header comment explains why: a new object literal on every render
  // re-fires its effect, which used to reset scroll position on any
  // interaction. Memoizing on ratingData keeps the same object
  // reference except on the one real change (null → fetched).
  const [ratingData, setRatingData] = useState(null);
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/reviews/google`);
        const json = await res.json();
        if (json.configured && json.rating && json.total_reviews) {
          setRatingData({
            rating: json.rating,
            count:  json.total_reviews,
            mapsUrl: json.google_maps_url || null,
          });
        }
      } catch { /* no rating yet — HOME_JSONLD's static base still renders fine without it */ }
    })();
  }, []);

  const homeJsonLd = useMemo(() => {
    if (!ratingData) return HOME_JSONLD;
    return {
      ...HOME_JSONLD,
      aggregateRating: {
        "@type": "AggregateRating",
        "ratingValue": ratingData.rating,
        "reviewCount": ratingData.count,
      },
      sameAs: ratingData.mapsUrl ? [ratingData.mapsUrl] : HOME_JSONLD.sameAs,
    };
  }, [ratingData]);

  return (
    <>
      <SEO
        title="We Care 4 'all' — Best Doctors in Chennai | Healthcare Consultancy & Online Consultation"
        path="/"
        description="We Care 4 'all' — because we care, we care for all. A trusted healthcare consultancy in Chennai offering personalized, affordable patient care. Book tele consultation or online consultation with the best doctors in Chennai and India, verified specialists near you, and partner hospitals. Care at its best."
        keywords="we care, we care 4 all, we care for all, care at its best, best doctors in chennai, best doctors in india, best doctors near me, doctors near me, personalized care in chennai, affordable care in chennai, healthcare consultancy in chennai, hospital consultancy, tele consultation, online consultation, patient care"
        jsonLd={homeJsonLd}
      />
      <style>{G}</style>
      <Ticker />
      <Hero />
      <AudienceSplit />
      <HospitalLogoStrip />
      {/* <FounderCredibility /> removed from the homepage (Aug 2026 client
          request) — the "People Behind Your Care" bios (Raman/Vardhini)
          live on /about instead; kept the function defined below in case
          it's wanted elsewhere later (same pattern as HospitalConsultancy()
          just above). */}
      <Services />
      {/* <HospitalConsultancy /> removed from the default homepage
          (Aug 2026 client decision): the site has two clearly separate
          audiences now — Healthcare Consultancy (this default homepage,
          patient-facing) and Hospital Consultancy (its own dedicated
          page at /hospital-consultancy, already a full "home-page-
          style" experience with its own hero/services/team/CTA).
          Promoting Hospital Consultancy content on the default patient
          homepage blurred that separation — a patient landing on "/"
          shouldn't see hospital-partnership content mixed into their
          scroll. The HospitalConsultancy() component function below is
          left defined but unused rather than deleted, in case a
          cross-link back to it is wanted from elsewhere later. */}
      {/* <CarePlusPromo />, <MedicalTourismPromo />, <Specialties />,
          <HowItWorks /> — moved to HealthcareConsultancy.jsx (Aug 2026
          client decision). Homepage stays a lean overview for both
          audiences; the detailed patient content now lives on the
          dedicated page, same relationship Hospital Consultancy's
          content already has with its own page. */}
      <TrustSection />
      <Reviews />
      <Disclaimer />
      <CTA />
      {/* Moved here (client-requested correction, Aug 2026): was directly
          under the hero, now sits just above the Footer (rendered by the
          Layout wrapper in App.jsx right after this page). */}
      <StatsBand />
    </>
  );
}

/* ══ FOUNDER / TEAM CREDIBILITY ══
   Client requirement (Aug 2026 strategy review): "Prominently showcase
   the founder's 16+ years of experience, credentials, awards,
   certifications, publications and healthcare expertise" on the
   homepage — not buried on /about where a first-time visitor may never
   click through.

   Deliberately reuses the SAME aboutPage.team.* i18n keys AboutUs.jsx
   already uses, rather than writing new homepage-only copy — one source
   of truth for founder/team bios, so editing it in one place (translation
   files) keeps both pages in sync automatically. Same real, verifiable
   credentials already on /about (IIM Trichy, Suyasakthi 2023, published
   papers) — nothing new invented here, per the site's existing "no
   fabricated claims" discipline (see Reviews section above). */
const FOUNDER_TRUST_IDS = [
  { id:"raman",    img:"/assets/img/about/1.jpg", name:"R.V. Raman",       color:"var(--wc-green)", badgeColor:"var(--wc-green)" },
  { id:"vardhini", img:"/assets/img/about/9.png", name:"Vardhini Karthik", color:"var(--wc-teal)", badgeColor:"var(--wc-teal)" },
];
function FounderCredibility() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"var(--wc-warm-white)", padding:"64px 0", borderBottom:"1px solid var(--border)" }}>
      <W>
        <div style={{ textAlign:"center", marginBottom:"36px" }}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", fontWeight:"700",
            color:"var(--wc-green)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>
            {t("home.founderTrust.eyebrow")}
          </p>
          <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"clamp(24px,3.5vw,36px)",
            fontWeight:"700", color:"var(--wc-navy)", margin:"0 0 10px" }}>
            {t("home.founderTrust.heading")}
          </h2>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"14.5px", color:"var(--wc-muted)",
            maxWidth:"540px", margin:"0 auto", lineHeight:1.7, fontWeight:"300" }}>
            {t("home.founderTrust.sub")}
          </p>
        </div>

        <div ref={ref} className={`team-grid stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"20px", marginBottom:"28px" }}>
          {FOUNDER_TRUST_IDS.map(({ id, img, name, color, badgeColor }) => {
            const tags   = t(`aboutPage.team.${id}.tags`, { returnObjects:true });
            const awards = t(`aboutPage.team.${id}.awards`, { defaultValue:"" });
            return (
              <div key={id} className="team-card" style={{
                background:"#fff", border:"1px solid var(--wc-border)", borderRadius:"16px",
                padding:"26px", boxShadow:"0 2px 12px rgba(18,59,74,.06)",
                display:"flex", gap:"20px", alignItems:"flex-start", transition:"all .25s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(18,59,74,.12)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(18,59,74,.06)";}}>
                <div style={{ flexShrink:0, position:"relative" }}>
                  <img loading="lazy" width="88" height="110" src={img} alt={name} style={{
                    width:"88px", height:"110px", borderRadius:"10px", objectFit:"cover",
                    objectPosition:"center top", border:`2.5px solid ${color}`, display:"block",
                  }} onError={e=>{ e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
                  <div style={{ width:"88px", height:"110px", borderRadius:"10px",
                    background:`linear-gradient(135deg,${color},${color}88)`, display:"none",
                    alignItems:"center", justifyContent:"center", fontSize:"30px", fontWeight:"700",
                    color:"#fff", fontFamily:"'Manrope',sans-serif", border:`2.5px solid ${color}` }}>
                    {name[0]}
                  </div>
                  <span style={{ position:"absolute", bottom:"-7px", left:"50%", transform:"translateX(-50%)",
                    background:badgeColor, color:"#fff", fontSize:"8px", fontWeight:"700", padding:"2px 7px",
                    borderRadius:"50px", fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap" }}>
                    {t(`aboutPage.team.${id}.badge`)}
                  </span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:"'Manrope',sans-serif", fontSize:"17px",
                    fontWeight:"700", color:"var(--wc-navy)", margin:"0 0 2px" }}>{name}</p>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", fontWeight:"600",
                    color, margin:"0 0 7px" }}>{t(`aboutPage.team.${id}.role`)}</p>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"12px", color:"var(--wc-muted)",
                    lineHeight:"1.6", margin:"0 0 7px", fontWeight:"300" }}>
                    {t(`aboutPage.team.${id}.bio`)}
                  </p>
                  {awards && <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"10px",
                    color:"#92400e", background:"#fffbeb", border:"1px solid #fde68a",
                    borderRadius:"6px", padding:"4px 8px", margin:"0 0 7px", lineHeight:"1.5" }}>
                    {awards}
                  </p>}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                    {tags.map(tag => (
                      <span key={tag} style={{ fontFamily:"'Inter',sans-serif", fontSize:"9.5px",
                        fontWeight:"600", color, background:`${color}14`, padding:"2px 7px",
                        borderRadius:"50px" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* "Read our full story →" link to /about used to sit here.
            Removed (Aug 2026 client clarification): /about is
            conceptually part of the Hospital Consultancy experience,
            not Healthcare Consultancy — it has its own dedicated
            "Team / About Us" section already built into
            HospitalConsultancy.jsx for that audience. A patient
            browsing the default (Healthcare Consultancy) homepage
            shouldn't be routed to a hospital-facing story page, so
            this section now just shows the founder cards themselves
            with no further link out. */}
      </W>
    </section>
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

  // Auto-scrolling marquee only makes sense once there are enough distinct
  // cards that tripling them doesn't just repeat the SAME hospital back to
  // back (e.g. "MEDCARE 2 · MEDCARE 2 · MEDCARE 2" scrolling by) — that read
  // as broken/spammy rather than as a healthy partner network. Below that
  // threshold, show a static, centered, non-looping row of the real
  // partners instead — honest about how many there are and still polished.
  const MARQUEE_MIN = 4;
  const useMarquee = hospitals.length >= MARQUEE_MIN;
  const doubled = useMarquee ? [...hospitals, ...hospitals, ...hospitals] : hospitals;

  return (
    <section style={{
      background:"linear-gradient(180deg,var(--wc-navy-deep) 0%,var(--wc-navy-deepest) 100%)",
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
        .hs-static{
          animation:none;width:100%;flex-wrap:wrap;
          justify-content:center;padding:0 24px 4px;
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
        .hs-fade-l{ left:0;background:linear-gradient(90deg,var(--wc-navy-deep),transparent); }
        .hs-fade-r{ right:0;background:linear-gradient(270deg,var(--wc-navy-deep),transparent); }
      `}</style>

      <div style={{
        padding:"22px 24px 16px",
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"32px",height:"2px",
            background:"linear-gradient(90deg,var(--wc-green-lighter),transparent)"}}/>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"10.5px",fontWeight:"700",
            color:"rgba(52,211,153,.85)",letterSpacing:"2.5px",
            textTransform:"uppercase",margin:0}}>
            Verified Partner Hospitals
          </p>
          <div style={{width:"32px",height:"2px",
            background:"linear-gradient(90deg,transparent,var(--wc-green-lighter))"}}/>
        </div>
        <a href="/our-hospitals" style={{
          display:"inline-flex",alignItems:"center",gap:"6px",
          fontFamily:"'Inter',sans-serif",fontSize:"12px",fontWeight:"700",
          color:"var(--wc-green-lighter)",textDecoration:"none",
          border:"1px solid rgba(52,211,153,.3)",
          padding:"6px 16px",borderRadius:"50px",
          background:"rgba(52,211,153,.06)",
          transition:"all .2s",
        }}>
          View All →
        </a>
      </div>

      {/* Marquee (few partners: static centered row, no fake-looking loop) */}
      <div style={{position:"relative",overflow:"hidden",paddingBottom:"22px"}}>
        {useMarquee && <div className="hs-fade-l"/>}
        {useMarquee && <div className="hs-fade-r"/>}
        <div className={useMarquee ? "hs-track" : "hs-track hs-static"}>
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
                      : "linear-gradient(135deg,var(--wc-green-dark),var(--wc-green-light))",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  {!heroImg && (
                    <>
                      <div style={{position:"absolute",inset:0,opacity:.5,
                        backgroundImage:"repeating-linear-gradient(135deg,rgba(255,255,255,.09) 0 2px,transparent 2px 9px)"}}/>
                      <span style={{position:"relative",fontSize:"20px",filter:"drop-shadow(0 1px 2px rgba(0,0,0,.25))"}}>🏥</span>
                      <span style={{position:"absolute",bottom:"3px",right:"4px",
                        fontFamily:"'Inter',sans-serif",fontSize:"10px",fontWeight:"800",
                        color:"rgba(255,255,255,.75)"}}>{initial}</span>
                    </>
                  )}
                  {hasVideo && (
                    <div style={{position:"absolute",inset:0,background:"rgba(18,59,74,.3)",
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
                  <p style={{fontFamily:"'Inter',sans-serif",fontWeight:"700",
                    fontSize:"13px",color:"#fff",margin:"0 0 3px",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {h.hospital_name || "Partner Hospital"}
                  </p>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",flexWrap:"wrap"}}>
                    <span style={{
                      display:"inline-flex",alignItems:"center",gap:"3px",
                      fontFamily:"'Inter',sans-serif",fontSize:"9.5px",fontWeight:"700",
                      color: isStrat ? "#93c5fd" : "var(--wc-green-lighter)",
                      background: isStrat ? "rgba(59,130,246,.12)" : "rgba(52,211,153,.1)",
                      border: isStrat ? "1px solid rgba(59,130,246,.25)" : "1px solid rgba(52,211,153,.2)",
                      padding:"2px 7px",borderRadius:"50px",
                    }}>
                      {isStrat ? "★ Strategic" : "✦ Growth"}
                    </span>
                    {hasVideo && (
                      <span style={{
                        display:"inline-flex",alignItems:"center",gap:"3px",
                        fontFamily:"'Inter',sans-serif",fontSize:"9.5px",fontWeight:"700",
                        color:"#93c5fd",
                      }}>
                        ▶ Watch
                      </span>
                    )}
                    {specs[0] && (
                      <span style={{fontFamily:"'Inter',sans-serif",fontSize:"10px",
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
