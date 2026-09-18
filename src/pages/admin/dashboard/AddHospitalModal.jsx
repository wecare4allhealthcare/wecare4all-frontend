import { useState, useRef } from "react";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API } from "./shared";
import { showToast } from "../../../components/Toast";

/**
 * AddHospitalModal.jsx — Aug 2026, client request.
 *
 * "Hospitals are there but they individually not added them details" —
 * hospitals the client already has a relationship with, added straight
 * from the admin panel instead of waiting for them to submit the public
 * empanelment form themselves.
 *
 * Client follow-up: wants the SAME fields as the public empanelment
 * form (EmpanelForm.jsx), not a reduced set — every field below mirrors
 * that form's INIT state 1:1, including the logo upload added
 * alongside it. This posts to POST /admin/hospitals, which inserts into
 * hospital_empanelment itself (status="approved") and runs it through
 * the same _ensure_hospital_partner() path an approved application
 * takes — so a hospital added here is indistinguishable from one that
 * applied themselves and got approved, right down to which fields were
 * captured.
 */
const HOSPITAL_TYPES = ["Multi-Speciality","Super-Speciality","General Hospital","Speciality Clinic",
  "Nursing Home","Day Care","Diagnostic Centre","Maternity","Dental","Rehabilitation","Ayurvedic/AYUSH","Others"];
const OWNERSHIP_TYPES = ["Private","Trust/NGO","Government","PPP","Corporate Chain","Others"];

const emptySpecialist = { name: "", qualification: "", department: "", years_of_experience: "" };

const INIT = {
  hospital_name: "", reg_number: "", year_est: "", hospital_type: "", ownership: "", website: "",
  logo_url: "",
  photos: [], banners: [], videos: [], doctor_interviews: [],
  contact_person: "", designation: "", email: "", mobile: "", alt_mobile: "",
  address: "", city: "", district: "", state: "", pincode: "", country: "India",
  beds: "", icu_beds: "", doctors: "", nurses: "", annual_patients: "", occupancy: "",
  specialties: "", infrastructure: "", accreditations: "",
  ins_status: "", ins_list: "",
  tier: "basic", about: "",
  key_specialists: [],
  treats_international: false, interpreter_languages: "", visa_assistance: false, accommodation_assistance: false,
  declaration_name: "", declaration_designation: "", declaration_confirmed: false,
};

export default function AddHospitalModal({ token, onClose, onSaved }) {
  const [form, setForm] = useState(INIT);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  // Sep 2026 — one busy-flag per media kind, same reasoning as
  // EditHospitalModal.jsx: uploading a video shouldn't grey out the
  // unrelated photos/banners buttons.
  const [uploadingMedia, setUploadingMedia] = useState({});
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toArr = (s) => s.split(",").map(x => x.trim()).filter(Boolean);

  const uploadLogo = async (file) => {
    if (!file) return;
    setUploadingLogo(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/admin/hospitals/upload-logo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Couldn't upload the logo — please try a different image."); return; }
      set("logo_url", json.url);
    } catch { setErr("Network error while uploading — please try again."); }
    finally { setUploadingLogo(false); }
  };

  // ── Photos / Banners / Videos / Doctor Interviews ──────────────
  // Sep 2026, client request: "admin need if he add the hospital from
  // admin dashboard there need profile, banner and promotional video
  // add option like hospital dashboard". No hospital_id exists yet at
  // this point, so each upload just stores the file and returns its
  // URL (POST /admin/hospitals/upload-photo|banner|video|interview,
  // mirroring the logo upload just above) — the URLs collected here
  // are sent as photos/banners/videos/doctor_interviews on the final
  // POST /admin/hospitals call, and _ensure_hospital_partner (admin.py)
  // writes them straight onto the new hospital_partners row. The
  // hospital sees all of it the very first time they log in.
  const MEDIA = {
    photos:     { uploadPath: "upload-photo",     formKey: "photos",            accept: "image/png,image/jpeg,image/webp", isVideo: false },
    banners:    { uploadPath: "upload-banner",    formKey: "banners",           accept: "image/png,image/jpeg,image/webp", isVideo: false },
    videos:     { uploadPath: "upload-video",     formKey: "videos",            accept: "video/mp4,video/webm,video/quicktime", isVideo: true },
    interviews: { uploadPath: "upload-interview", formKey: "doctor_interviews", accept: "video/mp4,video/webm,video/quicktime", isVideo: true },
  };

  const uploadMedia = async (kind, file) => {
    if (!file) return;
    const cfg = MEDIA[kind];
    setUploadingMedia(p => ({ ...p, [kind]: true })); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/admin/hospitals/${cfg.uploadPath}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Couldn't upload the file — please try a different one."); return; }
      const entry = cfg.isVideo ? { url: json.url, title: json.title || file.name } : json.url;
      setForm(p => ({ ...p, [cfg.formKey]: [...p[cfg.formKey], entry] }));
    } catch { setErr("Network error while uploading — please try again."); }
    finally { setUploadingMedia(p => ({ ...p, [kind]: false })); }
  };

  const removeMedia = (kind, idx) => {
    const cfg = MEDIA[kind];
    setForm(p => ({ ...p, [cfg.formKey]: p[cfg.formKey].filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr("");
    if (!form.hospital_name.trim())  { setErr("Hospital name is required."); return; }
    if (!form.contact_person.trim()) { setErr("Contact person is required."); return; }
    if (!form.email.trim())          { setErr("Email is required."); return; }
    if (!form.mobile.trim())         { setErr("Mobile is required."); return; }
    if (!form.city.trim())           { setErr("City is required."); return; }
    if (!form.state.trim())          { setErr("State is required."); return; }
    if (!form.declaration_name.trim()) { setErr("Declaration name is required."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/hospitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          hospital_name: form.hospital_name.trim(),
          reg_number: form.reg_number, year_est: form.year_est,
          hospital_type: form.hospital_type, ownership: form.ownership, website: form.website,
          logo_url: form.logo_url || null,
          photos: form.photos, banners: form.banners, videos: form.videos,
          doctor_interviews: form.doctor_interviews,
          contact_person: form.contact_person.trim(), designation: form.designation,
          email: form.email.trim(), mobile: form.mobile.trim(), alt_mobile: form.alt_mobile,
          address: form.address, city: form.city, district: form.district,
          state: form.state, pincode: form.pincode, country: form.country || "India",
          beds: form.beds, icu_beds: form.icu_beds, doctors: form.doctors,
          nurses: form.nurses, annual_patients: form.annual_patients, occupancy: form.occupancy,
          specialties: toArr(form.specialties), infrastructure: toArr(form.infrastructure),
          accreditations: toArr(form.accreditations),
          ins_status: form.ins_status, ins_list: form.ins_list,
          tier: form.tier, about: form.about,
          key_specialists: form.key_specialists.filter(s => s.name.trim()),
          treats_international: form.treats_international,
          interpreter_languages: form.interpreter_languages,
          visa_assistance: form.visa_assistance,
          accommodation_assistance: form.accommodation_assistance,
          declaration_name: form.declaration_name.trim(),
          declaration_designation: form.declaration_designation,
          declaration_confirmed: form.declaration_confirmed,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Couldn't add this hospital."); return; }
      setResult(json);
      showToast("Hospital added.", "success");
      onSaved?.();
    } catch { setErr("Network error — please try again."); }
    finally { setLoading(false); }
  };

  const inp = { width: "100%", border: "1.5px solid var(--wc-border)", borderRadius: "9px", padding: "9px 12px",
    fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "#1e293b", background: "var(--wc-warm-white)",
    outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: "600",
    color: "#374151", marginBottom: "5px" };
  const section = { fontFamily: "'Manrope',sans-serif", fontSize: "13.5px", fontWeight: "700",
    color: "var(--wc-navy)", margin: "22px 0 12px", paddingBottom: "6px", borderBottom: "1.5px solid var(--wc-border)" };
  const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" };
  const row3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" };

  // Shared renderer for the Photos/Banners/Videos/Interviews sections
  // — same pattern as EditHospitalModal.jsx's version, adapted for
  // index-based removal since these are plain local-state arrays here
  // (no hospital_id to call a remove endpoint against yet).
  const renderMediaSection = (kind, title, thumbLabel) => {
    const cfg = MEDIA[kind];
    const items = form[cfg.formKey];
    const busy = !!uploadingMedia[kind];
    return (
      <div style={{ marginBottom: "6px" }}>
        <label style={lbl}>{title} <span style={{ fontWeight: 400, color: "var(--wc-muted)" }}>({items.length})</span></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
          {items.map((item, i) => {
            const url = typeof item === "string" ? item : item.url;
            return (
              <div key={url + i} style={{ position: "relative", width: "72px", height: "72px" }}>
                {cfg.isVideo ? (
                  <div style={{ width: "100%", height: "100%", borderRadius: "9px", border: "1.5px solid var(--wc-border)",
                    background: "var(--wc-navy)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "20px" }}>▶️</span>
                  </div>
                ) : (
                  <img src={url} alt="" style={{ width: "100%", height: "100%", borderRadius: "9px",
                    objectFit: "cover", border: "1.5px solid var(--wc-border)" }} />
                )}
                <button type="button" onClick={() => removeMedia(kind, i)}
                  title={`Remove ${thumbLabel}`}
                  style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px",
                    borderRadius: "50%", border: "none", background: "#fef2f2", color: "#991b1b",
                    cursor: "pointer", fontSize: "12px", lineHeight: "20px", padding: 0 }}>×</button>
              </div>
            );
          })}
          <label style={{ width: "72px", height: "72px", cursor: busy ? "not-allowed" : "pointer",
            borderRadius: "9px", border: "1.5px dashed #cbd5e1", background: "var(--wc-warm-white)",
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            fontSize: "10.5px", fontWeight: 600, color: "var(--wc-muted)", textAlign: "center", gap: "2px" }}>
            <span style={{ fontSize: "16px" }}>{busy ? "…" : "+"}</span>
            {busy ? "Uploading" : `Add ${thumbLabel}`}
            <input type="file" accept={cfg.accept} disabled={busy} style={{ display: "none" }}
              onChange={e => { uploadMedia(kind, e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(18,59,74,.5)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflowY: "auto" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="Add Hospital"
        style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "680px",
        boxShadow: "0 20px 60px rgba(18,59,74,.2)", maxHeight: "92vh", overflowY: "auto" }}>

        {result ? (
          <>
            <h3 style={{ fontFamily: "'Manrope',sans-serif", fontSize: "20px", fontWeight: "700",
              color: "var(--wc-navy)", margin: "0 0 14px" }}>Hospital Added ✅</h3>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "#374151", lineHeight: 1.6 }}>
              <strong>{form.hospital_name}</strong> has been added and can now log in to their hospital dashboard.
            </p>
            {result.credentials_emailed ? (
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#15803d",
                background: "#dcfce7", borderRadius: "9px", padding: "10px 12px", marginTop: "12px" }}>
                Login credentials were emailed to {result.hospital_email}.
              </p>
            ) : (
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#92400e",
                background: "#fffbeb", borderRadius: "9px", padding: "10px 12px", marginTop: "12px" }}>
                Login credentials couldn't be emailed automatically — use "Reset Password" from the
                hospital list once you've confirmed their email, or share the login link and a
                password with them directly.
              </p>
            )}
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", color: "var(--wc-muted)", marginTop: "10px" }}>
              Login page: {result.login_link}
            </p>
            <button onClick={onClose} style={{ marginTop: "20px", width: "100%", padding: "11px", borderRadius: "9px",
              border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
              color: "#fff", fontFamily: "'Inter',sans-serif", fontWeight: "700", fontSize: "13.5px" }}>
              Done
            </button>
          </>
        ) : (
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontFamily: "'Manrope',sans-serif", fontSize: "20px", fontWeight: "700",
            color: "var(--wc-navy)", margin: "0 0 4px" }}>Add Hospital</h3>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "var(--wc-muted)", margin: "0 0 4px" }}>
            Same fields as the public "Partner With Us" empanelment form — adds this hospital directly,
            already approved. Login credentials are emailed automatically.
          </p>

          <p style={section}>Hospital Details</p>
          <label style={lbl} htmlFor="ah-name">Hospital Name *</label>
          <input id="ah-name" style={{ ...inp, marginBottom: "12px" }} value={form.hospital_name}
            onChange={e => set("hospital_name", e.target.value)} placeholder="e.g. Apollo Speciality Hospital" />
          <div style={row3}>
            <div>
              <label style={lbl} htmlFor="ah-reg">Registration Number</label>
              <input id="ah-reg" style={inp} value={form.reg_number} onChange={e => set("reg_number", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-year">Year Established</label>
              <input id="ah-year" style={inp} value={form.year_est} onChange={e => set("year_est", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-website">Website</label>
              <input id="ah-website" style={inp} value={form.website} onChange={e => set("website", e.target.value)} />
            </div>
          </div>
          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="ah-type">Hospital Type</label>
              <select id="ah-type" style={inp} value={form.hospital_type} onChange={e => set("hospital_type", e.target.value)}>
                <option value="">Select…</option>
                {HOSPITAL_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl} htmlFor="ah-ownership">Ownership</label>
              <select id="ah-ownership" style={inp} value={form.ownership} onChange={e => set("ownership", e.target.value)}>
                <option value="">Select…</option>
                {OWNERSHIP_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <label style={lbl} htmlFor="ah-logo">Hospital Logo (optional)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            {form.logo_url ? (
              <img src={form.logo_url} alt="" style={{ width: "48px", height: "48px", borderRadius: "10px",
                objectFit: "contain", border: "1.5px solid var(--wc-border)", background: "#fff" }} />
            ) : (
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", flexShrink: 0,
                background: "var(--wc-warm-white)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", border: "1.5px solid var(--wc-border)" }}>🏥</div>
            )}
            <label style={{ flex: 1, cursor: uploadingLogo ? "not-allowed" : "pointer",
              padding: "10px 12px", borderRadius: "8px", border: "1.5px dashed #cbd5e1",
              background: "var(--wc-warm-white)", textAlign: "center", fontSize: "12.5px", fontWeight: 600, color: "var(--wc-muted)" }}>
              {uploadingLogo ? "Uploading…" : form.logo_url ? "Replace logo" : "Choose logo"}
              <input id="ah-logo" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                disabled={uploadingLogo} style={{ display: "none" }}
                onChange={e => uploadLogo(e.target.files?.[0])} />
            </label>
          </div>

          {/* Sep 2026 — "admin need if he add the hospital from admin
              dashboard there need profile, banner and promotional
              video add option like hospital dashboard": collected here
              before the hospital exists, sent along with the rest of
              this form on submit, and already sitting on the
              hospital's own dashboard the first time they log in. */}
          <label style={lbl}>Media (optional)</label>
          {/* Sep 2026 follow-up: horizontal layout — 4 columns side by
              side instead of stacked, so this section doesn't run so
              long down the form. Wraps to 2 columns on narrow screens
              since the modal itself is responsive. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "12px" }}>
            {renderMediaSection("photos", "Profile Photos", "photo")}
            {renderMediaSection("banners", "Promotional Banners", "banner")}
            {renderMediaSection("videos", "Promotional Videos", "video")}
            {renderMediaSection("interviews", "Doctor Interviews", "interview")}
          </div>

          <p style={section}>Contact</p>
          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="ah-contact">Contact Person *</label>
              <input id="ah-contact" style={inp} value={form.contact_person} onChange={e => set("contact_person", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-designation">Designation</label>
              <input id="ah-designation" style={inp} value={form.designation} onChange={e => set("designation", e.target.value)}
                placeholder="e.g. Administrator" />
            </div>
          </div>
          <div style={row3}>
            <div>
              <label style={lbl} htmlFor="ah-email">Email *</label>
              <input id="ah-email" type="email" style={inp} value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-mobile">Mobile *</label>
              <input id="ah-mobile" style={inp} value={form.mobile} onChange={e => set("mobile", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-alt-mobile">Alt. Mobile</label>
              <input id="ah-alt-mobile" style={inp} value={form.alt_mobile} onChange={e => set("alt_mobile", e.target.value)} />
            </div>
          </div>

          <p style={section}>Location</p>
          <label style={lbl} htmlFor="ah-address">Address</label>
          <input id="ah-address" style={{ ...inp, marginBottom: "12px" }} value={form.address} onChange={e => set("address", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label style={lbl} htmlFor="ah-city">City *</label>
              <input id="ah-city" style={inp} value={form.city} onChange={e => set("city", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-district">District</label>
              <input id="ah-district" style={inp} value={form.district} onChange={e => set("district", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-state">State *</label>
              <input id="ah-state" style={inp} value={form.state} onChange={e => set("state", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-pincode">Pincode</label>
              <input id="ah-pincode" style={inp} value={form.pincode} onChange={e => set("pincode", e.target.value)} maxLength={6} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-country">Country</label>
              <input id="ah-country" style={inp} value={form.country} onChange={e => set("country", e.target.value)} />
            </div>
          </div>

          <p style={section}>Capacity</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
            <div>
              <label style={lbl} htmlFor="ah-beds">Beds</label>
              <input id="ah-beds" type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={form.beds} onChange={e => set("beds", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-icu">ICU Beds</label>
              <input id="ah-icu" type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={form.icu_beds} onChange={e => set("icu_beds", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-doctors">Doctors</label>
              <input id="ah-doctors" type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={form.doctors} onChange={e => set("doctors", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-nurses">Nurses</label>
              <input id="ah-nurses" type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={form.nurses} onChange={e => set("nurses", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-annual">Annual Patients</label>
              <input id="ah-annual" type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={form.annual_patients} onChange={e => set("annual_patients", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-occupancy">Avg. Occupancy</label>
              <input id="ah-occupancy" style={inp} value={form.occupancy} onChange={e => set("occupancy", e.target.value)} placeholder="e.g. 75%" />
            </div>
          </div>

          <p style={section}>Specialties, Infrastructure &amp; Accreditations</p>
          <label style={lbl} htmlFor="ah-specialties">Specialties (comma-separated)</label>
          <input id="ah-specialties" style={{ ...inp, marginBottom: "12px" }} value={form.specialties}
            onChange={e => set("specialties", e.target.value)} placeholder="Cardiology, Orthopedics, ICU" />
          <label style={lbl} htmlFor="ah-infra">Infrastructure (comma-separated)</label>
          <input id="ah-infra" style={{ ...inp, marginBottom: "12px" }} value={form.infrastructure}
            onChange={e => set("infrastructure", e.target.value)} placeholder="ICU, Blood Bank, 24x7 Pharmacy" />
          <label style={lbl} htmlFor="ah-accred">Accreditations (comma-separated)</label>
          <input id="ah-accred" style={{ ...inp, marginBottom: "12px" }} value={form.accreditations}
            onChange={e => set("accreditations", e.target.value)} placeholder="NABH, NABL" />

          <p style={section}>Insurance</p>
          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="ah-ins-status">Insurance Empanelled?</label>
              <select id="ah-ins-status" style={inp} value={form.ins_status} onChange={e => set("ins_status", e.target.value)}>
                <option value="">Select…</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="partial">Partially</option>
              </select>
            </div>
            <div>
              <label style={lbl} htmlFor="ah-ins-list">Insurance Companies</label>
              <input id="ah-ins-list" style={inp} value={form.ins_list} onChange={e => set("ins_list", e.target.value)} />
            </div>
          </div>

          <p style={section}>Tier &amp; About</p>
          <label style={lbl} htmlFor="ah-tier">Partnership Tier</label>
          <select id="ah-tier" style={{ ...inp, marginBottom: "12px" }} value={form.tier} onChange={e => set("tier", e.target.value)}>
            <option value="basic">Basic</option>
            <option value="growth">Growth</option>
            <option value="strategic">Strategic</option>
          </select>
          <label style={lbl} htmlFor="ah-about">About Hospital</label>
          <textarea id="ah-about" rows={3} maxLength={1000} style={{ ...inp, marginBottom: "12px", resize: "vertical", fontFamily: "'Inter',sans-serif" }}
            value={form.about} onChange={e => set("about", e.target.value)} />

          <p style={section}>Key Specialists <span style={{ fontWeight: 400, color: "var(--wc-muted)" }}>(optional)</span></p>
          {form.key_specialists.map((sp, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "8px", marginBottom: "8px" }}>
              <input style={inp} placeholder="Name" value={sp.name}
                onChange={e => { const l = [...form.key_specialists]; l[idx] = { ...l[idx], name: e.target.value }; set("key_specialists", l); }} />
              <input style={inp} placeholder="Qualification" value={sp.qualification}
                onChange={e => { const l = [...form.key_specialists]; l[idx] = { ...l[idx], qualification: e.target.value }; set("key_specialists", l); }} />
              <input style={inp} placeholder="Department" value={sp.department}
                onChange={e => { const l = [...form.key_specialists]; l[idx] = { ...l[idx], department: e.target.value }; set("key_specialists", l); }} />
              <input style={inp} placeholder="Years Exp." value={sp.years_of_experience}
                onChange={e => { const l = [...form.key_specialists]; l[idx] = { ...l[idx], years_of_experience: e.target.value }; set("key_specialists", l); }} />
              <button type="button" onClick={() => set("key_specialists", form.key_specialists.filter((_, i) => i !== idx))}
                style={{ background: "#fef2f2", border: "none", color: "#991b1b", borderRadius: "7px", cursor: "pointer", fontSize: "15px" }}>×</button>
            </div>
          ))}
          <button type="button" onClick={() => set("key_specialists", [...form.key_specialists, { ...emptySpecialist }])}
            style={{ background: "var(--wc-sage,#e6f4ea)", border: "1px dashed #86efac", color: "#15803d", borderRadius: "8px",
              padding: "8px 14px", fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: "12.5px", cursor: "pointer", marginBottom: "12px" }}>
            + Add Specialist
          </button>

          <p style={section}>International Patient Services</p>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter',sans-serif",
            fontSize: "13px", color: "#374151", marginBottom: "10px", cursor: "pointer" }}>
            <input type="checkbox" checked={form.treats_international} onChange={e => set("treats_international", e.target.checked)} />
            Treats international patients
          </label>
          {form.treats_international && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "4px", marginBottom: "12px" }}>
              <input style={inp} placeholder="Interpreter languages available" value={form.interpreter_languages}
                onChange={e => set("interpreter_languages", e.target.value)} />
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
                <input type="checkbox" checked={form.visa_assistance} onChange={e => set("visa_assistance", e.target.checked)} />
                Visa assistance provided
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
                <input type="checkbox" checked={form.accommodation_assistance} onChange={e => set("accommodation_assistance", e.target.checked)} />
                Accommodation assistance provided
              </label>
            </div>
          )}

          <p style={section}>Declaration</p>
          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="ah-decl-name">Declarant Name *</label>
              <input id="ah-decl-name" style={inp} value={form.declaration_name} onChange={e => set("declaration_name", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-decl-designation">Declarant Designation</label>
              <input id="ah-decl-designation" style={inp} value={form.declaration_designation} onChange={e => set("declaration_designation", e.target.value)} />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter',sans-serif",
            fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "18px", cursor: "pointer" }}>
            <input type="checkbox" checked={form.declaration_confirmed} onChange={e => set("declaration_confirmed", e.target.checked)} />
            Declaration confirmed (details are accurate to the best of our knowledge)
          </label>

          {err && <p style={{ color: "#dc2626", fontSize: "12.5px", marginBottom: "12px" }}>❌ {err}</p>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "9px",
              border: "1.5px solid var(--wc-border)", background: "var(--wc-warm-white)", fontFamily: "'Inter',sans-serif",
              fontWeight: "600", fontSize: "13px", color: "var(--wc-muted)", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "10px", borderRadius: "9px", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color: "#fff",
              fontFamily: "'Inter',sans-serif", fontWeight: "700", fontSize: "13px", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Adding…" : "Add Hospital"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
