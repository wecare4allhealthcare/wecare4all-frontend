/**
 * doctor/Dashboard.jsx — Fix 4: Mobile Responsive
 * CHANGES:
 * - Stats: 2x2 grid on mobile (was 4-col which broke on small screens)
 * - Tab buttons: scrollable row on mobile, no wrapping/overflow
 * - Appointment rows: stack vertically on mobile
 * - Header: compact on mobile
 * - Padding: 16px on mobile, 24px on desktop
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.dd{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.dd *{box-sizing:border-box;} .dd a{text-decoration:none;}
.dd h1,.dd h2,.dd h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}

/* Stat cards — 2x2 on mobile, 4-col on desktop */
.dd-stats{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:12px;margin-bottom:20px;
}
@media(min-width:600px){
  .dd-stats{grid-template-columns:repeat(4,1fr);}
}
.dd-stat{background:#fff;border:1px solid #e2eaf4;border-radius:12px;
  padding:14px 12px;text-align:center;}

/* Tabs — horizontal scroll on mobile */
.dd-tabs{
  display:flex;gap:8px;overflow-x:auto;padding-bottom:2px;
  -ms-overflow-style:none;scrollbar-width:none;
}
.dd-tabs::-webkit-scrollbar{display:none;}
.tab-btn{
  padding:8px 16px;border-radius:9px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:13px;
  font-weight:600;cursor:pointer;transition:all .2s;color:#64748b;
  white-space:nowrap;flex-shrink:0;
}
.tab-btn.active{background:#0369a1;border-color:#0369a1;color:#fff;}

/* Appointment row */
.appt-row{background:#fff;border:1px solid #e2eaf4;border-radius:12px;
  padding:14px;transition:all .22s;margin-bottom:10px;}
.appt-row:hover{box-shadow:0 6px 20px rgba(11,31,58,.09);}

/* Row inner — stack on mobile */
.appt-inner{display:flex;justify-content:space-between;
  align-items:flex-start;gap:10px;flex-wrap:wrap;}
.appt-meta{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px;}
`;

const STATUS_STYLES = {
  pending:   {bg:"#fef9c3",color:"#854d0e",label:"⏳ Pending"},
  approved:  {bg:"#dcfce7",color:"#15803d",label:"✅ Confirmed"},
  completed: {bg:"#dbeafe",color:"#1e40af",label:"✔️ Completed"},
  cancelled: {bg:"#fee2e2",color:"#991b1b",label:"❌ Cancelled"},
};
const TYPE_LABELS = {
  video:"🎥 Video", inperson:"🏥 In-Person", home:"🏠 Home Visit",
};

function CreateVideoBtn({ appointmentId, token }) {
  const [loading, setLoading] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");

  const create = async () => {
    setLoading(true);
    try {
      const res  = await fetch(
        `${API}/video/create-session?appointment_id=${appointmentId}`,
        { method:"POST", headers:{ Authorization:`Bearer ${token}` } }
      );
      const json = await res.json();
      if (res.ok) setRoomUrl(json.join_url);
      else alert(json.detail || "Failed to create room");
    } catch { alert("Error creating video room"); }
    finally { setLoading(false); }
  };

  if (roomUrl) return (
    <a href={roomUrl} target="_blank" rel="noreferrer"
      style={{padding:"6px 12px",borderRadius:"7px",background:"#047857",
        color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
        fontWeight:"600",textDecoration:"none",
        display:"inline-flex",alignItems:"center",gap:"5px"}}>
      🎥 Join Room
    </a>
  );
  return (
    <button onClick={create} disabled={loading}
      style={{padding:"6px 12px",borderRadius:"7px",background:"#0369a1",
        color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
        fontWeight:"600",border:"none",cursor:"pointer",opacity:loading?0.7:1}}>
      {loading ? "Creating…" : "🎥 Create Room"}
    </button>
  );
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const token            = localStorage.getItem("wc4a_token");
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState("today");

  useEffect(() => {
    document.title = "Doctor Panel — We Care 4 'all'";
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/appointments/doctor`,
        { headers:{ Authorization:`Bearer ${token}` } });
      const json = await res.json();
      setAppointments(json.appointments || []);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayAppts    = appointments.filter(a => a.appointment_date===today && a.status!=="cancelled");
  const upcomingAppts = appointments.filter(a => a.appointment_date>today  && a.status!=="cancelled");
  const pastAppts     = appointments.filter(a => a.appointment_date<today  || a.status==="cancelled");
  const displayed     = tab==="today" ? todayAppts : tab==="upcoming" ? upcomingAppts : pastAppts;

  const STATS = [
    { label:"Today",    value:todayAppts.length,    icon:"📅", color:"#047857" },
    { label:"Upcoming", value:upcomingAppts.length, icon:"⏰", color:"#0369a1" },
    { label:"Completed",value:appointments.filter(a=>a.status==="completed").length, icon:"✅", color:"#7c3aed" },
    { label:"Total",    value:appointments.length,  icon:"📋", color:"#b45309" },
  ];

  return (
    <div className="dd">
      <style>{G}</style>

      {/* ── Header ── */}
      <div style={{
        background:"linear-gradient(135deg,#0369a1,#0284c7)",
        padding:"clamp(16px,3vw,28px) clamp(14px,3vw,24px)",
      }}>
        <div style={{maxWidth:"1100px",margin:"0 auto",
          display:"flex",justifyContent:"space-between",
          alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.6)",marginBottom:"3px",
              textTransform:"uppercase",letterSpacing:"1px"}}>
              Doctor Panel
            </p>
            <h1 style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:"700",
              color:"#fff",margin:0}}>
              Dr. {user?.name||user?.email||"Doctor"}
            </h1>
          </div>
          <button onClick={()=>{logout();navigate("/");}} style={{
            padding:"8px 16px",borderRadius:"8px",
            background:"rgba(255,255,255,.15)",
            border:"1px solid rgba(255,255,255,.25)",
            color:"#fff",fontFamily:"'DM Sans',sans-serif",
            fontSize:"13px",cursor:"pointer",whiteSpace:"nowrap",
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{maxWidth:"1100px",margin:"0 auto",
        padding:"clamp(14px,3vw,28px) clamp(12px,3vw,24px)"}}>

        {/* Stats — 2x2 on mobile, 4-col on desktop */}
        <div className="dd-stats">
          {STATS.map(({ label, value, icon, color }) => (
            <div key={label} className="dd-stat">
              <div style={{fontSize:"20px",marginBottom:"5px"}}>{icon}</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",
                fontSize:"clamp(22px,4vw,30px)",fontWeight:"700",
                color,margin:"0 0 2px",lineHeight:1}}>
                {value}
              </p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                color:"#94a3b8",margin:0}}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div>
          {/* Title + Tabs */}
          <div style={{marginBottom:"14px"}}>
            <h2 style={{fontSize:"clamp(18px,3vw,22px)",fontWeight:"700",
              color:"#0b1f3a",margin:"0 0 12px"}}>
              Patient Appointments
            </h2>
            {/* Scrollable tabs — no overflow on mobile */}
            <div className="dd-tabs">
              {[
                ["today",    `Today (${todayAppts.length})`],
                ["upcoming", `Upcoming (${upcomingAppts.length})`],
                ["past",     `Past (${pastAppts.length})`],
              ].map(([t,l]) => (
                <button key={t} onClick={()=>setTab(t)}
                  className={`tab-btn${tab===t?" active":""}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{padding:"50px 0",textAlign:"center"}}>
              <div style={{width:"32px",height:"32px",
                border:"3px solid #e2eaf4",
                borderTop:"3px solid #0369a1",
                borderRadius:"50%",
                animation:"spin .8s linear infinite",
                margin:"0 auto 12px"}}/>
              <p style={{fontFamily:"'DM Sans',sans-serif",
                color:"#94a3b8",fontSize:"14px"}}>
                Loading appointments…
              </p>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{padding:"50px 20px",textAlign:"center",
              background:"#fff",borderRadius:"14px",border:"1px solid #e2eaf4"}}>
              <div style={{fontSize:"40px",marginBottom:"12px"}}>📋</div>
              <h3 style={{fontSize:"18px",fontWeight:"700",
                color:"#0b1f3a",marginBottom:"6px"}}>
                No Appointments
              </h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",
                fontSize:"14px",color:"#64748b"}}>
                No {tab} appointments found.
              </p>
            </div>
          ) : (
            <div>
              {displayed.map(appt => {
                const s = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
                return (
                  <div key={appt.id} className="appt-row">
                    <div className="appt-inner">
                      {/* Left — patient info */}
                      <div style={{flex:1,minWidth:0}}>
                        {/* Name + status badges */}
                        <div style={{display:"flex",alignItems:"center",
                          gap:"8px",flexWrap:"wrap",marginBottom:"6px"}}>
                          <h3 style={{fontSize:"15px",fontWeight:"700",
                            color:"#0b1f3a",margin:0}}>
                            {appt.patient_name}
                          </h3>
                          <span style={{background:s.bg,color:s.color,
                            fontSize:"11px",fontWeight:"700",
                            padding:"2px 9px",borderRadius:"50px",
                            fontFamily:"'DM Sans',sans-serif"}}>
                            {s.label}
                          </span>
                          <span style={{fontFamily:"'DM Sans',sans-serif",
                            fontSize:"11px",color:"#94a3b8"}}>
                            {TYPE_LABELS[appt.appointment_type]||appt.appointment_type}
                          </span>
                        </div>

                        {/* Meta info */}
                        <div className="appt-meta">
                          {[
                            ["📅", new Date(appt.appointment_date).toLocaleDateString("en-IN",
                              {day:"numeric",month:"short",year:"numeric"})],
                            ["🕐", appt.appointment_time?.slice(0,5)||""],
                            ["📱", appt.patient_mobile||""],
                            appt.patient_age && ["👤", `${appt.patient_age}y`],
                          ].filter(Boolean).map(([ic,val]) => (
                            <span key={ic} style={{fontFamily:"'DM Sans',sans-serif",
                              fontSize:"12px",color:"#64748b"}}>
                              {ic} {val}
                            </span>
                          ))}
                        </div>

                        {appt.symptoms && (
                          <p style={{fontFamily:"'DM Sans',sans-serif",
                            fontSize:"12px",color:"#94a3b8",
                            fontStyle:"italic",margin:"6px 0 0",
                            overflow:"hidden",textOverflow:"ellipsis",
                            display:"-webkit-box",WebkitLineClamp:2,
                            WebkitBoxOrient:"vertical"}}>
                            "{appt.symptoms}"
                          </p>
                        )}
                      </div>

                      {/* Right — fee + actions */}
                      <div style={{flexShrink:0,textAlign:"right",
                        display:"flex",flexDirection:"column",
                        gap:"6px",alignItems:"flex-end"}}>
                        <p style={{fontFamily:"'DM Sans',sans-serif",
                          fontSize:"13px",fontWeight:"700",
                          color:"#047857",margin:0}}>
                          {appt.payment_amount ? `₹${appt.payment_amount}` : "Free"}
                        </p>
                        <p style={{fontFamily:"'DM Sans',sans-serif",
                          fontSize:"11px",color:"#94a3b8",margin:0}}>
                          #{appt.id}
                        </p>
                        {appt.status==="approved" &&
                          appt.appointment_type==="video" && (
                            <CreateVideoBtn
                              appointmentId={appt.id}
                              token={token}
                            />
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
