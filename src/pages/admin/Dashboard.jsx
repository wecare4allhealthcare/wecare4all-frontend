/**
 * admin/Dashboard.jsx — Phase D: Analytics + Export + Notifications
 * ADDED:
 * 1. Revenue chart (monthly bar chart — pure CSS, no library needed)
 * 2. Appointment trend chart
 * 3. CSV export for appointments
 * 4. Bulk email/SMS notification to patients
 * 5. Analytics section added to NAV
 * 6. Mobile bottom tab bar (from Fix 4)
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import NotificationBell from "../../components/NotificationBell";
import { API } from "./dashboard/shared";
import NotificationModal      from "./dashboard/NotificationModal";
import Announcements          from "./dashboard/Announcements";
import LiveFeed                from "./dashboard/LiveFeed";
import Analytics                from "./dashboard/Analytics";
import Overview                  from "./dashboard/Overview";
import Appointments               from "./dashboard/Appointments";
import Doctors                     from "./dashboard/Doctors";
import DoctorLeaveOverview          from "./dashboard/DoctorLeaveOverview";
import Empanelments                  from "./dashboard/Empanelments";
import Hospitals                      from "./dashboard/Hospitals";
import Reviews                         from "./dashboard/Reviews";
import Contacts                         from "./dashboard/Contacts";
import Patients                          from "./dashboard/Patients";
import ConsentRecords                     from "./dashboard/ConsentRecords";
import Payouts                            from "./dashboard/Payouts";
import Refunds                             from "./dashboard/Refunds";
import AdminChatEmbed                       from "./dashboard/AdminChatEmbed";
import Specialties                           from "./dashboard/Specialties";
import UpgradeRequests                        from "./dashboard/UpgradeRequests";
import HomeHealthcareServices                  from "./dashboard/HomeHealthcareServices";
import BlogPosts                                from "./dashboard/BlogPosts";
import PharmacyManagement                       from "./dashboard/PharmacyManagement";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.ad{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.ad *{box-sizing:border-box;}
.ad h1,.ad h2,.ad h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:28px;height:28px;border:3px solid #e2eaf4;border-top:3px solid #047857;
  border-radius:50%;animation:spin .8s linear infinite;margin:0 auto;}
/* Desktop Sidebar */
.ad-sidebar{position:fixed;left:0;top:0;bottom:0;width:220px;
  background:linear-gradient(180deg,#071524,#0b1f3a);
  z-index:100;overflow-y:auto;display:flex;flex-direction:column;}
.ad-sidebar::-webkit-scrollbar{width:3px}
.ad-sidebar::-webkit-scrollbar-thumb{background:#047857;border-radius:3px}
.ad-content{margin-left:220px;padding:24px;padding-bottom:80px;}
.ad-mobile-title{display:none;}
.nav-item{display:flex;align-items:center;gap:10px;padding:12px 20px;
  font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
  color:rgba(255,255,255,.58);cursor:pointer;transition:all .2s;
  border-left:3px solid transparent;text-decoration:none;border:none;
  background:transparent;width:100%;text-align:left;}
.nav-item:hover{color:#fff;background:rgba(255,255,255,.07);}
.nav-item.active{color:#6ee7b7;border-left:3px solid #047857;background:rgba(4,120,87,.12);}
/* Mobile bottom bar */
@media(max-width:699px){
  .ad-sidebar{display:none!important;}
  .ad-content{margin-left:0!important;padding:14px 12px 90px!important;}
  .ad-bottom-bar{display:flex!important;}
  .stat-grid-8{grid-template-columns:repeat(2,1fr)!important;}
  .ad-mobile-title{display:block;}
}
@media(min-width:700px) and (max-width:860px){
  .ad-sidebar{width:64px;}
  .nav-label{display:none!important;}
  .ad-content{margin-left:64px;}
}
/* Mobile bottom bar — 21 tabs no longer fit as equal-width flex:1 items,
   and Tamil labels are 30-40%+ longer than English, which was pushing
   labels past their box and making them look "hidden"/cut off. Instead of
   squeezing everything to fit, the bar now scrolls horizontally with each
   tab keeping a fixed min-width, so labels stay fully readable. */
.ad-bottom-bar{display:none;position:fixed;bottom:0;left:0;right:0;
  background:#0b1f3a;border-top:1px solid rgba(255,255,255,.12);
  z-index:200;height:60px;overflow-x:auto;overflow-y:hidden;
  scrollbar-width:none;-ms-overflow-style:none;}
.ad-bottom-bar::-webkit-scrollbar{display:none;}
.tab-btn-bar{flex:0 0 auto;min-width:64px;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:2px;border:none;background:transparent;
  cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;
  color:rgba(255,255,255,.5);transition:all .2s;padding:4px 6px;white-space:nowrap;}
.tab-btn-bar.active{color:#34d399;}
.tab-btn-bar span.ti{font-size:16px;line-height:1;}
.tab-btn-bar span.tl{max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* Cards */
.stat-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;padding:16px;
  transition:all .25s;box-shadow:0 2px 8px rgba(11,31,58,.05);}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(11,31,58,.10);}
.data-row{background:#fff;border:1px solid #e2eaf4;border-radius:11px;
  padding:12px 14px;margin-bottom:10px;transition:all .2s;}
.data-row:hover{box-shadow:0 4px 14px rgba(11,31,58,.08);}
.badge{display:inline-flex;align-items:center;font-size:11px;font-weight:700;
  padding:3px 10px;border-radius:50px;font-family:'DM Sans',sans-serif;white-space:nowrap;}
.ad-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:9px 12px;
  font-family:'DM Sans',sans-serif;font-size:13px;color:#1e293b;
  background:#f8fafc;outline:none;transition:all .2s;}
.ad-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.btn-sm{padding:6px 12px;border-radius:7px;border:none;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;transition:all .2s;}
.btn-green{background:#047857;color:#fff;}.btn-green:hover{background:#059669;}
.btn-navy{background:#0b1f3a;color:#fff;}.btn-navy:hover{background:#112d52;}
.btn-red{background:#dc2626;color:#fff;}.btn-red:hover{background:#b91c1c;}
.btn-amber{background:#d97706;color:#fff;}.btn-amber:hover{background:#b45309;}
.btn-outline{background:transparent;border:1.5px solid #e2eaf4;color:#64748b;}
.btn-outline:hover{border-color:#047857;color:#047857;}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2000;
  display:flex;align-items:flex-end;justify-content:center;padding:0;}
.modal-box{background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:480px;
  max-height:90vh;overflow-y:auto;box-shadow:0 -8px 40px rgba(0,0,0,.25);}
@media(min-width:640px){
  .modal-bg{align-items:center;padding:16px;}
  .modal-box{border-radius:18px;}
}
.filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.fchip{padding:7px 14px;border-radius:50px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:12px;
  font-weight:600;cursor:pointer;transition:all .2s;color:#64748b;white-space:nowrap;}
.fchip:hover{border-color:#047857;color:#047857;}
.fchip.on{background:#047857;border-color:#047857;color:#fff;}
/* Bar chart */
.bar-wrap{display:flex;align-items:flex-end;gap:6px;height:120px;padding:8px 0 0;}
.bar{flex:1;min-width:0;border-radius:4px 4px 0 0;transition:all .3s;
  background:linear-gradient(180deg,#047857,#059669);cursor:default;position:relative;}
.bar:hover{opacity:.85;}
.bar-label{font-family:'DM Sans',sans-serif;font-size:9px;color:#6b7688;
  text-align:center;margin-top:4px;white-space:nowrap;overflow:hidden;
  text-overflow:ellipsis;}
`;

const NAV = [
  {id:"live",         icon:"🟢"},
  {id:"overview",     icon:"📊"},
  {id:"analytics",    icon:"📈"},
  {id:"announcements",icon:"📢"},
  {id:"appointments", icon:"📅"},
  {id:"doctors",      icon:"👨‍⚕️"},
  {id:"doctor_leave", icon:"🏖️"},
  {id:"empanelments", icon:"🏥"},
  {id:"hospitals",    icon:"🏨"},
  {id:"reviews",      icon:"⭐"},
  {id:"contacts",     icon:"📬"},
  {id:"patients",     icon:"🧑‍💼"},
  {id:"consent_records",icon:"📝"},
  {id:"payouts",      icon:"💸"},
  {id:"refunds",      icon:"↩️"},
  {id:"chat",         icon:"💬"},
  {id:"specialties",   icon:"🔬"},
  {id:"home_healthcare",icon:"🏠"},
  {id:"blog",icon:"📝"},
  {id:"pharmacy",icon:"💊"},
  {id:"upgrade_requests",icon:"⬆️"},
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("wc4a_token");
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get("tab") || "overview";
  const setSection = (id) => setSearchParams({ tab: id });
  const [stats,    setStats]    = useState(null);
  const [showNotify, setShowNotify] = useState(false);

  useEffect(()=>{
    document.title="Admin Dashboard — We Care 4 'all'";
    fetchStats();
  },[]);

  const fetchStats=async()=>{
    try{
      const res=await fetch(`${API}/admin/stats`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setStats(json);
    }catch{}
  };

  return(
    <div className="ad">
      <style>{G}</style>

      {/* Desktop Sidebar */}
      <div className="ad-sidebar">
        <div style={{padding:"18px 16px 12px",
          borderBottom:"1px solid rgba(255,255,255,.08)",
          display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <Link to="/" style={{textDecoration:"none"}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",
              fontWeight:"700",color:"#fff",margin:0}}>
              We Care 4 <span style={{color:"#34d399"}}>'all'</span>
            </p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.38)",margin:"3px 0 0"}}>{t("adminDashboard.panel")}</p>
          </Link>
          <NotificationBell/>
        </div>
        <nav style={{padding:"10px 0",flex:1}}>
          {NAV.map(({id,icon})=>(
            <button key={id} onClick={()=>setSection(id)}
              className={`nav-item${section===id?" active":""}`}>
              <span style={{fontSize:"16px",flexShrink:0}}>{icon}</span>
              <span className="nav-label">{t(`adminDashboard.nav.${id}`)}</span>
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",
          borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
            color:"rgba(255,255,255,.45)",marginBottom:"8px",
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {user?.name||user?.email||t("adminDashboard.adminFallback")}
          </p>
          <button onClick={()=>{logout();navigate("/");}}
            style={{width:"100%",padding:"8px",borderRadius:"8px",
              background:"rgba(220,38,38,.15)",
              border:"1px solid rgba(220,38,38,.25)",
              color:"#fca5a5",fontFamily:"'DM Sans',sans-serif",
              fontSize:"12px",cursor:"pointer"}}>
            {t("adminDashboard.logout")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="ad-content">
        {/* Mobile section title — only shown when the sidebar is hidden
            (below 700px). On desktop each section already renders its
            own heading, so this was showing twice. */}
        <div className="ad-mobile-title" style={{marginBottom:"16px"}}>
          <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
            {NAV.find(n=>n.id===section) ? t(`adminDashboard.nav.${section}`) : t("adminDashboard.nav.overview")}
          </h2>
        </div>

        {section==="live"         && <LiveFeed token={token}/>}
        {section==="overview"     && <Overview stats={stats} token={token} onNotify={()=>setShowNotify(true)}/>}
        {section==="analytics"    && <Analytics token={token}/>}
        {section==="announcements"&& <Announcements token={token}/>}
        {section==="appointments" && <Appointments token={token}/>}
        {section==="doctors"      && <Doctors token={token}/>}
        {section==="doctor_leave" && <DoctorLeaveOverview token={token}/>}
        {section==="empanelments" && <Empanelments token={token}/>}
        {section==="hospitals"    && <Hospitals token={token}/>}
        {section==="reviews"      && <Reviews token={token}/>}
        {section==="contacts"     && <Contacts token={token}/>}
        {section==="patients"     && <Patients token={token}/>}
        {section==="consent_records" && <ConsentRecords token={token}/>}
        {section==="payouts"      && <Payouts token={token}/>}
        {section==="refunds"      && <Refunds token={token}/>}
        {section==="chat"         && <AdminChatEmbed/>}
        {section==="specialties"   && <Specialties token={token}/>}
        {section==="home_healthcare" && <HomeHealthcareServices token={token}/>}
        {section==="blog" && <BlogPosts token={token}/>}
        {section==="pharmacy" && <PharmacyManagement token={token}/>}
        {section==="upgrade_requests" && <UpgradeRequests token={token}/>}
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="ad-bottom-bar">
        {NAV.map(({id,icon})=>(
          <button key={id} onClick={()=>setSection(id)}
            className={`tab-btn-bar${section===id?" active":""}`}>
            <span className="ti">{icon}</span>
            {/* Full label, ellipsis-truncated by CSS (max-width on .tl) instead
                of .slice(0,5) — slicing a Tamil string by character count can
                cut a combining vowel sign off from its base consonant,
                rendering a broken/invisible glyph rather than a clean word. */}
            <span className="tl">{t(`adminDashboard.nav.${id}`)}</span>
          </button>
        ))}
      </div>

      {/* Notification Modal */}
      {showNotify&&(
        <NotificationModal
          token={token}
          onClose={()=>setShowNotify(false)}
        />
      )}
    </div>
  );
}
