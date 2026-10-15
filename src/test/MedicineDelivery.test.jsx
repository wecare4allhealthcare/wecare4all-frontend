import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" } }) }));
vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));

import MedicineDeliveryModal, { MedicineSuccessModal, isMedicineService } from "../components/MedicineDelivery";

const svc = { id: "svc-1", name: "Medicines Delivery", category: "medicines", base_price: 0 };
const slots = ["Morning (8AM–12PM)", "Afternoon (12PM–4PM)"];

const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

function setup() {
  const onBooked = vi.fn();
  render(<MedicineDeliveryModal svc={svc} timeSlots={slots} onClose={() => {}} onBooked={onBooked} />);
  fill("Full name", "Asha");
  fill("Mobile number", "9876543210");
  fill("Delivery address", "12, Test Street");
  fill("Medicines needed", "Paracetamol 500mg x 10");
  fireEvent.click(screen.getByLabelText("I understand and agree"));
  return onBooked;
}

describe("isMedicineService", () => {
  it("matches by category or by name", () => {
    expect(isMedicineService({ category: "Medicines" })).toBe(true);
    expect(isMedicineService({ name: "Medicines Delivery" })).toBe(true);
    expect(isMedicineService({ category: "diagnostics", name: "ECG" })).toBe(false);
  });
});

describe("MedicineDeliveryModal", () => {
  beforeEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

  it("requires an area when 'Select area' is chosen", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Request delivery" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/select your area/i);
  });

  it("rejects a pincode outside Chennai", async () => {
    setup();
    fireEvent.click(screen.getByRole("radio", { name: "Enter pincode" }));
    fill("Pincode", "560001");
    fireEvent.click(screen.getByRole("button", { name: "Request delivery" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/only inside Chennai/i);
  });

  it("sends the booking with area, address and medicines, then reports success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ booking_id: "abcdef12-0000" }) });
    vi.stubGlobal("fetch", fetchMock);
    const onBooked = setup();
    fill("Area", "T. Nagar");
    fireEvent.click(screen.getByRole("button", { name: "Request delivery" }));
    await waitFor(() => expect(onBooked).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.service_id).toBe("svc-1");
    expect(body.visit_address).toBe("12, Test Street, T. Nagar, Chennai");
    expect(body.patient_mobile).toBe("9876543210");
    expect(body.notes).toMatch(/Area: T\. Nagar/);
    expect(body.notes).toMatch(/Medicines: Paracetamol/);
    expect(onBooked.mock.calls[0][0].isMedicine).toBe(true);
  });

  it("accepts a valid Chennai pincode instead of an area", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ booking_id: "x" }) });
    vi.stubGlobal("fetch", fetchMock);
    const onBooked = setup();
    fireEvent.click(screen.getByRole("radio", { name: "Enter pincode" }));
    fill("Pincode", "600017");
    fireEvent.click(screen.getByRole("button", { name: "Request delivery" }));
    await waitFor(() => expect(onBooked).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).visit_address).toMatch(/Chennai - 600017$/);
  });

  it("shows the backend error message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ detail: "Service not found" }) }));
    setup();
    fill("Area", "Adyar");
    fireEvent.click(screen.getByRole("button", { name: "Request delivery" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/Service not found/);
  });
});

describe("MedicineSuccessModal", () => {
  it("tells the customer the team will call", () => {
    render(<MedicineSuccessModal result={{ booking_id: "abcdef12-0000", mobile: "9876543210" }} onClose={() => {}} />);
    expect(screen.getByText(/will call you on 9876543210/)).toBeTruthy();
    expect(screen.getByText(/ABCDEF12/)).toBeTruthy();
  });
});
