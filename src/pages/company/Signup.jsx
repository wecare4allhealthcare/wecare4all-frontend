/**
 * pages/company/Signup.jsx — Gated corporate signup. Reachable only via
 * the invite link in the approval email (see backend
 * app/routes/admin.py::approve_company_enquiry and
 * app/routes/company.py::company_signup) — no more open registration.
 * New companies always start as status:"pending" — see backend
 * app/routes/company.py::company_signup. After signup the person lands
 * straight on the Dashboard, which shows the limited "pending" view
 * (profile + plan selection) until they subscribe.
 *
 * Visual design (Aug 2026 — client request: "make ... employee login
 * signup pages ui based on our theme", applied here too since this was
 * the same bare white-card style): rebuilt to match the branded
 * split-panel look every other auth/signup page uses (auth/Login.jsx,
 * company/Login.jsx) — animated dark gradient background, left hero
 * panel, dark navy card header. The "checking invite link" and
 * "invalid/missing token" states keep the same shell so the page never
 * flashes between a plain layout and the branded one. Same fields/
 * validation/submit logic as before, shell only.
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.csg{font-family:'Inter',sans-serif;color:#1e293b;}
.csg *{box-sizing:border-box;}
.csg h1{font-family:'Manrope',sans-serif;}
@keyframes grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.csg-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:12px 14px;
  font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);
  outline:none;transition:all .2s;margin-bottom:14px;}
.csg-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(91,158,50,.09);}
.csg-label{font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px;display:block;}
.csg-btn{width:100%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;border:none;
  border-radius:9px;padding:14px;font-family:'Inter',sans-serif;font-weight:700;font-size:15px;
  cursor:pointer;margin-top:4px;box-shadow:0 4px 16px rgba(91,158,50,.35);transition:all .2s;text-decoration:none;
  display:inline-flex;align-items:center;justify-content:center;}
.csg-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(91,158,50,.42);}
.csg-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@media(max-width:900px){.csg-left{display:none!important;}}
`;

// Shared page shell (gradient bg + dot grid + glow) so the "checking",
// "invalid link", and normal form states all render inside the same
// branded frame instead of the form state alone being styled.
function CompanySignupShell({ children }) {
  return (
    <div className="csg" style={{
      minHeight: "100vh", display: "flex",
      background: "linear-gradient(-45deg,var(--wc-navy-deepest),var(--wc-navy),#0a2e52,var(--wc-navy-deep),var(--wc-navy))",
      backgroundSize: "400% 400%", animation: "grad 14s ease infinite",
      position: "relative", overflow: "hidden",
    }}>
      <style>{G}</style>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"-100px",right:"-100px",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(91,158,50,0.18) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>

      {/* Left hero panel — desktop only */}
      <div className="csg-left" style={{flex:"0 0 44%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px",color:"#fff",position:"relative",zIndex:1}}>
        <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"10px",marginBottom:"48px",textDecoration:"none"}}>
          <img src="/assets/img/logo/final.webp" alt="" style={{height:"36px",width:"auto"}} onError={e=>{e.target.style.display="none";}}/>
          <span style={{fontFamily:"'Manrope',sans-serif",fontSize:"19px",fontWeight:"700",color:"#fff"}}>
            We Care 4 <span style={{color:"var(--wc-green-lighter)"}}>'all'</span>
          </span>
        </Link>
        <h1 style={{fontSize:"clamp(28px,3.2vw,44px)",fontWeight:"700",lineHeight:"1.15",marginBottom:"18px",color:"#fff"}}>
          Corporate Wellness,<br/>
          <span style={{background:"linear-gradient(90deg,var(--wc-green-lighter),var(--wc-green-pale))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            set up in minutes.
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

      {/* Right — card */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",zIndex:1,overflowY:"auto"}}>
        <div style={{width:"100%",maxWidth:"460px",background:"#fff",borderRadius:"20px",boxShadow:"0 40px 80px rgba(0,0,0,0.45)",overflow:"hidden"}}>
          {children}
        </div>
      </div>
    </div>
  );
}

function CardHeader({ title, sub }) {
  return (
    <div style={{background:"linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))",padding:"26px 30px"}}>
      <h1 style={{fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>{title}</h1>
      {sub && <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.55)",margin:0}}>{sub}</p>}
    </div>
  );
}

export default function CompanySignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [form, setForm] = useState({
    company_name: "", registered_email: "", password: "",
    contact_person: "", contact_mobile: "", industry: "", declared_employee_count: "",
  });

  useEffect(() => {
    if (!token) { setChecking(false); setTokenError("no_token"); return; }
    (async () => {
      try {
        const res = await fetch(`${API}/company/enquiry-token/${token}`);
        const json = await res.json();
        if (!res.ok) { setTokenError(json.detail || "This signup link isn't valid."); return; }
        setForm((f) => ({ ...f, company_name: json.company_name, registered_email: json.work_email }));
      } catch { setTokenError("Couldn't verify this link. Please try again."); }
      finally { setChecking(false); }
    })();
  }, [token]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/company/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          invite_token: token,
          declared_employee_count: form.declared_employee_count
            ? parseInt(form.declared_employee_count, 10) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Signup failed.", "error"); return; }
      login(
        { id: json.company.id, name: json.company.company_name, email: json.company.registered_email, role: "company_super_admin" },
        json.access_token
      );
      showToast("Company account created! Choose a plan to unlock your full dashboard.", "success");
      navigate("/company/dashboard");
    } catch { showToast("Couldn't reach the server. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  if (checking) {
    return (
      <CompanySignupShell>
        <CardHeader title="Register Your Company" />
        <div style={{ padding: "40px 30px", textAlign: "center", color: "var(--wc-muted)", fontFamily: "'Inter',sans-serif", fontSize: "14px" }}>
          Checking your invite link…
        </div>
      </CompanySignupShell>
    );
  }

  if (tokenError) {
    return (
      <CompanySignupShell>
        <SEO title="Register Your Company — We Care 4 'all'" noindex />
        <CardHeader title="Signup by Invitation Only" />
        <div style={{ padding: "26px 30px", textAlign: "center" }}>
          <p style={{ color: "var(--wc-muted)", fontSize: "13.5px", margin: "0 0 20px" }}>
            {tokenError === "no_token"
              ? "Company sign up requires an approved package enquiry. Request a package proposal to get started."
              : tokenError}
          </p>
          <Link to="/corporate-wellness" className="csg-btn">
            Request a Package Proposal →
          </Link>
          <p style={{ textAlign: "center", fontSize: "13px", marginTop: "16px", color: "var(--wc-muted)" }}>
            Already have an account? <Link to="/company/login" style={{ color: "var(--wc-green)", fontWeight: 700 }}>Log in</Link>
          </p>
        </div>
      </CompanySignupShell>
    );
  }

  return (
    <CompanySignupShell>
      <SEO title="Register Your Company — We Care 4 'all'" noindex />
      <CardHeader title="Register Your Company" sub="Set up a corporate wellness portal for your employees" />
      <div style={{ padding: "26px 30px" }}>
        <form onSubmit={submit}>
          <label className="csg-label">Company Name</label>
          <input className="csg-inp" required readOnly value={form.company_name} onChange={set("company_name")}
            style={{ background: "var(--wc-warm-white)", cursor: "not-allowed" }} />

          <label className="csg-label">Work Email (this is your login)</label>
          <input className="csg-inp" type="email" required readOnly value={form.registered_email} onChange={set("registered_email")}
            style={{ background: "var(--wc-warm-white)", cursor: "not-allowed" }} />

          <label className="csg-label">Password</label>
          <input className="csg-inp" type="password" required minLength={8} value={form.password} onChange={set("password")} />

          <label className="csg-label">Contact Person</label>
          <input className="csg-inp" value={form.contact_person} onChange={set("contact_person")} />

          <label className="csg-label">Contact Mobile</label>
          <input className="csg-inp" value={form.contact_mobile} onChange={set("contact_mobile")} />

          <label className="csg-label">Industry</label>
          <input className="csg-inp" value={form.industry} onChange={set("industry")} />

          <label className="csg-label">Approx. Employee Count</label>
          <input className="csg-inp" type="number" min="1" value={form.declared_employee_count} onChange={set("declared_employee_count")} />

          <button className="csg-btn" disabled={saving}>
            {saving ? "Creating your account…" : "Create Company Account"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "16px", color: "var(--wc-muted)" }}>
          Already registered? <Link to="/company/login" style={{ color: "var(--wc-green)", fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </CompanySignupShell>
  );
}
