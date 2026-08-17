/**
 * components/TwoFactorSettings.jsx — Setup/enable/disable TOTP 2FA.
 * Reused by admin's Security tab (apiBase="/auth/2fa") and the
 * company dashboard (apiBase="/company/2fa") — same backend pattern,
 * same UI, just a different base path and auth header source.
 */
import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export default function TwoFactorSettings({ apiBase, token, enabled, onChanged }) {
  const [step, setStep] = useState("idle"); // idle | setup | disabling
  const [secret, setSecret] = useState("");
  const [qrUri, setQrUri] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const startSetup = async () => {
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API}${apiBase}/setup`, { method: "POST", headers: authHeaders });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Couldn't start 2FA setup."); return; }
      setSecret(json.secret);
      setQrUri(json.provisioning_uri);
      setStep("setup");
    } catch { setErr("Couldn't reach the server."); }
    finally { setLoading(false); }
  };

  const confirmEnable = async () => {
    if (code.trim().length < 6) { setErr("Enter the 6-digit code from your authenticator app."); return; }
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API}${apiBase}/enable`, {
        method: "POST", headers: authHeaders, body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "That code didn't work."); return; }
      setStep("idle"); setCode(""); setSecret(""); setQrUri("");
      onChanged?.();
    } catch { setErr("Couldn't reach the server."); }
    finally { setLoading(false); }
  };

  const confirmDisable = async () => {
    if (code.trim().length < 6) { setErr("Enter a current 6-digit code to confirm."); return; }
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API}${apiBase}/disable`, {
        method: "POST", headers: authHeaders, body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "That code didn't work."); return; }
      setStep("idle"); setCode("");
      onChanged?.();
    } catch { setErr("Couldn't reach the server."); }
    finally { setLoading(false); }
  };

  const inp = { width: "100%", border: "1.5px solid var(--wc-border)", borderRadius: 8, padding: "10px 12px",
    fontFamily: "'Inter',sans-serif", fontSize: 14, outline: "none", marginBottom: 12 };

  return (
    <div style={{ background: "#fff", border: "1px solid var(--wc-border)", borderRadius: 12, padding: 20, maxWidth: 480 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: "var(--wc-navy)" }}>🔐 Two-Factor Authentication</h3>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
          background: enabled ? "var(--wc-sage)" : "#f1f5f9", color: enabled ? "#15803d" : "var(--wc-muted)" }}>
          {enabled ? "ENABLED" : "DISABLED"}
        </span>
      </div>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "var(--wc-muted)", margin: "0 0 14px" }}>
        Adds a second step at login using an authenticator app (Google Authenticator, Authy, etc.) — protects this account even if the password is ever compromised.
      </p>

      {step === "idle" && (
        enabled ? (
          <button onClick={() => setStep("disabling")} style={{
            background: "#fef2f2", border: "1.5px solid #fecaca", color: "#991b1b", borderRadius: 8,
            padding: "9px 16px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Disable 2FA
          </button>
        ) : (
          <button onClick={startSetup} disabled={loading} style={{
            background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", border: "none", color: "#fff", borderRadius: 8,
            padding: "9px 16px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {loading ? "Loading…" : "Set Up 2FA"}
          </button>
        )
      )}

      {step === "setup" && (
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#374151", marginBottom: 10 }}>
            1. Scan this QR code with your authenticator app:
          </p>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`}
              alt="2FA QR code" width={200} height={200}
              style={{ border: "1px solid var(--wc-border)", borderRadius: 8 }}
            />
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
            Can't scan? Enter this code manually:
          </p>
          <code style={{ display: "block", background: "var(--wc-warm-white)", border: "1px solid var(--wc-border)", borderRadius: 6,
            padding: "8px 10px", fontSize: 13, marginBottom: 14, wordBreak: "break-all" }}>{secret}</code>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#374151", marginBottom: 8 }}>
            2. Enter the 6-digit code it shows to confirm:
          </p>
          <input type="text" inputMode="numeric" maxLength={6} value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000" style={{ ...inp, textAlign: "center", fontSize: 20, letterSpacing: 6, fontWeight: 700 }} />
          {err && <p style={{ color: "#ef4444", fontSize: 12, marginTop: -6, marginBottom: 12 }}>⚠ {err}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={confirmEnable} disabled={loading || code.length < 6} style={{
              background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", border: "none", color: "#fff", borderRadius: 8,
              padding: "9px 16px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13,
              cursor: loading ? "default" : "pointer", opacity: loading || code.length < 6 ? 0.6 : 1 }}>
              {loading ? "Verifying…" : "Confirm & Enable"}
            </button>
            <button onClick={() => { setStep("idle"); setCode(""); setErr(""); }} style={{
              background: "none", border: "1.5px solid var(--wc-border)", color: "var(--wc-muted)", borderRadius: 8,
              padding: "9px 16px", fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === "disabling" && (
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#374151", marginBottom: 8 }}>
            Enter a current code from your authenticator app to confirm disabling 2FA:
          </p>
          <input type="text" inputMode="numeric" maxLength={6} value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000" style={{ ...inp, textAlign: "center", fontSize: 20, letterSpacing: 6, fontWeight: 700 }} />
          {err && <p style={{ color: "#ef4444", fontSize: 12, marginTop: -6, marginBottom: 12 }}>⚠ {err}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={confirmDisable} disabled={loading || code.length < 6} style={{
              background: "#fef2f2", border: "1.5px solid #fecaca", color: "#991b1b", borderRadius: 8,
              padding: "9px 16px", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13,
              cursor: loading ? "default" : "pointer", opacity: loading || code.length < 6 ? 0.6 : 1 }}>
              {loading ? "Disabling…" : "Confirm Disable"}
            </button>
            <button onClick={() => { setStep("idle"); setCode(""); setErr(""); }} style={{
              background: "none", border: "1.5px solid var(--wc-border)", color: "var(--wc-muted)", borderRadius: 8,
              padding: "9px 16px", fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
