/**
 * ISO certificate settings.
 *
 * This is the ONLY file to edit when the certificate file is renamed,
 * replaced or renewed. Put the file(s) in:  public/assets/certificates/
 *
 *  file     : the certificate itself (PDF or image). Opens in a new tab.
 *  preview  : optional image of the certificate (jpg/png/webp). With a preview
 *             the badges open an in-page viewer (preview + details + PDF link);
 *             with "" they open the PDF directly in a new tab.
 *  logo     : optional small mark for the badge tile. Missing/"" = text tile "ISO 7101".
 *  standard : exactly as on the certificate.
 *  scope    : certificate title line, shown in the viewer (optional).
 *  issuer   : certifying body exactly as written at the bottom of the certificate.
 *  certNo / validUntil : optional. Left empty = not shown on the site.
 *
 * To hide the ISO badges and links everywhere, set  file: ""
 */
export const ISO_CERT = {
  file: "/assets/certificates/iso-certificate.pdf",
  preview: "",
  logo: "/assets/img/logo/iso_logo.webp",
  standard: "ISO 7101:2023",
  scope: "Healthcare organization management \u2013 Management systems for quality in healthcare organizations \u2013 Requirements",
  issuer: "Euro Cert Inspection Limited, UK",
  certNo: "",
  validUntil: "",
};

/**
 * Wording shown under the existing Euro Cert badge in the footer
 * ("Euro Cert International Certified"). Euro Cert is a different accreditation
 * from the ISO certificate (client feedback).
 */
export const EURO_CERT = {
  descriptor: "Quality Research Organization",
};
