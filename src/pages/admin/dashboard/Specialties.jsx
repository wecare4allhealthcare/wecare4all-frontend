import { useState, useEffect } from "react";
import { API, SpecialtyIcon, SectionHead } from "./shared";

export default function Specialties({ token }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm,setShowForm]= useState(false);
  const [editing, setEditing] = useState(null); // null = new, obj = edit
  const [form,    setForm]    = useState({ name:"", icon:"🏥", description:"", is_active:true, sort_order:999 });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState(null);
  const [iconUploading, setIconUploading] = useState(false);

  const uploadIcon = async (file) => {
    if (!file) return;
    setIconUploading(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch(`${API}/admin/specialties/icon-upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets multipart boundary
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Icon upload failed"); return; }
      setForm(f => ({ ...f, icon: json.url }));
    } catch { setErr("Network error uploading icon"); }
    finally { setIconUploading(false); }
  };

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/specialties`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setList(json.specialties || []);
    } catch { setErr("Failed to load"); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  const openNew  = () => { setEditing(null); setForm({ name:"", icon:"🏥", description:"", is_active:true, sort_order: (list.length+1)*10 }); setShowForm(true); setErr(null); };
  const openEdit = (s) => { setEditing(s); setForm({ name:s.name, icon:s.icon||"🏥", description:s.description||"", is_active:s.is_active, sort_order:s.sort_order||999 }); setShowForm(true); setErr(null); };

  const save = async () => {
    if (!form.name.trim()) { setErr("Name is required"); return; }
    const iconVal = (form.icon || "").trim();
    if (iconVal.startsWith("<")) {
      setErr("That looks like an HTML/embed snippet (e.g. Flaticon's attribution code), not an image link. Right-click the actual icon image and \"Copy image address\" instead — or better, download it and upload it to your own storage.");
      return;
    }
    setSaving(true); setErr(null);
    const url    = editing ? `${API}/admin/specialties/${editing.id}` : `${API}/admin/specialties`;
    const method = editing ? "PUT" : "POST";
    try {
      const res  = await fetch(url, { method, headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body:JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Save failed"); return; }
      setShowForm(false);
      fetch_();
    } catch { setErr("Network error"); }
    finally { setSaving(false); }
  };

  const toggle = async (s) => {
    await fetch(`${API}/admin/specialties/${s.id}`, {
      method:"PUT",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ ...s, is_active: !s.is_active }),
    });
    fetch_();
  };

  const del = async (id) => {
    if (!window.confirm("Delete this specialty?")) return;
    await fetch(`${API}/admin/specialties/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    fetch_();
  };

  // Icons kept to well-established emoji (pre-2019) for broad font support —
  // 🩻 (x-ray), 🫀 (anatomical heart), and 🫶 (heart hands) are all 2021-22
  // additions that render as blank boxes on older Windows/Chrome emoji
  // fonts, which is exactly what was showing up empty in the picker.
  const ICONS = ["❤️","🧠","🦴","🎗️","👁️","👂","🫁","🧬","🦷","💊","👶","🌸","🧘","🧪","🧩","🔬","🏥","🩺","💉","🩹","🧒","🦻"];

  return (
    <div>
      <SectionHead title="Specialties" count={list.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"16px"}}>
        Manage the medical specialties shown on the public Services page. Changes appear live immediately.
      </p>

      {/* Add button */}
      <button onClick={openNew} className="ad-btn" style={{marginBottom:"20px",display:"inline-flex",alignItems:"center",gap:"8px"}}>
        + Add Specialty
      </button>

      {/* Error */}
      {err && <p style={{color:"#dc2626",fontSize:"13px",marginBottom:"12px"}}>❌ {err}</p>}

      {/* Form modal */}
      {showForm && (
        <div style={{position:"fixed",inset:0,background:"rgba(11,31,58,.5)",zIndex:9999,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
          <div style={{background:"#fff",borderRadius:"16px",padding:"28px",width:"100%",maxWidth:"480px",
            boxShadow:"0 20px 60px rgba(11,31,58,.2)"}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontWeight:"700",
              color:"#0b1f3a",margin:"0 0 20px"}}>
              {editing ? "Edit Specialty" : "Add New Specialty"}
            </h3>

            {/* Icon picker */}
            <p className="ad-lbl">Icon</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"14px"}}>
              {ICONS.map(ic => (
                <button key={ic} onClick={()=>setForm(f=>({...f,icon:ic}))}
                  style={{width:"36px",height:"36px",borderRadius:"8px",border:"none",
                    fontSize:"18px",cursor:"pointer",
                    background:form.icon===ic?"#dcfce7":"#f8fafc",
                    outline:form.icon===ic?"2px solid #047857":"none"}}>
                  {ic}
                </button>
              ))}
            </div>

            <p className="ad-lbl">Or upload a custom icon image</p>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px"}}>
              <div style={{width:"44px",height:"44px",borderRadius:"8px",border:"1.5px solid #e2eaf4",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:"#f8fafc"}}>
                {iconUploading
                  ? <span className="spin" style={{width:"18px",height:"18px"}}/>
                  : <SpecialtyIcon icon={form.icon} size={22}/>}
              </div>
              <label style={{flex:1,cursor:iconUploading?"not-allowed":"pointer",
                padding:"9px 14px",borderRadius:"8px",border:"1.5px dashed #cbd5e1",
                background:"#f8fafc",textAlign:"center",
                fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",fontWeight:"600",
                color:"#64748b"}}>
                {iconUploading ? "Uploading…" : "📤 Choose image (SVG, PNG, JPEG, WEBP — max 1MB)"}
                <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
                  disabled={iconUploading} style={{display:"none"}}
                  onChange={e => uploadIcon(e.target.files?.[0])}/>
              </label>
            </div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#94a3b8",margin:"0 0 14px"}}>
              If sourcing from an icon library like Flaticon, download the actual icon file (not the
              attribution/embed code) and check their license — attribution may be required unless you're on a premium plan.
            </p>

            <label className="ad-lbl" htmlFor="admin-dashboard-name">Name *</label>
            <input id="admin-dashboard-name" className="ad-inp" value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              placeholder="e.g. Cardiology" style={{marginBottom:"12px"}}/>

            <label className="ad-lbl" htmlFor="admin-dashboard-description">Description</label>
            <input id="admin-dashboard-description" className="ad-inp" value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              placeholder="e.g. Heart disease, hypertension, ECG..." style={{marginBottom:"12px"}}/>

            <label className="ad-lbl" htmlFor="admin-dashboard-sort-order">Sort Order</label>
            <input id="admin-dashboard-sort-order" className="ad-inp" type="number" onWheel={e=>e.currentTarget.blur()} value={form.sort_order}
              onChange={e=>setForm(f=>({...f,sort_order:parseInt(e.target.value)||999}))}
              style={{marginBottom:"12px"}}/>

            <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'DM Sans',sans-serif",
              fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"20px",cursor:"pointer"}}>
              <input type="checkbox" checked={form.is_active}
                onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/>
              Active (visible on public site)
            </label>

            {err && <p style={{color:"#dc2626",fontSize:"12.5px",marginBottom:"12px"}}>❌ {err}</p>}

            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={()=>setShowForm(false)}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
                  background:"#f8fafc",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"13px",color:"#64748b",cursor:"pointer"}}>
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="ad-btn" style={{flex:1}}>
                {saving ? "Saving…" : editing ? "Update" : "Add Specialty"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{padding:"40px",textAlign:"center"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
            borderTop:"3px solid #047857",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : list.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#94a3b8",fontFamily:"'DM Sans',sans-serif"}}>
          No specialties yet. Click "Add Specialty" to get started.
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px"}}>
          {list.map(s => (
            <div key={s.id} style={{background:"#fff",border:`1.5px solid ${s.is_active?"#e2eaf4":"#f1f5f9"}`,
              borderRadius:"12px",padding:"14px 16px",display:"flex",alignItems:"center",gap:"12px",
              opacity:s.is_active?1:0.6}}>
              <SpecialtyIcon icon={s.icon} size={24}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",color:"#0b1f3a",
                  fontSize:"14px",margin:0}}>{s.name}</p>
                {s.description && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
                  color:"#94a3b8",margin:"2px 0 0",whiteSpace:"nowrap",overflow:"hidden",
                  textOverflow:"ellipsis"}}>{s.description}</p>}
                <span style={{fontSize:"10px",fontWeight:"700",color:s.is_active?"#047857":"#94a3b8",
                  fontFamily:"'DM Sans',sans-serif"}}>
                  {s.is_active?"● Active":"○ Hidden"} · #{s.sort_order}
                </span>
              </div>
              <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                <button onClick={()=>toggle(s)} title={s.is_active?"Hide":"Show"}
                  style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                    fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                    background:s.is_active?"#fef9c3":"#dcfce7",
                    color:s.is_active?"#92400e":"#15803d"}}>
                  {s.is_active?"Hide":"Show"}
                </button>
                <button onClick={()=>openEdit(s)}
                  style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                    fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                    background:"#eff8ff",color:"#0369a1"}}>
                  Edit
                </button>
                <button onClick={()=>del(s.id)}
                  style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                    fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                    background:"#fee2e2",color:"#dc2626"}}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
