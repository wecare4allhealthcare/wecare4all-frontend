/**
 * doctor/Dashboard.jsx — Phase B update
 * Added: Profile link, Availability link, Appointment Notes
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
.dd-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;}
@media(min-width:600px){.dd-stats{grid-template-columns:repeat(4,1fr);}}
.appt-row{background:#fff;border:1px solid #e2eaf4;border-radius:12px;
  padding:14px 16px;transition:all .22s;margin-bottom:10px;}
.appt-row:hover{box-shadow:0 6px 20px rgba(11,31,58,.09);}
.dd-tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;
  -ms-overflow-style:none;scrollbar-width:none;margin-bottom:16px;}
.dd-tabs::-webkit-scrollbar{display:none;}
.tab-btn{padding:9px 18px;border-radius:9px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:13px;
  font-weight:600;cursor:pointer;transition:all .2s;color:#64748b;
  white-space:nowrap;flex-shrink:0;}
.tab-btn.active{background:#0369a1;border-color:#0369a1;color:#fff;}
.appt-detail{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;}
.appt-detail span{font-family:'DM Sans',sans-serif;font-size:12px;color:#64748b;}
.quick-link{display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:16px 12px;background:#fff;border:1.5px solid #e2eaf4;border-radius:12px;
  text-decoration:none;transition:all .22s;text-align:center;}
.quick-link:hover{border-color:#0369a1;background:#eff8ff;transform:translateY(-3px);}
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
  const create = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/video/create-session?appointment_id=${appointmentId}`,
        {method:"POST",headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      if (res.ok) setRoomUrl(json.join_url);
      else alert(json.detail||"Failed");
    } catch { alert("Error"); }
    finally { setLoading(false); }
  };
  if (roomUrl) return (
    <a href={roomUrl} target="_blank" rel="noreferrer"
      style={{padding:"7px 14px",borderRadius:"7px",background:"#047857",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>
      🎥 Join Room
    </a>
  );
  return (
    <button onClick={create} disabled={loading}
      style={{padding:"7px 14px",borderRadius:"7px",background:"#0369a1",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",
        border:"none",cursor:"pointer",opacity:loading?0.7:1,whiteSpace:"nowrap"}}>
      {loading?"Creating…":"🎥 Create Room"}
    </button>
  );
}

function NotesModal({ appt, token, onClose, onSaved }) {
  const [notes, setNotes] = useState(appt.prescription || "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/appointments/${appt.id}/notes`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({notes,status:"completed"}),
      });
      onSaved();
      onClose();
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",width:"100%",maxWidth:"500px",borderRadius:"18px 18px 0 0",
        padding:"20px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Add Notes / Prescription
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"12px"}}>
          Patient: <strong>{appt.patient_name}</strong> · {new Date(appt.appointment_date).toLocaleDateString("en-IN")}
        </p>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)}
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"12px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",
            minHeight:"120px",outline:"none"}}
          placeholder="Enter diagnosis, prescription, follow-up instructions…"/>
        <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
          <button onClick={save} disabled={saving}
            style={{flex:1,background:"linear-gradient(135deg,#047857,#059669)",
              color:"#fff",border:"none",borderRadius:"9px",padding:"12px",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",cursor:"pointer"}}>
            {saving?"Saving…":"Save & Complete →"}
          </button>
          <button onClick={onClose}
            style={{padding:"12px 18px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
              background:"#fff",color:"#64748b",fontFamily:"'DM Sans',sans-serif",
              fontSize:"14px",cursor:"pointer"}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("wc4a_token");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab,     setTab]       = useState("today");
  const [notesAppt, setNotesAppt] = useState(null);

  useEffect(() => {
    document.title = "Doctor Panel — We Care 4 'all'";
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/appointments/doctor`,{headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      setAppointments(json.appointments||[]);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  const today         = new Date().toISOString().split("T")[0];
  const todayAppts    = appointments.filter(a=>a.appointment_date===today&&a.status!=="cancelled");
  const upcomingAppts = appointments.filter(a=>a.appointment_date>today&&a.status!=="cancelled");
  const pastAppts     = appointments.filter(a=>a.appointment_date<today||a.status==="cancelled");
  const displayed     = tab==="today"?todayAppts:tab==="upcoming"?upcomingAppts:pastAppts;

  const STATS = [
    {label:"Today",    value:todayAppts.length,    icon:"📅",color:"#047857"},
    {label:"Upcoming", value:upcomingAppts.length, icon:"⏰",color:"#0369a1"},
    {label:"Completed",value:appointments.filter(a=>a.status==="completed").length,icon:"✅",color:"#7c3aed"},
    {label:"Total",    value:appointments.length,  icon:"📋",color:"#b45309"},
  ];

  return (
    <div className="dd">
      <style>{G}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0369a1,#0284c7)",padding:"20px 20px 24px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"flex",
          justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.65)",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"1px"}}>
              Doctor Panel
            </p>
            <h1 style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:"700",color:"#fff",margin:0}}>
              Dr. {user?.name||user?.email||"Doctor"}
            </h1>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <Link to="/doctor/profile" style={{padding:"8px 16px",borderRadius:"8px",
              background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500"}}>
              👤 Profile
            </Link>
            <Link to="/doctor/availability" style={{padding:"8px 16px",borderRadius:"8px",
              background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500"}}>
              🕐 Availability
            </Link>
            <Link to="/doctor/chat" style={{padding:"8px 16px",borderRadius:"8px",
              background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500"}}>
              💬 Messages
            </Link>
            <button onClick={()=>{logout();navigate("/");}}
              style={{padding:"8px 16px",borderRadius:"8px",background:"rgba(255,255,255,.15)",
                border:"1px solid rgba(255,255,255,.25)",color:"#fff",
                fontFamily:"'DM Sans',sans-serif",fontSize:"13px",cursor:"pointer"}}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"20px 14px 40px"}}>
        {/* Stats */}
        <div className="dd-stats">
          {STATS.map(({label,value,icon,color})=>(
            <div key={label} style={{background:"#fff",border:"1px solid #e2eaf4",
              borderRadius:"12px",padding:"14px 16px",textAlign:"center",
              boxShadow:"0 2px 8px rgba(11,31,58,.05)"}}>
              <div style={{fontSize:"20px",marginBottom:"5px"}}>{icon}</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",
                fontWeight:"700",color,margin:"0 0 2px",lineHeight:1}}>{value}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#94a3b8",margin:0}}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          marginBottom:"10px",flexWrap:"wrap",gap:"10px"}}>
          <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Patient Appointments
          </h2>
        </div>
        <div className="dd-tabs">
          {[["today",`Today (${todayAppts.length})`],
            ["upcoming",`Upcoming (${upcomingAppts.length})`],
            ["past",`Past (${pastAppts.length})`]
          ].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`tab-btn${tab===t?" active":""}`}>{l}</button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{padding:"60px 0",textAlign:"center"}}>
            <div style={{width:"32px",height:"32px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #0369a1",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"14px"}}>
              Loading…
            </p>
          </div>
        ) : displayed.length===0 ? (
          <div style={{padding:"48px 20px",textAlign:"center",background:"#fff",
            borderRadius:"14px",border:"1px solid #e2eaf4"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>📋</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"6px"}}>
              No Appointments
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b"}}>
              No {tab} appointments found.
            </p>
          </div>
        ) : displayed.map(appt=>{
          const s=STATUS_STYLES[appt.status]||STATUS_STYLES.pending;
          return(
            <div key={appt.id} className="appt-row">
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"flex-start",gap:"10px",flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",
                    flexWrap:"wrap",marginBottom:"4px"}}>
                    <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                      {appt.patient_name}
                    </strong>
                    <span style={{background:s.bg,color:s.color,fontSize:"11px",
                      fontWeight:"700",padding:"2px 9px",borderRadius:"50px",
                      fontFamily:"'DM Sans',sans-serif"}}>
                      {s.label}
                    </span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
                      {TYPE_LABELS[appt.appointment_type]||appt.appointment_type}
                    </span>
                  </div>
                  <div className="appt-detail">
                    <span>📅 {new Date(appt.appointment_date).toLocaleDateString("en-IN",
                      {day:"numeric",month:"short",year:"numeric"})}</span>
                    <span>🕐 {appt.appointment_time?.slice(0,5)||""}</span>
                    {appt.patient_mobile&&<span>📱 {appt.patient_mobile}</span>}
                    {appt.patient_email&&<span>✉️ {appt.patient_email}</span>}
                    {appt.payment_amount>0&&
                      <span style={{color:"#047857",fontWeight:"600"}}>💰 ₹{appt.payment_amount}</span>}
                  </div>
                  {appt.symptoms&&
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      color:"#94a3b8",fontStyle:"italic",margin:"5px 0 0"}}>
                      {appt.symptoms}
                    </p>}
                  {appt.prescription&&
                    <div style={{background:"#f0fdf4",border:"1px solid #86efac",
                      borderRadius:"8px",padding:"8px 12px",marginTop:"8px"}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                        fontWeight:"700",color:"#15803d",margin:"0 0 3px"}}>Notes:</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                        color:"#374151",margin:0}}>{appt.prescription}</p>
                    </div>}
                </div>
                <div style={{display:"flex",gap:"6px",flexShrink:0,flexWrap:"wrap"}}>
                  {appt.status==="approved"&&appt.appointment_type==="video"&&
                    <CreateVideoBtn appointmentId={appt.id} token={token}/>}
                  {appt.status==="approved"&&
                    <button onClick={()=>setNotesAppt(appt)}
                      style={{padding:"7px 14px",borderRadius:"7px",
                        background:"#f0fdf4",border:"1.5px solid #86efac",
                        color:"#047857",fontFamily:"'DM Sans',sans-serif",
                        fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                      📝 Notes
                    </button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notesAppt&&(
        <NotesModal
          appt={notesAppt}
          token={token}
          onClose={()=>setNotesAppt(null)}
          onSaved={fetchAppointments}
        />
      )}
    </div>
  );
}
