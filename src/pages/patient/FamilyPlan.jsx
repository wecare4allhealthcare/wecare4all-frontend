/**
 * pages/patient/FamilyPlan.jsx — Family Health Plan (individual/B2C
 * subscription). Mirrors the corporate subscribe flow, just scoped
 * to one patient/family instead of a company.
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
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
.fp{font-family:'DM Sans',sans-serif;color:#1e293b;max-width:820px;margin:0 auto;padding:28px 20px 60px;}
.fp h1{font-family:'Cormorant Garamond',serif;color:var(--wc-navy);font-size:28px;margin:0 0 4px;}
.fp-toggle{display:flex;gap:6px;background:#f1f5f9;border-radius:20px;padding:4px;width:fit-content;margin:16px 0 24px;}
.fp-toggle button{padding:8px 18px;border:none;border-radius:16px;font-weight:700;font-size:12.5px;cursor:pointer;background:transparent;color:var(--wc-muted);}
.fp-toggle button.on{background:var(--wc-green);color:#fff;}
.fp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;}
.fp-card{background:#fff;border:1.5px solid var(--wc-border);border-radius:14px;padding:22px;}
.fp-btn{width:100%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;border:none;border-radius:9px;padding:12px;font-weight:700;font-size:14px;cursor:pointer;margin-top:16px;}
`;

export default function FamilyPlan() {
  const [plans, setPlans] = useState([]);
  const [sub, setSub] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null); // plan id being subscribed to
  const [pendingPlan, setPendingPlan] = useState(null); // {plan, } once /patient/subscribe succeeds, before gateway choice
  const [stripeLoading, setStripeLoading] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(null); // manual_upi_enabled toggle — checked before offering Razorpay/Stripe

  const token = () => localStorage.getItem("wc4a_token");

  const loadSubscription = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch(`${API}/plans/individual`),
        fetch(`${API}/patient/my-subscription`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      const plansJson = await plansRes.json();
      const subJson = await subRes.json();
      setPlans(plansJson.plans || []);
      setSub(subJson.subscription || null);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadSubscription();
    (async () => {
      try {
        const res = await fetch(`${API}/payment-settings`);
        setPaymentSettings(await res.json());
      } catch { setPaymentSettings({ manual_upi_enabled: false }); }
    })();
  }, []);

  // Stripe redirects back here after checkout (see success_url/
  // cancel_url in stripe_payments.py's create-session/subscription).
  // The webhook activates the plan asynchronously, so this can't show
  // "active" immediately — it just gives feedback and re-fetches so
  // the status updates once the webhook lands.
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const stripeResult = searchParams.get("stripe");
    if (stripeResult === "success") {
      showToast("Payment received! Activating your plan — this can take a few seconds.", "success");
      setPendingPlan(null);
      loadSubscription();
    } else if (stripeResult === "cancelled") {
      showToast("Payment was cancelled. You can try again anytime.", "info");
      setPendingPlan(null);
    }
  }, [searchParams]);

  const subscribe = async (plan) => {
    setSubscribing(plan.id);
    try {
      const res = await fetch(`${API}/patient/subscribe`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ plan_id: plan.id, billing_cycle: cycle }),
      });
      const sJson = await res.json();
      if (!res.ok) { showToast(sJson.detail || "Couldn't select this plan.", "error"); return; }
      // Let the patient pick Razorpay (India) or Stripe (international)
      // instead of auto-launching Razorpay — same choice Payment.jsx
      // (consultation fees) already gives.
      setPendingPlan(plan);
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSubscribing(null); }
  };

  const payViaRazorpay = async (plan) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) { showToast("Couldn't load payment gateway.", "error"); return; }
    try {
      const orderRes = await fetch(`${API}/patient/subscription/create-order`, {
        method: "POST", headers: { Authorization: `Bearer ${token()}` },
      });
      const order = await orderRes.json();
      if (!orderRes.ok) { showToast(order.detail || "Couldn't start payment.", "error"); return; }

      const rz = new window.Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: "We Care 4 'all'", description: `${plan.name} — Family Health Plan`,
        order_id: order.order_id, theme: { color: "var(--wc-green)" },
        handler: async (response) => {
          const vRes = await fetch(`${API}/patient/subscription/verify`, {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (vRes.ok) { showToast("Subscribed! Your plan is now active.", "success"); window.location.reload(); }
          else showToast("Payment verification failed. Contact support.", "error");
        },
      });
      rz.open();
    } catch { showToast("Payment error.", "error"); }
  };

  const payViaStripe = async () => {
    setStripeLoading(true);
    try {
      const res = await fetch(`${API}/payments/stripe/create-session/subscription`, {
        method: "POST", headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't start Stripe checkout.", "error"); return; }
      window.location.href = json.checkout_url;
    } catch { showToast("Payment error.", "error"); }
    finally { setStripeLoading(false); }
  };

  const isActive = sub && sub.status === "paid" && new Date(sub.expires_at) > new Date();

  return (
    <div className="fp">
      <SEO title="Family Health Plan — We Care 4 'all'" noindex />
      <style>{G}</style>
      <h1>💚 Family Health Plan</h1>
      <p style={{ color: "var(--wc-muted)", fontSize: 13.5, margin: 0 }}>
        Unlimited access to doctor booking, with a fixed number of consultations covered every cycle — no per-visit payment.
      </p>

      {loading ? <p style={{ color: "#94a3b8", marginTop: 16 }}>Loading…</p> : isActive ? (
        <div style={{ background: "var(--wc-sage)", border: "1px solid #86efac", borderRadius: 12, padding: 20, margin: "20px 0" }}>
          <p style={{ fontWeight: 700, color: "#15803d", margin: 0 }}>✅ {sub.individual_plans?.name || "Your Plan"} — Active</p>
          <p style={{ fontSize: 13, color: "#166534", margin: "6px 0 0" }}>
            {sub.consultations_used} of {sub.individual_plans?.consultations_included} consultations used this cycle.
            Renews {new Date(sub.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.
          </p>
        </div>
      ) : (
        <>
          <div className="fp-toggle">
            <button className={cycle === "monthly" ? "on" : ""} onClick={() => setCycle("monthly")}>Monthly</button>
            <button className={cycle === "annual" ? "on" : ""} onClick={() => setCycle("annual")}>Annual (save more)</button>
          </div>
          <div className="fp-grid">
            {plans.map((p) => (
              <div className="fp-card" key={p.id}>
                <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--wc-navy)" }}>{p.name}</h3>
                <p style={{ fontSize: 12.5, color: "var(--wc-muted)", margin: "0 0 14px" }}>{p.description}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: "var(--wc-navy)", margin: "0 0 4px" }}>
                  <Money amount={cycle === "annual" ? p.annual_amount : p.monthly_amount}/>
                  <span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8" }}> /{cycle === "annual" ? "year" : "month"}</span>
                </p>
                <ul style={{ margin: "14px 0 0", padding: "0 0 0 18px", fontSize: 13, color: "#374151" }}>
                  <li>{p.consultations_included} consultations included</li>
                  <li>Covers up to {p.max_family_members} {p.max_family_members > 1 ? "family members" : "person"}</li>
                  <li>No payment at booking time</li>
                </ul>
                <button className="fp-btn" disabled={subscribing === p.id} onClick={() => subscribe(p)}>
                  {subscribing === p.id ? "Processing…" : "Subscribe"}
                </button>
              </div>
            ))}
          </div>
          {!plans.length && <p style={{ color: "#94a3b8", fontSize: 13.5 }}>No plans available right now.</p>}

          {/* Payment — while GST registration is pending, admin turns
              on manual UPI globally, and every payment surface in the
              app — including this one — shows the QR fallback instead
              of Razorpay/Stripe. */}
          {pendingPlan && (
            <div style={{ marginTop: 20 }}>
              {paymentSettings?.manual_upi_enabled ? (
                <ManualUpiPayment
                  submitEndpoint="/patient/subscription/submit-payment-proof"
                  token={token()} amount={cycle === "annual" ? pendingPlan.annual_amount : pendingPlan.monthly_amount}
                  onSubmitted={() => {}}
                />
              ) : (
                <div style={{ padding: 16, background: "var(--wc-warm-white)", border: "1.5px solid var(--wc-border)", borderRadius: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: 13.5, margin: "0 0 10px" }}>
                    Plan selected — pay to activate <strong>{pendingPlan.name}</strong>:
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="fp-btn" onClick={() => payViaRazorpay(pendingPlan)}>
                      Pay via Razorpay (India)
                    </button>
                    <button className="fp-btn" style={{ background: "#635bff" }} disabled={stripeLoading}
                      onClick={payViaStripe}>
                      {stripeLoading ? "Loading…" : "Pay via Stripe (International)"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
