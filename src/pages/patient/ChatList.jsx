/**
 * patient/ChatList.jsx — Patient: list of all chats + open chat
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Chat from "../Chat";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.cl{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.cl *{box-sizing:border-box;} .cl a{text-decoration:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.conv-item{background:#fff;border:1px solid #e2eaf4;border-radius:13px;
  padding:14px 16px;cursor:pointer;transition:all .22s;display:flex;
  align-items:center;gap:12px;margin-bottom:10px;}
.conv-item:hover{border-color:#047857;box-shadow:0 4px 14px rgba(11,31,58,.08);}
.conv-item.active{border-color:#047857;background:#f0fdf4;}
/* Chat panel — full screen on mobile, side panel on desktop */
.chat-panel{
  position:fixed;inset:0;z-index:500;background:#f0f6fc;
  display:flex;flex-direction:column;
}
@media(min-width:768px){
  .chat-layout{display:grid;grid-template-columns:320px 1fr;
    height:calc(100vh - 72px);gap:0;}
  .conv-list{overflow-y:auto;border-right:1px solid #e2eaf4;
    background:#fff;padding:16px;}
  .chat-panel{position:relative;inset:auto;border-radius:0;}
}
`;

export default function PatientChatList() {
  const [convs,     setConvs]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeId,  setActiveId]  = useState(null);
  const token = localStorage.getItem("wc4a_token");

  useEffect(() => {
    document.title = "Messages — We Care 4 'all'";
    fetchConvs();
  }, []);

  const fetchConvs = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/chat/conversations`,
        { headers:{ Authorization:`Bearer ${token}` } });
      const json = await res.json();
      setConvs(json.conversations || []);
      // Auto-open first conversation
      if (!activeId && json.conversations?.length > 0)
        setActiveId(json.conversations[0].appointment_id);
    } catch { setConvs([]); }
    finally { setLoading(false); }
  };

  const activeConv = convs.find(c => c.appointment_id === activeId);

  return (
    <div className="cl">
      <style>{G}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",
        padding:"16px 16px 20px",flexShrink:0}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"flex",
          justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
              fontWeight:"700",color:"#fff",margin:0}}>
              💬 Messages
            </h1>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
              color:"rgba(255,255,255,.55)",margin:0}}>
              Chat with your doctors
            </p>
          </div>
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

      {/* Layout */}
      <div className="chat-layout" style={{maxWidth:"1100px",margin:"0 auto"}}>

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
                No chats yet. Book an appointment to start chatting.
              </p>
              <Link to="/doctors" style={{padding:"10px 20px",borderRadius:"9px",
                background:"linear-gradient(135deg,#047857,#059669)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"600",fontSize:"13px"}}>
                Find a Doctor →
              </Link>
            </div>
          ) : convs.map(c => {
            const doc = c.other_party;
            return (
              <div key={c.appointment_id}
                className={`conv-item${activeId===c.appointment_id?" active":""}`}
                onClick={() => setActiveId(c.appointment_id)}>
                {/* Avatar */}
                <div style={{width:"42px",height:"42px",borderRadius:"50%",
                  background:"linear-gradient(135deg,#0b1f3a,#047857)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  flexShrink:0,position:"relative"}}>
                  <span style={{color:"#fff",fontSize:"17px",fontWeight:"700"}}>
                    {doc?.full_name?.[0]||"D"}
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
                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",
                    alignItems:"flex-start",marginBottom:"2px"}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                      fontWeight:"700",color:"#0b1f3a",margin:0,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {doc?.full_name||"Doctor"}
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
                    {c.last_message?.message || doc?.specialization || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat window */}
        {activeId ? (
          <div className="chat-panel">
            {/* Mobile back button */}
            <div style={{padding:"8px 14px",background:"#fff",
              borderBottom:"1px solid #e2eaf4",
              display:"flex",alignItems:"center",gap:"10px"}}>
              <button onClick={() => setActiveId(null)}
                style={{background:"none",border:"none",cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                  color:"#64748b",padding:"4px 8px",borderRadius:"6px"}}>
                ← Back
              </button>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                fontWeight:"600",color:"#0b1f3a"}}>
                {activeConv?.other_party?.full_name||"Chat"}
              </span>
            </div>
            <Chat
              appointmentId={activeId}
              role="patient"
              onUnreadChange={fetchConvs}
            />
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",
            padding:"40px",color:"#94a3b8",fontFamily:"'DM Sans',sans-serif",
            fontSize:"14px",textAlign:"center",background:"#fff"}}>
            <div>
              <div style={{fontSize:"40px",marginBottom:"12px"}}>💬</div>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
