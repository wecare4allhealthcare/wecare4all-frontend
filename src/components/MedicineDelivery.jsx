import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  MEDICINE_CATEGORIES, CHENNAI_AREAS, CHENNAI_PINCODE_RANGE,
} from "../config/medicineDelivery";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const PHONE = "+91 90257 86467";

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
    area: "Area", areaPh: "Select your area in Chennai", pin: "Pincode", pinPh: "e.g. 600017",
    address: "Delivery address", addressPh: "Door no., street, landmark",
    details: "Your order", meds: "Medicines needed", medsPh: "Medicine names and quantity, or prescription details",
    date: "Preferred delivery date", slot: "Preferred time", notes: "Anything else? (optional)",
    rx: "Prescription-only medicines are delivered only after our pharmacist verifies a valid prescription. You may be asked to share a photo of it by phone or WhatsApp.",
    agree: "I understand and agree",
    free: "Free delivery", fee: (f) => `Delivery charge: ₹${f}`, bill: "Medicine cost is billed as per the prescription and confirmed by our team.",
    submit: "Request delivery", sending: "Sending…", close: "Close",
    eName: "Please enter your name.", eMobile: "Please enter a valid 10-digit mobile number.",
    eArea: "Please select your area.", ePin: "Please enter a valid 6-digit pincode.",
    eOutside: "Sorry, we currently deliver only inside Chennai.",
    eAddress: "Please enter the delivery address.", eMeds: "Please tell us which medicines you need.",
    eDate: "Please choose a delivery date.", eAgree: "Please tick the confirmation box.",
    eFail: "Could not place the request. Please try again.",
    okTitle: "Request received",
    ok: (m) => `Our pharmacy team will call you on ${m} to verify the prescription and confirm the medicines, the bill and the delivery time.`,
    ref: "Reference", help: `Questions? Call ${PHONE}`,
  },
  ta: {
    title: "மருந்து விநியோகம்", sub: "சென்னைக்குள் விநியோகம்",
    contact: "தொடர்பு விவரங்கள்", name: "முழு பெயர்", mobile: "மொபைல் எண்", email: "மின்னஞ்சல் (விருப்பம்)",
    where: "விநியோக இடம் (சென்னை மட்டும்)", byArea: "பகுதியைத் தேர்வு செய்க", byPin: "பின்கோடு உள்ளிடுக",
    area: "பகுதி", areaPh: "சென்னையில் உங்கள் பகுதியைத் தேர்வு செய்க", pin: "பின்கோடு", pinPh: "எ.கா. 600017",
    address: "விநியோக முகவரி", addressPh: "கதவு எண், தெரு, அடையாளம்",
    details: "உங்கள் ஆர்டர்", meds: "தேவையான மருந்துகள்", medsPh: "மருந்துகளின் பெயர், அளவு அல்லது மருந்துச்சீட்டு விவரம்",
    date: "விரும்பும் விநியோக தேதி", slot: "விரும்பும் நேரம்", notes: "வேறு ஏதேனும்? (விருப்பம்)",
    rx: "மருந்துச்சீட்டு தேவைப்படும் மருந்துகள், எங்கள் மருந்தாளர் செல்லுபடியாகும் மருந்துச்சீட்டை சரிபார்த்த பிறகே வழங்கப்படும். அதன் புகைப்படத்தை தொலைபேசி அல்லது WhatsApp மூலம் கேட்கலாம்.",
    agree: "புரிந்துகொண்டு ஒப்புக்கொள்கிறேன்",
    free: "இலவச விநியோகம்", fee: (f) => `விநியோகக் கட்டணம்: ₹${f}`, bill: "மருந்துகளின் விலை மருந்துச்சீட்டின்படி கணக்கிடப்பட்டு எங்கள் குழுவால் உறுதிப்படுத்தப்படும்.",
    submit: "விநியோகம் கோரு", sending: "அனுப்புகிறது…", close: "மூடு",
    eName: "உங்கள் பெயரை உள்ளிடவும்.", eMobile: "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
    eArea: "உங்கள் பகுதியைத் தேர்வு செய்யவும்.", ePin: "சரியான 6 இலக்க பின்கோடை உள்ளிடவும்.",
    eOutside: "மன்னிக்கவும், தற்போது சென்னைக்குள் மட்டுமே விநியோகம் செய்கிறோம்.",
    eAddress: "விநியோக முகவரியை உள்ளிடவும்.", eMeds: "தேவையான மருந்துகளைத் தெரிவிக்கவும்.",
    eDate: "விநியோக தேதியைத் தேர்வு செய்யவும்.", eAgree: "உறுதிப்படுத்தும் பெட்டியில் டிக் செய்யவும்.",
    eFail: "கோரிக்கையை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    okTitle: "கோரிக்கை பெறப்பட்டது",
    ok: (m) => `எங்கள் மருந்தக குழு ${m} எண்ணில் அழைத்து மருந்துச்சீட்டை சரிபார்த்து, மருந்துகள், கட்டணம், விநியோக நேரத்தை உறுதிப்படுத்தும்.`,
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
    mode: "area", area: "", pincode: "", address: "", meds: "",
    date: todayStr(), slot: timeSlots[0] || "", notes: "", agree: false,
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const fee = parseFloat(svc?.base_price) || 0;

  const validate = () => {
    if (!form.name.trim()) return txt.eName;
    if (!/^\d{10}$/.test(form.mobile.replace(/\D/g, "").slice(-10))) return txt.eMobile;
    if (form.mode === "area") {
      if (!form.area) return txt.eArea;
    } else {
      if (!/^\d{6}$/.test(form.pincode.trim())) return txt.ePin;
      const n = Number(form.pincode);
      if (n < CHENNAI_PINCODE_RANGE.min || n > CHENNAI_PINCODE_RANGE.max) return txt.eOutside;
    }
    if (!form.address.trim()) return txt.eAddress;
    if (!form.meds.trim()) return txt.eMeds;
    if (!form.date) return txt.eDate;
    if (!form.agree) return txt.eAgree;
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) { setErr(problem); return; }
    setErr(""); setLoading(true);
    const area = form.mode === "area" ? form.area : "";
    const pincode = form.mode === "pincode" ? form.pincode.trim() : "";
    const mobile = form.mobile.replace(/\D/g, "").slice(-10);
    try {
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
          visit_address: `${form.address.trim()}, ${area ? `${area}, ` : ""}Chennai${pincode ? ` - ${pincode}` : ""}`,
          visit_city: "Chennai",
          patient_name: form.name.trim(),
          patient_mobile: mobile,
          patient_email: form.email.trim(),
          notes: [
            "MEDICINES DELIVERY",
            area ? `Area: ${area}` : "",
            pincode ? `Pincode: ${pincode}` : "",
            `Medicines: ${form.meds.trim()}`,
            form.slot ? `Preferred time: ${form.slot}` : "",
            "Prescription: customer agreed to share it on call/WhatsApp when asked",
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
      setLoading(false);
    }
  };

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
                <select id="med-area" className="book-inp" value={form.area} onChange={(e) => set("area", e.target.value)}>
                  <option value="">{txt.areaPh}</option>
                  {CHENNAI_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            ) : (
              <div className="form-full">
                <label className="book-lbl" htmlFor="med-pin">{txt.pin}</label>
                <input id="med-pin" className="book-inp" inputMode="numeric" maxLength={6} placeholder={txt.pinPh}
                  value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} />
              </div>
            )}
            <div className="form-full">
              <label className="book-lbl" htmlFor="med-address">{txt.address}</label>
              <textarea id="med-address" className="book-inp" rows={2} style={{ resize: "vertical" }} placeholder={txt.addressPh}
                value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>

            <div className="form-full"><p style={{ ...sectionHead, marginTop: "6px" }}>{txt.details}</p></div>
            <div className="form-full">
              <label className="book-lbl" htmlFor="med-meds">{txt.meds}</label>
              <textarea id="med-meds" className="book-inp" rows={3} style={{ resize: "vertical" }} placeholder={txt.medsPh}
                value={form.meds} onChange={(e) => set("meds", e.target.value)} />
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
            <div className="form-full">
              <label className="book-lbl" htmlFor="med-notes">{txt.notes}</label>
              <input id="med-notes" className="book-inp" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
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
            {loading ? txt.sending : txt.submit}
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
