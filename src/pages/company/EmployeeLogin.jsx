/**
 * pages/company/EmployeeLogin.jsx — Patient ID + password login for
 * company-added and self-registered employees (Phase 3). Successful
 * login uses the same shared AuthContext as every other patient login,
 * so employees land straight in the existing PatientDashboard — no
 * separate employee-only dashboard needed, they're just patients with
 * a company_id behind the scenes.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.eln{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;
  display:flex;align-items:center;justify-content:center;padding:24px;}
.eln *{box-sizing:border-box;}
.eln h1{font-family:'Cormorant Garamond',serif;color:#0b1f3a;margin:0 0 6px;font-size:26px;}
.eln-card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(11,31,58,.08);
  width:100%;max-width:400px;}
.eln-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:8px;padding:11px 12px;
  font-family:'DM Sans',sans-serif;font-size:14px;outline:none;margin-bottom:14px;text-transform:uppercase;}
.eln-inp:focus{border-color:#047857;}
.eln-inp.pw{text-transform:none;}
.eln-label{font-size:12.5px;font-weight:600;color:#475569;margin-bottom:4px;display:block;}
.eln-btn{width:100%;background:#047857;color:#fff;border:none;border-radius:8px;
  padding:13px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14.5px;
  cursor:pointer;margin-top:6px;}
.eln-btn:disabled{opacity:.6;cursor:not-allowed;}
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
    <div className="eln">
      <SEO title="Employee Login — We Care 4 'all'" noindex />
      <style>{G}</style>
      <div className="eln-card">
        <h1>Employee Login</h1>
        <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 22px" }}>
          Log in with the Patient ID from your welcome email.
        </p>
        <form onSubmit={submit}>
          <label className="eln-label">Patient ID</label>
          <input className="eln-inp" placeholder="WC-26-000001" required
            value={patientId} onChange={(e) => setPatientId(e.target.value)} />
          <label className="eln-label">Password</label>
          <input className="eln-inp pw" type="password" required
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="eln-btn" disabled={saving}>{saving ? "Signing in…" : "Log In"}</button>
        </form>
        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "16px", color: "#64748b" }}>
          Not a corporate employee? <Link to="/login" style={{ color: "#047857", fontWeight: 600 }}>Regular patient login</Link>
        </p>
      </div>
    </div>
  );
}
