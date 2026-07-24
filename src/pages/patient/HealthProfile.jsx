/**
 * patient/HealthProfile.jsx — patient's own medical history, viewable
 * here and by any doctor they have an appointment relationship with
 * (see doctor/PatientHistory.jsx for that side).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../components/Toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.hp{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.hp *{box-sizing:border-box;} .hp a{text-decoration:none;}
.hp h1,.hp h2,.hp h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.hp-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:10px 13px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;
  outline:none;transition:all .2s;-webkit-appearance:none;}
.hp-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.hp-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.hp-grid{display:grid;grid-template-columns:1fr;gap:14px;}
@media(min-width:560px){ .hp-grid-2{grid-template-columns:1fr 1fr;} }
.hp-btn{background:linear-gradient(135deg,#047857,#059669);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:12px 28px;border-radius:9px;border:none;cursor:pointer;
  box-shadow:0 4px 16px rgba(4,120,87,.30);transition:all .2s;}
.hp-btn:hover{transform:translateY(-1px);}
.hp-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
`;

// FIELDS/TEXT_FIELDS labels come from t("healthProfilePage.*") inside the
// component (translation needs the useTranslation hook).
const FIELD_KEYS = [
  { key:"height_cm", labelKey:"heightCm", type:"number", placeholder:"170" },
  { key:"weight_kg", labelKey:"weightKg", type:"number", placeholder:"65" },
];
const TEXT_FIELD_KEYS = [
  { key:"allergies", labelKey:"allergies" },
  { key:"chronic_conditions", labelKey:"chronicConditions" },
  { key:"current_medications", labelKey:"currentMedications" },
  { key:"past_surgeries", labelKey:"pastSurgeries" },
  { key:"notes", labelKey:"notes" },
];

export default function HealthProfile() {
  const { t } = useTranslation();
  const FIELDS = FIELD_KEYS.map(f => ({
    ...f, label: t(`healthProfilePage.fields.${f.labelKey}`),
  }));
  const TEXT_FIELDS = TEXT_FIELD_KEYS.map(f => ({
    ...f,
    label: t(`healthProfilePage.textFields.${f.labelKey}`),
    placeholder: t(`healthProfilePage.textFields.${f.labelKey}Placeholder`),
  }));
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [consentGiven, setConsentGiven] = useState(!!user?.hr_health_consent_given);
  const [consentSaving, setConsentSaving] = useState(false);

  useEffect(() => {
    document.title = "Health Profile — We Care 4 'all'";
    (async () => {
      try {
        const token = localStorage.getItem("wc4a_token");
        const res = await fetch(`${API}/health-profile`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        setForm(json);
      } catch { setForm({}); }
    })();
  }, []);

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const toggleConsent = async () => {
    setConsentSaving(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const next = !consentGiven;
      const res = await fetch(`${API}/company/employee/health-consent`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ consent: next }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.detail || "Couldn't update consent."); }
      setConsentGiven(next);
      showToast(next ? "HR can now view your health records." : "HR access to your health records has been revoked.", "success");
    } catch (ex) { showToast(ex.message, "error"); }
    finally { setConsentSaving(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setErr(""); setSaved(false);
    setSaving(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/health-profile`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
          weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
          allergies: form.allergies || null,
          chronic_conditions: form.chronic_conditions || null,
          current_medications: form.current_medications || null,
          past_surgeries: form.past_surgeries || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.detail || t("healthProfilePage.saveFailed")); }
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  };

  if (!form) return (
    <div className="hp" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <style>{G}</style>
      <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",borderTop:"3px solid #047857",
        borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
    </div>
  );

  return (
    <div className="hp">
      <style>{G}</style>
      <div style={{maxWidth:"640px",margin:"0 auto",padding:"20px 16px 60px"}}>
        <Link to="/patient/dashboard" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b"}}>{t("healthProfilePage.backToDashboard")}</Link>
        <h1 style={{fontSize:"28px",fontWeight:"700",color:"#0b1f3a",margin:"6px 0 4px"}}>{t("healthProfilePage.heading")}</h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"18px"}}>
          {t("healthProfilePage.subtitle")}
        </p>

        {user?.company_id && (
          <div style={{
            background: consentGiven ? "#eefaf3" : "#fff8ec",
            border: `1px solid ${consentGiven ? "#bbf0d4" : "#f3d5a3"}`,
            borderRadius: "12px", padding: "16px 18px", marginBottom: "20px",
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", flexWrap: "wrap",
          }}>
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:"13.5px",color:"#0b1f3a",margin:"0 0 4px"}}>
                {consentGiven ? "✅ HR can view your health records" : "🔒 HR cannot view your health records"}
              </p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",margin:0}}>
                Your employer's HR team can only see this if you allow it — you can revoke access anytime.
              </p>
            </div>
            <button type="button" onClick={toggleConsent} disabled={consentSaving} className="hp-btn"
              style={{background: consentGiven ? "#fff" : undefined, color: consentGiven ? "#991b1b" : "#fff",
                border: consentGiven ? "1.5px solid #991b1b" : "none", boxShadow: "none", padding: "9px 18px", fontSize: "13px"}}>
              {consentSaving ? "Saving…" : consentGiven ? "Revoke Access" : "Allow HR Access"}
            </button>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="hp-grid hp-grid-2" style={{marginBottom:"16px"}}>
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="hp-lbl" htmlFor={`patient-healthprofile-${f.key}`}>{f.label}</label>
                <input id={`patient-healthprofile-${f.key}`} type={f.type} className="hp-inp" placeholder={f.placeholder}
                  value={form[f.key] ?? ""} onChange={e=>set(f.key, e.target.value)}/>
              </div>
            ))}
          </div>
          <div className="hp-grid">
            {TEXT_FIELDS.map(f => (
              <div key={f.key}>
                <label className="hp-lbl" htmlFor={`patient-healthprofile-${f.key}`}>{f.label}</label>
                <textarea id={`patient-healthprofile-${f.key}`} className="hp-inp" rows={2} style={{resize:"vertical"}} placeholder={f.placeholder}
                  value={form[f.key] ?? ""} onChange={e=>set(f.key, e.target.value)}/>
              </div>
            ))}
          </div>

          {err && <p style={{color:"#dc2626",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginTop:"12px"}}>⚠ {err}</p>}
          {saved && <p style={{color:"#15803d",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginTop:"12px"}}>{t("healthProfilePage.saved")}</p>}

          <button type="submit" disabled={saving} className="hp-btn" style={{marginTop:"18px"}}>
            {saving ? t("healthProfilePage.saving") : t("healthProfilePage.saveBtn")}
          </button>
        </form>
      </div>
    </div>
  );
}
