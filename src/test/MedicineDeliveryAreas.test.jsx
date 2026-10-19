import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("../components/Toast", () => ({ showToast: vi.fn() }));

import MedicineDeliveryAreas, { PrescriptionButton, parseAreaLines } from "../pages/admin/dashboard/MedicineDeliveryAreas";
import { showToast } from "../components/Toast";

const ROWS = [
  { id: "a1", area_name: "T. Nagar", pincode: "600017", is_active: true },
  { id: "a2", area_name: "Adyar", pincode: "600020", is_active: false },
];

function mockApi(rows = ROWS) {
  const fn = vi.fn((url, opts = {}) => {
    const method = opts.method || "GET";
    const body = method === "GET" ? { areas: rows } : { status: "success", added: 2, skipped: 1 };
    return Promise.resolve({ ok: true, json: async () => body });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
const sent = (fn, method) => fn.mock.calls.filter(([, o]) => (o?.method || "GET") === method);

beforeEach(() => { vi.restoreAllMocks(); showToast.mockClear(); });

describe("parseAreaLines", () => {
  it("understands the common ways of writing area + pincode", () => {
    const { items, invalid } = parseAreaLines("Adyar, 600020\nT. Nagar - 600017\nVelachery 600042\n600032 Guindy\n\nnonsense line\nAdyar, 600020");
    expect(items).toEqual([
      { area_name: "Adyar", pincode: "600020" },
      { area_name: "T. Nagar", pincode: "600017" },
      { area_name: "Velachery", pincode: "600042" },
      { area_name: "Guindy", pincode: "600032" },
    ]);
    expect(invalid).toEqual(["nonsense line"]);
  });
});

describe("MedicineDeliveryAreas", () => {
  it("lists the areas with their status", async () => {
    mockApi();
    render(<MedicineDeliveryAreas token="t" />);
    expect(await screen.findByText("T. Nagar")).toBeTruthy();
    expect(screen.getByText("600020")).toBeTruthy();
    expect(screen.getByText("Hidden")).toBeTruthy();
  });

  it("adds one area and reloads", async () => {
    const fn = mockApi();
    render(<MedicineDeliveryAreas token="t" />);
    await screen.findByText("T. Nagar");
    fireEvent.change(screen.getByLabelText("Area / address"), { target: { value: "Guindy" } });
    fireEvent.change(screen.getByLabelText("Pincode"), { target: { value: "600032" } });
    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));
    await waitFor(() => expect(sent(fn, "POST")).toHaveLength(1));
    expect(JSON.parse(sent(fn, "POST")[0][1].body)).toEqual({ area_name: "Guindy", pincode: "600032" });
    expect(sent(fn, "POST")[0][1].headers.Authorization).toBe("Bearer t");
  });

  it("refuses a bad pincode without calling the server", async () => {
    const fn = mockApi();
    render(<MedicineDeliveryAreas token="t" />);
    await screen.findByText("T. Nagar");
    fireEvent.change(screen.getByLabelText("Area / address"), { target: { value: "Guindy" } });
    fireEvent.change(screen.getByLabelText("Pincode"), { target: { value: "6000" } });
    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));
    expect(showToast).toHaveBeenCalledWith("Pincode must be 6 digits", "error");
    expect(sent(fn, "POST")).toHaveLength(0);
  });

  it("bulk-adds pasted lines", async () => {
    const fn = mockApi();
    render(<MedicineDeliveryAreas token="t" />);
    await screen.findByText("T. Nagar");
    fireEvent.change(screen.getByLabelText("Bulk areas"), { target: { value: "Adyar, 600020\nGuindy, 600032" } });
    fireEvent.click(screen.getByRole("button", { name: /Add 2 areas/ }));
    await waitFor(() => expect(sent(fn, "POST")).toHaveLength(1));
    expect(sent(fn, "POST")[0][0]).toMatch(/medicine-areas\/bulk$/);
    expect(JSON.parse(sent(fn, "POST")[0][1].body).items).toHaveLength(2);
    await waitFor(() => expect(showToast).toHaveBeenCalledWith("Added 2, skipped 1 that already existed", "success"));
  });

  it("hides/shows and deletes (after confirmation)", async () => {
    const fn = mockApi();
    vi.stubGlobal("confirm", vi.fn(() => true));
    render(<MedicineDeliveryAreas token="t" />);
    await screen.findByText("T. Nagar");
    fireEvent.click(screen.getAllByRole("button", { name: "Hide" })[0]);
    await waitFor(() => expect(sent(fn, "PUT")).toHaveLength(1));
    expect(JSON.parse(sent(fn, "PUT")[0][1].body)).toEqual({ is_active: false });
    fireEvent.click(screen.getByRole("button", { name: "Delete Adyar" }));
    await waitFor(() => expect(sent(fn, "DELETE")).toHaveLength(1));
    expect(sent(fn, "DELETE")[0][0]).toMatch(/medicine-areas\/a2$/);
  });

  it("filters by area or pincode", async () => {
    mockApi();
    render(<MedicineDeliveryAreas token="t" />);
    await screen.findByText("T. Nagar");
    fireEvent.change(screen.getByLabelText("Search areas"), { target: { value: "600020" } });
    expect(screen.queryByText("T. Nagar")).toBeNull();
    expect(screen.getByText("Adyar")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Search areas"), { target: { value: "t. nag" } });
    expect(screen.queryByText("Adyar")).toBeNull();
    expect(screen.getByText("T. Nagar")).toBeTruthy();
  });
});

describe("PrescriptionButton", () => {
  it("opens the signed link in a new tab", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ url: "https://signed.example/x" }) })));
    const open = vi.fn();
    vi.stubGlobal("open", open);
    render(<PrescriptionButton token="t" bookingId="b1" />);
    fireEvent.click(screen.getByRole("button", { name: /View prescription/ }));
    await waitFor(() => expect(open).toHaveBeenCalledWith("https://signed.example/x", "_blank", "noopener"));
    expect(String(fetch.mock.calls[0][0])).toMatch(/admin\/bookings\/b1\/prescription$/);
  });

  it("shows the error when there is nothing to open", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false, json: async () => ({ detail: "No prescription uploaded for this booking" }) })));
    render(<PrescriptionButton token="t" bookingId="b2" />);
    fireEvent.click(screen.getByRole("button", { name: /View prescription/ }));
    await waitFor(() => expect(showToast).toHaveBeenCalledWith("No prescription uploaded for this booking", "error"));
  });
});
