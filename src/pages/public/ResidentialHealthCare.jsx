/**
 * ResidentialHealthCare.jsx — Public info page + enquiry form for
 * residential associations / apartment complexes looking to set up an
 * in-house clinic on their premises.
 *
 * Modeled directly on CorporateWellness.jsx: same self-contained page
 * pattern, same lack of a dedicated backend table for now. The enquiry
 * form reuses the existing /auth/contact endpoint (same one Contact.jsx
 * and CorporateWellness.jsx use), tagging the submission with subject
 * "Residential Health Care" so it lands in the admin's existing
 * contact_submissions inbox rather than needing a new table + admin
 * screen for what is, for now, a low-volume B2B enquiry.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.rh{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}
.rh *{box-sizing:border-box;} .rh a{text-decoration:none;}
.rh h1,.rh h2,.rh h3,.rh h4{font-family:'Cormorant Garamond',Georgia,serif;}
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
.rh-card{background:#fff;border:1.5px solid #a5f3fc;border-radius:16px;padding:22px;
  box-shadow:0 2px 10px rgba(11,31,58,.06);transition:all .25s;}
.rh-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(14,116,144,.14);border-color:#22d3ee;}
.rh-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:11px 14px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;
  outline:none;transition:all .2s;}
.rh-inp:focus{border-color:#0e7490;background:#fff;box-shadow:0 0 0 3px rgba(14,116,144,.10);}
.rh-inp.err{border-color:#ef4444;background:#fef2f2;}
.rh-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.rh-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:linear-gradient(135deg,#0e7490,#0891b2);color:#fff;font-family:'DM Sans',sans-serif;
  font-weight:700;font-size:15px;padding:14px 26px;border-radius:10px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(14,116,144,.35);transition:all .25s;width:100%;}
.rh-btn:hover{transform:translateY(-1px);}
.rh-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.4);border-top:2px solid #fff;
  border-radius:50%;animation:spin .75s linear infinite;display:inline-block;}
.rh-form-grid{display:grid;grid-template-columns:1fr;gap:14px;}
@media(min-width:640px){.rh-form-grid{grid-template-columns:1fr 1fr;}.rh-full{grid-column:span 2;}}
@media(max-width:600px){.rh-hero-cols{grid-template-columns:1fr!important;}}
`;

const W = ({ children, s = {} }) => (
  <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>
);

const WHY_REASONS = [
  { ic: "🚑", title: "Immediate Access to Medical Care", desc: "Prompt medical attention during emergencies, reducing response time and preventing complications caused by delays in reaching external healthcare facilities." },
  { ic: "🛡️", title: "Enhanced Safety for Vulnerable Residents", desc: "Elderly individuals, children, pregnant women, and residents with chronic conditions benefit from continuous monitoring and quick intervention, especially at night or during medical crises." },
  { ic: "🏥", title: "Reduced Burden on Hospitals", desc: "Minor ailments, first aid, routine consultations, and follow-up care are managed within the complex, minimizing unnecessary hospital visits and ER overcrowding." },
  { ic: "💰", title: "Cost-Effective Healthcare Delivery", desc: "Residents save on transportation and repeated consultation fees, while preventive care and early diagnosis help avoid expensive treatment later." },
  { ic: "📅", title: "Preventive & Continuity of Care", desc: "Regular health check-ups, screening programmes, medication monitoring, and health education are seamlessly integrated, promoting long-term wellness." },
  { ic: "📡", title: "Faster Emergency Coordination", desc: "On-site medical staff can stabilize patients and coordinate ambulance services efficiently, sharing accurate medical information with hospitals for better outcomes." },
  { ic: "🧼", title: "Improved Infection Control & Hygiene", desc: "Proper biomedical waste management and clinical protocols help maintain higher health and sanitation standards within the community." },
  { ic: "🏘️", title: "Increased Property Value & Trust", desc: "A dedicated healthcare facility enhances the attractiveness and perceived value of the complex, building resident trust in safety and care." },
  { ic: "🧪", title: "Home Healthcare & Diagnostics Support", desc: "Facilities for sample collection, basic diagnostics, and home-care coordination make healthcare more accessible and convenient." },
  { ic: "🤍", title: "Peace of Mind for Residents & Families", desc: "Knowing trained medical professionals are available on the premises reassures residents and families, especially those living alone." },
];

const WHAT_WE_DO = [
  { n: "1", title: "Establishing Fully Functional Clinics", desc: "We set up a clinic within the premises provided by the residential association, equipped with essential medical equipment and compliant biomedical waste management systems — plus facilities for blood and urine sample collection." },
  { n: "2", title: "Trained Healthcare Professionals", desc: "A doctor and staff nurse, available 24 hours, are appointed to handle emergencies and provide continuous care for apartment residents." },
  { n: "3", title: "Ambulance Services", desc: "Ambulance services when required, coordinated through our associated ambulance operators." },
];

function EnquiryForm() {
  const [form, setForm] = useState({ complex_name: "", contact_person: "", email: "", mobile: "", num_units: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.complex_name.trim()) e.complex_name = "Complex / association name required";
    if (!form.contact_person.trim()) e.contact_person = "Contact person required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.mobile.trim()) e.mobile = "Mobile required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const message =
        `Residential Complex / Association: ${form.complex_name}\n` +
        (form.num_units.trim() ? `Approx. number of units: ${form.num_units}\n\n` : "\n") +
        (form.message.trim() || "No additional details provided.");
      const res = await fetch(`${API}/auth/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: `${form.contact_person} (${form.complex_name})`,
          email:     form.email,
          mobile:    form.mobile,
          subject:   "Residential Health Care",
          message,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed to send");
      setDone(true);
    } catch (err) {
      showToast("Failed to send enquiry. Please call 90257 86467", "error");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ padding: "52px 32px", textAlign: "center" }}>
      <div style={{ width: "68px", height: "68px", background: "#ecfeff", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: "30px" }}>✅</div>
      <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#0b1f3a", marginBottom: "8px" }}>Enquiry Sent!</h3>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", color: "#64748b", marginBottom: "22px" }}>
        Our team will reach out to you within 1–2 working days to discuss the setup process and charges.
      </p>
      <button onClick={() => { setDone(false); setForm({ complex_name: "", contact_person: "", email: "", mobile: "", num_units: "", message: "" }); }}
        style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: "600", color: "#0e7490",
          background: "transparent", border: "1.5px solid #0e7490", padding: "10px 22px", borderRadius: "8px", cursor: "pointer" }}>
        Send Another Enquiry
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate style={{ padding: "28px" }}>
      <div className="rh-form-grid">
        <div>
          <label className="rh-lbl" htmlFor="public-residentialhealthcare-complex-name">Residential Complex / Association Name *</label>
          <input id="public-residentialhealthcare-complex-name" name="complex_name" value={form.complex_name} onChange={handleChange}
            placeholder="e.g. Greenview Apartments Owners' Association" className={`rh-inp${errors.complex_name ? " err" : ""}`} />
          {errors.complex_name && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.complex_name}</p>}
        </div>
        <div>
          <label className="rh-lbl" htmlFor="public-residentialhealthcare-contact-person">Contact Person *</label>
          <input id="public-residentialhealthcare-contact-person" name="contact_person" value={form.contact_person} onChange={handleChange}
            placeholder="Association secretary / admin name" className={`rh-inp${errors.contact_person ? " err" : ""}`} />
          {errors.contact_person && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.contact_person}</p>}
        </div>
        <div>
          <label className="rh-lbl" htmlFor="public-residentialhealthcare-email">Email *</label>
          <input id="public-residentialhealthcare-email" name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="you@example.com" className={`rh-inp${errors.email ? " err" : ""}`} />
          {errors.email && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.email}</p>}
        </div>
        <div>
          <label className="rh-lbl" htmlFor="public-residentialhealthcare-mobile-number">Mobile Number *</label>
          <input id="public-residentialhealthcare-mobile-number" name="mobile" type="tel" value={form.mobile} onChange={handleChange}
            placeholder="+91 90257 86467" className={`rh-inp${errors.mobile ? " err" : ""}`} />
          {errors.mobile && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.mobile}</p>}
        </div>
        <div className="rh-full">
          <label className="rh-lbl" htmlFor="public-residentialhealthcare-num-units">Approx. Number of Units (optional)</label>
          <input id="public-residentialhealthcare-num-units" name="num_units" value={form.num_units} onChange={handleChange}
            placeholder="e.g. 250 flats" className="rh-inp" />
        </div>
        <div className="rh-full">
          <label className="rh-lbl" htmlFor="public-residentialhealthcare-message-optional">Anything else we should know? (optional)</label>
          <textarea id="public-residentialhealthcare-message-optional" name="message" value={form.message} onChange={handleChange} rows={4}
            placeholder="e.g. available premises for the clinic, preferred timelines..."
            className="rh-inp" style={{ resize: "vertical", fontFamily: "'DM Sans',sans-serif" }} />
        </div>
      </div>
      <button type="submit" disabled={loading} className="rh-btn" style={{ marginTop: "18px" }}>
        {loading ? <><span className="spinner" /> Sending…</> : "Get in Touch →"}
      </button>
    </form>
  );
}

export default function ResidentialHealthCare() {
  const [heroRef, heroVis] = useScrollAnimation();
  const [whyRef, whyVis] = useScrollAnimation();
  const [whatRef, whatVis] = useScrollAnimation();
  const [formRef, formVis] = useScrollAnimation();

  return (
    <div className="rh">
      <style>{G}</style>
      <SEO title="Residential Health Care — In-House Clinics for Apartment Complexes" path="/residential-healthcare"
        description="We set up and manage in-house clinics within residential complexes — 24-hour doctor and nurse coverage, on-site diagnostics, and ambulance coordination, in compliance with Indian government regulations." />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,#ecfeff 0%,#fff 60%)", padding: "72px 0 56px", borderBottom: "1px solid #a5f3fc" }}>
        <W>
          <div ref={heroRef} className={`reveal${heroVis ? " in" : ""} rh-hero-cols`}
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "36px", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px",
                fontWeight: "700", letterSpacing: "1.5px", color: "#0e7490", background: "#ecfeff",
                border: "1px solid #a5f3fc", borderRadius: "20px", padding: "6px 14px", marginBottom: "16px" }}>
                🏘️ RESIDENTIAL HEALTH CARE
              </span>
              <h1 style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: "700", color: "#0b1f3a", lineHeight: "1.15", margin: "0 0 16px" }}>
                In-house clinics for residential complexes.
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", color: "#64748b", lineHeight: "1.75", margin: "0 0 24px", fontWeight: "300", maxWidth: "480px" }}>
                In compliance with Indian government regulations, we specialize in setting up and managing in-house clinics within residential complexes — bringing accessible, affordable, and timely healthcare to your community.
              </p>
              <a href="#enquire" className="rh-btn" style={{ width: "auto", textDecoration: "none" }}>Get in Touch →</a>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #a5f3fc", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 32px rgba(14,116,144,.10)" }}>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 14px" }}>What your community gets</p>
              {["24-hour doctor & staff nurse coverage", "On-site blood & urine sample collection", "Compliant biomedical waste management", "Ambulance coordination when needed"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ color: "#0e7490", fontWeight: "700" }}>✓</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#374151" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </W>
      </section>

      {/* WHY */}
      <section style={{ padding: "72px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "#0e7490", margin: "0 0 8px" }}>WHY HAVE AN IN-HOUSE CLINIC?</p>
            <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 12px" }}>Why large residential complexes choose an in-house clinic</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#64748b", maxWidth: "720px", margin: "0 auto", lineHeight: "1.75" }}>
              An in-house clinic transforms a residential complex into a safer, healthier, and more resilient living environment — integrating accessible, affordable, and timely healthcare services for every resident.
            </p>
          </div>
          <div ref={whyRef} className={`stagger${whyVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "20px" }}>
            {WHY_REASONS.map((o) => (
              <div key={o.title} className="rh-card">
                <div style={{ width: "48px", height: "48px", background: "#ecfeff", border: "1.5px solid #a5f3fc",
                  borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "14px" }}>{o.ic}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 8px" }}>{o.title}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#64748b", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* WHAT WE DO */}
      <section style={{ background: "#ecfeff", padding: "64px 0", borderTop: "1px solid #a5f3fc", borderBottom: "1px solid #a5f3fc" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "#0e7490", margin: "0 0 8px" }}>WHAT WE DO</p>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "#0b1f3a", margin: 0 }}>Setting up your residential clinic</h2>
          </div>
          <div ref={whatRef} className={`stagger${whatVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "22px" }}>
            {WHAT_WE_DO.map((s) => (
              <div key={s.n} style={{ background: "#fff", border: "1.5px solid #a5f3fc", borderRadius: "16px", padding: "24px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#0e7490,#0891b2)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", marginBottom: "14px" }}>{s.n}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#64748b", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* ENQUIRY FORM */}
      <section id="enquire" style={{ padding: "72px 0" }}>
        <W s={{ maxWidth: "720px" }}>
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "#0e7490", margin: "0 0 8px" }}>HOW TO INITIATE THE PROCESS AND KNOW THE CHARGES</p>
          </div>
          <div ref={formRef} className={`reveal${formVis ? " in" : ""}`}
            style={{ background: "#fff", border: "1.5px solid #a5f3fc", borderRadius: "20px", boxShadow: "0 12px 32px rgba(14,116,144,.10)", overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 0" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 6px" }}>Get in touch with us today</h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#64748b", margin: 0 }}>Tell us about your residential complex and we'll walk you through the setup process and charges.</p>
            </div>
            <EnquiryForm />
          </div>
          <p style={{ textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#6b7688", marginTop: "18px" }}>
            Prefer to talk directly? Call <a href="tel:+919025786467" style={{ color: "#0e7490", fontWeight: "600" }}>90257 86467</a> or use our <Link to="/contact" style={{ color: "#0e7490", fontWeight: "600" }}>general contact form</Link>.
          </p>
        </W>
      </section>
    </div>
  );
}
