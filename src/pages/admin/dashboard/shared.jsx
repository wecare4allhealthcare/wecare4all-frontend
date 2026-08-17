// Shared low-level UI primitives used across most of the admin
// dashboard tab components extracted in Phase 14. Kept together in
// one file since they're all tiny and none has its own meaningful
// internal state worth a separate file.
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isEmojiSupported } from "../../../utils/emojiSupport";

export const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Reusable pagination control — "Prev / Page X of Y / Next" bar, plus
// the useServerPage hook below that pairs with it. Built for admin
// list pages that were previously fetching everything in one request
// (loading time scaling with total row count) instead of one page at
// a time. Endpoints using this are expected to accept `page`/`page_size`
// query params and return `{ ...data, total, page, page_size, has_more }`
// (see get_all_appointments in routes/admin.py for the reference shape).
export function PaginationBar({ page, totalPages, onPrev, onNext, loading }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 18 }}>
      <button disabled={page <= 1 || loading} onClick={onPrev} className="btn-sm btn-outline"
        style={{ opacity: page <= 1 || loading ? 0.5 : 1 }}>← Prev</button>
      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6b7688" }}>
        Page {page} of {totalPages}
      </span>
      <button disabled={page >= totalPages || loading} onClick={onNext} className="btn-sm btn-outline"
        style={{ opacity: page >= totalPages || loading ? 0.5 : 1 }}>Next →</button>
    </div>
  );
}

// Shared delete button for the testing-cleanup delete endpoints added
// across the admin dashboard. Native window.confirm() is deliberate
// here — this is an admin-only, irreversible hard-delete tool for
// wiping test data, not a polished end-user flow, so a plain browser
// confirm is faster to ship and unambiguous rather than a custom modal.
export function DeleteButton({ onDelete, label = "Delete", confirmText = "Delete this permanently? This cannot be undone.", small = false }) {
  const [deleting, setDeleting] = useState(false);
  const handleClick = async (e) => {
    e.stopPropagation();
    if (!window.confirm(confirmText)) return;
    setDeleting(true);
    try { await onDelete(); } finally { setDeleting(false); }
  };
  return (
    <button onClick={handleClick} disabled={deleting}
      style={{padding: small ? "6px 12px" : "9px 16px", borderRadius: "7px",
        border: "1.5px solid #fecaca", background: "#fef2f2", color: "#991b1b",
        fontFamily: "'Inter',sans-serif", fontWeight: "700",
        fontSize: small ? "11.5px" : "13px", cursor: deleting ? "not-allowed" : "pointer",
        opacity: deleting ? 0.6 : 1, flexShrink: 0}}>
      {deleting ? "Deleting…" : label}
    </button>
  );
}


// Specialty icons started out as emoji-only (a plain text column). This
// renders a real <img> instead whenever the value looks like a URL —
// e.g. an icon copied from Flaticon or similar — while staying fully
// backward-compatible with every specialty that already uses an emoji.
export function SpecialtyIcon({ icon, size = 24, style = {} }) {
  const val = typeof icon === "string" ? icon.trim() : "";
  const isUrl = /^(https?:\/\/|\/)/.test(val);
  // Guards against pasted HTML (e.g. a Flaticon attribution snippet)
  // ending up literally printed on the page as text.
  const looksLikeHtml = val.startsWith("<");
  if (isUrl) {
    return <img loading="lazy" src={icon} alt="" width={size} height={size}
      style={{objectFit:"contain",flexShrink:0,...style}}/>;
  }
  return <span style={{fontSize:size,flexShrink:0,...style}}>{looksLikeHtml ? "🏥" : (icon && isEmojiSupported(icon) ? icon : "🏥")}</span>;
}

const STATUSES = {
  pending:   {bg:"#fef9c3",color:"#854d0e"},
  approved:  {bg:"#dcfce7",color:"#15803d"},
  completed: {bg:"#dbeafe",color:"#1e40af"},
  cancelled: {bg:"#fee2e2",color:"#991b1b"},
  rejected:  {bg:"#fee2e2",color:"#991b1b"},
  new:       {bg:"#eff8ff",color:"var(--wc-teal)"},
  read:      {bg:"#f1f5f9",color:"var(--wc-muted)"},
};

export function Badge({ status }) {
  const { t } = useTranslation();
  const s = STATUSES[status]||{bg:"#f1f5f9",color:"var(--wc-muted)"};
  return <span className="badge" style={{background:s.bg,color:s.color}}>{t(`adminPages.shared.status.${status}`, status)}</span>;
}

export function Spinner() {
  return <div style={{padding:"60px 0",textAlign:"center"}}><div className="spin"/></div>;
}

export function SectionHead({ title, count, action }) {
  const { t } = useTranslation();
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
      marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
      <div>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"var(--wc-navy)",margin:0}}>{title}</h2>
        {count!==undefined&&<p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",
          color:"#6b7688",margin:"2px 0 0"}}>{t("adminPages.shared.records",{count})}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Toggle switch — same visual/behaviour pattern used inline in
// PharmacyManagement.jsx's doctor-send / patient-ordering toggles,
// extracted here so LabAndFamilyPlans.jsx's patient_lab_test_ordering
// toggle (and anything else added later) doesn't reimplement it.
export function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <button onClick={onChange} disabled={disabled}
      aria-pressed={checked} aria-label={label}
      style={{flexShrink:0,width:"46px",height:"26px",borderRadius:"50px",border:"none",cursor:disabled?"wait":"pointer",
        position:"relative",background:checked?"var(--wc-green)":"#cbd5e1",transition:"background .2s",
        opacity:disabled?0.6:1}}>
      <span style={{position:"absolute",top:"3px",left:checked?"23px":"3px",
        width:"20px",height:"20px",borderRadius:"50%",background:"#fff",
        transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.3)"}}/>
    </button>
  );
}

// ── Self-signup applications review queue — shared by
// PharmacyManagement.jsx (type="pharmacy") and LabAndFamilyPlans.jsx
// (type="lab"). Hits GET/PUT /admin/{type}-applications/... — see
// pharmacy.py / lab_centers.py for the exact endpoints. Kept generic
// here rather than duplicated since the two are identical in shape:
// business name, owner, contact, address, license/GSTIN, then
// Approve/Reject.
export function PartnerApplicationsQueue({ token, type }) {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/${type}-applications?status_filter=${statusFilter}`,
        { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setApplications(json.applications || []);
    } catch { setApplications([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, [statusFilter]);

  const approve = async (app) => {
    setBusyId(app.id);
    try {
      const res = await fetch(`${API}/admin/${type}-applications/${app.id}/approve`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const j = await res.json(); alert(j.detail || "Couldn't approve."); return; }
      fetchAll();
    } finally { setBusyId(null); }
  };

  const reject = async (app) => {
    const reason = window.prompt(`Reason for rejecting "${app.name}" (shown to the applicant):`, "");
    if (reason === null) return;
    setBusyId(app.id);
    try {
      const res = await fetch(`${API}/admin/${type}-applications/${app.id}/reject`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reason || undefined }),
      });
      if (!res.ok) { const j = await res.json(); alert(j.detail || "Couldn't reject."); return; }
      fetchAll();
    } finally { setBusyId(null); }
  };

  return (
    <div>
      <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
        {["pending","approved","rejected","all"].map(f => (
          <button key={f} onClick={()=>setStatusFilter(f)}
            style={{padding:"7px 14px",borderRadius:"8px",cursor:"pointer",
              border:statusFilter===f?"1.5px solid var(--wc-green)":"1.5px solid var(--wc-border)",
              background:statusFilter===f?"var(--wc-sage)":"#fff",
              color:statusFilter===f?"var(--wc-green)":"var(--wc-muted)",
              fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"12px"}}>
            {f[0].toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <Spinner/> : applications.length === 0 ? (
        <p style={{fontFamily:"'Inter',sans-serif",color:"#94a3b8",fontSize:"13px"}}>
          No {statusFilter !== "all" ? statusFilter : ""} applications.
        </p>
      ) : applications.map(app => (
        <div key={app.id} style={{background:"#fff",border:"1.5px solid var(--wc-border)",borderRadius:"12px",
          padding:"14px 18px",marginBottom:"10px",display:"flex",justifyContent:"space-between",
          alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
          <div style={{minWidth:0}}>
            <strong style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-navy)"}}>{app.name}</strong>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"var(--wc-muted)",margin:"3px 0 0"}}>
              {app.owner_name ? `${app.owner_name} · ` : ""}{app.email}{app.phone ? ` · ${app.phone}` : ""}
            </p>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"#94a3b8",margin:"2px 0 0"}}>
              {[app.address, app.city, app.state, app.pincode].filter(Boolean).join(", ") || "No address on file"}
            </p>
            {app.license_number && (
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11.5px",color:"#94a3b8",margin:"2px 0 0"}}>
                License: {app.license_number}{app.gstin ? ` · GSTIN: ${app.gstin}` : ""}
              </p>
            )}
            {app.rejection_reason && (
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11.5px",color:"#991b1b",margin:"4px 0 0"}}>
                Rejected: {app.rejection_reason}
              </p>
            )}
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center",flexShrink:0}}>
            <span style={{background:app.application_status==="approved"?"#dcfce7":app.application_status==="rejected"?"#fee2e2":"#fef9c3",
              color:app.application_status==="approved"?"#15803d":app.application_status==="rejected"?"#991b1b":"#854d0e",
              fontSize:"11px",fontWeight:"700",padding:"3px 10px",borderRadius:"50px",fontFamily:"'Inter',sans-serif"}}>
              {app.application_status}
            </span>
            {app.application_status === "pending" && (
              <>
                <button onClick={()=>approve(app)} disabled={busyId===app.id}
                  style={{padding:"7px 14px",borderRadius:"7px",border:"none",cursor:"pointer",
                    background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
                    fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"12px"}}>
                  {busyId===app.id ? "…" : "Approve"}
                </button>
                <button onClick={()=>reject(app)} disabled={busyId===app.id}
                  style={{padding:"7px 14px",borderRadius:"7px",border:"1.5px solid #fecaca",
                    background:"#fef2f2",color:"#991b1b",cursor:"pointer",
                    fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"12px"}}>
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Subscription plan catalog CRUD — shared by PharmacyManagement.jsx
// (type="pharmacy") and LabAndFamilyPlans.jsx (type="lab"). Hits
// GET/POST/PUT /admin/{type}-plans — same shape as individual_plans'
// admin CRUD (Companies.jsx's PlansTab), just with a `features` list
// instead of consultations/family-member counts.
export function PartnerPlansTab({ token, type }) {
  const empty = () => ({ name:"", description:"", monthly_amount:"", annual_amount:"", features:"", is_active:true, sort_order:999 });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/${type}-plans`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setPlans(json.plans || []);
    } catch { setPlans([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setEditing(null); setForm(empty()); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p, monthly_amount: String(p.monthly_amount), annual_amount: String(p.annual_amount ?? ""),
      features: (p.features || []).join("\n") });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.monthly_amount) { alert("Name and monthly amount are required."); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        monthly_amount: Number(form.monthly_amount),
        annual_amount: form.annual_amount ? Number(form.annual_amount) : null,
        sort_order: Number(form.sort_order) || 999,
        features: form.features.split("\n").map(f => f.trim()).filter(Boolean),
      };
      const url = editing ? `${API}/admin/${type}-plans/${editing.id}` : `${API}/admin/${type}-plans`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { alert(json.detail || "Couldn't save plan."); return; }
      setShowForm(false); fetchAll();
    } catch { alert("Network error."); }
    finally { setSaving(false); }
  };

  const inp = { width:"100%", border:"1.5px solid var(--wc-border)", borderRadius:"9px", padding:"9px 12px",
    fontFamily:"'Inter',sans-serif", fontSize:"13.5px", color:"#1e293b", background:"var(--wc-warm-white)", outline:"none", marginBottom:"10px" };
  const lbl = { display:"block", fontFamily:"'Inter',sans-serif", fontSize:"12px", fontWeight:"600", color:"#374151", marginBottom:"5px" };

  return (
    <div>
      <button onClick={openNew} style={{padding:"10px 18px",borderRadius:"9px",border:"none",cursor:"pointer",
        background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
        fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"13px",marginBottom:"16px"}}>
        + Add Plan
      </button>

      {showForm && (
        <div style={{background:"#fff",border:"1.5px solid var(--wc-border)",borderRadius:"12px",padding:"18px",marginBottom:"16px"}}>
          <label style={lbl} htmlFor="pp-name">Plan Name *</label>
          <input id="pp-name" style={inp} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <label style={lbl} htmlFor="pp-desc">Description</label>
          <input id="pp-desc" style={inp} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            <div>
              <label style={lbl} htmlFor="pp-monthly">Monthly Amount (₹) *</label>
              <input id="pp-monthly" type="number" style={inp} value={form.monthly_amount}
                onChange={e=>setForm(f=>({...f,monthly_amount:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl} htmlFor="pp-annual">Annual Amount (₹)</label>
              <input id="pp-annual" type="number" style={inp} value={form.annual_amount}
                onChange={e=>setForm(f=>({...f,annual_amount:e.target.value}))}/>
            </div>
          </div>
          <label style={lbl} htmlFor="pp-features">Features (one per line)</label>
          <textarea id="pp-features" style={{...inp,minHeight:"80px",resize:"vertical"}} value={form.features}
            onChange={e=>setForm(f=>({...f,features:e.target.value}))}/>
          <label style={lbl} htmlFor="pp-sort">Sort Order</label>
          <input id="pp-sort" type="number" style={inp} value={form.sort_order}
            onChange={e=>setForm(f=>({...f,sort_order:e.target.value}))}/>
          <label style={{...lbl,display:"flex",alignItems:"center",gap:"8px"}}>
            <input type="checkbox" checked={form.is_active} onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/>
            Active (visible to partners)
          </label>
          <div style={{display:"flex",gap:"10px",marginTop:"8px"}}>
            <button onClick={()=>setShowForm(false)} style={{flex:1,padding:"9px",borderRadius:"8px",
              border:"1.5px solid var(--wc-border)",background:"var(--wc-warm-white)",color:"var(--wc-muted)",
              fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>Cancel</button>
            <button onClick={save} disabled={saving} style={{flex:1,padding:"9px",borderRadius:"8px",
              border:"none",background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
              fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"13px",cursor:"pointer"}}>
              {saving?"Saving…":"Save"}
            </button>
          </div>
        </div>
      )}

      {loading ? <Spinner/> : plans.length === 0 ? (
        <p style={{fontFamily:"'Inter',sans-serif",color:"#94a3b8",fontSize:"13px"}}>No plans yet.</p>
      ) : plans.map(p => (
        <div key={p.id} style={{background:"#fff",border:"1.5px solid var(--wc-border)",borderRadius:"12px",
          padding:"14px 18px",marginBottom:"10px",display:"flex",justifyContent:"space-between",
          alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
          <div>
            <strong style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-navy)"}}>{p.name}</strong>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"var(--wc-muted)",margin:"3px 0 0"}}>
              ₹{p.monthly_amount}/mo{p.annual_amount ? ` · ₹${p.annual_amount}/yr` : ""}
            </p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
            <span style={{padding:"4px 12px",borderRadius:"7px",fontSize:"11.5px",fontWeight:"700",fontFamily:"'Inter',sans-serif",
              background:p.is_active?"#dcfce7":"#fee2e2",color:p.is_active?"#15803d":"#991b1b"}}>
              {p.is_active?"Active":"Inactive"}
            </span>
            {/* Edit previously only worked by clicking anywhere on the
                row — no visible affordance told admin the row was
                clickable at all. Explicit buttons now, plus Delete,
                which had no UI or backend route before this. */}
            <button onClick={()=>openEdit(p)} style={{padding:"6px 12px",borderRadius:"7px",
              border:"1.5px solid var(--wc-border)",background:"#fff",color:"#374151",cursor:"pointer",
              fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"12px"}}>
              Edit
            </button>
            <button onClick={()=>{
                if (!window.confirm(`Deactivate the "${p.name}" plan? It will no longer be offered to new sign-ups (existing subscribers are unaffected).`)) return;
                fetch(`${API}/admin/${type}-plans/${p.id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } })
                  .then(res => { if (!res.ok) throw new Error(); fetchAll(); })
                  .catch(() => alert("Couldn't delete this plan."));
              }} style={{padding:"6px 12px",borderRadius:"7px",
              border:"1.5px solid #fecaca",background:"#fef2f2",color:"#991b1b",cursor:"pointer",
              fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"12px"}}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


export function BarChart({ data, color="var(--wc-green)", title="" }) {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div>
      {title && <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",
        fontWeight:"700",color:"#374151",marginBottom:"8px"}}>{title}</p>}
      <div className="bar-wrap">
        {data.map((d,i)=>(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",
            alignItems:"center",minWidth:0}}>
            <div title={`${d.label}: ${d.value}`}
              className="bar"
              style={{
                width:"100%",
                height:`${Math.max((d.value/max)*100,4)}%`,
                background:`linear-gradient(180deg,${color},${color}cc)`,
              }}/>
            <div className="bar-label">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Doctor Specialization field — used to be a free-text input, which is
// how doctors ended up with specialization values that don't match any
// row in the Specialties admin list (e.g. wrong casing) and made this
// field impossible to keep in sync with what's actually configured
// there. Now a dropdown sourced live from GET /admin/specialties, with
// an inline "add new" option for when the specialty genuinely isn't in
// the list yet — adds it, then selects it immediately.
export function SpecializationSelect({ value, onChange, id, style, className }) {
  const [specialties, setSpecialties] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("wc4a_token") : null;

  const load = async () => {
    try {
      const res  = await fetch(`${API}/admin/specialties`, { headers: { Authorization: `Bearer ${token}` }});
      const json = await res.json();
      setSpecialties(json.specialties || []);
    } catch { setSpecialties([]); }
  };
  useEffect(() => { load(); }, []);

  const handleChange = async (e) => {
    const v = e.target.value;
    if (v !== "__add_new__") { onChange(v); return; }
    const name = window.prompt("New specialization name (e.g. Cardiology):");
    if (!name || !name.trim()) return;
    try {
      const res  = await fetch(`${API}/admin/specialties`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.trim(), icon: "🏥", description: "", is_active: true,
          sort_order: ((specialties?.length || 0) + 1) * 10,
        }),
      });
      const json = await res.json();
      if (!res.ok) { alert(json.detail || "Couldn't add that specialization."); return; }
      await load();
      onChange(name.trim());
    } catch { alert("Network error — couldn't add that specialization."); }
  };

  if (specialties === null) {
    return <select disabled id={id} style={style} className={className}><option>Loading…</option></select>;
  }

  // A doctor's existing value might not exactly match any specialty name
  // (legacy free-text data, different casing, etc.) — surface it as its
  // own option instead of silently blanking the field out from under them.
  const hasMatch = specialties.some(s => s.name.toLowerCase() === (value || "").toLowerCase());

  return (
    <select id={id} value={value || ""} onChange={handleChange} style={style} className={className}>
      <option value="">Select…</option>
      {value && !hasMatch && <option value={value}>{value} (not in Specialties list)</option>}
      {specialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      <option value="__add_new__">+ Add New Specialization…</option>
    </select>
  );
}
