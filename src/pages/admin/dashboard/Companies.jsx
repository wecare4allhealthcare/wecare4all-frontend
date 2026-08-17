/**
 * admin/dashboard/Companies.jsx — Phase 9: pilot company onboarding &
 * ongoing management. Lets the platform admin list corporate SaaS
 * clients and manually activate a company (comp/pilot trial, no
 * Razorpay payment) or change its status — the operational counterpart
 * to company_analytics.py's aggregate-only /admin/companies-analytics.
 */
import { useState, useEffect, Fragment } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { showToast } from "../../../components/Toast";
import { API, Spinner, SectionHead, Badge, DeleteButton, PaginationBar } from "./shared";

const STATUS_OPTIONS = ["pending", "active", "suspended", "expired"];
const COMPANIES_PAGE_SIZE = 10;
const addInp = { width: "100%", border: "1.5px solid var(--wc-border)", borderRadius: 8, padding: "9px 12px",
  fontFamily: "'DM Sans',sans-serif", fontSize: 13.5, color: "#1e293b", background: "var(--wc-warm-white)", outline: "none" };

export default function Companies({ token }) {
  const [searchParams] = useSearchParams();
  const section = searchParams.get("subtab") || "companies"; // companies | plans | quotes
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [plans, setPlans] = useState([]);
  const [activating, setActivating] = useState(null); // company id being activated
  const [selectedPlan, setSelectedPlan] = useState("");
  const [note, setNote] = useState("");
  const [linksOpenId, setLinksOpenId] = useState(null); // company id whose Copy Links panel is open
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCompanies = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", String(p));
      params.set("page_size", String(COMPANIES_PAGE_SIZE));
      const res = await fetch(`${API}/admin/companies?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setCompanies(json.companies || []);
      setTotalCount(json.total || 0);
      setTotalPages(Math.max(1, Math.ceil((json.total || 0) / COMPANIES_PAGE_SIZE)));
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

  useEffect(() => { setPage(1); fetchCompanies(1); }, [statusFilter]);
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

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ company_name:"", registered_email:"", password:"", contact_person:"", contact_mobile:"", industry:"", declared_employee_count:"", employee_id_prefix:"" });
  const [addSaving, setAddSaving] = useState(false);
  const [addCredentials, setAddCredentials] = useState(null);

  const saveNewCompany = async () => {
    if (!addForm.company_name.trim() || !addForm.registered_email.trim() || !addForm.employee_id_prefix.trim()) {
      showToast("Company name, email, and employee ID prefix are required.", "info"); return;
    }
    setAddSaving(true);
    try {
      const res = await fetch(`${API}/admin/companies`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...addForm,
          declared_employee_count: addForm.declared_employee_count ? Number(addForm.declared_employee_count) : null,
          password: addForm.password || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't create company.", "error"); return; }
      setAddCredentials(json.credentials);
      setShowAddForm(false);
      setAddForm({ company_name:"", registered_email:"", password:"", contact_person:"", contact_mobile:"", industry:"", declared_employee_count:"", employee_id_prefix:"" });
      fetchCompanies();
    } catch { showToast("Network error.", "error"); }
    finally { setAddSaving(false); }
  };

  if (loading && !companies.length && section === "companies") return <Spinner />;

  return (
    <div>
      <SectionHead title="Corporate SaaS Companies" count={section === "companies" ? totalCount : undefined} />

      <div className="admin-subtab-strip">
        {[["enquiries","Enquiries"],["companies","Companies"],["plans","Plans"],["quotes","Quote Requests"]].map(([id,label]) => (
          <Link key={id} to={`?tab=companies&subtab=${id}`}
            style={{padding:"9px 16px",border:"none",borderBottom:section===id?"2px solid var(--wc-green)":"2px solid transparent",
              background:"none",color:section===id?"var(--wc-green)":"var(--wc-muted)",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"700",fontSize:"13px",cursor:"pointer",textDecoration:"none",display:"inline-block",whiteSpace:"nowrap"}}>{label}</Link>
        ))}
      </div>

      {section === "enquiries" ? <EnquiriesTab token={token}/> :
       section === "plans" ? <PlansTab token={token} onPlansChanged={fetchPlans}/> :
       section === "quotes" ? <QuoteRequestsTab token={token}/> : (
      <>
      <button onClick={() => setShowAddForm(true)}
        style={{ padding: "10px 18px", borderRadius: "9px", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color: "#fff",
          fontFamily: "'DM Sans',sans-serif", fontWeight: "700", fontSize: "13px", marginBottom: "14px" }}>
        + Add Company
      </button>

      {addCredentials && (
        <div style={{ background: "var(--wc-sage)", border: "1px solid #86efac", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", fontWeight: "700", color: "#15803d", marginBottom: "6px" }}>
            Company account created — share these credentials securely:
          </p>
          <p style={{ fontFamily: "monospace", fontSize: "12.5px", color: "var(--wc-navy)", margin: 0 }}>
            {addCredentials.email} / {addCredentials.password}
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11.5px", color: "#166534", margin: "6px 0 0" }}>
            Company still needs to choose a plan (or use "Activate" below to skip payment for a pilot deal).
          </p>
          <button onClick={() => setAddCredentials(null)} style={{ marginTop: "8px", padding: "5px 12px",
            borderRadius: "6px", border: "none", background: "#dcfce7", color: "#15803d",
            fontFamily: "'DM Sans',sans-serif", fontWeight: "600", fontSize: "11.5px", cursor: "pointer" }}>Dismiss</button>
        </div>
      )}

      {showAddForm && (
        <div style={{ background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: "12px", padding: "18px", marginBottom: "16px", maxWidth: 480 }}>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", color: "#6b7688", margin: "0 0 14px" }}>
            Creates a ready-to-use login directly — skips the public enquiry / approval-email / invite-link flow.
            The company still starts in "pending" status until a plan is chosen (or you Activate it below).
          </p>
          <input placeholder="Company Name *" value={addForm.company_name}
            onChange={e => setAddForm(f => ({ ...f, company_name: e.target.value }))}
            style={{ ...addInp, marginBottom: 10 }} />
          <input placeholder="Work Email — this is their login *" value={addForm.registered_email}
            onChange={e => setAddForm(f => ({ ...f, registered_email: e.target.value }))}
            style={{ ...addInp, marginBottom: 10 }} />
          <input placeholder="Password (leave blank to auto-generate)" value={addForm.password}
            onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
            style={{ ...addInp, marginBottom: 10 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input placeholder="Contact Person" value={addForm.contact_person}
              onChange={e => setAddForm(f => ({ ...f, contact_person: e.target.value }))} style={addInp} />
            <input placeholder="Contact Mobile" value={addForm.contact_mobile}
              onChange={e => setAddForm(f => ({ ...f, contact_mobile: e.target.value }))} style={addInp} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input placeholder="Industry" value={addForm.industry}
              onChange={e => setAddForm(f => ({ ...f, industry: e.target.value }))} style={addInp} />
            <input type="number" placeholder="Approx. Employee Count" value={addForm.declared_employee_count}
              onChange={e => setAddForm(f => ({ ...f, declared_employee_count: e.target.value }))} style={addInp} />
          </div>
          <input placeholder="Employee ID Prefix * (e.g. ACME)" value={addForm.employee_id_prefix}
            onChange={e => setAddForm(f => ({ ...f, employee_id_prefix: e.target.value.toUpperCase() }))}
            style={{ ...addInp, marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: 9, borderRadius: 8,
              border: "1.5px solid var(--wc-border)", background: "var(--wc-warm-white)", color: "var(--wc-muted)",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button onClick={saveNewCompany} disabled={addSaving} style={{ flex: 1, padding: 9, borderRadius: 8,
              border: "none", background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color: "#fff",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {addSaving ? "Creating…" : "Create Company"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input placeholder="Search by name or email…" value={search}
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setPage(1), fetchCompanies(1))}
          style={{ border: "1.5px solid var(--wc-border)", borderRadius: 8, padding: "8px 12px", fontSize: 13.5, minWidth: 220 }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ border: "1.5px solid var(--wc-border)", borderRadius: 8, padding: "8px 12px", fontSize: 13.5 }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => { setPage(1); fetchCompanies(1); }}
          style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13.5, cursor: "pointer" }}>
          Search
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--wc-border)" }}>
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
                    <button onClick={() => setLinksOpenId(linksOpenId === c.id ? null : c.id)}
                      style={{ background: "#eff8ff", color: "var(--wc-teal)", border: "1.5px solid #bae6fd", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
                      🔗 {linksOpenId === c.id ? "Hide Links" : "Copy Links"}
                    </button>
                    {c.status === "pending" && (
                      <button onClick={() => setActivating(activating === c.id ? null : c.id)}
                        style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
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
                        style={{ background: "#fff", color: "var(--wc-green)", border: "1.5px solid var(--wc-green)", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>
                        Reactivate
                      </button>
                    )}
                    <DeleteButton small
                      confirmText={`Permanently delete ${c.company_name}? This also removes their employees, staff logins, subscriptions, and quote requests. This cannot be undone.`}
                      onDelete={async()=>{
                        // BUG FIX: this called fetchAll(), which doesn't exist in
                        // this component's scope (only fetchCompanies does —
                        // fetchAll only exists in the separate EnquiriesTab
                        // function further down in this file). Every successful
                        // company deletion threw a ReferenceError right after
                        // the DELETE request succeeded.
                        const res = await fetch(`${API}/admin/companies/${c.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
                        if(res.ok) fetchCompanies(page); else showToast("Couldn't delete this company.","error");
                      }}/>
                  </td>
                </tr>
                {linksOpenId === c.id && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td colSpan={5} style={{ padding: "12px", background: "var(--wc-warm-white)" }}>
                      <CompanyLinksPanel company={c} token={token} onUpdated={fetchCompanies} />
                    </td>
                  </tr>
                )}
                {activating === c.id && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td colSpan={5} style={{ padding: "10px", background: "var(--wc-warm-white)" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)}
                          style={{ border: "1.5px solid var(--wc-border)", borderRadius: 6, padding: "6px 10px", fontSize: 13 }}>
                          <option value="">Choose plan…</option>
                          {plans.map((p) => <option key={p.id} value={p.id}>{p.plan_name}</option>)}
                        </select>
                        <input placeholder="Internal note (e.g. 3-month pilot trial, agreed on call)"
                          value={note} onChange={(e) => setNote(e.target.value)}
                          style={{ border: "1.5px solid var(--wc-border)", borderRadius: 6, padding: "6px 10px", fontSize: 13, flex: 1, minWidth: 240 }} />
                        <button onClick={() => activate(c.id)}
                          style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
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
      <PaginationBar page={page} totalPages={totalPages} loading={loading}
        onPrev={() => { const p = page - 1; setPage(p); fetchCompanies(p); }}
        onNext={() => { const p = page + 1; setPage(p); fetchCompanies(p); }} />
      </>
      )}
    </div>
  );
}

// ── Plans management ─────────────────────────────────────────────
function PlansTab({ token, onPlansChanged }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = new, obj = editing existing
  const [form, setForm] = useState(emptyPlanForm());
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/company-plans`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setPlans(json.plans || []);
    } catch { setPlans([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyPlanForm()); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      plan_name: p.plan_name, min_employees: p.min_employees, max_employees: p.max_employees ?? "",
      monthly_amount: p.monthly_amount, annual_amount: p.annual_amount, is_active: p.is_active,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.plan_name.trim()) { showToast("Plan name is required.", "info"); return; }
    setSaving(true);
    try {
      const body = {
        plan_name: form.plan_name.trim(),
        min_employees: Number(form.min_employees) || 0,
        max_employees: form.max_employees === "" ? null : Number(form.max_employees),
        monthly_amount: Number(form.monthly_amount) || 0,
        annual_amount: Number(form.annual_amount) || 0,
        is_active: form.is_active,
      };
      const url = editing ? `${API}/admin/company-plans/${editing.id}` : `${API}/admin/company-plans`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't save plan.", "error"); return; }
      showToast(editing ? "Plan updated." : "Plan created.", "success");
      setShowForm(false); fetchAll(); onPlansChanged?.();
    } catch { showToast("Network error.", "error"); }
    finally { setSaving(false); }
  };

  const toggle = async (p) => {
    try {
      await fetch(`${API}/admin/company-plans/${p.id}/toggle`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      fetchAll(); onPlansChanged?.();
    } catch { showToast("Network error.", "error"); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"var(--wc-muted)",marginBottom:"14px"}}>
        These are exactly the plans and prices a company sees on their own Billing tab — a plan hidden here
        (Active toggled off) simply stops showing up there, without affecting anyone already subscribed to it.
      </p>
      <button onClick={openNew} className="ad-btn" style={{marginBottom:"16px"}}>+ New Plan</button>

      {showForm && (
        <div style={{background:"#fff",border:"1px solid var(--wc-border)",borderRadius:"12px",padding:"16px",marginBottom:"16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(180px,100%),1fr))",gap:"12px",marginBottom:"12px"}}>
            <div>
              <label className="ad-lbl">Plan Name</label>
              <input className="ad-inp" value={form.plan_name} onChange={e=>setForm(f=>({...f,plan_name:e.target.value}))} placeholder="e.g. Growth"/>
            </div>
            <div>
              <label className="ad-lbl">Min Employees</label>
              <input className="ad-inp" type="number" value={form.min_employees} onChange={e=>setForm(f=>({...f,min_employees:e.target.value}))}/>
            </div>
            <div>
              <label className="ad-lbl">Max Employees (blank = unlimited)</label>
              <input className="ad-inp" type="number" value={form.max_employees} onChange={e=>setForm(f=>({...f,max_employees:e.target.value}))} placeholder="∞"/>
            </div>
            <div>
              <label className="ad-lbl">Monthly Amount (₹, 0 = Custom tier)</label>
              <input className="ad-inp" type="number" value={form.monthly_amount} onChange={e=>setForm(f=>({...f,monthly_amount:e.target.value}))}/>
            </div>
            <div>
              <label className="ad-lbl">Annual Amount (₹)</label>
              <input className="ad-inp" type="number" value={form.annual_amount} onChange={e=>setForm(f=>({...f,annual_amount:e.target.value}))}/>
            </div>
          </div>
          <div style={{display:"flex",gap:"10px"}}>
            <button onClick={save} disabled={saving} className="ad-btn">{saving ? "Saving…" : "Save Plan"}</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"9px 16px",borderRadius:"8px",border:"1.5px solid var(--wc-border)",background:"#fff",color:"var(--wc-muted)",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(240px,100%),1fr))",gap:"14px"}}>
        {plans.map(p => (
          <div key={p.id} style={{background:"#fff",border:`1.5px solid ${p.is_active?"var(--wc-border)":"#fecaca"}`,borderRadius:"12px",padding:"16px",opacity:p.is_active?1:0.65}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"6px"}}>
              <h3 style={{fontSize:"16px",margin:0}}>{p.plan_name}</h3>
              <span style={{fontSize:"10px",fontWeight:"700",padding:"2px 8px",borderRadius:"50px",
                background:p.is_active?"#dcfce7":"#fee2e2",color:p.is_active?"#15803d":"#991b1b"}}>
                {p.is_active ? "Active" : "Hidden"}
              </span>
            </div>
            <p style={{fontSize:"12.5px",color:"var(--wc-muted)",margin:"0 0 8px"}}>{p.min_employees}–{p.max_employees ?? "∞"} employees</p>
            <p style={{fontSize:"20px",fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 12px"}}>
              {p.monthly_amount > 0 ? `₹${p.monthly_amount}/mo` : "Custom"}
              {p.monthly_amount > 0 && <span style={{fontSize:"11px",fontWeight:"400",color:"#94a3b8"}}> · ₹{p.annual_amount}/yr</span>}
            </p>
            <div style={{display:"flex",gap:"6px"}}>
              <button onClick={()=>openEdit(p)} style={{flex:1,padding:"7px",borderRadius:"7px",border:"1.5px solid var(--wc-border)",background:"#fff",color:"var(--wc-teal)",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>Edit</button>
              <button onClick={()=>toggle(p)} style={{flex:1,padding:"7px",borderRadius:"7px",border:"none",background:p.is_active?"#fef2f2":"var(--wc-sage)",color:p.is_active?"#991b1b":"#15803d",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                {p.is_active ? "Hide" : "Unhide"}
              </button>
            </div>
          </div>
        ))}
        {!plans.length && <p style={{color:"#94a3b8",fontSize:"13px"}}>No plans yet — create one above.</p>}
      </div>
    </div>
  );
}
function CopyRow({ label, hint, url, disabled }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (disabled) return;
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  };
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ margin: "0 0 4px", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, color: "var(--wc-navy)" }}>
        {label}
      </p>
      {hint && <p style={{ margin: "0 0 6px", fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#94a3b8" }}>{hint}</p>}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <code style={{ fontSize: 12.5, background: "#fff", border: "1px solid var(--wc-border)", borderRadius: 6,
          padding: "6px 10px", wordBreak: "break-all", flex: "1 1 260px",
          color: disabled ? "#cbd5e1" : "var(--wc-navy)" }}>
          {disabled ? "Not available yet — this company has no invite code." : url}
        </code>
        <button onClick={copy} disabled={disabled}
          style={{ background: disabled ? "var(--wc-border)" : "var(--wc-green)", color: "#fff", border: "none", borderRadius: 6,
            padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: disabled ? "default" : "pointer", whiteSpace: "nowrap" }}>
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function CompanyLinksPanel({ company, token, onUpdated }) {
  const origin = window.location.origin;
  const [saving, setSaving] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const enabled = !!company.employee_self_booking_enabled;

  const toggleBookingMode = async () => {
    const next = !enabled;
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/companies/${company.id}/booking-mode`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employee_self_booking_enabled: next }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't update this setting.", "error"); return; }
      showToast(next ? "Employees can now self-book." : "HR now books for employees.", "success");
      onUpdated();
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSaving(false); }
  };

  // Companies created before invite_code was ever generated (see the
  // backend fix notes in admin.py/company.py) show up with no code at
  // all — this backfills one on demand instead of leaving the link
  // permanently unavailable.
  const generateInviteCode = async () => {
    setGenLoading(true);
    try {
      const res = await fetch(`${API}/admin/companies/${company.id}/generate-invite-code`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't generate a code.", "error"); return; }
      showToast("Employee sign-up link is ready.", "success");
      onUpdated();
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setGenLoading(false); }
  };

  return (
    <div style={{ background: "#fff", border: "1px solid var(--wc-border)", borderRadius: 10, padding: 14 }}>
      <p style={{ margin: "0 0 12px", fontFamily: "'DM Sans',sans-serif", fontSize: 12.5, color: "var(--wc-muted)" }}>
        Share these with <strong>{company.company_name}</strong> — the first for the company's own admin/HR account,
        the second for their employees to self-register.
      </p>
      <CopyRow label="Company Admin Login" hint="For the company's own super-admin / HR account."
        url={`${origin}/company/login`} />
      {company.invite_code ? (
        <CopyRow label="Employee Sign-Up Link" hint="Company-specific — has this company's invite code built in. New employees use this once."
          url={`${origin}/employee-signup?code=${company.invite_code}`} />
      ) : (
        <div style={{ marginBottom: 10, padding: "10px 12px", background: "#fffbeb",
          border: "1px solid #fde68a", borderRadius: 8, display: "flex",
          justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#92400e" }}>
            No employee sign-up link yet for this company.
          </span>
          <button onClick={generateInviteCode} disabled={genLoading}
            style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 6,
              padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: genLoading ? "wait" : "pointer" }}>
            {genLoading ? "Generating…" : "Generate Link"}
          </button>
        </div>
      )}
      <CopyRow label="Employee Login" hint="For employees who already signed up, to log back in with their Patient ID + password."
        url={`${origin}/employee-login`} />

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 12.5, color: "var(--wc-navy)" }}>
            Who books appointments for employees?
          </p>
          <p style={{ margin: 0, fontSize: 11.5, color: "#94a3b8" }}>
            {enabled ? "Employees can self-book." : "HR-managed — only HR books for employees."}
            {" "}The company can also change this from their own dashboard.
          </p>
        </div>
        <button onClick={toggleBookingMode} disabled={saving}
          style={{
            width: 46, height: 25, borderRadius: 20, border: "none", cursor: saving ? "default" : "pointer",
            background: enabled ? "var(--wc-green)" : "#cbd5e1", position: "relative", flexShrink: 0,
            transition: "background .2s", opacity: saving ? 0.6 : 1,
          }}>
          <span style={{
            position: "absolute", top: 2.5, left: enabled ? 23 : 2.5, width: 20, height: 20,
            borderRadius: "50%", background: "#fff", transition: "left .2s",
            boxShadow: "0 1px 3px rgba(0,0,0,.3)",
          }} />
        </button>
      </div>
    </div>
  );
}

function emptyPlanForm() {
  return { plan_name: "", min_employees: 1, max_employees: "", monthly_amount: 0, annual_amount: 0, is_active: true };
}

// ── Custom quote requests ────────────────────────────────────────
function QuoteRequestsTab({ token }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/company-quote-requests`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setRequests(json.requests || []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const respond = async (id, status) => {
    if (status === "quoted" && (!amount || Number(amount) <= 0)) { showToast("Enter a quoted amount.", "info"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/company-quote-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, quoted_amount: status === "quoted" ? Number(amount) : null, admin_notes: notes || null }),
      });
      if (!res.ok) { const j = await res.json(); showToast(j.detail || "Couldn't respond.", "error"); return; }
      showToast(status === "quoted" ? "Quote recorded." : "Request rejected.", "success");
      setRespondingId(null); setAmount(""); setNotes(""); fetchAll();
    } catch { showToast("Network error.", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"var(--wc-muted)",marginBottom:"14px"}}>
        Companies land here after clicking "Contact Sales" on the Custom/Enterprise tier and describing what they need.
        Recording a quote here doesn't auto-create a subscription — follow up with the company directly.
      </p>
      {requests.map(r => (
        <div key={r.id} style={{background:"#fff",border:"1.5px solid var(--wc-border)",borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px",flexWrap:"wrap"}}>
            <div style={{minWidth:0}}>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"var(--wc-navy)"}}>
                {r.companies?.company_name || "Company"}
              </strong>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688",margin:"2px 0 8px"}}>
                {r.companies?.registered_email} · {new Date(r.created_at).toLocaleDateString("en-IN")}
              </p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",margin:"0 0 4px"}}>
                <strong>Requested modules:</strong> {r.requested_modules}
              </p>
              {r.message && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"var(--wc-muted)",margin:0,fontStyle:"italic"}}>"{r.message}"</p>}
            </div>
            <span style={{flexShrink:0,fontSize:"11px",fontWeight:"700",padding:"3px 10px",borderRadius:"50px",
              background:r.status==="pending"?"#fef9c3":r.status==="quoted"?"#dcfce7":"#fee2e2",
              color:r.status==="pending"?"#854d0e":r.status==="quoted"?"#15803d":"#991b1b"}}>
              {r.status.toUpperCase()}{r.status==="quoted" && r.quoted_amount ? ` · ₹${r.quoted_amount}` : ""}
            </span>
          </div>

          {r.status === "pending" && (
            respondingId === r.id ? (
              <div style={{marginTop:"12px",display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center",background:"var(--wc-warm-white)",padding:"10px",borderRadius:"9px"}}>
                <input type="number" placeholder="Quoted amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)}
                  className="ad-inp" style={{width:"160px"}}/>
                <input placeholder="Internal note (optional)" value={notes} onChange={e=>setNotes(e.target.value)}
                  className="ad-inp" style={{flex:1,minWidth:200}}/>
                <button onClick={()=>respond(r.id,"quoted")} disabled={saving} className="ad-btn">Send Quote</button>
                <button onClick={()=>respond(r.id,"rejected")} disabled={saving}
                  style={{padding:"9px 16px",borderRadius:"8px",border:"1.5px solid #fecaca",background:"#fef2f2",color:"#991b1b",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>Reject</button>
              </div>
            ) : (
              <button onClick={()=>{setRespondingId(r.id);setAmount("");setNotes("");}}
                style={{marginTop:"10px",padding:"7px 14px",borderRadius:"7px",border:"none",background:"#eff8ff",color:"var(--wc-teal)",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                Respond
              </button>
            )
          )}
        </div>
      ))}
      {!requests.length && <p style={{color:"#94a3b8",fontSize:"13px"}}>No quote requests yet.</p>}
    </div>
  );
}

function EnquiriesTab({ token }) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [statusCounts, setStatusCounts] = useState({pending:0,approved:0,rejected:0});
  const [approvingId, setApprovingId] = useState(null);
  const [prefix, setPrefix] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [signupLink, setSignupLink] = useState(null); // {enquiryId, link} — shown after a successful approve
  const [enqPage, setEnqPage] = useState(1);
  const [enqTotalPages, setEnqTotalPages] = useState(1);

  const fetchAll = async (f = filter, p = enqPage) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/company-enquiries?status=${f}&page=${p}&page_size=10`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setEnquiries(json.enquiries || []);
      if (json.status_counts) setStatusCounts(json.status_counts);
      setEnqTotalPages(Math.max(1, Math.ceil((json.total || 0) / 10)));
    } catch { setEnquiries([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(filter, 1); setEnqPage(1); }, [filter]);

  const approve = async (id) => {
    const cleanPrefix = prefix.trim().toUpperCase();
    if (!cleanPrefix || !/^[A-Z0-9]+$/.test(cleanPrefix)) {
      showToast("Enter a valid Employee ID prefix (letters/numbers only, e.g. ACME).", "info");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/company-enquiries/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employee_id_prefix: cleanPrefix, admin_notes: notes || null }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't approve this enquiry.", "error"); return; }
      showToast(`Approved with prefix "${json.employee_id_prefix}" — invite email sent.`, "success");
      setApprovingId(null); setPrefix(""); setNotes("");
      setSignupLink({ enquiryId: id, link: json.signup_link });
      fetchAll(filter);
    } catch { showToast("Network error.", "error"); }
    finally { setSaving(false); }
  };

  const reject = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/company-enquiries/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ admin_notes: notes || null }),
      });
      if (!res.ok) { const j = await res.json(); showToast(j.detail || "Couldn't reject.", "error"); return; }
      showToast("Enquiry rejected.", "success");
      setApprovingId(null); setNotes(""); fetchAll(filter);
    } catch { showToast("Network error.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"var(--wc-muted)",marginBottom:"14px"}}>
        Companies land here from the "Need a custom package?" enquiry form on the Corporate Wellness page.
        Approving assigns their Employee ID prefix (e.g. "ACME" → every employee gets ACME-0001, ACME-0002…) and
        emails them a one-time signup link — company sign up isn't open otherwise.
      </p>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["pending","approved","rejected"].map(s => (
          <button key={s} onClick={()=>setFilter(s)}
            style={{padding:"7px 14px",borderRadius:"7px",border:filter===s?"1.5px solid var(--wc-green)":"1.5px solid var(--wc-border)",
              background:filter===s?"var(--wc-sage)":"#fff",color:filter===s?"var(--wc-green)":"var(--wc-muted)",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"12.5px",cursor:"pointer"}}>
            {s.charAt(0).toUpperCase()+s.slice(1)} ({statusCounts[s]??0})
          </button>
        ))}
      </div>
      {loading ? <Spinner /> : enquiries.map(en => (
        <div key={en.id} style={{background:"#fff",border:"1.5px solid var(--wc-border)",borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px",flexWrap:"wrap"}}>
            <div style={{minWidth:0}}>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"var(--wc-navy)"}}>{en.company_name}</strong>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688",margin:"2px 0 8px"}}>
                {en.contact_person} · {en.work_email} · {en.mobile}
                {en.team_size ? ` · ${en.team_size} employees` : ""} · {new Date(en.created_at).toLocaleDateString("en-IN")}
              </p>
              {en.requirements && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"var(--wc-muted)",margin:0,fontStyle:"italic"}}>"{en.requirements}"</p>}
              {en.status === "approved" && en.employee_id_prefix && (
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#15803d",margin:"6px 0 0",fontWeight:600}}>
                  Prefix: {en.employee_id_prefix} {en.invite_token_used_at ? "· Signed up ✓" : "· Awaiting signup"}
                </p>
              )}
            </div>
            <span style={{flexShrink:0,fontSize:"11px",fontWeight:"700",padding:"3px 10px",borderRadius:"50px",
              background:en.status==="pending"?"#fef9c3":en.status==="approved"?"#dcfce7":"#fee2e2",
              color:en.status==="pending"?"#854d0e":en.status==="approved"?"#15803d":"#991b1b"}}>
              {en.status.toUpperCase()}
            </span>
          </div>

          {en.status === "pending" && (
            approvingId === en.id ? (
              <div style={{marginTop:"12px",display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center",background:"var(--wc-warm-white)",padding:"10px",borderRadius:"9px"}}>
                <input placeholder="Employee ID prefix (e.g. ACME)" value={prefix} onChange={e=>setPrefix(e.target.value)}
                  className="ad-inp" style={{width:"200px",textTransform:"uppercase"}}/>
                <input placeholder="Internal note (optional)" value={notes} onChange={e=>setNotes(e.target.value)}
                  className="ad-inp" style={{flex:1,minWidth:200}}/>
                <button onClick={()=>approve(en.id)} disabled={saving} className="ad-btn">Approve &amp; Send Invite</button>
                <button onClick={()=>reject(en.id)} disabled={saving}
                  style={{padding:"9px 16px",borderRadius:"8px",border:"1.5px solid #fecaca",background:"#fef2f2",color:"#991b1b",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>Reject</button>
              </div>
            ) : (
              <button onClick={()=>{setApprovingId(en.id);setPrefix("");setNotes("");}}
                style={{marginTop:"10px",padding:"7px 14px",borderRadius:"7px",border:"none",background:"#eff8ff",color:"var(--wc-teal)",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                Review
              </button>
            )
          )}

          {signupLink?.enquiryId === en.id && (
            <div style={{marginTop:"10px",background:"var(--wc-sage)",border:"1px solid #bbf7d0",borderRadius:"8px",padding:"10px 12px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#166534",margin:"0 0 6px",fontWeight:600}}>
                Signup link (also emailed to them):
              </p>
              <code style={{fontSize:"12px",wordBreak:"break-all"}}>{signupLink.link}</code>
            </div>
          )}
        </div>
      ))}
      {!loading && !enquiries.length && <p style={{color:"#94a3b8",fontSize:"13px"}}>No {filter} enquiries.</p>}
      <PaginationBar page={enqPage} totalPages={enqTotalPages} loading={loading}
        onPrev={()=>{ const p=enqPage-1; setEnqPage(p); fetchAll(filter,p); }}
        onNext={()=>{ const p=enqPage+1; setEnqPage(p); fetchAll(filter,p); }} />
    </div>
  );
}
