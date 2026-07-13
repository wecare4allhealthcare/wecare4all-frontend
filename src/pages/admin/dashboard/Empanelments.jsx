import { useState, useEffect } from "react";
import { confirmAction } from "../../../components/ConfirmDialog";
import { API, Badge, Spinner, SectionHead } from "./shared";
import EmpanelmentFullDetails from "./EmpanelmentFullDetails";


// ── EMPANELMENTS ─────────────────────────────────────────────
export default function Empanelments({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("pending");
  const [justApproved,setJustApproved]=useState(null);
  const [expanded,setExpanded]=useState(null);
  const fetchData=async(f=filter)=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/admin/empanelments?status=${f}`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.empanelments||[]);
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
        setUpdateErr(json.detail || json.message || `Error ${res.status}: could not ${status} application`);
        return;
      }
      if(status==="approved"){
        setJustApproved({id, ...json});
      }
      fetchData();
    }catch(e){
      setUpdateErr("Network error — please check your connection and try again.");
    }
  };
  return(
    <div>
      <SectionHead title="Hospital Empanelments" count={data.length}/>
      {justApproved && (
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",
          padding:"12px 16px",marginBottom:"14px",display:"flex",
          justifyContent:"space-between",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#15803d"}}>
            {justApproved.credentials_emailed
              ? <>✅ Approved — login credentials emailed to <strong>{justApproved.hospital_email}</strong>.</>
              : <>✅ Approved — this hospital already has a login (re-approval doesn't resend credentials).</>}
          </span>
          <button className="btn-sm" style={{background:"#f1f5f9",color:"#64748b"}}
            onClick={()=>setJustApproved(null)}>Dismiss</button>
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
            onClick={()=>setUpdateErr(null)}>Dismiss</button>
        </div>
      )}
      <div className="filter-bar">
        {["pending","approved","rejected","all"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);fetchData(f);}}
            className={`fchip${filter===f?" on":""}`}>{f}</button>
        ))}
      </div>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>No applications found.</div>
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
              <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                <button className="btn-sm"
                  style={{background:"#eff6ff",color:"#1d4ed8"}}
                  onClick={()=>setExpanded(expanded===e.id?null:e.id)}>
                  {expanded===e.id?"Hide Details":"View Full Details"}
                </button>
                <button className="btn-sm btn-green"
                  onClick={()=>update(e.id,"approved")}>Approve</button>
                <button className="btn-sm btn-red"
                  onClick={async()=>{
                    const ok = await confirmAction({
                      title: `Reject ${e.hospital_name}'s application?`,
                      message: "The hospital will be emailed that their empanelment application wasn't approved. This can't be undone from here.",
                      confirmLabel: "Reject",
                    });
                    if (ok) update(e.id,"rejected");
                  }}>Reject</button>
              </div>
            )}
            {e.status!=="pending"&&(
              <button className="btn-sm"
                style={{background:"#eff6ff",color:"#1d4ed8",flexShrink:0}}
                onClick={()=>setExpanded(expanded===e.id?null:e.id)}>
                {expanded===e.id?"Hide Details":"View Full Details"}
              </button>
            )}
          </div>
          {expanded===e.id && <EmpanelmentFullDetails e={e}/>}
        </div>
      ))}
    </div>
  );
}
