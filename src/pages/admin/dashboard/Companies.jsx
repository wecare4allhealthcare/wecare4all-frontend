/**
 * admin/dashboard/Companies.jsx — Phase 9: pilot company onboarding &
 * ongoing management. Lets the platform admin list corporate SaaS
 * clients and manually activate a company (comp/pilot trial, no
 * Razorpay payment) or change its status — the operational counterpart
 * to company_analytics.py's aggregate-only /admin/companies-analytics.
 */
import { useState, useEffect, Fragment } from "react";
import { showToast } from "../../../components/Toast";
import { API, Spinner, SectionHead, Badge } from "./shared";

const STATUS_OPTIONS = ["pending", "active", "suspended", "expired"];

export default function Companies({ token }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [plans, setPlans] = useState([]);
  const [activating, setActivating] = useState(null); // company id being activated
  const [selectedPlan, setSelectedPlan] = useState("");
  const [note, setNote] = useState("");

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`${API}/admin/companies?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setCompanies(json.companies || []);
    } catch { setCompanies([]); }
    finally { setLoading(false); }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API}/company/plans`);
      const json = await res.json();
      setPlans(json.plans || []);
    } catch { setPlans([]); }
  };

  useEffect(() => { fetchCompanies(); }, [statusFilter]);
  useEffect(() => { fetchPlans(); }, []);

  const activate = async (id) => {
    if (!selectedPlan) { showToast("Choose a plan first.", "info"); return; }
    try {
      const res = await fetch(`${API}/admin/companies/${id}/activate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan_id: selectedPlan, note }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't activate.", "error"); return; }
      showToast("Company activated.", "success");
      setActivating(null); setSelectedPlan(""); setNote("");
      fetchCompanies();
    } catch { showToast("Network error.", "error"); }
  };

  const changeStatus = async (id, status) => {
    if (!window.confirm(`Set this company's status to "${status}"?`)) return;
    try {
      const res = await fetch(`${API}/admin/companies/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't update status.", "error"); return; }
      showToast("Status updated.", "success");
      fetchCompanies();
    } catch { showToast("Network error.", "error"); }
  };

  if (loading && !companies.length) return <Spinner />;

  return (
    <div>
      <SectionHead title="Corporate SaaS Companies" count={companies.length} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input placeholder="Search by name or email…" value={search}
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchCompanies()}
          style={{ border: "1.5px solid #e2eaf4", borderRadius: 8, padding: "8px 12px", fontSize: 13.5, minWidth: 220 }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ border: "1.5px solid #e2eaf4", borderRadius: 8, padding: "8px 12px", fontSize: 13.5 }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={fetchCompanies}
          style={{ background: "#047857", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13.5, cursor: "pointer" }}>
          Search
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #e2eaf4" }}>
              <th style={{ padding: "8px 10px" }}>Company</th>
              <th style={{ padding: "8px 10px" }}>Email</th>
              <th style={{ padding: "8px 10px" }}>Status</th>
              <th style={{ padding: "8px 10px" }}>Employees Declared</th>
              <th style={{ padding: "8px 10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <Fragment key={c.id}>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>{c.company_name}</td>
                  <td style={{ padding: "8px 10px" }}>{c.registered_email}</td>
                  <td style={{ padding: "8px 10px" }}><Badge status={c.status} /></td>
                  <td style={{ padding: "8px 10px" }}>{c.declared_employee_count || "—"}</td>
                  <td style={{ padding: "8px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {c.status === "pending" && (
                      <button onClick={() => setActivating(activating === c.id ? null : c.id)}
                        style={{ background: "#047857", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
                        {activating === c.id ? "Cancel" : "Activate (Pilot)"}
                      </button>
                    )}
                    {c.status === "active" && (
                      <button onClick={() => changeStatus(c.id, "suspended")}
                        style={{ background: "#fff", color: "#991b1b", border: "1.5px solid #991b1b", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
                        Suspend
                      </button>
                    )}
                    {(c.status === "suspended" || c.status === "expired") && (
                      <button onClick={() => changeStatus(c.id, "active")}
                        style={{ background: "#fff", color: "#047857", border: "1.5px solid #047857", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
                {activating === c.id && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td colSpan={5} style={{ padding: "10px", background: "#f8fafc" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}
                          style={{ border: "1.5px solid #e2eaf4", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                          <option value="">Choose plan…</option>
                          {plans.map((p) => <option key={p.id} value={p.id}>{p.plan_name}</option>)}
                        </select>
                        <input placeholder="Internal note (e.g. 3-month pilot trial, agreed on call)"
                          value={note} onChange={(e) => setNote(e.target.value)}
                          style={{ border: "1.5px solid #e2eaf4", borderRadius: 6, padding: "6px 10px", fontSize: 13, flex: 1, minWidth: 240 }} />
                        <button onClick={() => activate(c.id)}
                          style={{ background: "#047857", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
                          Confirm Activation
                        </button>
                      </div>
                      <p style={{ fontSize: 11.5, color: "#94a3b8", margin: "6px 0 0" }}>
                        This activates the company on the chosen plan with no Razorpay charge — a "comp" subscription
                        row is recorded for the audit trail. Use this for pilot companies, not regular self-serve signups.
                      </p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {!companies.length && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>No companies found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
