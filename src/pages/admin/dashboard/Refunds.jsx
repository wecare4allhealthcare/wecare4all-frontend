import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../../../components/Toast";
import { API, Spinner, SectionHead } from "./shared";


// ── REFUNDS ──────────────────────────────────────────────────
export default function Refunds({ token }) {
  const { t } = useTranslation();
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [processing,setProcessing]=useState(null);

  const fetchData=async()=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/payments/admin/refund-queue`,{headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.appointments||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);

  const processRefund=async(id)=>{
    if(!window.confirm(t("adminPages.refunds.confirmProcess")))return;
    setProcessing(id);
    try{
      const res=await fetch(`${API}/payments/admin/${id}/refund`,
        {method:"POST",headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      if(!res.ok){ showToast(json.detail||t("adminPages.refunds.refundFailed"), "error"); return; }
      fetchData();
    }catch{ showToast(t("adminPages.refunds.refundFailedRetry"), "error"); }
    finally{ setProcessing(null); }
  };

  return(
    <div>
      <SectionHead title={t("adminPages.refunds.heading")} count={data.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
        {t("adminPages.refunds.note")}
      </p>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>{t("adminPages.refunds.none")}</div>
      ):data.map(a=>(
        <div key={a.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
            <div>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                {a.patient_name}
              </strong>
              <span className="badge" style={{marginLeft:"8px",
                background:a.status==="rejected"?"#fef2f2":"#f1f5f9",
                color:a.status==="rejected"?"#991b1b":"#64748b"}}>
                {t(`adminPages.shared.status.${a.status}`, a.status)}
              </span>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginTop:"4px"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>
                  {a.appointment_date} {a.appointment_time?.slice(0,5)}
                </span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>
                  {a.doctors?.full_name||t("adminPages.shared.dash")}
                </span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:"#b45309"}}>
                  ₹{a.payment_amount} {t("adminPages.refunds.owedBack")}
                </span>
              </div>
            </div>
            <button className="btn-sm btn-green" disabled={processing===a.id}
              onClick={()=>processRefund(a.id)}>
              {processing===a.id?t("adminPages.refunds.processing"):t("adminPages.refunds.processRefund")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
