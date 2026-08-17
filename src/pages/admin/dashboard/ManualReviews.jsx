/**
 * admin/dashboard/ManualReviews.jsx — Manually-added review screenshots.
 *
 * Why this exists: live Google reviews (Reviews.jsx on the public Home
 * page, powered by google_reviews.py) need a Google Cloud billing
 * account before the Places API returns review content. Until that's
 * set up, the admin uploads a screenshot of a real Google review here
 * instead, and it's shown on the public site in a proper card layout
 * (not just a raw dumped image).
 */
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API, Spinner, SectionHead, DeleteButton } from "./shared";

const emptyForm = { screenshot_url: "", reviewer_name: "", rating: "", caption: "", is_active: true, sort_order: 999 };

export default function ManualReviews({ token }) {
  const { t } = useTranslation();
  const [list,      setList]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null); // null = new, obj = edit
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox,  setLightbox]  = useState(null); // screenshot_url or null
  const boxRef = useRef(null);
  useModalA11y(boxRef, () => setShowForm(false), showForm);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/reviews/admin/manual`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setList(json.reviews || []);
    } catch { setErr(t("adminPages.manualReviews.loadFailed")); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchList(); }, []);

  const openNew  = () => { setEditing(null); setForm({ ...emptyForm, sort_order:(list.length+1)*10 }); setShowForm(true); setErr(null); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({
      screenshot_url: r.screenshot_url || "", reviewer_name: r.reviewer_name || "",
      rating: r.rating || "", caption: r.caption || "",
      is_active: r.is_active, sort_order: r.sort_order || 999,
    });
    setShowForm(true); setErr(null);
  };

  const uploadScreenshot = async (file) => {
    if (!file) return;
    setUploading(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch(`${API}/reviews/admin/manual/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets multipart boundary
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || t("adminPages.manualReviews.uploadFailed")); return; }
      setForm(f => ({ ...f, screenshot_url: json.url }));
    } catch { setErr(t("adminPages.manualReviews.uploadNetworkError")); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.screenshot_url) { setErr(t("adminPages.manualReviews.screenshotRequired")); return; }
    setSaving(true); setErr(null);
    const url    = editing ? `${API}/reviews/admin/manual/${editing.id}` : `${API}/reviews/admin/manual`;
    const method = editing ? "PUT" : "POST";
    const payload = {
      ...form,
      reviewer_name: form.reviewer_name.trim() || null,
      caption:       form.caption.trim() || null,
      rating:        form.rating === "" ? null : parseInt(form.rating),
      sort_order:    parseInt(form.sort_order) || 999,
    };
    try {
      const res  = await fetch(url, { method, headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || t("adminPages.manualReviews.saveFailed")); return; }
      setShowForm(false);
      fetchList();
    } catch { setErr(t("adminPages.manualReviews.networkError")); }
    finally { setSaving(false); }
  };

  const toggleActive = async (r) => {
    await fetch(`${API}/reviews/admin/manual/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({
        screenshot_url: r.screenshot_url, reviewer_name: r.reviewer_name,
        rating: r.rating, caption: r.caption, sort_order: r.sort_order,
        is_active: !r.is_active,
      }),
    });
    fetchList();
  };

  const del = async (id) => {
    await fetch(`${API}/reviews/admin/manual/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    fetchList();
  };

  const inp = { width:"100%", border:"1.5px solid var(--wc-border)", borderRadius:"9px", padding:"9px 12px",
    fontFamily:"'Inter',sans-serif", fontSize:"13.5px", color:"#1e293b", background:"var(--wc-warm-white)", outline:"none", boxSizing:"border-box" };
  const lbl = { display:"block", fontFamily:"'Inter',sans-serif", fontSize:"12px", fontWeight:"600", color:"#374151", marginBottom:"5px" };

  return (
    <div>
      <SectionHead title={t("adminPages.manualReviews.heading")} count={list.length}/>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",color:"var(--wc-muted)",marginBottom:"14px"}}>
        {t("adminPages.manualReviews.note")}
      </p>

      <button onClick={openNew}
        style={{padding:"10px 18px",borderRadius:"9px",border:"none",cursor:"pointer",
          background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
          fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"13px",marginBottom:"20px"}}>
        {t("adminPages.manualReviews.addBtn")}
      </button>

      {err && !showForm && <p style={{color:"#dc2626",fontSize:"13px",marginBottom:"12px"}}>❌ {err}</p>}

      {/* Add/Edit modal */}
      {showForm && (
        <div style={{position:"fixed",inset:0,background:"rgba(11,31,58,.5)",zIndex:9999,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",overflowY:"auto"}}
          onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div ref={boxRef} role="dialog" aria-modal="true"
            aria-label={editing ? t("adminPages.manualReviews.editTitle") : t("adminPages.manualReviews.addTitle")}
            style={{background:"#fff",borderRadius:"16px",padding:"28px",width:"100%",maxWidth:"480px",
            boxShadow:"0 20px 60px rgba(11,31,58,.2)",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"20px",fontWeight:"700",
              color:"var(--wc-navy)",margin:"0 0 20px"}}>
              {editing ? t("adminPages.manualReviews.editTitle") : t("adminPages.manualReviews.addTitle")}
            </h3>

            {/* Screenshot upload */}
            <p style={lbl}>{t("adminPages.manualReviews.screenshot")}</p>
            {form.screenshot_url && (
              <img src={form.screenshot_url} alt="" onClick={()=>setLightbox(form.screenshot_url)}
                style={{width:"100%",maxHeight:"220px",objectFit:"contain",borderRadius:"10px",
                  border:"1.5px solid var(--wc-border)",marginBottom:"8px",cursor:"zoom-in",background:"var(--wc-warm-white)"}}/>
            )}
            <label style={{display:"block",cursor:uploading?"not-allowed":"pointer",
              padding:"11px 14px",borderRadius:"8px",border:"1.5px dashed #cbd5e1",
              background:"var(--wc-warm-white)",textAlign:"center",
              fontFamily:"'Inter',sans-serif",fontSize:"12.5px",fontWeight:"600",
              color:"var(--wc-muted)",marginBottom:"14px"}}>
              {uploading ? t("adminPages.manualReviews.uploading")
                : form.screenshot_url ? t("adminPages.manualReviews.replaceImage")
                : t("adminPages.manualReviews.chooseImage")}
              <input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                disabled={uploading} style={{display:"none"}}
                onChange={e => uploadScreenshot(e.target.files?.[0])}/>
            </label>

            <label style={lbl} htmlFor="mr-reviewer">{t("adminPages.manualReviews.reviewerName")}</label>
            <input id="mr-reviewer" style={{...inp,marginBottom:"12px"}} value={form.reviewer_name}
              onChange={e=>setForm(f=>({...f,reviewer_name:e.target.value}))}
              placeholder={t("adminPages.manualReviews.reviewerNamePlaceholder")}/>

            <label style={lbl} htmlFor="mr-rating">{t("adminPages.manualReviews.rating")}</label>
            <select id="mr-rating" style={{...inp,marginBottom:"12px"}} value={form.rating}
              onChange={e=>setForm(f=>({...f,rating:e.target.value}))}>
              <option value="">{t("adminPages.manualReviews.ratingNone")}</option>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}
            </select>

            <label style={lbl} htmlFor="mr-caption">{t("adminPages.manualReviews.caption")}</label>
            <input id="mr-caption" style={{...inp,marginBottom:"12px"}} value={form.caption}
              onChange={e=>setForm(f=>({...f,caption:e.target.value}))}
              placeholder={t("adminPages.manualReviews.captionPlaceholder")}/>

            <label style={lbl} htmlFor="mr-sort">{t("adminPages.manualReviews.sortOrder")}</label>
            <input id="mr-sort" type="number" onWheel={e=>e.currentTarget.blur()} style={{...inp,marginBottom:"12px"}}
              value={form.sort_order}
              onChange={e=>setForm(f=>({...f,sort_order:e.target.value}))}/>

            <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'Inter',sans-serif",
              fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"20px",cursor:"pointer"}}>
              <input type="checkbox" checked={form.is_active}
                onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/>
              {t("adminPages.manualReviews.activeLabel")}
            </label>

            {err && <p style={{color:"#dc2626",fontSize:"12.5px",marginBottom:"12px"}}>❌ {err}</p>}

            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={()=>setShowForm(false)}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"1.5px solid var(--wc-border)",
                  background:"var(--wc-warm-white)",fontFamily:"'Inter',sans-serif",fontWeight:"600",
                  fontSize:"13px",color:"var(--wc-muted)",cursor:"pointer"}}>
                {t("adminPages.manualReviews.cancel")}
              </button>
              <button onClick={save} disabled={saving || uploading}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"none",cursor:saving?"not-allowed":"pointer",
                  background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
                  fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"13px",opacity:saving?0.7:1}}>
                {saving ? t("adminPages.manualReviews.saving") : editing ? t("adminPages.manualReviews.update") : t("adminPages.manualReviews.addReview")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={()=>setLightbox(null)}
          style={{position:"fixed",inset:0,background:"rgba(11,31,58,.85)",zIndex:10000,
            display:"flex",alignItems:"center",justifyContent:"center",padding:"30px",cursor:"zoom-out"}}>
          <img src={lightbox} alt="" style={{maxWidth:"100%",maxHeight:"100%",borderRadius:"10px"}}/>
        </div>
      )}

      {/* List */}
      {loading ? <Spinner/> : list.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#6b7688",fontFamily:"'Inter',sans-serif"}}>
          {t("adminPages.manualReviews.none")}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(260px,100%),1fr))",gap:"14px"}}>
          {list.map(r => (
            <div key={r.id} style={{background:"#fff",border:`1.5px solid ${r.is_active?"var(--wc-border)":"#f1f5f9"}`,
              borderRadius:"12px",overflow:"hidden",opacity:r.is_active?1:0.6}}>
              <img src={r.screenshot_url} alt="" onClick={()=>setLightbox(r.screenshot_url)}
                style={{width:"100%",height:"150px",objectFit:"cover",cursor:"zoom-in",background:"var(--wc-warm-white)"}}/>
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"4px"}}>
                  <strong style={{fontFamily:"'Inter',sans-serif",fontSize:"13.5px",color:"var(--wc-navy)"}}>
                    {r.reviewer_name || t("adminPages.manualReviews.reviewerFallback")}
                  </strong>
                  <span style={{fontSize:"10px",fontWeight:"700",padding:"2px 9px",borderRadius:"50px",
                    fontFamily:"'Inter',sans-serif",flexShrink:0,
                    background:r.is_active?"#dcfce7":"#f1f5f9",
                    color:r.is_active?"#15803d":"var(--wc-muted)"}}>
                    {r.is_active ? t("adminPages.manualReviews.activeStatus") : t("adminPages.manualReviews.hiddenStatus")}
                  </span>
                </div>
                {r.rating && <span style={{color:"#fbbf24",fontSize:"13px"}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>}
                {r.caption && <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11.5px",color:"var(--wc-muted)",
                  margin:"4px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.caption}</p>}
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginTop:"10px"}}>
                  <button onClick={()=>toggleActive(r)}
                    style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                      fontSize:"11px",fontWeight:"700",fontFamily:"'Inter',sans-serif",
                      background:r.is_active?"#fef9c3":"#dcfce7",
                      color:r.is_active?"#92400e":"#15803d"}}>
                    {r.is_active ? t("adminPages.manualReviews.hide") : t("adminPages.manualReviews.show")}
                  </button>
                  <button onClick={()=>openEdit(r)}
                    style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                      fontSize:"11px",fontWeight:"700",fontFamily:"'Inter',sans-serif",
                      background:"#eff8ff",color:"var(--wc-teal)"}}>
                    {t("adminPages.manualReviews.edit")}
                  </button>
                  <DeleteButton onDelete={()=>del(r.id)} label={t("adminPages.manualReviews.delete")}
                    confirmText={t("adminPages.manualReviews.confirmDelete")} small/>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
