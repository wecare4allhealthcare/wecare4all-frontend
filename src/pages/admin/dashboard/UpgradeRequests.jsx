import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { showToast } from "../../../components/Toast";
import { confirmAction } from "../../../components/ConfirmDialog";
import { API, SectionHead } from "./shared";

export default function UpgradeRequests({ token }) {
  const { t } = useTranslation();
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
        showToast(t("adminPages.upgradeRequests.cancelApprovedToast"), "success");
      } else {
        // Upgrade or downgrade — change tier
        await fetch(`${API}/admin/hospitals/${hospitalId}`, {
          method: "PUT",
          headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          body: JSON.stringify({ tier }),
        });
        const action = type==="downgrade" ? t("adminPages.upgradeRequests.downgradedTo") : t("adminPages.upgradeRequests.upgradedTo");
        showToast(t("adminPages.upgradeRequests.tierChangeToast",{action,tier}), "success");
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
      showToast(t("adminPages.upgradeRequests.rejectedToast"), "info");
    }
    fetch_();
  };

  const pending  = list.filter(r=>r.status==="pending");
  const reviewed = list.filter(r=>r.status!=="pending");

  return (
    <div>
      <SectionHead title={t("adminPages.upgradeRequests.heading")} count={pending.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"20px"}}>
        {t("adminPages.upgradeRequests.note")}
      </p>

      {loading ? (
        <div style={{textAlign:"center",padding:"40px"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
            borderTop:"3px solid #047857",borderRadius:"50%",
            animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : pending.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>
          {t("adminPages.upgradeRequests.none")}
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
                    {r.hospital_name || t("adminPages.upgradeRequests.unknownHospital")}
                  </p>
                  <div style={{display:"flex",gap:"8px",alignItems:"center",
                    flexWrap:"wrap",marginBottom:"6px"}}>
                    <span style={{
                      background: r.type==="cancel"?"#fee2e2":r.type==="downgrade"?"#fffbeb":"#f0fdf4",
                      border: `1px solid ${r.type==="cancel"?"#fca5a5":r.type==="downgrade"?"#fde68a":"#86efac"}`,
                      color: r.type==="cancel"?"#dc2626":r.type==="downgrade"?"#92400e":"#15803d",
                      padding:"2px 10px",borderRadius:"50px",
                      fontSize:"11px",fontWeight:"700",fontFamily:"'DM Sans',sans-serif"}}>
                      {r.type==="cancel"?t("adminPages.upgradeRequests.cancelBadge")
                      :r.type==="downgrade"?t("adminPages.upgradeRequests.downgradeBadge",{tier:r.requested_tier})
                      :(r.requested_tier==="growth"?t("adminPages.upgradeRequests.upgradeBadgeGrowth"):t("adminPages.upgradeRequests.upgradeBadgeStrategic"))}
                    </span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                      color:"#6b7688"}}>
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
                <div style={{display:"flex",gap:"8px",flexShrink:0,flexWrap:"wrap"}}>
                  <button onClick={()=>review(r.id,"approved",r.hospital_id,r.requested_tier,r.type)}
                    style={{padding:"8px 18px",borderRadius:"8px",border:"none",
                      cursor:"pointer",background:"#dcfce7",color:"#15803d",
                      fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
                    {r.type==="cancel"?t("adminPages.upgradeRequests.confirmCancel"):r.type==="downgrade"?t("adminPages.upgradeRequests.approveDowngrade"):t("adminPages.upgradeRequests.approve")}
                  </button>
                  <button onClick={async()=>{
                      const ok = await confirmAction({
                        title: t("adminPages.upgradeRequests.rejectConfirmTitle",{type:r.type||t("adminPages.upgradeRequests.typeFallback")}),
                        message: t("adminPages.upgradeRequests.rejectConfirmMessage",{hospital:r.hospital_name||t("adminPages.upgradeRequests.hospitalFallback")}),
                        confirmLabel: t("adminPages.upgradeRequests.rejectConfirmLabel"),
                      });
                      if (ok) review(r.id,"rejected",r.hospital_id,r.requested_tier);
                    }}
                    style={{padding:"8px 18px",borderRadius:"8px",border:"none",
                      cursor:"pointer",background:"#fee2e2",color:"#dc2626",
                      fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
                    {t("adminPages.upgradeRequests.reject")}
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
            color:"#6b7688",textTransform:"uppercase",letterSpacing:"1px",marginBottom:"10px"}}>
            {t("adminPages.upgradeRequests.reviewed")}
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
                    color:"#6b7688",margin:0}}>
                    → {r.requested_tier} · {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span style={{
                  padding:"3px 12px",borderRadius:"50px",fontSize:"11px",fontWeight:"700",
                  fontFamily:"'DM Sans',sans-serif",
                  background: r.status==="approved" ? "#dcfce7" : "#fee2e2",
                  color:      r.status==="approved" ? "#15803d" : "#dc2626",
                }}>
                  {r.status === "approved" ? t("adminPages.upgradeRequests.approvedBadge") : t("adminPages.upgradeRequests.rejectedBadge")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
