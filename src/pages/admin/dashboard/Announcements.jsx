import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API, Spinner, SectionHead } from "./shared";

// Accidentally left behind in the pre-split admin/Dashboard.jsx during
// the Phase 14 file split — same class of bug as SPECS/INFRA/ACCREDS
// in EmpanelForm.jsx, found the same way (ESLint's no-undef rule,
// Phase 20). Restored exactly as it was in the original file.
const ANNOUNCE_TYPE_META_COLORS = {
  info:    { color: "#0369a1", bg: "#eff8ff" },
  warning: { color: "#b45309", bg: "#fffbeb" },
  urgent:  { color: "#dc2626", bg: "#fef2f2" },
};

export default function Announcements({ token }) {
  const { t } = useTranslation();
  const [list,    setList]    = useState(null);
  const [message, setMessage] = useState("");
  const [type,    setType]    = useState("info");
  const [expiresHrs, setExpiresHrs] = useState(""); // empty = no auto-expiry
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const fetchList = async () => {
    try {
      const res  = await fetch(`${API}/admin/announcements`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setList(json.announcements || []);
    } catch { setList([]); }
  };
  useEffect(() => { fetchList(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setErr("");
    if (!message.trim()) { setErr(t("adminPages.announcements.messageRequired")); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/announcements`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          message: message.trim(), type,
          expires_in_hours: expiresHrs ? parseInt(expiresHrs) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || t("adminPages.announcements.createFailed"));
      setMessage(""); setExpiresHrs(""); setType("info");
      fetchList();
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  };

  const toggle = async (id) => {
    await fetch(`${API}/admin/announcements/${id}/toggle`, { method:"PUT", headers:{ Authorization:`Bearer ${token}` }});
    fetchList();
  };
  const remove = async (id) => {
    if (!window.confirm(t("adminPages.announcements.confirmDelete"))) return;
    await fetch(`${API}/admin/announcements/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    fetchList();
  };

  return (
    <div>
      <SectionHead title={t("adminPages.announcements.heading")} count={(list||[]).length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
        {t("adminPages.announcements.note")}
      </p>

      <form onSubmit={handleCreate} className="data-row" style={{marginBottom:"18px"}}>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={2}
          placeholder={t("adminPages.announcements.messagePlaceholder")}
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"10px 13px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",marginBottom:"10px"}}/>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
          <select value={type} onChange={e=>setType(e.target.value)}
            style={{border:"1.5px solid #e2eaf4",borderRadius:"8px",padding:"8px 12px",
              fontFamily:"'DM Sans',sans-serif",fontSize:"13px"}}>
            <option value="info">{t("adminPages.announcements.optionInfo")}</option>
            <option value="warning">{t("adminPages.announcements.optionWarning")}</option>
            <option value="urgent">{t("adminPages.announcements.optionUrgent")}</option>
          </select>
          <input type="number" onWheel={e=>e.currentTarget.blur()} value={expiresHrs} onChange={e=>setExpiresHrs(e.target.value)}
            placeholder={t("adminPages.announcements.expiresPlaceholder")} min="1"
            style={{border:"1.5px solid #e2eaf4",borderRadius:"8px",padding:"8px 12px",
              fontFamily:"'DM Sans',sans-serif",fontSize:"13px",width:"220px"}}/>
          <button type="submit" disabled={saving} className="btn-sm btn-navy" style={{padding:"9px 18px"}}>
            {saving ? t("adminPages.announcements.posting") : t("adminPages.announcements.postBtn")}
          </button>
        </div>
        {err && <p style={{color:"#dc2626",fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif",marginTop:"8px"}}>⚠ {err}</p>}
      </form>

      {list===null ? <Spinner/> : list.length===0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#6b7688",fontFamily:"'DM Sans',sans-serif"}}>
          {t("adminPages.announcements.none")}
        </div>
      ) : list.map(a => {
        const meta = ANNOUNCE_TYPE_META_COLORS[a.type] || ANNOUNCE_TYPE_META_COLORS.info;
        const metaLabel = t(`adminPages.announcements.types.${a.type}`, a.type);
        const expired = a.expires_at && new Date(a.expires_at) < new Date();
        return (
          <div key={a.id} className="data-row" style={{opacity: a.is_active && !expired ? 1 : 0.55}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
              <div style={{flex:1,minWidth:"200px"}}>
                <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"5px",flexWrap:"wrap"}}>
                  <span className="badge" style={{background:meta.bg,color:meta.color}}>{metaLabel}</span>
                  {a.is_active && !expired && <span className="badge" style={{background:"#dcfce7",color:"#15803d"}}>{t("adminPages.announcements.live")}</span>}
                  {expired && <span className="badge" style={{background:"#f1f5f9",color:"#64748b"}}>{t("adminPages.announcements.expired")}</span>}
                  {!a.is_active && <span className="badge" style={{background:"#f1f5f9",color:"#64748b"}}>{t("adminPages.announcements.off")}</span>}
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#1e293b",margin:0}}>{a.message}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#6b7688",margin:"4px 0 0"}}>
                  {t("adminPages.announcements.posted",{date:new Date(a.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})})}
                  {a.expires_at && t("adminPages.announcements.expires",{date:new Date(a.expires_at).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})})}
                </p>
              </div>
              <div style={{display:"flex",gap:"8px",flexShrink:0,flexWrap:"wrap"}}>
                <button onClick={()=>toggle(a.id)} className="btn-sm"
                  style={{background:a.is_active?"#fef2f2":"#dcfce7",color:a.is_active?"#991b1b":"#15803d"}}>
                  {a.is_active ? t("adminPages.announcements.turnOff") : t("adminPages.announcements.turnOn")}
                </button>
                <button onClick={()=>remove(a.id)} className="btn-sm" style={{background:"#f1f5f9",color:"#64748b"}}>
                  {t("adminPages.announcements.delete")}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
