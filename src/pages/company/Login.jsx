/**
 * pages/company/Login.jsx — single login page for both the Company
 * Super Admin (companies table) and HR Admins (company_staff table).
 * Tries /company/login first (owner account); on 401 falls back to
 * /company/staff-login (HR admin / delegated super admin) so the
 * person doesn't need to know in advance which table their account
 * lives in — mirrors the segmented-tab simplicity of the main Login.jsx
 * without needing a second tab for this smaller audience.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.cln{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;
  display:flex;align-items:center;justify-content:center;padding:24px;}
.cln *{box-sizing:border-box;}
.cln h1{font-family:'Cormorant Garamond',serif;color:#0b1f3a;margin:0 0 6px;font-size:26px;}
.cln-card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(11,31,58,.08);
  width:100%;max-width:400px;}
.cln-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:8px;padding:11px 12px;
  font-family:'DM Sans',sans-serif;font-size:14px;outline:none;margin-bottom:14px;}
.cln-inp:focus{border-color:#047857;}
.cln-label{font-size:12.5px;font-weight:600;color:#475569;margin-bottom:4px;display:block;}
.cln-btn{width:100%;background:#047857;color:#fff;border:none;border-radius:8px;
  padding:13px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14.5px;
  cursor:pointer;margin-top:6px;}
.cln-btn:disabled{opacity:.6;cursor:not-allowed;}
`;

export default function CompanyLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      const name = json.company?.company_name || json.staff?.full_name || "";
      const uid = json.company?.id || json.staff?.id;
      login({ id: uid, name, email, role }, json.access_token);

      if (json.must_change_password) {
        showToast("Please set a new password to continue.", "info");
        navigate("/company/change-password");
        return;
      }
      navigate("/company/dashboard");
    } catch { showToast("Couldn't reach the server. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="cln">
      <SEO title="Company Login — We Care 4 'all'" noindex />
      <style>{G}</style>
      <div className="cln-card">
        <h1>Company Login</h1>
        <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 22px" }}>
          For company admins and HR teams.
        </p>
        <form onSubmit={submit}>
          <label className="cln-label">Email</label>
          <input className="cln-inp" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="cln-label">Password</label>
          <input className="cln-inp" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="cln-btn" disabled={saving}>{saving ? "Signing in…" : "Log In"}</button>
        </form>
        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "16px", color: "#64748b" }}>
          New company? <Link to="/company/signup" style={{ color: "#047857", fontWeight: 600 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
