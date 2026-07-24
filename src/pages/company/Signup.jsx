/**
 * pages/company/Signup.jsx — Public self-signup for a corporate client.
 * New companies always start as status:"pending" — see backend
 * app/routes/company.py::company_signup. After signup the person lands
 * straight on the Dashboard, which shows the limited "pending" view
 * (profile + plan selection) until they subscribe.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.csg{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;
  display:flex;align-items:center;justify-content:center;padding:24px;}
.csg *{box-sizing:border-box;}
.csg h1{font-family:'Cormorant Garamond',serif;color:#0b1f3a;margin:0 0 6px;font-size:26px;}
.csg-card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(11,31,58,.08);
  width:100%;max-width:440px;}
.csg-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:8px;padding:11px 12px;
  font-family:'DM Sans',sans-serif;font-size:14px;outline:none;margin-bottom:14px;}
.csg-inp:focus{border-color:#047857;}
.csg-label{font-size:12.5px;font-weight:600;color:#475569;margin-bottom:4px;display:block;}
.csg-btn{width:100%;background:#047857;color:#fff;border:none;border-radius:8px;
  padding:13px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14.5px;
  cursor:pointer;margin-top:6px;}
.csg-btn:disabled{opacity:.6;cursor:not-allowed;}
@media (max-width:480px){.csg-card{padding:22px;}}
`;

export default function CompanySignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: "", registered_email: "", password: "",
    contact_person: "", contact_mobile: "", industry: "", declared_employee_count: "",
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
      const res = await fetch(`${API}/company/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
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

  return (
    <div className="csg">
      <SEO title="Register Your Company — We Care 4 'all'" noindex />
      <style>{G}</style>
      <div className="csg-card">
        <h1>Register Your Company</h1>
        <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 22px" }}>
          Set up a corporate wellness portal for your employees.
        </p>
        <form onSubmit={submit}>
          <label className="csg-label">Company Name</label>
          <input className="csg-inp" required value={form.company_name} onChange={set("company_name")} />

          <label className="csg-label">Work Email (this is your login)</label>
          <input className="csg-inp" type="email" required value={form.registered_email} onChange={set("registered_email")} />

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
        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "16px", color: "#64748b" }}>
          Already registered? <Link to="/company/login" style={{ color: "#047857", fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
