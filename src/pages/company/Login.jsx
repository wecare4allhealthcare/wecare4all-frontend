/**
 * pages/company/Login.jsx — single login page for both the Company
 * Super Admin (companies table) and HR Admins (company_staff table).
 * Tries /company/login first (owner account); on 401 falls back to
 * /company/staff-login (HR admin / delegated super admin) so the
 * person doesn't need to know in advance which table their account
 * lives in — mirrors the segmented-tab simplicity of the main Login.jsx
 * without needing a second tab for this smaller audience.
 *
 * Visual design matches auth/Login.jsx's branded split-panel look
 * (animated gradient background, left hero panel on desktop, dark
 * card header) instead of the plain unbranded white-card layout this
 * previously had — same login experience, consistent brand presence.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.cln{font-family:'Inter',sans-serif;color:#1e293b;}
.cln *{box-sizing:border-box;}
.cln h1{font-family:'Manrope',sans-serif;}
@keyframes grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.cln-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:12px 14px;
  font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);
  outline:none;transition:all .2s;margin-bottom:16px;}
.cln-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.cln-label{font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px;display:block;}
.cln-btn{width:100%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;border:none;
  border-radius:9px;padding:14px;font-family:'Inter',sans-serif;font-weight:700;font-size:15px;
  cursor:pointer;margin-top:4px;box-shadow:0 4px 16px rgba(4,120,87,.35);transition:all .2s;}
.cln-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(4,120,87,.42);}
.cln-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@media(max-width:900px){.cln-left{display:none!important;}}
`;

export default function CompanyLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending2FA, setPending2FA] = useState(null); // pre_auth_token, if the server asked for a second factor
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");

  const finishLogin = (json, role) => {
    const name = json.company?.company_name || json.staff?.full_name || "";
    const uid = json.company?.id || json.staff?.id;
    login({ id: uid, name, email, role }, json.access_token);

    if (json.must_change_password) {
      showToast("Please set a new password to continue.", "info");
      navigate("/company/change-password");
      return;
    }
    navigate("/company/dashboard");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res = await fetch(`${API}/company/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let json = await res.json();
      let role = "company_super_admin";

      if (!res.ok) {
        // Not a company-owner account — try the HR/staff table instead.
        res = await fetch(`${API}/company/staff-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        json = await res.json();
        role = json.role; // "hr_admin" or a delegated "company_super_admin"
      }

      if (!res.ok) { showToast(json.detail || "Invalid email or password.", "error"); return; }

      if (json.requires_2fa) { setPending2FA(json.pre_auth_token); return; }

      finishLogin(json, role);
    } catch { showToast("Couldn't reach the server. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  const verify2FA = async (e) => {
    e.preventDefault();
    setCodeErr("");
    if (code.trim().length < 6) { setCodeErr("Enter the 6-digit code from your authenticator app."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/auth/2fa/verify-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pre_auth_token: pending2FA, code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setCodeErr(json.detail || "Invalid or expired code."); return; }
      finishLogin(json, "company_super_admin");
    } catch { setCodeErr("Couldn't reach the server."); }
    finally { setSaving(false); }
  };

  return (
    <div className="cln" style={{
      minHeight: "100vh", display: "flex",
      background: "linear-gradient(-45deg,#071524,var(--wc-navy),#0a2e52,#062818,var(--wc-navy))",
      backgroundSize: "400% 400%", animation: "grad 14s ease infinite",
      position: "relative", overflow: "hidden",
    }}>
      <SEO title="Company Login — We Care 4 'all'" noindex />
      <style>{G}</style>

      {/* Ambient dot grid + glow, matching the main login page */}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"-100px",right:"-100px",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(4,120,87,0.18) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>

      {/* Left hero panel — desktop only */}
      <div className="cln-left" style={{flex:"0 0 44%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px",color:"#fff",position:"relative",zIndex:1}}>
        <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"10px",marginBottom:"48px",textDecoration:"none"}}>
          <img src="/assets/img/logo/final.png" alt="" style={{height:"36px",width:"auto"}} onError={e=>{e.target.style.display="none";}}/>
          <span style={{fontFamily:"'Manrope',sans-serif",fontSize:"19px",fontWeight:"700",color:"#fff"}}>
            We Care 4 <span style={{color:"var(--wc-green-lighter)"}}>'all'</span>
          </span>
        </Link>
        <h1 style={{fontSize:"clamp(28px,3.2vw,44px)",fontWeight:"700",lineHeight:"1.15",marginBottom:"18px",color:"#fff"}}>
          Corporate Wellness,<br/>
          <span style={{background:"linear-gradient(90deg,var(--wc-green-lighter),var(--wc-green-pale))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            managed in one place.
          </span>
        </h1>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",color:"rgba(255,255,255,0.65)",lineHeight:"1.75",maxWidth:"360px",fontWeight:"300",marginBottom:"36px"}}>
          Manage your employees' health benefits, track utilization, and give your team access to doctors — all from one dashboard.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {[
            ["👥","Employee Management","Add, remove, and track your team's coverage"],
            ["📊","Usage Analytics","See engagement and utilization at a glance"],
            ["🩺","Doctor Access","Give employees direct access to verified specialists"],
          ].map(([icon,title,sub]) => (
            <div key={title} style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 15px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:"10px"}}>
              <span style={{fontSize:"18px"}}>{icon}</span>
              <div>
                <p style={{fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"13px",color:"#fff",margin:0}}>{title}</p>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.5)",margin:0}}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login card */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",zIndex:1}}>
        <div style={{width:"100%",maxWidth:"410px",background:"#fff",borderRadius:"20px",boxShadow:"0 40px 80px rgba(0,0,0,0.45)",overflow:"hidden"}}>

          {/* Card header */}
          <div style={{background:"linear-gradient(135deg,var(--wc-navy),#112d52)",padding:"26px 30px"}}>
            <h2 style={{fontFamily:"'Manrope',sans-serif",fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>
              Company Login
            </h2>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.55)"}}>
              For company admins and HR teams
            </p>
          </div>

          {/* Card body */}
          <div style={{padding:"26px 30px"}}>
            {pending2FA ? (
              <form onSubmit={verify2FA}>
                <div style={{background:"var(--wc-sage)",border:"1px solid #86efac",borderRadius:"10px",padding:"13px",textAlign:"center",marginBottom:"16px"}}>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"#15803d",fontWeight:"600",margin:0}}>🔐 Two-Factor Authentication</p>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",color:"#166534",margin:"4px 0 0"}}>Enter the 6-digit code from your authenticator app.</p>
                </div>
                <input type="text" inputMode="numeric" maxLength={6} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g,""))}
                  placeholder="000000" autoFocus
                  className="cln-inp" style={{textAlign:"center",fontSize:"22px",letterSpacing:"6px",fontWeight:700}}/>
                {codeErr && <p style={{color:"#ef4444",fontSize:"12px",marginTop:"-8px",marginBottom:"12px"}}>⚠ {codeErr}</p>}
                <button className="cln-btn" disabled={saving || code.length < 6}>{saving ? "Verifying…" : "Verify & Log In"}</button>
                <button type="button" onClick={() => { setPending2FA(null); setCode(""); }}
                  style={{background:"none",border:"none",color:"var(--wc-muted)",fontSize:"12.5px",cursor:"pointer",padding:0,marginTop:"12px"}}>
                  ← Back to login
                </button>
              </form>
            ) : (
            <form onSubmit={submit}>
              <label className="cln-label" htmlFor="company-login-email">Email</label>
              <input id="company-login-email" className="cln-inp" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"/>
              <label className="cln-label" htmlFor="company-login-password">Password</label>
              <input id="company-login-password" className="cln-inp" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"/>
              <button className="cln-btn" disabled={saving}>{saving ? "Signing in…" : "Log In"}</button>
            </form>
            )}
            <p style={{ textAlign: "center", fontSize: "13px", marginTop: "18px", color: "var(--wc-muted)" }}>
              New company? <Link to="/company/signup" style={{ color: "var(--wc-green)", fontWeight: 700 }}>Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
