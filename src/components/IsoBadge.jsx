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
  },
  ta: {
    certified: "சான்றிதழ் பெற்றது",
    sub: "தர மேலாண்மை அமைப்பு",
    view: "சான்றிதழைப் பார்க்க",
    float: "சான்றிதழ்",
    about: "சான்றளிக்கப்பட்ட தர தரநிலை",
  },
};

// "ISO 9001:2015" -> "9001" for the fallback text tile.
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
