import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../config/certificates", () => ({
  ISO_CERT: {
    file: "/assets/certificates/iso-certificate.pdf", preview: "/assets/certificates/iso-certificate.webp",
    logo: "/assets/img/logo/iso_logo.webp", standard: "ISO 7101:2023", scope: "",
    issuer: "Euro Cert Inspection Limited, UK", certNo: "", validUntil: "",
  },
  EURO_CERT: { descriptor: "Quality Research Organization" },
}));

let lang = "en";
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: lang } }),
}));

import IsoBadge, { IsoCredibilityText } from "../components/IsoBadge";

describe("IsoBadge", () => {
  it.each(["footer", "hero", "contact", "about", "pill", "card"])("renders the %s variant and opens the certificate", (variant) => {
    lang = "en";
    render(<IsoBadge variant={variant} />);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toMatch(/ISO 7101/);
    fireEvent.click(btn);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("shows the text mark when the logo image is missing", () => {
    lang = "en";
    render(<IsoBadge variant="footer" />);
    fireEvent.error(document.querySelector("img"));
    expect(screen.getByRole("button").textContent).toMatch(/ISO\s*7101/);
  });

  it("switches to Tamil text", () => {
    lang = "ta";
    render(<IsoBadge variant="contact" />);
    expect(screen.getByRole("button").textContent).toMatch(/சான்றிதழ் பெற்றது/);
  });

  it("adds the ISO standard to the Partner With Us credibility text", () => {
    lang = "en";
    const { container } = render(<p><IsoCredibilityText fallback="fallback" /></p>);
    expect(container.textContent).toMatch(/Euro Cert and ISO 7101:2023 certified/);
  });
});
