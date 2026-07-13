import { useState, useEffect, useCallback } from "react";
import { API, Badge, Spinner, SectionHead } from "./shared";
import CancelAppointmentModal from "./CancelAppointmentModal";


// ── APPOINTMENTS ─────────────────────────────────────────────
export default function Appointments({ token }) {
  const [data,setData]=useState([]);
  const [doctorsList,setDoctorsList]=useState([]);
  const [picked,setPicked]=useState({}); // {appointmentId: doctorId}
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [expanded,setExpanded]=useState({}); // {appointmentId: bool}
  const [cancelTarget,setCancelTarget]=useState(null); // appointment object being cancelled
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
        <div style={{textAlign:"center",padding:"60px",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>No appointments found.</div>
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
                  {a.status==="pending"&&(
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                      fontWeight:"700",padding:"2px 8px",borderRadius:"50px",
                      background: isAssigned ? "#dcfce7" : "#fef9c3",
                      color: isAssigned ? "#15803d" : "#854d0e"}}>
                      {isAssigned ? "Assigned — awaiting doctor" : "Not yet assigned"}
                    </span>
                  )}
                  <span style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#6b7688"}}>#{a.id}</span>
                </div>
                <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
                  {[["📅",`${a.appointment_date} ${a.appointment_time?.slice(0,5)||""}`],
                    ["📱",a.patient_mobile||""],["✉️",a.patient_email||""],
                    ["💰",a.payment_amount?`₹${a.payment_amount}`:(a.status==="pending"?"Fee not set yet":"—")],
                  ].map(([ic,val])=>(
                    <span key={ic} style={{fontFamily:"'DM Sans',sans-serif",
                      fontSize:"12px",color:"#64748b"}}>{ic} {val}</span>
                  ))}
                </div>
                {a.status==="pending"&&(
                  <div style={{marginTop:"8px",display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                      color:"#6b7688",fontWeight:"600"}}>👨‍⚕️ Assign to:</span>
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
                  fontSize:"12px",color:"#6b7688",fontStyle:"italic",
                  margin:"4px 0 0"}}>"{a.symptoms}"</p>}

                <button onClick={()=>toggleExpand(a.id)} style={{
                  marginTop:"10px",background:"none",border:"none",cursor:"pointer",
                  padding:0,display:"flex",alignItems:"center",gap:"5px",
                  fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                  color:"#047857"}}>
                  {isOpen ? "▲ Hide details" : "▼ View details"}
                </button>

                {isOpen && (
                  <div style={{marginTop:"10px",background:"#f8fafc",
                    border:"1px solid #e2eaf4",borderRadius:"10px",padding:"14px 16px",
                    display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
                    gap:"10px 20px"}}>
                    {[
                      ["Consultation Type", a.appointment_type==="video" ? "🎥 Video"
                        : a.appointment_type==="home" ? "🏠 Home Visit" : "🏥 In-Person"],
                      ["Booked For", fam ? `${fam.full_name} (${fam.relationship})` : "Self"],
                      ["Age", a.patient_age || "—"],
                      ["Gender", a.patient_gender || "—"],
                      ["State", a.patient_state || "—"],
                      ["Country", a.patient_country || "—"],
                      ["Payment Status", a.payment_status || "pending"],
                      ["Assigned Doctor", doc ? `${doc.full_name} — ${doc.specialization}` : "Not yet assigned"],
                      ["Booked On", a.created_at ? new Date(a.created_at).toLocaleString("en-IN") : "—"],
                      ["Symptoms / Notes", a.symptoms || "—"],
                      ...(a.admin_notes ? [["Admin Notes", a.admin_notes]] : []),
                      ...(a.rejection_reason ? [["Rejection Reason", a.rejection_reason]] : []),
                      ...(a.prescription ? [["Prescription", a.prescription]] : []),
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
                    {isAssigned ? "Re-assign & Notify" : "Assign & Notify"}
                  </button>
                  <button className="btn-sm btn-red"
                    onClick={()=>setCancelTarget(a)}>Cancel</button>
                </>}
                {a.status==="approved"&&
                  <button className="btn-sm btn-navy"
                    onClick={()=>update(a.id,"completed")}>Complete</button>}
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
    </div>
  );
}
