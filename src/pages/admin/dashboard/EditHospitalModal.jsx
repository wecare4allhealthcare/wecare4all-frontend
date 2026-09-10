import { useState, useEffect, useRef } from "react";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API } from "./shared";
import { showToast } from "../../../components/Toast";

/**
 * EditHospitalModal.jsx — Aug 2026, client request (companion to
 * AddHospitalModal.jsx). Loads the full record via the new
 * GET /admin/hospitals/{id}, edits the same business fields as the
 * Add form, saves via the now-hardened PUT /admin/hospitals/{id}
 * (see UpdateHospitalPartnerRequest in admin.py — that endpoint used to
 * accept a raw untyped dict; this modal is the reason it needed a
 * proper field whitelist, since it's the first caller that edits more
 * than just `tier`).
 */
export default function EditHospitalModal({ token, hospitalId, onClose, onSaved }) {
  const [form, setForm] = useState(null); // null = loading
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toArr = (s) => s.split(",").map(x => x.trim()).filter(Boolean);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/admin/hospitals/${hospitalId}`, { headers: { Authorization: `Bearer ${token}` } });
        const h = await res.json();
        if (!res.ok) { setErr(h.detail || "Couldn't load this hospital."); return; }
        setForm({
          hospital_name: h.hospital_name || "", contact_person: h.contact_person || "",
          designation: h.designation || "", email: h.email || "", mobile: h.mobile || "",
          address: h.address || "", city: h.city || "", state: h.state || "", pincode: h.pincode || "",
          website: h.website || "", bed_count: h.bed_count ?? "", tier: h.tier || "basic",
          notes: h.notes || "", is_active: h.is_active !== false,
          specialties: (h.specialties || []).join(", "),
          accreditations: (h.accreditations || []).join(", "),
          infrastructure: (h.infrastructure || []).join(", "),
        });
      } catch { setErr("Network error — please try again."); }
    })();
  }, [hospitalId]);

  const handleSave = async (e) => {
    e.preventDefault(); setErr("");
    if (!form.hospital_name.trim()) { setErr("Hospital name is required."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/hospitals/${hospitalId}`, {
        method: "PUT",
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
          bed_count: form.bed_count === "" ? null : parseInt(form.bed_count),
          tier: form.tier,
          notes: form.notes || null,
          is_active: form.is_active,
          specialties: toArr(form.specialties),
          accreditations: toArr(form.accreditations),
          infrastructure: toArr(form.infrastructure),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Couldn't save changes."); return; }
      showToast("Hospital updated.", "success");
      onSaved?.();
      onClose();
    } catch { setErr("Network error — please try again."); }
    finally { setSaving(false); }
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
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="Edit Hospital"
        style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "560px",
        boxShadow: "0 20px 60px rgba(18,59,74,.2)", maxHeight: "90vh", overflowY: "auto" }}>

        {form === null ? (
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "var(--wc-muted)", textAlign: "center", padding: "30px 0" }}>
            {err || "Loading…"}
          </p>
        ) : (
        <form onSubmit={handleSave}>
          <h3 style={{ fontFamily: "'Manrope',sans-serif", fontSize: "20px", fontWeight: "700",
            color: "var(--wc-navy)", margin: "0 0 18px" }}>Edit Hospital</h3>

          <label style={lbl} htmlFor="eh-name">Hospital Name *</label>
          <input id="eh-name" style={{ ...inp, marginBottom: "12px" }} value={form.hospital_name}
            onChange={e => set("hospital_name", e.target.value)} />

          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="eh-contact">Contact Person</label>
              <input id="eh-contact" style={inp} value={form.contact_person} onChange={e => set("contact_person", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="eh-designation">Designation</label>
              <input id="eh-designation" style={inp} value={form.designation} onChange={e => set("designation", e.target.value)} />
            </div>
          </div>

          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="eh-email">Email</label>
              <input id="eh-email" type="email" style={inp} value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="eh-mobile">Mobile</label>
              <input id="eh-mobile" style={inp} value={form.mobile} onChange={e => set("mobile", e.target.value)} />
            </div>
          </div>

          <label style={lbl} htmlFor="eh-address">Address</label>
          <input id="eh-address" style={{ ...inp, marginBottom: "12px" }} value={form.address} onChange={e => set("address", e.target.value)} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={lbl} htmlFor="eh-city">City</label>
              <input id="eh-city" style={inp} value={form.city} onChange={e => set("city", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="eh-state">State</label>
              <input id="eh-state" style={inp} value={form.state} onChange={e => set("state", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="eh-pincode">Pincode</label>
              <input id="eh-pincode" style={inp} value={form.pincode} onChange={e => set("pincode", e.target.value)} />
            </div>
          </div>

          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="eh-website">Website</label>
              <input id="eh-website" style={inp} value={form.website} onChange={e => set("website", e.target.value)} />
            </div>
            <div>
              <label style={lbl} htmlFor="eh-beds">Bed Count</label>
              <input id="eh-beds" type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={form.bed_count} onChange={e => set("bed_count", e.target.value)} />
            </div>
          </div>

          <div style={row2}>
            <div>
              <label style={lbl} htmlFor="eh-tier">Partnership Tier</label>
              <select id="eh-tier" style={inp} value={form.tier} onChange={e => set("tier", e.target.value)}>
                <option value="basic">Basic</option>
                <option value="growth">Growth</option>
                <option value="strategic">Strategic</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Inter',sans-serif",
                fontSize: "13px", fontWeight: "600", color: "#374151", cursor: "pointer", paddingBottom: "9px" }}>
                <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} />
                Active
              </label>
            </div>
          </div>

          <label style={lbl} htmlFor="eh-specialties">Specialties (comma-separated)</label>
          <input id="eh-specialties" style={{ ...inp, marginBottom: "12px" }} value={form.specialties}
            onChange={e => set("specialties", e.target.value)} />

          <label style={lbl} htmlFor="eh-accred">Accreditations (comma-separated)</label>
          <input id="eh-accred" style={{ ...inp, marginBottom: "12px" }} value={form.accreditations}
            onChange={e => set("accreditations", e.target.value)} />

          <label style={lbl} htmlFor="eh-infra">Infrastructure (comma-separated)</label>
          <input id="eh-infra" style={{ ...inp, marginBottom: "12px" }} value={form.infrastructure}
            onChange={e => set("infrastructure", e.target.value)} />

          <label style={lbl} htmlFor="eh-notes">Notes (internal, not shown to the hospital)</label>
          <textarea id="eh-notes" rows={3} style={{ ...inp, marginBottom: "16px", resize: "vertical", fontFamily: "'Inter',sans-serif" }}
            value={form.notes} onChange={e => set("notes", e.target.value)} />

          {err && <p style={{ color: "#dc2626", fontSize: "12.5px", marginBottom: "12px" }}>❌ {err}</p>}

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "9px",
              border: "1.5px solid var(--wc-border)", background: "var(--wc-warm-white)", fontFamily: "'Inter',sans-serif",
              fontWeight: "600", fontSize: "13px", color: "var(--wc-muted)", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: "10px", borderRadius: "9px", border: "none",
              cursor: saving ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color: "#fff",
              fontFamily: "'Inter',sans-serif", fontWeight: "700", fontSize: "13px", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
