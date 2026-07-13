import { useState, useEffect } from "react";
import { API } from "./shared";


export default function MyReviews({ token }) {
  const [reviews, setReviews] = useState(null);
  const [stats,   setStats]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const meRes  = await fetch(`${API}/doctors/my-profile`, { headers:{ Authorization:`Bearer ${token}` }});
        const me     = await meRes.json();
        setStats({ rating: me.rating, total_reviews: me.total_reviews });
        if (me.id) {
          const res  = await fetch(`${API}/doctors/${me.id}/reviews`);
          const json = await res.json();
          setReviews(json.reviews || []);
        }
      } catch { setReviews([]); }
    })();
  }, [token]);

  return (
    <div style={{padding:"20px 0"}}>
      {stats && (
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"18px",
          background:"#fffbeb",border:"1px solid #fde68a",borderRadius:"12px",padding:"16px 20px"}}>
          <span style={{fontSize:"28px",fontWeight:"700",color:"#b45309",
            fontFamily:"'Cormorant Garamond',serif"}}>{stats.rating || "—"}</span>
          <div>
            <span style={{color:"#fbbf24",fontSize:"15px"}}>★★★★★</span>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#92400e",margin:"2px 0 0"}}>
              from {stats.total_reviews || 0} review{stats.total_reviews===1?"":"s"}
            </p>
          </div>
        </div>
      )}
      {reviews === null ? (
        <div style={{textAlign:"center",padding:"40px"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",borderTop:"3px solid #0369a1",
            borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : reviews.length === 0 ? (
        <div style={{padding:"40px 20px",textAlign:"center",background:"#fff",
          borderRadius:"14px",border:"1px solid #e2eaf4"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"14px"}}>
            No reviews yet — they'll show up here once patients start leaving them after
            completed appointments.
          </p>
        </div>
      ) : reviews.map(r => (
        <div key={r.id} className="appt-row" style={{marginBottom:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
            <span style={{color:"#fbbf24",fontSize:"14px"}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
              {r.patient_name} · {new Date(r.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
            </span>
          </div>
          {r.review_text && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
            color:"#1e293b",margin:0}}>{r.review_text}</p>}
        </div>
      ))}
    </div>
  );
}
