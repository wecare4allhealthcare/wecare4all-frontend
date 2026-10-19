import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const TXT = {
  en: {
    any: "Any pharmacy", anySub: "We will assign the nearest available pharmacy",
    pin: "Search by pincode", pinPh: "e.g. 600017", q: "Address, area or pharmacy name", qPh: "e.g. Shenoy Nagar",
    spec: "Specialisation", allSpecs: "All specialisations",
    loading: "Searching…", none: "No pharmacy matches. Try another pincode, address or specialisation, or choose “Any pharmacy”.",
    error: "Could not load pharmacies right now. You can still choose “Any pharmacy”.",
    showing: (n, t) => `Showing ${n} of ${t} pharmacies`, selected: "Selected", search: "Search pharmacies",
  },
  ta: {
    any: "ஏதேனும் மருந்தகம்", anySub: "அருகிலுள்ள கிடைக்கும் மருந்தகம் ஒதுக்கப்படும்",
    pin: "பின்கோடு மூலம் தேடு", pinPh: "எ.கா. 600017", q: "முகவரி, பகுதி அல்லது மருந்தகத்தின் பெயர்", qPh: "எ.கா. ஷெனாய் நகர்",
    spec: "சிறப்புத் துறை", allSpecs: "அனைத்து சிறப்புகள்",
    loading: "தேடுகிறது…", none: "பொருந்தும் மருந்தகம் இல்லை. வேறு பின்கோடு, முகவரி அல்லது சிறப்பை முயற்சிக்கவும், அல்லது “ஏதேனும் மருந்தகம்” தேர்வு செய்யவும்.",
    error: "இப்போது மருந்தகங்களை ஏற்ற முடியவில்லை. “ஏதேனும் மருந்தகம்” என்பதைத் தேர்வு செய்யலாம்.",
    showing: (n, t) => `${t} மருந்தகங்களில் ${n} காட்டப்படுகின்றன`, selected: "தேர்ந்தெடுக்கப்பட்டது", search: "மருந்தகங்களைத் தேடு",
  },
};

const field = {
  fontFamily: "'Inter',sans-serif", fontSize: "13px", padding: "9px 11px", border: "1px solid #cbd5e1",
  borderRadius: "8px", background: "#fff", boxSizing: "border-box", width: "100%",
};
const lbl = { fontFamily: "'Inter',sans-serif", fontSize: "12px", fontWeight: 600, color: "#334155", display: "block", marginBottom: "4px" };

/**
 * Pharmacy picker for Medicines Delivery: search by pincode, address/area/name and
 * specialisation. value = the chosen pharmacy object, or null for "Any pharmacy".
 * pincodeHint pre-fills the pincode filter (the customer's delivery pincode) until
 * the customer types their own.
 */
export default function PharmacySearch({ value, onChange, pincodeHint = "" }) {
  const { i18n } = useTranslation();
  const txt = String(i18n?.language || "en").startsWith("ta") ? TXT.ta : TXT.en;
  const [pincode, setPincode] = useState("");
  const [pinTouched, setPinTouched] = useState(false);
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("");
  const [specs, setSpecs] = useState([]);
  const [result, setResult] = useState({ pharmacies: null, total: 0 });   // pharmacies: null = loading
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!pinTouched && /^\d{6}$/.test(pincodeHint)) setPincode(pincodeHint);
  }, [pincodeHint, pinTouched]);

  useEffect(() => {
    let alive = true;
    fetch(`${API}/home-healthcare/pharmacies/specialisations`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((j) => { if (alive && Array.isArray(j?.specialisations)) setSpecs(j.specialisations); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Debounced search whenever a filter changes.
  useEffect(() => {
    let alive = true;
    setResult((r) => ({ ...r, pharmacies: null }));
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (pincode) params.set("pincode", pincode);
      if (q.trim()) params.set("q", q.trim());
      if (spec) params.set("specialisation", spec);
      fetch(`${API}/home-healthcare/pharmacies/search?${params.toString()}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
        .then((j) => {
          if (!alive) return;
          setFailed(false);
          setResult({ pharmacies: Array.isArray(j?.pharmacies) ? j.pharmacies : [], total: Number(j?.total) || 0 });
        })
        .catch(() => { if (alive) { setFailed(true); setResult({ pharmacies: [], total: 0 }); } });
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [pincode, q, spec]);

  const list = result.pharmacies;
  const option = (selected, onPick, children, key) => (
    <button key={key} type="button" role="radio" aria-checked={selected} onClick={onPick}
      style={{ textAlign: "left", width: "100%", cursor: "pointer", fontFamily: "'Inter',sans-serif",
        padding: "10px 12px", borderRadius: "10px", font: "inherit",
        border: `1.5px solid ${selected ? "var(--wc-green)" : "#e2e8f0"}`,
        background: selected ? "var(--wc-sage)" : "#fff" }}>
      {children}
    </button>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
        <div>
          <label style={lbl} htmlFor="ps-pin">{txt.pin}</label>
          <input id="ps-pin" style={field} inputMode="numeric" maxLength={6} placeholder={txt.pinPh} value={pincode}
            onChange={(e) => { setPinTouched(true); setPincode(e.target.value.replace(/\D/g, "")); }} />
        </div>
        <div>
          <label style={lbl} htmlFor="ps-spec">{txt.spec}</label>
          <select id="ps-spec" style={field} value={spec} onChange={(e) => setSpec(e.target.value)}>
            <option value="">{txt.allSpecs}</option>
            {specs.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={lbl} htmlFor="ps-q">{txt.q}</label>
          <input id="ps-q" style={field} placeholder={txt.qPh} value={q} onChange={(e) => setQ(e.target.value)} maxLength={80} />
        </div>
      </div>

      <div role="radiogroup" aria-label={txt.search} style={{ display: "grid", gap: "8px" }}>
        {option(!value, () => onChange(null), (
          <>
            <span style={{ display: "block", fontSize: "13.5px", fontWeight: 700, color: "var(--wc-navy)" }}>{txt.any}</span>
            <span style={{ display: "block", fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{txt.anySub}</span>
          </>
        ), "any")}

        {list === null && <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0" }}>{txt.loading}</p>}
        {list !== null && failed && <p role="alert" style={{ fontSize: "12.5px", color: "#b45309", margin: "2px 0" }}>{txt.error}</p>}
        {list !== null && !failed && list.length === 0 && <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0" }}>{txt.none}</p>}

        {(list || []).map((p) => option(value?.id === p.id, () => onChange(p), (
          <>
            <span style={{ display: "block", fontSize: "13.5px", fontWeight: 700, color: "var(--wc-navy)" }}>
              {p.name}{value?.id === p.id ? ` · ${txt.selected}` : ""}
            </span>
            <span style={{ display: "block", fontSize: "12px", color: "#475569", marginTop: "2px" }}>
              {[p.address, p.city, p.pincode].filter(Boolean).join(", ")}
            </span>
            {p.specialisations?.length > 0 && (
              <span style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "6px" }}>
                {p.specialisations.map((s) => (
                  <span key={s} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: "#eef6e8", color: "#3f7d1e", fontWeight: 600 }}>{s}</span>
                ))}
              </span>
            )}
          </>
        ), p.id))}
      </div>
      {list && list.length > 0 && result.total > list.length && (
        <p style={{ fontSize: "11.5px", color: "#64748b", margin: "6px 0 0" }}>{txt.showing(list.length, result.total)}</p>
      )}
    </div>
  );
}
