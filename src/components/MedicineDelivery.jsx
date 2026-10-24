import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import PharmacySearch from "./PharmacySearch";
import {
  MEDICINE_CATEGORIES, CHENNAI_AREAS, CHENNAI_PINCODE_RANGE, REQUIRE_PRESCRIPTION, MAX_PRESCRIPTION_MB,
} from "../config/medicineDelivery";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const PHONE = "+91 90257 86467";
const RX_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** True for the Home Healthcare service that should open the medicines form. */
export function isMedicineService(svc) {
  if (!svc) return false;
  const cat = String(svc.category || "").trim().toLowerCase();
  return MEDICINE_CATEGORIES.includes(cat) || /medicines?\s+delivery/i.test(svc.name || "");
}

const TXT = {
  en: {
    title: "Medicines Delivery", sub: "Delivery inside Chennai",
    contact: "Contact details", name: "Full name", mobile: "Mobile number", email: "Email (optional)",
    where: "Delivery location (Chennai only)", byArea: "Select area", byPin: "Enter pincode",
    area: "Area", areaPh: "Select your area in Chennai", loadingAreas: "Loading areas…",
    pin: "Pincode", pinPh: "e.g. 600017", pinOk: (n) => `Delivery available: ${n}`,
    address: "Delivery address", addressPh: "Door no., street, landmark",
    details: "Your order", rxTitle: "Prescription", rxChoose: "Choose file", rxRemove: "Remove",
    rxHint: (mb) => `JPG, PNG, WebP or PDF, up to ${mb} MB`, rxReq: "required",
    pharmacyTitle: "Pharmacy (optional)",
    notes: "Special notes for the pharmacist (optional)", notesPh: "e.g. generic medicines only, call before delivery, allergies to avoid",
    date: "Preferred delivery date", slot: "Preferred time",
    rx: "Prescription-only medicines are delivered only after our pharmacist verifies a valid prescription.",
    agree: "I understand and agree",
    free: "Free delivery", fee: (f) => `Delivery charge: ₹${f}`, bill: "You pay the delivery charge online after you submit. The medicine cost is paid directly to the delivery person when the pharmacy delivers your medicines.",
    submit: "Request delivery", sending: "Sending…", uploading: "Uploading prescription…", close: "Close",
    eName: "Please enter your name.", eMobile: "Please enter a valid 10-digit mobile number.",
    eArea: "Please select your area.", ePin: "Please enter a valid 6-digit pincode.",
    eOutside: "Sorry, we currently deliver only inside Chennai.", eNotServed: "Sorry, we do not deliver to this pincode yet.",
    eAddress: "Please enter the delivery address.",
    eRx: "Please upload your prescription.", eNeed: "Please upload a prescription or describe the medicines you need in the notes.",
    eRxType: "Only JPG, PNG, WebP or PDF files are allowed.", eRxSize: (mb) => `The file must be under ${mb} MB.`,
    eUpload: "Could not upload the prescription. Please try again.",
    eDate: "Please choose a delivery date.", eAgree: "Please tick the confirmation box.",
    eFail: "Could not place the request. Please try again.",
    okTitle: "Request received",
    ok: (m) => `Our pharmacy team will call you on ${m} to verify the prescription and confirm the medicines and the delivery time. Pay for the medicines directly to the delivery person on delivery.`,
    ref: "Reference", help: `Questions? Call ${PHONE}`,
  },
  ta: {
    title: "மருந்து விநியோகம்", sub: "சென்னைக்குள் விநியோகம்",
    contact: "தொடர்பு விவரங்கள்", name: "முழு பெயர்", mobile: "மொபைல் எண்", email: "மின்னஞ்சல் (விருப்பம்)",
    where: "விநியோக இடம் (சென்னை மட்டும்)", byArea: "பகுதியைத் தேர்வு செய்க", byPin: "பின்கோடு உள்ளிடுக",
    area: "பகுதி", areaPh: "சென்னையில் உங்கள் பகுதியைத் தேர்வு செய்க", loadingAreas: "பகுதிகள் ஏற்றப்படுகின்றன…",
    pin: "பின்கோடு", pinPh: "எ.கா. 600017", pinOk: (n) => `விநியோகம் உண்டு: ${n}`,
    address: "விநியோக முகவரி", addressPh: "கதவு எண், தெரு, அடையாளம்",
    details: "உங்கள் ஆர்டர்", rxTitle: "மருந்துச்சீட்டு", rxChoose: "கோப்பைத் தேர்வு செய்க", rxRemove: "நீக்கு",
    rxHint: (mb) => `JPG, PNG, WebP அல்லது PDF, ${mb} MB வரை`, rxReq: "கட்டாயம்",
    pharmacyTitle: "மருந்தகம் (விருப்பம்)",
    notes: "மருந்தாளருக்கான சிறப்புக் குறிப்புகள் (விருப்பம்)", notesPh: "எ.கா. ஜெனரிக் மருந்துகள் மட்டும், விநியோகத்துக்கு முன் அழைக்கவும், தவிர்க்க வேண்டிய ஒவ்வாமை",
    date: "விரும்பும் விநியோக தேதி", slot: "விரும்பும் நேரம்",
    rx: "மருந்துச்சீட்டு தேவைப்படும் மருந்துகள், எங்கள் மருந்தாளர் செல்லுபடியாகும் மருந்துச்சீட்டை சரிபார்த்த பிறகே வழங்கப்படும்.",
    agree: "புரிந்துகொண்டு ஒப்புக்கொள்கிறேன்",
    free: "இலவச விநியோகம்", fee: (f) => `விநியோகக் கட்டணம்: ₹${f}`, bill: "சமர்ப்பித்த பிறகு விநியோகக் கட்டணத்தை ஆன்லைனில் செலுத்த வேண்டும். மருந்தகம் உங்கள் மருந்துகளை வழங்கும்போது, மருந்துகளுக்கான தொகையை டெலிவரி நபரிடமே நேரடியாகச் செலுத்துங்கள்.",
    submit: "விநியோகம் கோரு", sending: "அனுப்புகிறது…", uploading: "மருந்துச்சீட்டு பதிவேற்றப்படுகிறது…", close: "மூடு",
    eName: "உங்கள் பெயரை உள்ளிடவும்.", eMobile: "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
    eArea: "உங்கள் பகுதியைத் தேர்வு செய்யவும்.", ePin: "சரியான 6 இலக்க பின்கோடை உள்ளிடவும்.",
    eOutside: "மன்னிக்கவும், தற்போது சென்னைக்குள் மட்டுமே விநியோகம் செய்கிறோம்.",
    eNotServed: "மன்னிக்கவும், இந்த பின்கோடுக்கு இன்னும் விநியோகம் இல்லை.",
    eAddress: "விநியோக முகவரியை உள்ளிடவும்.",
    eRx: "உங்கள் மருந்துச்சீட்டைப் பதிவேற்றவும்.", eNeed: "மருந்துச்சீட்டைப் பதிவேற்றவும் அல்லது தேவையான மருந்துகளைக் குறிப்புகளில் விவரிக்கவும்.",
    eRxType: "JPG, PNG, WebP அல்லது PDF கோப்புகள் மட்டுமே அனுமதிக்கப்படும்.", eRxSize: (mb) => `கோப்பு ${mb} MB-க்குள் இருக்க வேண்டும்.`,
    eUpload: "மருந்துச்சீட்டைப் பதிவேற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    eDate: "விநியோக தேதியைத் தேர்வு செய்யவும்.", eAgree: "உறுதிப்படுத்தும் பெட்டியில் டிக் செய்யவும்.",
    eFail: "கோரிக்கையை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    okTitle: "கோரிக்கை பெறப்பட்டது",
    ok: (m) => `எங்கள் மருந்தக குழு ${m} எண்ணில் அழைத்து மருந்துச்சீட்டை சரிபார்த்து, மருந்துகள் மற்றும் விநியோக நேரத்தை உறுதிப்படுத்தும். மருந்துகளுக்கான தொகையை விநியோகத்தின்போது டெலிவரி நபரிடமே செலுத்துங்கள்.`,
    ref: "குறிப்பு எண்", help: `கேள்விகள்? அழைக்கவும் ${PHONE}`,
  },
};

const useTxt = () => {
  const { i18n } = useTranslation();
  return String(i18n?.language || "en").startsWith("ta") ? TXT.ta : TXT.en;
};

const todayStr = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD (local)

const sectionHead = {
  fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 700, color: "var(--wc-green)",
  letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: "1px solid var(--wc-border)",
  paddingBottom: "6px", marginBottom: "12px",
};

export default function MedicineDeliveryModal({ svc, timeSlots = [], onClose, onBooked }) {
  const txt = useTxt();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "", mobile: user?.mobile || "", email: user?.email || "",
    mode: "area", areaId: "", area: "", pincode: "", address: "",
    date: todayStr(), slot: timeSlots[0] || "", notes: "", agree: false,
  });
  const [areas, setAreas] = useState(null);      // null = loading, [] = admin has not added any
  const [file, setFile] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);   // chosen pharmacy, or null = any
  const [preview, setPreview] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");          // "" | "upload" | "send"
  const uploaded = useRef(null);                 // {file, path}: do not upload the same file twice
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Admin-managed delivery areas (Admin > Home Healthcare > Delivery areas).
  useEffect(() => {
    let alive = true;
    fetch(`${API}/home-healthcare/medicine-areas`)
      .then((r) => (r.ok ? r.json() : { areas: [] }))
      .then((j) => { if (alive) setAreas(Array.isArray(j?.areas) ? j.areas : []); })
      .catch(() => { if (alive) setAreas([]); });
    return () => { alive = false; };
  }, []);

  // Small preview for image prescriptions.
  useEffect(() => {
    if (!file || !file.type.startsWith("image/") || typeof URL.createObjectURL !== "function") {
      setPreview(""); return undefined;
    }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => { if (typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(u); };
  }, [file]);

  const useApi = Array.isArray(areas) && areas.length > 0;
  const servedPins = useMemo(() => new Set((areas || []).map((a) => String(a.pincode))), [areas]);
  const fee = parseFloat(svc?.base_price) || 0;

  const pin = form.pincode.trim();
  const matchedAreas = useApi && /^\d{6}$/.test(pin) ? areas.filter((a) => String(a.pincode) === pin) : [];

  // The area/pincode that will be sent, whichever way the customer chose it.
  const delivery = (() => {
    if (useApi) {
      if (form.mode === "area") {
        const a = areas.find((x) => x.id === form.areaId);
        return { area: a?.area_name || "", pincode: a ? String(a.pincode) : "" };
      }
      return { area: matchedAreas[0]?.area_name || "", pincode: pin };
    }
    return form.mode === "area" ? { area: form.area, pincode: "" } : { area: "", pincode: pin };
  })();

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!RX_TYPES.includes(f.type)) { setErr(txt.eRxType); e.target.value = ""; return; }
    if (f.size > MAX_PRESCRIPTION_MB * 1024 * 1024) { setErr(txt.eRxSize(MAX_PRESCRIPTION_MB)); e.target.value = ""; return; }
    setErr(""); setFile(f);
  };

  const validate = () => {
    if (!form.name.trim()) return txt.eName;
    if (!/^\d{10}$/.test(form.mobile.replace(/\D/g, "").slice(-10))) return txt.eMobile;
    if (useApi) {
      if (form.mode === "area") { if (!form.areaId) return txt.eArea; }
      else {
        if (!/^\d{6}$/.test(pin)) return txt.ePin;
        if (!servedPins.has(pin)) return txt.eNotServed;
      }
    } else if (form.mode === "area") {
      if (!form.area) return txt.eArea;
    } else {
      if (!/^\d{6}$/.test(pin)) return txt.ePin;
      const n = Number(pin);
      if (n < CHENNAI_PINCODE_RANGE.min || n > CHENNAI_PINCODE_RANGE.max) return txt.eOutside;
    }
    if (!form.address.trim()) return txt.eAddress;
    if (REQUIRE_PRESCRIPTION ? !file : (!file && !form.notes.trim())) return REQUIRE_PRESCRIPTION ? txt.eRx : txt.eNeed;
    if (!form.date) return txt.eDate;
    if (!form.agree) return txt.eAgree;
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) { setErr(problem); return; }
    setErr("");
    const mobile = form.mobile.replace(/\D/g, "").slice(-10);
    try {
      // 1) upload the prescription (once), 2) create the booking that points to it
      let rxPath = uploaded.current && uploaded.current.file === file ? uploaded.current.path : null;
      if (file && !rxPath) {
        setBusy("upload");
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch(`${API}/home-healthcare/medicine-prescription`, { method: "POST", body: fd });
        const uj = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(typeof uj.detail === "string" ? uj.detail : txt.eUpload);
        rxPath = uj.path;
        uploaded.current = { file, path: rxPath };
      }
      setBusy("send");
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/home-healthcare/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          service_id: svc.id,
          booking_date: form.date,
          time_slot: form.slot || null,
          duration_hours: null,
          session_count: 1,
          visit_address: `${form.address.trim()}, ${delivery.area ? `${delivery.area}, ` : ""}Chennai${delivery.pincode ? ` - ${delivery.pincode}` : ""}`,
          visit_city: "Chennai",
          patient_name: form.name.trim(),
          patient_mobile: mobile,
          patient_email: form.email.trim(),
          delivery_area: delivery.area || null,
          delivery_pincode: delivery.pincode || null,
          prescription_path: rxPath,
          pharmacy_id: pharmacy?.id || null,
          notes: [
            "MEDICINES DELIVERY",
            delivery.area ? `Area: ${delivery.area}` : "",
            delivery.pincode ? `Pincode: ${delivery.pincode}` : "",
            pharmacy ? `Pharmacy: ${pharmacy.name}` : "",
            form.slot ? `Preferred time: ${form.slot}` : "",
            rxPath ? "Prescription: uploaded by the customer" : "Prescription: none uploaded",
            form.notes.trim() ? `Notes: ${form.notes.trim()}` : "",
          ].filter(Boolean).join(" | "),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof json.detail === "string" ? json.detail : txt.eFail);
      onBooked({ ...json, isMedicine: true, mobile });
    } catch (ex) {
      setErr(ex.message || txt.eFail);
    } finally {
      setBusy("");
    }
  };

  const loading = busy !== "";

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-label={txt.title}>
        <div style={{ background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", padding: "16px 20px",
          display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 1 }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: "17px", fontWeight: 700, margin: 0 }}>💊 {txt.title}</h3>
            <p style={{ color: "rgba(255,255,255,.8)", fontSize: "12px", margin: "3px 0 0", fontFamily: "'Inter',sans-serif" }}>
              {txt.sub} · {fee > 0 ? txt.fee(fee) : txt.free}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={txt.close}
            style={{ background: "rgba(255,255,255,.2)", border: "none", color: "#fff", width: "30px", height: "30px",
              borderRadius: "50%", cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ padding: "18px 20px 20px" }} noValidate>
          <div className="form-grid">
            <div className="form-full"><p style={sectionHead}>{txt.contact}</p></div>
            <div>
              <label className="book-lbl" htmlFor="med-name">{txt.name}</label>
              <input id="med-name" className="book-inp" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label className="book-lbl" htmlFor="med-mobile">{txt.mobile}</label>
              <input id="med-mobile" className="book-inp" type="tel" inputMode="numeric" value={form.mobile}
                onChange={(e) => set("mobile", e.target.value)} />
            </div>
            <div className="form-full">
              <label className="book-lbl" htmlFor="med-email">{txt.email}</label>
              <input id="med-email" className="book-inp" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>

            <div className="form-full"><p style={{ ...sectionHead, marginTop: "6px" }}>{txt.where}</p></div>
            <div className="form-full" role="radiogroup" aria-label={txt.where} style={{ display: "flex", gap: "8px" }}>
              {[["area", txt.byArea], ["pincode", txt.byPin]].map(([m, label]) => (
                <button key={m} type="button" role="radio" aria-checked={form.mode === m} onClick={() => set("mode", m)}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Inter',sans-serif",
                    fontSize: "13px", fontWeight: 600,
                    border: `1.5px solid ${form.mode === m ? "var(--wc-green)" : "#cbd5e1"}`,
                    background: form.mode === m ? "var(--wc-sage)" : "#fff",
                    color: form.mode === m ? "var(--wc-green)" : "#475569" }}>{label}</button>
              ))}
            </div>
            {form.mode === "area" ? (
              <div className="form-full">
                <label className="book-lbl" htmlFor="med-area">{txt.area}</label>
                {useApi ? (
                  <select id="med-area" className="book-inp" value={form.areaId} onChange={(e) => set("areaId", e.target.value)}>
                    <option value="">{txt.areaPh}</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{`${a.area_name} — ${a.pincode}`}</option>)}
                  </select>
                ) : (
                  <select id="med-area" className="book-inp" value={form.area} onChange={(e) => set("area", e.target.value)}>
                    <option value="">{areas === null ? txt.loadingAreas : txt.areaPh}</option>
                    {CHENNAI_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                )}
              </div>
            ) : (
              <div className="form-full">
                <label className="book-lbl" htmlFor="med-pin">{txt.pin}</label>
                <input id="med-pin" className="book-inp" inputMode="numeric" maxLength={6} placeholder={txt.pinPh}
                  value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />
                {matchedAreas.length > 0 && (
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "var(--wc-green)", margin: "5px 0 0" }}>
                    ✓ {txt.pinOk(matchedAreas.map((a) => a.area_name).join(", "))}
                  </p>
                )}
              </div>
            )}
            <div className="form-full">
              <label className="book-lbl" htmlFor="med-address">{txt.address}</label>
              <textarea id="med-address" className="book-inp" rows={2} style={{ resize: "vertical" }} placeholder={txt.addressPh}
                value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>

            <div className="form-full"><p style={{ ...sectionHead, marginTop: "6px" }}>{txt.pharmacyTitle}</p></div>
            <div className="form-full"><PharmacySearch value={pharmacy} onChange={setPharmacy} pincodeHint={delivery.pincode} /></div>

            <div className="form-full"><p style={{ ...sectionHead, marginTop: "6px" }}>{txt.details}</p></div>
            <div className="form-full">
              <label className="book-lbl" htmlFor="med-rx">
                {txt.rxTitle}{REQUIRE_PRESCRIPTION ? ` (${txt.rxReq})` : ""}
              </label>
              <input id="med-rx" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                onChange={onFile} style={{ display: file ? "none" : "block", fontFamily: "'Inter',sans-serif", fontSize: "13px" }} />
              {!file && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "11.5px", color: "#64748b", margin: "5px 0 0" }}>{txt.rxHint(MAX_PRESCRIPTION_MB)}</p>}
              {file && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px" }}>
                  {preview
                    ? <img src={preview} alt="" width="44" height="44" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px" }} />
                    : <span aria-hidden="true" style={{ fontSize: "26px" }}>📄</span>}
                  <span style={{ flex: 1, minWidth: 0, fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name}
                  </span>
                  <button type="button" onClick={() => { setFile(null); uploaded.current = null; }}
                    style={{ border: "none", background: "#fee2e2", color: "#b91c1c", borderRadius: "6px", padding: "5px 10px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                    {txt.rxRemove}
                  </button>
                </div>
              )}
            </div>
            <div className="form-full">
              <label className="book-lbl" htmlFor="med-notes">{txt.notes}</label>
              <textarea id="med-notes" className="book-inp" rows={3} maxLength={500} style={{ resize: "vertical" }} placeholder={txt.notesPh}
                value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#94a3b8", margin: "3px 0 0", textAlign: "right" }}>
                {form.notes.length}/500
              </p>
            </div>
            <div>
              <label className="book-lbl" htmlFor="med-date">{txt.date}</label>
              <input id="med-date" className="book-inp" type="date" min={todayStr()} value={form.date}
                onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className="book-lbl" htmlFor="med-slot">{txt.slot}</label>
              <select id="med-slot" className="book-inp" value={form.slot} onChange={(e) => set("slot", e.target.value)}>
                {timeSlots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#475569", background: "#f8fafc",
            border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", margin: "14px 0 8px", lineHeight: 1.6 }}>
            {txt.rx} {txt.bill}
          </p>
          <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontFamily: "'Inter',sans-serif",
            fontSize: "13px", color: "#334155", cursor: "pointer" }}>
            <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} style={{ marginTop: "3px" }} />
            <span>{txt.agree}</span>
          </label>

          {err && <p role="alert" style={{ fontFamily: "'Inter',sans-serif", color: "#ef4444", fontSize: "13px", margin: "10px 0 0" }}>⚠ {err}</p>}

          <button type="submit" disabled={loading} className="book-btn" style={{ marginTop: "16px" }}>
            {busy === "upload" ? txt.uploading : busy === "send" ? txt.sending : txt.submit}
          </button>
        </form>
      </div>
    </div>
  );
}

export function MedicineSuccessModal({ result, onClose }) {
  const txt = useTxt();
  return (
    <div className="modal-bg">
      <div className="modal-box" role="dialog" aria-modal="true" aria-label={txt.okTitle}
        style={{ padding: "36px 28px", textAlign: "center" }}>
        <div style={{ fontSize: "46px", marginBottom: "10px" }}>✅</div>
        <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--wc-navy)", margin: "0 0 10px" }}>{txt.okTitle}</h3>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "var(--wc-muted)", lineHeight: 1.7, margin: "0 0 14px" }}>
          {txt.ok(result?.mobile || "")}
        </p>
        {result?.booking_id && (
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#64748b", margin: "0 0 18px" }}>
            {txt.ref}: {String(result.booking_id).slice(0, 8).toUpperCase()}
          </p>
        )}
        <button type="button" className="book-btn" onClick={onClose}>{txt.close}</button>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#6b7688", marginTop: "12px" }}>{txt.help}</p>
      </div>
    </div>
  );
}
