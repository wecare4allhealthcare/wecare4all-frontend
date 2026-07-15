import { Spinner } from "./shared";
import { useTranslation } from "react-i18next";


// ── OVERVIEW (enhanced) ───────────────────────────────────────
export default function Overview({ stats, token, onNotify }) {
  const { t } = useTranslation();
  if (!stats) return <Spinner/>;
  const CARDS = [
    {label:t("adminPages.overview.cards.pending"),    value:stats.appointments.pending,   icon:"⏳",color:"#d97706",bg:"#fffbeb"},
    {label:t("adminPages.overview.cards.approved"),   value:stats.appointments.approved,  icon:"✅",color:"#047857",bg:"#f0fdf4"},
    {label:t("adminPages.overview.cards.completed"),  value:stats.appointments.completed, icon:"🏆",color:"#0369a1",bg:"#eff8ff"},
    {label:t("adminPages.overview.cards.todayNew"),   value:stats.appointments.today,     icon:"📅",color:"#7c3aed",bg:"#faf5ff"},
    {label:t("adminPages.overview.cards.doctors"),    value:stats.doctors.active,         icon:"👨‍⚕️",color:"#0b1f3a",bg:"#f0f6fc"},
    {label:t("adminPages.overview.cards.patients"),   value:stats.patients.total,         icon:"🧑‍💼",color:"#be123c",bg:"#fff1f2"},
    {label:t("adminPages.overview.cards.newContacts"),value:stats.contacts.new,          icon:"📬",color:"#b45309",bg:"#fffbeb"},
    {label:t("adminPages.overview.cards.empanelments"),value:stats.empanelments.pending,  icon:"🏥",color:"#6d28d9",bg:"#faf5ff"},
  ];
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        marginBottom:"20px",flexWrap:"wrap",gap:"10px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>{t("adminPages.overview.heading")}</h2>
        <button onClick={onNotify}
          style={{padding:"9px 18px",borderRadius:"8px",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px"}}>
          {t("adminPages.overview.sendNotification")}
        </button>
      </div>
      <div className="stat-grid-8"
        style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",
          gap:"12px",marginBottom:"24px"}}>
        {CARDS.map(({label,value,icon,color,bg})=>(
          <div key={label} className="stat-card"
            style={{background:bg,border:`1px solid ${color}20`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#64748b",margin:"0 0 5px"}}>{label}</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",
                  fontWeight:"700",color,margin:0,lineHeight:1}}>{value??0}</p>
              </div>
              <div style={{width:"38px",height:"38px",background:`${color}15`,
                borderRadius:"10px",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:"16px",flexShrink:0}}>{icon}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Revenue + patients */}
      <div style={{background:"linear-gradient(135deg,#047857,#059669)",borderRadius:"14px",
        padding:"20px 24px",display:"flex",justifyContent:"space-between",
        alignItems:"center",flexWrap:"wrap",gap:"14px"}}>
        <div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"rgba(255,255,255,.7)",margin:"0 0 4px"}}>
            {t("adminPages.overview.totalRevenue")}
          </p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"34px",
            fontWeight:"700",color:"#fff",margin:0,lineHeight:1}}>
            ₹{(stats.revenue?.total||0).toLocaleString("en-IN")}
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"rgba(255,255,255,.7)",margin:"0 0 3px"}}>
            {t("adminPages.overview.newPatientsMonth")}
          </p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",
            fontWeight:"700",color:"#a7f3d0",margin:0}}>
            {stats.patients.this_month}
          </p>
        </div>
      </div>
    </div>
  );
}
