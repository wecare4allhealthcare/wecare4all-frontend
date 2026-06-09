/**
 * doctor/ChatList.jsx — Doctor: list of patient chats
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Chat from "../Chat";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.dcl{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.dcl *{box-sizing:border-box;} .dcl a{text-decoration:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.conv-item{background:#fff;border:1px solid #e2eaf4;border-radius:13px;
  padding:14px 16px;cursor:pointer;transition:all .22s;display:flex;
  align-items:center;gap:12px;margin-bottom:10px;}
.conv-item:hover{border-color:#0369a1;box-shadow:0 4px 14px rgba(11,31,58,.08);}
.conv-item.active{border-color:#0369a1;background:#eff8ff;}
.chat-panel{position:fixed;inset:0;z-index:500;background:#f0f6fc;
  display:flex;flex-direction:column;}
@media(min-width:768px){
  .chat-layout{display:grid;grid-template-columns:300px 1fr;
    height:calc(100vh - 72px);gap:0;}
  .conv-list{overflow-y:auto;border-right:1px solid #e2eaf4;
    background:#fff;padding:14px;}
  .chat-panel{position:relative;inset:auto;}
}
`;

export default function DoctorChatList() {
  const [convs,    setConvs]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeId, setActiveId] = useState(null);
  const token = localStorage.getItem("wc4a_token");

  useEffect(() => {
    document.title = "Patient Messages — We Care 4 'all'";
    fetchConvs();
  }, []);

  const fetchConvs = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/chat/conversations`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setConvs(json.conversations || []);
      if (!activeId && json.conversations?.length > 0)
        setActiveId(json.conversations[0].appointment_id);
    } catch { setConvs([]); }
    finally { setLoading(false); }
  };

  const activeConv = convs.find(c => c.appointment_id === activeId);
  const totalUnread = convs.reduce((s,c) => s + (c.unread_count||0), 0);

  return (
    <div className="dcl">
      <style>{G}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0369a1,#0284c7)",
        padding:"16px 16px 20px",flexShrink:0}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"flex",
          justifyContent:"space-between",alignItems:"center",
          flexWrap:"wrap",gap:"10px"}}>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
              fontWeight:"700",color:"#fff",margin:0}}>
              💬 Patient Messages
              {totalUnread > 0 &&
                <span style={{marginLeft:"8px",background:"#dc2626",color:"#fff",
                  fontSize:"13px",fontWeight:"700",padding:"2px 9px",
                  borderRadius:"50px",verticalAlign:"middle"}}>
                  {totalUnread}
                </span>}
            </h1>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
              color:"rgba(255,255,255,.6)",margin:0}}>
              {convs.length} conversation{convs.length!==1?"s":""}
            </p>
          </div>
          <Link to="/doctor/dashboard"
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
        <div className="conv-list">
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
            fontWeight:"700",color:"#94a3b8",marginBottom:"12px",
            textTransform:"uppercase",letterSpacing:"1px"}}>
            Patients
          </p>

          {loading ? (
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
                borderTop:"3px solid #0369a1",borderRadius:"50%",
                animation:"spin .8s linear infinite",margin:"0 auto"}}/>
            </div>
          ) : convs.length === 0 ? (
            <div style={{textAlign:"center",padding:"32px 12px"}}>
              <div style={{fontSize:"36px",marginBottom:"10px"}}>💬</div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#94a3b8"}}>
                No patient chats yet.
              </p>
            </div>
          ) : convs.map(c => (
            <div key={c.appointment_id}
              className={`conv-item${activeId===c.appointment_id?" active":""}`}
              onClick={() => setActiveId(c.appointment_id)}>
              {/* Avatar */}
              <div style={{width:"40px",height:"40px",borderRadius:"50%",
                background:"linear-gradient(135deg,#0369a1,#0284c7)",
                display:"flex",alignItems:"center",justifyContent:"center",
                flexShrink:0,position:"relative"}}>
                <span style={{color:"#fff",fontSize:"16px",fontWeight:"700"}}>
                  {c.other_party?.full_name?.[0]||"P"}
                </span>
                {c.unread_count > 0 && (
                  <span style={{position:"absolute",top:"-3px",right:"-3px",
                    background:"#dc2626",color:"#fff",fontSize:"10px",
                    fontWeight:"700",width:"18px",height:"18px",borderRadius:"50%",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    border:"2px solid #fff"}}>
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
                    {c.other_party?.full_name||"Patient"}
                  </p>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                    color:"#94a3b8",flexShrink:0,marginLeft:"6px"}}>
                    {c.last_message
                      ? new Date(c.last_message.created_at)
                          .toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})
                      : ""}
                  </span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center"}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                    color:"#94a3b8",margin:0,
                    overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                    flex:1}}>
                    {c.last_message?.message || "No messages yet"}
                  </p>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                    color:c.status==="approved"?"#047857":"#94a3b8",
                    marginLeft:"6px",flexShrink:0,fontWeight:"600"}}>
                    {c.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat window */}
        {activeId ? (
          <div className="chat-panel">
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
                {activeConv?.other_party?.full_name||"Patient"}
              </span>
            </div>
            <Chat
              appointmentId={activeId}
              role="doctor"
              onUnreadChange={fetchConvs}
            />
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",
            padding:"40px",color:"#94a3b8",fontFamily:"'DM Sans',sans-serif",
            fontSize:"14px",textAlign:"center",background:"#fff"}}>
            <div>
              <div style={{fontSize:"40px",marginBottom:"12px"}}>💬</div>
              <p>Select a patient to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
