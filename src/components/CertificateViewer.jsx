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

/** A certificate is shown when it is not switched off and has a PDF, an image or certification bodies to show. */
export function isCertShown(c) {
  if (!c || c.show === false) return false;
  return Boolean(c.file || c.preview || (c.bodies || []).length > 0);
}

export function useCertText() {
  const { i18n } = useTranslation();
  return String(i18n?.language || "en").startsWith("ta") ? TXT.ta : TXT.en;
}

/** IAF CertSearch status mark. Hidden if the image file is not there; the text link remains. */
function CertSearchMark({ image }) {
  const [ok, setOk] = useState(Boolean(image));
  if (!ok) return null;
  return <img src={image} alt="IAF CertSearch" height="56" loading="lazy" onError={() => setOk(false)}
    style={{ height: "56px", width: "auto", flexShrink: 0 }} />;
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
export default function CertificateLink({ children, className, style, ariaLabel, cert = ISO_CERT }) {
  const txt = useCertText();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const closeRef = useRef(null);

  const c = cert;
  const file = c.file || "";
  const bodies = c.bodies || [];
  const imgSrc = c.preview || (file && !isPdf(file) ? file : "");
  const certSearch = c.certSearch?.url ? c.certSearch : null;

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

  if (!isCertShown(c)) return null;
  const label = ariaLabel || `${txt.view} - ${c.standard}`;

  // Nothing to show in a viewer: plain link, opens the PDF in a new tab.
  if (!imgSrc && bodies.length === 0 && !certSearch) {
    return (
      <a href={file} target="_blank" rel="noopener noreferrer"
        className={className} style={style} aria-label={label}>
        {children ?? txt.view}
      </a>
    );
  }

  const details = [
    c.scope && [txt.scope, c.scope],
    c.issuer && [txt.issuedBy, c.issuer],
    c.certNo && [txt.certNo, c.certNo],
    c.validUntil && [txt.validUntil, c.validUntil],
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
          <div role="dialog" aria-modal="true" aria-label={`${txt.dialog} - ${c.standard}`}
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: "14px", maxWidth: "min(94vw, 760px)", maxHeight: "92vh",
              overflow: "auto", padding: "16px", fontFamily: "'Inter',sans-serif", position: "relative" }}>
            <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label={txt.close}
              style={{ position: "absolute", top: "8px", right: "8px", width: "34px", height: "34px",
                borderRadius: "50%", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer",
                fontSize: "18px", lineHeight: 1 }}>x</button>
            <p style={{ margin: "0 40px 10px 0", fontWeight: 700, color: "var(--wc-navy)", fontSize: "15px" }}>
              {c.standard}
            </p>
            {imgSrc && (failed ? (
              <p style={{ margin: "16px 0", color: "#475569", fontSize: "14px" }}>{txt.missing}</p>
            ) : (
              <img src={imgSrc} alt={`${c.standard} certificate`} onError={() => setFailed(true)}
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
            {certSearch && (
              <a href={certSearch.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px",
                  fontSize: "13px", fontWeight: 600, color: "var(--wc-green-dark)", textDecoration: "none" }}>
                <CertSearchMark image={certSearch.image} />
                <span>{txt.verify} →</span>
              </a>
            )}
            {file && (
              <a href={file} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", marginTop: "12px", fontSize: "13px", fontWeight: 600,
                  color: "var(--wc-green-dark)" }}>
                {txt.openFull} {isPdf(file) ? "(PDF)" : ""}
              </a>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
