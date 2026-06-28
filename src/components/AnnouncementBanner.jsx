/**
 * components/AnnouncementBanner.jsx — platform-wide notice, shown at
 * the very top of every page (wired into App.jsx above the routes, so
 * it appears regardless of which page or role is logged in).
 *
 * Dismissible per-browser via localStorage, keyed to the specific
 * announcement's id — so dismissing today's banner doesn't also
 * hide a different one admin posts tomorrow.
 */
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const DISMISS_KEY = "wc4a_dismissed_announcement_id";

const TYPE_STYLES = {
  info:    { bg: "linear-gradient(135deg,#0369a1,#0284c7)", icon: "ℹ️" },
  warning: { bg: "linear-gradient(135deg,#b45309,#d97706)", icon: "⚠️" },
  urgent:  { bg: "linear-gradient(135deg,#991b1b,#dc2626)", icon: "🚨" },
};

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/announcements/active`);
        const json = await res.json();
        if (json.announcement) {
          setAnnouncement(json.announcement);
          setDismissed(localStorage.getItem(DISMISS_KEY) === json.announcement.id);
        }
      } catch {}
    })();
  }, []);

  if (!announcement || dismissed) return null;
  const style = TYPE_STYLES[announcement.type] || TYPE_STYLES.info;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, announcement.id);
    setDismissed(true);
  };

  return (
    <div style={{
      background: style.bg, color: "#fff", padding: "10px 44px 10px 16px",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: "10px", fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px",
      fontWeight: 600, position: "relative", zIndex: 1000,
    }}>
      <span style={{ flexShrink: 0 }}>{style.icon}</span>
      <span style={{ textAlign: "center" }}>{announcement.message}</span>
      <button onClick={dismiss} aria-label="Dismiss announcement" style={{
        position: "absolute", right: "12px", top: "8px",
        background: "rgba(255,255,255,.2)", border: "none", color: "#fff",
        width: "22px", height: "22px", borderRadius: "6px", cursor: "pointer",
        fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>×</button>
    </div>
  );
}
