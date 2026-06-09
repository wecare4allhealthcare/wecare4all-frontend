/**
 * doctor/Dashboard.jsx — Doctor Dashboard
 * Shows assigned appointments, patient details
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.dd{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.dd *{box-sizing:border-box;} .dd a{text-decoration:none;}
.dd h1,.dd h2,.dd h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.appt-row{background:#fff;border:1px solid #e2eaf4;border-radius:12px;
  padding:16px 18px;transition:all .22s;}
.appt-row:hover{box-shadow:0 6px 20px rgba(11,31,58,.09);transform:translateY(-2px);}
.tab-btn{padding:9px 20px;border-radius:9px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:13px;
  font-weight:600;cursor:pointer;transition:all .2s;color:#64748b;}
.tab-btn.active{background:#0369a1;border-color:#0369a1;color:#fff;}
`;
const STATUS_STYLES = {
  pending:   {bg:"#fef9c3",color:"#854d0e",label:"⏳ Pending"},
  approved:  {bg:"#dcfce7",color:"#15803d",label:"✅ Confirmed"},
  completed: {bg:"#dbeafe",color:"#1e40af",label:"✔️ Completed"},
  cancelled: {bg:"#fee2e2",color:"#991b1b",label:"❌ Cancelled"},
};
const TYPE_LABELS = {video:"🎥 Video",inperson:"🏥 In-Person",home:"🏠 Home Visit"};


function CreateVideoBtn({ appointmentId, token }) {
  const [loading, setLoading] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");
  const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

  const create = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/video/create-session?appointment_id=${appointmentId}`,{
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setRoomUrl(json.join_url);
      else alert(json.detail || "Failed to create room");
    } catch { alert("Error creating video room"); }
    finally { setLoading(false); }
  };

  if (roomUrl) return (
    <a href={roomUrl} target="_blank" rel="noreferrer"
      style={{padding:"6px 12px",borderRadius:"7px",background:"#047857",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",textDecoration:"none",
        display:"inline-flex",alignItems:"center",gap:"5px"}}>
      🎥 Join Room
    </a>
  );

  return (
    <button onClick={create} disabled={loading}
      style={{padding:"6px 12px",borderRadius:"7px",background:"#0369a1",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",
        border:"none",cursor:"pointer",opacity:loading?0.7:1}}>
      {loading ? "Creating…" : "🎥 Create Room"}
    </button>
  );
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("today");

  useEffect(() => {
    document.title = "Doctor Panel — We Care 4 'all'";
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/appointments/doctor`,{headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      setAppointments(json.appointments||[]);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  const today = new Date().toISOString().split("T")[0];
  const todayAppts    = appointments.filter(a=>a.appointment_date===today&&a.status!=="cancelled");
  const upcomingAppts = appointments.filter(a=>a.appointment_date>today&&a.status!=="cancelled");
  const pastAppts     = appointments.filter(a=>a.appointment_date<today||a.status==="cancelled");
  const displayed = tab==="today"?todayAppts:tab==="upcoming"?upcomingAppts:pastAppts;

  const STATS = [
    {label:"Today",     value:todayAppts.length,    icon:"📅",color:"#047857"},
    {label:"Upcoming",  value:upcomingAppts.length, icon:"⏰",color:"#0369a1"},
    {label:"Completed", value:appointments.filter(a=>a.status==="completed").length,icon:"✅",color:"#7c3aed"},
    {label:"Total",     value:appointments.length,  icon:"📋",color:"#b45309"},
  ];

  return (
    <div className="dd">
      <style>{G}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0369a1,#0284c7)",padding:"28px 24px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"14px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"rgba(255,255,255,.6)",marginBottom:"4px"}}>Doctor Panel</p>
            <h1 style={{fontSize:"clamp(20px,3vw,28px)",fontWeight:"700",color:"#fff",margin:0}}>Dr. {user?.name||user?.email||"Doctor"}</h1>
          </div>
          <button onClick={()=>{logout();navigate("/");}} style={{padding:"9px 18px",borderRadius:"8px",background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",cursor:"pointer"}}>Logout</button>
        </div>
      </div>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"28px 24px"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px",marginBottom:"28px"}}>
          {STATS.map(({label,value,icon,color})=>(
            <div key={label} style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"13px",padding:"18px 20px",textAlign:"center"}}>
              <div style={{fontSize:"22px",marginBottom:"6px"}}>{icon}</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",fontWeight:"700",color,margin:"0 0 3px",lineHeight:1}}>{value}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8",margin:0}}>{label}</p>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
            <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>Patient Appointments</h2>
            <div style={{display:"flex",gap:"8px"}}>
              {[["today",`Today (${todayAppts.length})`],["upcoming",`Upcoming (${upcomingAppts.length})`],["past",`Past (${pastAppts.length})`]].map(([t,l])=>(
                <button key={t} onClick={()=>setTab(t)} className={`tab-btn${tab===t?" active":""}`}>{l}</button>
              ))}
            </div>
          </div>

          {loading?(
            <div style={{padding:"60px 0",textAlign:"center"}}>
              <div style={{width:"32px",height:"32px",border:"3px solid #e2eaf4",borderTop:"3px solid #0369a1",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"14px"}}>Loading appointments…</p>
            </div>
          ):displayed.length===0?(
            <div style={{padding:"60px 24px",textAlign:"center",background:"#fff",borderRadius:"16px",border:"1px solid #e2eaf4"}}>
              <div style={{fontSize:"44px",marginBottom:"14px"}}>📋</div>
              <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>No Appointments</h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b"}}>No {tab} appointments found.</p>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {displayed.map(appt=>{
                const s=STATUS_STYLES[appt.status]||STATUS_STYLES.pending;
                return(
                  <div key={appt.id} className="appt-row">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px",flexWrap:"wrap"}}>
                          <h3 style={{fontSize:"16px",fontWeight:"700",color:"#0b1f3a",margin:0}}>{appt.patient_name}</h3>
                          <span style={{background:s.bg,color:s.color,fontSize:"11px",fontWeight:"700",padding:"3px 10px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>{s.label}</span>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>{TYPE_LABELS[appt.appointment_type]||appt.appointment_type}</span>
                        </div>
                        <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
                          {[["📅",new Date(appt.appointment_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})],
                            ["🕐",appt.appointment_time?.slice(0,5)||""],
                            ["📱",appt.patient_mobile||""],
                            ["✉️",appt.patient_email||""],
                            appt.patient_age&&["👤",`${appt.patient_age}y${appt.patient_gender?`, ${appt.patient_gender}`:""}` ],
                          ].filter(Boolean).map(([ic,val])=>(
                            <span key={ic} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>{ic} {val}</span>
                          ))}
                        </div>
                        {appt.symptoms&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8",fontStyle:"italic",marginTop:"6px",margin:"6px 0 0"}}>Symptoms: {appt.symptoms}</p>}
                      </div>
                      <div style={{flexShrink:0,textAlign:"right"}}>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:"#047857",margin:0}}>
                          {appt.payment_amount?`₹${appt.payment_amount}`:"Free"}
                        </p>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#94a3b8",margin:"3px 0 0"}}>#{appt.id}</p>
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
