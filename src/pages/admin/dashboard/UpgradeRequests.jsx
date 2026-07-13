import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { showToast } from "../../../components/Toast";
import { confirmAction } from "../../../components/ConfirmDialog";
import { API, SectionHead } from "./shared";

export default function UpgradeRequests({ token }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setSearchParams]   = useSearchParams();

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/upgrade-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setList(json.requests || []);
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetch_(); }, []);

  const review = async (id, status, hospitalId, tier, type="upgrade") => {
    await fetch(`${API}/admin/upgrade-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (status === "approved") {
      if (type === "cancel") {
        // Mark subscription as cancelled
        await fetch(`${API}/admin/hospitals/${hospitalId}/subscription/cancel`, {
          method: "POST",
          headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        });
        showToast("Subscription cancellation approved ✅", "success");
      } else {
        // Upgrade or downgrade — change tier
        await fetch(`${API}/admin/hospitals/${hospitalId}`, {
          method: "PUT",
          headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          body: JSON.stringify({ tier }),
        });
        const action = type==="downgrade" ? "downgraded to" : "upgraded to";
        showToast(`Hospital ${action} ${tier} ✅`, "success");
        if (type==="downgrade" || tier==="basic") {
          // For downgrade/cancel — mark subscription inactive
          await fetch(`${API}/admin/hospitals/${hospitalId}/subscription/mark-paid`, {
            method: "POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          });
        }
      }
      // Take the admin straight to Hospital Partners so the tier change
      // they just approved is immediately visible, rather than leaving
      // them staring at the (now-empty) Upgrade Requests list.
      setSearchParams({ tab: "hospitals" });
      return;
    } else {
      showToast("Request rejected — hospital notified by email", "info");
    }
    fetch_();
  };

  const pending  = list.filter(r=>r.status==="pending");
  const reviewed = list.filter(r=>r.status!=="pending");

  return (
    <div>
      <SectionHead title="Upgrade Requests" count={pending.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"20px"}}>
        Hospitals requesting plan upgrades. Approve to automatically change their tier.
      </p>

      {loading ? (
        <div style={{textAlign:"center",padding:"40px"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
            borderTop:"3px solid #047857",borderRadius:"50%",
            animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : pending.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#94a3b8",
          fontFamily:"'DM Sans',sans-serif"}}>
          No pending upgrade requests ✅
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"32px"}}>
          {pending.map(r => (
            <div key={r.id} style={{background:"#fff",border:"1.5px solid #fde68a",
              borderRadius:"12px",padding:"16px 18px",
              boxShadow:"0 2px 8px rgba(11,31,58,.06)"}}>
              <div style={{display:"flex",alignItems:"flex-start",
                justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                    fontSize:"15px",color:"#0b1f3a",margin:"0 0 4px"}}>
                    {r.hospital_name || "Unknown Hospital"}
                  </p>
                  <div style={{display:"flex",gap:"8px",alignItems:"center",
                    flexWrap:"wrap",marginBottom:"6px"}}>
                    <span style={{
                      background: r.type==="cancel"?"#fee2e2":r.type==="downgrade"?"#fffbeb":"#f0fdf4",
                      border: `1px solid ${r.type==="cancel"?"#fca5a5":r.type==="downgrade"?"#fde68a":"#86efac"}`,
                      color: r.type==="cancel"?"#dc2626":r.type==="downgrade"?"#92400e":"#15803d",
                      padding:"2px 10px",borderRadius:"50px",
                      fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif"}}>
                      {r.type==="cancel"?"❌ Cancel"
                      :r.type==="downgrade"?`⬇️ Downgrade → ${r.requested_tier}`
                      :`⬆️ Upgrade → ${r.requested_tier==="growth"?"🚀 Growth":"⭐ Strategic"}`}
                    </span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                      color:"#94a3b8"}}>
                      {new Date(r.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  {r.message && (
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                      color:"#475569",margin:0,fontStyle:"italic"}}>
                      "{r.message}"
                    </p>
                  )}
                </div>
                <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                  <button onClick={()=>review(r.id,"approved",r.hospital_id,r.requested_tier,r.type)}
                    style={{padding:"8px 18px",borderRadius:"8px",border:"none",
                      cursor:"pointer",background:"#dcfce7",color:"#15803d",
                      fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
                    {r.type==="cancel"?"✅ Confirm Cancel":r.type==="downgrade"?"✅ Approve Downgrade":"✅ Approve"}
                  </button>
                  <button onClick={async()=>{
                      const ok = await confirmAction({
                        title: `Reject this ${r.type||"upgrade"} request?`,
                        message: `${r.hospital_name||"This hospital"} will be emailed that their request wasn't approved.`,
                        confirmLabel: "Reject",
                      });
                      if (ok) review(r.id,"rejected",r.hospital_id,r.requested_tier);
                    }}
                    style={{padding:"8px 18px",borderRadius:"8px",border:"none",
                      cursor:"pointer",background:"#fee2e2",color:"#dc2626",
                      fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
            color:"#94a3b8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"10px"}}>
            Reviewed
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {reviewed.map(r => (
              <div key={r.id} style={{background:"#f8fafc",border:"1px solid #e2eaf4",
                borderRadius:"10px",padding:"12px 16px",display:"flex",
                alignItems:"center",justifyContent:"space-between",gap:"10px"}}>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                    fontSize:"13px",color:"#0b1f3a",margin:"0 0 2px"}}>
                    {r.hospital_name}
                  </p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                    color:"#94a3b8",margin:0}}>
                    → {r.requested_tier} · {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span style={{
                  padding:"3px 12px",borderRadius:"50px",fontSize:"11px",fontWeight:"700",
                  fontFamily:"'DM Sans',sans-serif",
                  background: r.status==="approved" ? "#dcfce7" : "#fee2e2",
                  color:      r.status==="approved" ? "#15803d" : "#dc2626",
                }}>
                  {r.status === "approved" ? "✅ Approved" : "✕ Rejected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
