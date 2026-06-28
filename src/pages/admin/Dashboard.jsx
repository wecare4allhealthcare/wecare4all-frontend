/**
 * admin/Dashboard.jsx — Phase D: Analytics + Export + Notifications
 * ADDED:
 * 1. Revenue chart (monthly bar chart — pure CSS, no library needed)
 * 2. Appointment trend chart
 * 3. CSV export for appointments
 * 4. Bulk email/SMS notification to patients
 * 5. Analytics section added to NAV
 * 6. Mobile bottom tab bar (from Fix 4)
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { showToast } from "../../components/Toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.ad{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.ad *{box-sizing:border-box;}
.ad h1,.ad h2,.ad h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:28px;height:28px;border:3px solid #e2eaf4;border-top:3px solid #047857;
  border-radius:50%;animation:spin .8s linear infinite;margin:0 auto;}
/* Desktop Sidebar */
.ad-sidebar{position:fixed;left:0;top:0;bottom:0;width:220px;
  background:linear-gradient(180deg,#071524,#0b1f3a);
  z-index:100;overflow-y:auto;display:flex;flex-direction:column;}
.ad-sidebar::-webkit-scrollbar{width:3px}
.ad-sidebar::-webkit-scrollbar-thumb{background:#047857;border-radius:3px}
.ad-content{margin-left:220px;padding:24px;padding-bottom:80px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:12px 20px;
  font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
  color:rgba(255,255,255,.58);cursor:pointer;transition:all .2s;
  border-left:3px solid transparent;text-decoration:none;border:none;
  background:transparent;width:100%;text-align:left;}
.nav-item:hover{color:#fff;background:rgba(255,255,255,.07);}
.nav-item.active{color:#6ee7b7;border-left:3px solid #047857;background:rgba(4,120,87,.12);}
/* Mobile bottom bar */
@media(max-width:699px){
  .ad-sidebar{display:none!important;}
  .ad-content{margin-left:0!important;padding:14px 12px 90px!important;}
  .ad-bottom-bar{display:flex!important;}
  .stat-grid-8{grid-template-columns:repeat(2,1fr)!important;}
}
@media(min-width:700px) and (max-width:860px){
  .ad-sidebar{width:64px;}
  .nav-label{display:none!important;}
  .ad-content{margin-left:64px;}
}
.ad-bottom-bar{display:none;position:fixed;bottom:0;left:0;right:0;
  background:#0b1f3a;border-top:1px solid rgba(255,255,255,.12);
  z-index:200;height:60px;}
.tab-btn-bar{flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:2px;border:none;background:transparent;
  cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;
  color:rgba(255,255,255,.5);transition:all .2s;padding:4px 2px;}
.tab-btn-bar.active{color:#34d399;}
.tab-btn-bar span.ti{font-size:16px;line-height:1;}
/* Cards */
.stat-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;padding:16px;
  transition:all .25s;box-shadow:0 2px 8px rgba(11,31,58,.05);}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(11,31,58,.10);}
.data-row{background:#fff;border:1px solid #e2eaf4;border-radius:11px;
  padding:12px 14px;margin-bottom:10px;transition:all .2s;}
.data-row:hover{box-shadow:0 4px 14px rgba(11,31,58,.08);}
.badge{display:inline-flex;align-items:center;font-size:11px;font-weight:700;
  padding:3px 10px;border-radius:50px;font-family:'DM Sans',sans-serif;white-space:nowrap;}
.ad-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:9px 12px;
  font-family:'DM Sans',sans-serif;font-size:13px;color:#1e293b;
  background:#f8fafc;outline:none;transition:all .2s;}
.ad-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.btn-sm{padding:6px 12px;border-radius:7px;border:none;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;transition:all .2s;}
.btn-green{background:#047857;color:#fff;}.btn-green:hover{background:#059669;}
.btn-navy{background:#0b1f3a;color:#fff;}.btn-navy:hover{background:#112d52;}
.btn-red{background:#dc2626;color:#fff;}.btn-red:hover{background:#b91c1c;}
.btn-amber{background:#d97706;color:#fff;}.btn-amber:hover{background:#b45309;}
.btn-outline{background:transparent;border:1.5px solid #e2eaf4;color:#64748b;}
.btn-outline:hover{border-color:#047857;color:#047857;}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2000;
  display:flex;align-items:flex-end;justify-content:center;padding:0;}
.modal-box{background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:480px;
  max-height:90vh;overflow-y:auto;box-shadow:0 -8px 40px rgba(0,0,0,.25);}
@media(min-width:640px){
  .modal-bg{align-items:center;padding:16px;}
  .modal-box{border-radius:18px;}
}
.filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.fchip{padding:7px 14px;border-radius:50px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:12px;
  font-weight:600;cursor:pointer;transition:all .2s;color:#64748b;white-space:nowrap;}
.fchip:hover{border-color:#047857;color:#047857;}
.fchip.on{background:#047857;border-color:#047857;color:#fff;}
/* Bar chart */
.bar-wrap{display:flex;align-items:flex-end;gap:6px;height:120px;padding:8px 0 0;}
.bar{flex:1;min-width:0;border-radius:4px 4px 0 0;transition:all .3s;
  background:linear-gradient(180deg,#047857,#059669);cursor:default;position:relative;}
.bar:hover{opacity:.85;}
.bar-label{font-family:'DM Sans',sans-serif;font-size:9px;color:#94a3b8;
  text-align:center;margin-top:4px;white-space:nowrap;overflow:hidden;
  text-overflow:ellipsis;}
`;

const STATUSES = {
  pending:   {bg:"#fef9c3",color:"#854d0e"},
  approved:  {bg:"#dcfce7",color:"#15803d"},
  completed: {bg:"#dbeafe",color:"#1e40af"},
  cancelled: {bg:"#fee2e2",color:"#991b1b"},
  rejected:  {bg:"#fee2e2",color:"#991b1b"},
  new:       {bg:"#eff8ff",color:"#0369a1"},
  read:      {bg:"#f1f5f9",color:"#64748b"},
};
function Badge({ status }) {
  const s = STATUSES[status]||{bg:"#f1f5f9",color:"#64748b"};
  return <span className="badge" style={{background:s.bg,color:s.color}}>{status}</span>;
}
function Spinner() {
  return <div style={{padding:"60px 0",textAlign:"center"}}><div className="spin"/></div>;
}
function SectionHead({ title, count, action }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
      marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
      <div>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>{title}</h2>
        {count!==undefined&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
          color:"#94a3b8",margin:"2px 0 0"}}>{count} records</p>}
      </div>
      {action}
    </div>
  );
}

// ── Mini Bar Chart (pure CSS, no library) ────────────────────
function BarChart({ data, color="#047857", title="" }) {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div>
      {title && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
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

// ── Add Doctor Modal ─────────────────────────────────────────
function AddDoctorModal({ onClose, onSaved }) {
  const [form,setForm]=useState({full_name:"",email:"",password:"",specialization:"",
    sub_specialization:"",qualification:"",registration_number:"",certifications:"",awards:"",bio:"",experience_yrs:"",phone:"",
    location:"",consultation_fee:"",available_online:true,available_home:false});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [result,setResult]=useState(null);
  const [photoFile,setPhotoFile]=useState(null);
  const [photoPreview,setPhotoPreview]=useState("");
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handlePhotoSelect=(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  const handleSubmit=async(e)=>{
    e.preventDefault();setErr("");
    if(!form.full_name||!form.email||!form.password){setErr("Name, email and password required");return;}
    setLoading(true);
    try{
      const token=localStorage.getItem("wc4a_token");
      const res=await fetch(`${API}/admin/doctors`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({...form,experience_yrs:parseInt(form.experience_yrs)||0,
          consultation_fee:parseInt(form.consultation_fee)||0}),
      });
      const json=await res.json();
      if(!res.ok)throw new Error(json.detail||"Failed");
      // Upload photo if selected
      if(photoFile && (json.id || json.doctor_id)){
        const fd=new FormData(); fd.append("file",photoFile);
        await fetch(`${API}/admin/doctors/${json.id || json.doctor_id}/photo`,{
          method:"POST",
          headers:{Authorization:`Bearer ${token}`},
          body:fd,
        });
      }
      setResult(json.credentials);
      onSaved();
    }catch(ex){setErr(ex.message);}
    finally{setLoading(false);}
  };
  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",
          padding:"18px 22px",display:"flex",justifyContent:"space-between",
          alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>Add New Doctor</h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",
            color:"#fff",width:"32px",height:"32px",borderRadius:"7px",cursor:"pointer",fontSize:"18px",
            display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {result?(
          <div style={{padding:"28px",textAlign:"center"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>✅</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"10px"}}>Doctor Created!</h3>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",
              padding:"14px",textAlign:"left",marginBottom:"14px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                color:"#15803d",marginBottom:"8px"}}>Share with Doctor:</p>
              {[["Email",result.email],["Password",result.password]].map(([l,v])=>(
                <div key={l} style={{display:"flex",gap:"8px",marginBottom:"5px"}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                    color:"#64748b",minWidth:"70px"}}>{l}:</span>
                  <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color:"#0b1f3a"}}>{v}</strong>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="btn-sm btn-navy"
              style={{padding:"10px 22px",fontSize:"13px"}}>Close</button>
          </div>
        ):(
          <form onSubmit={handleSubmit} style={{padding:"18px 22px"}}>
            {/* Photo Upload */}
            <div style={{display:"flex",alignItems:"center",gap:"16px",
              background:"#f8fafc",border:"1.5px dashed #e2eaf4",
              borderRadius:"12px",padding:"14px 16px",marginBottom:"14px"}}>
              {/* Preview */}
              <div style={{width:"60px",height:"60px",borderRadius:"50%",
                overflow:"hidden",border:"2px solid #e2eaf4",flexShrink:0,
                background:"#f1f5f9",display:"flex",alignItems:"center",
                justifyContent:"center"}}>
                {photoPreview
                  ? <img src={photoPreview} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <span style={{fontSize:"24px",color:"#94a3b8"}}>👤</span>
                }
              </div>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                  fontWeight:"600",color:"#374151",margin:"0 0 2px"}}>
                  Profile Photo <span style={{color:"#94a3b8",fontWeight:"400"}}>(optional)</span>
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#94a3b8",margin:"0 0 8px"}}>JPEG, PNG or WebP</p>
                <label style={{display:"inline-flex",alignItems:"center",gap:"6px",
                  padding:"6px 14px",borderRadius:"7px",cursor:"pointer",
                  background:"#0b1f3a",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"12px"}}>
                  📷 {photoFile ? "Change Photo" : "Choose Photo"}
                  <input type="file" accept="image/jpeg,image/png,image/webp"
                    style={{display:"none"}} onChange={handlePhotoSelect}/>
                </label>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"11px"}}>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>
                  Full Name *</label>
                <input value={form.full_name} onChange={e=>set("full_name",e.target.value)}
                  className="ad-inp" placeholder="Dr. Full Name"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Email *</label>
                <input type="email" value={form.email}
                  onChange={e=>set("email",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Password *</label>
                <input type="text" value={form.password}
                  onChange={e=>set("password",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Specialization</label>
                <input value={form.specialization}
                  onChange={e=>set("specialization",e.target.value)}
                  className="ad-inp" placeholder="Cardiology"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Qualification</label>
                <input value={form.qualification}
                  onChange={e=>set("qualification",e.target.value)}
                  className="ad-inp" placeholder="MBBS, MD"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Registration Number</label>
                <input value={form.registration_number}
                  onChange={e=>set("registration_number",e.target.value)}
                  className="ad-inp" placeholder="e.g. TNMC/12345/2010"/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Certifications</label>
                <input value={form.certifications}
                  onChange={e=>set("certifications",e.target.value)}
                  className="ad-inp" placeholder="e.g. Fellowship in Interventional Cardiology, Board Certified — Internal Medicine"/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Awards</label>
                <input value={form.awards}
                  onChange={e=>set("awards",e.target.value)}
                  className="ad-inp" placeholder="e.g. Best Cardiologist Award 2022, TN Medical Excellence Award"/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>
                  Full Bio / Description
                  <span style={{fontWeight:"400",color:"#94a3b8",marginLeft:"6px",fontSize:"11px"}}>
                    (Doctor's profile paragraph shown to patients)
                  </span>
                </label>
                <textarea value={form.bio}
                  onChange={e=>set("bio",e.target.value)}
                  rows={5}
                  placeholder="e.g. Graduated with an MBBS degree from Coimbatore Medical College in 2009. Completed Fellowship in Clinical Diabetology, further strengthening expertise in prevention, diagnosis, and management of diabetes..."
                  style={{width:"100%",padding:"9px 12px",borderRadius:"8px",
                    border:"1.5px solid #d1d5db",fontFamily:"'DM Sans',sans-serif",
                    fontSize:"13px",color:"#111827",lineHeight:"1.6",resize:"vertical",
                    outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Experience (yrs)</label>
                <input type="number" value={form.experience_yrs}
                  onChange={e=>set("experience_yrs",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Fee (₹)</label>
                <input type="number" value={form.consultation_fee}
                  onChange={e=>set("consultation_fee",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Phone</label>
                <input value={form.phone} onChange={e=>set("phone",e.target.value)}
                  className="ad-inp" placeholder="90XXXXXXXX"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Location</label>
                <input value={form.location} onChange={e=>set("location",e.target.value)}
                  className="ad-inp" placeholder="Chennai, TN"/>
              </div>
              <div style={{gridColumn:"span 2",display:"flex",gap:"16px"}}>
                {[["available_online","🎥 Video"],["available_home","🏠 Home"]].map(([k,l])=>(
                  <label key={k} style={{display:"flex",alignItems:"center",gap:"6px",
                    cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                    fontSize:"13px",fontWeight:"500",color:"#374151"}}>
                    <input type="checkbox" checked={form[k]}
                      onChange={e=>set(k,e.target.checked)}
                      style={{width:"15px",height:"15px"}}/>
                    {l}
                  </label>
                ))}
              </div>
            </div>
            {err&&<p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",
              fontSize:"13px",marginTop:"10px"}}>⚠ {err}</p>}
            <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
              <button type="submit" disabled={loading} className="btn-sm btn-navy"
                style={{padding:"10px 22px",fontSize:"13px"}}>
                {loading?"Creating…":"Create Doctor →"}
              </button>
              <button type="button" onClick={onClose} className="btn-sm btn-outline"
                style={{padding:"10px 18px",fontSize:"13px"}}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Notification Modal ────────────────────────────────────────
function NotificationModal({ token, onClose }) {
  const [form,setForm]=useState({subject:"",message:"",type:"email",target:"all"});
  const [sending,setSending]=useState(false);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  const send=async(e)=>{
    e.preventDefault();setErr("");
    if(!form.subject.trim()||!form.message.trim()){setErr("Subject and message required");return;}
    setSending(true);
    try{
      const res=await fetch(`${API}/admin/notify`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify(form),
      });
      const json=await res.json();
      if(!res.ok)throw new Error(json.detail||"Failed to send");
      setDone(true);
    }catch(ex){setErr(ex.message);}
    finally{setSending(false);}
  };
  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
          padding:"18px 22px",display:"flex",justifyContent:"space-between",
          alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>
            📢 Send Notification
          </h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",
            color:"#fff",width:"32px",height:"32px",borderRadius:"7px",cursor:"pointer",
            fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {done?(
          <div style={{padding:"36px",textAlign:"center"}}>
            <div style={{fontSize:"44px",marginBottom:"14px"}}>✅</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>
              Notification Sent!
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",
              marginBottom:"18px"}}>
              Message queued for delivery to all {form.target} patients.
            </p>
            <button onClick={onClose} className="btn-sm btn-navy"
              style={{padding:"10px 22px",fontSize:"13px"}}>Close</button>
          </div>
        ):(
          <form onSubmit={send} style={{padding:"18px 22px"}}>
            <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
              {[["email","📧 Email"],["sms","📱 SMS"]].map(([t,l])=>(
                <button key={t} type="button"
                  onClick={()=>setForm(p=>({...p,type:t}))}
                  style={{flex:1,padding:"9px",borderRadius:"8px",border:"1.5px solid",
                    fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
                    cursor:"pointer",transition:"all .2s",
                    borderColor:form.type===t?"#7c3aed":"#e2eaf4",
                    background:form.type===t?"#faf5ff":"#f8fafc",
                    color:form.type===t?"#7c3aed":"#64748b"}}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>
                Send To
              </label>
              <select value={form.target}
                onChange={e=>setForm(p=>({...p,target:e.target.value}))}
                className="ad-inp">
                <option value="all">All Patients</option>
                <option value="active">Patients with upcoming appointments</option>
                <option value="new">New patients (last 30 days)</option>
              </select>
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>
                Subject *
              </label>
              <input value={form.subject}
                onChange={e=>setForm(p=>({...p,subject:e.target.value}))}
                className="ad-inp" placeholder="e.g. Health tip from We Care 4 'all'"/>
            </div>
            <div style={{marginBottom:"14px"}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>
                Message *
              </label>
              <textarea value={form.message}
                onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                className="ad-inp" rows={4} style={{resize:"vertical"}}
                placeholder="Type your message here…"/>
            </div>
            {err&&<p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",
              fontSize:"13px",marginBottom:"10px"}}>⚠ {err}</p>}
            <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:"8px",
              padding:"10px 12px",marginBottom:"14px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#92400e",margin:0}}>
                ⚠️ This will send to all selected patients. Use carefully.
              </p>
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button type="submit" disabled={sending}
                style={{flex:1,padding:"12px",borderRadius:"9px",border:"none",
                  background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                  fontSize:"14px",cursor:"pointer",opacity:sending?0.7:1}}>
                {sending?"Sending…":"📢 Send Notification"}
              </button>
              <button type="button" onClick={onClose} className="btn-sm btn-outline"
                style={{padding:"12px 18px",fontSize:"13px"}}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── ANALYTICS SECTION ─────────────────────────────────────────
// ── ANNOUNCEMENTS ────────────────────────────────────────────
const ANNOUNCE_TYPE_META = {
  info:    { label: "Info",    color: "#0369a1", bg: "#eff8ff" },
  warning: { label: "Warning", color: "#b45309", bg: "#fffbeb" },
  urgent:  { label: "Urgent",  color: "#dc2626", bg: "#fef2f2" },
};
function Announcements({ token }) {
  const [list,    setList]    = useState(null);
  const [message, setMessage] = useState("");
  const [type,    setType]    = useState("info");
  const [expiresHrs, setExpiresHrs] = useState(""); // empty = no auto-expiry
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const fetchList = async () => {
    try {
      const res  = await fetch(`${API}/admin/announcements`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setList(json.announcements || []);
    } catch { setList([]); }
  };
  useEffect(() => { fetchList(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setErr("");
    if (!message.trim()) { setErr("Message is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/announcements`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          message: message.trim(), type,
          expires_in_hours: expiresHrs ? parseInt(expiresHrs) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Couldn't create");
      setMessage(""); setExpiresHrs(""); setType("info");
      fetchList();
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  };

  const toggle = async (id) => {
    await fetch(`${API}/admin/announcements/${id}/toggle`, { method:"PUT", headers:{ Authorization:`Bearer ${token}` }});
    fetchList();
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this announcement permanently?")) return;
    await fetch(`${API}/admin/announcements/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    fetchList();
  };

  return (
    <div>
      <SectionHead title="Announcements" count={(list||[]).length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
        Shown as a banner at the top of every page — public visitors, patients, doctors, and admin alike.
        Only one should typically be active at a time; turning a new one on doesn't automatically turn others off.
      </p>

      <form onSubmit={handleCreate} className="data-row" style={{marginBottom:"18px"}}>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={2}
          placeholder="e.g. We're closed on 26th January for a public holiday — bookings resume the next day."
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"10px 13px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",marginBottom:"10px"}}/>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
          <select value={type} onChange={e=>setType(e.target.value)}
            style={{border:"1.5px solid #e2eaf4",borderRadius:"8px",padding:"8px 12px",
              fontFamily:"'DM Sans',sans-serif",fontSize:"13px"}}>
            <option value="info">ℹ️ Info</option>
            <option value="warning">⚠️ Warning</option>
            <option value="urgent">🚨 Urgent</option>
          </select>
          <input type="number" value={expiresHrs} onChange={e=>setExpiresHrs(e.target.value)}
            placeholder="Auto-expire after (hours, optional)" min="1"
            style={{border:"1.5px solid #e2eaf4",borderRadius:"8px",padding:"8px 12px",
              fontFamily:"'DM Sans',sans-serif",fontSize:"13px",width:"220px"}}/>
          <button type="submit" disabled={saving} className="btn-sm btn-navy" style={{padding:"9px 18px"}}>
            {saving ? "Posting…" : "Post Announcement"}
          </button>
        </div>
        {err && <p style={{color:"#dc2626",fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif",marginTop:"8px"}}>⚠ {err}</p>}
      </form>

      {list===null ? <Spinner/> : list.length===0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#94a3b8",fontFamily:"'DM Sans',sans-serif"}}>
          No announcements yet.
        </div>
      ) : list.map(a => {
        const meta = ANNOUNCE_TYPE_META[a.type] || ANNOUNCE_TYPE_META.info;
        const expired = a.expires_at && new Date(a.expires_at) < new Date();
        return (
          <div key={a.id} className="data-row" style={{opacity: a.is_active && !expired ? 1 : 0.55}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
              <div style={{flex:1,minWidth:"200px"}}>
                <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"5px",flexWrap:"wrap"}}>
                  <span className="badge" style={{background:meta.bg,color:meta.color}}>{meta.label}</span>
                  {a.is_active && !expired && <span className="badge" style={{background:"#dcfce7",color:"#15803d"}}>Live</span>}
                  {expired && <span className="badge" style={{background:"#f1f5f9",color:"#64748b"}}>Expired</span>}
                  {!a.is_active && <span className="badge" style={{background:"#f1f5f9",color:"#64748b"}}>Off</span>}
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#1e293b",margin:0}}>{a.message}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#94a3b8",margin:"4px 0 0"}}>
                  Posted {new Date(a.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  {a.expires_at && ` · Expires ${new Date(a.expires_at).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}`}
                </p>
              </div>
              <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                <button onClick={()=>toggle(a.id)} className="btn-sm"
                  style={{background:a.is_active?"#fef2f2":"#dcfce7",color:a.is_active?"#991b1b":"#15803d"}}>
                  {a.is_active ? "Turn Off" : "Turn On"}
                </button>
                <button onClick={()=>remove(a.id)} className="btn-sm" style={{background:"#f1f5f9",color:"#64748b"}}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Live Activity Feed ────────────────────────────────────────
// Polls GET /admin/live every 30 seconds. One consolidated round
// trip per poll — the backend returns all four data sets together.
// The "last seen" count comparison fires a subtle pulse on the
// badge so admin knows something changed without reading it all.
function LiveFeed({ token }) {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [lastPoll,  setLastPoll]  = useState(null);
  const [pulsing,   setPulsing]   = useState(false);
  const prevCountRef = useRef(0);

  const poll = async () => {
    try {
      const res  = await fetch(`${API}/admin/live`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      if (res.ok) {
        const total =
          (json.available_now?.length    || 0) +
          (json.recent_bookings?.length  || 0) +
          (json.pending_transfers?.length|| 0) +
          (json.recent_payments?.length  || 0);
        if (prevCountRef.current > 0 && total !== prevCountRef.current) {
          setPulsing(true);
          setTimeout(() => setPulsing(false), 1200);
        }
        prevCountRef.current = total;
        setData(json);
        setLastPoll(new Date());
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    poll();
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, []);

  // "X min ago" relative time
  const ago = (isoStr) => {
    if (!isoStr) return "";
    const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
    if (diff < 1)  return "just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff/60)}h ago`;
  };

  const CARD = {
    background:"#fff", border:"1px solid #e2eaf4",
    borderRadius:"12px", padding:"16px", marginBottom:"16px",
  };
  const ROW = {
    display:"flex", justifyContent:"space-between", alignItems:"flex-start",
    gap:"10px", padding:"10px 0",
    borderBottom:"1px solid #f1f5f9",
  };
  const SH = { // section heading
    fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:"700",
    color:"#6d28d9", textTransform:"uppercase", letterSpacing:"0.05em",
    marginBottom:"8px",
  };
  const pill = (txt, color, bg) => (
    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:"700",
      padding:"2px 8px", borderRadius:"20px", color, background:bg,
      flexShrink:0, whiteSpace:"nowrap" }}>{txt}</span>
  );

  if (loading) return (
    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#94a3b8",padding:"40px 0",textAlign:"center"}}>
      Loading live activity…
    </p>
  );

  const { available_now=[], recent_bookings=[], pending_transfers=[], recent_payments=[] } = data || {};

  return (
    <div>
      {/* Header with last-refresh timestamp */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{display:"inline-block",width:"8px",height:"8px",borderRadius:"50%",
            background:"#22c55e",
            boxShadow: pulsing ? "0 0 0 6px rgba(34,197,94,.3)" : "none",
            transition:"box-shadow .4s"}}/>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"#374151",fontWeight:"600"}}>Live Activity</span>
        </div>
        {lastPoll && (
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#94a3b8"}}>
            Last refreshed: {lastPoll.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
            {" · "}Auto-refreshes every 30s
          </span>
        )}
      </div>

      {/* 2-column grid on wide screens, single column on narrow */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"16px"}}>

        {/* 1. Available Now Doctors */}
        <div style={CARD}>
          <p style={SH}>⚡ Available Now ({available_now.length})</p>
          {available_now.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#94a3b8",fontStyle:"italic",margin:0}}>
              No doctors flagged for instant consult right now
            </p>
          ) : available_now.map(d => (
            <div key={d.id} style={{...ROW,alignItems:"center"}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
                  fontWeight:"600",color:"#0b1f3a",margin:0}}>Dr. {d.full_name}</p>
                {d.specialization &&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                    color:"#64748b",margin:"2px 0 0"}}>{d.specialization}</p>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {pill("Available Now","#047857","#f0fdf4")}
                {d.available_now_since &&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                    color:"#94a3b8",margin:"4px 0 0"}}>{ago(d.available_now_since)}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Recent Bookings (last 2 hours) */}
        <div style={CARD}>
          <p style={SH}>📅 Bookings — Last 2 Hours ({recent_bookings.length})</p>
          {recent_bookings.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#94a3b8",fontStyle:"italic",margin:0}}>
              No new bookings in the last 2 hours
            </p>
          ) : recent_bookings.map(b => (
            <div key={b.id} style={ROW}>
              <div style={{minWidth:0}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
                  fontWeight:"600",color:"#0b1f3a",margin:0}}>{b.patient_name}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#64748b",margin:"2px 0 0"}}>
                  {b.doctors?.full_name ? `Dr. ${b.doctors.full_name}` : ""}
                  {b.appointment_date ? ` · ${new Date(b.appointment_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}` : ""}
                  {b.appointment_time ? ` ${b.appointment_time.slice(0,5)}` : ""}
                </p>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {pill(
                  b.status==="pending"?"⏳ Pending":
                  b.status==="approved"?"✅ Approved":b.status,
                  b.status==="pending"?"#854d0e":b.status==="approved"?"#047857":"#374151",
                  b.status==="pending"?"#fefce8":b.status==="approved"?"#f0fdf4":"#f1f5f9"
                )}
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#94a3b8",margin:"4px 0 0"}}>{ago(b.created_at)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Pending Transfer Requests */}
        <div style={CARD}>
          <p style={SH}>↪️ Pending Transfers ({pending_transfers.length})</p>
          {pending_transfers.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#94a3b8",fontStyle:"italic",margin:0}}>
              No transfer requests awaiting response
            </p>
          ) : pending_transfers.map(t => (
            <div key={t.id} style={ROW}>
              <div style={{minWidth:0}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
                  fontWeight:"600",color:"#0b1f3a",margin:0}}>
                  {t.appointments?.patient_name || "Patient"}
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#64748b",margin:"2px 0 0"}}>
                  Dr. {t.from?.full_name || "?"} → Dr. {t.to?.full_name || "?"}
                </p>
                {t.reason &&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
                    color:"#94a3b8",margin:"2px 0 0",fontStyle:"italic"}}>
                    "{t.reason}"
                  </p>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {pill("Awaiting","#854d0e","#fefce8")}
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#94a3b8",margin:"4px 0 0"}}>{ago(t.created_at)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Recent Payments (last hour) */}
        <div style={CARD}>
          <p style={SH}>💳 Payments — Last Hour ({recent_payments.length})</p>
          {recent_payments.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#94a3b8",fontStyle:"italic",margin:0}}>
              No payment activity in the last hour
            </p>
          ) : recent_payments.map(py => (
            <div key={py.id} style={ROW}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
                  fontWeight:"600",color:"#0b1f3a",margin:0}}>
                  {py.appointments?.patient_name || "Patient"}
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#64748b",margin:"2px 0 0"}}>
                  {py.gateway?.toUpperCase() || "—"}
                  {py.amount ? ` · ₹${py.amount}` : ""}
                </p>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {pill(
                  py.status==="paid"?"✅ Paid":
                  py.status==="pending"?"⏳ Pending":
                  py.status==="failed"?"❌ Failed":
                  py.status==="refund_pending"?"↩ Refund":py.status,
                  py.status==="paid"?"#047857":
                  py.status==="failed"?"#991b1b":
                  py.status==="refund_pending"?"#0369a1":"#854d0e",
                  py.status==="paid"?"#f0fdf4":
                  py.status==="failed"?"#fef2f2":
                  py.status==="refund_pending"?"#eff8ff":"#fefce8"
                )}
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#94a3b8",margin:"4px 0 0"}}>{ago(py.created_at)}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function Analytics({ token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const res  = await fetch(`${API}/admin/analytics`,
          {headers:{Authorization:`Bearer ${token}`}});
        const json = await res.json();
        setData(json);
      }catch{setData(null);}
      finally{setLoading(false);}
    })();
  },[]);

  const exportCSV = async () => {
    try{
      const res  = await fetch(`${API}/admin/export/appointments`,
        {headers:{Authorization:`Bearer ${token}`}});
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `appointments_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }catch{showToast("Export failed. Try again.", "error");}
  };

  if(loading) return <Spinner/>;
  if(!data)   return (
    <div style={{textAlign:"center",padding:"48px 0",color:"#94a3b8",
      fontFamily:"'DM Sans',sans-serif"}}>
      Analytics data unavailable. Check backend.
    </div>
  );

  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun",
                       "Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueData  = (data.monthly_revenue||[]).map((v,i)=>
    ({label:monthLabels[i],value:v}));
  const apptData     = (data.monthly_appointments||[]).map((v,i)=>
    ({label:monthLabels[i],value:v}));

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        marginBottom:"20px",flexWrap:"wrap",gap:"10px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
          Analytics
        </h2>
        <button onClick={exportCSV} className="btn-sm btn-navy"
          style={{padding:"9px 18px",fontSize:"13px"}}>
          ⬇️ Export CSV
        </button>
      </div>

      {/* KPI cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",
        gap:"12px",marginBottom:"24px"}}>
        {[
          {label:"Total Revenue",   value:`₹${(data.total_revenue||0).toLocaleString("en-IN")}`,
           icon:"💰",color:"#047857",bg:"#f0fdf4"},
          {label:"Avg per Patient", value:`₹${data.avg_revenue_per_patient||0}`,
           icon:"📊",color:"#0369a1",bg:"#eff8ff"},
          {label:"Completion Rate", value:`${data.completion_rate||0}%`,
           icon:"✅",color:"#7c3aed",bg:"#faf5ff"},
          {label:"Cancellation Rate",value:`${data.cancellation_rate||0}%`,
           icon:"❌",color:"#dc2626",bg:"#fef2f2"},
          {label:"This Month Appts",value:data.this_month_appointments||0,
           icon:"📅",color:"#d97706",bg:"#fffbeb"},
          {label:"This Month Rev",  value:`₹${(data.this_month_revenue||0).toLocaleString("en-IN")}`,
           icon:"📈",color:"#047857",bg:"#f0fdf4"},
        ].map(({label,value,icon,color,bg})=>(
          <div key={label} className="stat-card"
            style={{background:bg,border:`1px solid ${color}22`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#64748b",margin:"0 0 5px"}}>{label}</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
                  fontWeight:"700",color,margin:0,lineHeight:1}}>{value}</p>
              </div>
              <span style={{fontSize:"18px"}}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
        gap:"16px",marginBottom:"24px"}}>
        <div style={{background:"#fff",border:"1px solid #e2eaf4",
          borderRadius:"14px",padding:"20px"}}>
          <BarChart
            data={revenueData}
            color="#047857"
            title="Monthly Revenue (₹)"/>
        </div>
        <div style={{background:"#fff",border:"1px solid #e2eaf4",
          borderRadius:"14px",padding:"20px"}}>
          <BarChart
            data={apptData}
            color="#0369a1"
            title="Monthly Appointments"/>
        </div>
      </div>

      {/* Top doctors */}
      {data.top_doctors?.length>0&&(
        <div style={{background:"#fff",border:"1px solid #e2eaf4",
          borderRadius:"14px",padding:"20px",marginBottom:"16px"}}>
          <h3 style={{fontSize:"16px",fontWeight:"700",color:"#0b1f3a",
            marginBottom:"14px"}}>
            Top Performing Doctors
          </h3>
          {data.top_doctors.map((d,i)=>(
            <div key={d.id} className="data-row"
              style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <span style={{background:"#f0fdf4",color:"#047857",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                  fontSize:"13px",width:"26px",height:"26px",borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  flexShrink:0}}>
                  {i+1}
                </span>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                    fontWeight:"600",color:"#0b1f3a",margin:0}}>{d.full_name}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                    color:"#94a3b8",margin:0}}>{d.specialization}</p>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                  fontWeight:"700",color:"#047857",margin:0}}>
                  {d.appointment_count} appointments
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#94a3b8",margin:0}}>
                  ₹{(d.revenue||0).toLocaleString("en-IN")} revenue
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Specialty breakdown */}
      {data.specialty_breakdown?.length>0&&(
        <div style={{background:"#fff",border:"1px solid #e2eaf4",
          borderRadius:"14px",padding:"20px"}}>
          <h3 style={{fontSize:"16px",fontWeight:"700",color:"#0b1f3a",marginBottom:"14px"}}>
            Appointments by Specialty
          </h3>
          {data.specialty_breakdown.map(s=>{
            const pct=Math.round((s.count/(data.this_month_appointments||1))*100);
            return(
              <div key={s.specialization} style={{marginBottom:"12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  marginBottom:"4px"}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color:"#374151"}}>{s.specialization||"General"}</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    fontWeight:"600",color:"#0b1f3a"}}>{s.count}</span>
                </div>
                <div style={{height:"6px",background:"#f1f5f9",borderRadius:"3px",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:"3px",
                    background:"linear-gradient(90deg,#047857,#059669)",
                    width:`${Math.min(pct,100)}%`,transition:"width .5s"}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── OVERVIEW (enhanced) ───────────────────────────────────────
function Overview({ stats, token, onNotify }) {
  if (!stats) return <Spinner/>;
  const CARDS = [
    {label:"Pending",    value:stats.appointments.pending,   icon:"⏳",color:"#d97706",bg:"#fffbeb"},
    {label:"Approved",   value:stats.appointments.approved,  icon:"✅",color:"#047857",bg:"#f0fdf4"},
    {label:"Completed",  value:stats.appointments.completed, icon:"🏆",color:"#0369a1",bg:"#eff8ff"},
    {label:"Today New",  value:stats.appointments.today,     icon:"📅",color:"#7c3aed",bg:"#faf5ff"},
    {label:"Doctors",    value:stats.doctors.active,         icon:"👨‍⚕️",color:"#0b1f3a",bg:"#f0f6fc"},
    {label:"Patients",   value:stats.patients.total,         icon:"🧑‍💼",color:"#be123c",bg:"#fff1f2"},
    {label:"New Contacts",value:stats.contacts.new,          icon:"📬",color:"#b45309",bg:"#fffbeb"},
    {label:"Empanelments",value:stats.empanelments.pending,  icon:"🏥",color:"#6d28d9",bg:"#faf5ff"},
  ];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        marginBottom:"20px",flexWrap:"wrap",gap:"10px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>Overview</h2>
        <button onClick={onNotify}
          style={{padding:"9px 18px",borderRadius:"8px",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px"}}>
          📢 Send Notification
        </button>
      </div>
      <div className="stat-grid-8"
        style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",
          gap:"12px",marginBottom:"24px"}}>
        {CARDS.map(({label,value,icon,color,bg})=>(
          <div key={label} className="stat-card"
            style={{background:bg,border:`1px solid ${color}20`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#64748b",margin:"0 0 5px"}}>{label}</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",
                  fontWeight:"700",color,margin:0,lineHeight:1}}>{value??0}</p>
              </div>
              <div style={{width:"38px",height:"38px",background:`${color}15`,
                borderRadius:"10px",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:"16px",flexShrink:0}}>{icon}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Revenue + patients */}
      <div style={{background:"linear-gradient(135deg,#047857,#059669)",borderRadius:"14px",
        padding:"20px 24px",display:"flex",justifyContent:"space-between",
        alignItems:"center",flexWrap:"wrap",gap:"14px"}}>
        <div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"rgba(255,255,255,.7)",margin:"0 0 4px"}}>
            Total Revenue (Completed)
          </p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"34px",
            fontWeight:"700",color:"#fff",margin:0,lineHeight:1}}>
            ₹{(stats.revenue?.total||0).toLocaleString("en-IN")}
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"rgba(255,255,255,.7)",margin:"0 0 3px"}}>
            New patients this month
          </p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",
            fontWeight:"700",color:"#a7f3d0",margin:0}}>
            {stats.patients.this_month}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── APPOINTMENTS ─────────────────────────────────────────────
function Appointments({ token }) {
  const [data,setData]=useState([]);
  const [doctorsList,setDoctorsList]=useState([]);
  const [picked,setPicked]=useState({}); // {appointmentId: doctorId}
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const fetch2=useCallback(async(f=filter)=>{
    setLoading(true);
    try{
      const params=new URLSearchParams();
      if(f!=="all")params.set("status",f);
      const res=await fetch(`${API}/admin/appointments?${params}&limit=100`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.appointments||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  },[token,filter]);
  useEffect(()=>{
    fetch2();
    fetch(`${API}/admin/doctors`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.json()).then(j=>setDoctorsList(j.doctors||[])).catch(()=>{});
  },[]);
  const update=async(id,status,doctor_id)=>{
    try{
      const body={status};
      if(doctor_id) body.doctor_id=doctor_id;
      await fetch(`${API}/admin/appointments/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify(body),
      });
      fetch2();
    }catch{}
  };
  const filtered=search?data.filter(a=>
    (a.patient_name||"").toLowerCase().includes(search.toLowerCase())||
    (a.patient_mobile||"").includes(search)):data;
  return(
    <div>
      <SectionHead title="Appointments" count={filtered.length}/>
      <div className="filter-bar">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          className="ad-inp" style={{width:"220px",maxWidth:"100%"}}
          placeholder="🔍 Search patient…"/>
        {["all","pending","approved","completed","cancelled"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);fetch2(f);}}
            className={`fchip${filter===f?" on":""}`}>{f}</button>
        ))}
      </div>
      {loading?<Spinner/>:filtered.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>No appointments found.</div>
      ):filtered.map(a=>{
        const doc=a.doctors;
        const isAssigned = !!a.assigned_by_admin;
        const selectedDoctor = picked[a.id] ?? a.doctor_id ?? "";
        return(
          <div key={a.id} className="data-row">
            <div style={{display:"flex",justifyContent:"space-between",
              alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",
                  flexWrap:"wrap",marginBottom:"5px"}}>
                  <strong style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"14px",color:"#0b1f3a"}}>{a.patient_name}</strong>
                  <Badge status={a.status}/>
                  {a.status==="pending"&&(
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                      fontWeight:"700",padding:"2px 8px",borderRadius:"50px",
                      background: isAssigned ? "#dcfce7" : "#fef9c3",
                      color: isAssigned ? "#15803d" : "#854d0e"}}>
                      {isAssigned ? "Assigned — awaiting doctor" : "Not yet assigned"}
                    </span>
                  )}
                  <span style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#94a3b8"}}>#{a.id}</span>
                </div>
                <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
                  {[["📅",`${a.appointment_date} ${a.appointment_time?.slice(0,5)||""}`],
                    ["📱",a.patient_mobile||""],["✉️",a.patient_email||""],
                    ["💰",a.payment_amount?`₹${a.payment_amount}`:"Free"],
                  ].map(([ic,val])=>(
                    <span key={ic} style={{fontFamily:"'DM Sans',sans-serif",
                      fontSize:"12px",color:"#64748b"}}>{ic} {val}</span>
                  ))}
                </div>
                {a.status==="pending"&&(
                  <div style={{marginTop:"8px",display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                      color:"#94a3b8",fontWeight:"600"}}>👨‍⚕️ Assign to:</span>
                    <select className="ad-inp" style={{width:"200px",padding:"6px 10px",fontSize:"12px"}}
                      value={selectedDoctor}
                      onChange={e=>setPicked({...picked,[a.id]:e.target.value})}>
                      <option value="">Select doctor…</option>
                      {doctorsList.map(d=>(
                        <option key={d.id} value={d.id}>{d.full_name} — {d.specialization}</option>
                      ))}
                    </select>
                  </div>
                )}
                {a.symptoms&&<p style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",color:"#94a3b8",fontStyle:"italic",
                  margin:"4px 0 0"}}>"{a.symptoms}"</p>}
              </div>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap",flexShrink:0}}>
                {a.status==="pending"&&<>
                  <button className="btn-sm btn-green"
                    disabled={!selectedDoctor}
                    onClick={()=>update(a.id,"approved",selectedDoctor)}>
                    {isAssigned ? "Re-assign & Notify" : "Assign & Notify"}
                  </button>
                  <button className="btn-sm btn-red"
                    onClick={()=>update(a.id,"cancelled")}>Cancel</button>
                </>}
                {a.status==="approved"&&
                  <button className="btn-sm btn-navy"
                    onClick={()=>update(a.id,"completed")}>Complete</button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── DOCTORS ──────────────────────────────────────────────────
function Doctors({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const fetchData=async()=>{
    setLoading(true);
    try{
      const ctrl=new AbortController();
      const t=setTimeout(()=>ctrl.abort(),15000);
      const res=await fetch(`${API}/admin/doctors`,
        {headers:{Authorization:`Bearer ${token}`},signal:ctrl.signal});
      clearTimeout(t);
      const json=await res.json();
      setData(json.doctors||[]);
    }catch(e){
      if(e.name==="AbortError") showToast("Server taking too long — try refreshing","warning");
      setData([]);
    }
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);
  const toggle=async(id,is_active)=>{
    try{
      await fetch(`${API}/admin/doctors/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({is_active:!is_active}),
      });
      fetchData();
    }catch{}
  };
  const uploadPhoto=async(doctorId, file)=>{
    const fd=new FormData(); fd.append("file",file);
    try{
      const res=await fetch(`${API}/admin/doctors/${doctorId}/photo`,{
        method:"POST", headers:{Authorization:`Bearer ${token}`}, body:fd,
      });
      const json=await res.json();
      if(json.photo_url){ showToast("Photo uploaded successfully!","success"); fetchData(); }
      else { showToast("Upload failed","error"); }
    }catch{ showToast("Upload failed","error"); }
  };
  return(
    <div>
      <SectionHead title="Doctors" count={data.length}
        action={<button className="btn-sm btn-navy"
          style={{padding:"9px 18px",fontSize:"13px"}}
          onClick={()=>setShowAdd(true)}>+ Add Doctor</button>}/>
      {loading?<Spinner/>:data.map(d=>(
        <div key={d.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              {/* Photo */}
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:"48px",height:"48px",borderRadius:"50%",overflow:"hidden",
                  border:"2px solid #e2eaf4",background:"#f1f5f9",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {d.photo_url
                    ? <img src={d.photo_url} alt={d.full_name}
                        style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <span style={{fontSize:"20px",fontFamily:"'Cormorant Garamond',serif",
                        fontWeight:"700",color:"#94a3b8"}}>
                        {(d.full_name||"D")[0].toUpperCase()}
                      </span>
                  }
                </div>
                {/* Upload trigger */}
                <label title="Upload photo"
                  style={{position:"absolute",bottom:"-2px",right:"-2px",
                    width:"18px",height:"18px",borderRadius:"50%",
                    background:"#047857",border:"2px solid #fff",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    cursor:"pointer",fontSize:"9px",color:"#fff"}}>
                  📷
                  <input type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>e.target.files[0]&&uploadPhoto(d.id,e.target.files[0])}/>
                </label>
              </div>
              <div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",
                marginBottom:"4px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px",color:"#0b1f3a"}}>{d.full_name}</strong>
                <span className="badge"
                  style={{background:d.is_active?"#dcfce7":"#fee2e2",
                    color:d.is_active?"#15803d":"#991b1b"}}>
                  {d.is_active?"Active":"Inactive"}
                </span>
              </div>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
                {[d.specialization,d.qualification,
                  d.experience_yrs&&`${d.experience_yrs}yrs`,
                  d.email,d.phone].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
            </div>
            </div>
            <button className={`btn-sm ${d.is_active?"btn-red":"btn-green"}`}
              onClick={()=>toggle(d.id,d.is_active)}>
              {d.is_active?"Deactivate":"Activate"}
            </button>
          </div>
        </div>
      ))}
      {showAdd&&<AddDoctorModal onClose={()=>setShowAdd(false)} onSaved={fetchData}/>}
    </div>
  );
}

// ── EMPANELMENTS ─────────────────────────────────────────────
function Empanelments({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("pending");
  const [justApproved,setJustApproved]=useState(null);
  const fetchData=async(f=filter)=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/admin/empanelments?status=${f}`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.empanelments||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);
  const [updateErr,setUpdateErr]=useState(null);
  const update=async(id,status)=>{
    setUpdateErr(null);
    try{
      const res = await fetch(`${API}/admin/empanelments/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({status}),
      });
      const json = await res.json();
      if(!res.ok){
        setUpdateErr(json.detail || json.message || `Error ${res.status}: could not ${status} application`);
        return;
      }
      if(status==="approved"){
        setJustApproved({id, ...json});
      }
      fetchData();
    }catch(e){
      setUpdateErr("Network error — please check your connection and try again.");
    }
  };
  return(
    <div>
      <SectionHead title="Hospital Empanelments" count={data.length}/>
      {justApproved && (
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",
          padding:"12px 16px",marginBottom:"14px",display:"flex",
          justifyContent:"space-between",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#15803d"}}>
            {justApproved.credentials_emailed
              ? <>✅ Approved — login credentials emailed to <strong>{justApproved.hospital_email}</strong>.</>
              : <>✅ Approved — this hospital already has a login (re-approval doesn't resend credentials).</>}
          </span>
          <button className="btn-sm" style={{background:"#f1f5f9",color:"#64748b"}}
            onClick={()=>setJustApproved(null)}>Dismiss</button>
        </div>
      )}
      {updateErr && (
        <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:"10px",
          padding:"12px 16px",marginBottom:"14px",display:"flex",
          justifyContent:"space-between",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#dc2626"}}>
            ❌ {updateErr}
          </span>
          <button className="btn-sm" style={{background:"#f1f5f9",color:"#64748b"}}
            onClick={()=>setUpdateErr(null)}>Dismiss</button>
        </div>
      )}
      <div className="filter-bar">
        {["pending","approved","rejected","all"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);fetchData(f);}}
            className={`fchip${filter===f?" on":""}`}>{f}</button>
        ))}
      </div>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>No applications found.</div>
      ):data.map(e=>(
        <div key={e.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",
                marginBottom:"5px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px",color:"#0b1f3a"}}>{e.hospital_name}</strong>
                <Badge status={e.status}/>
                {e.partnership_tier&&
                  <span className="badge"
                    style={{background:"#eff8ff",color:"#0369a1"}}>
                    {e.partnership_tier.toUpperCase()}
                  </span>}
              </div>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
                {[e.contact_person,e.email,e.mobile,
                  `${e.city||""}, ${e.state||""}`].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
            </div>
            {e.status==="pending"&&(
              <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                <button className="btn-sm btn-green"
                  onClick={()=>update(e.id,"approved")}>Approve</button>
                <button className="btn-sm btn-red"
                  onClick={()=>update(e.id,"rejected")}>Reject</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── HOSPITAL PARTNERS ────────────────────────────────────────
function Hospitals({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [expanded,setExpanded]=useState(null);
  const [commissions,setCommissions]=useState({});
  const [adding,setAdding]=useState(null);
  const [amount,setAmount]=useState("");
  const [rate,setRate]=useState("");
  const [settingPrice,setSettingPrice]=useState(null);
  const [subAmount,setSubAmount]=useState("");
  const [subCycle,setSubCycle]=useState("monthly");

  const fetchData=async()=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/admin/hospitals`,{headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.hospitals||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);

  const regenerate=async(id)=>{
    if(!window.confirm("This invalidates the hospital's current portal link. Continue?"))return;
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/regenerate-token`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      if(json.portal_link){
        navigator.clipboard.writeText(json.portal_link);
        showToast("New portal link copied to clipboard:\n"+json.portal_link, "success");
      }
      fetchData();
    }catch{}
  };

  const resetPassword=async(id)=>{
    if(!window.confirm("This generates a new login password and emails it to the hospital — their old password stops working immediately. Continue?"))return;
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/reset-password`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      showToast(json.message || (res.ok ? "New password sent." : "Couldn't reset password.", "error"));
    }catch{}
  };

  const setSubscriptionPrice=async(id)=>{
    if(!subAmount||parseFloat(subAmount)<=0){showToast("Enter a valid amount", "info");return;}
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/subscription`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({amount:parseFloat(subAmount),billing_cycle:subCycle}),
      });
      const json=await res.json();
      if(!res.ok){showToast(json.detail||"Couldn't set price", "error");return;}
      showToast(json.message, "info");
      setSettingPrice(null);setSubAmount("");
    }catch{}
  };

  const markAsPaid=async(id)=>{
    if(!window.confirm("Mark this hospital's subscription as PAID? This will unlock their features immediately.")) return;
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/subscription/mark-paid`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
      });
      const json=await res.json();
      if(res.ok){ showToast("✅ Subscription marked as paid — features unlocked!","success"); fetchData(); }
      else { showToast(json.detail||"Failed","error"); }
    }catch{ showToast("Network error","error"); }
  };

  const addCommission=async(id)=>{
    if(!amount)return;
    try{
      await fetch(`${API}/admin/hospitals/${id}/commissions`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({amount_due:parseFloat(amount),commission_rate:rate?parseFloat(rate):null}),
      });
      setAdding(null);setAmount("");setRate("");
      if(expanded===id) fetchCommissions(id);
    }catch{}
  };

  const fetchCommissions=async(id)=>{
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/commissions`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setCommissions(prev=>({...prev,[id]:json.commissions||[]}));
    }catch{
      setCommissions(prev=>({...prev,[id]:[]}));
    }
  };

  const toggleExpand=(id)=>{
    if(expanded===id){ setExpanded(null); return; }
    setExpanded(id);
    if(!commissions[id]) fetchCommissions(id);
  };

  const settle=async(commId,hospId)=>{
    const recv=window.prompt("Amount actually received (₹)?");
    if(!recv)return;
    try{
      await fetch(`${API}/admin/commissions/${commId}/settle`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({amount_received:parseFloat(recv)}),
      });
      setCommissions(prev=>{const c={...prev}; delete c[hospId]; return c;});
      if(expanded===hospId) fetchCommissions(hospId);
    }catch{}
  };

  return(
    <div>
      <SectionHead title="Hospital Partners" count={data.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
        Approved hospitals from the Empanelments tab show up here automatically, with login
        credentials already emailed. Add a commission record whenever a referral or partnership fee
        is owed, and mark it received once it's actually been paid.
      </p>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>
          No approved hospital partners yet — approve one from the Empanelments tab.
        </div>
      ):data.map(h=>(
        <div key={h.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
            <div>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                {h.hospital_name}
              </strong>
              <span className="badge" style={{marginLeft:"8px",background:"#eff8ff",color:"#0369a1"}}>
                {(h.tier||"basic").toUpperCase()}
              </span>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginTop:"4px"}}>
                {[h.contact_person,h.email,h.mobile,h.city].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#94a3b8",margin:"4px 0 0"}}>
                {h.last_login_at
                  ? <>🟢 Last login {new Date(h.last_login_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</>
                  : <>⚪ Hasn't logged in yet</>}
              </p>
            </div>
            <div style={{display:"flex",gap:"6px",flexShrink:0,flexWrap:"wrap"}}>
              <button className="btn-sm" style={{background:"#eff8ff",color:"#0369a1"}}
                onClick={()=>toggleExpand(h.id)}>
                {expanded===h.id?"Hide":"View"} Commissions
              </button>
              <button className="btn-sm btn-navy" onClick={()=>setAdding(adding===h.id?null:h.id)}>
                + Commission
              </button>
              {h.tier!=="basic"&&
                <button className="btn-sm" style={{background:"#eff8ff",color:"#0369a1"}}
                  onClick={()=>setSettingPrice(settingPrice===h.id?null:h.id)}>
                  💳 Set Subscription Price
                </button>}
              {h.tier!=="basic"&&
                <button className="btn-sm" style={{background:"#dcfce7",color:"#15803d"}}
                  onClick={()=>markAsPaid(h.id)}>
                  ✅ Mark as Paid
                </button>}
              <button className="btn-sm" style={{background:"#fffbeb",color:"#92400e"}}
                onClick={()=>resetPassword(h.id)}>
                🔑 Reset Password
              </button>
              <button className="btn-sm" style={{background:"#f1f5f9",color:"#64748b"}}
                onClick={()=>regenerate(h.id)}>
                🔄 New Legacy Link
              </button>
            </div>
          </div>
          {settingPrice===h.id&&(
            <div style={{marginTop:"10px",display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",
              background:"#eff8ff",border:"1px solid #bae6fd",borderRadius:"9px",padding:"10px"}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#0369a1",fontWeight:600}}>
                Agreed amount (after discussing pricing with the hospital):
              </span>
              <input value={subAmount} onChange={e=>setSubAmount(e.target.value)}
                placeholder="Amount (₹)" type="number" className="ad-inp"
                style={{width:"140px",padding:"6px 10px",fontSize:"12px"}}/>
              <select value={subCycle} onChange={e=>setSubCycle(e.target.value)}
                className="ad-inp" style={{width:"120px",padding:"6px 10px",fontSize:"12px"}}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <button className="btn-sm btn-green" onClick={()=>setSubscriptionPrice(h.id)}>Save</button>
            </div>
          )}
          {adding===h.id&&(
            <div style={{marginTop:"10px",display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
              <input value={amount} onChange={e=>setAmount(e.target.value)}
                placeholder="Amount due (₹)" type="number" className="ad-inp"
                style={{width:"140px",padding:"6px 10px",fontSize:"12px"}}/>
              <input value={rate} onChange={e=>setRate(e.target.value)}
                placeholder="Rate % (optional)" type="number" className="ad-inp"
                style={{width:"140px",padding:"6px 10px",fontSize:"12px"}}/>
              <button className="btn-sm btn-green" onClick={()=>addCommission(h.id)}>Save</button>
            </div>
          )}
          {expanded===h.id&&(
            <div style={{marginTop:"12px",background:"#f8fafc",borderRadius:"10px",padding:"12px"}}>
              {!commissions[h.id]?(
                <Spinner/>
              ):commissions[h.id].length===0?(
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8",margin:0}}>
                  No commission records yet.
                </p>
              ):commissions[h.id].map(c=>(
                <div key={c.id} style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",padding:"8px 0",borderBottom:"1px solid #e2eaf4",flexWrap:"wrap",gap:"8px"}}>
                  <div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:"#0b1f3a"}}>
                      ₹{c.amount_due} due
                    </span>
                    {c.commission_rate&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                      color:"#94a3b8",marginLeft:"8px"}}>({c.commission_rate}%)</span>}
                    <span className="badge" style={{marginLeft:"8px",
                      background:c.status==="received"?"#dcfce7":"#fef9c3",
                      color:c.status==="received"?"#15803d":"#854d0e"}}>
                      {c.status}
                    </span>
                  </div>
                  {c.status!=="received"&&(
                    <button className="btn-sm btn-green" onClick={()=>settle(c.id,h.id)}>Mark Received</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── REVIEWS ──────────────────────────────────────────────────
function Reviews({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);

  const fetchData=async()=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/admin/reviews`,{headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.reviews||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);

  const toggleHidden=async(id)=>{
    try{
      await fetch(`${API}/admin/reviews/${id}/toggle-hidden`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      fetchData();
    }catch{}
  };

  return(
    <div>
      <SectionHead title="Reviews" count={data.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
        Hiding a review removes it from the public doctor listing and recalculates that doctor's
        average rating — it isn't deleted, and can be unhidden any time.
      </p>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>No reviews yet.</div>
      ):data.map(r=>(
        <div key={r.id} className="data-row" style={{opacity:r.is_hidden?0.55:1}}>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                <span style={{color:"#fbbf24",fontSize:"14px"}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                {r.is_hidden && <span className="badge" style={{background:"#fef2f2",color:"#991b1b"}}>Hidden</span>}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",margin:"0 0 4px"}}>
                For <strong>Dr. {r.doctors?.full_name||"—"}</strong> by {r.users?.full_name||"a patient"}
              </p>
              {r.review_text && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"#1e293b",margin:0,fontStyle:"italic"}}>"{r.review_text}"</p>}
            </div>
            <button className="btn-sm" style={{background:r.is_hidden?"#dcfce7":"#fef2f2",
              color:r.is_hidden?"#15803d":"#991b1b"}}
              onClick={()=>toggleHidden(r.id)}>
              {r.is_hidden?"Unhide":"Hide"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CONTACTS ─────────────────────────────────────────────────
function Contacts({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const res=await fetch(`${API}/admin/contacts`,
          {headers:{Authorization:`Bearer ${token}`}});
        const json=await res.json();
        setData(json.contacts||[]);
      }catch{setData([]);}
      finally{setLoading(false);}
    })();
  },[]);
  const markRead=async(id)=>{
    try{
      await fetch(`${API}/admin/contacts/${id}/read`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      setData(p=>p.map(c=>c.id===id?{...c,status:"read"}:c));
    }catch{}
  };
  return(
    <div>
      <SectionHead title="Contact Submissions" count={data.length}/>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>No contact submissions.</div>
      ):data.map(c=>(
        <div key={c.id} className="data-row"
          style={{borderLeft:`3px solid ${c.status==="new"?"#0369a1":"#e2eaf4"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"8px"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",
                marginBottom:"5px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px",color:"#0b1f3a"}}>{c.full_name}</strong>
                <Badge status={c.status||"new"}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",color:"#94a3b8"}}>
                  {new Date(c.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"6px"}}>
                {[c.email,c.mobile,c.subject].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"#374151",margin:0,lineHeight:"1.6"}}>{c.message}</p>
            </div>
            {c.status==="new"&&(
              <button className="btn-sm btn-outline"
                onClick={()=>markRead(c.id)} style={{flexShrink:0}}>
                Mark Read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PATIENTS ─────────────────────────────────────────────────
// ── Per-patient message modal ─────────────────────────────────
function SendMessageModal({ patient, token, onClose }) {
  const [type,    setType]    = useState("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState(null); // {ok, text}

  const send = async () => {
    if (!subject.trim()) { setResult({ ok:false, text:"Subject is required" }); return; }
    if (!message.trim()) { setResult({ ok:false, text:"Message body is required" }); return; }
    setSending(true); setResult(null);
    try {
      const res  = await fetch(`${API}/admin/notify-patient`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ patient_id:patient.id, subject:subject.trim(), message:message.trim(), type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed");
      setResult({ ok:true, text:json.message });
    } catch(e) {
      setResult({ ok:false, text:e.message || "Failed to send" });
    } finally { setSending(false); }
  };

  const INP = { width:"100%", border:"1.5px solid #e2eaf4", borderRadius:"9px",
    padding:"11px 13px", fontFamily:"'DM Sans',sans-serif",
    fontSize:"14px", color:"#1e293b", background:"#f8fafc", outline:"none", boxSizing:"border-box" };
  const LBL = { display:"block", fontFamily:"'DM Sans',sans-serif",
    fontSize:"11px", fontWeight:"700", color:"#374151", marginBottom:"5px" };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:3000,
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",width:"100%",maxWidth:"520px",
        borderRadius:"20px 20px 0 0",padding:"22px",maxHeight:"90vh",overflowY:"auto"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"flex-start",marginBottom:"16px"}}>
          <div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
              fontWeight:"700",color:"#0b1f3a",margin:0}}>Message Patient</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
              color:"#64748b",margin:"3px 0 0"}}>
              To: <strong>{patient.full_name||"Patient"}</strong>
              {patient.email  ? ` · ${patient.email}`  : ""}
              {patient.mobile ? ` · ${patient.mobile}` : ""}
            </p>
          </div>
          <button onClick={onClose}
            style={{background:"#f1f5f9",border:"none",width:"32px",height:"32px",
              borderRadius:"8px",cursor:"pointer",fontSize:"18px",color:"#64748b",flexShrink:0}}>×</button>
        </div>

        {/* Channel selector */}
        <div style={{marginBottom:"14px"}}>
          <span style={LBL}>Send via</span>
          <div style={{display:"flex",gap:"8px"}}>
            {[["email","📧 Email"],["sms","📱 SMS"],["both","📧 + 📱 Both"]].map(([val,label])=>(
              <button key={val} onClick={()=>setType(val)}
                style={{flex:1,padding:"9px 6px",borderRadius:"9px",
                  fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",fontWeight:"600",
                  cursor:"pointer",transition:"all .15s",
                  border:type===val?"2px solid #047857":"1.5px solid #e2eaf4",
                  background:type===val?"#f0fdf4":"#f8fafc",
                  color:type===val?"#047857":"#64748b"}}>
                {label}
              </button>
            ))}
          </div>
          {type!=="sms"&&!patient.email&&(
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
              color:"#dc2626",margin:"6px 0 0"}}>⚠ No email address on record</p>)}
          {type!=="email"&&!patient.mobile&&(
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
              color:"#dc2626",margin:"6px 0 0"}}>⚠ No mobile number on record</p>)}
        </div>

        {/* Subject */}
        <div style={{marginBottom:"12px"}}>
          <label style={LBL}>Subject *</label>
          <input value={subject} onChange={e=>setSubject(e.target.value)}
            style={INP} placeholder="e.g. Follow-up on your recent appointment"/>
        </div>

        {/* Body */}
        <div style={{marginBottom:"14px"}}>
          <label style={LBL}>
            Message *
            {type!=="email"&&(
              <span style={{fontWeight:"400",color:"#94a3b8",marginLeft:"6px"}}>
                (SMS capped at 100 chars)
              </span>)}
          </label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)}
            rows={5} placeholder="Type your message here…"
            style={{...INP,resize:"vertical",minHeight:"110px",lineHeight:"1.6",padding:"12px 13px"}}/>
          {type!=="email"&&message.length>0&&(
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:message.length>100?"#dc2626":"#94a3b8",
              margin:"4px 0 0",textAlign:"right"}}>
              {message.length}/100{message.length>100?" — will be truncated":""}
            </p>)}
        </div>

        {/* Result */}
        {result&&(
          <div style={{padding:"10px 14px",borderRadius:"9px",marginBottom:"12px",
            background:result.ok?"#f0fdf4":"#fef2f2",
            border:`1px solid ${result.ok?"#86efac":"#fecaca"}`,
            fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:result.ok?"#15803d":"#dc2626"}}>
            {result.ok?"✅":"⚠"} {result.text}
          </div>)}

        {/* Actions */}
        <div style={{display:"flex",gap:"10px"}}>
          {!result?.ok&&(
            <button onClick={send} disabled={sending}
              style={{flex:1,padding:"13px",borderRadius:"9px",border:"none",
                background:sending?"#94a3b8":"linear-gradient(135deg,#047857,#059669)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"700",fontSize:"14px",cursor:sending?"wait":"pointer"}}>
              {sending?"Sending…":`Send ${type==="email"?"Email":type==="sms"?"SMS":"Email + SMS"}`}
            </button>)}
          <button onClick={onClose}
            style={{flex:result?.ok?1:0,padding:"13px",borderRadius:"9px",
              border:"1.5px solid #e2eaf4",background:"#fff",color:"#64748b",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
              fontSize:"14px",cursor:"pointer",minWidth:"90px"}}>
            {result?.ok?"Done":"Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Patients({ token }) {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [msgPatient, setMsgPatient] = useState(null);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const res=await fetch(`${API}/admin/patients`,
          {headers:{Authorization:`Bearer ${token}`}});
        const json=await res.json();
        setData(json.patients||[]);
      }catch{setData([]);}
      finally{setLoading(false);}
    })();
  },[]);

  const filtered=search?data.filter(p=>
    (p.full_name||"").toLowerCase().includes(search.toLowerCase())||
    (p.email||"").toLowerCase().includes(search.toLowerCase())||
    (p.mobile||"").includes(search)):data;

  return(
    <div>
      <SectionHead title="Registered Patients" count={filtered.length}/>
      <input value={search} onChange={e=>setSearch(e.target.value)}
        className="ad-inp"
        style={{width:"260px",maxWidth:"100%",marginBottom:"16px"}}
        placeholder="🔍 Search by name, email, mobile…"/>
      {loading?<Spinner/>:filtered.map(p=>(
        <div key={p.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
            <div>
              <strong style={{fontFamily:"'DM Sans',sans-serif",
                fontSize:"14px",color:"#0b1f3a"}}>
                {p.full_name||"—"}
              </strong>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginTop:"4px"}}>
                {[p.email,p.mobile,p.gender,
                  `${p.city||""}${p.state?`, ${p.state}`:""}`,
                  `Joined: ${new Date(p.created_at).toLocaleDateString("en-IN")}`,
                ].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
              <span className="badge"
                style={{background:p.is_active?"#dcfce7":"#fee2e2",
                  color:p.is_active?"#15803d":"#991b1b"}}>
                {p.is_active?"Active":"Inactive"}
              </span>
              <button onClick={()=>setMsgPatient(p)}
                style={{padding:"6px 14px",borderRadius:"8px",
                  background:"#eff8ff",border:"1.5px solid #93c5fd",
                  color:"#0369a1",fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                ✉ Message
              </button>
            </div>
          </div>
        </div>
      ))}
      {msgPatient&&(
        <SendMessageModal
          patient={msgPatient}
          token={token}
          onClose={()=>setMsgPatient(null)}
        />
      )}
    </div>
  );
}

// ── DOCTOR PAYOUTS ───────────────────────────────────────────
function Payouts({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("pending");
  const [settling,setSettling]=useState(null);
  const [ref,setRef]=useState("");

  const fetchData=async(f=filter)=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/admin/payouts?status=${f}`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.payouts||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);

  const settle=async(id)=>{
    try{
      await fetch(`${API}/admin/payouts/${id}/settle`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({payout_reference:ref,payout_method:"bank_transfer"}),
      });
      setSettling(null); setRef("");
      fetchData();
    }catch{}
  };

  const totalPending = data.filter(p=>p.status==="pending")
    .reduce((s,p)=>s+(p.payout_amount||0),0);

  return(
    <div>
      <SectionHead title="Doctor Payouts" count={data.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
        color:"#64748b",marginBottom:"14px",lineHeight:"1.6"}}>
        Patients pay into your Razorpay account directly — this is a manual
        ledger of what's owed to each doctor after a completed, paid
        appointment. Settling here just records that you've paid them
        outside the platform (bank transfer, UPI, etc); it doesn't move
        money automatically.
      </p>
      {filter==="pending" && totalPending>0 && (
        <div style={{background:"#fef9c3",border:"1px solid #fde68a",
          borderRadius:"10px",padding:"12px 16px",marginBottom:"14px"}}>
          <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#854d0e"}}>
            ₹{totalPending.toLocaleString("en-IN")} pending across {data.filter(p=>p.status==="pending").length} payout(s)
          </strong>
        </div>
      )}
      <div className="filter-bar">
        {["pending","paid"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);fetchData(f);}}
            className={`fchip${filter===f?" on":""}`}>{f}</button>
        ))}
      </div>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>No {filter} payouts.</div>
      ):data.map(p=>(
        <div key={p.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
            <div>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                Dr. {p.doctors?.full_name || "—"}
              </strong>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginTop:"4px"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>
                  Patient: {p.appointments?.patient_name||"—"} · {p.appointments?.appointment_date||""}
                </span>
              </div>
              <div style={{display:"flex",gap:"16px",flexWrap:"wrap",marginTop:"6px"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
                  Gross: ₹{p.gross_amount}
                </span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
                  Platform fee: ₹{p.platform_fee}
                </span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:"#047857"}}>
                  Payout: ₹{p.payout_amount}
                </span>
              </div>
              {p.status==="paid" && p.payout_reference && (
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#94a3b8",margin:"4px 0 0"}}>Ref: {p.payout_reference}</p>
              )}
            </div>
            <div>
              {p.status==="pending" ? (
                settling===p.id ? (
                  <div style={{display:"flex",gap:"6px"}}>
                    <input value={ref} onChange={e=>setRef(e.target.value)}
                      placeholder="UTR / reference" className="ad-inp"
                      style={{width:"140px",padding:"6px 10px",fontSize:"12px"}}/>
                    <button className="btn-sm btn-green" onClick={()=>settle(p.id)}>Confirm</button>
                    <button className="btn-sm" onClick={()=>setSettling(null)}
                      style={{background:"#f1f5f9",color:"#64748b"}}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn-sm btn-green" onClick={()=>setSettling(p.id)}>
                    Mark Paid
                  </button>
                )
              ) : (
                <span className="badge" style={{background:"#dcfce7",color:"#15803d"}}>Paid</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── REFUNDS ──────────────────────────────────────────────────
function Refunds({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [processing,setProcessing]=useState(null);

  const fetchData=async()=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/payments/admin/refund-queue`,{headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.appointments||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);

  const processRefund=async(id)=>{
    if(!window.confirm("This issues a real refund through Razorpay right now. Continue?"))return;
    setProcessing(id);
    try{
      const res=await fetch(`${API}/payments/admin/${id}/refund`,
        {method:"POST",headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      if(!res.ok){ showToast(json.detail||"Refund failed", "error"); return; }
      fetchData();
    }catch{ showToast("Refund failed. Please try again.", "error"); }
    finally{ setProcessing(null); }
  };

  return(
    <div>
      <SectionHead title="Refunds" count={data.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
        Shows up here automatically whenever a paid appointment gets cancelled or declined.
        "Process Refund" calls Razorpay directly and actually returns the money — it isn't
        just a status flag.
      </p>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>No refunds pending — nice and clear.</div>
      ):data.map(a=>(
        <div key={a.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
            <div>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                {a.patient_name}
              </strong>
              <span className="badge" style={{marginLeft:"8px",
                background:a.status==="rejected"?"#fef2f2":"#f1f5f9",
                color:a.status==="rejected"?"#991b1b":"#64748b"}}>
                {a.status}
              </span>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginTop:"4px"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>
                  {a.appointment_date} {a.appointment_time?.slice(0,5)}
                </span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>
                  Dr. {a.doctors?.full_name||"—"}
                </span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:"#b45309"}}>
                  ₹{a.payment_amount} owed back
                </span>
              </div>
            </div>
            <button className="btn-sm btn-green" disabled={processing===a.id}
              onClick={()=>processRefund(a.id)}>
              {processing===a.id?"Processing…":"Process Refund"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── NAV + MAIN ────────────────────────────────────────────────
// ── Admin Chat Embed ─────────────────────────────────────────
function AdminChatEmbed() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
          💬 Chat
        </h2>
        <button onClick={()=>navigate("/admin/chat")}
          style={{padding:"9px 18px",borderRadius:"8px",border:"none",
            background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
            fontSize:"13px",cursor:"pointer"}}>
          Open Full Chat →
        </button>
      </div>
      <div style={{background:"#fff",border:"1px solid #e2eaf4",
        borderRadius:"14px",padding:"40px 24px",textAlign:"center"}}>
        <div style={{fontSize:"48px",marginBottom:"16px"}}>💬</div>
        <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"18px",
          fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>
          Doctor-to-Doctor & Admin-Doctor Chat
        </h3>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
          color:"#64748b",marginBottom:"20px",lineHeight:"1.7"}}>
          View all conversations between doctors and send messages to any doctor.
          Click below to open the full chat interface.
        </p>
        <button onClick={()=>navigate("/admin/chat")}
          style={{padding:"12px 28px",borderRadius:"9px",border:"none",
            background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
            fontSize:"14px",cursor:"pointer",
            boxShadow:"0 4px 18px rgba(124,58,237,.35)"}}>
          Open Chat →
        </button>
      </div>
    </div>
  );
}

const NAV = [
  {id:"live",         icon:"🟢",label:"Live"},
  {id:"overview",     icon:"📊",label:"Overview"},
  {id:"analytics",    icon:"📈",label:"Analytics"},
  {id:"announcements",icon:"📢",label:"Announcements"},
  {id:"appointments", icon:"📅",label:"Appointments"},
  {id:"doctors",      icon:"👨‍⚕️",label:"Doctors"},
  {id:"empanelments", icon:"🏥",label:"Empanelments"},
  {id:"hospitals",    icon:"🏨",label:"Hospital Partners"},
  {id:"reviews",      icon:"⭐",label:"Reviews"},
  {id:"contacts",     icon:"📬",label:"Contacts"},
  {id:"patients",     icon:"🧑‍💼",label:"Patients"},
  {id:"payouts",      icon:"💸",label:"Doctor Payouts"},
  {id:"refunds",      icon:"↩️",label:"Refunds"},
  {id:"chat",         icon:"💬",label:"Chat"},
  {id:"specialties",   icon:"🔬",label:"Specialties"},
  {id:"upgrade_requests",icon:"⬆️", label:"Upgrade Requests"},
];


/* ══ SPECIALTIES ══ */
function Specialties({ token }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm,setShowForm]= useState(false);
  const [editing, setEditing] = useState(null); // null = new, obj = edit
  const [form,    setForm]    = useState({ name:"", icon:"🏥", description:"", is_active:true, sort_order:999 });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState(null);

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

  const ICONS = ["❤️","🧠","🦴","🎗️","👁️","👂","🫁","🧬","🦷","💊","👶","🌸","🧘","🧪","🧩","🔬","🏥","🩺","🩻","🫀","🫶","🩹","💉","🩺"];

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
            <label className="ad-lbl">Icon</label>
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

            <label className="ad-lbl">Name *</label>
            <input className="ad-inp" value={form.name}
              onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              placeholder="e.g. Cardiology" style={{marginBottom:"12px"}}/>

            <label className="ad-lbl">Description</label>
            <input className="ad-inp" value={form.description}
              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              placeholder="e.g. Heart disease, hypertension, ECG..." style={{marginBottom:"12px"}}/>

            <label className="ad-lbl">Sort Order</label>
            <input className="ad-inp" type="number" value={form.sort_order}
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
              <span style={{fontSize:"24px",flexShrink:0}}>{s.icon||"🏥"}</span>
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


/* ══ UPGRADE REQUESTS ══ */
function UpgradeRequests({ token }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/upgrade-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setList(json.requests || []);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetch_(); }, []);

  const review = async (id, status, hospitalId, tier, type="upgrade") => {
    await fetch(`${API}/admin/upgrade-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (status === "approved") {
      if (type === "cancel") {
        // Mark subscription as cancelled
        await fetch(`${API}/admin/hospitals/${hospitalId}/subscription/cancel`, {
          method: "POST",
          headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        });
        showToast("Subscription cancellation approved ✅", "success");
      } else {
        // Upgrade or downgrade — change tier
        await fetch(`${API}/admin/hospitals/${hospitalId}`, {
          method: "PUT",
          headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          body: JSON.stringify({ tier }),
        });
        const action = type==="downgrade" ? "downgraded to" : "upgraded to";
        showToast(`Hospital ${action} ${tier} ✅`, "success");
        if (type==="downgrade" || tier==="basic") {
          // For downgrade/cancel — mark subscription inactive
          await fetch(`${API}/admin/hospitals/${hospitalId}/subscription/mark-paid`, {
            method: "POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          });
        }
      }
    } else {
      showToast("Request rejected", "info");
    }
    fetch_();
  };

  const pending  = list.filter(r=>r.status==="pending");
  const reviewed = list.filter(r=>r.status!=="pending");

  return (
    <div>
      <SectionHead title="Upgrade Requests" count={pending.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"20px"}}>
        Hospitals requesting plan upgrades. Approve to automatically change their tier.
      </p>

      {loading ? (
        <div style={{textAlign:"center",padding:"40px"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
            borderTop:"3px solid #047857",borderRadius:"50%",
            animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : pending.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>
          No pending upgrade requests ✅
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"32px"}}>
          {pending.map(r => (
            <div key={r.id} style={{background:"#fff",border:"1.5px solid #fde68a",
              borderRadius:"12px",padding:"16px 18px",
              boxShadow:"0 2px 8px rgba(11,31,58,.06)"}}>
              <div style={{display:"flex",alignItems:"flex-start",
                justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                    fontSize:"15px",color:"#0b1f3a",margin:"0 0 4px"}}>
                    {r.hospital_name || "Unknown Hospital"}
                  </p>
                  <div style={{display:"flex",gap:"8px",alignItems:"center",
                    flexWrap:"wrap",marginBottom:"6px"}}>
                    <span style={{
                      background: r.type==="cancel"?"#fee2e2":r.type==="downgrade"?"#fffbeb":"#f0fdf4",
                      border: `1px solid ${r.type==="cancel"?"#fca5a5":r.type==="downgrade"?"#fde68a":"#86efac"}`,
                      color: r.type==="cancel"?"#dc2626":r.type==="downgrade"?"#92400e":"#15803d",
                      padding:"2px 10px",borderRadius:"50px",
                      fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif"}}>
                      {r.type==="cancel"?"❌ Cancel"
                      :r.type==="downgrade"?`⬇️ Downgrade → ${r.requested_tier}`
                      :`⬆️ Upgrade → ${r.requested_tier==="growth"?"🚀 Growth":"⭐ Strategic"}`}
                    </span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                      color:"#94a3b8"}}>
                      {new Date(r.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  {r.message && (
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                      color:"#475569",margin:0,fontStyle:"italic"}}>
                      "{r.message}"
                    </p>
                  )}
                </div>
                <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                  <button onClick={()=>review(r.id,"approved",r.hospital_id,r.requested_tier,r.type)}
                    style={{padding:"8px 18px",borderRadius:"8px",border:"none",
                      cursor:"pointer",background:"#dcfce7",color:"#15803d",
                      fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
                    {r.type==="cancel"?"✅ Confirm Cancel":r.type==="downgrade"?"✅ Approve Downgrade":"✅ Approve"}
                  </button>
                  <button onClick={()=>review(r.id,"rejected",r.hospital_id,r.requested_tier)}
                    style={{padding:"8px 18px",borderRadius:"8px",border:"none",
                      cursor:"pointer",background:"#fee2e2",color:"#dc2626",
                      fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
            color:"#94a3b8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"10px"}}>
            Reviewed
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {reviewed.map(r => (
              <div key={r.id} style={{background:"#f8fafc",border:"1px solid #e2eaf4",
                borderRadius:"10px",padding:"12px 16px",display:"flex",
                alignItems:"center",justifyContent:"space-between",gap:"10px"}}>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                    fontSize:"13px",color:"#0b1f3a",margin:"0 0 2px"}}>
                    {r.hospital_name}
                  </p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                    color:"#94a3b8",margin:0}}>
                    → {r.requested_tier} · {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span style={{
                  padding:"3px 12px",borderRadius:"50px",fontSize:"11px",fontWeight:"700",
                  fontFamily:"'DM Sans',sans-serif",
                  background: r.status==="approved" ? "#dcfce7" : "#fee2e2",
                  color:      r.status==="approved" ? "#15803d" : "#dc2626",
                }}>
                  {r.status === "approved" ? "✅ Approved" : "✕ Rejected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("wc4a_token");
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get("tab") || "overview";
  const setSection = (id) => setSearchParams({ tab: id });
  const [stats,    setStats]    = useState(null);
  const [showNotify, setShowNotify] = useState(false);

  useEffect(()=>{
    document.title="Admin Dashboard — We Care 4 'all'";
    fetchStats();
  },[]);

  const fetchStats=async()=>{
    try{
      const res=await fetch(`${API}/admin/stats`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setStats(json);
    }catch{}
  };

  return(
    <div className="ad">
      <style>{G}</style>

      {/* Desktop Sidebar */}
      <div className="ad-sidebar">
        <div style={{padding:"18px 16px 12px",
          borderBottom:"1px solid rgba(255,255,255,.08)",
          display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <Link to="/" style={{textDecoration:"none"}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",
              fontWeight:"700",color:"#fff",margin:0}}>
              We Care 4 <span style={{color:"#34d399"}}>'all'</span>
            </p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.38)",margin:"3px 0 0"}}>Admin Panel</p>
          </Link>
          <NotificationBell/>
        </div>
        <nav style={{padding:"10px 0",flex:1}}>
          {NAV.map(({id,icon,label})=>(
            <button key={id} onClick={()=>setSection(id)}
              className={`nav-item${section===id?" active":""}`}>
              <span style={{fontSize:"16px",flexShrink:0}}>{icon}</span>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",
          borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
            color:"rgba(255,255,255,.45)",marginBottom:"8px",
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {user?.name||user?.email||"Admin"}
          </p>
          <button onClick={()=>{logout();navigate("/");}}
            style={{width:"100%",padding:"8px",borderRadius:"8px",
              background:"rgba(220,38,38,.15)",
              border:"1px solid rgba(220,38,38,.25)",
              color:"#fca5a5",fontFamily:"'DM Sans',sans-serif",
              fontSize:"12px",cursor:"pointer"}}>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="ad-content">
        {/* Mobile section title */}
        <div style={{marginBottom:"16px"}}>
          <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
            {NAV.find(n=>n.id===section)?.label||"Overview"}
          </h2>
        </div>

        {section==="live"         && <LiveFeed token={token}/>}
        {section==="overview"     && <Overview stats={stats} token={token} onNotify={()=>setShowNotify(true)}/>}
        {section==="analytics"    && <Analytics token={token}/>}
        {section==="announcements"&& <Announcements token={token}/>}
        {section==="appointments" && <Appointments token={token}/>}
        {section==="doctors"      && <Doctors token={token}/>}
        {section==="empanelments" && <Empanelments token={token}/>}
        {section==="hospitals"    && <Hospitals token={token}/>}
        {section==="reviews"      && <Reviews token={token}/>}
        {section==="contacts"     && <Contacts token={token}/>}
        {section==="patients"     && <Patients token={token}/>}
        {section==="payouts"      && <Payouts token={token}/>}
        {section==="refunds"      && <Refunds token={token}/>}
        {section==="chat"         && <AdminChatEmbed/>}
        {section==="specialties"   && <Specialties token={token}/>}
        {section==="upgrade_requests" && <UpgradeRequests token={token}/>}
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="ad-bottom-bar">
        {NAV.map(({id,icon,label})=>(
          <button key={id} onClick={()=>setSection(id)}
            className={`tab-btn-bar${section===id?" active":""}`}>
            <span className="ti">{icon}</span>
            <span>{label.slice(0,5)}</span>
          </button>
        ))}
      </div>

      {/* Notification Modal */}
      {showNotify&&(
        <NotificationModal
          token={token}
          onClose={()=>setShowNotify(false)}
        />
      )}
    </div>
  );
}
