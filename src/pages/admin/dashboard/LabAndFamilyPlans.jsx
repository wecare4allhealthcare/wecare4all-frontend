/**
 * admin/dashboard/LabAndFamilyPlans.jsx — Admin management for the
 * two new B2C features: Lab Test Booking (catalog + bookings) and
 * Family Health Plan (individual_plans catalog). Same CRUD pattern
 * as Companies.jsx's PlansTab, deliberately copied for consistency.
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { showToast } from "../../../components/Toast";
import { API, Spinner } from "./shared";

export default function LabAndFamilyPlans({ token }) {
  const [searchParams] = useSearchParams();
  const section = searchParams.get("subtab") || "lab_catalog"; // lab_catalog | lab_bookings | family_plans

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#0b1f3a", margin: "0 0 4px" }}>
        Lab Tests &amp; Family Plans
      </h1>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e2eaf4", marginBottom: 20 }}>
        {[["lab_catalog", "Lab Test Catalog"], ["lab_bookings", "Lab Bookings"], ["family_plans", "Family Plans"]].map(([id, label]) => (
          <Link key={id} to={`?tab=lab_family&subtab=${id}`} style={{
            padding: "10px 16px", border: "none", background: "none", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13.5,
            color: section === id ? "#047857" : "#94a3b8", textDecoration: "none", display: "inline-block",
            borderBottom: section === id ? "2px solid #047857" : "2px solid transparent" }}>
            {label}
          </Link>
        ))}
      </div>
      {section === "lab_catalog" && <LabCatalogTab token={token} />}
      {section === "lab_bookings" && <LabBookingsTab token={token} />}
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

  const inp = { width: "100%", border: "1.5px solid #e2eaf4", borderRadius: 8, padding: "9px 11px", fontFamily: "'DM Sans',sans-serif", fontSize: 13.5, marginBottom: 10 };

  return (
    <div>
      <button onClick={openNew} style={{ background: "#047857", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
        + Add Test
      </button>
      {loading ? <Spinner /> : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden" }}>
          <thead><tr style={{ background: "#f8fafc" }}>
            <th style={th}>Name</th><th style={th}>Category</th><th style={th}>Price</th><th style={th}>Status</th><th style={th}>Actions</th>
          </tr></thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={td}>{t.name}</td>
                <td style={td}>{t.category}</td>
                <td style={td}>₹{t.price}</td>
                <td style={td}>{t.is_active ? "Active" : "Inactive"}</td>
                <td style={td}><button onClick={() => openEdit(t)} style={{ background: "none", border: "none", color: "#0369a1", cursor: "pointer", fontWeight: 700, fontSize: 12.5 }}>Edit</button></td>
              </tr>
            ))}
            {!tests.length && <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: "#94a3b8" }}>No tests in catalog yet.</td></tr>}
          </tbody>
        </table>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,31,58,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 22, width: "100%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto" }}>
            <h3 style={{ marginTop: 0 }}>{editing ? "Edit Test" : "Add Test"}</h3>
            <input style={inp} placeholder="Test name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <input style={inp} placeholder="Category (e.g. Blood Test)" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
            <input style={inp} type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
            <input style={inp} placeholder="Prep instructions (e.g. 12hr fasting)" value={form.prep_instructions || ""} onChange={(e) => setForm(f => ({ ...f, prep_instructions: e.target.value }))} />
            <input style={inp} placeholder="Report turnaround (e.g. 24-48 hours)" value={form.report_turnaround || ""} onChange={(e) => setForm(f => ({ ...f, report_turnaround: e.target.value }))} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14 }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: "#047857", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontWeight: 700, cursor: "pointer" }}>{saving ? "Saving…" : "Save"}</button>
              <button onClick={() => setShowForm(false)} style={{ padding: "11px 18px", borderRadius: 8, border: "1.5px solid #e2eaf4", background: "#fff", cursor: "pointer" }}>Cancel</button>
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
            border: filter === s ? "1.5px solid #047857" : "1.5px solid #e2eaf4",
            background: filter === s ? "#f0fdf4" : "#fff", color: filter === s ? "#047857" : "#64748b" }}>
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : bookings.map((b) => (
        <div key={b.id} style={{ background: "#fff", border: "1.5px solid #e2eaf4", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0 }}>{b.scheduled_date} {b.scheduled_time_slot ? `· ${b.scheduled_time_slot}` : ""}</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
              {b.collection_type === "home" ? `🏠 Home — ${b.address}` : "🏥 Center"} · ₹{b.total_amount} · {b.payment_status}
              {b.is_company_sponsored && " · 🏢 Company"}
            </p>
          </div>
          <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)} style={{ padding: "7px 10px", borderRadius: 7, border: "1.5px solid #e2eaf4", fontSize: 12.5 }}>
            {STATUS_FLOW.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
      ))}
      {!loading && !bookings.length && <p style={{ color: "#94a3b8", fontSize: 13.5 }}>No {filter !== "all" ? filter.replace(/_/g, " ") : ""} bookings.</p>}
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

  const inp = { width: "100%", border: "1.5px solid #e2eaf4", borderRadius: 8, padding: "9px 11px", fontFamily: "'DM Sans',sans-serif", fontSize: 13.5, marginBottom: 10 };

  return (
    <div>
      <button onClick={openNew} style={{ background: "#047857", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
        + Add Plan
      </button>
      {loading ? <Spinner /> : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden" }}>
          <thead><tr style={{ background: "#f8fafc" }}>
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
                <td style={td}><button onClick={() => openEdit(p)} style={{ background: "none", border: "none", color: "#0369a1", cursor: "pointer", fontWeight: 700, fontSize: 12.5 }}>Edit</button></td>
              </tr>
            ))}
            {!plans.length && <tr><td colSpan={6} style={{ ...td, textAlign: "center", color: "#94a3b8" }}>No plans yet.</td></tr>}
          </tbody>
        </table>
      )}

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,31,58,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 22, width: "100%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto" }}>
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
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: "#047857", color: "#fff", border: "none", borderRadius: 8, padding: 11, fontWeight: 700, cursor: "pointer" }}>{saving ? "Saving…" : "Save"}</button>
              <button onClick={() => setShowForm(false)} style={{ padding: "11px 18px", borderRadius: 8, border: "1.5px solid #e2eaf4", background: "#fff", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const th = { textAlign: "left", padding: "10px 12px", fontSize: 11.5, textTransform: "uppercase", color: "#64748b", fontFamily: "'DM Sans',sans-serif" };
const td = { padding: "11px 12px", fontSize: 13, fontFamily: "'DM Sans',sans-serif" };
