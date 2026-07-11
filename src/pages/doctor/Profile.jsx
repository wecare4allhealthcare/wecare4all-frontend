/**
 * doctor/Profile.jsx — Doctor edits their own profile directly.
 * Everything is self-editable except Consultation Fee, which stays
 * admin-controlled (a separate, more financially/dispute-sensitive
 * category than a doctor correcting their own bio or qualifications).
 * Doctor can also change their own password here.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.dp{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.dp *{box-sizing:border-box;} .dp a{text-decoration:none;}
.dp h1,.dp h2{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.dp-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:11px 13px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;
  outline:none;transition:all .2s;-webkit-appearance:none;}
.dp-inp:focus{border-color:#0369a1;background:#fff;box-shadow:0 0 0 3px rgba(3,105,161,.09);}
.dp-inp:disabled{background:#f1f5f9;color:#94a3b8;cursor:not-allowed;}
.dp-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.dp-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;padding:20px;margin-bottom:14px;animation:fadeUp .4s ease forwards;}
.dp-sec{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;color:#0369a1;
  letter-spacing:1.5px;text-transform:uppercase;padding-bottom:8px;
  border-bottom:1.5px solid #e2eaf4;margin-bottom:16px;}
.dp-grid{display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:560px){
  .dp-grid{grid-template-columns:1fr 1fr;}
  .dp-full{grid-column:span 2;}
}
`;

const SPECS = ["Cardiology","Neurology","Orthopaedics","Oncology","Gastroenterology",
  "Dermatology","Gynaecology","Paediatrics","Psychiatry","Urology",
  "Physiotherapy","General Medicine","ENT","Ophthalmology","Nephrology",
  "Pulmonology","Endocrinology","Rheumatology"];

export default function DoctorProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name:"", specialization:"", sub_specialization:"",
    qualification:"", registration_number:"", certifications:"", awards:"",
    experience_yrs:"", phone:"", location:"",
    details:"", consultation_fee:"", available_online:true, available_home:false, available_in_person:false,
  });
  const [pwd, setPwd] = useState({ current:"", new_password:"", confirm:"" });
  const [fetching, setFetching] = useState(true);
  const [photoUrl, setPhotoUrl]       = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [pwdSaving,setPwdSaving]= useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdErr,   setPwdErr]   = useState("");

  useEffect(() => {
    document.title = "Doctor Profile — We Care 4 'all'";
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000); // 12s timeout
      const res   = await fetch(`${API}/doctors/my-profile`, {
        headers: { Authorization:`Bearer ${token}` },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const d = await res.json();
        setForm({
          full_name:        d.full_name        || "",
          specialization:   d.specialization   || "",
          sub_specialization:d.sub_specialization||"",
          qualification:    d.qualification    || "",
          registration_number: d.registration_number || "",
          certifications:   d.certifications    || "",
          awards:           d.awards            || "",
          experience_yrs:   d.experience_yrs   || "",
          phone:            d.phone            || "",
          location:         d.location         || "",
          details:          d.details          || "",
          consultation_fee: d.consultation_fee || "",
          available_online: d.available_online !== false,
          available_home:   d.available_home   === true,
          available_in_person: d.available_in_person === true,
        });
        if (d.photo_url) setPhotoUrl(d.photo_url);
      }
    } catch {}
    finally { setFetching(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveProfile = async () => {
    setSaving(true); setSaveErr(""); setSaved(false);
    try {
      const token = localStorage.getItem("wc4a_token");
      // consultation_fee is deliberately never sent here — the backend
      // wouldn't accept it either way (see DoctorSelfUpdateReq), it stays
      // admin-only.
      const { consultation_fee, ...editable } = form;
      const res = await fetch(`${API}/doctors/my-profile`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(editable),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (ex) {
      setSaveErr(ex.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePwdChange = async (e) => {
    e.preventDefault(); setPwdErr(""); setPwdSaved(false);
    if (!pwd.current)      { setPwdErr("Current password required"); return; }
    if (!pwd.new_password) { setPwdErr("New password required"); return; }
    if (pwd.new_password.length < 8) { setPwdErr("New password must be at least 8 characters"); return; }
    if (pwd.new_password !== pwd.confirm) { setPwdErr("Passwords don't match"); return; }
    setPwdSaving(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/doctors/change-password`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({ current_password:pwd.current, new_password:pwd.new_password }),
      });
      if (!res.ok) { const j=await res.json(); throw new Error(j.detail||"Failed"); }
      setPwdSaved(true);
      setPwd({ current:"", new_password:"", confirm:"" });
      setTimeout(()=>setPwdSaved(false), 3000);
    } catch(ex) { setPwdErr(ex.message); }
    finally { setPwdSaving(false); }
  };

  if (fetching) return (
    <div className="dp" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <style>{G}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:"36px",height:"36px",border:"3px solid #e2eaf4",
          borderTop:"3px solid #0369a1",borderRadius:"50%",
          animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
        <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8"}}>Loading profile…</p>
      </div>
    </div>
  );

  const uploadPhoto = async (file) => {
    if (!file) return;
    setPhotoUploading(true);
    try {
      const fd    = new FormData(); fd.append("file", file);
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/doctors/my-profile/photo`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:fd,
      });
      const json = await res.json();
      if (json.photo_url) setPhotoUrl(json.photo_url);
    } catch {}
    finally { setPhotoUploading(false); }
  };

  return (
    <div className="dp">
      <style>{G}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0369a1,#0284c7)",padding:"20px 20px 24px"}}>
        <div style={{maxWidth:"720px",margin:"0 auto",display:"flex",
          justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.6)",marginBottom:"3px",textTransform:"uppercase",letterSpacing:"1px"}}>
              Doctor Profile
            </p>
            <h1 style={{fontSize:"clamp(18px,3vw,24px)",fontWeight:"700",color:"#fff",margin:0}}>
              {form.full_name ? form.full_name : user?.name || ""}
            </h1>
          </div>
          <Link to="/doctor/dashboard" style={{padding:"9px 18px",borderRadius:"8px",
            background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.22)",
            color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"500",fontSize:"13px"}}>
            ← Dashboard
          </Link>
        </div>
      </div>

      <div style={{maxWidth:"720px",margin:"0 auto",padding:"20px 16px 40px"}}>
        {/* Profile — self-editable, except fee */}
        <div style={{background:"#eff8ff",border:"1px solid #93c5fd",borderRadius:"10px",
          padding:"13px 16px",marginBottom:"14px",display:"flex",gap:"10px",alignItems:"flex-start"}}>
          <span style={{fontSize:"18px"}}>ℹ️</span>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#0369a1",margin:0,lineHeight:"1.6"}}>
            You can update your own name, specialization, qualifications, and bio below — changes
            are saved directly. <strong>Consultation Fee</strong> stays admin-controlled; to change
            it, please <Link to="/contact" style={{color:"#0369a1",
            fontWeight:"700",textDecoration:"underline"}}>contact support</Link>.
          </p>
        </div>
        <div>
          <div className="dp-card">
            {/* Photo Upload */}
            <div className="dp-card" style={{marginBottom:"14px"}}>
              <p className="dp-sec">Profile Photo</p>
              <div style={{display:"flex",alignItems:"center",gap:"20px",flexWrap:"wrap"}}>
                <div style={{width:"90px",height:"90px",borderRadius:"50%",overflow:"hidden",
                  border:"3px solid #e2eaf4",background:"#f1f5f9",flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {photoUrl
                    ? <img src={photoUrl} alt="Profile"
                        style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <span style={{fontFamily:"'Cormorant Garamond',serif",
                        fontSize:"36px",fontWeight:"700",color:"#94a3b8"}}>
                        {(form.full_name||"D")[0].toUpperCase()}
                      </span>
                  }
                </div>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    fontWeight:"600",color:"#0b1f3a",margin:"0 0 4px"}}>
                    {photoUrl ? "Change Profile Photo" : "Upload Profile Photo"}
                  </p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
                    color:"#94a3b8",margin:"0 0 10px"}}>
                    JPEG, PNG or WebP · Shown on your public profile
                  </p>
                  <label style={{display:"inline-flex",alignItems:"center",gap:"8px",
                    padding:"9px 20px",borderRadius:"9px",cursor:"pointer",
                    background:"linear-gradient(135deg,#047857,#059669)",
                    color:"#fff",fontFamily:"'DM Sans',sans-serif",
                    fontWeight:"700",fontSize:"13px",
                    opacity:photoUploading?0.7:1,pointerEvents:photoUploading?"none":"auto"}}>
                    {photoUploading ? "⏳ Uploading…" : "📷 Choose Photo"}
                    <input type="file" accept="image/jpeg,image/png,image/webp"
                      style={{display:"none"}}
                      onChange={e=>e.target.files[0]&&uploadPhoto(e.target.files[0])}/>
                  </label>
                </div>
              </div>
            </div>

            <p className="dp-sec">Professional Details</p>
            <div className="dp-grid">
              <div className="dp-full">
                <label className="dp-lbl">Full Name</label>
                <input value={form.full_name} onChange={e=>set("full_name", e.target.value)}
                  className="dp-inp" placeholder="Dr. Full Name"/>
              </div>
              <div>
                <label className="dp-lbl">Specialization</label>
                <select value={form.specialization} onChange={e=>set("specialization", e.target.value)} className="dp-inp">
                  <option value="">Select</option>
                  {SPECS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="dp-lbl">Sub-Specialization</label>
                <input value={form.sub_specialization} onChange={e=>set("sub_specialization", e.target.value)}
                  className="dp-inp" placeholder="e.g. Interventional Cardiology"/>
              </div>
              <div>
                <label className="dp-lbl">Qualification</label>
                <input value={form.qualification} onChange={e=>set("qualification", e.target.value)}
                  className="dp-inp" placeholder="MBBS, MD"/>
              </div>
              <div>
                <label className="dp-lbl">Registration Number</label>
                <input value={form.registration_number} onChange={e=>set("registration_number", e.target.value)}
                  className="dp-inp" placeholder="Not set"/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label className="dp-lbl">Certifications</label>
                <input value={form.certifications} onChange={e=>set("certifications", e.target.value)}
                  className="dp-inp" placeholder="Not set"/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label className="dp-lbl">Awards</label>
                <input value={form.awards} onChange={e=>set("awards", e.target.value)}
                  className="dp-inp" placeholder="Not set"/>
              </div>
              <div>
                <label className="dp-lbl">Experience (years)</label>
                <input type="number" value={form.experience_yrs} onChange={e=>set("experience_yrs", e.target.value)}
                  onWheel={e=>e.currentTarget.blur()}
                  className="dp-inp" placeholder="10" min="0"/>
              </div>
              <div>
                <label className="dp-lbl">Phone</label>
                <input type="tel" value={form.phone} onChange={e=>set("phone", e.target.value)}
                  className="dp-inp" placeholder="90XXXXXXXX"/>
              </div>
              <div>
                <label className="dp-lbl">Consultation Fee (₹) <span style={{fontWeight:"400",color:"#94a3b8"}}>— admin only</span></label>
                <input type="number" value={form.consultation_fee} disabled
                  className="dp-inp" placeholder="500" min="0"/>
              </div>
              <div>
                <label className="dp-lbl">Location / Clinic</label>
                <input value={form.location} onChange={e=>set("location", e.target.value)}
                  className="dp-inp" placeholder="Chennai, Tamil Nadu"/>
              </div>
              <div className="dp-full">
                <label className="dp-lbl">About / Bio</label>
                <textarea value={form.details} onChange={e=>set("details", e.target.value)}
                  className="dp-inp" rows={3} style={{resize:"vertical"}}
                  placeholder="Brief description for patients…"/>
              </div>
              <div className="dp-full">
                <label className="dp-lbl">Availability</label>
                <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
                  {[["available_online","🎥 Video Consultations"],
                    ["available_in_person","🏥 In-Person"],
                    ["available_home","🏠 Home Visits"]].map(([k,l])=>(
                    <label key={k} style={{display:"flex",alignItems:"center",gap:"8px",
                      fontFamily:"'DM Sans',sans-serif",cursor:"pointer",
                      fontSize:"14px",fontWeight:"500",color:"#374151"}}>
                      <input type="checkbox" checked={form[k]} onChange={e=>set(k, e.target.checked)}
                        style={{width:"16px",height:"16px"}}/>
                      {l}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {saveErr && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",
              fontSize:"13px",margin:"14px 0 0"}}>⚠ {saveErr}</p>}
            {saved && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#15803d",
              fontSize:"13px",margin:"14px 0 0"}}>✅ Profile updated successfully!</p>}
            <button onClick={saveProfile} disabled={saving}
              style={{marginTop:"16px",background:"linear-gradient(135deg,#047857,#059669)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                fontSize:"14px",padding:"12px 24px",borderRadius:"9px",border:"none",
                cursor:saving?"not-allowed":"pointer",opacity:saving?0.7:1,
                boxShadow:"0 4px 14px rgba(4,120,87,.3)"}}>
              {saving ? "Saving…" : "Save Changes →"}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <form onSubmit={handlePwdChange} style={{marginTop:"20px"}}>
          <div className="dp-card">
            <p className="dp-sec">Change Password</p>
            <div className="dp-grid">
              <div className="dp-full">
                <label className="dp-lbl">Current Password</label>
                <input type="password" value={pwd.current}
                  onChange={e=>setPwd(p=>({...p,current:e.target.value}))}
                  className="dp-inp" placeholder="Your current password"/>
              </div>
              <div>
                <label className="dp-lbl">New Password</label>
                <input type="password" value={pwd.new_password}
                  onChange={e=>setPwd(p=>({...p,new_password:e.target.value}))}
                  className="dp-inp" placeholder="Min 8 characters"/>
              </div>
              <div>
                <label className="dp-lbl">Confirm New Password</label>
                <input type="password" value={pwd.confirm}
                  onChange={e=>setPwd(p=>({...p,confirm:e.target.value}))}
                  className="dp-inp" placeholder="Re-enter new password"/>
              </div>
            </div>
            {pwdErr && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",
              fontSize:"13px",margin:"10px 0 0"}}>⚠ {pwdErr}</p>}
            {pwdSaved && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#15803d",
              fontSize:"13px",margin:"10px 0 0"}}>✅ Password changed successfully!</p>}
            <button type="submit" disabled={pwdSaving}
              style={{...{},marginTop:"14px",background:"linear-gradient(135deg,#374151,#1f2937)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                fontSize:"14px",padding:"12px 24px",borderRadius:"9px",border:"none",
                cursor:"pointer",boxShadow:"0 4px 14px rgba(31,41,55,.3)"}}>
              {pwdSaving?"Changing…":"Change Password →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
