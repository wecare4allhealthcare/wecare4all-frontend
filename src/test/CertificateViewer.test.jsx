import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const cfg = vi.hoisted(() => ({
  show: true, file: "/assets/certificates/iso-9001-certificate.pdf", preview: "/assets/certificates/iso-9001.webp",
  logo: "", standard: "ISO 9001:2015", scope: "Scope line", badgeLine: "Quality Research Organization",
  issuer: "", certNo: "", validUntil: "", certSearch: { image: "", url: "" },
  bodies: [
    { key: "certification", short: "QRO", name: "QRO Certification LLP", logo: "", url: "" },
    { key: "accreditation", short: "EGAC", name: "Egyptian Accreditation Council (EGAC)", logo: "", url: "" },
    { key: "assessment", short: "IAF", name: "International Accreditation Forum (IAF)", logo: "", url: "https://iaf.nu" },
  ],
}));
const euro = vi.hoisted(() => ({
  show: true, file: "/assets/certificates/iso-7101-certificate.pdf", preview: "", logo: "", standard: "ISO 7101:2023",
  scope: "Healthcare scope line", descriptor: "ISO 7101:2023 Healthcare Quality Management", issuer: "", certNo: "", validUntil: "",
  certSearch: { image: "", url: "" },
  bodies: [{ key: "certification", short: "EC", name: "Euro Cert Inspection Limited, UK", logo: "", url: "" }],
}));
vi.mock("../config/certificates", () => ({ ISO_CERT: cfg, EURO_CERT: euro }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" } }) }));

import CertificateLink, { isCertShown } from "../components/CertificateViewer";

const base = JSON.parse(JSON.stringify(cfg));

beforeEach(() => { Object.assign(cfg, JSON.parse(JSON.stringify(base))); });

describe("ISO 9001:2015 certificate (QRO)", () => {
  it("opens the viewer with the preview, scope and the three certification bodies, closes on Escape", () => {
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("ISO 9001:2015")).toBeTruthy();
    expect(screen.getByAltText(/certificate/i).getAttribute("src")).toBe("/assets/certificates/iso-9001.webp");
    expect(screen.getByText("Certification Body")).toBeTruthy();
    expect(screen.getByText("QRO Certification LLP")).toBeTruthy();
    expect(screen.getByText("Accreditation Body")).toBeTruthy();
    expect(screen.getByText("Assessment Association")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("falls back to the PDF link when the preview image is missing", () => {
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.error(screen.getByAltText(/certificate/i));
    expect(screen.getByText(/Preview not available/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Open full certificate/i }).getAttribute("href"))
      .toBe("/assets/certificates/iso-9001-certificate.pdf");
  });

  it("works before the PDF exists: opens the viewer with the bodies and no PDF link", () => {
    cfg.file = ""; cfg.preview = "";
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("QRO Certification LLP")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Open full certificate/i })).toBeNull();
  });

  it("shows the IAF CertSearch link only once our certificate link is filled in", () => {
    const { unmount } = render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("link", { name: /Verify this certificate/i })).toBeNull();
    unmount();
    cfg.certSearch = { image: "", url: "https://www.iafcertsearch.org/certification/abc" };
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("link", { name: /Verify this certificate/i }).getAttribute("href"))
      .toBe("https://www.iafcertsearch.org/certification/abc");
  });

  it("opens the PDF directly in a new tab when there is nothing else to show", () => {
    cfg.preview = ""; cfg.bodies = [];
    render(<CertificateLink>View</CertificateLink>);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/assets/certificates/iso-9001-certificate.pdf");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("renders nothing when switched off or when there is nothing to show", () => {
    cfg.show = false;
    const { container, unmount } = render(<CertificateLink>View</CertificateLink>);
    expect(container.innerHTML).toBe("");
    unmount();
    Object.assign(cfg, JSON.parse(JSON.stringify(base)), { file: "", preview: "", bodies: [] });
    expect(isCertShown(cfg)).toBe(false);
  });
});

describe("Euro Cert certificate (ISO 7101:2023)", () => {
  it("opens the Euro Cert certificate with Euro Cert Inspection Limited, UK and its own PDF", () => {
    render(<CertificateLink cert={euro}>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("ISO 7101:2023")).toBeTruthy();
    expect(screen.getByText("Healthcare scope line")).toBeTruthy();
    expect(screen.getByText("Euro Cert Inspection Limited, UK")).toBeTruthy();
    expect(screen.queryByText("QRO Certification LLP")).toBeNull();
    expect(screen.getByRole("link", { name: /Open full certificate/i }).getAttribute("href"))
      .toBe("/assets/certificates/iso-7101-certificate.pdf");
  });
});
