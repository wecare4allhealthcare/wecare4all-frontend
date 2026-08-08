/**
 * components/InstallPrompt.jsx — floating "Install App" button.
 *
 * PREVIOUS BEHAVIOUR (the bug being fixed here): this only rendered
 * itself while a live `beforeinstallprompt` event was sitting in state,
 * and the moment the person dismissed it (or installed), a permanent
 * localStorage flag hid it forever. Chrome only fires
 * `beforeinstallprompt` once per session under specific conditions, so
 * in practice the button was visible once, briefly, and then never
 * again — exactly what was reported ("install button visible only the
 * first time").
 *
 * NEW BEHAVIOUR: a small floating circular button, fixed in place
 * on the bottom-left (stacked above SymptomChecker.jsx's own button
 * at bottom:24px/left:20px, same offset pattern used on the right
 * side for FloatingFAQ.jsx), visible on every page for as long as the
 * app isn't already installed. Tapping it either triggers the real native
 * install prompt (Chrome/Edge/Android — captured once and reused for
 * as many taps as needed) or opens a small "how to install" card
 * (iOS Safari, or any browser where the native prompt hasn't fired
 * yet / isn't supported). Dismissing the popped-open card just closes
 * it for this viewing — it does NOT hide the floating button itself,
 * so install stays available any time.
 */
import { useEffect, useState } from "react";

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true // iOS-specific flag
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

function isAndroid() {
  return /android/i.test(window.navigator.userAgent);
}

// In-app browsers (Instagram, Facebook, WhatsApp, LinkedIn's built-in
// webview, etc.) never fire beforeinstallprompt at all, no matter how
// correct the manifest/service-worker setup is — it's a platform
// restriction, not something this app can work around. If someone
// opened the site from a link inside one of these apps, the button
// will always fall through to the manual-instructions card below;
// they need to open the page in the real browser first.
function isInAppBrowser() {
  const ua = window.navigator.userAgent || "";
  return /Instagram|FBAN|FBAV|FB_IAB|WhatsApp|Line\/|LinkedInApp|Twitter/i.test(ua);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (installed) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [installed]);

  if (installed) return null;

  const install = async () => {
    if (!deferredPrompt) { setOpen(true); return; } // no native prompt available — show manual instructions
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome === "accepted") setInstalled(true);
    // Chrome only ever fires beforeinstallprompt once, so we intentionally
    // keep deferredPrompt around after a "dismissed" outcome — the button
    // stays usable and the same captured event can be replayed.
    setOpen(false);
  };

  return (
    <>
      {/* ── Floating trigger button — bottom-left, stacked above
          SymptomChecker.jsx's own button (bottom:24px/left:20px). ── */}
      <button
        onClick={() => (deferredPrompt ? install() : setOpen(o => !o))}
        aria-label="Install app"
        title="Install We Care 4 'all'"
        style={{
          position: "fixed", bottom: "96px", left: "20px", zIndex: 9997,
          width: "52px", height: "52px", borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg,#047857,#059669)",
          color: "#fff", fontSize: "22px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 22px rgba(4,120,87,.42)",
        }}
      >
        📲
      </button>

      {open && (
        <div style={{
          position: "fixed", bottom: "156px", left: "20px", zIndex: 9997,
          width: "268px", maxWidth: "calc(100vw - 40px)", background: "#fff", border: "1px solid #e2eaf4",
          borderRadius: "14px", padding: "16px", boxShadow: "0 12px 32px rgba(11,31,58,.20)",
          fontFamily: "'DM Sans',sans-serif",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#0b1f3a", margin: 0 }}>
              Install We Care 4 'all'
            </p>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{
              background: "#f1f5f9", border: "none", color: "#64748b",
              width: "22px", height: "22px", borderRadius: "6px", cursor: "pointer",
              fontSize: "13px", flexShrink: 0,
            }}>×</button>
          </div>
          {isInAppBrowser() ? (
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              This link opened inside an app's built-in browser (e.g.
              Instagram/Facebook/WhatsApp), which can't install apps.
              Tap the <strong>⋮</strong> or <strong>Share</strong> icon
              and choose "Open in Chrome" or "Open in Browser," then try
              again from there.
            </p>
          ) : isIOS() ? (
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              Tap the Share icon in Safari, then "Add to Home Screen."
            </p>
          ) : isAndroid() ? (
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              Tap the <strong>⋮</strong> menu (top-right of Chrome), then
              "Install app" or "Add to Home screen." If that option isn't
              there yet, browse the site a little more and check again —
              Chrome sometimes needs a couple of visits before it offers it.
            </p>
          ) : (
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
              Your browser hasn't offered the install prompt yet — try
              reloading the page, or look for an install icon in the
              address bar.
            </p>
          )}
        </div>
      )}
    </>
  );
}
