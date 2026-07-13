import { useState, useRef } from "react";
import { showToast } from "../../../components/Toast";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API } from "./shared";


// ── Add Doctor Modal ─────────────────────────────────────────
export default function AddDoctorModal({ onClose, onSaved }) {
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);
  const [form,setForm]=useState({full_name:"",email:"",password:"",specialization:"",
    sub_specialization:"",qualification:"",registration_number:"",certifications:"",awards:"",bio:"",experience_yrs:"",phone:"",
    location:"",consultation_fee:"",available_online:true,available_home:false,available_in_person:false});
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
      if(photoFile && json.id){
        try{
          const fd=new FormData(); fd.append("file",photoFile);
          const photoRes=await fetch(`${API}/doctors/admin/${json.id}/photo`,{
            method:"POST",
            headers:{Authorization:`Bearer ${token}`},
            body:fd,
          });
          const photoJson=await photoRes.json();
          if(!photoRes.ok) showToast("Doctor created but photo upload failed: "+( photoJson.detail||"unknown error"),"error");
        }catch(photoErr){
          showToast("Doctor created but photo upload failed: "+photoErr.message,"error");
        }
      }
      setResult(json.credentials);
      onSaved();
    }catch(ex){setErr(ex.message);}
    finally{setLoading(false);}
  };
  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" ref={boxRef} role="dialog" aria-modal="true">
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
                  ? <img loading="lazy" src={photoPreview} alt="Doctor profile photo preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <span style={{fontSize:"24px",color:"#6b7688"}}>👤</span>
                }
              </div>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                  fontWeight:"600",color:"#374151",margin:"0 0 2px"}}>
                  Profile Photo <span style={{color:"#6b7688",fontWeight:"400"}}>(optional)</span>
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#6b7688",margin:"0 0 8px"}}>JPEG, PNG or WebP</p>
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
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-full-name">
                  Full Name *</label>
                <input id="admin-dashboard-full-name" value={form.full_name} onChange={e=>set("full_name",e.target.value)}
                  className="ad-inp" placeholder="Dr. Full Name"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-email">Email *</label>
                <input id="admin-dashboard-email" type="email" value={form.email}
                  onChange={e=>set("email",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-password">Password *</label>
                <input id="admin-dashboard-password" type="text" value={form.password}
                  onChange={e=>set("password",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-specialization">Specialization</label>
                <input id="admin-dashboard-specialization" value={form.specialization}
                  onChange={e=>set("specialization",e.target.value)}
                  className="ad-inp" placeholder="Cardiology"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-sub-specialization">Sub-specialization</label>
                <input id="admin-dashboard-sub-specialization" value={form.sub_specialization}
                  onChange={e=>set("sub_specialization",e.target.value)}
                  className="ad-inp" placeholder="Interventional Cardiology"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-qualification">Qualification</label>
                <input id="admin-dashboard-qualification" value={form.qualification}
                  onChange={e=>set("qualification",e.target.value)}
                  className="ad-inp" placeholder="MBBS, MD"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-registration-number">Registration Number</label>
                <input id="admin-dashboard-registration-number" value={form.registration_number}
                  onChange={e=>set("registration_number",e.target.value)}
                  className="ad-inp" placeholder="e.g. TNMC/12345/2010"/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-certifications">Certifications</label>
                <input id="admin-dashboard-certifications" value={form.certifications}
                  onChange={e=>set("certifications",e.target.value)}
                  className="ad-inp" placeholder="e.g. Fellowship in Interventional Cardiology, Board Certified — Internal Medicine"/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-awards">Awards</label>
                <input id="admin-dashboard-awards" value={form.awards}
                  onChange={e=>set("awards",e.target.value)}
                  className="ad-inp" placeholder="e.g. Best Cardiologist Award 2022, TN Medical Excellence Award"/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-full-bio-description-doctor-s-profile-paragraph-shown-to-patients">
                  Full Bio / Description
                  <span style={{fontWeight:"400",color:"#6b7688",marginLeft:"6px",fontSize:"11px"}}>
                    (Doctor's profile paragraph shown to patients)
                  </span>
                </label>
                <textarea id="admin-dashboard-full-bio-description-doctor-s-profile-paragraph-shown-to-patients" value={form.bio}
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
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-experience-yrs">Experience (yrs)</label>
                <input id="admin-dashboard-experience-yrs" type="number" onWheel={e=>e.currentTarget.blur()} value={form.experience_yrs}
                  onChange={e=>set("experience_yrs",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-fee">Fee (₹)</label>
                <input id="admin-dashboard-fee" type="number" onWheel={e=>e.currentTarget.blur()} value={form.consultation_fee}
                  onChange={e=>set("consultation_fee",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-phone">Phone</label>
                <input id="admin-dashboard-phone" value={form.phone} onChange={e=>set("phone",e.target.value)}
                  className="ad-inp" placeholder="90XXXXXXXX"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-location">Location</label>
                <input id="admin-dashboard-location" value={form.location} onChange={e=>set("location",e.target.value)}
                  className="ad-inp" placeholder="Chennai, TN"/>
              </div>
              <div style={{gridColumn:"span 2",display:"flex",gap:"16px"}}>
                {[["available_online","🎥 Video"],["available_in_person","🏥 In-Person"],["available_home","🏠 Home"]].map(([k,l])=>(
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
