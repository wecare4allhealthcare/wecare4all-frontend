/**
 * ISO certificate settings.
 *
 * This is the ONLY file to edit when the certificate file is renamed,
 * replaced or renewed. Put the file(s) in:  public/assets/certificates/
 *
 *  file     : the certificate itself (PDF or image). Opens in a new tab.
 *  preview  : optional image (jpg/png/webp) shown in the pop-up viewer and
 *             as the thumbnail. Use "" if you only have the PDF.
 *  standard : CHECK this against the certificate (e.g. "ISO 9001:2015").
 *  issuer   : certifying body exactly as written on the certificate.
 *  certNo / validUntil : optional. Left empty = not shown on the site.
 *
 * To hide the certificate everywhere, set  file: ""
 */
export const ISO_CERT = {
  file: "/assets/certificates/iso-certificate.pdf",
  preview: "/assets/certificates/iso-certificate.webp",
  standard: "ISO 9001:2015",
  issuer: "Euro Cert International",
  certNo: "",
  validUntil: "",
};
