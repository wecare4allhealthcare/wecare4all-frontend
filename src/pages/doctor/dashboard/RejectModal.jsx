import { useState, useRef } from "react";
import { showToast } from "../../../components/Toast";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API } from "./shared";


export default function RejectModal({ appt, token, onClose, onSaved }) {
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!reason.trim()) { showToast("Please give a reason — the patient will see this.", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/appointments/${appt.id}/reject`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({reason}),
      });
      if (!res.ok) { const j=await res.json(); throw new Error(j.detail||"Failed"); }
      onSaved();
      onClose();
    } catch (e) { showToast(e.message || "Failed to reject", "error"); }
    finally { setSaving(false); }
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div ref={boxRef} role="dialog" aria-modal="true" style={{background:"#fff",width:"100%",maxWidth:"500px",borderRadius:"18px 18px 0 0",
        padding:"20px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Decline Appointment
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"12px"}}>
          Patient: <strong>{appt.patient_name}</strong> · this reason will be emailed to them.
        </p>
        <textarea value={reason} onChange={e=>setReason(e.target.value)}
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"12px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",
            minHeight:"100px",outline:"none"}}
          placeholder="e.g. Not available at this time, please rebook for next week…"/>
        <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
          <button onClick={submit} disabled={saving}
            style={{flex:1,background:"#b91c1c",
              color:"#fff",border:"none",borderRadius:"9px",padding:"12px",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",cursor:"pointer"}}>
            {saving?"Sending…":"Decline & Notify Patient"}
          </button>
          <button onClick={onClose}
            style={{padding:"12px 18px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
              background:"#fff",color:"#64748b",fontFamily:"'DM Sans',sans-serif",
              fontSize:"14px",cursor:"pointer"}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
