import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API, Badge, Spinner, SectionHead, DeleteButton } from "./shared";

// These two subjects come in as an exact, fixed string from their
// dedicated pages (ResidentialHealthCare.jsx, CorporateWellness.jsx).
// Everything else lands here from the general Contact.jsx form, which
// has its own free-text subject dropdown (Support, Partnership, etc.)
// — those all get grouped under "General" rather than listed
// individually, since Contact.jsx's subject list can grow/change
// independently of this admin page.
const FIXED_SUBJECTS = ["Residential Health Care", "Corporate Wellness"];

// ── CONTACTS ─────────────────────────────────────────────────
export default function Contacts({ token }) {
  const { t } = useTranslation();
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("all"); // all | general | Residential Health Care | Corporate Wellness
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
  const filtered = data.filter(c => {
    if (tab === "all") return true;
    if (tab === "general") return !FIXED_SUBJECTS.includes(c.subject);
    return c.subject === tab;
  });
  const TABS = [
    { id:"all",     label:"All",                      count: data.length },
    { id:"general", label:"General Enquiry",           count: data.filter(c=>!FIXED_SUBJECTS.includes(c.subject)).length },
    { id:"Residential Health Care", label:"Residential Health Care", count: data.filter(c=>c.subject==="Residential Health Care").length },
    { id:"Corporate Wellness",      label:"Corporate Wellness",      count: data.filter(c=>c.subject==="Corporate Wellness").length },
  ];
  return(
    <div>
      <SectionHead title={t("adminPages.contacts.heading")} count={data.length}/>
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"16px"}}>
        {TABS.map(tb=>(
          <button key={tb.id} onClick={()=>setTab(tb.id)}
            style={{padding:"7px 14px",borderRadius:"8px",cursor:"pointer",
              border: tab===tb.id ? "1.5px solid var(--wc-green)" : "1.5px solid var(--wc-border)",
              background: tab===tb.id ? "var(--wc-sage)" : "#fff",
              color: tab===tb.id ? "var(--wc-green)" : "var(--wc-muted)",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12.5px"}}>
            {tb.label} ({tb.count})
          </button>
        ))}
      </div>
      {loading?<Spinner/>:filtered.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>{t("adminPages.contacts.none")}</div>
      ):filtered.map(c=>(
        <div key={c.id} className="data-row"
          style={{borderLeft:`3px solid ${c.status==="new"?"var(--wc-teal)":"var(--wc-border)"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"8px"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",
                marginBottom:"5px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px",color:"var(--wc-navy)"}}>{c.full_name}</strong>
                <Badge status={c.status||"new"}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",color:"#6b7688"}}>
                  {new Date(c.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"6px"}}>
                {[c.email,c.mobile,c.subject].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"var(--wc-muted)"}}>{v}</span>
                ))}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"#374151",margin:0,lineHeight:"1.6"}}>{c.message}</p>
            </div>
            {c.status==="new"&&(
              <button className="btn-sm btn-outline"
                onClick={()=>markRead(c.id)} style={{flexShrink:0}}>
                {t("adminPages.contacts.markRead")}
              </button>
            )}
            <DeleteButton small
              confirmText={`Permanently delete this contact submission from ${c.full_name}? This cannot be undone.`}
              onDelete={async()=>{
                const res=await fetch(`${API}/admin/contacts/${c.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
                if(res.ok) setData(p=>p.filter(x=>x.id!==c.id)); else alert("Couldn't delete this submission.");
              }}/>
          </div>
        </div>
      ))}
    </div>
  );
}
