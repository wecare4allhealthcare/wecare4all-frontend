/**
 * admin/dashboard/PharmacyManagement.jsx — admin creates the
 * pharmacy partner record(s) and staff login accounts, and gets a
 * read-only overview of every order across the system. Day-to-day
 * order fulfillment itself happens in the pharmacy's own portal
 * (pharmacy/Dashboard.jsx), not here.
 */
import { useEffect, useState } from "react";
import { API, SectionHead } from "./shared";

const STATUS_META = {
  pending:          { label:"Pending",          bg:"#fef9c3", color:"#854d0e" },
  confirmed:        { label:"Confirmed",         bg:"#eff8ff", color:"#0369a1" },
  preparing:        { label:"Preparing",         bg:"#faf5ff", color:"#7c3aed" },
  out_for_delivery: { label:"Out for Delivery",  bg:"#fff7ed", color:"#c2410c" },
  delivered:        { label:"Delivered",         bg:"#f0fdf4", color:"#15803d" },
  cancelled:        { label:"Cancelled",         bg:"#fef2f2", color:"#991b1b" },
};

export default function PharmacyManagement({ token }) {
  const [tab, setTab] = useState("pharmacies"); // pharmacies | staff | orders
  const [pharmacies, setPharmacies] = useState([]);
  const [staff,      setStaff]      = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);

  const [showPharmForm, setShowPharmForm] = useState(false);
  const [pharmForm, setPharmForm] = useState({ name:"", address:"", city:"", phone:"", email:"" });
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ pharmacy_id:"", email:"", password:"", full_name:"", phone:"" });
  const [credentials, setCredentials] = useState(null);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    // Promise.allSettled instead of Promise.all: previously a single
    // endpoint hiccup (e.g. a cold-start returning a non-JSON body) made
    // the shared catch{} wipe ALL THREE lists — pharmacies, staff, and
    // orders all going blank together even when only one request actually
    // failed. Each list is now set independently, so one bad response
    // doesn't take the other two down with it, and the error message
    // reflects only what actually failed.
    const [pRes, sRes, oRes] = await Promise.allSettled([
      fetch(`${API}/admin/pharmacies`,      { headers:{ Authorization:`Bearer ${token}` }}).then(r=>r.json()),
      fetch(`${API}/admin/pharmacy-staff`,  { headers:{ Authorization:`Bearer ${token}` }}).then(r=>r.json()),
      fetch(`${API}/admin/pharmacy-orders`, { headers:{ Authorization:`Bearer ${token}` }}).then(r=>r.json()),
    ]);
    const failed = [];
    if (pRes.status === "fulfilled") setPharmacies(pRes.value.pharmacies || []);
    else failed.push("pharmacies");
    if (sRes.status === "fulfilled") setStaff(sRes.value.staff || []);
    else failed.push("staff logins");
    if (oRes.status === "fulfilled") setOrders(oRes.value.orders || []);
    else failed.push("orders");
    setErr(failed.length ? `Failed to load: ${failed.join(", ")}. Try refreshing.` : null);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const savePharmacy = async () => {
    if (!pharmForm.name.trim()) { setErr("Pharmacy name is required"); return; }
    setSaving(true); setErr(null);
    try {
      const res = await fetch(`${API}/admin/pharmacies`, {
        method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(pharmForm),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Save failed"); return; }
      setShowPharmForm(false); setPharmForm({ name:"", address:"", city:"", phone:"", email:"" });
      fetchAll();
    } catch { setErr("Network error"); }
    finally { setSaving(false); }
  };

  const togglePharmacy = async (p) => {
    await fetch(`${API}/admin/pharmacies/${p.id}`, {
      method:"PUT", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ ...p, is_active: !p.is_active }),
    });
    fetchAll();
  };

  const saveStaff = async () => {
    if (!staffForm.pharmacy_id) { setErr("Choose a pharmacy for this staff account"); return; }
    if (!staffForm.email.trim() || !staffForm.password.trim() || !staffForm.full_name.trim()) {
      setErr("Name, email and password are required"); return;
    }
    setSaving(true); setErr(null);
    try {
      const res = await fetch(`${API}/admin/pharmacy-staff`, {
        method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(staffForm),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Save failed"); return; }
      setCredentials(json.credentials);
      setShowStaffForm(false);
      setStaffForm({ pharmacy_id:"", email:"", password:"", full_name:"", phone:"" });
      fetchAll();
    } catch { setErr("Network error"); }
    finally { setSaving(false); }
  };

  const toggleStaff = async (s) => {
    await fetch(`${API}/admin/pharmacy-staff/${s.id}/toggle`, { method:"PUT", headers:{ Authorization:`Bearer ${token}` }});
    fetchAll();
  };

  const inp = { width:"100%", border:"1.5px solid #e2eaf4", borderRadius:"9px", padding:"9px 12px",
    fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#1e293b", background:"#f8fafc", outline:"none" };
  const lbl = { display:"block", fontFamily:"'DM Sans',sans-serif", fontSize:"12px", fontWeight:"600", color:"#374151", marginBottom:"5px" };

  return (
    <div>
      <SectionHead title="Pharmacy" count={orders.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"16px"}}>
        Not a marketplace — every order auto-assigns to the one active pharmacy below. Add a second
        pharmacy only if you plan to route orders between locations (e.g. by city) in the future.
      </p>

      <div style={{display:"flex",gap:"8px",marginBottom:"18px",borderBottom:"1px solid #e2eaf4",
        overflowX:"auto",overflowY:"hidden",scrollbarWidth:"none"}}>
        {[["pharmacies","Pharmacies"],["staff","Staff Logins"],["orders","All Orders"]].map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)}
            style={{padding:"9px 16px",border:"none",borderBottom:tab===id?"2px solid #047857":"2px solid transparent",
              background:"none",color:tab===id?"#047857":"#64748b",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"700",fontSize:"13px",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{label}</button>
        ))}
      </div>

      {err && <p style={{color:"#dc2626",fontSize:"13px",marginBottom:"12px"}}>❌ {err}</p>}

      {credentials && (
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",padding:"14px 16px",marginBottom:"16px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:"#15803d",marginBottom:"6px"}}>
            Staff account created — share these credentials securely:
          </p>
          <p style={{fontFamily:"monospace",fontSize:"12.5px",color:"#0b1f3a",margin:0}}>
            {credentials.email} / {credentials.password}
          </p>
          <button onClick={()=>setCredentials(null)} style={{marginTop:"8px",padding:"5px 12px",
            borderRadius:"6px",border:"none",background:"#dcfce7",color:"#15803d",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"11.5px",cursor:"pointer"}}>Dismiss</button>
        </div>
      )}

      {loading ? (
        <div style={{padding:"40px",textAlign:"center"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
            borderTop:"3px solid #047857",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : tab === "pharmacies" ? (
        <div>
          <button onClick={()=>{setShowPharmForm(true);setErr(null);}}
            style={{padding:"10px 18px",borderRadius:"9px",border:"none",cursor:"pointer",
              background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",marginBottom:"16px"}}>
            + Add Pharmacy
          </button>
          {showPharmForm && (
            <div style={{background:"#fff",border:"1.5px solid #e2eaf4",borderRadius:"12px",padding:"18px",marginBottom:"16px"}}>
              <label style={lbl} htmlFor="ph-name">Pharmacy Name *</label>
              <input id="ph-name" style={{...inp,marginBottom:"10px"}} value={pharmForm.name}
                onChange={e=>setPharmForm(f=>({...f,name:e.target.value}))}/>
              <label style={lbl} htmlFor="ph-address">Address</label>
              <input id="ph-address" style={{...inp,marginBottom:"10px"}} value={pharmForm.address}
                onChange={e=>setPharmForm(f=>({...f,address:e.target.value}))}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                <input style={inp} placeholder="City" value={pharmForm.city}
                  onChange={e=>setPharmForm(f=>({...f,city:e.target.value}))}/>
                <input style={inp} placeholder="Phone" value={pharmForm.phone}
                  onChange={e=>setPharmForm(f=>({...f,phone:e.target.value}))}/>
              </div>
              <input style={{...inp,marginBottom:"14px"}} placeholder="Email" value={pharmForm.email}
                onChange={e=>setPharmForm(f=>({...f,email:e.target.value}))}/>
              <div style={{display:"flex",gap:"10px"}}>
                <button onClick={()=>setShowPharmForm(false)} style={{flex:1,padding:"9px",borderRadius:"8px",
                  border:"1.5px solid #e2eaf4",background:"#f8fafc",color:"#64748b",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>Cancel</button>
                <button onClick={savePharmacy} disabled={saving} style={{flex:1,padding:"9px",borderRadius:"8px",
                  border:"none",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",cursor:"pointer"}}>
                  {saving?"Saving…":"Save"}
                </button>
              </div>
            </div>
          )}
          {pharmacies.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"13px"}}>No pharmacies added yet.</p>
          ) : pharmacies.map(p => (
            <div key={p.id} style={{background:"#fff",border:"1.5px solid #e2eaf4",borderRadius:"12px",
              padding:"14px 18px",marginBottom:"10px",display:"flex",justifyContent:"space-between",
              alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
              <div>
                <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>{p.name}</strong>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",margin:"3px 0 0"}}>
                  {[p.address,p.city].filter(Boolean).join(", ")}
                </p>
              </div>
              <button onClick={()=>togglePharmacy(p)} style={{padding:"6px 14px",borderRadius:"7px",
                border:"none",cursor:"pointer",fontSize:"11.5px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                background:p.is_active?"#dcfce7":"#fee2e2",color:p.is_active?"#15803d":"#991b1b"}}>
                {p.is_active?"Active":"Inactive"}
              </button>
            </div>
          ))}
        </div>
      ) : tab === "staff" ? (
        <div>
          <button onClick={()=>{setShowStaffForm(true);setErr(null);}} disabled={pharmacies.length===0}
            style={{padding:"10px 18px",borderRadius:"9px",border:"none",
              cursor:pharmacies.length===0?"default":"pointer",
              background:pharmacies.length===0?"#e2eaf4":"linear-gradient(135deg,#047857,#059669)",
              color:pharmacies.length===0?"#94a3b8":"#fff",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",marginBottom:"16px"}}>
            + Add Staff Login
          </button>
          {pharmacies.length===0 && (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#94a3b8",marginTop:"-10px",marginBottom:"14px"}}>
              Add a pharmacy first.
            </p>
          )}
          {showStaffForm && (
            <div style={{background:"#fff",border:"1.5px solid #e2eaf4",borderRadius:"12px",padding:"18px",marginBottom:"16px"}}>
              <label style={lbl} htmlFor="st-pharm">Pharmacy *</label>
              <select id="st-pharm" style={{...inp,marginBottom:"10px"}} value={staffForm.pharmacy_id}
                onChange={e=>setStaffForm(f=>({...f,pharmacy_id:e.target.value}))}>
                <option value="">Select pharmacy…</option>
                {pharmacies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <label style={lbl} htmlFor="st-name">Staff Name *</label>
              <input id="st-name" style={{...inp,marginBottom:"10px"}} value={staffForm.full_name}
                onChange={e=>setStaffForm(f=>({...f,full_name:e.target.value}))}/>
              <label style={lbl} htmlFor="st-email">Email *</label>
              <input id="st-email" style={{...inp,marginBottom:"10px"}} value={staffForm.email}
                onChange={e=>setStaffForm(f=>({...f,email:e.target.value}))}/>
              <label style={lbl} htmlFor="st-password">Password *</label>
              <input id="st-password" style={{...inp,marginBottom:"14px"}} value={staffForm.password}
                onChange={e=>setStaffForm(f=>({...f,password:e.target.value}))}/>
              <div style={{display:"flex",gap:"10px"}}>
                <button onClick={()=>setShowStaffForm(false)} style={{flex:1,padding:"9px",borderRadius:"8px",
                  border:"1.5px solid #e2eaf4",background:"#f8fafc",color:"#64748b",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>Cancel</button>
                <button onClick={saveStaff} disabled={saving} style={{flex:1,padding:"9px",borderRadius:"8px",
                  border:"none",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",cursor:"pointer"}}>
                  {saving?"Creating…":"Create Login"}
                </button>
              </div>
            </div>
          )}
          {staff.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"13px"}}>No staff accounts yet.</p>
          ) : staff.map(s => (
            <div key={s.id} style={{background:"#fff",border:"1.5px solid #e2eaf4",borderRadius:"12px",
              padding:"14px 18px",marginBottom:"10px",display:"flex",justifyContent:"space-between",
              alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
              <div>
                <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>{s.full_name}</strong>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",margin:"3px 0 0"}}>{s.email}</p>
              </div>
              <button onClick={()=>toggleStaff(s)} style={{padding:"6px 14px",borderRadius:"7px",
                border:"none",cursor:"pointer",fontSize:"11.5px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                background:s.is_active?"#dcfce7":"#fee2e2",color:s.is_active?"#15803d":"#991b1b"}}>
                {s.is_active?"Active":"Inactive"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {orders.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"13px"}}>No orders yet.</p>
          ) : orders.map(o => {
            const meta = STATUS_META[o.status] || STATUS_META.pending;
            return (
              <div key={o.id} style={{background:"#fff",border:"1.5px solid #e2eaf4",borderRadius:"12px",
                padding:"14px 18px",marginBottom:"10px",display:"flex",justifyContent:"space-between",
                alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
                <div>
                  <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                    #{o.id.slice(-8).toUpperCase()}
                  </strong>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",margin:"3px 0 0"}}>
                    {o.delivery_address}{o.delivery_city?`, ${o.delivery_city}`:""} · {o.contact_mobile}
                  </p>
                </div>
                <span style={{background:meta.bg,color:meta.color,fontSize:"11px",fontWeight:"700",
                  padding:"3px 10px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>{meta.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
