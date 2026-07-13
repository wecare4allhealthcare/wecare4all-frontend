import { useState } from "react";


export default function CancelAppointmentModal({ appt, onConfirm, onClose }) {
  const [reason,setReason]=useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:3000,
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",width:"100%",maxWidth:"480px",
        borderRadius:"20px 20px 0 0",padding:"22px",maxHeight:"90vh",overflowY:"auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"flex-start",marginBottom:"14px"}}>
          <div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
              fontWeight:"700",color:"#0b1f3a",margin:0}}>Cancel Appointment</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
              color:"#64748b",margin:"3px 0 0"}}>
              {appt.patient_name} · {appt.appointment_date} {appt.appointment_time?.slice(0,5)}
            </p>
          </div>
          <button onClick={onClose}
            style={{background:"#f1f5f9",border:"none",width:"32px",height:"32px",
              borderRadius:"8px",cursor:"pointer",fontSize:"18px",color:"#64748b",flexShrink:0}}>×</button>
        </div>

        <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"9px",
          padding:"10px 14px",marginBottom:"14px",fontFamily:"'DM Sans',sans-serif",
          fontSize:"12.5px",color:"#991b1b"}}>
          The patient will be notified by email that this appointment was cancelled.
        </div>

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
            fontSize:"11px",fontWeight:"700",color:"#374151",marginBottom:"5px"}} htmlFor="admin-dashboard-note-for-patient-optional">
            Note for patient <span style={{fontWeight:"400",color:"#94a3b8"}}>(optional)</span>
          </label>
          <textarea id="admin-dashboard-note-for-patient-optional" value={reason} onChange={e=>setReason(e.target.value)}
            rows={4} placeholder="e.g. Doctor unavailable — will help you rebook. Leave blank if no reason needs to be shared."
            style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",
              padding:"11px 13px",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              color:"#1e293b",background:"#f8fafc",outline:"none",resize:"vertical",
              minHeight:"90px",lineHeight:"1.6",boxSizing:"border-box"}}/>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#94a3b8",
            margin:"5px 0 0"}}>
            Only shown in the email if you write something — otherwise it's left out entirely.
          </p>
        </div>

        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>onConfirm(reason.trim())}
            style={{flex:1,padding:"13px",borderRadius:"9px",border:"none",
              background:"linear-gradient(135deg,#dc2626,#b91c1c)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"700",fontSize:"14px",cursor:"pointer"}}>
            Cancel Appointment
          </button>
          <button onClick={onClose}
            style={{padding:"13px 20px",borderRadius:"9px",
              border:"1.5px solid #e2eaf4",background:"#fff",color:"#64748b",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
              fontSize:"14px",cursor:"pointer"}}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
