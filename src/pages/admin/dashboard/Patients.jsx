import { useState, useEffect } from "react";
import { API, Spinner, SectionHead } from "./shared";
import SendMessageModal from "./SendMessageModal";


export default function Patients({ token }) {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all"); // all | healthcare | hospital
  const [msgPatient, setMsgPatient] = useState(null);
  const [expanded,   setExpanded]   = useState({}); // {patientId: bool}

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const res=await fetch(`${API}/admin/patients`,
          {headers:{Authorization:`Bearer ${token}`}});
        const json=await res.json();
        setData(json.patients||[]);
      }catch{setData([]);}
      finally{setLoading(false);}
    })();
  },[]);

  const bySearch=search?data.filter(p=>
    (p.full_name||"").toLowerCase().includes(search.toLowerCase())||
    (p.email||"").toLowerCase().includes(search.toLowerCase())||
    (p.mobile||"").includes(search)):data;

  const filtered = filter==="all" ? bySearch
    : bySearch.filter(p => (p.portal_type||"healthcare") === filter);

  const hospitalCount = data.filter(p => p.portal_type === "hospital").length;
  const toggleExpand = id => setExpanded(p => ({...p, [id]: !p[id]}));

  return(
    <div>
      <SectionHead title="Registered Patients" count={filtered.length}/>
      <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"16px",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          className="ad-inp"
          style={{width:"260px",maxWidth:"100%"}}
          placeholder="🔍 Search by name, email, mobile…"/>
        <div style={{display:"flex",gap:"6px"}}>
          {[["all",`All (${data.length})`],["healthcare",`🩺 Healthcare (${data.length-hospitalCount})`],["hospital",`🏥 Hospital Consultancy (${hospitalCount})`]].map(([id,label])=>(
            <button key={id} onClick={()=>setFilter(id)}
              style={{padding:"6px 12px",borderRadius:"8px",cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",
                border:filter===id?"1.5px solid #047857":"1.5px solid #e2eaf4",
                background:filter===id?"#f0fdf4":"#fff",
                color:filter===id?"#047857":"#64748b"}}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {filter==="hospital" && (
        <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:"10px",
          padding:"10px 14px",marginBottom:"14px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#1d4ed8",margin:0}}>
            ℹ️ These signed up via the "Hospital Consultancy" login option to browse/apply for
            empanelment — they're not real patients. Approved hospital partners get their own
            account in Hospital Partners, separate from this list.
          </p>
        </div>
      )}
      {loading?<Spinner/>:filtered.map(p=>{
        const isHospitalIntent = p.portal_type === "hospital";
        const isOpen = !!expanded[p.id];
        return (
        <div key={p.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px",color:"#0b1f3a"}}>
                  {p.full_name||"—"}
                </strong>
                {isHospitalIntent && (
                  <span className="badge" style={{background:"#eff6ff",color:"#1d4ed8"}}>
                    🏥 Hospital Consultancy
                  </span>
                )}
              </div>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginTop:"4px"}}>
                {[p.email,p.mobile,p.gender,
                  `${p.city||""}${p.state?`, ${p.state}`:""}`,
                  `Joined: ${new Date(p.created_at).toLocaleDateString("en-IN")}`,
                ].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",
                    fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
              <button onClick={()=>toggleExpand(p.id)} style={{
                marginTop:"8px",background:"none",border:"none",cursor:"pointer",
                padding:0,display:"flex",alignItems:"center",gap:"5px",
                fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                color:"#047857"}}>
                {isOpen ? "▲ Hide details" : "▼ View details"}
              </button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>
              <span className="badge"
                style={{background:p.is_active?"#dcfce7":"#fee2e2",
                  color:p.is_active?"#15803d":"#991b1b"}}>
                {p.is_active?"Active":"Inactive"}
              </span>
              <button onClick={()=>setMsgPatient(p)}
                style={{padding:"6px 14px",borderRadius:"8px",
                  background:"#eff8ff",border:"1.5px solid #93c5fd",
                  color:"#0369a1",fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                ✉ Message
              </button>
            </div>
          </div>
          {isOpen && (
            <div style={{marginTop:"10px",background:"#f8fafc",
              border:"1px solid #e2eaf4",borderRadius:"10px",padding:"14px 16px",
              display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
              gap:"10px 20px"}}>
              {[
                ["Full Name", p.full_name || "—"],
                ["Designation", p.designation || "Patient"],
                ["Email", p.email || "—"],
                ["Mobile", p.mobile ? `${p.country_code||"+91"} ${p.mobile}` : "—"],
                ["Gender", p.gender || "—"],
                ["Date of Birth", p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString("en-IN") : "—"],
                ["Blood Group", p.blood_group || "—"],
                ["Address", p.address || "—"],
                ["City", p.city || "—"],
                ["State", p.state || "—"],
                ["Country", p.country || "—"],
                ["Pincode", p.pincode || "—"],
                ["Emergency Contact", p.emergency_contact || "—"],
                ["Preferred Language", p.language_preference==="ta"?"Tamil":p.language_preference==="hi"?"Hindi":p.language_preference==="en"?"English":(p.language_preference||"—")],
                ["Account Type", isHospitalIntent ? "Hospital Consultancy (browsing/applying)" : "Healthcare Consultancy (patient)"],
                ["Joined On", p.created_at ? new Date(p.created_at).toLocaleString("en-IN") : "—"],
              ].map(([label,val])=>(
                <div key={label}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10.5px",
                    fontWeight:"700",color:"#6b7688",textTransform:"uppercase",
                    letterSpacing:".4px",margin:"0 0 2px"}}>{label}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                    color:"#1e293b",margin:0,wordBreak:"break-word"}}>{val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })}
      {msgPatient&&(
        <SendMessageModal
          patient={msgPatient}
          token={token}
          onClose={()=>setMsgPatient(null)}
        />
      )}
    </div>
  );
}
