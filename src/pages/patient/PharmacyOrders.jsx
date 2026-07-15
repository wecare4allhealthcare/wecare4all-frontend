/**
 * patient/PharmacyOrders.jsx — "send my prescription to the pharmacy"
 * and track its delivery status. Reuses GET /appointments/my (already
 * used by the main patient Dashboard) rather than a new endpoint,
 * since that response already embeds prescription_items for completed
 * appointments — see app/routes/appointments.py.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../components/Toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.po{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.po *{box-sizing:border-box;} .po a{text-decoration:none;}
.po h1,.po h2{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.po-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;padding:16px 18px;margin-bottom:12px;}
.po-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:10px 13px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;outline:none;}
`;

const STATUS_META = {
  pending:          { label:"Order Placed",      bg:"#fef9c3", color:"#854d0e" },
  confirmed:        { label:"Confirmed",          bg:"#eff8ff", color:"#0369a1" },
  preparing:        { label:"Preparing",          bg:"#faf5ff", color:"#7c3aed" },
  out_for_delivery: { label:"Out for Delivery",   bg:"#fff7ed", color:"#c2410c" },
  delivered:        { label:"Delivered",          bg:"#f0fdf4", color:"#15803d" },
  cancelled:        { label:"Cancelled",          bg:"#fef2f2", color:"#991b1b" },
};

export default function PharmacyOrders() {
  const { user } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("wc4a_token") : null;
  const [orders,       setOrders]       = useState(null); // null = loading
  const [appointments, setAppointments] = useState([]);
  const [showForm,     setShowForm]     = useState(false);
  const [selectedAppt, setSelectedAppt] = useState("");
  const [form,          setForm]        = useState({
    delivery_address: "", delivery_city: "", delivery_pincode: "",
    contact_mobile: user?.mobile || "",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const fetchAll = async () => {
    try {
      const [ordersRes, apptRes] = await Promise.all([
        fetch(`${API}/pharmacy/orders`, { headers:{ Authorization:`Bearer ${token}` }}),
        fetch(`${API}/appointments/my`, { headers:{ Authorization:`Bearer ${token}` }}),
      ]);
      const ordersJson = await ordersRes.json();
      const apptJson   = await apptRes.json();
      setOrders(ordersJson.orders || []);
      setAppointments(apptJson.appointments || []);
    } catch { setOrders([]); }
  };
  useEffect(() => { fetchAll(); }, []);

  // Appointments that HAVE a prescription and DON'T already have an
  // active (non-cancelled) pharmacy order — those are the only ones
  // worth offering in the "send to pharmacy" picker.
  const eligible = appointments.filter(a => {
    if (a.status !== "completed" || !(a.prescription_items||[]).length) return false;
    const hasActiveOrder = (orders||[]).some(o => o.appointment_id === a.id && o.status !== "cancelled");
    return !hasActiveOrder;
  });

  const openForm = () => {
    setSelectedAppt(eligible[0]?.id || "");
    setForm({ delivery_address:"", delivery_city:"", delivery_pincode:"", contact_mobile:user?.mobile||"" });
    setErr(""); setShowForm(true);
  };

  const submit = async () => {
    if (!selectedAppt) { setErr("Please choose which prescription to send"); return; }
    if (!form.delivery_address.trim()) { setErr("Please enter your delivery address"); return; }
    if (!form.contact_mobile.trim()) { setErr("Please enter a contact number"); return; }
    setSaving(true); setErr("");
    try {
      const res  = await fetch(`${API}/pharmacy/orders`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ appointment_id: selectedAppt, ...form }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Couldn't send to pharmacy"); return; }
      showToast("Sent to pharmacy — they'll confirm shortly.", "success");
      setShowForm(false);
      fetchAll();
    } catch { setErr("Network error"); }
    finally { setSaving(false); }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Cancel this pharmacy order?")) return;
    try {
      const res = await fetch(`${API}/pharmacy/orders/${id}/cancel`, { method:"PUT", headers:{ Authorization:`Bearer ${token}` }});
      if (!res.ok) { const j = await res.json(); showToast(j.detail || "Couldn't cancel", "error"); return; }
      fetchAll();
    } catch { showToast("Network error", "error"); }
  };

  return (
    <div className="po">
      <style>{G}</style>
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"28px 24px"}}>
        <div style={{maxWidth:"760px",margin:"0 auto"}}>
          <Link to="/patient/dashboard" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"rgba(255,255,255,.6)"}}>← Dashboard</Link>
          <h1 style={{fontSize:"clamp(20px,3vw,28px)",fontWeight:"700",color:"#fff",margin:"6px 0 0"}}>
            💊 My Medicine Orders
          </h1>
        </div>
      </div>

      <div style={{maxWidth:"760px",margin:"0 auto",padding:"28px 24px"}}>
        <button onClick={openForm} disabled={eligible.length===0}
          style={{padding:"11px 22px",borderRadius:"9px",border:"none",
            background:eligible.length===0?"#e2eaf4":"linear-gradient(135deg,#047857,#059669)",
            color:eligible.length===0?"#94a3b8":"#fff",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"700",fontSize:"14px",cursor:eligible.length===0?"default":"pointer",
            marginBottom:"22px"}}>
          + Send a Prescription to Pharmacy
        </button>
        {eligible.length === 0 && orders !== null && (
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#94a3b8",
            marginTop:"-14px",marginBottom:"22px"}}>
            No completed consultations with a prescription available to send right now.
          </p>
        )}

        {showForm && (
          <div style={{position:"fixed",inset:0,background:"rgba(11,31,58,.5)",zIndex:9999,
            display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
            onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
            <div style={{background:"#fff",borderRadius:"16px",padding:"26px",width:"100%",maxWidth:"460px",
              maxHeight:"90vh",overflowY:"auto"}}>
              <h3 style={{fontSize:"19px",fontWeight:"700",color:"#0b1f3a",marginBottom:"16px"}}>
                Send to Pharmacy
              </h3>

              <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="po-appt">Prescription</label>
              <select id="po-appt" className="po-inp" style={{marginBottom:"14px"}}
                value={selectedAppt} onChange={e=>setSelectedAppt(e.target.value)}>
                {eligible.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.doctors?.full_name || "Doctor"} — {new Date(a.appointment_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  </option>
                ))}
              </select>

              <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="po-address">Delivery Address *</label>
              <textarea id="po-address" className="po-inp" rows={2} style={{marginBottom:"12px",resize:"vertical"}}
                value={form.delivery_address} onChange={e=>setForm(f=>({...f,delivery_address:e.target.value}))}
                placeholder="Door No., Street, Area, Landmark"/>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>
                <input className="po-inp" value={form.delivery_city}
                  onChange={e=>setForm(f=>({...f,delivery_city:e.target.value}))} placeholder="City"/>
                <input className="po-inp" value={form.delivery_pincode}
                  onChange={e=>setForm(f=>({...f,delivery_pincode:e.target.value}))} placeholder="Pincode"/>
              </div>

              <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="po-mobile">Contact Mobile *</label>
              <input id="po-mobile" className="po-inp" style={{marginBottom:"16px"}}
                value={form.contact_mobile} onChange={e=>setForm(f=>({...f,contact_mobile:e.target.value}))}
                placeholder="90XXXXXXXX"/>

              {err && <p style={{color:"#dc2626",fontSize:"12.5px",marginBottom:"12px"}}>⚠ {err}</p>}

              <div style={{display:"flex",gap:"10px"}}>
                <button onClick={()=>setShowForm(false)}
                  style={{flex:1,padding:"11px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
                    background:"#f8fafc",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                    fontSize:"13px",color:"#64748b",cursor:"pointer"}}>Cancel</button>
                <button onClick={submit} disabled={saving}
                  style={{flex:1,padding:"11px",borderRadius:"9px",border:"none",cursor:saving?"not-allowed":"pointer",
                    background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                    fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",opacity:saving?0.7:1}}>
                  {saving ? "Sending…" : "Send Order →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {orders === null ? (
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <div style={{width:"30px",height:"30px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #047857",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto"}}/>
          </div>
        ) : orders.length === 0 ? (
          <div style={{textAlign:"center",padding:"40px 20px",color:"#6b7688",fontFamily:"'DM Sans',sans-serif"}}>
            No medicine orders yet.
          </div>
        ) : (
          orders.map(o => {
            const meta = STATUS_META[o.status] || STATUS_META.pending;
            return (
              <div key={o.id} className="po-card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  flexWrap:"wrap",gap:"8px",marginBottom:"6px"}}>
                  <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                    Order #{o.id.slice(-8).toUpperCase()}
                  </strong>
                  <span style={{background:meta.bg,color:meta.color,fontSize:"11px",fontWeight:"700",
                    padding:"3px 10px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>
                    {meta.label}
                  </span>
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",margin:"0 0 4px"}}>
                  📍 {o.delivery_address}{o.delivery_city ? `, ${o.delivery_city}` : ""}
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#94a3b8",margin:0}}>
                  Placed {new Date(o.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  {o.total_amount ? ` · ₹${o.total_amount}` : ""}
                </p>
                {["pending","confirmed"].includes(o.status) && (
                  <button onClick={()=>cancelOrder(o.id)}
                    style={{marginTop:"10px",padding:"7px 14px",borderRadius:"7px",
                      background:"#fef2f2",border:"1px solid #fecaca",color:"#991b1b",
                      fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                    Cancel Order
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
