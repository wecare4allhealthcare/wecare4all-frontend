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
 * empanelment form themselves. Hits the new POST /admin/hospitals,
 * which creates the hospital_partners row directly (empanelment_id
 * stays NULL) with the same temp-password + credentials-email behavior
 * as an approved empanelment application — from the hospital's side,
 * logging in feels identical either way.
 */
const emptyForm = {
  hospital_name: "", contact_person: "", designation: "", email: "", mobile: "",
  address: "", city: "", state: "", pincode: "", website: "",
  bed_count: "", tier: "basic", notes: "",
  specialties: "", accreditations: "", infrastructure: "",
};

export default function AddHospitalModal({ token, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Comma-separated free text → array, same convention as EmpanelForm.jsx
  // uses for these three fields elsewhere in the app — admin typing
  // "Cardiology, Orthopedics, ICU" is far faster than a tag picker for a
  // one-off data-entry form like this.
  const toArr = (s) => s.split(",").map(x => x.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr("");
    if (!form.hospital_name.trim()) { setErr("Hospital name is required."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/hospitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          hospital_name: form.hospital_name.trim(),
          contact_person: form.contact_person || null,
          designation: form.designation || null,
          email: form.email || null,
          mobile: form.mobile || null,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          pincode: form.pincode || null,
          website: form.website || null,
          bed_count: form.bed_count ? parseInt(form.bed_count) : null,
          tier: form.tier,
          notes: form.notes || null,
          specialties: toArr(form.specialties),
          accreditations: toArr(form.accreditations),
          infrastructure: toArr(form.infrastructure),
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
  const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(18,59,74,.5)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", overflowY: "auto" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="Add Hospital"
        style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "560px",
        boxShadow: "0 20px 60px rgba(18,59,74,.2)", maxHeight: "90vh", overflowY: "auto" }}>

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
                No email address was given, so no credentials could be sent — use "Reset Password" from
                the hospital list once you have their email, or share the login link and a password with
                them directly.
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
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "var(--wc-muted)", margin: "0 0 18px" }}>
            Adds this hospital directly, without them submitting the public empanelment form.
            If an email is given, login credentials are sent automatically.
          </p>

          <label style={lbl} htmlFor="ah-name">Hospital Name *</label>
          <input id="ah-name" style={{ ...inp, marginBottom: "12px" }} value={form.hospital_name}
            onChange={e => set("hospital_name", e.target.value)} placeholder="e.g. Apollo Speciality Hospital" />

          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="ah-contact">Contact Person</label>
              <input id="ah-contact" style={inp} value={form.contact_person} onChange={e => set("contact_person", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-designation">Designation</label>
              <input id="ah-designation" style={inp} value={form.designation} onChange={e => set("designation", e.target.value)}
                placeholder="e.g. Administrator" />
            </div>
          </div>

          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="ah-email">Email</label>
              <input id="ah-email" type="email" style={inp} value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-mobile">Mobile</label>
              <input id="ah-mobile" style={inp} value={form.mobile} onChange={e => set("mobile", e.target.value)} />
            </div>
          </div>

          <label style={lbl} htmlFor="ah-address">Address</label>
          <input id="ah-address" style={{ ...inp, marginBottom: "12px" }} value={form.address} onChange={e => set("address", e.target.value)} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={lbl} htmlFor="ah-city">City</label>
              <input id="ah-city" style={inp} value={form.city} onChange={e => set("city", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-state">State</label>
              <input id="ah-state" style={inp} value={form.state} onChange={e => set("state", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-pincode">Pincode</label>
              <input id="ah-pincode" style={inp} value={form.pincode} onChange={e => set("pincode", e.target.value)} />
            </div>
          </div>

          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="ah-website">Website</label>
              <input id="ah-website" style={inp} value={form.website} onChange={e => set("website", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="ah-beds">Bed Count</label>
              <input id="ah-beds" type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={form.bed_count} onChange={e => set("bed_count", e.target.value)} />
            </div>
          </div>

          <label style={lbl} htmlFor="ah-tier">Partnership Tier</label>
          <select id="ah-tier" style={{ ...inp, marginBottom: "12px" }} value={form.tier} onChange={e => set("tier", e.target.value)}>
            <option value="basic">Basic</option>
            <option value="growth">Growth</option>
            <option value="strategic">Strategic</option>
          </select>

          <label style={lbl} htmlFor="ah-specialties">Specialties (comma-separated)</label>
          <input id="ah-specialties" style={{ ...inp, marginBottom: "12px" }} value={form.specialties}
            onChange={e => set("specialties", e.target.value)} placeholder="Cardiology, Orthopedics, ICU" />

          <label style={lbl} htmlFor="ah-accred">Accreditations (comma-separated)</label>
          <input id="ah-accred" style={{ ...inp, marginBottom: "12px" }} value={form.accreditations}
            onChange={e => set("accreditations", e.target.value)} placeholder="NABH, NABL" />

          <label style={lbl} htmlFor="ah-infra">Infrastructure (comma-separated)</label>
          <input id="ah-infra" style={{ ...inp, marginBottom: "12px" }} value={form.infrastructure}
            onChange={e => set("infrastructure", e.target.value)} placeholder="ICU, Blood Bank, 24x7 Pharmacy" />

          <label style={lbl} htmlFor="ah-notes">Notes (internal, not shown to the hospital)</label>
          <textarea id="ah-notes" rows={3} style={{ ...inp, marginBottom: "16px", resize: "vertical", fontFamily: "'Inter',sans-serif" }}
            value={form.notes} onChange={e => set("notes", e.target.value)} />

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
