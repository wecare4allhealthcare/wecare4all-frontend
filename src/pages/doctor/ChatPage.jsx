/**
 * doctor/ChatPage.jsx — Doctor chat page
 * - List conversations (doctor-doctor + admin-doctor)
 * - Start new chat with any doctor or admin
 * - Real-time messaging
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Chat from "../Chat";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.dc{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.dc *{box-sizing:border-box;} .dc a{text-decoration:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.conv-row{display:flex;align-items:center;gap:12px;padding:13px 14px;
  border-radius:11px;cursor:pointer;transition:all .2s;margin-bottom:6px;
  background:#fff;border:1.5px solid #e2eaf4;}
.conv-row:hover{border-color:#0369a1;background:#eff8ff;}
.conv-row.active{border-color:#0369a1;background:#eff8ff;}

/* Mobile: full-screen chat panel overlays the list */
.chat-layout{display:flex;flex-direction:column;flex:1;overflow:hidden;min-height:0;}
.conv-list{overflow-y:auto;background:#fff;padding:10px;flex:1;min-height:0;}
.chat-area{position:fixed;left:0;right:0;bottom:0;top:135px;z-index:200;display:flex;flex-direction:column;background:#f8fafc;}
.conv-list-panel{display:block;}
.chat-panel-mobile-hidden{display:none;}

/* Desktop: side-by-side grid */
@media(min-width:768px){
  .chat-layout{display:grid;grid-template-columns:300px 1fr;flex:1;min-height:0;overflow:hidden;}
  .conv-list{overflow-y:auto;border-right:1px solid #e2eaf4;padding:14px;display:block !important;min-height:0;}
  .chat-area{position:relative;inset:auto;top:auto;z-index:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;}
  .conv-list-panel{display:block !important;}
  .chat-panel-mobile-hidden{display:flex !important;flex-direction:column;height:100%;overflow:hidden;min-height:0;}
}
.new-chat-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);
  z-index:1000;display:flex;align-items:flex-end;justify-content:center;}
.new-chat-box{background:#fff;width:100%;max-width:480px;
  border-radius:20px 20px 0 0;max-height:88vh;overflow-y:auto;}
@media(min-width:640px){
  .new-chat-modal{align-items:center;padding:16px;}
  .new-chat-box{border-radius:16px;}
}
.doctor-item{display:flex;align-items:center;gap:10px;padding:11px 14px;
  border-radius:9px;cursor:pointer;transition:all .2s;border:1.5px solid #e2eaf4;
  background:#fff;margin-bottom:7px;}
.doctor-item:hover{border-color:#0369a1;background:#eff8ff;}
.doctor-item.sel{border-color:#0369a1;background:#eff8ff;}
`;

function NewChatModal({ onClose, onStarted, currentUserId }) {
  const [doctors,  setDoctors]  = useState([]);
  const [admins,   setAdmins]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [selRole,  setSelRole]  = useState("doctor");
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [sending,  setSending]  = useState(false);
  const [err,      setErr]      = useState("");
  const [tab,      setTab]      = useState("doctor"); // doctor / admin
  const token = localStorage.getItem("wc4a_token");

  useEffect(() => {
    (async () => {
      try {
        const [docRes, adminRes] = await Promise.all([
          fetch(`${API}/chat/doctors`,  { headers:{ Authorization:`Bearer ${token}` }}),
          fetch(`${API}/chat/admins`,   { headers:{ Authorization:`Bearer ${token}` }}),
        ]);
        const docJson   = await docRes.json();
        const adminJson = await adminRes.json();
        setDoctors((docJson.doctors||[]).filter(d=>String(d.id)!==String(currentUserId)));
        setAdmins(adminJson.admins||[]);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const handleStart = async () => {
    setErr("");
    if (!selected) { setErr("Please select a recipient"); return; }
    if (!message.trim()) { setErr("Please enter a message"); return; }
    setSending(true);
    try {
      const res  = await fetch(`${API}/chat/conversations`, {
        method:"POST",
        headers:{"Content-Type":"application/json",
          Authorization:`Bearer ${token}`},
        body: JSON.stringify({
          recipient_id:   selected,
          recipient_role: selRole,
          subject:        subject.trim() || null,
          first_message:  message.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail||"Failed");
      onStarted(json.conversation_id);
      onClose();
    } catch(ex) { setErr(ex.message); }
    finally { setSending(false); }
  };

  return (
    <div className="new-chat-modal"
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="new-chat-box">
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#0369a1,#0284c7)",
          padding:"16px 20px",display:"flex",justifyContent:"space-between",
          alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>
            💬 New Conversation
          </h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",
            border:"none",color:"#fff",width:"32px",height:"32px",
            borderRadius:"7px",cursor:"pointer",fontSize:"18px",
            display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        <div style={{padding:"18px 20px"}}>
          {/* Tabs: Doctor / Admin */}
          <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
            {[["doctor","👨‍⚕️ Another Doctor"],["admin","⚙️ Admin"]].map(([t,l])=>(
              <button key={t} onClick={()=>{setTab(t);setSelRole(t);setSelected(null);}}
                style={{flex:1,padding:"9px",borderRadius:"9px",
                  border:"1.5px solid",cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
                  transition:"all .2s",
                  borderColor:tab===t?"#0369a1":"#e2eaf4",
                  background:tab===t?"#eff8ff":"#f8fafc",
                  color:tab===t?"#0369a1":"#64748b"}}>
                {l}
              </button>
            ))}
          </div>

          {/* Select recipient */}
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            fontWeight:"700",color:"#374151",marginBottom:"10px"}}>
            {tab==="doctor" ? "Select Doctor" : "Select Admin"}
          </p>

          {tab === "doctor" ? (
            loading ? (
              <div style={{textAlign:"center",padding:"20px"}}>
                <div style={{width:"24px",height:"24px",border:"2px solid #e2eaf4",
                  borderTop:"2px solid #0369a1",borderRadius:"50%",
                  animation:"spin .8s linear infinite",margin:"0 auto"}}/>
              </div>
            ) : doctors.length === 0 ? (
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#94a3b8",textAlign:"center",padding:"16px"}}>
                No other doctors found.
              </p>
            ) : doctors.map(d => (
              <div key={d.id}
                className={`doctor-item${selected===String(d.id)?" sel":""}`}
                onClick={()=>setSelected(String(d.id))}>
                <div style={{width:"36px",height:"36px",borderRadius:"50%",
                  background:"linear-gradient(135deg,#0369a1,#0284c7)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  flexShrink:0}}>
                  <span style={{color:"#fff",fontSize:"14px",fontWeight:"700"}}>
                    {d.full_name[0]}
                  </span>
                </div>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    fontWeight:"700",color:"#0b1f3a",margin:0}}>{d.full_name}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                    color:"#94a3b8",margin:0}}>{d.specialization||"Doctor"}</p>
                </div>
                {selected===String(d.id) && (
                  <span style={{marginLeft:"auto",color:"#0369a1",
                    fontSize:"16px"}}>✓</span>
                )}
              </div>
            ))
          ) : (
            // Admin list — fetched from /chat/admins
            loading ? (
              <div style={{textAlign:"center",padding:"20px"}}>
                <div style={{width:"24px",height:"24px",border:"2px solid #e2eaf4",
                  borderTop:"2px solid #7c3aed",borderRadius:"50%",
                  animation:"spin .8s linear infinite",margin:"0 auto"}}/>
              </div>
            ) : admins.length === 0 ? (
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#94a3b8",textAlign:"center",padding:"16px"}}>
                No admins found.
              </p>
            ) : admins.map(a => (
              <div key={a.id}
                className={`doctor-item${selected===String(a.id)?" sel":""}`}
                onClick={()=>{setSelected(String(a.id));setSelRole("admin");}}>
                <div style={{width:"36px",height:"36px",borderRadius:"50%",
                  background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:"#fff",fontSize:"14px",fontWeight:"700"}}>
                    {(a.full_name||"A")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    fontWeight:"700",color:"#0b1f3a",margin:0}}>
                    {a.full_name||"Admin"}
                  </p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                    color:"#94a3b8",margin:0}}>We Care 4 'all' Admin</p>
                </div>
                {selected===String(a.id) && (
                  <span style={{marginLeft:"auto",color:"#7c3aed",fontSize:"16px"}}>✓</span>
                )}
              </div>
            ))
          )}

          {/* Subject */}
          <div style={{marginTop:"14px"}}>
            <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
              fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="doctor-chatpage-subject-optional">
              Subject (optional)
            </label>
            <input id="doctor-chatpage-subject-optional" value={subject}
              onChange={e=>setSubject(e.target.value)}
              style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",
                padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                outline:"none",background:"#f8fafc"}}
              placeholder="e.g. Re: Patient referral / Query about appointment"/>
          </div>

          {/* Message */}
          <div style={{marginTop:"12px"}}>
            <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
              fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}} htmlFor="doctor-chatpage-message">
              Message *
            </label>
            <textarea id="doctor-chatpage-message" value={message}
              onChange={e=>setMessage(e.target.value)}
              style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",
                padding:"10px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                resize:"vertical",minHeight:"80px",outline:"none",background:"#f8fafc"}}
              placeholder="Type your message…"/>
          </div>

          {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",
            fontSize:"13px",marginTop:"8px"}}>⚠ {err}</p>}

          <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
            <button onClick={handleStart} disabled={sending}
              style={{flex:1,padding:"12px",borderRadius:"9px",border:"none",
                background:"linear-gradient(135deg,#0369a1,#0284c7)",color:"#fff",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
                cursor:"pointer",opacity:sending?0.7:1}}>
              {sending ? "Starting…" : "Start Conversation →"}
            </button>
            <button onClick={onClose}
              style={{padding:"12px 18px",borderRadius:"9px",
                border:"1.5px solid #e2eaf4",background:"#fff",
                color:"#64748b",fontFamily:"'DM Sans',sans-serif",
                fontSize:"14px",cursor:"pointer"}}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorChatPage() {
  const { user }   = useAuth();
  const [convs,    setConvs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showNew,  setShowNew]  = useState(false);
  const token     = localStorage.getItem("wc4a_token");
  const currentId = user?.id || user?.sub;

  // KEY FIX: track "have we auto-selected the first conversation yet" with a
  // ref, not by reading activeId inside fetchConvs. fetchConvs is a
  // useCallback with [token] as its only dependency (token never changes),
  // so it's created once and its closure over `activeId` is permanently
  // stuck at whatever activeId was AT THAT MOMENT — null. Every single poll
  // (every 10s) was re-checking that frozen `null` and re-running
  // setActiveId(conversations[0].id), silently snapping the selection back
  // to the top conversation no matter what the user had actually clicked.
  // A ref's .current is always read fresh, so it doesn't have this problem.
  const didAutoSelect = useRef(false);
  const listRef = useRef(null);

  const fetchConvs = useCallback(async () => {
    const scrollTop = listRef.current?.scrollTop;
    try {
      const res  = await fetch(`${API}/chat/conversations`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setConvs(json.conversations || []);
      if (!didAutoSelect.current && json.conversations?.length > 0) {
        setActiveId(json.conversations[0].id);
        didAutoSelect.current = true;
      }
      requestAnimationFrame(() => {
        if (listRef.current && scrollTop != null) listRef.current.scrollTop = scrollTop;
      });
    } catch {}
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    document.title = "Messages — We Care 4 'all'";
    fetchConvs();
    const t = setInterval(fetchConvs, 10000);
    return () => clearInterval(t);
  }, [fetchConvs]);

  const totalUnread = convs.reduce((s,c) => s+(c.unread_count||0), 0);
  const activeConv  = convs.find(c => String(c.id) === String(activeId));

  return (
    <div className="dc" style={{height:"100vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <style>{G}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0369a1,#0284c7)",
        padding:"16px 16px 20px",flexShrink:0}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",
          display:"flex",justifyContent:"space-between",
          alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
              fontWeight:"700",color:"#fff",margin:0}}>
              💬 Messages
              {totalUnread > 0 && (
                <span style={{marginLeft:"8px",background:"#dc2626",
                  color:"#fff",fontSize:"13px",fontWeight:"700",
                  padding:"2px 9px",borderRadius:"50px",verticalAlign:"middle"}}>
                  {totalUnread}
                </span>
              )}
            </h1>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
              color:"rgba(255,255,255,.6)",margin:0}}>
              Doctor consultations &amp; admin communications
            </p>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>setShowNew(true)}
              style={{padding:"9px 18px",borderRadius:"8px",
                background:"rgba(255,255,255,.15)",
                border:"1px solid rgba(255,255,255,.25)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>
              + New Chat
            </button>
            <Link to="/doctor/dashboard"
              style={{padding:"9px 16px",borderRadius:"8px",
                background:"rgba(255,255,255,.12)",
                border:"1px solid rgba(255,255,255,.22)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"500",fontSize:"13px"}}>
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="chat-layout">

        {/* Conversation list — hidden on mobile when a chat is open */}
        <div className="conv-list" ref={listRef} style={{padding:"12px",
          display: activeId ? "none" : "block"}}
          /* On desktop, always show via CSS media query override */>
          {loading ? (
            <div style={{textAlign:"center",padding:"30px 0"}}>
              <div style={{width:"24px",height:"24px",border:"2px solid #e2eaf4",
                borderTop:"2px solid #0369a1",borderRadius:"50%",
                animation:"spin .8s linear infinite",margin:"0 auto"}}/>
            </div>
          ) : convs.length === 0 ? (
            <div style={{textAlign:"center",padding:"28px 12px"}}>
              <div style={{fontSize:"32px",marginBottom:"10px"}}>💬</div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#94a3b8",marginBottom:"14px"}}>
                No conversations yet.
              </p>
              <button onClick={()=>setShowNew(true)}
                style={{padding:"10px 18px",borderRadius:"9px",border:"none",
                  background:"linear-gradient(135deg,#0369a1,#0284c7)",color:"#fff",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"13px",cursor:"pointer"}}>
                Start a Chat
              </button>
            </div>
          ) : convs.map(c => (
            <div key={c.id}
              className={`conv-row${String(activeId)===String(c.id)?" active":""}`}
              onClick={()=>setActiveId(c.id)}>
              <div style={{width:"40px",height:"40px",borderRadius:"50%",
                background: c.other_role==="admin"
                  ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                  : "linear-gradient(135deg,#0369a1,#0284c7)",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,position:"relative"}}>
                <span style={{color:"#fff",fontSize:"15px",fontWeight:"700"}}>
                  {(c.other_name||"?")[0].toUpperCase()}
                </span>
                {c.unread_count > 0 && (
                  <span style={{position:"absolute",top:"-3px",right:"-3px",
                    background:"#dc2626",color:"#fff",fontSize:"9px",
                    fontWeight:"700",width:"17px",height:"17px",
                    borderRadius:"50%",display:"flex",alignItems:"center",
                    justifyContent:"center",border:"2px solid #fff"}}>
                    {c.unread_count > 9 ? "9+" : c.unread_count}
                  </span>
                )}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"flex-start"}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    fontWeight:"700",color:"#0b1f3a",margin:"0 0 1px",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {c.other_name}
                    <span style={{marginLeft:"5px",fontSize:"10px",fontWeight:"600",
                      padding:"1px 6px",borderRadius:"50px",
                      ...(c.other_role==="admin"
                        ? {background:"#faf5ff",color:"#7c3aed"}
                        : {background:"#eff8ff",color:"#0369a1"})}}>
                      {c.other_role}
                    </span>
                  </p>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                    color:"#94a3b8",flexShrink:0,marginLeft:"6px"}}>
                    {c.last_message
                      ? new Date(c.last_message.created_at)
                          .toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})
                      : ""}
                  </span>
                </div>
                {c.subject && (
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                    color:"#0369a1",fontWeight:"600",margin:"0 0 1px",
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {c.subject}
                  </p>
                )}
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#94a3b8",margin:0,overflow:"hidden",
                  textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {c.last_message?.message || "No messages yet"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat window — full-screen on mobile, panel on desktop */}
        {activeId ? (
          <div className="chat-area" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0,flex:1}}>
            {/* Back bar — always visible, shows name on mobile */}
            <div style={{padding:"10px 14px",background:"#fff",
              borderBottom:"1px solid #e2eaf4",
              display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
              <button onClick={()=>setActiveId(null)}
                style={{background:"none",border:"none",cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                  color:"#64748b",padding:"4px 8px",borderRadius:"6px",
                  display:"flex",alignItems:"center",gap:"4px"}}>
                ← Back
              </button>
              {activeConv && (
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                  fontWeight:"700",color:"#0b1f3a",overflow:"hidden",
                  textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {activeConv.other_name}
                </span>
              )}
            </div>
            <div style={{flex:1,overflow:"hidden",minHeight:0}}>
              <Chat
                conversationId={activeId}
                currentUserId={currentId}
                otherParty={activeConv
                  ? {name:activeConv.other_name, role:activeConv.other_role}
                  : null}
                onUnreadChange={fetchConvs}
              />
            </div>
          </div>
        ) : (
          /* Desktop placeholder — hidden on mobile since list is shown */
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",
            padding:"40px",background:"#fff",flexDirection:"column",gap:"14px"}}>
            <div style={{fontSize:"48px"}}>💬</div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              color:"#94a3b8",textAlign:"center"}}>
              Select a conversation or start a new one
            </p>
            <button onClick={()=>setShowNew(true)}
              style={{padding:"11px 22px",borderRadius:"9px",border:"none",
                background:"linear-gradient(135deg,#0369a1,#0284c7)",color:"#fff",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                fontSize:"14px",cursor:"pointer"}}>
              + New Chat
            </button>
          </div>
        )}
      </div>

      {showNew && (
        <NewChatModal
          currentUserId={currentId}
          onClose={()=>setShowNew(false)}
          onStarted={(id)=>{ setActiveId(id); didAutoSelect.current = true; fetchConvs(); }}
        />
      )}
    </div>
  );
}
