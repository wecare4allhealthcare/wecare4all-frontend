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
    full_name: "", email: "", mobile: "", password: "", confirm_password: "",
    designation: isHospitalPortal ? "Hospital Representative" : "Patient",
  });
  const [showPwd, setShowPwd] = useState(false);
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
    if (form.password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm_password) { setErr("Passwords don't match."); return; }
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
          password:    form.password,
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

      <div>
        <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
          fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="auth-login-register-password">
          Create a Password
        </label>
        <div style={{position:"relative"}}>
          <input id="auth-login-register-password" type={showPwd ? "text" : "password"} value={form.password}
            onChange={e => set("password", e.target.value)}
            placeholder="At least 8 characters" className="lg-inp" style={{paddingRight:"44px"}}/>
          <button type="button" onClick={() => setShowPwd(s => !s)}
            style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",
              background:"none",border:"none",cursor:"pointer",fontSize:"15px"}}>
            {showPwd ? "🙈" : "👁️"}
          </button>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#94a3b8",margin:"5px 0 0"}}>
          You'll use your Patient ID + this password to log in next time — OTP is only for this first sign up.
        </p>
      </div>
      <div>
        <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
          fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="auth-login-register-confirm-password">
          Confirm Password
        </label>
        <input id="auth-login-register-confirm-password" type={showPwd ? "text" : "password"} value={form.confirm_password}
          onChange={e => set("confirm_password", e.target.value)}
          placeholder="Re-enter password" className="lg-inp"/>
      </div>

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
function EmailTab({ onSuccess, portal = "healthcare", agreed = false, agreedFacilitation = false, onSwitchToIdLogin }) {
  const { t } = useTranslation();
  const [step, setStep]     = useState("email");
  const [email, setEmail]   = useState("");
  const [otp, setOtp]       = useState("");
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew]   = useState(false);
  const [err, setErr]       = useState("");
  const [resendKey, setResendKey] = useState(0);
  const [tempToken, setTempToken] = useState("");
  const [passwordNotice, setPasswordNotice] = useState(null); // {reset_token, patient_id}
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
      if (r.data.needs_registration) {
        setTempToken(r.data.temp_token);
        setStep("register");
      } else if (r.data.needs_password_login) {
        setPasswordNotice({ reset_token: r.data.reset_token, patient_id: r.data.patient_id });
      } else {
        onSuccess(r.data);
      }
    } catch(ex) { setErr(ex.response?.data?.detail || t("loginPage.emailTab.incorrectOtp")); setOtp(""); }
    finally { setLoading(false); }
  };

  if (passwordNotice) {
    return <PasswordRequiredNotice resetToken={passwordNotice.reset_token} patientId={passwordNotice.patient_id}
      onGoToPasswordLogin={onSwitchToIdLogin}/>;
  }

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
function SMSTab({ onSuccess, portal = "healthcare", agreed = false, agreedFacilitation = false, onSwitchToIdLogin }) {
  const { t } = useTranslation();
  const [step, setStep]   = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [cc, setCC]       = useState("+91");
  const [otp, setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState("");
  const [resendKey, setResendKey] = useState(0);
  const [tempToken, setTempToken] = useState("");
  const [passwordNotice, setPasswordNotice] = useState(null);
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
      } else if (r.data.needs_password_login) {
        setPasswordNotice({ reset_token: r.data.reset_token, patient_id: r.data.patient_id });
      } else {
        onSuccess(r.data);
      }
    } catch(ex) { setErr(ex.response?.data?.detail || t("loginPage.smsTab.incorrectOtp")); setOtp(""); }
    finally { setLoading(false); }
  };

  if (passwordNotice) {
    return <PasswordRequiredNotice resetToken={passwordNotice.reset_token} patientId={passwordNotice.patient_id}
      onGoToPasswordLogin={onSwitchToIdLogin}/>;
  }

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

// ── 2FA code entry — shown when login returns requires_2fa ──────
function TwoFactorStep({ preAuthToken, onSuccess, onBack }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async e => {
    e.preventDefault(); setErr("");
    if (code.trim().length < 6) { setErr("Enter the 6-digit code from your authenticator app."); return; }
    setLoading(true);
    try {
      const r = await authAPI.verify2FALogin(preAuthToken, code.trim());
      onSuccess(r.data);
    } catch(ex) { setErr(ex.response?.data?.detail || "Invalid or expired code."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="fade-up" style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",padding:"13px",textAlign:"center"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#15803d",fontWeight:"600",margin:0}}>
          🔐 Two-Factor Authentication
        </p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#166534",margin:"4px 0 0"}}>
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>
      <input type="text" inputMode="numeric" maxLength={6} value={code}
        onChange={e => setCode(e.target.value.replace(/\D/g,""))}
        placeholder="000000" autoFocus
        className="lg-inp" style={{textAlign:"center",fontSize:"22px",letterSpacing:"6px",fontWeight:700}}/>
      {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px",margin:0,textAlign:"center"}}>⚠ {err}</p>}
      <button type="submit" disabled={loading || code.length < 6} style={{
        background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
        padding:"13px",borderRadius:"10px",border:"none",
        cursor:loading?"not-allowed":"pointer",opacity:(loading||code.length<6)?0.65:1,
      }}>
        {loading ? "Verifying…" : "Verify & Log In"}
      </button>
      <button type="button" onClick={onBack} style={{background:"none",border:"none",color:"#64748b",fontSize:"12.5px",cursor:"pointer",padding:0}}>
        ← Back to login
      </button>
    </form>
  );
}

// ── Staff Login ───────────────────────────────────────────────
// Doctor, Admin, and Hospital — Hospital Consultancy login is
// email+password again (reverted from the OTP self-serve flow).
function StaffTab({ onSuccess, initialType }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [type, setType]       = useState(initialType || "doctor");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [pending2FA, setPending2FA] = useState(null); // pre_auth_token, if the server asked for a second factor

  // Company and Employee logins have their own dedicated pages with
  // meaningfully different logic (2FA, dual owner/staff-table fallback,
  // must-change-password redirect for Company; invite-code based
  // signup-or-login for Employee) — reimplementing that here would
  // either regress it or duplicate a lot of fragile logic. Instead this
  // dropdown is a single discoverable jumping-off point: picking either
  // one just navigates straight to its real page, same as clicking a
  // link, so nothing about those flows changes.
  const handleTypeChange = (value) => {
    if (value === "company") { navigate("/company/login"); return; }
    if (value === "employee") { navigate("/company/employee-login"); return; }
    setType(value);
  };

  // Deep-link support (/login?staff=company or ?staff=employee) — the
  // dropdown's default value is only used for what's *shown*, so a
  // direct link needs this extra nudge to actually redirect on load.
  useEffect(() => {
    if (initialType === "company") navigate("/company/login", { replace: true });
    if (initialType === "employee") navigate("/company/employee-login", { replace: true });
  }, [initialType]);

  const handle = async e => {
    e.preventDefault(); setErr("");
    if (!email||!password) { setErr(t("loginPage.staffTab.credentialsRequired")); return; }
    setLoading(true);
    try {
      const fn = type==="admin" ? authAPI.adminLogin
               : type==="hospital" ? authAPI.hospitalLogin
               : type==="pharmacy" ? authAPI.pharmacyLogin
               : type==="lab" ? authAPI.labLogin
               : authAPI.doctorLogin;
      const r  = await fn(email, password);
      if (r.data.requires_2fa) { setPending2FA(r.data.pre_auth_token); return; }
      onSuccess(r.data);
    } catch(ex) { setErr(ex.response?.data?.detail || t("loginPage.staffTab.invalidCredentials")); }
    finally { setLoading(false); }
  };

  if (pending2FA) {
    return <TwoFactorStep preAuthToken={pending2FA} onSuccess={onSuccess} onBack={() => setPending2FA(null)}/>;
  }

  const loginAsLabel = {
    admin: t("loginPage.staffTab.loginAsAdmin"),
    hospital: t("loginPage.staffTab.loginAsHospital"),
    doctor: t("loginPage.staffTab.loginAsDoctor"),
    pharmacy: t("loginPage.staffTab.loginAsPharmacy"),
    lab: "Login as Lab Center",
  }[type];

  return (
    <form onSubmit={handle} className="fade-up"
      style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      <div className="lg-stafftabs">
        <label htmlFor="auth-login-staff-type" style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}}>
          I am a…
        </label>
        <select id="auth-login-staff-type" value={type} onChange={e => handleTypeChange(e.target.value)}
          className="lg-inp" style={{marginBottom:"14px"}}>
          <option value="doctor">{t("loginPage.staffTab.doctorTab")}</option>
          <option value="hospital">{t("loginPage.staffTab.hospitalTab")}</option>
          <option value="pharmacy">{t("loginPage.staffTab.pharmacyTab")}</option>
          <option value="lab">Lab Center</option>
          <option value="company">Company (Corporate Wellness)</option>
          <option value="employee">Employee (Company-added)</option>
          <option value="admin">{t("loginPage.staffTab.adminTab")}</option>
        </select>
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

// ── Patient ID + Password (returning patients) ──────────────
function PatientIdLoginTab({ onSuccess, onSwitchToOTP }) {
  const [patientId, setPatientId] = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState("");

  const handle = async e => {
    e.preventDefault(); setErr("");
    if (!patientId.trim() || !password) { setErr("Enter your Patient ID and password."); return; }
    setLoading(true);
    try {
      const r = await authAPI.patientIdLogin(patientId.trim().toUpperCase(), password);
      onSuccess(r.data);
    } catch(ex) { setErr(ex.response?.data?.detail || "Invalid Patient ID or password."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} className="fade-up" style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      <div>
        <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="auth-login-patientid">
          Patient ID
        </label>
        <input id="auth-login-patientid" type="text" value={patientId}
          onChange={e => setPatientId(e.target.value)} placeholder="e.g. WC-26-000123" className="lg-inp"
          style={{textTransform:"uppercase"}} autoFocus/>
      </div>
      <div>
        <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="auth-login-patientid-password">
          Password
        </label>
        <div style={{position:"relative"}}>
          <input id="auth-login-patientid-password" type={showPwd ? "text" : "password"} value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Your password" className="lg-inp" style={{paddingRight:"42px"}}/>
          <button type="button" onClick={() => setShowPwd(s => !s)}
            style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"15px"}}>
            {showPwd ? "🙈" : "👁️"}
          </button>
        </div>
      </div>
      {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px",margin:0}}>⚠ {err}</p>}
      <button type="submit" disabled={loading} style={{
        background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
        padding:"13px",borderRadius:"10px",border:"none",
        cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,
        display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
        boxShadow:"0 4px 14px rgba(4,120,87,0.38)",
      }}>
        {loading ? <><span className="spinner"/>Logging in…</> : "Log In"}
      </button>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif"}}>
        <button type="button" onClick={onSwitchToOTP} style={{background:"none",border:"none",color:"#047857",fontWeight:"600",cursor:"pointer",padding:0}}>
          Forgot Patient ID / password?
        </button>
        <button type="button" onClick={onSwitchToOTP} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",padding:0}}>
          New patient? Sign up
        </button>
      </div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#94a3b8",textAlign:"center",margin:0}}>
        Don't remember your Patient ID? Verify with Email/SMS OTP instead — we'll show it to you.
      </p>
    </form>
  );
}

// ── Shown when OTP is verified for an account that already has a
// password set — OTP only creates a login shortcut for brand-new
// accounts from here on; a returning account with a password must use
// it, or reset it (still via this same OTP session) if forgotten. ──
function PasswordRequiredNotice({ resetToken, patientId, onGoToPasswordLogin }) {
  const [resetting, setResetting] = useState(false);
  const [newPwd, setNewPwd]       = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading]     = useState(false);
  const [err, setErr]             = useState("");
  const [done, setDone]           = useState(false);

  const submitReset = async e => {
    e.preventDefault(); setErr("");
    if (newPwd.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (newPwd !== confirmPwd) { setErr("Passwords don't match."); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(newPwd, resetToken);
      setDone(true);
    } catch(ex) { setErr(ex.response?.data?.detail || "Couldn't reset password."); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div className="fade-up" style={{textAlign:"center",padding:"10px 0"}}>
      <div style={{width:"56px",height:"56px",background:"#f0fdf4",borderRadius:"50%",display:"flex",
        alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:"26px"}}>✅</div>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#374151",marginBottom:"18px"}}>
        Password updated. Log in with your Patient ID and new password.
      </p>
      <button onClick={onGoToPasswordLogin} style={{
        background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",
        fontWeight:"700",fontSize:"14px",padding:"12px 22px",borderRadius:"10px",border:"none",cursor:"pointer"}}>
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:"14px"}}>
      <div style={{background:"#eff8ff",border:"1px solid #bae6fd",borderRadius:"10px",padding:"13px"}}>
        {patientId && (
          <>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#0369a1",margin:0,textTransform:"uppercase",letterSpacing:".5px",fontWeight:700}}>
              Your Patient ID
            </p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"20px",color:"#0b1f3a",margin:"2px 0 8px",fontWeight:800,letterSpacing:".5px"}}>
              {patientId}
            </p>
          </>
        )}
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#0369a1",margin:0}}>
          Log in with your Patient ID and password, or set a new password below.
        </p>
      </div>

      {!resetting ? (
        <>
          <button onClick={onGoToPasswordLogin} style={{
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"700",fontSize:"14px",padding:"13px",borderRadius:"10px",border:"none",cursor:"pointer"}}>
            Go to Patient ID + Password Login
          </button>
          <button onClick={() => setResetting(true)} style={{
            background:"none",border:"1.5px solid #e2eaf4",color:"#374151",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"600",fontSize:"13px",padding:"11px",borderRadius:"10px",cursor:"pointer"}}>
            I forgot my password — reset it now
          </button>
        </>
      ) : (
        <form onSubmit={submitReset} style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
            placeholder="New password (min 8 characters)" className="lg-inp"/>
          <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
            placeholder="Confirm new password" className="lg-inp"/>
          {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px",margin:0}}>⚠ {err}</p>}
          <button type="submit" disabled={loading} style={{
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"700",fontSize:"14px",padding:"13px",borderRadius:"10px",border:"none",
            cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}>
            {loading ? "Saving…" : "Set New Password"}
          </button>
        </form>
      )}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
export default function Login() {
  const { t }       = useTranslation();
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [params]   = useSearchParams();
  const [tab, setTab]         = useState("id");
  const rawStaffParam = params.get("staff");
  const staffParam = ["doctor","admin","hospital","pharmacy","lab","company","employee"].includes(rawStaffParam) ? rawStaffParam : null;
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
  // The facilitation-service checkbox is a PATIENT-specific disclosure —
  // it doesn't apply to doctor/admin/hospital/pharmacy staff logins, nor
  // to the separate "Hospital" OTP portal. Only the plain patient
  // (healthcare portal, non-staff) flow shows it and requires it.
  const isPatientFlow = !showStaff && portal === "healthcare";
  const consentOK = agreed && (!isPatientFlow || agreedFacilitation);

  useEffect(() => { document.title = "Login — We Care 4 'all'"; }, []);

  const handleSuccess = data => {
    const { access_token, role, user } = data;
    login(user, access_token);

    if (role === "patient") {
      // Remembered for the Navbar's Dashboard button afterwards.
      localStorage.setItem("wc4a_login_portal", portal);
      if (portal === "hospital") {
        navigate(redirect || "/patient/hospital-consultancy", { replace: true });
        return;
      }
    }

    const dest = redirect || {
      patient:  "/patient/dashboard",
      doctor:   "/doctor/dashboard",
      admin:    "/admin/dashboard",
      hospital: "/hospital/dashboard",
      pharmacy: "/pharmacy/dashboard",
      lab:      "/lab/dashboard",
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
            {/* Portal selector lives OUTSIDE the consent gate on purpose:
                picking "Healthcare" vs "Hospital" (or switching to staff
                login via the footer toggle) isn't a data-submitting action,
                so it shouldn't require consent first — and the facilitation
                checkbox below needs to already know which portal is picked
                before it can decide whether to show itself. */}
            {!showStaff && (
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
            )}

            {/* Consent gate — required before any login/registration action.
                The general T&C/Privacy/Rights checkbox applies to everyone
                (patient, hospital portal, and staff logins alike). The
                second, facilitation-service checkbox is patient-specific —
                We Care 4 'all's facilitation-only role and info-sharing
                consent is a patient disclosure, not something a doctor,
                admin, hospital, or pharmacy staff login needs to see —
                so it only renders for the patient (healthcare, non-staff)
                flow. Each is tracked on its own DB column
                (consent_accepted_at vs facilitation_consent_accepted_at). */}
            <div style={{background:"#f8fafc",border:"1px solid #e2eaf4",
              borderRadius:"10px",padding:"12px 14px",marginBottom: isPatientFlow ? "10px" : "18px"}}>
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

            {isPatientFlow && (
              <div style={{background:"#f8fafc",border:"1px solid #e2eaf4",
                borderRadius:"10px",padding:"12px 14px",marginBottom:"18px"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"9px",cursor:"pointer"}}>
                  <input type="checkbox" checked={agreedFacilitation}
                    onChange={e => setAgreedFacilitation(e.target.checked)}
                    style={{marginTop:"2px",width:"15px",height:"15px",flexShrink:0,
                      accentColor:"#047857",cursor:"pointer"}}/>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                    color:"#475569",lineHeight:"1.6"}}>
                    {t("loginPage.main.facilitationConsent")}{" "}
                    <a href="/assets/WeCare4All_Compliance_Consent.pdf" target="_blank"
                      rel="noopener noreferrer"
                      style={{color:"#047857",fontWeight:"600"}}>
                      {t("loginPage.main.readFullDocument")}
                    </a>
                  </span>
                </label>
                {!agreedFacilitation && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#b45309",margin:"8px 0 0 24px"}}>
                  {t("loginPage.main.consentRequired")}
                </p>}
              </div>
            )}

            <div style={{position:"relative"}}>
              {!consentOK && <div style={{position:"absolute",inset:0,zIndex:2,cursor:"not-allowed"}}/>}
              <div style={{opacity: consentOK ? 1 : 0.45, pointerEvents: consentOK ? "auto" : "none",
                transition:"opacity .2s", filter: consentOK ? "none" : "grayscale(15%)"}}>
                {!showStaff ? (
                  <>
                    <div style={{display:"flex",borderRadius:"10px",overflow:"hidden",border:"1.5px solid #e2eaf4",marginBottom:"22px"}}>
                      {[["id","Patient ID"],["email",t("loginPage.main.methodEmail")],["sms",t("loginPage.main.methodSms")]].map(([id,label]) => (
                        <button key={id} onClick={() => setTab(id)}
                          className={`lg-tab${tab===id?" on":""}`}>{label}</button>
                      ))}
                    </div>
                    {tab==="id"
                      ? <PatientIdLoginTab onSuccess={handleSuccess} onSwitchToOTP={() => setTab("email")}/>
                      : tab==="email"
                      ? <EmailTab onSuccess={handleSuccess} portal={portal} agreed={agreed} agreedFacilitation={agreedFacilitation} onSwitchToIdLogin={() => setTab("id")}/>
                      : <SMSTab   onSuccess={handleSuccess} portal={portal} agreed={agreed} agreedFacilitation={agreedFacilitation} onSwitchToIdLogin={() => setTab("id")}/>}
                  </>
                ) : (
                  <StaffTab onSuccess={handleSuccess} initialType={staffParam}/>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{marginTop:"20px",paddingTop:"16px",borderTop:"1px solid #f1f5f9"}}>
              {/* This used to be a plain, low-contrast text link buried
                  next to "Back to Home" — doctors/hospitals/pharmacies/
                  labs/companies had no visual reason to notice there was
                  a second login mode here at all. Now a full-width,
                  bordered, brand-colored button so it actually reads as
                  a real navigation option, not a footnote. */}
              <button onClick={() => setShowStaff(!showStaff)}
                style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                  padding:"12px 14px",borderRadius:"10px",cursor:"pointer",marginBottom:"12px",
                  border:"1.5px solid #86efac",background:"#f0fdf4",color:"#047857",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",textAlign:"center"}}>
                {showStaff ? "🩺" : "🏢"} {showStaff ? t("loginPage.main.staffToggleToPatient") : t("loginPage.main.staffToggleToStaff")}
              </button>
              <div style={{display:"flex",justifyContent:"center"}}>
                <Link to="/" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688",textDecoration:"none"}}>{t("loginPage.main.backToHome")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
