import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.pw{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}.pw *{box-sizing:border-box;}.pw a{text-decoration:none;}
.pw h1,.pw h2,.pw h3,.pw h4{font-family:'Cormorant Garamond',Georgia,serif;}
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease;}.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
.stagger.in>*{opacity:1;transform:translateY(0);}
.stagger.in>*:nth-child(1){transition-delay:.04s}.stagger.in>*:nth-child(2){transition-delay:.10s}
.stagger.in>*:nth-child(3){transition-delay:.16s}.stagger.in>*:nth-child(4){transition-delay:.22s}
.stagger.in>*:nth-child(5){transition-delay:.28s}.stagger.in>*:nth-child(6){transition-delay:.34s}
.tier-card{transition:all .25s;}.tier-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(11,31,58,.14)!important;}
.benefit-card{transition:all .25s;}.benefit-card:hover{border-color:#047857!important;background:#f0fdf4!important;transform:translateY(-3px);}
.pw-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;transition:all .2s;outline:none;}
.pw-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.pw-inp.err{border-color:#ef4444;background:#fef2f2;}
.pw-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.pw-chip{display:flex;align-items:center;gap:5px;padding:6px 12px;border:1.5px solid #e2eaf4;border-radius:8px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-size:12px;color:#374151;user-select:none;}
.pw-chip:hover{border-color:#047857;background:#f0fdf4;color:#047857;}
.pw-chip.on{border-color:#047857;background:#dcfce7;color:#047857;font-weight:600;}
.sec-ttl{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;color:#047857;letter-spacing:1.5px;text-transform:uppercase;padding:8px 0 7px;border-bottom:1px solid #e2eaf4;margin-bottom:14px;}
.btn-p{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#047857,#059669);color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;padding:13px 28px;border-radius:9px;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(4,120,87,.38);transition:all .25s;text-decoration:none;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(4,120,87,.48);}
.btn-p:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.4);border-top:2px solid #fff;border-radius:50%;animation:spin .75s linear infinite;display:inline-block;}
@media(max-width:900px){
  .tier-grid{grid-template-columns:1fr!important;}
  .pw-grid{grid-template-columns:1fr!important;}
  .fw2,.fw3{grid-template-columns:1fr 1fr!important;}
}
@media(max-width:600px){
  .fw2,.fw3{grid-template-columns:1fr!important;}
  .tier-grid{grid-template-columns:1fr!important;}
}
`;
const W = ({ children, s = {} }) => (
  <div
    style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", ...s }}
  >
    {children}
  </div>
);
const TIERS = [
  {
    icon: "🌿",
    id: "basic",
    label: "Basic Association",
    price: "Free",
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2eaf4",
    features: [
      "Listed in hospital network",
      "Eligible for patient referrals",
      "Merit-based inclusion",
      "Basic portal (5 photos, 3 doctors)",
      "Download Certificate",
    ],
  },
  {
    icon: "🚀",
    id: "growth",
    label: "Growth Partner",
    price: "Contact for Pricing",
    color: "#047857",
    bg: "#f0fdf4",
    border: "#86efac",
    badge: "Popular",
    features: [
      "Priority website listing",
      "Featured recommendations",
      "Digital campaigns",
      "Blog & awareness content",
      "Health camps",
      "Full portal (20 photos, 10 doctors)",
      "Monthly analytics",
      "Download Certificate",
    ],
  },
  {
    icon: "⭐",
    id: "strategic",
    label: "Strategic Partner",
    price: "Contact for Pricing",
    color: "#0369a1",
    bg: "#eff8ff",
    border: "#93c5fd",
    badge: "Premium",
    features: [
      "Dedicated promotion campaigns",
      "Doctor video features",
      "International patient exposure",
      "All initiative branding",
      "Corporate tie-ups",
      "Unlimited profiles",
      "Commission portal",
      "Dedicated account manager",
      "Download Certificate",
    ],
  },
];
const SPECS = [
  "Cardiology",
  "Neurology",
  "Orthopaedics",
  "Oncology",
  "Gastroenterology",
  "Nephrology",
  "Pulmonology",
  "Ophthalmology",
  "ENT",
  "Dermatology",
  "Gynaecology",
  "Paediatrics",
  "Psychiatry",
  "Endocrinology",
  "Urology",
  "Physiotherapy",
  "General Medicine",
  "Dental",
  "Radiology",
  "Pathology",
  "ICU/Critical Care",
  "Emergency Medicine",
  "Others",
];
const INFRA = [
  "OPD",
  "IPD",
  "ICU",
  "Operation Theatre",
  "Emergency/Casualty",
  "Labour Room",
  "NICU",
  "Pharmacy",
  "Lab/Pathology",
  "Radiology/Imaging",
  "Blood Bank",
  "Dialysis",
  "Physiotherapy",
  "Cafeteria",
  "Ambulance Service",
  "Telemedicine",
];
const ACCREDS = [
  "NABH",
  "JCI",
  "NABL",
  "ISO 9001",
  "ISO 15189",
  "None",
  "Others",
];
function Chips({ options, selected, onChange }) {
  const toggle = (o) =>
    onChange(
      selected.includes(o) ? selected.filter((s) => s !== o) : [...selected, o],
    );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
      {options.map((o) => (
        <div
          key={o}
          className={`pw-chip${selected.includes(o) ? " on" : ""}`}
          onClick={() => toggle(o)}
        >
          <span>{selected.includes(o) ? "✓" : "○"}</span>
          {o}
        </div>
      ))}
    </div>
  );
}
function EmpanelForm({ formRef }) {
  const INIT = {
    hospital_name: "",
    reg_number: "",
    year_est: "",
    hospital_type: "",
    ownership: "",
    contact_person: "",
    designation: "",
    email: "",
    mobile: "",
    alt_mobile: "",
    website: "",
    address: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    country: "India",
    beds: "",
    icu_beds: "",
    doctors: "",
    nurses: "",
    annual_patients: "",
    occupancy: "",
    specialties: [],
    infrastructure: [],
    accreditations: [],
    ins_status: "",
    ins_list: "",
    tier: "basic",
    about: "",
    agree: false,
  };
  const [form, setForm] = useState(INIT);
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(1);
  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (err[k]) setErr((p) => ({ ...p, [k]: "" }));
  };
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.hospital_name.trim()) e.hospital_name = "Required";
      if (!form.contact_person.trim()) e.contact_person = "Required";
      if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
      if (!form.mobile.trim()) e.mobile = "Required";
      if (!form.city.trim()) e.city = "Required";
      if (!form.state) e.state = "Required";
    }
    if (s === 2) {
      if (!form.beds) e.beds = "Required";
      if (form.specialties.length === 0) e.specialties = "Select at least one";
    }
    if (s === 4 && !form.agree) e.agree = "You must agree to proceed";
    return e;
  };
  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) {
      setErr(e);
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
    formRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const prev = () => {
    setStep((s) => Math.max(s - 1, 1));
    formRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const submit = async (e) => {
    e.preventDefault();
    const e4 = validate(4);
    if (Object.keys(e4).length) {
      setErr(e4);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1") +
          "/empanelment/submit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Submission failed");
      setDone(true);
    } catch (err) {
      alert("Failed to submit: " + err.message + "\nPlease call 90257 86467");
    } finally {
      setLoading(false);
    }
  };
  const ip = (k) => ({
    name: k,
    value: form[k],
    className: `pw-inp${err[k] ? " err" : ""}`,
    onChange: (e) => set(k, e.target.value),
  });
  if (done)
    return (
      <div style={{ padding: "52px 28px", textAlign: "center" }}>
        <div
          style={{
            width: "68px",
            height: "68px",
            background: "#dcfce7",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            fontSize: "30px",
          }}
        >
          ✅
        </div>
        <h3
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#0b1f3a",
            marginBottom: "8px",
          }}
        >
          Application Submitted!
        </h3>
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "15px",
            color: "#64748b",
            marginBottom: "6px",
          }}
        >
          Thank you, <strong>{form.hospital_name}</strong>. Our team will
          respond within 3 business days.
        </p>
        <p
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "13px",
            color: "#94a3b8",
            marginBottom: "24px",
          }}
        >
          Confirmation will be sent to <strong>{form.email}</strong>
        </p>
        <button
          onClick={() => {
            setDone(false);
            setForm(INIT);
            setStep(1);
          }}
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: "14px",
            fontWeight: "600",
            color: "#047857",
            background: "transparent",
            border: "1.5px solid #047857",
            padding: "10px 22px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Submit Another
        </button>
      </div>
    );
  const Steps = () => (
    <div
      style={{
        padding: "14px 22px",
        borderBottom: "1px solid #f1f5f9",
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {["Basic Info", "Hospital Details", "Tier & Info", "Review"].map(
        (lbl, i) => (
          <div
            key={lbl}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < 3 ? 1 : "auto",
              gap: "4px",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "700",
                fontFamily: "'DM Sans',sans-serif",
                background:
                  step > i + 1
                    ? "#047857"
                    : step === i + 1
                      ? "#0b1f3a"
                      : "#e2eaf4",
                color: step >= i + 1 ? "#fff" : "#94a3b8",
              }}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                fontWeight: "600",
                color:
                  step === i + 1
                    ? "#0b1f3a"
                    : step > i + 1
                      ? "#047857"
                      : "#94a3b8",
                display: step === i + 1 || step > i + 1 ? "block" : "none",
                whiteSpace: "nowrap",
              }}
            >
              {lbl}
            </span>
            {i < 3 && (
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background: step > i + 1 ? "#047857" : "#e2eaf4",
                  borderRadius: "1px",
                }}
              />
            )}
          </div>
        ),
      )}
    </div>
  );
  const Err = ({ k }) =>
    err[k] ? (
      <p
        style={{
          color: "#ef4444",
          fontSize: "11px",
          marginTop: "3px",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        ⚠ {err[k]}
      </p>
    ) : null;
  return (
    <form onSubmit={submit}>
      <Steps />
      <div style={{ padding: "22px 24px" }}>
        {step === 1 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <p className="sec-ttl">Hospital Information</p>
            <div
              className="fw2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "13px",
              }}
            >
              <div style={{ gridColumn: "span 2" }}>
                <label className="pw-lbl">Hospital Name *</label>
                <input
                  {...ip("hospital_name")}
                  placeholder="Full registered name"
                />
                <Err k="hospital_name" />
              </div>
              <div>
                <label className="pw-lbl">Registration Number</label>
                <input
                  {...ip("reg_number")}
                  placeholder="RC / Registration No."
                />
              </div>
              <div>
                <label className="pw-lbl">Year Established</label>
                <input
                  {...ip("year_est")}
                  placeholder="e.g. 2005"
                  type="number"
                />
              </div>
              <div>
                <label className="pw-lbl">Hospital Type</label>
                <select {...ip("hospital_type")}>
                  <option value="">Select type</option>
                  {[
                    "Multi-Speciality",
                    "Super-Speciality",
                    "General Hospital",
                    "Speciality Clinic",
                    "Nursing Home",
                    "Day Care",
                    "Diagnostic Centre",
                    "Maternity",
                    "Dental",
                    "Rehabilitation",
                    "Ayurvedic/AYUSH",
                    "Others",
                  ].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="pw-lbl">Ownership Type</label>
                <select {...ip("ownership")}>
                  <option value="">Select</option>
                  {[
                    "Private",
                    "Trust/NGO",
                    "Government",
                    "PPP",
                    "Corporate Chain",
                    "Others",
                  ].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="pw-lbl">Website</label>
                <input
                  {...ip("website")}
                  placeholder="https://yourhospital.com"
                  type="url"
                />
              </div>
            </div>
            <p className="sec-ttl">Contact Details</p>
            <div
              className="fw2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "13px",
              }}
            >
              <div>
                <label className="pw-lbl">Contact Person *</label>
                <input {...ip("contact_person")} placeholder="Full name" />
                <Err k="contact_person" />
              </div>
              <div>
                <label className="pw-lbl">Designation</label>
                <input
                  {...ip("designation")}
                  placeholder="CEO / Manager / Admin"
                />
              </div>
              <div>
                <label className="pw-lbl">Official Email *</label>
                <input
                  {...ip("email")}
                  placeholder="official@hospital.com"
                  type="email"
                />
                <Err k="email" />
              </div>
              <div>
                <label className="pw-lbl">Mobile *</label>
                <input
                  {...ip("mobile")}
                  placeholder="+91 XXXXX XXXXX"
                  type="tel"
                />
                <Err k="mobile" />
              </div>
              <div>
                <label className="pw-lbl">Alternate Mobile</label>
                <input
                  {...ip("alt_mobile")}
                  placeholder="+91 XXXXX XXXXX"
                  type="tel"
                />
              </div>
            </div>
            <p className="sec-ttl">Location</p>
            <div
              className="fw3"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "13px",
              }}
            >
              <div style={{ gridColumn: "span 3" }}>
                <label className="pw-lbl">Full Address</label>
                <textarea
                  {...ip("address")}
                  rows={2}
                  style={{ resize: "vertical" }}
                  placeholder="Door No., Street, Area, Landmark"
                />
              </div>
              <div>
                <label className="pw-lbl">City *</label>
                <input {...ip("city")} placeholder="Chennai" />
                <Err k="city" />
              </div>
              <div>
                <label className="pw-lbl">District</label>
                <input {...ip("district")} placeholder="District" />
              </div>
              <div>
                <label className="pw-lbl">State *</label>
                <select {...ip("state")}>
                  <option value="">Select state</option>
                  {[
                    "Tamil Nadu",
                    "Kerala",
                    "Karnataka",
                    "Andhra Pradesh",
                    "Telangana",
                    "Maharashtra",
                    "Delhi",
                    "Gujarat",
                    "Rajasthan",
                    "Others",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Err k="state" />
              </div>
              <div>
                <label className="pw-lbl">Pincode</label>
                <input {...ip("pincode")} placeholder="600017" maxLength={6} />
              </div>
              <div>
                <label className="pw-lbl">Country</label>
                <input {...ip("country")} placeholder="India" />
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <p className="sec-ttl">Capacity & Workforce</p>
            <div
              className="fw2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "13px",
              }}
            >
              {[
                ["beds", "Total Bed Count *", "e.g. 150"],
                ["icu_beds", "ICU Beds", "e.g. 20"],
                ["doctors", "Number of Doctors", "e.g. 40"],
                ["nurses", "Nursing Staff", "e.g. 80"],
                ["annual_patients", "Annual Patient Load", "e.g. 12000"],
                ["occupancy", "Avg Bed Occupancy (%)", "e.g. 70"],
              ].map(([k, lbl, ph]) => (
                <div key={k}>
                  <label className="pw-lbl">{lbl}</label>
                  <input {...ip(k)} placeholder={ph} type="number" />
                  <Err k={k} />
                </div>
              ))}
            </div>
            <div>
              <p className="sec-ttl">Specialties Available *</p>
              <Chips
                options={SPECS}
                selected={form.specialties}
                onChange={(v) => set("specialties", v)}
              />
              <Err k="specialties" />
            </div>
            <div>
              <p className="sec-ttl">Infrastructure & Facilities</p>
              <Chips
                options={INFRA}
                selected={form.infrastructure}
                onChange={(v) => set("infrastructure", v)}
              />
            </div>
            <div>
              <p className="sec-ttl">Accreditations</p>
              <Chips
                options={ACCREDS}
                selected={form.accreditations}
                onChange={(v) => set("accreditations", v)}
              />
            </div>
            <div
              className="fw2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "13px",
              }}
            >
              <div>
                <label className="pw-lbl">Insurance Empanelled?</label>
                <select
                  value={form.ins_status}
                  onChange={(e) => set("ins_status", e.target.value)}
                  className="pw-inp"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="partial">Partially</option>
                </select>
              </div>
              <div>
                <label className="pw-lbl">Insurance Companies</label>
                <input
                  value={form.ins_list}
                  onChange={(e) => set("ins_list", e.target.value)}
                  className="pw-inp"
                  placeholder="Star Health, United India…"
                />
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <p className="sec-ttl">Select Partnership Tier</p>
            <div
              className="tier-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "14px",
              }}
            >
              {TIERS.map(
                ({
                  icon,
                  id,
                  label,
                  price,
                  color,
                  bg,
                  border,
                  badge,
                  features,
                }) => (
                  <div
                    key={id}
                    onClick={() => set("tier", id)}
                    style={{
                      background: bg,
                      border: `2px solid ${form.tier === id ? color : border}`,
                      borderRadius: "13px",
                      padding: "18px 16px",
                      cursor: "pointer",
                      position: "relative",
                      transition: "all .22s",
                      boxShadow:
                        form.tier === id ? `0 8px 24px ${color}30` : "none",
                    }}
                  >
                    {badge && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-10px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: color,
                          color: "#fff",
                          fontSize: "9px",
                          fontWeight: "700",
                          padding: "3px 12px",
                          borderRadius: "50px",
                          fontFamily: "'DM Sans',sans-serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            background: `${color}18`,
                            border: `1.5px solid ${color}38`,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                          }}
                        >
                          {icon}
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "'Cormorant Garamond',serif",
                              fontSize: "15px",
                              fontWeight: "700",
                              color: "#0b1f3a",
                              margin: 0,
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontFamily: "'DM Sans',sans-serif",
                              fontSize: "11px",
                              color: color,
                              fontWeight: "600",
                              margin: 0,
                            }}
                          >
                            {price}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: `2px solid ${color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: form.tier === id ? color : "transparent",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: "700",
                        }}
                      >
                        {form.tier === id ? "✓" : ""}
                      </div>
                    </div>
                    <ul
                      style={{
                        paddingLeft: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      {features.map((f) => (
                        <li
                          key={f}
                          style={{
                            display: "flex",
                            gap: "6px",
                            fontFamily: "'DM Sans',sans-serif",
                            fontSize: "11px",
                            color: "#475569",
                            fontWeight: "300",
                          }}
                        >
                          <span
                            style={{ color, fontWeight: "700", flexShrink: 0 }}
                          >
                            ✓
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
            <div>
              <label className="pw-lbl">About Your Hospital</label>
              <textarea
                value={form.about}
                onChange={(e) => set("about", e.target.value)}
                className="pw-inp"
                rows={4}
                style={{ resize: "vertical" }}
                placeholder="Tell us about your hospital's specialties, achievements and what you hope to achieve through this partnership…"
              />
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "11px",
                  color: "#94a3b8",
                  marginTop: "3px",
                  textAlign: "right",
                }}
              >
                {form.about.length}/1000
              </p>
            </div>
          </div>
        )}
        {step === 4 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <p className="sec-ttl">Application Summary</p>
            {[
              {
                title: "Hospital",
                fields: [
                  ["Name", form.hospital_name],
                  ["Type", form.hospital_type],
                  ["City", form.city],
                  ["State", form.state],
                ],
              },
              {
                title: "Contact",
                fields: [
                  ["Person", form.contact_person],
                  ["Email", form.email],
                  ["Mobile", form.mobile],
                  ["Beds", form.beds],
                ],
              },
            ].map(({ title, fields }) => (
              <div
                key={title}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2eaf4",
                  borderRadius: "10px",
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#0b1f3a",
                    marginBottom: "9px",
                  }}
                >
                  {title}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "5px 14px",
                  }}
                >
                  {fields.map(([l, v]) => (
                    <div key={l} style={{ display: "flex", gap: "5px" }}>
                      <span
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: "12px",
                          color: "#94a3b8",
                          minWidth: "70px",
                          flexShrink: 0,
                        }}
                      >
                        {l}:
                      </span>
                      <span
                        style={{
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: "12px",
                          color: "#1e293b",
                          fontWeight: "600",
                        }}
                      >
                        {v || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {form.specialties.length > 0 && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "10px",
                  padding: "13px 16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#047857",
                    marginBottom: "7px",
                  }}
                >
                  Selected Specialties ({form.specialties.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {form.specialties.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "#dcfce7",
                        color: "#15803d",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "2px 9px",
                        borderRadius: "50px",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div
              style={{
                background: "#fef9c3",
                border: "1px solid #fde047",
                borderRadius: "10px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "11px",
                }}
              >
                <input
                  type="checkbox"
                  id="agree"
                  checked={form.agree}
                  onChange={(e) => set("agree", e.target.checked)}
                  style={{
                    marginTop: "2px",
                    width: "15px",
                    height: "15px",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="agree"
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "13px",
                    color: "#374151",
                    lineHeight: "1.7",
                    cursor: "pointer",
                  }}
                >
                  I confirm the information is accurate and agree to the{" "}
                  <Link
                    to="/terms"
                    style={{ color: "#047857", fontWeight: "600" }}
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    style={{ color: "#047857", fontWeight: "600" }}
                  >
                    Privacy Policy
                  </Link>{" "}
                  of We Care 4 'all'. I authorise the team to contact me
                  regarding this application.
                </label>
              </div>
              <Err k="agree" />
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: "11px",
            justifyContent: "space-between",
            marginTop: "20px",
            paddingTop: "18px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          {step > 1 ? (
            <button
              type="button"
              onClick={prev}
              style={{
                padding: "11px 22px",
                borderRadius: "9px",
                border: "1.5px solid #e2eaf4",
                background: "#fff",
                color: "#64748b",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#047857";
                e.currentTarget.style.color = "#047857";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2eaf4";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              ← Previous
            </button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <button type="button" onClick={next} className="btn-p">
              Continue →{" "}
              <span
                style={{
                  background: "rgba(255,255,255,.2)",
                  borderRadius: "50px",
                  padding: "1px 8px",
                  fontSize: "12px",
                }}
              >
                {step}/4
              </span>
            </button>
          ) : (
            <button type="submit" disabled={loading} className="btn-p">
              {loading ? (
                <>
                  <span className="spinner" />
                  Submitting...
                </>
              ) : (
                "Submit Application ✓"
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
export default function PartnerWithUs() {
  const formRef = useRef(null);
  useEffect(() => {
    document.title = "Partner With Us — We Care 4 all";
    // window.scrollTo(0, 0);
  }, []);
  const [r1, v1] = useScrollAnimation();
  const [r2, v2] = useScrollAnimation();
  return (
    <div className="pw">
      <style>{G}</style>
      <section
        style={{
          background: "linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",
          paddingTop: "112px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",
            backgroundSize: "36px 36px",
            pointerEvents: "none",
          }}
        />
        <W s={{ padding: "52px 24px 80px" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <Link
              to="/"
              style={{
                color: "rgba(255,255,255,.5)",
                fontSize: "13px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Home
            </Link>
            <span style={{ color: "rgba(255,255,255,.25)" }}>/</span>
            <span
              style={{
                color: "#6ee7b7",
                fontSize: "13px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Partner With Us
            </span>
          </div>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "11px",
              fontWeight: "700",
              color: "#6ee7b7",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Hospital Partnership
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(34px,5vw,58px)",
              fontWeight: "700",
              color: "#fff",
              lineHeight: "1.1",
              marginBottom: "14px",
            }}
          >
            Grow Your Hospital
            <br />
            <span style={{ color: "#34d399" }}>With Our Network.</span>
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "17px",
              color: "rgba(255,255,255,.68)",
              lineHeight: "1.78",
              maxWidth: "490px",
              fontWeight: "300",
            }}
          >
            Join 50+ partner hospitals. Gain digital visibility, patient
            referrals, corporate tie-ups and campaign support through our
            three-tier partnership programme.
          </p>
        </W>
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", width: "100%", marginBottom: "-2px" }}
        >
          <path
            d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z"
            fill="#f0f6fc"
          />
        </svg>
      </section>
      <section style={{ background: "#f0f6fc", padding: "68px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                color: "#047857",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Partnership Tiers
            </p>
            <h2
              style={{
                fontSize: "clamp(24px,3.5vw,40px)",
                fontWeight: "700",
                color: "#0b1f3a",
                margin: "0 0 10px",
              }}
            >
              Choose Your Partnership Level
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                color: "#64748b",
                maxWidth: "440px",
                margin: "0 auto",
                fontWeight: "300",
              }}
            >
              Pricing for Growth and Strategic tiers is set by our admin team —
              contact us for a quote.
            </p>
          </div>
          <div
            ref={r1}
            className={`tier-grid stagger${v1 ? " in" : ""}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "22px",
            }}
          >
            {TIERS.map(
              ({ icon, label, price, color, bg, border, badge, features }) => (
                <div
                  key={label}
                  className="tier-card"
                  style={{
                    background: bg,
                    border: `2px solid ${border}`,
                    borderRadius: "16px",
                    padding: "26px 22px",
                    position: "relative",
                    boxShadow: "0 2px 12px rgba(11,31,58,.06)",
                  }}
                >
                  {badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-11px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: color,
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "3px 14px",
                        borderRadius: "50px",
                        fontFamily: "'DM Sans',sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {badge}
                    </span>
                  )}
                  <div style={{ fontSize: "26px", marginBottom: "10px" }}>
                    {icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#0b1f3a",
                      margin: "0 0 4px",
                    }}
                  >
                    {label}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: color,
                      margin: "0 0 16px",
                    }}
                  >
                    {price}
                  </p>
                  <ul
                    style={{
                      paddingLeft: 0,
                      listStyle: "none",
                      marginBottom: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                    }}
                  >
                    {features.map((f) => (
                      <li
                        key={f}
                        style={{
                          display: "flex",
                          gap: "7px",
                          fontFamily: "'DM Sans',sans-serif",
                          fontSize: "13px",
                          color: "#475569",
                          fontWeight: "300",
                        }}
                      >
                        <span
                          style={{ color, fontWeight: "700", flexShrink: 0 }}
                        >
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#empanelment"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "11px",
                      background: color,
                      color: "#fff",
                      borderRadius: "9px",
                      fontFamily: "'DM Sans',sans-serif",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Apply Now →
                  </a>
                </div>
              ),
            )}
          </div>
        </W>
      </section>
      <section style={{ background: "#fff", padding: "68px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                color: "#047857",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Benefits
            </p>
            <h2
              style={{
                fontSize: "clamp(24px,3.5vw,38px)",
                fontWeight: "700",
                color: "#0b1f3a",
                margin: 0,
              }}
            >
              Why Partner With We Care 4 'all'?
            </h2>
          </div>
          <div
            ref={r2}
            className={`stagger${v2 ? " in" : ""}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: "16px",
            }}
          >
            {[
              [
                "📈",
                "Patient Referrals",
                "Qualified patients referred directly to your specialties.",
              ],
              [
                "🌐",
                "Digital Visibility",
                "Featured listings, blog mentions and social campaigns.",
              ],
              [
                "🏢",
                "Corporate Tie-ups",
                "Access to corporate clients for employee health programmes.",
              ],
              [
                "🌍",
                "International Patients",
                "Exposure to medical tourists from UAE, UK, USA and Singapore.",
              ],
              [
                "📊",
                "Analytics & Insights",
                "Monthly reports on referral count, views and enquiries.",
              ],
              [
                "🏅",
                "Credibility & Trust",
                "Euro Cert certified platform builds patient confidence.",
              ],
            ].map(([ic, t, d]) => (
              <div
                key={t}
                className="benefit-card"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2eaf4",
                  borderRadius: "13px",
                  padding: "20px",
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "9px" }}>
                  {ic}
                </div>
                <h3
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#0b1f3a",
                    margin: "0 0 6px",
                  }}
                >
                  {t}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "13px",
                    color: "#94a3b8",
                    lineHeight: "1.65",
                    margin: 0,
                    fontWeight: "300",
                  }}
                >
                  {d}
                </p>
              </div>
            ))}
          </div>
        </W>
      </section>
      <section
        id="empanelment"
        style={{ background: "#f0f6fc", padding: "68px 0" }}
      >
        <W>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                color: "#047857",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Apply Now
            </p>
            <h2
              style={{
                fontSize: "clamp(24px,3.5vw,38px)",
                fontWeight: "700",
                color: "#0b1f3a",
                margin: "0 0 9px",
              }}
            >
              Hospital Empanelment Application
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                color: "#64748b",
                maxWidth: "460px",
                margin: "0 auto",
                fontWeight: "300",
              }}
            >
              Fill in your hospital details across 4 easy steps. Our team will
              review and respond within 3 business days.
            </p>
          </div>
          <div ref={formRef}
            style={{
              maxWidth: "840px",
              margin: "0 auto",
              background: "#fff",
              border: "1px solid #e2eaf4",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(11,31,58,.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,#047857,#059669)",
                padding: "18px 24px",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#fff",
                  margin: "0 0 2px",
                }}
              >
                Empanelment Request Form
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,.78)",
                }}
              >
                Fields marked * are required
              </p>
            </div>
            <EmpanelForm formRef={formRef} />
          </div>
        </W>
      </section>
      <section
        style={{
          background: "linear-gradient(135deg,#0b1f3a,#112d52)",
          padding: "52px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: "#fff",
                margin: "0 0 5px",
              }}
            >
              Have Questions Before Applying?
            </h3>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                color: "rgba(255,255,255,.62)",
              }}
            >
              Call us Monday – Saturday, 9 AM – 6 PM
            </p>
          </div>
          <div style={{ display: "flex", gap: "11px", flexWrap: "wrap" }}>
            <a href="tel:+919025786467" className="btn-p">
              📞 90257 86467
            </a>
            <Link
              to="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "1.5px solid rgba(255,255,255,.30)",
                color: "#fff",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: "500",
                fontSize: "15px",
                padding: "13px 26px",
                borderRadius: "9px",
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
