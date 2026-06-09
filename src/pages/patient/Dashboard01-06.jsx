/**
 * patient/Dashboard.jsx — Patient Dashboard
 * Shows: upcoming appointments, past appointments, quick actions
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.pd{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.pd *{box-sizing:border-box;} .pd a{text-decoration:none;}
.pd h1,.pd h2,.pd h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:32px;height:32px;border:3px solid #e2eaf4;border-top:3px solid #047857;
  border-radius:50%;animation:spin .8s linear infinite;margin:0 auto;}
.appt-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;
  padding:18px 20px;transition:all .25s;box-shadow:0 2px 8px rgba(11,31,58,.05);}
.appt-card:hover{box-shadow:0 8px 24px rgba(11,31,58,.10);transform:translateY(-2px);}
.stat-card{background:#fff;border:1px solid #e2eaf4;border-radius:13px;padding:18px 20px;text-align:center;}
.tab-btn{padding:9px 20px;border-radius:9px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
  cursor:pointer;transition:all .2s;color:#64748b;}
.tab-btn.active{background:#0b1f3a;border-color:#0b1f3a;color:#fff;}
.quick-btn{display:flex;flex-direction:column;align-items:center;gap:8px;
  padding:18px 14px;background:#fff;border:1.5px solid #e2eaf4;border-radius:13px;
  cursor:pointer;transition:all .25s;text-decoration:none;}
.quick-btn:hover{border-color:#047857;background:#f0fdf4;transform:translateY(-3px);}
@media(max-width:700px){.stat-grid{grid-template-columns:1fr 1fr!important;}}
`;

const STATUS_STYLES = {
  pending:   { bg:"#fef9c3", color:"#854d0e", label:"⏳ Pending"  },
  approved:  { bg:"#dcfce7", color:"#15803d", label:"✅ Confirmed" },
  completed: { bg:"#dbeafe", color:"#1e40af", label:"✔️ Completed" },
  cancelled: { bg:"#fee2e2", color:"#991b1b", label:"❌ Cancelled" },
};
const TYPE_LABELS = {
  video:"🎥 Video Consultation", inperson:"🏥 In-Person", home:"🏠 Home Visit",
};

function AppointmentCard({ appt, onCancel }) {
  const s = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
  const isPast = new Date(appt.appointment_date) < new Date();
  const canCancel = ["pending","approved"].includes(appt.status) && !isPast;
  const doc = appt.doctors;
  return (
    <div className="appt-card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
        <div>
          <h3 style={{fontSize:"17px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 2px"}}>{doc?.full_name||"Doctor"}</h3>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#047857",fontWeight:"600",margin:0}}>{doc?.specialization||"Specialist"}</p>
        </div>
        <span style={{background:s.bg,color:s.color,fontSize:"12px",fontWeight:"700",padding:"4px 12px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{s.label}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",padding:"12px",background:"#f8fafc",borderRadius:"9px",marginBottom:"12px"}}>
        {[["📅 Date", new Date(appt.appointment_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})],
          ["🕐 Time", appt.appointment_time?.slice(0,5)||""],
          ["📋 Type", TYPE_LABELS[appt.appointment_type]||appt.appointment_type],
          ["💰 Fee",  appt.payment_amount?`₹${appt.payment_amount}`:"Free"]
        ].map(([l,v])=>(
          <div key={l}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#94a3b8",margin:"0 0 2px"}}>{l}</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",color:"#0b1f3a",margin:0}}>{v}</p>
          </div>
        ))}
      </div>
      {appt.symptoms&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",fontStyle:"italic",marginBottom:"12px",padding:"8px 12px",background:"#f8fafc",borderRadius:"8px"}}>"{appt.symptoms}"</p>}
      {appt.admin_notes&&<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"8px",padding:"10px 12px",marginBottom:"12px"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#15803d",margin:"0 0 2px"}}>Admin Note:</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",margin:0}}>{appt.admin_notes}</p>
      </div>}
      {/* Action buttons row */}
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginTop:"4px"}}>
        {/* Pay button — shown when approved and unpaid */}
        {appt.status==="approved" && appt.payment_amount > 0 && appt.payment_status!=="paid" && !isPast &&
          <a href={`/patient/payment/${appt.id}`} style={{padding:"9px 18px",borderRadius:"8px",background:"linear-gradient(135deg,#d97706,#b45309)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"6px"}}>
            💳 Pay ₹{appt.payment_amount}
          </a>}
        {/* Join Video button — shown when approved and payment done (or free) */}
        {appt.status==="approved" && !isPast &&
          (appt.payment_status==="paid" || !appt.payment_amount) &&
          appt.appointment_type==="video" &&
          <a href={`/patient/video/${appt.id}`} style={{padding:"9px 18px",borderRadius:"8px",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"6px"}}>
            🎥 Join Video Call
          </a>}
        {/* Paid badge */}
        {appt.payment_status==="paid" &&
          <span style={{padding:"9px 14px",borderRadius:"8px",background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px"}}>
            ✅ Paid
          </span>}
        {/* Cancel button */}
        {canCancel&&<button onClick={()=>onCancel(appt.id)} style={{padding:"9px 18px",borderRadius:"8px",border:"1.5px solid #fecaca",background:"#fff",color:"#dc2626",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
          onMouseLeave={e=>e.currentTarget.style.background="#fff"}>Cancel</button>}
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    document.title = "My Dashboard — We Care 4 'all'";
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/appointments/my`,{headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      setAppointments(json.appointments||[]);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/appointments/${id}/cancel`,{method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      if (res.ok) fetchAppointments();
      else alert("Failed to cancel. Please call 90257 86467");
    } catch { alert("Error cancelling. Please try again."); }
  };

  const now = new Date();
  const upcoming = appointments.filter(a=>new Date(a.appointment_date)>=now&&a.status!=="cancelled");
  const past     = appointments.filter(a=>new Date(a.appointment_date)<now||a.status==="cancelled");
  const displayed = tab==="upcoming"?upcoming:past;

  const STATS = [
    {label:"Total Visits",value:appointments.length,          icon:"📋",color:"#0369a1"},
    {label:"Upcoming",    value:upcoming.length,               icon:"📅",color:"#047857"},
    {label:"Completed",   value:appointments.filter(a=>a.status==="completed").length,icon:"✅",color:"#7c3aed"},
    {label:"Cancelled",   value:appointments.filter(a=>a.status==="cancelled").length,icon:"❌",color:"#be123c"},
  ];

  return (
    <div className="pd">
      <style>{G}</style>
      {/* Top Bar */}
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"28px 24px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"14px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"rgba(255,255,255,.5)",marginBottom:"4px"}}>Welcome back</p>
            <h1 style={{fontSize:"clamp(22px,3vw,30px)",fontWeight:"700",color:"#fff",margin:0}}>{user?.name||user?.email||"Patient"}</h1>
          </div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            <Link to="/doctors" style={{padding:"9px 18px",borderRadius:"8px",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px"}}>+ Book Appointment</Link>
            <Link to="/patient/profile" style={{padding:"9px 18px",borderRadius:"8px",background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.20)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"500",fontSize:"13px"}}>My Profile</Link>
            <button onClick={()=>{logout();navigate("/");}} style={{padding:"9px 16px",borderRadius:"8px",background:"transparent",border:"1px solid rgba(255,255,255,.20)",color:"rgba(255,255,255,.65)",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",cursor:"pointer"}}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"28px 24px"}}>
        {/* Stats */}
        <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px",marginBottom:"28px"}}>
          {STATS.map(({label,value,icon,color})=>(
            <div key={label} className="stat-card">
              <div style={{fontSize:"22px",marginBottom:"6px"}}>{icon}</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",fontWeight:"700",color,margin:"0 0 3px",lineHeight:1}}>{value}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8",margin:0}}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{marginBottom:"28px"}}>
          <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"14px"}}>Quick Actions</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:"12px"}}>
            {[{to:"/doctors",icon:"🔍",label:"Find Doctor"},
              {to:"/doctors?type=video",icon:"🎥",label:"Video Consult"},
              {to:"/doctors?type=home",icon:"🏠",label:"Home Visit"},
              {to:"/patient/profile",icon:"👤",label:"My Profile"},
              {to:"/contact",icon:"📞",label:"Get Help"},
              {to:"/healthcare-provider",icon:"💊",label:"Our Services"},
            ].map(({to,icon,label})=>(
              <Link key={label} to={to} className="quick-btn">
                <span style={{fontSize:"24px"}}>{icon}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",textAlign:"center"}}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Appointments */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
            <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>My Appointments</h2>
            <div style={{display:"flex",gap:"8px"}}>
              {["upcoming","past"].map(t=>(
                <button key={t} onClick={()=>setTab(t)} className={`tab-btn${tab===t?" active":""}`}>
                  {t==="upcoming"?`Upcoming (${upcoming.length})`:`Past (${past.length})`}
                </button>
              ))}
            </div>
          </div>

          {loading?(
            <div style={{padding:"60px 0",textAlign:"center"}}><div className="spin"/>
              <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",marginTop:"12px",fontSize:"14px"}}>Loading appointments…</p>
            </div>
          ):displayed.length===0?(
            <div style={{padding:"60px 24px",textAlign:"center",background:"#fff",borderRadius:"16px",border:"1px solid #e2eaf4"}}>
              <div style={{fontSize:"44px",marginBottom:"14px"}}>📅</div>
              <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>
                {tab==="upcoming"?"No Upcoming Appointments":"No Past Appointments"}
              </h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",marginBottom:"20px"}}>
                {tab==="upcoming"?"Book your first consultation today.":"Your completed visits will appear here."}
              </p>
              {tab==="upcoming"&&<Link to="/doctors" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",padding:"12px 24px",borderRadius:"8px"}}>Find a Doctor →</Link>}
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              {displayed.map(appt=><AppointmentCard key={appt.id} appt={appt} onCancel={cancelAppointment}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
