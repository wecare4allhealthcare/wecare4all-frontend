import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "en" } }) }));

import PharmacySearch from "../components/PharmacySearch";

const ALL = [
  { id: "ph-1", name: "Arun Pharma and Surgicals", address: "Shenoy Nagar", city: "Chennai", pincode: "600030", specialisations: ["Surgical", "Generic medicines"] },
  { id: "ph-2", name: "Sri Sai Medicals", address: "T. Nagar", city: "Chennai", pincode: "600017", specialisations: ["Diabetic care"] },
];

function mockApi({ fail = false } = {}) {
  const fn = vi.fn((url) => {
    const u = String(url);
    if (u.endsWith("/pharmacies/specialisations")) return Promise.resolve({ ok: true, json: async () => ({ specialisations: ["Diabetic care", "Surgical"] }) });
    if (fail) return Promise.resolve({ ok: false, json: async () => ({}) });
    const sp = new URL(u).searchParams;
    const out = ALL.filter((p) => (!sp.get("pincode") || p.pincode.startsWith(sp.get("pincode")))
      && (!sp.get("q") || `${p.name} ${p.address}`.toLowerCase().includes(sp.get("q").toLowerCase()))
      && (!sp.get("specialisation") || p.specialisations.includes(sp.get("specialisation"))));
    return Promise.resolve({ ok: true, json: async () => ({ pharmacies: out, total: out.length }) });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
const lastSearch = (fn) => [...fn.mock.calls].reverse().map(([u]) => String(u)).find((u) => u.includes("/pharmacies/search"));

beforeEach(() => vi.restoreAllMocks());

describe("PharmacySearch", () => {
  it("lists pharmacies with address, pincode and specialisation tags, plus 'Any pharmacy' selected by default", async () => {
    mockApi();
    render(<PharmacySearch value={null} onChange={() => {}} />);
    expect(await screen.findByRole("radio", { name: /Arun Pharma and Surgicals/ })).toBeTruthy();
    expect(screen.getByText("Shenoy Nagar, Chennai, 600030")).toBeTruthy();
    expect(screen.getByText("Diabetic care", { selector: "span" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /Any pharmacy/ }).getAttribute("aria-checked")).toBe("true");
  });

  it("searches by pincode, by address text and by specialisation", async () => {
    const fn = mockApi();
    render(<PharmacySearch value={null} onChange={() => {}} />);
    await screen.findByRole("radio", { name: /Sri Sai Medicals/ });

    fireEvent.change(screen.getByLabelText("Search by pincode"), { target: { value: "600017" } });
    await waitFor(() => expect(lastSearch(fn)).toMatch(/pincode=600017/));
    await waitFor(() => expect(screen.queryByRole("radio", { name: /Arun Pharma/ })).toBeNull());
    expect(screen.getByRole("radio", { name: /Sri Sai Medicals/ })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Search by pincode"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Address, area or pharmacy name"), { target: { value: "shenoy" } });
    await waitFor(() => expect(lastSearch(fn)).toMatch(/q=shenoy/));
    await waitFor(() => expect(screen.queryByRole("radio", { name: /Sri Sai/ })).toBeNull());

    fireEvent.change(screen.getByLabelText("Address, area or pharmacy name"), { target: { value: "" } });
    await screen.findByRole("option", { name: "Diabetic care" });
    fireEvent.change(screen.getByLabelText("Specialisation"), { target: { value: "Diabetic care" } });
    await waitFor(() => expect(lastSearch(fn)).toMatch(/specialisation=Diabetic\+care/));
    await waitFor(() => expect(screen.queryByRole("radio", { name: /Arun Pharma/ })).toBeNull());
  });

  it("reports the chosen pharmacy, and 'Any pharmacy' clears it", async () => {
    mockApi();
    const onChange = vi.fn();
    const { rerender } = render(<PharmacySearch value={null} onChange={onChange} />);
    fireEvent.click(await screen.findByRole("radio", { name: /Sri Sai Medicals/ }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: "ph-2" }));
    rerender(<PharmacySearch value={ALL[1]} onChange={onChange} />);
    expect(screen.getByRole("radio", { name: /Sri Sai Medicals · Selected/ }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: /Any pharmacy/ }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("pre-fills the pincode from the hint until the customer types their own", async () => {
    const fn = mockApi();
    const { rerender } = render(<PharmacySearch value={null} onChange={() => {}} pincodeHint="" />);
    await screen.findByRole("radio", { name: /Sri Sai Medicals/ });
    rerender(<PharmacySearch value={null} onChange={() => {}} pincodeHint="600017" />);
    await waitFor(() => expect(screen.getByLabelText("Search by pincode").value).toBe("600017"));
    await waitFor(() => expect(lastSearch(fn)).toMatch(/pincode=600017/));
    fireEvent.change(screen.getByLabelText("Search by pincode"), { target: { value: "600030" } });
    rerender(<PharmacySearch value={null} onChange={() => {}} pincodeHint="600020" />);
    expect(screen.getByLabelText("Search by pincode").value).toBe("600030");
  });

  it("explains an empty result and a failed search, and 'Any pharmacy' stays available", async () => {
    mockApi();
    const { unmount } = render(<PharmacySearch value={null} onChange={() => {}} />);
    await screen.findByRole("radio", { name: /Sri Sai Medicals/ });
    fireEvent.change(screen.getByLabelText("Search by pincode"), { target: { value: "999999" } });
    expect(await screen.findByText(/No pharmacy matches/)).toBeTruthy();
    unmount();

    mockApi({ fail: true });
    render(<PharmacySearch value={null} onChange={() => {}} />);
    expect((await screen.findByRole("alert")).textContent).toMatch(/Could not load pharmacies/);
    expect(screen.getByRole("radio", { name: /Any pharmacy/ })).toBeTruthy();
  });
});
