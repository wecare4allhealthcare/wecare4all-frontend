import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const cfg = vi.hoisted(() => ({
  file: "/assets/certificates/iso-certificate.pdf",
  preview: "/assets/certificates/iso-certificate.webp",
  logo: "", standard: "ISO 7101:2023", scope: "Healthcare scope line",
  issuer: "Euro Cert Inspection Limited, UK", certNo: "", validUntil: "",
}));
vi.mock("../config/certificates", () => ({ ISO_CERT: cfg, EURO_CERT: { descriptor: "Quality Research Organization" } }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" } }) }));

import CertificateLink from "../components/CertificateViewer";

describe("CertificateLink", () => {
  beforeEach(() => { cfg.preview = "/assets/certificates/iso-certificate.webp"; });

  it("opens the viewer with the preview image, details and closes on Escape", () => {
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByAltText(/certificate/i).getAttribute("src")).toBe("/assets/certificates/iso-certificate.webp");
    expect(screen.getByText("Euro Cert Inspection Limited, UK")).toBeTruthy();
    expect(screen.getByText("Healthcare scope line")).toBeTruthy();
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

  it("opens the PDF directly in a new tab when there is no preview image", () => {
    cfg.preview = "";
    render(<CertificateLink>View</CertificateLink>);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/assets/certificates/iso-certificate.pdf");
    expect(link.getAttribute("target")).toBe("_blank");
  });
});
