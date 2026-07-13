/**
 * Tests for estimatePrice() in pages/public/HomeHealthcare.jsx.
 *
 * This mirrors calculate_price() in the backend (app/routes/home_healthcare.py)
 * on purpose — it's what shows the patient a live "Estimated Total" in the
 * booking modal *before* they confirm, instead of only finding out the real
 * price after booking (the Phase 5 fix). If this ever drifts out of sync
 * with the backend's calculation, the patient sees one number and gets
 * charged another — these tests exist to catch that drift.
 *
 * Reference dates (same ones used in the backend test suite):
 *   2026-07-11 = Saturday   (weekend)
 *   2026-07-12 = Sunday     (weekend)
 *   2026-07-13 = Monday     (weekday)
 */
import { describe, it, expect } from "vitest";
import { estimatePrice } from "../pages/public/HomeHealthcare.jsx";

describe("estimatePrice", () => {
  it("returns just the base price for a per_visit service on a weekday day slot", () => {
    const svc = { base_price: 500, price_unit: "per_visit", weekend_multiplier: 1, night_extra: 0 };
    const price = estimatePrice(svc, { booking_date: "2026-07-13", time_slot: "Morning (8AM–12PM)" });
    expect(price).toBe(500);
  });

  it("multiplies base price by duration for per_hour services", () => {
    const svc = { base_price: 300, price_unit: "per_hour", weekend_multiplier: 1, night_extra: 0 };
    const price = estimatePrice(svc, { booking_date: "2026-07-13", time_slot: "Morning (8AM–12PM)", duration_hours: 4 });
    expect(price).toBe(1200);
  });

  it("falls back to the base rate when duration hasn't been entered yet", () => {
    const svc = { base_price: 300, price_unit: "per_hour", weekend_multiplier: 1, night_extra: 0 };
    const price = estimatePrice(svc, { booking_date: "2026-07-13", time_slot: "Morning (8AM–12PM)" });
    expect(price).toBe(300);
  });

  it("applies the weekend multiplier on Saturday", () => {
    const svc = { base_price: 500, price_unit: "per_visit", weekend_multiplier: 1.15, night_extra: 0 };
    const price = estimatePrice(svc, { booking_date: "2026-07-11", time_slot: "Morning (8AM–12PM)" });
    expect(price).toBeCloseTo(575);
  });

  it("applies the weekend multiplier on Sunday", () => {
    const svc = { base_price: 500, price_unit: "per_visit", weekend_multiplier: 1.15, night_extra: 0 };
    const price = estimatePrice(svc, { booking_date: "2026-07-12", time_slot: "Morning (8AM–12PM)" });
    expect(price).toBeCloseTo(575);
  });

  it("does not apply the weekend multiplier on a weekday", () => {
    const svc = { base_price: 500, price_unit: "per_visit", weekend_multiplier: 1.15, night_extra: 0 };
    const price = estimatePrice(svc, { booking_date: "2026-07-13", time_slot: "Morning (8AM–12PM)" });
    expect(price).toBe(500);
  });

  it("applies the night surcharge for the night slot", () => {
    const svc = { base_price: 500, price_unit: "per_visit", weekend_multiplier: 1, night_extra: 150 };
    const price = estimatePrice(svc, { booking_date: "2026-07-13", time_slot: "Night (8PM–8AM)" });
    expect(price).toBe(650);
  });

  it("does not apply the night surcharge for day slots", () => {
    const svc = { base_price: 500, price_unit: "per_visit", weekend_multiplier: 1, night_extra: 150 };
    for (const slot of ["Morning (8AM–12PM)", "Afternoon (12PM–4PM)", "Evening (4PM–8PM)"]) {
      expect(estimatePrice(svc, { booking_date: "2026-07-13", time_slot: slot })).toBe(500);
    }
  });

  it("combines weekend, night, and hourly duration surcharges together", () => {
    // Saturday night, 3-hour per_hour booking: (200*3)=600, *1.2=720, +100=820
    const svc = { base_price: 200, price_unit: "per_hour", weekend_multiplier: 1.2, night_extra: 100 };
    const price = estimatePrice(svc, { booking_date: "2026-07-11", time_slot: "Night (8PM–8AM)", duration_hours: 3 });
    expect(price).toBeCloseTo(820);
  });

  it("returns 0 when no service is selected yet", () => {
    expect(estimatePrice(null, {})).toBe(0);
  });

  it("does not crash on a missing booking date", () => {
    const svc = { base_price: 500, price_unit: "per_visit", weekend_multiplier: 1.5, night_extra: 0 };
    expect(() => estimatePrice(svc, { time_slot: "Morning (8AM–12PM)" })).not.toThrow();
  });
});
