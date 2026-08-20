/**
 * CarePlus.jsx — Public info page + enquiry form for Care+, We Care 4
 * 'all''s dedicated geriatric, palliative and hospice home-care service.
 *
 * Split out (Aug 2026 client request: "Care+ and Home Healthcare
 * Services must be two different pages") from HomeHealthcare.jsx, which
 * used to carry the "Care+" name for the general nurse/physiotherapy
 * booking catalog. That was a conflation of two different audiences:
 *  - Home Healthcare (/home-healthcare) — book a nurse, physiotherapist,
 *    attendant, or lab visit as a one-off or short course of sessions.
 *  - Care+ (this page) — an ongoing, assessed geriatric/hospice/
 *    palliative care arrangement for an elderly or dependent family
 *    member, "Be Home. Feel Home." positioning from the client's own
 *    Care+ brochure copy.
 *
 * Modeled on ResidentialHealthCare.jsx's self-contained page + enquiry
 * pattern (same /auth/contact endpoint, tagged with its own subject so
 * it lands in the admin's existing contact_submissions inbox) since
 * Care+ needs an individual assessment before a plan/price can be
 * given — this is a "Get in Touch" page, not a bookable-catalog page
 * like Home Healthcare.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO, { breadcrumbJsonLd } from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.cp{font-family:'Inter',sans-serif;color:#1e293b;overflow-x:hidden;}
.cp *{box-sizing:border-box;} .cp a{text-decoration:none;}
.cp h1,.cp h2,.cp h3,.cp h4{font-family:'Manrope',sans-serif;}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease;}
.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease;}
.stagger.in>*:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.03s}
.stagger.in>*:nth-child(2){opacity:1;transform:translateY(0);transition-delay:.07s}
.stagger.in>*:nth-child(3){opacity:1;transform:translateY(0);transition-delay:.11s}
.stagger.in>*:nth-child(4){opacity:1;transform:translateY(0);transition-delay:.15s}
.stagger.in>*:nth-child(5){opacity:1;transform:translateY(0);transition-delay:.19s}
.stagger.in>*:nth-child(6){opacity:1;transform:translateY(0);transition-delay:.23s}
.cp-card{background:#fff;border:1.5px solid #86efac;border-radius:16px;padding:22px;
  box-shadow:0 2px 10px rgba(18,59,74,.06);transition:all .25s;}
.cp-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(14,116,144,.14);border-color:var(--wc-green-lighter);}
.cp-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:11px 14px;
  font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);
  outline:none;transition:all .2s;}
.cp-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(14,116,144,.10);}
.cp-inp.err{border-color:#ef4444;background:#fef2f2;}
.cp-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.cp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;font-family:'Inter',sans-serif;
  font-weight:700;font-size:15px;padding:14px 26px;border-radius:10px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(14,116,144,.35);transition:all .25s;width:100%;}
.cp-btn:hover{transform:translateY(-1px);}
.cp-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.4);border-top:2px solid #fff;
  border-radius:50%;animation:spin .75s linear infinite;display:inline-block;}
.cp-form-grid{display:grid;grid-template-columns:1fr;gap:14px;}
@media(min-width:640px){.cp-form-grid{grid-template-columns:1fr 1fr;}.cp-full{grid-column:span 2;}}
@media(max-width:600px){.cp-hero-cols{grid-template-columns:1fr!important;}}
`;

const W = ({ children, s = {} }) => (
  <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>
);

// "The Care+ Difference" — condensed from the client's Care+ brochure
// copy ("Be Home. Feel Home. Care+ is There.").
const WHY_HOME = [
  { ic: "🏠", title: "Their Own Room, Their Own Bed", desc: "Familiar surroundings, favourite chair, personal belongings — nothing changes except the support around them." },
  { ic: "👨‍👩‍👧", title: "Close to Family & Neighbours", desc: "They stay connected to the people and routines that matter most, instead of moving to an unfamiliar facility." },
  { ic: "🩺", title: "Professional Care, at Home", desc: "Trained attendants and nursing support, coordinated around the individual — not an institutional routine." },
];

// "Continuous Care at Home" services, per the client's exact requested
// copy (Aug 2026): Safety / Medical Assistance / Emergency Care.
const CARE_SERVICES = [
  { ic: "🛡️", title: "Safety", desc: "24-hour monitoring to ensure a secure living environment." },
  { ic: "💊", title: "Medical Assistance", desc: "Help with daily activities and medicines." },
  { ic: "🚑", title: "Emergency Care", desc: "Immediate response during critical golden hours." },
];

const WHO_ITS_FOR = [
  "Finding it difficult to manage independently",
  "Bedridden or has reduced mobility",
  "Recently returned home after hospitalisation",
  "Living with a chronic or progressive illness",
  "Requires palliative or hospice care",
  "Has family who cannot provide round-the-clock support",
];

function EnquiryForm() {
  const [form, setForm] = useState({ patient_name: "", contact_person: "", email: "", mobile: "", relation: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.patient_name.trim()) e.patient_name = "Patient / family member's name required";
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
        `Patient / family member: ${form.patient_name}\n` +
        (form.relation.trim() ? `Contact person's relation to patient: ${form.relation}\n\n` : "\n") +
        (form.message.trim() || "No additional details provided.");
      const res = await fetch(`${API}/auth/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: `${form.contact_person} (for ${form.patient_name})`,
          email:     form.email,
          mobile:    form.mobile,
          subject:   "Care+ Enquiry",
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
      <div style={{ width: "68px", height: "68px", background: "var(--wc-sage)", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: "30px" }}>✅</div>
      <h3 style={{ fontSize: "24px", fontWeight: "700", color: "var(--wc-navy)", marginBottom: "8px" }}>Enquiry Sent!</h3>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "15px", color: "var(--wc-muted)", marginBottom: "22px" }}>
        A Care Coordinator will reach out within 1–2 working days to understand your loved one's needs and walk you through the Care+ plan and charges.
      </p>
      <button onClick={() => { setDone(false); setForm({ patient_name: "", contact_person: "", email: "", mobile: "", relation: "", message: "" }); }}
        style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: "600", color: "var(--wc-green)",
          background: "transparent", border: "1.5px solid var(--wc-green)", padding: "10px 22px", borderRadius: "8px", cursor: "pointer" }}>
        Send Another Enquiry
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate style={{ padding: "28px" }}>
      <div className="cp-form-grid">
        <div>
          <label className="cp-lbl" htmlFor="public-careplus-patient-name">Patient / Family Member's Name *</label>
          <input id="public-careplus-patient-name" name="patient_name" value={form.patient_name} onChange={handleChange}
            placeholder="Who needs care?" className={`cp-inp${errors.patient_name ? " err" : ""}`} />
          {errors.patient_name && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.patient_name}</p>}
        </div>
        <div>
          <label className="cp-lbl" htmlFor="public-careplus-contact-person">Your Name *</label>
          <input id="public-careplus-contact-person" name="contact_person" value={form.contact_person} onChange={handleChange}
            placeholder="Person we should contact" className={`cp-inp${errors.contact_person ? " err" : ""}`} />
          {errors.contact_person && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.contact_person}</p>}
        </div>
        <div>
          <label className="cp-lbl" htmlFor="public-careplus-email">Email *</label>
          <input id="public-careplus-email" name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="you@example.com" className={`cp-inp${errors.email ? " err" : ""}`} />
          {errors.email && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.email}</p>}
        </div>
        <div>
          <label className="cp-lbl" htmlFor="public-careplus-mobile-number">Mobile Number *</label>
          <input id="public-careplus-mobile-number" name="mobile" type="tel" value={form.mobile} onChange={handleChange}
            placeholder="+91 90257 86467" className={`cp-inp${errors.mobile ? " err" : ""}`} />
          {errors.mobile && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.mobile}</p>}
        </div>
        <div className="cp-full">
          <label className="cp-lbl" htmlFor="public-careplus-relation">Your Relation to the Patient (optional)</label>
          <input id="public-careplus-relation" name="relation" value={form.relation} onChange={handleChange}
            placeholder="e.g. Daughter, Son, Attendant" className="cp-inp" />
        </div>
        <div className="cp-full">
          <label className="cp-lbl" htmlFor="public-careplus-message-optional">Tell us about their care needs (optional)</label>
          <textarea id="public-careplus-message-optional" name="message" value={form.message} onChange={handleChange} rows={4}
            placeholder="e.g. mobility level, existing conditions, whether you're coordinating from another city or country..."
            className="cp-inp" style={{ resize: "vertical", fontFamily: "'Inter',sans-serif" }} />
        </div>
      </div>
      <button type="submit" disabled={loading} className="cp-btn" style={{ marginTop: "18px" }}>
        {loading ? <><span className="spinner" /> Sending…</> : "Get in Touch →"}
      </button>
    </form>
  );
}

const CARE_PLUS_JSONLD = [
  breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Care+", path: "/care-plus" }]),
  {
    "@type": "Service",
    "serviceType": "Geriatric, Palliative & Hospice Home Care",
    "name": "Care+ — Geriatric & Hospice Care at Home",
    "description": "Compassionate geriatric, palliative and hospice care for elderly and dependent individuals in the comfort of their own home — 24-hour attendant support, nursing support, and 24-hour monitoring.",
    "provider": {
      "@type": "MedicalBusiness",
      "name": "We Care 4 'all'",
      "url": "https://www.wecare4all.in/",
    },
    "areaServed": "Chennai, Tamil Nadu, India",
  },
];

export default function CarePlus() {
  const [heroRef, heroVis] = useScrollAnimation();
  const [whyRef, whyVis] = useScrollAnimation();
  const [svcRef, svcVis] = useScrollAnimation();
  const [whoRef, whoVis] = useScrollAnimation();
  const [formRef, formVis] = useScrollAnimation();

  return (
    <div className="cp">
      <style>{G}</style>
      <SEO title="Care+ — Geriatric, Palliative & Hospice Care at Home | We Care 4 'all'" path="/care-plus"
        description="Care+ brings compassionate geriatric, palliative and hospice care to elderly and dependent individuals in the comfort of their own home — 24-hour attendant support, nursing support, and 24-hour monitoring in Chennai."
        keywords="geriatric care, elderly care at home, hospice care chennai, palliative care at home, old age care, senior citizen care, home nursing for elderly, 24 hour attendant for elderly"
        jsonLd={CARE_PLUS_JSONLD} />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,var(--wc-sage) 0%,#fff 60%)", padding: "72px 0 56px", borderBottom: "1px solid #86efac" }}>
        <W>
          <div ref={heroRef} className={`reveal${heroVis ? " in" : ""} cp-hero-cols`}
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "36px", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", fontFamily: "'Inter',sans-serif", fontSize: "12.5px",
                fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", background: "var(--wc-sage)",
                border: "1px solid #86efac", borderRadius: "20px", padding: "6px 14px", marginBottom: "16px" }}>
                🕊️ CARE+
              </span>
              <h1 style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: "700", color: "var(--wc-navy)", lineHeight: "1.15", margin: "0 0 16px" }}>
                Be Home. Feel Home. Care+ is There.
              </h1>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "16px", color: "var(--wc-muted)", lineHeight: "1.75", margin: "0 0 24px", fontWeight: "300", maxWidth: "480px" }}>
                Care+ is dedicated to providing compassionate support for lonely elderly individuals in the comfort of their homes. We understand the importance of providing empathetic palliative care.
              </p>
              <a href="#enquire" className="cp-btn" style={{ width: "auto", textDecoration: "none" }}>Get in Touch →</a>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 32px rgba(14,116,144,.10)" }}>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: "20px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 14px" }}>Our comprehensive services ensure</p>
              {CARE_SERVICES.map((s) => (
                <div key={s.title} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
                  <span style={{ fontSize: "18px" }}>{s.ic}</span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "#374151" }}>
                    <strong style={{ color: "var(--wc-navy)" }}>{s.title}:</strong> {s.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </W>
      </section>

      {/* THE CARE+ DIFFERENCE */}
      <section style={{ padding: "72px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>THE CARE+ DIFFERENCE</p>
            <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 12px" }}>Why move them away from home, when care can come home?</h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14.5px", color: "var(--wc-muted)", maxWidth: "720px", margin: "0 auto", lineHeight: "1.75" }}>
              We don't take the person away from their home to provide care. We bring the care to where they belong.
            </p>
          </div>
          <div ref={whyRef} className={`stagger${whyVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px,100%),1fr))", gap: "20px" }}>
            {WHY_HOME.map((o) => (
              <div key={o.title} className="cp-card">
                <div style={{ width: "48px", height: "48px", background: "var(--wc-sage)", border: "1.5px solid #86efac",
                  borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "14px" }}>{o.ic}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 8px" }}>{o.title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "var(--wc-muted)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* CONTINUOUS CARE AT HOME */}
      <section style={{ background: "var(--wc-sage)", padding: "64px 0", borderTop: "1px solid #86efac", borderBottom: "1px solid #86efac" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>CONTINUOUS CARE AT HOME</p>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "var(--wc-navy)", margin: 0 }}>Compassionate care for lonely elderly</h2>
          </div>
          <div ref={svcRef} className={`stagger${svcVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px,100%),1fr))", gap: "22px" }}>
            {CARE_SERVICES.map((s) => (
              <div key={s.title} style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "26px", marginBottom: "12px" }}>{s.ic}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "var(--wc-muted)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", maxWidth: "640px", margin: "28px auto 0", lineHeight: "1.75" }}>
            Let us guide you through a seamless and compassionate healthcare experience. For more details, get in touch.
          </p>
        </W>
      </section>

      {/* WHO IT'S FOR */}
      <section style={{ padding: "64px 0" }}>
        <W s={{ maxWidth: "820px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>WHEN CARE+ MAY BE CONSIDERED</p>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "var(--wc-navy)", margin: 0 }}>Care+ may be right for your loved one if they are:</h2>
          </div>
          <div ref={whoRef} className={`stagger${whoVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: "12px" }}>
            {WHO_ITS_FOR.map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "10px", background: "#fff",
                border: "1px solid var(--wc-border)", borderRadius: "12px", padding: "14px 16px" }}>
                <span style={{ color: "var(--wc-green)", fontWeight: "700" }}>✓</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "#374151" }}>{t}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: "12.5px", color: "#94a3b8", marginTop: "18px" }}>
            The suitability and level of care required should be assessed individually.
          </p>
        </W>
      </section>

      {/* ENQUIRY FORM */}
      <section id="enquire" style={{ padding: "72px 0" }}>
        <W s={{ maxWidth: "720px" }}>
          <div ref={formRef} className={`reveal${formVis ? " in" : ""}`}
            style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "20px", boxShadow: "0 12px 32px rgba(14,116,144,.10)", overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 0" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 6px" }}>Get in touch with us today</h2>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", margin: 0 }}>Tell us about your loved one's needs and a Care Coordinator will walk you through the Care+ plan and charges.</p>
            </div>
            <EnquiryForm />
          </div>
          <p style={{ textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#6b7688", marginTop: "18px" }}>
            Prefer to talk directly? Call <a href="tel:+919025786467" style={{ color: "var(--wc-green)", fontWeight: "600" }}>90257 86467</a> or use our <Link to="/contact" style={{ color: "var(--wc-green)", fontWeight: "600" }}>general contact form</Link>.
          </p>
        </W>
      </section>
    </div>
  );
}
