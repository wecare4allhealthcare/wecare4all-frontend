/**
 * CallFloatButton.jsx — floating "Talk to a Care Coordinator" button.
 *
 * Was a single call-only icon. Client requirement (Aug 2026 strategy
 * review): "Add a prominent 'Talk to a Care Coordinator' WhatsApp/phone
 * CTA throughout the website rather than relying heavily on login/forms."
 *
 * Kept the exact same footprint/position as before (bottom-right, to the
 * LEFT of FloatingFAQ's chat bubble — see original placement note below)
 * instead of adding a 3rd icon to an already-busy floating-button row
 * (SymptomChecker + FloatingAd on the bottom-left, FloatingFAQ + this on
 * the bottom-right). Tapping/clicking it now expands upward into a small
 * "Talk to a Care Coordinator" panel with two clear options — Call Now
 * and WhatsApp — instead of jumping straight to a phone dialer. This is
 * NOT the same as FloatingFAQ.jsx (that's a self-serve FAQ chatbot with
 * hardcoded Q&A, no relation to WhatsApp or a live coordinator).
 *
 * Original placement note (still true): bottom-right, to the LEFT of
 * FloatingFAQ's chat button (same row, not stacked) — chat is at
 * bottom:24px/right:20px and is ~58px wide, so this sits at right:90px,
 * same bottom offset. Rendered from Layout.jsx alongside the other
 * floating buttons.
 */
import { useState, useEffect, useRef } from "react";

const PHONE_DISPLAY = "90257 86467";
const PHONE_TEL     = "+919025786467";
const WA_LINK       = "https://wa.me/919025786467?text=Hi%2C%20I%27d%20like%20to%20talk%20to%20a%20Care%20Coordinator";

export default function CallFloatButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onEsc   = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <>
      <style>{`
        @keyframes callPulse {
          0%   { box-shadow: 0 0 0 0 rgba(4,120,87,.45); }
          70%  { box-shadow: 0 0 0 12px rgba(4,120,87,0); }
          100% { box-shadow: 0 0 0 0 rgba(4,120,87,0); }
        }
        @keyframes carePanelIn {
          from { opacity:0; transform:translateY(8px) scale(.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .call-float-btn { animation: callPulse 2.6s ease-in-out infinite; }
        .call-float-btn.is-open { animation: none; }
        .call-float-btn:hover { transform: translateY(-2px); }
      `}</style>

      <div ref={ref} style={{ position:"fixed", bottom:"24px", right:"90px", zIndex:998 }}>
        {open && (
          <div role="dialog" aria-label="Talk to a Care Coordinator" style={{
            position:"absolute", bottom:"64px", right:"0", width:"228px",
            background:"#fff", borderRadius:"14px", padding:"14px",
            boxShadow:"0 14px 40px rgba(11,31,58,.28)",
            border:"1px solid var(--wc-border)", animation:"carePanelIn .18s ease-out",
          }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"16px",
              fontWeight:700, color:"var(--wc-navy)", margin:"0 0 3px" }}>
              Talk to a Care Coordinator
            </p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11.5px",
              color:"var(--wc-muted)", margin:"0 0 12px", lineHeight:1.5 }}>
              No login needed — reach a real person directly.
            </p>

            <a href={`tel:${PHONE_TEL}`} style={{
              display:"flex", alignItems:"center", gap:"9px",
              fontFamily:"'DM Sans',sans-serif", fontSize:"13px", fontWeight:600,
              color:"var(--wc-navy)", background:"var(--wc-sage)", border:"1px solid #86efac",
              borderRadius:"9px", padding:"10px 12px", textDecoration:"none",
              marginBottom:"8px",
            }}>
              <span aria-hidden="true" style={{ fontSize:"16px" }}>📞</span>
              <span>Call Now<br/><span style={{ fontWeight:400, fontSize:"11px", color:"var(--wc-green)" }}>{PHONE_DISPLAY}</span></span>
            </a>

            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
              display:"flex", alignItems:"center", gap:"9px",
              fontFamily:"'DM Sans',sans-serif", fontSize:"13px", fontWeight:600,
              color:"var(--wc-navy)", background:"#f0fdf9", border:"1px solid #25D366",
              borderRadius:"9px", padding:"10px 12px", textDecoration:"none",
            }}>
              <span aria-hidden="true" style={{ fontSize:"16px" }}>💬</span>
              <span>WhatsApp Us<br/><span style={{ fontWeight:400, fontSize:"11px", color:"#128C4A" }}>Usually replies fast</span></span>
            </a>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`call-float-btn${open ? " is-open" : ""}`}
          aria-label="Talk to a Care Coordinator"
          aria-expanded={open}
          title="Talk to a Care Coordinator"
          style={{
            width:"52px", height:"52px", borderRadius:"50%", border:"none",
            background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 6px 20px rgba(4,120,87,.4)",
            cursor:"pointer", transition:"transform .2s ease",
          }}
        >
          <span style={{ fontSize:"22px" }} aria-hidden="true">{open ? "✕" : "📞"}</span>
        </button>
      </div>
    </>
  );
}
