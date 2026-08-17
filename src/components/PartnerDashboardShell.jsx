/**
 * components/PartnerDashboardShell.jsx — shared shell for the Pharmacy
 * and Lab partner dashboards. Owns three things both portals need
 * identically:
 *   1. Header + logout + application/subscription status banner
 *   2. Profile Setup tab (GET/PUT /{type}/profile)
 *   3. Plan & Billing tab — plan catalog, subscribe, then either
 *      Razorpay checkout (mirrors patient/FamilyPlan.jsx) or manual
 *      UPI QR + UTR submission (mirrors patient/Payment.jsx),
 *      whichever GET /payment-settings currently has admin set to.
 *
 * The portal-specific "live" content (Pharmacy's order list, Lab's
 * booking requests) is passed in as `children` and only rendered once
 * the partner is actually_active is *approved* — is_active on the
 * pharmacies/labs row is application_status==='approved' AND
 * subscription_status==='active' (see app/utils/partner_status.py) —
 * before that, the third tab shows a short explanation instead.
 *
 * type: "pharmacy" | "lab"
 */
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { showToast } from "./Toast";

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
.pds{font-family:'Inter',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.pds *{box-sizing:border-box;}
.pds h1,.pds h2{font-family:'Manrope',sans-serif;}
@keyframes pds-spin{to{transform:rotate(360deg)}}
.pds-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:10px 13px;
  font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);outline:none;margin-bottom:14px;}
.pds-label{font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;display:block;}
.pds-tab{padding:9px 18px;border-radius:8px;cursor:pointer;border:1.5px solid var(--wc-border);
  background:#fff;color:var(--wc-muted);font-family:'Inter',sans-serif;font-weight:600;font-size:13px;}
.pds-tab.on{border-color:var(--wc-green);background:var(--wc-sage);color:var(--wc-green);}
.pds-tab:disabled{opacity:.5;cursor:not-allowed;}
.pds-btn{background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;border:none;border-radius:9px;
  padding:12px 18px;font-family:'Inter',sans-serif;font-weight:700;font-size:14px;cursor:pointer;}
.pds-btn:disabled{opacity:.6;cursor:not-allowed;}
`;

const ENDPOINTS = {
  pharmacy: {
    portalLabel: "Pharmacy Portal", profileKey: "pharmacy",
    profile: "/pharmacy/profile", plans: "/plans/pharmacy", mySub: "/pharmacy/my-subscription",
    subscribe: "/pharmacy/subscribe", createOrder: "/pharmacy/subscription/create-order",
    verify: "/pharmacy/subscription/verify", proof: "/pharmacy/subscription/submit-payment-proof",
    nameField: "name", nameLabel: "Pharmacy Name", licenseLabel: "Drug License Number",
  },
  lab: {
    portalLabel: "Lab Center Portal", profileKey: "lab",
    profile: "/lab/profile", plans: "/plans/lab", mySub: "/lab/my-subscription",
    subscribe: "/lab/subscribe", createOrder: "/lab/subscription/create-order",
    verify: "/lab/subscription/verify", proof: "/lab/subscription/submit-payment-proof",
    nameField: "name", nameLabel: "Lab Center Name", licenseLabel: "NABL / Registration Number",
  },
};

const STATUS_COPY = {
  pending:  { label: "Application under review", color: "#854d0e", bg: "#fef9c3",
              body: "Thanks for signing up! Our team is reviewing your application. You'll be notified once it's approved." },
  approved: { label: "Application approved", color: "#15803d", bg: "var(--wc-sage)",
              body: "You're approved. Choose a plan below to go live and start receiving requests." },
  rejected: { label: "Application not approved", color: "#991b1b", bg: "#fef2f2",
              body: "Your application wasn't approved this time. Contact support for details." },
};

export default function PartnerDashboardShell({ type, liveTabLabel, children }) {
  const cfg = ENDPOINTS[type];
  const { user, logout } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("wc4a_token") : null;
  const authHeader = { Authorization: `Bearer ${token}` };

  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [form, setForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [plans, setPlans] = useState([]);
  const [sub, setSub] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [subscribing, setSubscribing] = useState(null);
  const [upiReference, setUpiReference] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [loadedBilling, setLoadedBilling] = useState(false);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`${API}${cfg.profile}`, { headers: authHeader });
      const json = await res.json();
      const p = json[cfg.profileKey] || null;
      setProfile(p);
      if (p) {
        setForm({
          [cfg.nameField]: p[cfg.nameField] || "", owner_name: p.owner_name || "",
          phone: p.phone || "", address: p.address || "", city: p.city || "",
          state: p.state || "", pincode: p.pincode || "",
          license_number: p.license_number || "", gstin: p.gstin || "",
        });
      }
    } catch { setProfile(null); }
    finally { setLoadingProfile(false); }
  };
  useEffect(() => { loadProfile(); }, []);

  const loadBilling = async () => {
    try {
      const [plansRes, subRes, settingsRes] = await Promise.all([
        fetch(`${API}${cfg.plans}`),
        fetch(`${API}${cfg.mySub}`, { headers: authHeader }),
        fetch(`${API}/payment-settings`),
      ]);
      const plansJson = await plansRes.json();
      const subJson = await subRes.json();
      const settingsJson = await settingsRes.json();
      setPlans(plansJson.plans || []);
      setSub(subJson.subscription || null);
      setPaymentSettings(settingsJson);
    } catch { setPaymentSettings({ manual_upi_enabled: false }); }
    finally { setLoadedBilling(true); }
  };
  useEffect(() => { if (tab === "plan" && !loadedBilling) loadBilling(); }, [tab]);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`${API}${cfg.profile}`, {
        method: "PUT", headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't save profile.", "error"); return; }
      showToast("Profile saved.", "success");
      await loadProfile();
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSavingProfile(false); }
  };

  const subscribeRazorpay = async (plan) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) { showToast("Couldn't load payment gateway.", "error"); return; }
    const orderRes = await fetch(`${API}${cfg.createOrder}`, { method: "POST", headers: authHeader });
    const order = await orderRes.json();
    if (!orderRes.ok) { showToast(order.detail || "Couldn't start payment.", "error"); return; }

    const rz = new window.Razorpay({
      key: order.key_id, amount: order.amount, currency: order.currency,
      name: "We Care 4 'all'", description: `${plan.name} — ${cfg.portalLabel}`,
      order_id: order.order_id, theme: { color: "var(--wc-green)" },
      handler: async (response) => {
        const vRes = await fetch(`${API}${cfg.verify}`, {
          method: "POST", headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        if (vRes.ok) { showToast("Subscribed! Your listing is going live.", "success"); window.location.reload(); }
        else showToast("Payment verification failed. Contact support.", "error");
      },
    });
    rz.open();
  };

  const subscribe = async (plan) => {
    setSubscribing(plan.id);
    try {
      const res = await fetch(`${API}${cfg.subscribe}`, {
        method: "POST", headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ plan_id: plan.id, billing_cycle: cycle }),
      });
      const sJson = await res.json();
      if (!res.ok) { showToast(sJson.detail || "Couldn't select this plan.", "error"); return; }

      if (paymentSettings?.manual_upi_enabled) {
        await loadBilling(); // refresh sub → status:'pending', ready for the UPI form below
      } else {
        await subscribeRazorpay(plan);
      }
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSubscribing(null); }
  };

  const submitUpiProof = async () => {
    if (!upiReference.trim()) { showToast("Please enter the UPI transaction reference (UTR) number.", "error"); return; }
    setSubmittingProof(true);
    try {
      const res = await fetch(`${API}${cfg.proof}`, {
        method: "POST", headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ payment_reference: upiReference.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't submit payment reference.", "error"); return; }
      setProofSubmitted(true);
      showToast("Submitted — we'll verify and activate your listing shortly.", "success");
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSubmittingProof(false); }
  };

  const status = STATUS_COPY[profile?.application_status] || STATUS_COPY.pending;
  const isLive = profile?.application_status === "approved" && profile?.subscription_status === "active";
  const hasPendingCharge = sub && sub.status === "pending";
  const hasPendingVerification = sub && sub.status === "pending_verification";

  return (
    <div className="pds">
      <style>{G}</style>
      <div style={{ background: "linear-gradient(135deg,var(--wc-navy),#112d52)", padding: "28px 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: "700", color: "var(--wc-green-pale)",
              letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>{cfg.portalLabel}</p>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#fff", margin: 0 }}>
              {profile?.[cfg.nameField] || user?.name || (type === "pharmacy" ? "Pharmacy" : "Lab Center")}
            </h1>
          </div>
          <button onClick={logout} style={{ padding: "9px 18px", borderRadius: "8px",
            background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)",
            color: "#fff", fontFamily: "'Inter',sans-serif", fontWeight: "600",
            fontSize: "13px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 24px 60px" }}>
        {!loadingProfile && profile && (
          <div style={{ display: "inline-block", padding: "6px 12px", borderRadius: "999px",
            background: status.bg, color: status.color, fontWeight: 700, fontSize: "12.5px", marginBottom: "16px" }}>
            {status.label}{isLive ? " · Live" : ""}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginBottom: "22px", flexWrap: "wrap" }}>
          <button className={`pds-tab${tab === "profile" ? " on" : ""}`} onClick={() => setTab("profile")}>Profile</button>
          <button className={`pds-tab${tab === "plan" ? " on" : ""}`} onClick={() => setTab("plan")}>Plan & Billing</button>
          <button className={`pds-tab${tab === "live" ? " on" : ""}`} onClick={() => setTab("live")}
            disabled={!isLive} title={!isLive ? "Available once approved and subscribed" : ""}>
            {liveTabLabel}
          </button>
        </div>

        {loadingProfile ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ width: "30px", height: "30px", border: "3px solid var(--wc-border)",
              borderTop: "3px solid var(--wc-green)", borderRadius: "50%", animation: "pds-spin .8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : tab === "profile" ? (
          <div style={{ background: "#fff", border: "1px solid var(--wc-border)", borderRadius: "14px", padding: "24px", maxWidth: "560px" }}>
            <p style={{ margin: "0 0 18px", fontSize: "13.5px", color: "#6b7688" }}>{status.body}</p>
            <form onSubmit={saveProfile}>
              <label className="pds-label">{cfg.nameLabel}</label>
              <input className="pds-inp" required value={form?.[cfg.nameField] || ""} onChange={setField(cfg.nameField)} />

              <label className="pds-label">Owner / Contact Person</label>
              <input className="pds-inp" value={form?.owner_name || ""} onChange={setField("owner_name")} />

              <label className="pds-label">Phone</label>
              <input className="pds-inp" value={form?.phone || ""} onChange={setField("phone")} />

              <label className="pds-label">Address</label>
              <input className="pds-inp" value={form?.address || ""} onChange={setField("address")} />

              <label className="pds-label">City</label>
              <input className="pds-inp" value={form?.city || ""} onChange={setField("city")} />

              <label className="pds-label">State</label>
              <input className="pds-inp" value={form?.state || ""} onChange={setField("state")} />

              <label className="pds-label">Pincode</label>
              <input className="pds-inp" value={form?.pincode || ""} onChange={setField("pincode")} />

              <label className="pds-label">{cfg.licenseLabel}</label>
              <input className="pds-inp" value={form?.license_number || ""} onChange={setField("license_number")} />

              <label className="pds-label">GSTIN (optional)</label>
              <input className="pds-inp" value={form?.gstin || ""} onChange={setField("gstin")} />

              <button className="pds-btn" disabled={savingProfile}>
                {savingProfile ? "Saving…" : "Save Profile"}
              </button>
            </form>
          </div>
        ) : tab === "plan" ? (
          <div style={{ maxWidth: "640px" }}>
            {!loadedBilling ? (
              <p style={{ color: "#94a3b8" }}>Loading…</p>
            ) : sub && sub.status === "active" ? (
              <div style={{ background: "var(--wc-sage)", border: "1px solid #86efac", borderRadius: 12, padding: 20 }}>
                <p style={{ fontWeight: 700, color: "#15803d", margin: 0 }}>
                  ✅ {sub[type === "pharmacy" ? "pharmacy_plans" : "lab_plans"]?.name || "Your Plan"} — Active
                </p>
                <p style={{ fontSize: 13, color: "#166534", margin: "6px 0 0" }}>
                  Renews {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}.
                </p>
              </div>
            ) : hasPendingVerification || proofSubmitted ? (
              <div style={{ background: "#eff8ff", border: "1px solid #bae6fd", borderRadius: 12, padding: 20 }}>
                <p style={{ fontWeight: 700, color: "var(--wc-teal)", margin: 0 }}>⏳ Payment submitted — awaiting verification</p>
                <p style={{ fontSize: 13, color: "var(--wc-teal)", margin: "6px 0 0" }}>
                  We'll verify your UPI payment and activate your listing shortly.
                </p>
              </div>
            ) : hasPendingCharge && paymentSettings?.manual_upi_enabled ? (
              <div style={{ background: "#fff", border: "1px solid var(--wc-border)", borderRadius: 14, padding: 22 }}>
                <div style={{ background: "#eff8ff", border: "1px solid #bae6fd", borderRadius: "11px", padding: "14px", marginBottom: "16px", textAlign: "center" }}>
                  <p style={{ fontSize: "12.5px", color: "var(--wc-teal)", fontWeight: 700, margin: 0 }}>
                    Pay via UPI — scan the QR code below with any UPI app
                  </p>
                </div>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <img src={paymentSettings.qr_url} alt="UPI QR Code"
                    style={{ width: "200px", maxWidth: "100%", borderRadius: "12px", border: "1px solid var(--wc-border)" }} />
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--wc-navy)", margin: "10px 0 2px" }}>{paymentSettings.payee_name}</p>
                  <p style={{ fontSize: "12.5px", color: "var(--wc-muted)", margin: 0 }}>UPI ID: {paymentSettings.upi_id}</p>
                </div>
                <label className="pds-label">After paying, enter your UPI transaction reference (UTR) number *</label>
                <input className="pds-inp" value={upiReference} onChange={(e) => setUpiReference(e.target.value)} placeholder="e.g. 123456789012" />
                <button className="pds-btn" style={{ width: "100%" }} disabled={submittingProof} onClick={submitUpiProof}>
                  {submittingProof ? "Submitting…" : "I've Paid — Submit Reference"}
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: "6px", background: "#f1f5f9", borderRadius: "20px", padding: "4px", width: "fit-content", marginBottom: "18px" }}>
                  {["monthly", "annual"].map((c) => (
                    <button key={c} onClick={() => setCycle(c)} style={{ padding: "8px 18px", border: "none", borderRadius: "16px",
                      fontWeight: 700, fontSize: "12.5px", cursor: "pointer",
                      background: cycle === c ? "var(--wc-green)" : "transparent", color: cycle === c ? "#fff" : "var(--wc-muted)" }}>
                      {c === "monthly" ? "Monthly" : "Annual (save more)"}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "16px" }}>
                  {plans.map((p) => (
                    <div key={p.id} style={{ background: "#fff", border: "1.5px solid var(--wc-border)", borderRadius: "14px", padding: "22px" }}>
                      <h3 style={{ margin: "0 0 6px", fontSize: 18, color: "var(--wc-navy)" }}>{p.name}</h3>
                      <p style={{ fontSize: 12.5, color: "var(--wc-muted)", margin: "0 0 14px" }}>{p.description}</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: "var(--wc-navy)", margin: "0 0 4px" }}>
                        ₹{cycle === "annual" ? p.annual_amount : p.monthly_amount}
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8" }}> /{cycle === "annual" ? "year" : "month"}</span>
                      </p>
                      {Array.isArray(p.features) && p.features.length > 0 && (
                        <ul style={{ margin: "14px 0 0", padding: "0 0 0 18px", fontSize: 13, color: "#374151" }}>
                          {p.features.map((f) => <li key={f}>{f}</li>)}
                        </ul>
                      )}
                      <button className="pds-btn" style={{ width: "100%", marginTop: 16 }}
                        disabled={subscribing === p.id} onClick={() => subscribe(p)}>
                        {subscribing === p.id ? "Processing…" : "Choose This Plan"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          isLive ? children : (
            <div style={{ background: "#fff", border: "1px solid var(--wc-border)", borderRadius: "14px", padding: "24px", maxWidth: "560px" }}>
              <p style={{ margin: 0, fontSize: "13.5px", color: "#6b7688" }}>
                {liveTabLabel} will be available once your application is approved and your subscription is active.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
