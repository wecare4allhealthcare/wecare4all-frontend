/**
 * LoseWeight.jsx — /lose-weight (Nov 2026, client request)
 *
 * Reached from the "Want to lose weight?" tab on the homepage Ideal Body
 * Weight result (components/IdealWeightCalculator.jsx). Page copy is the
 * client's own "Obesity page for wecare4all" document.
 *
 * Same pattern as CarePlus.jsx / ResidentialHealthCare.jsx: public page,
 * self-contained scoped CSS, enquiry posted to the existing
 * POST /auth/contact endpoint (subject "Weight Management Enquiry") so it
 * appears in the admin's existing Contacts inbox — no backend or DB change.
 *
 * Privacy: the form is split in two.
 *  1. Contact + the three guidance questions + consent to be contacted.
 *  2. An OPTIONAL "secure intake" block (age range, height, weight, medical
 *     history) with its own separate consent. Nothing in block 2 is
 *     required to submit.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO, { breadcrumbJsonLd } from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
// See IdealWeightCalculator.jsx — /auth/contact needs an email value.
const NO_EMAIL = "no-email-provided@wecare4all.in";

const G = `
.lw{font-family:'Inter',sans-serif;color:#1e293b;overflow-x:hidden;}
.lw *{box-sizing:border-box;} .lw a{text-decoration:none;}
.lw h1,.lw h2,.lw h3,.lw h4{font-family:'Manrope',sans-serif;}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease;}
.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease;}
.stagger.in>*:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.03s}
.stagger.in>*:nth-child(2){opacity:1;transform:translateY(0);transition-delay:.08s}
.stagger.in>*:nth-child(3){opacity:1;transform:translateY(0);transition-delay:.13s}
.stagger.in>*:nth-child(4){opacity:1;transform:translateY(0);transition-delay:.18s}
.lw-path{background:#fff;border:1.5px solid #86efac;border-radius:16px;padding:24px;text-align:left;cursor:pointer;font-family:inherit;
  box-shadow:0 2px 10px rgba(18,59,74,.06);transition:all .25s;display:block;width:100%;}
.lw-path:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(14,116,144,.14);}
.lw-path.on{border-color:var(--wc-green);box-shadow:0 0 0 3px rgba(14,116,144,.15);}
.lw-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:11px 14px;font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);outline:none;}
.lw-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(14,116,144,.10);}
.lw-inp.err{border-color:#ef4444;background:#fef2f2;}
.lw-lbl{display:block;font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px;}
.lw-q{font-family:'Manrope',sans-serif;font-size:15px;font-weight:700;color:var(--wc-navy);margin:0 0 10px;}
.lw-opt{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:1.5px solid var(--wc-border);border-radius:10px;margin-bottom:8px;cursor:pointer;font-size:13.5px;color:#374151;line-height:1.5;background:#fff;}
.lw-opt.on{border-color:var(--wc-green);background:var(--wc-sage);}
.lw-opt input{margin-top:3px;flex-shrink:0;}
.lw-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;font-family:'Inter',sans-serif;
  font-weight:700;font-size:15px;padding:14px 26px;border-radius:10px;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(14,116,144,.35);width:100%;}
.lw-btn:disabled{opacity:.6;cursor:not-allowed;}
.lw-err{color:#ef4444;font-size:11.5px;margin:4px 0 0;}
.lw-grid{display:grid;grid-template-columns:1fr;gap:14px;}
@media(min-width:640px){.lw-grid{grid-template-columns:1fr 1fr;}.lw-full{grid-column:span 2;}}
.lw-sec{border-top:1px solid var(--wc-border);padding-top:22px;margin-top:24px;}
.lw-method{display:flex;flex-wrap:wrap;gap:8px;}
.lw-chip{border:1.5px solid var(--wc-border);background:#fff;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;font-family:'Inter',sans-serif;}
.lw-chip.on{border-color:var(--wc-green);background:var(--wc-sage);color:var(--wc-green-dark);}
`;

const W = ({ children, s = {} }) => (
  <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>
);

const P = ({ children, s = {} }) => (
  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "15px", color: "var(--wc-muted)", lineHeight: "1.85", margin: "0 0 14px", ...s }}>{children}</p>
);

const Eyebrow = ({ children, light }) => (
  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase",
    color: light ? "var(--wc-green-lighter)" : "var(--wc-green)", margin: "0 0 8px" }}>{children}</p>
);

const APPROACH_OPTIONS = [
  "Diet, nutrition and physical activity",
  "Medical weight management and medicines",
  "Bariatric and metabolic surgery",
  "I am not sure - help me choose",
];
const GOAL_OPTIONS = [
  "Achieve sustainable weight loss",
  "Improve obesity-related health conditions",
  "Explore options after previous attempts did not work",
  "Understand advanced treatment options",
];
const JOURNEY_OPTIONS = [
  "Just exploring my options",
  "Ready to consult a specialist",
  "Already receiving treatment; seeking further guidance",
];
const CONTACT_METHODS = ["Phone call", "WhatsApp", "SMS", "Email"];
const AGE_RANGES = ["Under 18", "18 – 25", "26 – 35", "36 – 45", "46 – 55", "56 – 65", "Over 65"];

const PATHS = [
  {
    n: "1", title: "Diet, Nutrition and Physical Activity", pick: APPROACH_OPTIONS[0],
    lead: "For those who wish to begin with lifestyle modification.",
    body: "Healthy eating, appropriate physical activity, behavioural changes and regular monitoring form the foundation of weight management. This approach requires consistency, discipline and patience, as meaningful progress takes time.",
    items: ["Guidance on appropriate nutrition and physical activity.", "Support in developing sustainable lifestyle habits.", "Monitoring of progress and identification of barriers.", "Medical assessment when underlying conditions may be affecting weight."],
  },
  {
    n: "2", title: "Medical Weight Management", pick: APPROACH_OPTIONS[1],
    lead: "For those who need medical support alongside lifestyle changes.",
    body: "Obesity may be influenced by several factors, including metabolic health, medications, sleep, hormonal conditions and other medical issues. A clinical assessment can help identify relevant factors and determine an appropriate management plan.",
    items: ["Assessment by an appropriate medical professional.", "Evaluation of obesity-related health risks.", "Guidance on medically supervised weight-management options.", "Discussion of prescription weight-loss medicines, when clinically appropriate."],
  },
  {
    n: "3", title: "Bariatric and Metabolic Surgery", pick: APPROACH_OPTIONS[2],
    lead: "For those who may benefit from a surgical approach to obesity treatment.",
    body: "Bariatric and metabolic surgery may be appropriate for eligible individuals, depending on their BMI, associated medical conditions, previous treatment efforts and clinical assessment. Procedures such as sleeve gastrectomy, gastric bypass and duodenal switch can support substantial weight loss and improve certain obesity-related conditions. Surgery is not a cosmetic shortcut; it is a medical treatment that requires proper evaluation, preparation and lifelong follow-up.",
    items: ["Consultation with an appropriately qualified bariatric surgeon.", "Assessment of suitability for surgery and available procedures.", "Discussion of potential benefits, risks, costs and expected recovery.", "Guidance on nutritional care, follow-up and long-term weight management."],
  },
  {
    n: "4", title: "Help Me Choose the Right Approach", pick: APPROACH_OPTIONS[3],
    lead: "Not sure which option is suitable for you? Start here.",
    body: "You do not have to make this decision alone. Your current weight, height, medical history, previous weight-loss attempts and associated health conditions may all influence the appropriate approach. We can help you connect with the relevant healthcare professionals so that you can understand your options before deciding how to proceed.",
    items: [],
  },
];

const EMPTY = {
  approach: "", goal: "", journey: "",
  name: "", mobile: "", method: "", email: "", consent: false,
  age_range: "", height: "", weight: "", history: "", health_consent: false,
};

function RadioGroup({ name, options, value, onChange }) {
  return options.map((o) => (
    <label key={o} className={`lw-opt${value === o ? " on" : ""}`}>
      <input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} />
      <span>{o}</span>
    </label>
  ));
}

function IntakeForm({ approach, setApproach }) {
  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showHealth, setShowHealth] = useState(false);

  // Pre-fill from the homepage calculator's lead step (contact details only).
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("wc4a_wl_lead") || "null");
      if (saved) setF((p) => ({ ...p, name: saved.name || "", mobile: saved.mobile || "", method: saved.method || "", email: saved.email || "" }));
    } catch { /* ignore */ }
  }, []);

  // A path card above sets the approach — keep the form in sync.
  useEffect(() => { if (approach) setF((p) => ({ ...p, approach })); }, [approach]);

  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    if (errs[k]) setErrs((p) => ({ ...p, [k]: "" }));
    if (k === "approach") setApproach(v);
  };

  const healthFilled = !!(f.age_range || f.height.trim() || f.weight.trim() || f.history.trim());

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!f.approach) er.approach = "Please choose an approach";
    if (!f.name.trim()) er.name = "Name required";
    if (!/^[+\d][\d\s-]{8,15}$/.test(f.mobile.trim())) er.mobile = "Valid contact number required";
    if (!f.method) er.method = "Choose a contact method";
    if (f.method === "Email" && !/\S+@\S+\.\S+/.test(f.email)) er.email = "Valid email required";
    if (!f.consent) er.consent = "Consent to be contacted is required";
    if (healthFilled && !f.health_consent) er.health_consent = "Please tick the health-information consent, or clear the health details";
    if (Object.keys(er).length) { setErrs(er); return; }

    setLoading(true);
    try {
      const lines = [
        `Approach to explore: ${f.approach}`,
        `Main goal: ${f.goal || "Not answered"}`,
        `Stage of journey: ${f.journey || "Not answered"}`,
        `Preferred contact method: ${f.method}`,
        "Consent to be contacted: YES",
      ];
      if (healthFilled) {
        lines.push(
          "",
          "SECURE INTAKE (optional, shared with separate consent: YES)",
          `Age range: ${f.age_range || "-"}`,
          `Height: ${f.height.trim() || "-"}`,
          `Weight: ${f.weight.trim() || "-"}`,
          `Relevant medical history: ${f.history.trim() || "-"}`,
        );
      } else {
        lines.push("", "No health details shared at this stage.");
      }
      const res = await fetch(`${API}/auth/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: f.name.trim(),
          email: f.method === "Email" ? f.email.trim() : (f.email.trim() || NO_EMAIL),
          mobile: f.mobile.trim(),
          subject: "Weight Management Enquiry",
          message: lines.join("\n"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.detail || "Failed to send");
      try { sessionStorage.removeItem("wc4a_wl_lead"); } catch { /* ignore */ }
      setDone(true);
    } catch {
      showToast("Failed to send. Please call +91 90257 86467", "error");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ padding: "52px 32px", textAlign: "center" }}>
        <div style={{ width: "68px", height: "68px", background: "var(--wc-sage)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: "30px" }}>✅</div>
        <h3 style={{ fontSize: "24px", fontWeight: "700", color: "var(--wc-navy)", marginBottom: "8px" }}>Thank you</h3>
        <p style={{ fontSize: "15px", color: "var(--wc-muted)", lineHeight: 1.7, margin: 0 }}>
          Our team will contact you through your preferred method to guide you on the next steps. Your selection is only the starting point; suitability of any treatment is decided after a medical assessment.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate style={{ padding: "28px" }}>
      <div>
        <p className="lw-q">1. Which approach would you like to explore? *</p>
        <RadioGroup name="approach" options={APPROACH_OPTIONS} value={f.approach} onChange={(v) => set("approach", v)} />
        {errs.approach && <p className="lw-err">⚠ {errs.approach}</p>}
      </div>
      <div style={{ marginTop: 20 }}>
        <p className="lw-q">2. What is your main goal?</p>
        <RadioGroup name="goal" options={GOAL_OPTIONS} value={f.goal} onChange={(v) => set("goal", v)} />
      </div>
      <div style={{ marginTop: 20 }}>
        <p className="lw-q">3. Where are you in your journey?</p>
        <RadioGroup name="journey" options={JOURNEY_OPTIONS} value={f.journey} onChange={(v) => set("journey", v)} />
      </div>

      <div className="lw-sec">
        <p className="lw-q">How can we reach you?</p>
        <div className="lw-grid">
          <div>
            <label className="lw-lbl" htmlFor="lw-name">Your name *</label>
            <input id="lw-name" className={`lw-inp${errs.name ? " err" : ""}`} value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
            {errs.name && <p className="lw-err">⚠ {errs.name}</p>}
          </div>
          <div>
            <label className="lw-lbl" htmlFor="lw-mobile">Contact number *</label>
            <input id="lw-mobile" type="tel" className={`lw-inp${errs.mobile ? " err" : ""}`} value={f.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+91 90000 00000" autoComplete="tel" />
            {errs.mobile && <p className="lw-err">⚠ {errs.mobile}</p>}
          </div>
          <div className="lw-full">
            <span className="lw-lbl">Preferred contact method *</span>
            <div className="lw-method" role="radiogroup" aria-label="Preferred contact method">
              {CONTACT_METHODS.map((c) => (
                <button type="button" key={c} role="radio" aria-checked={f.method === c} className={`lw-chip${f.method === c ? " on" : ""}`} onClick={() => set("method", c)}>{c}</button>
              ))}
            </div>
            {errs.method && <p className="lw-err">⚠ {errs.method}</p>}
          </div>
          {(f.method === "Email" || f.email) && (
            <div className="lw-full">
              <label className="lw-lbl" htmlFor="lw-email">Email {f.method === "Email" ? "*" : "(optional)"}</label>
              <input id="lw-email" type="email" className={`lw-inp${errs.email ? " err" : ""}`} value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
              {errs.email && <p className="lw-err">⚠ {errs.email}</p>}
            </div>
          )}
        </div>
        <label className="lw-opt" style={{ marginTop: 14 }}>
          <input type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} />
          <span>I agree that We Care 4 'all' may contact me using the details above about weight management and related healthcare services. *</span>
        </label>
        {errs.consent && <p className="lw-err">⚠ {errs.consent}</p>}
      </div>

      <div className="lw-sec">
        <button type="button" onClick={() => setShowHealth((s) => !s)} aria-expanded={showHealth}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Manrope',sans-serif", fontSize: "15px", fontWeight: 700, color: "var(--wc-navy)", display: "flex", gap: 8, alignItems: "center" }}>
          🔒 Secure intake (optional) <span style={{ color: "var(--wc-green)" }}>{showHealth ? "▲" : "▼"}</span>
        </button>
        <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.6, margin: "6px 0 0" }}>
          You can share health details now to help the specialist prepare, or skip this and share them later during your consultation.
        </p>
        {showHealth && (
          <div style={{ marginTop: 14 }}>
            <div className="lw-grid">
              <div>
                <label className="lw-lbl" htmlFor="lw-age">Age range</label>
                <select id="lw-age" className="lw-inp" value={f.age_range} onChange={(e) => set("age_range", e.target.value)}>
                  <option value="">Select</option>
                  {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div />
              <div>
                <label className="lw-lbl" htmlFor="lw-height">Height</label>
                <input id="lw-height" className="lw-inp" value={f.height} onChange={(e) => set("height", e.target.value)} placeholder="e.g. 165 cm or 5 ft 5 in" />
              </div>
              <div>
                <label className="lw-lbl" htmlFor="lw-weight">Weight</label>
                <input id="lw-weight" className="lw-inp" value={f.weight} onChange={(e) => set("weight", e.target.value)} placeholder="e.g. 85 kg" />
              </div>
              <div className="lw-full">
                <label className="lw-lbl" htmlFor="lw-hist">Relevant medical history</label>
                <textarea id="lw-hist" rows={3} className="lw-inp" style={{ resize: "vertical" }} value={f.history} onChange={(e) => set("history", e.target.value)}
                  placeholder="Existing conditions, medicines, previous weight-loss attempts or surgeries" />
              </div>
            </div>
            <label className="lw-opt" style={{ marginTop: 14 }}>
              <input type="checkbox" checked={f.health_consent} onChange={(e) => set("health_consent", e.target.checked)} />
              <span>I consent to We Care 4 'all' collecting and using the health information I have entered above, only to guide me on weight-management options, as described in the <Link to="/privacy" style={{ color: "var(--wc-green)", fontWeight: 600 }}>Privacy Policy</Link>.</span>
            </label>
            {errs.health_consent && <p className="lw-err">⚠ {errs.health_consent}</p>}
          </div>
        )}
      </div>

      <button type="submit" disabled={loading} className="lw-btn" style={{ marginTop: 22 }}>
        {loading ? "Sending…" : "Start my weight-management journey →"}
      </button>
      <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: "12px 0 0", lineHeight: 1.6 }}>
        Your selection is only the starting point. The suitability of any treatment will be determined through an appropriate medical assessment.
      </p>
    </form>
  );
}

const LOSE_WEIGHT_JSONLD = [
  breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Lose Weight Scientifically", path: "/lose-weight" }]),
];

export default function LoseWeight() {
  const [heroRef, heroVis] = useScrollAnimation();
  const [pathsRef, pathsVis] = useScrollAnimation();
  const [appRef, appVis] = useScrollAnimation();
  const [formRef, formVis] = useScrollAnimation();
  const [approach, setApproach] = useState("");

  const choose = (pick) => {
    setApproach(pick);
    document.getElementById("begin")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lw">
      <style>{G}</style>
      <SEO title="Lose Weight Scientifically | Medical Weight Management | We Care 4 'all'" path="/lose-weight"
        description="Lose weight scientifically with the right guidance. Explore lifestyle modification, medical weight management and bariatric surgery options, and connect with the appropriate medical professionals through We Care 4 'all'."
        keywords="lose weight, weight loss chennai, obesity treatment, medical weight management, bariatric surgery, weight loss doctor"
        jsonLd={LOSE_WEIGHT_JSONLD} />

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,var(--wc-navy-deepest),var(--wc-navy) 60%,var(--wc-navy-deep))", padding: "72px 0 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "36px 36px", pointerEvents: "none" }} />
        <W s={{ position: "relative", maxWidth: "860px" }}>
          <div ref={heroRef} className={`reveal${heroVis ? " in" : ""}`} style={{ textAlign: "center" }}>
            <span style={{ display: "inline-block", fontSize: "12.5px", fontWeight: 700, letterSpacing: "1.5px", color: "var(--wc-green-lighter)", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 20, padding: "6px 14px", marginBottom: 16 }}>⚖️ WEIGHT MANAGEMENT</span>
            <h1 style={{ fontSize: "clamp(30px,4.4vw,46px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, margin: "0 0 14px" }}>Lose Weight Scientifically</h1>
            <p style={{ fontSize: "clamp(16px,2vw,19px)", color: "rgba(255,255,255,.8)", fontWeight: 300, margin: "0 0 22px" }}>Your Weight-Loss Journey Begins with the Right Choice</p>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: "clamp(16px,2vw,19px)", fontStyle: "italic", color: "#bbf7d0", lineHeight: 1.6, margin: "0 auto 26px", maxWidth: 680 }}>
              “Obesity is not merely about appearance. It is a medical condition that deserves the right attention, scientific understanding and appropriate treatment.”
            </p>
            <a href="#begin" className="lw-btn" style={{ width: "auto" }}>Choose your path →</a>
          </div>
        </W>
      </section>

      {/* WHY IT MATTERS */}
      <section style={{ padding: "64px 0" }}>
        <W s={{ maxWidth: "800px" }}>
          <P>Excess body weight can increase the risk of several health complications, including Type 2 diabetes, cardiovascular disease, fatty liver disease, sleep apnoea and joint problems. For some individuals, these complications can significantly affect quality of life and long-term health.</P>
          <P>Yet, losing excess weight is not always easy. What works for one person may not work equally well for another. Misinformation, unrealistic expectations and the search for quick results often prevent people from choosing the right approach.</P>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--wc-navy)", lineHeight: 1.6, margin: "24px 0", paddingLeft: 18, borderLeft: "4px solid var(--wc-green)" }}>
            “There is no magic solution to sustainable weight loss. There is, however, scientifically guided paths that can be suited to your needs.”
          </p>
          <P s={{ margin: 0 }}>At We Care 4 'all', our objective is to help you understand the available options, connect with the appropriate medical professionals and make an informed decision about your weight-management journey.</P>
        </W>
      </section>

      {/* PATHS */}
      <section style={{ background: "var(--wc-sage)", padding: "64px 0", borderTop: "1px solid #86efac", borderBottom: "1px solid #86efac" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Eyebrow>Your options</Eyebrow>
            <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--wc-navy)", margin: "0 0 10px" }}>Which Weight-Loss Path Would You Like to Explore?</h2>
            <p style={{ fontSize: 14.5, color: "var(--wc-muted)", maxWidth: 620, margin: "0 auto", lineHeight: 1.75 }}>
              Every individual's journey is different. Select the approach you would like to know more about. We will guide you through the next steps.
            </p>
          </div>
          <div ref={pathsRef} className={`stagger${pathsVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))", gap: 22 }}>
            {PATHS.map((p) => (
              <button key={p.n} type="button" className={`lw-path${approach === p.pick ? " on" : ""}`} onClick={() => choose(p.pick)}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--wc-sage)", border: "1.5px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif", fontWeight: 800, color: "var(--wc-green)", marginBottom: 12 }}>{p.n}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--wc-navy)", margin: "0 0 6px" }}>{p.title}</h3>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--wc-green)", margin: "0 0 10px" }}>{p.lead}</p>
                <p style={{ fontSize: 13, color: "var(--wc-muted)", lineHeight: 1.75, margin: "0 0 12px", fontWeight: 300 }}>{p.body}</p>
                {p.items.length > 0 && (
                  <>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--wc-navy)", margin: "0 0 8px" }}>What you can expect:</p>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                      {p.items.map((it) => (
                        <li key={it} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: "var(--wc-green)", fontWeight: 700 }}>✓</span>
                          <span style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.5 }}>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--wc-green)", margin: "14px 0 0" }}>Explore this path →</p>
              </button>
            ))}
          </div>
        </W>
      </section>

      {/* OUR APPROACH */}
      <section style={{ padding: "64px 0" }}>
        <W s={{ maxWidth: "760px" }}>
          <div ref={appRef} className={`reveal${appVis ? " in" : ""}`} style={{ textAlign: "center" }}>
            <Eyebrow>Our approach</Eyebrow>
            <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--wc-navy)", margin: "0 0 16px" }}>Guidance Before Decisions</h2>
            <P>At We Care 4 'all', we believe that choosing a treatment should begin with understanding the individual, not promoting a particular procedure, medicine or service.</P>
            <P>Our role is to help you navigate the available options, connect with appropriate specialists and understand the next steps towards making an informed decision.</P>
            <P s={{ fontWeight: 700, color: "var(--wc-navy)", margin: 0 }}>Your goal is not just to lose kilograms or pounds. It is to improve your health through the right approach, with realistic expectations and appropriate medical guidance.</P>
          </div>
        </W>
      </section>

      {/* FORM */}
      <section id="begin" style={{ padding: "64px 0 80px", background: "var(--wc-warm-white)" }}>
        <W s={{ maxWidth: "720px" }}>
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <Eyebrow>Ready to begin?</Eyebrow>
            <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 700, color: "var(--wc-navy)", margin: "0 0 10px" }}>Start your weight-management journey</h2>
            <p style={{ fontSize: 14.5, color: "var(--wc-muted)", lineHeight: 1.75, margin: 0 }}>Choose the option you would like to explore. You can change your selection at any time.</p>
          </div>
          <div ref={formRef} className={`reveal${formVis ? " in" : ""}`}
            style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: 20, boxShadow: "0 12px 32px rgba(14,116,144,.10)", overflow: "hidden" }}>
            <IntakeForm approach={approach} setApproach={setApproach} />
          </div>
          <p style={{ textAlign: "center", fontFamily: "'Manrope',sans-serif", fontSize: 15, fontWeight: 700, color: "var(--wc-navy)", marginTop: 26 }}>
            We Care 4 'all' — Your Healthcare Navigator.
          </p>
          <p style={{ textAlign: "center", fontSize: 13, color: "#6b7688", marginTop: 8 }}>
            Prefer to talk? Call <a href="tel:+919025786467" style={{ color: "var(--wc-green)", fontWeight: 600 }}>+91 90257 86467</a>.
          </p>
        </W>
      </section>
    </div>
  );
}
