/**
 * CallFloatButton.jsx — floating "Call us" button, direct tel: link.
 *
 * SIMPLIFIED (Aug 2026, this pass — "let that button be Chat with us
 * and Call us"): this used to be a single icon-only circle (📞, no
 * label) that expanded into a small panel with "Call Now" and
 * "WhatsApp Us" options on click. Now that WhatsAppFloatButton.jsx is
 * its own always-visible, clearly-labeled button, the WhatsApp option
 * inside this panel became a duplicate entry point for the same
 * action — and the icon-only collapsed state had the same "person
 * doesn't know what it does" problem WhatsAppFloatButton just got
 * fixed for. Simplified to match: a single pill with the phone icon
 * and the words "Call us" always visible, a direct tel: link with no
 * extra tap needed to see what it does or to act on it.
 *
 * Layout: rendered together with WhatsAppFloatButton in one flex
 * container (see Layout.jsx) anchored bottom-right, to the LEFT of
 * FloatingFAQ's circle — flexDirection:row-reverse + gap so the two
 * pills space themselves out based on real rendered width.
 */
const PHONE_TEL = "+919025786467";

export default function CallFloatButton() {
  return (
    <>
      <style>{`
        @keyframes callPulse {
          0%   { box-shadow: 0 0 0 0 rgba(91,158,50,.45); }
          70%  { box-shadow: 0 0 0 12px rgba(91,158,50,0); }
          100% { box-shadow: 0 0 0 0 rgba(91,158,50,0); }
        }
        .call-float-btn { animation: callPulse 2.6s ease-in-out infinite; }
        .call-float-btn:hover { transform: translateY(-2px); }
        .call-float-label { display:inline; }
        @media (max-width:379px){
          .call-float-btn{ padding:0!important; width:52px!important; justify-content:center!important; }
          .call-float-label{ display:none; }
        }
      `}</style>

      <a
        href={`tel:${PHONE_TEL}`}
        className="call-float-btn"
        aria-label="Call us — 90257 86467"
        title="Call us — 90257 86467"
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          height: "52px", borderRadius: "999px", padding: "0 20px 0 16px",
          background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
          boxShadow: "0 6px 20px rgba(91,158,50,.4)",
          textDecoration: "none", transition: "transform .2s ease", whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "20px" }} aria-hidden="true">📞</span>
        <span className="call-float-label" style={{
          fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: "#fff",
        }}>Call us</span>
      </a>
    </>
  );
}
