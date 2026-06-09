/**
 * patient/PaymentHistory.jsx — Phase C
 * Shows all patient payments with status, amount, appointment details
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.ph{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.ph *{box-sizing:border-box;} .ph a{text-decoration:none;}
.ph h1,.ph h2{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.pay-card{background:#fff;border:1px solid #e2eaf4;border-radius:13px;
  padding:16px;margin-bottom:12px;transition:all .22s;}
.pay-card:hover{box-shadow:0 6px 20px rgba(11,31,58,.09);}
`;

const STATUS = {
  paid:    {bg:"#dcfce7",color:"#15803d",label:"✅ Paid"},
  created: {bg:"#fef9c3",color:"#854d0e",label:"⏳ Pending"},
  failed:  {bg:"#fee2e2",color:"#991b1b",label:"❌ Failed"},
};

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);

  useEffect(() => {
    document.title = "Payment History — We Care 4 'all'";
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/payments/my`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json  = await res.json();
      const data  = json.payments || [];
      setPayments(data);
      setTotal(data.filter(p=>p.status==="paid")
        .reduce((s,p) => s + (p.amount||0)/100, 0));
    } catch { setPayments([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="ph">
      <style>{G}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",
        padding:"20px 16px 24px"}}>
        <div style={{maxWidth:"720px",margin:"0 auto",
          display:"flex",justifyContent:"space-between",
          alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.5)",marginBottom:"3px",
              textTransform:"uppercase",letterSpacing:"1px"}}>
              Patient Portal
            </p>
            <h1 style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:"700",
              color:"#fff",margin:0}}>
              Payment History
            </h1>
          </div>
          <Link to="/patient/dashboard" style={{padding:"9px 18px",borderRadius:"8px",
            background:"rgba(255,255,255,.12)",
            border:"1px solid rgba(255,255,255,.22)",
            color:"#fff",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"500",fontSize:"13px"}}>
            ← Dashboard
          </Link>
        </div>
      </div>

      <div style={{maxWidth:"720px",margin:"0 auto",padding:"20px 14px 40px"}}>
        {/* Summary */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",
          marginBottom:"20px"}}>
          {[["💰 Total Paid",  `₹${total.toLocaleString("en-IN")}`, "#047857"],
            ["📋 Transactions", payments.length,                    "#0369a1"],
          ].map(([l,v,c])=>(
            <div key={l} style={{background:"#fff",border:"1px solid #e2eaf4",
              borderRadius:"12px",padding:"16px",textAlign:"center"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#94a3b8",margin:"0 0 5px"}}>{l}</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",
                fontWeight:"700",color:c,margin:0,lineHeight:1}}>{v}</p>
            </div>
          ))}
        </div>

        {/* Payment list */}
        {loading ? (
          <div style={{textAlign:"center",padding:"48px 0"}}>
            <div style={{width:"32px",height:"32px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #047857",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8"}}>
              Loading payments…
            </p>
          </div>
        ) : payments.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px 20px",background:"#fff",
            borderRadius:"14px",border:"1px solid #e2eaf4"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>💳</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",
              marginBottom:"8px"}}>No Payments Yet</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              color:"#64748b",marginBottom:"18px"}}>
              Book a consultation to get started.
            </p>
            <Link to="/doctors" style={{padding:"11px 22px",borderRadius:"9px",
              background:"linear-gradient(135deg,#047857,#059669)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"600",fontSize:"14px"}}>
              Find a Doctor →
            </Link>
          </div>
        ) : payments.map(p => {
          const s   = STATUS[p.status] || STATUS.created;
          const amt = (p.amount||0)/100;
          const appt= p.appointments;
          return (
            <div key={p.id} className="pay-card">
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"flex-start",flexWrap:"wrap",gap:"8px"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",
                    marginBottom:"6px",flexWrap:"wrap"}}>
                    <strong style={{fontFamily:"'DM Sans',sans-serif",
                      fontSize:"14px",color:"#0b1f3a"}}>
                      {appt?.patient_name || "Consultation"}
                    </strong>
                    <span style={{background:s.bg,color:s.color,
                      fontSize:"11px",fontWeight:"700",padding:"2px 9px",
                      borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
                    {[["📅",appt?.appointment_date
                        ? new Date(appt.appointment_date).toLocaleDateString("en-IN",
                            {day:"numeric",month:"short",year:"numeric"})
                        : ""],
                      ["🔖",p.razorpay_payment_id
                        ? p.razorpay_payment_id.slice(-8)
                        : p.razorpay_order_id?.slice(-8) || "—"],
                      ["📆",new Date(p.created_at).toLocaleDateString("en-IN",
                          {day:"numeric",month:"short",year:"numeric"})],
                    ].map(([ic,v])=>v&&(
                      <span key={ic} style={{fontFamily:"'DM Sans',sans-serif",
                        fontSize:"12px",color:"#64748b"}}>
                        {ic} {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",
                    fontSize:"22px",fontWeight:"700",
                    color: p.status==="paid" ? "#047857" : "#94a3b8",
                    margin:0,lineHeight:1}}>
                    ₹{amt.toLocaleString("en-IN")}
                  </p>
                  {p.status!=="paid" && appt?.id &&
                    <Link to={`/patient/payment/${appt.id}`}
                      style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                        color:"#047857",fontWeight:"600",marginTop:"4px",
                        display:"block"}}>
                      Pay Now →
                    </Link>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
