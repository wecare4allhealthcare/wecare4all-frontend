/**
 * HospitalConsultancyDashboard.jsx — landing page after logging in with
 * "Hospital Consultancy" (users table, role=patient, portal_type=hospital).
 *
 * Two tabs:
 *  - Profile: always accessible — their own contact details (users table,
 *    same /patients/profile endpoint the Healthcare Consultancy side uses).
 *  - Partnership: locked until their empanelment application is approved.
 *    Once approved, "Go to My Hospital Dashboard" swaps this session's
 *    token for a hospital-role one (activate-partner-session) and lands
 *    them on the existing, full-featured /hospital/dashboard — no second
 *    login, no rebuilding that dashboard's features here.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../components/Toast";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

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

  if (!form) return <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6b7688"}}>{t("hospitalConsultancyDashboard.profile.loading")}</p>;

  const field = (label, key, disabled=false) => (
    <div style={{marginBottom:"14px"}}>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",color:"#374151",marginBottom:"5px"}}>{label}</p>
      <input value={form[key] || ""} disabled={disabled}
        onChange={e => setForm({...form, [key]: e.target.value})}
        style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"10px 13px",
          fontFamily:"'DM Sans',sans-serif",fontSize:"14px",background:disabled?"#f8fafc":"#fff"}}/>
    </div>
  );

  return (
    <div style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"14px",padding:"24px",maxWidth:"520px"}}>
      {field(t("hospitalConsultancyDashboard.profile.fullName"),"full_name")}
      {field(t("hospitalConsultancyDashboard.profile.emailRegistered"),"email",true)}
      {field(t("hospitalConsultancyDashboard.profile.mobileRegistered"),"mobile",true)}
      {field(t("hospitalConsultancyDashboard.profile.city"),"city")}
      {field(t("hospitalConsultancyDashboard.profile.state"),"state")}
      {field(t("hospitalConsultancyDashboard.profile.address"),"address")}
      {field(t("hospitalConsultancyDashboard.profile.pincode"),"pincode")}
      <button onClick={save} disabled={saving} style={{
        padding:"11px 24px",borderRadius:"9px",border:"none",
        background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",
        cursor:saving?"not-allowed":"pointer",
      }}>{saving?t("hospitalConsultancyDashboard.profile.saving"):t("hospitalConsultancyDashboard.profile.saveChanges")}</button>
    </div>
  );
}

function PartnershipTab({ token }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus]   = useState(null);
  const [activating, setActivating] = useState(false);

  const fetchStatus = async () => {
    try {
      const res  = await fetch(`${API}/empanelment/my-status`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setStatus(json);
    } catch { setStatus({ state:"not_applied" }); }
  };
  useEffect(() => { fetchStatus(); }, [token]);

  const activatePartnerDashboard = async () => {
    setActivating(true);
    try {
      const res  = await fetch(`${API}/empanelment/activate-partner-session`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || t("hospitalConsultancyDashboard.partnership.activateFailed"));
      login(json.user, json.access_token);
      navigate("/hospital/dashboard", { replace:true });
    } catch (e) { showToast(e.message, "error"); }
    finally { setActivating(false); }
  };

  if (!status) return <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6b7688"}}>{t("hospitalConsultancyDashboard.partnership.loading")}</p>;

  const Card = ({ children }) => (
    <div style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"14px",padding:"28px",maxWidth:"560px"}}>{children}</div>
  );

  if (status.state === "not_applied") {
    return (
      <Card>
        <div style={{fontSize:"30px",marginBottom:"10px"}}>🏥</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 8px"}}>
          {t("hospitalConsultancyDashboard.partnership.notApplied.title")}
        </h3>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",lineHeight:"1.7",marginBottom:"20px"}}>
          {t("hospitalConsultancyDashboard.partnership.notApplied.desc")}
        </p>
        <Link to="/partner-with-us" style={{
          display:"inline-block",padding:"12px 24px",borderRadius:"9px",
          background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
          fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",textDecoration:"none",
        }}>{t("hospitalConsultancyDashboard.partnership.notApplied.startBtn")}</Link>
      </Card>
    );
  }

  if (status.state === "pending") {
    return (
      <Card>
        <div style={{fontSize:"30px",marginBottom:"10px"}}>⏳</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 8px"}}>
          {t("hospitalConsultancyDashboard.partnership.pending.title")}
        </h3>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",lineHeight:"1.7"}}>
          {t("hospitalConsultancyDashboard.partnership.pending.desc", {hospital: status.hospital_name})}
        </p>
      </Card>
    );
  }

  if (status.state === "rejected") {
    return (
      <Card>
        <div style={{fontSize:"30px",marginBottom:"10px"}}>⚠️</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 8px"}}>
          {t("hospitalConsultancyDashboard.partnership.rejected.title")}
        </h3>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",lineHeight:"1.7",marginBottom:"14px"}}>
          {t("hospitalConsultancyDashboard.partnership.rejected.desc", {hospital: status.hospital_name})}
          {status.admin_note && <>{t("hospitalConsultancyDashboard.partnership.rejected.noteFromTeam")}<em>{status.admin_note}</em></>}
        </p>
        <Link to="/partner-with-us" style={{
          display:"inline-block",padding:"12px 24px",borderRadius:"9px",
          border:"1.5px solid #e2eaf4",color:"#0b1f3a",
          fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",textDecoration:"none",
        }}>{t("hospitalConsultancyDashboard.partnership.rejected.applyAgain")}</Link>
      </Card>
    );
  }

  // approved
  return (
    <Card>
      <div style={{fontSize:"30px",marginBottom:"10px"}}>🎉</div>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 8px"}}>
        {t("hospitalConsultancyDashboard.partnership.approved.title")}
      </h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",lineHeight:"1.7",marginBottom:"20px"}}>
        {t("hospitalConsultancyDashboard.partnership.approved.desc", {hospital: status.hospital_name, tier: status.tier})}
      </p>
      <button onClick={activatePartnerDashboard} disabled={activating} style={{
        padding:"12px 24px",borderRadius:"9px",border:"none",
        background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
        cursor:activating?"not-allowed":"pointer",
      }}>{activating?t("hospitalConsultancyDashboard.partnership.approved.opening"):t("hospitalConsultancyDashboard.partnership.approved.goToDashboard")}</button>
    </Card>
  );
}

export default function HospitalConsultancyDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("wc4a_token") : null;
  const [tab, setTab] = useState("profile");

  return (
    <div style={{minHeight:"70vh",background:"#f0f6fc"}}>
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"36px 24px"}}>
        <div style={{maxWidth:"1000px",margin:"0 auto"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",
            letterSpacing:"2px",textTransform:"uppercase",marginBottom:"6px"}}>{t("hospitalConsultancyDashboard.eyebrow")}</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"30px",fontWeight:"700",color:"#fff",margin:0}}>
            {t("hospitalConsultancyDashboard.welcome")}{user?.name ? `, ${user.name}` : ""}
          </h1>
        </div>
      </div>

      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"28px 24px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"24px",borderBottom:"1px solid #e2eaf4"}}>
          {[["profile",t("hospitalConsultancyDashboard.tabProfile")],["partnership",t("hospitalConsultancyDashboard.tabPartnership")]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding:"12px 18px",border:"none",background:"transparent",cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
              color: tab===id ? "#047857" : "#6b7688",
              borderBottom: `2px solid ${tab===id ? "#047857" : "transparent"}`,
            }}>{label}</button>
          ))}
        </div>

        {tab === "profile" ? <ProfileTab token={token}/> : <PartnershipTab token={token}/>}
      </div>
    </div>
  );
}
