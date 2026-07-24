/**
 * pages/company/ChangePassword.jsx — shown after first login when
 * users.must_change_password is true (HR-added employees with a
 * system-generated temp password). Not gated by ProtectedRoute's role
 * check beyond "patient" since this must be reachable the moment the
 * person lands here straight out of EmployeeLogin.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.cpw{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;
  display:flex;align-items:center;justify-content:center;padding:24px;}
.cpw *{box-sizing:border-box;}
.cpw h1{font-family:'Cormorant Garamond',serif;color:#0b1f3a;margin:0 0 6px;font-size:24px;}
.cpw-card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(11,31,58,.08);
  width:100%;max-width:400px;}
.cpw-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:8px;padding:11px 12px;
  font-family:'DM Sans',sans-serif;font-size:14px;outline:none;margin-bottom:14px;}
.cpw-inp:focus{border-color:#047857;}
.cpw-btn{width:100%;background:#047857;color:#fff;border:none;border-radius:8px;
  padding:13px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14.5px;
  cursor:pointer;margin-top:6px;}
.cpw-btn:disabled{opacity:.6;cursor:not-allowed;}
`;

export default function ChangePassword() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isStaff = role === "company_super_admin" || role === "hr_admin";
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { showToast("Password must be at least 8 characters.", "error"); return; }
    if (password !== confirm) { showToast("Passwords don't match.", "error"); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const endpoint = isStaff ? "/company/staff/change-password" : "/company/employee/change-password";
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: password }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't update password.", "error"); return; }
      showToast("Password updated. Welcome!", "success");
      navigate(isStaff ? "/company/dashboard" : "/patient/dashboard");
    } catch { showToast("Couldn't reach the server. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="cpw">
      <SEO title="Set a New Password — We Care 4 'all'" noindex />
      <style>{G}</style>
      <div className="cpw-card">
        <h1>Set a New Password</h1>
        <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 22px" }}>
          For your security, please replace the temporary password before continuing.
        </p>
        <form onSubmit={submit}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>New Password</label>
          <input className="cpw-inp" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Confirm Password</label>
          <input className="cpw-inp" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button className="cpw-btn" disabled={saving}>{saving ? "Saving…" : "Set Password & Continue"}</button>
        </form>
      </div>
    </div>
  );
}
