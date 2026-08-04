/**
 * admin/dashboard/PaymentVerifications.jsx — Manual UPI Payment
 * fallback control panel. Toggle on/off (temporary while GST is
 * being sorted), configure the UPI details shown to patients, and
 * review/approve UTR references patients submit after paying.
 */
import { useState, useEffect } from "react";
import { showToast } from "../../../components/Toast";
import { API, Spinner } from "./shared";

export default function PaymentVerifications({ token }) {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ manual_upi_enabled: false, upi_id: "", payee_name: "", phone: "", qr_url: "" });
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API}/payment-settings`);
      const json = await res.json();
      setSettings(json);
      setForm({
        manual_upi_enabled: json.manual_upi_enabled || false,
        upi_id: json.upi_id || "",
        payee_name: json.payee_name || "We Care 4 'all'",
        phone: json.phone || "",
        qr_url: json.qr_url || "/assets/upi-qr-code.jpg",
      });
    } catch {}
  };

  const loadPending = async () => {
    setLoadingPending(true);
    try {
      const res = await fetch(`${API}/admin/pending-payment-verifications`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setPending(json.appointments || []);
    } catch { setPending([]); }
    finally { setLoadingPending(false); }
  };

  useEffect(() => { loadSettings(); loadPending(); }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/payment-settings`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const j = await res.json(); showToast(j.detail || "Couldn't save.", "error"); return; }
      showToast("Payment settings saved.", "success");
      loadSettings();
    } catch { showToast("Network error.", "error"); }
    finally { setSaving(false); }
  };

  const verify = async (id, approve) => {
    try {
      const res = await fetch(`${API}/admin/appointments/${id}/verify-payment`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approve }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't update.", "error"); return; }
      showToast(approve ? "Payment approved — appointment confirmed." : "Payment rejected.", "success");
      loadPending();
    } catch { showToast("Network error.", "error"); }
  };

  const inp = { width: "100%", border: "1.5px solid #e2eaf4", borderRadius: 8, padding: "9px 11px", fontFamily: "'DM Sans',sans-serif", fontSize: 13.5, marginBottom: 10 };

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#0b1f3a", margin: "0 0 4px" }}>
        UPI Payment Verification
      </h1>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", marginBottom: 20 }}>
        Temporary manual UPI payment fallback — use while Razorpay isn't available (e.g. GST registration pending).
      </p>

      {/* Settings panel */}
      <div style={{ background: "#fff", border: "1.5px solid #e2eaf4", borderRadius: 12, padding: 20, marginBottom: 24, maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#0b1f3a" }}>Manual UPI Payment</p>
          <button onClick={() => setForm(f => ({ ...f, manual_upi_enabled: !f.manual_upi_enabled }))} style={{
            width: 46, height: 25, borderRadius: 20, border: "none", cursor: "pointer",
            background: form.manual_upi_enabled ? "#047857" : "#cbd5e1", position: "relative" }}>
            <span style={{ position: "absolute", top: 2.5, left: form.manual_upi_enabled ? 23 : 2.5, width: 20, height: 20,
              borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
          </button>
        </div>
        <p style={{ fontSize: 11.5, color: "#94a3b8", margin: "0 0 14px" }}>
          {form.manual_upi_enabled
            ? "ON — patients see the UPI QR code instead of Razorpay/Stripe at checkout."
            : "OFF — patients pay via Razorpay/Stripe as usual."}
        </p>
        <input style={inp} placeholder="UPI ID (e.g. 9025786467@okbizaxis)" value={form.upi_id} onChange={(e) => setForm(f => ({ ...f, upi_id: e.target.value }))} />
        <input style={inp} placeholder="Payee display name" value={form.payee_name} onChange={(e) => setForm(f => ({ ...f, payee_name: e.target.value }))} />
        <input style={inp} placeholder="Phone (optional, for reference)" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
        <input style={inp} placeholder="QR code image URL" value={form.qr_url} onChange={(e) => setForm(f => ({ ...f, qr_url: e.target.value }))} />
        <p style={{ fontSize: 11, color: "#94a3b8", margin: "-4px 0 10px" }}>
          Default QR image is already at <code>/assets/upi-qr-code.jpg</code> — only change this if you need a different code.
        </p>
        <button onClick={saveSettings} disabled={saving} style={{
          background: "#047857", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px",
          fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>

      {/* Pending verifications */}
      <h3 style={{ fontSize: 16, color: "#0b1f3a", marginBottom: 12 }}>
        Pending Verifications ({pending.length})
      </h3>
      {loadingPending ? <Spinner /> : pending.map((a) => (
        <div key={a.id} style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0 }}>{a.patient_name} — ₹{a.payment_amount}</p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
              {a.doctors?.full_name || "Doctor"} · {a.appointment_date} {a.appointment_time?.slice(0, 5)}
            </p>
            <p style={{ fontSize: 12.5, color: "#0369a1", fontWeight: 700, margin: "4px 0 0" }}>
              UTR: {a.payment_reference}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => verify(a.id, true)} style={{ background: "#047857", color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              ✓ Approve
            </button>
            <button onClick={() => verify(a.id, false)} style={{ background: "#fef2f2", color: "#991b1b", border: "1.5px solid #fecaca", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              ✕ Reject
            </button>
          </div>
        </div>
      ))}
      {!loadingPending && !pending.length && <p style={{ color: "#94a3b8", fontSize: 13.5 }}>No payments awaiting verification.</p>}
    </div>
  );
}
