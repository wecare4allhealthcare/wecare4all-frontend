import { useState, useEffect } from "react";
import { API, Spinner, SectionHead } from "./shared";

export default function Announcements({ token }) {
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
    if (!message.trim()) { setErr("Message is required"); return; }
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
      if (!res.ok) throw new Error(json.detail || "Couldn't create");
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
    if (!window.confirm("Delete this announcement permanently?")) return;
    await fetch(`${API}/admin/announcements/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
    fetchList();
  };

  return (
    <div>
      <SectionHead title="Announcements" count={(list||[]).length}/>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",marginBottom:"14px"}}>
        Shown as a banner at the top of every page — public visitors, patients, doctors, and admin alike.
        Only one should typically be active at a time; turning a new one on doesn't automatically turn others off.
      </p>

      <form onSubmit={handleCreate} className="data-row" style={{marginBottom:"18px"}}>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={2}
          placeholder="e.g. We're closed on 26th January for a public holiday — bookings resume the next day."
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"10px 13px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",marginBottom:"10px"}}/>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",alignItems:"center"}}>
          <select value={type} onChange={e=>setType(e.target.value)}
            style={{border:"1.5px solid #e2eaf4",borderRadius:"8px",padding:"8px 12px",
              fontFamily:"'DM Sans',sans-serif",fontSize:"13px"}}>
            <option value="info">ℹ️ Info</option>
            <option value="warning">⚠️ Warning</option>
            <option value="urgent">🚨 Urgent</option>
          </select>
          <input type="number" onWheel={e=>e.currentTarget.blur()} value={expiresHrs} onChange={e=>setExpiresHrs(e.target.value)}
            placeholder="Auto-expire after (hours, optional)" min="1"
            style={{border:"1.5px solid #e2eaf4",borderRadius:"8px",padding:"8px 12px",
              fontFamily:"'DM Sans',sans-serif",fontSize:"13px",width:"220px"}}/>
          <button type="submit" disabled={saving} className="btn-sm btn-navy" style={{padding:"9px 18px"}}>
            {saving ? "Posting…" : "Post Announcement"}
          </button>
        </div>
        {err && <p style={{color:"#dc2626",fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif",marginTop:"8px"}}>⚠ {err}</p>}
      </form>

      {list===null ? <Spinner/> : list.length===0 ? (
        <div style={{textAlign:"center",padding:"40px",color:"#6b7688",fontFamily:"'DM Sans',sans-serif"}}>
          No announcements yet.
        </div>
      ) : list.map(a => {
        const meta = ANNOUNCE_TYPE_META[a.type] || ANNOUNCE_TYPE_META.info;
        const expired = a.expires_at && new Date(a.expires_at) < new Date();
        return (
          <div key={a.id} className="data-row" style={{opacity: a.is_active && !expired ? 1 : 0.55}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
              <div style={{flex:1,minWidth:"200px"}}>
                <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"5px",flexWrap:"wrap"}}>
                  <span className="badge" style={{background:meta.bg,color:meta.color}}>{meta.label}</span>
                  {a.is_active && !expired && <span className="badge" style={{background:"#dcfce7",color:"#15803d"}}>Live</span>}
                  {expired && <span className="badge" style={{background:"#f1f5f9",color:"#64748b"}}>Expired</span>}
                  {!a.is_active && <span className="badge" style={{background:"#f1f5f9",color:"#64748b"}}>Off</span>}
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#1e293b",margin:0}}>{a.message}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#6b7688",margin:"4px 0 0"}}>
                  Posted {new Date(a.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  {a.expires_at && ` · Expires ${new Date(a.expires_at).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}`}
                </p>
              </div>
              <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                <button onClick={()=>toggle(a.id)} className="btn-sm"
                  style={{background:a.is_active?"#fef2f2":"#dcfce7",color:a.is_active?"#991b1b":"#15803d"}}>
                  {a.is_active ? "Turn Off" : "Turn On"}
                </button>
                <button onClick={()=>remove(a.id)} className="btn-sm" style={{background:"#f1f5f9",color:"#64748b"}}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
