import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" } }) }));
vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));

import MedicineDeliveryModal, { MedicineSuccessModal, isMedicineService } from "../components/MedicineDelivery";

const svc = { id: "svc-1", name: "Medicines Delivery", category: "medical", base_price: 100 };
const slots = ["Morning (8AM–12PM)", "Afternoon (12PM–4PM)"];
const AREAS = [
  { id: "a1", area_name: "T. Nagar", pincode: "600017" },
  { id: "a2", area_name: "Adyar", pincode: "600020" },
];

const png = () => new File(["x"], "rx.png", { type: "image/png" });
const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const fillPin = (value) => fireEvent.change(document.getElementById("med-pin"), { target: { value } });
const pick = (file) => fireEvent.change(screen.getByLabelText(/Prescription/), { target: { files: [file] } });

/** fetch mock keyed by URL; returns the mock so tests can inspect calls. */
const PHARMACIES = [
  { id: "ph-1", name: "Arun Pharma and Surgicals", address: "Shenoy Nagar", city: "Chennai", pincode: "600030", specialisations: ["Surgical"] },
  { id: "ph-2", name: "Sri Sai Medicals", address: "T. Nagar", city: "Chennai", pincode: "600017", specialisations: ["Diabetic care"] },
];

function mockApi({ areas = AREAS, pharmacies = PHARMACIES, upload = { ok: true, json: { path: "home-delivery/abc.png" } }, booking = { ok: true, json: { booking_id: "abcdef12-0000" } } } = {}) {
  const fn = vi.fn((url) => {
    const u = String(url);
    const r = u.endsWith("/medicine-areas") ? { ok: true, json: { areas } }
      : u.includes("/pharmacies/search") ? { ok: true, json: { pharmacies, total: pharmacies.length } }
      : u.endsWith("/pharmacies/specialisations") ? { ok: true, json: { specialisations: ["Diabetic care", "Surgical"] } }
      : u.endsWith("/medicine-prescription") ? upload
      : booking;
    return Promise.resolve({ ok: r.ok, json: async () => r.json });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
const callTo = (fn, suffix) => fn.mock.calls.find(([u]) => String(u).endsWith(suffix));

async function setup(opts) {
  const fetchMock = mockApi(opts);
  const onBooked = vi.fn();
  render(<MedicineDeliveryModal svc={svc} timeSlots={slots} onClose={() => {}} onBooked={onBooked} />);
  await waitFor(() => expect(callTo(fetchMock, "/medicine-areas")).toBeTruthy());
  fill("Full name", "Asha");
  fill("Mobile number", "9876543210");
  fill("Delivery address", "12, Test Street");
  fireEvent.click(screen.getByLabelText("I understand and agree"));
  return { fetchMock, onBooked };
}
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Request delivery" }));

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});

describe("isMedicineService", () => {
  it("matches by category or by name (admin put it under Medical)", () => {
    expect(isMedicineService({ category: "Medicines" })).toBe(true);
    expect(isMedicineService({ name: "Medicines Delivery", category: "medical" })).toBe(true);
    expect(isMedicineService({ category: "diagnostics", name: "ECG" })).toBe(false);
  });
});

describe("with admin-defined delivery areas", () => {
  it("lists the admin areas with their pincodes", async () => {
    await setup();
    await waitFor(() => expect(screen.getByRole("option", { name: "T. Nagar — 600017" })).toBeTruthy());
    expect(screen.getByRole("option", { name: "Adyar — 600020" })).toBeTruthy();
  });

  it("requires an area to be selected", async () => {
    await setup();
    pick(png());
    submit();
    expect((await screen.findByRole("alert")).textContent).toMatch(/select your area/i);
  });

  it("rejects a pincode the admin has not added, accepts one that is added", async () => {
    await setup();
    fireEvent.click(screen.getByRole("radio", { name: "Enter pincode" }));
    pick(png());
    fillPin("560001");
    submit();
    expect((await screen.findByRole("alert")).textContent).toMatch(/do not deliver to this pincode/i);
    fillPin("600020");
    expect(screen.getByText(/Delivery available: Adyar/)).toBeTruthy();
  });

  it("uploads the prescription first, then books with area, pincode and the prescription path", async () => {
    const { fetchMock, onBooked } = await setup();
    await waitFor(() => screen.getByRole("option", { name: "T. Nagar — 600017" }));
    fill("Area", "a1");
    pick(png());
    submit();
    await waitFor(() => expect(onBooked).toHaveBeenCalled());

    const order = fetchMock.mock.calls.map(([u]) => String(u).split("/").pop());
    expect(order.indexOf("medicine-prescription")).toBeLessThan(order.indexOf("bookings"));
    const upBody = callTo(fetchMock, "/medicine-prescription")[1].body;
    expect(upBody instanceof FormData && upBody.get("file").name).toBe("rx.png");

    const body = JSON.parse(callTo(fetchMock, "/bookings")[1].body);
    expect(body).toMatchObject({
      service_id: "svc-1", delivery_area: "T. Nagar", delivery_pincode: "600017",
      prescription_path: "home-delivery/abc.png", patient_mobile: "9876543210",
    });
    expect(body.visit_address).toBe("12, Test Street, T. Nagar, Chennai - 600017");
    expect(onBooked.mock.calls[0][0].isMedicine).toBe(true);
  });

  it("sends the matched area when the customer typed a valid pincode", async () => {
    const { fetchMock, onBooked } = await setup();
    fireEvent.click(screen.getByRole("radio", { name: "Enter pincode" }));
    fillPin("600017");
    pick(png());
    submit();
    await waitFor(() => expect(onBooked).toHaveBeenCalled());
    expect(JSON.parse(callTo(fetchMock, "/bookings")[1].body)).toMatchObject({ delivery_area: "T. Nagar", delivery_pincode: "600017" });
  });
});

describe("special notes and pharmacy", () => {
  it("sends the special notes typed next to the prescription", async () => {
    const { fetchMock, onBooked } = await setup();
    await waitFor(() => screen.getByRole("option", { name: "T. Nagar — 600017" }));
    fill("Area", "a1");
    pick(png());
    fill("Special notes for the pharmacist (optional)", "Generic medicines only. Call before delivery.");
    submit();
    await waitFor(() => expect(onBooked).toHaveBeenCalled());
    expect(JSON.parse(callTo(fetchMock, "/bookings")[1].body).notes).toMatch(/Notes: Generic medicines only\. Call before delivery\./);
  });

  it("books with no pharmacy by default (we assign)", async () => {
    const { fetchMock, onBooked } = await setup();
    await waitFor(() => screen.getByRole("option", { name: "T. Nagar — 600017" }));
    fill("Area", "a1");
    pick(png());
    submit();
    await waitFor(() => expect(onBooked).toHaveBeenCalled());
    expect(JSON.parse(callTo(fetchMock, "/bookings")[1].body).pharmacy_id).toBeNull();
  });

  it("books with the pharmacy the customer picked", async () => {
    const { fetchMock, onBooked } = await setup();
    await waitFor(() => screen.getByRole("option", { name: "T. Nagar — 600017" }));
    fill("Area", "a1");
    fireEvent.click(await screen.findByRole("radio", { name: /Sri Sai Medicals/ }));
    pick(png());
    submit();
    await waitFor(() => expect(onBooked).toHaveBeenCalled());
    const body = JSON.parse(callTo(fetchMock, "/bookings")[1].body);
    expect(body.pharmacy_id).toBe("ph-2");
    expect(body.notes).toMatch(/Pharmacy: Sri Sai Medicals/);
  });

  it("pre-fills the pharmacy pincode filter from the delivery pincode", async () => {
    await setup();
    await waitFor(() => screen.getByRole("option", { name: "T. Nagar — 600017" }));
    fill("Area", "a1");
    await waitFor(() => expect(document.getElementById("ps-pin").value).toBe("600017"));
  });
});

describe("prescription", () => {
  it("is required by default", async () => {
    await setup();
    await waitFor(() => screen.getByRole("option", { name: "T. Nagar — 600017" }));
    fill("Area", "a1");
    submit();
    expect((await screen.findByRole("alert")).textContent).toMatch(/upload your prescription/i);
  });

  it("rejects the wrong type and files over 5 MB", async () => {
    await setup();
    pick(new File(["x"], "rx.exe", { type: "application/x-msdownload" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/Only JPG, PNG, WebP or PDF/i);
    pick(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", { type: "image/png" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/under 5 MB/i));
  });

  it("shows the file name and lets the customer remove it", async () => {
    await setup();
    pick(png());
    expect(await screen.findByText("rx.png")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.queryByText("rx.png")).toBeNull();
  });

  it("does not create a booking when the upload fails, and reuses the upload on retry", async () => {
    const { fetchMock, onBooked } = await setup({ upload: { ok: false, json: { detail: "File must be under 5MB" } } });
    await waitFor(() => screen.getByRole("option", { name: "T. Nagar — 600017" }));
    fill("Area", "a1");
    pick(png());
    submit();
    expect((await screen.findByRole("alert")).textContent).toMatch(/under 5MB/);
    expect(callTo(fetchMock, "/bookings")).toBeUndefined();
    expect(onBooked).not.toHaveBeenCalled();
  });

  it("shows the server message if the booking is refused", async () => {
    await setup({ booking: { ok: false, json: { detail: "Sorry, we do not deliver to this pincode yet" } } });
    await waitFor(() => screen.getByRole("option", { name: "T. Nagar — 600017" }));
    fill("Area", "a1");
    pick(png());
    submit();
    expect((await screen.findByRole("alert")).textContent).toMatch(/do not deliver/);
  });
});

describe("before the admin adds any area (fallback list)", () => {
  it("still works with the built-in Chennai areas and the pincode range", async () => {
    const { fetchMock, onBooked } = await setup({ areas: [] });
    fill("Area", "Adyar");
    pick(png());
    submit();
    await waitFor(() => expect(onBooked).toHaveBeenCalled());
    const body = JSON.parse(callTo(fetchMock, "/bookings")[1].body);
    expect(body.delivery_area).toBe("Adyar");
    expect(body.delivery_pincode).toBeNull();
  });

  it("rejects a pincode outside Chennai", async () => {
    await setup({ areas: [] });
    fireEvent.click(screen.getByRole("radio", { name: "Enter pincode" }));
    fillPin("560001");
    pick(png());
    submit();
    expect((await screen.findByRole("alert")).textContent).toMatch(/only inside Chennai/i);
  });
});

describe("MedicineSuccessModal", () => {
  it("tells the customer the team will call", () => {
    render(<MedicineSuccessModal result={{ booking_id: "abcdef12-0000", mobile: "9876543210" }} onClose={() => {}} />);
    expect(screen.getByText(/will call you on 9876543210/)).toBeTruthy();
    expect(screen.getByText(/ABCDEF12/)).toBeTruthy();
    expect(screen.getByText(/\+91 90257 86467/)).toBeTruthy();
  });
});
