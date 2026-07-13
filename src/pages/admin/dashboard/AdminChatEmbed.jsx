import { useNavigate } from "react-router-dom";


// ── NAV + MAIN ────────────────────────────────────────────────
// ── Admin Chat Embed ─────────────────────────────────────────
export default function AdminChatEmbed() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
          💬 Chat
        </h2>
        <button onClick={()=>navigate("/admin/chat")}
          style={{padding:"9px 18px",borderRadius:"8px",border:"none",
            background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
            fontSize:"13px",cursor:"pointer"}}>
          Open Full Chat →
        </button>
      </div>
      <div style={{background:"#fff",border:"1px solid #e2eaf4",
        borderRadius:"14px",padding:"40px 24px",textAlign:"center"}}>
        <div style={{fontSize:"48px",marginBottom:"16px"}}>💬</div>
        <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"18px",
          fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>
          Doctor-to-Doctor & Admin-Doctor Chat
        </h3>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
          color:"#64748b",marginBottom:"20px",lineHeight:"1.7"}}>
          View all conversations between doctors and send messages to any doctor.
          Click below to open the full chat interface.
        </p>
        <button onClick={()=>navigate("/admin/chat")}
          style={{padding:"12px 28px",borderRadius:"9px",border:"none",
            background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
            fontSize:"14px",cursor:"pointer",
            boxShadow:"0 4px 18px rgba(124,58,237,.35)"}}>
          Open Chat →
        </button>
      </div>
    </div>
  );
}
