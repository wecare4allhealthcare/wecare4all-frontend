import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { confirmAction } from "../../../components/ConfirmDialog";
import { API, Badge, Spinner, SectionHead, DeleteButton, PaginationBar } from "./shared";
import EmpanelmentFullDetails from "./EmpanelmentFullDetails";

const PAGE_SIZE = 10;

// ── EMPANELMENTS ─────────────────────────────────────────────
export default function Empanelments({ token }) {
  const { t } = useTranslation();
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("pending");
  const [statusCounts,setStatusCounts]=useState({pending:0,approved:0,rejected:0,all:0});
  const [justApproved,setJustApproved]=useState(null);
  const [expanded,setExpanded]=useState(null);
  const [page,setPage]=useState(1);
  const [totalPages,setTotalPages]=useState(1);
  const fetchData=async(f=filter,p=page)=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/admin/empanelments?status=${f}&page=${p}&page_size=${PAGE_SIZE}`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.empanelments||[]);
      if(json.status_counts) setStatusCounts(json.status_counts);
      setTotalPages(Math.max(1, Math.ceil((json.total||0)/PAGE_SIZE)));
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);
  const [updateErr,setUpdateErr]=useState(null);
  const update=async(id,status)=>{
    setUpdateErr(null);
    try{
      const res = await fetch(`${API}/admin/empanelments/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({status}),
      });
      const json = await res.json();
      if(!res.ok){
        setUpdateErr(json.detail || json.message || t("adminPages.empanelments.genericError",{status:res.status,action:t(`adminPages.shared.status.${status}`,status)}));
        return;
      }
      if(status==="approved"){
        setJustApproved({id, ...json});
      }
      fetchData();
    }catch(e){
      setUpdateErr(t("adminPages.empanelments.networkError"));
    }
  };
  return(
    <div>
      <SectionHead title={t("adminPages.empanelments.heading")} count={data.length}/>
      {justApproved && (
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",
          padding:"12px 16px",marginBottom:"14px",display:"flex",
          justifyContent:"space-between",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#15803d"}}>
            {justApproved.credentials_emailed
              ? t("adminPages.empanelments.approvedEmailed",{email:justApproved.hospital_email})
              : t("adminPages.empanelments.approvedNoResend")}
          </span>
          <button className="btn-sm" style={{background:"#f1f5f9",color:"#64748b"}}
            onClick={()=>setJustApproved(null)}>{t("adminPages.empanelments.dismiss")}</button>
        </div>
      )}
      {updateErr && (
        <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:"10px",
          padding:"12px 16px",marginBottom:"14px",display:"flex",
          justifyContent:"space-between",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#dc2626"}}>
            ❌ {updateErr}
          </span>
          <button className="btn-sm" style={{background:"#f1f5f9",color:"#64748b"}}
            onClick={()=>setUpdateErr(null)}>{t("adminPages.empanelments.dismiss")}</button>
        </div>
      )}
      <div className="filter-bar">
        {["pending","approved","rejected","all"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);setPage(1);fetchData(f,1);}}
            className={`fchip${filter===f?" on":""}`}>{t(`adminPages.shared.status.${f}`,f)} ({statusCounts[f]??0})</button>
        ))}
      </div>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>{t("adminPages.empanelments.none")}</div>
      ):data.map(e=>(
        <div key={e.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",
                marginBottom:"5px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px",color:"#0b1f3a"}}>{e.hospital_name}</strong>
                <Badge status={e.status}/>
                {e.partnership_tier&&
                  <span className="badge"
                    style={{background:"#eff8ff",color:"#0369a1"}}>
                    {e.partnership_tier.toUpperCase()}
                  </span>}
              </div>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
                {[e.contact_person,e.email,e.mobile,
                  `${e.city||""}, ${e.state||""}`].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
            </div>
            {e.status==="pending"&&(
              <div style={{display:"flex",gap:"6px",flexShrink:0,flexWrap:"wrap"}}>
                <button className="btn-sm"
                  style={{background:"#eff6ff",color:"#1d4ed8"}}
                  onClick={()=>setExpanded(expanded===e.id?null:e.id)}>
                  {expanded===e.id?t("adminPages.empanelments.hideDetails"):t("adminPages.empanelments.viewFullDetails")}
                </button>
                <button className="btn-sm btn-green"
                  onClick={()=>update(e.id,"approved")}>{t("adminPages.empanelments.approve")}</button>
                <button className="btn-sm btn-red"
                  onClick={async()=>{
                    const ok = await confirmAction({
                      title: t("adminPages.empanelments.rejectConfirmTitle",{name:e.hospital_name}),
                      message: t("adminPages.empanelments.rejectConfirmMessage"),
                      confirmLabel: t("adminPages.empanelments.reject"),
                    });
                    if (ok) update(e.id,"rejected");
                  }}>{t("adminPages.empanelments.reject")}</button>
                <DeleteButton small
                  confirmText={`Permanently delete ${e.hospital_name}'s empanelment application? This cannot be undone.`}
                  onDelete={async()=>{
                    const res=await fetch(`${API}/admin/empanelments/${e.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
                    const json=await res.json().catch(()=>({}));
                    if(res.ok) fetchData(); else alert(json.detail||"Couldn't delete this application.");
                  }}/>
              </div>
            )}
            {e.status!=="pending"&&(
              <div style={{display:"flex",gap:"6px",flexShrink:0,flexWrap:"wrap"}}>
                <button className="btn-sm"
                  style={{background:"#eff6ff",color:"#1d4ed8"}}
                  onClick={()=>setExpanded(expanded===e.id?null:e.id)}>
                  {expanded===e.id?t("adminPages.empanelments.hideDetails"):t("adminPages.empanelments.viewFullDetails")}
                </button>
                <DeleteButton small
                  confirmText={`Permanently delete ${e.hospital_name}'s empanelment application? This cannot be undone.`}
                  onDelete={async()=>{
                    const res=await fetch(`${API}/admin/empanelments/${e.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
                    const json=await res.json().catch(()=>({}));
                    if(res.ok) fetchData(); else alert(json.detail||"Couldn't delete this application.");
                  }}/>
              </div>
            )}
          </div>
          {expanded===e.id && <EmpanelmentFullDetails e={e}/>}
        </div>
      ))}
      <PaginationBar page={page} totalPages={totalPages} loading={loading}
        onPrev={()=>{ const p=page-1; setPage(p); fetchData(filter,p); }}
        onNext={()=>{ const p=page+1; setPage(p); fetchData(filter,p); }} />
    </div>
  );
}
