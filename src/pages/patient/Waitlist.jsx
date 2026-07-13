/**
 * patient/Waitlist.jsx — view and manage waitlist entries.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.wl{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.wl *{box-sizing:border-box;} .wl a{text-decoration:none;}
.wl h1,.wl h2{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.wl-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;padding:16px;margin-bottom:10px;}
`;

const STATUS_META = {
  waiting:  { label:"Waiting", bg:"#fffbeb", color:"#92400e" },
  notified: { label:"Slot Available!", bg:"#f0fdf4", color:"#15803d" },
};

export default function Waitlist() {
  const [list, setList] = useState(null);
  const token = localStorage.getItem("wc4a_token");

  const fetchList = async () => {
    try {
      const res  = await fetch(`${API}/waitlist/my`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setList(json.waitlist || []);
    } catch { setList([]); }
  };
  useEffect(() => { document.title = "My Waitlist — We Care 4 'all'"; fetchList(); }, []);

  const leave = async (id) => {
    if (!window.confirm("Leave this waitlist?")) return;
    try {
      await fetch(`${API}/waitlist/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
      fetchList();
    } catch {}
  };

  return (
    <div className="wl">
      <style>{G}</style>
      <div style={{maxWidth:"640px",margin:"0 auto",padding:"20px 16px 60px"}}>
        <Link to="/patient/dashboard" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b"}}>← Back to Dashboard</Link>
        <h1 style={{fontSize:"28px",fontWeight:"700",color:"#0b1f3a",margin:"6px 0 4px"}}>My Waitlist</h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"18px"}}>
          You'll get notified the moment a slot opens up on one of these dates.
        </p>

        {list===null ? (
          <div style={{textAlign:"center",padding:"30px"}}>
            <div style={{width:"24px",height:"24px",border:"3px solid #e2eaf4",borderTop:"3px solid #047857",
              borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
          </div>
        ) : list.length===0 ? (
          <div className="wl-card" style={{textAlign:"center",padding:"30px",color:"#6b7688"}}>
            You're not on any waitlists right now.
            <br/><Link to="/doctors" style={{color:"#047857",fontWeight:"600"}}>Find a doctor →</Link>
          </div>
        ) : list.map(w => {
          const meta = STATUS_META[w.status] || STATUS_META.waiting;
          return (
            <div key={w.id} className="wl-card" style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",color:"#0b1f3a",margin:0}}>
                  {w.doctors?.full_name ? w.doctors.full_name : "Doctor"}
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",margin:"3px 0 6px"}}>
                  {w.doctors?.specialization} · {new Date(w.preferred_date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
                </p>
                <span style={{display:"inline-block",padding:"3px 10px",borderRadius:"50px",
                  background:meta.bg,color:meta.color,fontFamily:"'DM Sans',sans-serif",
                  fontSize:"11px",fontWeight:"700"}}>{meta.label}</span>
              </div>
              <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                {w.status==="notified" &&
                  <Link to="/doctors" style={{padding:"7px 14px",borderRadius:"7px",
                    background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                    fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px"}}>
                    Book Now
                  </Link>}
                <button onClick={()=>leave(w.id)} style={{padding:"7px 14px",borderRadius:"7px",
                  background:"#fef2f2",border:"1px solid #fecaca",color:"#991b1b",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                  Leave
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
