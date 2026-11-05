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

// "With Care+, your loved one can continue to..." — from the brochure's
// "Be Home. Feel Home." list. Trimmed to the 8 most concrete items for
// a scannable checklist rather than reproducing all 10 verbatim.
const CAN_CONTINUE_TO = [
  "Wake up in their own room and sleep in their own bed",
  "Sit in their favourite chair, in familiar surroundings",
  "Follow familiar daily routines",
  "Remain close to family members",
  "Stay connected with neighbours and friends",
  "Celebrate festivals and family occasions at home",
  "Keep their personal belongings around them",
  "Experience the emotional comfort of the place they know best",
];

// "Continuous Care at Home" — the 4 structured pillars from the
// brochure (24-Hour Attendant Support / Nursing Support / 24-Hour
// Monitoring), each with its own detail list.
const CARE_PILLARS = [
  {
    ic: "🤝", title: "12 Hrs Companion Support",
    desc: "Companions provide friendly, non-medical support to help older adults stay socially connected, emotionally supported and engaged in their daily lives.",
    items: ["Meaningful conversations and companionship", "Assistance with hobbies and recreational activities", "Encouragement for safe walks and daily routines", "Emotional support and active listening", "Reducing loneliness and social isolation"],
  },
  {
    ic: "🧑‍⚕️", title: "24-Hour Attendant Support",
    desc: "Trained attendants give dignified, hands-on help with everyday activities, encouraging independence wherever possible and stepping in wherever support is needed.",
    items: ["Mobility", "Personal hygiene, bathing & grooming", "Feeding & toileting", "Positioning, turning & bedside assistance", "Walking & transfers"],
  },
  {
    ic: "💉", title: "Nursing Support",
    desc: "Where clinical needs exist, Care+ coordinates appropriate nursing support at home — a link between daily care and professional healthcare.",
    items: ["Monitoring vital signs", "Medication support as prescribed", "Wound & dressing care", "Bedridden patient care", "Post-hospitalisation care & doctor coordination"],
  },
  {
    ic: "📹", title: "24-Hour Monitoring",
    desc: "24-hour CCTV monitoring, wherever appropriate and with due regard to privacy and dignity — an added layer of safety, not a replacement for human care.",
    items: ["Safety & supervision", "Accountability", "Reassurance for family abroad or in another city", "\"Technology watches. People care.\""],
  },
];

// "Continuous Care at Home" summary strip shown in the hero card —
// short version of the 3 pillars above, per the client's exact
// requested copy (Aug 2026): Safety / Medical Assistance / Emergency Care.
const CARE_SERVICES = [
  { ic: "🛡️", title: "Safety", desc: "24-hour monitoring to ensure a secure living environment." },
  { ic: "💊", title: "Medical Assistance", desc: "Help with daily activities and medicines." },
  { ic: "🚑", title: "Emergency Care", desc: "Immediate response during critical golden hours." },
];

// "Care+ Combines Three Important Elements" — Home + Care + Family = Care+
const THREE_ELEMENTS = [
  { ic: "🏡", title: "The Emotional Security of Home", desc: "The person remains surrounded by familiar people, surroundings, memories and routines." },
  { ic: "🩺", title: "The Professionalism of Healthcare", desc: "Nursing, attendant care, monitoring and medical coordination structured around the individual's needs." },
  { ic: "👨‍👩‍👧‍👦", title: "The Reassurance of Family", desc: "Family stay involved in their loved one's life while Care+ provides the continuous support they may not always be able to provide themselves." },
];

// "A Connected Healthcare Support System" — the continuum of care.
const CARE_CONTINUUM = ["Home", "Care+", "Doctor", "Specialist", "Hospital (if required)", "Home"];

const WHO_ITS_FOR = [
  "Finding it difficult to manage independently",
  "Bedridden or has reduced mobility",
  "Recently returned home after hospitalisation",
  "Living with a chronic or progressive illness",
  "Requires palliative or hospice care",
  "Has family who cannot provide round-the-clock support",
];

// ── Care+ Service Request Form (Nov 2026, client request) ──────────────
// Replaces the earlier short enquiry form. Still posts to the existing
// POST /auth/contact endpoint (subject "Care+ Service Request"), so it
// lands in the admin's Contacts inbox exactly like before — no backend or
// DB change. The companion-interest questions (4–8) only appear when
// "Companion Support" is ticked under Service required.
const WHO_FILLS = ["The person receiving care", "Child / Family Member", "Existing Attendant / Caregiver", "Other representative"];
const SERVICES = [
  ["Companion Support", "conversation, social interaction and daily engagement"],
  ["Attendant Support", "assistance with daily living activities"],
  ["Nursing Care", "clinical care provided by qualified nursing personnel"],
];
const DURATIONS = ["12 hours per day", "24 hours per day", "Short-term / specific hours"];
const SHIFTS = ["Day shift", "Night shift", "Flexible / to be discussed"];
const WHEN = ["As soon as possible", "Within a week", "Planned date / future requirement"];
const LIVING = ["Lives alone", "Lives with spouse", "Lives with family", "Other arrangement"];
const MOBILITY = ["Walks independently", "Needs assistance while walking", "Needs assistance transferring from bed or chair", "Bedridden / requires extensive assistance"];
const INTERESTS = [
  "Reading books, newspapers or magazines",
  "Listening to music, radio or devotional songs",
  "Watching television, films or programmes",
  "Conversation and sharing experiences",
  "Gardening or caring for plants",
  "Walking or spending time outdoors, where appropriate",
  "Indoor games, puzzles or other recreational activities",
  "Arts, crafts or creative hobbies",
  "Spiritual, cultural or community activities, if preferred",
  "Accompaniment for outings or appointments",
  "Light daily activities and maintaining a routine",
  "Exploring new interests or activities",
  "Not sure — let the companion help explore their interests",
];
const COMPANION_KIND = [
  "Conversation and relaxed company",
  "Engaging in hobbies and activities together",
  "Accompaniment for walks or outings",
  "A flexible mix, depending on their mood and daily preference",
];

const EMPTY_FORM = {
  who: "", applicant: "", recipient: "", age: "", address: "", emergency: "", mobile: "", email: "",
  services: [], duration: "", shift: "", when: "",
  living: "", mobility: "",
  interests: [], hobbies: "", kind: "", language: "", extra: "",
  conditions: "", requirements: "",
  confirm: false, consent: false,
};

const cpErr = (m) => (m ? <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px" }}>⚠ {m}</p> : null);

function Choice({ type = "radio", name, options, value, onChange }) {
  return options.map((o) => {
    const label = Array.isArray(o) ? o[0] : o;
    const sub = Array.isArray(o) ? o[1] : null;
    const checked = type === "radio" ? value === label : value.includes(label);
    return (
      <label key={label} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "9px 12px", marginBottom: "7px",
        border: `1.5px solid ${checked ? "var(--wc-green)" : "var(--wc-border)"}`, background: checked ? "var(--wc-sage)" : "#fff",
        borderRadius: "10px", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "#374151", lineHeight: 1.5 }}>
        <input type={type} name={name} checked={checked} onChange={() => onChange(label)} style={{ marginTop: "3px", flexShrink: 0 }} />
        <span><strong style={{ fontWeight: 600 }}>{label}</strong>{sub ? ` — ${sub}` : ""}</span>
      </label>
    );
  });
}

const QH = ({ n, children }) => (
  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--wc-navy)", margin: "26px 0 12px", paddingTop: "20px", borderTop: "1px solid var(--wc-border)" }}>
    {n}. {children}
  </h3>
);
const Q = ({ children }) => (
  <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: "14px", fontWeight: "700", color: "var(--wc-navy)", margin: "18px 0 8px" }}>{children}</p>
);

function ServiceRequestForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: "" })); };
  const toggle = (k, v) => setForm((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const onText = (e) => set(e.target.name, e.target.value);

  const companion = form.services.includes("Companion Support");
  const nHealth = companion ? 9 : 4;
  const nConfirm = companion ? 10 : 5;

  const validate = () => {
    const e = {};
    if (!form.applicant.trim()) e.applicant = "Applicant's name is required";
    if (!form.recipient.trim()) e.recipient = "Care recipient's name is required";
    const age = parseInt(form.age, 10);
    if (!(age >= 1 && age <= 120)) e.age = "Enter a valid age";
    if (!form.address.trim()) e.address = "Care recipient's address is required";
    if (!form.emergency.trim()) e.emergency = "Emergency contact name, address and number are required";
    if (!/^[+\d][\d\s-]{8,15}$/.test(form.mobile.trim())) e.mobile = "A valid contact number is required";
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email or leave blank";
    if (!form.mobility) e.mobility = "Please select a mobility status";
    if (!form.confirm) e.confirm = "Please confirm the information is accurate";
    if (!form.consent) e.consent = "Consent to handle personal and health information is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      showToast("Please complete the fields marked *", "error");
      return;
    }
    setLoading(true);
    const f = form;
    const dash = (v) => (Array.isArray(v) ? (v.length ? v.join("; ") : "-") : (String(v || "").trim() || "-"));
    const lines = [
      "CARE+ SERVICE REQUEST",
      "",
      "1. APPLICANT DETAILS",
      `Form filled by: ${dash(f.who)}`,
      `Applicant's name: ${f.applicant.trim()}`,
      `Care recipient's name: ${f.recipient.trim()}`,
      `Age: ${f.age}`,
      `Care recipient's address: ${f.address.trim()}`,
      `Emergency contact (name, address, number): ${f.emergency.trim()}`,
      "",
      "2. SERVICE REQUIRED",
      `Service: ${dash(f.services)}`,
      `Preferred duration: ${dash(f.duration)}`,
      `Preferred shift: ${dash(f.shift)}`,
      `Support required: ${dash(f.when)}`,
      "",
      "3. LIVING SITUATION AND ASSISTANCE",
      `Current living arrangement: ${dash(f.living)}`,
      `Mobility status: ${f.mobility}`,
    ];
    if (companion) {
      lines.push(
        "",
        "4-8. COMPANION PREFERENCES",
        `Activities / interests: ${dash(f.interests)}`,
        `Specific hobbies: ${dash(f.hobbies)}`,
        `Companionship that would suit best: ${dash(f.kind)}`,
        `Preferred language for conversation: ${dash(f.language)}`,
        `Anything else for companionship: ${dash(f.extra)}`,
      );
    }
    lines.push(
      "",
      `${nHealth}. HEALTH AND CARE INFORMATION`,
      `Known medical conditions: ${dash(f.conditions)}`,
      `Additional requirements / instructions: ${dash(f.requirements)}`,
      "",
      `${nConfirm}. CONFIRMATION`,
      "Information confirmed accurate and applicant authorised to share it: YES",
      "Separate consent for handling personal and health information: YES",
    );
    try {
      const res = await fetch(`${API}/auth/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: `${f.applicant.trim()} (for ${f.recipient.trim()})`,
          // /auth/contact requires an email; the form makes it optional.
          email: f.email.trim() || "no-email-provided@wecare4all.in",
          mobile: f.mobile.trim(),
          subject: "Care+ Service Request",
          message: lines.join("\n"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.detail || "Failed to send");
      setDone(true);
    } catch {
      showToast("Failed to send your request. Please call +91 90257 86467", "error");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ padding: "52px 32px", textAlign: "center" }}>
      <div style={{ width: "68px", height: "68px", background: "var(--wc-sage)", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: "30px" }}>✅</div>
      <h3 style={{ fontSize: "24px", fontWeight: "700", color: "var(--wc-navy)", marginBottom: "8px" }}>Request Received</h3>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "15px", color: "var(--wc-muted)", marginBottom: "22px", lineHeight: 1.7 }}>
        Our team will review the details, clarify care requirements and confirm availability and suitability before assigning a caregiver. A Care Coordinator will reach out within 1–2 working days.
      </p>
      <button onClick={() => { setDone(false); setForm(EMPTY_FORM); }}
        style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: "600", color: "var(--wc-green)",
          background: "transparent", border: "1.5px solid var(--wc-green)", padding: "10px 22px", borderRadius: "8px", cursor: "pointer" }}>
        Submit Another Request
      </button>
    </div>
  );

  const inp = (name, label, extra = {}) => (
    <div className={extra.full ? "cp-full" : undefined}>
      <label className="cp-lbl" htmlFor={`cp-${name}`}>{label}</label>
      <input id={`cp-${name}`} name={name} type={extra.type || "text"} value={form[name]} onChange={onText}
        placeholder={extra.ph} inputMode={extra.mode} className={`cp-inp${errors[name] ? " err" : ""}`} />
      {cpErr(errors[name])}
    </div>
  );
  const area = (name, label, rows = 3, ph = "") => (
    <div style={{ marginTop: "12px" }}>
      {label && <label className="cp-lbl" htmlFor={`cp-${name}`}>{label}</label>}
      <textarea id={`cp-${name}`} name={name} rows={rows} value={form[name]} onChange={onText} placeholder={ph}
        className={`cp-inp${errors[name] ? " err" : ""}`} style={{ resize: "vertical", fontFamily: "'Inter',sans-serif" }} />
      {cpErr(errors[name])}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate style={{ padding: "8px 28px 28px" }}>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", lineHeight: 1.7, margin: "16px 0 0" }}>
        Please provide the following information so our team can understand the individual's needs and recommend an appropriate level of support. Fields marked * are essential.
      </p>

      <QH n={1}>Applicant details</QH>
      <Q>Who is filling this form?</Q>
      <Choice name="who" options={WHO_FILLS} value={form.who} onChange={(v) => set("who", v)} />
      <div className="cp-form-grid" style={{ marginTop: "14px" }}>
        {inp("applicant", "Applicant's name *")}
        {inp("recipient", "Care recipient's name *")}
        {inp("age", "Age *", { mode: "numeric", ph: "e.g. 78" })}
        {inp("mobile", "Your contact number *", { type: "tel", ph: "+91 90000 00000" })}
        {inp("email", "Your email (optional)", { type: "email", full: true, ph: "you@example.com" })}
      </div>
      {area("address", "Care recipient's address *", 3)}
      {area("emergency", "Emergency contact person: name, address and contact number *", 3)}

      <QH n={2}>Service required</QH>
      <Choice type="checkbox" name="services" options={SERVICES} value={form.services} onChange={(v) => toggle("services", v)} />
      <Q>Preferred duration</Q>
      <Choice name="duration" options={DURATIONS} value={form.duration} onChange={(v) => set("duration", v)} />
      <Q>Preferred shift</Q>
      <Choice name="shift" options={SHIFTS} value={form.shift} onChange={(v) => set("shift", v)} />
      <Q>When is support required?</Q>
      <Choice name="when" options={WHEN} value={form.when} onChange={(v) => set("when", v)} />

      <QH n={3}>Living situation and assistance required</QH>
      <Q>Current living arrangement</Q>
      <Choice name="living" options={LIVING} value={form.living} onChange={(v) => set("living", v)} />
      <Q>Mobility status *</Q>
      <Choice name="mobility" options={MOBILITY} value={form.mobility} onChange={(v) => set("mobility", v)} />
      {cpErr(errors.mobility)}

      {companion && (
        <div style={{ marginTop: "26px", paddingTop: "20px", borderTop: "1px solid var(--wc-border)" }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", lineHeight: 1.7, margin: "0 0 4px" }}>
            Help us understand your loved one's interests and daily preferences so we can make their time with a companion comfortable, engaging and enjoyable.
          </p>
          <Q>4. What activities or interests does your loved one enjoy? Select all that apply.</Q>
          <Choice type="checkbox" name="interests" options={INTERESTS} value={form.interests} onChange={(v) => toggle("interests", v)} />
          <Q>5. Any specific hobbies or interests we should know about?</Q>
          {area("hobbies", "", 2)}
          <Q>6. What kind of companionship would suit them best?</Q>
          <Choice name="kind" options={COMPANION_KIND} value={form.kind} onChange={(v) => set("kind", v)} />
          <Q>7. Preferred language for conversation</Q>
          <input name="language" value={form.language} onChange={onText} aria-label="Preferred language for conversation" className="cp-inp" placeholder="e.g. Tamil, English" />
          <Q>8. Anything else we should know to make the companionship suitable?</Q>
          {area("extra", "", 3)}
        </div>
      )}

      <QH n={nHealth}>Health and care information</QH>
      {area("conditions", "Known medical conditions, if any", 3)}
      {area("requirements", "Additional requirements or instructions", 3)}

      <QH n={nConfirm}>Confirmation</QH>
      <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#374151", lineHeight: 1.6, cursor: "pointer" }}>
        <input type="checkbox" checked={form.confirm} onChange={(e) => set("confirm", e.target.checked)} style={{ marginTop: "4px", flexShrink: 0 }} />
        <span>I confirm that the information provided is accurate to the best of my knowledge and that I am authorised to share these details for the purpose of assessing and arranging care.</span>
      </label>
      {cpErr(errors.confirm)}
      <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#374151", lineHeight: 1.6, cursor: "pointer", marginTop: "12px" }}>
        <input type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} style={{ marginTop: "4px", flexShrink: 0 }} />
        <span>I give my separate consent for We Care 4 'all' to collect and handle the personal and health information in this form, as described in the <Link to="/privacy" style={{ color: "var(--wc-green)", fontWeight: 600 }}>Privacy Policy</Link>.</span>
      </label>
      {cpErr(errors.consent)}

      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", color: "#64748b", lineHeight: 1.7, margin: "16px 0 0", background: "var(--wc-warm-white)", border: "1px solid var(--wc-border)", borderRadius: "10px", padding: "12px 14px" }}>
        <strong>Note:</strong> This is a preliminary service-request form, not a clinical assessment or booking confirmation. Our team will review the details, clarify care requirements and confirm availability and suitability before assigning a caregiver.
      </p>

      <button type="submit" disabled={loading} className="cp-btn" style={{ marginTop: "18px" }}>
        {loading ? <><span className="spinner" /> Sending…</> : "Submit Service Request →"}
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

      {/* HERO — Fixed (Aug 2026, follow-up round): same site-wide dark
          navy hero fix applied to HealthcareConsultancy.jsx — see that
          file's hero comment for the full explanation. */}
      <section style={{ background: "linear-gradient(135deg,var(--wc-navy-deepest),var(--wc-navy) 60%,var(--wc-navy-deep))", padding: "72px 0 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "36px 36px", pointerEvents: "none" }} />
        <W style={{ position: "relative" }}>
          <div ref={heroRef} className={`reveal${heroVis ? " in" : ""} cp-hero-cols`}
            style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "36px", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", fontFamily: "'Inter',sans-serif", fontSize: "12.5px",
                fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green-lighter)", background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.15)", borderRadius: "20px", padding: "6px 14px", marginBottom: "16px" }}>
                🕊️ CARE+
              </span>
              <h1 style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: "700", color: "#fff", lineHeight: "1.15", margin: "0 0 16px" }}>
                Be Home. Feel Home. Care+ is There.
              </h1>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "16px", color: "rgba(255,255,255,.65)", lineHeight: "1.75", margin: "0 0 24px", fontWeight: "300", maxWidth: "480px" }}>
                Care+ is dedicated to providing compassionate support for lonely elderly individuals in the comfort of their homes. We understand the importance of providing empathetic palliative care.
              </p>
              <a href="#enquire" className="cp-btn" style={{ width: "auto", textDecoration: "none" }}>Get in Touch →</a>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid rgba(255,255,255,.15)", borderRadius: "20px", padding: "28px", boxShadow: "0 20px 50px rgba(0,0,0,.35)" }}>
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
              The home remains the home. Care becomes professional.
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

          {/* "With Care+, your loved one can continue to..." checklist */}
          <div style={{ marginTop: "36px", background: "var(--wc-warm-white)", border: "1px solid var(--wc-border)",
            borderRadius: "18px", padding: "28px 32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 16px", textAlign: "center" }}>
              With Care+, your loved one can continue to
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: "10px 24px" }}>
              {CAN_CONTINUE_TO.map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                  <span style={{ color: "var(--wc-green)", fontWeight: "700", flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "#374151", lineHeight: "1.5" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </W>
      </section>

      {/* CONTINUOUS CARE AT HOME — 3 detailed pillars */}
      <section style={{ background: "var(--wc-sage)", padding: "64px 0", borderTop: "1px solid #86efac", borderBottom: "1px solid #86efac" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>CONTINUOUS CARE AT HOME</p>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 10px" }}>A structured combination of support</h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "var(--wc-muted)", maxWidth: "600px", margin: "0 auto" }}>
              Care+ combines four pillars of support, coordinated around the individual.
            </p>
          </div>
          <div ref={svcRef} className={`stagger${svcVis ? " in" : ""}`}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(240px,100%),1fr))", gap: "22px" }}>
            {CARE_PILLARS.map((s) => (
              <div key={s.title} style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "16px", padding: "26px" }}>
                <div style={{ fontSize: "26px", marginBottom: "12px" }}>{s.ic}</div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "var(--wc-muted)", lineHeight: "1.7", margin: "0 0 14px", fontWeight: "300" }}>{s.desc}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {s.items.map((it) => (
                    <li key={it} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "7px" }}>
                      <span style={{ color: "var(--wc-green)", fontSize: "12px", marginTop: "3px" }}>●</span>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", color: "#374151", lineHeight: "1.5" }}>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", maxWidth: "640px", margin: "28px auto 0", lineHeight: "1.75" }}>
            Let us guide you through a seamless and compassionate healthcare experience. For more details, get in touch.
          </p>
        </W>
      </section>

      {/* PALLIATIVE & HOSPICE CARE AT HOME */}
      <section style={{ padding: "64px 0" }}>
        <W s={{ maxWidth: "820px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>PALLIATIVE & HOSPICE CARE AT HOME</p>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 16px" }}>Comfort, dignity, and family presence</h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14.5px", color: "var(--wc-muted)", lineHeight: "1.8", margin: "0 0 12px" }}>
              For individuals living with advanced, progressive or life-limiting illnesses, the focus may not always be on aggressive treatment — it may be about comfort, pain and symptom management, dignity, familiar surroundings, emotional support, and family presence.
            </p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14.5px", color: "var(--wc-muted)", lineHeight: "1.8", margin: 0 }}>
              Care+ supports families who wish to provide palliative or hospice care to their loved ones at home, subject to the individual's clinical requirements and the advice of the treating medical team.
            </p>
          </div>
        </W>
      </section>

      {/* FOR FAMILIES WHO CAN'T BE THERE 24/7 */}
      <section style={{ background: "var(--wc-navy)", padding: "64px 0" }}>
        <W s={{ maxWidth: "760px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green-light)", margin: "0 0 8px" }}>FOR FAMILIES WHO CAN'T BE THERE 24/7</p>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "#fff", margin: "0 0 16px" }}>Living in another city — or another country?</h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14.5px", color: "rgba(255,255,255,.8)", lineHeight: "1.8", margin: "0 0 8px" }}>
              This doesn't mean you care any less. Care+ is designed to bridge that gap — we provide the physical presence and professional support you may not always be able to provide yourself, while you continue giving the most important thing: your presence, love and emotional connection.
            </p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "15px", fontWeight: "700", color: "#fff", margin: "18px 0 0" }}>
              Care+ does not replace the family. We support the family in caring for their loved one.
            </p>
          </div>
        </W>
      </section>

      {/* HOME + CARE + FAMILY = CARE+ */}
      <section style={{ padding: "64px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: "700", color: "var(--wc-navy)", margin: 0 }}>Home + Care + Family = Care+</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))", gap: "20px" }}>
            {THREE_ELEMENTS.map((e) => (
              <div key={e.title} className="cp-card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{e.ic}</div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 8px" }}>{e.title}</h3>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", color: "var(--wc-muted)", lineHeight: "1.7", margin: 0, fontWeight: "300" }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* WHO IT'S FOR */}
      <section style={{ padding: "64px 0", background: "var(--wc-warm-white)" }}>
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

      {/* A CONNECTED HEALTHCARE SUPPORT SYSTEM */}
      <section style={{ background: "var(--wc-sage)", padding: "56px 0", borderTop: "1px solid #86efac", borderBottom: "1px solid #86efac" }}>
        <W s={{ maxWidth: "900px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>A CONNECTED HEALTHCARE SUPPORT SYSTEM</p>
            <h2 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 10px" }}>Continuity, not fragmentation</h2>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "var(--wc-muted)", maxWidth: "640px", margin: "0 auto" }}>
              When your loved one needs medical attention, specialist consultation, diagnostics, or hospital care, We Care 4 'all' coordinates it — Care+ connects home to the wider healthcare system.
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {CARE_CONTINUUM.map((step, i) => (
              <span key={step} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "999px",
                  padding: "8px 16px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: "700", color: "var(--wc-navy)" }}>
                  {step}
                </span>
                {i < CARE_CONTINUUM.length - 1 && <span style={{ color: "var(--wc-green)", fontWeight: "700" }}>→</span>}
              </span>
            ))}
          </div>
        </W>
      </section>

      {/* OUR PROMISE */}
      <section style={{ padding: "64px 0" }}>
        <W s={{ maxWidth: "700px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: "700", letterSpacing: "1.5px", color: "var(--wc-green)", margin: "0 0 8px" }}>OUR PROMISE</p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "15px", color: "#374151", lineHeight: "1.9", margin: 0 }}>
              We cannot promise that ageing will be easy, or that illness will never happen. But we can provide a different way of caring — one that lets your loved one remain where they feel safe, brings professional support without taking away familiarity, gives families reassurance without replacing their role, and combines care with dignity, and technology with humanity.
            </p>
          </div>
        </W>
      </section>

      {/* ENQUIRY FORM */}
      <section id="enquire" style={{ padding: "72px 0" }}>
        <W s={{ maxWidth: "780px" }}>
          <div ref={formRef} className={`reveal${formVis ? " in" : ""}`}
            style={{ background: "#fff", border: "1.5px solid #86efac", borderRadius: "20px", boxShadow: "0 12px 32px rgba(14,116,144,.10)", overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 0" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "var(--wc-navy)", margin: "0 0 6px" }}>Care+ Service Request Form</h2>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", margin: 0 }}>Tell us about your loved one's needs and a Care Coordinator will walk you through the Care+ plan and charges.</p>
            </div>
            <ServiceRequestForm />
          </div>
          <p style={{ textAlign: "center", fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#6b7688", marginTop: "18px" }}>
            Prefer to talk directly? Call <a href="tel:+919025786467" style={{ color: "var(--wc-green)", fontWeight: "600" }}>+91 90257 86467</a> or use our <Link to="/contact" style={{ color: "var(--wc-green)", fontWeight: "600" }}>general contact form</Link>.
          </p>
        </W>
      </section>
    </div>
  );
}
