import { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const token  = localStorage.getItem("wc4a_token");
      const stored = localStorage.getItem("wc4a_user");

      if (!token || !stored) { setLoading(false); return; }

      // Instant restore from localStorage
      try { setUser(JSON.parse(stored)); } catch {}
      setLoading(false);

      // Background verify — only logout on explicit 401, ignore network errors
      try {
        const r = await authAPI.getMe();
        if (r.data) {
          setUser(r.data);
          localStorage.setItem("wc4a_user", JSON.stringify(r.data));
        }
      } catch (err) {
        const status = err?.response?.status;
        // Only clear session for explicit 401 (invalid/expired token)
        // Ignore 500, network errors, Supabase disconnections — keep cached session
        if (status === 401) {
          localStorage.removeItem("wc4a_token");
          localStorage.removeItem("wc4a_user");
          setUser(null);
        }
        // Any other error (network, 500, timeout) → keep user logged in
      }
    };
    restore();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("wc4a_token", token);
    localStorage.setItem("wc4a_user", JSON.stringify(userData));
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem("wc4a_token");
    localStorage.removeItem("wc4a_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      isLoggedIn: !!user,
      role:       user?.role || null,
      isPatient:  user?.role === "patient",
      isDoctor:   user?.role === "doctor",
      isAdmin:    user?.role === "admin",
      isHospital: user?.role === "hospital",
      // portal_type only applies to role="patient" accounts — distinguishes
      // Healthcare Consultancy vs Hospital Consultancy users who both share
      // the same login mechanism. Doctor/Admin/Hospital-partner roles are
      // unaffected by this.
      portalType: user?.portal_type || "healthcare",
      isHealthcareConsultancy: user?.role === "patient" && (user?.portal_type || "healthcare") === "healthcare",
      isHospitalConsultancy:   user?.role === "patient" && user?.portal_type === "hospital",
      login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
export { useAuth } from "./useAuth";
