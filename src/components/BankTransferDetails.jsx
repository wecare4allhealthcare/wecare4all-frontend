/**
 * BankTransferDetails.jsx — Sep 2026, client request: "add the account
 * details for payments under NEFT or IMPS transaction".
 *
 * One shared card rendered under the UPI QR/ID on every manual-payment
 * screen (ManualUpiPayment.jsx → home healthcare, hospital/company
 * subscriptions, pharmacy, lab tests, family plan; PartnerDashboardShell
 * → pharmacy/lab partner subscriptions; patient/Payment.jsx →
 * appointments). `bank` is the `bank_details` object returned by
 * GET /payment-settings, so admin edits show up everywhere at once.
 * Each value has a copy button — account numbers are easy to mistype.
 */
import { useState } from "react";

export default function BankTransferDetails({ bank }) {
  const [copied, setCopied] = useState("");
  if (!bank?.account_number) return null;

  const copy = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch { /* clipboard blocked — user can still select the text */ }
  };

  const rows = [
    ["account_name", "A/c. Name", bank.account_name],
    ["account_type", "A/c. Type", bank.account_type],
    ["account_number", "A/c. No", bank.account_number],
    ["bank_name", "Bank", bank.bank_name],
    ["ifsc", "IFSC", bank.ifsc],
  ].filter(([, , v]) => v);

  return (
    <div style={{ marginTop: "16px", background: "#f8fafc", border: "1px solid var(--wc-border)",
      borderRadius: "12px", padding: "14px", textAlign: "left" }}>
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12.5px", fontWeight: 700,
        color: "var(--wc-navy)", margin: "0 0 10px", textAlign: "center" }}>
        🏦 Or pay by bank transfer (NEFT / IMPS)
      </p>
      {rows.map(([key, label, value]) => (
        <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: "10px", padding: "6px 0", borderBottom: "1px dashed var(--wc-border)" }}>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "var(--wc-muted)", flexShrink: 0 }}>{label}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <strong style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "var(--wc-navy)",
              wordBreak: "break-all", textAlign: "right" }}>{value}</strong>
            {(key === "account_number" || key === "ifsc") && (
              <button type="button" onClick={() => copy(key, value)}
                style={{ border: "1px solid var(--wc-border)", background: "#fff", borderRadius: "6px",
                  padding: "2px 8px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
                  color: copied === key ? "var(--wc-green)" : "var(--wc-muted)", flexShrink: 0 }}>
                {copied === key ? "Copied" : "Copy"}
              </button>
            )}
          </span>
        </div>
      ))}
      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#6b7688", margin: "10px 0 0" }}>
        After the transfer, enter the transaction reference (UTR) number from your bank below.
      </p>
    </div>
  );
}
