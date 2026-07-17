/**
 * Login.jsx — Fixed
 * - paddingTop:"72px" on hero so content isn't hidden under navbar
 * - Issue 3: New patients must fill name, email, mobile, designation before entering
 */
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  .lg*{box-sizing:border-box;margin:0;padding:0;}
  .lg{font-family:'DM Sans',sans-serif;}
  .lg-inp{width:100%;border:1.5px solid #d1dce8;border-radius:10px;padding:12px 16px;
    font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;
    transition:all 0.2s;outline:none;}
  .lg-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,0.09);}
  .lg-inp.err{border-color:#ef4444;background:#fef2f2;}
  .lg-tab{flex:1;padding:10px 6px;border:none;font-family:'DM Sans',sans-serif;
    font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;
    white-space:normal;word-break:break-word;line-height:1.25;min-width:0;}
  .lg-tab.on{background:linear-gradient(135deg,#047857,#059669);color:#fff;}
  .lg-tab:not(.on){background:#f8fafc;color:#64748b;}
  .lg-tab:not(.on):hover{background:#f0fdf4;color:#047857;}
  /* Staff login has 4 tabs (Doctor/Hospital/Pharmacy/Admin) in one row — at
     4x flex:1 with long Tamil labels ("மருத்துவமனை" etc.) each tab is too
     narrow to hold its word, and since the row parent uses overflow:hidden
     (to keep the rounded corners), that overflow was getting silently
     clipped instead of wrapped — the "getting hide" bug. Below 420px, drop
     to a 2x2 grid instead of squeezing 4 across. */
  .lg-stafftabs{display:flex;border-radius:10px;overflow:hidden;border:1.5px solid #e2eaf4;}
  @media(max-width:420px){
    .lg-stafftabs{flex-wrap:wrap;}
    .lg-stafftabs .lg-tab{flex:1 1 50%;}
  }
  .otp-box{width:54px;height:58px;border:2px solid #d1dce8;border-radius:12px;
    text-align:center;font-size:22px;font-weight:700;color:#0b1f3a;background:#f8fafc;
    outline:none;transition:all 0.2s;font-family:'DM Sans',sans-serif;}
  .otp-box:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,0.10);}
  .otp-box.filled{border-color:#047857;background:#f0fdf4;color:#047857;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  .fade-up{animation:fadeUp 0.45s ease forwards;}
  .spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,0.4);
    border-top:2px solid #fff;border-radius:50%;animation:spin 0.75s linear infinite;display:inline-block;}
`;

const COUNTRY_CODES = [
  {code:"+91",flag:"🇮🇳",name:"India"},
  {code:"+1", flag:"🇺🇸",name:"USA"},
  {code:"+44",flag:"🇬🇧",name:"UK"},
  {code:"+971",flag:"🇦🇪",name:"UAE"},
  {code:"+65",flag:"🇸🇬",name:"SG"},
  {code:"+61",flag:"🇦🇺",name:"AU"},
  {code:"+94",flag:"🇱🇰",name:"LK"},
];

// Note: designation is still captured (defaulted silently based on portal
// below) and sent to the backend — just no longer shown as a dropdown for
// the person to fill in, per request.

// ── OTP Boxes ────────────────────────────────────────────────
function OTPBoxes({ value, onChange, disabled }) {
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const digits = (value + "    ").slice(0, 4).split("");
  const handle = (i, e) => {
    if (e.key === "Backspace") {
      const a = [...digits]; a[i] = " ";
      onChange(a.join("").trimEnd());
      if (i > 0) refs[i-1].current?.focus();
    }
  };
  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const a = [...digits]; a[i] = v || " ";
    onChange(a.join("").trimEnd());
    if (v && i < 3) refs[i+1].current?.focus();
  };
  const paste = e => {
    const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,4);
    onChange(p);
    if (p.length > 0) refs[Math.min(p.length-1, 3)].current?.focus();
    e.preventDefault();
  };
  return (
    <div style={{display:"flex",gap:"10px",justifyContent:"center"}}>
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={d.trim()} disabled={disabled}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handle(i, e)}
          onPaste={paste}
          className={`otp-box${d.trim() ? " filled" : ""}`} />
      ))}
    </div>
  );
}

// ── Resend Timer ─────────────────────────────────────────────
function ResendTimer({ trigger, onResend }) {
  const { t } = useTranslation();
  const [secs, setSecs] = useState(60);
  useEffect(() => {
    setSecs(60);
    const t = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(t); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [trigger]);
  return (
    <div style={{textAlign:"center",marginTop:"10px"}}>
      {secs > 0
        ? <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#6b7688"}}>
            {t("loginPage.resendTimer.resendIn", {secs})}
          </span>
        : <button onClick={onResend} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            fontWeight:"700",color:"#047857",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>
            {t("loginPage.resendTimer.resendOtp")}
          </button>}
    </div>
  );
}

// ── Registration Form (new patients) ─────────────────────────
function RegistrationForm({ identifier, identifierType, tempToken, portal = "healthcare", onComplete }) {
  const { t } = useTranslation();
  const isHospitalPortal = portal === "hospital";
  const [form, setForm] = useState({
    full_name: "", email: "", mobile: "",
    designation: isHospitalPortal ? "Hospital Representative" : "Patient",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const set = (k, v) => setForm(p => ({...p, [k]: v}));

  const handleSubmit = async e => {
    e.preventDefault(); setErr("");
    if (!form.full_name.trim()) { setErr(t("loginPage.registration.nameRequired")); return; }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setErr(t("loginPage.registration.emailRequired")); return;
    }
    if (!form.mobile.trim() || form.mobile.replace(/\D/g,"").length < 7) {
      setErr(t("loginPage.registration.mobileRequired")); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/complete-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${tempToken}` },
        body: JSON.stringify({
          full_name:   form.full_name.trim(),
          email:       form.email.trim().toLowerCase(),
          mobile:      form.mobile.replace(/\D/g,""),
          designation: form.designation,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || t("loginPage.registration.failed"));
      onComplete(json);
    } catch(ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="fade-up"
      style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      <div style={{background:"#f0fdf4",border:"1px solid #86efac",
        borderRadius:"10px",padding:"13px",marginBottom:"2px"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
          color:"#15803d",fontWeight:"600",margin:0}}>
          {t("loginPage.registration.welcome")}
        </p>
      </div>

      {[
        ["full_name","text",t("loginPage.registration.fullName"),t("loginPage.registration.fullNamePlaceholder")],
        ["email",    "email",t("loginPage.registration.email"),t("loginPage.registration.emailPlaceholder")],
        ["mobile",   "tel",t("loginPage.registration.mobile"),t("loginPage.registration.mobilePlaceholder")],
      ].map(([k, type, label, ph]) => (
        <div key={k}>
          <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
            fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor={`auth-login-register-${k}`}>
            {label}
          </label>
          <input id={`auth-login-register-${k}`} type={type} value={form[k]}
            onChange={e => set(k, e.target.value)}
            placeholder={ph} className="lg-inp" autoFocus={k==="full_name"}/>
        </div>
      ))}

      {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",
        fontSize:"12px",margin:0}}>⚠ {err}</p>}

      <button type="submit" disabled={loading} style={{
        background:"linear-gradient(135deg,#047857,#059669)",
        color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
        fontSize:"14px",padding:"13px",borderRadius:"10px",border:"none",
        cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,
        display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
        boxShadow:"0 4px 14px rgba(4,120,87,0.38)",
      }}>
        {loading ? <><span className="spinner"/>{t("loginPage.registration.saving")}</> : t("loginPage.registration.completeBtn")}
      </button>
    </form>
  );
}

// ── Email OTP ─────────────────────────────────────────────────
// Patient / Healthcare Consultancy only — Hospital login is
// email+password again (see StaffTab below).
function EmailTab({ onSuccess, portal = "healthcare", agreed = false, agreedFacilitation = false }) {
  const { t } = useTranslation();
  const [step, setStep]     = useState("email");
  const [email, setEmail]   = useState("");
  const [otp, setOtp]       = useState("");
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew]   = useState(false);
  const [err, setErr]       = useState("");
  const [resendKey, setResendKey] = useState(0);
  const [tempToken, setTempToken] = useState("");
  const apiPortal = portal === "hospital" ? "hospital" : "patient";

  const sendOTP = async e => {
    e?.preventDefault(); setErr("");
    if (!/\S+@\S+\.\S+/.test(email)) { setErr(t("loginPage.emailTab.invalidEmail")); return; }
    setLoading(true);
    try {
      const r = await authAPI.sendEmailOTP(email.trim().toLowerCase(), apiPortal);
      setIsNew(r.data.is_new_user);
      setStep("otp");
      setResendKey(k => k + 1);
    } catch(ex) { setErr(ex.response?.data?.detail || t("loginPage.emailTab.sendFailed")); }
    finally { setLoading(false); }
  };

  const verifyOTP = async e => {
    e?.preventDefault(); setErr("");
    if (otp.trim().length < 4) { setErr(t("loginPage.emailTab.otpRequired")); return; }
    setLoading(true);
    try {
      const r = await authAPI.verifyEmailOTP(email.trim().toLowerCase(), otp.trim(), apiPortal, agreed, agreedFacilitation);
      // If new user → show registration form (works the same for both
      // Healthcare and Hospital Consultancy — a brand-new email/mobile
      // always needs a name/designation before continuing).
      if (r.data.needs_registration) {
        setTempToken(r.data.temp_token);
        setStep("register");
      } else {
        onSuccess(r.data);
      }
    } catch(ex) { setErr(ex.response?.data?.detail || t("loginPage.emailTab.incorrectOtp")); setOtp(""); }
    finally { setLoading(false); }
  };

  if (step === "register") {
    return (
      <RegistrationForm
        identifier={email}
        identifierType="email"
        tempToken={tempToken}
        portal={portal}
        onComplete={onSuccess}
      />
    );
  }

  if (step === "otp") return (
    <form onSubmit={verifyOTP} className="fade-up"
      style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div style={{background:"#f0fdf4",border:"1px solid #86efac",
        borderRadius:"10px",padding:"13px",textAlign:"center"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#15803d",fontWeight:"600"}}>{t("loginPage.emailTab.otpSentTo")}</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#14532d",fontWeight:"700",marginTop:"2px"}}>{email}</p>
        {isNew && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#16a34a",marginTop:"4px"}}>{t("loginPage.emailTab.newAccountNote")}</p>}
      </div>
      <div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",color:"#374151",textAlign:"center",marginBottom:"12px"}}>{t("loginPage.emailTab.enterOtp")}</p>
        <OTPBoxes value={otp} onChange={setOtp} disabled={loading}/>
        {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px",marginTop:"8px",textAlign:"center"}}>⚠ {err}</p>}
        <ResendTimer key={resendKey} trigger={resendKey} onResend={() => { setOtp(""); sendOTP(); }}/>
      </div>
      <button type="submit" disabled={loading || otp.trim().length < 4} style={{
        background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
        padding:"13px",borderRadius:"10px",border:"none",
        cursor:loading?"not-allowed":"pointer",opacity:loading||otp.trim().length<4?0.65:1,
        display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
        boxShadow:"0 4px 14px rgba(4,120,87,0.38)",
      }}>
        {loading ? <><span className="spinner"/>{t("loginPage.emailTab.verifying")}</> : t("loginPage.emailTab.verifyBtn")}
      </button>
      <button type="button" onClick={() => {setStep("email"); setOtp(""); setErr("");}}
        style={{background:"none",border:"none",color:"#64748b",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",cursor:"pointer",textAlign:"center"}}>
        {t("loginPage.emailTab.changeEmail")}
      </button>
    </form>
  );

  return (
    <form onSubmit={sendOTP} className="fade-up"
      style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div>
        <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="auth-login-email-address">{t("loginPage.emailTab.emailLabel")}</label>
        <input id="auth-login-email-address" type="email" value={email} autoFocus
          onChange={e => { setEmail(e.target.value); setErr(""); }}
          placeholder={t("loginPage.emailTab.emailPlaceholder")} className={`lg-inp${err?" err":""}`}/>
        {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px",marginTop:"4px"}}>⚠ {err}</p>}
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688",marginTop:"5px"}}>{t("loginPage.emailTab.otpNote")}</p>
      </div>
      <button type="submit" disabled={loading||!email} style={{
        background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
        padding:"13px",borderRadius:"10px",border:"none",
        cursor:loading?"not-allowed":"pointer",opacity:loading||!email?0.65:1,
        display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
        boxShadow:"0 4px 14px rgba(4,120,87,0.38)",
      }}>
        {loading ? <><span className="spinner"/>{t("loginPage.emailTab.sendingOtp")}</> : t("loginPage.emailTab.sendBtn")}
      </button>
    </form>
  );
}

// ── SMS OTP ───────────────────────────────────────────────────
function SMSTab({ onSuccess, portal = "healthcare", agreed = false, agreedFacilitation = false }) {
  const { t } = useTranslation();
  const [step, setStep]   = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [cc, setCC]       = useState("+91");
  const [otp, setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState("");
  const [resendKey, setResendKey] = useState(0);
  const [tempToken, setTempToken] = useState("");
  const apiPortal = portal === "hospital" ? "hospital" : "patient";

  const sendOTP = async e => {
    e?.preventDefault(); setErr("");
    const clean = mobile.replace(/\D/g,"");
    if (clean.length < 7) { setErr(t("loginPage.smsTab.invalidMobile")); return; }
    setLoading(true);
    try {
      await authAPI.sendSMSOTP(clean, cc, apiPortal);
      setStep("otp"); setResendKey(k => k+1);
    } catch(ex) { setErr(ex.response?.data?.detail || t("loginPage.smsTab.sendFailed")); }
    finally { setLoading(false); }
  };

  const verifyOTP = async e => {
    e?.preventDefault(); setErr("");
    if (otp.trim().length < 4) { setErr(t("loginPage.smsTab.otpRequired")); return; }
    setLoading(true);
    try {
      const r = await authAPI.verifySMSOTP(mobile.replace(/\D/g,""), cc, otp.trim(), apiPortal, agreed, agreedFacilitation);
      if (r.data.needs_registration) {
        setTempToken(r.data.temp_token);
        setStep("register");
      } else {
        onSuccess(r.data);
      }
    } catch(ex) { setErr(ex.response?.data?.detail || t("loginPage.smsTab.incorrectOtp")); setOtp(""); }
    finally { setLoading(false); }
  };

  if (step === "register") return (
    <RegistrationForm identifier={mobile} identifierType="mobile"
      tempToken={tempToken} portal={portal} onComplete={onSuccess}/>
  );

  if (step === "otp") return (
    <form onSubmit={verifyOTP} className="fade-up"
      style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",padding:"13px",textAlign:"center"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#15803d",fontWeight:"600"}}>{t("loginPage.smsTab.otpSentTo")}</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#14532d",fontWeight:"700",marginTop:"2px"}}>{cc} {mobile}</p>
      </div>
      <div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",color:"#374151",textAlign:"center",marginBottom:"12px"}}>{t("loginPage.smsTab.enterOtp")}</p>
        <OTPBoxes value={otp} onChange={setOtp} disabled={loading}/>
        {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px",marginTop:"8px",textAlign:"center"}}>⚠ {err}</p>}
        <ResendTimer key={resendKey} trigger={resendKey} onResend={() => { setOtp(""); sendOTP(); }}/>
      </div>
      <button type="submit" disabled={loading||otp.trim().length<4} style={{
        background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
        padding:"13px",borderRadius:"10px",border:"none",
        cursor:loading?"not-allowed":"pointer",opacity:loading||otp.trim().length<4?0.65:1,
        display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
        boxShadow:"0 4px 14px rgba(4,120,87,0.38)",
      }}>
        {loading ? <><span className="spinner"/>{t("loginPage.smsTab.verifying")}</> : t("loginPage.smsTab.verifyBtn")}
      </button>
      <button type="button" onClick={() => {setStep("mobile"); setOtp(""); setErr("");}}
        style={{background:"none",border:"none",color:"#64748b",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",cursor:"pointer",textAlign:"center"}}>
        {t("loginPage.smsTab.changeNumber")}
      </button>
    </form>
  );

  return (
    <form onSubmit={sendOTP} className="fade-up"
      style={{display:"flex",flexDirection:"column",gap:"16px"}}>
      <div>
        <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="auth-login-mobile-number">{t("loginPage.smsTab.mobileLabel")}</label>
        <div style={{display:"flex",gap:"8px"}}>
          <select aria-label="Country code" value={cc} onChange={e => setCC(e.target.value)}
            className="lg-inp" style={{width:"auto",flexShrink:0,paddingRight:"8px"}}>
            {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
          </select>
          <input id="auth-login-mobile-number" type="tel" value={mobile} autoFocus
            onChange={e => {setMobile(e.target.value); setErr("");}}
            placeholder={t("loginPage.smsTab.mobilePlaceholder")} className={`lg-inp${err?" err":""}`} style={{flex:1}}/>
        </div>
        {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px",marginTop:"4px"}}>⚠ {err}</p>}
      </div>
      <button type="submit" disabled={loading||!mobile} style={{
        background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
        padding:"13px",borderRadius:"10px",border:"none",
        cursor:loading?"not-allowed":"pointer",opacity:loading||!mobile?0.65:1,
        display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
        boxShadow:"0 4px 14px rgba(4,120,87,0.38)",
      }}>
        {loading ? <><span className="spinner"/>{t("loginPage.smsTab.sending")}</> : t("loginPage.smsTab.sendBtn")}
      </button>
    </form>
  );
}

// ── Staff Login ───────────────────────────────────────────────
// Doctor, Admin, and Hospital — Hospital Consultancy login is
// email+password again (reverted from the OTP self-serve flow).
function StaffTab({ onSuccess, initialType }) {
  const { t } = useTranslation();
  const [type, setType]       = useState(initialType || "doctor");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const handle = async e => {
    e.preventDefault(); setErr("");
    if (!email||!password) { setErr(t("loginPage.staffTab.credentialsRequired")); return; }
    setLoading(true);
    try {
      const fn = type==="admin" ? authAPI.adminLogin
               : type==="hospital" ? authAPI.hospitalLogin
               : type==="pharmacy" ? authAPI.pharmacyLogin
               : authAPI.doctorLogin;
      const r  = await fn(email, password);
      onSuccess(r.data);
    } catch(ex) { setErr(ex.response?.data?.detail || t("loginPage.staffTab.invalidCredentials")); }
    finally { setLoading(false); }
  };

  const loginAsLabel = {
    admin: t("loginPage.staffTab.loginAsAdmin"),
    hospital: t("loginPage.staffTab.loginAsHospital"),
    doctor: t("loginPage.staffTab.loginAsDoctor"),
    pharmacy: t("loginPage.staffTab.loginAsPharmacy"),
  }[type];

  return (
    <form onSubmit={handle} className="fade-up"
      style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      <div className="lg-stafftabs">
        {["doctor","hospital","pharmacy","admin"].map(ty => (
          <button key={ty} type="button" onClick={() => setType(ty)}
            className={`lg-tab${type===ty?" on":""}`}>
            {ty==="doctor" ? t("loginPage.staffTab.doctorTab") : ty==="hospital" ? t("loginPage.staffTab.hospitalTab") : ty==="pharmacy" ? t("loginPage.staffTab.pharmacyTab") : t("loginPage.staffTab.adminTab")}
          </button>
        ))}
      </div>
      {[["email","email",t("loginPage.staffTab.email"),t("loginPage.staffTab.emailPlaceholder")],
        ["password","password",t("loginPage.staffTab.password"),t("loginPage.staffTab.passwordPlaceholder")]
      ].map(([k, type2, label, ph]) => (
        <div key={k}>
          <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor={`auth-login-staff-${k}`}>{label}</label>
          <div style={{position:"relative"}}>
            <input id={`auth-login-staff-${k}`} type={k==="password" ? (showPwd?"text":"password") : type2}
              value={k==="email"?email:password}
              onChange={e => k==="email" ? setEmail(e.target.value) : setPassword(e.target.value)}
              placeholder={ph} className={`lg-inp${err&&k==="password"?" err":""}`}
              style={k==="password"?{paddingRight:"42px"}:{}}/>
            {k==="password" && (
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",color:"#6b7688",fontSize:"15px"}}>
                {showPwd ? "🙈" : "👁️"}
              </button>
            )}
          </div>
        </div>
      ))}
      {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px"}}> ⚠ {err}</p>}
      <button type="submit" disabled={loading} style={{
        background:"linear-gradient(135deg,#0b1f3a,#1e3a5f)",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
        padding:"13px",borderRadius:"10px",border:"none",
        cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,
        display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
        boxShadow:"0 4px 14px rgba(11,31,58,0.3)",
      }}>
        {loading ? <><span className="spinner"/>{t("loginPage.staffTab.loggingIn")}</> : loginAsLabel}
      </button>
    </form>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
export default function Login() {
  const { t }       = useTranslation();
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const [tab, setTab]         = useState("email");
  const rawStaffParam = params.get("staff");
  const staffParam = ["doctor","admin","hospital"].includes(rawStaffParam) ? rawStaffParam : null;
  const [showStaff, setShowStaff] = useState(!!staffParam);
  const redirect = params.get("redirect");

  // Healthcare Consultancy vs Hospital Consultancy — both use the exact
  // same OTP login (no backend distinction, no account type stored),
  // this purely decides where they land afterwards:
  //  - healthcare → Patient Dashboard (normal patient flow)
  //  - hospital   → Home (they're here to browse/apply for empanelment,
  //    not to use a patient dashboard — once approved, they log out and
  //    log back in with the emailed password credentials instead, which
  //    is the separate Hospital tab under "Doctor / Hospital / Admin login")
  const rawPortalParam = params.get("portal");
  const [portal, setPortal] = useState(rawPortalParam === "hospital" ? "hospital" : "healthcare");

  // Compliance requirement: no login should be possible without the
  // person acknowledging these three documents first. Applies to every
  // login path on this page (patient/hospital OTP and staff login) —
  // gated below by disabling the form area, not by removing it, so the
  // fields are still visible/readable, just not interactive until checked.
  const [agreed, setAgreed] = useState(false);
  // Second, separately-tracked mandatory consent: the facilitation-service
  // disclosure. Kept as its own state (not merged into `agreed`) because
  // it's recorded to its own DB column (facilitation_consent_accepted_at,
  // migration_006) rather than the general T&C/Privacy/Rights one — per
  // the client's explicit request for independent tracking.
  const [agreedFacilitation, setAgreedFacilitation] = useState(false);

  useEffect(() => { document.title = "Login — We Care 4 'all'"; }, []);

  const handleSuccess = data => {
    const { access_token, role, user } = data;
    login(user, access_token);

    if (role === "patient") {
      // Remembered purely for the Navbar's Dashboard button afterwards —
      // a Hospital Consultancy session has no dashboard of its own
      // (they log back in with real credentials once approved instead),
      // so the button shouldn't send them to the medical patient one.
      localStorage.setItem("wc4a_login_portal", portal);
      if (portal === "hospital") {
        navigate(redirect || "/", { replace: true });
        return;
      }
    }

    const dest = redirect || {
      patient:  "/patient/dashboard",
      doctor:   "/doctor/dashboard",
      admin:    "/admin/dashboard",
      hospital: "/hospital/dashboard",
      pharmacy: "/pharmacy/dashboard",
    }[role] || "/";
    navigate(dest, { replace: true });
  };

  return (
    <div className="lg" style={{
      minHeight:"100vh", display:"flex",
      background:"linear-gradient(-45deg,#071524,#0b1f3a,#0a2e52,#062818,#0b1f3a)",
      backgroundSize:"400% 400%", animation:"grad 14s ease infinite",
      position:"relative", overflow:"hidden",
    }}>
      <style>{CSS}</style>

      {/* Dot grid */}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"-100px",right:"-100px",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(4,120,87,0.18) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>

      {/* Left info panel — desktop only */}
      <style>{`@media(max-width:900px){.lg-left{display:none!important;}}`}</style>
      <div className="lg-left" style={{flex:"0 0 44%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px",color:"#fff",position:"relative",zIndex:1}}>
        <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"10px",marginBottom:"48px",textDecoration:"none"}}>
          <img src="/assets/img/logo/final.png" alt="" style={{height:"36px",width:"auto"}} onError={e=>{e.target.style.display="none";}}/>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"19px",fontWeight:"700",color:"#fff"}}>
            We Care 4 <span style={{color:"#34d399"}}>'all'</span>
          </span>
        </Link>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,3.5vw,50px)",fontWeight:"700",lineHeight:"1.15",marginBottom:"18px"}}>
          {t("loginPage.main.heroTitle1")}<br/>
          <span style={{background:"linear-gradient(90deg,#34d399,#6ee7b7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {t("loginPage.main.heroTitle2")}
          </span>
        </h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"rgba(255,255,255,0.65)",lineHeight:"1.75",maxWidth:"360px",fontWeight:"300",marginBottom:"36px"}}>
          {t("loginPage.main.heroSubtitle")}
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {t("loginPage.main.features",{returnObjects:true}).map(([icon,title,sub]) => (
            <div key={title} style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 15px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:"10px"}}>
              <span style={{fontSize:"18px"}}>{icon}</span>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",color:"#fff",margin:0}}>{title}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.5)",margin:0}}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login card */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",zIndex:1}}>
        <div style={{width:"100%",maxWidth:"410px",background:"#fff",borderRadius:"20px",boxShadow:"0 40px 80px rgba(0,0,0,0.45)",overflow:"hidden"}}>

          {/* Card header */}
          <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"26px 30px"}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>
              {showStaff ? t("loginPage.main.teamLogin") : (portal === "hospital" ? t("loginPage.main.hospitalLogin") : t("loginPage.main.patientLogin"))}
            </h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.55)"}}>
              {showStaff ? t("loginPage.main.teamLoginSub") : t("loginPage.main.otpSub")}
            </p>
          </div>

          {/* Card body */}
          <div style={{padding:"26px 30px"}}>
            {/* Consent gate — required before any login/registration action.
                Two SEPARATE checkboxes, each tracked on its own DB column
                (consent_accepted_at vs facilitation_consent_accepted_at) —
                both must be checked to unlock the form below. */}
            <div style={{background:"#f8fafc",border:"1px solid #e2eaf4",
              borderRadius:"10px",padding:"12px 14px",marginBottom:"10px"}}>
              <label style={{display:"flex",alignItems:"flex-start",gap:"9px",cursor:"pointer"}}>
                <input type="checkbox" checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{marginTop:"2px",width:"15px",height:"15px",flexShrink:0,
                    accentColor:"#047857",cursor:"pointer"}}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#475569",lineHeight:"1.6"}}>
                  {t("loginPage.main.consentPrefix")}{" "}
                  <Link to="/terms" target="_blank" rel="noopener noreferrer"
                    style={{color:"#047857",fontWeight:"600"}}>{t("loginPage.main.termsConditions")}</Link>,{" "}
                  <Link to="/privacy" target="_blank" rel="noopener noreferrer"
                    style={{color:"#047857",fontWeight:"600"}}>{t("loginPage.main.privacyPolicy")}</Link> {t("loginPage.main.and")}{" "}
                  <Link to="/rights" target="_blank" rel="noopener noreferrer"
                    style={{color:"#047857",fontWeight:"600"}}>{t("loginPage.main.patientRights")}</Link>{t("loginPage.main.consentSuffix")}
                </span>
              </label>
              {!agreed && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                color:"#b45309",margin:"8px 0 0 24px"}}>
                {t("loginPage.main.consentRequired")}
              </p>}
            </div>

            <div style={{background:"#f8fafc",border:"1px solid #e2eaf4",
              borderRadius:"10px",padding:"12px 14px",marginBottom:"18px"}}>
              <label style={{display:"flex",alignItems:"flex-start",gap:"9px",cursor:"pointer"}}>
                <input type="checkbox" checked={agreedFacilitation}
                  onChange={e => setAgreedFacilitation(e.target.checked)}
                  style={{marginTop:"2px",width:"15px",height:"15px",flexShrink:0,
                    accentColor:"#047857",cursor:"pointer"}}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#475569",lineHeight:"1.6"}}>
                  {t("loginPage.main.facilitationConsent")}
                </span>
              </label>
              {!agreedFacilitation && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                color:"#b45309",margin:"8px 0 0 24px"}}>
                {t("loginPage.main.consentRequired")}
              </p>}
            </div>

            <div style={{position:"relative"}}>
              {!(agreed && agreedFacilitation) && <div style={{position:"absolute",inset:0,zIndex:2,cursor:"not-allowed"}}/>}
              <div style={{opacity: (agreed && agreedFacilitation) ? 1 : 0.45, pointerEvents: (agreed && agreedFacilitation) ? "auto" : "none",
                transition:"opacity .2s", filter: (agreed && agreedFacilitation) ? "none" : "grayscale(15%)"}}>
                {!showStaff ? (
                  <>
                    {/* Portal selector — which kind of account is logging in */}
                    <div style={{marginBottom:"18px"}}>
                      <p style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"6px"}}>
                        {t("loginPage.main.loginFor")}
                      </p>
                      <div style={{display:"flex",borderRadius:"10px",overflow:"hidden",border:"1.5px solid #e2eaf4"}}>
                        {[["healthcare",t("loginPage.main.portalHealthcare")],["hospital",t("loginPage.main.portalHospital")]].map(([id,label]) => (
                          <button key={id} type="button" onClick={() => setPortal(id)}
                            className={`lg-tab${portal===id?" on":""}`}>{label}</button>
                        ))}
                      </div>
                    </div>

                    <div style={{display:"flex",borderRadius:"10px",overflow:"hidden",border:"1.5px solid #e2eaf4",marginBottom:"22px"}}>
                      {[["email",t("loginPage.main.methodEmail")],["sms",t("loginPage.main.methodSms")]].map(([id,label]) => (
                        <button key={id} onClick={() => setTab(id)}
                          className={`lg-tab${tab===id?" on":""}`}>{label}</button>
                      ))}
                    </div>
                    {tab==="email"
                      ? <EmailTab onSuccess={handleSuccess} portal={portal} agreed={agreed} agreedFacilitation={agreedFacilitation}/>
                      : <SMSTab   onSuccess={handleSuccess} portal={portal} agreed={agreed} agreedFacilitation={agreedFacilitation}/>}
                  </>
                ) : (
                  <StaffTab onSuccess={handleSuccess} initialType={staffParam}/>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{marginTop:"20px",paddingTop:"16px",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <Link to="/" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688",textDecoration:"none"}}>{t("loginPage.main.backToHome")}</Link>
              <button onClick={() => setShowStaff(!showStaff)}
                style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688"}}>
                {showStaff ? t("loginPage.main.staffToggleToPatient") : t("loginPage.main.staffToggleToStaff")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
