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
  const [section, setSection] = useState("companies"); // companies | plans | quotes
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

  if (loading && !companies.length && section === "companies") return <Spinner />;

  return (
    <div>
      <SectionHead title="Corporate SaaS Companies" count={section === "companies" ? companies.length : undefined} />

      <div style={{display:"flex",gap:"8px",marginBottom:"18px",borderBottom:"1px solid #e2eaf4"}}>
        {[["companies","Companies"],["plans","Plans"],["quotes","Quote Requests"]].map(([id,label]) => (
          <button key={id} onClick={()=>setSection(id)}
            style={{padding:"9px 16px",border:"none",borderBottom:section===id?"2px solid #047857":"2px solid transparent",
              background:"none",color:section===id?"#047857":"#64748b",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"700",fontSize:"13px",cursor:"pointer"}}>{label}</button>
        ))}
      </div>

      {section === "plans" ? <PlansTab token={token} onPlansChanged={fetchPlans}/> :
       section === "quotes" ? <QuoteRequestsTab token={token}/> : (
      <>
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
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"14px"}}>
        These are exactly the plans and prices a company sees on their own Billing tab — a plan hidden here
        (Active toggled off) simply stops showing up there, without affecting anyone already subscribed to it.
      </p>
      <button onClick={openNew} className="ad-btn" style={{marginBottom:"16px"}}>+ New Plan</button>

      {showForm && (
        <div style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"12px",padding:"16px",marginBottom:"16px"}}>
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
            <button onClick={()=>setShowForm(false)} style={{padding:"9px 16px",borderRadius:"8px",border:"1.5px solid #e2eaf4",background:"#fff",color:"#64748b",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(240px,100%),1fr))",gap:"14px"}}>
        {plans.map(p => (
          <div key={p.id} style={{background:"#fff",border:`1.5px solid ${p.is_active?"#e2eaf4":"#fecaca"}`,borderRadius:"12px",padding:"16px",opacity:p.is_active?1:0.65}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"6px"}}>
              <h3 style={{fontSize:"16px",margin:0}}>{p.plan_name}</h3>
              <span style={{fontSize:"10px",fontWeight:"700",padding:"2px 8px",borderRadius:"50px",
                background:p.is_active?"#dcfce7":"#fee2e2",color:p.is_active?"#15803d":"#991b1b"}}>
                {p.is_active ? "Active" : "Hidden"}
              </span>
            </div>
            <p style={{fontSize:"12.5px",color:"#64748b",margin:"0 0 8px"}}>{p.min_employees}–{p.max_employees ?? "∞"} employees</p>
            <p style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 12px"}}>
              {p.monthly_amount > 0 ? `₹${p.monthly_amount}/mo` : "Custom"}
              {p.monthly_amount > 0 && <span style={{fontSize:"11px",fontWeight:"400",color:"#94a3b8"}}> · ₹{p.annual_amount}/yr</span>}
            </p>
            <div style={{display:"flex",gap:"6px"}}>
              <button onClick={()=>openEdit(p)} style={{flex:1,padding:"7px",borderRadius:"7px",border:"1.5px solid #e2eaf4",background:"#fff",color:"#0369a1",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>Edit</button>
              <button onClick={()=>toggle(p)} style={{flex:1,padding:"7px",borderRadius:"7px",border:"none",background:p.is_active?"#fef2f2":"#f0fdf4",color:p.is_active?"#991b1b":"#15803d",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
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
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"14px"}}>
        Companies land here after clicking "Contact Sales" on the Custom/Enterprise tier and describing what they need.
        Recording a quote here doesn't auto-create a subscription — follow up with the company directly.
      </p>
      {requests.map(r => (
        <div key={r.id} style={{background:"#fff",border:"1.5px solid #e2eaf4",borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px",flexWrap:"wrap"}}>
            <div style={{minWidth:0}}>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                {r.companies?.company_name || "Company"}
              </strong>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688",margin:"2px 0 8px"}}>
                {r.companies?.registered_email} · {new Date(r.created_at).toLocaleDateString("en-IN")}
              </p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",margin:"0 0 4px"}}>
                <strong>Requested modules:</strong> {r.requested_modules}
              </p>
              {r.message && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",margin:0,fontStyle:"italic"}}>"{r.message}"</p>}
            </div>
            <span style={{flexShrink:0,fontSize:"11px",fontWeight:"700",padding:"3px 10px",borderRadius:"50px",
              background:r.status==="pending"?"#fef9c3":r.status==="quoted"?"#dcfce7":"#fee2e2",
              color:r.status==="pending"?"#854d0e":r.status==="quoted"?"#15803d":"#991b1b"}}>
              {r.status.toUpperCase()}{r.status==="quoted" && r.quoted_amount ? ` · ₹${r.quoted_amount}` : ""}
            </span>
          </div>

          {r.status === "pending" && (
            respondingId === r.id ? (
              <div style={{marginTop:"12px",display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center",background:"#f8fafc",padding:"10px",borderRadius:"9px"}}>
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
                style={{marginTop:"10px",padding:"7px 14px",borderRadius:"7px",border:"none",background:"#eff8ff",color:"#0369a1",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
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
