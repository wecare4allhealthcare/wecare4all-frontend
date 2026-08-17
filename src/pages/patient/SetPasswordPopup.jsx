/**
 * SetPasswordPopup.jsx
 *
 * Shown once, right after a patient's first OTP login on an account
 * that only had a system-generated placeholder password (new
 * individual signups now choose their own password during
 * registration, but company-added employees and a few legacy/admin-
 * created accounts still land here). Tells them their Patient ID and
 * lets them set a real password in one step, so next time they can log
 * in with email + password instead of needing OTP every time.
 *
 * Backed by POST /company/employee/change-password — despite the path,
 * that endpoint just clears must_change_password for any patient
 * account, not only company employees (see company.py).
 */
import { useState } from "react";
import { showToast } from "../../components/Toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const STORAGE_KEY = "wc4a_show_password_setup";

export function consumePendingPasswordSetup() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return JSON.parse(raw);
  } catch { return null; }
}

export default function SetPasswordPopup({ patientId, onDone }) {
  const [pw, setPw]         = useState("");
  const [pw2, setPw2]       = useState("");
  const [err, setErr]       = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (pw.length < 8) { setErr("Password must be at least 8 characters."); return; }
    if (pw !== pw2)     { setErr("Passwords don't match."); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/company/employee/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: pw }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.detail || "Couldn't set your password. Please try again.");
        setSaving(false);
        return;
      }
      showToast("Password set — next time log in with your Patient ID and password.", "success");
      onDone();
    } catch {
      setErr("Network error — please try again.");
      setSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="setpw-title" style={{
      position: "fixed", inset: 0, background: "rgba(18,59,74,.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "16px", maxWidth: "440px", width: "100%",
        padding: "28px 26px", boxShadow: "0 20px 60px rgba(18,59,74,.35)",
      }}>
        <div style={{ fontSize: "34px", marginBottom: "8px" }}>🎉</div>
        <h2 id="setpw-title" style={{
          fontFamily: "'Manrope',sans-serif", fontSize: "24px", fontWeight: 700,
          color: "var(--wc-navy)", margin: "0 0 8px",
        }}>
          You're in! Here's your Patient ID
        </h2>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "var(--wc-muted)", margin: "0 0 14px", lineHeight: 1.6 }}>
          Save this — you'll use it with a password to log in faster next time (no OTP needed).
        </p>
        <div style={{
          background: "var(--wc-sage)", border: "1.5px solid #86efac", borderRadius: "10px",
          padding: "12px 16px", marginBottom: "18px", textAlign: "center",
        }}>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#15803d", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>
            Your Patient ID
          </p>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: "22px", fontWeight: 700, color: "#14532d", margin: "2px 0 0" }}>
            {patientId || "—"}
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#374151" }}>
            Set a password
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="At least 8 characters" autoComplete="new-password"
              style={{ width: "100%", marginTop: "5px", border: "1.5px solid #d1dce8", borderRadius: "10px",
                padding: "11px 14px", fontSize: "14px", outline: "none" }} />
          </label>
          <label style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#374151" }}>
            Confirm password
            <input type="password" value={pw2} onChange={e => setPw2(e.target.value)}
              placeholder="Re-enter password" autoComplete="new-password"
              style={{ width: "100%", marginTop: "5px", border: "1.5px solid #d1dce8", borderRadius: "10px",
                padding: "11px 14px", fontSize: "14px", outline: "none" }} />
          </label>
          {err && <p style={{ color: "#ef4444", fontSize: "12px", fontFamily: "'Inter',sans-serif" }}>⚠ {err}</p>}

          <button type="submit" disabled={saving} style={{
            marginTop: "6px", background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color: "#fff",
            fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "14px",
            padding: "13px", borderRadius: "10px", border: "none",
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
          }}>
            {saving ? "Saving…" : "Set Password"}
          </button>
          <button type="button" onClick={onDone} style={{
            background: "none", border: "none", color: "var(--wc-muted)", fontFamily: "'Inter',sans-serif",
            fontSize: "12.5px", cursor: "pointer", padding: "4px",
          }}>
            Skip for now — I'll set it later in My Profile
          </button>
        </form>
      </div>
    </div>
  );
}
