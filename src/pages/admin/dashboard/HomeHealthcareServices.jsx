/**
 * admin/dashboard/HomeHealthcareServices.jsx — Admin manages Home
 * Healthcare service pricing (Feature #5).
 *
 * Before this page existed, home_healthcare_services.base_price (and
 * every other pricing field) could only be changed directly in the
 * Supabase dashboard — nothing in the app itself made the "Home
 * Healthcare consultation fee" admin-editable, which was the client's
 * explicit requirement. This is also where Physiotherapy sub-categories
 * (General, Pain Therapy, Rehabilitation, Pulmonary, Neuro, Pediatric,
 * Sports, Deep Tissue Release, etc.) get created — each is simply its
 * own service row with category="physiotherapy" and its own price, so
 * adding a new sub-category never needs a schema or code change.
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API, SectionHead } from "./shared";

// PRICE_UNITS labels come from t("adminPages.homeHealthcareServices.priceUnits.*")
// inside the component. CATEGORY_SUGGESTIONS values are data (sent to the
// backend as-is), left untranslated intentionally.
const CATEGORY_SUGGESTIONS = [
  "physiotherapy", "nursing", "lab", "post-surgery-care", "audiometry",
];

const emptyForm = {
  name: "", description: "", category: "", base_price: "", price_unit: "per_visit",
  weekend_multiplier: 1, night_extra: 0, duration_hours: "", is_active: true, sort_order: 999,
};

export default function HomeHealthcareServices({ token }) {
  const { t } = useTranslation();
  const PRICE_UNITS = [
    { id: "per_visit", label: t("adminPages.homeHealthcareServices.priceUnits.per_visit") },
    { id: "per_hour",  label: t("adminPages.homeHealthcareServices.priceUnits.per_hour") },
    { id: "per_shift", label: t("adminPages.homeHealthcareServices.priceUnits.per_shift") },
  ];
  // Suggestions only — admin can type any category. Pre-filled with the
  // client's requested Physiotherapy sub-categories so the first-time
  // setup is a few clicks, not free typing eight times.
  const PHYSIO_SUBCATEGORY_PRESETS = t("adminPages.homeHealthcareServices.physioPresets", {returnObjects:true});
  const [list,     setList]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null); // null = new, obj = edit
  const [form,     setForm]     = useState(emptyForm);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/home-healthcare/admin/services`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setList(json.services || []);
    } catch { setErr(t("adminPages.homeHealthcareServices.loadFailed")); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchList(); }, []);

  const openNew  = () => { setEditing(null); setForm({ ...emptyForm, sort_order:(list.length+1)*10 }); setShowForm(true); setErr(null); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || "", description: s.description || "", category: s.category || "",
      base_price: s.base_price ?? "", price_unit: s.price_unit || "per_visit",
      weekend_multiplier: s.weekend_multiplier ?? 1, night_extra: s.night_extra ?? 0,
      duration_hours: s.duration_hours ?? "", is_active: s.is_active !== false,
      sort_order: s.sort_order ?? 999,
    });
    setShowForm(true); setErr(null);
  };

  const save = async () => {
    if (!form.name.trim()) { setErr(t("adminPages.homeHealthcareServices.nameRequired")); return; }
    if (form.base_price === "" || Number(form.base_price) < 0) { setErr(t("adminPages.homeHealthcareServices.invalidPrice")); return; }
    setSaving(true); setErr(null);
    const url    = editing ? `${API}/home-healthcare/admin/services/${editing.id}` : `${API}/home-healthcare/admin/services`;
    const method = editing ? "PUT" : "POST";
    const payload = {
      ...form,
      base_price:         Number(form.base_price),
      weekend_multiplier: Number(form.weekend_multiplier) || 1,
      night_extra:        Number(form.night_extra) || 0,
      duration_hours:     form.duration_hours ? parseInt(form.duration_hours) : null,
      sort_order:         parseInt(form.sort_order) || 999,
      category:           form.category.trim() || null,
    };
    try {
      const res  = await fetch(url, { method, headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || t("adminPages.homeHealthcareServices.saveFailed")); return; }
      setShowForm(false);
      fetchList();
    } catch { setErr(t("adminPages.homeHealthcareServices.networkError")); }
    finally { setSaving(false); }
  };

  const toggle = async (s) => {
    await fetch(`${API}/home-healthcare/admin/services/${s.id}`, {
      method:"PUT",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ ...s, is_active: !s.is_active }),
    });
    fetchList();
  };

  const del = async (id) => {
    if (!window.confirm(t("adminPages.homeHealthcareServices.confirmDelete"))) return;
    await fetch(`${API}/home-healthcare/admin/services/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    fetchList();
  };

  const addPhysioPreset = (label) => {
    setEditing(null);
    setForm({ ...emptyForm, name: label, category: "physiotherapy", sort_order:(list.length+1)*10 });
    setShowForm(true); setErr(null);
  };

  const inp = { width:"100%", border:"1.5px solid #e2eaf4", borderRadius:"9px", padding:"9px 12px",
    fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#1e293b", background:"#f8fafc", outline:"none" };
  const lbl = { display:"block", fontFamily:"'DM Sans',sans-serif", fontSize:"12px", fontWeight:"600", color:"#374151", marginBottom:"5px" };

  // Group services by category for display — physiotherapy sub-categories
  // (and anything else an admin adds) cluster together instead of one
  // long flat list.
  const groups = {};
  for (const s of list) {
    const key = s.category || t("adminPages.homeHealthcareServices.uncategorized");
    (groups[key] = groups[key] || []).push(s);
  }

  return (
    <div>
      <SectionHead title={t("adminPages.homeHealthcareServices.heading")} count={list.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"16px"}}>
        {t("adminPages.homeHealthcareServices.note")}
      </p>

      <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"20px"}}>
        <button onClick={openNew}
          style={{padding:"10px 18px",borderRadius:"9px",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
          {t("adminPages.homeHealthcareServices.addService")}
        </button>
        {PHYSIO_SUBCATEGORY_PRESETS.filter(p => !list.some(s => s.name === p)).length > 0 && (
          <details style={{position:"relative"}}>
            <summary style={{padding:"10px 18px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
              cursor:"pointer",background:"#f8fafc",fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
              fontSize:"13px",color:"#374151",listStyle:"none"}}>
              {t("adminPages.homeHealthcareServices.quickAddPhysio")}
            </summary>
            <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,background:"#fff",
              border:"1.5px solid #e2eaf4",borderRadius:"10px",boxShadow:"0 8px 24px rgba(11,31,58,.15)",
              padding:"8px",zIndex:10,minWidth:"220px"}}>
              {PHYSIO_SUBCATEGORY_PRESETS.filter(p => !list.some(s => s.name === p)).map(p => (
                <button key={p} onClick={()=>addPhysioPreset(p)}
                  style={{display:"block",width:"100%",textAlign:"left",padding:"7px 10px",
                    border:"none",background:"none",cursor:"pointer",borderRadius:"6px",
                    fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#374151"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"}
                  onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  + {p}
                </button>
              ))}
            </div>
          </details>
        )}
      </div>

      {err && !showForm && <p style={{color:"#dc2626",fontSize:"13px",marginBottom:"12px"}}>❌ {err}</p>}

      {/* Form modal */}
      {showForm && (
        <div style={{position:"fixed",inset:0,background:"rgba(11,31,58,.5)",zIndex:9999,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",overflowY:"auto"}}
          onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div style={{background:"#fff",borderRadius:"16px",padding:"28px",width:"100%",maxWidth:"520px",
            boxShadow:"0 20px 60px rgba(11,31,58,.2)",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontWeight:"700",
              color:"#0b1f3a",margin:"0 0 20px"}}>
              {editing ? t("adminPages.homeHealthcareServices.editTitle") : t("adminPages.homeHealthcareServices.addTitle")}
            </h3>

            <label style={lbl} htmlFor="hhs-name">{t("adminPages.homeHealthcareServices.serviceName")}</label>
            <input id="hhs-name" style={{...inp,marginBottom:"12px"}} value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              placeholder={t("adminPages.homeHealthcareServices.serviceNamePlaceholder")}/>

            <label style={lbl} htmlFor="hhs-category">{t("adminPages.homeHealthcareServices.category")}</label>
            <input id="hhs-category" style={{...inp,marginBottom:"4px"}} value={form.category}
              list="hhs-category-suggestions"
              onChange={e=>setForm(f=>({...f,category:e.target.value}))}
              placeholder={t("adminPages.homeHealthcareServices.categoryPlaceholder")}/>
            <datalist id="hhs-category-suggestions">
              {CATEGORY_SUGGESTIONS.map(c=><option key={c} value={c}/>)}
            </datalist>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#6b7688",margin:"0 0 12px"}}>
              {t("adminPages.homeHealthcareServices.categoryNote")}
            </p>

            <label style={lbl} htmlFor="hhs-description">{t("adminPages.homeHealthcareServices.description")}</label>
            <input id="hhs-description" style={{...inp,marginBottom:"12px"}} value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              placeholder={t("adminPages.homeHealthcareServices.descriptionPlaceholder")}/>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
              <div>
                <label style={lbl} htmlFor="hhs-price">{t("adminPages.homeHealthcareServices.basePrice")}</label>
                <input id="hhs-price" type="number" onWheel={e=>e.currentTarget.blur()} style={inp}
                  value={form.base_price} min="0" step="1"
                  onChange={e=>setForm(f=>({...f,base_price:e.target.value}))}
                  placeholder={t("adminPages.homeHealthcareServices.basePricePlaceholder")}/>
              </div>
              <div>
                <label style={lbl} htmlFor="hhs-unit">{t("adminPages.homeHealthcareServices.priceUnit")}</label>
                <select id="hhs-unit" style={inp} value={form.price_unit}
                  onChange={e=>setForm(f=>({...f,price_unit:e.target.value}))}>
                  {PRICE_UNITS.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>

            {form.price_unit === "per_hour" && (
              <div style={{marginBottom:"12px"}}>
                <label style={lbl} htmlFor="hhs-duration">{t("adminPages.homeHealthcareServices.typicalDuration")}</label>
                <input id="hhs-duration" type="number" onWheel={e=>e.currentTarget.blur()} style={inp}
                  value={form.duration_hours} min="1"
                  onChange={e=>setForm(f=>({...f,duration_hours:e.target.value}))}
                  placeholder={t("adminPages.homeHealthcareServices.durationPlaceholder")}/>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
              <div>
                <label style={lbl} htmlFor="hhs-weekend">{t("adminPages.homeHealthcareServices.weekendMultiplier")}</label>
                <input id="hhs-weekend" type="number" onWheel={e=>e.currentTarget.blur()} style={inp}
                  value={form.weekend_multiplier} min="1" step="0.05"
                  onChange={e=>setForm(f=>({...f,weekend_multiplier:e.target.value}))}
                  placeholder={t("adminPages.homeHealthcareServices.weekendMultiplierPlaceholder")}/>
              </div>
              <div>
                <label style={lbl} htmlFor="hhs-night">{t("adminPages.homeHealthcareServices.nightExtra")}</label>
                <input id="hhs-night" type="number" onWheel={e=>e.currentTarget.blur()} style={inp}
                  value={form.night_extra} min="0"
                  onChange={e=>setForm(f=>({...f,night_extra:e.target.value}))}
                  placeholder={t("adminPages.homeHealthcareServices.nightExtraPlaceholder")}/>
              </div>
            </div>

            <label style={lbl} htmlFor="hhs-sort">{t("adminPages.homeHealthcareServices.sortOrder")}</label>
            <input id="hhs-sort" type="number" onWheel={e=>e.currentTarget.blur()} style={{...inp,marginBottom:"14px"}}
              value={form.sort_order}
              onChange={e=>setForm(f=>({...f,sort_order:e.target.value}))}/>

            <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'DM Sans',sans-serif",
              fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"20px",cursor:"pointer"}}>
              <input type="checkbox" checked={form.is_active}
                onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/>
              {t("adminPages.homeHealthcareServices.activeLabel")}
            </label>

            {err && <p style={{color:"#dc2626",fontSize:"12.5px",marginBottom:"12px"}}>❌ {err}</p>}

            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={()=>setShowForm(false)}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
                  background:"#f8fafc",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"13px",color:"#64748b",cursor:"pointer"}}>
                {t("adminPages.homeHealthcareServices.cancel")}
              </button>
              <button onClick={save} disabled={saving}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"none",cursor:saving?"not-allowed":"pointer",
                  background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",opacity:saving?0.7:1}}>
                {saving ? t("adminPages.homeHealthcareServices.saving") : editing ? t("adminPages.homeHealthcareServices.updatePrice") : t("adminPages.homeHealthcareServices.addServiceBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List, grouped by category */}
      {loading ? (
        <div style={{padding:"40px",textAlign:"center"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
            borderTop:"3px solid #047857",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : list.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#6b7688",fontFamily:"'DM Sans',sans-serif"}}>
          {t("adminPages.homeHealthcareServices.none")}
        </div>
      ) : (
        Object.entries(groups).map(([cat, services]) => (
          <div key={cat} style={{marginBottom:"22px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"#047857",letterSpacing:"1.5px",textTransform:"uppercase",
              borderBottom:"1px solid #e2eaf4",paddingBottom:"6px",marginBottom:"12px"}}>
              {cat} <span style={{color:"#94a3b8",fontWeight:"500"}}>({services.length})</span>
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px"}}>
              {services.map(s => (
                <div key={s.id} style={{background:"#fff",border:`1.5px solid ${s.is_active?"#e2eaf4":"#f1f5f9"}`,
                  borderRadius:"12px",padding:"14px 16px",opacity:s.is_active?1:0.6}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px"}}>
                    <div style={{minWidth:0}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",color:"#0b1f3a",
                        fontSize:"14px",margin:0}}>{s.name}</p>
                      {s.description && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
                        color:"#6b7688",margin:"2px 0 0"}}>{s.description}</p>}
                    </div>
                    <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"19px",fontWeight:"700",
                      color:"#047857",margin:0,flexShrink:0}}>₹{Number(s.base_price).toLocaleString("en-IN")}</p>
                  </div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10.5px",color:"#94a3b8",margin:"6px 0 0"}}>
                    {({per_visit:t("adminPages.homeHealthcareServices.perVisit"),per_hour:t("adminPages.homeHealthcareServices.perHour"),per_shift:t("adminPages.homeHealthcareServices.perShift")})[s.price_unit] || s.price_unit}
                    {s.weekend_multiplier > 1 && t("adminPages.homeHealthcareServices.weekendSurcharge",{pct:((s.weekend_multiplier-1)*100).toFixed(0)})}
                    {s.night_extra > 0 && t("adminPages.homeHealthcareServices.nightSurcharge",{amount:s.night_extra})}
                  </p>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"10px"}}>
                    <span style={{fontSize:"10px",fontWeight:"700",color:s.is_active?"#047857":"#6b7688",
                      fontFamily:"'DM Sans',sans-serif"}}>
                      {s.is_active?t("adminPages.homeHealthcareServices.activeStatus"):t("adminPages.homeHealthcareServices.hiddenStatus")}
                    </span>
                    <div style={{display:"flex",gap:"6px"}}>
                      <button onClick={()=>toggle(s)} title={s.is_active?t("adminPages.homeHealthcareServices.hide"):t("adminPages.homeHealthcareServices.show")}
                        style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                          fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                          background:s.is_active?"#fef9c3":"#dcfce7",
                          color:s.is_active?"#92400e":"#15803d"}}>
                        {s.is_active?t("adminPages.homeHealthcareServices.hide"):t("adminPages.homeHealthcareServices.show")}
                      </button>
                      <button onClick={()=>openEdit(s)}
                        style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                          fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                          background:"#eff8ff",color:"#0369a1"}}>
                        {t("adminPages.homeHealthcareServices.edit")}
                      </button>
                      <button onClick={()=>del(s.id)}
                        style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                          fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif",
                          background:"#fee2e2",color:"#dc2626"}}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
