import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
export default function Dashboard() {
  const { user, logout } = useAuth();
  const C = { patient:"#047857", doctor:"#0369a1", admin:"#7c3aed" }["admin"];
  const I = { patient:"👋", doctor:"👨‍⚕️", admin:"⚙️" }["admin"];
  const R = { patient:"Phase 2 — Doctor listing, appointments, patient profile", doctor:"Phase 4 — Appointment management, video consultation", admin:"Phase 3 — Doctor management, analytics dashboard" }["admin"];
  return (
    <div style={{minHeight:"100vh",background:"#f0f6fc",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"20px",padding:"48px 40px",textAlign:"center",maxWidth:"500px",width:"100%",boxShadow:"0 4px 20px rgba(11,31,58,.08)"}}>
        <div style={{width:"72px",height:"72px",background:`linear-gradient(135deg,${C},${C}cc)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:"28px"}}>{I}</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"28px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 7px"}}>Welcome{user?.name ? ", " + user.name : ""}!</h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#64748b",margin:"0 0 16px"}}>You are logged in as <strong style={{textTransform:"capitalize"}}>admin</strong>.</p>
        <div style={{background:"#fef9c3",border:"1px solid #fde047",borderRadius:"10px",padding:"12px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#854d0e",margin:"0 0 26px",textAlign:"left"}}>🚧 <strong>Coming Next:</strong> {R}</div>
        <div style={{display:"flex",gap:"11px",justifyContent:"center",flexWrap:"wrap"}}>
          <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"6px",background:`linear-gradient(135deg,${C},${C}cc)`,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",padding:"11px 22px",borderRadius:"8px",textDecoration:"none"}}>← Home</Link>
          <button onClick={logout} style={{padding:"11px 22px",borderRadius:"8px",border:"1px solid #e2eaf4",background:"#f8fafc",color:"#64748b",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",cursor:"pointer"}}>Logout</button>
        </div>
      </div>
    </div>
  );
}
