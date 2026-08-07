/**
 * pages/patient/FamilyPlan.jsx — Family Health Plan (individual/B2C
 * subscription). Mirrors the corporate subscribe flow, just scoped
 * to one patient/family instead of a company.
 */
import { useEffect, useState } from "react";
import SEO from "../../components/SEO";
import { showToast } from "../../components/Toast";
import { Money } from "../../utils/currency";

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
.fp h1{font-family:'Cormorant Garamond',serif;color:#0b1f3a;font-size:28px;margin:0 0 4px;}
.fp-toggle{display:flex;gap:6px;background:#f1f5f9;border-radius:20px;padding:4px;width:fit-content;margin:16px 0 24px;}
.fp-toggle button{padding:8px 18px;border:none;border-radius:16px;font-weight:700;font-size:12.5px;cursor:pointer;background:transparent;color:#64748b;}
.fp-toggle button.on{background:#047857;color:#fff;}
.fp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;}
.fp-card{background:#fff;border:1.5px solid #e2eaf4;border-radius:14px;padding:22px;}
.fp-btn{width:100%;background:linear-gradient(135deg,#047857,#059669);color:#fff;border:none;border-radius:9px;padding:12px;font-weight:700;font-size:14px;cursor:pointer;margin-top:16px;}
`;

export default function FamilyPlan() {
  const [plans, setPlans] = useState([]);
  const [sub, setSub] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null); // plan id being subscribed to

  const token = () => localStorage.getItem("wc4a_token");

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const subscribe = async (plan) => {
    setSubscribing(plan.id);
    try {
      const res = await fetch(`${API}/patient/subscribe`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ plan_id: plan.id, billing_cycle: cycle }),
      });
      const sJson = await res.json();
      if (!res.ok) { showToast(sJson.detail || "Couldn't select this plan.", "error"); return; }

      const loaded = await loadRazorpayScript();
      if (!loaded) { showToast("Couldn't load payment gateway.", "error"); return; }

      const orderRes = await fetch(`${API}/patient/subscription/create-order`, {
        method: "POST", headers: { Authorization: `Bearer ${token()}` },
      });
      const order = await orderRes.json();
      if (!orderRes.ok) { showToast(order.detail || "Couldn't start payment.", "error"); return; }

      const rz = new window.Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: "We Care 4 'all'", description: `${plan.name} — Family Health Plan`,
        order_id: order.order_id, theme: { color: "#047857" },
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
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSubscribing(null); }
  };

  const isActive = sub && sub.status === "paid" && new Date(sub.expires_at) > new Date();

  return (
    <div className="fp">
      <SEO title="Family Health Plan — We Care 4 'all'" noindex />
      <style>{G}</style>
      <h1>💚 Family Health Plan</h1>
      <p style={{ color: "#64748b", fontSize: 13.5, margin: 0 }}>
        Unlimited access to doctor booking, with a fixed number of consultations covered every cycle — no per-visit payment.
      </p>

      {loading ? <p style={{ color: "#94a3b8", marginTop: 16 }}>Loading…</p> : isActive ? (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12, padding: 20, margin: "20px 0" }}>
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
                <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "#0b1f3a" }}>{p.name}</h3>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 14px" }}>{p.description}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#0b1f3a", margin: "0 0 4px" }}>
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
        </>
      )}
    </div>
  );
}
