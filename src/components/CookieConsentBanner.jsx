import { useEffect, useState } from "react";

/**
 * CookieConsentBanner.jsx — Aug 2026, client request (visitor tracking).
 *
 * Google Analytics (GA4) uses cookies, so it must not load/fire before
 * the visitor has actually consented — this component is the gate: GA4
 * only loads if `wc4a_cookie_consent` is "accepted" (either from a past
 * visit, or from clicking Accept just now). Declining, or not choosing
 * yet, means GA4 never loads for that visitor at all — not "loaded but
 * blocked", genuinely not requested from Google's servers.
 *
 * Mounted once in App.jsx, above the router, so it's present on every
 * page and the consent decision only has to be made once per browser.
 *
 * Needs VITE_GA_MEASUREMENT_ID set (Vercel → Project → Settings →
 * Environment Variables) once the client creates their GA4 property —
 * until that's set, this banner still shows and still saves the
 * consent choice, but there's nothing for it to load, so it's a no-op.
 */

const CONSENT_KEY = "wc4a_cookie_consent"; // "accepted" | "declined"

function loadGoogleAnalytics() {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!gaId || typeof window === "undefined") return;
  if (window.__wc4aGaLoaded) return; // don't inject twice across remounts
  window.__wc4aGaLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", gaId);
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(CONSENT_KEY);
    if (existing === "accepted") {
      loadGoogleAnalytics();
    } else if (existing !== "declined") {
      setVisible(true); // no choice made yet
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    loadGoogleAnalytics();
    setVisible(false);
  };
  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Cookie consent" style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 99998,
      background: "#fff", borderTop: "1.5px solid var(--wc-border, #e2e8f0)",
      boxShadow: "0 -8px 30px rgba(18,59,74,.12)",
      padding: "16px 20px", display: "flex", alignItems: "center",
      gap: "16px", flexWrap: "wrap", justifyContent: "space-between",
    }}>
      <p style={{
        flex: "1 1 260px", margin: 0, fontFamily: "'Inter',sans-serif",
        fontSize: "13px", color: "var(--wc-navy, #16324A)", lineHeight: 1.55,
      }}>
        We use cookies to understand how visitors use our site and to
        improve your experience. We don't use them for advertising.
      </p>
      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        <button onClick={decline} style={{
          padding: "9px 18px", borderRadius: "9px",
          border: "1.5px solid var(--wc-border, #e2e8f0)",
          background: "var(--wc-warm-white, #FAFAF7)", color: "var(--wc-muted, #6b7688)",
          fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "13px", cursor: "pointer",
        }}>
          Decline
        </button>
        <button onClick={accept} style={{
          padding: "9px 20px", borderRadius: "9px", border: "none",
          background: "linear-gradient(135deg,var(--wc-green,#5B9E32),var(--wc-green-dark,#3f7020))",
          color: "#fff", fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "13px", cursor: "pointer",
        }}>
          Accept
        </button>
      </div>
    </div>
  );
}
