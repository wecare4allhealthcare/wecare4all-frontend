/**
 * Chat.jsx — Shared message-thread component, used by doctor/admin/patient
 * chat pages. Polls for new messages every 3 seconds — simple, reliable,
 * no WebSocket infrastructure needed at this scale.
 *
 * NOTE: this used to take `appointmentId`/`role` props and fetch
 * `/chat/{appointmentId}` — neither of those match what the backend
 * (routes/chat.py) or its actual callers (doctor/admin ChatPage.jsx) use.
 * The real contract, matching both of those, is:
 *
 *   <Chat conversationId={id} currentUserId={myId} otherParty={{name,role}} onUnreadChange={fn} />
 *
 * backed by GET/POST /chat/conversations/{conversationId}.
 */
import { useEffect, useRef, useState, useCallback } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.chat-wrap{font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;
  height:100%;background:#f0f6fc;overflow:hidden;min-height:0;}
.chat-wrap *{box-sizing:border-box;}
.chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;
  flex-direction:column;gap:10px;min-height:0;overscroll-behavior:contain;}
.chat-msgs::-webkit-scrollbar{width:4px;}
.chat-msgs::-webkit-scrollbar-thumb{background:#e2eaf4;border-radius:4px;}
.bubble{max-width:78%;padding:10px 14px;border-radius:16px;
  font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.55;
  word-break:break-word;position:relative;}
.bubble.mine{background:linear-gradient(135deg,#047857,#059669);color:#fff;
  border-bottom-right-radius:4px;align-self:flex-end;}
.bubble.theirs{background:#fff;color:#1e293b;border:1px solid #e2eaf4;
  border-bottom-left-radius:4px;align-self:flex-start;}
.bubble-time{font-size:10px;opacity:.65;margin-top:4px;display:block;}
.bubble.mine .bubble-time{text-align:right;}
.chat-input-bar{
  display:flex;align-items:flex-end;gap:8px;padding:12px 14px;
  background:#fff;border-top:1px solid #e2eaf4;
}
.chat-inp{
  flex:1;border:1.5px solid #e2eaf4;border-radius:22px;
  padding:10px 16px;font-family:'DM Sans',sans-serif;
  font-size:14px;resize:none;outline:none;max-height:100px;
  transition:border-color .2s;line-height:1.4;
}
.chat-inp:focus{border-color:#047857;}
.send-btn{
  width:42px;height:42px;border-radius:50%;border:none;cursor:pointer;
  background:linear-gradient(135deg,#047857,#059669);
  color:#fff;font-size:18px;display:flex;align-items:center;
  justify-content:center;flex-shrink:0;transition:all .2s;
}
.send-btn:hover{transform:scale(1.08);}
.send-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.date-divider{text-align:center;margin:8px 0;}
.date-divider span{background:#e2eaf4;color:#6b7688;font-size:11px;
  padding:3px 12px;border-radius:50px;font-family:'DM Sans',sans-serif;}
`;

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
}
function formatDate(iso) {
  if (!iso) return "";
  const d   = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yes = new Date(now); yes.setDate(now.getDate()-1);
  if (d.toDateString() === yes.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", {day:"numeric",month:"short"});
}

export default function Chat({ conversationId, currentUserId, otherParty, onUnreadChange }) {
  const [messages, setMessages]   = useState([]);
  const [input,    setInput]      = useState("");
  const [sending,  setSending]    = useState(false);
  const [loading,  setLoading]    = useState(true);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);
  const token     = localStorage.getItem("wc4a_token");

  const fetchMessages = useCallback(async (silent=false) => {
    if (!conversationId) return;
    if (!silent) setLoading(true);
    try {
      const res  = await fetch(`${API}/chat/conversations/${conversationId}`,
        { headers:{ Authorization:`Bearer ${token}` } });
      const json = await res.json();
      if (res.ok) {
        const incoming = json.messages || [];
        setMessages(prev => {
          // Only tell the parent (which refetches + re-sorts its whole
          // conversation list) when something actually changed. Without
          // this, every 3-second poll fired that refresh unconditionally,
          // which kept reordering/re-rendering the list — and resetting
          // anyone's scroll position in it — the entire time a chat was
          // simply left open, whether new messages had arrived or not.
          if (onUnreadChange && incoming.length !== prev.length) onUnreadChange();
          return incoming;
        });
      }
    } catch {}
    finally { if (!silent) setLoading(false); }
  }, [conversationId, token]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(() => fetchMessages(true), 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  const msgsRef = useRef(null);

  useEffect(() => {
    const el = msgsRef.current;
    if (!el) return;
    // Only auto-scroll if user is within 120px of bottom (WhatsApp behavior)
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Always scroll to bottom on initial load
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }, 100);
  }, [conversationId]);

  const handleSend = async () => {
    const txt = input.trim();
    if (!txt || sending || !conversationId) return;
    setSending(true);
    const temp = {
      id: `tmp-${Date.now()}`, message:txt, sender_id: currentUserId,
      created_at:new Date().toISOString(), is_read:false, temp:true,
    };
    setMessages(p => [...p, temp]);
    setInput("");
    try {
      const res  = await fetch(`${API}/chat/conversations/${conversationId}`, {
        method:"POST",
        headers:{"Content-Type":"application/json",
          Authorization:`Bearer ${token}`},
        body: JSON.stringify({ message: txt }),
      });
      if (res.ok) {
        fetchMessages(true);
      } else {
        setMessages(p => p.filter(m => m.id !== temp.id));
        setInput(txt);
      }
    } catch {
      setMessages(p => p.filter(m => m.id !== temp.id));
      setInput(txt);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  let lastDate = "";

  return (
    <div className="chat-wrap" style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",minHeight:0}}>
      <style>{G}</style>

      {otherParty && (
        <div style={{padding:"12px 16px",background:"#fff",
          borderBottom:"1px solid #e2eaf4",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"38px",height:"38px",borderRadius:"50%",
              background:"linear-gradient(135deg,#0b1f3a,#047857)",
              display:"flex",alignItems:"center",justifyContent:"center",
              flexShrink:0}}>
              <span style={{color:"#fff",fontSize:"16px",fontWeight:"700"}}>
                {(otherParty.name||"?")[0]?.toUpperCase()}
              </span>
            </div>
            <div style={{minWidth:0}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                fontWeight:"700",color:"#0b1f3a",margin:0,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {otherParty.name}
              </p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#6b7688",margin:0,textTransform:"capitalize"}}>
                {otherParty.role}
              </p>
            </div>
            <div style={{marginLeft:"auto",flexShrink:0}}>
              <span style={{background:"#f0fdf4",border:"1px solid #86efac",
                color:"#15803d",fontSize:"10px",fontWeight:"700",
                padding:"3px 10px",borderRadius:"50px",
                fontFamily:"'DM Sans',sans-serif"}}>
                🟢 Chat Active
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="chat-msgs" ref={msgsRef} style={{flex:1,overflowY:"auto",minHeight:0,padding:"14px",display:"flex",flexDirection:"column",gap:"10px",overscrollBehavior:"contain"}}>
        {loading && messages.length === 0 ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #047857",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto 10px"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6b7688",fontSize:"13px"}}>
              Loading messages…
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:"36px",marginBottom:"10px"}}>💬</div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              color:"#6b7688"}}>
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const mine    = String(msg.sender_id) === String(currentUserId);
            const msgDate = formatDate(msg.created_at);
            const showDiv = msgDate !== lastDate;
            lastDate      = msgDate;
            return (
              <div key={msg.id}>
                {showDiv && (
                  <div className="date-divider">
                    <span>{msgDate}</span>
                  </div>
                )}
                <div style={{display:"flex",
                  justifyContent: mine ? "flex-end" : "flex-start"}}>
                  {!mine && (
                    <div style={{width:"28px",height:"28px",borderRadius:"50%",
                      background:"#e2eaf4",display:"flex",alignItems:"center",
                      justifyContent:"center",flexShrink:0,marginRight:"6px",
                      alignSelf:"flex-end",fontSize:"12px",fontWeight:"700",
                      color:"#64748b"}}>
                      {(msg.sender_name||otherParty?.name||"?")[0]}
                    </div>
                  )}
                  <div className={`bubble ${mine?"mine":"theirs"}`}
                    style={{opacity: msg.temp ? 0.7 : 1}}>
                    {!mine && msg.sender_name && (
                      <span style={{fontSize:"11px",fontWeight:"700",
                        color:"#047857",display:"block",marginBottom:"3px"}}>
                        {msg.sender_name}
                      </span>
                    )}
                    <span style={{whiteSpace:"pre-wrap"}}>{msg.message}</span>
                    <span className="bubble-time">
                      {formatTime(msg.created_at)}
                      {mine && !msg.temp && (
                        <span style={{marginLeft:"4px"}}>
                          {msg.is_read ? "✓✓" : "✓"}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef}/>
      </div>

      <div className="chat-input-bar" style={{flexShrink:0}}>
        <textarea
          className="chat-inp"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          style={{height:"auto"}}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
          }}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || sending}
          title="Send message">
          ➤
        </button>
      </div>
    </div>
  );
}
