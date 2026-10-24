import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../config/certificates", () => ({
  ISO_CERT: {
    file: "/assets/certificates/iso-certificate.pdf", preview: "/assets/certificates/iso-certificate.webp",
    logo: "/assets/img/logo/iso_logo.webp", standard: "ISO 9001:2015", scope: "",
    badgeLine: "Quality Research Organization", show: true, issuer: "", certNo: "", validUntil: "", certSearch: { image: "", url: "" },
    bodies: [{ key: "certification", short: "QRO", name: "QRO Certification LLP", logo: "", url: "" }],
  },
  EURO_CERT: { show: true, file: "/assets/certificates/iso-7101-certificate.pdf", preview: "", logo: "", standard: "ISO 7101:2023",
    scope: "", descriptor: "ISO 7101:2023 Healthcare Quality Management", issuer: "", certNo: "", validUntil: "", certSearch: { image: "", url: "" },
    bodies: [{ key: "certification", short: "EC", name: "Euro Cert Inspection Limited, UK", logo: "", url: "" }] },
}));

let lang = "en";
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: lang } }),
}));

import IsoBadge, { IsoCredibilityText, EuroCertLink } from "../components/IsoBadge";

describe("IsoBadge", () => {
  it.each(["footer", "hero", "contact", "about", "pill", "card"])("renders the %s variant and opens the certificate", (variant) => {
    lang = "en";
    render(<IsoBadge variant={variant} />);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toMatch(/ISO 9001/);
    fireEvent.click(btn);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("shows the text mark when the logo image is missing", () => {
    lang = "en";
    render(<IsoBadge variant="footer" />);
    fireEvent.error(document.querySelector("img"));
    expect(screen.getByRole("button").textContent).toMatch(/ISO\s*9001/);
  });

  it("switches to Tamil text", () => {
    lang = "ta";
    render(<IsoBadge variant="contact" />);
    expect(screen.getByRole("button").textContent).toMatch(/சான்றிதழ் பெற்றது/);
  });

  it("adds the ISO standard to the Partner With Us credibility text", () => {
    lang = "en";
    const { container } = render(<p><IsoCredibilityText fallback="fallback" /></p>);
    expect(container.textContent).toMatch(/Euro Cert and ISO 9001:2015 certified/);
  });

  it("names the certification body in the card text and the badge line in the footer badge", () => {
    lang = "en";
    const { unmount } = render(<IsoBadge variant="card" />);
    expect(screen.getByRole("button").textContent).toMatch(/by QRO Certification LLP/);
    unmount();
    render(<IsoBadge variant="footer" />);
    expect(screen.getByRole("button").textContent).toMatch(/Quality Research Organization/);
  });

  it("Euro Cert link opens the ISO 7101:2023 certificate", () => {
    render(<EuroCertLink />);
    fireEvent.click(screen.getByRole("button", { name: /View certificate - ISO 7101:2023/ }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Euro Cert Inspection Limited, UK")).toBeTruthy();
  });
});
