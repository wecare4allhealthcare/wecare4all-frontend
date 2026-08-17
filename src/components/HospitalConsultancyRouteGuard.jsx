import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * HospitalConsultancyRouteGuard — restricts /hospital-consultancy to
 * Admin and "Hospital Consultancy" accounts only.
 *
 * This can't be a plain <ProtectedRoute role="..."/> for the same
 * reason AboutRouteGuard.jsx (which this mirrors) can't be used for
 * /about: "Hospital Consultancy" isn't always a distinct JWT role.
 * Today, the real-world Hospital/Nursing login flow (Login.jsx →
 * portal="hospital") issues role==="patient" accounts, distinguished
 * only by wc4a_login_portal==="hospital" in localStorage — see
 * Navbar.jsx's isHospitalIntent, which this matches exactly. A
 * genuine hospital-staff account (role==="hospital", via a separate
 * approved-partner login) also counts.
 *
 * Unlike AboutRouteGuard (which silently bounces disallowed visitors
 * to "/"), this sends a logged-out visitor to /login?redirect=... —
 * per client request, an unauthenticated person should land on the
 * login page, not be silently redirected away with no explanation.
 * A logged-in but wrong-role visitor (patient without hospital
 * intent, doctor) still gets sent to "/" — they're logged in, so a
 * login prompt wouldn't help them either way.
 */
export default function HospitalConsultancyRouteGuard({ children }) {
  const { isLoggedIn, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0f6fc" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:"40px", height:"40px", border:"3px solid var(--wc-green)", borderTop:"3px solid transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 12px" }} />
        <p style={{ fontFamily:"'Inter',sans-serif", color:"var(--wc-muted)", fontSize:"14px" }}>Loading...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const isHospitalIntent = role === "patient" &&
    (typeof window !== "undefined" && localStorage.getItem("wc4a_login_portal") === "hospital");

  const allowed = role === "admin" || role === "hospital" || isHospitalIntent;

  if (!allowed) return <Navigate to="/" replace />;
  return children;
}
