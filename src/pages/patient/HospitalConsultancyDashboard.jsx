/**
 * HospitalConsultancyDashboard.jsx — landing page after logging in with
 * "Hospital Consultancy" (users table, role=patient, portal_type=hospital).
 *
 * Flow:
 *  1. Not yet applied / pending / rejected → Profile tab (always editable)
 *     + a "Partner With Us" card pointing out to the public application
 *     page (wecare4all.in/partner-with-us).
 *  2. Once admin approves their empanelment application, this page
 *     silently swaps the session's token for a real hospital-role one
 *     (POST /empanelment/activate-partner-session) and renders the
 *     actual HospitalDashboard component in place — same URL, no second
 *     login. HospitalDashboard's own existing logic already gates its
 *     premium tabs (Banners/Videos) behind subscription payment status,
 *     so "approved but not yet paid" naturally shows Profile/Photos/
 *     Billing right away (so they CAN pay) while the rest stays locked
 *     until payment clears — no separate payment check needed here.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../components/Toast";
import { useTranslation } from "react-i18next";
import HospitalDashboard from "../hospital/Dashboard";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const PARTNER_URL = "https://www.wecare4all.in/partner-with-us";

function ProfileTab({ token }) {
  const { t } = useTranslation();
  const [form, setForm]     = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/patients/profile`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        setForm(json);
      } catch { setForm({}); }
    })();
  }, [token]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/patients/profile`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          full_name: form.full_name, city: form.city, state: form.state,
          address: form.address, pincode: form.pincode,
        }),
      });
      if (!res.ok) throw new Error(t("hospitalConsultancyDashboard.profile.saveFailed"));
      showToast(t("hospitalConsultancyDashboard.profile.updated"), "success");
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  if (!form) return <p style={{fontFamily:"'Inter',sans-serif",color:"#6b7688"}}>{t("hospitalConsultancyDashboard.profile.loading")}</p>;

  const field = (label, key, disabled=false) => (
    <div style={{marginBottom:"14px"}}>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",fontWeight:"700",color:"#374151",marginBottom:"5px"}}>{label}</p>
      <input value={form[key] || ""} disabled={disabled}
        onChange={e => setForm({...form, [key]: e.target.value})}
        style={{width:"100%",border:"1.5px solid var(--wc-border)",borderRadius:"9px",padding:"10px 13px",
          fontFamily:"'Inter',sans-serif",fontSize:"14px",background:disabled?"var(--wc-warm-white)":"#fff"}}/>
    </div>
  );

  return (
    <div style={{background:"#fff",border:"1px solid var(--wc-border)",borderRadius:"14px",padding:"24px",maxWidth:"520px"}}>
      {field(t("hospitalConsultancyDashboard.profile.fullName"),"full_name")}
      {field(t("hospitalConsultancyDashboard.profile.emailRegistered"),"email",true)}
      {field(t("hospitalConsultancyDashboard.profile.mobileRegistered"),"mobile",true)}
      {field(t("hospitalConsultancyDashboard.profile.city"),"city")}
      {field(t("hospitalConsultancyDashboard.profile.state"),"state")}
      {field(t("hospitalConsultancyDashboard.profile.address"),"address")}
      {field(t("hospitalConsultancyDashboard.profile.pincode"),"pincode")}
      <button onClick={save} disabled={saving} style={{
        padding:"11px 24px",borderRadius:"9px",border:"none",
        background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
        fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"13px",
        cursor:saving?"not-allowed":"pointer",
      }}>{saving?t("hospitalConsultancyDashboard.profile.saving"):t("hospitalConsultancyDashboard.profile.saveChanges")}</button>
    </div>
  );
}

// Every non-approved state funnels to the same external application page
// — "so he will apply for partner", per the exact request. Distinct
// messaging per state, same destination.
function PartnerWithUsTab({ status }) {
  const { t } = useTranslation();

  const Card = ({ children }) => (
    <div style={{background:"#fff",border:"1px solid var(--wc-border)",borderRadius:"14px",padding:"28px",maxWidth:"560px"}}>{children}</div>
  );

  const ApplyBtn = ({ label }) => (
    <a href={PARTNER_URL} target="_blank" rel="noopener noreferrer" style={{
      display:"inline-block",padding:"12px 24px",borderRadius:"9px",border:"none",
      background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
      fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"14px",textDecoration:"none",
    }}>{label}</a>
  );

  if (status.state === "pending") {
    return (
      <Card>
        <div style={{fontSize:"30px",marginBottom:"10px"}}>⏳</div>
        <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"22px",fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 8px"}}>
          {t("hospitalConsultancyDashboard.partnership.pending.title")}
        </h3>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-muted)",lineHeight:"1.7"}}>
          {t("hospitalConsultancyDashboard.partnership.pending.desc", {hospital: status.hospital_name})}
        </p>
      </Card>
    );
  }

  if (status.state === "rejected") {
    return (
      <Card>
        <div style={{fontSize:"30px",marginBottom:"10px"}}>⚠️</div>
        <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"22px",fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 8px"}}>
          {t("hospitalConsultancyDashboard.partnership.rejected.title")}
        </h3>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-muted)",lineHeight:"1.7",marginBottom:"14px"}}>
          {t("hospitalConsultancyDashboard.partnership.rejected.desc", {hospital: status.hospital_name})}
          {status.admin_note && <>{t("hospitalConsultancyDashboard.partnership.rejected.noteFromTeam")}<em>{status.admin_note}</em></>}
        </p>
        <ApplyBtn label={t("hospitalConsultancyDashboard.partnership.rejected.applyAgain")}/>
      </Card>
    );
  }

  // not_applied (default)
  return (
    <Card>
      <div style={{fontSize:"30px",marginBottom:"10px"}}>🏥</div>
      <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"22px",fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 8px"}}>
        {t("hospitalConsultancyDashboard.partnership.notApplied.title")}
      </h3>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-muted)",lineHeight:"1.7",marginBottom:"20px"}}>
        {t("hospitalConsultancyDashboard.partnership.notApplied.desc")}
      </p>
      <ApplyBtn label="Partner With Us →"/>
    </Card>
  );
}

export default function HospitalConsultancyDashboard() {
  const { t } = useTranslation();
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const token = typeof window !== "undefined" ? localStorage.getItem("wc4a_token") : null;
  const [tab, setTab] = useState("profile");
  const [status, setStatus] = useState(null);       // empanelment status
  const [activated, setActivated] = useState(false); // swapped to a real hospital session?

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/empanelment/my-status`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        setStatus(json);

        if (json.state === "approved") {
          // Approved — silently swap this session for a real hospital
          // token so the actual HospitalDashboard component (rendered
          // below) can make its own API calls correctly, with no extra
          // click and no separate login screen.
          const res2  = await fetch(`${API}/empanelment/activate-partner-session`, {
            method:"POST", headers:{ Authorization:`Bearer ${token}` },
          });
          const json2 = await res2.json();
          if (res2.ok) {
            login(json2.user, json2.access_token);
            setActivated(true);
          }
        }
      } catch { setStatus({ state:"not_applied" }); }
    })();
  }, []);

  // Once activated, this becomes the real hospital dashboard — same URL,
  // full tabs (Profile, Photos, Banners, Billing, Upgrade Plan), with
  // premium tabs still correctly gated behind subscription payment by
  // HospitalDashboard's own existing logic.
  if (activated) return <HospitalDashboard/>;

  return (
    <div style={{minHeight:"70vh",background:"#f0f6fc"}}>
      <div style={{background:"linear-gradient(135deg,var(--wc-navy),#112d52)",padding:"36px 24px"}}>
        <div style={{maxWidth:"1000px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"12px",flexWrap:"wrap",marginBottom:"18px"}}>
            <div>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",fontWeight:"700",color:"var(--wc-green-pale)",
                letterSpacing:"2px",textTransform:"uppercase",marginBottom:"6px"}}>{t("hospitalConsultancyDashboard.eyebrow")}</p>
              <h1 style={{fontFamily:"'Manrope',sans-serif",fontSize:"30px",fontWeight:"700",color:"#fff",margin:0}}>
                {t("hospitalConsultancyDashboard.welcome")}{user?.name ? `, ${user.name}` : ""}
              </h1>
            </div>
            <div style={{display:"flex",gap:"8px",flexShrink:0}}>
              <Link to="/" target="_blank" rel="noopener noreferrer" style={{padding:"9px 16px",borderRadius:"8px",
                background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",color:"#fff",
                textDecoration:"none",fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"13px"}}>
                🏠 Home
              </Link>
              <button onClick={()=>{logout();navigate("/");}} style={{padding:"9px 16px",borderRadius:"8px",
                background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",color:"#fff",
                cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"13px"}}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"28px 24px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"24px",borderBottom:"1px solid var(--wc-border)"}}>
          {[["profile",t("hospitalConsultancyDashboard.tabProfile")],["partnership","Partner With Us"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding:"12px 18px",border:"none",background:"transparent",cursor:"pointer",
              fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"14px",
              color: tab===id ? "var(--wc-green)" : "#6b7688",
              borderBottom: `2px solid ${tab===id ? "var(--wc-green)" : "transparent"}`,
            }}>{label}</button>
          ))}
        </div>

        {!status ? (
          <p style={{fontFamily:"'Inter',sans-serif",color:"#6b7688"}}>{t("hospitalConsultancyDashboard.partnership.loading")}</p>
        ) : tab === "profile" ? <ProfileTab token={token}/> : <PartnerWithUsTab status={status}/>}
      </div>
    </div>
  );
}
