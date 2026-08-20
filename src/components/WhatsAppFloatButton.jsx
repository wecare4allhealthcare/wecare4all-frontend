/**
 * WhatsAppFloatButton.jsx — standalone, always-visible WhatsApp CTA.
 *
 * Client requirement (Aug 2026): "Need a floating CTA button for WhatsApp
 * irrespective of page a person goes." CallFloatButton.jsx already offers
 * WhatsApp, but only after a tap opens its Call/WhatsApp panel — this is a
 * single-tap, WhatsApp-only button so the option is visible and reachable
 * everywhere without an extra step.
 *
 * Placement: bottom-right row, to the LEFT of CallFloatButton (right:90px)
 * with the same 70px spacing already used between FloatingFAQ (right:20px)
 * and CallFloatButton (right:90px) — so right:160px, same bottom offset.
 * Rendered from Layout.jsx alongside the other floating buttons.
 *
 * COLOR (Aug 2026, this pass — "give whatsapp button in our theme
 * color"): was WhatsApp's own brand green (#25D366), which is a
 * different, slightly brighter/bluer green than the site's own
 * --wc-green (#5B9E32). Switched to the site's brand green/gradient
 * (matches CallFloatButton and every other primary CTA) so this button
 * reads as "this site's WhatsApp CTA" rather than a generic embedded
 * WhatsApp widget. The 💬 icon still makes it clear what it does even
 * without the platform's own green.
 */
const WA_LINK = "https://wa.me/919025786467?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20We%20Care%204%20%27all%27";

export default function WhatsAppFloatButton() {
  return (
    <>
      <style>{`
        @keyframes waPulse {
          0%   { box-shadow: 0 0 0 0 rgba(91,158,50,.45); }
          70%  { box-shadow: 0 0 0 12px rgba(91,158,50,0); }
          100% { box-shadow: 0 0 0 0 rgba(91,158,50,0); }
        }
        .wa-float-btn { animation: waPulse 2.6s ease-in-out infinite; }
        .wa-float-btn:hover { transform: translateY(-2px); }
      `}</style>

      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float-btn"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        style={{
          position: "fixed", bottom: "24px", right: "160px", zIndex: 998,
          width: "52px", height: "52px", borderRadius: "50%",
          background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", display: "flex", alignItems: "center",
          justifyContent: "center", boxShadow: "0 6px 20px rgba(91,158,50,.4)",
          textDecoration: "none", transition: "transform .2s ease",
        }}
      >
        <span style={{ fontSize: "26px" }} aria-hidden="true">💬</span>
      </a>
    </>
  );
}
