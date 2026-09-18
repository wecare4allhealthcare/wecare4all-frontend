import { useState, useEffect, useRef } from "react";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API } from "./shared";
import { showToast } from "../../../components/Toast";

/**
 * EditHospitalModal.jsx — Aug 2026, client request (companion to
 * AddHospitalModal.jsx). Loads the full record via GET
 * /admin/hospitals/{id}, edits the same business fields as the Add
 * form (plus logo, added alongside it), saves via the hardened
 * PUT /admin/hospitals/{id} (see UpdateHospitalPartnerRequest in
 * admin.py — that endpoint used to accept a raw untyped dict; this
 * modal is the reason it needed a proper field whitelist, since it's
 * the first caller that edits more than just `tier`).
 *
 * One asymmetry worth knowing: Add captures the full empanelment-
 * equivalent field set (registration number, bed/ICU counts, ownership
 * type, insurance panel, key specialists, international-patient
 * fields, declaration — because it writes to hospital_empanelment
 * first). Edit can only edit the narrower set hospital_partners itself
 * stores — those richer fields aren't editable after creation through
 * this or any other existing flow, which isn't a gap this feature
 * introduced; it's how the platform already worked for every hospital,
 * including ones that came through a real approved application.
 */
export default function EditHospitalModal({ token, hospitalId, onClose, onSaved }) {
  const [form, setForm] = useState(null); // null = loading
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  // Sep 2026 — one busy-flag per media kind (photos/banners/videos/
  // interviews) rather than a single shared flag, so uploading a
  // banner doesn't grey out the (unrelated) photos button too.
  const [uploadingMedia, setUploadingMedia] = useState({});
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
          website: h.website || "", logo_url: h.logo_url || "", bed_count: h.bed_count ?? "", tier: h.tier || "basic",
          notes: h.notes || "", is_active: h.is_active !== false,
          specialties: (h.specialties || []).join(", "),
          accreditations: (h.accreditations || []).join(", "),
          infrastructure: (h.infrastructure || []).join(", "),
          // Media — same fields hospital.py's own dashboard reads/writes;
          // edited immediately below (not deferred to "Save Changes"),
          // matching how the hospital's own upload buttons behave.
          photos: h.photos || [],
          banners: h.banners || [],
          videos: h.videos || [],
          doctor_interviews: h.doctor_interviews || [],
        });
      } catch { setErr("Network error — please try again."); }
    })();
  }, [hospitalId]);

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
  // Sep 2026, client request: admin gets the same Profile Photos /
  // Promotional Banners / Promotional Videos management a hospital has
  // on its own dashboard (hospital.py's my-profile/photos|banners|
  // videos|interviews). Each add/remove here calls the {hospital_id}-
  // scoped admin endpoints and takes effect immediately — the hospital
  // sees it on their own dashboard the moment they next load it, and
  // vice versa, since both sides read/write the same hospital_partners
  // row.
  const MEDIA = {
    photos:    { uploadPath: "upload-photo",    listPath: "photos",    accept: "image/png,image/jpeg,image/webp", isVideo: false },
    banners:   { uploadPath: "upload-banner",   listPath: "banners",   accept: "image/png,image/jpeg,image/webp", isVideo: false },
    videos:    { uploadPath: "upload-video",    listPath: "videos",    accept: "video/mp4,video/webm,video/quicktime", isVideo: true },
    interviews:{ uploadPath: "upload-interview",listPath: "doctor_interviews", accept: "video/mp4,video/webm,video/quicktime", isVideo: true },
  };

  const uploadAndAttachMedia = async (kind, file) => {
    if (!file) return;
    const cfg = MEDIA[kind];
    setUploadingMedia(p => ({ ...p, [kind]: true })); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch(`${API}/admin/hospitals/${cfg.uploadPath}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const upJson = await upRes.json();
      if (!upRes.ok) { setErr(upJson.detail || "Couldn't upload the file — please try a different one."); return; }

      const attachBody = cfg.isVideo
        ? { url: upJson.url, title: upJson.title || file.name }
        : { url: upJson.url };
      const attRes = await fetch(`${API}/admin/hospitals/${hospitalId}/${cfg.listPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(attachBody),
      });
      const attJson = await attRes.json();
      if (!attRes.ok) { setErr(attJson.detail || "Uploaded, but couldn't attach it — please retry."); return; }
      set(cfg.listPath, attJson[cfg.listPath] || attJson[kind] || []);
    } catch { setErr("Network error while uploading — please try again."); }
    finally { setUploadingMedia(p => ({ ...p, [kind]: false })); }
  };

  const removeMedia = async (kind, url) => {
    const cfg = MEDIA[kind];
    setErr("");
    try {
      const res = await fetch(`${API}/admin/hospitals/${hospitalId}/${cfg.listPath}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Couldn't remove this — please try again."); return; }
      set(cfg.listPath, json[cfg.listPath] || json[kind] || []);
    } catch { setErr("Network error — please try again."); }
  };

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
          logo_url: form.logo_url || null,
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
  const section = { fontFamily: "'Manrope',sans-serif", fontSize: "13.5px", fontWeight: "700",
    color: "var(--wc-navy)", margin: "20px 0 10px", paddingBottom: "6px", borderBottom: "1.5px solid var(--wc-border)" };

  // Shared renderer for the Photos/Banners/Videos/Interviews sections —
  // same thumbnail-grid-plus-dashed-upload-box pattern, parameterized
  // per media kind instead of four near-identical blocks of JSX.
  const renderMediaSection = (kind, title, thumbLabel) => {
    const cfg = MEDIA[kind];
    const items = form[cfg.listPath] || [];
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
                <button type="button" onClick={() => removeMedia(kind, url)}
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
              onChange={e => { uploadAndAttachMedia(kind, e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
      </div>
    );
  };

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

          <label style={lbl} htmlFor="eh-logo">Hospital Logo</label>
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
              <input id="eh-logo" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                disabled={uploadingLogo} style={{ display: "none" }}
                onChange={e => uploadLogo(e.target.files?.[0])} />
            </label>
          </div>

          {/* Sep 2026 — same Profile Photos / Promotional Banners /
              Promotional Videos / Doctor Interviews management a
              hospital has on its own dashboard, now available here
              too, and not tier-gated for admin the way the hospital's
              own upload buttons are. */}
          <p style={section}>Media</p>
          {/* Sep 2026 follow-up: horizontal layout — same 4-column
              grid as AddHospitalModal.jsx, wraps to 2 columns on
              narrow screens. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "12px" }}>
            {renderMediaSection("photos", "Profile Photos", "photo")}
            {renderMediaSection("banners", "Promotional Banners", "banner")}
            {renderMediaSection("videos", "Promotional Videos", "video")}
            {renderMediaSection("interviews", "Doctor Interviews", "interview")}
          </div>

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
