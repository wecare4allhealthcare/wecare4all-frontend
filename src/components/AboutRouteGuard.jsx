import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * AboutRouteGuard — restricts /about to Admin and Hospital Consultancy
 * only (not patients, not doctors, not logged-out visitors).
 *
 * This can't be a plain <ProtectedRoute role="..."/> because "Hospital
 * Consultancy" isn't a JWT role — it's the same "patient" role as a
 * regular healthcare patient, distinguished only by which portal they
 * picked at login (see Navbar.jsx's isHospitalIntent, which this
 * mirrors exactly: role==="patient" + wc4a_login_portal==="hospital"
 * in localStorage). A verified Hospital STAFF account (role==="hospital",
 * via /hospital-login) counts as Hospital Consultancy too.
 */
export default function AboutRouteGuard({ children }) {
  const { role, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0f6fc" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:"40px", height:"40px", border:"3px solid #047857", borderTop:"3px solid transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 12px" }} />
        <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#64748b", fontSize:"14px" }}>Loading...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  const isHospitalIntent = role === "patient" &&
    (typeof window !== "undefined" && localStorage.getItem("wc4a_login_portal") === "hospital");

  const allowed = role === "admin" || role === "hospital" || isHospitalIntent;

  if (!allowed) return <Navigate to="/" replace />;
  return children;
}
