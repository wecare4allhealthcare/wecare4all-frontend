/**
 * components/ManualUpiPayment.jsx
 *
 * Was imported by pages/hospital/Dashboard.jsx and pages/company/
 * Dashboard.jsx (`import ManualUpiPayment from "../../components/
 * ManualUpiPayment"`) but the file itself never existed in this repo
 * — confirmed via `git log --all -- src/components/ManualUpiPayment.jsx`
 * returning zero history. That's what was breaking every Vercel build.
 * Built fresh here, following the same QR + UTR pattern already used
 * in patient/Payment.jsx and PartnerDashboardShell.jsx, and posting to
 * the two backend endpoints added alongside this file:
 *   POST /hospital/subscription/submit-payment-proof
 *   POST /company/subscription/submit-payment-proof
 *
 * Props:
 *   submitEndpoint — API path to POST { payment_reference } to
 *   token           — bearer token for the Authorization header
 *   amount          — amount due, for display only (backend already
 *                      knows the real amount server-side; this
 *                      component never sends one)
 *   onSubmitted     — called after a successful submission
 */
import { useEffect, useState } from "react";
import { showToast } from "./Toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export default function ManualUpiPayment({ submitEndpoint, token, amount, onSubmitted }) {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/payment-settings`);
        const json = await res.json();
        setSettings(json);
      } catch {
        setSettings(null);
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  const submit = async () => {
    if (!reference.trim()) {
      showToast("Please enter the UPI transaction reference (UTR) number.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}${submitEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_reference: reference.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.detail || "Couldn't submit payment reference.", "error");
        return;
      }
      setSubmitted(true);
      showToast(json.message || "Submitted — we'll verify and activate your account shortly.", "success");
      onSubmitted?.();
    } catch {
      showToast("Couldn't reach the server. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inp = {
    width: "100%", border: "1.5px solid #e2eaf4", borderRadius: "9px", padding: "10px 12px",
    fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#1e293b", background: "#f8fafc",
    outline: "none", marginBottom: "12px",
  };

  if (loadingSettings) {
    return <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#94a3b8" }}>Loading payment details…</p>;
  }

  if (!settings?.manual_upi_enabled) {
    // Admin toggled manual UPI off after this screen was already
    // shown — fail safe with a clear message rather than a blank QR.
    return (
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#991b1b" }}>
        Manual UPI payment isn't available right now. Please contact support to complete your payment.
      </p>
    );
  }

  if (submitted) {
    return (
      <div style={{ background: "#eff8ff", border: "1px solid #bae6fd", borderRadius: "12px", padding: "16px" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", fontWeight: 700, color: "#0369a1", margin: 0 }}>
          ⏳ Payment submitted — awaiting verification
        </p>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", color: "#0369a1", margin: "6px 0 0" }}>
          We'll verify your UPI payment and activate your account shortly.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2eaf4", borderRadius: "14px", padding: "20px" }}>
      <div style={{ background: "#eff8ff", border: "1px solid #bae6fd", borderRadius: "11px", padding: "12px", marginBottom: "16px", textAlign: "center" }}>
        <p style={{ fontSize: "12.5px", color: "#0369a1", fontWeight: 700, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
          Pay ₹{Number(amount).toLocaleString("en-IN")} via UPI — scan the QR code below with any UPI app
        </p>
      </div>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        {settings.qr_url && (
          <img src={settings.qr_url} alt="UPI QR Code"
            style={{ width: "180px", maxWidth: "100%", borderRadius: "12px", border: "1px solid #e2eaf4" }} />
        )}
        {settings.payee_name && (
          <p style={{ fontSize: "13px", fontWeight: 700, color: "#0b1f3a", margin: "10px 0 2px", fontFamily: "'DM Sans',sans-serif" }}>
            {settings.payee_name}
          </p>
        )}
        {settings.upi_id && (
          <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0, fontFamily: "'DM Sans',sans-serif" }}>
            UPI ID: {settings.upi_id}
          </p>
        )}
      </div>
      <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#374151", marginBottom: "4px", fontFamily: "'DM Sans',sans-serif" }}
        htmlFor="manual-upi-reference">
        After paying, enter your UPI transaction reference (UTR) number *
      </label>
      <input id="manual-upi-reference" style={inp} value={reference}
        onChange={(e) => setReference(e.target.value)} placeholder="e.g. 123456789012" />
      <button onClick={submit} disabled={submitting} style={{
        width: "100%", padding: "12px", borderRadius: "9px", border: "none", cursor: submitting ? "wait" : "pointer",
        background: "linear-gradient(135deg,#047857,#059669)", color: "#fff",
        fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "14px",
      }}>
        {submitting ? "Submitting…" : "I've Paid — Submit Reference"}
      </button>
    </div>
  );
}
