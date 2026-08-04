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
import { showToast } from "../../components/Toast";
import SEO from "../../components/SEO";
import TwoFactorSettings from "../../components/TwoFactorSettings";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.cdb{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;}
.cdb *{box-sizing:border-box;}
.cdb h1,.cdb h2,.cdb h3{font-family:'Cormorant Garamond',serif;color:#0b1f3a;}
.cdb-shell{display:flex;min-height:100vh;flex-wrap:wrap;}
.cdb-side{width:220px;background:#0b1f3a;color:#fff;padding:22px 14px;flex-shrink:0;}
.cdb-side h3{color:#fff;font-size:17px;margin:0 0 18px;padding:0 8px;}
.cdb-nav{display:flex;flex-direction:column;gap:4px;}
.cdb-nav button{background:none;border:none;color:#cbd5e1;text-align:left;padding:10px 12px;
  border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;}
.cdb-nav button.on{background:#047857;color:#fff;}
.cdb-nav button:disabled{opacity:.4;cursor:not-allowed;}
.cdb-main{flex:1;min-width:0;padding:28px;max-width:1000px;}
.cdb-card{background:#fff;border-radius:14px;padding:24px;box-shadow:0 2px 10px rgba(11,31,58,.06);
  margin-bottom:18px;}
.cdb-badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;}
.cdb-inp{border:1.5px solid #e2eaf4;border-radius:8px;padding:9px 11px;font-size:13.5px;
  font-family:'DM Sans',sans-serif;outline:none;}
.cdb-inp:focus{border-color:#047857;}
.cdb-btn{background:#047857;color:#fff;border:none;border-radius:8px;padding:10px 18px;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:13.5px;cursor:pointer;}
.cdb-btn:disabled{opacity:.6;cursor:not-allowed;}
.cdb-btn.outline{background:#fff;color:#047857;border:1.5px solid #047857;}
.cdb-table{width:100%;border-collapse:collapse;font-size:13.5px;}
.cdb-table th{text-align:left;padding:9px 10px;color:#64748b;font-weight:700;
  border-bottom:2px solid #e2eaf4;font-size:12px;}
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
  .cdb-mobile-header{display:block;background:linear-gradient(135deg,#0b1f3a,#112d52);
    color:#fff;padding:18px 18px 20px;}
  .cdb-mobile-header h3{color:#fff;font-size:19px;margin:0;}
  .cdb-main{padding:14px 12px calc(82px + env(safe-area-inset-bottom,0px));}
  .cdb-bottom-bar{display:flex;position:fixed;bottom:0;left:0;right:0;
    background:#0b1f3a;border-top:1px solid rgba(255,255,255,.12);
    z-index:200;height:calc(64px + env(safe-area-inset-bottom,0px));
    padding-bottom:env(safe-area-inset-bottom,0px);
    overflow-x:auto;overflow-y:hidden;-ms-overflow-style:none;scrollbar-width:none;}
  .cdb-bottom-bar::-webkit-scrollbar{display:none;}
  .cdb-tab-btn{flex:0 0 auto;min-width:78px;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:3px;border:none;background:transparent;
    cursor:pointer;font-family:'DM Sans',sans-serif;font-size:10.5px;font-weight:600;
    color:rgba(255,255,255,.58);padding:8px 10px;white-space:nowrap;}
  .cdb-tab-btn.on{color:#6ee7b7;}
  .cdb-tab-btn:disabled{opacity:.42;}
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
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState("overview");

  const fetchCompany = async (attempt = 1) => {
    if (attempt === 1) { setLoading(true); setLoadError(false); }
    try {
      const res = await fetch(`${API}/company/me`, { headers: authHeader() });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        showToast(json.detail || "Couldn't load your dashboard.", "error");
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

  if (loading) return <div className="cdb" style={{ padding: 60, textAlign: "center" }}><style>{G}</style>Loading…</div>;
  if (loadError || !company) return (
    <div className="cdb" style={{ padding: 60, textAlign: "center" }}>
      <style>{G}</style>
      <p style={{ fontSize: 15, color: "#64748b", marginBottom: 16 }}>
        Couldn't load your dashboard. The server may still be starting up.
      </p>
      <button className="cdb-btn" onClick={() => fetchCompany()}>Retry</button>
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
            <button className={tab === "overview" ? "on" : ""} onClick={() => setTab("overview")}>Overview</button>
            <button className={tab === "employees" ? "on" : ""} disabled={!isActive} onClick={() => isActive && setTab("employees")}>
              Employees{!isActive && " 🔒"}
            </button>
            <button className={tab === "appointments" ? "on" : ""} disabled={!isActive} onClick={() => isActive && setTab("appointments")}>
              Appointments{!isActive && " 🔒"}
            </button>
            <button className={tab === "billing" ? "on" : ""} onClick={() => setTab("billing")}>Billing</button>
            <button className={tab === "analytics" ? "on" : ""} disabled={!isActive} onClick={() => isActive && setTab("analytics")}>
              Analytics{!isActive && " 🔒"}
            </button>
          </nav>
        </aside>
        <main className="cdb-main">
          <span className="cdb-badge" style={{ background: badge.bg, color: badge.color }}>
            {company.status.toUpperCase()}
          </span>

          {!isActive && (
            <div className="cdb-card" style={{ marginTop: 14, borderLeft: "4px solid #d97706" }}>
              <h2 style={{ fontSize: 19, marginTop: 0 }}>Subscribe to unlock your full dashboard</h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Your company account is set up, but employee management, appointments,
                and analytics unlock once you choose a plan and complete payment.
              </p>
              <button className="cdb-btn" onClick={() => setTab("billing")}>
                Choose a Plan
              </button>
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
          ["overview",   "📊", "Overview",   true],
          ["employees",  "👥", "Employees",  isActive],
          ["appointments", "🩺", "Appts", isActive],
          ["billing",    "💳", "Billing",    true],
          ["analytics",  "📈", "Analytics",  isActive],
        ].map(([id, icon, label, enabled]) => (
          <button key={id} className={`cdb-tab-btn${tab === id ? " on" : ""}`}
            disabled={!enabled} onClick={() => enabled && setTab(id)}>
            <span className="ti">{icon}</span>
            <span>{label}{!enabled && " 🔒"}</span>
          </button>
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
  const [plans, setPlans] = useState(null);
  const [cycle, setCycle] = useState("monthly");
  const [subscription, setSubscription] = useState(null);
  const [paying, setPaying] = useState(null); // plan_id currently being paid for, or null
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
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway. Check your internet.");

      const subRes = await fetch(`${API}/company/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ plan_id: plan.id, billing_cycle: cycle }),
      });
      const subJson = await subRes.json();
      if (!subRes.ok) throw new Error(subJson.detail || "Couldn't start checkout.");

      const orderRes = await fetch(`${API}/company/subscription/create-order`, {
        method: "POST", headers: authHeader(),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.detail || "Order creation failed.");

      const rz = new window.Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: "We Care 4 'all'",
        description: `${plan.plan_name} Plan (${cycle}) — ${company.company_name}`,
        order_id: order.order_id,
        theme: { color: "#047857" },
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
            if (!vRes.ok) throw new Error(vJson.detail || "Verification failed.");
            showToast("Plan activated! Your dashboard is now unlocked.", "success");
            onActivated();
          } catch (ex) {
            showToast(`Payment received but verification failed: ${ex.message}. Please contact support.`, "error");
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
    if (!quoteModules.trim()) { showToast("Please list which modules/features you need.", "info"); return; }
    setSubmittingQuote(true);
    try {
      const res = await fetch(`${API}/company/custom-quote-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ requested_modules: quoteModules.trim(), message: quoteMessage.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Couldn't submit your request.", "error"); return; }
      setQuoteSent(true);
      showToast("Request sent — our sales team will reach out with a quote.", "success");
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSubmittingQuote(false); }
  };

  return (
    <div className="cdb-card" style={{ marginTop: 14 }}>
      <h2 style={{ fontSize: 19, marginTop: 0 }}>Billing</h2>

      {subscription?.status === "paid" && (
        <div style={{ background: "#eefaf3", border: "1px solid #bbf0d4", borderRadius: 10, padding: 14, marginBottom: 18 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "#15803d", fontWeight: 700 }}>
            ✅ Active — renews {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : "—"}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>
            ₹{subscription.amount} / {subscription.billing_cycle}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["monthly", "annual"].map((c) => (
          <button key={c} className={`cdb-btn ${cycle === c ? "" : "outline"}`}
            style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => setCycle(c)}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {!plans ? <p>Loading plans…</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px,100%),1fr))", gap: 14 }}>
          {plans.map((plan) => {
            const price = cycle === "annual" ? plan.annual_amount : plan.monthly_amount;
            const isCurrent = company.plan_id === plan.id && subscription?.status === "paid";
            return (
              <div key={plan.id} style={{
                border: `1.5px solid ${isCurrent ? "#047857" : "#e2eaf4"}`, borderRadius: 12, padding: 18,
                background: isCurrent ? "#f0fdf4" : "#fff",
              }}>
                <h3 style={{ fontSize: 16, margin: "0 0 6px" }}>{plan.plan_name}</h3>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 10px" }}>
                  {plan.min_employees}–{plan.max_employees ?? "∞"} employees
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#0b1f3a", margin: "0 0 14px" }}>
                  {price > 0 ? `₹${price}` : "Custom"}
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}> /{cycle === "annual" ? "yr" : "mo"}</span>
                </p>
                {isCurrent ? (
                  <button className="cdb-btn" disabled style={{ width: "100%" }}>Current Plan</button>
                ) : price > 0 ? (
                  <button className="cdb-btn" style={{ width: "100%" }} disabled={paying === plan.id}
                    onClick={() => subscribeAndPay(plan)}>
                    {paying === plan.id ? "Processing…" : "Subscribe"}
                  </button>
                ) : (
                  <button className="cdb-btn outline" style={{ width: "100%" }} onClick={() => openQuoteModal(plan)}>
                    Contact Sales
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
                <h3 style={{fontSize:"19px",fontWeight:700,color:"#0b1f3a",marginBottom:"8px"}}>Request Sent</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"#64748b",marginBottom:"18px"}}>
                  Our sales team will review what you need and get back to you with a custom quote.
                </p>
                <button className="cdb-btn" style={{width:"100%"}} onClick={()=>setQuotePlan(null)}>Done</button>
              </div>
            ) : (
              <>
                <h3 style={{fontSize:"19px",fontWeight:700,color:"#0b1f3a",marginBottom:"6px"}}>Request a Custom Quote</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"16px"}}>
                  Tell us which modules/features you need and roughly how many employees — admin will follow up with pricing.
                </p>
                <label style={{fontSize:12,color:"#64748b",display:"block",marginBottom:4}}>Modules / Features Needed *</label>
                <textarea className="cdb-inp" rows={3} style={{width:"100%",resize:"vertical",marginBottom:"12px"}}
                  value={quoteModules} onChange={e=>setQuoteModules(e.target.value)}
                  placeholder="e.g. Employee health checkups, dependant coverage, dedicated account manager, 500+ employees"/>
                <label style={{fontSize:12,color:"#64748b",display:"block",marginBottom:4}}>Anything else? (optional)</label>
                <textarea className="cdb-inp" rows={2} style={{width:"100%",resize:"vertical",marginBottom:"16px"}}
                  value={quoteMessage} onChange={e=>setQuoteMessage(e.target.value)}
                  placeholder="Timeline, budget range, specific requirements…"/>
                <div style={{display:"flex",gap:"10px"}}>
                  <button className="cdb-btn outline" style={{flex:1}} onClick={()=>setQuotePlan(null)}>Cancel</button>
                  <button className="cdb-btn" style={{flex:1}} disabled={submittingQuote} onClick={submitQuoteRequest}>
                    {submittingQuote ? "Sending…" : "Send Request"}
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

function MiniBarChart({ labels, values, color = "#047857", prefix = "" }) {
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
    <div style={{ background: "#f8fafc", border: "1px solid #e2eaf4", borderRadius: 10, padding: "14px 16px" }}>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0b1f3a" }}>{value}</p>
      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{label}</p>
      {sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>{sub}</p>}
    </div>
  );
}

function Analytics() {
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
      if (!res.ok) throw new Error("Export failed.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "utilization_report.csv";
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { showToast("Couldn't export the report.", "error"); }
    finally { setExporting(false); }
  };

  if (!data) return <div className="cdb-card" style={{ marginTop: 14 }}><p>Loading analytics…</p></div>;

  return (
    <>
      <div className="cdb-card" style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 19, margin: 0 }}>Utilization Overview</h2>
          <button className="cdb-btn outline" style={{ padding: "7px 14px", fontSize: 12.5 }} disabled={exporting} onClick={exportCsv}>
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(140px,100%),1fr))", gap: 12, marginTop: 16 }}>
          <StatCard label="Employees" value={data.total_employees} />
          <StatCard label="Utilization Rate" value={`${data.utilization_rate}%`} sub={`${data.active_employees} active`} />
          <StatCard label="Total Appointments" value={data.total_appointments} />
          <StatCard label="Total Sponsored Cost" value={`₹${data.total_sponsored_cost}`} />
          <StatCard label="Avg Cost / Employee" value={`₹${data.avg_cost_per_employee}`} />
          <StatCard label="Avg Cost / Appointment" value={`₹${data.avg_cost_per_appointment}`} />
          <StatCard label="Dependants" value={data.total_dependants} />
        </div>
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Appointments — Last 12 Months</h2>
        <MiniBarChart labels={data.monthly_labels} values={data.monthly_appointments} />
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Sponsored Cost — Last 12 Months</h2>
        <MiniBarChart labels={data.monthly_labels} values={data.monthly_sponsored_cost} prefix="₹" />
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Top Specialties Used</h2>
        {data.specialty_breakdown.length ? (
          <table className="cdb-table">
            <thead><tr><th>Specialty</th><th>Appointments</th><th>Sponsored Cost</th></tr></thead>
            <tbody>
              {data.specialty_breakdown.map((s) => (
                <tr key={s.specialization}><td>{s.specialization}</td><td>{s.count}</td><td>₹{s.sponsored_cost}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p style={{ color: "#94a3b8", fontSize: 13 }}>No appointment data yet.</p>}
      </div>
    </>
  );
}

function Overview({ company, setCompany }) {
  return (
    <div className="cdb-card" style={{ marginTop: 14 }}>
      <h2 style={{ fontSize: 19, marginTop: 0 }}>Company Profile</h2>
      <table className="cdb-table">
        <tbody>
          <tr><td style={{ color: "#64748b", width: 180 }}>Company Name</td><td>{company.company_name}</td></tr>
          <tr><td style={{ color: "#64748b" }}>Registered Email</td><td>{company.registered_email}</td></tr>
          <tr><td style={{ color: "#64748b" }}>Industry</td><td>{company.industry || "—"}</td></tr>
          <tr><td style={{ color: "#64748b" }}>Declared Employees</td><td>{company.declared_employee_count || "—"}</td></tr>
          <tr><td style={{ color: "#64748b" }}>Seats Remaining</td>
            <td>{company.seats_remaining === null || company.seats_remaining === undefined ? "Unlimited" : company.seats_remaining}</td></tr>
          {company.invite_code && (
            <tr><td style={{ color: "#64748b" }}>Employee Invite Code</td>
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
      if (!res.ok) { showToast(json.detail || "Couldn't update this setting.", "error"); return; }
      setCompany(c => ({ ...c, employee_self_booking_enabled: next }));
      showToast(next ? "Employees can now book their own appointments." : "HR will book appointments for employees.", "success");
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ marginTop: 20, padding: "16px 18px", background: "#f8fafc",
      border: "1px solid #e2eaf4", borderRadius: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#0b1f3a" }}>
            Who books appointments for employees?
          </p>
          <p style={{ margin: 0, fontSize: 12.5, color: "#64748b", maxWidth: 460 }}>
            {enabled
              ? "Employees can book their own doctor consultations directly from their patient dashboard."
              : "Only HR books appointments on behalf of employees. Employees can't book their own."}
          </p>
        </div>
        <button onClick={toggle} disabled={saving}
          style={{
            width: 52, height: 28, borderRadius: 20, border: "none", cursor: saving ? "default" : "pointer",
            background: enabled ? "#047857" : "#cbd5e1", position: "relative", flexShrink: 0,
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
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/employee-signup?code=${code}`;
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <div style={{ marginTop: 16, padding: "14px 16px", background: "#f0fdf4",
      border: "1px solid #bbf7d0", borderRadius: 10 }}>
      <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 600, color: "#166534" }}>
        Share this link with your employees so they can sign up themselves:
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <code style={{ fontSize: 13, background: "#fff", border: "1px solid #d1fae5",
          borderRadius: 6, padding: "6px 10px", wordBreak: "break-all", flex: "1 1 260px" }}>{url}</code>
        <button onClick={copy} style={{ background: "#047857", color: "#fff", border: "none",
          borderRadius: 6, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
          whiteSpace: "nowrap" }}>
          {copied ? "Copied ✓" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}

function CompanyAppointments({ company }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showBookModal, setShowBookModal] = useState(false);

  const load = async (status) => {
    setLoading(true);
    try {
      const qs = status && status !== "all" ? `?status=${status}` : "";
      const res = await fetch(`${API}/company/appointments${qs}`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) setAppointments(json.appointments || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(filter); }, [filter]);

  const STATUS_COLORS = {
    pending:   { bg: "#fef9c3", color: "#854d0e" },
    approved:  { bg: "#dbeafe", color: "#1e40af" },
    completed: { bg: "#dcfce7", color: "#15803d" },
    cancelled: { bg: "#fee2e2", color: "#991b1b" },
  };

  return (
    <div className="cdb-card" style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 19, margin: 0 }}>Employee Appointments</h2>
        {!company.employee_self_booking_enabled && (
          <button className="cdb-btn" onClick={() => setShowBookModal(true)}>
            + Book for Employee
          </button>
        )}
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
        {company.employee_self_booking_enabled
          ? "Employees book their own consultations directly. This is a read-only view of everything booked under your plan."
          : "Book consultations on behalf of your employees. Covered under your active plan — no separate payment needed."}
      </p>
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {["all", "pending", "approved", "completed", "cancelled"].map((s) => (
          <button key={s} className={`cdb-btn ${filter === s ? "" : "outline"}`}
            style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <p style={{ marginTop: 14 }}>Loading…</p> : (
        <table className="cdb-table" style={{ marginTop: 14 }}>
          <thead><tr><th>Patient</th><th>Doctor</th><th>Date &amp; Time</th><th>Type</th><th>Status</th><th>Booked By</th></tr></thead>
          <tbody>
            {appointments.map((a) => {
              const s = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
              return (
                <tr key={a.id}>
                  <td>{a.patient_name}</td>
                  <td>{a.doctors?.full_name || "—"}{a.doctors?.specialization ? ` (${a.doctors.specialization})` : ""}</td>
                  <td>{a.appointment_date} {a.appointment_time?.slice(0, 5)}</td>
                  <td style={{ textTransform: "capitalize" }}>{a.appointment_type}</td>
                  <td>
                    <span style={{ background: s.bg, color: s.color, padding: "3px 10px",
                      borderRadius: 20, fontSize: 11.5, fontWeight: 700, textTransform: "capitalize" }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5, color: "#64748b" }}>{a.booked_by_hr ? "HR" : "Employee"}</td>
                </tr>
              );
            })}
            {!appointments.length && <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>No {filter !== "all" ? filter : ""} appointments yet.</td></tr>}
          </tbody>
        </table>
      )}
      {showBookModal && (
        <HRBookAppointmentModal onClose={() => setShowBookModal(false)}
          onBooked={() => { setShowBookModal(false); load(filter); }} />
      )}
    </div>
  );
}

function HRBookAppointmentModal({ onClose, onBooked }) {
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
      showToast("Please fill in employee, doctor, date, and time.", "error");
      return;
    }
    if (apptType === "home" && !address.trim()) {
      showToast("Please provide an address for the home visit.", "error");
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
      if (!res.ok) { showToast(json.detail || "Couldn't book this appointment.", "error"); return; }
      showToast("Appointment booked — no payment needed, covered under your plan.", "success");
      onBooked();
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setSaving(false); }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,31,58,.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: 22, width: "100%", maxWidth: 480,
        maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Book for Employee</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Employee *</label>
        <select className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
          <option value="">Select employee…</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name} ({e.patient_id})</option>)}
        </select>

        {employeeId && dependants.length > 0 && (
          <>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Who is this consultation for?</label>
            <select className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} value={dependantId} onChange={(e) => setDependantId(e.target.value)}>
              <option value="">The employee themselves</option>
              {dependants.map((d) => <option key={d.id} value={d.id}>{d.full_name} ({d.relationship})</option>)}
            </select>
          </>
        )}

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Doctor *</label>
        <input className="cdb-inp" style={{ width: "100%", marginBottom: 6 }} placeholder="Search doctor by name or specialization…"
          value={doctorSearch} onChange={(e) => { setDoctorSearch(e.target.value); setDoctorId(""); }} />
        {doctors.length > 0 && !doctorId && (
          <div style={{ border: "1px solid #e2eaf4", borderRadius: 8, marginBottom: 12, maxHeight: 140, overflowY: "auto" }}>
            {doctors.map((d) => (
              <button key={d.id} onClick={() => { setDoctorId(d.id); setDoctorSearch(`${d.full_name} — ${d.specialization}`); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 10px", border: "none",
                  background: "#fff", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>
                {d.full_name} — {d.specialization}
              </button>
            ))}
          </div>
        )}

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Consultation Type</label>
        <select className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} value={apptType} onChange={(e) => setApptType(e.target.value)}>
          <option value="video">Video Consultation</option>
          <option value="inperson">In-Person</option>
          <option value="home">Home Visit</option>
        </select>
        {apptType === "home" && (
          <>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Visit Address *</label>
            <input className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} value={address} onChange={(e) => setAddress(e.target.value)} />
          </>
        )}

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Date *</label>
        <input type="date" className="cdb-inp" style={{ width: "100%", marginBottom: 12 }} min={todayStr}
          value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} disabled={!doctorId} />

        {doctorId && date && (
          <>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>Available Slots *</label>
            {loadingSlots ? <p style={{ fontSize: 13, color: "#94a3b8" }}>Loading slots…</p> : slots.length === 0 ? (
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>No slots available on this date.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {slots.map((s) => (
                  <button key={s.time_24} disabled={!s.available} onClick={() => setTime(s.time_24)}
                    style={{
                      padding: "6px 11px", borderRadius: 7, fontSize: 12.5, cursor: s.available ? "pointer" : "not-allowed",
                      border: time === s.time_24 ? "1.5px solid #047857" : "1px solid #e2eaf4",
                      background: time === s.time_24 ? "#f0fdf4" : s.available ? "#fff" : "#f1f5f9",
                      color: s.available ? "#0b1f3a" : "#cbd5e1",
                    }}>
                    {s.time_12}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>Symptoms / Notes (optional)</label>
        <textarea className="cdb-inp" style={{ width: "100%", marginBottom: 16, minHeight: 60 }}
          value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />

        <button className="cdb-btn" style={{ width: "100%" }} disabled={saving} onClick={submit}>
          {saving ? "Booking…" : "Book Appointment (No Payment Needed)"}
        </button>
      </div>
    </div>
  );
}

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", mobile: "" });
  const [viewingEmployee, setViewingEmployee] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/company/employees`, { headers: authHeader() });
      const json = await res.json();
      if (res.ok) { setEmployees(json.employees); setTotal(json.total); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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
      if (!res.ok) { showToast(json.detail || "Couldn't add employee.", "error"); return; }
      showToast(`Added — Patient ID ${json.patient_id}`, "success");
      setForm({ full_name: "", email: "", mobile: "" });
      load();
    } catch { showToast("Couldn't reach the server.", "error"); }
    finally { setAdding(false); }
  };

  return (
    <>
      <div className="cdb-card" style={{ marginTop: 14 }}>
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Add an Employee</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: "-6px" }}>
          Collects the same details a patient provides on their own first login — full name, email, and mobile.
        </p>
        <form onSubmit={addEmployee} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Full Name</label>
            <input className="cdb-inp" required value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Email</label>
            <input className="cdb-inp" type="email" required value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Mobile</label>
            <input className="cdb-inp" value={form.mobile}
              onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
          </div>
          <button className="cdb-btn" disabled={adding}>{adding ? "Adding…" : "Add Employee"}</button>
        </form>
      </div>

      <div className="cdb-card">
        <h2 style={{ fontSize: 19, marginTop: 0 }}>Employees ({total})</h2>
        {loading ? <p>Loading…</p> : (
          <table className="cdb-table">
            <thead><tr><th>Patient ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Added By</th><th>Health Records</th></tr></thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontFamily: "monospace" }}>{emp.patient_id}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.mobile || "—"}</td>
                  <td>{emp.added_by_company ? "HR" : "Self-registered"}</td>
                  <td>
                    {emp.hr_health_consent_at ? (
                      <button className="cdb-btn outline" style={{ padding: "5px 10px", fontSize: 12 }}
                        onClick={() => setViewingEmployee(emp)}>View</button>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: 12.5 }}>Not consented</span>
                    )}
                  </td>
                </tr>
              ))}
              {!employees.length && <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>No employees yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {viewingEmployee && (
        <EmployeeHealthRecordsModal employee={viewingEmployee} onClose={() => setViewingEmployee(null)} />
      )}
    </>
  );

}

function EmployeeHealthRecordsModal({ employee, onClose }) {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, docsRes] = await Promise.all([
          fetch(`${API}/company/employees/${employee.id}/health-profile`, { headers: authHeader() }),
          fetch(`${API}/company/employees/${employee.id}/documents`, { headers: authHeader() }),
        ]);
        if (profileRes.ok) setProfile(await profileRes.json());
        if (docsRes.ok) setDocuments((await docsRes.json()).documents);
      } catch { showToast("Couldn't load health records.", "error"); }
      finally { setLoading(false); }
    })();
  }, [employee.id]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(11,31,58,.5)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cdb-card" style={{ maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>{employee.full_name}'s Health Records</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>×</button>
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: -8, marginBottom: 16 }}>
          This view is logged for compliance — the employee consented to HR access and can revoke it anytime.
        </p>
        {loading ? <p>Loading…</p> : (
          <>
            <h3 style={{ fontSize: 15 }}>Health Profile</h3>
            {profile?.exists === false ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No health profile on file yet.</p>
            ) : (
              <table className="cdb-table" style={{ marginBottom: 20 }}>
                <tbody>
                  <tr><td style={{ color: "#64748b", width: 160 }}>Allergies</td><td>{profile?.allergies || "—"}</td></tr>
                  <tr><td style={{ color: "#64748b" }}>Chronic Conditions</td><td>{profile?.chronic_conditions || "—"}</td></tr>
                  <tr><td style={{ color: "#64748b" }}>Current Medications</td><td>{profile?.current_medications || "—"}</td></tr>
                  <tr><td style={{ color: "#64748b" }}>Past Surgeries</td><td>{profile?.past_surgeries || "—"}</td></tr>
                </tbody>
              </table>
            )}
            <h3 style={{ fontSize: 15 }}>Documents</h3>
            {documents?.length ? (
              <table className="cdb-table">
                <thead><tr><th>File</th><th>Type</th><th>Uploaded</th></tr></thead>
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
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No documents uploaded yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
