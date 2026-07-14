import { useState } from "react";
import { Link } from "react-router-dom";
import { showToast } from "../../../components/Toast";
import { TIERS } from "./shared";
import Chips from "./Chips";

// These three were accidentally left behind in PartnerWithUs.jsx during
// the Phase 14 file split — EmpanelForm.jsx used them (options={SPECS}
// etc. below) but never actually had their own definitions, which
// meant this component threw a ReferenceError the moment it rendered
// this part of the form. Found by ESLint's no-undef rule (Phase 20),
// not by any manual testing — a genuine gap the file-splitting
// verification at the time didn't catch. Restored here exactly as
// they were in the original file.
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


export default function EmpanelForm({ formRef }) {
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
    key_specialists: [],
    treats_international: false,
    interpreter_languages: "",
    visa_assistance: false,
    accommodation_assistance: false,
    declaration_name: "",
    declaration_designation: "",
    declaration_confirmed: false,
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
    if (s === 4) {
      if (!form.agree) e.agree = "You must agree to proceed";
      if (!form.declaration_name.trim()) e.declaration_name = "Required";
      if (!form.declaration_confirmed) e.declaration_confirmed = "Please confirm the declaration to submit";
    }
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
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(
        (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1") +
          "/empanelment/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(form),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Submission failed");
      setDone(true);
    } catch (err) {
      showToast("Failed to submit: " + err.message + "\nPlease call 90257 86467", "error");
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
            color: "#6b7688",
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
                color: step >= i + 1 ? "#fff" : "#6b7688",
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
                      : "#6b7688",
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
                <label className="pw-lbl" htmlFor="public-partnerwithus-hospital-name">Hospital Name *</label>
                <input id="public-partnerwithus-hospital-name"
                  {...ip("hospital_name")}
                  placeholder="Full registered name"
                />
                <Err k="hospital_name" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-registration-number">Registration Number</label>
                <input id="public-partnerwithus-registration-number"
                  {...ip("reg_number")}
                  placeholder="RC / Registration No."
                />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-year-established">Year Established</label>
                <input id="public-partnerwithus-year-established"
                  {...ip("year_est")}
                  placeholder="e.g. 2005"
                  type="number" onWheel={e=>e.currentTarget.blur()}
                />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-hospital-type">Hospital Type</label>
                <select id="public-partnerwithus-hospital-type" {...ip("hospital_type")}>
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
                <label className="pw-lbl" htmlFor="public-partnerwithus-ownership-type">Ownership Type</label>
                <select id="public-partnerwithus-ownership-type" {...ip("ownership")}>
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
                <label className="pw-lbl" htmlFor="public-partnerwithus-website">Website</label>
                <input id="public-partnerwithus-website"
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
                <label className="pw-lbl" htmlFor="public-partnerwithus-contact-person">Contact Person *</label>
                <input id="public-partnerwithus-contact-person" {...ip("contact_person")} placeholder="Full name" />
                <Err k="contact_person" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-designation">Designation</label>
                <input id="public-partnerwithus-designation"
                  {...ip("designation")}
                  placeholder="CEO / Manager / Admin"
                />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-official-email">Official Email *</label>
                <input id="public-partnerwithus-official-email"
                  {...ip("email")}
                  placeholder="official@hospital.com"
                  type="email"
                />
                <Err k="email" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-mobile">Mobile *</label>
                <input id="public-partnerwithus-mobile"
                  {...ip("mobile")}
                  placeholder="+91 XXXXX XXXXX"
                  type="tel"
                />
                <Err k="mobile" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-alternate-mobile">Alternate Mobile</label>
                <input id="public-partnerwithus-alternate-mobile"
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
                <label className="pw-lbl" htmlFor="public-partnerwithus-full-address">Full Address</label>
                <textarea id="public-partnerwithus-full-address"
                  {...ip("address")}
                  rows={2}
                  style={{ resize: "vertical" }}
                  placeholder="Door No., Street, Area, Landmark"
                />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-city">City *</label>
                <input id="public-partnerwithus-city" {...ip("city")} placeholder="Chennai" />
                <Err k="city" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-district">District</label>
                <input id="public-partnerwithus-district" {...ip("district")} placeholder="District" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-state">State *</label>
                <select id="public-partnerwithus-state" {...ip("state")}>
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
                <label className="pw-lbl" htmlFor="public-partnerwithus-pincode">Pincode</label>
                <input id="public-partnerwithus-pincode" {...ip("pincode")} placeholder="600017" maxLength={6} />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-country">Country</label>
                <input id="public-partnerwithus-country" {...ip("country")} placeholder="India" />
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
                  <label className="pw-lbl" htmlFor={`public-partnerwithus-capacity-${k}`}>{lbl}</label>
                  <input id={`public-partnerwithus-capacity-${k}`} {...ip(k)} placeholder={ph} type="number" onWheel={e=>e.currentTarget.blur()} />
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
                <label className="pw-lbl" htmlFor="public-partnerwithus-insurance-empanelled">Insurance Empanelled?</label>
                <select id="public-partnerwithus-insurance-empanelled"
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
                <label className="pw-lbl" htmlFor="public-partnerwithus-insurance-companies">Insurance Companies</label>
                <input id="public-partnerwithus-insurance-companies"
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
              <label className="pw-lbl" htmlFor="public-partnerwithus-about-your-hospital">About Your Hospital</label>
              <textarea id="public-partnerwithus-about-your-hospital"
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
                  color: "#6b7688",
                  marginTop: "3px",
                  textAlign: "right",
                }}
              >
                {form.about.length}/1000
              </p>
            </div>

            {/* Key Specialists (optional) */}
            <div>
              <label className="pw-lbl" htmlFor="public-partnerwithus-key-specialists-optional">Key Specialists <span style={{fontWeight:400,color:"#6b7688"}}>(optional)</span></label>
              {form.key_specialists.map((sp, idx) => (
                <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr auto",gap:"8px",marginBottom:"8px"}}>
                  <input id="public-partnerwithus-key-specialists-optional" className="pw-inp" placeholder="Name" value={sp.name||""}
                    onChange={e=>{
                      const list=[...form.key_specialists]; list[idx]={...list[idx],name:e.target.value}; set("key_specialists",list);
                    }}/>
                  <input className="pw-inp" placeholder="Qualification" value={sp.qualification||""}
                    onChange={e=>{
                      const list=[...form.key_specialists]; list[idx]={...list[idx],qualification:e.target.value}; set("key_specialists",list);
                    }}/>
                  <input className="pw-inp" placeholder="Department" value={sp.department||""}
                    onChange={e=>{
                      const list=[...form.key_specialists]; list[idx]={...list[idx],department:e.target.value}; set("key_specialists",list);
                    }}/>
                  <input className="pw-inp" placeholder="Years Exp." value={sp.years_of_experience||""}
                    onChange={e=>{
                      const list=[...form.key_specialists]; list[idx]={...list[idx],years_of_experience:e.target.value}; set("key_specialists",list);
                    }}/>
                  <button type="button" onClick={()=>set("key_specialists", form.key_specialists.filter((_,i)=>i!==idx))}
                    style={{background:"#fef2f2",border:"none",color:"#991b1b",borderRadius:"7px",cursor:"pointer",fontSize:"15px"}}>×</button>
                </div>
              ))}
              <button type="button"
                onClick={()=>set("key_specialists",[...form.key_specialists,{name:"",qualification:"",department:"",years_of_experience:""}])}
                style={{background:"#f0fdf4",border:"1px dashed #86efac",color:"#15803d",borderRadius:"8px",
                  padding:"8px 14px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:"12.5px",cursor:"pointer"}}>
                + Add Specialist
              </button>
            </div>

            {/* International Patient Services */}
            <div>
              <p className="pw-lbl">International Patient Services</p>
              <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",marginBottom:"10px"}}>
                <input type="checkbox" checked={form.treats_international} onChange={e=>set("treats_international",e.target.checked)}/>
                We treat international patients
              </label>
              {form.treats_international && (
                <div style={{display:"flex",flexDirection:"column",gap:"10px",paddingLeft:"4px"}}>
                  <input className="pw-inp" placeholder="Languages our interpreters cover (e.g. Arabic, French)"
                    value={form.interpreter_languages} onChange={e=>set("interpreter_languages",e.target.value)}/>
                  <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151"}}>
                    <input type="checkbox" checked={form.visa_assistance} onChange={e=>set("visa_assistance",e.target.checked)}/>
                    We offer visa assistance support
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151"}}>
                    <input type="checkbox" checked={form.accommodation_assistance} onChange={e=>set("accommodation_assistance",e.target.checked)}/>
                    We offer accommodation assistance
                  </label>
                </div>
              )}
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
                          color: "#6b7688",
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

            {/* Declaration */}
            <div style={{background:"#f8fafc",border:"1px solid #e2eaf4",borderRadius:"10px",padding:"16px"}}>
              <p className="sec-ttl" style={{marginBottom:"10px"}}>Declaration</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",lineHeight:1.7,marginBottom:"12px"}}>
                We hereby confirm that the information provided above is accurate and that our
                hospital is committed to maintaining high standards of ethical and patient-centred
                medical care.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
                <div>
                  <label className="pw-lbl" htmlFor="public-partnerwithus-name">Name *</label>
                  <input id="public-partnerwithus-name" className={`pw-inp${err.declaration_name?" err":""}`} placeholder="Full name"
                    value={form.declaration_name} onChange={e=>set("declaration_name",e.target.value)}/>
                  <Err k="declaration_name" />
                </div>
                <div>
                  <label className="pw-lbl" htmlFor="public-partnerwithus-designation-2">Designation</label>
                  <input id="public-partnerwithus-designation-2" className="pw-inp" placeholder="e.g. Medical Director"
                    value={form.declaration_designation} onChange={e=>set("declaration_designation",e.target.value)}/>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"flex-start",gap:"11px"}}>
                <input type="checkbox" id="declaration_confirmed" checked={form.declaration_confirmed}
                  onChange={e=>set("declaration_confirmed",e.target.checked)}
                  style={{marginTop:"2px",width:"15px",height:"15px",flexShrink:0,cursor:"pointer"}}/>
                <label htmlFor="declaration_confirmed" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",cursor:"pointer"}}>
                  I confirm the above declaration on behalf of our hospital.
                </label>
              </div>
              <Err k="declaration_confirmed" />
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#6b7688",marginTop:"8px"}}>
                Date will be recorded automatically at the time of submission. Physical signature and hospital
                seal aren't needed for this online application — our team will request these, if required, during review.
              </p>
            </div>

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
