/**
 * ISO certificate settings.
 *
 * This is the ONLY file to edit when the certificate file is renamed,
 * replaced or renewed. Put the file(s) in:  public/assets/certificates/
 *
 *  file      : the certificate itself (PDF or image). Opens in a new tab.
 *  preview   : optional image of the certificate (jpg/png/webp), shown in the viewer.
 *  standard  : exactly as on the certificate.
 *  scope     : certificate title line, shown in the viewer (optional).
 *  badgeLine : the short line under "ISO 7101:2023 Certified" in the footer/contact badge.
 *  bodies    : who is behind the certificate, shown in the viewer as
 *              Certification Body / Accreditation Body / Assessment Association
 *              (same roles as the IAF CertSearch listing). `logo` is optional - add
 *              ONLY logos that the certification body (QRO) has supplied or allowed;
 *              without a logo a small text tile (short) is shown.
 *  verifyUrl : optional link to this certificate on IAF CertSearch (shown if filled).
 *  issuer    : optional extra "Issued by" row. The PDF prints "Euro Cert Inspection
 *              Limited, UK" at the bottom - fill it ONLY if the client wants it shown.
 *  certNo / validUntil : optional. Left empty = not shown on the site.
 *  logo      : optional badge-tile mark. Do NOT use ISO's own logo or stock
 *              "ISO certified" logos (they imply a different standard / are not licensed).
 *
 * To hide the ISO badges and links everywhere, set  file: ""
 */
export const ISO_CERT = {
  file: "/assets/certificates/iso-certificate.pdf",
  preview: "",
  logo: "",
  standard: "ISO 7101:2023",
  scope: "Healthcare organization management \u2013 Management systems for quality in healthcare organizations \u2013 Requirements",
  badgeLine: "Quality Research Organization",
  issuer: "",
  certNo: "",
  validUntil: "",
  verifyUrl: "",
  bodies: [
    { key: "certification", short: "QRO", name: "QRO Certification LLP", logo: "/assets/img/logo/qro_logo.webp", url: "" },
    { key: "accreditation", short: "EGAC", name: "Egyptian Accreditation Council (EGAC)", logo: "/assets/img/logo/egac_logo.webp", url: "" },
    { key: "assessment", short: "IAF", name: "International Accreditation Forum (IAF)", logo: "/assets/img/logo/iaf_logo.webp", url: "https://iaf.nu" },
  ],
};

/** Wording under the existing Euro Cert badge in the footer. */
export const EURO_CERT = {
  descriptor: "Quality Management System",
};
