/**
 * components/InstallPrompt.jsx — a small "Install App" banner.
 *
 * Two genuinely different paths, not one unified solution, because the
 * platforms don't agree on how this works:
 *  - Chrome/Edge/most Android browsers fire a real `beforeinstallprompt`
 *    event we can hook into and trigger programmatically.
 *  - iOS Safari has NO such API at all — there's no way to trigger an
 *    install programmatically. The only way to install there is the
 *    user manually doing Share → Add to Home Screen, so that's the
 *    branch shown instead, as static instructions rather than a button.
 *
 * Dismissing (either path) is remembered in localStorage so this
 * doesn't nag on every visit — but it won't show at all if the site's
 * already running as an installed app (display-mode: standalone).
 */
import { useEffect, useState } from "react";

const DISMISS_KEY = "wc4a_install_prompt_dismissed";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true // iOS-specific flag
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [dismissed, setDismissed] = useState(
    localStorage.getItem(DISMISS_KEY) === "true"
  );

  useEffect(() => {
    if (isStandalone() || dismissed) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIOS()) setShowIOSHint(true);

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [dismissed]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice; // we don't branch on accepted/dismissed — either way, this prompt's done
    setDeferredPrompt(null);
    dismiss();
  };

  if (dismissed || isStandalone()) return null;
  if (!deferredPrompt && !showIOSHint) return null; // nothing installable to offer right now

  return (
    <div style={{
      position: "fixed", bottom: "16px", left: "16px", right: "16px",
      maxWidth: "420px", margin: "0 auto", zIndex: 900,
      background: "#fff", border: "1px solid #e2eaf4", borderRadius: "14px",
      padding: "14px 16px", boxShadow: "0 8px 28px rgba(11,31,58,.16)",
      display: "flex", alignItems: "center", gap: "12px",
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <span style={{ fontSize: "26px", flexShrink: 0 }}>📲</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#0b1f3a", margin: "0 0 2px" }}>
          Install We Care 4 'all'
        </p>
        {deferredPrompt ? (
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
            Add to your home screen for quick, app-like access.
          </p>
        ) : (
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
            Tap the Share icon, then "Add to Home Screen."
          </p>
        )}
      </div>
      {deferredPrompt && (
        <button onClick={install} style={{
          background: "linear-gradient(135deg,#047857,#059669)", color: "#fff",
          border: "none", borderRadius: "8px", padding: "9px 16px",
          fontSize: "12.5px", fontWeight: 700, cursor: "pointer", flexShrink: 0,
        }}>
          Install
        </button>
      )}
      <button onClick={dismiss} aria-label="Dismiss" style={{
        background: "#f1f5f9", border: "none", color: "#64748b",
        width: "26px", height: "26px", borderRadius: "7px", cursor: "pointer",
        fontSize: "15px", flexShrink: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>×</button>
    </div>
  );
}
