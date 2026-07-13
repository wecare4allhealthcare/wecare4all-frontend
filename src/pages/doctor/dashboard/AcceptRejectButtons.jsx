import { useState } from "react";
import { showToast } from "../../../components/Toast";
import { API } from "./shared";


export default function AcceptRejectButtons({ appt, token, onChanged, onReject }) {
  const [accepting, setAccepting] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [fee, setFee] = useState("");
  const [feeErr, setFeeErr] = useState("");

  const needsFee = !appt.payment_amount || Number(appt.payment_amount) <= 0;

  const doAccept = async (consultationFee) => {
    setAccepting(true);
    try {
      const res = await fetch(`${API}/appointments/${appt.id}/accept`,{
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`,
        },
        body: JSON.stringify(consultationFee ? { consultation_fee: Number(consultationFee) } : {}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed");
      setShowFeeModal(false);
      onChanged();
    } catch (e) { showToast(e.message || "Failed to accept", "error"); }
    finally { setAccepting(false); }
  };

  const accept = () => {
    if (needsFee) { setFeeErr(""); setFee(""); setShowFeeModal(true); return; }
    doAccept();
  };

  const confirmFee = () => {
    const n = Number(fee);
    if (!fee || isNaN(n) || n <= 0) { setFeeErr("Enter a valid fee amount"); return; }
    doAccept(n);
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

      {showFeeModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(11,31,58,.55)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"16px"}}
          onClick={()=>!accepting && setShowFeeModal(false)}>
          <div style={{background:"#fff",borderRadius:"14px",padding:"24px",
            maxWidth:"360px",width:"100%"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"19px",
              fontWeight:700,color:"#0b1f3a",margin:"0 0 6px"}}>Set Consultation Fee</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
              color:"#64748b",margin:"0 0 16px"}}>
              No fee was set on your profile for this booking. Enter the amount
              you'd like to charge — the patient will pay this before the
              appointment proceeds.
            </p>
            <input type="number" onWheel={e=>e.currentTarget.blur()} min="1" value={fee}
              onChange={e=>{setFee(e.target.value);setFeeErr("");}}
              placeholder="e.g. 500" autoFocus
              style={{width:"100%",padding:"10px 12px",borderRadius:"8px",
                border:`1.5px solid ${feeErr?"#fca5a5":"#e2eaf4"}`,
                fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                boxSizing:"border-box"}}/>
            {feeErr && <p style={{color:"#dc2626",fontSize:"12px",
              fontFamily:"'DM Sans',sans-serif",margin:"6px 0 0"}}>{feeErr}</p>}
            <div style={{display:"flex",gap:"8px",marginTop:"18px"}}>
              <button onClick={()=>setShowFeeModal(false)} disabled={accepting}
                style={{flex:1,padding:"10px",borderRadius:"8px",
                  background:"#f1f5f9",border:"none",color:"#64748b",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:600,
                  fontSize:"13px",cursor:"pointer"}}>Cancel</button>
              <button onClick={confirmFee} disabled={accepting}
                style={{flex:1,padding:"10px",borderRadius:"8px",
                  background:"linear-gradient(135deg,#047857,#059669)",
                  border:"none",color:"#fff",fontFamily:"'DM Sans',sans-serif",
                  fontWeight:600,fontSize:"13px",cursor:"pointer"}}>
                {accepting ? "Accepting…" : "Confirm & Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
