import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { API, Badge, Spinner, SectionHead, DeleteButton, PaginationBar } from "./shared";
import CancelAppointmentModal from "./CancelAppointmentModal";

const PAGE_SIZE = 10;

// ── APPOINTMENTS ─────────────────────────────────────────────
export default function Appointments({ token }) {
  const { t } = useTranslation();
  const [data,setData]=useState([]);
  const [doctorsList,setDoctorsList]=useState([]);
  const [companiesList,setCompaniesList]=useState([]);
  const [picked,setPicked]=useState({}); // {appointmentId: doctorId}
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");
  const [companyFilter,setCompanyFilter]=useState("");
  const [search,setSearch]=useState("");
  const [expanded,setExpanded]=useState({}); // {appointmentId: bool}
  const [cancelTarget,setCancelTarget]=useState(null); // appointment object being cancelled
  const [page,setPage]=useState(1);
  const [totalPages,setTotalPages]=useState(1);
  const [statusCounts,setStatusCounts]=useState({pending:0,approved:0,completed:0,cancelled:0,all:0});
  // Previously this fetched up to 100 rows per request (loading time
  // scaling with total appointment count) and filtered by search
  // entirely client-side on whatever partial page happened to be
  // loaded — meaning a match outside the first 100 rows was silently
  // never found. Now a real server-side page (10 rows) with search
  // pushed into the query too (see get_all_appointments in
  // routes/admin.py), so nothing is missed and each page load is fast
  // regardless of total appointment count.
  const fetch2=useCallback(async(f=filter,cid=companyFilter,s=search,p=page)=>{
    setLoading(true);
    try{
      const params=new URLSearchParams();
      if(f!=="all")params.set("status",f);
      if(cid)params.set("company_id",cid);
      if(s.trim())params.set("search",s.trim());
      params.set("page",String(p));
      params.set("page_size",String(PAGE_SIZE));
      const res=await fetch(`${API}/admin/appointments?${params}`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.appointments||[]);
      setTotalPages(Math.max(1, Math.ceil((json.total||0)/PAGE_SIZE)));
      if (json.status_counts) setStatusCounts(json.status_counts);
    }catch{setData([]);}
    finally{setLoading(false);}
  },[token,filter,companyFilter,search,page]);
  useEffect(()=>{
    fetch2();
    fetch(`${API}/admin/doctors`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.json()).then(j=>setDoctorsList(j.doctors||[])).catch(()=>{});
    fetch(`${API}/admin/companies?limit=200`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.json()).then(j=>setCompaniesList(j.companies||[])).catch(()=>{});
  },[]);
  const update=async(id,status,doctor_id,reason)=>{
    try{
      const body={status};
      if(doctor_id) body.doctor_id=doctor_id;
      if(reason) body.reason=reason;
      await fetch(`${API}/admin/appointments/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify(body),
      });
      fetch2();
    }catch{}
  };
  const toggleExpand=id=>setExpanded(p=>({...p,[id]:!p[id]}));
  // Search is now server-side (see fetch2) — `data` IS the filtered set.
  const filtered=data;
  return(
    <div>
      <SectionHead title={t("adminPages.appointments.heading")} count={statusCounts.all}/>
      <div className="filter-bar">
        <input value={search}
          onChange={e=>setSearch(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"){ setPage(1); fetch2(filter,companyFilter,search,1); } }}
          className="ad-inp" style={{width:"220px",maxWidth:"100%"}}
          placeholder={t("adminPages.appointments.searchPlaceholder")}/>
        {["all","pending","approved","completed","cancelled"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);setPage(1);fetch2(f,companyFilter,search,1);}}
            className={`fchip${filter===f?" on":""}`}>{t(`adminPages.shared.status.${f}`)} ({statusCounts[f]??0})</button>
        ))}
        <select className="ad-inp" style={{width:"180px",fontSize:"12.5px"}}
          value={companyFilter} onChange={e=>{setCompanyFilter(e.target.value);setPage(1);fetch2(filter,e.target.value,search,1);}}>
          <option value="">🏢 All Companies</option>
          {companiesList.map(c=>(
            <option key={c.id} value={c.id}>{c.company_name}</option>
          ))}
        </select>
      </div>
      {loading?<Spinner/>:filtered.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>{t("adminPages.appointments.noAppointments")}</div>
      ):filtered.map(a=>{
        const doc=a.doctors;
        const fam=a.family_members;
        const isAssigned = !!a.assigned_by_admin;
        const selectedDoctor = picked[a.id] ?? a.doctor_id ?? "";
        const isOpen = !!expanded[a.id];
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
                  {a.is_company_sponsored && (
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                      fontWeight:"700",padding:"2px 8px",borderRadius:"50px",
                      background:"#eff8ff",color:"#0369a1"}}>
                      🏢 {a.company_name || "Company"}{a.booked_by_hr ? " · Booked by HR" : ""}
                    </span>
                  )}
                  {a.status==="pending"&&(
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                      fontWeight:"700",padding:"2px 8px",borderRadius:"50px",
                      background: isAssigned ? "#dcfce7" : "#fef9c3",
                      color: isAssigned ? "#15803d" : "#854d0e"}}>
                      {isAssigned ? t("adminPages.appointments.assignedAwaiting") : t("adminPages.appointments.notYetAssigned")}
                    </span>
                  )}
                  <span style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#6b7688"}}>#{a.id}</span>
                </div>
                <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
                  {[["📅",`${a.appointment_date} ${a.appointment_time ? a.appointment_time.slice(0,5)+" IST" : ""}`],
                    ["📱",a.patient_mobile||""],["✉️",a.patient_email||""],
                    ["💰",a.payment_amount?`₹${a.payment_amount}`:(a.status==="pending"?t("adminPages.appointments.feeNotSet"):t("adminPages.shared.dash"))],
                  ].map(([ic,val])=>(
                    <span key={ic} style={{fontFamily:"'DM Sans',sans-serif",
                      fontSize:"12px",color:"#64748b"}}>{ic} {val}</span>
                  ))}
                </div>
                {a.status==="pending"&&(
                  <div style={{marginTop:"8px",display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                      color:"#6b7688",fontWeight:"600"}}>{t("adminPages.appointments.assignTo")}</span>
                    <select className="ad-inp" style={{width:"200px",padding:"6px 10px",fontSize:"12px"}}
                      value={selectedDoctor}
                      onChange={e=>setPicked({...picked,[a.id]:e.target.value})}>
                      <option value="">{t("adminPages.appointments.selectDoctor")}</option>
                      {doctorsList.map(d=>(
                        <option key={d.id} value={d.id}>{d.full_name} — {d.specialization}</option>
                      ))}
                    </select>
                  </div>
                )}
                {a.symptoms&&<p style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",color:"#6b7688",fontStyle:"italic",
                  margin:"4px 0 0"}}>"{a.symptoms}"</p>}

                <button onClick={()=>toggleExpand(a.id)} style={{
                  marginTop:"10px",background:"none",border:"none",cursor:"pointer",
                  padding:0,display:"flex",alignItems:"center",gap:"5px",
                  fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                  color:"#047857"}}>
                  {isOpen ? t("adminPages.shared.hideDetails") : t("adminPages.shared.viewDetails")}
                </button>

                {isOpen && (
                  <div style={{marginTop:"10px",background:"#f8fafc",
                    border:"1px solid #e2eaf4",borderRadius:"10px",padding:"14px 16px",
                    display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(180px,100%),1fr))",
                    gap:"10px 20px"}}>
                    {[
                      [t("adminPages.appointments.detail.consultationType"), a.appointment_type==="video" ? t("doctorDashboard.type.video")
                        : a.appointment_type==="home" ? t("doctorDashboard.type.home") : t("doctorDashboard.type.inperson")],
                      [t("adminPages.appointments.detail.bookedFor"), fam ? `${fam.full_name} (${fam.relationship})` : t("adminPages.appointments.self")],
                      [t("adminPages.appointments.detail.age"), a.patient_age || t("adminPages.shared.dash")],
                      [t("adminPages.appointments.detail.gender"), a.patient_gender || t("adminPages.shared.dash")],
                      [t("adminPages.appointments.detail.state"), a.patient_state || t("adminPages.shared.dash")],
                      [t("adminPages.appointments.detail.country"), a.patient_country || t("adminPages.shared.dash")],
                      [t("adminPages.appointments.detail.paymentStatus"), t(`adminPages.shared.status.${a.payment_status||"pending"}`, a.payment_status||"pending")],
                      [t("adminPages.appointments.detail.assignedDoctor"), doc ? `${doc.full_name} — ${doc.specialization}` : t("adminPages.appointments.notYetAssigned")],
                      [t("adminPages.appointments.detail.bookedOn"), a.created_at ? new Date(a.created_at).toLocaleString("en-IN") : t("adminPages.shared.dash")],
                      [t("adminPages.appointments.detail.symptomsNotes"), a.symptoms || t("adminPages.shared.dash")],
                      ...(a.admin_notes ? [[t("adminPages.appointments.detail.adminNotes"), a.admin_notes]] : []),
                      ...(a.rejection_reason ? [[t("adminPages.appointments.detail.rejectionReason"), a.rejection_reason]] : []),
                      ...(a.prescription ? [[t("adminPages.appointments.detail.prescription"), a.prescription]] : []),
                    ].map(([label,val])=>(
                      <div key={label}>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10.5px",
                          fontWeight:"700",color:"#6b7688",textTransform:"uppercase",
                          letterSpacing:".4px",margin:"0 0 2px"}}>{label}</p>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                          color:"#1e293b",margin:0,wordBreak:"break-word"}}>{val}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap",flexShrink:0}}>
                {a.status==="pending"&&<>
                  <button className="btn-sm btn-green"
                    disabled={!selectedDoctor}
                    onClick={()=>update(a.id,"approved",selectedDoctor)}>
                    {isAssigned ? t("adminPages.appointments.reassignNotify") : t("adminPages.appointments.assignNotify")}
                  </button>
                  <button className="btn-sm btn-red"
                    onClick={()=>setCancelTarget(a)}>{t("adminPages.appointments.cancel")}</button>
                </>}
                {a.status==="approved"&&
                  <button className="btn-sm btn-navy"
                    onClick={()=>update(a.id,"completed")}>{t("adminPages.appointments.complete")}</button>}
                <DeleteButton small
                  confirmText={`Permanently delete this appointment for ${a.patient_name||"this patient"}? This also removes any related payment, prescription, and pharmacy order records. This cannot be undone.`}
                  onDelete={async()=>{
                    const res=await fetch(`${API}/admin/appointments/${a.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
                    if(res.ok) fetch2(); else alert("Couldn't delete this appointment.");
                  }}/>
              </div>
            </div>
          </div>
        );
      })}
      {cancelTarget && (
        <CancelAppointmentModal
          appt={cancelTarget}
          onConfirm={(reason)=>{ update(cancelTarget.id,"cancelled",null,reason); setCancelTarget(null); }}
          onClose={()=>setCancelTarget(null)}
        />
      )}
      <PaginationBar page={page} totalPages={totalPages} loading={loading}
        onPrev={()=>{ const p=page-1; setPage(p); fetch2(filter,companyFilter,search,p); }}
        onNext={()=>{ const p=page+1; setPage(p); fetch2(filter,companyFilter,search,p); }} />
    </div>
  );
}
