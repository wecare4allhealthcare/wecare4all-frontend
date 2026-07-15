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
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.ph{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.ph *{box-sizing:border-box;}
.ph h1,.ph h2{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.ph-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:9px 12px;
  font-family:'DM Sans',sans-serif;font-size:13.5px;color:#1e293b;background:#f8fafc;outline:none;}
`;

const STATUS_META = {
  pending:          { label:"Pending",          bg:"#fef9c3", color:"#854d0e" },
  confirmed:        { label:"Confirmed",         bg:"#eff8ff", color:"#0369a1" },
  preparing:        { label:"Preparing",         bg:"#faf5ff", color:"#7c3aed" },
  out_for_delivery: { label:"Out for Delivery",  bg:"#fff7ed", color:"#c2410c" },
  delivered:        { label:"Delivered",         bg:"#f0fdf4", color:"#15803d" },
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
  const { user, logout } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("wc4a_token") : null;
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("active"); // active | all | delivered | cancelled
  const [openId,   setOpenId]   = useState(null);
  const [detail,   setDetail]   = useState(null);
  const [amount,   setAmount]   = useState("");
  const [notes,    setNotes]    = useState("");
  const [saving,   setSaving]   = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/pharmacy-portal/orders`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setOrders(json.orders || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchOrders(); }, []);

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
      await fetchOrders();
      if (openId === order.id) openOrder(order.id);
    } finally { setSaving(false); }
  };

  const cancelOrder = async (order) => {
    const name = detail?.patient?.full_name || "this patient";
    if (!window.confirm(`Cancel this order for ${name}?`)) return;
    await advance(order, "cancelled");
  };

  const filtered = orders.filter(o => {
    if (filter === "all") return true;
    if (filter === "active") return !["delivered","cancelled"].includes(o.status);
    return o.status === filter;
  });

  return (
    <div className="ph">
      <style>{G}</style>
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"28px 24px"}}>
        <div style={{maxWidth:"960px",margin:"0 auto",display:"flex",
          justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",
              letterSpacing:"2px",textTransform:"uppercase",marginBottom:"4px"}}>Pharmacy Portal</p>
            <h1 style={{fontSize:"24px",fontWeight:"700",color:"#fff",margin:0}}>
              {user?.name || "Pharmacy"}
            </h1>
          </div>
          <button onClick={logout} style={{padding:"9px 18px",borderRadius:"8px",
            background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",
            color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
            fontSize:"13px",cursor:"pointer"}}>Logout</button>
        </div>
      </div>

      <div style={{maxWidth:"960px",margin:"0 auto",padding:"28px 24px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
          {["active","all","delivered","cancelled"].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:"8px 16px",borderRadius:"8px",cursor:"pointer",
                border:filter===f?"1.5px solid #047857":"1.5px solid #e2eaf4",
                background:filter===f?"#f0fdf4":"#fff",
                color:filter===f?"#047857":"#64748b",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12.5px"}}>
              {f==="active"?"Active":f==="all"?"All":f==="delivered"?"Delivered":"Cancelled"}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <div style={{width:"30px",height:"30px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #047857",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto"}}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 0",color:"#6b7688",fontFamily:"'DM Sans',sans-serif"}}>
            No orders here right now.
          </div>
        ) : (
          filtered.map(o => {
            const meta = STATUS_META[o.status] || STATUS_META.pending;
            const isOpen = openId === o.id;
            return (
              <div key={o.id} style={{background:"#fff",border:"1px solid #e2eaf4",
                borderRadius:"14px",marginBottom:"12px",overflow:"hidden"}}>
                <div style={{padding:"16px 18px",display:"flex",justifyContent:"space-between",
                  alignItems:"center",flexWrap:"wrap",gap:"10px",cursor:"pointer"}}
                  onClick={()=>openOrder(o.id)}>
                  <div style={{minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px",flexWrap:"wrap"}}>
                      <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                        Order #{o.id.slice(-8).toUpperCase()}
                      </strong>
                      <span style={{background:meta.bg,color:meta.color,fontSize:"11px",fontWeight:"700",
                        padding:"2px 10px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>
                        {meta.label}
                      </span>
                    </div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",margin:0}}>
                      📍 {o.delivery_address}{o.delivery_city ? `, ${o.delivery_city}` : ""} · 📱 {o.contact_mobile}
                    </p>
                  </div>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
                    {isOpen ? "▲ Hide" : "▼ View"}
                  </span>
                </div>

                {isOpen && (
                  <div style={{padding:"0 18px 18px",borderTop:"1px solid #f1f5f9"}}>
                    {!detail ? (
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#6b7688",paddingTop:"14px"}}>Loading…</p>
                    ) : (
                      <>
                        <div style={{marginTop:"14px",marginBottom:"14px"}}>
                          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                            color:"#047857",letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"}}>
                            Prescribed Medicines
                          </p>
                          {(detail.prescription_items||[]).length === 0 ? (
                            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#94a3b8"}}>No items listed.</p>
                          ) : (
                            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                              {detail.prescription_items.map(item => (
                                <div key={item.id} style={{background:"#f8fafc",borderRadius:"8px",padding:"8px 12px"}}>
                                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:"#0b1f3a"}}>
                                    {item.medicine_name}
                                  </span>
                                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",marginLeft:"8px"}}>
                                    {[item.dosage, item.frequency, item.duration].filter(Boolean).join(" · ")}
                                  </span>
                                  {item.instructions && (
                                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#94a3b8",margin:"3px 0 0"}}>
                                      {item.instructions}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {detail.patient && (
                          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
                            👤 {detail.patient.full_name}
                          </p>
                        )}

                        {o.status !== "delivered" && o.status !== "cancelled" && (
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}}>
                            <div>
                              <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                                fontWeight:"600",color:"#374151",marginBottom:"4px"}} htmlFor={`amt-${o.id}`}>
                                Order Amount (₹)
                              </label>
                              <input id={`amt-${o.id}`} className="ph-inp" type="number" onWheel={e=>e.currentTarget.blur()}
                                value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Once priced"/>
                            </div>
                            <div>
                              <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
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
                                background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                                fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"12.5px",
                                cursor:saving?"wait":"pointer"}}>
                              {saving ? "Saving…" : NEXT_LABEL[o.status]}
                            </button>
                          )}
                          {["pending","confirmed","preparing"].includes(o.status) && (
                            <button disabled={saving} onClick={()=>cancelOrder(o)}
                              style={{padding:"9px 18px",borderRadius:"8px",border:"1.5px solid #fecaca",
                                background:"#fef2f2",color:"#dc2626",fontFamily:"'DM Sans',sans-serif",
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
    </div>
  );
}
