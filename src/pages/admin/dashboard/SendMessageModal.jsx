import { useState, useRef } from "react";
import { API } from "./shared";
import { useModalA11y } from "../../../hooks/useModalA11y";


// ── PATIENTS ─────────────────────────────────────────────────
// ── Per-patient message modal ─────────────────────────────────
export default function SendMessageModal({ patient, token, onClose }) {
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);
  const [type,    setType]    = useState("email");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result,  setResult]  = useState(null); // {ok, text}

  const send = async () => {
    if (!subject.trim()) { setResult({ ok:false, text:"Subject is required" }); return; }
    if (!message.trim()) { setResult({ ok:false, text:"Message body is required" }); return; }
    setSending(true); setResult(null);
    try {
      const res  = await fetch(`${API}/admin/notify-patient`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ patient_id:patient.id, subject:subject.trim(), message:message.trim(), type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed");
      setResult({ ok:true, text:json.message });
    } catch(e) {
      setResult({ ok:false, text:e.message || "Failed to send" });
    } finally { setSending(false); }
  };

  const INP = { width:"100%", border:"1.5px solid #e2eaf4", borderRadius:"9px",
    padding:"11px 13px", fontFamily:"'DM Sans',sans-serif",
    fontSize:"14px", color:"#1e293b", background:"#f8fafc", outline:"none", boxSizing:"border-box" };
  const LBL = { display:"block", fontFamily:"'DM Sans',sans-serif",
    fontSize:"11px", fontWeight:"700", color:"#374151", marginBottom:"5px" };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:3000,
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="Send Message" style={{background:"#fff",width:"100%",maxWidth:"520px",
        borderRadius:"20px 20px 0 0",padding:"22px",maxHeight:"90vh",overflowY:"auto"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"flex-start",marginBottom:"16px"}}>
          <div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
              fontWeight:"700",color:"#0b1f3a",margin:0}}>Message Patient</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
              color:"#64748b",margin:"3px 0 0"}}>
              To: <strong>{patient.full_name||"Patient"}</strong>
              {patient.email  ? ` · ${patient.email}`  : ""}
              {patient.mobile ? ` · ${patient.mobile}` : ""}
            </p>
          </div>
          <button onClick={onClose}
            style={{background:"#f1f5f9",border:"none",width:"32px",height:"32px",
              borderRadius:"8px",cursor:"pointer",fontSize:"18px",color:"#64748b",flexShrink:0}}>×</button>
        </div>

        {/* Channel selector */}
        <div style={{marginBottom:"14px"}}>
          <span style={LBL}>Send via</span>
          <div style={{display:"flex",gap:"8px"}}>
            {[["email","📧 Email"],["sms","📱 SMS"],["both","📧 + 📱 Both"]].map(([val,label])=>(
              <button key={val} onClick={()=>setType(val)}
                style={{flex:1,padding:"9px 6px",borderRadius:"9px",
                  fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",fontWeight:"600",
                  cursor:"pointer",transition:"all .15s",
                  border:type===val?"2px solid #047857":"1.5px solid #e2eaf4",
                  background:type===val?"#f0fdf4":"#f8fafc",
                  color:type===val?"#047857":"#64748b"}}>
                {label}
              </button>
            ))}
          </div>
          {type!=="sms"&&!patient.email&&(
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
              color:"#dc2626",margin:"6px 0 0"}}>⚠ No email address on record</p>)}
          {type!=="email"&&!patient.mobile&&(
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
              color:"#dc2626",margin:"6px 0 0"}}>⚠ No mobile number on record</p>)}
        </div>

        {/* Subject */}
        <div style={{marginBottom:"12px"}}>
          <label style={LBL} htmlFor="admin-dashboard-subject-2">Subject *</label>
          <input id="admin-dashboard-subject-2" value={subject} onChange={e=>setSubject(e.target.value)}
            style={INP} placeholder="e.g. Follow-up on your recent appointment"/>
        </div>

        {/* Body */}
        <div style={{marginBottom:"14px"}}>
          <label style={LBL} htmlFor="admin-dashboard-message-sms-capped-at-100-chars">
            Message *
            {type!=="email"&&(
              <span style={{fontWeight:"400",color:"#6b7688",marginLeft:"6px"}}>
                (SMS capped at 100 chars)
              </span>)}
          </label>
          <textarea id="admin-dashboard-message-sms-capped-at-100-chars" value={message} onChange={e=>setMessage(e.target.value)}
            rows={5} placeholder="Type your message here…"
            style={{...INP,resize:"vertical",minHeight:"110px",lineHeight:"1.6",padding:"12px 13px"}}/>
          {type!=="email"&&message.length>0&&(
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:message.length>100?"#dc2626":"#6b7688",
              margin:"4px 0 0",textAlign:"right"}}>
              {message.length}/100{message.length>100?" — will be truncated":""}
            </p>)}
        </div>

        {/* Result */}
        {result&&(
          <div style={{padding:"10px 14px",borderRadius:"9px",marginBottom:"12px",
            background:result.ok?"#f0fdf4":"#fef2f2",
            border:`1px solid ${result.ok?"#86efac":"#fecaca"}`,
            fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:result.ok?"#15803d":"#dc2626"}}>
            {result.ok?"✅":"⚠"} {result.text}
          </div>)}

        {/* Actions */}
        <div style={{display:"flex",gap:"10px"}}>
          {!result?.ok&&(
            <button onClick={send} disabled={sending}
              style={{flex:1,padding:"13px",borderRadius:"9px",border:"none",
                background:sending?"#6b7688":"linear-gradient(135deg,#047857,#059669)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"700",fontSize:"14px",cursor:sending?"wait":"pointer"}}>
              {sending?"Sending…":`Send ${type==="email"?"Email":type==="sms"?"SMS":"Email + SMS"}`}
            </button>)}
          <button onClick={onClose}
            style={{flex:result?.ok?1:0,padding:"13px",borderRadius:"9px",
              border:"1.5px solid #e2eaf4",background:"#fff",color:"#64748b",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
              fontSize:"14px",cursor:"pointer",minWidth:"90px"}}>
            {result?.ok?"Done":"Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
