/**
 * CorporateWellness.jsx — Public info page + enquiry form for employers
 * looking to set up a corporate wellness programme for their staff.
 *
 * No dedicated backend table for this yet — the enquiry form reuses the
 * existing /auth/contact endpoint (same one Contact.jsx uses), tagging
 * the submission with subject "Corporate Wellness" so it lands in the
 * admin's existing contact_submissions inbox rather than needing a new
 * table + admin screen for what is, for now, a low-volume B2B enquiry.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.cw{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}
.cw *{box-sizing:border-box;} .cw a{text-decoration:none;}
.cw h1,.cw h2,.cw h3,.cw h4{font-family:'Cormorant Garamond',Georgia,serif;}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease;}
.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease;}
.stagger.in>*:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.04s}
.stagger.in>*:nth-child(2){opacity:1;transform:translateY(0);transition-delay:.1s}
.stagger.in>*:nth-child(3){opacity:1;transform:translateY(0);transition-delay:.16s}
.stagger.in>*:nth-child(4){opacity:1;transform:translateY(0);transition-delay:.22s}
.stagger.in>*:nth-child(5){opacity:1;transform:translateY(0);transition-delay:.28s}
.stagger.in>*:nth-child(6){opacity:1;transform:translateY(0);transition-delay:.34s}
.cw-card{background:#fff;border:1.5px solid #fde68a;border-radius:16px;padding:24px;
  box-shadow:0 2px 10px rgba(11,31,58,.06);transition:all .25s;}
.cw-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(180,83,9,.14);border-color:#fbbf24;}
.cw-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:11px 14px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;
  outline:none;transition:all .2s;}
.cw-inp:focus{border-color:#b45309;background:#fff;box-shadow:0 0 0 3px rgba(180,83,9,.10);}
.cw-inp.err{border-color:#ef4444;background:#fef2f2;}
.cw-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.cw-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  background:linear-gradient(135deg,#b45309,#d97706);color:#fff;font-family:'DM Sans',sans-serif;
  font-weight:700;font-size:15px;padding:14px 26px;border-radius:10px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(180,83,9,.35);transition:all .25s;width:100%;}
.cw-btn:hover{transform:translateY(-1px);}
.cw-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.4);border-top:2px solid #fff;
  border-radius:50%;animation:spin .75s linear infinite;display:inline-block;}
.cw-form-grid{display:grid;grid-template-columns:1fr;gap:14px;}
@media(min-width:640px){.cw-form-grid{grid-template-columns:1fr 1fr;}.cw-full{grid-column:span 2;}}
@media(max-width:900px){.cw-grid3{grid-template-columns:1fr 1fr!important;}}
@media(max-width:600px){.cw-grid3{grid-template-columns:1fr!important;}.cw-hero-cols{grid-template-columns:1fr!important;}}
`;

const W = ({ children, s = {} }) => (
  <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>
);

const OFFERINGS = [
  { ic: "🩺", title: "Annual Health Checkups", desc: "Comprehensive checkup packages for your staff, scheduled at partner hospitals or diagnostic centres near your office." },
  { ic: "🏢", title: "On-site Health Camps", desc: "Doctors and nurses visit your office for basic screening — BP, sugar, BMI — so employees don't need to travel." },
  { ic: "🎥", title: "Priority Video Consultations", desc: "Employees get faster access to our verified specialist doctors for video consultations, at preferential rates." },
  { ic: "🧠", title: "Mental Wellness Sessions", desc: "Confidential counselling and stress-management sessions, run periodically for your teams." },
  { ic: "👨‍👩‍👧", title: "Family Coverage Add-on", desc: "Extend discounted consultations and home healthcare visits to employees' immediate family members." },
  { ic: "📋", title: "Dedicated Account Manager", desc: "One point of contact on our side who tracks utilisation, renewals, and any escalations for your organisation." },
];

const STEPS = [
  { n: "1", title: "Tell us about your organisation", desc: "Share your headcount, location, and what matters most to your team — checkups, video consults, or on-site camps." },
  { n: "2", title: "We design a package", desc: "Our team puts together a package and pricing that fits your headcount and budget, and walks you through it." },
  { n: "3", title: "Rollout & ongoing support", desc: "We onboard your employees, run the programme, and your account manager stays in touch for renewals and support." },
];

const SIZE_OPTIONS = ["Under 25", "25 – 100", "101 – 500", "500+"];

function PlansSection() {
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/company/plans`);
        const json = await res.json();
        setPlans(json.plans || []);
      } catch { setPlans([]); }
    })();
  }, []);

  if (!plans || !plans.length) return null;

  return (
    <section style={{ padding: "72px 0" }}>
      <W>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "#b45309", margin: "0 0 8px" }}>SELF-SERVE, NO WAITING</p>
          <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: "700", color: "#0b1f3a", margin: "0 0 10px" }}>Or set your team up today</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14.5px", color: "#64748b", maxWidth: 560, margin: "0 auto" }}>
            Prefer not to wait for a callback? Register your company, pick a plan, and start adding employees in minutes —
            no sales call required.
          </p>
        </div>
        <div className="cw-grid3" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(plans.length, 3)},1fr)`, gap: "20px" }}>
          {plans.map((p) => (
            <div key={p.id} className="cw-card">
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 6px" }}>{p.plan_name}</h3>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", color: "#64748b", margin: "0 0 14px" }}>
                {p.min_employees}–{p.max_employees ?? "∞"} employees
              </p>
              <p style={{ fontSize: "26px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 16px" }}>
                {p.monthly_amount > 0 ? `₹${p.monthly_amount}` : "Custom"}
                {p.monthly_amount > 0 && <span style={{ fontSize: "13px", fontWeight: 400, color: "#94a3b8" }}> /month</span>}
              </p>
              <Link to="/company/signup" className="cw-btn" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>
                {p.monthly_amount > 0 ? "Get Started →" : "Talk to Sales →"}
              </Link>
            </div>
          ))}
        </div>
      </W>
    </section>
  );
}


function EnquiryForm() {
  const [form, setForm] = useState({ company_name: "", contact_person: "", email: "", mobile: "", company_size: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.company_name.trim()) e.company_name = "Company name required";
    if (!form.contact_person.trim()) e.contact_person = "Contact person required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid work email required";
    if (!form.mobile.trim()) e.mobile = "Mobile required";
    if (!form.company_size) e.company_size = "Select approximate team size";
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
        `Company: ${form.company_name}\n` +
        `Approx. team size: ${form.company_size}\n\n` +
        (form.message.trim() || "No additional details provided.");
      const res = await fetch(`${API}/auth/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: `${form.contact_person} (${form.company_name})`,
          email:     form.email,
          mobile:    form.mobile,
          subject:   "Corporate Wellness",
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
      <div style={{ width: "68px", height: "68px", background: "#fef3c7", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: "30px" }}>✅</div>
      <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#0b1f3a", marginBottom: "8px" }}>Enquiry Sent!</h3>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "15px", color: "#64748b", marginBottom: "22px" }}>
        Our team will reach out to you within 1–2 working days with a package proposal.
      </p>
      <button onClick={() => { setDone(false); setForm({ company_name: "", contact_person: "", email: "", mobile: "", company_size: "", message: "" }); }}
        style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", fontWeight: "600", color: "#b45309",
          background: "transparent", border: "1.5px solid #b45309", padding: "10px 22px", borderRadius: "8px", cursor: "pointer" }}>
        Send Another Enquiry
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate style={{ padding: "28px" }}>
      <div className="cw-form-grid">
        <div>
          <label className="cw-lbl" htmlFor="public-corporatewellness-company-name">Company Name *</label>
          <input id="public-corporatewellness-company-name" name="company_name" value={form.company_name} onChange={handleChange}
            placeholder="Your organisation's name" className={`cw-inp${errors.company_name ? " err" : ""}`} />
          {errors.company_name && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.company_name}</p>}
        </div>
        <div>
          <label className="cw-lbl" htmlFor="public-corporatewellness-contact-person">Contact Person *</label>
          <input id="public-corporatewellness-contact-person" name="contact_person" value={form.contact_person} onChange={handleChange}
            placeholder="HR / Admin contact name" className={`cw-inp${errors.contact_person ? " err" : ""}`} />
          {errors.contact_person && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.contact_person}</p>}
        </div>
        <div>
          <label className="cw-lbl" htmlFor="public-corporatewellness-work-email">Work Email *</label>
          <input id="public-corporatewellness-work-email" name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="you@company.com" className={`cw-inp${errors.email ? " err" : ""}`} />
          {errors.email && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.email}</p>}
        </div>
        <div>
          <label className="cw-lbl" htmlFor="public-corporatewellness-mobile-number">Mobile Number *</label>
          <input id="public-corporatewellness-mobile-number" name="mobile" type="tel" value={form.mobile} onChange={handleChange}
            placeholder="+91 90257 86467" className={`cw-inp${errors.mobile ? " err" : ""}`} />
          {errors.mobile && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.mobile}</p>}
        </div>
        <div className="cw-full">
          <label className="cw-lbl" htmlFor="public-corporatewellness-approx-team-size">Approx. Team Size *</label>
          <select id="public-corporatewellness-approx-team-size" name="company_size" value={form.company_size} onChange={handleChange}
            className={`cw-inp${errors.company_size ? " err" : ""}`}>
            <option value="">Select a range</option>
            {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} employees</option>)}
          </select>
          {errors.company_size && <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "3px" }}>⚠ {errors.company_size}</p>}
        </div>
        <div className="cw-full">
          <label className="cw-lbl" htmlFor="public-corporatewellness-what-are-you-looking-for-optional">What are you looking for? (optional)</label>
          <textarea id="public-corporatewellness-what-are-you-looking-for-optional" name="message" value={form.message} onChange={handleChange} rows={4}
            placeholder="e.g. annual checkups for 80 staff, on-site camp once a quarter..."
            className="cw-inp" style={{ resize: "vertical", fontFamily: "'DM Sans',sans-serif" }} />
        </div>
      </div>
      <button type="submit" disabled={loading} className="cw-btn" style={{ marginTop: "18px" }}>
        {loading ? <><span className="spinner" /> Sending…</> : "Request a Package Proposal →"}
      </button>
    </form>
  );
}

export default function CorporateWellness() {
  const [heroRef, heroVis] = useScrollAnimation();
  const [offRef, offVis] = useScrollAnimation();
  const [stepRef, stepVis] = useScrollAnimation();
  const [formRef, formVis] = useScrollAnimation();

  return (
    <div className="cw">
      <style>{G}</style>
      <SEO title="Corporate Wellness Programmes" path="/corporate-wellness"
        description="Tailored corporate wellness packages — annual health checkups, on-site camps, priority video consultations, and family coverage for your employees." />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,#fffbeb 0%,#fff 60%)", padding: "72px 0 56px", borderBottom: "1px solid #fde68a" }}>
        <W>
          <div ref={heroRef} className={`reveal${heroVis ? " in" : ""} cw-hero-cols`}
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "36px", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px",
                fontWeight: "700", letterSpacing: "1.5px", color: "#b45309", background: "#fef3c7",
                border: "1px solid #fde68a", borderRadius: "20px", padding: "6px 14px", marginBottom: "16px" }}>
                🤝 CORPORATE WELLNESS
              </span>
              <h1 style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: "700", color: "#0b1f3a", lineHeight: "1.15", margin: "0 0 16px" }}>
                Healthcare, tailored for your team.
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", color: "#64748b", lineHeight: "1.75", margin: "0 0 24px", fontWeight: "300", maxWidth: "480px" }}>
                Give your employees access to verified doctors, home healthcare, and preventive checkups — packaged around your organisation's size and budget.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a href="#enquire" className="cw-btn" style={{ width: "auto", textDecoration: "none" }}>Get a Package Proposal →</a>
                <Link to="/company/signup" className="cw-btn" style={{
                  width: "auto", textDecoration: "none", background: "#fff", color: "#b45309",
                  border: "1.5px solid #b45309", boxShadow: "none",
                }}>Register Your Company (Instant) →</Link>
              </div>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: "20px", padding: "28px", boxShadow: "0 12px 32px rgba(180,83,9,.10)" }}>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "20px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 14px" }}>Why organisations partner with us</p>
              {["50+ verified partner hospitals", "18+ medical specialties on call", "Dedicated account manager per company", "No setup fee — pay only for what your team uses"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ color: "#b45309", fontWeight: "700" }}>✓</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#374151" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </W>
      </section>
      

      {/* OFFERINGS */}
      <section style={{ padding: "72px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "#b45309", margin: "0 0 8px" }}>WHAT'S INCLUDED</p>
            <h2 style={{ fontSize: "clamp(24px,3vw,32px)", fontWeight: "700", color: "#0b1f3a", margin: 0 }}>Build a package around what your team needs</h2>
          </div>
          <div ref={offRef} className={`stagger${offVis ? " in" : ""} cw-grid3`}
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
            {OFFERINGS.map((o) => (
              <div key={o.title} className="cw-card">
                <div style={{ width: "48px", height: "48px", background: "#fef3c7", border: "1.5px solid #fde68a",
                  borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "14px" }}>{o.ic}</div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 8px" }}>{o.title}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#64748b", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "#fffbeb", padding: "64px 0", borderTop: "1px solid #fde68a", borderBottom: "1px solid #fde68a" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "#0b1f3a", margin: 0 }}>How setting up your programme works</h2>
          </div>
          <div ref={stepRef} className={`stagger${stepVis ? " in" : ""} cw-grid3`}
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "22px" }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: "16px", padding: "24px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#b45309,#d97706)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", marginBottom: "14px" }}>{s.n}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#64748b", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </W>
      </section>
      <PlansSection />

      {/* ENQUIRY FORM */}
      <section id="enquire" style={{ padding: "72px 0" }}>
        <W s={{ maxWidth: "720px" }}>
          <div ref={formRef} className={`reveal${formVis ? " in" : ""}`}
            style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: "20px", boxShadow: "0 12px 32px rgba(180,83,9,.10)", overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 0" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 6px" }}>Need a custom package instead?</h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#64748b", margin: 0 }}>Tell us about your organisation and we'll get back with pricing and a plan.</p>
            </div>
            <EnquiryForm />
          </div>
          <p style={{ textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#6b7688", marginTop: "18px" }}>
            Prefer to talk directly? Call <a href="tel:+919025786467" style={{ color: "#b45309", fontWeight: "600" }}>90257 86467</a> or use our <Link to="/contact" style={{ color: "#b45309", fontWeight: "600" }}>general contact form</Link>.
          </p>
        </W>
      </section>
    </div>
  );
}
