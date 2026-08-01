// Shared low-level UI primitives used across most of the admin
// dashboard tab components extracted in Phase 14. Kept together in
// one file since they're all tiny and none has its own meaningful
// internal state worth a separate file.
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isEmojiSupported } from "../../../utils/emojiSupport";

export const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Shared delete button for the testing-cleanup delete endpoints added
// across the admin dashboard. Native window.confirm() is deliberate
// here — this is an admin-only, irreversible hard-delete tool for
// wiping test data, not a polished end-user flow, so a plain browser
// confirm is faster to ship and unambiguous rather than a custom modal.
export function DeleteButton({ onDelete, label = "Delete", confirmText = "Delete this permanently? This cannot be undone.", small = false }) {
  const [deleting, setDeleting] = useState(false);
  const handleClick = async (e) => {
    e.stopPropagation();
    if (!window.confirm(confirmText)) return;
    setDeleting(true);
    try { await onDelete(); } finally { setDeleting(false); }
  };
  return (
    <button onClick={handleClick} disabled={deleting}
      style={{padding: small ? "6px 12px" : "9px 16px", borderRadius: "7px",
        border: "1.5px solid #fecaca", background: "#fef2f2", color: "#991b1b",
        fontFamily: "'DM Sans',sans-serif", fontWeight: "700",
        fontSize: small ? "11.5px" : "13px", cursor: deleting ? "not-allowed" : "pointer",
        opacity: deleting ? 0.6 : 1, flexShrink: 0}}>
      {deleting ? "Deleting…" : label}
    </button>
  );
}


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
  return <span style={{fontSize:size,flexShrink:0,...style}}>{looksLikeHtml ? "🏥" : (icon && isEmojiSupported(icon) ? icon : "🏥")}</span>;
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
  const { t } = useTranslation();
  const s = STATUSES[status]||{bg:"#f1f5f9",color:"#64748b"};
  return <span className="badge" style={{background:s.bg,color:s.color}}>{t(`adminPages.shared.status.${status}`, status)}</span>;
}

export function Spinner() {
  return <div style={{padding:"60px 0",textAlign:"center"}}><div className="spin"/></div>;
}

export function SectionHead({ title, count, action }) {
  const { t } = useTranslation();
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
      marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
      <div>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>{title}</h2>
        {count!==undefined&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
          color:"#6b7688",margin:"2px 0 0"}}>{t("adminPages.shared.records",{count})}</p>}
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

// Doctor Specialization field — used to be a free-text input, which is
// how doctors ended up with specialization values that don't match any
// row in the Specialties admin list (e.g. wrong casing) and made this
// field impossible to keep in sync with what's actually configured
// there. Now a dropdown sourced live from GET /admin/specialties, with
// an inline "add new" option for when the specialty genuinely isn't in
// the list yet — adds it, then selects it immediately.
export function SpecializationSelect({ value, onChange, id, style, className }) {
  const [specialties, setSpecialties] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("wc4a_token") : null;

  const load = async () => {
    try {
      const res  = await fetch(`${API}/admin/specialties`, { headers: { Authorization: `Bearer ${token}` }});
      const json = await res.json();
      setSpecialties(json.specialties || []);
    } catch { setSpecialties([]); }
  };
  useEffect(() => { load(); }, []);

  const handleChange = async (e) => {
    const v = e.target.value;
    if (v !== "__add_new__") { onChange(v); return; }
    const name = window.prompt("New specialization name (e.g. Cardiology):");
    if (!name || !name.trim()) return;
    try {
      const res  = await fetch(`${API}/admin/specialties`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.trim(), icon: "🏥", description: "", is_active: true,
          sort_order: ((specialties?.length || 0) + 1) * 10,
        }),
      });
      const json = await res.json();
      if (!res.ok) { alert(json.detail || "Couldn't add that specialization."); return; }
      await load();
      onChange(name.trim());
    } catch { alert("Network error — couldn't add that specialization."); }
  };

  if (specialties === null) {
    return <select disabled id={id} style={style} className={className}><option>Loading…</option></select>;
  }

  // A doctor's existing value might not exactly match any specialty name
  // (legacy free-text data, different casing, etc.) — surface it as its
  // own option instead of silently blanking the field out from under them.
  const hasMatch = specialties.some(s => s.name.toLowerCase() === (value || "").toLowerCase());

  return (
    <select id={id} value={value || ""} onChange={handleChange} style={style} className={className}>
      <option value="">Select…</option>
      {value && !hasMatch && <option value={value}>{value} (not in Specialties list)</option>}
      {specialties.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      <option value="__add_new__">+ Add New Specialization…</option>
    </select>
  );
}
