import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API, Spinner, SectionHead } from "./shared";


// ── DOCTOR LEAVE ──────────────────────────────────────────────
// Doctors block their own dates from their Availability page
// (self-service) — this just gives admin visibility into who's
// unavailable and when, without having to ask each doctor directly.
export default function DoctorLeaveOverview({ token }) {
  const { t } = useTranslation();
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const res  = await fetch(`${API}/admin/doctors-on-leave`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        setList(json.leave || []);
      } catch { setList([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const todayStr = new Date().toISOString().slice(0,10);
  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"});

  return (
    <div>
      <SectionHead title={t("adminPages.doctorLeave.heading")} count={list.length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"20px"}}>
        {t("adminPages.doctorLeave.note")}
      </p>

      {loading ? <Spinner/> : list.length === 0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>
          {t("adminPages.doctorLeave.none")}
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {list.map(l => {
            const isOngoing = l.start_date <= todayStr && l.end_date >= todayStr;
            return (
              <div key={l.id} style={{background:"#fff",
                border:`1.5px solid ${isOngoing?"#fca5a5":"#e2eaf4"}`,
                borderRadius:"12px",padding:"14px 18px",
                display:"flex",justifyContent:"space-between",alignItems:"center",
                flexWrap:"wrap",gap:"10px"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px",flexWrap:"wrap"}}>
                    <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                      {t("adminPages.doctorLeave.doctorPrefix")} {l.doctor_name}
                    </strong>
                    {l.doctor_specialization && (
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#6b7688"}}>
                        {l.doctor_specialization}
                      </span>
                    )}
                    {isOngoing && (
                      <span style={{background:"#fee2e2",color:"#dc2626",padding:"2px 10px",
                        borderRadius:"50px",fontSize:"11px",fontWeight:"700",
                        fontFamily:"'DM Sans',sans-serif"}}>
                        {t("adminPages.doctorLeave.onLeaveNow")}
                      </span>
                    )}
                  </div>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b"}}>
                    {fmt(l.start_date)} → {fmt(l.end_date)}{l.reason ? ` · ${l.reason}` : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
