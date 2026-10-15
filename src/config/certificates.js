/**
 * ISO certificate settings.
 *
 * This is the ONLY file to edit when the certificate file is renamed,
 * replaced or renewed. Put the file(s) in:  public/assets/certificates/
 *
 *  file     : the certificate itself (PDF or image). Opens in a new tab.
 *  preview  : optional image (jpg/png/webp) shown in the pop-up viewer.
 *             Use "" if you only have the PDF.
 *  logo     : optional small mark for the badge tile, same idea as
 *             /assets/img/logo/euro_logo.webp. Use the certifying body's
 *             mark from the certificate. Missing/"" = a text tile "ISO 9001".
 *  standard : CHECK this against the certificate (e.g. "ISO 9001:2015").
 *  issuer   : certifying body exactly as written on the certificate.
 *             Leave "" unless the certificate names it. Euro Cert and ISO are
 *             separate accreditations, so the site must NOT say the ISO
 *             certificate was issued by Euro Cert (client feedback).
 *  certNo / validUntil : optional. Left empty = not shown on the site.
 *
 * To hide the ISO badges and links everywhere, set  file: ""
 */
export const ISO_CERT = {
  file: "/assets/certificates/iso-certificate.pdf",
  preview: "/assets/certificates/iso-certificate.webp",
  logo: "/assets/img/logo/iso_logo.webp",
  standard: "ISO 9001:2015",
  issuer: "",
  certNo: "",
  validUntil: "",
};
