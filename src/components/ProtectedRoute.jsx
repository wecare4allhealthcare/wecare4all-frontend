import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children, role }) {
  const { isLoggedIn, role: userRole, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0f6fc" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:"40px", height:"40px", border:"3px solid #047857", borderTop:"3px solid transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 12px" }} />
        <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#64748b", fontSize:"14px" }}>Loading...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
  if (!isLoggedIn) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  const allowed = Array.isArray(role) ? role : [role];
  if (role && !allowed.includes(userRole)) {
    const map = { patient:"/patient/dashboard", doctor:"/doctor/dashboard", admin:"/admin/dashboard",
      company_super_admin:"/company/dashboard", hr_admin:"/company/dashboard" };
    return <Navigate to={map[userRole]||"/"} replace />;
  }
  return children;
}
