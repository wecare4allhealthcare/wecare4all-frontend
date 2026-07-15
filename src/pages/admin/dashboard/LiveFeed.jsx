import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { API } from "./shared";


// ── Live Activity Feed ────────────────────────────────────────
// Polls GET /admin/live every 30 seconds. One consolidated round
// trip per poll — the backend returns all four data sets together.
// The "last seen" count comparison fires a subtle pulse on the
// badge so admin knows something changed without reading it all.
export default function LiveFeed({ token }) {
  const { t } = useTranslation();
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [lastPoll,  setLastPoll]  = useState(null);
  const [pulsing,   setPulsing]   = useState(false);
  const prevCountRef = useRef(0);

  const poll = async () => {
    try {
      const res  = await fetch(`${API}/admin/live`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      if (res.ok) {
        const total =
          (json.available_now?.length    || 0) +
          (json.recent_bookings?.length  || 0) +
          (json.pending_transfers?.length|| 0) +
          (json.recent_payments?.length  || 0);
        if (prevCountRef.current > 0 && total !== prevCountRef.current) {
          setPulsing(true);
          setTimeout(() => setPulsing(false), 1200);
        }
        prevCountRef.current = total;
        setData(json);
        setLastPoll(new Date());
      }
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    poll();
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, []);

  // "X min ago" relative time
  const ago = (isoStr) => {
    if (!isoStr) return "";
    const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
    if (diff < 1)  return t("adminPages.liveFeed.justNow");
    if (diff < 60) return t("adminPages.liveFeed.minAgo",{n:diff});
    return t("adminPages.liveFeed.hourAgo",{n:Math.floor(diff/60)});
  };

  const CARD = {
    background:"#fff", border:"1px solid #e2eaf4",
    borderRadius:"12px", padding:"16px", marginBottom:"16px",
  };
  const ROW = {
    display:"flex", justifyContent:"space-between", alignItems:"flex-start",
    gap:"10px", padding:"10px 0",
    borderBottom:"1px solid #f1f5f9",
  };
  const SH = { // section heading
    fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:"700",
    color:"#6d28d9", textTransform:"uppercase", letterSpacing:"0.05em",
    marginBottom:"8px",
  };
  const pill = (txt, color, bg) => (
    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:"700",
      padding:"2px 8px", borderRadius:"20px", color, background:bg,
      flexShrink:0, whiteSpace:"nowrap" }}>{txt}</span>
  );

  if (loading) return (
    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#6b7688",padding:"40px 0",textAlign:"center"}}>
      {t("adminPages.liveFeed.loading")}
    </p>
  );

  const { available_now=[], recent_bookings=[], pending_transfers=[], recent_payments=[] } = data || {};

  return (
    <div>
      {/* Header with last-refresh timestamp */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{display:"inline-block",width:"8px",height:"8px",borderRadius:"50%",
            background:"#22c55e",
            boxShadow: pulsing ? "0 0 0 6px rgba(34,197,94,.3)" : "none",
            transition:"box-shadow .4s"}}/>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"#374151",fontWeight:"600"}}>{t("adminPages.liveFeed.liveActivity")}</span>
        </div>
        {lastPoll && (
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#6b7688"}}>
            {t("adminPages.liveFeed.lastRefreshed",{time:lastPoll.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})})}
            {t("adminPages.liveFeed.autoRefresh")}
          </span>
        )}
      </div>

      {/* 2-column grid on wide screens, single column on narrow */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"16px"}}>

        {/* 1. Available Now Doctors */}
        <div style={CARD}>
          <p style={SH}>{t("adminPages.liveFeed.availableNow",{count:available_now.length})}</p>
          {available_now.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#6b7688",fontStyle:"italic",margin:0}}>
              {t("adminPages.liveFeed.noneAvailableNow")}
            </p>
          ) : available_now.map(d => (
            <div key={d.id} style={{...ROW,alignItems:"center"}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
                  fontWeight:"600",color:"#0b1f3a",margin:0}}>{d.full_name}</p>
                {d.specialization &&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                    color:"#64748b",margin:"2px 0 0"}}>{d.specialization}</p>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {pill(t("adminPages.liveFeed.availableNowBadge"),"#047857","#f0fdf4")}
                {d.available_now_since &&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                    color:"#6b7688",margin:"4px 0 0"}}>{ago(d.available_now_since)}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* 2. Recent Bookings (last 2 hours) */}
        <div style={CARD}>
          <p style={SH}>{t("adminPages.liveFeed.bookingsLast2Hrs",{count:recent_bookings.length})}</p>
          {recent_bookings.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#6b7688",fontStyle:"italic",margin:0}}>
              {t("adminPages.liveFeed.noRecentBookings")}
            </p>
          ) : recent_bookings.map(b => (
            <div key={b.id} style={ROW}>
              <div style={{minWidth:0}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
                  fontWeight:"600",color:"#0b1f3a",margin:0}}>{b.patient_name}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#64748b",margin:"2px 0 0"}}>
                  {b.doctors?.full_name ? b.doctors.full_name : ""}
                  {b.appointment_date ? ` · ${new Date(b.appointment_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}` : ""}
                  {b.appointment_time ? ` ${b.appointment_time.slice(0,5)}` : ""}
                </p>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {pill(
                  t(`adminPages.shared.status.${b.status}`, b.status),
                  b.status==="pending"?"#854d0e":b.status==="approved"?"#047857":"#374151",
                  b.status==="pending"?"#fefce8":b.status==="approved"?"#f0fdf4":"#f1f5f9"
                )}
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#6b7688",margin:"4px 0 0"}}>{ago(b.created_at)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Pending Transfer Requests */}
        <div style={CARD}>
          <p style={SH}>{t("adminPages.liveFeed.pendingTransfers",{count:pending_transfers.length})}</p>
          {pending_transfers.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#6b7688",fontStyle:"italic",margin:0}}>
              {t("adminPages.liveFeed.noPendingTransfers")}
            </p>
          ) : pending_transfers.map(t2 => (
            <div key={t2.id} style={ROW}>
              <div style={{minWidth:0}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
                  fontWeight:"600",color:"#0b1f3a",margin:0}}>
                  {t2.appointments?.patient_name || t("adminPages.liveFeed.patientFallback")}
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#64748b",margin:"2px 0 0"}}>
                  {t2.from?.full_name || t("adminPages.liveFeed.unknownDoctor")} → {t2.to?.full_name || t("adminPages.liveFeed.unknownDoctor")}
                </p>
                {t2.reason &&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
                    color:"#6b7688",margin:"2px 0 0",fontStyle:"italic"}}>
                    "{t2.reason}"
                  </p>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {pill(t("adminPages.liveFeed.awaitingBadge"),"#854d0e","#fefce8")}
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#6b7688",margin:"4px 0 0"}}>{ago(t2.created_at)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Recent Payments (last hour) */}
        <div style={CARD}>
          <p style={SH}>{t("adminPages.liveFeed.paymentsLastHour",{count:recent_payments.length})}</p>
          {recent_payments.length === 0 ? (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#6b7688",fontStyle:"italic",margin:0}}>
              {t("adminPages.liveFeed.noRecentPayments")}
            </p>
          ) : recent_payments.map(py => (
            <div key={py.id} style={ROW}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
                  fontWeight:"600",color:"#0b1f3a",margin:0}}>
                  {py.appointments?.patient_name || t("adminPages.liveFeed.patientFallback")}
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#64748b",margin:"2px 0 0"}}>
                  {py.gateway?.toUpperCase() || "—"}
                  {py.amount ? ` · ₹${py.amount}` : ""}
                </p>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {pill(
                  t(`adminPages.shared.status.${py.status}`, py.status),
                  py.status==="paid"?"#047857":
                  py.status==="failed"?"#991b1b":
                  py.status==="refund_pending"?"#0369a1":"#854d0e",
                  py.status==="paid"?"#f0fdf4":
                  py.status==="failed"?"#fef2f2":
                  py.status==="refund_pending"?"#eff8ff":"#fefce8"
                )}
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#6b7688",margin:"4px 0 0"}}>{ago(py.created_at)}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
