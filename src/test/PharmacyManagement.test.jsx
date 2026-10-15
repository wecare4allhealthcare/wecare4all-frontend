import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (k, o) => (o && o.count !== undefined ? `${o.count} records` : k),
    i18n: { language: "en" },
  }),
}));

import PharmacyManagement from "../pages/admin/dashboard/PharmacyManagement";

const pharmacy = { id: "p1", name: "Arun Pharma and Surgicals", address: "No.2, Shenoy Nagar", city: "Chennai",
  phone: "9000000000", email: "a@b.c", is_active: false };

function mockApi({ pharmacies = [pharmacy], staff = [], orders = [] } = {}) {
  vi.stubGlobal("fetch", vi.fn((url) => {
    const body = String(url).includes("/admin/pharmacies") ? { pharmacies }
      : String(url).includes("/admin/pharmacy-staff") ? { staff }
      : String(url).includes("/admin/pharmacy-orders") ? { orders }
      : {};
    return Promise.resolve({ ok: true, json: async () => body });
  }));
}

const renderAt = (subtab) => render(
  <MemoryRouter initialEntries={[`/?tab=pharmacy&subtab=${subtab}`]}>
    <PharmacyManagement token="t" />
  </MemoryRouter>
);

describe("PharmacyManagement header count", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("counts pharmacies (not orders) on the Pharmacies tab", async () => {
    mockApi({ pharmacies: [pharmacy], orders: [] });
    renderAt("pharmacies");
    await waitFor(() => expect(screen.getByText("Arun Pharma and Surgicals")).toBeTruthy());
    expect(screen.getByText("1 records")).toBeTruthy();
    expect(screen.queryByText("0 records")).toBeNull();
  });

  it("counts orders on the All Orders tab", async () => {
    mockApi({ pharmacies: [pharmacy], orders: [] });
    renderAt("orders");
    await waitFor(() => expect(screen.getByText("0 records")).toBeTruthy());
  });

  it("shows no count on the Applications tab", async () => {
    mockApi();
    renderAt("applications");
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(screen.queryByText(/records$/)).toBeNull();
  });
});
