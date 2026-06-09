import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f6fc",padding:"24px"}}>
      <div style={{textAlign:"center",maxWidth:"420px"}}>
        <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"100px",fontWeight:"700",color:"#047857",lineHeight:1,margin:"0 0 12px"}}>404</p>
        <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"28px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 12px"}}>Page Not Found</h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#64748b",margin:"0 0 30px",lineHeight:1.6}}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"15px",padding:"13px 28px",borderRadius:"8px",textDecoration:"none",boxShadow:"0 4px 16px rgba(4,120,87,.35)"}}>← Back to Home</Link>
      </div>
    </div>
  );
}
