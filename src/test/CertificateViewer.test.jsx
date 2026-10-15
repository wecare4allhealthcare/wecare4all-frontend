import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const cfg = vi.hoisted(() => ({
  file: "/assets/certificates/iso-certificate.pdf",
  preview: "/assets/certificates/iso-certificate.webp",
  logo: "", standard: "ISO 7101:2023", scope: "Healthcare scope line", badgeLine: "Quality Research Organization",
  issuer: "", certNo: "", validUntil: "", verifyUrl: "",
  bodies: [
    { key: "certification", short: "QRO", name: "QRO Certification LLP", logo: "", url: "" },
    { key: "accreditation", short: "EGAC", name: "Egyptian Accreditation Council (EGAC)", logo: "", url: "" },
    { key: "assessment", short: "IAF", name: "International Accreditation Forum (IAF)", logo: "", url: "https://iaf.nu" },
  ],
}));
vi.mock("../config/certificates", () => ({ ISO_CERT: cfg, EURO_CERT: { descriptor: "Quality Management System" } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" } }) }));

import CertificateLink from "../components/CertificateViewer";

const allBodies = [...cfg.bodies];

describe("CertificateLink", () => {
  beforeEach(() => {
    cfg.preview = "/assets/certificates/iso-certificate.webp";
    cfg.bodies = allBodies;
    cfg.verifyUrl = "";
  });

  it("opens the viewer with the preview, scope and the three certification bodies, closes on Escape", () => {
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByAltText(/certificate/i).getAttribute("src")).toBe("/assets/certificates/iso-certificate.webp");
    expect(screen.getByText("Healthcare scope line")).toBeTruthy();
    expect(screen.getByText("Certification Body")).toBeTruthy();
    expect(screen.getByText("QRO Certification LLP")).toBeTruthy();
    expect(screen.getByText("Accreditation Body")).toBeTruthy();
    expect(screen.getByText("Egyptian Accreditation Council (EGAC)")).toBeTruthy();
    expect(screen.getByText("Assessment Association")).toBeTruthy();
    expect(screen.getByText("International Accreditation Forum (IAF)")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("falls back to the PDF link when the preview image is missing", () => {
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.error(screen.getByAltText(/certificate/i));
    expect(screen.getByText(/Preview not available/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Open full certificate/i }).getAttribute("href"))
      .toBe("/assets/certificates/iso-certificate.pdf");
  });

  it("still opens the viewer (bodies + PDF link) when there is no preview image", () => {
    cfg.preview = "";
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("QRO Certification LLP")).toBeTruthy();
    expect(screen.queryByText(/Preview not available/i)).toBeNull();
  });

  it("shows the IAF CertSearch verify link only when configured", () => {
    cfg.verifyUrl = "https://www.iafcertsearch.org/";
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("link", { name: /Verify this certificate/i }).getAttribute("href"))
      .toBe("https://www.iafcertsearch.org/");
  });

  it("opens the PDF directly in a new tab when there is nothing else to show", () => {
    cfg.preview = ""; cfg.bodies = [];
    render(<CertificateLink>View</CertificateLink>);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/assets/certificates/iso-certificate.pdf");
    expect(link.getAttribute("target")).toBe("_blank");
  });
});
