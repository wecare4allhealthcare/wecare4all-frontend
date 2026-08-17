/**
 * pages/company/Dashboard.jsx — Corporate SaaS dashboard shell (Phase 2).
 *
 * Staged access: companies.status drives what's visible, same pattern as
 * AboutRouteGuard.jsx elsewhere in the app.
 *   pending   -> only the Overview tab (profile + "subscribe" prompt)
 *   active    -> Overview + Employees unlocked
 *   suspended/expired -> read-only banner
 *
 * Billing (Phase 6) and Analytics (Phase 7) tabs are stubbed here as
 * "coming soon" placeholders so the sidebar shape is already correct
 * and doesn't need reshuffling later.
 */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { showToast } from "../../components/Toast";
import SEO from "../../components/SEO";
import TwoFactorSettings from "../../components/TwoFactorSettings";
import ManualUpiPayment from "../../components/ManualUpiPayment";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.cdb{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;}
.cdb *{box-sizing:border-box;}
.cdb h1,.cdb h2,.cdb h3{font-family:'Cormorant Garamond',serif;color:var(--wc-navy);}
.cdb-shell{display:flex;min-height:100vh;flex-wrap:wrap;}
.cdb-side{width:220px;background:var(--wc-navy);color:#fff;padding:22px 14px;flex-shrink:0;}
.cdb-side h3{color:#fff;font-size:17px;margin:0 0 18px;padding:0 8px;}
.cdb-nav{display:flex;flex-direction:column;gap:4px;}
.cdb-nav button,.cdb-nav a,.cdb-nav-locked{background:none;border:none;color:#cbd5e1;text-align:left;padding:10px 12px;
  border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;
  text-decoration:none;display:block;}
.cdb-nav button.on,.cdb-nav a.on{background:var(--wc-green);color:#fff;}
.cdb-nav button:disabled{opacity:.4;cursor:not-allowed;}
.cdb-nav-locked{opacity:.4;cursor:not-allowed;}
.cdb-main{flex:1;min-width:0;padding:28px;max-width:1000px;}
.cdb-card{background:#fff;border-radius:14px;padding:24px;box-shadow:0 2px 10px rgba(11,31,58,.06);
  margin-bottom:18px;}
.cdb-badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;}
.cdb-inp{border:1.5px solid var(--wc-border);border-radius:8px;padding:9px 11px;font-size:13.5px;
  font-family:'DM Sans',sans-serif;outline:none;}
.cdb-inp:focus{border-color:var(--wc-green);}
.cdb-btn{background:var(--wc-green);color:#fff;border:none;border-radius:8px;padding:10px 18px;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:13.5px;cursor:pointer;}
.cdb-btn:disabled{opacity:.6;cursor:not-allowed;}
.cdb-btn.outline{background:#fff;color:var(--wc-green);border:1.5px solid var(--wc-green);}
.cdb-table{width:100%;border-collapse:collapse;font-size:13.5px;}
.cdb-table th{text-align:left;padding:9px 10px;color:var(--wc-muted);font-weight:700;
  border-bottom:2px solid var(--wc-border);font-size:12px;}
.cdb-table td{padding:9px 10px;border-bottom:1px solid #eef2f7;}
/* Mobile: the sidebar-as-horizontal-row pattern wrapped into 2-3 rows and
   ate the top of the screen before any real content showed. Replaced with
   the same fixed-bottom-bar pattern already used on the admin dashboard —
   company name moves to a small top header, and the tabs become a fixed
   scrollable strip pinned to the bottom of the screen. */
.cdb-mobile-header{display:none;}
.cdb-bottom-bar{display:none;}
@media (max-width:760px){
  .cdb-side{display:none;}
  .cdb-mobile-header{display:block;background:linear-gradient(135deg,var(--wc-navy),#112d52);
    color:#fff;padding:18px 18px 20px;}
  .cdb-mobile-header h3{color:#fff;font-size:19px;margin:0;}
  .cdb-main{padding:14px 12px calc(82px + env(safe-area-inset-bottom,0px));}
  .cdb-bottom-bar{display:flex;position:fixed;bottom:0;left:0;right:0;
    background:var(--wc-navy);border-top:1px solid rgba(255,255,255,.12);
    z-index:200;height:calc(64px + env(safe-area-inset-bottom,0px));
    padding-bottom:env(safe-area-inset-bottom,0px);
    overflow-x:auto;overflow-y:hidden;-ms-overflow-style:none;scrollbar-width:none;}
  .cdb-bottom-bar::-webkit-scrollbar{display:none;}
  .cdb-tab-btn{flex:0 0 auto;min-width:78px;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:3px;border:none;background:transparent;text-decoration:none;
    cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10.5px;font-weight:600;
    color:rgba(255,255,255,.58);padding:8px 10px;white-space:nowrap;}
  .cdb-tab-btn.on{color:var(--wc-green-pale);}
  .cdb-tab-btn.locked{opacity:.42;cursor:not-allowed;}
  .cdb-tab-btn .ti{font-size:18px;line-height:1;}
}
`;

const STATUS_STYLE = {
  pending:   { bg: "#fef9c3", color: "#854d0e" },
  active:    { bg: "#dcfce7", color: "#15803d" },
  suspended: { bg: "#fee2e2", color: "#991b1b" },
  expired:   { bg: "#fee2e2", color: "#991b1b" },
};

function authHeader() {
  const t = localStorage.getItem("wc4a_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function CompanyDashboard() {
  const { t } = useTranslation();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";

  const fetchCompany = async (attempt = 1) => {
    if (attempt === 1) { setLoading(true); setLoadError(false); }
    try {
      const res = await fetch(`${API}/company/me`, { headers: authHeader() });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        showToast(json.detail || t("companyDashboard.loadError"), "error");
        setLoadError(true);
        setLoading(false);
        return;
      }
      const json = await res.json();
      setCompany(json);
      setLoadError(false);
      setLoading(false);
    } catch {
      if (attempt < 4) {
        setTimeout(() => fetchCompany(attempt + 1), 1500 * attempt);
      } else {
        setLoadError(true);
        setLoading(false);
      }
    }
  };

  useEffect(() => { fetchCompany(); }, []);

  if (loading) return <div className="cdb" style={{ padding: 60, textAlign: "center" }}><style>{G}</style>{t("companyDashboard.loading")}</div>;
  if (loadError || !company) return (
    <div className="cdb" style={{ padding: 60, textAlign: "center" }}>
      <style>{G}</style>
      <p style={{ fontSize: 15, color: "var(--wc-muted)", marginBottom: 16 }}>
        {t("companyDashboard.loadError")}
      </p>
      <button className="cdb-btn" onClick={() => fetchCompany()}>{t("companyDashboard.retry")}</button>
    </div>
  );

  const isActive = company.status === "active";
  const badge = STATUS_STYLE[company.status] || STATUS_STYLE.pending;

  return (
    <div className="cdb">
      <SEO title="Company Dashboard — We Care 4 'all'" noindex />
      <style>{G}</style>

      {/* Mobile-only header — company name, since the sidebar (which
          normally shows it) is hidden below 760px in favor of the
          bottom tab bar. */}
      <div className="cdb-mobile-header">
        <h3>{company.company_name}</h3>
      </div>

      <div className="cdb-shell">
        <aside className="cdb-side">
          <h3>{company.company_name}</h3>
          <nav className="cdb-nav">
            <Link to="?tab=overview" className={tab === "overview" ? "on" : ""}>{t("companyDashboard.nav.overview")}</Link>
            {isActive ? (
              <Link to="?tab=employees" className={tab === "employees" ? "on" : ""}>{t("companyDashboard.nav.employees")}</Link>
            ) : (
              <span className="cdb-nav-locked">{t("companyDashboard.nav.employees")} 🔒</span>
            )}
            {isActive ? (
              <Link to="?tab=appointments" className={tab === "appointments" ? "on" : ""}>{t("companyDashboard.nav.appointments")}</Link>
            ) : (
              <span className="cdb-nav-locked">{t("companyDashboard.nav.appointments")} 🔒</span>
            )}
            <Link to="?tab=billing" className={tab === "billing" ? "on" : ""}>{t("companyDashboard.nav.billing")}</Link>
            {isActive ? (
              <Link to="?tab=analytics" className={tab === "analytics" ? "on" : ""}>{t("companyDashboard.nav.analytics")}</Link>
            ) : (
              <span className="cdb-nav-locked">{t("companyDashboard.nav.analytics")} 🔒</span>
            )}
          </nav>
        </aside>
        <main className="cdb-main">
          <span className="cdb-badge" style={{ background: badge.bg, color: badge.color }}>
            {company.status.toUpperCase()}
          </span>

          {!isActive && (
            <div className="cdb-card" style={{ marginTop: 14, borderLeft: "4px solid #d97706" }}>
              <h2 style={{ fontSize: 19, marginTop: 0 }}>{t("companyDashboard.subscribePrompt.heading")}</h2>
              <p style={{ color: "var(--wc-muted)", fontSize: 14 }}>
                {t("companyDashboard.subscribePrompt.body")}
              </p>
              <Link to="?tab=billing" className="cdb-btn" style={{display:"inline-block",textDecoration:"none"}}>
                {t("companyDashboard.subscribePrompt.cta")}
              </Link>
            </div>
          )}

          {tab === "overview" && <Overview company={company} setCompany={setCompany} />}
          {tab === "employees" && isActive && <Employees />}
          {tab === "appointments" && isActive && <CompanyAppointments company={company} />}
          {tab === "billing" && <Billing company={company} onActivated={() => window.location.reload()} />}
          {tab === "analytics" && isActive && <Analytics />}
        </main>
      </div>

      {/* Mobile-only fixed bottom tab bar — same tabs/lock logic as the
          desktop sidebar above, just rendered as icon+label buttons. */}
      <div className="cdb-bottom-bar">
        {[
          ["overview",   "📊", t("companyDashboard.nav.overview"),   true],
          ["employees",  "👥", t("companyDashboard.nav.employees"),  isActive],
          ["appointments", "🩺", t("companyDashboard.nav.apptsShort"), isActive],
          ["billing",    "💳", t("companyDashboard.nav.billing"),    true],
          ["analytics",  "📈", t("companyDashboard.nav.analytics"),  isActive],
        ].map(([id, icon, label, enabled]) => (
          enabled ? (
            <Link key={id} to={`?tab=${id}`} className={`cdb-tab-btn${tab === id ? " on" : ""}`}>
              <span className="ti">{icon}</span>
              <span>{label}</span>
            </Link>
          ) : (
            <span key={id} className="cdb-tab-btn locked">
              <span className="ti">{icon}</span>
              <span>{label} 🔒</span>
            </span>
          )
        ))}
      </div>
    </div>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function Billing({ company, onActivated }) {
  const { t } = useTranslation();
  const [plans, setPlans] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [subscription, setSubscription] = useState(null);
  const [paying, setPaying] = useState(null); // plan_id currently being paid for, or null
  const [pendingPlan, setPendingPlan] = useState(null); // plan awaiting manual UPI payment proof
  const [quotePlan, setQuotePlan] = useState(null); // plan currently being requested a quote for
  const [quoteModules, setQuoteModules] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);

  const loadPlans = async () => {
    const res = await fetch(`${API}/company/plans`);
    const json = await res.json();
    if (res.ok) setPlans(json.plans);
  };
  const loadSubscription = async () => {
    try {
      const res = await fetch(`${API}/company/my-subscription`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) setSubscription(json.subscription);
    } catch { /* not fatal — billing history is supplementary here */ }
  };

  useEffect(() => { loadPlans(); loadSubscription(); }, []);

  const subscribeAndPay = async (plan) => {
    setPaying(plan.id);
    try {
      const subRes = await fetch(`${API}/company/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ plan_id: plan.id, billing_cycle: cycle }),
      });
      const subJson = await subRes.json();
      if (!subRes.ok) throw new Error(subJson.detail || t("companyDashboard.billing.checkoutFailed"));

      // Manual UPI fallback (temporary, while Razorpay is unavailable) —
      // check before ever touching the Razorpay checkout at all.
      const settingsRes = await fetch(`${API}/payment-settings`);
      const settingsJson = await settingsRes.json();
      if (settingsJson.manual_upi_enabled) {
        setPendingPlan(plan);
        setPaying(null);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error(t("companyDashboard.billing.gatewayLoadFailed"));

      const orderRes = await fetch(`${API}/company/subscription/create-order`, {
        method: "POST", headers: authHeader(),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.detail || t("companyDashboard.billing.orderFailed"));

      const rz = new window.Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: "We Care 4 'all'",
        description: `${plan.plan_name} Plan (${cycle}) — ${company.company_name}`,
        order_id: order.order_id,
        theme: { color: "var(--wc-green)" },
        handler: async (response) => {
          try {
            const vRes = await fetch(`${API}/company/subscription/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...authHeader() },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const vJson = await vRes.json();
            if (!vRes.ok) throw new Error(vJson.detail || t("companyDashboard.billing.verificationFailed"));
            showToast(t("companyDashboard.billing.activatedMsg"), "success");
            onActivated();
          } catch (ex) {
            showToast(t("companyDashboard.billing.paymentReceivedButFailed", { message: ex.message }), "error");
          } finally { setPaying(null); }
        },
        modal: { ondismiss: () => setPaying(null) },
      });
      rz.open();
    } catch (ex) { showToast(ex.message, "error"); setPaying(null); }
  };

  const openQuoteModal = (plan) => {
    setQuotePlan(plan);
    setQuoteModules("");
    setQuoteMessage("");
    setQuoteSent(false);
  };

  const submitQuoteRequest = async () => {
    if (!quoteModules.trim()) { showToast(t("companyDashboard.billing.quoteModal.modulesRequired"), "info"); return; }
    setSubmittingQuote(true);
    try {
      const res = await fetch(`${API}/company/custom-quote-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ requested_modules: quoteModules.trim(), message: quoteMessage.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || t("companyDashboard.billing.quoteModal.submitFailed"), "error"); return; }
      setQuoteSent(true);
      showToast(t("companyDashboard.billing.quoteModal.sentToastMsg"), "success");
    } catch { showToast(t("companyDashboard.networkError"), "error"); }
    finally { setSubmittingQuote(false); }
  };

  return (
    <div className="cdb-card" style={{ marginTop: 14 }}>
      <h2 style={{ fontSize: 19, marginTop: 0 }}>{t("companyDashboard.nav.billing")}</h2>

      {subscription?.status === "paid" && (
        <div style={{ background: "#eefaf3", border: "1px solid #bbf0d4", borderRadius: 10, padding: 14, marginBottom: 18 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "#15803d", fontWeight: 700 }}>
            ✅ {t("companyDashboard.billing.activeRenews", { date: subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : "—" })}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--wc-muted)" }}>
            ₹{subscription.amount} / {subscription.billing_cycle}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["monthly", "annual"].map((c) => (
          <button key={c} className={`cdb-btn ${cycle === c ? "" : "outline"}`}
            style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => setCycle(c)}>
            {c === "monthly" ? t("companyDashboard.billing.monthly") : t("companyDashboard.billing.annual")}
          </button>
        ))}
      </div>

      {pendingPlan ? (
        <div style={{ maxWidth: 400 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 17, color: "var(--wc-navy)" }}>{t("companyDashboard.billing.planSuffix", { name: pendingPlan.plan_name })}</h3>
          <ManualUpiPayment
            submitEndpoint="/company/subscription/submit-payment-proof"
            token={localStorage.getItem("wc4a_token")}
            amount={cycle === "annual" ? pendingPlan.annual_amount : pendingPlan.monthly_amount}
            onSubmitted={() => {}}
          />
          <button onClick={() => setPendingPlan(null)} style={{
            width: "100%", marginTop: 10, background: "none", border: "1.5px solid var(--wc-border)", color: "var(--wc-muted)",
            borderRadius: 9, padding: 10, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
            ← {t("companyDashboard.billing.backToPlans")}
          </button>
        </div>
      ) : !plans ? <p>{t("companyDashboard.billing.loadingPlans")}</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px,100%),1fr))", gap: 14 }}>
          {plans.map((plan) => {
            const price = cycle === "annual" ? plan.annual_amount : plan.monthly_amount;
            const isCurrent = company.plan_id === plan.id && subscription?.status === "paid";
            return (
              <div key={plan.id} style={{
                border: `1.5px solid ${isCurrent ? "var(--wc-green)" : "var(--wc-border)"}`, borderRadius: 12, padding: 18,
                background: isCurrent ? "var(--wc-sage)" : "#fff",
              }}>
                <h3 style={{ fontSize: 16, margin: "0 0 6px" }}>{plan.plan_name}</h3>
                <p style={{ fontSize: 12.5, color: "var(--wc-muted)", margin: "0 0 10px" }}>
                  {t("companyDashboard.billing.employeesRange", { min: plan.min_employees, max: plan.max_employees ?? "∞" })}
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "var(--wc-navy)", margin: "0 0 14px" }}>
                  {price > 0 ? `₹${price}` : t("companyDashboard.billing.custom")}
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}> /{cycle === "annual" ? t("companyDashboard.billing.yr") : t("companyDashboard.billing.mo")}</span>
                </p>
                {isCurrent ? (
                  <button className="cdb-btn" disabled style={{ width: "100%" }}>{t("companyDashboard.billing.currentPlan")}</button>
                ) : price > 0 ? (
                  <button className="cdb-btn" style={{ width: "100%" }} disabled={paying === plan.id}
                    onClick={() => subscribeAndPay(plan)}>
                    {paying === plan.id ? t("companyDashboard.billing.processing") : t("companyDashboard.billing.subscribe")}
                  </button>
                ) : (
                  <button className="cdb-btn outline" style={{ width: "100%" }} onClick={() => openQuoteModal(plan)}>
                    {t("companyDashboard.billing.contactSales")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {quotePlan && (
        <div style={{position:"fixed",inset:0,background:"rgba(11,31,58,.5)",zIndex:9999,
          display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
          onClick={e=>e.target===e.currentTarget && setQuotePlan(null)}>
          <div style={{background:"#fff",borderRadius:"16px",padding:"26px",width:"100%",maxWidth:"460px",maxHeight:"90vh",overflowY:"auto"}}>
            {quoteSent ? (
              <div style={{textAlign:"center",padding:"10px 4px"}}>
                <p style={{fontSize:"34px",margin:"0 0 8px"}}>✅</p>
                <h3 style={{fontSize:"19px",fontWeight:700,color:"var(--wc-navy)",marginBottom:"8px"}}>{t("companyDashboard.billing.quoteModal.sentHeading")}</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"var(--wc-muted)",marginBottom:"18px"}}>
                  {t("companyDashboard.billing.quoteModal.sentBody")}
                </p>
                <button className="cdb-btn" style={{width:"100%"}} onClick={()=>setQuotePlan(null)}>{t("companyDashboard.billing.quoteModal.done")}</button>
              </div>
            ) : (
              <>
                <h3 style={{fontSize:"19px",fontWeight:700,color:"var(--wc-navy)",marginBottom:"6px"}}>{t("companyDashboard.billing.quoteModal.heading")}</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"var(--wc-muted)",marginBottom:"16px"}}>
                  {t("companyDashboard.billing.quoteModal.subtext")}
                </p>
                <label style={{fontSize:12,color:"var(--wc-muted)",display:"block",marginBottom:4}}>{t("companyDashboard.billing.quoteModal.modulesLabel")}</label>
                <textarea className="cdb-inp" rows={3} style={{width:"100%",resize:"vertical",marginBottom:"12px"}}
                  value={quoteModules} onChange={e=>setQuoteModules(e.target.value)}
                  placeholder={t("companyDashboard.billing.quoteModal.modulesPlaceholder")}/>
                <label style={{fontSize:12,color:"var(--wc-muted)",display:"block",marginBottom:4}}>{t("companyDashboard.billing.quoteModal.anythingElseLabel")}</label>
                <textarea className="cdb-inp" rows={2} style={{width:"100%",resize:"vertical",marginBottom:"16px"}}
                  value={quoteMessage} onChange={e=>setQuoteMessage(e.target.value)}
                  placeholder={t("companyDashboard.billing.quoteModal.anythingElsePlaceholder")}/>
                <div style={{display:"flex",gap:"10px"}}>
                  <button className="cdb-btn outline" style={{flex:1}} onClick={()=>setQuotePlan(null)}>{t("companyDashboard.billing.quoteModal.cancel")}</button>
                  <button className="cdb-btn" style={{flex:1}} disabled={submittingQuote} onClick={submitQuoteRequest}>
                    {submittingQuote ? t("companyDashboard.billing.quoteModal.sending") : t("companyDashboard.billing.quoteModal.sendRequest")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniBarChart({ labels, values, color = "var(--wc-green)", prefix = "" }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, marginTop: 10 }}>
      {values.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
          <div title={`${labels[i]}: ${prefix}${v}`} style={{
            width: "100%", height: `${Math.max((v / max) * 100, 3)}%`,
            background: `linear-gradient(180deg, ${color}, ${color}cc)`, borderRadius: "3px 3px 0 0",
          }} />
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 4, whiteSpace: "nowrap" }}>{labels[i].slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "var(--wc-warm-white)", border: "1px solid var(--wc-border)", borderRadius: 10, padding: "14px 16px" }}>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--wc-navy)" }}>{value}</p>
      <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--wc-muted)" }}>{label}</p>
      {sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{sub}</p>}
    </div>
  );
}

function Analytics() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/company/analytics`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) setData(json);
    })();
  }, []);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API}/company/analytics/export`, { headers: authHeader() });
      if (!res.ok) throw new Error(t("companyDashboard.analytics.exportFailed"));
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "utilization_report.csv";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { showToast(t("companyDashboard.analytics.exportFailed"), "error"); }
    finally { setExporting(false); }
  };

  if (!data) return <div className="cdb-card" style={{ marginTop: 14 }}><p>{t("companyDashboard.analytics.loading")}</p></div>;

  return (
    <>
      <div className="cdb-card" style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 19, margin: 0 }}>{t("companyDashboard.analytics.heading")}</h2>
          <button className="cdb-btn outline" style={{ padding: "7px 14px", fontSize: 12.5 }} disabled={exporting} onClick={exportCsv}>
            {exporting ? t("companyDashboard.analytics.exporting") : t("companyDashboard.analytics.exportCsv")}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(140px,100%),1fr))", gap: 12, marginTop: 16 }}>
          <StatCard label={t("companyDashboard.analytics.employees")} value={data.total_employees} />
          <StatCard label={t("companyDashboard.analytics.utilizationRate")} value={`${data.utilization_rate}%`} sub={t("companyDashboard.analytics.activeCount", { count: data.active_employees })} />
          <StatCard label={t("companyDashboard.analytics.totalAppointments")} value={data.total_appointments} />
          <StatCard label={t("companyDashboard.analytics.totalSponsoredCost")} value={`₹${data.total_sponsored_cost}`} />
          <StatCard label={t("companyDashboard.analytics.avgCostPerEmployee")} value={`₹${data.avg_cost_per_employee}`} />
          <StatCard label={t("companyDashboard.analytics.avgCostPerAppointment")} value={`₹${data.avg_cost_per_appointment}`} />
          <StatCard label={t("companyDashboard.analytics.dependants")} value={data.total_dependants} />
        </div>
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>{t("companyDashboard.analytics.apptsLast12Months")}</h2>
        <MiniBarChart labels={data.monthly_labels} values={data.monthly_appointments} />
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>{t("companyDashboard.analytics.costLast12Months")}</h2>
        <MiniBarChart labels={data.monthly_labels} values={data.monthly_sponsored_cost} prefix="₹" />
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>{t("companyDashboard.analytics.topSpecialties")}</h2>
        {data.specialty_breakdown.length ? (
          <table className="cdb-table">
            <thead><tr>
              <th>{t("companyDashboard.analytics.thSpecialty")}</th>
              <th>{t("companyDashboard.analytics.thAppointments")}</th>
              <th>{t("companyDashboard.analytics.thSponsoredCost")}</th>
            </tr></thead>
            <tbody>
              {data.specialty_breakdown.map((s) => (
                <tr key={s.specialization}><td>{s.specialization}</td><td>{s.count}</td><td>₹{s.sponsored_cost}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("companyDashboard.analytics.noData")}</p>}
      </div>
    </>
  );
}

function Overview({ company, setCompany }) {
  const { t } = useTranslation();
  return (
    <div className="cdb-card" style={{ marginTop: 14 }}>
      <h2 style={{ fontSize: 19, marginTop: 0 }}>{t("companyDashboard.overview.heading")}</h2>
      <table className="cdb-table">
        <tbody>
          <tr><td style={{ color: "var(--wc-muted)", width: 180 }}>{t("companyDashboard.overview.companyName")}</td><td>{company.company_name}</td></tr>
          <tr><td style={{ color: "var(--wc-muted)" }}>{t("companyDashboard.overview.registeredEmail")}</td><td>{company.registered_email}</td></tr>
          <tr><td style={{ color: "var(--wc-muted)" }}>{t("companyDashboard.overview.industry")}</td><td>{company.industry || "—"}</td></tr>
          <tr><td style={{ color: "var(--wc-muted)" }}>{t("companyDashboard.overview.declaredEmployees")}</td><td>{company.declared_employee_count || "—"}</td></tr>
          <tr><td style={{ color: "var(--wc-muted)" }}>{t("companyDashboard.overview.seatsRemaining")}</td>
            <td>{company.seats_remaining === null || company.seats_remaining === undefined ? t("companyDashboard.overview.unlimited") : company.seats_remaining}</td></tr>
          {company.invite_code && (
            <tr><td style={{ color: "var(--wc-muted)" }}>{t("companyDashboard.overview.inviteCode")}</td>
              <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{company.invite_code}</td></tr>
          )}
        </tbody>
      </table>
      {company.invite_code && <InviteLink code={company.invite_code} />}
      <BookingModeToggle company={company} setCompany={setCompany} />
      <div style={{ marginTop: 20 }}>
        <TwoFactorSettings apiBase="/company/2fa" token={localStorage.getItem("wc4a_token")}
          enabled={!!company.totp_enabled} onChanged={() => setCompany(c => ({ ...c, totp_enabled: !c.totp_enabled }))} />
      </div>
    </div>
  );
}

function BookingModeToggle({ company, setCompany }) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const enabled = !!company.employee_self_booking_enabled;

  const toggle = async () => {
    const next = !enabled;
    setSaving(true);
    try {
      const res = await fetch(`${API}/company/booking-mode`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ employee_self_booking_enabled: next }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || t("companyDashboard.bookingMode.updateFailed"), "error"); return; }
      setCompany(c => ({ ...c, employee_self_booking_enabled: next }));
      showToast(next ? t("companyDashboard.bookingMode.enabledMsg") : t("companyDashboard.bookingMode.disabledMsg"), "success");
    } catch { showToast(t("companyDashboard.networkError"), "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ marginTop: 20, padding: "16px 18px", background: "var(--wc-warm-white)",
      border: "1px solid var(--wc-border)", borderRadius: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "var(--wc-navy)" }}>
            {t("companyDashboard.bookingMode.question")}
          </p>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--wc-muted)", maxWidth: 460 }}>
            {enabled
              ? t("companyDashboard.bookingMode.enabledDesc")
              : t("companyDashboard.bookingMode.disabledDesc")}
          </p>
        </div>
        <button onClick={toggle} disabled={saving}
          style={{
            width: 52, height: 28, borderRadius: 20, border: "none", cursor: saving ? "default" : "pointer",
            background: enabled ? "var(--wc-green)" : "#cbd5e1", position: "relative", flexShrink: 0,
            transition: "background .2s", opacity: saving ? 0.6 : 1,
          }}>
          <span style={{
            position: "absolute", top: 3, left: enabled ? 27 : 3, width: 22, height: 22,
            borderRadius: "50%", background: "#fff", transition: "left .2s",
            boxShadow: "0 1px 3px rgba(0,0,0,.3)",
          }} />
        </button>
      </div>
    </div>
  );
}

function InviteLink({ code }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/employee-signup?code=${code}`;
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--wc-sage)",
      border: "1px solid #bbf7d0", borderRadius: 10 }}>
      <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 600, color: "#166534" }}>
        {t("companyDashboard.inviteLink.shareText")}
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <code style={{ fontSize: 13, background: "#fff", border: "1px solid #d1fae5",
          borderRadius: 6, padding: "6px 10px", wordBreak: "break-all", flex: "1 1 260px" }}>{url}</code>
        <button onClick={copy} style={{ background: "var(--wc-green)", color: "#fff", border: "none",
          borderRadius: 6, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          whiteSpace: "nowrap" }}>
          {copied ? t("companyDashboard.inviteLink.copied") : t("companyDashboard.inviteLink.copyLink")}
        </button>
      </div>
    </div>
  );
}

function CompanyAppointments({ company }) {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showBookModal, setShowBookModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 25; // matches the backend default in list_company_appointments

  // BUG FIX: same issue as Employees() above — the backend
  // (list_company_appointments in routes/company.py) has always
  // supported real page/page_size pagination, but nothing here ever
  // used it. Any company with more than 25 appointments on record had
  // the rest permanently unreachable with no indication anything was
  // missing.
  const load = async (status, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      params.set("page", String(p));
      params.set("page_size", String(PAGE_SIZE));
      const res = await fetch(`${API}/company/appointments?${params}`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) { setAppointments(json.appointments || []); setTotal(json.total || 0); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); load(filter, 1); }, [filter]);

  const STATUS_COLORS = {
    pending:   { bg: "#fef9c3", color: "#854d0e" },
    approved:  { bg: "#dbeafe", color: "#1e40af" },
    completed: { bg: "#dcfce7", color: "#15803d" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
  };
  const statusLabel = (s) => t(`companyDashboard.appointments.status.${s}`, s);

  return (
    <div className="cdb-card" style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 19, margin: 0 }}>{t("companyDashboard.appointments.heading")}</h2>
        {!company.employee_self_booking_enabled && (
          <button className="cdb-btn" onClick={() => setShowBookModal(true)}>
            + {t("companyDashboard.appointments.bookForEmployee")}
          </button>
        )}
      </div>
      <p style={{ fontSize: 13, color: "var(--wc-muted)", marginTop: 8 }}>
        {company.employee_self_booking_enabled
          ? t("companyDashboard.appointments.subtextSelfBooking")
          : t("companyDashboard.appointments.subtextHrBooking")}
      </p>
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {["all", "pending", "approved", "completed", "cancelled"].map((s) => (
          <button key={s} className={`cdb-btn ${filter === s ? "" : "outline"}`}
            style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setFilter(s)}>
            {s === "all" ? t("companyDashboard.appointments.status.all") : statusLabel(s)}
          </button>
        ))}
      </div>
      {loading ? <p style={{ marginTop: 14 }}>{t("companyDashboard.employees.loading")}</p> : (
        <table className="cdb-table" style={{ marginTop: 14 }}>
          <thead><tr>
            <th>{t("companyDashboard.appointments.thPatient")}</th>
            <th>{t("companyDashboard.appointments.thDoctor")}</th>
            <th>{t("companyDashboard.appointments.thDateTime")}</th>
            <th>{t("companyDashboard.appointments.thType")}</th>
            <th>{t("companyDashboard.appointments.thStatus")}</th>
            <th>{t("companyDashboard.appointments.thBookedBy")}</th>
          </tr></thead>
          <tbody>
            {appointments.map((a) => {
              const s = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
              return (
                <tr key={a.id}>
                  <td>{a.patient_name}</td>
                  <td>{a.doctors?.full_name || "—"}{a.doctors?.specialization ? ` (${a.doctors.specialization})` : ""}</td>
                  <td>{a.appointment_date} {a.appointment_time ? `${a.appointment_time.slice(0, 5)} IST` : ""}</td>
                  <td style={{ textTransform: "capitalize" }}>{a.appointment_type}</td>
                  <td>
                    <span style={{ background: s.bg, color: s.color, padding: "3px 10px",
                      borderRadius: 20, fontSize: 11.5, fontWeight: 700, textTransform: "capitalize" }}>
                      {statusLabel(a.status)}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5, color: "var(--wc-muted)" }}>{a.booked_by_hr ? t("companyDashboard.employees.addedByHr") : t("companyDashboard.appointments.bookedByEmployee")}</td>
                </tr>
              );
            })}
            {!appointments.length && <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>
              {filter !== "all" ? t("companyDashboard.appointments.noneFiltered", { status: statusLabel(filter) }) : t("companyDashboard.appointments.none")}
            </td></tr>}
          </tbody>
        </table>
      )}
      {total > PAGE_SIZE && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 16 }}>
          <button className="cdb-btn outline" disabled={page <= 1 || loading}
            style={{ padding: "6px 14px", fontSize: 12.5, opacity: page <= 1 || loading ? 0.5 : 1 }}
            onClick={() => { const p = page - 1; setPage(p); load(filter, p); }}>← Prev</button>
          <span style={{ fontSize: 12.5, color: "var(--wc-muted)" }}>
            Page {page} of {Math.max(1, Math.ceil(total/PAGE_SIZE))}
          </span>
          <button className="cdb-btn outline" disabled={page >= Math.ceil(total/PAGE_SIZE) || loading}
            style={{ padding: "6px 14px", fontSize: 12.5, opacity: page >= Math.ceil(total/PAGE_SIZE) || loading ? 0.5 : 1 }}
            onClick={() => { const p = page + 1; setPage(p); load(filter, p); }}>Next →</button>
        </div>
      )}
      {showBookModal && (
        <HRBookAppointmentModal onClose={() => setShowBookModal(false)}
          onBooked={() => { setShowBookModal(false); setPage(1); load(filter, 1); }} />
      )}
    </div>
  );
}

function HRBookAppointmentModal({ onClose, onBooked }) {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [dependants, setDependants] = useState([]);
  const [dependantId, setDependantId] = useState(""); // "" = book for the employee themselves
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [apptType, setApptType] = useState("video");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/company/employees?page_size=500`, { headers: authHeader() });
        const json = await res.json();
        setEmployees(json.employees || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    setDependantId("");
    if (!employeeId) { setDependants([]); return; }
    (async () => {
      try {
        const res = await fetch(`${API}/company/dependants?employee_id=${employeeId}&status=approved`, { headers: authHeader() });
        const json = await res.json();
        setDependants(json.dependants || []);
      } catch { setDependants([]); }
    })();
  }, [employeeId]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/doctors?search=${encodeURIComponent(doctorSearch)}&page_size=10`);
        const json = await res.json();
        setDoctors(json.doctors || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [doctorSearch]);

  useEffect(() => {
    if (!doctorId || !date) { setSlots([]); return; }
    (async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`${API}/doctors/${doctorId}/slots?date_str=${date}`);
        const json = await res.json();
        setSlots(json.slots || []);
      } catch { setSlots([]); }
      finally { setLoadingSlots(false); }
    })();
  }, [doctorId, date]);

  const submit = async () => {
    if (!employeeId || !doctorId || !date || !time) {
      showToast(t("companyDashboard.bookModal.fillRequiredFields"), "error");
      return;
    }
    if (apptType === "home" && !address.trim()) {
      showToast(t("companyDashboard.bookModal.addressRequired"), "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/company/book-appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          employee_id: employeeId, dependant_id: dependantId || null, doctor_id: doctorId,
          appointment_type: apptType, appointment_date: date, appointment_time: time,
          symptoms: symptoms || null, patient_address: address || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || t("companyDashboard.bookModal.bookFailed"), "error"); return; }
      showToast(t("companyDashboard.bookModal.bookedMsg"), "success");
      onBooked();
    } catch { showToast(t("companyDashboard.networkError"), "error"); }
    finally { setSaving(false); }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,31,58,.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 22, width: "100%", maxWidth: 480,
        maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{t("companyDashboard.appointments.bookForEmployee")}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>{t("companyDashboard.bookModal.employeeLabel")}</label>
        <select className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
          <option value="">{t("companyDashboard.bookModal.selectEmployee")}</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name} ({e.patient_id})</option>)}
        </select>

        {employeeId && dependants.length > 0 && (
          <>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>{t("companyDashboard.bookModal.whoIsThisFor")}</label>
            <select className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} value={dependantId} onChange={(e) => setDependantId(e.target.value)}>
              <option value="">{t("companyDashboard.bookModal.employeeThemselves")}</option>
              {dependants.map((d) => <option key={d.id} value={d.id}>{d.full_name} ({d.relationship})</option>)}
            </select>
          </>
        )}

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>{t("companyDashboard.bookModal.doctorLabel")}</label>
        <input className="cdb-inp" style={{ width: "100%", marginBottom: 6 }} placeholder={t("companyDashboard.bookModal.doctorSearchPlaceholder")}
          value={doctorSearch} onChange={(e) => { setDoctorSearch(e.target.value); setDoctorId(""); }} />
        {doctors.length > 0 && !doctorId && (
          <div style={{ border: "1px solid var(--wc-border)", borderRadius: 8, marginBottom: 12, maxHeight: 140, overflowY: "auto" }}>
            {doctors.map((d) => (
              <button key={d.id} onClick={() => { setDoctorId(d.id); setDoctorSearch(`${d.full_name} — ${d.specialization}`); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", border: "none",
                  background: "#fff", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>
                {d.full_name} — {d.specialization}
              </button>
            ))}
          </div>
        )}

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>{t("companyDashboard.bookModal.consultationType")}</label>
        <select className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} value={apptType} onChange={(e) => setApptType(e.target.value)}>
          <option value="video">{t("companyDashboard.bookModal.typeVideo")}</option>
          <option value="inperson">{t("companyDashboard.bookModal.typeInPerson")}</option>
          <option value="home">{t("companyDashboard.bookModal.typeHome")}</option>
        </select>
        {apptType === "home" && (
          <>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>{t("companyDashboard.bookModal.visitAddress")}</label>
            <input className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} value={address} onChange={(e) => setAddress(e.target.value)} />
          </>
        )}

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>{t("companyDashboard.bookModal.dateLabel")}</label>
        <input type="date" className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} min={todayStr}
          value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} disabled={!doctorId} />

        {doctorId && date && (
          <>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>{t("companyDashboard.bookModal.availableSlots")}</label>
            {loadingSlots ? <p style={{ fontSize: 13, color: "#94a3b8" }}>{t("companyDashboard.bookModal.loadingSlots")}</p> : slots.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>{t("companyDashboard.bookModal.noSlots")}</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {slots.map((s) => (
                  <button key={s.time_24} disabled={!s.available} onClick={() => setTime(s.time_24)}
                    style={{
                      padding: "6px 11px", borderRadius: 7, fontSize: 12.5, cursor: s.available ? "pointer" : "not-allowed",
                      border: time === s.time_24 ? "1.5px solid var(--wc-green)" : "1px solid var(--wc-border)",
                      background: time === s.time_24 ? "var(--wc-sage)" : s.available ? "#fff" : "#f1f5f9",
                      color: s.available ? "var(--wc-navy)" : "#cbd5e1",
                    }}>
                    {s.time_12}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>{t("companyDashboard.bookModal.symptomsLabel")}</label>
        <textarea className="cdb-inp" style={{ width: "100%", marginBottom: 16, minHeight: 60 }}
          value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />

        <button className="cdb-btn" style={{ width: "100%" }} disabled={saving} onClick={submit}>
          {saving ? t("companyDashboard.bookModal.booking") : t("companyDashboard.bookModal.submitBtn")}
        </button>
      </div>
    </div>
  );
}

function Employees() {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", mobile: "" });
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");        // typed value
  const [searchTerm, setSearchTerm] = useState(""); // committed value actually sent to the backend
  const PAGE_SIZE = 25; // matches the backend default in list_employees

  // BUG FIX: `total` was already being fetched from the backend (which
  // has always supported real page/page_size pagination — see
  // list_employees in routes/company.py) but there was no `page` state
  // and no UI to change pages at all. Any company with more than 25
  // employees had every employee past #25 permanently unreachable in
  // this table, with no error or indication anything was missing.
  const load = async (p = page, s = searchTerm) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: p, page_size: PAGE_SIZE });
      if (s.trim()) qs.set("search", s.trim());
      const res = await fetch(`${API}/company/employees?${qs}`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) { setEmployees(json.employees); setTotal(json.total); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1, ""); }, []);

  const runSearch = (e) => {
    e.preventDefault();
    setSearchTerm(search); setPage(1); load(1, search);
  };
  const clearSearch = () => {
    setSearch(""); setSearchTerm(""); setPage(1); load(1, "");
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch(`${API}/company/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || t("companyDashboard.employees.addFailed"), "error"); return; }
      showToast(t("companyDashboard.employees.addedMsg", { id: json.patient_id }), "success");
      setForm({ full_name: "", email: "", mobile: "" });
      setPage(1); load(1); // new employee sorts to the top — jump back to page 1 so it's visible
    } catch { showToast(t("companyDashboard.networkError"), "error"); }
    finally { setAdding(false); }
  };

  return (
    <>
      <div className="cdb-card" style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 19, marginTop: 0 }}>{t("companyDashboard.employees.addHeading")}</h2>
        <p style={{ fontSize: 13, color: "var(--wc-muted)", marginTop: "-6px" }}>
          {t("companyDashboard.employees.addSubtext")}
        </p>
        <form onSubmit={addEmployee} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--wc-muted)", display: "block", marginBottom: 4 }}>{t("companyDashboard.employees.fullName")}</label>
            <input className="cdb-inp" required value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--wc-muted)", display: "block", marginBottom: 4 }}>{t("companyDashboard.employees.email")}</label>
            <input className="cdb-inp" type="email" required value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--wc-muted)", display: "block", marginBottom: 4 }}>{t("companyDashboard.employees.mobile")}</label>
            <input className="cdb-inp" value={form.mobile}
              onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
          </div>
          <button className="cdb-btn" disabled={adding}>{adding ? t("companyDashboard.employees.adding") : t("companyDashboard.employees.addEmployee")}</button>
        </form>
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>{t("companyDashboard.employees.listHeading", { count: total })}</h2>
        <form onSubmit={runSearch} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <input className="cdb-inp" style={{ minWidth: 220, flex: "1 1 220px" }}
            placeholder="Search by Employee ID, name, email, or mobile"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="cdb-btn" type="submit" style={{ flexShrink: 0 }} disabled={loading}>Search</button>
          {searchTerm && (
            <button type="button" className="cdb-btn outline" style={{ flexShrink: 0 }}
              onClick={clearSearch} disabled={loading}>Clear</button>
          )}
        </form>
        {searchTerm && !loading && (
          <p style={{ fontSize: 12.5, color: "var(--wc-muted)", marginTop: -6, marginBottom: 12 }}>
            {total === 0
              ? `No employee found matching "${searchTerm}".`
              : `${total} employee${total === 1 ? "" : "s"} matching "${searchTerm}".`}
          </p>
        )}
        {loading ? <p>{t("companyDashboard.employees.loading")}</p> : (
          <table className="cdb-table">
            <thead><tr>
              <th>{t("companyDashboard.employees.thPatientId")}</th>
              <th>{t("companyDashboard.employees.thName")}</th>
              <th>{t("companyDashboard.employees.thEmail")}</th>
              <th>{t("companyDashboard.employees.thMobile")}</th>
              <th>{t("companyDashboard.employees.thAddedBy")}</th>
              <th>{t("companyDashboard.employees.thHealthRecords")}</th>
            </tr></thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontFamily: "monospace" }}>{emp.patient_id}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.mobile || "—"}</td>
                  <td>{emp.added_by_company ? t("companyDashboard.employees.addedByHr") : t("companyDashboard.employees.addedBySelf")}</td>
                  <td>
                    {emp.hr_health_consent_at ? (
                      <button className="cdb-btn outline" style={{ padding: "5px 10px", fontSize: 12 }}
                        onClick={() => setViewingEmployee(emp)}>{t("companyDashboard.employees.view")}</button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: 12.5 }}>{t("companyDashboard.employees.notConsented")}</span>
                    )}
                  </td>
                </tr>
              ))}
              {!employees.length && <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>{t("companyDashboard.employees.none")}</td></tr>}
            </tbody>
          </table>
        )}
        {total > PAGE_SIZE && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 16 }}>
            <button className="cdb-btn outline" disabled={page <= 1 || loading}
              style={{ padding: "6px 14px", fontSize: 12.5, opacity: page <= 1 || loading ? 0.5 : 1 }}
              onClick={() => { const p = page - 1; setPage(p); load(p); }}>← {t("companyDashboard.employees.prev","Prev")}</button>
            <span style={{ fontSize: 12.5, color: "var(--wc-muted)" }}>
              {t("companyDashboard.employees.pageOf","Page {{page}} of {{total}}",{page, total: Math.max(1, Math.ceil(total/PAGE_SIZE))})}
            </span>
            <button className="cdb-btn outline" disabled={page >= Math.ceil(total/PAGE_SIZE) || loading}
              style={{ padding: "6px 14px", fontSize: 12.5, opacity: page >= Math.ceil(total/PAGE_SIZE) || loading ? 0.5 : 1 }}
              onClick={() => { const p = page + 1; setPage(p); load(p); }}>{t("companyDashboard.employees.next","Next")} →</button>
          </div>
        )}
      </div>
      {viewingEmployee && (
        <EmployeeHealthRecordsModal employee={viewingEmployee} onClose={() => setViewingEmployee(null)} />
      )}
    </>
  );

}

function EmployeeHealthRecordsModal({ employee, onClose }) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, docsRes, historyRes] = await Promise.all([
          fetch(`${API}/company/employees/${employee.id}/health-profile`, { headers: authHeader() }),
          fetch(`${API}/company/employees/${employee.id}/documents`, { headers: authHeader() }),
          fetch(`${API}/company/employees/${employee.id}/appointment-history`, { headers: authHeader() }),
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (docsRes.ok) setDocuments((await docsRes.json()).documents);
        if (historyRes.ok) setHistory((await historyRes.json()).history);
      } catch { showToast(t("companyDashboard.healthRecordsModal.loadFailed"), "error"); }
      finally { setLoading(false); }
    })();
  }, [employee.id]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(11,31,58,.5)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cdb-card" style={{ maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>{t("companyDashboard.healthRecordsModal.heading", { name: employee.full_name })}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--wc-muted)" }}>×</button>
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: -8, marginBottom: 16 }}>
          {t("companyDashboard.healthRecordsModal.complianceNote")}
        </p>
        {loading ? <p>{t("companyDashboard.employees.loading")}</p> : (
          <>
            <h3 style={{ fontSize: 15 }}>{t("companyDashboard.healthRecordsModal.healthProfile")}</h3>
            {profile?.exists === false ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("companyDashboard.healthRecordsModal.noProfile")}</p>
            ) : (
              <table className="cdb-table" style={{ marginBottom: 20 }}>
                <tbody>
                  <tr><td style={{ color: "var(--wc-muted)", width: 160 }}>{t("companyDashboard.healthRecordsModal.allergies")}</td><td>{profile?.allergies || "—"}</td></tr>
                  <tr><td style={{ color: "var(--wc-muted)" }}>{t("companyDashboard.healthRecordsModal.chronicConditions")}</td><td>{profile?.chronic_conditions || "—"}</td></tr>
                  <tr><td style={{ color: "var(--wc-muted)" }}>{t("companyDashboard.healthRecordsModal.currentMedications")}</td><td>{profile?.current_medications || "—"}</td></tr>
                  <tr><td style={{ color: "var(--wc-muted)" }}>{t("companyDashboard.healthRecordsModal.pastSurgeries")}</td><td>{profile?.past_surgeries || "—"}</td></tr>
                </tbody>
              </table>
            )}
            <h3 style={{ fontSize: 15 }}>{t("companyDashboard.healthRecordsModal.documents")}</h3>
            {documents?.length ? (
              <table className="cdb-table">
                <thead><tr>
                  <th>{t("companyDashboard.healthRecordsModal.thFile")}</th>
                  <th>{t("companyDashboard.healthRecordsModal.thType")}</th>
                  <th>{t("companyDashboard.healthRecordsModal.thUploaded")}</th>
                </tr></thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id}>
                      <td>{d.file_name}</td>
                      <td>{d.document_type}</td>
                      <td>{new Date(d.uploaded_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("companyDashboard.healthRecordsModal.noDocuments")}</p>
            )}

            <h3 style={{ fontSize: 15, marginTop: 20 }}>Appointment History</h3>
            {history?.length ? history.map((h) => (
              <div key={h.id} style={{ background: "var(--wc-warm-white)", border: "1px solid var(--wc-border)",
                borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--wc-navy)" }}>
                      {h.doctors?.full_name ? `Dr. ${h.doctors.full_name}` : "—"}
                    </span>
                    {h.doctors?.specialization && (
                      <span style={{ fontSize: 12, color: "var(--wc-muted)" }}> · {h.doctors.specialization}</span>
                    )}
                    <div style={{ fontSize: 12, color: "var(--wc-muted)", marginTop: 2 }}>
                      {h.appointment_date ? new Date(h.appointment_date).toLocaleDateString("en-IN") : "—"}
                      {h.appointment_time ? ` · ${h.appointment_time}` : ""}
                      {h.appointment_type ? ` · ${h.appointment_type}` : ""}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    color: h.status === "completed" ? "var(--wc-green)" : h.status === "cancelled" ? "#991b1b" : "var(--wc-teal)",
                    background: h.status === "completed" ? "var(--wc-sage)" : h.status === "cancelled" ? "#fef2f2" : "#eff8ff" }}>
                    {h.status}
                  </span>
                </div>
                {h.symptoms && (
                  <p style={{ fontSize: 12.5, color: "#374151", margin: "8px 0 0" }}>
                    <strong>Symptoms:</strong> {h.symptoms}
                  </p>
                )}
                {h.prescription && (
                  <p style={{ fontSize: 12.5, color: "#374151", margin: "6px 0 0" }}>
                    <strong>Prescription:</strong> {h.prescription}
                  </p>
                )}
                {h.prescription_items?.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    {h.prescription_items.map((m, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#1e293b", marginBottom: 3,
                        paddingLeft: 8, borderLeft: "2px solid #86efac" }}>
                        <strong>{m.medicine_name}</strong>
                        {m.dosage ? ` · ${m.dosage}` : ""}
                        {m.frequency ? ` · ${m.frequency}` : ""}
                        {m.duration ? ` · ${m.duration}` : ""}
                      </div>
                    ))}
                  </div>
                )}
                {h.doctor_notes && (
                  <p style={{ fontSize: 12, color: "var(--wc-muted)", fontStyle: "italic", margin: "6px 0 0" }}>
                    Doctor notes: {h.doctor_notes}
                  </p>
                )}
              </div>
            )) : (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No appointment history found for this employee.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
