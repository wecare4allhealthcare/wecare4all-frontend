import { useState } from "react";
import { useTranslation } from "react-i18next";
import CertificateLink, { useCertText } from "./CertificateViewer";
import { ISO_CERT } from "../config/certificates";

const COPY = {
  en: (c) => ({
    title: `${c.standard} Certified`,
    sub: `Our quality management system is certified${c.issuer ? ` by ${c.issuer}` : ""}.`,
  }),
  ta: (c) => ({
    title: `${c.standard} சான்றிதழ் பெற்றது`,
    sub: `எங்கள் தர மேலாண்மை அமைப்பு${c.issuer ? ` ${c.issuer}` : ""} மூலம் சான்றளிக்கப்பட்டது.`,
  }),
};

/** Compact "ISO certified" band for the home page (sits under the trust section). */
export default function CertificationStrip() {
  const { i18n } = useTranslation();
  const txt = useCertText();
  const [thumbOk, setThumbOk] = useState(true);
  if (!ISO_CERT.file) return null;

  const lang = String(i18n?.language || "en").startsWith("ta") ? "ta" : "en";
  const { title, sub } = COPY[lang](ISO_CERT);
  const showThumb = ISO_CERT.preview && thumbOk;

  return (
    <section aria-label={title} style={{ background: "var(--wc-sage)", padding: "36px 0", borderTop: "1px solid var(--wc-border)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap",
          background: "#fff", border: "1px solid var(--wc-border)", borderRadius: "14px", padding: "18px 22px" }}>
          {showThumb && (
            <CertificateLink ariaLabel={`${txt.view} - ${ISO_CERT.standard}`}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>
              <img src={ISO_CERT.preview} alt="" loading="lazy" width="64" height="88"
                onError={() => setThumbOk(false)}
                style={{ width: "64px", height: "88px", objectFit: "cover", borderRadius: "6px",
                  border: "1px solid #e2e8f0", display: "block" }} />
            </CertificateLink>
          )}
          <div style={{ flex: "1 1 260px", minWidth: 0 }}>
            <p style={{ margin: 0, fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: "18px",
              color: "var(--wc-navy)" }}>{title}</p>
            <p style={{ margin: "4px 0 0", fontFamily: "'Inter',sans-serif", fontSize: "13px",
              color: "var(--wc-muted)", lineHeight: 1.6 }}>{sub}</p>
          </div>
          <CertificateLink
            style={{ background: "var(--wc-green)", color: "#fff", border: "none", borderRadius: "999px",
              padding: "10px 20px", fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", textDecoration: "none", display: "inline-block" }}>
            {txt.view}
          </CertificateLink>
        </div>
      </div>
    </section>
  );
}
