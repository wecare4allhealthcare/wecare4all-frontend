// Shared low-level UI primitives used across most of the admin
// dashboard tab components extracted in Phase 14. Kept together in
// one file since they're all tiny and none has its own meaningful
// internal state worth a separate file.
export const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";


// Specialty icons started out as emoji-only (a plain text column). This
// renders a real <img> instead whenever the value looks like a URL —
// e.g. an icon copied from Flaticon or similar — while staying fully
// backward-compatible with every specialty that already uses an emoji.
export function SpecialtyIcon({ icon, size = 24, style = {} }) {
  const val = typeof icon === "string" ? icon.trim() : "";
  const isUrl = /^(https?:\/\/|\/)/.test(val);
  // Guards against pasted HTML (e.g. a Flaticon attribution snippet)
  // ending up literally printed on the page as text.
  const looksLikeHtml = val.startsWith("<");
  if (isUrl) {
    return <img loading="lazy" src={icon} alt="" width={size} height={size}
      style={{objectFit:"contain",flexShrink:0,...style}}/>;
  }
  return <span style={{fontSize:size,flexShrink:0,...style}}>{looksLikeHtml ? "🏥" : (icon || "🏥")}</span>;
}

const STATUSES = {
  pending:   {bg:"#fef9c3",color:"#854d0e"},
  approved:  {bg:"#dcfce7",color:"#15803d"},
  completed: {bg:"#dbeafe",color:"#1e40af"},
  cancelled: {bg:"#fee2e2",color:"#991b1b"},
  rejected:  {bg:"#fee2e2",color:"#991b1b"},
  new:       {bg:"#eff8ff",color:"#0369a1"},
  read:      {bg:"#f1f5f9",color:"#64748b"},
};

export function Badge({ status }) {
  const s = STATUSES[status]||{bg:"#f1f5f9",color:"#64748b"};
  return <span className="badge" style={{background:s.bg,color:s.color}}>{status}</span>;
}

export function Spinner() {
  return <div style={{padding:"60px 0",textAlign:"center"}}><div className="spin"/></div>;
}

export function SectionHead({ title, count, action }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
      marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
      <div>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>{title}</h2>
        {count!==undefined&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
          color:"#6b7688",margin:"2px 0 0"}}>{count} records</p>}
      </div>
      {action}
    </div>
  );
}


// ── Mini Bar Chart (pure CSS, no library) ────────────────────
export function BarChart({ data, color="#047857", title="" }) {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div>
      {title && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
        fontWeight:"700",color:"#374151",marginBottom:"8px"}}>{title}</p>}
      <div className="bar-wrap">
        {data.map((d,i)=>(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",
            alignItems:"center",minWidth:0}}>
            <div title={`${d.label}: ${d.value}`}
              className="bar"
              style={{
                width:"100%",
                height:`${Math.max((d.value/max)*100,4)}%`,
                background:`linear-gradient(180deg,${color},${color}cc)`,
              }}/>
            <div className="bar-label">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
