/**
 * patient/ChatList.jsx — Patient Messages: chat with Support (always
 * available) and with doctors who've confirmed an appointment with you.
 *
 * Rewritten to match the real backend (routes/chat.py — conversation-based,
 * not appointment-based) and the fixed Chat.jsx prop contract
 * (conversationId/currentUserId/otherParty), consistent with how
 * doctor/admin ChatPage.jsx already work.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Chat from "../Chat";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.cl{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;height:100vh;overflow:hidden;display:flex;flex-direction:column;}
.cl *{box-sizing:border-box;} .cl a{text-decoration:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.conv-item{background:#fff;border:1px solid #e2eaf4;border-radius:13px;
  padding:14px 16px;cursor:pointer;transition:all .22s;display:flex;
  align-items:center;gap:12px;margin-bottom:10px;}
.conv-item:hover{border-color:#047857;box-shadow:0 4px 14px rgba(11,31,58,.08);}
.conv-item.active{border-color:#047857;background:#f0fdf4;}
.chat-panel{position:fixed;inset:0;z-index:500;background:#f0f6fc;display:flex;flex-direction:column;}
@media(min-width:768px){
  .chat-layout{display:grid;grid-template-columns:320px 1fr;flex:1;min-height:0;overflow:hidden;height:100%;}
  .conv-list{overflow-y:auto;border-right:1px solid #e2eaf4;background:#fff;padding:16px;min-height:0;}
  .chat-panel{position:relative;inset:auto;border-radius:0;display:flex;flex-direction:column;overflow:hidden;min-height:0;}
}
.support-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;
  display:flex;align-items:flex-end;justify-content:center;}
.support-box{background:#fff;width:100%;max-width:480px;border-radius:18px 18px 0 0;padding:20px;}
@media(min-width:640px){.support-modal{align-items:center;padding:16px;}.support-box{border-radius:16px;}}
`;

function SupportModal({ onClose, onStarted }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const token = localStorage.getItem("wc4a_token");

  const send = async () => {
    if (!message.trim()) { setErr("Please type a message"); return; }
    setSending(true); setErr("");
    try {
      const res = await fetch(`${API}/chat/patient/contact-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: message.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed to start chat");
      onStarted(json.conversation_id);
      onClose();
    } catch (e) { setErr(e.message); }
    finally { setSending(false); }
  };

  return (
    <div className="support-modal" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="support-box">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Contact Support
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"12px"}}>
          Our team typically responds within a few hours.
        </p>
        <textarea value={message} onChange={e=>setMessage(e.target.value)}
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"12px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",minHeight:"100px",outline:"none"}}
          placeholder="How can we help?"/>
        {err && <p style={{color:"#b91c1c",fontSize:"12px",marginTop:"6px"}}>{err}</p>}
        <button onClick={send} disabled={sending}
          style={{width:"100%",marginTop:"12px",background:"linear-gradient(135deg,#047857,#059669)",
            color:"#fff",border:"none",borderRadius:"9px",padding:"12px",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",cursor:"pointer"}}>
          {sending ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}

export default function PatientChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [convs,    setConvs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const token = localStorage.getItem("wc4a_token");

  useEffect(() => {
    document.title = "Messages — We Care 4 'all'";
    fetchConvs();
  }, []);

  useEffect(() => {
    const open = searchParams.get("open");
    if (open) setActiveId(open);
  }, [searchParams]);

  const fetchConvs = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/chat/conversations`,
        { headers:{ Authorization:`Bearer ${token}` } });
      const json = await res.json();
      setConvs(json.conversations || []);
    } catch { setConvs([]); }
    finally { setLoading(false); }
  };

  const activeConv = convs.find(c => String(c.id) === String(activeId));

  return (
    <div className="cl" style={{height:"100vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <style>{G}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",
        padding:"16px 16px 20px",flexShrink:0}}>
        <div style={{display:"flex",
          justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
              fontWeight:"700",color:"#fff",margin:0}}>
              💬 Messages
            </h1>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
              color:"rgba(255,255,255,.55)",margin:0}}>
              Support &amp; your doctors
            </p>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>setShowSupport(true)}
              style={{padding:"8px 16px",borderRadius:"8px",background:"#047857",
                border:"none",color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>
              + Contact Support
            </button>
            <Link to="/patient/dashboard"
              style={{padding:"8px 16px",borderRadius:"8px",
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

        {/* Conversation list */}
        <div className="conv-list" style={{padding:"14px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            fontWeight:"700",color:"#94a3b8",marginBottom:"12px",
            textTransform:"uppercase",letterSpacing:"1px"}}>
            Conversations ({convs.length})
          </p>

          {loading ? (
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
                borderTop:"3px solid #047857",borderRadius:"50%",
                animation:"spin .8s linear infinite",margin:"0 auto"}}/>
            </div>
          ) : convs.length === 0 ? (
            <div style={{textAlign:"center",padding:"32px 12px"}}>
              <div style={{fontSize:"36px",marginBottom:"10px"}}>💬</div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#94a3b8",marginBottom:"16px"}}>
                No messages yet. Need help, or want to ask your doctor something?
              </p>
              <button onClick={()=>setShowSupport(true)}
                style={{padding:"10px 20px",borderRadius:"9px",border:"none",
                  background:"linear-gradient(135deg,#047857,#059669)",
                  color:"#fff",fontFamily:"'DM Sans',sans-serif",
                  fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>
                Contact Support →
              </button>
            </div>
          ) : convs.map(c => (
            <div key={c.id}
              className={`conv-item${String(activeId)===String(c.id)?" active":""}`}
              onClick={() => setActiveId(c.id)}>
              <div style={{width:"42px",height:"42px",borderRadius:"50%",
                background: c.other_role==="admin"
                  ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                  : "linear-gradient(135deg,#0b1f3a,#047857)",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,position:"relative"}}>
                <span style={{color:"#fff",fontSize:"17px",fontWeight:"700"}}>
                  {(c.other_name||"?")[0]?.toUpperCase()}
                </span>
                {c.unread_count > 0 && (
                  <span style={{position:"absolute",top:"-3px",right:"-3px",
                    background:"#dc2626",color:"#fff",fontSize:"10px",
                    fontWeight:"700",width:"18px",height:"18px",
                    borderRadius:"50%",display:"flex",alignItems:"center",
                    justifyContent:"center",border:"2px solid #fff"}}>
                    {c.unread_count > 9 ? "9+" : c.unread_count}
                  </span>
                )}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"flex-start",marginBottom:"2px"}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    fontWeight:"700",color:"#0b1f3a",margin:0,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {c.other_role === "admin" ? "We Care 4 'all' Support" : c.other_name}
                  </p>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                    color:"#94a3b8",flexShrink:0,marginLeft:"6px"}}>
                    {c.last_message
                      ? new Date(c.last_message.created_at)
                          .toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})
                      : ""}
                  </span>
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#94a3b8",margin:0,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {c.last_message?.message || "No messages yet"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div className="chat-panel" style={{display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
          {activeId ? (<>
            <div style={{padding:"8px 14px",background:"#fff",
              borderBottom:"1px solid #e2eaf4",
              display:"flex",alignItems:"center",gap:"10px"}}>
              <button onClick={() => { setActiveId(null); navigate("/patient/chat", {replace:true}); }}
                style={{background:"none",border:"none",cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                  color:"#64748b",padding:"4px 8px",borderRadius:"6px"}}>
                ← Back
              </button>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                fontWeight:"600",color:"#0b1f3a"}}>
                {activeConv
                  ? (activeConv.other_role === "admin" ? "We Care 4 'all' Support" : activeConv.other_name)
                  : "Chat"}
              </span>
            </div>
            <div style={{flex:1,overflow:"hidden",minHeight:0}}>
              <Chat
                conversationId={activeId}
                currentUserId={user?.id}
                otherParty={activeConv ? {name: activeConv.other_name, role: activeConv.other_role} : null}
                onUnreadChange={fetchConvs}
              />
            </div>
          </>) : (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",
              flex:1,flexDirection:"column",padding:"40px",color:"#94a3b8",
              fontFamily:"'DM Sans',sans-serif",fontSize:"14px",textAlign:"center",
              background:"#f8fafc"}}>
              <div style={{fontSize:"40px",marginBottom:"12px"}}>💬</div>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>      </div>

      {showSupport && (
        <SupportModal
          onClose={()=>setShowSupport(false)}
          onStarted={(id)=>{ setActiveId(id); fetchConvs(); }}
        />
      )}
    </div>
  );
}
