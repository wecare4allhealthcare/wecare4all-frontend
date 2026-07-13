import { useState } from "react";
import { API } from "./shared";


// ── Notification Modal ────────────────────────────────────────
export default function NotificationModal({ token, onClose }) {
  const [form,setForm]=useState({subject:"",message:"",type:"email",target:"all"});
  const [sending,setSending]=useState(false);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  const send=async(e)=>{
    e.preventDefault();setErr("");
    if(!form.subject.trim()||!form.message.trim()){setErr("Subject and message required");return;}
    setSending(true);
    try{
      const res=await fetch(`${API}/admin/notify`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify(form),
      });
      const json=await res.json();
      if(!res.ok)throw new Error(json.detail||"Failed to send");
      setDone(true);
    }catch(ex){setErr(ex.message);}
    finally{setSending(false);}
  };
  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
          padding:"18px 22px",display:"flex",justifyContent:"space-between",
          alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>
            📢 Send Notification
          </h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",
            color:"#fff",width:"32px",height:"32px",borderRadius:"7px",cursor:"pointer",
            fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {done?(
          <div style={{padding:"36px",textAlign:"center"}}>
            <div style={{fontSize:"44px",marginBottom:"14px"}}>✅</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>
              Notification Sent!
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",
              marginBottom:"18px"}}>
              Message queued for delivery to all {form.target} patients.
            </p>
            <button onClick={onClose} className="btn-sm btn-navy"
              style={{padding:"10px 22px",fontSize:"13px"}}>Close</button>
          </div>
        ):(
          <form onSubmit={send} style={{padding:"18px 22px"}}>
            <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
              {[["email","📧 Email"],["sms","📱 SMS"]].map(([t,l])=>(
                <button key={t} type="button"
                  onClick={()=>setForm(p=>({...p,type:t}))}
                  style={{flex:1,padding:"9px",borderRadius:"8px",border:"1.5px solid",
                    fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
                    cursor:"pointer",transition:"all .2s",
                    borderColor:form.type===t?"#7c3aed":"#e2eaf4",
                    background:form.type===t?"#faf5ff":"#f8fafc",
                    color:form.type===t?"#7c3aed":"#64748b"}}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-send-to">
                Send To
              </label>
              <select id="admin-dashboard-send-to" value={form.target}
                onChange={e=>setForm(p=>({...p,target:e.target.value}))}
                className="ad-inp">
                <option value="all">All Patients</option>
                <option value="active">Patients with upcoming appointments</option>
                <option value="new">New patients (last 30 days)</option>
              </select>
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-subject">
                Subject *
              </label>
              <input id="admin-dashboard-subject" value={form.subject}
                onChange={e=>setForm(p=>({...p,subject:e.target.value}))}
                className="ad-inp" placeholder="e.g. Health tip from We Care 4 'all'"/>
            </div>
            <div style={{marginBottom:"14px"}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-message">
                Message *
              </label>
              <textarea id="admin-dashboard-message" value={form.message}
                onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                className="ad-inp" rows={4} style={{resize:"vertical"}}
                placeholder="Type your message here…"/>
            </div>
            {err&&<p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",
              fontSize:"13px",marginBottom:"10px"}}>⚠ {err}</p>}
            <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:"8px",
              padding:"10px 12px",marginBottom:"14px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#92400e",margin:0}}>
                ⚠️ This will send to all selected patients. Use carefully.
              </p>
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button type="submit" disabled={sending}
                style={{flex:1,padding:"12px",borderRadius:"9px",border:"none",
                  background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                  fontSize:"14px",cursor:"pointer",opacity:sending?0.7:1}}>
                {sending?"Sending…":"📢 Send Notification"}
              </button>
              <button type="button" onClick={onClose} className="btn-sm btn-outline"
                style={{padding:"12px 18px",fontSize:"13px"}}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
