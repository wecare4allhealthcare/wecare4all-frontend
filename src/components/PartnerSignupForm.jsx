/**
 * components/PartnerSignupForm.jsx — self-registration form shared by
 * pages/pharmacy/Signup.jsx and pages/lab/Signup.jsx. Same shape as
 * pages/company/Signup.jsx's form (open registration → login() →
 * navigate to the dashboard, which shows the limited "pending
 * approval" view — see PHASE 6 — until admin approves + a plan is
 * subscribed), just parameterised over `type` since a pharmacy and a
 * lab center collect the exact same fields (business name, owner,
 * contact, address, license/registration number, GSTIN).
 *
 * type: "pharmacy" | "lab"
 *
 * Visual design (Aug 2026 — client request: "make pharmacy, lab
 * center ... pages ui based on our theme"): this used to be a bare
 * centered white card on a flat #f0f6fc background — the one signup
 * surface with no brand presence at all. Rebuilt to match the branded
 * split-panel look every other auth/signup page in the app already
 * uses (auth/Login.jsx, company/Login.jsx): animated dark gradient
 * background, left hero panel with type-specific copy on desktop,
 * dark navy card header. Same fields/validation/submit logic as
 * before — only the shell changed.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "./Toast";
import { useAuth } from "../context/AuthContext";
import SEO from "./SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.psg{font-family:'Inter',sans-serif;color:#1e293b;}
.psg *{box-sizing:border-box;}
.psg h1{font-family:'Manrope',sans-serif;}
@keyframes grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.psg-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:12px 14px;
  font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);
  outline:none;transition:all .2s;margin-bottom:14px;}
.psg-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(91,158,50,.09);}
.psg-label{font-size:12.5px;font-weight:600;color:#374151;margin-bottom:6px;display:block;}
.psg-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.psg-btn{width:100%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;border:none;
  border-radius:9px;padding:14px;font-family:'Inter',sans-serif;font-weight:700;font-size:15px;
  cursor:pointer;margin-top:4px;box-shadow:0 4px 16px rgba(91,158,50,.35);transition:all .2s;}
.psg-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(91,158,50,.42);}
.psg-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.psg-card-scroll{max-height:calc(100vh - 48px);overflow-y:auto;}
@media(max-width:900px){.psg-left{display:none!important;}}
@media(max-width:480px){.psg-row{grid-template-columns:1fr;}}
`;

const COPY = {
  pharmacy: {
    title: "Register Your Pharmacy",
    subtitle: "List your pharmacy and start receiving prescription orders from patients.",
    nameLabel: "Pharmacy Name",
    namePlaceholder: "e.g. Sri Ganesh Medicals",
    licenseLabel: "Drug License Number",
    endpoint: "/pharmacy-signup",
    nameField: "pharmacy_name",
    dashboardPath: "/pharmacy/dashboard",
    loginPath: "/login?staff=pharmacy",
    heroTitle1: "Grow your pharmacy,",
    heroTitle2: "one prescription at a time.",
    heroSub: "Get discovered by patients on We Care 4 'all', receive prescription orders directly, and manage fulfilment from one dashboard.",
    features: [
      ["💊", "Prescription Orders", "Receive verified prescriptions straight from doctors and patients"],
      ["📦", "Order Management", "Track, fulfil, and update order status in real time"],
      ["🤝", "Verified Network", "Join a trusted network of partner pharmacies across India"],
    ],
    submitLabel: "Create Pharmacy Account",
  },
  lab: {
    title: "Register Your Lab Center",
    subtitle: "List your lab and start receiving test booking requests from patients.",
    nameLabel: "Lab Center Name",
    namePlaceholder: "e.g. Metro Diagnostics",
    licenseLabel: "NABL / Registration Number",
    endpoint: "/lab-signup",
    nameField: "lab_name",
    dashboardPath: "/lab/dashboard",
    loginPath: "/login?staff=lab",
    heroTitle1: "Diagnostics that reach",
    heroTitle2: "more patients, faster.",
    heroSub: "Get discovered by patients and doctors on We Care 4 'all', receive test booking requests directly, and manage results from one dashboard.",
    features: [
      ["🧪", "Test Bookings", "Receive verified test booking requests from patients and doctors"],
      ["📄", "Results Delivery", "Upload and share reports securely through the platform"],
      ["🤝", "Verified Network", "Join a trusted network of partner labs across India"],
    ],
    submitLabel: "Create Lab Account",
  },
};

export default function PartnerSignupForm({ type }) {
  const copy = COPY[type];
  const navigate = useNavigate();
  const { login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    [copy.nameField]: "", owner_name: "", email: "", password: "",
    phone: "", address: "", city: "", state: "", pincode: "",
    license_number: "", gstin: "",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}${copy.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Signup failed.", "error"); return; }
      login(json.user, json.access_token);
      showToast(json.message || "Account created!", "success");
      navigate(copy.dashboardPath);
    } catch { showToast("Couldn't reach the server. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="psg" style={{
      minHeight: "100vh", display: "flex",
      background: "linear-gradient(-45deg,var(--wc-navy-deepest),var(--wc-navy),#0a2e52,var(--wc-navy-deep),var(--wc-navy))",
      backgroundSize: "400% 400%", animation: "grad 14s ease infinite",
      position: "relative", overflow: "hidden",
    }}>
      <SEO title={`${copy.title} — We Care 4 'all'`} noindex />
      <style>{G}</style>

      {/* Ambient dot grid + glow, matching the main login page */}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"-100px",right:"-100px",width:"500px",height:"500px",background:"radial-gradient(circle,rgba(91,158,50,0.18) 0%,transparent 65%)",borderRadius:"50%",pointerEvents:"none"}}/>

      {/* Left hero panel — desktop only */}
      <div className="psg-left" style={{flex:"0 0 44%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px",color:"#fff",position:"relative",zIndex:1}}>
        <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"10px",marginBottom:"48px",textDecoration:"none"}}>
          <img src="/assets/img/logo/final.webp" alt="" style={{height:"36px",width:"auto"}} onError={e=>{e.target.style.display="none";}}/>
          <span style={{fontFamily:"'Manrope',sans-serif",fontSize:"19px",fontWeight:"700",color:"#fff"}}>
            We Care 4 <span style={{color:"var(--wc-green-lighter)"}}>'all'</span>
          </span>
        </Link>
        <h1 style={{fontSize:"clamp(28px,3.2vw,44px)",fontWeight:"700",lineHeight:"1.15",marginBottom:"18px",color:"#fff"}}>
          {copy.heroTitle1}<br/>
          <span style={{background:"linear-gradient(90deg,var(--wc-green-lighter),var(--wc-green-pale))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {copy.heroTitle2}
          </span>
        </h1>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",color:"rgba(255,255,255,0.65)",lineHeight:"1.75",maxWidth:"360px",fontWeight:"300",marginBottom:"36px"}}>
          {copy.heroSub}
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {copy.features.map(([icon,title,sub]) => (
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
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",position:"relative",zIndex:1,overflowY:"auto"}}>
        <div className="psg-card-scroll" style={{width:"100%",maxWidth:"460px",background:"#fff",borderRadius:"20px",boxShadow:"0 40px 80px rgba(0,0,0,0.45)",overflow:"hidden"}}>

          {/* Card header */}
          <div style={{background:"linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))",padding:"26px 30px"}}>
            <h1 style={{fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>{copy.title}</h1>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.55)",margin:0}}>{copy.subtitle}</p>
          </div>

          {/* Card body */}
          <div style={{padding:"26px 30px"}}>
            <form onSubmit={submit}>
              <label className="psg-label">{copy.nameLabel}</label>
              <input className="psg-inp" required placeholder={copy.namePlaceholder}
                value={form[copy.nameField]} onChange={set(copy.nameField)} />

              <label className="psg-label">Owner / Contact Person Name</label>
              <input className="psg-inp" required value={form.owner_name} onChange={set("owner_name")} />

              <div className="psg-row">
                <div>
                  <label className="psg-label">Email (this is your login)</label>
                  <input className="psg-inp" type="email" required value={form.email} onChange={set("email")} />
                </div>
                <div>
                  <label className="psg-label">Phone</label>
                  <input className="psg-inp" value={form.phone} onChange={set("phone")} />
                </div>
              </div>

              <label className="psg-label">Password</label>
              <input className="psg-inp" type="password" required minLength={8} value={form.password} onChange={set("password")} />

              <label className="psg-label">Address</label>
              <input className="psg-inp" value={form.address} onChange={set("address")} />

              <div className="psg-row">
                <div>
                  <label className="psg-label">City</label>
                  <input className="psg-inp" value={form.city} onChange={set("city")} />
                </div>
                <div>
                  <label className="psg-label">State</label>
                  <input className="psg-inp" value={form.state} onChange={set("state")} />
                </div>
              </div>

              <div className="psg-row">
                <div>
                  <label className="psg-label">Pincode</label>
                  <input className="psg-inp" value={form.pincode} onChange={set("pincode")} />
                </div>
                <div>
                  <label className="psg-label">{copy.licenseLabel}</label>
                  <input className="psg-inp" value={form.license_number} onChange={set("license_number")} />
                </div>
              </div>

              <label className="psg-label">GSTIN (optional)</label>
              <input className="psg-inp" value={form.gstin} onChange={set("gstin")} />

              <button className="psg-btn" disabled={saving}>
                {saving ? "Creating your account…" : copy.submitLabel}
              </button>
            </form>
            <p style={{ textAlign: "center", fontSize: "13px", marginTop: "16px", color: "var(--wc-muted)" }}>
              Already registered? <Link to={copy.loginPath} style={{ color: "var(--wc-green)", fontWeight: 600 }}>Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
