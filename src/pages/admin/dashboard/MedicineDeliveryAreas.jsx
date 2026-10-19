import { useCallback, useEffect, useMemo, useState } from "react";
import { API } from "./shared";
import { showToast } from "../../../components/Toast";

const font = "'Inter',sans-serif";
const input = {
  fontFamily: font, fontSize: "13px", padding: "9px 11px", border: "1px solid #cbd5e1",
  borderRadius: "8px", background: "#fff", boxSizing: "border-box", width: "100%",
};
const btn = (bg, color) => ({
  fontFamily: font, fontSize: "12px", fontWeight: 700, padding: "7px 13px", border: "none",
  borderRadius: "8px", cursor: "pointer", background: bg, color,
});

/**
 * Turns pasted text into {area_name, pincode} pairs. One per line, any of:
 *   T. Nagar, 600017  |  T. Nagar - 600017  |  T. Nagar 600017  |  600017 T. Nagar
 */
export function parseAreaLines(text) {
  const items = [];
  const invalid = [];
  const seen = new Set();
  for (const raw of String(text || "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    let m = line.match(/^(.*?)[\s,;:|\-–—]+(\d{6})$/);
    let name; let pin;
    if (m) { name = m[1]; pin = m[2]; }
    else if ((m = line.match(/^(\d{6})[\s,;:|\-–—]+(.+)$/))) { pin = m[1]; name = m[2]; }
    name = (name || "").replace(/[\s,;:|\-–—]+$/, "").trim();
    if (!name || !pin) { invalid.push(line); continue; }
    const key = `${name.toLowerCase()}|${pin}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ area_name: name, pincode: pin });
  }
  return { items, invalid };
}

export default function MedicineDeliveryAreas({ token }) {
  const [areas, setAreas] = useState(null);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [bulk, setBulk] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const headers = useMemo(() => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }), [token]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/home-healthcare/admin/medicine-areas`, { headers });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.detail || "Could not load the areas");
      setAreas(json.areas || []);
    } catch (e) {
      setAreas([]);
      showToast(e.message, "error");
    }
  }, [headers]);

  useEffect(() => { load(); }, [load]);

  const call = async (path, method, body) => {
    const res = await fetch(`${API}/home-healthcare/admin/medicine-areas${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(typeof json.detail === "string" ? json.detail : "Request failed");
    return json;
  };

  const run = async (fn, okMsg) => {
    setBusy(true);
    try { const r = await fn(); if (okMsg) showToast(okMsg(r), "success"); await load(); return true; }
    catch (e) { showToast(e.message, "error"); return false; }
    finally { setBusy(false); }
  };

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showToast("Enter the area name", "error");
    if (!/^\d{6}$/.test(pin.trim())) return showToast("Pincode must be 6 digits", "error");
    const ok = await run(() => call("", "POST", { area_name: name.trim(), pincode: pin.trim() }), () => "Area added");
    if (ok) { setName(""); setPin(""); }
  };

  const parsed = useMemo(() => parseAreaLines(bulk), [bulk]);
  const addBulk = async () => {
    if (!parsed.items.length) return showToast("Nothing to add. Use one 'Area, 600017' per line.", "error");
    const ok = await run(() => call("/bulk", "POST", { items: parsed.items }),
      (r) => `Added ${r.added}, skipped ${r.skipped} that already existed`);
    if (ok) setBulk("");
  };

  const toggle = (a) => run(() => call(`/${a.id}`, "PUT", { is_active: !a.is_active }));
  const remove = (a) => {
    if (!window.confirm(`Delete ${a.area_name} (${a.pincode})?`)) return;
    run(() => call(`/${a.id}`, "DELETE"), () => "Area deleted");
  };

  const shown = (areas || []).filter((a) => {
    const s = q.trim().toLowerCase();
    return !s || a.area_name.toLowerCase().includes(s) || String(a.pincode).includes(s);
  });

  return (
    <div>
      <p style={{ fontFamily: font, fontSize: "13px", color: "#475569", margin: "0 0 14px", lineHeight: 1.6 }}>
        Customers choosing <b>Medicines Delivery</b> can only select these areas / pincodes. Until you add the first one,
        they see a built-in Chennai area list (without pincodes).
      </p>

      <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: "8px", alignItems: "end", marginBottom: "14px" }}>
        <div>
          <label htmlFor="mda-name" style={{ fontFamily: font, fontSize: "12px", fontWeight: 600, color: "#334155" }}>Area / address</label>
          <input id="mda-name" style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. T. Nagar" maxLength={80} />
        </div>
        <div>
          <label htmlFor="mda-pin" style={{ fontFamily: font, fontSize: "12px", fontWeight: 600, color: "#334155" }}>Pincode</label>
          <input id="mda-pin" style={input} value={pin} inputMode="numeric" maxLength={6} placeholder="600017"
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
        </div>
        <button type="submit" disabled={busy} style={btn("var(--wc-green,#5b9e32)", "#fff")}>+ Add</button>
      </form>

      <details style={{ marginBottom: "16px" }}>
        <summary style={{ fontFamily: font, fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "var(--wc-green,#5b9e32)" }}>
          Add many at once
        </summary>
        <textarea aria-label="Bulk areas" style={{ ...input, marginTop: "8px", minHeight: "110px" }} value={bulk}
          onChange={(e) => setBulk(e.target.value)} placeholder={"One per line:\nAdyar, 600020\nT. Nagar, 600017\nVelachery, 600042"} />
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "8px", flexWrap: "wrap" }}>
          <button type="button" disabled={busy || !parsed.items.length} onClick={addBulk} style={btn("var(--wc-green,#5b9e32)", "#fff")}>
            Add {parsed.items.length || ""} area{parsed.items.length === 1 ? "" : "s"}
          </button>
          {parsed.invalid.length > 0 && (
            <span style={{ fontFamily: font, fontSize: "12px", color: "#b45309" }}>
              {parsed.invalid.length} line{parsed.invalid.length === 1 ? "" : "s"} not understood: {parsed.invalid.slice(0, 2).join(" | ")}
            </span>
          )}
        </div>
      </details>

      <input aria-label="Search areas" style={{ ...input, marginBottom: "10px" }} value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Search area or pincode" />

      {areas === null ? (
        <p style={{ fontFamily: font, fontSize: "13px", color: "#64748b" }}>Loading…</p>
      ) : shown.length === 0 ? (
        <p style={{ fontFamily: font, fontSize: "13px", color: "#64748b" }}>
          {areas.length === 0 ? "No delivery areas added yet." : "No match."}
        </p>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {shown.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px", background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: "10px", padding: "10px 12px", opacity: a.is_active ? 1 : 0.6 }}>
              <span style={{ flex: 1, fontFamily: font, fontSize: "14px", fontWeight: 600, color: "#0f172a" }}>{a.area_name}</span>
              <span style={{ fontFamily: font, fontSize: "13px", color: "#334155", minWidth: "62px" }}>{a.pincode}</span>
              <span style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, color: a.is_active ? "#15803d" : "#92400e" }}>
                {a.is_active ? "● Active" : "Hidden"}
              </span>
              <button type="button" disabled={busy} onClick={() => toggle(a)} style={btn("#fef3c7", "#92400e")}>
                {a.is_active ? "Hide" : "Show"}
              </button>
              <button type="button" disabled={busy} onClick={() => remove(a)} aria-label={`Delete ${a.area_name}`} style={btn("#fee2e2", "#b91c1c")}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** "View prescription" button for a booking row (opens a short-lived link in a new tab). */
export function PrescriptionButton({ token, bookingId }) {
  const [loading, setLoading] = useState(false);
  const open = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/home-healthcare/admin/bookings/${bookingId}/prescription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof json.detail === "string" ? json.detail : "Could not open the prescription");
      window.open(json.url, "_blank", "noopener");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <button type="button" onClick={open} disabled={loading} style={btn("#e0f2fe", "#075985")}>
      {loading ? "Opening…" : "📄 View prescription"}
    </button>
  );
}
