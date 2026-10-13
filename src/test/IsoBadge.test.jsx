import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

let lang = "en";
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { language: lang } }),
}));

import IsoBadge from "../components/IsoBadge";

describe("IsoBadge", () => {
  it.each(["footer", "hero", "contact", "about"])("renders the %s variant and opens the certificate", (variant) => {
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
});
