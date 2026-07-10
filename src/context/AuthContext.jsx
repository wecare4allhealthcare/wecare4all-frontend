import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

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

      // Background verify — deliberately a raw fetch(), NOT the shared
      // axios `api` instance. That instance's response interceptor
      // force-wipes localStorage AND hard-redirects to /login on ANY
      // 401, for ANY request that goes through it — which used to
      // include this exact background check, running on every single
      // page load for every role. A single transient 401 here (network
      // hiccup, brief clock skew, cold-start on the backend, etc.) was
      // enough to silently log someone out mid-session with no user
      // action involved. Every dashboard already uses plain fetch() for
      // its own data calls, so this was the one authenticated call in
      // the whole app still routed through that harsher path — this
      // brings it in line with everything else. Only clear on an
      // explicit 401 (invalid/expired token) — ignore network errors,
      // timeouts, and 5xx so a flaky connection can't log anyone out.
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem("wc4a_token");
          localStorage.removeItem("wc4a_user");
          setUser(null);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          localStorage.setItem("wc4a_user", JSON.stringify(data));
        }
        // Any other status (5xx etc.) — keep the cached session as-is.
      } catch {
        // Network error / offline / timeout — keep the cached session.
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
    localStorage.removeItem("wc4a_login_portal");
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
      login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
export { useAuth } from "./useAuth";
