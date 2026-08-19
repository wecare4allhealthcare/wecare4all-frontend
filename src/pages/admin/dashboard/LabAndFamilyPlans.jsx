/**
 * admin/dashboard/LabAndFamilyPlans.jsx — Admin management for the
 * two new B2C features: Lab Test Booking (catalog + bookings) and
 * Family Health Plan (individual_plans catalog). Same CRUD pattern
 * as Companies.jsx's PlansTab, deliberately copied for consistency.
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { showToast } from "../../../components/Toast";
import { API, Spinner, ToggleSwitch, PartnerApplicationsQueue, PartnerPlansTab, DeleteButton } from "./shared";

// payment_status was rendered as raw DB text inline in the booking row
// (e.g. "· paid ·" / "· pending_verification ·") — cosmetic-only fix:
// a small colored badge so admin can scan status at a glance instead of
// reading text mixed into a sentence. Values come from lab_bookings.py:
// "paid", "pending", "pending_verification"; "failed"/"refunded" are
// included defensively since other payment flows in the app use them.
const PAYMENT_STATUS_STYLES = {
  paid:                 { bg: "var(--wc-sage)", border: "#86efac", color: "var(--wc-green)", label: "Paid" },
  pending:               { bg: "#fffbeb", border: "#fde68a", color: "#b45309", label: "Pending" },
  pending_verification:  { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", label: "Pending Verification" },
  failed:                { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", label: "Failed" },
  refunded:              { bg: "#f5f3ff", border: "#ddd6fe", color: "#6d28d9", label: "Refunded" },
};

function PaymentStatusBadge({ status }) {
  const s = PAYMENT_STATUS_STYLES[status] || { bg: "#f1f5f9", border: "var(--wc-border)", color: "var(--wc-muted)", label: (status || "—").replace(/_/g, " ") };
  return (
    <span style={{
      display: "inline-block", padding: "2px 9px", borderRadius: 50,
      fontSize: 11, fontWeight: 700, background: s.bg, color: s.color,
      border: `1px solid ${s.border}`, textTransform: "capitalize",
    }}>
      {s.label}
    </span>
  );
}

export default function LabAndFamilyPlans({ token }) {
  const [searchParams] = useSearchParams();
  const section = searchParams.get("subtab") || "lab_catalog"; // lab_catalog | lab_bookings | lab_centers | applications | lab_plans | family_plans

  return (
    <div>
      <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 26, color: "var(--wc-navy)", margin: "0 0 4px" }}>
        Lab Tests &amp; Family Plans
      </h1>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--wc-border)", marginBottom: 20, overflowX: "auto" }}>
        {[["lab_catalog", "Lab Test Catalog"], ["lab_bookings", "Lab Bookings"], ["lab_centers", "Lab Centers"],
          ["applications", "Applications"], ["lab_plans", "Lab Plans"], ["family_plans", "Family Plans"]].map(([id, label]) => (
          <Link key={id} to={`?tab=lab_family&subtab=${id}`} style={{
            padding: "10px 16px", border: "none", background: "none", cursor: "pointer",
            fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap",
            color: section === id ? "var(--wc-green)" : "#94a3b8", textDecoration: "none", display: "inline-block",
            borderBottom: section === id ? "2px solid var(--wc-green)" : "2px solid transparent" }}>
            {label}
          </Link>
        ))}
      </div>
      {section === "lab_catalog" && <LabCatalogTab token={token} />}
      {section === "lab_bookings" && <LabBookingsTab token={token} />}
      {section === "lab_centers" && <LabCentersTab token={token} />}
      {section === "applications" && <PartnerApplicationsQueue token={token} type="lab" />}
      {section === "lab_plans" && <PartnerPlansTab token={token} type="lab" />}
      {section === "family_plans" && <FamilyPlansTab token={token} />}
    </div>
  );
}

function emptyTestForm() {
  return { name: "", category: "", price: "", prep_instructions: "", report_turnaround: "", is_active: true, sort_order: 999 };
}

function LabCatalogTab({ token }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTestForm());
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/lab-tests`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setTests(json.tests || []);
    } catch { setTests([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyTestForm()); setShowForm(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...t, price: String(t.price) }); setShowForm(true); };

  const save = async () => {
    if (!form.name.trim() || !form.price) { showToast("Name and price are required.", "info"); return; }
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price), sort_order: Number(form.sort_order) || 999 };
      const url = editing ? `${API}/admin/lab-tests/${editing.id}` : `${API}/admin/lab-tests`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't save test.", "error"); return; }
      showToast(editing ? "Test updated." : "Test created.", "success");
      setShowForm(false); fetchAll();
    } catch { showToast("Network error.", "error"); }
    finally { setSaving(false); }
  };

  const inp = { width: "100%", border: "1.5px solid var(--wc-border)", borderRadius: 8, padding: "9px 11px", fontFamily: "'Inter',sans-serif", fontSize: 13.5, marginBottom: 10 };

  return (
    <div>
      <button onClick={openNew} style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
        + Add Test
      </button>
      {loading ? <Spinner /> : (
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", minWidth: "560px", borderCollapse: "collapse", background: "#fff", borderRadius: 10 }}>
          <thead><tr style={{ background: "var(--wc-warm-white)" }}>
            <th style={th}>Name</th><th style={th}>Category</th><th style={th}>Price</th><th style={th}>Status</th><th style={th}>Actions</th>
          </tr></thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={td}>{t.name}</td>
                <td style={td}>{t.category}</td>
                <td style={td}>₹{t.price}</td>
                <td style={td}>{t.is_active ? "Active" : "Inactive"}</td>
                <td style={td}>
                  <button onClick={() => openEdit(t)} style={{ background: "none", border: "none", color: "var(--wc-teal)", cursor: "pointer", fontWeight: 700, fontSize: 12.5, marginRight: 12 }}>Edit</button>
                  <DeleteButton small
                    confirmText={`Delete "${t.name}" from the lab test catalog? This cannot be undone.`}
                    onDelete={async () => {
                      const res = await fetch(`${API}/admin/lab-tests/${t.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                      if (res.ok) { showToast("Test deleted.", "success"); fetchAll(); }
                      else showToast("Couldn't delete this test.", "error");
                    }} />
                </td>
              </tr>
            ))}
            {!tests.length && <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: "#94a3b8" }}>No tests in catalog yet.</td></tr>}
          </tbody>
        </table></div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(18,59,74,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "22px 22px 0", width: "100%", maxWidth: 440, maxHeight: "85svh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <h3 style={{ marginTop: 0 }}>{editing ? "Edit Test" : "Add Test"}</h3>
            <input style={inp} placeholder="Test name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <input style={inp} placeholder="Category (e.g. Blood Test)" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
            <input style={inp} type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
            <input style={inp} placeholder="Prep instructions (e.g. 12hr fasting)" value={form.prep_instructions || ""} onChange={(e) => setForm(f => ({ ...f, prep_instructions: e.target.value }))} />
            <input style={inp} placeholder="Report turnaround (e.g. 24-48 hours)" value={form.report_turnaround || ""} onChange={(e) => setForm(f => ({ ...f, report_turnaround: e.target.value }))} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14 }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active
            </label>
            {/* Same fix as the Family Plan modal below — sticky footer
                so Save/Cancel stay reachable once form content exceeds
                the modal's max-height. */}
            <div style={{ display: "flex", gap: 8, position: "sticky", bottom: 0, background: "#fff", padding: "14px 0 22px", marginTop: "auto" }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontWeight: 700, cursor: "pointer" }}>{saving ? "Saving…" : "Save"}</button>
              <button onClick={() => setShowForm(false)} style={{ padding: "11px 18px", borderRadius: 8, border: "1.5px solid var(--wc-border)", background: "#fff", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LabBookingsTab({ token }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchAll = async (f = filter) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/lab-bookings?status=${f}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setBookings(json.bookings || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(filter); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/admin/lab-bookings/${id}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { const j = await res.json(); showToast(j.detail || "Couldn't update.", "error"); return; }
      showToast("Status updated.", "success"); fetchAll(filter);
    } catch { showToast("Network error.", "error"); }
  };

  const STATUS_FLOW = ["booked", "sample_collected", "processing", "report_ready", "cancelled"];

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["all", ...STATUS_FLOW].map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "6px 13px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: filter === s ? "1.5px solid var(--wc-green)" : "1.5px solid var(--wc-border)",
            background: filter === s ? "var(--wc-sage)" : "#fff", color: filter === s ? "var(--wc-green)" : "var(--wc-muted)" }}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : bookings.map((b) => (
        <div key={b.id} style={{ background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0 }}>{b.scheduled_date} {b.scheduled_time_slot ? `· ${b.scheduled_time_slot}` : ""}</p>
            <p style={{ fontSize: 12, color: "var(--wc-muted)", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span>{b.collection_type === "home" ? `🏠 Home — ${b.address}` : "🏥 Center"} · ₹{b.total_amount}</span>
              <PaymentStatusBadge status={b.payment_status} />
              {b.is_company_sponsored && <span>🏢 Company</span>}
            </p>
          </div>
          <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)} style={{ padding: "7px 10px", borderRadius: 7, border: "1.5px solid var(--wc-border)", fontSize: 12.5 }}>
            {STATUS_FLOW.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
      ))}
      {!loading && !bookings.length && <p style={{ color: "#94a3b8", fontSize: 13.5 }}>No {filter !== "all" ? filter.replace(/_/g, " ") : ""} bookings.</p>}
    </div>
  );
}

function emptyLabForm() {
  return { name: "", address: "", city: "", phone: "", email: "" };
}
function emptyLabStaffForm() {
  return { lab_id: "", email: "", password: "", full_name: "", phone: "" };
}

// ── Lab Centers + Staff Logins + the patient-facing "Lab Tests"
// visibility toggle. Structurally the lab equivalent of
// PharmacyManagement.jsx's "pharmacies" + "staff" subtabs, combined
// into one tab here (internal view switch below) since Lab already
// has five URL-level subtabs and didn't need two more.
function LabCentersTab({ token }) {
  const [view, setView] = useState("labs"); // labs | staff
  const [labs, setLabs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showLabForm, setShowLabForm] = useState(false);
  const [labForm, setLabForm] = useState(emptyLabForm());
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState(emptyLabStaffForm());
  const [credentials, setCredentials] = useState(null);

  const [patientOrderingEnabled, setPatientOrderingEnabled] = useState(false);
  const [togglingPatientSetting, setTogglingPatientSetting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [lRes, sRes] = await Promise.allSettled([
      fetch(`${API}/admin/labs`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/admin/lab-staff`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]);
    fetch(`${API}/lab-settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => setPatientOrderingEnabled(!!j.patient_ordering_enabled)).catch(() => {});
    const failed = [];
    if (lRes.status === "fulfilled") setLabs(lRes.value.labs || []); else failed.push("lab centers");
    if (sRes.status === "fulfilled") setStaff(sRes.value.staff || []); else failed.push("staff logins");
    setErr(failed.length ? `Failed to load: ${failed.join(", ")}. Try refreshing.` : null);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const togglePatientOrdering = async () => {
    const next = !patientOrderingEnabled;
    setTogglingPatientSetting(true);
    setPatientOrderingEnabled(next); // optimistic
    try {
      const res = await fetch(`${API}/admin/lab-settings`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patient_ordering_enabled: next }),
      });
      if (!res.ok) setPatientOrderingEnabled(!next);
    } catch { setPatientOrderingEnabled(!next); }
    finally { setTogglingPatientSetting(false); }
  };

  const saveLab = async () => {
    if (!labForm.name.trim()) { setErr("Lab center name is required"); return; }
    setSaving(true); setErr(null);
    try {
      const res = await fetch(`${API}/admin/labs`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(labForm),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Save failed"); return; }
      setShowLabForm(false); setLabForm(emptyLabForm());
      fetchAll();
    } catch { setErr("Network error"); }
    finally { setSaving(false); }
  };

  const toggleLab = async (l) => {
    await fetch(`${API}/admin/labs/${l.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...l, is_active: !l.is_active }),
    });
    fetchAll();
  };

  const saveStaff = async () => {
    if (!staffForm.lab_id) { setErr("Choose a lab center for this staff account"); return; }
    if (!staffForm.email.trim() || !staffForm.password.trim() || !staffForm.full_name.trim()) {
      setErr("Name, email and password are required"); return;
    }
    setSaving(true); setErr(null);
    try {
      const res = await fetch(`${API}/admin/lab-staff`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(staffForm),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Save failed"); return; }
      setCredentials(json.credentials);
      setShowStaffForm(false); setStaffForm(emptyLabStaffForm());
      fetchAll();
    } catch { setErr("Network error"); }
    finally { setSaving(false); }
  };

  const toggleStaff = async (s) => {
    await fetch(`${API}/admin/lab-staff/${s.id}/toggle`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  const inp = { width: "100%", border: "1.5px solid var(--wc-border)", borderRadius: "9px", padding: "9px 12px",
    fontFamily: "'Inter',sans-serif", fontSize: "13.5px", color: "#1e293b", background: "var(--wc-warm-white)", outline: "none" };
  const lbl = { display: "block", fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" };

  return (
    <div>
      {/* Patient-facing toggle — off by default. Controls whether the
          "Lab Tests" quick action even appears on the patient dashboard.
          Same pattern as PharmacyManagement.jsx's patient-ordering toggle. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
        background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: "12px", padding: "14px 18px", marginBottom: "18px" }}>
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: "700", fontSize: "13.5px", color: "var(--wc-navy)", margin: "0 0 3px" }}>
            Show "Lab Tests" to patients
          </p>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#6b7688", margin: 0 }}>
            When off, the "Lab Tests" quick action is hidden from the patient dashboard entirely.
            Turn this on once a lab center is onboarded and ready to receive bookings.
          </p>
        </div>
        <ToggleSwitch checked={patientOrderingEnabled} onChange={togglePatientOrdering}
          disabled={togglingPatientSetting} label="Toggle Lab Tests visibility for patients" />
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
        {[["labs", "Lab Centers"], ["staff", "Staff Logins"]].map(([id, label]) => (
          <button key={id} onClick={() => setView(id)}
            style={{ padding: "9px 16px", border: "none", borderBottom: view === id ? "2px solid var(--wc-green)" : "2px solid transparent",
              background: "none", color: view === id ? "var(--wc-green)" : "var(--wc-muted)", fontFamily: "'Inter',sans-serif",
              fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>{label}</button>
        ))}
      </div>

      {err && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>❌ {err}</p>}

      {credentials && (
        <div style={{ background: "var(--wc-sage)", border: "1px solid #86efac", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: "700", color: "#15803d", marginBottom: "6px" }}>
            Staff account created — share these credentials securely:
          </p>
          <p style={{ fontFamily: "monospace", fontSize: "12.5px", color: "var(--wc-navy)", margin: 0 }}>
            {credentials.email} / {credentials.password}
          </p>
          <button onClick={() => setCredentials(null)} style={{ marginTop: "8px", padding: "5px 12px",
            borderRadius: "6px", border: "none", background: "#dcfce7", color: "#15803d",
            fontFamily: "'Inter',sans-serif", fontWeight: "600", fontSize: "11.5px", cursor: "pointer" }}>Dismiss</button>
        </div>
      )}

      {loading ? <Spinner /> : view === "labs" ? (
        <div>
          <button onClick={() => { setShowLabForm(true); setErr(null); }}
            style={{ padding: "10px 18px", borderRadius: "9px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color: "#fff",
              fontFamily: "'Inter',sans-serif", fontWeight: "700", fontSize: "13px", marginBottom: "16px" }}>
            + Add Lab Center
          </button>
          {showLabForm && (
            <div style={{ background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: "12px", padding: "18px", marginBottom: "16px" }}>
              <label style={lbl} htmlFor="lc-name">Lab Center Name *</label>
              <input id="lc-name" style={{ ...inp, marginBottom: "10px" }} value={labForm.name}
                onChange={e => setLabForm(f => ({ ...f, name: e.target.value }))} />
              <label style={lbl} htmlFor="lc-address">Address</label>
              <input id="lc-address" style={{ ...inp, marginBottom: "10px" }} value={labForm.address}
                onChange={e => setLabForm(f => ({ ...f, address: e.target.value }))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <input style={inp} placeholder="City" value={labForm.city}
                  onChange={e => setLabForm(f => ({ ...f, city: e.target.value }))} />
                <input style={inp} placeholder="Phone" value={labForm.phone}
                  onChange={e => setLabForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <input style={{ ...inp, marginBottom: "14px" }} placeholder="Email" value={labForm.email}
                onChange={e => setLabForm(f => ({ ...f, email: e.target.value }))} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowLabForm(false)} style={{ flex: 1, padding: "9px", borderRadius: "8px",
                  border: "1.5px solid var(--wc-border)", background: "var(--wc-warm-white)", color: "var(--wc-muted)",
                  fontFamily: "'Inter',sans-serif", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                <button onClick={saveLab} disabled={saving} style={{ flex: 1, padding: "9px", borderRadius: "8px",
                  border: "none", background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color: "#fff",
                  fontFamily: "'Inter',sans-serif", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}
          {labs.length === 0 ? (
            <p style={{ fontFamily: "'Inter',sans-serif", color: "#94a3b8", fontSize: "13px" }}>No lab centers added yet.</p>
          ) : labs.map(l => (
            <div key={l.id} style={{ background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: "12px",
              padding: "14px 18px", marginBottom: "10px", display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <strong style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "var(--wc-navy)" }}>{l.name}</strong>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "var(--wc-muted)", margin: "3px 0 0" }}>
                  {[l.address, l.city].filter(Boolean).join(", ")}
                </p>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#94a3b8", margin: "2px 0 0" }}>
                  {l.signup_source === "self" ? `Self-signup · ${l.application_status}` : "Added by admin"}
                </p>
              </div>
              <button onClick={() => toggleLab(l)} style={{ padding: "6px 14px", borderRadius: "7px",
                border: "none", cursor: "pointer", fontSize: "11.5px", fontWeight: "700", fontFamily: "'Inter',sans-serif",
                background: l.is_active ? "#dcfce7" : "#fee2e2", color: l.is_active ? "#15803d" : "#991b1b" }}>
                {l.is_active ? "Active" : "Inactive"}
              </button>
              <DeleteButton small
                confirmText={`Permanently delete "${l.name}"? This also removes its staff logins and detaches any lab bookings tied to it. This cannot be undone.`}
                onDelete={async () => {
                  const res = await fetch(`${API}/admin/labs/${l.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                  if (res.ok) fetchAll(); else alert("Couldn't delete this lab center.");
                }} />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => { setShowStaffForm(true); setErr(null); }} disabled={labs.length === 0}
            style={{ padding: "10px 18px", borderRadius: "9px", border: "none",
              cursor: labs.length === 0 ? "default" : "pointer",
              background: labs.length === 0 ? "var(--wc-border)" : "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
              color: labs.length === 0 ? "#94a3b8" : "#fff",
              fontFamily: "'Inter',sans-serif", fontWeight: "700", fontSize: "13px", marginBottom: "16px" }}>
            + Add Staff Login
          </button>
          {labs.length === 0 && (
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", color: "#94a3b8", marginTop: "-10px", marginBottom: "14px" }}>
              Add a lab center first.
            </p>
          )}
          {showStaffForm && (
            <div style={{ background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: "12px", padding: "18px", marginBottom: "16px" }}>
              <label style={lbl} htmlFor="ls-lab">Lab Center *</label>
              <select id="ls-lab" style={{ ...inp, marginBottom: "10px" }} value={staffForm.lab_id}
                onChange={e => setStaffForm(f => ({ ...f, lab_id: e.target.value }))}>
                <option value="">Select lab center…</option>
                {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <label style={lbl} htmlFor="ls-name">Staff Name *</label>
              <input id="ls-name" style={{ ...inp, marginBottom: "10px" }} value={staffForm.full_name}
                onChange={e => setStaffForm(f => ({ ...f, full_name: e.target.value }))} />
              <label style={lbl} htmlFor="ls-email">Email *</label>
              <input id="ls-email" style={{ ...inp, marginBottom: "10px" }} value={staffForm.email}
                onChange={e => setStaffForm(f => ({ ...f, email: e.target.value }))} />
              <label style={lbl} htmlFor="ls-password">Password *</label>
              <input id="ls-password" style={{ ...inp, marginBottom: "14px" }} value={staffForm.password}
                onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowStaffForm(false)} style={{ flex: 1, padding: "9px", borderRadius: "8px",
                  border: "1.5px solid var(--wc-border)", background: "var(--wc-warm-white)", color: "var(--wc-muted)",
                  fontFamily: "'Inter',sans-serif", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                <button onClick={saveStaff} disabled={saving} style={{ flex: 1, padding: "9px", borderRadius: "8px",
                  border: "none", background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color: "#fff",
                  fontFamily: "'Inter',sans-serif", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                  {saving ? "Creating…" : "Create Login"}
                </button>
              </div>
            </div>
          )}
          {staff.length === 0 ? (
            <p style={{ fontFamily: "'Inter',sans-serif", color: "#94a3b8", fontSize: "13px" }}>No staff accounts yet.</p>
          ) : staff.map(s => (
            <div key={s.id} style={{ background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: "12px",
              padding: "14px 18px", marginBottom: "10px", display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <strong style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "var(--wc-navy)" }}>{s.full_name}</strong>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "var(--wc-muted)", margin: "3px 0 0" }}>{s.email}</p>
              </div>
              <button onClick={() => toggleStaff(s)} style={{ padding: "6px 14px", borderRadius: "7px",
                border: "none", cursor: "pointer", fontSize: "11.5px", fontWeight: "700", fontFamily: "'Inter',sans-serif",
                background: s.is_active ? "#dcfce7" : "#fee2e2", color: s.is_active ? "#15803d" : "#991b1b" }}>
                {s.is_active ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function emptyPlanForm() {
  return { name: "", description: "", monthly_amount: "", annual_amount: "", consultations_included: "", max_family_members: 1, is_active: true, sort_order: 999 };
}

function FamilyPlansTab({ token }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlanForm());
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/individual-plans`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setPlans(json.plans || []);
    } catch { setPlans([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyPlanForm()); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p, monthly_amount: String(p.monthly_amount), annual_amount: p.annual_amount ? String(p.annual_amount) : "", consultations_included: String(p.consultations_included) });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.monthly_amount || !form.consultations_included) { showToast("Name, monthly price, and consultations are required.", "info"); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        monthly_amount: Number(form.monthly_amount),
        annual_amount: form.annual_amount ? Number(form.annual_amount) : null,
        consultations_included: Number(form.consultations_included),
        max_family_members: Number(form.max_family_members) || 1,
        sort_order: Number(form.sort_order) || 999,
      };
      const url = editing ? `${API}/admin/individual-plans/${editing.id}` : `${API}/admin/individual-plans`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't save plan.", "error"); return; }
      showToast(editing ? "Plan updated." : "Plan created.", "success");
      setShowForm(false); fetchAll();
    } catch { showToast("Network error.", "error"); }
    finally { setSaving(false); }
  };

  const inp = { width: "100%", border: "1.5px solid var(--wc-border)", borderRadius: 8, padding: "9px 11px", fontFamily: "'Inter',sans-serif", fontSize: 13.5, marginBottom: 10 };

  return (
    <div>
      <button onClick={openNew} style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
        + Add Plan
      </button>
      {loading ? <Spinner /> : (
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", minWidth: "560px", borderCollapse: "collapse", background: "#fff", borderRadius: 10 }}>
          <thead><tr style={{ background: "var(--wc-warm-white)" }}>
            <th style={th}>Name</th><th style={th}>Monthly</th><th style={th}>Annual</th><th style={th}>Consultations</th><th style={th}>Status</th><th style={th}>Actions</th>
          </tr></thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={td}>{p.name}</td>
                <td style={td}>₹{p.monthly_amount}</td>
                <td style={td}>{p.annual_amount ? `₹${p.annual_amount}` : "—"}</td>
                <td style={td}>{p.consultations_included}</td>
                <td style={td}>{p.is_active ? "Active" : "Inactive"}</td>
                <td style={td}><button onClick={() => openEdit(p)} style={{ background: "none", border: "none", color: "var(--wc-teal)", cursor: "pointer", fontWeight: 700, fontSize: 12.5 }}>Edit</button></td>
              </tr>
            ))}
            {!plans.length && <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: "#94a3b8" }}>No plans yet.</td></tr>}
          </tbody>
        </table></div>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(18,59,74,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "22px 22px 0", width: "100%", maxWidth: 440, maxHeight: "85svh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <h3 style={{ marginTop: 0 }}>{editing ? "Edit Plan" : "Add Plan"}</h3>
            <input style={inp} placeholder="Plan name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <input style={inp} placeholder="Description" value={form.description || ""} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            <input style={inp} type="number" placeholder="Monthly amount (₹)" value={form.monthly_amount} onChange={(e) => setForm(f => ({ ...f, monthly_amount: e.target.value }))} />
            <input style={inp} type="number" placeholder="Annual amount (₹, optional)" value={form.annual_amount || ""} onChange={(e) => setForm(f => ({ ...f, annual_amount: e.target.value }))} />
            <input style={inp} type="number" placeholder="Consultations included per cycle" value={form.consultations_included} onChange={(e) => setForm(f => ({ ...f, consultations_included: e.target.value }))} />
            <input style={inp} type="number" placeholder="Max family members covered" value={form.max_family_members} onChange={(e) => setForm(f => ({ ...f, max_family_members: e.target.value }))} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14 }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active
            </label>
            {/* Was a plain (non-sticky) button row at the bottom of a
                scrollable modal box — once form content pushed past the
                85vh max-height, Save/Cancel scrolled out of view below
                the fold instead of staying reachable (screenshot
                feedback, Aug 2026: "footer getting scrolled instead of
                fixed"). position:sticky + bottom:0 pins it to the
                bottom of this box's own scroll area regardless of how
                tall the form content above it gets. */}
            <div style={{ display: "flex", gap: 8, position: "sticky", bottom: 0, background: "#fff", padding: "14px 0 22px", marginTop: "auto" }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontWeight: 700, cursor: "pointer" }}>{saving ? "Saving…" : "Save"}</button>
              <button onClick={() => setShowForm(false)} style={{ padding: "11px 18px", borderRadius: 8, border: "1.5px solid var(--wc-border)", background: "#fff", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { textAlign: "left", padding: "10px 12px", fontSize: 11.5, textTransform: "uppercase", color: "var(--wc-muted)", fontFamily: "'Inter',sans-serif" };
const td = { padding: "11px 12px", fontSize: 13, fontFamily: "'Inter',sans-serif" };
