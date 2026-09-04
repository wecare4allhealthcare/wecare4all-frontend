/**
 * admin/dashboard/Testimonials.jsx — Featured Testimonials (photo + quote).
 *
 * Why this exists alongside ManualReviews.jsx: that page manages
 * SCREENSHOTS of real Google reviews, shown in a grid. This page
 * manages a different content shape entirely — a reviewer's photo plus
 * a full written quote, shown as cards in a carousel on the home page
 * (client request, Aug 2026 — reference: a Miror.co.in-style
 * testimonial section). Every record here is typed in directly, from a
 * testimonial the reviewer actually gave — the photo is optional (the
 * public carousel falls back to an initials avatar when it's missing).
 */
import { useEffect, useRef, useState } from "react";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API, Spinner, SectionHead, DeleteButton } from "./shared";

const emptyForm = { reviewer_name: "", designation: "", quote: "", photo_url: "", is_active: true, sort_order: 999 };

export default function Testimonials({ token }) {
  const [list,      setList]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState(null); // null = new, obj = edit
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const boxRef = useRef(null);
  useModalA11y(boxRef, () => setShowForm(false), showForm);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/testimonials/admin`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setList(json.testimonials || []);
    } catch { setErr("Couldn't load testimonials — please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchList(); }, []);

  const openNew  = () => { setEditing(null); setForm({ ...emptyForm, sort_order:(list.length+1)*10 }); setShowForm(true); setErr(null); };
  const openEdit = (r) => {
    setEditing(r);
    setForm({
      reviewer_name: r.reviewer_name || "", designation: r.designation || "",
      quote: r.quote || "", photo_url: r.photo_url || "",
      is_active: r.is_active, sort_order: r.sort_order || 999,
    });
    setShowForm(true); setErr(null);
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch(`${API}/testimonials/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets multipart boundary
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Upload failed — please try a different image."); return; }
      setForm(f => ({ ...f, photo_url: json.url }));
    } catch { setErr("Network error while uploading — please try again."); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.reviewer_name.trim()) { setErr("Reviewer name is required."); return; }
    if (!form.quote.trim())         { setErr("The testimonial quote is required."); return; }
    setSaving(true); setErr(null);
    const url    = editing ? `${API}/testimonials/admin/${editing.id}` : `${API}/testimonials/admin`;
    const method = editing ? "PUT" : "POST";
    const payload = {
      reviewer_name: form.reviewer_name.trim(),
      designation:   form.designation.trim() || null,
      quote:         form.quote.trim(),
      photo_url:     form.photo_url || null,
      is_active:     form.is_active,
      sort_order:    parseInt(form.sort_order) || 999,
    };
    try {
      const res  = await fetch(url, { method, headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Couldn't save — please try again."); return; }
      setShowForm(false);
      fetchList();
    } catch { setErr("Network error — please try again."); }
    finally { setSaving(false); }
  };

  const toggleActive = async (r) => {
    await fetch(`${API}/testimonials/admin/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({
        reviewer_name: r.reviewer_name, designation: r.designation,
        quote: r.quote, photo_url: r.photo_url, sort_order: r.sort_order,
        is_active: !r.is_active,
      }),
    });
    fetchList();
  };

  const del = async (id) => {
    await fetch(`${API}/testimonials/admin/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    fetchList();
  };

  const inp = { width:"100%", border:"1.5px solid var(--wc-border)", borderRadius:"9px", padding:"9px 12px",
    fontFamily:"'Inter',sans-serif", fontSize:"13.5px", color:"#1e293b", background:"var(--wc-warm-white)", outline:"none", boxSizing:"border-box" };
  const lbl = { display:"block", fontFamily:"'Inter',sans-serif", fontSize:"12px", fontWeight:"600", color:"#374151", marginBottom:"5px" };

  const initials = (name) => (name || "?").trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();

  return (
    <div>
      <SectionHead title="Featured Testimonials" count={list.length}/>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",color:"var(--wc-muted)",marginBottom:"14px"}}>
        These show as cards in the "Words That Remind Us Why We Do This" carousel on the home page.
        Photo is optional — a card without one shows an initials avatar instead.
      </p>

      <button onClick={openNew}
        style={{padding:"10px 18px",borderRadius:"9px",border:"none",cursor:"pointer",
          background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
          fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"13px",marginBottom:"20px"}}>
        + Add Testimonial
      </button>

      {err && !showForm && <p style={{color:"#dc2626",fontSize:"13px",marginBottom:"12px"}}>❌ {err}</p>}

      {/* Add/Edit modal */}
      {showForm && (
        <div style={{position:"fixed",inset:0,background:"rgba(18,59,74,.5)",zIndex:9999,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",overflowY:"auto"}}
          onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div ref={boxRef} role="dialog" aria-modal="true"
            aria-label={editing ? "Edit Testimonial" : "Add Testimonial"}
            style={{background:"#fff",borderRadius:"16px",padding:"28px",width:"100%",maxWidth:"480px",
            boxShadow:"0 20px 60px rgba(18,59,74,.2)",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"20px",fontWeight:"700",
              color:"var(--wc-navy)",margin:"0 0 20px"}}>
              {editing ? "Edit Testimonial" : "Add Testimonial"}
            </h3>

            {/* Photo upload — optional */}
            <p style={lbl}>Reviewer Photo (optional)</p>
            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"14px"}}>
              {form.photo_url ? (
                <img src={form.photo_url} alt=""
                  style={{width:"56px",height:"56px",borderRadius:"50%",objectFit:"cover",
                    border:"1.5px solid var(--wc-border)",flexShrink:0}}/>
              ) : (
                <div style={{width:"56px",height:"56px",borderRadius:"50%",flexShrink:0,
                  background:"linear-gradient(135deg,var(--wc-green),var(--wc-teal))",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"16px"}}>
                  {initials(form.reviewer_name)}
                </div>
              )}
              <label style={{flex:1,cursor:uploading?"not-allowed":"pointer",
                padding:"10px 12px",borderRadius:"8px",border:"1.5px dashed #cbd5e1",
                background:"var(--wc-warm-white)",textAlign:"center",
                fontFamily:"'Inter',sans-serif",fontSize:"12px",fontWeight:"600",
                color:"var(--wc-muted)"}}>
                {uploading ? "Uploading…" : form.photo_url ? "Replace photo" : "Choose photo"}
                <input type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  disabled={uploading} style={{display:"none"}}
                  onChange={e => uploadPhoto(e.target.files?.[0])}/>
              </label>
            </div>

            <label style={lbl} htmlFor="ts-reviewer">Reviewer Name *</label>
            <input id="ts-reviewer" style={{...inp,marginBottom:"12px"}} value={form.reviewer_name}
              onChange={e=>setForm(f=>({...f,reviewer_name:e.target.value}))}
              placeholder="e.g. Renita Dsouza"/>

            <label style={lbl} htmlFor="ts-designation">Designation (optional)</label>
            <input id="ts-designation" style={{...inp,marginBottom:"12px"}} value={form.designation}
              onChange={e=>setForm(f=>({...f,designation:e.target.value}))}
              placeholder="e.g. Patient, Speech & Communication Specialist"/>

            <label style={lbl} htmlFor="ts-quote">Testimonial Quote *</label>
            <textarea id="ts-quote" rows={5} style={{...inp,marginBottom:"12px",resize:"vertical",fontFamily:"'Inter',sans-serif"}}
              value={form.quote}
              onChange={e=>setForm(f=>({...f,quote:e.target.value}))}
              placeholder="Paste or type the reviewer's own words here…"/>

            <label style={lbl} htmlFor="ts-sort">Sort Order</label>
            <input id="ts-sort" type="number" onWheel={e=>e.currentTarget.blur()} style={{...inp,marginBottom:"12px"}}
              value={form.sort_order}
              onChange={e=>setForm(f=>({...f,sort_order:e.target.value}))}/>

            <label style={{display:"flex",alignItems:"center",gap:"8px",fontFamily:"'Inter',sans-serif",
              fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"20px",cursor:"pointer"}}>
              <input type="checkbox" checked={form.is_active}
                onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))}/>
              Show on the public site
            </label>

            {err && <p style={{color:"#dc2626",fontSize:"12.5px",marginBottom:"12px"}}>❌ {err}</p>}

            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={()=>setShowForm(false)}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"1.5px solid var(--wc-border)",
                  background:"var(--wc-warm-white)",fontFamily:"'Inter',sans-serif",fontWeight:"600",
                  fontSize:"13px",color:"var(--wc-muted)",cursor:"pointer"}}>
                Cancel
              </button>
              <button onClick={save} disabled={saving || uploading}
                style={{flex:1,padding:"10px",borderRadius:"9px",border:"none",cursor:saving?"not-allowed":"pointer",
                  background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
                  fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"13px",opacity:saving?0.7:1}}>
                {saving ? "Saving…" : editing ? "Update" : "Add Testimonial"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? <Spinner/> : list.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#6b7688",fontFamily:"'Inter',sans-serif"}}>
          No testimonials yet — click "+ Add Testimonial" to add the first one.
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(280px,100%),1fr))",gap:"14px"}}>
          {list.map(r => (
            <div key={r.id} style={{background:"#fff",border:`1.5px solid ${r.is_active?"var(--wc-border)":"#f1f5f9"}`,
              borderRadius:"12px",padding:"16px",opacity:r.is_active?1:0.6}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
                {r.photo_url ? (
                  <img src={r.photo_url} alt="" style={{width:"40px",height:"40px",borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                ) : (
                  <div style={{width:"40px",height:"40px",borderRadius:"50%",flexShrink:0,
                    background:"linear-gradient(135deg,var(--wc-green),var(--wc-teal))",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"13px"}}>
                    {initials(r.reviewer_name)}
                  </div>
                )}
                <div style={{flex:1,minWidth:0}}>
                  <strong style={{fontFamily:"'Inter',sans-serif",fontSize:"13.5px",color:"var(--wc-navy)",display:"block"}}>
                    {r.reviewer_name}
                  </strong>
                  {r.designation && <span style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",color:"var(--wc-muted)"}}>{r.designation}</span>}
                </div>
                <span style={{fontSize:"10px",fontWeight:"700",padding:"2px 9px",borderRadius:"50px",
                  fontFamily:"'Inter',sans-serif",flexShrink:0,
                  background:r.is_active?"#dcfce7":"#f1f5f9",
                  color:r.is_active?"#15803d":"var(--wc-muted)"}}>
                  {r.is_active ? "Active" : "Hidden"}
                </span>
              </div>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"var(--wc-muted)",
                margin:"0 0 12px",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>
                "{r.quote}"
              </p>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                <button onClick={()=>toggleActive(r)}
                  style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                    fontSize:"11px",fontWeight:"700",fontFamily:"'Inter',sans-serif",
                    background:r.is_active?"#fef9c3":"#dcfce7",
                    color:r.is_active?"#92400e":"#15803d"}}>
                  {r.is_active ? "Hide" : "Show"}
                </button>
                <button onClick={()=>openEdit(r)}
                  style={{padding:"5px 10px",borderRadius:"6px",border:"none",cursor:"pointer",
                    fontSize:"11px",fontWeight:"700",fontFamily:"'Inter',sans-serif",
                    background:"#eff8ff",color:"var(--wc-teal)"}}>
                  Edit
                </button>
                <DeleteButton onDelete={()=>del(r.id)} label="Delete"
                  confirmText="Delete this testimonial?" small/>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
