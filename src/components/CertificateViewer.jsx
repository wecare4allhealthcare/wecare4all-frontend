import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { ISO_CERT } from "../config/certificates";

const isPdf = (p) => /\.pdf($|\?)/i.test(p || "");

const TXT = {
  en: {
    view: "View certificate",
    close: "Close",
    openFull: "Open full certificate",
    missing: "Preview not available. Please open the full certificate below.",
    dialog: "Certificate",
    scope: "Scope",
    issuedBy: "Issued by",
    certNo: "Certificate No.",
    validUntil: "Valid until",
    certifiedBy: "Certification details",
    verify: "Verify this certificate on IAF CertSearch",
    visit: "Visit website",
    roles: { certification: "Certification Body", accreditation: "Accreditation Body", assessment: "Assessment Association" },
  },
  ta: {
    view: "சான்றிதழைப் பார்க்க",
    close: "மூடு",
    openFull: "முழு சான்றிதழைத் திற",
    missing: "முன்னோட்டம் கிடைக்கவில்லை. முழு சான்றிதழைக் கீழே திறக்கவும்.",
    dialog: "சான்றிதழ்",
    scope: "நோக்கம்",
    issuedBy: "வழங்கியது",
    certNo: "சான்றிதழ் எண்",
    validUntil: "செல்லுபடியாகும் நாள்",
    certifiedBy: "சான்றிதழ் விவரங்கள்",
    verify: "IAF CertSearch-ல் இந்தச் சான்றிதழைச் சரிபார்க்க",
    visit: "இணையதளம்",
    roles: { certification: "சான்றளிப்பு அமைப்பு", accreditation: "அங்கீகார அமைப்பு", assessment: "மதிப்பீட்டு சங்கம்" },
  },
};

export function useCertText() {
  const { i18n } = useTranslation();
  return String(i18n?.language || "en").startsWith("ta") ? TXT.ta : TXT.en;
}

function BodyCard({ body, roleLabel, visit }) {
  const [logoOk, setLogoOk] = useState(Boolean(body.logo));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px",
      border: "1px solid #e2e8f0", borderRadius: "10px" }}>
      <span style={{ width: "48px", height: "48px", flexShrink: 0, borderRadius: "8px", border: "1px solid #e2e8f0",
        background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 800, color: "var(--wc-navy)", textAlign: "center" }}>
        {logoOk
          ? <img src={body.logo} alt="" width="44" height="44" loading="lazy" onError={() => setLogoOk(false)}
              style={{ width: "44px", height: "44px", objectFit: "contain" }} />
          : (body.short || "")}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>{roleLabel}</span>
        <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "var(--wc-navy)" }}>{body.name}</span>
        {body.url && (
          <a href={body.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "12px", fontWeight: 600, color: "var(--wc-green-dark)" }}>{visit} →</a>
        )}
      </span>
    </div>
  );
}

/**
 * Wraps any content (text, badge, thumbnail) so that clicking it shows the
 * ISO certificate. With a preview image or certification bodies it opens an
 * in-page viewer (details + PDF link); otherwise it opens the PDF in a new tab
 * (the site CSP blocks embedding PDFs in-page, so we never use iframe/object).
 */
export default function CertificateLink({ children, className, style, ariaLabel }) {
  const txt = useCertText();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const closeRef = useRef(null);

  const file = ISO_CERT.file;
  const bodies = ISO_CERT.bodies || [];
  const imgSrc = ISO_CERT.preview || (file && !isPdf(file) ? file : "");

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!file) return null;
  const label = ariaLabel || `${txt.view} - ${ISO_CERT.standard}`;

  // Nothing to show in a viewer: plain link, opens the PDF in a new tab.
  if (!imgSrc && bodies.length === 0) {
    return (
      <a href={file} target="_blank" rel="noopener noreferrer"
        className={className} style={style} aria-label={label}>
        {children ?? txt.view}
      </a>
    );
  }

  const details = [
    ISO_CERT.scope && [txt.scope, ISO_CERT.scope],
    ISO_CERT.issuer && [txt.issuedBy, ISO_CERT.issuer],
    ISO_CERT.certNo && [txt.certNo, ISO_CERT.certNo],
    ISO_CERT.validUntil && [txt.validUntil, ISO_CERT.validUntil],
  ].filter(Boolean);

  return (
    <>
      <button type="button" className={className} style={style}
        aria-label={label} aria-haspopup="dialog"
        onClick={() => { setFailed(false); setOpen(true); }}>
        {children ?? txt.view}
      </button>
      {open && createPortal(
        <div role="presentation" onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(7,17,31,.82)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div role="dialog" aria-modal="true" aria-label={`${txt.dialog} - ${ISO_CERT.standard}`}
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: "14px", maxWidth: "min(94vw, 760px)", maxHeight: "92vh",
              overflow: "auto", padding: "16px", fontFamily: "'Inter',sans-serif", position: "relative" }}>
            <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label={txt.close}
              style={{ position: "absolute", top: "8px", right: "8px", width: "34px", height: "34px",
                borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer",
                fontSize: "18px", lineHeight: 1 }}>x</button>
            <p style={{ margin: "0 40px 10px 0", fontWeight: 700, color: "var(--wc-navy)", fontSize: "15px" }}>
              {ISO_CERT.standard}
            </p>
            {imgSrc && (failed ? (
              <p style={{ margin: "16px 0", color: "#475569", fontSize: "14px" }}>{txt.missing}</p>
            ) : (
              <img src={imgSrc} alt={`${ISO_CERT.standard} certificate`} onError={() => setFailed(true)}
                style={{ display: "block", width: "100%", maxHeight: "60vh", objectFit: "contain",
                  border: "1px solid #e2e8f0", borderRadius: "8px" }} />
            ))}
            {details.length > 0 && (
              <dl style={{ margin: "12px 0 0", fontSize: "13px", color: "#334155", display: "grid",
                gridTemplateColumns: "auto 1fr", gap: "4px 12px" }}>
                {details.map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt style={{ fontWeight: 600 }}>{k}</dt><dd style={{ margin: 0 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {bodies.length > 0 && (
              <div style={{ marginTop: "14px" }}>
                <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: 700, letterSpacing: "1.2px",
                  textTransform: "uppercase", color: "var(--wc-green)" }}>{txt.certifiedBy}</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {bodies.map((b) => (
                    <BodyCard key={b.key || b.name} body={b} roleLabel={txt.roles[b.key] || ""} visit={txt.visit} />
                  ))}
                </div>
              </div>
            )}
            {ISO_CERT.verifyUrl && (
              <a href={ISO_CERT.verifyUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", marginTop: "12px", fontSize: "13px", fontWeight: 600, color: "var(--wc-green-dark)" }}>
                {txt.verify} →
              </a>
            )}
            <a href={file} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: "12px", fontSize: "13px", fontWeight: 600,
                color: "var(--wc-green-dark)" }}>
              {txt.openFull} {isPdf(file) ? "(PDF)" : ""}
            </a>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
