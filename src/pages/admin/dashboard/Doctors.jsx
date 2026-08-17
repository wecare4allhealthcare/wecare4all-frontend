import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../../../components/Toast";
import { API, Spinner, SectionHead, DeleteButton, PaginationBar } from "./shared";
import AddDoctorModal from "./AddDoctorModal";
import EditDoctorModal from "./EditDoctorModal";

const PAGE_SIZE = 10;

// ── DOCTORS ──────────────────────────────────────────────────
export default function Doctors({ token }) {
  const { t } = useTranslation();
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [page,setPage]=useState(1);
  const [totalPages,setTotalPages]=useState(1);
  const [totalCount,setTotalCount]=useState(0);
  // Previously fetched every doctor in a single request — loading time
  // grew directly with the total doctor count. Now a real server-side
  // page (see get_doctors in routes/admin.py, which stays backward
  // compatible for other callers like Appointments.jsx's doctor picker
  // that still need the unpaginated full list).
  const fetchData=async(p=page)=>{
    setLoading(true);
    try{
      const ctrl=new AbortController();
      const t2=setTimeout(()=>ctrl.abort(),15000);
      const res=await fetch(`${API}/admin/doctors?page=${p}&page_size=${PAGE_SIZE}`,
        {headers:{Authorization:`Bearer ${token}`},signal:ctrl.signal});
      clearTimeout(t2);
      const json=await res.json();
      setData(json.doctors||[]);
      setTotalCount(json.total||0);
      setTotalPages(Math.max(1, Math.ceil((json.total||0)/PAGE_SIZE)));
    }catch(e){
      if(e.name==="AbortError") showToast(t("adminPages.doctors.serverTimeout"),"warning");
      setData([]);
    }
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData(1);},[]);
  const toggle=async(id,is_active)=>{
    try{
      await fetch(`${API}/admin/doctors/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({is_active:!is_active}),
      });
      fetchData(page);
    }catch{}
  };
  const uploadPhoto=async(doctorId, file)=>{
    const fd=new FormData(); fd.append("file",file);
    try{
      const res=await fetch(`${API}/doctors/admin/${doctorId}/photo`,{
        method:"POST", headers:{Authorization:`Bearer ${token}`}, body:fd,
      });
      const json=await res.json();
      if(json.photo_url){ showToast(t("adminPages.doctors.photoUploaded"),"success"); fetchData(page); }
      else { showToast(t("adminPages.doctors.uploadFailed"),"error"); }
    }catch{ showToast(t("adminPages.doctors.uploadFailed"),"error"); }
  };
  return(
    <div>
      <SectionHead title={t("adminPages.doctors.heading")} count={totalCount}
        action={<button className="btn-sm btn-navy"
          style={{padding:"9px 18px",fontSize:"13px"}}
          onClick={()=>setShowAdd(true)}>{t("adminPages.doctors.addDoctor")}</button>}/>
      {loading?<Spinner/>:data.map(d=>(
        <div key={d.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              {/* Photo */}
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:"48px",height:"48px",borderRadius:"50%",overflow:"hidden",
                  border:"2px solid var(--wc-border)",background:"#f1f5f9",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {d.photo_url
                    ? <img loading="lazy" src={d.photo_url} alt={d.full_name}
                        style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <span style={{fontSize:"20px",fontFamily:"'Cormorant Garamond',serif",
                        fontWeight:"700",color:"#6b7688"}}>
                        {(d.full_name||"D")[0].toUpperCase()}
                      </span>
                  }
                </div>
                {/* Upload trigger */}
                <label title={t("adminPages.doctors.uploadPhotoTitle")}
                  style={{position:"absolute",bottom:"-2px",right:"-2px",
                    width:"18px",height:"18px",borderRadius:"50%",
                    background:"var(--wc-green)",border:"2px solid #fff",
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
                  fontSize:"14px",color:"var(--wc-navy)"}}>{d.full_name}</strong>
                <span className="badge"
                  style={{background:d.is_active?"#dcfce7":"#fee2e2",
                    color:d.is_active?"#15803d":"#991b1b"}}>
                  {d.is_active?t("adminPages.shared.active"):t("adminPages.shared.inactive")}
                </span>
              </div>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
                {[d.specialization,d.qualification,
                  d.experience_yrs&&`${d.experience_yrs}yrs`,
                  d.email,d.phone].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"var(--wc-muted)"}}>{v}</span>
                ))}
              </div>
            </div>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button className="btn-sm btn-navy"
                onClick={()=>setEditingId(d.id)}>
                {t("adminPages.doctors.edit")}
              </button>
              <button className={`btn-sm ${d.is_active?"btn-red":"btn-green"}`}
                onClick={()=>toggle(d.id,d.is_active)}>
                {d.is_active?t("adminPages.doctors.deactivate"):t("adminPages.doctors.activate")}
              </button>
              <DeleteButton small
                confirmText={`Permanently delete ${d.full_name}? This also removes all their appointments, availability, leave records, payouts, and reviews. This cannot be undone.`}
                onDelete={async()=>{
                  const res=await fetch(`${API}/admin/doctors/${d.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
                  if(res.ok) fetchData(page); else showToast("Couldn't delete this doctor.","error");
                }}/>
            </div>
          </div>
        </div>
      ))}
      {showAdd&&<AddDoctorModal onClose={()=>setShowAdd(false)} onSaved={fetchData}/>}
      {editingId&&<EditDoctorModal doctorId={editingId} onClose={()=>setEditingId(null)} onSaved={fetchData}/>}
      <PaginationBar page={page} totalPages={totalPages} loading={loading}
        onPrev={()=>{ const p=page-1; setPage(p); fetchData(p); }}
        onNext={()=>{ const p=page+1; setPage(p); fetchData(p); }} />
    </div>
  );
}
