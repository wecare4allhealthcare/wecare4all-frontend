/**
 * patient/HomeBookings.jsx — Patient views their home healthcare bookings
 */
import { useEffect, useState } from "react";
import { showToast } from "../../components/Toast";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.hb{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.hb *{box-sizing:border-box;} .hb a{text-decoration:none;}
.hb h1,.hb h2{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.bk-card{background:#fff;border:1px solid #e2eaf4;border-radius:13px;
  padding:16px;margin-bottom:12px;transition:all .22s;}
.bk-card:hover{box-shadow:0 6px 20px rgba(11,31,58,.08);}
`;

const BOOKING_STATUS = {
  pending:   {bg:"#fef9c3",color:"#854d0e",label:"⏳ Pending"},
  confirmed: {bg:"#dcfce7",color:"#15803d",label:"✅ Confirmed"},
  completed: {bg:"#dbeafe",color:"#1e40af",label:"✔️ Completed"},
  cancelled: {bg:"#fee2e2",color:"#991b1b",label:"❌ Cancelled"},
};

export default function HomeBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    document.title = "My Home Visits — We Care 4 'all'";
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/home-healthcare/bookings/my`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json  = await res.json();
      setBookings(json.bookings || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this home visit booking?")) return;
    try {
      const token = localStorage.getItem("wc4a_token");
      await fetch(`${API}/home-healthcare/bookings/${id}/cancel`,
        { method:"PUT", headers:{ Authorization:`Bearer ${token}` }});
      fetchBookings();
    } catch { showToast("Failed. Call 90257 86467", "error"); }
  };

  return (
    <div className="hb">
      <style>{G}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",
        padding:"20px 16px 24px"}}>
        <div style={{maxWidth:"720px",margin:"0 auto",
          display:"flex",justifyContent:"space-between",
          alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.5)",marginBottom:"3px",
              textTransform:"uppercase",letterSpacing:"1px"}}>
              Patient Portal
            </p>
            <h1 style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:"700",
              color:"#fff",margin:0}}>
              My Home Visits
            </h1>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <Link to="/home-healthcare"
              style={{padding:"9px 16px",borderRadius:"8px",
                background:"linear-gradient(135deg,#047857,#059669)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"600",fontSize:"13px"}}>
              + Book New
            </Link>
            <Link to="/patient/dashboard"
              style={{padding:"9px 16px",borderRadius:"8px",
                background:"rgba(255,255,255,.12)",
                border:"1px solid rgba(255,255,255,.22)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"500",fontSize:"13px"}}>
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div style={{maxWidth:"720px",margin:"0 auto",padding:"20px 14px 40px"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:"60px 0"}}>
            <div style={{width:"32px",height:"32px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #047857",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",
              fontSize:"14px"}}>Loading bookings…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px 20px",
            background:"#fff",borderRadius:"16px",border:"1px solid #e2eaf4"}}>
            <div style={{fontSize:"44px",marginBottom:"14px"}}>🏠</div>
            <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",
              marginBottom:"8px"}}>No Home Visits Yet</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              color:"#64748b",marginBottom:"20px"}}>
              Book a nurse, physiotherapist or lab technician at home.
            </p>
            <Link to="/home-healthcare"
              style={{padding:"12px 24px",borderRadius:"9px",
                background:"linear-gradient(135deg,#047857,#059669)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"600",fontSize:"14px"}}>
              Browse Services →
            </Link>
          </div>
        ) : bookings.map(b => {
          const s   = BOOKING_STATUS[b.booking_status]||BOOKING_STATUS.pending;
          const svc = b.home_healthcare_services;
          const canCancel = ["pending","confirmed"].includes(b.booking_status);
          return (
            <div key={b.id} className="bk-card">
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"flex-start",marginBottom:"10px",
                flexWrap:"wrap",gap:"8px"}}>
                <div>
                  <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",
                    fontWeight:"700",color:"#0b1f3a",margin:"0 0 3px"}}>
                    {svc?.name || "Home Visit"}
                  </h3>
                  {svc?.description && (
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      color:"#94a3b8",margin:0}}>{svc.description}</p>
                  )}
                </div>
                <span style={{background:s.bg,color:s.color,fontSize:"11px",
                  fontWeight:"700",padding:"3px 10px",borderRadius:"50px",
                  fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
                  {s.label}
                </span>
              </div>

              {/* Details grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",
                gap:"6px",padding:"10px",background:"#f8fafc",
                borderRadius:"8px",marginBottom:"10px"}}>
                {[["📅","Date",new Date(b.booking_date).toLocaleDateString("en-IN",
                    {day:"numeric",month:"short",year:"numeric"})],
                  ["🕐","Time",b.time_slot||"—"],
                  ["📍","Address",b.visit_address||"—"],
                  ["💰","Price",b.calculated_price
                    ?`₹${parseFloat(b.calculated_price).toLocaleString("en-IN")}`
                    :"—"],
                ].map(([ic,lbl,val])=>(
                  <div key={lbl}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                      color:"#94a3b8",margin:"0 0 1px"}}>{ic} {lbl}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      fontWeight:"600",color:"#374151",margin:0,
                      overflow:"hidden",textOverflow:"ellipsis",
                      whiteSpace:"nowrap"}}>{val}</p>
                  </div>
                ))}
              </div>

              {b.staff_assigned && (
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#15803d",marginBottom:"8px",padding:"7px 10px",
                  background:"#f0fdf4",borderRadius:"7px",margin:"0 0 10px"}}>
                  👤 Staff: {b.staff_assigned}
                </p>
              )}

              {b.notes && (
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#64748b",fontStyle:"italic",marginBottom:"10px",
                  padding:"7px 10px",background:"#f8fafc",borderRadius:"7px"}}>
                  "{b.notes}"
                </p>
              )}

              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {canCancel && (
                  <button onClick={()=>handleCancel(b.id)}
                    style={{padding:"8px 16px",borderRadius:"8px",
                      border:"1.5px solid #fecaca",background:"#fff",
                      color:"#dc2626",fontFamily:"'DM Sans',sans-serif",
                      fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                    Cancel Visit
                  </button>
                )}
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#94a3b8",alignSelf:"center"}}>
                  #{b.id?.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
