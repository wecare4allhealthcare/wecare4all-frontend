/**
 * pages/company/Dashboard.jsx — Corporate SaaS dashboard shell (Phase 2).
 *
 * Staged access: companies.status drives what's visible, same pattern as
 * AboutRouteGuard.jsx elsewhere in the app.
 *   pending   -> only the Overview tab (profile + "subscribe" prompt)
 *   active    -> Overview + Employees unlocked
 *   suspended/expired -> read-only banner
 *
 * Billing (Phase 6) and Analytics (Phase 7) tabs are stubbed here as
 * "coming soon" placeholders so the sidebar shape is already correct
 * and doesn't need reshuffling later.
 */
import { useEffect, useState } from "react";
import { showToast } from "../../components/Toast";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.cdb{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;}
.cdb *{box-sizing:border-box;}
.cdb h1,.cdb h2,.cdb h3{font-family:'Cormorant Garamond',serif;color:#0b1f3a;}
.cdb-shell{display:flex;min-height:100vh;flex-wrap:wrap;}
.cdb-side{width:220px;background:#0b1f3a;color:#fff;padding:22px 14px;flex-shrink:0;}
.cdb-side h3{color:#fff;font-size:17px;margin:0 0 18px;padding:0 8px;}
.cdb-nav{display:flex;flex-direction:column;gap:4px;}
.cdb-nav button{background:none;border:none;color:#cbd5e1;text-align:left;padding:10px 12px;
  border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;}
.cdb-nav button.on{background:#047857;color:#fff;}
.cdb-nav button:disabled{opacity:.4;cursor:not-allowed;}
.cdb-main{flex:1;min-width:0;padding:28px;max-width:1000px;}
.cdb-card{background:#fff;border-radius:14px;padding:24px;box-shadow:0 2px 10px rgba(11,31,58,.06);
  margin-bottom:18px;}
.cdb-badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;}
.cdb-inp{border:1.5px solid #e2eaf4;border-radius:8px;padding:9px 11px;font-size:13.5px;
  font-family:'DM Sans',sans-serif;outline:none;}
.cdb-inp:focus{border-color:#047857;}
.cdb-btn{background:#047857;color:#fff;border:none;border-radius:8px;padding:10px 18px;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:13.5px;cursor:pointer;}
.cdb-btn:disabled{opacity:.6;cursor:not-allowed;}
.cdb-btn.outline{background:#fff;color:#047857;border:1.5px solid #047857;}
.cdb-table{width:100%;border-collapse:collapse;font-size:13.5px;}
.cdb-table th{text-align:left;padding:9px 10px;color:#64748b;font-weight:700;
  border-bottom:2px solid #e2eaf4;font-size:12px;}
.cdb-table td{padding:9px 10px;border-bottom:1px solid #eef2f7;}
@media (max-width:760px){
  .cdb-side{width:100%;display:flex;overflow-x:auto;}
  .cdb-nav{flex-direction:row;flex-wrap:wrap;}
  .cdb-main{padding:16px;}
}
`;

const STATUS_STYLE = {
  pending:   { bg: "#fef9c3", color: "#854d0e" },
  active:    { bg: "#dcfce7", color: "#15803d" },
  suspended: { bg: "#fee2e2", color: "#991b1b" },
  expired:   { bg: "#fee2e2", color: "#991b1b" },
};

function authHeader() {
  const t = localStorage.getItem("wc4a_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function CompanyDashboard() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/company/me`, { headers: authHeader() });
        const json = await res.json();
        if (!res.ok) { showToast(json.detail || "Couldn't load your dashboard.", "error"); return; }
        setCompany(json);
      } catch { showToast("Couldn't reach the server.", "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="cdb" style={{ padding: 60, textAlign: "center" }}><style>{G}</style>Loading…</div>;
  if (!company) return null;

  const isActive = company.status === "active";
  const badge = STATUS_STYLE[company.status] || STATUS_STYLE.pending;

  return (
    <div className="cdb">
      <SEO title="Company Dashboard — We Care 4 'all'" noindex />
      <style>{G}</style>
      <div className="cdb-shell">
        <aside className="cdb-side">
          <h3>{company.company_name}</h3>
          <nav className="cdb-nav">
            <button className={tab === "overview" ? "on" : ""} onClick={() => setTab("overview")}>Overview</button>
            <button className={tab === "employees" ? "on" : ""} disabled={!isActive} onClick={() => isActive && setTab("employees")}>
              Employees{!isActive && " 🔒"}
            </button>
            <button className={tab === "dependants" ? "on" : ""} disabled={!isActive} onClick={() => isActive && setTab("dependants")}>
              Dependants{!isActive && " 🔒"}
            </button>
            <button className={tab === "billing" ? "on" : ""} onClick={() => setTab("billing")}>Billing</button>
            <button disabled title="Coming in a later phase">Analytics 🔒</button>
          </nav>
        </aside>
        <main className="cdb-main">
          <span className="cdb-badge" style={{ background: badge.bg, color: badge.color }}>
            {company.status.toUpperCase()}
          </span>

          {!isActive && (
            <div className="cdb-card" style={{ marginTop: 14, borderLeft: "4px solid #d97706" }}>
              <h2 style={{ fontSize: 19, marginTop: 0 }}>Subscribe to unlock your full dashboard</h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Your company account is set up, but employee management, appointments,
                and analytics unlock once you choose a plan and complete payment.
              </p>
              <button className="cdb-btn" onClick={() => setTab("billing")}>
                Choose a Plan
              </button>
            </div>
          )}

          {tab === "overview" && <Overview company={company} />}
          {tab === "employees" && isActive && <Employees />}
          {tab === "dependants" && isActive && <Dependants />}
          {tab === "billing" && <Billing company={company} onActivated={() => window.location.reload()} />}
        </main>
      </div>
    </div>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function Billing({ company, onActivated }) {
  const [plans, setPlans] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [subscription, setSubscription] = useState(null);
  const [paying, setPaying] = useState(null); // plan_id currently being paid for, or null

  const loadPlans = async () => {
    const res = await fetch(`${API}/company/plans`);
    const json = await res.json();
    if (res.ok) setPlans(json.plans);
  };
  const loadSubscription = async () => {
    try {
      const res = await fetch(`${API}/company/my-subscription`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) setSubscription(json.subscription);
    } catch { /* not fatal — billing history is supplementary here */ }
  };

  useEffect(() => { loadPlans(); loadSubscription(); }, []);

  const subscribeAndPay = async (plan) => {
    setPaying(plan.id);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway. Check your internet.");

      const subRes = await fetch(`${API}/company/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ plan_id: plan.id, billing_cycle: cycle }),
      });
      const subJson = await subRes.json();
      if (!subRes.ok) throw new Error(subJson.detail || "Couldn't start checkout.");

      const orderRes = await fetch(`${API}/company/subscription/create-order`, {
        method: "POST", headers: authHeader(),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.detail || "Order creation failed.");

      const rz = new window.Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: "We Care 4 'all'",
        description: `${plan.plan_name} Plan (${cycle}) — ${company.company_name}`,
        order_id: order.order_id,
        theme: { color: "#047857" },
        handler: async (response) => {
          try {
            const vRes = await fetch(`${API}/company/subscription/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...authHeader() },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const vJson = await vRes.json();
            if (!vRes.ok) throw new Error(vJson.detail || "Verification failed.");
            showToast("Plan activated! Your dashboard is now unlocked.", "success");
            onActivated();
          } catch (ex) {
            showToast(`Payment received but verification failed: ${ex.message}. Please contact support.`, "error");
          } finally { setPaying(null); }
        },
        modal: { ondismiss: () => setPaying(null) },
      });
      rz.open();
    } catch (ex) { showToast(ex.message, "error"); setPaying(null); }
  };

  return (
    <div className="cdb-card" style={{ marginTop: 14 }}>
      <h2 style={{ fontSize: 19, marginTop: 0 }}>Billing</h2>

      {subscription?.status === "paid" && (
        <div style={{ background: "#eefaf3", border: "1px solid #bbf0d4", borderRadius: 10, padding: 14, marginBottom: 18 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "#15803d", fontWeight: 700 }}>
            ✅ Active — renews {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : "—"}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>
            ₹{subscription.amount} / {subscription.billing_cycle}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["monthly", "annual"].map((c) => (
          <button key={c} className={`cdb-btn ${cycle === c ? "" : "outline"}`}
            style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => setCycle(c)}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {!plans ? <p>Loading plans…</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {plans.map((plan) => {
            const price = cycle === "annual" ? plan.annual_amount : plan.monthly_amount;
            const isCurrent = company.plan_id === plan.id && subscription?.status === "paid";
            return (
              <div key={plan.id} style={{
                border: `1.5px solid ${isCurrent ? "#047857" : "#e2eaf4"}`, borderRadius: 12, padding: 18,
                background: isCurrent ? "#f0fdf4" : "#fff",
              }}>
                <h3 style={{ fontSize: 16, margin: "0 0 6px" }}>{plan.plan_name}</h3>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 10px" }}>
                  {plan.min_employees}–{plan.max_employees ?? "∞"} employees
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#0b1f3a", margin: "0 0 14px" }}>
                  {price > 0 ? `₹${price}` : "Custom"}
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}> /{cycle === "annual" ? "yr" : "mo"}</span>
                </p>
                {isCurrent ? (
                  <button className="cdb-btn" disabled style={{ width: "100%" }}>Current Plan</button>
                ) : price > 0 ? (
                  <button className="cdb-btn" style={{ width: "100%" }} disabled={paying === plan.id}
                    onClick={() => subscribeAndPay(plan)}>
                    {paying === plan.id ? "Processing…" : "Subscribe"}
                  </button>
                ) : (
                  <button className="cdb-btn outline" style={{ width: "100%" }} disabled>Contact Sales</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Overview({ company }) {
  return (
    <div className="cdb-card" style={{ marginTop: 14 }}>
      <h2 style={{ fontSize: 19, marginTop: 0 }}>Company Profile</h2>
      <table className="cdb-table">
        <tbody>
          <tr><td style={{ color: "#64748b", width: 180 }}>Company Name</td><td>{company.company_name}</td></tr>
          <tr><td style={{ color: "#64748b" }}>Registered Email</td><td>{company.registered_email}</td></tr>
          <tr><td style={{ color: "#64748b" }}>Industry</td><td>{company.industry || "—"}</td></tr>
          <tr><td style={{ color: "#64748b" }}>Declared Employees</td><td>{company.declared_employee_count || "—"}</td></tr>
          <tr><td style={{ color: "#64748b" }}>Seats Remaining</td>
            <td>{company.seats_remaining === null || company.seats_remaining === undefined ? "Unlimited" : company.seats_remaining}</td></tr>
          {company.invite_code && (
            <tr><td style={{ color: "#64748b" }}>Employee Invite Code</td>
              <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{company.invite_code}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Dependants() {
  const [dependants, setDependants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [actingOn, setActingOn] = useState(null);

  const load = async (status) => {
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await fetch(`${API}/company/dependants${qs}`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) setDependants(json.dependants);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(filter); }, [filter]);

  const review = async (id, decision) => {
    setActingOn(id);
    try {
      const res = await fetch(`${API}/company/dependants/${id}/${decision}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't update this dependant.", "error"); return; }
      showToast(`Dependant ${decision}.`, "success");
      load(filter);
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setActingOn(null); }
  };

  return (
    <div className="cdb-card" style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 19, margin: 0 }}>Dependant Approvals</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {["pending", "approved", "rejected"].map((s) => (
            <button key={s} className={`cdb-btn ${filter === s ? "" : "outline"}`}
              style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
        Dependants (spouse/children/parents) added by employees need HR approval
        before their consultations are covered under the corporate plan.
      </p>
      {loading ? <p>Loading…</p> : (
        <table className="cdb-table" style={{ marginTop: 10 }}>
          <thead><tr><th>Dependant</th><th>Relationship</th><th>Employee</th><th>Patient ID</th>{filter === "pending" && <th>Action</th>}</tr></thead>
          <tbody>
            {dependants.map((d) => (
              <tr key={d.id}>
                <td>{d.full_name}</td>
                <td>{d.relationship}</td>
                <td>{d.employee_name || "—"}</td>
                <td style={{ fontFamily: "monospace" }}>{d.employee_patient_id || "—"}</td>
                {filter === "pending" && (
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="cdb-btn" style={{ padding: "5px 10px", fontSize: 12 }}
                      disabled={actingOn === d.id} onClick={() => review(d.id, "approve")}>Approve</button>
                    <button className="cdb-btn outline" style={{ padding: "5px 10px", fontSize: 12 }}
                      disabled={actingOn === d.id} onClick={() => review(d.id, "reject")}>Reject</button>
                  </td>
                )}
              </tr>
            ))}
            {!dependants.length && <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8" }}>No {filter} dependants.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", mobile: "" });
  const [csvFile, setCsvFile] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/company/employees`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) { setEmployees(json.employees); setTotal(json.total); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addEmployee = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch(`${API}/company/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't add employee.", "error"); return; }
      showToast(`Added — Patient ID ${json.patient_id}`, "success");
      setForm({ full_name: "", email: "", mobile: "" });
      load();
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setAdding(false); }
  };

  // Simple client-side CSV parse: expects a header row with
  // full_name,email,mobile columns (mobile optional). No quoted-comma
  // support — good enough for HR exporting from Excel/Sheets in the
  // standard column order.
  const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const iName = header.indexOf("full_name");
    const iEmail = header.indexOf("email");
    const iMobile = header.indexOf("mobile");
    return lines.slice(1).map((line) => {
      const cols = line.split(",");
      return {
        full_name: (cols[iName] || "").trim(),
        email: (cols[iEmail] || "").trim(),
        mobile: iMobile >= 0 ? (cols[iMobile] || "").trim() || null : null,
      };
    }).filter((r) => r.full_name && r.email);
  };

  const uploadCsv = async () => {
    if (!csvFile) return;
    setUploading(true);
    setBulkResult(null);
    try {
      const text = await csvFile.text();
      const rows = parseCsv(text);
      if (!rows.length) { showToast("No valid rows found in the CSV.", "error"); return; }
      const res = await fetch(`${API}/company/employees/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ employees: rows }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Bulk upload failed.", "error"); return; }
      setBulkResult(json);
      showToast(`${json.succeeded} of ${json.total} employees added.`, json.failed ? "info" : "success");
      load();
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setUploading(false); }
  };

  return (
    <>
      <div className="cdb-card" style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Add an Employee</h2>
        <form onSubmit={addEmployee} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Full Name</label>
            <input className="cdb-inp" required value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Email</label>
            <input className="cdb-inp" type="email" required value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Mobile</label>
            <input className="cdb-inp" value={form.mobile}
              onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
          </div>
          <button className="cdb-btn" disabled={adding}>{adding ? "Adding…" : "Add Employee"}</button>
        </form>
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Bulk Upload (CSV)</h2>
        <p style={{ fontSize: 13, color: "#64748b" }}>
          Columns: <code>full_name, email, mobile</code> (header row required, mobile optional).
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
          <button className="cdb-btn outline" disabled={!csvFile || uploading} onClick={uploadCsv}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
        {bulkResult && (
          <table className="cdb-table" style={{ marginTop: 14 }}>
            <thead><tr><th>Email</th><th>Status</th><th>Detail</th></tr></thead>
            <tbody>
              {bulkResult.results.map((r, i) => (
                <tr key={i}>
                  <td>{r.email}</td>
                  <td style={{ color: r.success ? "#15803d" : "#991b1b", fontWeight: 700 }}>
                    {r.success ? "Added" : "Failed"}
                  </td>
                  <td>{r.success ? r.patient_id : r.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Employees ({total})</h2>
        {loading ? <p>Loading…</p> : (
          <table className="cdb-table">
            <thead><tr><th>Patient ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Added By</th><th>Health Records</th></tr></thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontFamily: "monospace" }}>{emp.patient_id}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.mobile || "—"}</td>
                  <td>{emp.added_by_company ? "HR" : "Self-registered"}</td>
                  <td>
                    {emp.hr_health_consent_at ? (
                      <button className="cdb-btn outline" style={{ padding: "5px 10px", fontSize: 12 }}
                        onClick={() => setViewingEmployee(emp)}>View</button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: 12.5 }}>Not consented</span>
                    )}
                  </td>
                </tr>
              ))}
              {!employees.length && <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>No employees yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {viewingEmployee && (
        <EmployeeHealthRecordsModal employee={viewingEmployee} onClose={() => setViewingEmployee(null)} />
      )}
    </>
  );

}

function EmployeeHealthRecordsModal({ employee, onClose }) {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, docsRes] = await Promise.all([
          fetch(`${API}/company/employees/${employee.id}/health-profile`, { headers: authHeader() }),
          fetch(`${API}/company/employees/${employee.id}/documents`, { headers: authHeader() }),
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (docsRes.ok) setDocuments((await docsRes.json()).documents);
      } catch { showToast("Couldn't load health records.", "error"); }
      finally { setLoading(false); }
    })();
  }, [employee.id]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(11,31,58,.5)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cdb-card" style={{ maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>{employee.full_name}'s Health Records</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>×</button>
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: -8, marginBottom: 16 }}>
          This view is logged for compliance — the employee consented to HR access and can revoke it anytime.
        </p>
        {loading ? <p>Loading…</p> : (
          <>
            <h3 style={{ fontSize: 15 }}>Health Profile</h3>
            {profile?.exists === false ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No health profile on file yet.</p>
            ) : (
              <table className="cdb-table" style={{ marginBottom: 20 }}>
                <tbody>
                  <tr><td style={{ color: "#64748b", width: 160 }}>Allergies</td><td>{profile?.allergies || "—"}</td></tr>
                  <tr><td style={{ color: "#64748b" }}>Chronic Conditions</td><td>{profile?.chronic_conditions || "—"}</td></tr>
                  <tr><td style={{ color: "#64748b" }}>Current Medications</td><td>{profile?.current_medications || "—"}</td></tr>
                  <tr><td style={{ color: "#64748b" }}>Past Surgeries</td><td>{profile?.past_surgeries || "—"}</td></tr>
                </tbody>
              </table>
            )}
            <h3 style={{ fontSize: 15 }}>Documents</h3>
            {documents?.length ? (
              <table className="cdb-table">
                <thead><tr><th>File</th><th>Type</th><th>Uploaded</th></tr></thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id}>
                      <td>{d.file_name}</td>
                      <td>{d.document_type}</td>
                      <td>{new Date(d.uploaded_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No documents uploaded yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
