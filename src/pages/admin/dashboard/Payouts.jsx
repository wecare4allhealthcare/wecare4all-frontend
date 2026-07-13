import { useState, useEffect } from "react";
import { API, Spinner, SectionHead } from "./shared";


// ── DOCTOR PAYOUTS ───────────────────────────────────────────
export default function Payouts({ token }) {
  const [data,setData]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("pending");
  const [settling,setSettling]=useState(null);
  const [ref,setRef]=useState("");

  const fetchData=async(f=filter)=>{
    setLoading(true);
    try{
      const res=await fetch(`${API}/admin/payouts?status=${f}`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json=await res.json();
      setData(json.payouts||[]);
    }catch{setData([]);}
    finally{setLoading(false);}
  };
  useEffect(()=>{fetchData();},[]);

  const settle=async(id)=>{
    try{
      await fetch(`${API}/admin/payouts/${id}/settle`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({payout_reference:ref,payout_method:"bank_transfer"}),
      });
      setSettling(null); setRef("");
      fetchData();
    }catch{}
  };

  const totalPending = data.filter(p=>p.status==="pending")
    .reduce((s,p)=>s+(p.payout_amount||0),0);

  return(
    <div>
      <SectionHead title="Doctor Payouts" count={data.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
        color:"#64748b",marginBottom:"14px",lineHeight:"1.6"}}>
        Patients pay into your Razorpay account directly — this is a manual
        ledger of what's owed to each doctor after a completed, paid
        appointment. Settling here just records that you've paid them
        outside the platform (bank transfer, UPI, etc); it doesn't move
        money automatically.
      </p>
      {filter==="pending" && totalPending>0 && (
        <div style={{background:"#fef9c3",border:"1px solid #fde68a",
          borderRadius:"10px",padding:"12px 16px",marginBottom:"14px"}}>
          <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#854d0e"}}>
            ₹{totalPending.toLocaleString("en-IN")} pending across {data.filter(p=>p.status==="pending").length} payout(s)
          </strong>
        </div>
      )}
      <div className="filter-bar">
        {["pending","paid"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);fetchData(f);}}
            className={`fchip${filter===f?" on":""}`}>{f}</button>
        ))}
      </div>
      {loading?<Spinner/>:data.length===0?(
        <div style={{textAlign:"center",padding:"60px",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>No {filter} payouts.</div>
      ):data.map(p=>(
        <div key={p.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
            <div>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                {p.doctors?.full_name || "—"}
              </strong>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginTop:"4px"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>
                  Patient: {p.appointments?.patient_name||"—"} · {p.appointments?.appointment_date||""}
                </span>
              </div>
              <div style={{display:"flex",gap:"16px",flexWrap:"wrap",marginTop:"6px"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688"}}>
                  Gross: ₹{p.gross_amount}
                </span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688"}}>
                  Platform fee: ₹{p.platform_fee}
                </span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:"#047857"}}>
                  Payout: ₹{p.payout_amount}
                </span>
              </div>
              {p.status==="paid" && p.payout_reference && (
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#6b7688",margin:"4px 0 0"}}>Ref: {p.payout_reference}</p>
              )}
            </div>
            <div>
              {p.status==="pending" ? (
                settling===p.id ? (
                  <div style={{display:"flex",gap:"6px"}}>
                    <input value={ref} onChange={e=>setRef(e.target.value)}
                      placeholder="UTR / reference" className="ad-inp"
                      style={{width:"140px",padding:"6px 10px",fontSize:"12px"}}/>
                    <button className="btn-sm btn-green" onClick={()=>settle(p.id)}>Confirm</button>
                    <button className="btn-sm" onClick={()=>setSettling(null)}
                      style={{background:"#f1f5f9",color:"#64748b"}}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn-sm btn-green" onClick={()=>setSettling(p.id)}>
                    Mark Paid
                  </button>
                )
              ) : (
                <span className="badge" style={{background:"#dcfce7",color:"#15803d"}}>Paid</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
