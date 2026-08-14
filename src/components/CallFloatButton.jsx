/**
 * CallFloatButton.jsx — floating "Immediate Help" call button.
 *
 * Replaces the earlier fixed top contact strip (client feedback, Aug
 * 2026: "dont create seperate section for this, give floating call
 * button" — after first asking for a top strip, then for it to look
 * "professional... like button"). This follows the same floating-
 * action-button pattern already used elsewhere on the site
 * (SymptomChecker.jsx bottom-left, FloatingFAQ.jsx bottom-right)
 * instead of a dedicated header row, so it doesn't push page content
 * down or need every other fixed-offset element (Layout.jsx padding,
 * sticky filter bars) to be kept in sync with its height — the exact
 * kind of coordination bug that came up last time.
 *
 * Placement: bottom-right, to the LEFT of FloatingFAQ's chat button
 * (same row, not stacked) — chat is at bottom:24px/right:20px and is
 * ~58px wide, so this sits at right:90px, same bottom offset. Rendered
 * from Layout.jsx alongside the other floating buttons.
 */
export default function CallFloatButton() {
  return (
    <>
      <style>{`
        @keyframes callPulse {
          0%   { box-shadow: 0 0 0 0 rgba(4,120,87,.45); }
          70%  { box-shadow: 0 0 0 12px rgba(4,120,87,0); }
          100% { box-shadow: 0 0 0 0 rgba(4,120,87,0); }
        }
        .call-float-btn { animation: callPulse 2.6s ease-in-out infinite; }
        .call-float-btn:hover { animation: none; transform: translateY(-2px); }
      `}</style>
      <a
        href="tel:+919025786467"
        className="call-float-btn"
        aria-label="Call for immediate help: 90257 86467"
        title="Immediate Help: 90257 86467"
        style={{
          position: "fixed", bottom: "24px", right: "90px", zIndex: 998,
          width: "52px", height: "52px", borderRadius: "50%",
          background: "linear-gradient(135deg,#047857,#059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(4,120,87,.4)",
          textDecoration: "none", transition: "transform .2s ease",
        }}
      >
        <span style={{ fontSize: "22px" }} aria-hidden="true">📞</span>
      </a>
    </>
  );
}
