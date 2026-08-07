/**
 * currency.jsx — shared ₹/USD display helper.
 *
 * WHY THIS EXISTS: international (non-India) patients need to know
 * roughly what a ₹ fee costs them before deciding whether to pay via
 * Stripe. Payment.jsx already does this inline; this file makes the
 * same "₹500 (~$6.02)" pattern reusable anywhere else a patient-facing
 * fee is shown, without every page re-fetching /payment-settings or
 * re-implementing the conversion math.
 *
 * DELIBERATELY NOT used on staff-facing screens (doctor/hospital/
 * admin/pharmacy/lab dashboards, payouts, commissions, revenue
 * reports) — those are the platform's own internal INR settlement
 * figures. A doctor's payout or a hospital's commission is paid out
 * in INR regardless of which currency the patient originally paid in,
 * so showing a "$" estimate there would misrepresent what actually
 * gets deposited, not clarify anything. Only use this on screens a
 * PATIENT looks at to understand what THEY are being charged.
 *
 * Usage:
 *   import { Money, useExchangeRate } from "../../utils/currency";
 *   <Money amount={appt.payment_amount} />
 *   → renders: ₹500 <span class="dim">(~$6.02)</span>
 */
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Module-level cache so every <Money/> instance on a page shares one
// fetch instead of each firing its own request to /payment-settings.
let _ratePromise = null;
function _fetchRate() {
  if (!_ratePromise) {
    _ratePromise = fetch(`${API}/payment-settings`)
      .then(res => res.json())
      .then(json => (json?.usd_inr_rate > 0 ? json.usd_inr_rate : null))
      .catch(() => null);
  }
  return _ratePromise;
}

export function useExchangeRate() {
  const [rate, setRate] = useState(null);
  useEffect(() => { _fetchRate().then(setRate); }, []);
  return rate; // null until loaded (or if the fetch/rate is unavailable)
}

/**
 * Renders a ₹ amount with an approximate USD equivalent alongside it.
 * `usdStyle` lets the caller theme the smaller USD text to match its
 * own surrounding design (font, color, size) — default is a plain
 * muted inline span that works reasonably on any background.
 */
export function Money({ amount, usdStyle, showUsd = true }) {
  const rate = useExchangeRate();
  const n = Number(amount) || 0;
  return (
    <>
      ₹{n.toLocaleString("en-IN")}
      {showUsd && rate > 0 && (
        <span style={{ fontSize: "0.75em", color: "#94a3b8", marginLeft: "6px", ...usdStyle }}>
          (~${(n / rate).toFixed(2)})
        </span>
      )}
    </>
  );
}
