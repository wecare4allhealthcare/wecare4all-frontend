/**
 * Certificates shown on the site. TWO different certificates:
 *
 *   ISO_CERT  = ISO 9001:2015  - certification body QRO Certification LLP,
 *               accreditation body EGAC, assessment association IAF.
 *               Shown by the "ISO" badges (footer, home, contact, about,
 *               international patients, partner with us).
 *   EURO_CERT = ISO 7101:2023  - Euro Cert (Euro Cert Inspection Limited, UK).
 *               Shown by the existing "Euro Cert" badges; their
 *               "View certificate" link opens the 7101 certificate.
 *
 * To rename/replace a certificate file, edit ONLY this file and put the file in
 * public/assets/certificates/ .
 *
 *  show      : false hides that certificate's links/badges everywhere.
 *  file      : the certificate PDF/image (opens in a new tab). "" = no PDF link
 *              (the badge still opens the details pop-up if bodies are set).
 *  preview   : optional image of the certificate shown in the pop-up.
 *  standard  : exactly as on the certificate.
 *  scope     : certificate title line shown in the pop-up (optional).
 *  badgeLine : short line under "<standard> Certified" in the ISO badges.
 *  bodies    : who is behind the certificate, shown in the pop-up. `logo` is optional
 *              (admin has allowed using the logos): put the image files in
 *              public/assets/img/logo/ ; without a file a text tile (short) is shown.
 *  certSearch: IAF CertSearch mark (status badge). Fill `url` with the link to OUR
 *              certificate on iafcertsearch.org and `image` with the mark image
 *              IAF/QRO provides - use it unaltered, it must link to the database.
 *              Nothing is shown until `url` is filled.
 *  issuer / certNo / validUntil : optional extra rows (shown only if filled).
 *  logo      : optional badge-tile mark for the ISO badge.
 */
export const ISO_CERT = {
  show: true,
  file: "",                       // e.g. "/assets/certificates/iso-9001-certificate.pdf" once the PDF is added
  preview: "",
  logo: "",
  standard: "ISO 9001:2015",
  scope: "",
  badgeLine: "Quality Research Organization",
  issuer: "",
  certNo: "",
  validUntil: "",
  certSearch: { image: "/assets/img/logo/iaf_certsearch.webp", url: "" },
  bodies: [
    { key: "certification", short: "QRO", name: "QRO Certification LLP", logo: "/assets/img/logo/qro_logo.webp", url: "" },
    { key: "accreditation", short: "EGAC", name: "Egyptian Accreditation Council (EGAC)", logo: "/assets/img/logo/egac_logo.webp", url: "" },
    { key: "assessment", short: "IAF", name: "International Accreditation Forum (IAF)", logo: "/assets/img/logo/iaf_logo.webp", url: "https://iaf.nu" },
  ],
};

export const EURO_CERT = {
  show: true,
  file: "/assets/certificates/iso-7101-certificate.pdf",
  preview: "",
  logo: "/assets/img/logo/euro_logo.jpeg",
  standard: "ISO 7101:2023",
  scope: "Healthcare organization management \u2013 Management systems for quality in healthcare organizations \u2013 Requirements",
  // Line under "Euro Cert International Certified" in the footer badge.
  descriptor: "ISO 7101:2023 Healthcare Quality Management",
  issuer: "",
  certNo: "",
  validUntil: "",
  certSearch: { image: "", url: "" },
  bodies: [
    { key: "certification", short: "EURO CERT", name: "Euro Cert Inspection Limited, UK", logo: "/assets/img/logo/euro_logo.jpeg", url: "" },
  ],
};
