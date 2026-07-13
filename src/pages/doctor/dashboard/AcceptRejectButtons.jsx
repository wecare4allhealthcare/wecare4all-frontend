import { useState } from "react";
import { showToast } from "../../../components/Toast";
import { API } from "./shared";


export default function AcceptRejectButtons({ appt, token, onChanged, onReject }) {
  const [accepting, setAccepting] = useState(false);

  // Doctors never see or set their own consultation fee (Phase 2) — so
  // there's no "enter a fee before accepting" step here anymore either.
  // If a doctor's profile had no fee configured at booking time,
  // payment_amount stays 0 and that's an admin data-quality issue to
  // fix on the doctor's profile, not something surfaced to the doctor
  // per-appointment. Accept just accepts.
  const accept = async () => {
    setAccepting(true);
    try {
      const res = await fetch(`${API}/appointments/${appt.id}/accept`,{
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed");
      onChanged();
    } catch (e) { showToast(e.message || "Failed to accept", "error"); }
    finally { setAccepting(false); }
  };

  return (
    <>
      <button onClick={accept} disabled={accepting}
        style={{padding:"7px 14px",borderRadius:"7px",
          background:"linear-gradient(135deg,#047857,#059669)",border:"none",
          color:"#fff",fontFamily:"'DM Sans',sans-serif",
          fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
        {accepting ? "Accepting…" : "✅ Accept"}
      </button>
      <button onClick={()=>onReject(appt)} disabled={accepting}
        style={{padding:"7px 14px",borderRadius:"7px",
          background:"#fff",border:"1.5px solid #fecaca",
          color:"#b91c1c",fontFamily:"'DM Sans',sans-serif",
          fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
        ❌ Decline
      </button>
    </>
  );
}
