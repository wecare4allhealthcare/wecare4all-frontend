import { useState, useEffect, useRef } from "react";
import { showToast } from "../../../components/Toast";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API, Spinner } from "./shared";

const AVAIL_DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const AVAIL_DAY_LABELS = {
  monday:"Monday",tuesday:"Tuesday",wednesday:"Wednesday",thursday:"Thursday",
  friday:"Friday",saturday:"Saturday",sunday:"Sunday",
};


export default function EditDoctorModal({ doctorId, onClose, onSaved }) {
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);
  const token = localStorage.getItem("wc4a_token");
  const [tab, setTab] = useState("profile");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotForm, setSlotForm] = useState({ day_of_week:"monday", from_time:"09:00", to_time:"17:00", slot_mins:30 });
  const [slotSaving, setSlotSaving] = useState(false);

  const set = (k,v) => setForm(p => ({...p, [k]:v}));

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/doctors/${doctorId}`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setForm(json);
      setPhotoPreview(json.photo_url || "");
    } catch { showToast("Failed to load doctor", "error"); onClose(); }
    finally { setLoading(false); }
  };
  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const res = await fetch(`${API}/admin/doctors/${doctorId}/availability`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setSlots(json.availability || []);
    } catch { setSlots([]); }
    finally { setSlotsLoading(false); }
  };
  useEffect(() => { fetchDoctor(); fetchSlots(); }, [doctorId]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault(); setErr("");
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name, specialization: form.specialization,
        sub_specialization: form.sub_specialization, qualification: form.qualification,
        registration_number: form.registration_number, certifications: form.certifications,
        awards: form.awards, details: form.details,
        experience_yrs: form.experience_yrs ? parseInt(form.experience_yrs) : null,
        phone: form.phone, location: form.location,
        consultation_fee: form.consultation_fee ? parseInt(form.consultation_fee) : null,
        available_online: form.available_online, available_home: form.available_home,
        available_in_person: form.available_in_person,
        is_active: form.is_active,
        ...(newPassword ? { new_password: newPassword } : {}),
      };
      const res = await fetch(`${API}/admin/doctors/${doctorId}`, {
        method:"PUT", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Update failed");

      if (photoFile) {
        const fd = new FormData(); fd.append("file", photoFile);
        const pr = await fetch(`${API}/doctors/admin/${doctorId}/photo`, {
          method:"POST", headers:{ Authorization:`Bearer ${token}` }, body: fd,
        });
        if (!pr.ok) showToast("Profile saved but photo upload failed", "warning");
      }
      showToast("Doctor profile updated", "success");
      onSaved(); onClose();
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  };

  const addSlot = async () => {
    setSlotSaving(true);
    try {
      const res = await fetch(`${API}/admin/doctors/${doctorId}/availability`, {
        method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(slotForm),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.detail || "Failed"); }
      await fetchSlots();
    } catch (ex) { showToast(ex.message, "error"); }
    finally { setSlotSaving(false); }
  };
  const removeSlot = async (slotId) => {
    try {
      await fetch(`${API}/admin/doctors/${doctorId}/availability/${slotId}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${token}` },
      });
      await fetchSlots();
    } catch { showToast("Failed to remove slot", "error"); }
  };

  const inp = { width:"100%", border:"1.5px solid #e2eaf4", borderRadius:"9px", padding:"9px 12px",
    fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px" };
  const lbl = { display:"block", fontFamily:"'DM Sans',sans-serif", fontSize:"11.5px", fontWeight:"700",
    color:"#374151", marginBottom:"4px" };

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" ref={boxRef} role="dialog" aria-modal="true">
        <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",
          padding:"18px 22px",display:"flex",justifyContent:"space-between",
          alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>
            {form ? `Edit ${form.full_name}` : "Edit Doctor"}
          </h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",
            color:"#fff",width:"32px",height:"32px",borderRadius:"7px",cursor:"pointer",fontSize:"18px",
            display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        {loading || !form ? (
          <div style={{padding:"40px",textAlign:"center"}}><Spinner/></div>
        ) : (
          <>
            <div style={{display:"flex",gap:"4px",padding:"12px 22px 0"}}>
              {[["profile","Profile"],["availability","Availability"]].map(([id,label]) => (
                <button key={id} type="button" onClick={() => setTab(id)} style={{
                  padding:"9px 16px",border:"none",borderRadius:"8px 8px 0 0",cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",
                  background: tab===id ? "#f8fafc" : "transparent",
                  color: tab===id ? "#047857" : "#6b7688",
                }}>{label}</button>
              ))}
            </div>

            {tab === "profile" ? (
              <form onSubmit={handleSave} style={{padding:"18px 22px",background:"#f8fafc"}}>
                <div style={{display:"flex",alignItems:"center",gap:"16px",
                  background:"#fff",border:"1.5px dashed #e2eaf4",
                  borderRadius:"12px",padding:"14px 16px",marginBottom:"14px"}}>
                  <div style={{width:"60px",height:"60px",borderRadius:"50%",
                    overflow:"hidden",border:"2px solid #e2eaf4",flexShrink:0,
                    background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {photoPreview
                      ? <img loading="lazy" src={photoPreview} alt="Doctor profile photo preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : <span style={{fontSize:"24px",color:"#6b7688"}}>👤</span>}
                  </div>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",fontWeight:"600",color:"#374151",margin:"0 0 6px"}}>
                      Profile Photo
                    </p>
                    <label style={{display:"inline-flex",alignItems:"center",gap:"6px",
                      padding:"6px 14px",borderRadius:"7px",cursor:"pointer",
                      background:"#0b1f3a",color:"#fff",
                      fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"12px"}}>
                      📷 {photoFile ? "Change Photo" : "Change Photo"}
                      <input type="file" accept="image/jpeg,image/png,image/webp"
                        style={{display:"none"}} onChange={handlePhotoSelect}/>
                    </label>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"11px"}}>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={lbl} htmlFor="admin-dashboard-full-name-2">Full Name</label>
                    <input id="admin-dashboard-full-name-2" style={inp} value={form.full_name||""} onChange={e=>set("full_name",e.target.value)}/>
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={lbl} htmlFor="admin-dashboard-email-login-email-contact-support-to-change">Email <span style={{fontWeight:"400",color:"#6b7688"}}>(login email — contact support to change)</span></label>
                    <input id="admin-dashboard-email-login-email-contact-support-to-change" style={{...inp,background:"#f1f5f9",color:"#64748b"}} value={form.email||""} disabled/>
                  </div>
                  <div><label style={lbl} htmlFor="admin-dashboard-specialization-2">Specialization</label>
                    <input id="admin-dashboard-specialization-2" style={inp} value={form.specialization||""} onChange={e=>set("specialization",e.target.value)}/></div>
                  <div><label style={lbl} htmlFor="admin-dashboard-sub-specialization-2">Sub-specialization</label>
                    <input id="admin-dashboard-sub-specialization-2" style={inp} value={form.sub_specialization||""} onChange={e=>set("sub_specialization",e.target.value)}/></div>
                  <div><label style={lbl} htmlFor="admin-dashboard-qualification-2">Qualification</label>
                    <input id="admin-dashboard-qualification-2" style={inp} value={form.qualification||""} onChange={e=>set("qualification",e.target.value)}/></div>
                  <div><label style={lbl} htmlFor="admin-dashboard-registration-number-2">Registration Number</label>
                    <input id="admin-dashboard-registration-number-2" style={inp} value={form.registration_number||""} onChange={e=>set("registration_number",e.target.value)}/></div>
                  <div><label style={lbl} htmlFor="admin-dashboard-experience-years">Experience (years)</label>
                    <input id="admin-dashboard-experience-years" type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={form.experience_yrs||""} onChange={e=>set("experience_yrs",e.target.value)}/></div>
                  <div><label style={lbl} htmlFor="admin-dashboard-consultation-fee">Consultation Fee (₹)</label>
                    <input id="admin-dashboard-consultation-fee" type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={form.consultation_fee||""} onChange={e=>set("consultation_fee",e.target.value)}/></div>
                  <div><label style={lbl} htmlFor="admin-dashboard-phone-2">Phone</label>
                    <input id="admin-dashboard-phone-2" style={inp} value={form.phone||""} onChange={e=>set("phone",e.target.value)}/></div>
                  <div><label style={lbl} htmlFor="admin-dashboard-location-2">Location</label>
                    <input id="admin-dashboard-location-2" style={inp} value={form.location||""} onChange={e=>set("location",e.target.value)}/></div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={lbl} htmlFor="admin-dashboard-certifications-2">Certifications</label>
                    <input id="admin-dashboard-certifications-2" style={inp} value={form.certifications||""} onChange={e=>set("certifications",e.target.value)}/></div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={lbl} htmlFor="admin-dashboard-awards-2">Awards</label>
                    <input id="admin-dashboard-awards-2" style={inp} value={form.awards||""} onChange={e=>set("awards",e.target.value)}/></div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={lbl} htmlFor="admin-dashboard-bio-about">Bio / About</label>
                    <textarea id="admin-dashboard-bio-about" style={{...inp,minHeight:"70px",resize:"vertical"}} value={form.details||""} onChange={e=>set("details",e.target.value)}/></div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={lbl} htmlFor="admin-dashboard-reset-password-leave-blank-to-keep-current">Reset Password (leave blank to keep current)</label>
                    <input id="admin-dashboard-reset-password-leave-blank-to-keep-current" type="password" style={inp} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="New password"/></div>
                  <div style={{gridColumn:"span 2",display:"flex",gap:"18px",marginTop:"4px"}}>
                    <label style={{display:"flex",alignItems:"center",gap:"6px",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",cursor:"pointer"}}>
                      <input type="checkbox" checked={!!form.available_online} onChange={e=>set("available_online",e.target.checked)}/> 🎥 Video
                    </label>
                    <label style={{display:"flex",alignItems:"center",gap:"6px",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",cursor:"pointer"}}>
                      <input type="checkbox" checked={!!form.available_in_person} onChange={e=>set("available_in_person",e.target.checked)}/> 🏥 In-Person
                    </label>
                    <label style={{display:"flex",alignItems:"center",gap:"6px",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",cursor:"pointer"}}>
                      <input type="checkbox" checked={!!form.available_home} onChange={e=>set("available_home",e.target.checked)}/> 🏠 Home
                    </label>
                  </div>
                </div>

                {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px",marginTop:"12px"}}>⚠ {err}</p>}

                <div style={{display:"flex",gap:"10px",marginTop:"18px"}}>
                  <button type="submit" disabled={saving} className="btn-sm btn-navy" style={{padding:"10px 22px",fontSize:"13px"}}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={onClose} style={{
                    padding:"10px 18px",borderRadius:"8px",border:"1.5px solid #e2eaf4",background:"#fff",
                    fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer",
                  }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{padding:"18px 22px",background:"#f8fafc"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
                  Weekly consultation slots — patients can only book within these windows.
                </p>
                <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr 0.8fr auto",gap:"8px",marginBottom:"16px"}}>
                  <select value={slotForm.day_of_week} onChange={e=>setSlotForm(p=>({...p,day_of_week:e.target.value}))} style={inp}>
                    {AVAIL_DAYS.map(d => <option key={d} value={d}>{AVAIL_DAY_LABELS[d]}</option>)}
                  </select>
                  <input type="time" style={inp} value={slotForm.from_time} onChange={e=>setSlotForm(p=>({...p,from_time:e.target.value}))}/>
                  <input type="time" style={inp} value={slotForm.to_time} onChange={e=>setSlotForm(p=>({...p,to_time:e.target.value}))}/>
                  <input type="number" onWheel={e=>e.currentTarget.blur()} style={inp} value={slotForm.slot_mins} onChange={e=>setSlotForm(p=>({...p,slot_mins:parseInt(e.target.value)||30}))} title="Slot length (mins)"/>
                  <button type="button" onClick={addSlot} disabled={slotSaving} className="btn-sm btn-navy" style={{padding:"9px 16px",fontSize:"12.5px"}}>
                    {slotSaving ? "..." : "+ Add"}
                  </button>
                </div>

                {slotsLoading ? <Spinner/> : slots.length === 0 ? (
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#6b7688"}}>No availability set yet.</p>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                    {AVAIL_DAYS.map(day => {
                      const daySlots = slots.filter(s => s.day_of_week === day);
                      if (!daySlots.length) return null;
                      return (
                        <div key={day} style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"10px",padding:"10px 14px"}}>
                          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 6px"}}>
                            {AVAIL_DAY_LABELS[day]}
                          </p>
                          <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                            {daySlots.map(s => (
                              <span key={s.id} style={{display:"inline-flex",alignItems:"center",gap:"6px",
                                padding:"5px 10px",background:"#f0fdf4",border:"1px solid #86efac",
                                borderRadius:"50px",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#15803d"}}>
                                {String(s.from_time).slice(0,5)}–{String(s.to_time).slice(0,5)}
                                <button type="button" onClick={()=>removeSlot(s.id)} style={{
                                  background:"none",border:"none",color:"#15803d",cursor:"pointer",fontSize:"13px",padding:0,
                                }}>×</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
