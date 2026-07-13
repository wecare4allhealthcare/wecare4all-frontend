/**
 * Toast.jsx — Global toast notification system
 * Replaces all alert() calls site-wide.
 *
 * Usage:
 *   import { showToast } from "./Toast";
 *   showToast("Saved successfully!", "success");
 *   showToast("Upload failed.", "error");
 *   showToast("Copied to clipboard!", "info");
 *   showToast("Please enter a valid amount.", "warning");
 *
 * Mount <ToastContainer /> once in App.jsx or Layout.jsx.
 */
import { useState, useEffect, useCallback } from "react";

const CSS = `
@keyframes toast-in  { from{opacity:0;transform:translateY(16px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes toast-out { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(10px) scale(.96)} }
.toast-item { animation: toast-in .25s ease both; }
.toast-item.leaving { animation: toast-out .25s ease both; }
`;

const ICONS = {
  success: "✅",
  error:   "❌",
  warning: "⚠️",
  info:    "ℹ️",
};

const COLORS = {
  success: { bg:"#f0fdf4", border:"#86efac", title:"#15803d", bar:"#22c55e" },
  error:   { bg:"#fef2f2", border:"#fca5a5", title:"#dc2626", bar:"#ef4444" },
  warning: { bg:"#fffbeb", border:"#fde68a", title:"#92400e", bar:"#f59e0b" },
  info:    { bg:"#eff6ff", border:"#bfdbfe", title:"#1d4ed8", bar:"#3b82f6" },
};

// Global event emitter
let _emit = null;
export function showToast(message, type = "info", duration = 4000) {
  if (_emit) _emit({ message, type, duration, id: Date.now() + Math.random() });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _emit = (toast) => setToasts(prev => [...prev.slice(-4), toast]);
    return () => { _emit = null; };
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 260);
  }, []);

  useEffect(() => {
    toasts.forEach(t => {
      if (!t.leaving && t.duration > 0) {
        const timer = setTimeout(() => remove(t.id), t.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, remove]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position:"fixed", bottom:"24px", right:"24px", zIndex:99999,
      display:"flex", flexDirection:"column", gap:"10px",
      maxWidth:"360px", width:"calc(100vw - 48px)",
    }}>
      <style>{CSS}</style>
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <div key={t.id} className={`toast-item${t.leaving ? " leaving" : ""}`}
            style={{
              background: c.bg,
              border: `1.5px solid ${c.border}`,
              borderRadius: "14px",
              boxShadow: "0 8px 32px rgba(11,31,58,.12)",
              overflow: "hidden",
              position: "relative",
            }}>
            {/* Progress bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, height: "3px",
              background: c.bar, borderRadius: "14px 14px 0 0",
              width: "100%",
              animation: t.duration > 0
                ? `toast-bar ${t.duration}ms linear forwards` : "none",
            }}/>
            <style>{`@keyframes toast-bar{from{width:100%}to{width:0%}}`}</style>

            <div style={{display:"flex", alignItems:"flex-start", gap:"12px", padding:"14px 16px"}}>
              <span style={{fontSize:"18px", flexShrink:0, marginTop:"1px"}}>{ICONS[t.type]}</span>
              <p style={{
                fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px",
                fontWeight:"600", color: c.title,
                margin: 0, flex: 1, lineHeight: "1.5",
              }}>
                {t.message}
              </p>
              <button onClick={() => remove(t.id)}
                style={{
                  background:"none", border:"none", cursor:"pointer",
                  color:"#6b7688", fontSize:"16px", padding:"0 0 0 4px",
                  flexShrink:0, lineHeight:1, marginTop:"1px",
                }}>×</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
