import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { showToast } from "../../../components/Toast";
import { getTiers } from "./shared";
import Chips from "./Chips";

export default function EmpanelForm({ formRef }) {
  const { t } = useTranslation();
  const tiers = getTiers(t);
  // Chip-list options and dropdown options all live in locales/*.json
  // under empanelForm.* now (specs/infra/accreds/hospitalTypes/
  // ownershipTypes/states) — see the SPECS/INFRA/ACCREDS module-level
  // constants this replaced, which were themselves a Phase 20 restore
  // after a Phase 14 file-split ReferenceError (see git history).
  const SPECS = t("empanelForm.specs", { returnObjects: true });
  const INFRA = t("empanelForm.infra", { returnObjects: true });
  const ACCREDS = t("empanelForm.accreds", { returnObjects: true });
  const HOSPITAL_TYPES = t("empanelForm.hospitalTypes", { returnObjects: true });
  const OWNERSHIP_TYPES = t("empanelForm.ownershipTypes", { returnObjects: true });
  const STATES = t("empanelForm.states", { returnObjects: true });

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
      if (!form.hospital_name.trim()) e.hospital_name = t("empanelForm.errRequired");
      if (!form.contact_person.trim()) e.contact_person = t("empanelForm.errRequired");
      if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t("empanelForm.errValidEmail");
      if (!form.mobile.trim()) e.mobile = t("empanelForm.errRequired");
      if (!form.city.trim()) e.city = t("empanelForm.errRequired");
      if (!form.state) e.state = t("empanelForm.errRequired");
    }
    if (s === 2) {
      if (!form.beds) e.beds = t("empanelForm.errRequired");
      if (form.specialties.length === 0) e.specialties = t("empanelForm.errSelectAtLeastOne");
    }
    if (s === 4) {
      if (!form.agree) e.agree = t("empanelForm.errMustAgree");
      if (!form.declaration_name.trim()) e.declaration_name = t("empanelForm.errRequired");
      if (!form.declaration_confirmed) e.declaration_confirmed = t("empanelForm.errConfirmDeclaration");
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
      if (!res.ok) throw new Error(json.detail || t("empanelForm.submitFailed"));
      setDone(true);
    } catch (err) {
      showToast(`${t("empanelForm.submitFailed")}: ${err.message}\n${t("empanelForm.submitFailedCallUs")}`, "error");
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
            color: "var(--wc-navy)",
            marginBottom: "8px",
          }}
        >
          {t("empanelForm.doneTitle")}
        </h3>
        <p
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "15px",
            color: "var(--wc-muted)",
            marginBottom: "6px",
          }}
        >
          {t("empanelForm.doneThankYou", { hospitalName: form.hospital_name })}
        </p>
        <p
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "13px",
            color: "#6b7688",
            marginBottom: "24px",
          }}
        >
          {t("empanelForm.doneConfirmation", { email: form.email })}
        </p>
        <button
          onClick={() => {
            setDone(false);
            setForm(INIT);
            setStep(1);
          }}
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--wc-green)",
            background: "transparent",
            border: "1.5px solid var(--wc-green)",
            padding: "10px 22px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {t("empanelForm.submitAnother")}
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
      {[
        t("empanelForm.stepBasicInfo"),
        t("empanelForm.stepHospitalDetails"),
        t("empanelForm.stepTierInfo"),
        t("empanelForm.stepReview"),
      ].map(
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
                fontFamily: "'Inter',sans-serif",
                background:
                  step > i + 1
                    ? "var(--wc-green)"
                    : step === i + 1
                      ? "var(--wc-navy)"
                      : "var(--wc-border)",
                color: step >= i + 1 ? "#fff" : "#6b7688",
              }}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "11px",
                fontWeight: "600",
                color:
                  step === i + 1
                    ? "var(--wc-navy)"
                    : step > i + 1
                      ? "var(--wc-green)"
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
                  background: step > i + 1 ? "var(--wc-green)" : "var(--wc-border)",
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
          fontFamily: "'Inter',sans-serif",
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
            <p className="sec-ttl">{t("empanelForm.sectionHospitalInfo")}</p>
            <div
              className="fw2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "13px",
              }}
            >
              <div style={{ gridColumn: "span 2" }}>
                <label className="pw-lbl" htmlFor="public-partnerwithus-hospital-name">{t("empanelForm.lblHospitalName")}</label>
                <input id="public-partnerwithus-hospital-name"
                  {...ip("hospital_name")}
                  placeholder={t("empanelForm.phHospitalName")}
                />
                <Err k="hospital_name" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-registration-number">{t("empanelForm.lblRegNumber")}</label>
                <input id="public-partnerwithus-registration-number"
                  {...ip("reg_number")}
                  placeholder={t("empanelForm.phRegNumber")}
                />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-year-established">{t("empanelForm.lblYearEst")}</label>
                <input id="public-partnerwithus-year-established"
                  {...ip("year_est")}
                  placeholder={t("empanelForm.phYearEst")}
                  type="number" onWheel={e=>e.currentTarget.blur()}
                />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-hospital-type">{t("empanelForm.lblHospitalType")}</label>
                <select id="public-partnerwithus-hospital-type" {...ip("hospital_type")}>
                  <option value="">{t("empanelForm.selectType")}</option>
                  {HOSPITAL_TYPES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-ownership-type">{t("empanelForm.lblOwnership")}</label>
                <select id="public-partnerwithus-ownership-type" {...ip("ownership")}>
                  <option value="">{t("empanelForm.select")}</option>
                  {OWNERSHIP_TYPES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-website">{t("empanelForm.lblWebsite")}</label>
                <input id="public-partnerwithus-website"
                  {...ip("website")}
                  placeholder={t("empanelForm.phWebsite")}
                  type="url"
                />
              </div>
            </div>
            <p className="sec-ttl">{t("empanelForm.sectionContactDetails")}</p>
            <div
              className="fw2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "13px",
              }}
            >
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-contact-person">{t("empanelForm.lblContactPerson")}</label>
                <input id="public-partnerwithus-contact-person" {...ip("contact_person")} placeholder={t("empanelForm.phFullName")} />
                <Err k="contact_person" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-designation">{t("empanelForm.lblDesignation")}</label>
                <input id="public-partnerwithus-designation"
                  {...ip("designation")}
                  placeholder={t("empanelForm.phDesignation")}
                />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-official-email">{t("empanelForm.lblOfficialEmail")}</label>
                <input id="public-partnerwithus-official-email"
                  {...ip("email")}
                  placeholder={t("empanelForm.phOfficialEmail")}
                  type="email"
                />
                <Err k="email" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-mobile">{t("empanelForm.lblMobile")}</label>
                <input id="public-partnerwithus-mobile"
                  {...ip("mobile")}
                  placeholder={t("empanelForm.phMobile")}
                  type="tel"
                />
                <Err k="mobile" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-alternate-mobile">{t("empanelForm.lblAltMobile")}</label>
                <input id="public-partnerwithus-alternate-mobile"
                  {...ip("alt_mobile")}
                  placeholder={t("empanelForm.phMobile")}
                  type="tel"
                />
              </div>
            </div>
            <p className="sec-ttl">{t("empanelForm.sectionLocation")}</p>
            <div
              className="fw3"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "13px",
              }}
            >
              <div style={{ gridColumn: "span 3" }}>
                <label className="pw-lbl" htmlFor="public-partnerwithus-full-address">{t("empanelForm.lblFullAddress")}</label>
                <textarea id="public-partnerwithus-full-address"
                  {...ip("address")}
                  rows={2}
                  style={{ resize: "vertical" }}
                  placeholder={t("empanelForm.phFullAddress")}
                />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-city">{t("empanelForm.lblCity")}</label>
                <input id="public-partnerwithus-city" {...ip("city")} placeholder={t("empanelForm.phCity")} />
                <Err k="city" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-district">{t("empanelForm.lblDistrict")}</label>
                <input id="public-partnerwithus-district" {...ip("district")} placeholder={t("empanelForm.phDistrict")} />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-state">{t("empanelForm.lblState")}</label>
                <select id="public-partnerwithus-state" {...ip("state")}>
                  <option value="">{t("empanelForm.selectState")}</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Err k="state" />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-pincode">{t("empanelForm.lblPincode")}</label>
                <input id="public-partnerwithus-pincode" {...ip("pincode")} placeholder="600017" maxLength={6} />
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-country">{t("empanelForm.lblCountry")}</label>
                <input id="public-partnerwithus-country" {...ip("country")} placeholder="India" />
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <p className="sec-ttl">{t("empanelForm.sectionCapacityWorkforce")}</p>
            <div
              className="fw2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "13px",
              }}
            >
              {[
                ["beds", t("empanelForm.lblBeds"), t("empanelForm.phBeds")],
                ["icu_beds", t("empanelForm.lblIcuBeds"), t("empanelForm.phIcuBeds")],
                ["doctors", t("empanelForm.lblDoctors"), t("empanelForm.phDoctors")],
                ["nurses", t("empanelForm.lblNurses"), t("empanelForm.phNurses")],
                ["annual_patients", t("empanelForm.lblAnnualPatients"), t("empanelForm.phAnnualPatients")],
                ["occupancy", t("empanelForm.lblOccupancy"), t("empanelForm.phOccupancy")],
              ].map(([k, lbl, ph]) => (
                <div key={k}>
                  <label className="pw-lbl" htmlFor={`public-partnerwithus-capacity-${k}`}>{lbl}</label>
                  <input id={`public-partnerwithus-capacity-${k}`} {...ip(k)} placeholder={ph} type="number" onWheel={e=>e.currentTarget.blur()} />
                  <Err k={k} />
                </div>
              ))}
            </div>
            <div>
              <p className="sec-ttl">{t("empanelForm.sectionSpecialtiesAvailable")}</p>
              <Chips
                options={SPECS}
                selected={form.specialties}
                onChange={(v) => set("specialties", v)}
              />
              <Err k="specialties" />
            </div>
            <div>
              <p className="sec-ttl">{t("empanelForm.sectionInfrastructure")}</p>
              <Chips
                options={INFRA}
                selected={form.infrastructure}
                onChange={(v) => set("infrastructure", v)}
              />
            </div>
            <div>
              <p className="sec-ttl">{t("empanelForm.sectionAccreditations")}</p>
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
                <label className="pw-lbl" htmlFor="public-partnerwithus-insurance-empanelled">{t("empanelForm.lblInsuranceStatus")}</label>
                <select id="public-partnerwithus-insurance-empanelled"
                  value={form.ins_status}
                  onChange={(e) => set("ins_status", e.target.value)}
                  className="pw-inp"
                >
                  <option value="">{t("empanelForm.select")}</option>
                  <option value="yes">{t("empanelForm.optYes")}</option>
                  <option value="no">{t("empanelForm.optNo")}</option>
                  <option value="partial">{t("empanelForm.optPartially")}</option>
                </select>
              </div>
              <div>
                <label className="pw-lbl" htmlFor="public-partnerwithus-insurance-companies">{t("empanelForm.lblInsuranceCompanies")}</label>
                <input id="public-partnerwithus-insurance-companies"
                  value={form.ins_list}
                  onChange={(e) => set("ins_list", e.target.value)}
                  className="pw-inp"
                  placeholder={t("empanelForm.phInsuranceCompanies")}
                />
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <p className="sec-ttl">{t("empanelForm.sectionSelectTier")}</p>
            <div
              className="tier-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "14px",
              }}
            >
              {tiers.map(
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
                          fontFamily: "'Inter',sans-serif",
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
                              fontFamily: "'Manrope',sans-serif",
                              fontSize: "15px",
                              fontWeight: "700",
                              color: "var(--wc-navy)",
                              margin: 0,
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontFamily: "'Inter',sans-serif",
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
                            fontFamily: "'Inter',sans-serif",
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
              <label className="pw-lbl" htmlFor="public-partnerwithus-about-your-hospital">{t("empanelForm.lblAboutHospital")}</label>
              <textarea id="public-partnerwithus-about-your-hospital"
                value={form.about}
                onChange={(e) => set("about", e.target.value)}
                className="pw-inp"
                rows={4}
                style={{ resize: "vertical" }}
                placeholder={t("empanelForm.phAboutHospital")}
              />
              <p
                style={{
                  fontFamily: "'Inter',sans-serif",
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
              <label className="pw-lbl" htmlFor="public-partnerwithus-key-specialists-optional">{t("empanelForm.lblKeySpecialists")} <span style={{fontWeight:400,color:"#6b7688"}}>{t("empanelForm.optional")}</span></label>
              {form.key_specialists.map((sp, idx) => (
                <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr auto",gap:"8px",marginBottom:"8px"}}>
                  <input id="public-partnerwithus-key-specialists-optional" className="pw-inp" placeholder={t("empanelForm.phSpecialistName")} value={sp.name||""}
                    onChange={e=>{
                      const list=[...form.key_specialists]; list[idx]={...list[idx],name:e.target.value}; set("key_specialists",list);
                    }}/>
                  <input className="pw-inp" placeholder={t("empanelForm.phSpecialistQualification")} value={sp.qualification||""}
                    onChange={e=>{
                      const list=[...form.key_specialists]; list[idx]={...list[idx],qualification:e.target.value}; set("key_specialists",list);
                    }}/>
                  <input className="pw-inp" placeholder={t("empanelForm.phSpecialistDepartment")} value={sp.department||""}
                    onChange={e=>{
                      const list=[...form.key_specialists]; list[idx]={...list[idx],department:e.target.value}; set("key_specialists",list);
                    }}/>
                  <input className="pw-inp" placeholder={t("empanelForm.phSpecialistYears")} value={sp.years_of_experience||""}
                    onChange={e=>{
                      const list=[...form.key_specialists]; list[idx]={...list[idx],years_of_experience:e.target.value}; set("key_specialists",list);
                    }}/>
                  <button type="button" onClick={()=>set("key_specialists", form.key_specialists.filter((_,i)=>i!==idx))}
                    style={{background:"#fef2f2",border:"none",color:"#991b1b",borderRadius:"7px",cursor:"pointer",fontSize:"15px"}}>×</button>
                </div>
              ))}
              <button type="button"
                onClick={()=>set("key_specialists",[...form.key_specialists,{name:"",qualification:"",department:"",years_of_experience:""}])}
                style={{background:"var(--wc-sage)",border:"1px dashed #86efac",color:"#15803d",borderRadius:"8px",
                  padding:"8px 14px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:"12.5px",cursor:"pointer"}}>
                {t("empanelForm.addSpecialist")}
              </button>
            </div>

            {/* International Patient Services */}
            <div>
              <p className="pw-lbl">{t("empanelForm.lblInternationalServices")}</p>
              <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"#374151",marginBottom:"10px"}}>
                <input type="checkbox" checked={form.treats_international} onChange={e=>set("treats_international",e.target.checked)}/>
                {t("empanelForm.cbTreatsInternational")}
              </label>
              {form.treats_international && (
                <div style={{display:"flex",flexDirection:"column",gap:"10px",paddingLeft:"4px"}}>
                  <input className="pw-inp" placeholder={t("empanelForm.phInterpreterLanguages")}
                    value={form.interpreter_languages} onChange={e=>set("interpreter_languages",e.target.value)}/>
                  <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"#374151"}}>
                    <input type="checkbox" checked={form.visa_assistance} onChange={e=>set("visa_assistance",e.target.checked)}/>
                    {t("empanelForm.cbVisaAssistance")}
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"#374151"}}>
                    <input type="checkbox" checked={form.accommodation_assistance} onChange={e=>set("accommodation_assistance",e.target.checked)}/>
                    {t("empanelForm.cbAccommodationAssistance")}
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
            <p className="sec-ttl">{t("empanelForm.sectionApplicationSummary")}</p>
            {[
              {
                title: t("empanelForm.summaryHospital"),
                fields: [
                  [t("empanelForm.summaryName"), form.hospital_name],
                  [t("empanelForm.summaryType"), form.hospital_type],
                  [t("empanelForm.summaryCity"), form.city],
                  [t("empanelForm.summaryState"), form.state],
                ],
              },
              {
                title: t("empanelForm.summaryContact"),
                fields: [
                  [t("empanelForm.summaryPerson"), form.contact_person],
                  [t("empanelForm.summaryEmail"), form.email],
                  [t("empanelForm.summaryMobile"), form.mobile],
                  [t("empanelForm.summaryBeds"), form.beds],
                ],
              },
            ].map(({ title, fields }) => (
              <div
                key={title}
                style={{
                  background: "var(--wc-warm-white)",
                  border: "1px solid var(--wc-border)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--wc-navy)",
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
                          fontFamily: "'Inter',sans-serif",
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
                          fontFamily: "'Inter',sans-serif",
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
                  background: "var(--wc-sage)",
                  border: "1px solid #86efac",
                  borderRadius: "10px",
                  padding: "13px 16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--wc-green)",
                    marginBottom: "7px",
                  }}
                >
                  {t("empanelForm.selectedSpecialties", { count: form.specialties.length })}
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
                        fontFamily: "'Inter',sans-serif",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Declaration */}
            <div style={{background:"var(--wc-warm-white)",border:"1px solid var(--wc-border)",borderRadius:"10px",padding:"16px"}}>
              <p className="sec-ttl" style={{marginBottom:"10px"}}>{t("empanelForm.sectionDeclaration")}</p>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",color:"var(--wc-muted)",lineHeight:1.7,marginBottom:"12px"}}>
                {t("empanelForm.declarationText")}
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
                <div>
                  <label className="pw-lbl" htmlFor="public-partnerwithus-name">{t("empanelForm.lblDeclarationName")}</label>
                  <input id="public-partnerwithus-name" className={`pw-inp${err.declaration_name?" err":""}`} placeholder={t("empanelForm.phFullName")}
                    value={form.declaration_name} onChange={e=>set("declaration_name",e.target.value)}/>
                  <Err k="declaration_name" />
                </div>
                <div>
                  <label className="pw-lbl" htmlFor="public-partnerwithus-designation-2">{t("empanelForm.lblDeclarationDesignation")}</label>
                  <input id="public-partnerwithus-designation-2" className="pw-inp" placeholder={t("empanelForm.phDeclarationDesignation")}
                    value={form.declaration_designation} onChange={e=>set("declaration_designation",e.target.value)}/>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"flex-start",gap:"11px"}}>
                <input type="checkbox" id="declaration_confirmed" checked={form.declaration_confirmed}
                  onChange={e=>set("declaration_confirmed",e.target.checked)}
                  style={{marginTop:"2px",width:"15px",height:"15px",flexShrink:0,cursor:"pointer"}}/>
                <label htmlFor="declaration_confirmed" style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"#374151",cursor:"pointer"}}>
                  {t("empanelForm.declarationConfirm")}
                </label>
              </div>
              <Err k="declaration_confirmed" />
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",color:"#6b7688",marginTop:"8px"}}>
                {t("empanelForm.declarationDateNote")}
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
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "13px",
                    color: "#374151",
                    lineHeight: "1.7",
                    cursor: "pointer",
                  }}
                >
                  {t("empanelForm.agreeText")}{" "}
                  <Link
                    to="/terms"
                    style={{ color: "var(--wc-green)", fontWeight: "600" }}
                  >
                    {t("empanelForm.termsConditions")}
                  </Link>{" "}
                  {t("empanelForm.and")}{" "}
                  <Link
                    to="/privacy"
                    style={{ color: "var(--wc-green)", fontWeight: "600" }}
                  >
                    {t("empanelForm.privacyPolicy")}
                  </Link>{" "}
                  {t("empanelForm.agreeTextEnd")}
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
                border: "1.5px solid var(--wc-border)",
                background: "#fff",
                color: "var(--wc-muted)",
                fontFamily: "'Inter',sans-serif",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--wc-green)";
                e.currentTarget.style.color = "var(--wc-green)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--wc-border)";
                e.currentTarget.style.color = "var(--wc-muted)";
              }}
            >
              {t("empanelForm.previous")}
            </button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <button type="button" onClick={next} className="btn-p">
              {t("empanelForm.continue")}{" "}
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
                  {t("empanelForm.submitting")}
                </>
              ) : (
                t("empanelForm.submitApplication")
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
