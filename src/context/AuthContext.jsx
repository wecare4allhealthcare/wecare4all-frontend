import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const restore = async () => {
      const token  = localStorage.getItem("wc4a_token");
      const stored = localStorage.getItem("wc4a_user");
      if (token && stored) {
        try { const r = await authAPI.getMe(); setUser(r.data); }
        catch { localStorage.removeItem("wc4a_token"); localStorage.removeItem("wc4a_user"); }
      }
      setLoading(false);
    };
    restore();
  }, []);
  const login  = (userData, token) => { localStorage.setItem("wc4a_token", token); localStorage.setItem("wc4a_user", JSON.stringify(userData)); setUser(userData); };
  const logout = () => { localStorage.removeItem("wc4a_token"); localStorage.removeItem("wc4a_user"); setUser(null); };
  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, role: user?.role || null, isPatient: user?.role==="patient", isDoctor: user?.role==="doctor", isAdmin: user?.role==="admin", login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
