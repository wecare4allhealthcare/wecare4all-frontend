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
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";

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
@media(max-width:600px){.hc2-hero-cols{grid-template-columns:1fr!important;}.hc2-team-cols{grid-template-columns:1fr!important;}}
`;

const W = ({ children, s = {} }) => (
  <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700",
    letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>{children}</p>
);

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
          <div ref={teamRef} className={`stagger${teamVis ? " in" : ""} hc2-team-cols`}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="hc2-card">
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 2px" }}>R.V. Raman</h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", color: "var(--wc-green)", margin: "0 0 12px" }}>Founder & Healthcare Consultant</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", lineHeight: "1.75", margin: 0, fontWeight: "300" }}>
                16+ years bridging patients to the right specialists. Driving quality healthcare access across India with compassion and expertise.
              </p>
            </div>
            <div className="hc2-card">
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 2px" }}>Vardhini Karthik</h3>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", color: "var(--wc-green)", margin: "0 0 12px" }}>Certification & Insurance Consultant</p>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", lineHeight: "1.75", margin: 0, fontWeight: "300" }}>
                First woman in South India (Healthcare Sector) — IIM Trichy. 16+ yrs clinical & strategic expertise. 7 National, 5 International papers.
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
