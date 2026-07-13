import axios from "axios";
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const api = axios.create({ baseURL: BASE, timeout: 15000 });
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("wc4a_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
api.interceptors.response.use(r => r, err => {
  // Only force-logout on explicit 401 (token invalid/expired)
  // Do NOT logout on network errors (offline, timeout, 5xx) — user session must survive
  if (err.response?.status === 401) {
    localStorage.removeItem("wc4a_token");
    localStorage.removeItem("wc4a_user");
    if (!window.location.pathname.includes("/login"))
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  }
  return Promise.reject(err);
});
export const authAPI = {
  sendEmailOTP:   (email, portal="patient")      => api.post("/auth/send-email-otp",   { email, portal }),
  verifyEmailOTP: (email, otp, portal="patient", consentAccepted=false) => api.post("/auth/verify-email-otp", { email, otp, portal, consent_accepted: consentAccepted }),
  sendSMSOTP:     (mobile, cc, portal="patient")      => api.post("/auth/send-sms-otp",   { mobile, country_code: cc, portal }),
  verifySMSOTP:   (mobile, cc, otp, portal="patient", consentAccepted=false) => api.post("/auth/verify-sms-otp", { mobile, country_code: cc, otp, portal, consent_accepted: consentAccepted }),
  doctorLogin:    (email, password)    => api.post("/auth/doctor-login",     { email, password }),
  hospitalLogin:  (email, password)    => api.post("/auth/hospital-login",   { email, password }),
  adminLogin:     (email, password)    => api.post("/auth/admin-login",      { email, password }),
  getMe:          ()                   => api.get("/auth/me"),
  submitContact:  (data)               => api.post("/auth/contact",          data),
};
export default api;
