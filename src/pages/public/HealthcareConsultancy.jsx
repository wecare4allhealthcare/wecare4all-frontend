/**
 * HealthcareConsultancy.jsx — Public "Healthcare Consultancy" page.
 *
 * New page (Aug 2026 client request): the site has two audiences —
 * Healthcare Consultancy (patients/families) and Hospital Consultancy
 * (hospitals/institutions) — and Hospital Consultancy already had its
 * own dedicated "home-page-style" landing page
 * (HospitalConsultancy.jsx: hero, what-we-do, key areas, team, CTA).
 * Healthcare Consultancy had no equivalent — the homepage itself was
 * carrying all of this content directly, which blurred the separation
 * the client wants. This page fills that gap, deliberately mirroring
 * HospitalConsultancy.jsx's structure and CSS class names (.hc2-card,
 * .hc2-btn, etc — same pattern, "2" suffix only to avoid a class-name
 * collision if both pages' styles ever end up in the DOM at once) so
 * the two pages feel like a matched pair.
 *
 * AudienceSplit's "I am a Patient" button (Home.jsx) now routes here
 * instead of straight to /doctors — same relationship
 * "I am a Hospital" already has with HospitalConsultancy.jsx.
 */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { RoleModal } from "../../components/RoleModal";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";
import { specialtyToSlug } from "../../utils/specialtySlug";

const G = `
.hc2{font-family:'Inter',sans-serif;color:#1e293b;overflow-x:hidden;}
.hc2 *{box-sizing:border-box;} .hc2 a{text-decoration:none;}
.hc2 h1,.hc2 h2,.hc2 h3,.hc2 h4{font-family:'Manrope',sans-serif;}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease;}
.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease;}
.stagger.in>*:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.03s}
.stagger.in>*:nth-child(2){opacity:1;transform:translateY(0);transition-delay:.07s}
.stagger.in>*:nth-child(3){opacity:1;transform:translateY(0);transition-delay:.11s}
.stagger.in>*:nth-child(4){opacity:1;transform:translateY(0);transition-delay:.15s}
.stagger.in>*:nth-child(5){opacity:1;transform:translateY(0);transition-delay:.19s}
.stagger.in>*:nth-child(6){opacity:1;transform:translateY(0);transition-delay:.23s}
.stagger.in>*:nth-child(7){opacity:1;transform:translateY(0);transition-delay:.27s}
.stagger.in>*:nth-child(8){opacity:1;transform:translateY(0);transition-delay:.31s}
.hc2-card{background:#fff;border:1.5px solid var(--wc-border);border-radius:16px;padding:22px;
  box-shadow:0 2px 10px rgba(18,59,74,.06);transition:all .25s;}
.hc2-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(18,59,74,.14);border-color:var(--wc-green-lighter);}
.hc2-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;font-family:'Inter',sans-serif;
  font-weight:700;font-size:15px;padding:14px 26px;border-radius:10px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(18,59,74,.35);transition:all .25s;}
.hc2-btn:hover{transform:translateY(-1px);}
.hc2-btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:transparent;color:var(--wc-green);font-family:'Inter',sans-serif;font-weight:700;font-size:14px;
  padding:12px 22px;border-radius:10px;border:1.5px solid var(--wc-green);transition:all .25s;}
.hc2-btn-outline:hover{background:var(--wc-sage);}
.hc2-row{display:flex;gap:14px;align-items:flex-start;padding:14px;border-radius:12px;transition:all .2s;}
.hc2-row:hover{background:var(--wc-sage);transform:translateX(4px);}
.hc2-row-n{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));
  color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}
@media(max-width:600px){.hc2-hero-cols{grid-template-columns:1fr!important;}.hc2-team-cols{grid-template-columns:1fr!important;}
  .careplus-grid,.medtourism-grid{grid-template-columns:1fr!important;}
  .g4{grid-template-columns:1fr 1fr!important;}}
/* Moved here with Specialties()/CarePlusPromo()/MedicalTourismPromo()/
   HowItWorks() (Aug 2026 — client decision to move detailed patient
   content off the homepage onto this dedicated page). Same classes
   those components already reference, unchanged. */
.spec-chip{
  border-radius:50px;padding:8px 17px;cursor:pointer;transition:all .2s;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:500;border:1.5px solid;
}
.spec-chip:hover{background:var(--wc-navy)!important;color:#fff!important;border-color:var(--wc-navy)!important;transform:scale(1.04);}
`;

const W = ({ children, s = {} }) => (
  <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700",
    letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>{children}</p>
);

// Same SH component Home.jsx defines (badge/title/sub section header)
// — needed here for CarePlusPromo/MedicalTourismPromo/Specialties/
// HowItWorks, moved from Home.jsx along with those components.
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

const WHAT_WE_DO_INTRO = [
  "Connecting You With Verified, Ethical Specialists",
  "Bringing Professional Nursing & Physiotherapy Home",
  "Coordinating Care Across 50+ Partner Hospitals",
  "Guiding International Patients Through Treatment in India",
  "Supporting Families Managing Elderly Care Remotely",
  "Simplifying Diagnostics & Sample Collection",
  "Helping You Understand Costs Before You Commit",
  "Being One Trusted Partner From First Call to Recovery",
];

const KEY_AREAS = [
  { ic: "🩺", title: "Specialist Consultation", desc: "Video or in-person appointments with verified doctors across 18+ specialties, at a time that works for you." },
  { ic: "🏠", title: "Home Healthcare (Care+)", desc: "Professional nursing care, physiotherapy, and doctor visits delivered at your doorstep in Chennai." },
  { ic: "🏥", title: "Hospital Coordination", desc: "Help choosing the right hospital and specialist for your condition, from our network of 50+ partner hospitals." },
  { ic: "✈️", title: "Medical Tourism", desc: "End-to-end support for international patients — treatment planning, cost estimates, travel, and hospital coordination." },
  { ic: "👵", title: "Elderly & Family Care", desc: "Especially built for NRI families managing a parent's healthcare in Chennai from another city or country." },
  { ic: "🧪", title: "Diagnostics & Sample Collection", desc: "Lab tests and diagnostics coordinated for you, with results shared directly." },
  { ic: "💳", title: "Transparent Cost Guidance", desc: "Understand what a consultation, procedure, or treatment plan will cost — before you commit to anything." },
  { ic: "📋", title: "Ongoing Care Coordination", desc: "One team stays with you through treatment, follow-ups, and recovery — not just the first appointment." },
];

function specNameToSlug(name) {
  return specialtyToSlug(name);
}
/* ══ CARE+ PROMO ══
   Client requirement (Aug 2026 strategy review): "Make Care+ a flagship
   offering: Position elderly/home care as a distinct service,
   particularly appealing to families and NRIs managing parents'
   healthcare remotely."

   IMPORTANT — flagged, not silently worked around: /home-healthcare
   itself is login-gated by an earlier explicit product decision (see
   the access-control comment at the top of HomeHealthcare.jsx) — an
   anonymous visitor clicking through gets sent straight to /login
   before seeing any service details. That's the same "login-gated
   marketing page" issue already on record for /doctors, /blog, etc.
   (see the SEO section of the site notes). This homepage promo card is
   public and does the positioning/messaging work Phase 3 asks for, but
   the full conversion funnel for a first-time NRI visitor won't work
   end-to-end until that gate is either relaxed for this page or a
   public-only informational version is split out — that's a business
   decision, not something to change unilaterally here. */
function CarePlusPromo() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"var(--wc-sage)", padding:"64px 0" }}>
      <W>
        <div ref={ref} className={`reveal careplus-grid${vis?" in":""}`} style={{
          display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:"40px", alignItems:"center",
        }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"8px",
              background:"#fff", border:"1px solid var(--wc-green-light)",
              borderRadius:"50px", padding:"6px 15px", marginBottom:"16px" }}>
              <span style={{ width:"7px",height:"7px",background:"var(--wc-green)",borderRadius:"50%",display:"block" }} />
              <span style={{ fontFamily:"'Inter',sans-serif",color:"var(--wc-green-dark)",
                fontSize:"11.5px",fontWeight:"700",letterSpacing:".4px" }}>CARE+</span>
            </div>
            <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"clamp(24px,3.5vw,38px)",
              fontWeight:"700", color:"var(--wc-navy)", margin:"0 0 14px", lineHeight:1.2 }}>
              {t("home.carePlus.heading")}
            </h2>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"15px",
              color:"var(--wc-muted)", lineHeight:1.75, marginBottom:"26px",
              maxWidth:"480px", fontWeight:"300" }}>
              {t("home.carePlus.sub")}
            </p>
            <Link to="/home-healthcare" className="hc2-btn">
              {t("home.carePlus.cta")}
            </Link>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            {[
              { ic:"👩‍⚕️", k:"nursing" },
              { ic:"🏃",   k:"physio" },
              { ic:"🩺",   k:"doctorVisit" },
              { ic:"🌍",   k:"nri" },
            ].map(({ic,k}) => (
              <div key={k} style={{ background:"#fff",
                border:"1px solid var(--wc-border)", borderRadius:"13px", padding:"18px" }}>
                <div style={{ fontSize:"24px", marginBottom:"8px" }}>{ic}</div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px", fontWeight:"700",
                  color:"var(--wc-navy)", margin:"0 0 4px" }}>{t(`home.carePlus.cards.${k}.t`)}</p>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11.5px",
                  color:"var(--wc-muted)", margin:0, lineHeight:1.5 }}>{t(`home.carePlus.cards.${k}.d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </W>
    </section>
  );
}

/* ══ MEDICAL TOURISM PROMO ══
   Client requirement (Aug 2026 strategy review): "Improve Medical
   Tourism: Create a dedicated page explaining the end-to-end
   journey—hospital selection, specialist coordination, costs, travel,
   treatment and post-care."

   The dedicated page (/international-patients) already covers exactly
   this — a 6-step "Your Treatment Journey" section (Enquiry & Case
   Review → Treatment Plan & Estimate → Visa & Travel → Arrival &
   Admission → Treatment & Recovery → Departure & Follow-Up) plus an
   8-item services grid that explicitly includes "Hospital Assistance —
   coordination with your chosen hospital". Nothing to rebuild there.

   What was actually missing: (1) zero visibility from the homepage —
   a visitor would only find this page by already knowing the URL, and
   (2) the SAME login-gate issue as Care+ (see CarePlusPromo's comment
   above) — /international-patients is wrapped in <ProtectedRoute
   role={["patient","admin"]}> in App.jsx, so an anonymous international
   visitor gets sent to /login before seeing any of that journey content.
   That gating decision is still open — not resolved here. This promo
   card is the public-facing piece: drives awareness, and the CTA below
   will work end-to-end for a first-time visitor once that decision is
   made either way. */
function MedicalTourismPromo() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  return (
    <section style={{ background:"var(--wc-navy)", padding:"64px 0" }}>
      <W>
        <div ref={ref} className={`reveal medtourism-grid${vis?" in":""}`} style={{
          display:"grid", gridTemplateColumns:"0.9fr 1.1fr", gap:"40px", alignItems:"center",
        }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"10px" }}>
            {["step1","step2","step3"].map((k, i) => (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:"14px",
                background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:"12px", padding:"14px 16px" }}>
                <div style={{ width:"30px", height:"30px", borderRadius:"50%",
                  background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color:"#fff",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"'Manrope',sans-serif", fontWeight:700, fontSize:"14px", flexShrink:0 }}>
                  {i+1}
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px", fontWeight:600,
                  color:"#fff", margin:0 }}>{t(`home.medicalTourism.steps.${k}`)}</p>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", fontWeight:"700",
              color:"var(--wc-green-light)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>
              {t("home.medicalTourism.eyebrow")}
            </p>
            <h2 style={{ fontFamily:"'Manrope',sans-serif", fontSize:"clamp(24px,3.5vw,36px)",
              fontWeight:"700", color:"#fff", margin:"0 0 14px" }}>
              {t("home.medicalTourism.heading")}
            </h2>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"14.5px", color:"rgba(255,255,255,.68)",
              lineHeight:1.75, marginBottom:"24px", maxWidth:"460px", fontWeight:"300" }}>
              {t("home.medicalTourism.sub")}
            </p>
            <Link to="/international-patients" className="hc2-btn">
              {t("home.medicalTourism.cta")}
            </Link>
          </div>
        </div>
      </W>
    </section>
  );
}

function Specialties() {
  const { t } = useTranslation();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
  // Replaced the specialty-name chip list (Aug 2026 client feedback:
  // "why this space is empty? Make the specialists photo scroll here")
  // with a horizontal-scrolling row of real doctor photo cards instead
  // — fetches the same public GET /doctors endpoint Doctors.jsx already
  // uses. Doctor photos are more trust-building content than abstract
  // specialty-name pills, and a horizontal scroll (rather than the old
  // opacity-animated flex-wrap) sidesteps any scroll-reveal timing
  // issue entirely — nothing here depends on IntersectionObserver.
  const [doctors, setDoctors] = useState(null); // null = loading
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/doctors?page=1&page_size=16`);
        const json = await res.json();
        setDoctors(json.doctors || []);
      } catch { setDoctors([]); }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section style={{ background:"#fff", padding:"72px 0" }}>
      <W>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-end", marginBottom:"32px", flexWrap:"wrap", gap:"14px" }}>
          <div>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", fontWeight:"700",
              color:"var(--wc-green)", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>{t("home.specs.eyebrow")}</p>
            <h2 style={{ fontFamily:"'Manrope',sans-serif",
              fontSize:"clamp(22px,3vw,36px)", fontWeight:"700", color:"var(--wc-navy)", margin:0 }}>
              {t("home.specs.heading")}
            </h2>
          </div>
          <Link to="/doctors" style={{ fontFamily:"'Inter',sans-serif",
            fontSize:"14px", fontWeight:"600", color:"var(--wc-green)" }}>{t("home.specs.viewAll")}</Link>
        </div>
        {doctors === null ? (
          <p style={{ fontSize:"13px", color:"#94a3b8" }}>Loading specialists…</p>
        ) : doctors.length === 0 ? null : (
          <div style={{ display:"flex", gap:"16px", overflowX:"auto", paddingBottom:"12px",
            scrollSnapType:"x mandatory", WebkitOverflowScrolling:"touch" }}>
            {doctors.map((doc) => (
              <Link key={doc.id} to={`/doctors?specialization=${encodeURIComponent(doc.specialization||"")}`}
                style={{ flex:"0 0 auto", width:"150px", scrollSnapAlign:"start",
                  textDecoration:"none", textAlign:"center" }}>
                <div style={{ width:"110px", height:"110px", borderRadius:"50%", margin:"0 auto 12px",
                  overflow:"hidden", border:"3px solid var(--wc-border)", background:"var(--wc-sage)" }}>
                  {doc.photo_url ? (
                    <img loading="lazy" src={doc.photo_url} alt={doc.full_name}
                      style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  ) : (
                    <div style={{ width:"100%", height:"100%", display:"flex",
                      alignItems:"center", justifyContent:"center", fontSize:"32px",
                      fontWeight:"700", color:"var(--wc-green-dark)" }}>
                      {doc.full_name?.[0] || "D"}
                    </div>
                  )}
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13.5px", fontWeight:"700",
                  color:"var(--wc-navy)", margin:"0 0 3px" }}>{doc.full_name}</p>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"12px",
                  color:"var(--wc-muted)", margin:0 }}>{doc.specialization}</p>
              </Link>
            ))}
          </div>
        )}
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
    // This button (used for both "Get Started" in How It Works and
    // "Book Your First Consultation" in the bottom CTA) was missing the
    // admin bypass that Hero's own handleBookingClick already has —
    // admin fell through to the "Wrong Account Type" modal here instead
    // of being let straight through, unlike every other booking button
    // on this page. Admin should be able to click through every page,
    // including booking, without hitting a role-mismatch modal.
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

/* ══ HOW IT WORKS ══ */
function HowItWorks() {
  const { t } = useTranslation();
  const [ref, vis] = useScrollAnimation();
  const titles = Array.isArray(t("home.how.titles", { returnObjects: true })) ? t("home.how.titles", { returnObjects: true }) : [];
  const descs = Array.isArray(t("home.how.descs", { returnObjects: true })) ? t("home.how.descs", { returnObjects: true }) : [];
  const icons = ["🔐","🔍","📅","💬"];
  const STEPS = ["01","02","03","04"].map((n,i) => ({ n, ic:icons[i], t:titles[i], d:descs[i] }));
  return (
    <section style={{ background:"var(--wc-light-teal)", padding:"80px 0" }}>
      <W>
        <SH badge={t("home.how.eyebrow")} title={t("home.how.heading")} sub={t("home.how.sub")} />
        <div ref={ref} className={`g4 stagger${vis?" in":""}`}
          style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"26px" }}>
          {STEPS.map(({ n,ic,t:title,d }) => (
            <div key={n} style={{ textAlign:"center" }}>
              <div style={{ width:"70px",height:"70px",
                background:"linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))",
                borderRadius:"18px",display:"flex",alignItems:"center",
                justifyContent:"center",margin:"0 auto 14px",
                boxShadow:"0 8px 24px rgba(18,59,74,.25)",fontSize:"26px",
                transition:"transform .3s" }}
                onMouseEnter={e=>e.currentTarget.style.transform="rotate(-5deg) scale(1.1)"}
                onMouseLeave={e=>e.currentTarget.style.transform=""}>{ic}</div>
              <span style={{ display:"inline-block",background:"#dcfce7",color:"var(--wc-green)",
                fontSize:"10px",fontWeight:"700",padding:"2px 10px",borderRadius:"50px",
                marginBottom:"9px",fontFamily:"'Inter',sans-serif" }}>{t("home.how.step")} {n}</span>
              <h3 style={{ fontSize:"17px",fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 7px" }}>{title}</h3>
              <p style={{ fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"var(--wc-muted)",
                lineHeight:"1.72",margin:0,fontWeight:"300" }}>{d}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"40px" }}>
          <SmartBookButton className="hc2-btn" label={t("home.how.getStarted")} />
        </div>
      </W>
    </section>
  );
}

export default function HealthcareConsultancy() {
  const [heroRef, heroVis] = useScrollAnimation();
  const [introRef, introVis] = useScrollAnimation();
  const [areasRef, areasVis] = useScrollAnimation();
  const [teamRef, teamVis] = useScrollAnimation();

  return (
    <div className="hc2">
      <style>{G}</style>
      <SEO title="Healthcare Consultancy — Find the Right Care, Right Specialist, Right Time" path="/healthcare-consultancy"
        description="We Care 4 'all' healthcare consultancy — verified doctor consultations, home healthcare, hospital coordination, and medical tourism support for patients and families in Chennai and across India."
        keywords="healthcare consultancy in chennai, healthcare consultancy in india, best doctors in chennai, home health care, medical tourism in india, personalized care in chennai"
        jsonLd={{
          "@type": "MedicalBusiness",
          "name": "We Care 4 'all' — Healthcare Consultancy",
          "description": "Doctor consultations, home healthcare, hospital coordination, and medical tourism support for patients and families.",
          "url": "https://www.wecare4all.in/healthcare-consultancy",
          "areaServed": "Chennai, Tamil Nadu, India",
        }}
      />

      {/* HERO */}
      <section style={{ background: "var(--wc-warm-white)", padding: "56px 0 64px" }}>
        <W>
          <div ref={heroRef} className={`reveal${heroVis ? " in" : ""} hc2-hero-cols`}
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "36px", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", fontFamily: "'Inter',sans-serif", fontSize: "12.5px",
                fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", background: "var(--wc-sage)",
                border: "1px solid var(--wc-green-lighter)", borderRadius: "20px", padding: "6px 14px", marginBottom: "16px" }}>
                🧑‍⚕️ HEALTHCARE CONSULTANCY
              </span>
              <h1 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: "700", color: "var(--wc-navy)", lineHeight: "1.18", margin: "0 0 16px" }}>
                The right care. The right specialist. The right time.
              </h1>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "16px", color: "var(--wc-muted)", lineHeight: "1.75", margin: "0 0 24px", fontWeight: "300", maxWidth: "520px" }}>
                From finding a verified doctor to home healthcare, hospital coordination, and medical tourism —
                We Care 4 'all' guides patients and families through every step of their healthcare journey.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                <Link to="/doctors" className="hc2-btn">Find a Doctor →</Link>
                <Link to="/home-healthcare" className="hc2-btn-outline">Explore Home Healthcare</Link>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid var(--wc-green-lighter)", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 32px rgba(18,59,74,.10)" }}>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: "20px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 14px" }}>What we help patients with</p>
              {["Doctor consultation & booking", "Home healthcare & nursing care", "Hospital & specialist coordination", "Medical tourism for international patients"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ color: "var(--wc-green)", fontWeight: "700" }}>✓</span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "#374151" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </W>
      </section>

      {/* WHAT WE DO */}
      <section style={{ padding: "64px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <SectionLabel>WHAT WE DO</SectionLabel>
            <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: "700", color: "var(--wc-navy)", margin: 0 }}>One trusted partner for your healthcare journey</h2>
          </div>
          <div ref={introRef} className={`stagger${introVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "4px", maxWidth: "980px", margin: "0 auto" }}>
            {WHAT_WE_DO_INTRO.map((t, i) => (
              <div key={t} className="hc2-row">
                <span className="hc2-row-n">{i + 1}</span>
                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#374151", fontWeight: "500", lineHeight: "1.5" }}>{t}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* KEY AREAS */}
      <section id="key-areas" style={{ background: "var(--wc-sage)", padding: "64px 0", borderTop: "1px solid var(--wc-green-lighter)", borderBottom: "1px solid var(--wc-green-lighter)" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <SectionLabel>OUR SERVICES</SectionLabel>
            <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 12px" }}>Key Areas of Healthcare Consultancy</h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14.5px", color: "var(--wc-muted)", maxWidth: "720px", margin: "0 auto", lineHeight: "1.75" }}>
              From your first consultation to full recovery, we support patients and families across every stage of care.
            </p>
          </div>
          <div ref={areasRef} className={`stagger${areasVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: "20px" }}>
            {KEY_AREAS.map((a) => (
              <div key={a.title} className="hc2-card">
                <div style={{ width: "48px", height: "48px", background: "var(--wc-sage)", border: "1.5px solid var(--wc-green-lighter)",
                  borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "14px" }}>{a.ic}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 8px" }}>{a.title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "var(--wc-muted)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{a.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link to="/doctors" className="hc2-btn">Book a Consultation →</Link>
          </div>
        </W>
      </section>

      {/* Care+, Medical Tourism, Specialties, and How It Works — moved
          here from Home.jsx (Aug 2026 client decision: detailed
          patient content belongs on this dedicated page, not the
          homepage, which is now a lean front door for both
          audiences). */}
      <CarePlusPromo />
      <MedicalTourismPromo />
      <Specialties />
      <HowItWorks />

      {/* TEAM — reuses the same aboutPage.team.* content Home.jsx's
          FounderCredibility and HospitalConsultancy.jsx's TEAM both
          draw from, via the i18n keys directly (no new bio content
          duplicated here). No "Read our full story" link here — per
          client instruction, /about belongs to the Hospital
          Consultancy audience specifically, not this page. */}
      <section style={{ padding: "72px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <SectionLabel>WHO'S BEHIND THE CARE</SectionLabel>
            <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: "700", color: "var(--wc-navy)", margin: 0 }}>Led by real healthcare experience</h2>
          </div>
          {/* Vardhini Karthik card removed (Aug 2026 client feedback:
              "she is only for hospital consultancy [health care
              providers]") — her role (Certification & Insurance
              Consultant) is hospital/business-facing, not relevant to
              the patient-facing Healthcare Consultancy audience. She
              still appears on HospitalConsultancy.jsx's own Team
              section, where she belongs. Grid changed to a single
              centered card now that only Raman remains. */}
          <div ref={teamRef} className={`stagger${teamVis ? " in" : ""}`}
            style={{ display: "flex", justifyContent: "center" }}>
            <div className="hc2-card" style={{ maxWidth: "420px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 2px" }}>R.V. Raman</h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", color: "var(--wc-green)", margin: "0 0 12px" }}>Founder & Healthcare Consultant</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", lineHeight: "1.75", margin: 0, fontWeight: "300" }}>
                16+ years bridging patients to the right specialists. Driving quality healthcare access across India with compassion and expertise.
              </p>
            </div>
          </div>
        </W>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--wc-navy)", padding: "56px 0" }}>
        <W>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "#fff", margin: "0 0 12px" }}>Ready to get the right care?</h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14.5px", color: "rgba(255,255,255,.72)", lineHeight: "1.8", margin: "0 0 26px" }}>
              Talk to a Care Coordinator, or book a consultation directly.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/doctors" className="hc2-btn">Find a Doctor →</Link>
              <a href="https://wa.me/919025786467?text=Hi%2C%20I%27d%20like%20to%20talk%20to%20a%20Care%20Coordinator"
                target="_blank" rel="noopener noreferrer" className="hc2-btn-outline"
                style={{ borderColor: "var(--wc-green-lighter)", color: "var(--wc-green-lighter)" }}>WhatsApp Us</a>
            </div>
          </div>
        </W>
      </section>
    </div>
  );
}
