/**
 * doctor/Profile.jsx — Doctor can view & edit own profile
 * + change password (from temp password set by admin)
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
.save-btn{background:linear-gradient(135deg,#0369a1,#0284c7);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:12px 28px;border-radius:9px;border:none;cursor:pointer;
  box-shadow:0 4px 14px rgba(3,105,161,.35);transition:all .25s;}
.save-btn:hover{transform:translateY(-1px);}
.save-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
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
    qualification:"", experience_yrs:"", phone:"", location:"",
    details:"", consultation_fee:"", available_online:true, available_home:false,
  });
  const [pwd, setPwd] = useState({ current:"", new_password:"", confirm:"" });
  const [fetching, setFetching] = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [pwdSaving,setPwdSaving]= useState(false);
  const [saved,    setSaved]    = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [err,      setErr]      = useState("");
  const [pwdErr,   setPwdErr]   = useState("");

  useEffect(() => {
    document.title = "Doctor Profile — We Care 4 'all'";
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/doctors/my-profile`, {
        headers: { Authorization:`Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setForm({
          full_name:        d.full_name        || "",
          specialization:   d.specialization   || "",
          sub_specialization:d.sub_specialization||"",
          qualification:    d.qualification    || "",
          experience_yrs:   d.experience_yrs   || "",
          phone:            d.phone            || "",
          location:         d.location         || "",
          details:          d.details          || "",
          consultation_fee: d.consultation_fee || "",
          available_online: d.available_online !== false,
          available_home:   d.available_home   === true,
        });
      }
    } catch {}
    finally { setFetching(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setErr(""); setSaved(false);
    if (!form.full_name.trim()) { setErr("Full name required"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/doctors/my-profile`, {
        method:"PUT",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({
          ...form,
          experience_yrs:   form.experience_yrs ? parseInt(form.experience_yrs) : 0,
          consultation_fee: form.consultation_fee ? parseInt(form.consultation_fee) : 0,
        }),
      });
      if (!res.ok) { const j=await res.json(); throw new Error(j.detail||"Update failed"); }
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
    } catch(ex) { setErr(ex.message); }
    finally { setSaving(false); }
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

  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

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
              Dr. {form.full_name || user?.name || ""}
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
        {/* Profile form */}
        <form onSubmit={handleSave}>
          <div className="dp-card">
            <p className="dp-sec">Professional Details</p>
            <div className="dp-grid">
              <div className="dp-full">
                <label className="dp-lbl">Full Name *</label>
                <input value={form.full_name} onChange={e=>set("full_name",e.target.value)}
                  className="dp-inp" placeholder="Dr. Full Name"/>
              </div>
              <div>
                <label className="dp-lbl">Specialization</label>
                <select value={form.specialization} onChange={e=>set("specialization",e.target.value)} className="dp-inp">
                  <option value="">Select</option>
                  {SPECS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="dp-lbl">Sub-Specialization</label>
                <input value={form.sub_specialization}
                  onChange={e=>set("sub_specialization",e.target.value)}
                  className="dp-inp" placeholder="e.g. Interventional Cardiology"/>
              </div>
              <div>
                <label className="dp-lbl">Qualification</label>
                <input value={form.qualification}
                  onChange={e=>set("qualification",e.target.value)}
                  className="dp-inp" placeholder="MBBS, MD"/>
              </div>
              <div>
                <label className="dp-lbl">Experience (years)</label>
                <input type="number" value={form.experience_yrs}
                  onChange={e=>set("experience_yrs",e.target.value)}
                  className="dp-inp" placeholder="10" min="0"/>
              </div>
              <div>
                <label className="dp-lbl">Phone</label>
                <input type="tel" value={form.phone}
                  onChange={e=>set("phone",e.target.value)}
                  className="dp-inp" placeholder="90XXXXXXXX"/>
              </div>
              <div>
                <label className="dp-lbl">Consultation Fee (₹)</label>
                <input type="number" value={form.consultation_fee}
                  onChange={e=>set("consultation_fee",e.target.value)}
                  className="dp-inp" placeholder="500" min="0"/>
              </div>
              <div>
                <label className="dp-lbl">Location / Clinic</label>
                <input value={form.location}
                  onChange={e=>set("location",e.target.value)}
                  className="dp-inp" placeholder="Chennai, Tamil Nadu"/>
              </div>
              <div className="dp-full">
                <label className="dp-lbl">About / Bio</label>
                <textarea value={form.details}
                  onChange={e=>set("details",e.target.value)}
                  className="dp-inp" rows={3} style={{resize:"vertical"}}
                  placeholder="Brief description for patients…"/>
              </div>
              <div className="dp-full">
                <label className="dp-lbl">Availability</label>
                <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
                  {[["available_online","🎥 Video Consultations"],
                    ["available_home","🏠 Home Visits"]].map(([k,l])=>(
                    <label key={k} style={{display:"flex",alignItems:"center",gap:"8px",
                      cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                      fontSize:"14px",fontWeight:"500",color:"#374151"}}>
                      <input type="checkbox" checked={form[k]}
                        onChange={e=>set(k,e.target.checked)}
                        style={{width:"16px",height:"16px",cursor:"pointer"}}/>
                      {l}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {err && <div style={{background:"#fef2f2",border:"1px solid #fecaca",
            borderRadius:"9px",padding:"12px 16px",marginBottom:"12px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",fontSize:"13px",margin:0}}>⚠ {err}</p>
          </div>}
          {saved && <div style={{background:"#f0fdf4",border:"1px solid #86efac",
            borderRadius:"9px",padding:"12px 16px",marginBottom:"12px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#15803d",fontSize:"13px",margin:0}}>✅ Profile updated!</p>
          </div>}
          <button type="submit" disabled={saving} className="save-btn">
            {saving?"Saving…":"Save Profile →"}
          </button>
        </form>

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
