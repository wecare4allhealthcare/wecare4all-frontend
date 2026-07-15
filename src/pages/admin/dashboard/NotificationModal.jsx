import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { API } from "./shared";
import { useModalA11y } from "../../../hooks/useModalA11y";


// ── Notification Modal ────────────────────────────────────────
export default function NotificationModal({ token, onClose }) {
  const { t } = useTranslation();
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);
  const [form,setForm]=useState({subject:"",message:"",type:"email",target:"all"});
  const [sending,setSending]=useState(false);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  const send=async(e)=>{
    e.preventDefault();setErr("");
    if(!form.subject.trim()||!form.message.trim()){setErr(t("adminPages.notificationModal.requiredFields"));return;}
    setSending(true);
    try{
      const res=await fetch(`${API}/admin/notify`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify(form),
      });
      const json=await res.json();
      if(!res.ok)throw new Error(json.detail||t("adminPages.notificationModal.sendFailed"));
      setDone(true);
    }catch(ex){setErr(ex.message);}
    finally{setSending(false);}
  };
  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" ref={boxRef} role="dialog" aria-modal="true">
        <div style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
          padding:"18px 22px",display:"flex",justifyContent:"space-between",
          alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>
            {t("adminPages.notificationModal.heading")}
          </h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",
            color:"#fff",width:"32px",height:"32px",borderRadius:"7px",cursor:"pointer",
            fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {done?(
          <div style={{padding:"36px",textAlign:"center"}}>
            <div style={{fontSize:"44px",marginBottom:"14px"}}>✅</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>
              {t("adminPages.notificationModal.sentTitle")}
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",
              marginBottom:"18px"}}>
              {t("adminPages.notificationModal.sentDesc",{target:form.target})}
            </p>
            <button onClick={onClose} className="btn-sm btn-navy"
              style={{padding:"10px 22px",fontSize:"13px"}}>{t("adminPages.notificationModal.close")}</button>
          </div>
        ):(
          <form onSubmit={send} style={{padding:"18px 22px"}}>
            <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
              {[["email",t("adminPages.notificationModal.channelEmail")],["sms",t("adminPages.notificationModal.channelSms")]].map(([ty,l])=>(
                <button key={ty} type="button"
                  onClick={()=>setForm(p=>({...p,type:ty}))}
                  style={{flex:1,padding:"9px",borderRadius:"8px",border:"1.5px solid",
                    fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
                    cursor:"pointer",transition:"all .2s",
                    borderColor:form.type===ty?"#7c3aed":"#e2eaf4",
                    background:form.type===ty?"#faf5ff":"#f8fafc",
                    color:form.type===ty?"#7c3aed":"#64748b"}}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-send-to">
                {t("adminPages.notificationModal.sendTo")}
              </label>
              <select id="admin-dashboard-send-to" value={form.target}
                onChange={e=>setForm(p=>({...p,target:e.target.value}))}
                className="ad-inp">
                <option value="all">{t("adminPages.notificationModal.targetAll")}</option>
                <option value="active">{t("adminPages.notificationModal.targetActive")}</option>
                <option value="new">{t("adminPages.notificationModal.targetNew")}</option>
              </select>
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-subject">
                {t("adminPages.notificationModal.subject")}
              </label>
              <input id="admin-dashboard-subject" value={form.subject}
                onChange={e=>setForm(p=>({...p,subject:e.target.value}))}
                className="ad-inp" placeholder={t("adminPages.notificationModal.subjectPlaceholder")}/>
            </div>
            <div style={{marginBottom:"14px"}}>
              <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}} htmlFor="admin-dashboard-message">
                {t("adminPages.notificationModal.message")}
              </label>
              <textarea id="admin-dashboard-message" value={form.message}
                onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                className="ad-inp" rows={4} style={{resize:"vertical"}}
                placeholder={t("adminPages.notificationModal.messagePlaceholder")}/>
            </div>
            {err&&<p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",
              fontSize:"13px",marginBottom:"10px"}}>⚠ {err}</p>}
            <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:"8px",
              padding:"10px 12px",marginBottom:"14px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#92400e",margin:0}}>
                {t("adminPages.notificationModal.warning")}
              </p>
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button type="submit" disabled={sending}
                style={{flex:1,padding:"12px",borderRadius:"9px",border:"none",
                  background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                  fontSize:"14px",cursor:"pointer",opacity:sending?0.7:1}}>
                {sending?t("adminPages.notificationModal.sending"):t("adminPages.notificationModal.send")}
              </button>
              <button type="button" onClick={onClose} className="btn-sm btn-outline"
                style={{padding:"12px 18px",fontSize:"13px"}}>{t("adminPages.notificationModal.cancel")}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
