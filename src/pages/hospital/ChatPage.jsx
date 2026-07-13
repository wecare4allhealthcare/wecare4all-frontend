/**
 * hospital/ChatPage.jsx — Hospital ↔ Admin Chat
 * Hospitals can message admin with queries, billing questions, etc.
 */
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Chat from "../Chat";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap');
.hc{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.hc *{box-sizing:border-box;}
@keyframes spin{to{transform:rotate(360deg)}}
.hc-row{display:flex;align-items:center;gap:11px;padding:12px 13px;
  border-radius:10px;cursor:pointer;transition:all .2s;margin-bottom:6px;
  background:#fff;border:1.5px solid #e2eaf4;}
.hc-row:hover{border-color:#047857;background:#f0fdf4;}
.hc-row.active{border-color:#047857;background:#f0fdf4;}
.hc-layout{display:flex;flex-direction:column;overflow:hidden;height:calc(100vh - 116px);}
.hc-list{overflow-y:auto;background:#fff;padding:10px;flex:1;}
.hc-chat{position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;background:#f8fafc;}
@media(min-width:768px){
  .hc-layout{display:grid;grid-template-columns:300px 1fr;height:calc(100vh - 116px);}
  .hc-list{border-right:1px solid #e2eaf4;padding:12px;}
  .hc-chat{position:relative;inset:auto;z-index:auto;}
}
`;

export default function HospitalChatPage() {
  const { user } = useAuth();
  const token     = localStorage.getItem("wc4a_token");
  const [convs,   setConvs]   = useState([]);
  const [activeId,setActiveId]= useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const autoSelected          = useRef(false);

  const fetchConvs = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/chat/threads`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      const list = json.threads || [];
      setConvs(list);
      if (!autoSelected.current && list.length > 0) {
        setActiveId(list[0].id);
        autoSelected.current = true;
      }
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchConvs();
    const t = setInterval(fetchConvs, 8000);
    return () => clearInterval(t);
  }, [fetchConvs]);

  const startChatWithAdmin = async (message) => {
    try {
      const res  = await fetch(`${API}/chat/threads`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({
          recipient_id:   "2ef5a263-b3ba-4561-a7d0-fb2dfa1554f5", // admin
          recipient_role: "admin",
          first_message:  message,
        }),
      });
      const json = await res.json();
      if (json.thread_id) {
        setActiveId(json.thread_id);
        setShowNew(false);
        autoSelected.current = true;
        fetchConvs();
      }
    } catch {}
  };

  const activeConv = convs.find(c => c.id === activeId);

  return (
    <div className="hc">
      <style>{G}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#0a2420)",
        padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h1 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"18px",fontWeight:"700",
            color:"#fff",margin:0}}>Support Chat</h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            color:"rgba(255,255,255,.6)",margin:0}}>Message WeCare4All admin team</p>
        </div>
        <button onClick={()=>setShowNew(true)}
          style={{padding:"9px 18px",borderRadius:"9px",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px"}}>
          + New Message
        </button>
      </div>

      {/* New message modal */}
      {showNew && <NewMessageModal onClose={()=>setShowNew(false)} onSend={startChatWithAdmin}/>}

      <div className="hc-layout">
        {/* Conversation list */}
        <div className="hc-list">
          {loading ? (
            <div style={{textAlign:"center",padding:"30px"}}>
              <div style={{width:"24px",height:"24px",border:"3px solid #e2eaf4",
                borderTop:"3px solid #047857",borderRadius:"50%",
                animation:"spin .8s linear infinite",margin:"0 auto"}}/>
            </div>
          ) : convs.length === 0 ? (
            <div style={{textAlign:"center",padding:"30px 16px"}}>
              <p style={{fontSize:"32px",margin:"0 0 10px"}}>💬</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"#6b7688",margin:"0 0 14px"}}>No conversations yet</p>
              <button onClick={()=>setShowNew(true)}
                style={{padding:"9px 18px",borderRadius:"9px",border:"none",cursor:"pointer",
                  background:"#047857",color:"#fff",fontFamily:"'DM Sans',sans-serif",
                  fontWeight:"700",fontSize:"13px"}}>
                Start a conversation
              </button>
            </div>
          ) : (
            convs.map(c => {
              const unread = c.unread_count || 0;
              const last   = c.last_message || "";
              return (
                <div key={c.id} className={`hc-row${activeId===c.id?" active":""}`}
                  onClick={()=>setActiveId(c.id)}>
                  <div style={{width:"40px",height:"40px",borderRadius:"50%",flexShrink:0,
                    background:"linear-gradient(135deg,#047857,#10b981)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:"'DM Sans',sans-serif",fontWeight:"700",color:"#fff",fontSize:"16px"}}>
                    W
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                      fontSize:"13.5px",color:"#0b1f3a",margin:0}}>WeCare4All Admin</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
                      color:"#6b7688",margin:0,whiteSpace:"nowrap",
                      overflow:"hidden",textOverflow:"ellipsis"}}>
                      {last || "No messages yet"}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span style={{background:"#047857",color:"#fff",borderRadius:"50%",
                      width:"20px",height:"20px",display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:"11px",fontWeight:"700",flexShrink:0}}>
                      {unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Chat area */}
        {activeId ? (
          <div className="hc-chat">
            <Chat convId={activeId} token={token} onBack={()=>setActiveId(null)}
              headerName="WeCare4All Admin" headerSub="Support Team"/>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",
            background:"#f8fafc",flexDirection:"column",gap:"12px"}}>
            <p style={{fontSize:"48px"}}>💬</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#6b7688"}}>
              Select a conversation or start a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NewMessageModal({ onClose, onSend }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const QUICK = [
    "I have a question about my subscription plan",
    "I want to upgrade my partnership tier",
    "I need help uploading banners/videos",
    "I have a billing query",
    "I want to discuss commission rates",
  ];

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    await onSend(message.trim());
    setSending(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",
      zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{background:"#fff",borderRadius:"16px",padding:"24px",
        width:"100%",maxWidth:"460px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:"16px"}}>
          <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"17px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>Message Admin Team</h3>
          <button onClick={onClose}
            style={{background:"none",border:"none",cursor:"pointer",
              fontSize:"20px",color:"#6b7688"}}>×</button>
        </div>

        {/* Quick select */}
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
          color:"#6b7688",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"1px"}}>
          Quick Topics
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"16px"}}>
          {QUICK.map((q,i)=>(
            <button key={i} onClick={()=>setMessage(q)}
              style={{padding:"9px 12px",borderRadius:"8px",textAlign:"left",cursor:"pointer",
                border:`1.5px solid ${message===q?"#047857":"#e2eaf4"}`,
                background:message===q?"#f0fdf4":"#f8fafc",
                fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:message===q?"#047857":"#475569",transition:"all .2s"}}>
              {q}
            </button>
          ))}
        </div>

        <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",fontWeight:"700",
          color:"#374151",display:"block",marginBottom:"6px"}} htmlFor="hospital-chatpage-or-type-your-message">Or type your message</label>
        <textarea id="hospital-chatpage-or-type-your-message" value={message} onChange={e=>setMessage(e.target.value)} rows={4}
          placeholder="Describe your query..."
          style={{width:"100%",padding:"10px 12px",borderRadius:"9px",
            border:"1.5px solid #e2eaf4",fontFamily:"'DM Sans',sans-serif",
            fontSize:"13px",resize:"vertical",outline:"none",
            boxSizing:"border-box",marginBottom:"16px"}}/>

        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={onClose}
            style={{flex:1,padding:"11px",borderRadius:"9px",
              border:"1.5px solid #e2eaf4",background:"#f8fafc",cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",color:"#64748b"}}>
            Cancel
          </button>
          <button onClick={send} disabled={!message.trim()||sending}
            style={{flex:2,padding:"11px",borderRadius:"9px",border:"none",
              cursor:"pointer",background:"#047857",color:"#fff",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",
              opacity:sending||!message.trim()?0.6:1}}>
            {sending?"Sending...":"Send Message →"}
          </button>
        </div>
      </div>
    </div>
  );
}
