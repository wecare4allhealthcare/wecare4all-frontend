/**
 * HospitalConsultancy.jsx — Public "Hospital Consultancy" page.
 *
 * IMPORTANT — content source correction:
 * An earlier version of this page used content from the legacy site's
 * app/Views/hospital-consultancy.php, which despite its filename is
 * actually the *seeker*-facing page (Corporate Health Care, Residential
 * Health Care, Home Health Care, Medical Tourism — i.e. services for
 * patients/individuals). That content already lives on this app's
 * dedicated pages (ResidentialHealthCare.jsx, HomeHealthcare.jsx,
 * CorporateWellness.jsx, InternationalPatients.jsx).
 *
 * The *real* Hospital Consultancy content — services We Care 4 'all'
 * offers TO hospitals as clients, not to patients — lives in the
 * legacy site's Healthcare-Providers section instead:
 *   - app/Views/Healthcare-Providers/what-we-do.php
 *     ("Key Areas of Hospital Consultancy": hospital planning &
 *     management, branding & marketing, operational efficiency,
 *     insurance empanelment, corporate tie-ups, revenue cycle
 *     management, accreditation & compliance, medical tourism support
 *     FOR hospitals)
 *   - app/Views/Healthcare-Providers/about-us.php
 *     (page <title> literally reads "About Us - Hospital Consultancy";
 *     founder/consultant bios)
 * This rebuild uses that content instead. Same page pattern as before
 * (Manrope + Inter, green/navy palette, scroll-reveal
 * sections, SEO component) — only the content source changed.
 */
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";

const G = `
.hc{font-family:'Inter',sans-serif;color:#1e293b;overflow-x:hidden;}
.hc *{box-sizing:border-box;} .hc a{text-decoration:none;}
.hc h1,.hc h2,.hc h3,.hc h4{font-family:'Manrope',sans-serif;}
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
.hc-card{background:#fff;border:1.5px solid #86efac;border-radius:16px;padding:22px;
  box-shadow:0 2px 10px rgba(18,59,74,.06);transition:all .25s;}
.hc-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(14,116,144,.14);border-color:var(--wc-green-lighter);}
.hc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;font-family:'Inter',sans-serif;
  font-weight:700;font-size:15px;padding:14px 26px;border-radius:10px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(14,116,144,.35);transition:all .25s;}
.hc-btn:hover{transform:translateY(-1px);}
.hc-btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:transparent;color:var(--wc-green);font-family:'Inter',sans-serif;font-weight:700;font-size:14px;
  padding:12px 22px;border-radius:10px;border:1.5px solid var(--wc-green);transition:all .25s;}
.hc-btn-outline:hover{background:var(--wc-sage);}
.hc-row{display:flex;gap:14px;align-items:flex-start;padding:14px;border-radius:12px;transition:all .2s;}
.hc-row:hover{background:var(--wc-sage);transform:translateX(4px);}
.hc-row-n{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));
  color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}
@media(max-width:600px){.hc-hero-cols{grid-template-columns:1fr!important;}.hc-team-cols{grid-template-columns:1fr!important;}}
`;

const W = ({ children, s = {} }) => (
  <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700",
    letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>{children}</p>
);

// "What We Do" intro list — legacy Healthcare-Providers/what-we-do.php
const WHAT_WE_DO_INTRO = [
  "Transforming Hospitals for Better Care & Greater Efficiency",
  "Optimizing Healthcare Operations for a Healthier Future",
  "Building Stronger Hospitals with Smart Solutions",
  "From Planning to Branding – Your Hospital Growth Partner",
  "Enhancing Patient Experience Through Expert Consultancy",
  "Accreditation & Compliance – Setting Higher Standards in Healthcare",
  "Boosting Hospital Revenues with Strategic Insights",
  "Corporate Tie-Ups & Insurance Empanelment – Expanding Your Reach",
];

// "Key Areas of Hospital Consultancy" — same source, the core service list
const KEY_AREAS = [
  { ic: "🏗️", title: "Hospital Planning & Management", desc: "Assisting in setting up new hospitals or improving existing ones by optimizing infrastructure, workflow, and service delivery." },
  { ic: "📣", title: "Branding & Marketing", desc: "Developing strategies to increase visibility, attract patients, and build a strong reputation." },
  { ic: "⚙️", title: "Operational Efficiency", desc: "Streamlining hospital processes, reducing costs, and improving service quality." },
  { ic: "🩺", title: "Insurance Empanelment", desc: "Helping hospitals get listed with insurance providers for cashless treatment options." },
  { ic: "🤝", title: "Corporate Tie-Ups", desc: "Connecting hospitals with companies for employee healthcare partnerships." },
  { ic: "💳", title: "Payment Collection & Revenue Cycle Management", desc: "Ensuring smooth financial transactions and reducing delays in payments." },
  { ic: "🏅", title: "Accreditation & Compliance", desc: "Guiding hospitals to meet NABH, JCI, and other quality standards for better patient trust." },
  { ic: "✈️", title: "Medical Tourism Support", desc: "Assisting hospitals in attracting international patients through seamless treatment, travel, and accommodation arrangements." },
];

// Founder / consultant bios — legacy Healthcare-Providers/about-us.php
const TEAM = [
  {
    name: "R.V. Raman",
    role: "Founder & Health Care Consultant",
    bio: "At We Care 4 'all', we truly step into your shoes. We take the time to understand what you're trying to build — the hopes, the hurdles, and everything in between. Starting or growing a hospital isn't easy, but with the right guidance and support, it's absolutely possible. We work alongside you, helping you navigate the challenges so your dream doesn't just stay a dream — it becomes a reality.",
  },
  {
    name: "Vardhini Karthik",
    role: "Certification & Insurance Consultant",
    bio: "Healthcare professional with 20+ years of experience, combining clinical expertise with business acumen — Bachelor's in Cardio Thoracic Perfusion Technology and an MBA in Hospital & Health Systems from Sri Ramachandra University, Chennai. First woman in South India to complete the Advanced Executive Program in Strategic Branding & Advertisement Management from IIM Trichy in the Healthcare Sector. Lead Auditor for ISO 9001:2015 (BSI) and ISO 13485 for Medical Devices, and certified in the IRDA (Life & Health Insurance) examination.",
  },
];

export default function HospitalConsultancy() {
  const [heroRef, heroVis] = useScrollAnimation();
  const [introRef, introVis] = useScrollAnimation();
  const [areasRef, areasVis] = useScrollAnimation();
  const [teamRef, teamVis] = useScrollAnimation();

  return (
    <div className="hc">
      <style>{G}</style>
      <SEO title="Hospital Consultancy — Planning, Branding & Insurance Empanelment | We Care 4 'all'" path="/hospital-consultancy"
        description="We Care 4 'all's hospital consultancy services — hospital planning & management, branding & marketing, operational efficiency, insurance empanelment, corporate tie-ups, revenue cycle management, NABH/JCI accreditation support, and medical tourism support for hospitals."
        keywords="hospital consultancy, hospital planning and management, hospital branding, hospital operational efficiency, insurance empanelment, corporate tie ups hospital, revenue cycle management, NABH JCI accreditation, medical tourism support, we care 4 all" />

      {/* HERO */}
      <section style={{ background: "var(--wc-sage)", padding: "72px 0 56px", borderBottom: "1px solid #86efac" }}>
        <W>
          <div ref={heroRef} className={`reveal${heroVis ? " in" : ""} hc-hero-cols`}
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "36px", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", fontFamily: "'Inter',sans-serif", fontSize: "12.5px",
                fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", background: "var(--wc-sage)",
                border: "1px solid #86efac", borderRadius: "20px", padding: "6px 14px", marginBottom: "16px" }}>
                🏥 HOSPITAL CONSULTANCY
              </span>
              <h1 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: "700", color: "var(--wc-navy)", lineHeight: "1.18", margin: "0 0 16px" }}>
                Your hospital's growth partner — from planning to success.
              </h1>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "16px", color: "var(--wc-muted)", lineHeight: "1.75", margin: "0 0 24px", fontWeight: "300", maxWidth: "520px" }}>
                Transforming hospitals for better care and greater efficiency — strategic consultancy in planning, branding, operations, insurance empanelment, and accreditation, backed by a team with real hospital and insurance-industry experience.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                <a href="#key-areas" className="hc-btn">Key Areas of Consultancy →</a>
                <Link to="/partner-with-us" className="hc-btn-outline">Partner With Us</Link>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 32px rgba(14,116,144,.10)" }}>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: "20px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 14px" }}>What we help hospitals with</p>
              {["Hospital planning & management", "Branding, marketing & patient experience", "Insurance empanelment & corporate tie-ups", "NABH / JCI accreditation & compliance"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ color: "var(--wc-green)", fontWeight: "700" }}>✓</span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "#374151" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </W>
      </section>

      {/* WHAT WE DO — intro list */}
      <section style={{ padding: "64px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <SectionLabel>WHAT WE DO</SectionLabel>
            <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: "700", color: "var(--wc-navy)", margin: 0 }}>Building stronger hospitals with smart solutions</h2>
          </div>
          <div ref={introRef} className={`stagger${introVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: "4px", maxWidth: "980px", margin: "0 auto" }}>
            {WHAT_WE_DO_INTRO.map((t, i) => (
              <div key={t} className="hc-row">
                <span className="hc-row-n">{i + 1}</span>
                <p style={{ margin: 0, fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#374151", fontWeight: "500", lineHeight: "1.5" }}>{t}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* KEY AREAS OF HOSPITAL CONSULTANCY */}
      <section id="key-areas" style={{ background: "var(--wc-sage)", padding: "64px 0", borderTop: "1px solid #86efac", borderBottom: "1px solid #86efac" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <SectionLabel>OUR SERVICES</SectionLabel>
            <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 12px" }}>Key Areas of Hospital Consultancy</h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14.5px", color: "var(--wc-muted)", maxWidth: "720px", margin: "0 auto", lineHeight: "1.75" }}>
              From first blueprint to full accreditation, we support hospitals across every stage of growth.
            </p>
          </div>
          <div ref={areasRef} className={`stagger${areasVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: "20px" }}>
            {KEY_AREAS.map((a) => (
              <div key={a.title} className="hc-card">
                <div style={{ width: "48px", height: "48px", background: "var(--wc-sage)", border: "1.5px solid #86efac",
                  borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "14px" }}>{a.ic}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 8px" }}>{a.title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "var(--wc-muted)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{a.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link to="/partner-with-us" className="hc-btn">Start Your Empanelment →</Link>
          </div>
        </W>
      </section>

      {/* TEAM / ABOUT US */}
      <section style={{ padding: "72px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <SectionLabel>ABOUT US</SectionLabel>
            <h2 style={{ fontSize: "clamp(24px,3vw,30px)", fontWeight: "700", color: "var(--wc-navy)", margin: 0 }}>The consultants behind the guidance</h2>
          </div>
          <div ref={teamRef} className={`stagger${teamVis ? " in" : ""} hc-team-cols`}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {TEAM.map((p) => (
              <div key={p.name} className="hc-card">
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 2px" }}>{p.name}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", color: "var(--wc-green)", margin: "0 0 12px" }}>{p.role}</p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", lineHeight: "1.75", margin: 0, fontWeight: "300" }}>{p.bio}</p>
              </div>
            ))}
          </div>
          {/* Added (Aug 2026 client clarification): /about belongs to
              the Hospital Consultancy audience, not the patient-facing
              homepage — moved the "Read our full story" link here from
              Home.jsx's FounderCredibility section, since this is the
              page where it's actually relevant. */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Link to="/about" className="hc-btn-outline">Read our full story →</Link>
          </div>
        </W>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--wc-navy)", padding: "56px 0" }}>
        <W>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "#fff", margin: "0 0 12px" }}>Let's build your hospital's next chapter, together.</h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14.5px", color: "rgba(255,255,255,.72)", lineHeight: "1.8", margin: "0 0 26px" }}>
              If you're dreaming big, let's dream it together. Let's talk.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/partner-with-us" className="hc-btn">Partner With Us →</Link>
              <Link to="/contact" className="hc-btn-outline" style={{ borderColor: "var(--wc-green-lighter)", color: "var(--wc-green-lighter)" }}>Contact Us</Link>
            </div>
          </div>
        </W>
      </section>
    </div>
  );
}
