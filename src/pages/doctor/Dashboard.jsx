/**
 * doctor/Dashboard.jsx — Phase B update
 * Added: Profile link, Availability link, Appointment Notes
 */
import { useEffect, useState } from "react";
import { showToast } from "../../components/Toast";
import { confirmAction } from "../../components/ConfirmDialog";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import NotificationBell from "../../components/NotificationBell";
import CreateVideoBtn      from "./dashboard/CreateVideoBtn";
import NotesModal          from "./dashboard/NotesModal";
import RejectModal         from "./dashboard/RejectModal";
import TransferModal       from "./dashboard/TransferModal";
import PatientBriefPanel   from "./dashboard/PatientBriefPanel";
import PatientBriefModal   from "./dashboard/PatientBriefModal";
import AcceptRejectButtons from "./dashboard/AcceptRejectButtons";
import MyReviews           from "./dashboard/MyReviews";

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
  pending:   {bg:"#fef9c3",color:"#854d0e"},
  approved:  {bg:"#dcfce7",color:"#15803d"},
  rejected:  {bg:"#fee2e2",color:"#991b1b"},
  completed: {bg:"#dbeafe",color:"#1e40af"},
  cancelled: {bg:"#fee2e2",color:"#991b1b"},
};
// Status labels come from t("patientDashboard.status.*") — same status
// vocabulary as the patient dashboard, so reused rather than duplicated.
// Type labels come from t("doctorDashboard.type.*") inside the component.

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("wc4a_token");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab,     setTab]       = useState("today");
  const [notesAppt, setNotesAppt] = useState(null);
  const [rejectAppt,   setRejectAppt]   = useState(null);
  const [transferAppt, setTransferAppt] = useState(null);
  const [briefAppt,    setBriefAppt]    = useState(null);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [upcomingLeave, setUpcomingLeave] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [availableNow,  setAvailableNow]  = useState(false);
  const [toggling,      setToggling]      = useState(false);
  const [myDoctorId,    setMyDoctorId]    = useState(null);

  useEffect(() => {
    document.title = "Doctor Panel — We Care 4 'all'";
    fetchAppointments();
    fetchUnread();
    fetchProfile();
    fetchIncomingTransfers();
    fetchUpcomingLeave();
    const t = setInterval(fetchUnread, 30000); // refresh badge every 30s
    return () => clearInterval(t);
  }, []);

  const fetchUpcomingLeave = async () => {
    try {
      const res  = await fetch(`${API}/doctor-leave`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      const todayStr = new Date().toISOString().slice(0,10);
      // Only current/upcoming blocks — past leave isn't useful on a dashboard summary.
      setUpcomingLeave((json.leave || []).filter(l => l.end_date >= todayStr));
    } catch { setUpcomingLeave([]); }
  };

  const fetchIncomingTransfers = async () => {
    try {
      const res  = await fetch(`${API}/appointments/transfer-requests/incoming`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setIncomingTransfers(json.requests || []);
    } catch { setIncomingTransfers([]); }
  };

  const respondToTransfer = async (requestId, accept) => {
    try {
      const res  = await fetch(`${API}/appointments/transfer-requests/${requestId}/respond`, {
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({accept}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || t("doctorDashboard.transfer.genericFailed"));
      fetchIncomingTransfers();
      fetchAppointments();

      // Accepted, but this date/time falls outside the doctor's declared
      // weekly schedule (or they're on leave that day) — the appointment
      // still moved over, but their calendar won't reflect it until they
      // add the slot. Offer to take them straight there.
      if (accept && json.needs_availability && json.availability_gap) {
        const g = json.availability_gap;
        showToast(
          t("doctorDashboard.transfer.gapWarning", {
            day: g.day.charAt(0).toUpperCase()+g.day.slice(1), time: g.time,
          }),
          "warning", 7000,
        );
        if (window.confirm(
          t("doctorDashboard.transfer.gapConfirm", { date: g.date, time: g.time })
        )) {
          navigate("/doctor/availability");
        }
      } else if (accept) {
        showToast(t("doctorDashboard.transfer.acceptedMoved"), "success");
      }
    } catch (e) { showToast(e.message || t("doctorDashboard.transfer.respondFailed"), "error"); }
  };

  const fetchProfile = async () => {
    try {
      const res  = await fetch(`${API}/doctors/my-profile`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setAvailableNow(!!json.available_now);
      setMyDoctorId(json.id || null); // needed for inline patient brief to filter history
    } catch {}
  };

  const toggleAvailableNow = async () => {
    setToggling(true);
    try {
      const res  = await fetch(`${API}/doctors/my-availability-now`,
        { method:"PUT", headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      if (res.ok) setAvailableNow(json.available_now);
    } catch {}
    finally { setToggling(false); }
  };

  const fetchUnread = async () => {
    try {
      const res  = await fetch(`${API}/chat/unread-count`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setUnreadCount(json.count || 0);
    } catch {}
  };

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
  const todayAppts    = appointments.filter(a=>a.appointment_date===today&&!["cancelled","rejected"].includes(a.status));
  const upcomingAppts = appointments.filter(a=>a.appointment_date>today&&!["cancelled","rejected"].includes(a.status));
  const pastAppts     = appointments.filter(a=>a.appointment_date<today&&!["cancelled","rejected"].includes(a.status));
  const cancelledAppts= appointments.filter(a=>["cancelled","rejected"].includes(a.status));
  const displayed     = tab==="today"?todayAppts:tab==="upcoming"?upcomingAppts:tab==="cancelled"?cancelledAppts:pastAppts;

  const STATS = [
    {label:t("doctorDashboard.stats.today"),    value:todayAppts.length,    icon:"📅",color:"#047857"},
    {label:t("doctorDashboard.stats.upcoming"), value:upcomingAppts.length, icon:"⏰",color:"#0369a1"},
    {label:t("doctorDashboard.stats.completed"),value:appointments.filter(a=>a.status==="completed").length,icon:"✅",color:"#7c3aed"},
    {label:t("doctorDashboard.stats.total"),    value:appointments.length,  icon:"📋",color:"#b45309"},
  ];

  return (
    <div className="dd">
      <style>{G}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0369a1,#0284c7)",padding:"20px 20px 24px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"flex",
          justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <Link to="/" style={{textDecoration:"none"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                color:"rgba(255,255,255,.65)",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"1px"}}>
                {t("doctorDashboard.panel")}
              </p>
            </Link>
            <h1 style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:"700",color:"#fff",margin:0}}>
              {user?.name||user?.email||t("doctorDashboard.doctorFallback")}
            </h1>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <button onClick={toggleAvailableNow} disabled={toggling}
              style={{padding:"8px 16px",borderRadius:"8px",cursor:toggling?"default":"pointer",
                background: availableNow ? "#10b981" : "rgba(255,255,255,.15)",
                border: availableNow ? "1px solid #10b981" : "1px solid rgba(255,255,255,.25)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
                display:"inline-flex",alignItems:"center",gap:"6px",opacity:toggling?0.7:1}}
              title={availableNow ? t("doctorDashboard.availableNowOnTooltip") : t("doctorDashboard.availableNowOffTooltip")}>
              {availableNow ? t("doctorDashboard.availableNow") : t("doctorDashboard.availableNowOff")}
            </button>
            <Link to="/doctor/profile" style={{padding:"8px 16px",borderRadius:"8px",
              background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500"}}>
              {t("doctorDashboard.profile")}
            </Link>
            <Link to="/doctor/availability" style={{padding:"8px 16px",borderRadius:"8px",
              background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500"}}>
              {t("doctorDashboard.availability")}
            </Link>
            <NotificationBell/>
            <Link to="/doctor/chat" style={{padding:"8px 16px",borderRadius:"8px",
              background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500",
              display:"inline-flex",alignItems:"center",gap:"6px",position:"relative"}}>
              {t("doctorDashboard.messages")}
              {unreadCount > 0 && (
                <span style={{background:"#dc2626",color:"#fff",fontSize:"10px",
                  fontWeight:"700",padding:"1px 6px",borderRadius:"50px",
                  minWidth:"18px",textAlign:"center",lineHeight:"16px"}}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <button onClick={()=>{logout();navigate("/");}}
              style={{padding:"8px 16px",borderRadius:"8px",background:"rgba(255,255,255,.15)",
                border:"1px solid rgba(255,255,255,.25)",color:"#fff",
                fontFamily:"'DM Sans',sans-serif",fontSize:"13px",cursor:"pointer"}}>
              {t("doctorDashboard.logout")}
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
                fontWeight:"700",color,margin:"0 0 2px",lineHeight:1}}>{loading ? "…" : value}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#94a3b8",margin:0}}>{label}</p>
            </div>
          ))}
        </div>

        {upcomingLeave.length>0&&(
          <div style={{marginBottom:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
              <h2 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
                {t("doctorDashboard.leave.heading")}
              </h2>
              <Link to="/doctor/availability" style={{fontFamily:"'DM Sans',sans-serif",
                fontSize:"12.5px",color:"#047857",fontWeight:"600",textDecoration:"none"}}>
                {t("doctorDashboard.leave.manage")}
              </Link>
            </div>
            {upcomingLeave.map(l=>{
              const todayStr = new Date().toISOString().slice(0,10);
              const isOngoing = l.start_date <= todayStr && l.end_date >= todayStr;
              return (
                <div key={l.id} style={{background: isOngoing ? "#fef2f2" : "#fffbeb",
                  border:`1px solid ${isOngoing ? "#fca5a5" : "#fde68a"}`,
                  borderRadius:"10px",padding:"10px 16px",marginBottom:"8px",
                  display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color: isOngoing ? "#991b1b" : "#92400e"}}>
                    {isOngoing ? t("doctorDashboard.leave.ongoing") : t("doctorDashboard.leave.upcoming")} —{" "}
                    {new Date(l.start_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                    {" → "}
                    {new Date(l.end_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                    {l.reason ? ` · ${l.reason}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {incomingTransfers.length>0&&(
          <div style={{marginBottom:"20px"}}>
            <h2 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 10px"}}>
              {t("doctorDashboard.transfer.heading")}
            </h2>
            {incomingTransfers.map(r=>(
              <div key={r.id} style={{background:"#eff8ff",border:"1px solid #93c5fd",
                borderRadius:"12px",padding:"14px 16px",marginBottom:"8px",
                display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"#0b1f3a",margin:0}}>
                    {t("doctorDashboard.transfer.wantsTakeOver", {
                      doctor: r.from?.full_name||t("doctorDashboard.transfer.fromDoctorFallback"),
                      patient: r.appointments?.patient_name||t("doctorDashboard.transfer.patientFallback"),
                    })}
                  </p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",margin:"3px 0 0"}}>
                    {r.appointments?.appointment_date&&new Date(r.appointments.appointment_date).toLocaleDateString("en-IN",
                      {day:"numeric",month:"short",year:"numeric"})}
                    {" "}{r.appointments?.appointment_time?.slice(0,5)}
                    {r.reason&&<> · {r.reason}</>}
                  </p>
                </div>
                <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                  <button onClick={()=>respondToTransfer(r.id,true)}
                    style={{padding:"7px 14px",borderRadius:"7px",
                      background:"linear-gradient(135deg,#047857,#059669)",border:"none",
                      color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      fontWeight:"600",cursor:"pointer"}}>
                    {t("doctorDashboard.transfer.accept")}
                  </button>
                  <button onClick={async()=>{
                      const ok = await confirmAction({
                        title: t("doctorDashboard.transfer.declineConfirmTitle"),
                        message: t("doctorDashboard.transfer.declineConfirmMessage", {
                          patient: r.appointments?.patient_name||t("doctorDashboard.transfer.declineFallbackPatient"),
                          doctor: r.from?.full_name||t("doctorDashboard.transfer.declineFallbackDoctor"),
                        }),
                        confirmLabel: t("doctorDashboard.transfer.decline"),
                      });
                      if (ok) respondToTransfer(r.id,false);
                    }}
                    style={{padding:"7px 14px",borderRadius:"7px",
                      background:"#fef2f2",border:"1px solid #fecaca",
                      color:"#991b1b",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      fontWeight:"600",cursor:"pointer"}}>
                    {t("doctorDashboard.transfer.decline")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          marginBottom:"10px",flexWrap:"wrap",gap:"10px"}}>
          <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
            {t("doctorDashboard.patientAppointments")}
          </h2>
        </div>
        <div className="dd-tabs">
          {[["today",t("doctorDashboard.tabs.today",{count:loading?"…":todayAppts.length})],
            ["upcoming",t("doctorDashboard.tabs.upcoming",{count:loading?"…":upcomingAppts.length})],
            ["past",t("doctorDashboard.tabs.past",{count:loading?"…":pastAppts.length})],
            ["cancelled",t("doctorDashboard.tabs.cancelled",{count:loading?"…":cancelledAppts.length})],
            ["reviews",t("doctorDashboard.tabs.reviews")]
          ].map(([t3,l])=>(
            <button key={t3} onClick={()=>setTab(t3)}
              className={`tab-btn${tab===t3?" active":""}`}>{l}</button>
          ))}
        </div>

        {tab==="reviews" ? <MyReviews token={token}/> : (<>
        {/* List */}
        {loading ? (
          <div style={{padding:"60px 0",textAlign:"center"}}>
            <div style={{width:"32px",height:"32px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #0369a1",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"14px"}}>
              {t("doctorDashboard.loading")}
            </p>
          </div>
        ) : displayed.length===0 ? (
          <div style={{padding:"48px 20px",textAlign:"center",background:"#fff",
            borderRadius:"14px",border:"1px solid #e2eaf4"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>📋</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"6px"}}>
              {t("doctorDashboard.noAppointments")}
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b"}}>
              {t("doctorDashboard.noneFoundFor", { tab: t(`doctorDashboard.tabNames.${tab}`, tab) })}
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
                      {t(`patientDashboard.status.${appt.status}`, appt.status)}
                    </span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
                      {t(`doctorDashboard.type.${appt.appointment_type}`, appt.appointment_type)}
                    </span>
                  </div>
                  <div className="appt-detail">
                    <span>📅 {new Date(appt.appointment_date).toLocaleDateString("en-IN",
                      {day:"numeric",month:"short",year:"numeric"})}</span>
                    <span>🕐 {appt.appointment_time?.slice(0,5)||""}</span>
                    {appt.patient_mobile&&<span>📱 {appt.patient_mobile}</span>}
                    {appt.patient_email&&<span>✉️ {appt.patient_email}</span>}
                  </div>
                  {appt.symptoms&&
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      color:"#94a3b8",fontStyle:"italic",margin:"5px 0 0"}}>
                      {appt.symptoms}
                    </p>}
                  {appt.appointment_type==="home" && appt.patient_address&&
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      color:"#0369a1",margin:"5px 0 0"}}>
                      📍 <strong>{t("doctorDashboard.visitAt")}</strong> {appt.patient_address}
                    </p>}
                  {appt.appointment_type==="inperson" && appt.doctor_address&&
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      color:"#0369a1",margin:"5px 0 0"}}>
                      📍 <strong>{t("doctorDashboard.clinic")}</strong> {appt.doctor_address}
                    </p>}
                  {appt.prescription&&
                    <div style={{background:"#f0fdf4",border:"1px solid #86efac",
                      borderRadius:"8px",padding:"8px 12px",marginTop:"8px"}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                        fontWeight:"700",color:"#15803d",margin:"0 0 3px"}}>{t("doctorDashboard.notes")}</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                        color:"#374151",margin:0}}>{appt.prescription}</p>
                    </div>}
                  {/* Inline collapsible patient brief — lazy loads on first expand */}
                  {appt.patient_id&&
                    <PatientBriefPanel
                      appt={appt}
                      token={token}
                      myDoctorId={myDoctorId}
                    />}
                </div>
                <div style={{display:"flex",gap:"6px",flexShrink:0,flexWrap:"wrap"}}>
                  {/* Patient Brief — available on every appointment */}
                  {appt.patient_id&&
                    <button onClick={()=>setBriefAppt(appt)}
                      style={{padding:"7px 14px",borderRadius:"7px",
                        background:"#faf5ff",border:"1.5px solid #d8b4fe",
                        color:"#6d28d9",fontFamily:"'DM Sans',sans-serif",
                        fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                      {t("doctorDashboard.patientBrief")}
                    </button>}
                  {appt.status==="pending"&&
                    <AcceptRejectButtons appt={appt} token={token}
                      onChanged={fetchAppointments} onReject={setRejectAppt}/>}
                  {appt.status==="approved"&&appt.appointment_type==="video"&&
                    <CreateVideoBtn appointmentId={appt.id} token={token} appt={appt}/>}
                  {appt.status==="approved"&&
                    <button onClick={()=>setNotesAppt(appt)}
                      style={{padding:"7px 14px",borderRadius:"7px",
                        background:"#f0fdf4",border:"1.5px solid #86efac",
                        color:"#047857",fontFamily:"'DM Sans',sans-serif",
                        fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                      {t("doctorDashboard.notesBtn")}
                    </button>}
                  {["pending","approved"].includes(appt.status)&&
                    <button onClick={()=>setTransferAppt(appt)}
                      style={{padding:"7px 14px",borderRadius:"7px",
                        background:"#eff8ff",border:"1.5px solid #93c5fd",
                        color:"#0369a1",fontFamily:"'DM Sans',sans-serif",
                        fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                      {t("doctorDashboard.transferBtn")}
                    </button>}
                </div>
              </div>
            </div>
          );
        })}
        </>)}
      </div>

      {briefAppt&&(
        <PatientBriefModal
          appt={briefAppt}
          token={token}
          onClose={()=>setBriefAppt(null)}
        />
      )}
      {notesAppt&&(
        <NotesModal
          appt={notesAppt}
          token={token}
          onClose={()=>setNotesAppt(null)}
          onSaved={fetchAppointments}
        />
      )}
      {rejectAppt&&(
        <RejectModal
          appt={rejectAppt}
          token={token}
          onClose={()=>setRejectAppt(null)}
          onSaved={fetchAppointments}
        />
      )}
      {transferAppt&&(
        <TransferModal
          appt={transferAppt}
          token={token}
          onClose={()=>setTransferAppt(null)}
          onSent={fetchAppointments}
        />
      )}
    </div>
  );
}
