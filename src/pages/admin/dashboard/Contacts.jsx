import { useState, useEffect } from "react";
import { API, Badge, Spinner, SectionHead } from "./shared";


// ── CONTACTS ─────────────────────────────────────────────────
export default function Contacts({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const res=await fetch(`${API}/admin/contacts`,
          {headers:{Authorization:`Bearer ${token}`}});
        const json=await res.json();
        setData(json.contacts||[]);
      }catch{setData([]);}
      finally{setLoading(false);}
    })();
  },[]);
  const markRead=async(id)=>{
    try{
      await fetch(`${API}/admin/contacts/${id}/read`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      setData(p=>p.map(c=>c.id===id?{...c,status:"read"}:c));
    }catch{}
  };
  return(
    <div>
      <SectionHead title="Contact Submissions" count={data.length}/>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>No contact submissions.</div>
      ):data.map(c=>(
        <div key={c.id} className="data-row"
          style={{borderLeft:`3px solid ${c.status==="new"?"#0369a1":"#e2eaf4"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"8px"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",
                marginBottom:"5px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px",color:"#0b1f3a"}}>{c.full_name}</strong>
                <Badge status={c.status||"new"}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",color:"#94a3b8"}}>
                  {new Date(c.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"6px"}}>
                {[c.email,c.mobile,c.subject].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"#374151",margin:0,lineHeight:"1.6"}}>{c.message}</p>
            </div>
            {c.status==="new"&&(
              <button className="btn-sm btn-outline"
                onClick={()=>markRead(c.id)} style={{flexShrink:0}}>
                Mark Read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
