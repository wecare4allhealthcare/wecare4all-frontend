/**
 * pages/company/EmployeeSignup.jsx — Public self-registration using a
 * company's shared invite code (Phase 2 — POST /company/employee-signup).
 *
 * This backend endpoint already existed, but had no frontend page wired
 * up to it, so employees who received an invite code from their HR/Company
 * Admin had nowhere to actually use it. This page is that missing screen —
 * reachable at /company/employee-signup and linked from CompanyLogin +
 * EmployeeLogin so the loop is closed end-to-end.
 *
 * Visual design (Aug 2026 — client request: "make ... employee ...
 * signup pages ui based on our theme"): rebuilt from a bare centered
 * white card on flat #f0f6fc to the same branded split-panel look as
 * auth/Login.jsx and company/Login.jsx. Same fields/submit logic as
 * before, shell only.
 */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.esg{font-family:'Inter',sans-serif;color:#1e293b;}
.esg *{box-sizing:border-box;}
.esg h1{font-family:'Manrope',sans-serif;}
@keyframes grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.esg-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:12px 14px;
  font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);
  outline:none;transition:all .2s;margin-bottom:14px;}
.esg-inp.code{text-transform:uppercase;letter-spacing:1px;font-weight:700;}
.esg-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(91,158,50,.09);}
.esg-label{font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px;display:block;}
.esg-btn{width:100%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;border:none;
  border-radius:9px;padding:14px;font-family:'Inter',sans-serif;font-weight:700;font-size:15px;
  cursor:pointer;margin-top:4px;box-shadow:0 4px 16px rgba(91,158,50,.35);transition:all .2s;}
.esg-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(91,158,50,.42);}
.esg-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@media(max-width:900px){.esg-left{display:none!important;}}
`;

export default function EmployeeSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    invite_code: (searchParams.get("code") || "").toUpperCase(), full_name: "", email: "", mobile: "", password: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.invite_code || !form.full_name || !form.email || !form.password) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/company/employee-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: form.invite_code.trim().toUpperCase(),
          full_name:   form.full_name.trim(),
          email:       form.email.trim(),
          mobile:      form.mobile.trim() || undefined,
          password:    form.password,
        }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Sign up failed. Check your invite code.", "error"); return; }

      login({ id: json.patient_id, name: form.full_name, email: form.email, role: "patient" }, json.access_token);
      showToast(json.message || "Welcome!", "success");
      navigate("/patient/dashboard");
    } catch { showToast("Couldn't reach the server. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="esg" style={{
      minHeight: "100vh", display: "flex",
      background: "linear-gradient(-45deg,var(--wc-navy-deepest),var(--wc-navy),#0a2e52,var(--wc-navy-deep),var(--wc-navy))",
      backgroundSize: "400% 400%", animation: "grad 14s ease infinite",
      position: "relative", overflow: "hidden",
    }}>
      <SEO title="Employee Sign Up — We Care 4 'all'" noindex />
      <style>{G}</style>

      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"-100px",right:"-100px",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(91,158,50,0.18) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>

      {/* Left hero panel — desktop only */}
      <div className="esg-left" style={{flex:"0 0 44%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px",color:"#fff",position:"relative",zIndex:1}}>
        <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"10px",marginBottom:"48px",textDecoration:"none"}}>
          <img src="/assets/img/logo/final.webp" alt="" style={{height:"36px",width:"auto"}} onError={e=>{e.target.style.display="none";}}/>
          <span style={{fontFamily:"'Manrope',sans-serif",fontSize:"19px",fontWeight:"700",color:"#fff"}}>
            We Care 4 <span style={{color:"var(--wc-green-lighter)"}}>'all'</span>
          </span>
        </Link>
        <h1 style={{fontSize:"clamp(28px,3.2vw,44px)",fontWeight:"700",lineHeight:"1.15",marginBottom:"18px",color:"#fff"}}>
          One invite code,<br/>
          <span style={{background:"linear-gradient(90deg,var(--wc-green-lighter),var(--wc-green-pale))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            your whole care plan.
          </span>
        </h1>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",color:"rgba(255,255,255,0.65)",lineHeight:"1.75",maxWidth:"360px",fontWeight:"300",marginBottom:"36px"}}>
          Enter the invite code your company's HR team shared with you to set up your account and start booking care.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {[
            ["🎟️","Company Invite Code","One code, shared by your HR team, gets your account started"],
            ["🩺","Doctor Access","Video and in-person consultations through your company plan"],
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

      {/* Right — signup card */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",zIndex:1}}>
        <div style={{width:"100%",maxWidth:"430px",background:"#fff",borderRadius:"20px",boxShadow:"0 40px 80px rgba(0,0,0,0.45)",overflow:"hidden"}}>

          {/* Card header */}
          <div style={{background:"linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))",padding:"26px 30px"}}>
            <h1 style={{fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>Employee Sign Up</h1>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.55)",margin:0}}>
              Set up your account with your company's invite code
            </p>
          </div>

          {/* Card body */}
          <div style={{padding:"26px 30px"}}>
            <form onSubmit={submit}>
              <label className="esg-label">Company Invite Code *</label>
              <input className="esg-inp code" placeholder="e.g. ABCD1234" required
                value={form.invite_code} onChange={(e) => set("invite_code", e.target.value)} />
              <label className="esg-label">Full Name *</label>
              <input className="esg-inp" required
                value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
              <label className="esg-label">Email *</label>
              <input className="esg-inp" type="email" required
                value={form.email} onChange={(e) => set("email", e.target.value)} />
              <label className="esg-label">Mobile</label>
              <input className="esg-inp" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
              <label className="esg-label">Create Password *</label>
              <input className="esg-inp" type="password" required
                value={form.password} onChange={(e) => set("password", e.target.value)} />
              <button className="esg-btn" disabled={saving}>{saving ? "Creating account…" : "Sign Up"}</button>
            </form>
            <p style={{ textAlign: "center", fontSize: "13px", marginTop: "16px", color: "var(--wc-muted)" }}>
              Already have a Patient ID? <Link to="/employee-login" style={{ color: "var(--wc-green)", fontWeight: 700 }}>Employee Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
