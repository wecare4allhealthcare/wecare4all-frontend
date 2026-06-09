/**
 * patient/Dashboard.jsx — Phase C Update
 * ADDED:
 * 1. Mobile responsive (2-col stats on mobile)
 * 2. View prescription/doctor notes on completed appointments
 * 3. Re-book button on past appointments
 * 4. Payment history link
 * 5. Better quick actions
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
  padding:16px;transition:all .25s;box-shadow:0 2px 8px rgba(11,31,58,.05);}
.appt-card:hover{box-shadow:0 8px 24px rgba(11,31,58,.10);}
/* Stats — 2 col mobile, 4 col desktop */
.stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:22px;}
@media(min-width:600px){.stat-grid{grid-template-columns:repeat(4,1fr);}}
/* Quick actions — 3 col mobile, auto desktop */
.quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
@media(min-width:500px){.quick-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));}}
.quick-btn{display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:14px 10px;background:#fff;border:1.5px solid #e2eaf4;border-radius:12px;
  text-decoration:none;transition:all .22s;text-align:center;}
.quick-btn:hover{border-color:#047857;background:#f0fdf4;transform:translateY(-2px);}
/* Tabs */
.tab-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;
  -ms-overflow-style:none;scrollbar-width:none;}
.tab-row::-webkit-scrollbar{display:none;}
.tab-btn{padding:8px 18px;border-radius:9px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:13px;
  font-weight:600;cursor:pointer;transition:all .2s;color:#64748b;
  white-space:nowrap;flex-shrink:0;}
.tab-btn.active{background:#0b1f3a;border-color:#0b1f3a;color:#fff;}
/* Action buttons */
.act-btn{padding:8px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;
  font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;
  text-decoration:none;display:inline-flex;align-items:center;gap:5px;border:none;}
`;

const STATUS_STYLES = {
  pending:   {bg:"#fef9c3",color:"#854d0e",label:"⏳ Pending"},
  approved:  {bg:"#dcfce7",color:"#15803d",label:"✅ Confirmed"},
  completed: {bg:"#dbeafe",color:"#1e40af",label:"✔️ Completed"},
  cancelled: {bg:"#fee2e2",color:"#991b1b",label:"❌ Cancelled"},
};
const TYPE_LABELS = {
  video:"🎥 Video Consultation",inperson:"🏥 In-Person",home:"🏠 Home Visit",
};

function PrescriptionModal({ appt, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",width:"100%",maxWidth:"500px",
        borderRadius:"18px 18px 0 0",padding:"22px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Prescription & Notes
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <div style={{background:"#f8fafc",borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
          {[["Doctor",   appt.doctors?.full_name||"Doctor"],
            ["Date",     new Date(appt.appointment_date).toLocaleDateString("en-IN",
                           {day:"numeric",month:"long",year:"numeric"})],
            ["Time",     appt.appointment_time?.slice(0,5)||""],
            ["Type",     TYPE_LABELS[appt.appointment_type]||appt.appointment_type],
          ].map(([l,v])=>(
            <div key={l} style={{display:"flex",gap:"12px",marginBottom:"6px"}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#94a3b8",width:"60px",flexShrink:0}}>{l}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                fontWeight:"600",color:"#0b1f3a"}}>{v}</span>
            </div>
          ))}
        </div>
        {appt.prescription ? (
          <div style={{background:"#f0fdf4",border:"1px solid #86efac",
            borderRadius:"10px",padding:"14px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"#15803d",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"1px"}}>
              Doctor's Notes / Prescription
            </p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              color:"#374151",lineHeight:"1.7",margin:0,whiteSpace:"pre-wrap"}}>
              {appt.prescription}
            </p>
          </div>
        ) : (
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
            color:"#94a3b8",fontStyle:"italic",textAlign:"center",padding:"20px"}}>
            No prescription added yet.
          </p>
        )}
        <button onClick={onClose} style={{width:"100%",marginTop:"16px",
          padding:"12px",borderRadius:"9px",background:"#0b1f3a",
          color:"#fff",border:"none",fontFamily:"'DM Sans',sans-serif",
          fontWeight:"600",fontSize:"14px",cursor:"pointer"}}>
          Close
        </button>
      </div>
    </div>
  );
}

function AppointmentCard({ appt, onCancel, onViewPrescription }) {
  const s      = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
  const isPast = new Date(appt.appointment_date) < new Date();
  const canCancel = ["pending","approved"].includes(appt.status) && !isPast;
  const doc    = appt.doctors;

  return (
    <div className="appt-card">
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"flex-start",marginBottom:"10px",flexWrap:"wrap",gap:"8px"}}>
        <div>
          <h3 style={{fontSize:"16px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 2px"}}>
            {doc?.full_name || "Doctor"}
          </h3>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            color:"#047857",fontWeight:"600",margin:0}}>
            {doc?.specialization || "Specialist"}
          </p>
        </div>
        <span style={{background:s.bg,color:s.color,fontSize:"11px",fontWeight:"700",
          padding:"3px 10px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
          {s.label}
        </span>
      </div>

      {/* Details grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",
        padding:"10px",background:"#f8fafc",borderRadius:"8px",marginBottom:"10px"}}>
        {[["📅",new Date(appt.appointment_date).toLocaleDateString("en-IN",
            {day:"numeric",month:"short",year:"numeric"})],
          ["🕐",appt.appointment_time?.slice(0,5)||""],
          ["📋",TYPE_LABELS[appt.appointment_type]||appt.appointment_type],
          ["💰",appt.payment_amount?`₹${appt.payment_amount}`:"Free"],
        ].map(([ic,v])=>(
          <p key={ic} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            color:"#374151",margin:0,display:"flex",alignItems:"center",gap:"5px"}}>
            <span>{ic}</span><span style={{fontWeight:"600"}}>{v}</span>
          </p>
        ))}
      </div>

      {appt.symptoms &&
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",
          fontStyle:"italic",marginBottom:"10px",padding:"7px 10px",
          background:"#f8fafc",borderRadius:"7px"}}>
          "{appt.symptoms}"
        </p>}

      {appt.admin_notes &&
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",
          borderRadius:"8px",padding:"9px 12px",marginBottom:"10px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
            fontWeight:"700",color:"#15803d",margin:"0 0 2px"}}>Admin Note:</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            color:"#374151",margin:0}}>{appt.admin_notes}</p>
        </div>}

      {/* Actions */}
      <div style={{display:"flex",gap:"7px",flexWrap:"wrap",marginTop:"4px"}}>
        {/* Pay */}
        {appt.status==="approved" && appt.payment_amount>0 &&
          appt.payment_status!=="paid" && !isPast &&
          <Link to={`/patient/payment/${appt.id}`}
            className="act-btn"
            style={{background:"linear-gradient(135deg,#d97706,#b45309)",color:"#fff"}}>
            💳 Pay ₹{appt.payment_amount}
          </Link>}
        {/* Join video */}
        {appt.status==="approved" && !isPast &&
          (appt.payment_status==="paid" || !appt.payment_amount) &&
          appt.appointment_type==="video" &&
          <Link to={`/patient/video/${appt.id}`}
            className="act-btn"
            style={{background:"linear-gradient(135deg,#047857,#059669)",color:"#fff"}}>
            🎥 Join Video
          </Link>}
        {/* Paid badge */}
        {appt.payment_status==="paid" &&
          <span style={{padding:"8px 12px",borderRadius:"8px",background:"#f0fdf4",
            border:"1px solid #86efac",color:"#15803d",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"600",fontSize:"12px"}}>✅ Paid</span>}
        {/* View prescription */}
        {appt.status==="completed" &&
          <button onClick={()=>onViewPrescription(appt)}
            className="act-btn"
            style={{background:"#eff8ff",border:"1.5px solid #93c5fd",color:"#0369a1"}}>
            📋 Prescription
          </button>}
        {/* Re-book */}
        {(appt.status==="completed"||appt.status==="cancelled") && doc &&
          <Link to={`/doctors?rebook=${appt.doctor_id}`}
            className="act-btn"
            style={{background:"#f8fafc",border:"1.5px solid #e2eaf4",color:"#64748b"}}>
            🔄 Re-book
          </Link>}
        {/* Cancel */}
        {canCancel &&
          <button onClick={()=>onCancel(appt.id)}
            className="act-btn"
            style={{background:"#fff",border:"1.5px solid #fecaca",color:"#dc2626"}}>
            Cancel
          </button>}
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState("upcoming");
  const [prescAppt,    setPrescAppt]    = useState(null);

  useEffect(() => {
    document.title = "My Dashboard — We Care 4 'all'";
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/appointments/my`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json  = await res.json();
      setAppointments(json.appointments||[]);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/appointments/${id}/cancel`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      if (res.ok) fetchAppointments();
      else alert("Failed to cancel. Please call 90257 86467");
    } catch { alert("Error. Try again."); }
  };

  const now      = new Date();
  const upcoming = appointments.filter(a =>
    new Date(a.appointment_date) >= now && a.status !== "cancelled");
  const past     = appointments.filter(a =>
    new Date(a.appointment_date) < now || a.status === "cancelled");
  const displayed = tab === "upcoming" ? upcoming : past;

  const STATS = [
    {label:"Total",    value:appointments.length, icon:"📋",color:"#0369a1"},
    {label:"Upcoming", value:upcoming.length,      icon:"📅",color:"#047857"},
    {label:"Completed",value:appointments.filter(a=>a.status==="completed").length,icon:"✅",color:"#7c3aed"},
    {label:"Cancelled",value:appointments.filter(a=>a.status==="cancelled").length,icon:"❌",color:"#be123c"},
  ];

  return (
    <div className="pd">
      <style>{G}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"20px 16px 24px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"12px",marginBottom:"14px"}}>
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                color:"rgba(255,255,255,.5)",marginBottom:"3px"}}>Welcome back</p>
              <h1 style={{fontSize:"clamp(20px,3vw,28px)",fontWeight:"700",
                color:"#fff",margin:0}}>
                {user?.name||user?.email||"Patient"}
              </h1>
            </div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              <Link to="/doctors" style={{padding:"8px 16px",borderRadius:"8px",
                background:"linear-gradient(135deg,#047857,#059669)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"600",fontSize:"13px"}}>
                + Book
              </Link>
              <Link to="/patient/profile" style={{padding:"8px 14px",borderRadius:"8px",
                background:"rgba(255,255,255,.10)",
                border:"1px solid rgba(255,255,255,.20)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px"}}>
                Profile
              </Link>
              <button onClick={()=>{logout();navigate("/");}} style={{
                padding:"8px 13px",borderRadius:"8px",background:"transparent",
                border:"1px solid rgba(255,255,255,.20)",
                color:"rgba(255,255,255,.65)",fontFamily:"'DM Sans',sans-serif",
                fontSize:"13px",cursor:"pointer"}}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"18px 14px 40px"}}>
        {/* Stats */}
        <div className="stat-grid">
          {STATS.map(({label,value,icon,color})=>(
            <div key={label} style={{background:"#fff",border:"1px solid #e2eaf4",
              borderRadius:"12px",padding:"14px 16px",textAlign:"center",
              boxShadow:"0 2px 8px rgba(11,31,58,.05)"}}>
              <div style={{fontSize:"20px",marginBottom:"5px"}}>{icon}</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",
                fontWeight:"700",color,margin:"0 0 2px",lineHeight:1}}>{value}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                color:"#94a3b8",margin:0}}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{marginBottom:"22px"}}>
          <h2 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"12px"}}>
            Quick Actions
          </h2>
          <div className="quick-grid">
            {[{to:"/doctors",            icon:"🔍",label:"Find Doctor"},
              {to:"/doctors?type=video", icon:"🎥",label:"Video Consult"},
              {to:"/doctors?type=home",  icon:"🏠",label:"Home Visit"},
              {to:"/patient/profile",    icon:"👤",label:"My Profile"},
              {to:"/patient/chat",       icon:"💬",label:"Messages"},
              {to:"/patient/payments",   icon:"💳",label:"Payments"},
              {to:"/contact",            icon:"📞",label:"Get Help"},
            ].map(({to,icon,label})=>(
              <Link key={label} to={to} className="quick-btn">
                <span style={{fontSize:"22px"}}>{icon}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  fontWeight:"600",color:"#374151"}}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Appointments */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
            <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
              My Appointments
            </h2>
          </div>
          <div className="tab-row" style={{marginBottom:"14px"}}>
            {[["upcoming",`Upcoming (${upcoming.length})`],
              ["past",`Past (${past.length})`],
            ].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`tab-btn${tab===t?" active":""}`}>{l}</button>
            ))}
          </div>

          {loading ? (
            <div style={{padding:"48px 0",textAlign:"center"}}>
              <div className="spin"/>
              <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",
                marginTop:"12px",fontSize:"14px"}}>Loading…</p>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{padding:"48px 20px",textAlign:"center",background:"#fff",
              borderRadius:"14px",border:"1px solid #e2eaf4"}}>
              <div style={{fontSize:"40px",marginBottom:"12px"}}>📅</div>
              <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"7px"}}>
                {tab==="upcoming" ? "No Upcoming Appointments" : "No Past Appointments"}
              </h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#64748b",marginBottom:"18px"}}>
                {tab==="upcoming"
                  ? "Book your first consultation today."
                  : "Your completed visits will appear here."}
              </p>
              {tab==="upcoming" &&
                <Link to="/doctors" style={{display:"inline-flex",alignItems:"center",
                  gap:"8px",background:"linear-gradient(135deg,#047857,#059669)",
                  color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"14px",padding:"12px 24px",borderRadius:"8px"}}>
                  Find a Doctor →
                </Link>}
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {displayed.map(appt => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  onCancel={cancelAppointment}
                  onViewPrescription={setPrescAppt}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {prescAppt && (
        <PrescriptionModal
          appt={prescAppt}
          onClose={() => setPrescAppt(null)}
        />
      )}
    </div>
  );
}
