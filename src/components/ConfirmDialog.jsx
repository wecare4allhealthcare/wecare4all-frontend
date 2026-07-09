/**
 * ConfirmDialog.jsx — Global confirmation modal, promise-based.
 * Replaces window.confirm() with something that matches the app's design
 * and can't be mistaken/misclicked as easily as a bare browser dialog.
 *
 * Usage:
 *   import { confirmAction } from "../../components/ConfirmDialog";
 *
 *   const ok = await confirmAction({
 *     title: "Reject this application?",
 *     message: "The hospital will be notified by email that their empanelment application was not approved.",
 *     confirmLabel: "Reject",
 *   });
 *   if (!ok) return;
 *   // ...proceed with the rejection
 *
 * Mount <ConfirmDialogContainer /> once, at the true app root (not just
 * inside a layout that only some routes use) — see App.jsx.
 */
import { useState, useEffect, useCallback } from "react";

const CSS = `
@keyframes confirm-in { from{opacity:0} to{opacity:1} }
@keyframes confirm-pop { from{opacity:0;transform:translateY(10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.confirm-overlay { animation: confirm-in .15s ease both; }
.confirm-card    { animation: confirm-pop .18s ease both; }
`;

// Global event emitter — same pattern as Toast.jsx
let _emit = null;

/**
 * Shows the confirmation dialog and resolves to true/false based on the
 * person's choice. Falls back to window.confirm() if the container isn't
 * mounted yet (shouldn't normally happen once mounted at the app root).
 */
export function confirmAction({
  title = "Are you sure?",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
} = {}) {
  return new Promise((resolve) => {
    if (_emit) {
      _emit({ title, message, confirmLabel, cancelLabel, danger, resolve });
    } else {
      resolve(window.confirm(message || title));
    }
  });
}

export function ConfirmDialogContainer() {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    _emit = (d) => setDialog(d);
    return () => { _emit = null; };
  }, []);

  const handle = useCallback((result) => {
    setDialog((current) => {
      if (current) current.resolve(result);
      return null;
    });
  }, []);

  // Let Escape cancel, same as clicking the backdrop.
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => { if (e.key === "Escape") handle(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, handle]);

  if (!dialog) return null;

  return (
    <div
      className="confirm-overlay"
      onClick={() => handle(false)}
      style={{
        position: "fixed", inset: 0, background: "rgba(11,31,58,.45)",
        zIndex: 100000, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "20px",
      }}
    >
      <style>{CSS}</style>
      <div
        className="confirm-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "16px", maxWidth: "420px",
          width: "100%", padding: "26px", boxShadow: "0 20px 60px rgba(11,31,58,.25)",
        }}
      >
        <h3 style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: "17px", fontWeight: 700,
          color: "#0b1f3a", margin: "0 0 8px",
        }}>
          {dialog.title}
        </h3>
        {dialog.message && (
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: "13.5px", color: "#64748b",
            margin: "0 0 22px", lineHeight: 1.6,
          }}>
            {dialog.message}
          </p>
        )}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={() => handle(false)}
            style={{
              padding: "10px 18px", borderRadius: "8px", border: "1px solid #e2eaf4",
              background: "#fff", color: "#64748b", fontFamily: "'DM Sans',sans-serif",
              fontWeight: 600, fontSize: "13px", cursor: "pointer",
            }}
          >
            {dialog.cancelLabel}
          </button>
          <button
            onClick={() => handle(true)}
            style={{
              padding: "10px 18px", borderRadius: "8px", border: "none",
              background: dialog.danger ? "#dc2626" : "#047857", color: "#fff",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "13px",
              cursor: "pointer",
            }}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
