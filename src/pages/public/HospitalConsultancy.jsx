/**
 * HospitalConsultancy.jsx — Public "Hospital Consultancy" overview page.
 *
 * Content sourced from the legacy CodeIgniter site's
 * app/Views/hospital-consultancy.php page (Corporate Health Care,
 * Residential Health Care, Home Health Care, Medical Tourism, Care+,
 * About Us) and rebuilt on this app's current design system — same
 * page pattern as ResidentialHealthCare.jsx / PartnerWithUs.jsx
 * (Cormorant Garamond + DM Sans, green/navy palette, scroll-reveal
 * sections, SEO component).
 *
 * This page previously didn't exist as its own destination — the
 * footer's "Hospital Consultancy" link and any other in-app mention of
 * it pointed to /login?portal=hospital (a login shortcut) instead of a
 * real content page. This is that real page. Deep-dive topics that
 * already have their own dedicated pages elsewhere on the site
 * (Residential Health Care, Home Healthcare, Corporate Wellness,
 * International Patients / Medical Tourism) are summarized here with a
 * "Learn more" link through rather than duplicated in full, so this
 * page reads as an entry-point overview of everything covered under
 * We Care 4 'all's hospital/health-care consultancy services.
 */
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.hc{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}
.hc *{box-sizing:border-box;} .hc a{text-decoration:none;}
.hc h1,.hc h2,.hc h3,.hc h4{font-family:'Cormorant Garamond',Georgia,serif;}
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
.stagger.in>*:nth-child(9){opacity:1;transform:translateY(0);transition-delay:.35s}
.stagger.in>*:nth-child(10){opacity:1;transform:translateY(0);transition-delay:.39s}
.hc-card{background:#fff;border:1.5px solid #86efac;border-radius:16px;padding:22px;
  box-shadow:0 2px 10px rgba(11,31,58,.06);transition:all .25s;}
.hc-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(14,116,144,.14);border-color:#34d399;}
.hc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:linear-gradient(135deg,#047857,#059669);color:#fff;font-family:'DM Sans',sans-serif;
  font-weight:700;font-size:15px;padding:14px 26px;border-radius:10px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(14,116,144,.35);transition:all .25s;}
.hc-btn:hover{transform:translateY(-1px);}
.hc-btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:transparent;color:#047857;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:12px 22px;border-radius:10px;border:1.5px solid #047857;transition:all .25s;}
.hc-btn-outline:hover{background:#f0fdf4;}
.hc-point{display:flex;gap:14px;align-items:flex-start;padding:14px;border-radius:12px;transition:all .2s;}
.hc-point:hover{background:#f0fdf4;transform:translateX(4px);}
.hc-point-n{font-weight:700;color:#059669;font-size:17px;min-width:32px;flex-shrink:0;}
@media(max-width:600px){.hc-hero-cols{grid-template-columns:1fr!important;}}
`;

const W = ({ children, s = {} }) => (
  <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", fontWeight: "700",
    letterSpacing: "1.5px", color: "#047857", margin: "0 0 8px" }}>{children}</p>
);

const CORPORATE_SERVICES = [
  { title: "Setting Up Occupational Health Centers (OHCs)", desc: "From infrastructure planning to execution — a complete, ready-to-run occupational health setup for your organization." },
  { title: "Assistance & Operation of OHCs", desc: "Complete day-to-day management of health centers, so your team can focus on your business, not on running a clinic." },
  { title: "Preventive & Annual Health Check-ups", desc: "Promoting proactive employee health through scheduled screenings and wellness programmes." },
  { title: "Insurance Assistance", desc: "Support with health insurance processes and claims for your workforce." },
];

const RESIDENTIAL_POINTS = [
  { n: "01", title: "Immediate Medical Access", desc: "Quick treatment during emergencies without delays or external hospital dependency." },
  { n: "02", title: "Safety for Vulnerable Groups", desc: "Elderly, children, and chronic patients receive faster monitoring and care." },
  { n: "03", title: "Reduced Hospital Load", desc: "Minor illnesses and routine care handled within the residential community." },
  { n: "04", title: "Cost-Effective Healthcare", desc: "Lower travel costs and early detection prevent expensive treatments later." },
  { n: "05", title: "Preventive Care & Continuity", desc: "Regular checkups, screenings, and medication follow-ups ensure wellness." },
  { n: "06", title: "Fast Emergency Coordination", desc: "On-site professionals stabilize patients and manage ambulance response." },
  { n: "07", title: "Infection Control & Hygiene", desc: "Standard clinical protocols maintain sanitation and community health." },
  { n: "08", title: "Higher Property Value", desc: "Healthcare facilities increase trust, safety, and residential appeal." },
  { n: "09", title: "Home Care & Diagnostics", desc: "Supports sample collection, diagnostics, and coordinated home healthcare." },
  { n: "10", title: "Peace of Mind", desc: "Residents and families feel secure with doctors available on-site." },
];

const HOME_HEALTH_GROUPS = [
  { title: "Physiotherapy at Doorstep", items: ["Pain Management & Therapy", "Post-Surgery & Stroke Rehabilitation", "Neurological & Pediatric Therapy", "Pulmonary & Geriatric Care"] },
  { title: "Lab & Diagnostic Services", items: ["Blood & Urine Sample Collection", "ECG & X-Ray Services", "Master Health Check Packages"] },
  { title: "Nursing & Support Care", items: ["Professional Nursing Services", "Attendant & Elderly Care", "Post-Hospitalization Support"] },
];

export default function HospitalConsultancy() {
  const [heroRef, heroVis] = useScrollAnimation();
  const [corpRef, corpVis] = useScrollAnimation();
  const [resRef, resVis] = useScrollAnimation();
  const [homeRef, homeVis] = useScrollAnimation();
  const [tourismRef, tourismVis] = useScrollAnimation();
  const [carePlusRef, carePlusVis] = useScrollAnimation();
  const [aboutRef, aboutVis] = useScrollAnimation();

  return (
    <div className="hc">
      <style>{G}</style>
      <SEO title="Hospital Consultancy — Corporate, Residential & Home Health Care | We Care 4 'all'" path="/hospital-consultancy"
        description="We Care 4 'all's hospital and health care consultancy services — Occupational Health Centers for corporates, in-house clinics for residential complexes, home health care, and medical tourism, backed by a panel of trusted, ethical specialists."
        keywords="hospital consultancy, health care consultancy, occupational health center, corporate health care, residential health care, home health care, medical tourism, care plus, we care 4 all" />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,#f0fdf4 0%,#fff 60%)", padding: "72px 0 56px", borderBottom: "1px solid #86efac" }}>
        <W>
          <div ref={heroRef} className={`reveal${heroVis ? " in" : ""} hc-hero-cols`}
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "36px", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px",
                fontWeight: "700", letterSpacing: "1.5px", color: "#047857", background: "#f0fdf4",
                border: "1px solid #86efac", borderRadius: "20px", padding: "6px 14px", marginBottom: "16px" }}>
                🏥 HOSPITAL CONSULTANCY
              </span>
              <h1 style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: "700", color: "#0b1f3a", lineHeight: "1.15", margin: "0 0 16px" }}>
                Health Care Consultancy, done right.
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", color: "#64748b", lineHeight: "1.75", margin: "0 0 24px", fontWeight: "300", maxWidth: "500px" }}>
                We guide individuals and organizations to the right places for medical and surgical treatment, leveraging our panel of trusted, ethical, and experienced specialists with decades of expertise — affordable, without compromising quality of care.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                <a href="#what-we-do" className="hc-btn">What We Do →</a>
                <Link to="/contact" className="hc-btn-outline">Talk to Us</Link>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 32px rgba(14,116,144,.10)" }}>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 14px" }}>What we cover</p>
              {["Corporate Occupational Health Centers", "Residential complex in-house clinics", "Home health care & physiotherapy", "Medical tourism for international patients"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ color: "#047857", fontWeight: "700" }}>✓</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#374151" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </W>
      </section>

      {/* WHAT WE DO — CORPORATE */}
      <section id="what-we-do" style={{ padding: "72px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <SectionLabel>WHAT WE DO</SectionLabel>
            <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 12px" }}>Corporate Health Care</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#64748b", maxWidth: "720px", margin: "0 auto", lineHeight: "1.75" }}>
              We provide customized healthcare solutions for corporate organizations, ensuring the well-being of employees while meeting compliance standards.
            </p>
          </div>
          <div ref={corpRef} className={`stagger${corpVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: "20px" }}>
            {CORPORATE_SERVICES.map((s) => (
              <div key={s.title} className="hc-card">
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#64748b", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link to="/corporate-wellness" className="hc-btn-outline">Learn more about Corporate Health Care →</Link>
          </div>
        </W>
      </section>

      {/* RESIDENTIAL HEALTH CARE */}
      <section style={{ background: "#f0fdf4", padding: "64px 0", borderTop: "1px solid #86efac", borderBottom: "1px solid #86efac" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <SectionLabel>IN-HOUSE CLINICS</SectionLabel>
            <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 12px" }}>Residential Health Care</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#64748b", maxWidth: "760px", margin: "0 auto", lineHeight: "1.75" }}>
              We specialize in setting up and managing in-house clinics within large residential complexes — ensuring faster care, safety, and peace of mind for residents.
            </p>
          </div>
          <div ref={resRef} className={`stagger${resVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: "6px" }}>
            {RESIDENTIAL_POINTS.map((p) => (
              <div key={p.n} className="hc-point">
                <span className="hc-point-n">{p.n}</span>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#0b1f3a" }}>{p.title}</h4>
                  <p style={{ margin: 0, fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#64748b", fontWeight: "300" }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link to="/residential-healthcare" className="hc-btn-outline">Learn more about Residential Health Care →</Link>
          </div>
        </W>
      </section>

      {/* HOME HEALTH CARE */}
      <section style={{ padding: "72px 0" }}>
        <W>
          <div ref={homeRef} className={`reveal${homeVis ? " in" : ""} hc-card`} style={{ padding: "40px" }}>
            <SectionLabel>DOORSTEP CARE</SectionLabel>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 10px" }}>Home Health Care</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#64748b", margin: "0 0 26px", maxWidth: "800px", lineHeight: "1.75" }}>
              Bringing quality healthcare to the comfort of your home, delivered by trained professionals with compassion and care.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))", gap: "20px" }}>
              {HOME_HEALTH_GROUPS.map((g) => (
                <div key={g.title} style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "14px", padding: "20px" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: "700", color: "#0b1f3a" }}>{g.title}</h4>
                  <ul style={{ margin: 0, paddingLeft: "18px" }}>
                    {g.items.map((it) => (
                      <li key={it} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "26px" }}>
              <Link to="/home-healthcare" className="hc-btn">Book Home Health Care →</Link>
            </div>
          </div>
        </W>
      </section>

      {/* MEDICAL TOURISM */}
      <section style={{ background: "#f0fdf4", padding: "64px 0", borderTop: "1px solid #86efac", borderBottom: "1px solid #86efac" }}>
        <W>
          <div ref={tourismRef} className={`reveal${tourismVis ? " in" : ""} hc-hero-cols`}
            style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "32px", alignItems: "center" }}>
            <div>
              <SectionLabel>MEDICAL TOURISM</SectionLabel>
              <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 12px" }}>Care for international patients</h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#374151", margin: "0 0 8px", lineHeight: "1.75" }}>
                We provide seamless medical tourism services for international patients, connecting them with quality healthcare facilities across India.
              </p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#64748b", margin: "0 0 20px", lineHeight: "1.75" }}>
                Our focus is affordable, ethical treatment without compromising medical standards. <strong style={{ color: "#0b1f3a" }}>Care with compassion</strong> is our promise.
              </p>
              <Link to="/international-patients" className="hc-btn">Enquire Now →</Link>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "16px", padding: "26px", textAlign: "center" }}>
              <span style={{ fontSize: "40px" }}>✈️🏥</span>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#64748b", marginTop: "12px" }}>
                Trusted, ethical guidance from arrival to recovery.
              </p>
            </div>
          </div>
        </W>
      </section>

      {/* CARE+ */}
      <section style={{ padding: "72px 0" }}>
        <W>
          <div ref={carePlusRef} className={`reveal${carePlusVis ? " in" : ""} hc-hero-cols`}
            style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "32px", alignItems: "center" }}>
            <div style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "16px", padding: "26px", textAlign: "center" }}>
              <span style={{ fontSize: "40px" }}>🤍</span>
            </div>
            <div>
              <h2 style={{ fontSize: "clamp(20px,3vw,24px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 4px" }}>
                Care+ <span style={{ fontSize: "14px", fontWeight: "400", color: "#64748b" }}>(A Division of We Care 4 'all')</span>
              </h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#374151", margin: "10px 0", lineHeight: "1.75" }}>
                Care+ is committed to delivering compassionate, reliable support for elderly individuals who require care and companionship at home. We emphasize dignity, comfort, and empathetic palliative care through our personalized services.
              </p>
              <ul style={{ margin: "14px 0 20px", paddingLeft: "18px" }}>
                <li style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#374151", marginBottom: "8px" }}><strong>Safety:</strong> 24/7 monitoring for a secure, comfortable home environment</li>
                <li style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#374151", marginBottom: "8px" }}><strong>Medical Assistance:</strong> Support with daily activities, medication reminders, and basic healthcare needs</li>
                <li style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#374151" }}><strong>Emergency Care:</strong> Prompt response and assistance during critical golden hours</li>
              </ul>
              <Link to="/contact" className="hc-btn-outline">Get in Touch →</Link>
            </div>
          </div>
        </W>
      </section>

      {/* ABOUT US */}
      <section style={{ background: "#0b1f3a", padding: "64px 0" }}>
        <W>
          <div ref={aboutRef} className={`reveal${aboutVis ? " in" : ""}`} style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "#34d399", margin: "0 0 8px" }}>ABOUT US</p>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "#fff", margin: "0 0 16px" }}>Founded in 2009, in Chennai</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "rgba(255,255,255,.72)", lineHeight: "1.8", margin: "0 0 14px" }}>
              Founded in 2009 with a passion for healthcare, We Care 4 'all' is dedicated to helping people access the right treatment at the right time and place. We connect individuals with top healthcare providers, ensuring world-class medical and surgical treatments through a trusted panel of experienced specialists.
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "rgba(255,255,255,.72)", lineHeight: "1.8", margin: "0 0 26px" }}>
              With advancements in healthcare technology and our compassionate approach, we aim to be a trusted partner for those seeking expert care and support.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/about" className="hc-btn">About We Care 4 'all' →</Link>
              <Link to="/contact" className="hc-btn-outline" style={{ borderColor: "#34d399", color: "#34d399" }}>Contact Us</Link>
            </div>
          </div>
        </W>
      </section>
    </div>
  );
}
