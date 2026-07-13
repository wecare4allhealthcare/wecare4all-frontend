import { useState, useEffect } from "react";
import { API, Spinner, SectionHead } from "./shared";


// ── REVIEWS ──────────────────────────────────────────────────
export default function Reviews({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);

  const fetchData=async()=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/admin/reviews`,{headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.reviews||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);

  const toggleHidden=async(id)=>{
    try{
      await fetch(`${API}/admin/reviews/${id}/toggle-hidden`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      fetchData();
    }catch{}
  };

  return(
    <div>
      <SectionHead title="Reviews" count={data.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
        Hiding a review removes it from the public doctor listing and recalculates that doctor's
        average rating — it isn't deleted, and can be unhidden any time.
      </p>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>No reviews yet.</div>
      ):data.map(r=>(
        <div key={r.id} className="data-row" style={{opacity:r.is_hidden?0.55:1}}>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                <span style={{color:"#fbbf24",fontSize:"14px"}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                {r.is_hidden && <span className="badge" style={{background:"#fef2f2",color:"#991b1b"}}>Hidden</span>}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",margin:"0 0 4px"}}>
                For <strong>{r.doctors?.full_name||"—"}</strong> by {r.users?.full_name||"a patient"}
              </p>
              {r.review_text && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"#1e293b",margin:0,fontStyle:"italic"}}>"{r.review_text}"</p>}
            </div>
            <button className="btn-sm" style={{background:r.is_hidden?"#dcfce7":"#fef2f2",
              color:r.is_hidden?"#15803d":"#991b1b"}}
              onClick={()=>toggleHidden(r.id)}>
              {r.is_hidden?"Unhide":"Hide"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
