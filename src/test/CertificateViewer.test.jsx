import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: "en" } }),
}));

import CertificateLink from "../components/CertificateViewer";

describe("CertificateLink", () => {
  it("opens the viewer with the certificate image and closes on Escape", () => {
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByAltText(/certificate/i).getAttribute("src"))
      .toBe("/assets/certificates/iso-certificate.webp");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows a friendly message instead of a broken image when the file is missing", () => {
    render(<CertificateLink>View</CertificateLink>);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.error(screen.getByAltText(/certificate/i));
    expect(screen.getByText(/being updated/i)).toBeTruthy();
  });
});
