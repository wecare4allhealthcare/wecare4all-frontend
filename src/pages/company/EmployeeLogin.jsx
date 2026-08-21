/**
 * pages/company/EmployeeLogin.jsx — Patient ID + password login for
 * company-added and self-registered employees (Phase 3). Successful
 * login uses the same shared AuthContext as every other patient login,
 * so employees land straight in the existing PatientDashboard — no
 * separate employee-only dashboard needed, they're just patients with
 * a company_id behind the scenes.
 *
 * Visual design (Aug 2026 — client request: "make ... employee login
 * signup pages ui based on our theme"): rebuilt from a bare centered
 * white card on flat #f0f6fc to the same branded split-panel look as
 * auth/Login.jsx and company/Login.jsx — animated dark gradient
 * background, left hero panel on desktop, dark navy card header. Same
 * fields/submit logic as before, shell only.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.eln{font-family:'Inter',sans-serif;color:#1e293b;}
.eln *{box-sizing:border-box;}
.eln h1{font-family:'Manrope',sans-serif;}
@keyframes grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.eln-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:12px 14px;
  font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);
  outline:none;transition:all .2s;margin-bottom:14px;text-transform:uppercase;}
.eln-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(91,158,50,.09);}
.eln-inp.pw{text-transform:none;}
.eln-label{font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px;display:block;}
.eln-btn{width:100%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;border:none;
  border-radius:9px;padding:14px;font-family:'Inter',sans-serif;font-weight:700;font-size:15px;
  cursor:pointer;margin-top:4px;box-shadow:0 4px 16px rgba(91,158,50,.35);transition:all .2s;}
.eln-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(91,158,50,.42);}
.eln-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@media(max-width:900px){.eln-left{display:none!important;}}
`;

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/company/employee-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId.trim(), password }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Invalid Patient ID or password.", "error"); return; }

      login({ id: json.user.id, name: json.user.name, email: json.user.email, role: "patient" }, json.access_token);

      if (json.must_change_password) {
        showToast("Please set a new password to continue.", "info");
        navigate("/company/change-password");
        return;
      }
      navigate("/patient/dashboard");
    } catch { showToast("Couldn't reach the server. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="eln" style={{
      minHeight: "100vh", display: "flex",
      background: "linear-gradient(-45deg,var(--wc-navy-deepest),var(--wc-navy),#0a2e52,var(--wc-navy-deep),var(--wc-navy))",
      backgroundSize: "400% 400%", animation: "grad 14s ease infinite",
      position: "relative", overflow: "hidden",
    }}>
      <SEO title="Employee Login — We Care 4 'all'" noindex />
      <style>{G}</style>

      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"-100px",right:"-100px",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(91,158,50,0.18) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>

      {/* Left hero panel — desktop only */}
      <div className="eln-left" style={{flex:"0 0 44%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px",color:"#fff",position:"relative",zIndex:1}}>
        <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"10px",marginBottom:"48px",textDecoration:"none"}}>
          <img src="/assets/img/logo/final.png" alt="" style={{height:"36px",width:"auto"}} onError={e=>{e.target.style.display="none";}}/>
          <span style={{fontFamily:"'Manrope',sans-serif",fontSize:"19px",fontWeight:"700",color:"#fff"}}>
            We Care 4 <span style={{color:"var(--wc-green-lighter)"}}>'all'</span>
          </span>
        </Link>
        <h1 style={{fontSize:"clamp(28px,3.2vw,44px)",fontWeight:"700",lineHeight:"1.15",marginBottom:"18px",color:"#fff"}}>
          Your company health benefits,<br/>
          <span style={{background:"linear-gradient(90deg,var(--wc-green-lighter),var(--wc-green-pale))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            just a login away.
          </span>
        </h1>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",color:"rgba(255,255,255,0.65)",lineHeight:"1.75",maxWidth:"360px",fontWeight:"300",marginBottom:"36px"}}>
          Log in with the Patient ID your employer's HR team sent you to book doctor consultations and manage your care.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {[
            ["🩺","Doctor Access","Video and in-person consultations through your company plan"],
            ["🆔","Patient ID Login","No new account to set up — use the ID from your welcome email"],
            ["🔒","Private & Secure","Your health records stay between you and your care team"],
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
          <div style={{background:"linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))",padding:"26px 30px"}}>
            <h1 style={{fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>Employee Login</h1>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.55)",margin:0}}>
              Log in with the Patient ID from your welcome email
            </p>
          </div>

          {/* Card body */}
          <div style={{padding:"26px 30px"}}>
            <form onSubmit={submit}>
              <label className="eln-label">Patient ID</label>
              <input className="eln-inp" placeholder="WC-26-000001" required
                value={patientId} onChange={(e) => setPatientId(e.target.value)} />
              <label className="eln-label">Password</label>
              <input className="eln-inp pw" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="eln-btn" disabled={saving}>{saving ? "Signing in…" : "Log In"}</button>
            </form>
            <p style={{ textAlign: "center", fontSize: "13px", marginTop: "18px", color: "var(--wc-muted)" }}>
              New employee? <Link to="/employee-signup" style={{ color: "var(--wc-green)", fontWeight: 700 }}>Sign up with your invite code</Link>
            </p>
            <p style={{ textAlign: "center", fontSize: "13px", marginTop: "8px", color: "var(--wc-muted)" }}>
              Not a corporate employee? <Link to="/login" style={{ color: "var(--wc-green)", fontWeight: 700 }}>Regular patient login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
