/**
 * admin/ChatPage.jsx — Admin chat page (fixed)
 * Bugs fixed:
 *  1. Stale closure in fetchConvs resetting activeId every 8s → moved auto-select to separate ref
 *  2. Messages not loading → same conv_id guard as Chat.jsx
 *  3. Send button failing → caused by activeId reset during render
 *  4. Mobile responsive layout added
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Chat from "../Chat";
import { DeleteButton } from "./dashboard/shared";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.ac{font-family:'Inter',sans-serif;color:#1e293b;background:#f0f6fc;height:100svh;display:flex;flex-direction:column;overflow:hidden;}
.ac *{box-sizing:border-box;}
@keyframes spin{to{transform:rotate(360deg)}}
.conv-row{display:flex;align-items:center;gap:11px;padding:12px 13px;
  border-radius:10px;cursor:pointer;transition:all .2s;margin-bottom:6px;
  background:#fff;border:1.5px solid var(--wc-border);}
.conv-row:hover{border-color:#7c3aed;background:#faf5ff;}
.conv-row.active{border-color:#7c3aed;background:#faf5ff;}

/* Mobile: full-screen chat overlay */
.ac-chat-layout{display:flex;flex-direction:column;overflow:hidden;
  flex:1;min-height:0;}
.ac-conv-list{overflow-y:auto;background:#fff;padding:10px;flex:1;min-height:0;}
.ac-chat-area{position:fixed;inset:0;top:0;z-index:500;display:flex;
  flex-direction:column;background:var(--wc-warm-white);}

/* Desktop: side-by-side */
@media(min-width:768px){
  .ac-chat-layout{display:grid;grid-template-columns:300px 1fr;
    height:calc(100svh - 116px);min-height:0;}
  .ac-conv-list{overflow-y:auto;border-right:1px solid var(--wc-border);
    padding:12px;display:block !important;min-height:0;}
  .ac-chat-area{position:relative;inset:auto;z-index:auto;display:flex;flex-direction:column;overflow:hidden;min-height:0;}
}
.new-chat-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);
  z-index:1000;display:flex;align-items:flex-end;justify-content:center;}
.new-chat-box{background:#fff;width:100%;max-width:460px;
  border-radius:20px 20px 0 0;max-height:85vh;overflow-y:auto;}
@media(min-width:640px){
  .new-chat-modal{align-items:center;padding:16px;}
  .new-chat-box{border-radius:16px;}
}
`;

/* ── New Chat Modal (Admin → Doctor) ─────────────────────── */
function NewChatModal({ onClose, onStarted }) {
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [err,      setErr]      = useState("");
  const token = localStorage.getItem("wc4a_token");

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/chat/doctors`,
          { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        setDoctors(json.doctors || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const handleStart = async () => {
    setErr("");
    if (!selected)       { setErr("Please select a doctor"); return; }
    if (!message.trim()) { setErr("Please enter a message"); return; }
    setSending(true);
    try {
      const res  = await fetch(`${API}/chat/conversations`, {
        method:"POST",
        headers:{"Content-Type":"application/json",
          Authorization:`Bearer ${token}`},
        body: JSON.stringify({
          recipient_id:   selected,
          recipient_role: "doctor",
          subject:        subject.trim() || null,
          first_message:  message.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail||"Failed to start conversation");
      onStarted(json.conversation_id);
      onClose();
    } catch(ex) { setErr(ex.message); }
    finally { setSending(false); }
  };

  return (
    <div className="new-chat-modal"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="new-chat-box">
        <div style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
          padding:"16px 20px",display:"flex",justifyContent:"space-between",
          alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>
            📢 Message a Doctor
          </h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",
            border:"none",color:"#fff",width:"32px",height:"32px",
            borderRadius:"7px",cursor:"pointer",fontSize:"20px",
            display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        <div style={{padding:"18px 20px"}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",
            fontWeight:"700",color:"#374151",marginBottom:"10px"}}>
            Select Doctor
          </p>
          {loading ? (
            <div style={{textAlign:"center",padding:"20px"}}>
              <div style={{width:"24px",height:"24px",border:"2px solid var(--wc-border)",
                borderTop:"2px solid #7c3aed",borderRadius:"50%",
                animation:"spin .8s linear infinite",margin:"0 auto"}}/>
            </div>
          ) : doctors.length === 0 ? (
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",
              color:"#6b7688",textAlign:"center",padding:"16px"}}>
              No doctors found.
            </p>
          ) : doctors.map(d => (
            <div key={d.id}
              onClick={()=>setSelected(String(d.id))}
              style={{display:"flex",alignItems:"center",gap:"10px",
                padding:"10px 13px",borderRadius:"9px",cursor:"pointer",
                border:"1.5px solid",marginBottom:"6px",transition:"all .2s",
                borderColor:selected===String(d.id)?"#7c3aed":"var(--wc-border)",
                background:selected===String(d.id)?"#faf5ff":"#fff"}}>
              <div style={{width:"34px",height:"34px",borderRadius:"50%",
                background:"linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0}}>
                <span style={{color:"#fff",fontSize:"13px",fontWeight:"700"}}>
                  {(d.full_name||"D")[0].toUpperCase()}
                </span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",
                  fontWeight:"700",color:"var(--wc-navy)",margin:0}}>{d.full_name}</p>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                  color:"#6b7688",margin:0}}>{d.specialization||"Doctor"}</p>
              </div>
              {selected===String(d.id) &&
                <span style={{color:"#7c3aed",fontSize:"16px"}}>✓</span>}
            </div>
          ))}

          <div style={{marginTop:"14px"}}>
            <label style={{display:"block",fontFamily:"'Inter',sans-serif",
              fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="admin-chatpage-subject-optional">
              Subject (optional)
            </label>
            <input id="admin-chatpage-subject-optional" value={subject} onChange={e=>setSubject(e.target.value)}
              style={{width:"100%",border:"1.5px solid var(--wc-border)",borderRadius:"8px",
                padding:"9px 13px",fontFamily:"'Inter',sans-serif",fontSize:"13px",
                outline:"none",background:"var(--wc-warm-white)"}}
              placeholder="e.g. Schedule update / Urgent notice"/>
          </div>
          <div style={{marginTop:"10px"}}>
            <label style={{display:"block",fontFamily:"'Inter',sans-serif",
              fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="admin-chatpage-message">
              Message *
            </label>
            <textarea id="admin-chatpage-message" value={message} onChange={e=>setMessage(e.target.value)}
              style={{width:"100%",border:"1.5px solid var(--wc-border)",borderRadius:"8px",
                padding:"9px 13px",fontFamily:"'Inter',sans-serif",fontSize:"13px",
                resize:"vertical",minHeight:"80px",outline:"none",background:"var(--wc-warm-white)"}}
              placeholder="Type your message…"/>
          </div>
          {err && <p style={{fontFamily:"'Inter',sans-serif",color:"#dc2626",
            fontSize:"13px",marginTop:"8px"}}>⚠ {err}</p>}
          <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
            <button onClick={handleStart} disabled={sending}
              style={{flex:1,padding:"12px",borderRadius:"9px",border:"none",
                background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
                fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"14px",
                cursor:"pointer",opacity:sending?0.7:1}}>
              {sending?"Sending…":"Send Message →"}
            </button>
            <button onClick={onClose}
              style={{padding:"12px 16px",borderRadius:"9px",
                border:"1.5px solid var(--wc-border)",background:"#fff",
                color:"var(--wc-muted)",fontFamily:"'Inter',sans-serif",
                fontSize:"14px",cursor:"pointer"}}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Chat Page ──────────────────────────────────────── */
export default function AdminChatPage() {
  const { user }    = useAuth();
  const [convs,     setConvs]    = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [activeId,  setActiveId] = useState(null);
  const [showNew,   setShowNew]  = useState(false);
  const [filter,    setFilter]   = useState("all");
  const token      = localStorage.getItem("wc4a_token");
  const currentId  = user?.id || user?.sub;

  // ── KEY FIX: use a ref to track whether we've done the initial auto-select
  // This avoids the stale closure problem where fetchConvs always sees activeId=null
  const didAutoSelect = useRef(false);
  // Preserve scroll position in the conversation list across refetches —
  // the list re-sorts by updated_at on every poll, which without this
  // visually snapped the scrollbar back to the top mid-scroll.
  const listRef = useRef(null);

  const fetchConvs = useCallback(async () => {
    const scrollTop = listRef.current?.scrollTop;
    try {
      const res  = await fetch(`${API}/chat/admin/all`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      const list = json.conversations || [];
      setConvs(list);
      // Auto-select first conv only ONCE on initial load (using ref, not state)
      if (!didAutoSelect.current && list.length > 0) {
        setActiveId(list[0].id);
        didAutoSelect.current = true;
      }
      requestAnimationFrame(() => {
        if (listRef.current && scrollTop != null) listRef.current.scrollTop = scrollTop;
      });
    } catch {}
    finally { setLoading(false); }
  }, [token]);  // ← token only; activeId NOT in deps (avoids stale closure reset)

  useEffect(() => {
    document.title = "All Conversations — Admin | We Care 4 'all'";
    fetchConvs();
    const t = setInterval(fetchConvs, 8000);
    return () => clearInterval(t);
  }, [fetchConvs]);

  const filtered   = filter === "all" ? convs : convs.filter(c => c.type === filter);
  const activeConv = convs.find(c => String(c.id) === String(activeId));

  const getConvLabel = (c) => {
    if (!c) return "";
    if (c.type === "doctor_doctor")
      return `${c.participant1_name} ↔ ${c.participant2_name}`;
    return `Admin ↔ ${c.participant1_role==="admin"
      ? c.participant2_name : c.participant1_name}`;
  };

  const getOtherParty = (c) => {
    if (!c) return null;
    if (c.type === "doctor_doctor")
      return { name:`${c.participant1_name} & ${c.participant2_name}`, role:"doctor" };
    return {
      name: c.participant1_role==="admin" ? c.participant2_name : c.participant1_name,
      role: "doctor",
    };
  };

  return (
    <div className="ac" style={{height:"100svh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <style>{G}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))",
        padding:"14px 16px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",
          display:"flex",justifyContent:"space-between",
          alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            {/* This page (/admin/chat) is a standalone full-screen route
                outside the normal admin sidebar layout — it had no way
                back to the dashboard at all except the browser's own
                back button. */}
            <Link to="/admin/dashboard" aria-label="Back to dashboard"
              style={{width:"34px",height:"34px",borderRadius:"9px",
                background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.18)",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"#fff",fontSize:"16px",textDecoration:"none",flexShrink:0}}>
              ←
            </Link>
            <div>
              <h1 style={{fontFamily:"'Manrope',sans-serif",fontSize:"22px",
                fontWeight:"700",color:"#fff",margin:0}}>
                💬 All Conversations
              </h1>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",
                color:"rgba(255,255,255,.55)",margin:0}}>
                {convs.length} total · Doctor-Doctor &amp; Admin-Doctor
              </p>
            </div>
          </div>
          <button onClick={()=>setShowNew(true)}
            style={{padding:"9px 18px",borderRadius:"8px",
              background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
              color:"#fff",fontFamily:"'Inter',sans-serif",
              fontWeight:"600",fontSize:"13px",border:"none",cursor:"pointer"}}>
            + Message Doctor
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{background:"#fff",borderBottom:"1px solid var(--wc-border)",
        padding:"8px 16px",display:"flex",gap:"8px",overflowX:"auto"}}>
        {[["all","All"],["admin_doctor","Admin ↔ Doctor"],
          ["doctor_doctor","Doctor ↔ Doctor"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:"6px 13px",borderRadius:"8px",border:"1.5px solid",
              fontFamily:"'Inter',sans-serif",fontSize:"12px",fontWeight:"600",
              cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s",
              borderColor:filter===v?"#7c3aed":"var(--wc-border)",
              background:filter===v?"#faf5ff":"#fff",
              color:filter===v?"#7c3aed":"var(--wc-muted)"}}>
            {l}
            <span style={{marginLeft:"5px",background:filter===v?"#7c3aed":"var(--wc-border)",
              color:filter===v?"#fff":"#6b7688",fontSize:"10px",fontWeight:"700",
              padding:"1px 6px",borderRadius:"50px"}}>
              {v==="all"?convs.length:convs.filter(c=>c.type===v).length}
            </span>
          </button>
        ))}
      </div>

      {/* Layout */}
      <div className="ac-chat-layout">

        {/* Conversation list — hide on mobile when chat open */}
        <div className="ac-conv-list" ref={listRef}
          style={{display: activeId ? "none" : "block"}}>
          {loading ? (
            <div style={{textAlign:"center",padding:"30px"}}>
              <div style={{width:"24px",height:"24px",border:"2px solid var(--wc-border)",
                borderTop:"2px solid #7c3aed",borderRadius:"50%",
                animation:"spin .8s linear infinite",margin:"0 auto"}}/>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:"24px 12px"}}>
              <div style={{fontSize:"32px",marginBottom:"8px"}}>💬</div>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",
                color:"#6b7688"}}>No conversations.</p>
            </div>
          ) : filtered.map(c => (
            <div key={c.id}
              className={`conv-row${String(activeId)===String(c.id)?" active":""}`}
              onClick={()=>setActiveId(c.id)}>
              <div style={{width:"38px",height:"38px",borderRadius:"10px",
                background: c.type==="doctor_doctor"
                  ? "linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))"
                  : "linear-gradient(135deg,#7c3aed,#6d28d9)",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,fontSize:"16px"}}>
                {c.type==="doctor_doctor" ? "👨‍⚕️" : "📢"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"flex-start",marginBottom:"2px"}}>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",
                    fontWeight:"700",color:"var(--wc-navy)",margin:0,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {c.type==="doctor_doctor"
                      ? `${c.participant1_name} & ${c.participant2_name}`
                      : (c.participant1_role==="admin"
                          ? c.participant2_name
                          : c.participant1_name)}
                  </p>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:"10px",
                    color:"#6b7688",flexShrink:0,marginLeft:"5px"}}>
                    {c.last_message
                      ? new Date(c.last_message.created_at)
                          .toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})
                      : ""}
                  </span>
                </div>
                {c.subject && (
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                    color:"#7c3aed",fontWeight:"600",margin:"0 0 1px",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {c.subject}
                  </p>
                )}
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                  color:"#6b7688",margin:0,overflow:"hidden",
                  textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {c.last_message
                    ? `${c.last_message.sender_name}: ${c.last_message.message}`
                    : "No messages yet"}
                </p>
              </div>
              {c.message_count > 0 && (
                <span style={{background:"#f1f5f9",color:"var(--wc-muted)",
                  fontSize:"10px",fontWeight:"700",padding:"2px 7px",
                  borderRadius:"50px",flexShrink:0,
                  fontFamily:"'Inter',sans-serif"}}>
                  {c.message_count}
                </span>
              )}
              <DeleteButton small
                confirmText="Permanently delete this conversation and all its messages? This cannot be undone."
                onDelete={async()=>{
                  const res=await fetch(`${API}/admin/chat/conversations/${c.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
                  if(res.ok){ if(String(activeId)===String(c.id)) setActiveId(null); fetchConvs(); }
                  else alert("Couldn't delete this conversation.");
                }}/>
            </div>
          ))}
        </div>

        {/* Chat window */}
        {activeId ? (
          <div className="ac-chat-area" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0,flex:1}}>
            {/* Top bar with Back button */}
            <div style={{padding:"10px 14px",background:"#fff",
              borderBottom:"1px solid var(--wc-border)",
              display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
              <button onClick={()=>setActiveId(null)}
                aria-label="Back to conversations"
                style={{background:"#f1f5f9",border:"1px solid var(--wc-border)",cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:"600",
                  color:"#374151",padding:"7px 12px",borderRadius:"8px",
                  display:"flex",alignItems:"center",gap:"6px",flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",
                fontWeight:"600",color:"#374151",overflow:"hidden",
                textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {activeConv ? getConvLabel(activeConv) : ""}
              </span>
              {activeConv?.type === "doctor_doctor" && (
                <span style={{marginLeft:"4px",background:"#eff8ff",
                  color:"var(--wc-teal)",fontSize:"10px",fontWeight:"700",
                  padding:"2px 8px",borderRadius:"50px",flexShrink:0,
                  fontFamily:"'Inter',sans-serif"}}>
                  Doctor-Doctor
                </span>
              )}
            </div>
            <div style={{flex:1,overflow:"hidden",minHeight:0,display:"flex",flexDirection:"column"}}>
              <Chat
                conversationId={activeId}
                currentUserId={currentId}
                otherParty={getOtherParty(activeConv)}
                onUnreadChange={fetchConvs}
              />
            </div>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",
            padding:"40px",background:"#fff",flexDirection:"column",gap:"12px"}}>
            <div style={{fontSize:"44px"}}>💬</div>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",
              color:"#6b7688",textAlign:"center"}}>
              Select a conversation to view messages
            </p>
            <button onClick={()=>setShowNew(true)}
              style={{padding:"10px 20px",borderRadius:"9px",border:"none",
                background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
                fontFamily:"'Inter',sans-serif",fontWeight:"600",
                fontSize:"13px",cursor:"pointer"}}>
              + Message Doctor
            </button>
          </div>
        )}
      </div>

      {showNew && (
        <NewChatModal
          onClose={()=>setShowNew(false)}
          onStarted={(id)=>{ setActiveId(id); didAutoSelect.current = true; fetchConvs(); }}
        />
      )}
    </div>
  );
}
