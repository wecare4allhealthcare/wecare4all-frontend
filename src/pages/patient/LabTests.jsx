/**
 * pages/patient/LabTests.jsx — Lab Test Booking + Home Sample
 * Collection. Browse catalog → pick tests → choose collection type +
 * schedule → pay (skipped if company-sponsored) → track in "My
 * Bookings" below.
 */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SEO from "../../components/SEO";
import { showToast } from "../../components/Toast";
import { Money } from "../../utils/currency";
import ManualUpiPayment from "../../components/ManualUpiPayment";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const G = `
.lt{font-family:'Inter',sans-serif;color:#1e293b;max-width:820px;margin:0 auto;padding:28px 20px 60px;}
.lt h1{font-family:'Manrope',sans-serif;color:var(--wc-navy);font-size:28px;margin:0 0 4px;}
.lt-tabs{display:flex;gap:8px;margin:18px 0 20px;border-bottom:1px solid var(--wc-border);}
.lt-tab{padding:10px 4px;border:none;background:none;font-weight:700;font-size:13.5px;color:#94a3b8;cursor:pointer;border-bottom:2px solid transparent;margin-right:18px;}
.lt-tab.on{color:var(--wc-green);border-color:var(--wc-green);}
.lt-card{background:#fff;border:1px solid var(--wc-border);border-radius:12px;padding:14px 16px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px;}
.lt-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:8px;padding:10px 12px;font-family:'Inter',sans-serif;font-size:13.5px;outline:none;margin-bottom:12px;}
.lt-btn{background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;border:none;border-radius:9px;padding:11px 18px;font-weight:700;font-size:13.5px;cursor:pointer;}
`;

export default function LabTests() {
  const [view, setView] = useState("catalog"); // catalog | book | bookings
  const [tests, setTests] = useState([]);
  const [selected, setSelected] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState("");
  const [loading, setLoading] = useState(true);

  const [collectionType, setCollectionType] = useState("home");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [pendingPayment, setPendingPayment] = useState(null); // {bookingId, amount} once booked, before gateway choice
  const [stripeLoading, setStripeLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(null); // manual_upi_enabled toggle — checked before offering Razorpay/Stripe

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/payment-settings`);
        setPaymentSettings(await res.json());
      } catch { setPaymentSettings({ manual_upi_enabled: false }); }
    })();
  }, []);

  const token = () => localStorage.getItem("wc4a_token");

  // Stripe redirects back here after checkout (see success_url/
  // cancel_url in stripe_payments.py's create-session/lab-booking).
  // The webhook marks the booking paid asynchronously in the
  // background, so this can't show "paid" immediately — it just lets
  // the patient know what happened and switches them to "My Bookings"
  // so they can watch the status update once the webhook lands,
  // instead of silently landing back on the catalog with no feedback.
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const stripeResult = searchParams.get("stripe");
    if (stripeResult === "success") {
      showToast("Payment received! Confirming your booking — this can take a few seconds.", "success");
      setView("bookings");
      loadBookings();
    } else if (stripeResult === "cancelled") {
      showToast("Payment was cancelled. Your booking is saved — you can pay again anytime.", "info");
      setView("bookings");
      loadBookings();
    }
  }, [searchParams]);

  const loadTests = async () => {
    try {
      const res = await fetch(`${API}/lab-tests`);
      const json = await res.json();
      setTests(json.tests || []);
    } catch {}
  };
  const loadBookings = async () => {
    try {
      const res = await fetch(`${API}/lab-bookings/my`, { headers: { Authorization: `Bearer ${token()}` } });
      const json = await res.json();
      setBookings(json.bookings || []);
    } catch {}
  };
  const loadLabs = async () => {
    try {
      const res = await fetch(`${API}/labs`, { headers: { Authorization: `Bearer ${token()}` } });
      const json = await res.json();
      const list = json.labs || [];
      setLabs(list);
      if (list.length === 1) setSelectedLab(list[0].id);
    } catch {}
  };

  useEffect(() => { (async () => { await Promise.all([loadTests(), loadBookings(), loadLabs()]); setLoading(false); })(); }, []);

  const toggleTest = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const total = tests.filter((t) => selected.includes(t.id)).reduce((sum, t) => sum + Number(t.price), 0);

  const submitBooking = async () => {
    setErr("");
    if (!selected.length) { showToast("Select at least one test.", "error"); return; }
    if (collectionType === "home" && !address.trim()) { showToast("Enter your address for home collection.", "error"); return; }
    if (!date) { showToast("Choose a date.", "error"); return; }
    if (labs.length > 1 && !selectedLab) { setErr("Please choose a lab center."); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/lab-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          test_ids: selected, lab_id: selectedLab || null, collection_type: collectionType,
          address: collectionType === "home" ? address : null,
          scheduled_date: date, scheduled_time_slot: timeSlot || null, notes: notes || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't book.", "error"); return; }

      if (json.is_company_sponsored) {
        showToast("Booked! Covered under your company plan — no payment needed.", "success");
        resetAndRefresh();
        return;
      }
      // Let the patient pick Razorpay (India) or Stripe (international)
      // instead of auto-launching Razorpay — same choice Payment.jsx
      // (consultation fees) already gives.
      setPendingPayment({ bookingId: json.booking_id, amount: json.total_amount });
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSaving(false); }
  };

  const payViaRazorpay = async (bookingId) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) { showToast("Couldn't load payment gateway.", "error"); return; }
    try {
      const res = await fetch(`${API}/lab-bookings/${bookingId}/create-order`, {
        method: "POST", headers: { Authorization: `Bearer ${token()}` },
      });
      const order = await res.json();
      if (!res.ok) { showToast(order.detail || "Couldn't start payment.", "error"); return; }

      const rz = new window.Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: "We Care 4 'all'", description: "Lab Test Booking",
        order_id: order.order_id, theme: { color: "var(--wc-green)" },
        handler: async (response) => {
          const vRes = await fetch(`${API}/lab-bookings/verify`, {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (vRes.ok) { showToast("Payment successful! Booking confirmed.", "success"); setPendingPayment(null); resetAndRefresh(); }
          else showToast("Payment verification failed. Contact support.", "error");
        },
      });
      rz.open();
    } catch { showToast("Payment error.", "error"); }
  };

  const payViaStripe = async (bookingId) => {
    setStripeLoading(true);
    try {
      const res = await fetch(`${API}/payments/stripe/create-session/lab-booking`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't start Stripe checkout.", "error"); return; }
      window.location.href = json.checkout_url; // hand off to Stripe's hosted checkout
    } catch { showToast("Payment error.", "error"); }
    finally { setStripeLoading(false); }
  };

  const resetAndRefresh = () => {
    setSelected([]); setAddress(""); setDate(""); setTimeSlot(""); setNotes("");
    setView("bookings"); loadBookings();
  };

  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`${API}/lab-bookings/${id}/cancel`, { method: "PUT", headers: { Authorization: `Bearer ${token()}` } });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't cancel.", "error"); return; }
      showToast("Booking cancelled.", "success"); loadBookings();
    } catch { showToast("Couldn't reach the server.", "error"); }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="lt">
      <SEO title="Lab Tests — We Care 4 'all'" noindex />
      <style>{G}</style>
      <h1>🧪 Lab Tests</h1>
      <p style={{ color: "var(--wc-muted)", fontSize: 13.5, margin: 0 }}>Book tests with home sample collection or visit a center.</p>

      <div className="lt-tabs">
        <button className={`lt-tab${view === "catalog" ? " on" : ""}`} onClick={() => setView("catalog")}>Browse Tests</button>
        <button className={`lt-tab${view === "book" ? " on" : ""}`} onClick={() => setView("book")}>
          Schedule {selected.length > 0 && `(${selected.length})`}
        </button>
        <button className={`lt-tab${view === "bookings" ? " on" : ""}`} onClick={() => setView("bookings")}>My Bookings</button>
      </div>

      {loading ? <p style={{ color: "#94a3b8" }}>Loading…</p> : view === "catalog" ? (
        <>
          {tests.map((t) => (
            <div className="lt-card" key={t.id}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: "var(--wc-muted)", margin: "2px 0 0" }}>{t.category}{t.prep_instructions ? ` · ${t.prep_instructions}` : ""}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 6px" }}><Money amount={t.price}/></p>
                <button onClick={() => toggleTest(t.id)} style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: selected.includes(t.id) ? "1.5px solid var(--wc-green)" : "1.5px solid var(--wc-border)",
                  background: selected.includes(t.id) ? "var(--wc-sage)" : "#fff",
                  color: selected.includes(t.id) ? "var(--wc-green)" : "var(--wc-muted)" }}>
                  {selected.includes(t.id) ? "✓ Added" : "+ Add"}
                </button>
              </div>
            </div>
          ))}
          {!tests.length && <p style={{ color: "#94a3b8", fontSize: 13.5 }}>No tests available right now.</p>}
        </>
      ) : view === "book" ? (
        <div className="lt-card" style={{ display: "block" }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            {selected.length} test(s) selected — Total: <Money amount={total}/>
          </p>
          <label style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4, display: "block" }}>Collection Type</label>
          <select className="lt-inp" value={collectionType} onChange={(e) => setCollectionType(e.target.value)}>
            <option value="home">🏠 Home Collection</option>
            <option value="center">🏥 Visit a Center</option>
          </select>
          {collectionType === "home" && (
            <>
              <label style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4, display: "block" }}>Address *</label>
              <input className="lt-inp" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address for sample collection" />
            </>
          )}

          {labs.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#dc2626", marginBottom: 14 }}>
              No lab centers available right now — please contact support.
            </p>
          ) : labs.length === 1 ? (
            <div style={{ background: "var(--wc-sage)", border: "1px solid #86efac", borderRadius: 10, padding: "11px 13px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#166534", margin: 0 }}>
                🧪 Will be sent to <strong>{labs[0].name}</strong>{labs[0].city ? ` — ${labs[0].city}` : ""}
              </p>
            </div>
          ) : (
            <>
              <label style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, display: "block" }}>Choose a Lab Center *</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {labs.map((l) => (
                  <button key={l.id} type="button" onClick={() => setSelectedLab(l.id)}
                    style={{ textAlign: "left", padding: "11px 13px", borderRadius: 10, cursor: "pointer",
                      border: selectedLab === l.id ? "1.5px solid var(--wc-green)" : "1.5px solid var(--wc-border)",
                      background: selectedLab === l.id ? "var(--wc-sage)" : "#fff" }}>
                    <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--wc-navy)", margin: 0 }}>
                      {selectedLab === l.id ? "✓ " : ""}{l.name}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--wc-muted)", margin: "3px 0 0" }}>
                      {[l.address, l.city].filter(Boolean).join(", ") || "Address not listed"}
                      {l.phone ? ` · ${l.phone}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
          {err && <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 12 }}>⚠ {err}</p>}

          <label style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4, display: "block" }}>Preferred Date *</label>
          <input type="date" className="lt-inp" min={todayStr} value={date} onChange={(e) => setDate(e.target.value)} />
          <label style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4, display: "block" }}>Preferred Time Slot</label>
          <input className="lt-inp" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} placeholder="e.g. 7:00 AM - 9:00 AM" />
          <label style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4, display: "block" }}>Notes (optional)</label>
          <input className="lt-inp" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="lt-btn" style={{ width: "100%" }} disabled={saving} onClick={submitBooking}>
            {saving ? "Booking…" : <>Confirm Booking — <Money amount={total} showUsd={false}/></>}
          </button>

          {/* Payment — while GST registration is pending, admin turns
              on manual UPI globally (see /admin/payment-settings), and
              every payment surface in the app — including this one —
              shows the QR fallback instead of Razorpay/Stripe. Flip
              that one admin toggle off later and Razorpay/Stripe comes
              back everywhere automatically, no code changes needed. */}
          {pendingPayment && (
            <div style={{ marginTop: 16 }}>
              {paymentSettings?.manual_upi_enabled ? (
                <ManualUpiPayment
                  submitEndpoint={`/lab-bookings/${pendingPayment.bookingId}/submit-payment-proof`}
                  token={token()} amount={pendingPayment.amount}
                  onSubmitted={() => { setPendingPayment(null); resetAndRefresh(); }}
                />
              ) : (
                <div style={{ padding: 16, background: "var(--wc-warm-white)", border: "1.5px solid var(--wc-border)", borderRadius: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: 13.5, margin: "0 0 10px" }}>
                    Booking created — pay <Money amount={pendingPayment.amount}/> to confirm:
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="lt-btn" onClick={() => payViaRazorpay(pendingPayment.bookingId)}>
                      Pay via Razorpay (India)
                    </button>
                    <button className="lt-btn" style={{ background: "#635bff" }} disabled={stripeLoading}
                      onClick={() => payViaStripe(pendingPayment.bookingId)}>
                      {stripeLoading ? "Loading…" : "Pay via Stripe (International)"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {bookings.map((b) => (
            <div className="lt-card" key={b.id}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{(b.test_names || []).join(", ")}</p>
                <p style={{ fontSize: 12, color: "var(--wc-muted)", margin: "2px 0 0" }}>
                  {b.scheduled_date} {b.scheduled_time_slot ? `· ${b.scheduled_time_slot}` : ""} · {b.collection_type === "home" ? "🏠 Home" : "🏥 Center"}
                  {b.lab_name ? ` · ${b.lab_name}` : ""}
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#f1f5f9", color: "#475569" }}>
                  {b.status.replace(/_/g, " ").toUpperCase()}
                </span>
                {b.status === "booked" && (
                  <button onClick={() => cancelBooking(b.id)} style={{ display: "block", marginTop: 6, background: "none", border: "none", color: "#dc2626", fontSize: 11.5, cursor: "pointer", padding: 0 }}>
                    Cancel
                  </button>
                )}
                {b.report_url && (
                  <a href={b.report_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 6, color: "#7c3aed", fontSize: 11.5, fontWeight: 700 }}>
                    View Report
                  </a>
                )}
              </div>
            </div>
          ))}
          {!bookings.length && <p style={{ color: "#94a3b8", fontSize: 13.5 }}>No lab bookings yet.</p>}
        </>
      )}
    </div>
  );
}
