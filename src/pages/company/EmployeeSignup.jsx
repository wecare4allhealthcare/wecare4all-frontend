/**
 * pages/company/EmployeeSignup.jsx — Public self-registration using a
 * company's shared invite code (Phase 2 — POST /company/employee-signup).
 *
 * This backend endpoint already existed, but had no frontend page wired
 * up to it, so employees who received an invite code from their HR/Company
 * Admin had nowhere to actually use it. This page is that missing screen —
 * reachable at /company/employee-signup and linked from CompanyLogin +
 * EmployeeLogin so the loop is closed end-to-end.
 */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { showToast } from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.esg{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;
  display:flex;align-items:center;justify-content:center;padding:24px;}
.esg *{box-sizing:border-box;}
.esg h1{font-family:'Cormorant Garamond',serif;color:#0b1f3a;margin:0 0 6px;font-size:26px;}
.esg-card{background:#fff;border-radius:16px;padding:32px;box-shadow:0 4px 20px rgba(11,31,58,.08);
  width:100%;max-width:420px;}
.esg-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:8px;padding:11px 12px;
  font-family:'DM Sans',sans-serif;font-size:14px;outline:none;margin-bottom:14px;}
.esg-inp.code{text-transform:uppercase;letter-spacing:1px;font-weight:700;}
.esg-inp:focus{border-color:#047857;}
.esg-label{font-size:12.5px;font-weight:600;color:#475569;margin-bottom:4px;display:block;}
.esg-btn{width:100%;background:#047857;color:#fff;border:none;border-radius:8px;
  padding:13px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14.5px;
  cursor:pointer;margin-top:6px;}
.esg-btn:disabled{opacity:.6;cursor:not-allowed;}
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
    <div className="esg">
      <SEO title="Employee Sign Up — We Care 4 'all'" noindex />
      <style>{G}</style>
      <div className="esg-card">
        <h1>Employee Sign Up</h1>
        <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 22px" }}>
          Enter the invite code your company shared with you to set up your account.
        </p>
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
        <p style={{ textAlign: "center", fontSize: "13px", marginTop: "16px", color: "#64748b" }}>
          Already have a Patient ID? <Link to="/employee-login" style={{ color: "#047857", fontWeight: 600 }}>Employee Login</Link>
        </p>
      </div>
    </div>
  );
}
