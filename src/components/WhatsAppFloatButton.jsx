/**
 * WhatsAppFloatButton.jsx — standalone, always-visible WhatsApp CTA.
 *
 * Client requirement (Aug 2026): "Need a floating CTA button for WhatsApp
 * irrespective of page a person goes."
 *
 * LABEL (Aug 2026, this pass — "it may not make a person understand what
 * it is... let that button be Chat with us"): was an icon-only circle
 * (💬 with no text). A first-time visitor has no way to know what an
 * unlabeled chat-bubble icon does before clicking it. Changed to a
 * pill shape with the icon AND the words "Chat with us" always visible
 * — no click/hover required to understand what it's for. Paired with
 * CallFloatButton.jsx, which got the matching "Call us" treatment in
 * the same pass.
 *
 * Layout: this button and CallFloatButton now share one flex container
 * (rendered together, anchored bottom-right at right:90px, to the LEFT
 * of FloatingFAQ's circle) using flexDirection:row-reverse + gap, so
 * the browser handles spacing between the two pills automatically
 * based on their real rendered width — no manual pixel math per button
 * needed even if the label text or font metrics change later. See
 * Layout.jsx for how the two are grouped.
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
        .wa-float-label { display:inline; }
        /* Very narrow phones (<380px) — drop to icon-only so two
           full-text pills plus the FAQ circle can't overflow the
           viewport edge. Covers virtually no real device in portrait,
           but protects against the extreme case. */
        @media (max-width:379px){
          .wa-float-btn{ padding:0!important; width:52px!important; justify-content:center!important; }
          .wa-float-label{ display:none; }
        }
      `}</style>

      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float-btn"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          height: "52px", borderRadius: "999px", padding: "0 20px 0 16px",
          background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
          boxShadow: "0 6px 20px rgba(91,158,50,.4)",
          textDecoration: "none", transition: "transform .2s ease", whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "22px" }} aria-hidden="true">💬</span>
        <span className="wa-float-label" style={{
          fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 700, color: "#fff",
        }}>Chat with us</span>
      </a>
    </>
  );
}
