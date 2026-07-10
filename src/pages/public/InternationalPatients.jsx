import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/SEO";
import { useScrollAnimation, useCountUp } from "../../hooks/useScrollAnimation";
import { COLORS } from "../../theme";

/* ============================== ICON SYSTEM ============================== */
/* Lightweight, consistent stroke-icon set — no external dependency needed. */
const ICON_PATHS = {
  globe:       <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z"/></>,
  award:       <><circle cx="12" cy="8" r="5"/><path d="M8.5 12.5 7 21l5-2.5L17 21l-1.5-8.5"/></>,
  hospital:    <><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6"/><path d="M12 9v4M10 11h4"/></>,
  clock:       <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
  userCheck:   <><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7"/><path d="M15 12l2 2 4-4"/></>,
  heartPulse:  <><path d="M20 12.5c0 4.5-8 8-8 8s-8-3.5-8-8a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8z"/><path d="M5.5 12h2l1.5-3 2 6 1.5-3h3.5"/></>,
  tag:         <><path d="M12.6 2H4a2 2 0 0 0-2 2v8.6c0 .5.2 1 .6 1.4l9 9c.8.8 2 .8 2.8 0l7.6-7.6c.8-.8.8-2 0-2.8l-9-9c-.4-.4-.9-.6-1.4-.6z"/><circle cx="8" cy="8" r="1.6"/></>,
  check:       <path d="M20 6 9 17l-5-5"/>,
  fileText:    <><path d="M6 2h8l5 5v15H6z"/><path d="M14 2v6h6M8.5 13h7M8.5 17h7M8.5 9.2h3"/></>,
  search:      <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
  folder:      <path d="M3 7a2 2 0 0 1 2-2h4.2l2 2.2H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>,
  compass:     <><circle cx="12" cy="12" r="9"/><path d="M15.2 8.8l-2.1 5.5-5.5 2.1 2.1-5.5 5.5-2.1z"/></>,
  shieldCheck: <><path d="M12 2.5l7.5 3.6v5.4c0 5-3.2 8.9-7.5 10.4-4.3-1.5-7.5-5.4-7.5-10.4V6.1L12 2.5z"/><path d="M8.7 12.2l2.2 2.2 4.4-4.4"/></>,
  laptop:      <><rect x="3" y="4.5" width="18" height="11" rx="1.4"/><path d="M2 19.5h20"/></>,
  clipboard:   <><rect x="6" y="4" width="12" height="17" rx="1.6"/><path d="M9 2.2h6v3.6H9zM8.5 11h7M8.5 15h7"/></>,
  plane:       <path d="M2.5 15.4l19-8.4-8.4 19-2-8.6-8.6-2z"/>,
  home:        <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.2V20h13v-9.8"/></>,
  message:     <path d="M4 4.5h16v12.4H8.6L4 21V4.5z"/>,
  handshake:   <><path d="M7.5 12.5l2.6 2.6 5.7-5.7M2 12.2l4.6-4.6 3.6.9M22 12.2l-4.6-4.6-3.6.9"/></>,
  ambulance:   <><rect x="2" y="9.5" width="13.5" height="7.5" rx="1"/><path d="M15.5 12h4l2.5 3v2h-6.5z"/><path d="M6.2 10.8v4M4.3 12.8h3.8"/><circle cx="6.7" cy="19" r="1.6"/><circle cx="18" cy="19" r="1.6"/></>,
  landmark:    <><path d="M3 21h18M4 21V9.5l8-6 8 6V21M9.5 21v-6.5h5V21"/></>,
  quote:       <path d="M7.2 6.5h4.4v6.4l-3 5.6H5.3l2.2-5.6H7.2V6.5zm9.2 0h4.4v6.4l-3 5.6h-3.3l2.2-5.6h1.7V6.5z"/>,
  arrowRight:  <path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5"/>,
  users:       <><circle cx="9" cy="8" r="4"/><path d="M1.6 21c0-4 3.3-7.2 7.4-7.2s7.4 3.2 7.4 7.2"/><circle cx="17.2" cy="8.4" r="3"/><path d="M22.4 21c0-3.1-2-5.7-5-6.7"/></>,
  trending:    <><path d="M3 17l6-6.2 4 4L21.5 6"/><path d="M15.5 6h6v6"/></>,
  mapPin:      <><path d="M12 21.5s7.2-6.6 7.2-12.2a7.2 7.2 0 1 0-14.4 0c0 5.6 7.2 12.2 7.2 12.2z"/><circle cx="12" cy="9.3" r="2.6"/></>,
  plus:        <path d="M12 5v14M5 12h14"/>,
  stethoscope: <><path d="M6 3.5v6a4.2 4.2 0 0 0 8.4 0v-6"/><path d="M18.2 9v2.2a6.6 6.6 0 0 1-13.2 0"/><circle cx="18.4" cy="6.4" r="1.9"/></>,
  activity:    <path d="M3 12h4l2-7.5 4 15L15.5 12H21"/>,
  shield:      <path d="M12 2.5l7.5 3.6v5.4c0 5-3.2 8.9-7.5 10.4-4.3-1.5-7.5-5.4-7.5-10.4V6.1L12 2.5z"/>,
  sparkle:     <path d="M12 2.5l1.8 5.9L20 10l-6.2 1.6L12 17.5l-1.8-5.9L4 10l6.2-1.6L12 2.5z"/>,
};
function Icon({ name, size = 22, style, ...p }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={style} {...p}>
      {ICON_PATHS[name]}
    </svg>
  );
}
function IconTile({ name, bg, fg, size = 46 }) {
  return (
    <div className="icon-tile" style={{ width: size, height: size, background: bg, color: fg }}>
      <Icon name={name} size={Math.round(size * 0.46)} />
    </div>
  );
}

/* ============================== GLOBAL STYLES ============================== */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

.ip{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;background:#fff;}
.ip *{box-sizing:border-box;}
.ip a{text-decoration:none;}
.ip h1,.ip h2,.ip h3{font-family:'Cormorant Garamond',Georgia,serif;}

@keyframes ipFadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes ipFloat{0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-22px) translateX(10px)}}
@keyframes ipFloatSlow{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes ipPulse{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}
@keyframes ipShimmer{0%{background-position:-300% 0}100%{background-position:300% 0}}
@keyframes ipSpinSlow{to{transform:rotate(360deg)}}
@keyframes ipGradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes ipDash{to{stroke-dashoffset:0}}

.reveal{opacity:0;transform:translateY(30px);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1);}
.reveal.in{opacity:1;transform:translateY(0);}
.reveal-l{opacity:0;transform:translateX(-34px);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1);}
.reveal-l.in{opacity:1;transform:translateX(0);}
.reveal-r{opacity:0;transform:translateX(34px);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1);}
.reveal-r.in{opacity:1;transform:translateX(0);}
.stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1);}
.stagger.in>*{opacity:1;transform:translateY(0);}
.stagger.in>*:nth-child(1){transition-delay:.03s} .stagger.in>*:nth-child(2){transition-delay:.08s}
.stagger.in>*:nth-child(3){transition-delay:.13s} .stagger.in>*:nth-child(4){transition-delay:.18s}
.stagger.in>*:nth-child(5){transition-delay:.23s} .stagger.in>*:nth-child(6){transition-delay:.28s}
.stagger.in>*:nth-child(7){transition-delay:.33s} .stagger.in>*:nth-child(8){transition-delay:.38s}

.ip-card{transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s ease,border-color .35s ease;}
.ip-card:hover{transform:translateY(-6px);}
.ip-card-glow:hover{box-shadow:0 20px 44px -12px rgba(4,120,87,.28)!important;border-color:#6ee7b7!important;}
.ip-card-glow-blue:hover{box-shadow:0 20px 44px -12px rgba(29,78,216,.28)!important;border-color:#93c5fd!important;}

.icon-tile{border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .35s cubic-bezier(.16,1,.3,1);}
.ip-card:hover .icon-tile{transform:scale(1.1) rotate(-4deg);}

.glass{background:rgba(255,255,255,.08);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.16);}
.glass-light{background:rgba(255,255,255,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.6);}

.btn-p{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:9px;background:linear-gradient(135deg,#047857,#059669);color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;padding:14px 30px;border-radius:10px;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(4,120,87,.38);transition:all .3s cubic-bezier(.16,1,.3,1);text-decoration:none;}
.btn-p:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(4,120,87,.48);}
.btn-p svg{transition:transform .3s ease;}
.btn-p:hover svg{transform:translateX(4px);}
.btn-ol{display:inline-flex;align-items:center;gap:9px;background:rgba(255,255,255,.05);color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;padding:13px 28px;border-radius:10px;border:1.5px solid rgba(255,255,255,.30);text-decoration:none;transition:all .3s cubic-bezier(.16,1,.3,1);backdrop-filter:blur(8px);}
.btn-ol:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.6);transform:translateY(-3px);}

.blob{position:absolute;border-radius:50%;filter:blur(60px);pointer-events:none;}

.stat-card{transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s ease;}
.stat-card:hover{transform:translateY(-8px);}

.ip-table-wrap{border-radius:18px;overflow:hidden;box-shadow:0 20px 50px -18px rgba(11,31,58,.22);border:1px solid #e2eaf4;}
.ip-table{width:100%;border-collapse:collapse;}
.ip-table th{font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:700;color:#fff;background:linear-gradient(135deg,#0b1f3a,#112d52);text-align:left;padding:16px 18px;text-transform:uppercase;letter-spacing:.6px;}
.ip-table td{font-family:'DM Sans',sans-serif;font-size:13.5px;color:#334155;padding:15px 18px;border-bottom:1px solid #eef2f7;transition:background .2s ease;}
.ip-table tr:nth-child(even) td{background:#f8fafc;}
.ip-table tr:hover td{background:#f0fdf4;}
.ip-table td:first-child{font-weight:700;color:#0b1f3a;}
.ip-table .ok{color:#047857;font-weight:700;}
.ip-table .no{color:#94a3b8;}

.acc-item{border:1px solid #e2eaf4;border-radius:14px;overflow:hidden;background:#fff;transition:border-color .3s ease,box-shadow .3s ease;}
.acc-item.open{border-color:#86efac;box-shadow:0 10px 30px -14px rgba(4,120,87,.25);}
.acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 22px;background:transparent;border:none;cursor:pointer;text-align:left;}
.acc-plus{flex-shrink:0;width:30px;height:30px;border-radius:50%;background:#f0fdf4;color:#047857;display:flex;align-items:center;justify-content:center;transition:transform .35s cubic-bezier(.16,1,.3,1),background .3s ease;}
.acc-item.open .acc-plus{transform:rotate(135deg);background:#047857;color:#fff;}
.acc-panel-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s cubic-bezier(.16,1,.3,1);}
.acc-item.open .acc-panel-wrap{grid-template-rows:1fr;}
.acc-panel-inner{overflow:hidden;}

.ip-timeline-line{position:absolute;left:27px;top:8px;bottom:8px;width:2px;background:linear-gradient(#d1fae5,#86efac,#d1fae5);}
.ip-timeline-dot{transition:transform .3s ease,box-shadow .3s ease;}
.ip-timeline-row:hover .ip-timeline-dot{transform:scale(1.12);box-shadow:0 0 0 6px rgba(4,120,87,.12);}

.ip-badge-pill{display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:50px;transition:transform .3s ease,background .3s ease;}
.ip-badge-pill:hover{transform:translateY(-2px);}

.shine{position:relative;overflow:hidden;}
.shine::after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.4) 50%,transparent 60%);background-size:250% 100%;animation:ipShimmer 4.5s linear infinite;}

@media(max-width:900px){
  .ip-g2{grid-template-columns:1fr!important;}
  .ip-g3{grid-template-columns:1fr 1fr!important;}
  .ip-g4{grid-template-columns:1fr 1fr!important;}
  .ip-stats{grid-template-columns:1fr 1fr!important;}
  .ip-table{font-size:12px;}
  .ip-hero-h1{font-size:40px!important;}
}
@media(max-width:600px){
  .ip-g3{grid-template-columns:1fr!important;}
  .ip-g4{grid-template-columns:1fr!important;}
  .ip-stats{grid-template-columns:1fr 1fr!important;gap:12px!important;}
  .ip-table th,.ip-table td{padding:11px 9px;font-size:11.5px;}
  .ip-hero-h1{font-size:32px!important;}
  .ip-hide-mobile{display:none!important;}
}
`;

const W = ({ children, s = {} }) => <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>;

const Eyebrow = ({ children, c = "#047857", icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
    {icon && <Icon name={icon} size={15} style={{ color: c }} />}
    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11.5px", fontWeight: "700", color: c,
      letterSpacing: "2.2px", textTransform: "uppercase", margin: 0 }}>{children}</p>
  </div>
);

/* ============================== CONTENT DATA ============================== */
const WHY_INDIA = [
  { ic: "stethoscope", t: "Internationally trained and experienced specialists" },
  { ic: "activity", t: "Modern diagnostic and surgical technologies" },
  { ic: "trending", t: "High clinical success rates across multiple specialties" },
  { ic: "tag", t: "Significantly lower treatment costs compared to many countries" },
  { ic: "clock", t: "Shorter waiting times for consultations and procedures" },
  { ic: "message", t: "English-speaking healthcare professionals and coordinators" },
];

const COMPARISON = [
  ["Treatment Cost", "Substantially lower", "Significantly higher"],
  ["Waiting Period", "Minimal or no waiting", "Often prolonged"],
  ["Consultant Access", "Direct access to senior doctors", "Limited availability"],
  ["Care Model", "Personalized", "Protocol-driven"],
  ["Recovery Environment", "Supportive and holistic", "Primarily clinical"],
];

const VETTING = [
  { ic: "award", t: "EURO CERT Accreditation", d: "Our platform and empanelment process are EURO CERT accredited, reflecting independently reviewed quality and safety standards." },
  { ic: "fileText", t: "Documented Credentialing", d: "Every partner hospital's specialists, infrastructure, and accreditations are verified and recorded before empanelment — not taken on their word." },
  { ic: "search", t: "Ongoing Monitoring", d: "Partnerships are reviewed periodically, not just at onboarding — standards need to hold up over time, not just on day one." },
  { ic: "folder", t: "Transparent Records", d: "Accreditation and specialty information for each partner hospital is available to you before you commit to treatment there." },
];

const OUR_ROLE = [
  "Act solely in the patient's interest",
  "Provide unbiased medical guidance",
  "Simplify complex healthcare decisions",
  "Ensure transparency across treatment planning and execution",
];

const CARE_MODEL = [
  "We do not operate as a hospital sales channel",
  "We are not driven by institutional occupancy or revenue targets",
  "Treatment recommendations are independent of commercial incentives",
];

const FEE_STRUCTURE = [
  "Our professional service fee is 25%, disclosed upfront",
  "The fee is collected directly from the patient",
  "Hospitals and specialists are paid only for medical services rendered",
  "No bundled referral costs or undisclosed markups",
];

const SERVICES = [
  { ic: "laptop",    t: "Online Consultation",  d: "Medical consultations and case evaluation before you travel" },
  { ic: "clipboard", t: "Treatment Planning",    d: "Personalized treatment planning and transparent cost estimation" },
  { ic: "fileText",  t: "Medical Visa Guidance", d: "Visa invitation letters and complete documentation support" },
  { ic: "hospital",  t: "Hospital Assistance",   d: "Appointment scheduling and coordination with your chosen hospital" },
  { ic: "plane",     t: "Travel Support",        d: "Airport pickup and complete transportation support in India" },
  { ic: "home",      t: "Accommodation",         d: "Stay arrangements for patients and accompanying attendants" },
  { ic: "message",   t: "Interpreter Support",   d: "Language assistance so nothing is lost between you and your care team" },
  { ic: "handshake", t: "Follow-Up Care",        d: "Ongoing treatment follow-up and coordination after you're discharged" },
];

const JOURNEY = [
  { n: "01", t: "Enquiry & Case Review",     d: "Share your medical reports with us. Our team reviews your case and connects you with the right specialist for an initial opinion." },
  { n: "02", t: "Treatment Plan & Estimate",  d: "Once the specialist confirms a plan, we prepare a transparent cost estimate covering treatment, stay, and our coordination fee." },
  { n: "03", t: "Visa & Travel Arrangements", d: "We issue your medical visa invitation letter and help you plan flights, so paperwork never holds up your care." },
  { n: "04", t: "Arrival & Admission",        d: "Airport pickup, interpreter, and accommodation are arranged before you land. We accompany you through hospital admission." },
  { n: "05", t: "Treatment & Recovery",       d: "Your treatment proceeds under the specialist's care, with our team coordinating logistics and checking in throughout." },
  { n: "06", t: "Departure & Follow-Up",      d: "Once you're cleared to travel, we help plan your return and stay connected for follow-up consultations from home." },
];

const FAQS = [
  { q: "How do I get a medical opinion before deciding to travel?",
    a: "Share your existing medical reports and scans with us online. We connect you with an appropriate specialist for a video consultation so you have clarity on your treatment plan before committing to travel." },
  { q: "Is the total cost disclosed before I travel?",
    a: "Yes. Once your treatment plan is confirmed, you receive a written estimate covering hospital charges and our coordination fee separately, so there's no ambiguity about what you're paying for." },
  { q: "Do you help with the medical visa?",
    a: "Yes — we issue the hospital invitation letter you'll need for your visa application and guide you through the documentation. The final visa approval is issued by Indian consular authorities." },
  { q: "Can a family member or attendant travel with me?",
    a: "Yes, accompanying attendants are common. We factor this into accommodation and travel planning, and attendant visas follow the same invitation-letter process." },
  { q: "What happens if I need urgent transfer to a different hospital?",
    a: "For time-critical cases, we're empanelled with Air Ambulance services for medically supervised transfers — see Emergency Transfers below." },
  { q: "Do you provide interpreter support during hospital visits?",
    a: "Yes, language assistance is arranged for consultations and hospital stays so nothing is lost in communication with your care team." },
];

/* ============================== SUBCOMPONENTS ============================== */
function FAQAccordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {items.map(({ q, a }, i) => {
        const isOpen = open === i;
        return (
          <div key={q} className={`acc-item${isOpen ? " open" : ""}`}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} className="acc-btn">
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", fontWeight: "600", color: "#0b1f3a" }}>{q}</span>
              <span className="acc-plus"><Icon name="plus" size={16} /></span>
            </button>
            <div className="acc-panel-wrap">
              <div className="acc-panel-inner">
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#64748b",
                  lineHeight: "1.75", fontWeight: "300", margin: 0, padding: "0 22px 20px" }}>{a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCounter({ icon, target, suffix = "", label }) {
  const [ref, visible] = useScrollAnimation();
  const count = useCountUp(target, 1700, visible);
  return (
    <div ref={ref} className="stat-card glass" style={{ borderRadius: "18px", padding: "26px 20px", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px", color: "#6ee7b7" }}>
        <Icon name={icon} size={26} />
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,4vw,38px)", fontWeight: "700", color: "#fff", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,.65)", marginTop: "6px", letterSpacing: ".3px" }}>{label}</div>
    </div>
  );
}

/* ============================== PAGE ============================== */
export default function InternationalPatients() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [r1, v1] = useScrollAnimation();
  const [r2, v2] = useScrollAnimation();
  const [r3, v3] = useScrollAnimation();
  const [r4, v4] = useScrollAnimation();

  return (
    <div className="ip">
      <style>{G}</style>
      <SEO title="International Patients — Medical Tourism in India" path="/international-patients"
        description="Medical tourism to India with We Care 4 'all' — treatment planning, medical visa guidance, hospital coordination, accommodation, travel and interpreter support, and follow-up care for international patients."
        keywords="medical tourism India, international patient treatment, medical visa India, healthcare for foreigners India, treatment abroad India, best hospital for international patients Chennai, medical tourism Chennai, affordable treatment India, second opinion doctor India, air ambulance India, interpreter support hospital India, medical tourism company India, India medical visa invitation letter, treatment cost estimate India, best hospitals for foreign patients India, international patient coordinator India, medical tourism package India, healthcare travel India, cross-border healthcare India, Africa patients treatment India, Middle East patients treatment India, India hospital for NRI patients, medical tourism facilitator Chennai, foreign patient care coordinator, best affordable surgery India, world class hospitals India, international patient services Chennai"
        jsonLd={{
          "@type": "FAQPage",
          "mainEntity": FAQS.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a },
          })),
        }} />

      {/* ===== Hero ===== */}
      <section style={{ background: `linear-gradient(-45deg,${COLORS.navyDark},${COLORS.navy},#0a2e52,#062818,${COLORS.navy})`,
        backgroundSize: "300% 300%", animation: "ipGradShift 16s ease infinite",
        paddingTop: "40px", position: "relative", overflow: "hidden" }}>

        {/* dot texture */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.035) 1px,transparent 1px)", backgroundSize: "34px 34px", pointerEvents: "none" }} />
        {/* floating blobs */}
        <div className="blob" style={{ width: "460px", height: "460px", top: "-160px", right: "-120px",
          background: "radial-gradient(circle,rgba(16,185,129,.30),transparent 70%)", animation: "ipFloat 11s ease-in-out infinite" }} />
        <div className="blob" style={{ width: "360px", height: "360px", bottom: "-140px", left: "-100px",
          background: "radial-gradient(circle,rgba(14,116,144,.28),transparent 70%)", animation: "ipFloat 13s ease-in-out infinite reverse" }} />
        <div className="blob ip-hide-mobile" style={{ width: "220px", height: "220px", top: "30%", right: "18%",
          background: "radial-gradient(circle,rgba(124,58,237,.20),transparent 70%)", animation: "ipFloatSlow 8s ease-in-out infinite" }} />

        <W s={{ padding: "48px 24px 0", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "22px" }}>
            <Link to="/" style={{ color: "rgba(255,255,255,.5)", fontSize: "13px", fontFamily: "'DM Sans',sans-serif" }}>Home</Link>
            <span style={{ color: "rgba(255,255,255,.25)" }}>/</span>
            <span style={{ color: "#6ee7b7", fontSize: "13px", fontFamily: "'DM Sans',sans-serif" }}>International Patients</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "40px", alignItems: "center" }} className="ip-g2">
            <div style={{ animation: "ipFadeUp .8s cubic-bezier(.16,1,.3,1) both" }}>
              <div className="ip-badge-pill glass" style={{ display: "inline-flex", marginBottom: "20px" }}>
                <Icon name="sparkle" size={14} style={{ color: "#6ee7b7" }} />
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", fontWeight: "700", color: "#fff", letterSpacing: ".4px" }}>MEDICAL TOURISM, DONE RIGHT</span>
              </div>
              <h1 className="ip-hero-h1" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(36px,5vw,60px)", fontWeight: "700", color: "#fff", lineHeight: "1.08", marginBottom: "18px" }}>
                Welcome to India<br /><span style={{ background: "linear-gradient(90deg,#34d399,#6ee7b7,#34d399)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "ipGradShift 4s ease infinite" }}>The Healthcare Hub.</span>
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "17px", color: "rgba(255,255,255,.68)", lineHeight: "1.78", maxWidth: "560px", fontWeight: "300", marginBottom: "32px" }}>
                We connect international patients with India's trusted healthcare ecosystem — the right
                treatment, at the right time, in the right place. From your first medical opinion to a safe
                return home, we manage the entire journey with transparency, clinical integrity, and empathy.
              </p>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "34px" }}>
                <Link to="/doctors" className="btn-p">Book a Consultation <Icon name="arrowRight" size={17} /></Link>
                <Link to="/contact" className="btn-ol">Contact Us</Link>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {[
                  { icon: "award", label: "EURO CERT Accredited" },
                  { icon: "hospital", label: "50+ Partner Hospitals" },
                  { icon: "message", label: "Multilingual Care Coordination" },
                ].map(({ icon, label }) => (
                  <div key={label} className="ip-badge-pill glass">
                    <Icon name={icon} size={14} style={{ color: "#6ee7b7" }} />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", fontWeight: "600", color: "rgba(255,255,255,.88)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative side card */}
            <div className="ip-hide-mobile" style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div className="glass shine" style={{ borderRadius: "24px", padding: "34px 30px", maxWidth: "340px", position: "relative", boxShadow: "0 30px 70px -20px rgba(0,0,0,.5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
                  <div className="icon-tile" style={{ width: "48px", height: "48px", background: "rgba(52,211,153,.18)", color: "#6ee7b7" }}>
                    <Icon name="heartPulse" size={22} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", fontWeight: "700", color: "#fff", margin: 0 }}>Guided End-to-End</p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11.5px", color: "rgba(255,255,255,.55)", margin: 0 }}>Every step, coordinated</p>
                  </div>
                </div>
                {["Case review & specialist match", "Transparent, itemized estimate", "Visa, travel & stay arranged", "Follow-up after you're home"].map((t, i) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,.09)" }}>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(52,211,153,.16)", color: "#6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="check" size={12} />
                    </span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "rgba(255,255,255,.78)" }}>{t}</span>
                  </div>
                ))}
              </div>
              <div className="blob" style={{ width: "120px", height: "120px", top: "-24px", right: "-10px",
                background: "radial-gradient(circle,rgba(52,211,153,.5),transparent 70%)", animation: "ipPulse 3.2s ease-in-out infinite" }} />
            </div>
          </div>

          {/* Stat bar — overlaps into next section */}
          <div className="ip-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px",
            marginTop: "56px", transform: "translateY(50%)", position: "relative", zIndex: 2 }}>
            <StatCounter icon="hospital"    target={50} suffix="+" label="Partner Hospitals" />
            <StatCounter icon="stethoscope" target={40} suffix="+" label="Specialties Covered" />
            <StatCounter icon="compass"     target={6}  suffix=""  label="Step Guided Journey" />
            <StatCounter icon="shieldCheck" target={25} suffix="%" label="Transparent Fee, No Hidden Costs" />
          </div>
        </W>
        <div style={{ height: "64px" }} />
      </section>

      {/* ===== Why choose India ===== */}
      <section style={{ background: "#f0f6fc", padding: "112px 0 76px" }}>
        <W>
          <div ref={r1} className={`reveal${v1 ? " in" : ""}`} style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center", marginBottom: "44px" }}>
            <Eyebrow icon="globe">Why India</Eyebrow>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 14px" }}>
              World-Class Healthcare, Compassionately Delivered
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", color: "#64748b", lineHeight: "1.8", fontWeight: "300" }}>
              India has become a leading global destination for medical travel — a balanced combination
              of medical expertise, advanced infrastructure, and affordability, where outcomes and access
              matter as much as cost.
            </p>
          </div>
          <div className="ip-g3 stagger in" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "18px" }}>
            {WHY_INDIA.map(({ ic, t }) => (
              <div key={t} className="ip-card ip-card-glow" style={{ background: "#fff", border: "1px solid #e2eaf4",
                borderRadius: "16px", padding: "22px 22px", boxShadow: "0 2px 10px rgba(11,31,58,.05)",
                display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <IconTile name={ic} bg="#f0fdf4" fg="#047857" size={44} />
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.8px", color: "#334155", lineHeight: "1.6", margin: 0, fontWeight: "500", paddingTop: "4px" }}>{t}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* ===== Comparison table ===== */}
      <section style={{ background: "#fff", padding: "80px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow icon="activity">The Comparison</Eyebrow></div>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: "700", color: "#0b1f3a", margin: 0 }}>India Compared With Other Countries</h2>
          </div>
          <div className="ip-table-wrap">
            <table className="ip-table">
              <thead><tr><th>Key Aspect</th><th>India</th><th>Many Other Countries</th></tr></thead>
              <tbody>
                {COMPARISON.map(([aspect, india, other]) => (
                  <tr key={aspect}>
                    <td>{aspect}</td>
                    <td className="ok"><span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Icon name="check" size={14} />{india}</span></td>
                    <td className="no">{other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#94a3b8", textAlign: "center", marginTop: "22px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto", fontWeight: "300" }}>
            India combines clinical excellence with human-centered care — an effective and compassionate choice for international patients.
          </p>
        </W>
      </section>

      {/* ===== Accreditation & vetting ===== */}
      <section style={{ background: "#f0f6fc", padding: "80px 0" }}>
        <W>
          <div ref={r4} className={`reveal${v4 ? " in" : ""}`} style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow c="#1d4ed8" icon="shieldCheck">Safety &amp; Accreditation</Eyebrow></div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 12px" }}>How We Vet Our Partner Hospitals</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#64748b", maxWidth: "640px", margin: "0 auto", lineHeight: "1.8", fontWeight: "300" }}>
              Accreditation is the foundation of trust in cross-border care. We hold ourselves — and every
              hospital we work with — to a documented standard, not just a reputation.
            </p>
          </div>
          <div className="ip-g4 stagger in" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px" }}>
            {VETTING.map(({ ic, t, d }, i) => (
              <div key={t} className="ip-card ip-card-glow-blue" style={{ background: "#fff", border: "1px solid #e2eaf4",
                borderTop: "3px solid #1d4ed8", borderRadius: "16px", padding: "24px 22px",
                boxShadow: "0 2px 10px rgba(11,31,58,.05)" }}>
                <div style={{ marginBottom: "14px" }}>
                  {i === 0 ? (
                    <div className="icon-tile" style={{ width: "46px", height: "46px", background: "#eff6ff", border: "1.5px solid #bfdbfe", overflow: "hidden" }}>
                      <img src="/assets/img/logo/euro_logo.jpeg" alt="Euro Cert" style={{ width: "28px", height: "28px", objectFit: "contain" }}
                        onError={(e) => { e.target.style.display = "none"; e.target.parentElement.innerHTML = ""; }} />
                    </div>
                  ) : <IconTile name={ic} bg="#eff6ff" fg="#1d4ed8" size={46} />}
                </div>
                <h3 style={{ fontSize: "15.5px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 6px" }}>{t}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", color: "#64748b", lineHeight: "1.62", margin: 0, fontWeight: "300" }}>{d}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* ===== Why We Care 4 'all + Care model ===== */}
      <section style={{ background: `linear-gradient(135deg,${COLORS.navy},${COLORS.navyMid})`, padding: "84px 0", position: "relative", overflow: "hidden" }}>
        <div className="blob ip-hide-mobile" style={{ width: "380px", height: "380px", top: "-140px", right: "-100px",
          background: "radial-gradient(circle,rgba(16,185,129,.16),transparent 70%)", animation: "ipFloat 14s ease-in-out infinite" }} />
        <W s={{ position: "relative", zIndex: 1 }}>
          <div ref={r2} className="ip-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
            <div className={`reveal-l${v2 ? " in" : ""}`}>
              <Eyebrow c="#6ee7b7" icon="compass">Independent By Design</Eyebrow>
              <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: "700", color: "#fff", margin: "0 0 14px" }}>Why Choose We Care 4 'all?</h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "rgba(255,255,255,.72)", lineHeight: "1.8", marginBottom: "18px", fontWeight: "300" }}>
                We are an independent healthcare consultancy, created to guide patients — not promote
                institutions. We work directly with experienced specialists and ethically managed
                hospitals, so we can recommend treatment purely on clinical appropriateness, safety,
                and affordability.
              </p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11.5px", fontWeight: "700", color: "#34d399", letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: "12px" }}>Our role is to:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {OUR_ROLE.map((item) => (
                  <div key={item} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(52,211,153,.16)", color: "#6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                      <Icon name="check" size={12} />
                    </span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "rgba(255,255,255,.75)", lineHeight: "1.6" }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#6ee7b7", fontWeight: "600", marginTop: "18px" }}>
                We are accountable to patients, not hospital networks.
              </p>
            </div>
            <div className={`reveal-r${v2 ? " in" : ""}`}>
              <Eyebrow c="#6ee7b7" icon="handshake">A Different Approach</Eyebrow>
              <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: "700", color: "#fff", margin: "0 0 14px" }}>How Our Care Model Is Different</h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "rgba(255,255,255,.72)", lineHeight: "1.8", marginBottom: "16px", fontWeight: "300" }}>
                Unlike facilitation models built into hospital referral systems, we follow a
                patient-centric coordination approach.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {CARE_MODEL.map((item) => (
                  <div key={item} className="glass" style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "13px 15px", borderRadius: "12px" }}>
                    <span style={{ color: "#34d399", flexShrink: 0 }}><Icon name="check" size={16} /></span>
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "rgba(255,255,255,.82)", lineHeight: "1.6" }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "rgba(255,255,255,.55)", marginTop: "16px", fontWeight: "300", lineHeight: "1.7" }}>
                This lets us focus on medical necessity, cost rationalization, and continuity of care.
              </p>
            </div>
          </div>
        </W>
      </section>

      {/* ===== Fee structure ===== */}
      <section style={{ background: "#fff", padding: "80px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow icon="tag">Transparency</Eyebrow></div>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 12px" }}>Cost Structure &amp; Service Fees</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#64748b", maxWidth: "620px", margin: "0 auto", lineHeight: "1.8", fontWeight: "300" }}>
              International patients see varying pricing structures depending on the facilitation model
              used. In some markets, coordination costs are embedded and hidden inside hospital billing.
              We do it differently.
            </p>
          </div>
          <div className="ip-g2" style={{ maxWidth: "760px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {FEE_STRUCTURE.map((item) => (
              <div key={item} className="ip-card" style={{ background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)", border: "1px solid #86efac",
                borderRadius: "14px", padding: "20px 22px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#047857", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="check" size={14} />
                </span>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#166534", lineHeight: "1.65", margin: 0, fontWeight: "500" }}>{item}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#94a3b8", textAlign: "center", marginTop: "26px", maxWidth: "620px", marginLeft: "auto", marginRight: "auto", fontWeight: "300" }}>
            By separating our professional coordination fee from hospital billing, patients get greater cost clarity and better affordability.
          </p>
        </W>
      </section>

      {/* ===== Treatment Journey ===== */}
      <section style={{ background: "#f0f6fc", padding: "84px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow icon="compass">Step By Step</Eyebrow></div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 12px" }}>Your Treatment Journey</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#64748b", maxWidth: "600px", margin: "0 auto", lineHeight: "1.8", fontWeight: "300" }}>
              From your first message to us through to follow-up care back home — here's exactly what to expect.
            </p>
          </div>
          <div style={{ position: "relative" }}>
            <div className="ip-timeline-line" />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {JOURNEY.map(({ n, t, d }) => (
                <div key={n} className="ip-timeline-row" style={{ display: "flex", gap: "22px", padding: "16px 0" }}>
                  <div className="ip-timeline-dot" style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#fff",
                    border: "2px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, position: "relative", zIndex: 1, boxShadow: "0 4px 14px rgba(4,120,87,.12)" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "19px", fontWeight: "700", color: "#047857" }}>{n}</span>
                  </div>
                  <div style={{ paddingTop: "7px" }}>
                    <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 4px" }}>{t}</h3>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#64748b", lineHeight: "1.65", margin: 0, fontWeight: "300", maxWidth: "620px" }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </W>
      </section>

      {/* ===== End-to-end services ===== */}
      <section style={{ background: "#fff", padding: "84px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow icon="heartPulse">Start To Finish</Eyebrow></div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: "700", color: "#0b1f3a", margin: 0 }}>End-to-End International Patient Services</h2>
          </div>
          <div ref={r3} className={`ip-g4 stagger${v3 ? " in" : ""}`} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px" }}>
            {SERVICES.map(({ ic, t, d }) => (
              <div key={t} className="ip-card ip-card-glow" style={{ background: "#fff", border: "1px solid #e2eaf4",
                borderRadius: "16px", padding: "24px 20px", boxShadow: "0 2px 10px rgba(11,31,58,.05)" }}>
                <IconTile name={ic} bg="linear-gradient(135deg,#f0fdf4,#d1fae5)" fg="#047857" size={48} />
                <h3 style={{ fontSize: "15.5px", fontWeight: "700", color: "#0b1f3a", margin: "14px 0 6px" }}>{t}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", color: "#64748b", lineHeight: "1.62", margin: 0, fontWeight: "300" }}>{d}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* ===== Emergency + Heritage ===== */}
      <section style={{ background: "#f0f6fc", padding: "76px 0" }}>
        <W>
          {/* Emergency + Heritage */}
          <div className="ip-g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="ip-card" style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "18px", padding: "28px 26px" }}>
              <IconTile name="ambulance" bg="#fff" fg="#be123c" size={48} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0b1f3a", margin: "14px 0 8px" }}>Emergency Transfers &amp; Critical Care</h3>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#64748b", lineHeight: "1.72", margin: 0, fontWeight: "300" }}>
                For time-sensitive or critical cases, we're empanelled with Air Ambulance services —
                medically supervised international transfers and rapid response when immediate
                intervention is required.
              </p>
            </div>
            <div className="ip-card" style={{ background: "#faf5ff", border: "1px solid #ddd6fe", borderRadius: "18px", padding: "28px 26px" }}>
              <IconTile name="landmark" bg="#fff" fg="#7c3aed" size={48} />
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0b1f3a", margin: "14px 0 8px" }}>Healing Beyond Treatment</h3>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#64748b", lineHeight: "1.72", margin: 0, fontWeight: "300" }}>
                Recovery extends beyond the procedure itself. Through our Heritage Tours association,
                patients and accompanying family may explore India's culture and heritage during
                recovery — supporting emotional well-being and holistic healing.
              </p>
            </div>
          </div>
        </W>
      </section>

      {/* ===== Testimonials — honest placeholder, no fabricated quotes ===== */}
      <section style={{ background: "#fff", padding: "68px 0" }}>
        <W>
          <div style={{ textAlign: "center", maxWidth: "620px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px", color: "#d1fae5" }}>
              <Icon name="quote" size={38} />
            </div>
            <Eyebrow>Patient Stories</Eyebrow>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,32px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 12px" }}>What Our Patients Say</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "#64748b", lineHeight: "1.8", fontWeight: "300", marginBottom: "20px" }}>
              We're collecting testimonials from our international patients — real stories will appear
              here once we have their consent to share them.
            </p>
            <Link to="/contact" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", fontWeight: "700", color: "#047857", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Are you a past patient? Share your story <Icon name="arrowRight" size={14} />
            </Link>
          </div>
        </W>
      </section>

      {/* ===== FAQs ===== */}
      <section style={{ background: "#f0f6fc", padding: "80px 0" }}>
        <W s={{ maxWidth: "820px" }}>
          <div style={{ textAlign: "center", marginBottom: "38px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><Eyebrow icon="message">Common Questions</Eyebrow></div>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: "700", color: "#0b1f3a", margin: 0 }}>Frequently Asked Questions</h2>
          </div>
          <FAQAccordion items={FAQS} />
        </W>
      </section>

      {/* ===== Closing CTA ===== */}
      <section style={{ background: `linear-gradient(135deg,${COLORS.navyDark},${COLORS.navy} 60%,#062818)`, padding: "80px 0", position: "relative", overflow: "hidden" }}>
        <div className="blob ip-hide-mobile" style={{ width: "340px", height: "340px", top: "-100px", left: "-80px",
          background: "radial-gradient(circle,rgba(16,185,129,.22),transparent 70%)", animation: "ipFloat 12s ease-in-out infinite" }} />
        <div className="blob ip-hide-mobile" style={{ width: "300px", height: "300px", bottom: "-120px", right: "-60px",
          background: "radial-gradient(circle,rgba(14,116,144,.22),transparent 70%)", animation: "ipFloat 15s ease-in-out infinite reverse" }} />
        <W s={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
              <IconTile name="heartPulse" bg="rgba(52,211,153,.14)" fg="#6ee7b7" size={54} />
            </div>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: "700", color: "#fff", margin: "0 0 14px" }}>
              A Responsible Partner in Your Healthcare Journey
            </h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", color: "rgba(255,255,255,.68)", lineHeight: "1.8", fontWeight: "300", marginBottom: "30px" }}>
              India delivers care. We Care 4 'all' ensures it's done right — with ethical clarity,
              financial transparency, and clinical responsibility, every step of the way.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/doctors" className="btn-p">Book a Consultation <Icon name="arrowRight" size={17} /></Link>
              <Link to="/contact" className="btn-ol">Talk to Our Team</Link>
            </div>
          </div>
        </W>
      </section>

      {/* ===== Legal disclaimer — compliance footnote ===== */}
      <section style={{ background: "#fff", padding: "34px 0 56px", borderTop: "1px solid #e2eaf4" }}>
        <W>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#94a3b8", lineHeight: "1.75", maxWidth: "860px", margin: "0 auto", fontWeight: "300" }}>
            <strong style={{ color: "#64748b" }}>Legal Disclaimer:</strong> We Care 4 'all' is an
            independent healthcare consultancy and patient coordination service. We do not provide
            medical advice or treatment, nor do we own or operate any medical facility. All medical
            services are delivered exclusively by licensed physicians and accredited healthcare
            institutions chosen by the patient. Treatment outcomes, timelines, and costs are determined
            solely by the treatment provider. Cost estimates are indicative and non-binding.
            Professional service fees relate only to coordination and support services and are
            disclosed separately. No medical outcomes are guaranteed.
          </p>
        </W>
      </section>
    </div>
  );
}
