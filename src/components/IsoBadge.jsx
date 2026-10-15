import { useState } from "react";
import { useTranslation } from "react-i18next";
import CertificateLink from "./CertificateViewer";
import { ISO_CERT } from "../config/certificates";

const TXT = {
  en: {
    certified: "Certified",
    sub: "Quality Management System",
    view: "View certificate",
    float: "CERTIFIED",
    about: "Certified Quality Standard",
    cardTitle: "Certification",
    cardDesc: (std, issuer) => `Our healthcare quality management system is certified to ${std}${issuer ? ` by ${issuer}` : ""}. Click to view the certificate.`,
  },
  ta: {
    certified: "சான்றிதழ் பெற்றது",
    sub: "தர மேலாண்மை அமைப்பு",
    view: "சான்றிதழைப் பார்க்க",
    float: "சான்றிதழ்",
    about: "சான்றளிக்கப்பட்ட தர தரநிலை",
    cardTitle: "சான்றிதழ்",
    cardDesc: (std, issuer) => `எங்கள் தர மேலாண்மை அமைப்பு ${std} தரத்திற்கு${issuer ? ` ${issuer} மூலம்` : ""} சான்றளிக்கப்பட்டது. சான்றிதழைப் பார்க்க கிளிக் செய்யவும்.`,
  },
};

// "ISO 7101:2023" -> "7101" for the fallback text tile.
const stdNumber = (s) => (String(s || "").match(/\d{3,5}/) || [""])[0];

// Logo tile content: the logo image, or a small text mark if it is missing.
function Mark({ imgSize, fallbackStyle, imgStyle, dark }) {
  const [ok, setOk] = useState(Boolean(ISO_CERT.logo));
  if (ok) {
    return (
      <img loading="lazy" src={ISO_CERT.logo} alt="" width={imgSize} height={imgSize}
        style={{ width: `${imgSize}px`, height: `${imgSize}px`, objectFit: "contain", ...imgStyle }}
        onError={() => setOk(false)} />
    );
  }
  return (
    <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, textAlign: "center", lineHeight: 1.2,
      color: dark ? "#fff" : "var(--wc-navy)", ...fallbackStyle }}>
      ISO{stdNumber(ISO_CERT.standard) && <><br />{stdNumber(ISO_CERT.standard)}</>}
    </span>
  );
}

const reset = { border: "none", margin: 0, cursor: "pointer", textAlign: "left", textDecoration: "none", font: "inherit" };

/**
 * ISO certificate badge, styled like the existing Euro Cert badges.
 * variant: "footer" | "hero" | "contact" | "about". Click opens the certificate.
 */
export default function IsoBadge({ variant = "footer" }) {
  const { i18n } = useTranslation();
  if (!ISO_CERT.file) return null;
  const txt = String(i18n?.language || "en").startsWith("ta") ? TXT.ta : TXT.en;
  const title = `${ISO_CERT.standard} ${txt.certified}`;

  if (variant === "hero") {
    return (
      <CertificateLink ariaLabel={`${txt.view} - ${ISO_CERT.standard}`}
        style={{ ...reset, position: "absolute", bottom: "-14px", right: "-14px", background: "#fff",
          borderRadius: "11px", padding: "9px 13px", boxShadow: "0 8px 26px rgba(0,0,0,.28)",
          display: "flex", alignItems: "center", gap: "7px" }}>
        <span style={{ width: "26px", height: "26px", background: "var(--wc-navy)", borderRadius: "6px",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <Mark imgSize={22} dark fallbackStyle={{ fontSize: "7px" }} />
        </span>
        <span>
          <span style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "9px", fontWeight: 800,
            color: "var(--wc-navy)", letterSpacing: ".4px" }}>{ISO_CERT.standard.split(":")[0]}</span>
          <span style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "10px",
            color: "var(--wc-green)", fontWeight: 700 }}>{txt.float}</span>
        </span>
      </CertificateLink>
    );
  }

  if (variant === "contact") {
    return (
      <CertificateLink ariaLabel={`${txt.view} - ${ISO_CERT.standard}`}
        style={{ ...reset, width: "100%", boxSizing: "border-box",
          background: "linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))", borderRadius: "13px",
          padding: "20px", display: "flex", alignItems: "center", gap: "13px", color: "#fff" }}>
        <span style={{ width: "44px", height: "44px", background: "#fff", borderRadius: "9px", display: "flex",
          alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          <Mark imgSize={40} fallbackStyle={{ fontSize: "8px" }} />
        </span>
        <span>
          <span style={{ display: "block", fontFamily: "'Inter',sans-serif", color: "#fff", fontWeight: 700, fontSize: "14px" }}>{title}</span>
          <span style={{ display: "block", fontFamily: "'Inter',sans-serif", color: "var(--wc-green-pale)", fontSize: "12px", marginTop: "3px" }}>
            ✓ {txt.sub} — {txt.view}
          </span>
        </span>
      </CertificateLink>
    );
  }

  if (variant === "about") {
    return (
      <CertificateLink ariaLabel={`${txt.view} - ${ISO_CERT.standard}`}
        style={{ ...reset, width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", gap: "11px",
          marginTop: "12px", padding: "12px 14px", background: "rgba(91,158,50,.15)",
          border: "1px solid rgba(16,185,129,.22)", borderRadius: "10px" }}>
        <span style={{ width: "32px", height: "32px", background: "#fff", borderRadius: "7px", display: "flex",
          alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          <Mark imgSize={28} fallbackStyle={{ fontSize: "7px" }} />
        </span>
        <span style={{ fontFamily: "'Inter',sans-serif", color: "var(--wc-green-pale)", fontSize: "12px", fontWeight: 600 }}>
          {ISO_CERT.standard} {txt.about}
        </span>
      </CertificateLink>
    );
  }

  if (variant === "pill") {
    // International Patients hero chip - same look as the Euro Cert chip.
    return (
      <CertificateLink ariaLabel={`${txt.view} - ${ISO_CERT.standard}`} className="ip-badge-pill glass"
        style={{ cursor: "pointer", font: "inherit", margin: 0, textAlign: "left" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--wc-green-pale)" }} aria-hidden="true">
          <circle cx="12" cy="8" r="5" /><path d="M8.5 12.5 7 21l5-2.5L17 21l-1.5-8.5" />
        </svg>
        <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: 600, color: "rgba(255,255,255,.88)" }}>{title}</span>
      </CertificateLink>
    );
  }

  if (variant === "card") {
    // International Patients "vetting" card - same look as the Euro Cert card.
    return (
      <CertificateLink ariaLabel={`${txt.view} - ${ISO_CERT.standard}`} className="ip-card ip-card-glow-blue"
        style={{ background: "#fff", border: "1px solid var(--wc-border)", borderTop: "3px solid #1d4ed8",
          borderRadius: "16px", padding: "24px 22px", boxShadow: "0 2px 10px rgba(18,59,74,.05)",
          textAlign: "left", cursor: "pointer", font: "inherit", display: "block", width: "100%",
          height: "100%", boxSizing: "border-box" }}>
        <span style={{ display: "block", marginBottom: "14px" }}>
          <span className="icon-tile" style={{ width: "46px", height: "46px", background: "#eff6ff",
            border: "1.5px solid #bfdbfe", overflow: "hidden" }}>
            <Mark imgSize={28} fallbackStyle={{ fontSize: "8px" }} />
          </span>
        </span>
        <span style={{ display: "block", fontFamily: "'Manrope',sans-serif", fontSize: "15.5px", fontWeight: 700,
          color: "var(--wc-navy)", margin: "0 0 6px" }}>{`${ISO_CERT.standard} ${txt.cardTitle}`}</span>
        <span style={{ display: "block", fontFamily: "'Inter',sans-serif", fontSize: "12.5px", color: "var(--wc-muted)",
          lineHeight: 1.62, fontWeight: 300 }}>{txt.cardDesc(ISO_CERT.standard, ISO_CERT.issuer)}</span>
      </CertificateLink>
    );
  }

  // footer (trust bar)
  return (
    <CertificateLink ariaLabel={`${txt.view} - ${ISO_CERT.standard}`}
      style={{ ...reset, background: "none", padding: 0, display: "flex", alignItems: "center", gap: "14px" }}>
      <span style={{ width: "64px", height: "64px", background: "#fff", borderRadius: "10px", display: "flex",
        alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, padding: "4px",
        boxSizing: "border-box", boxShadow: "0 2px 12px rgba(255,255,255,.12)" }}>
        <Mark imgSize={56} fallbackStyle={{ fontSize: "10px" }} />
      </span>
      <span>
        <span style={{ display: "block", color: "#fff", fontSize: "13px", fontWeight: 700 }}>{title}</span>
        <span style={{ display: "block", color: "var(--wc-green-lighter)", fontSize: "12px", marginTop: "2px" }}>
          ✓ {txt.sub} — {txt.view}
        </span>
      </span>
    </CertificateLink>
  );
}

/** Partner With Us "Credibility & Trust" text: adds the ISO standard next to Euro Cert. */
export function IsoCredibilityText({ fallback }) {
  const { i18n } = useTranslation();
  if (!ISO_CERT.file) return fallback;
  return String(i18n?.language || "en").startsWith("ta")
    ? `Euro Cert மற்றும் ${ISO_CERT.standard} certified தளம் நோயாளர் நம்பிக்கையை உருவாக்குகிறது.`
    : `Euro Cert and ${ISO_CERT.standard} certified platform builds patient confidence.`;
}
