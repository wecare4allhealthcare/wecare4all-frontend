import { useState, useEffect } from "react";
import { showToast } from "../../../components/Toast";
import { API } from "./shared";


export default function TransferModal({ appt, token, onClose, onSent }) {
  const [doctors, setDoctors] = useState(null);
  const [toDoctorId, setToDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/chat/doctors`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        // Don't list yourself as a transfer target
        setDoctors((json.doctors || []).filter(d => String(d.id) !== String(appt.doctor_id)));
      } catch { setDoctors([]); }
    })();
  }, []);

  const submit = async () => {
    setErr("");
    if (!toDoctorId) { setErr("Please choose a doctor to transfer to"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/appointments/${appt.id}/transfer-request`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ to_doctor_id: toDoctorId, reason: reason || null }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.detail || "Failed"); }
      onSent();
      onClose();
    } catch (e) { setErr(e.message || "Failed to send transfer request"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",width:"100%",maxWidth:"500px",borderRadius:"18px 18px 0 0",
        padding:"20px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Transfer to Another Doctor
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"12px"}}>
          Patient: <strong>{appt.patient_name}</strong> — a message will be sent to the doctor's chat,
          and the appointment moves to them automatically if they accept.
        </p>

        {doctors===null ? (
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#94a3b8"}}>Loading doctors…</p>
        ) : (
          <select value={toDoctorId} onChange={e=>setToDoctorId(e.target.value)}
            style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"11px",
              fontFamily:"'DM Sans',sans-serif",fontSize:"14px",marginBottom:"10px",outline:"none"}}>
            <option value="">Select a doctor…</option>
            {doctors.map(d=>(
              <option key={d.id} value={d.id}>{d.full_name}{d.specialization?` — ${d.specialization}`:""}</option>
            ))}
          </select>
        )}

        <textarea value={reason} onChange={e=>setReason(e.target.value)}
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"12px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",
            minHeight:"70px",outline:"none"}}
          placeholder="Optional — let them know why (e.g. outside my specialty, fully booked)…"/>

        {err && <p style={{color:"#dc2626",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginTop:"10px"}}>⚠ {err}</p>}

        <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
          <button onClick={submit} disabled={saving}
            style={{flex:1,background:"linear-gradient(135deg,#047857,#059669)",
              color:"#fff",border:"none",borderRadius:"9px",padding:"12px",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",cursor:"pointer"}}>
            {saving?"Sending…":"Send Transfer Request"}
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
