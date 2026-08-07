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
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "./Toast";
import { useAuth } from "../context/AuthContext";
import SEO from "./SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.psg{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;
  display:flex;align-items:center;justify-content:center;padding:24px;}
.psg *{box-sizing:border-box;}
.psg h1{font-family:'Cormorant Garamond',serif;color:#0b1f3a;margin:0 0 6px;font-size:26px;}
.psg-card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(11,31,58,.08);
  width:100%;max-width:480px;}
.psg-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:8px;padding:11px 12px;
  font-family:'DM Sans',sans-serif;font-size:14px;outline:none;margin-bottom:14px;}
.psg-inp:focus{border-color:#047857;}
.psg-label{font-size:12.5px;font-weight:600;color:#475569;margin-bottom:4px;display:block;}
.psg-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.psg-btn{width:100%;background:#047857;color:#fff;border:none;border-radius:8px;
  padding:13px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14.5px;
  cursor:pointer;margin-top:6px;}
.psg-btn:disabled{opacity:.6;cursor:not-allowed;}
@media (max-width:480px){.psg-card{padding:22px;}.psg-row{grid-template-columns:1fr;}}
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
    <div className="psg">
      <SEO title={`${copy.title} — We Care 4 'all'`} noindex />
      <style>{G}</style>
      <div className="psg-card">
        <h1>{copy.title}</h1>
        <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 22px" }}>{copy.subtitle}</p>
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
            {saving ? "Creating your account…" : `Create ${type === "pharmacy" ? "Pharmacy" : "Lab"} Account`}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "16px", color: "#64748b" }}>
          Already registered? <Link to={copy.loginPath} style={{ color: "#047857", fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
