/**
 * Login.jsx — compact, fits viewport, no scroll
 * 3 prominent role tabs: Patient | Doctor | Admin
 * Mobile fully responsive
 */
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.lg,.lg *{box-sizing:border-box;margin:0;padding:0;}
.lg{font-family:'DM Sans',sans-serif;min-height:100svh;display:flex;background:#060f1c;overflow:hidden;}
@keyframes gradBg{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes spinRing{to{transform:translateY(-50%) rotate(360deg)}}
@keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fu1{animation:fu .6s ease .05s both}.fu2{animation:fu .6s ease .15s both}
.fu3{animation:fu .6s ease .25s both}.fu4{animation:fu .6s ease .35s both}

/* LEFT panel */
.lg-left{
  flex:0 0 44%;position:relative;
  display:flex;flex-direction:column;justify-content:center;
  padding:44px 42px;overflow:hidden;
}
.lg-left-bg{
  position:absolute;inset:0;z-index:0;
  background:linear-gradient(-45deg,#040d18,#0a1f3a,#051a0d,#0a1f3a,#051a0d);
  background-size:400% 400%;animation:gradBg 16s ease infinite;
}
.lg-vid{position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;opacity:.18;}
.lg-ov{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg,rgba(4,12,24,.93),rgba(5,40,20,.86));}
.lg-dots{position:absolute;inset:0;z-index:1;pointer-events:none;
  background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px);background-size:36px 36px;}
.lg-ring{position:absolute;right:-100px;top:50%;width:320px;height:320px;border-radius:50%;
  border:1px solid rgba(16,185,129,.09);z-index:1;animation:spinRing 30s linear infinite;}
.lg-ring::after{content:'';position:absolute;inset:22px;border-radius:50%;border:1px solid rgba(16,185,129,.06);}
.lg-lbody{position:relative;z-index:2;}

/* RIGHT panel */
.lg-right{
  flex:1;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:20px 18px;background:#f0f4f9;
  overflow-y:auto;min-height:100svh;
}
.lg-card{width:100%;max-width:430px;background:#fff;border-radius:18px;
  box-shadow:0 16px 50px rgba(11,31,58,.12);overflow:hidden;}

/* ROLE TABS — 3 equal, top of card, PROMINENT */
.role-tabs{display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid #e8edf5;}
.role-tab{
  padding:13px 6px 11px;text-align:center;
  font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;
  cursor:pointer;border:none;background:#f8fafc;color:#94a3b8;
  transition:all .22s;position:relative;
  display:flex;flex-direction:column;align-items:center;gap:4px;
}
.role-tab .ri{width:30px;height:30px;border-radius:8px;display:flex;
  align-items:center;justify-content:center;font-size:15px;
  background:#f1f5f9;transition:all .22s;}
.role-tab.active{background:#fff;}
.role-tab.active::after{content:'';position:absolute;bottom:0;left:18%;right:18%;
  height:3px;border-radius:3px 3px 0 0;}
.role-tab.rp.active{color:#047857;}
.role-tab.rp.active .ri{background:#dcfce7;}
.role-tab.rp.active::after{background:linear-gradient(90deg,#047857,#10b981);}
.role-tab.rd.active{color:#0369a1;}
.role-tab.rd.active .ri{background:#dbeafe;}
.role-tab.rd.active::after{background:linear-gradient(90deg,#0369a1,#38bdf8);}
.role-tab.ra.active{color:#7c3aed;}
.role-tab.ra.active .ri{background:#ede9fe;}
.role-tab.ra.active::after{background:linear-gradient(90deg,#7c3aed,#a78bfa);}
.role-tab:hover:not(.active){background:#f0fdf4;color:#047857;}

/* Form body */
.lg-body{padding:20px 24px 22px;}
.auth-tabs{display:flex;border-radius:9px;overflow:hidden;border:1.5px solid #e2eaf4;margin-bottom:18px;}
.auth-tab{flex:1;padding:9px 4px;border:none;font-family:'DM Sans',sans-serif;
  font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;
  background:#f8fafc;color:#64748b;}
.auth-tab.active{background:linear-gradient(135deg,#047857,#059669);color:#fff;}
.auth-tab:not(.active):hover{background:#f0fdf4;color:#047857;}

/* Inputs */
.lg-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;
  padding:10px 13px;font-family:'DM Sans',sans-serif;font-size:14px;
  color:#1e293b;background:#f8fafc;transition:all .2s;outline:none;}
.lg-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.lg-inp.err{border-color:#ef4444;background:#fef2f2;}
.lg-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;}

/* OTP boxes */
.otp-wrap{display:flex;gap:8px;justify-content:center;}
.otp-box{width:50px;height:52px;border:2px solid #e2eaf4;border-radius:10px;
  text-align:center;font-size:22px;font-weight:700;color:#0b1f3a;
  background:#f8fafc;outline:none;transition:all .2s;font-family:'DM Sans',sans-serif;}
.otp-box:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.10);}
.otp-box.filled{border-color:#047857;background:#f0fdf4;color:#047857;}

/* Buttons */
.btn-g{width:100%;background:linear-gradient(135deg,#047857,#059669);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:12px;border-radius:9px;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:7px;
  box-shadow:0 4px 16px rgba(4,120,87,.35);transition:all .25s;}
.btn-g:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(4,120,87,.45);}
.btn-g:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.btn-n{width:100%;background:linear-gradient(135deg,#0b1f3a,#1e3a5f);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:12px;border-radius:9px;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:7px;
  box-shadow:0 4px 16px rgba(11,31,58,.28);transition:all .25s;}
.btn-n:hover{transform:translateY(-1px);}
.btn-n:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.btn-a{width:100%;background:linear-gradient(135deg,#92400e,#b45309);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:12px;border-radius:9px;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:7px;
  box-shadow:0 4px 16px rgba(146,64,14,.28);transition:all .25s;}
.btn-a:hover{transform:translateY(-1px);}
.btn-a:disabled{opacity:.6;cursor:not-allowed;transform:none;}

/* Misc */
.err-txt{color:#ef4444;font-size:12px;margin-top:4px;font-family:'DM Sans',sans-serif;}
.otp-sent{background:#f0fdf4;border:1px solid #86efac;border-radius:9px;padding:11px;text-align:center;}
.spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.4);
  border-top:2px solid #fff;border-radius:50%;animation:spin .75s linear infinite;display:inline-block;}
.back-lnk{background:none;border:none;cursor:pointer;color:#94a3b8;
  font-family:'DM Sans',sans-serif;font-size:12px;text-align:center;
  width:100%;padding:3px 0;transition:color .2s;}
.back-lnk:hover{color:#475569;}
.cc-sel{border:1.5px solid #e2eaf4;border-radius:9px;padding:10px 8px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;
  background:#f8fafc;outline:none;flex-shrink:0;transition:border-color .2s;cursor:pointer;}
.cc-sel:focus{border-color:#047857;}
.info-d{background:#eff8ff;border:1px solid #bae6fd;border-radius:9px;
  padding:10px 13px;display:flex;align-items:center;gap:9px;}
.info-a{background:#faf5ff;border:1px solid #ddd6fe;border-radius:9px;
  padding:10px 13px;display:flex;align-items:center;gap:9px;}

/* Responsive */
@media(max-width:820px){
  .lg-left{display:none!important;}
  .lg-right{background:linear-gradient(160deg,#060f1c,#0a1f3a);padding:14px;}
  .lg-card{box-shadow:0 20px 60px rgba(0,0,0,.45);max-width:100%;}
  .lg-body{padding:16px 18px 20px;}
}
@media(max-width:380px){
  .otp-box{width:44px;height:48px;font-size:20px;}
  .otp-wrap{gap:6px;}
  .role-tab{padding:11px 3px 9px;font-size:11px;}
  .role-tab .ri{width:26px;height:26px;font-size:13px;}
}
`;

const CCS = [
  {c:"+91",f:"🇮🇳"},{c:"+1",f:"🇺🇸"},{c:"+44",f:"🇬🇧"},
  {c:"+971",f:"🇦🇪"},{c:"+65",f:"🇸🇬"},{c:"+61",f:"🇦🇺"},
];

function OTPBoxes({ value, onChange, disabled }) {
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const digits = (value + "    ").slice(0, 4).split("");
  const upd = (i, v) => { const a = [...digits]; a[i] = v || " "; onChange(a.join("").trimEnd()); };
  return (
    <div className="otp-wrap">
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={d.trim()} disabled={disabled}
          className={`otp-box${d.trim() ? " filled" : ""}`}
          onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(-1); upd(i, v); if (v && i < 3) refs[i + 1].current?.focus(); }}
          onKeyDown={e => { if (e.key === "Backspace") { upd(i, " "); if (i > 0) refs[i - 1].current?.focus(); } }}
          onPaste={e => { const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4); onChange(p); refs[Math.min(p.length - 1, 3)].current?.focus(); e.preventDefault(); }}
        />
      ))}
    </div>
  );
}

function ResendTimer({ trigger, onResend }) {
  const [s, setS] = useState(60);
  useEffect(() => {
    setS(60);
    const t = setInterval(() => setS(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [trigger]);
  return (
    <div style={{ textAlign: "center", marginTop: "8px", fontFamily: "'DM Sans',sans-serif", fontSize: "12px" }}>
      {s > 0
        ? <span style={{ color: "#94a3b8" }}>Resend in <strong style={{ color: "#047857" }}>{s}s</strong></span>
        : <button onClick={onResend} style={{ color: "#047857", fontWeight: "700", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontFamily: "'DM Sans',sans-serif", textDecoration: "underline" }}>Resend OTP</button>}
    </div>
  );
}

function EmailFlow({ onSuccess }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [err, setErr] = useState("");
  const [rk, setRk] = useState(0);

  const send = async (e) => {
    e?.preventDefault(); setErr("");
    if (!/\S+@\S+\.\S+/.test(email)) { setErr("Enter a valid email address"); return; }
    setLoading(true);
    try { const r = await authAPI.sendEmailOTP(email.trim().toLowerCase()); setIsNew(r.data.is_new_user); setStep("otp"); setRk(k => k + 1); }
    catch (ex) { setErr(ex.response?.data?.detail || "Failed to send OTP. Try again."); }
    finally { setLoading(false); }
  };
  const verify = async (e) => {
    e?.preventDefault(); setErr("");
    if (otp.trim().length < 4) { setErr("Enter the 4-digit OTP"); return; }
    setLoading(true);
    try { const r = await authAPI.verifyEmailOTP(email.trim().toLowerCase(), otp.trim()); onSuccess(r.data); }
    catch (ex) { setErr(ex.response?.data?.detail || "Incorrect OTP. Try again."); setOtp(""); }
    finally { setLoading(false); }
  };

  if (step === "email") return (
    <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
      <div>
        <label className="lg-lbl">Email Address</label>
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }}
          placeholder="your@email.com" autoFocus className={`lg-inp${err ? " err" : ""}`} />
        {err && <p className="err-txt">⚠ {err}</p>}
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>A 4-digit OTP will be sent to this email</p>
      </div>
      <button type="submit" disabled={loading || !email} className="btn-g">
        {loading ? <><span className="spinner" />Sending...</> : "Send OTP →"}
      </button>
    </form>
  );
  return (
    <form onSubmit={verify} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
      <div className="otp-sent">
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#15803d", fontWeight: "600" }}>OTP sent to</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#14532d", fontWeight: "700", marginTop: "2px" }}>{email}</p>
        {isNew && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "#16a34a", marginTop: "3px" }}>✨ New account will be created</p>}
      </div>
      <div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", fontWeight: "600", color: "#374151", textAlign: "center", marginBottom: "10px" }}>Enter 4-digit OTP</p>
        <OTPBoxes value={otp} onChange={setOtp} disabled={loading} />
        {err && <p className="err-txt" style={{ textAlign: "center", marginTop: "6px" }}>⚠ {err}</p>}
        <ResendTimer key={rk} trigger={rk} onResend={() => { setOtp(""); send(); }} />
      </div>
      <button type="submit" disabled={loading || otp.trim().length < 4} className="btn-g">
        {loading ? <><span className="spinner" />Verifying...</> : "Verify & Login →"}
      </button>
      <button type="button" onClick={() => { setStep("email"); setOtp(""); setErr(""); }} className="back-lnk">← Change email</button>
    </form>
  );
}

function SMSFlow({ onSuccess }) {
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [cc, setCC] = useState("+91");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [rk, setRk] = useState(0);

  const send = async (e) => {
    e?.preventDefault(); setErr("");
    const clean = mobile.replace(/\D/g, "");
    if (clean.length < 7) { setErr("Enter a valid mobile number"); return; }
    setLoading(true);
    try { await authAPI.sendSMSOTP(clean, cc); setStep("otp"); setRk(k => k + 1); }
    catch (ex) { setErr(ex.response?.data?.detail || "Failed to send SMS. Use Email OTP."); }
    finally { setLoading(false); }
  };
  const verify = async (e) => {
    e?.preventDefault(); setErr("");
    if (otp.trim().length < 4) { setErr("Enter the 4-digit OTP"); return; }
    setLoading(true);
    try { const r = await authAPI.verifySMSOTP(mobile.replace(/\D/g, ""), cc, otp.trim()); onSuccess(r.data); }
    catch (ex) { setErr(ex.response?.data?.detail || "Incorrect OTP."); setOtp(""); }
    finally { setLoading(false); }
  };

  if (step === "mobile") return (
    <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
      <div>
        <label className="lg-lbl">Mobile Number</label>
        <div style={{ display: "flex", gap: "7px" }}>
          <select value={cc} onChange={e => setCC(e.target.value)} className="cc-sel">
            {CCS.map(c => <option key={c.c} value={c.c}>{c.f} {c.c}</option>)}
          </select>
          <input type="tel" value={mobile} onChange={e => { setMobile(e.target.value); setErr(""); }}
            placeholder="90257 86467" autoFocus className={`lg-inp${err ? " err" : ""}`} style={{ flex: 1 }} />
        </div>
        {err && <p className="err-txt">⚠ {err}</p>}
      </div>
      <button type="submit" disabled={loading || !mobile} className="btn-g">
        {loading ? <><span className="spinner" />Sending...</> : "Send OTP →"}
      </button>
    </form>
  );
  return (
    <form onSubmit={verify} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
      <div className="otp-sent">
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#15803d", fontWeight: "600" }}>OTP sent to</p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#14532d", fontWeight: "700", marginTop: "2px" }}>{cc} {mobile}</p>
      </div>
      <div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", fontWeight: "600", color: "#374151", textAlign: "center", marginBottom: "10px" }}>Enter 4-digit OTP</p>
        <OTPBoxes value={otp} onChange={setOtp} disabled={loading} />
        {err && <p className="err-txt" style={{ textAlign: "center", marginTop: "6px" }}>⚠ {err}</p>}
        <ResendTimer key={rk} trigger={rk} onResend={() => { setOtp(""); send(); }} />
      </div>
      <button type="submit" disabled={loading || otp.trim().length < 4} className="btn-g">
        {loading ? <><span className="spinner" />Verifying...</> : "Verify & Login →"}
      </button>
      <button type="button" onClick={() => { setStep("mobile"); setOtp(""); setErr(""); }} className="back-lnk">← Change number</button>
    </form>
  );
}

function StaffFlow({ type, onSuccess }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const isDoctor = type === "doctor";

  const handle = async (e) => {
    e.preventDefault(); setErr("");
    if (!email || !pwd) { setErr("Email and password required"); return; }
    setLoading(true);
    try {
      const r = await (isDoctor ? authAPI.doctorLogin(email, pwd) : authAPI.adminLogin(email, pwd));
      onSuccess(r.data);
    }
    catch (ex) { setErr(ex.response?.data?.detail || "Invalid credentials."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
      <div className={isDoctor ? "info-d" : "info-a"}>
        <span style={{ fontSize: "18px" }}>{isDoctor ? "👨‍⚕️" : "⚙️"}</span>
        <div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", fontWeight: "700",
            color: isDoctor ? "#0369a1" : "#7c3aed", margin: 0 }}>
            {isDoctor ? "Doctor Login" : "Admin Portal"}
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px",
            color: isDoctor ? "#0ea5e9" : "#a78bfa", margin: 0 }}>
            {isDoctor ? "Use admin-provided credentials" : "Authorised personnel only"}
          </p>
        </div>
      </div>
      <div>
        <label className="lg-lbl">Email Address</label>
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }}
          placeholder={isDoctor ? "doctor@wecare4all.com" : "admin@wecare4all.com"}
          autoFocus className={`lg-inp${err ? " err" : ""}`} />
      </div>
      <div>
        <label className="lg-lbl">Password</label>
        <div style={{ position: "relative" }}>
          <input type={show ? "text" : "password"} value={pwd}
            onChange={e => { setPwd(e.target.value); setErr(""); }}
            placeholder="••••••••" className={`lg-inp${err ? " err" : ""}`}
            style={{ paddingRight: "42px" }} />
          <button type="button" onClick={() => setShow(!show)}
            style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "15px", padding: "2px" }}>
            {show ? "🙈" : "👁️"}
          </button>
        </div>
        {err && <p className="err-txt">⚠ {err}</p>}
      </div>
      <button type="submit" disabled={loading} className={isDoctor ? "btn-n" : "btn-a"}>
        {loading ? <><span className="spinner" />Logging in...</> : `Login as ${isDoctor ? "Doctor" : "Admin"} →`}
      </button>
    </form>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState("patient");
  const [authType, setAuthType] = useState("email");
  const redirect = params.get("redirect");
  useEffect(() => { document.title = "Login — We Care 4 all"; }, []);

  const handleSuccess = (data) => {
    const { access_token, role: r, user } = data;
    login(user, access_token);
    const dest = redirect || { patient: "/patient/dashboard", doctor: "/doctor/dashboard", admin: "/admin/dashboard" }[r] || "/";
    navigate(dest, { replace: true });
  };

  const TABS = [
    { id: "patient", label: "Patient",  icon: "🧑‍💼", cls: "rp" },
    { id: "doctor",  label: "Doctor",   icon: "👨‍⚕️", cls: "rd" },
    { id: "admin",   label: "Admin",    icon: "⚙️",  cls: "ra" },
  ];
  const HEADS = {
    patient: ["Patient Login",  "Secure OTP-based access"],
    doctor:  ["Doctor Login",   "Admin-provided credentials"],
    admin:   ["Admin Portal",   "Authorised personnel only"],
  };

  return (
    <div className="lg">
      <style>{G}</style>

      {/* LEFT */}
      <div className="lg-left">
        <video className="lg-vid" autoPlay muted loop playsInline>
          <source src="/assets/video/hero.mp4" type="video/mp4" />
        </video>
        <div className="lg-ov" /><div className="lg-dots" /><div className="lg-ring" />
        <div className="lg-lbody">
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "40px", textDecoration: "none" }}>
            <img src="/assets/img/logo/final.png" alt="" style={{ height: "32px", width: "auto" }} onError={e => { e.target.style.display = "none"; }} />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "18px", fontWeight: "700", color: "#fff" }}>
              We Care 4 <span style={{ color: "#34d399" }}>'all'</span>
            </span>
          </Link>
          <h2 className="fu1" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3.5vw,48px)", fontWeight: "700", color: "#fff", lineHeight: "1.12", marginBottom: "16px" }}>
            Your Health,<br />
            <span style={{ background: "linear-gradient(90deg,#34d399,#6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Our Priority.
            </span>
          </h2>
          <p className="fu2" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "rgba(255,255,255,.62)", lineHeight: "1.78", maxWidth: "310px", fontWeight: "300", marginBottom: "28px" }}>
            Login to access expert specialists, book consultations and manage your complete healthcare journey.
          </p>
          <div className="fu3" style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "28px" }}>
            {[["🎥", "Video Consultation", "20+ verified specialists"],
              ["🏠", "Home Healthcare", "Nurse, physio, lab at home"],
              ["🏥", "Hospital Network", "50+ trusted partners"]].map(([ic, t, s]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.09)", borderRadius: "10px" }}>
                <span style={{ fontSize: "16px" }}>{ic}</span>
                <div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: "600", fontSize: "12px", color: "#fff", margin: 0 }}>{t}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "rgba(255,255,255,.42)", margin: 0 }}>{s}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="fu4" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 13px", background: "rgba(4,120,87,.14)", border: "1px solid rgba(16,185,129,.22)", borderRadius: "10px" }}>
            <div style={{ width: "28px", height: "28px", background: "#fff", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
              <img src="/assets/img/logo/euro_logo.jpeg" alt="Euro Cert" style={{ width: "24px", height: "24px", objectFit: "contain" }}
                onError={e => { e.target.parentElement.innerHTML = `<span style="font-size:7px;font-weight:800;color:#0b1f3a;text-align:center;line-height:1.2">EURO<br/>CERT</span>`; }} />
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#6ee7b7", fontSize: "12px", fontWeight: "600", margin: 0 }}>✓ Euro Cert Certified · Secure & Encrypted</p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="lg-right">
        <div className="lg-card">
          {/* ROLE TABS */}
          <div className="role-tabs">
            {TABS.map(({ id, label, icon, cls }) => (
              <button key={id} onClick={() => setRole(id)} className={`role-tab ${cls}${role === id ? " active" : ""}`}>
                <div className="ri">{icon}</div>
                {label}
              </button>
            ))}
          </div>

          <div className="lg-body">
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "21px", fontWeight: "700", color: "#0b1f3a", margin: "0 0 2px" }}>
                {HEADS[role][0]}
              </h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#94a3b8" }}>
                {HEADS[role][1]}
              </p>
            </div>

            {role === "patient" && (
              <div className="auth-tabs">
                <button onClick={() => setAuthType("email")} className={`auth-tab${authType === "email" ? " active" : ""}`}>📧 Email OTP</button>
                <button onClick={() => setAuthType("sms")} className={`auth-tab${authType === "sms" ? " active" : ""}`}>📱 Mobile OTP</button>
              </div>
            )}

            {role === "patient" && authType === "email" && <EmailFlow onSuccess={handleSuccess} />}
            {role === "patient" && authType === "sms" && <SMSFlow onSuccess={handleSuccess} />}
            {role === "doctor" && <StaffFlow type="doctor" onSuccess={handleSuccess} />}
            {role === "admin" && <StaffFlow type="admin" onSuccess={handleSuccess} />}

            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link to="/" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#94a3b8" }}>← Home</Link>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "#cbd5e1" }}>🔒 SSL & JWT</span>
            </div>
          </div>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "rgba(255,255,255,.28)", marginTop: "12px", textAlign: "center" }}>
          Need help?{" "}
          <a href="tel:+919025786467" style={{ color: "rgba(255,255,255,.48)", fontWeight: "600" }}>90257 86467</a>
        </p>
      </div>
    </div>
  );
}
