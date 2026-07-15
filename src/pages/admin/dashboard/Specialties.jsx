import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API, SpecialtyIcon, SectionHead } from "./shared";

export default function Specialties({ token }) {
  const { t } = useTranslation();
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm,setShowForm]= useState(false);
  const [editing, setEditing] = useState(null); // null = new, obj = edit
  const [form,    setForm]    = useState({ name:"", icon:"🏥", description:"", is_active:true, sort_order:999 });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState(null);
  const [iconUploading, setIconUploading] = useState(false);
  const boxRef = useRef(null);
  useModalA11y(boxRef, () => setShowForm(false), showForm);

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
      if (!res.ok) { setErr(json.detail || t("adminPages.specialties.iconUploadFailed")); return; }
      setForm(f => ({ ...f, icon: json.url }));
    } catch { setErr(t("adminPages.specialties.iconUploadNetworkError")); }
    finally { setIconUploading(false); }
  };

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/specialties`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setList(json.specialties || []);
    } catch { setErr(t("adminPages.specialties.loadFailed")); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  const openNew  = () => { setEditing(null); setForm({ name:"", icon:"🏥", description:"", is_active:true, sort_order: (list.length+1)*10 }); setShowForm(true); setErr(null); };
  const openEdit = (s) => { setEditing(s); setForm({ name:s.name, icon:s.icon||"🏥", description:s.description||"", is_active:s.is_active, sort_order:s.sort_order||999 }); setShowForm(true); setErr(null); };

  const save = async () => {
    if (!form.name.trim()) { setErr(t("adminPages.specialties.nameRequired")); return; }
    const iconVal = (form.icon || "").trim();
    if (iconVal.startsWith("<")) {
      setErr(t("adminPages.specialties.htmlSnippetError"));
      return;
    }
    setSaving(true); setErr(null);
    const url    = editing ? `${API}/admin/specialties/${editing.id}` : `${API}/admin/specialties`;
    const method = editing ? "PUT" : "POST";
    try {
      const res  = await fetch(url, { method, headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body:JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || t("adminPages.specialties.saveFailed")); return; }
      setShowForm(false);
      fetch_();
    } catch { setErr(t("adminPages.specialties.networkError")); }
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
    if (!window.confirm(t("adminPages.specialties.confirmDelete"))) return;
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
      <SectionHead title={t("adminPages.specialties.heading")} count={list.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"16px"}}>
        {t("adminPages.specialties.note")}
      </p>

      {/* Add button */}
      <button onClick={openNew} className="ad-btn" style={{marginBottom:"20px",display:"inline-flex",alignItems:"center",gap:"8px"}}>
        {t("adminPages.specialties.addBtn")}
      </button>

      {/* Error */}
      {err && <p style={{color:"#dc2626",fontSize:"13px",marginBottom:"12px"}}>❌ {err}</p>}

      {/* Form modal */}
      {showForm && (
        <div style={{position:"fixed",inset:0,background:"rgba(11,31,58,.5)",zIndex:9999,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
          onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div ref={boxRef} role="dialog" aria-modal="true" aria-label={editing ? "Edit Specialty" : "Add New Specialty"}
            style={{background:"#fff",borderRadius:"16px",padding:"28px",width:"100%",maxWidth:"480px",
            boxShadow:"0 20px 60px rgba(11,31,58,.2)"}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontWeight:"700",
              color:"#0b1f3a",margin:"0 0 20px"}}>
              {editing ? t("adminPages.specialties.editTitle") : t("adminPages.specialties.addTitle")}
            </h3>

            {/* Icon picker */}
            <p className="ad-lbl">{t("adminPages.specialties.icon")}</p>
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

            <p className="ad-lbl">{t("adminPages.specialties.uploadCustomIcon")}</p>
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
                {iconUploading ? t("adminPages.specialties.uploading") : t("adminPages.specialties.chooseImage")}
                <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
                  disabled={iconUploading} style={{display:"none"}}
                  onChange={e => uploadIcon(e.target.files?.[0])}/>
              </label>
            </div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#6b7688",margin:"0 0 14px"}}>
              {t("adminPages.specialties.iconLicenseNote")}
            </p>

            <label className="ad-lbl" htmlFor="admin-dashboard-name">{t("adminPages.specialties.name")}</label>
            <input id="admin-dashboard-name" className="ad-inp" value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              placeholder={t("adminPages.specialties.namePlaceholder")} style={{marginBottom:"12px"}}/>

            <label className="ad-lbl" htmlFor="admin-dashboard-description">{t("adminPages.specialties.description")}</label>
            <input id="admin-dashboard-description" className="ad-inp" value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              placeholder={t("adminPages.specialties.descriptionPlaceholder")} style={{marginBottom:"12px"}}/>

            <label className="ad-lbl" htmlFor="admin-dashboard-sort-order">{t("adminPages.specialties.sortOrder")}</label>
            <input id="admin-dashboard-sort-order" className="ad-inp" type="number" onWheel={e=>e.currentTarget.blur()} value={form.sort_order}
              onChange={e=>setForm(f=>({...f,sort_order:parseInt(e.target.value)||999}))}
              style={{marginBottom:"12px"}}/>

            <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'DM Sans',sans-serif",
              fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"20px",cursor:"pointer"}}>
              <input type="checkbox" checked={form.is_active}
                onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/>
              {t("adminPages.specialties.activeLabel")}
            </label>

            {err && <p style={{color:"#dc2626",fontSize:"12.5px",marginBottom:"12px"}}>❌ {err}</p>}

            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={()=>setShowForm(false)}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
                  background:"#f8fafc",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"13px",color:"#64748b",cursor:"pointer"}}>
                {t("adminPages.specialties.cancel")}
              </button>
              <button onClick={save} disabled={saving} className="ad-btn" style={{flex:1}}>
                {saving ? t("adminPages.specialties.saving") : editing ? t("adminPages.specialties.update") : t("adminPages.specialties.addSpecialty")}
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
        <div style={{textAlign:"center",padding:"40px",color:"#6b7688",fontFamily:"'DM Sans',sans-serif"}}>
          {t("adminPages.specialties.none")}
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
                  color:"#6b7688",margin:"2px 0 0",whiteSpace:"nowrap",overflow:"hidden",
                  textOverflow:"ellipsis"}}>{s.description}</p>}
                <span style={{fontSize:"10px",fontWeight:"700",color:s.is_active?"#047857":"#6b7688",
                  fontFamily:"'DM Sans',sans-serif"}}>
                  {s.is_active?t("adminPages.specialties.activeStatus"):t("adminPages.specialties.hiddenStatus")} · #{s.sort_order}
                </span>
              </div>
              <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                <button onClick={()=>toggle(s)} title={s.is_active?t("adminPages.specialties.hide"):t("adminPages.specialties.show")}
                  style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                    fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                    background:s.is_active?"#fef9c3":"#dcfce7",
                    color:s.is_active?"#92400e":"#15803d"}}>
                  {s.is_active?t("adminPages.specialties.hide"):t("adminPages.specialties.show")}
                </button>
                <button onClick={()=>openEdit(s)}
                  style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                    fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                    background:"#eff8ff",color:"#0369a1"}}>
                  {t("adminPages.specialties.edit")}
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
