import axios from "axios";
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
// Render free-tier backend can take up to ~50s to wake from sleep after
// 15 min idle. 15s was too short and caused every action (login, OTP,
// enquiry submit, saves) to time out with a generic error whenever the
// backend was asleep — not a real failure in each feature individually.
// 60s covers the worst-case cold start; once the backend is on a paid
// plan (no sleep), this can be brought back down if desired.
const api = axios.create({ baseURL: BASE, timeout: 60000 });
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
  verifyEmailOTP: (email, otp, portal="patient", consentAccepted=false, facilitationConsentAccepted=false) => api.post("/auth/verify-email-otp", { email, otp, portal, consent_accepted: consentAccepted, facilitation_consent_accepted: facilitationConsentAccepted }),
  sendSMSOTP:     (mobile, cc, portal="patient")      => api.post("/auth/send-sms-otp",   { mobile, country_code: cc, portal }),
  verifySMSOTP:   (mobile, cc, otp, portal="patient", consentAccepted=false, facilitationConsentAccepted=false) => api.post("/auth/verify-sms-otp", { mobile, country_code: cc, otp, portal, consent_accepted: consentAccepted, facilitation_consent_accepted: facilitationConsentAccepted }),
  doctorLogin:    (email, password)    => api.post("/auth/doctor-login",     { email, password }),
  hospitalLogin:  (email, password)    => api.post("/auth/hospital-login",   { email, password }),
  pharmacyLogin:  (email, password)    => api.post("/auth/pharmacy-login",   { email, password }),
  labLogin:       (email, password)    => api.post("/auth/lab-login",        { email, password }),
  adminLogin:     (email, password)    => api.post("/auth/admin-login",      { email, password }),
  patientIdLogin: (patient_id, password) => api.post("/company/employee-login", { patient_id, password }),
  resetPassword:  (newPassword, resetToken) => api.post("/auth/reset-password", { new_password: newPassword }, { headers: { Authorization: `Bearer ${resetToken}` } }),
  verify2FALogin: (preAuthToken, code) => api.post("/auth/2fa/verify-login", { pre_auth_token: preAuthToken, code }),
  getMe:          ()                   => api.get("/auth/me"),
  submitContact:  (data)               => api.post("/auth/contact",          data),
};
export default api;
