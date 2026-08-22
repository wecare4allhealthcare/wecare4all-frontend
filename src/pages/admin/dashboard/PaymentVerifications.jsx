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
  // Fixed (Aug 2026 — "my waitlist, payments these must be in admin
  // control"): same on/off-until-admin-enables pattern as Lab Tests/
  // Medicine Orders (see LabAndFamilyPlans.jsx/PharmacyManagement.jsx)
  // and Family Plan (added to LabAndFamilyPlans.jsx alongside its Lab
  // Tests toggle) — these two live here instead since this page
  // already has the exact toggle-switch UI to match, and "Payments"
  // specifically fits a payment-settings page topically.
  const [tiles, setTiles] = useState({ waitlist_enabled: false, payments_enabled: false });
  const [savingTile, setSavingTile] = useState(null); // which key is currently saving, or null

  const loadTiles = async () => {
    try {
      const res = await fetch(`${API}/patient-dashboard-settings`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setTiles({ waitlist_enabled: !!json.waitlist_enabled, payments_enabled: !!json.payments_enabled });
    } catch {}
  };

  const toggleTile = async (key) => {
    const next = !tiles[key];
    setSavingTile(key);
    setTiles(t => ({ ...t, [key]: next })); // optimistic
    try {
      const res = await fetch(`${API}/admin/patient-dashboard-settings`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [key]: next }),
      });
      if (!res.ok) setTiles(t => ({ ...t, [key]: !next }));
    } catch { setTiles(t => ({ ...t, [key]: !next })); }
    finally { setSavingTile(null); }
  };

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

  useEffect(() => { loadSettings(); loadPending(); loadTiles(); }, []);

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

  const inp = { width: "100%", border: "1.5px solid var(--wc-border)", borderRadius: 8, padding: "9px 11px", fontFamily: "'Inter',sans-serif", fontSize: 13.5, marginBottom: 10 };

  return (
    <div>
      <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 26, color: "var(--wc-navy)", margin: "0 0 4px" }}>
        UPI Payment Verification
      </h1>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "var(--wc-muted)", marginBottom: 20 }}>
        Temporary manual UPI payment fallback — use while Razorpay isn't available (e.g. GST registration pending).
      </p>

      {/* Fixed (Aug 2026 — "my waitlist, payments these must be in
          admin control"): patient-dashboard tile visibility toggles —
          same on/off pattern as Manual UPI above, Lab Tests/Medicine
          Orders, and Family Plan (LabAndFamilyPlans.jsx). Off by
          default so nothing changes visually until admin explicitly
          turns each one on. */}
      <div style={{ background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: 12, padding: 20, marginBottom: 24, maxWidth: 480 }}>
        <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px", color: "var(--wc-navy)" }}>Patient Dashboard Tiles</p>
        <p style={{ fontSize: 11.5, color: "#94a3b8", margin: "0 0 14px" }}>
          Control which of these Quick Action tiles appear on the patient dashboard.
        </p>
        {[
          ["waitlist_enabled", "My Waitlist", "Shows the waitlist tile once patients have a real reason to check it."],
          ["payments_enabled", "Payments", "Shows the payment history tile on the patient dashboard."],
        ].map(([key, label, desc]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ paddingRight: 12 }}>
              <p style={{ fontWeight: 600, fontSize: 13, margin: "0 0 2px", color: "#374151" }}>{label}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{desc}</p>
            </div>
            <button onClick={() => toggleTile(key)} disabled={savingTile === key}
              aria-label={`Toggle ${label} visibility for patients`}
              style={{ width: 46, height: 25, borderRadius: 20, border: "none",
                cursor: savingTile === key ? "wait" : "pointer", flexShrink: 0,
                background: tiles[key] ? "var(--wc-green)" : "#cbd5e1", position: "relative" }}>
              <span style={{ position: "absolute", top: 2.5, left: tiles[key] ? 23 : 2.5, width: 20, height: 20,
                borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
            </button>
          </div>
        ))}
      </div>

      {/* Settings panel */}
      <div style={{ background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: 12, padding: 20, marginBottom: 24, maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "var(--wc-navy)" }}>Manual UPI Payment</p>
          <button onClick={() => setForm(f => ({ ...f, manual_upi_enabled: !f.manual_upi_enabled }))} style={{
            width: 46, height: 25, borderRadius: 20, border: "none", cursor: "pointer",
            background: form.manual_upi_enabled ? "var(--wc-green)" : "#cbd5e1", position: "relative" }}>
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
          background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px",
          fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>

      {/* Pending verifications */}
      <h3 style={{ fontSize: 16, color: "var(--wc-navy)", marginBottom: 12 }}>
        Pending Verifications ({pending.length})
      </h3>
      {loadingPending ? <Spinner /> : pending.map((a) => (
        <div key={a.id} style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0 }}>{a.patient_name} — ₹{a.payment_amount}</p>
            <p style={{ fontSize: 12, color: "var(--wc-muted)", margin: "2px 0 0" }}>
              {a.doctors?.full_name || "Doctor"} · {a.appointment_date} {a.appointment_time ? `${a.appointment_time.slice(0, 5)} IST` : ""}
            </p>
            <p style={{ fontSize: 12.5, color: "var(--wc-teal)", fontWeight: 700, margin: "4px 0 0" }}>
              UTR: {a.payment_reference}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => verify(a.id, true)} style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              ✓ Approve
            </button>
            <button onClick={() => verify(a.id, false)} style={{ background: "#fef2f2", color: "#991b1b", border: "1.5px solid #fecaca", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              ✕ Reject
            </button>
          </div>
        </div>
      ))}
      {!loadingPending && !pending.length && <p style={{ color: "#94a3b8", fontSize: 13.5 }}>No payments awaiting verification.</p>}

      <PartnerSubQueue token={token} type="pharmacy" label="Pharmacy Subscriptions" />
      <PartnerSubQueue token={token} type="lab" label="Lab Center Subscriptions" />

      {/* Patient-facing manual UPI payments — added when GST is
          pending and Home Healthcare/Pharmacy previously had NO online
          payment path at all (COD/manual-only), and Lab Tests/Family
          Plan already have Razorpay+Stripe as their "real" gateway but
          fall back to this same manual queue while manual UPI is on. */}
      <PatientPaymentQueue token={token} pendingUrl="/admin/lab-bookings/pending-payment-verifications"
        verifyUrlBase="/admin/lab-bookings" listKey="bookings"
        label="Lab Test Bookings" amountKey="total_amount"
        subtitle={(b) => b.patient_name || ""} />
      <PatientPaymentQueue token={token} pendingUrl="/admin/family-plan-subscriptions/pending-payment-verifications"
        verifyUrlBase="/admin/family-plan-subscriptions" listKey="subscriptions"
        label="Family Health Plan Subscriptions" amountKey="amount"
        subtitle={(s) => s.billing_cycle || ""} />
      <PatientPaymentQueue token={token} pendingUrl="/home-healthcare/admin/pending-payment-verifications"
        verifyUrlBase="/home-healthcare/admin" listKey="bookings"
        label="Home Healthcare Bookings" amountKey="calculated_price"
        subtitle={(b) => b.home_healthcare_services?.name || ""} />
      <PatientPaymentQueue token={token} pendingUrl="/admin/pharmacy-orders/pending-payment-verifications"
        verifyUrlBase="/admin/pharmacy-orders" listKey="orders"
        label="Pharmacy Orders" amountKey="total_amount"
        subtitle={() => "Pharmacy order"} />
    </div>
  );
}

// ── Generic manual-UPI verification queue for the four patient-side
// payment flows added alongside pharmacy/lab-tests/home-healthcare/
// family-plan Stripe support: pendingUrl/verifyUrlBase are full API
// paths (not guessed/assembled) because these four route files don't
// all share one prefix convention — home_healthcare.py's router has
// its own /home-healthcare prefix, the other three don't — see the
// corresponding route files (lab_bookings.py, individual_
// subscriptions.py, home_healthcare.py, pharmacy.py) for exactly what
// each returns.
function PatientPaymentQueue({ token, pendingUrl, verifyUrlBase, listKey, label, amountKey, subtitle }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}${pendingUrl}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setPending(json[listKey] || []);
    } catch { setPending([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const verify = async (id, approve) => {
    try {
      const res = await fetch(`${API}${verifyUrlBase}/${id}/verify-payment`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approve }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't update.", "error"); return; }
      showToast(approve ? "Payment approved." : "Payment rejected.", "success");
      load();
    } catch { showToast("Network error.", "error"); }
  };

  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ fontSize: 16, color: "var(--wc-navy)", marginBottom: 12 }}>
        {label} — Pending Verifications ({pending.length})
      </h3>
      {loading ? <Spinner /> : pending.map((item) => (
        <div key={item.id} style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0 }}>₹{item[amountKey] ?? "—"}</p>
            <p style={{ fontSize: 12, color: "var(--wc-muted)", margin: "2px 0 0" }}>{subtitle(item)}</p>
            <p style={{ fontSize: 12.5, color: "var(--wc-teal)", fontWeight: 700, margin: "4px 0 0" }}>
              UTR: {item.payment_reference}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => verify(item.id, true)} style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              ✓ Approve
            </button>
            <button onClick={() => verify(item.id, false)} style={{ background: "#fef2f2", color: "#991b1b", border: "1.5px solid #fecaca", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              ✕ Reject
            </button>
          </div>
        </div>
      ))}
      {!loading && !pending.length && <p style={{ color: "#94a3b8", fontSize: 13.5 }}>No {label.toLowerCase()} awaiting verification.</p>}
    </div>
  );
}

// ── Manual-UPI subscription verification queue for Pharmacy/Lab
// partners — same UTR approve/reject idea as the appointments queue
// above, just against /admin/{type}-subscriptions/pending-verifications
// and /admin/{type}-subscriptions/{id}/verify-payment (see
// partner_subscriptions.py). Kept local to this file rather than
// shared.jsx since it's specific to this payment-verification screen.
function PartnerSubQueue({ token, type, label }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/${type}-subscriptions/pending-verifications`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setPending(json.subscriptions || []);
    } catch { setPending([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const verify = async (id, approve) => {
    try {
      const res = await fetch(`${API}/admin/${type}-subscriptions/${id}/verify-payment`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ approve }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't update.", "error"); return; }
      showToast(approve ? "Payment approved — subscription active." : "Payment rejected.", "success");
      load();
    } catch { showToast("Network error.", "error"); }
  };

  const planKey = type === "pharmacy" ? "pharmacy_plans" : "lab_plans";
  const nameKey = type === "pharmacy" ? "pharmacies" : "labs";

  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ fontSize: 16, color: "var(--wc-navy)", marginBottom: 12 }}>
        {label} — Pending Verifications ({pending.length})
      </h3>
      {loading ? <Spinner /> : pending.map((s) => (
        <div key={s.id} style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13.5, margin: 0 }}>
              {s[nameKey]?.name || "Partner"} — ₹{s.amount} ({s.billing_cycle})
            </p>
            <p style={{ fontSize: 12, color: "var(--wc-muted)", margin: "2px 0 0" }}>
              {s[planKey]?.name || "Plan"} · {s[nameKey]?.email || ""}
            </p>
            <p style={{ fontSize: 12.5, color: "var(--wc-teal)", fontWeight: 700, margin: "4px 0 0" }}>
              UTR: {s.payment_reference}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => verify(s.id, true)} style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              ✓ Approve
            </button>
            <button onClick={() => verify(s.id, false)} style={{ background: "#fef2f2", color: "#991b1b", border: "1.5px solid #fecaca", borderRadius: 7, padding: "8px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              ✕ Reject
            </button>
          </div>
        </div>
      ))}
      {!loading && !pending.length && <p style={{ color: "#94a3b8", fontSize: 13.5 }}>No {label.toLowerCase()} awaiting verification.</p>}
    </div>
  );
}
