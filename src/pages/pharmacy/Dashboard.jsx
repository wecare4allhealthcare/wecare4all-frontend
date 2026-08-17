/**
 * pharmacy/Dashboard.jsx — pharmacy staff's order fulfillment screen.
 * Login is handled by the shared Login.jsx (StaffTab now includes a
 * "Pharmacy" option) rather than a separate login page, matching the
 * doctor/hospital/admin pattern already in this app.
 *
 * One consolidated page (list + detail + status update) rather than
 * multiple tabs — a pharmacy's whole job here is "see orders, move
 * them along," which doesn't need the tab complexity a hospital's
 * profile/photos/billing dashboard does.
 */
import { useEffect, useState } from "react";
import PartnerDashboardShell from "../../components/PartnerDashboardShell";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.ph{font-family:'Inter',sans-serif;color:#1e293b;}
.ph *{box-sizing:border-box;}
.ph h1,.ph h2{font-family:'Manrope',sans-serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.ph-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:9px 12px;
  font-family:'Inter',sans-serif;font-size:13.5px;color:#1e293b;background:var(--wc-warm-white);outline:none;}
`;

const STATUS_META = {
  pending:          { label:"Pending",          bg:"#fef9c3", color:"#854d0e" },
  confirmed:        { label:"Confirmed",         bg:"#eff8ff", color:"var(--wc-teal)" },
  preparing:        { label:"Preparing",         bg:"#faf5ff", color:"#7c3aed" },
  out_for_delivery: { label:"Out for Delivery",  bg:"#fff7ed", color:"#c2410c" },
  delivered:        { label:"Delivered",         bg:"var(--wc-sage)", color:"#15803d" },
  cancelled:        { label:"Cancelled",         bg:"#fef2f2", color:"#991b1b" },
};
const NEXT_STATUS = {
  pending: "confirmed", confirmed: "preparing",
  preparing: "out_for_delivery", out_for_delivery: "delivered",
};
const NEXT_LABEL = {
  pending: "Confirm Order", confirmed: "Start Preparing",
  preparing: "Mark Out for Delivery", out_for_delivery: "Mark Delivered",
};

export default function PharmacyDashboard() {
  const token = typeof window !== "undefined" ? localStorage.getItem("wc4a_token") : null;
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("active"); // active | all | delivered | cancelled
  const [openId,   setOpenId]   = useState(null);
  const [detail,   setDetail]   = useState(null);
  const [amount,   setAmount]   = useState("");
  const [notes,    setNotes]    = useState("");
  const [saving,   setSaving]   = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  // Previously fetched every order ever placed with this pharmacy in
  // one request, then filtered active/delivered/cancelled entirely in
  // JS — meaning load time only ever grew over the pharmacy's
  // lifetime. Status filtering now happens server-side too (see
  // pharmacy_list_orders in routes/pharmacy.py), so `orders` IS the
  // already-filtered, already-paginated page.
  const fetchOrders = async (f = filter, p = page) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/pharmacy-portal/orders?status_filter=${f}&page=${p}&page_size=${PAGE_SIZE}`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setOrders(json.orders || []);
      setTotalPages(Math.max(1, Math.ceil((json.total||0)/PAGE_SIZE)));
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(filter, 1); setPage(1); }, [filter]);

  const openOrder = async (id) => {
    if (openId === id) { setOpenId(null); setDetail(null); return; }
    setOpenId(id); setDetail(null);
    try {
      const res  = await fetch(`${API}/pharmacy-portal/orders/${id}`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setDetail(json.order);
      setAmount(json.order.total_amount || "");
      setNotes(json.order.pharmacy_notes || "");
    } catch { /* leave detail null — the card still shows summary info */ }
  };

  const advance = async (order, newStatus) => {
    setSaving(true);
    try {
      await fetch(`${API}/pharmacy-portal/orders/${order.id}/status`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          status: newStatus,
          total_amount: amount !== "" ? parseFloat(amount) : undefined,
          pharmacy_notes: notes || undefined,
        }),
      });
      await fetchOrders(filter, page);
      if (openId === order.id) openOrder(order.id);
    } finally { setSaving(false); }
  };

  const cancelOrder = async (order) => {
    const name = detail?.patient?.full_name || "this patient";
    if (!window.confirm(`Cancel this order for ${name}?`)) return;
    await advance(order, "cancelled");
  };

  // Filtering is now server-side (see fetchOrders) — `orders` IS the
  // already-filtered page.
  const filtered = orders;

  return (
    <PartnerDashboardShell type="pharmacy" liveTabLabel="Orders">
    <div className="ph">
      <style>{G}</style>
      <div style={{maxWidth:"960px",margin:"0 auto",padding:"0"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
          {["active","all","delivered","cancelled"].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:"8px 16px",borderRadius:"8px",cursor:"pointer",
                border:filter===f?"1.5px solid var(--wc-green)":"1.5px solid var(--wc-border)",
                background:filter===f?"var(--wc-sage)":"#fff",
                color:filter===f?"var(--wc-green)":"var(--wc-muted)",
                fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"12.5px"}}>
              {f==="active"?"Active":f==="all"?"All":f==="delivered"?"Delivered":"Cancelled"}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <div style={{width:"30px",height:"30px",border:"3px solid var(--wc-border)",
              borderTop:"3px solid var(--wc-green)",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto"}}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 0",color:"#6b7688",fontFamily:"'Inter',sans-serif"}}>
            No orders here right now.
          </div>
        ) : (
          filtered.map(o => {
            const meta = STATUS_META[o.status] || STATUS_META.pending;
            const isOpen = openId === o.id;
            return (
              <div key={o.id} style={{background:"#fff",border:"1px solid var(--wc-border)",
                borderRadius:"14px",marginBottom:"12px",overflow:"hidden"}}>
                <div style={{padding:"16px 18px",display:"flex",justifyContent:"space-between",
                  alignItems:"center",flexWrap:"wrap",gap:"10px",cursor:"pointer"}}
                  onClick={()=>openOrder(o.id)}>
                  <div style={{minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px",flexWrap:"wrap"}}>
                      <strong style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-navy)"}}>
                        Order #{o.id.slice(-8).toUpperCase()}
                      </strong>
                      <span style={{background:meta.bg,color:meta.color,fontSize:"11px",fontWeight:"700",
                        padding:"2px 10px",borderRadius:"50px",fontFamily:"'Inter',sans-serif"}}>
                        {meta.label}
                      </span>
                    </div>
                    <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",color:"var(--wc-muted)",margin:0}}>
                      📍 {o.delivery_address}{o.delivery_city ? `, ${o.delivery_city}` : ""} · 📱 {o.contact_mobile}
                    </p>
                  </div>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
                    {isOpen ? "▲ Hide" : "▼ View"}
                  </span>
                </div>

                {isOpen && (
                  <div style={{padding:"0 18px 18px",borderTop:"1px solid #f1f5f9"}}>
                    {!detail ? (
                      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"#6b7688",paddingTop:"14px"}}>Loading…</p>
                    ) : (
                      <>
                        <div style={{marginTop:"14px",marginBottom:"14px"}}>
                          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",fontWeight:"700",
                            color:"var(--wc-green)",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"}}>
                            Prescribed Medicines
                          </p>
                          {detail.prescription_image_url && (
                            <div style={{marginBottom:"12px"}}>
                              <a href={detail.prescription_image_url} target="_blank" rel="noopener noreferrer"
                                style={{display:"block",border:"1px solid var(--wc-border)",borderRadius:"9px",overflow:"hidden"}}>
                                <img src={detail.prescription_image_url} alt="Prescription"
                                  style={{width:"100%",maxHeight:"260px",objectFit:"contain",display:"block",background:"var(--wc-warm-white)"}}/>
                              </a>
                              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",color:"#94a3b8",margin:"4px 0 0"}}>
                                📷 Uploaded prescription image — tap to view full size
                              </p>
                            </div>
                          )}
                          {(detail.prescription_items||[]).length === 0 ? (
                            detail.prescription_image_url ? null : (
                              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"#94a3b8"}}>No items listed.</p>
                            )
                          ) : (
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                              {detail.prescription_items.map(item => (
                                <div key={item.id} style={{background:"var(--wc-warm-white)",borderRadius:"8px",padding:"8px 12px"}}>
                                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:"700",color:"var(--wc-navy)"}}>
                                    {item.medicine_name}
                                  </span>
                                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"var(--wc-muted)",marginLeft:"8px"}}>
                                    {[item.dosage, item.frequency, item.duration].filter(Boolean).join(" · ")}
                                  </span>
                                  {item.instructions && (
                                    <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11.5px",color:"#94a3b8",margin:"3px 0 0"}}>
                                      {item.instructions}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {detail.patient && (
                          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",color:"var(--wc-muted)",marginBottom:"14px"}}>
                            👤 {detail.patient.full_name}
                          </p>
                        )}

                        {o.status !== "delivered" && o.status !== "cancelled" && (
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}}>
                            <div>
                              <label style={{display:"block",fontFamily:"'Inter',sans-serif",fontSize:"11px",
                                fontWeight:"600",color:"#374151",marginBottom:"4px"}} htmlFor={`amt-${o.id}`}>
                                Order Amount (₹)
                              </label>
                              <input id={`amt-${o.id}`} className="ph-inp" type="number" onWheel={e=>e.currentTarget.blur()}
                                value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Once priced"/>
                            </div>
                            <div>
                              <label style={{display:"block",fontFamily:"'Inter',sans-serif",fontSize:"11px",
                                fontWeight:"600",color:"#374151",marginBottom:"4px"}} htmlFor={`notes-${o.id}`}>
                                Notes (optional)
                              </label>
                              <input id={`notes-${o.id}`} className="ph-inp" value={notes}
                                onChange={e=>setNotes(e.target.value)} placeholder="e.g. substituted item"/>
                            </div>
                          </div>
                        )}

                        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                          {NEXT_STATUS[o.status] && (
                            <button disabled={saving} onClick={()=>advance(o, NEXT_STATUS[o.status])}
                              style={{padding:"9px 18px",borderRadius:"8px",border:"none",
                                background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
                                fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"12.5px",
                                cursor:saving?"wait":"pointer"}}>
                              {saving ? "Saving…" : NEXT_LABEL[o.status]}
                            </button>
                          )}
                          {["pending","confirmed","preparing"].includes(o.status) && (
                            <button disabled={saving} onClick={()=>cancelOrder(o)}
                              style={{padding:"9px 18px",borderRadius:"8px",border:"1.5px solid #fecaca",
                                background:"#fef2f2",color:"#dc2626",fontFamily:"'Inter',sans-serif",
                                fontWeight:"700",fontSize:"12.5px",cursor:saving?"wait":"pointer"}}>
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 16 }}>
          <button disabled={page <= 1 || loading}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--wc-border)", background: "#fff",
              fontSize: 12.5, cursor: page <= 1 || loading ? "not-allowed" : "pointer", opacity: page <= 1 || loading ? 0.5 : 1 }}
            onClick={() => { const p = page - 1; setPage(p); fetchOrders(filter, p); }}>← Prev</button>
          <span style={{ fontSize: 12.5, color: "var(--wc-muted)" }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages || loading}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--wc-border)", background: "#fff",
              fontSize: 12.5, cursor: page >= totalPages || loading ? "not-allowed" : "pointer", opacity: page >= totalPages || loading ? 0.5 : 1 }}
            onClick={() => { const p = page + 1; setPage(p); fetchOrders(filter, p); }}>Next →</button>
        </div>
      )}
    </div>
    </PartnerDashboardShell>
  );
}
