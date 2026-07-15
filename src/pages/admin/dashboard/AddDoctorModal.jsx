import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../../../components/Toast";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API } from "./shared";


// ── Add Doctor Modal ─────────────────────────────────────────
export default function AddDoctorModal({ onClose, onSaved }) {
  const { t } = useTranslation();
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
    if(!form.full_name||!form.email||!form.password){setErr(t("adminPages.addDoctorModal.requiredFields"));return;}
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
      if(!res.ok)throw new Error(json.detail||t("adminPages.addDoctorModal.createFailed"));
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
          if(!photoRes.ok) showToast(t("adminPages.addDoctorModal.photoUploadFailedPrefix")+( photoJson.detail||t("adminPages.addDoctorModal.unknownError")),"error");
        }catch(photoErr){
          showToast(t("adminPages.addDoctorModal.photoUploadFailedPrefix")+photoErr.message,"error");
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
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>{t("adminPages.addDoctorModal.title")}</h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",
            color:"#fff",width:"32px",height:"32px",borderRadius:"7px",cursor:"pointer",fontSize:"18px",
            display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {result?(
          <div style={{padding:"28px",textAlign:"center"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>✅</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"10px"}}>{t("adminPages.addDoctorModal.createdTitle")}</h3>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",
              padding:"14px",textAlign:"left",marginBottom:"14px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                color:"#15803d",marginBottom:"8px"}}>{t("adminPages.addDoctorModal.shareWithDoctor")}</p>
              {[[t("adminPages.addDoctorModal.emailLabel"),result.email],[t("adminPages.addDoctorModal.passwordLabel"),result.password]].map(([l,v])=>(
                <div key={l} style={{display:"flex",gap:"8px",marginBottom:"5px"}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                    color:"#64748b",minWidth:"70px"}}>{l}:</span>
                  <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color:"#0b1f3a"}}>{v}</strong>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="btn-sm btn-navy"
              style={{padding:"10px 22px",fontSize:"13px"}}>{t("adminPages.addDoctorModal.close")}</button>
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
                  {t("adminPages.doctorForm.profilePhoto")} <span style={{color:"#6b7688",fontWeight:"400"}}>{t("adminPages.doctorForm.optional")}</span>
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#6b7688",margin:"0 0 8px"}}>{t("adminPages.doctorForm.photoFormats")}</p>
                <label style={{display:"inline-flex",alignItems:"center",gap:"6px",
                  padding:"6px 14px",borderRadius:"7px",cursor:"pointer",
                  background:"#0b1f3a",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"12px"}}>
                  📷 {photoFile ? t("adminPages.doctorForm.changePhoto") : t("adminPages.doctorForm.choosePhoto")}
                  <input type="file" accept="image/jpeg,image/png,image/webp"
                    style={{display:"none"}} onChange={handlePhotoSelect}/>
                </label>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"11px"}}>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-full-name">
                  {t("adminPages.doctorForm.fullNameRequired")}</label>
                <input id="admin-dashboard-full-name" value={form.full_name} onChange={e=>set("full_name",e.target.value)}
                  className="ad-inp" placeholder={t("adminPages.doctorForm.fullNamePlaceholder")}/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-email">{t("adminPages.doctorForm.emailRequired")}</label>
                <input id="admin-dashboard-email" type="email" value={form.email}
                  onChange={e=>set("email",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-password">{t("adminPages.addDoctorModal.password")}</label>
                <input id="admin-dashboard-password" type="text" value={form.password}
                  onChange={e=>set("password",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-specialization">{t("adminPages.doctorForm.specialization")}</label>
                <input id="admin-dashboard-specialization" value={form.specialization}
                  onChange={e=>set("specialization",e.target.value)}
                  className="ad-inp" placeholder={t("adminPages.doctorForm.specializationPlaceholder")}/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-sub-specialization">{t("adminPages.doctorForm.subSpecialization")}</label>
                <input id="admin-dashboard-sub-specialization" value={form.sub_specialization}
                  onChange={e=>set("sub_specialization",e.target.value)}
                  className="ad-inp" placeholder={t("adminPages.doctorForm.subSpecializationPlaceholder")}/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-qualification">{t("adminPages.doctorForm.qualification")}</label>
                <input id="admin-dashboard-qualification" value={form.qualification}
                  onChange={e=>set("qualification",e.target.value)}
                  className="ad-inp" placeholder={t("adminPages.doctorForm.qualificationPlaceholder")}/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-registration-number">{t("adminPages.doctorForm.registrationNumber")}</label>
                <input id="admin-dashboard-registration-number" value={form.registration_number}
                  onChange={e=>set("registration_number",e.target.value)}
                  className="ad-inp" placeholder={t("adminPages.doctorForm.registrationNumberPlaceholder")}/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-certifications">{t("adminPages.doctorForm.certifications")}</label>
                <input id="admin-dashboard-certifications" value={form.certifications}
                  onChange={e=>set("certifications",e.target.value)}
                  className="ad-inp" placeholder={t("adminPages.doctorForm.certificationsPlaceholder")}/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-awards">{t("adminPages.doctorForm.awards")}</label>
                <input id="admin-dashboard-awards" value={form.awards}
                  onChange={e=>set("awards",e.target.value)}
                  className="ad-inp" placeholder={t("adminPages.doctorForm.awardsPlaceholder")}/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-full-bio-description-doctor-s-profile-paragraph-shown-to-patients">
                  {t("adminPages.addDoctorModal.fullBio")}
                  <span style={{fontWeight:"400",color:"#6b7688",marginLeft:"6px",fontSize:"11px"}}>
                    {t("adminPages.addDoctorModal.fullBioNote")}
                  </span>
                </label>
                <textarea id="admin-dashboard-full-bio-description-doctor-s-profile-paragraph-shown-to-patients" value={form.bio}
                  onChange={e=>set("bio",e.target.value)}
                  rows={5}
                  placeholder={t("adminPages.addDoctorModal.bioPlaceholder")}
                  style={{width:"100%",padding:"9px 12px",borderRadius:"8px",
                    border:"1.5px solid #d1d5db",fontFamily:"'DM Sans',sans-serif",
                    fontSize:"13px",color:"#111827",lineHeight:"1.6",resize:"vertical",
                    outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-experience-yrs">{t("adminPages.doctorForm.experienceYrs")}</label>
                <input id="admin-dashboard-experience-yrs" type="number" onWheel={e=>e.currentTarget.blur()} value={form.experience_yrs}
                  onChange={e=>set("experience_yrs",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-fee">{t("adminPages.doctorForm.fee")}</label>
                <input id="admin-dashboard-fee" type="number" onWheel={e=>e.currentTarget.blur()} value={form.consultation_fee}
                  onChange={e=>set("consultation_fee",e.target.value)} className="ad-inp"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-phone">{t("adminPages.doctorForm.phone")}</label>
                <input id="admin-dashboard-phone" value={form.phone} onChange={e=>set("phone",e.target.value)}
                  className="ad-inp" placeholder={t("adminPages.doctorForm.phonePlaceholder")}/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-location">{t("adminPages.doctorForm.location")}</label>
                <input id="admin-dashboard-location" value={form.location} onChange={e=>set("location",e.target.value)}
                  className="ad-inp" placeholder={t("adminPages.doctorForm.locationPlaceholder")}/>
              </div>
              <div style={{gridColumn:"span 2",display:"flex",gap:"16px"}}>
                {[["available_online",t("doctorDashboard.type.video")],["available_in_person",t("doctorDashboard.type.inperson")],["available_home",t("doctorDashboard.type.home")]].map(([k,l])=>(
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
                {loading?t("adminPages.addDoctorModal.creating"):t("adminPages.addDoctorModal.createBtn")}
              </button>
              <button type="button" onClick={onClose} className="btn-sm btn-outline"
                style={{padding:"10px 18px",fontSize:"13px"}}>{t("adminPages.doctorForm.cancel")}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
