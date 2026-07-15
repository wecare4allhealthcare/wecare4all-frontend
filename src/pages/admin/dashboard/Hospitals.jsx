import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../../../components/Toast";
import { API, Spinner, SectionHead } from "./shared";


// ── HOSPITAL PARTNERS ────────────────────────────────────────
export default function Hospitals({ token }) {
  const { t } = useTranslation();
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [expanded,setExpanded]=useState(null);
  const [commissions,setCommissions]=useState({});
  const [adding,setAdding]=useState(null);
  const [amount,setAmount]=useState("");
  const [rate,setRate]=useState("");
  const [settingPrice,setSettingPrice]=useState(null);
  const [subAmount,setSubAmount]=useState("");
  const [subCycle,setSubCycle]=useState("monthly");

  const fetchData=async()=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/admin/hospitals`,{headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.hospitals||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);

  const regenerate=async(id)=>{
    if(!window.confirm(t("adminPages.hospitals.confirmRegenerate")))return;
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/regenerate-token`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      if(json.portal_link){
        navigator.clipboard.writeText(json.portal_link);
        showToast(t("adminPages.hospitals.portalLinkCopied",{link:json.portal_link}), "success");
      }
      fetchData();
    }catch{}
  };

  const resetPassword=async(id)=>{
    if(!window.confirm(t("adminPages.hospitals.confirmResetPassword")))return;
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/reset-password`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      showToast(json.message || (res.ok ? t("adminPages.hospitals.newPasswordSent") : (t("adminPages.hospitals.couldNotResetPassword"), "error")));
    }catch{}
  };

  const setSubscriptionPrice=async(id)=>{
    if(!subAmount||parseFloat(subAmount)<=0){showToast(t("adminPages.hospitals.enterValidAmount"), "info");return;}
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/subscription`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({amount:parseFloat(subAmount),billing_cycle:subCycle}),
      });
      const json=await res.json();
      if(!res.ok){showToast(json.detail||t("adminPages.hospitals.couldNotSetPrice"), "error");return;}
      showToast(json.message, "info");
      setSettingPrice(null);setSubAmount("");
    }catch{}
  };

  const markAsPaid=async(id)=>{
    if(!window.confirm(t("adminPages.hospitals.confirmMarkPaid"))) return;
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/subscription/mark-paid`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
      });
      const json=await res.json();
      if(res.ok){ showToast(t("adminPages.hospitals.subscriptionMarkedPaid"),"success"); fetchData(); }
      else { showToast(json.detail||t("adminPages.hospitals.failed"),"error"); }
    }catch{ showToast(t("adminPages.hospitals.networkError"),"error"); }
  };

  const addCommission=async(id)=>{
    if(!amount)return;
    try{
      await fetch(`${API}/admin/hospitals/${id}/commissions`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({amount_due:parseFloat(amount),commission_rate:rate?parseFloat(rate):null}),
      });
      setAdding(null);setAmount("");setRate("");
      if(expanded===id) fetchCommissions(id);
    }catch{}
  };

  const fetchCommissions=async(id)=>{
    try{
      const res=await fetch(`${API}/admin/hospitals/${id}/commissions`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setCommissions(prev=>({...prev,[id]:json.commissions||[]}));
    }catch{
      setCommissions(prev=>({...prev,[id]:[]}));
    }
  };

  const toggleExpand=(id)=>{
    if(expanded===id){ setExpanded(null); return; }
    setExpanded(id);
    if(!commissions[id]) fetchCommissions(id);
  };

  const settle=async(commId,hospId)=>{
    const recv=window.prompt("Amount actually received (₹)?");
    if(!recv)return;
    try{
      await fetch(`${API}/admin/commissions/${commId}/settle`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({amount_received:parseFloat(recv)}),
      });
      setCommissions(prev=>{const c={...prev}; delete c[hospId]; return c;});
      if(expanded===hospId) fetchCommissions(hospId);
    }catch{}
  };

  return(
    <div>
      <SectionHead title={t("adminPages.hospitals.heading")} count={data.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
        {t("adminPages.hospitals.note")}
      </p>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>
          {t("adminPages.hospitals.none")}
        </div>
      ):data.map(h=>(
        <div key={h.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
            <div>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                {h.hospital_name}
              </strong>
              <span className="badge" style={{marginLeft:"8px",background:"#eff8ff",color:"#0369a1"}}>
                {(h.tier||"basic").toUpperCase()}
              </span>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginTop:"4px"}}>
                {[h.contact_person,h.email,h.mobile,h.city].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#6b7688",margin:"4px 0 0"}}>
                {h.last_login_at
                  ? t("adminPages.hospitals.lastLogin",{date:new Date(h.last_login_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})})
                  : t("adminPages.hospitals.neverLoggedIn")}
              </p>
            </div>
            <div style={{display:"flex",gap:"6px",flexShrink:0,flexWrap:"wrap"}}>
              <button className="btn-sm" style={{background:"#eff8ff",color:"#0369a1"}}
                onClick={()=>toggleExpand(h.id)}>
                {expanded===h.id?t("adminPages.hospitals.hideCommissions"):t("adminPages.hospitals.viewCommissions")}
              </button>
              <button className="btn-sm btn-navy" onClick={()=>setAdding(adding===h.id?null:h.id)}>
                {t("adminPages.hospitals.addCommission")}
              </button>
              {h.tier!=="basic"&&
                <button className="btn-sm" style={{background:"#eff8ff",color:"#0369a1"}}
                  onClick={()=>setSettingPrice(settingPrice===h.id?null:h.id)}>
                  {t("adminPages.hospitals.setSubscriptionPrice")}
                </button>}
              {h.tier!=="basic"&&
                <button className="btn-sm" style={{background:"#dcfce7",color:"#15803d"}}
                  onClick={()=>markAsPaid(h.id)}>
                  {t("adminPages.hospitals.markAsPaid")}
                </button>}
              <button className="btn-sm" style={{background:"#fffbeb",color:"#92400e"}}
                onClick={()=>resetPassword(h.id)}>
                {t("adminPages.hospitals.resetPassword")}
              </button>
            </div>
          </div>
          {settingPrice===h.id&&(
            <div style={{marginTop:"10px",display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap",
              background:"#eff8ff",border:"1px solid #bae6fd",borderRadius:"9px",padding:"10px"}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#0369a1",fontWeight:600}}>
                {t("adminPages.hospitals.agreedAmountLabel")}
              </span>
              <input value={subAmount} onChange={e=>setSubAmount(e.target.value)}
                placeholder={t("adminPages.hospitals.amountPlaceholder")} type="number" onWheel={e=>e.currentTarget.blur()} className="ad-inp"
                style={{width:"140px",padding:"6px 10px",fontSize:"12px"}}/>
              <select value={subCycle} onChange={e=>setSubCycle(e.target.value)}
                className="ad-inp" style={{width:"120px",padding:"6px 10px",fontSize:"12px"}}>
                <option value="monthly">{t("adminPages.hospitals.monthly")}</option>
                <option value="yearly">{t("adminPages.hospitals.yearly")}</option>
              </select>
              <button className="btn-sm btn-green" onClick={()=>setSubscriptionPrice(h.id)}>{t("adminPages.hospitals.save")}</button>
            </div>
          )}
          {adding===h.id&&(
            <div style={{marginTop:"10px",display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
              <input value={amount} onChange={e=>setAmount(e.target.value)}
                placeholder={t("adminPages.hospitals.amountDuePlaceholder")} type="number" onWheel={e=>e.currentTarget.blur()} className="ad-inp"
                style={{width:"140px",padding:"6px 10px",fontSize:"12px"}}/>
              <input value={rate} onChange={e=>setRate(e.target.value)}
                placeholder={t("adminPages.hospitals.ratePlaceholder")} type="number" onWheel={e=>e.currentTarget.blur()} className="ad-inp"
                style={{width:"140px",padding:"6px 10px",fontSize:"12px"}}/>
              <button className="btn-sm btn-green" onClick={()=>addCommission(h.id)}>{t("adminPages.hospitals.save")}</button>
            </div>
          )}
          {expanded===h.id&&(
            <div style={{marginTop:"12px",background:"#f8fafc",borderRadius:"10px",padding:"12px"}}>
              {!commissions[h.id]?(
                <Spinner/>
              ):commissions[h.id].length===0?(
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688",margin:0}}>
                  {t("adminPages.hospitals.noCommissions")}
                </p>
              ):commissions[h.id].map(c=>(
                <div key={c.id} style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",padding:"8px 0",borderBottom:"1px solid #e2eaf4",flexWrap:"wrap",gap:"8px"}}>
                  <div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:"#0b1f3a"}}>
                      {t("adminPages.hospitals.amountDue",{amount:c.amount_due})}
                    </span>
                    {c.commission_rate&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                      color:"#6b7688",marginLeft:"8px"}}>({c.commission_rate}%)</span>}
                    <span className="badge" style={{marginLeft:"8px",
                      background:c.status==="received"?"#dcfce7":"#fef9c3",
                      color:c.status==="received"?"#15803d":"#854d0e"}}>
                      {t(`adminPages.shared.status.${c.status}`, c.status)}
                    </span>
                  </div>
                  {c.status!=="received"&&(
                    <button className="btn-sm btn-green" onClick={()=>settle(c.id,h.id)}>{t("adminPages.hospitals.markReceived")}</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
