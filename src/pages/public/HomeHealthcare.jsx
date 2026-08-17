/**
 * HomeHealthcare.jsx — Public service catalog + booking form
 * Shows all available home services with prices, book without login
 * redirects to login then back here
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { RoleModal } from "../../components/RoleModal";
import SEO, { breadcrumbJsonLd } from "../../components/SEO";
import ManualUpiPayment from "../../components/ManualUpiPayment";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.hh{font-family:'Inter',sans-serif;color:#1e293b;overflow-x:hidden;background:#f0f6fc;}
.hh *{box-sizing:border-box;} .hh a{text-decoration:none;}
.hh h1,.hh h2,.hh h3{font-family:'Manrope',sans-serif;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.svc-card{background:#fff;border:1.5px solid var(--wc-border);border-radius:16px;
  padding:20px;cursor:pointer;transition:all .25s;
  box-shadow:0 2px 10px rgba(18,59,74,.06);}
.svc-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(18,59,74,.13);
  border-color:#86efac;}
.svc-card.selected{border-color:var(--wc-green);background:var(--wc-sage);
  box-shadow:0 0 0 3px rgba(91,158,50,.12);}
.book-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;
  padding:11px 14px;font-family:'Inter',sans-serif;font-size:14px;
  color:#1e293b;background:var(--wc-warm-white);outline:none;transition:all .2s;
  -webkit-appearance:none;}
.book-inp:focus{border-color:var(--wc-green);background:#fff;
  box-shadow:0 0 0 3px rgba(91,158,50,.09);}
.book-lbl{display:block;font-size:12px;font-weight:600;
  color:#374151;margin-bottom:5px;}
.book-btn{width:100%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));
  color:#fff;font-family:'Inter',sans-serif;font-weight:700;font-size:15px;
  padding:14px;border-radius:10px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(91,158,50,.38);transition:all .25s;}
.book-btn:hover{transform:translateY(-1px);}
.book-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
/* Grid */
.svc-grid{display:grid;grid-template-columns:1fr;gap:14px;}
@media(min-width:500px){.svc-grid{grid-template-columns:repeat(2,1fr);}}
@media(min-width:900px){.svc-grid{grid-template-columns:repeat(3,1fr);}}
/* Form grid */
.form-grid{display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:560px){
  .form-grid{grid-template-columns:1fr 1fr;}
  .form-full{grid-column:span 2;}
}
/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2000;
  display:flex;align-items:flex-end;justify-content:center;padding:0;}
.modal-box{background:#fff;width:100%;max-width:560px;
  border-radius:20px 20px 0 0;max-height:92vh;overflow-y:auto;}
@media(min-width:640px){
  .modal-bg{align-items:center;padding:16px;}
  .modal-box{border-radius:18px;}
}
`;

const TIME_SLOTS = [
  "Morning (8AM–12PM)",
  "Afternoon (12PM–4PM)",
  "Evening (4PM–8PM)",
  "Night (8PM–8AM)",
];

// Mirrors calculate_price() in the backend (app/routes/home_healthcare.py)
// so the patient sees the real total *before* confirming, not just the
// static base price — and finds out after booking. Keep both in sync if
// the pricing rules ever change.
export function estimatePrice(svc, { booking_date, time_slot, duration_hours, session_count }) {
  if (!svc) return 0;
  let price = parseFloat(svc.base_price) || 0;

  if (duration_hours && svc.price_unit === "per_hour") {
    price *= Number(duration_hours);
  }

  let isWeekend = false;
  if (booking_date) {
    const d = new Date(booking_date + "T00:00:00");
    const day = d.getDay(); // 0=Sun, 6=Sat
    isWeekend = day === 0 || day === 6;
  }
  const weekendMultiplier = parseFloat(svc.weekend_multiplier) || 1;
  if (isWeekend && weekendMultiplier > 1) price *= weekendMultiplier;

  const nightExtra = parseFloat(svc.night_extra) || 0;
  if (nightExtra > 0 && (time_slot || "").toLowerCase().startsWith("night")) {
    price += nightExtra;
  }

  // Session Count — the whole per-session total above × number of
  // sessions booked. Matches calculate_price()'s session_count handling
  // exactly (default 1, floored at 1 if something invalid comes through).
  const sessions = Math.max(parseInt(session_count) || 1, 1);
  price *= sessions;

  return Math.round(price * 100) / 100;
}

const ICONS = {
  "Physiotherapy Session":    "🏃",
  "Nursing Care":             "👩‍⚕️",
  "Lab Sample Collection":    "🧪",
  "Post-Surgery Care Visit":  "🩹",
  "Pure Tone Audiometry":     "👂",
  "Impedance Audiometry":     "👂",
};

function getIcon(name) {
  for (const [k,v] of Object.entries(ICONS)) {
    if (name.includes(k)) return v;
  }
  return "🏠";
}

function ServiceCard({ svc, selected, onSelect }) {
  const { t } = useTranslation();
  const unit = {
    per_visit:"/ visit", per_hour:"/ hour", per_shift:"/ shift"
  }[svc.price_unit] || "";
  return (
    <div className={`svc-card${selected?" selected":""}`} onClick={()=>onSelect(svc)}>
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"flex-start",marginBottom:"10px"}}>
        <span style={{fontSize:"28px"}}>{getIcon(svc.name)}</span>
        {selected && (
          <span style={{background:"var(--wc-green)",color:"#fff",fontSize:"11px",
            fontWeight:"700",padding:"3px 10px",borderRadius:"50px",
            fontFamily:"'Inter',sans-serif"}}>{t("homeHealthcarePage.card.selected")}</span>
        )}
      </div>
      <h3 style={{fontSize:"15px",fontWeight:"700",color:"var(--wc-navy)",
        margin:"0 0 6px",lineHeight:"1.3"}}>{svc.name}</h3>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",
        color:"var(--wc-muted)",margin:"0 0 12px",lineHeight:"1.6"}}>
        {svc.description}
      </p>
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",paddingTop:"10px",borderTop:"1px solid #f1f5f9"}}>
        <span style={{fontFamily:"'Manrope',sans-serif",fontSize:"20px",
          fontWeight:"700",color:"var(--wc-green)"}}>
          ₹{parseFloat(svc.base_price).toLocaleString("en-IN")}
        </span>
        <span style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
          color:"#6b7688"}}>{unit}</span>
      </div>
      {(svc.weekend_multiplier > 1 || svc.night_extra > 0) && (
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
          color:"#d97706",marginTop:"6px",marginBottom:0}}>
          {svc.weekend_multiplier > 1 && t("homeHealthcarePage.card.weekendSurcharge",{pct:((svc.weekend_multiplier-1)*100).toFixed(0)})}
          {svc.night_extra > 0 && t("homeHealthcarePage.card.nightSurcharge",{amount:svc.night_extra})}
        </p>
      )}
      {/* The whole card was already clickable (onClick={()=>onSelect(svc)}
          above), but nothing on it looked interactive — no button, no
          link styling, no cursor affordance beyond a CSS hover — so
          visitors had no way to tell they could click it to book. This
          button is purely a visible call-to-action; clicking it bubbles
          up to the same card onClick, so behaviour is unchanged. */}
      <button
        onClick={(e)=>{ e.stopPropagation(); onSelect(svc); }}
        style={{width:"100%",marginTop:"12px",background:selected?"var(--wc-green)":"var(--wc-sage)",
          color:selected?"#fff":"var(--wc-green)",border:`1.5px solid ${selected?"var(--wc-green)":"#86efac"}`,
          borderRadius:"8px",padding:"9px",fontFamily:"'Inter',sans-serif",
          fontWeight:"700",fontSize:"12.5px",cursor:"pointer",transition:"all .2s"}}>
        {selected ? t("homeHealthcarePage.card.selected") : t("homeHealthcarePage.card.bookNow","Book Now →")}
      </button>
    </div>
  );
}

function BookingModal({ svc, onClose, onBooked }) {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_name:   user?.name  || "",
    patient_mobile: user?.mobile|| "",
    patient_email:  user?.email || "",
    booking_date:   "",
    time_slot:      TIME_SLOTS[0],
    duration_hours: "",
    session_count:  1,
    visit_address:  "",
    visit_city:     "Chennai",
    notes:          "",
  });
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  // The 4 time-slot options are broad 4-hour windows that already cover
  // the full 24 hours between them, so there's technically always a
  // window to pick — but a patient who needs, say, exactly 9:30 AM had
  // no way to say that beyond just picking "Morning" and hoping. This
  // optional exact-time field lets them note a preference; kept out of
  // `form` (and merged into `notes` at submit time below) so the
  // request payload shape sent to the backend is unchanged.
  const [preferredTime, setPreferredTime] = useState("");

  // Min date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate()+1);
  const minStr = minDate.toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr("");
    if (!isLoggedIn) {
      navigate("/login?redirect=/home-healthcare");
      return;
    }
    if (!form.booking_date) { setErr(t("homeHealthcarePage.modal.errors.selectDate")); return; }
    if (!form.visit_address.trim()) { setErr(t("homeHealthcarePage.modal.errors.addressRequired")); return; }
    if (!form.patient_name.trim()) { setErr(t("homeHealthcarePage.modal.errors.nameRequired")); return; }
    if (!form.patient_mobile.trim()) { setErr(t("homeHealthcarePage.modal.errors.mobileRequired")); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/home-healthcare/bookings`, {
        method:"POST",
        headers:{"Content-Type":"application/json",
          Authorization:`Bearer ${token}`},
        body: JSON.stringify({
          service_id:     svc.id,
          ...form,
          notes: [
            preferredTime ? `Preferred time: ${preferredTime}` : "",
            form.notes,
          ].filter(Boolean).join(" · "),
          duration_hours: form.duration_hours
            ? parseInt(form.duration_hours) : null,
          session_count:  Math.max(parseInt(form.session_count) || 1, 1),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail||t("homeHealthcarePage.modal.errors.bookingFailed"));
      onBooked(json);
    } catch(ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };

  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const isHourly = svc.price_unit === "per_hour";

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
          padding:"16px 20px",display:"flex",justifyContent:"space-between",
          alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <div>
            <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>
              {t("homeHealthcarePage.modal.title")}
            </h3>
            <p style={{fontFamily:"'Inter',sans-serif",color:"rgba(255,255,255,.78)",
              fontSize:"12px",margin:0}}>{svc.name}</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",
            border:"none",color:"#fff",width:"34px",height:"34px",
            borderRadius:"8px",cursor:"pointer",fontSize:"20px",
            display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{padding:"18px 20px"}}>
          {/* Price summary — recalculates live as date/time/duration change,
              factoring in weekend and night surcharges (see estimatePrice
              above). This used to just show the flat base price. */}
          {(() => {
            const estimate = estimatePrice(svc, form);
            const isWeekend = form.booking_date &&
              [0,6].includes(new Date(form.booking_date + "T00:00:00").getDay());
            const isNight = (form.time_slot || "").toLowerCase().startsWith("night");
            const weekendMultiplier = parseFloat(svc.weekend_multiplier) || 1;
            const nightExtra = parseFloat(svc.night_extra) || 0;
            const surcharged = (isWeekend && weekendMultiplier > 1) || (isNight && nightExtra > 0) || Number(form.session_count) > 1;
            return (
              <div style={{background:"var(--wc-sage)",border:"1px solid #86efac",
                borderRadius:"10px",padding:"12px 14px",marginBottom:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",
                    color:"#374151",fontWeight:"600"}}>
                    {surcharged ? t("homeHealthcarePage.modal.estimatedTotal") : t("homeHealthcarePage.modal.price")}
                  </span>
                  <span style={{fontFamily:"'Manrope',sans-serif",fontSize:"22px",
                    fontWeight:"700",color:"var(--wc-green)"}}>
                    ₹{estimate.toLocaleString("en-IN")}
                  </span>
                </div>
                {isHourly && !form.duration_hours && (
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                    color:"#92400e",margin:"6px 0 0"}}>
                    {t("homeHealthcarePage.modal.hourlyNote")}
                  </p>
                )}
                {Number(form.session_count) > 1 && (
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                    color:"#15803d",margin:"6px 0 0"}}>
                    {t("homeHealthcarePage.modal.perSessionBreakdown", {
                      perSession: estimatePrice(svc, {...form, session_count:1}).toLocaleString("en-IN"),
                      count: form.session_count,
                      total: estimate.toLocaleString("en-IN"),
                    })}
                  </p>
                )}
                {surcharged && (
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                    color:"#15803d",margin:"6px 0 0"}}>
                    {t("homeHealthcarePage.modal.includesPrefix", {
                      items: [
                        isWeekend && weekendMultiplier>1 ? t("homeHealthcarePage.modal.includesWeekend",{pct:((weekendMultiplier-1)*100).toFixed(0)}) : "",
                        isNight && nightExtra>0 ? t("homeHealthcarePage.modal.includesNight",{amount:nightExtra}) : "",
                      ].filter(Boolean).join(t("homeHealthcarePage.modal.and")),
                    })}
                  </p>
                )}
              </div>
            );
          })()}

          <div className="form-grid">
            {/* Personal details */}
            <div className="form-full">
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                fontWeight:"700",color:"var(--wc-green)",letterSpacing:"1.5px",
                textTransform:"uppercase",borderBottom:"1px solid var(--wc-border)",
                paddingBottom:"6px",marginBottom:"12px"}}>
                {t("homeHealthcarePage.modal.contactDetails")}
              </p>
            </div>
            <div>
              <label className="book-lbl" htmlFor="public-homehealthcare-full-name">{t("homeHealthcarePage.modal.fullName")}</label>
              <input id="public-homehealthcare-full-name" value={form.patient_name}
                onChange={e=>set("patient_name",e.target.value)}
                className="book-inp" placeholder={t("homeHealthcarePage.modal.fullNamePlaceholder")}/>
            </div>
            <div>
              <label className="book-lbl" htmlFor="public-homehealthcare-mobile">{t("homeHealthcarePage.modal.mobile")}</label>
              <input id="public-homehealthcare-mobile" type="tel" value={form.patient_mobile}
                onChange={e=>set("patient_mobile",e.target.value)}
                className="book-inp" placeholder={t("homeHealthcarePage.modal.mobilePlaceholder")}/>
            </div>
            <div className="form-full">
              <label className="book-lbl" htmlFor="public-homehealthcare-email">{t("homeHealthcarePage.modal.email")}</label>
              <input id="public-homehealthcare-email" type="email" value={form.patient_email}
                onChange={e=>set("patient_email",e.target.value)}
                className="book-inp" placeholder={t("homeHealthcarePage.modal.emailPlaceholder")}/>
            </div>

            {/* Visit details */}
            <div className="form-full">
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                fontWeight:"700",color:"var(--wc-green)",letterSpacing:"1.5px",
                textTransform:"uppercase",borderBottom:"1px solid var(--wc-border)",
                paddingBottom:"6px",marginBottom:"12px",marginTop:"4px"}}>
                {t("homeHealthcarePage.modal.visitDetails")}
              </p>
            </div>
            <div>
              <label className="book-lbl" htmlFor="public-homehealthcare-date">{t("homeHealthcarePage.modal.date")}</label>
              <input id="public-homehealthcare-date" type="date" min={minStr} value={form.booking_date}
                onChange={e=>set("booking_date",e.target.value)}
                className="book-inp"/>
            </div>
            <div>
              <label className="book-lbl" htmlFor="public-homehealthcare-time-slot">{t("homeHealthcarePage.modal.timeSlot")}</label>
              <select id="public-homehealthcare-time-slot" value={form.time_slot}
                onChange={e=>set("time_slot",e.target.value)}
                className="book-inp">
                {TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="book-lbl" htmlFor="public-homehealthcare-preferred-time">
                {t("homeHealthcarePage.modal.preferredTime","Preferred exact time (optional)")}
              </label>
              <input id="public-homehealthcare-preferred-time" type="time"
                value={preferredTime} onChange={e=>setPreferredTime(e.target.value)}
                className="book-inp"/>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                color:"#6b7688",marginTop:"4px"}}>
                {t("homeHealthcarePage.modal.preferredTimeNote","Don't see your exact time above? Pick the closest window, then note your preferred time here — we'll try to match it.")}
              </p>
            </div>
            {isHourly && (
              <div>
                <label className="book-lbl" htmlFor="public-homehealthcare-duration-hours">{t("homeHealthcarePage.modal.duration")}</label>
                <input id="public-homehealthcare-duration-hours" type="number" onWheel={e=>e.currentTarget.blur()} value={form.duration_hours}
                  onChange={e=>set("duration_hours",e.target.value)}
                  className="book-inp" placeholder={t("homeHealthcarePage.modal.durationPlaceholder")} min="1" max="24"/>
              </div>
            )}
            <div>
              <label className="book-lbl" htmlFor="public-homehealthcare-sessions">{t("homeHealthcarePage.modal.sessions")}</label>
              <input id="public-homehealthcare-sessions" type="number" onWheel={e=>e.currentTarget.blur()} value={form.session_count}
                onChange={e=>set("session_count", e.target.value.replace(/[^0-9]/g,""))}
                className="book-inp" placeholder="1" min="1" max="52"/>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
                color:"#6b7688",marginTop:"4px"}}>
                {t("homeHealthcarePage.modal.sessionsNote")}
              </p>
            </div>
            <div className="form-full">
              <label className="book-lbl" htmlFor="public-homehealthcare-visit-address">{t("homeHealthcarePage.modal.visitAddress")}</label>
              <textarea id="public-homehealthcare-visit-address" value={form.visit_address}
                onChange={e=>set("visit_address",e.target.value)}
                className="book-inp" rows={2} style={{resize:"vertical"}}
                placeholder={t("homeHealthcarePage.modal.visitAddressPlaceholder")}/>
            </div>
            <div>
              <label className="book-lbl" htmlFor="public-homehealthcare-city">{t("homeHealthcarePage.modal.city")}</label>
              <input id="public-homehealthcare-city" value={form.visit_city}
                onChange={e=>set("visit_city",e.target.value)}
                className="book-inp" placeholder={t("homeHealthcarePage.modal.cityPlaceholder")}/>
            </div>
            <div>
              <label className="book-lbl" htmlFor="public-homehealthcare-special-notes">{t("homeHealthcarePage.modal.specialNotes")}</label>
              <input id="public-homehealthcare-special-notes" value={form.notes}
                onChange={e=>set("notes",e.target.value)}
                className="book-inp" placeholder={t("homeHealthcarePage.modal.specialNotesPlaceholder")}/>
            </div>
          </div>

          {err && (
            <p style={{fontFamily:"'Inter',sans-serif",color:"#ef4444",
              fontSize:"13px",margin:"10px 0 0"}}>⚠ {err}</p>
          )}

          {!isLoggedIn && (
            <div style={{background:"#fffbeb",border:"1px solid #fcd34d",
              borderRadius:"9px",padding:"11px 14px",marginTop:"12px"}}>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",
                color:"#92400e",margin:0}}>
                {t("homeHealthcarePage.modal.loginPromptPrefix")}{" "}
                <button onClick={()=>navigate("/login?redirect=/home-healthcare")}
                  style={{color:"var(--wc-green)",fontWeight:"700",background:"none",
                    border:"none",cursor:"pointer",padding:0,fontSize:"inherit"}}>
                  {t("homeHealthcarePage.modal.loginLink")}
                </button>
                {" "}{t("homeHealthcarePage.modal.loginPromptSuffix")}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="book-btn"
            style={{marginTop:"16px"}}>
            {loading ? (
              <span style={{display:"inline-flex",alignItems:"center",
                gap:"8px",justifyContent:"center"}}>
                <span style={{width:"15px",height:"15px",
                  border:"2px solid rgba(255,255,255,.4)",
                  borderTop:"2px solid #fff",borderRadius:"50%",
                  animation:"spin .75s linear infinite",display:"inline-block"}}/>
                {t("homeHealthcarePage.modal.booking")}
              </span>
            ) : isLoggedIn ? t("homeHealthcarePage.modal.confirmBooking") : t("homeHealthcarePage.modal.loginToBook")}
          </button>

          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",
            color:"#6b7688",textAlign:"center",marginTop:"8px"}}>
            {t("homeHealthcarePage.modal.footerNote")}
          </p>
        </form>
      </div>
    </div>
  );
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function SuccessModal({ result, onClose }) {
  const { t } = useTranslation();
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [paid, setPaid] = useState(false);
  const [payingRazorpay, setPayingRazorpay] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/payment-settings`);
        setPaymentSettings(await res.json());
      } catch { setPaymentSettings({ manual_upi_enabled: false }); }
    })();
  }, []);

  const payViaRazorpay = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) return;
    setPayingRazorpay(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/home-healthcare/bookings/${result.booking_id}/create-order`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const order = await res.json();
      if (!res.ok) { setPayingRazorpay(false); return; }

      const rz = new window.Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: "We Care 4 'all'", description: "Home Healthcare Booking",
        order_id: order.order_id, theme: { color: "var(--wc-green)" },
        handler: async (response) => {
          const vRes = await fetch(`${API}/home-healthcare/bookings/verify`, {
            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (vRes.ok) setPaid(true);
          setPayingRazorpay(false);
        },
        modal: { ondismiss: () => setPayingRazorpay(false) },
      });
      rz.open();
    } catch { setPayingRazorpay(false); }
  };

  return (
    <div className="modal-bg">
      <div className="modal-box" style={{padding:"36px 28px",textAlign:"center",
        borderRadius:"20px"}}>
        <div style={{fontSize:"52px",marginBottom:"16px"}}>✅</div>
        <h2 style={{fontSize:"24px",fontWeight:"700",color:"var(--wc-navy)",
          marginBottom:"10px"}}>
          {t("homeHealthcarePage.success.title")}
        </h2>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",
          color:"var(--wc-muted)",marginBottom:"20px",lineHeight:"1.7"}}>
          {t("homeHealthcarePage.success.bookedDesc",{service:result.service})}<br/>
          {t("homeHealthcarePage.success.callConfirm")}
        </p>
        <div style={{background:"var(--wc-sage)",border:"1px solid #86efac",
          borderRadius:"12px",padding:"16px",marginBottom:"22px",
          textAlign:"left"}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",
            fontWeight:"700",color:"#15803d",marginBottom:"8px"}}>
            {t("homeHealthcarePage.success.bookingDetails")}
          </p>
          {[[t("homeHealthcarePage.success.service"),result.service],
            ...(result.session_count > 1
              ? [[t("homeHealthcarePage.success.sessions"), `${result.session_count} × ₹${result.price_per_session?.toLocaleString("en-IN")}`]]
              : []),
            [t("homeHealthcarePage.success.estimatedPrice"),`₹${result.price?.toLocaleString("en-IN")}`],
            [t("homeHealthcarePage.success.bookingId"),result.booking_id?.slice(-8).toUpperCase()],
          ].map(([l,v])=>(
            <div key={l} style={{display:"flex",gap:"12px",marginBottom:"5px"}}>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",
                color:"var(--wc-muted)",minWidth:"100px"}}>{l}</span>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",
                fontWeight:"600",color:"var(--wc-navy)"}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Payment — Home Healthcare previously had no online payment
            path at all (booking just sat "pending" until admin called
            to arrange payment manually). Razorpay is the primary
            gateway; manual UPI is the temporary fallback shown instead
            while GST registration is pending (admin toggle). */}
        {!paid && paymentSettings && (
          <div style={{marginBottom:"22px",textAlign:"left"}}>
            {paymentSettings.manual_upi_enabled ? (
              <ManualUpiPayment
                submitEndpoint={`/home-healthcare/bookings/${result.booking_id}/submit-payment-proof`}
                token={localStorage.getItem("wc4a_token")}
                amount={result.price}
                onSubmitted={() => setPaid(true)}
              />
            ) : (
              <button onClick={payViaRazorpay} disabled={payingRazorpay}
                style={{width:"100%",padding:"13px",borderRadius:"10px",border:"none",
                  cursor:payingRazorpay?"wait":"pointer",
                  background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
                  fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:"14px"}}>
                {payingRazorpay ? "Opening payment…" : `Pay ₹${result.price?.toLocaleString("en-IN")} via Razorpay`}
              </button>
            )}
          </div>
        )}
        {paid && (
          <div style={{background:"var(--wc-sage)",border:"1px solid #86efac",borderRadius:"10px",
            padding:"12px",marginBottom:"22px",fontFamily:"'Inter',sans-serif",
            fontSize:"13px",fontWeight:700,color:"#15803d"}}>
            ✅ Payment received — booking confirmed!
          </div>
        )}

        <div style={{display:"flex",gap:"10px",justifyContent:"center",
          flexWrap:"wrap"}}>
          <Link to="/patient/dashboard"
            style={{padding:"12px 22px",borderRadius:"9px",
              background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
              color:"#fff",fontFamily:"'Inter',sans-serif",
              fontWeight:"600",fontSize:"14px"}}>
            {t("homeHealthcarePage.success.goToDashboard")}
          </Link>
          <button onClick={onClose}
            style={{padding:"12px 22px",borderRadius:"9px",
              background:"var(--wc-warm-white)",border:"1px solid var(--wc-border)",
              color:"var(--wc-muted)",fontFamily:"'Inter',sans-serif",
              fontWeight:"600",fontSize:"14px",cursor:"pointer"}}>
            {t("homeHealthcarePage.success.bookAnother")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Module-level (not inline in JSX) for the same reason Home.jsx's
// HOME_JSONLD is — a stable object reference across re-renders, since
// this page has its own modal/form state that re-renders frequently
// (see SEO.jsx's header comment on why a fresh object literal per
// render used to reset scroll position on interaction).
const HOME_HEALTHCARE_JSONLD = [
  breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Home Healthcare", path: "/home-healthcare" }]),
  {
    "@type": "Service",
    "serviceType": "Home Healthcare",
    "name": "Care+ — Home Healthcare Services",
    "description": "Professional nursing care, attendant care, physiotherapy at home, and geriatric/post-surgical care delivered at your doorstep in Chennai.",
    "provider": {
      "@type": "MedicalBusiness",
      "name": "We Care 4 'all'",
      "url": "https://www.wecare4all.in/",
    },
    "areaServed": "Chennai, Tamil Nadu, India",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Home Healthcare Services",
      "itemListElement": [
        "Nursing Care", "Attendant Care", "Physiotherapy at Home",
        "Geriatric / Old Age Care", "Post-Surgical Care", "Sample Collection",
      ].map(name => ({ "@type": "Offer", "itemOffered": { "@type": "Service", "name": name } })),
    },
  },
];

export default function HomeHealthcarePage() {
  const { t } = useTranslation();
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [result,    setResult]    = useState(null);
  // Shown only when a doctor/hospital account tries to *select* a
  // service — browsing the page itself is fine for any account type
  // now that this page is public (see the note below).
  const [showRoleBlock, setShowRoleBlock] = useState(false);

  // Public page (Aug 2026 client decision): this used to redirect any
  // anonymous visitor straight to /login before they could see anything
  // — a real blocker for the "Care+" positioning work, since a
  // first-time visitor (e.g. an NRI family researching options) would
  // never get past the login wall to read what the service even is.
  // Now: hero, overview and the service list below are open to
  // everyone. Only the actual booking action stays gated — enforced at
  // submit time inside BookingModal.handleSubmit, which already checks
  // isLoggedIn and redirects to /login?redirect=/home-healthcare (that
  // logic needed no changes, it was already correct). Doctor/hospital
  // accounts can browse too now, same as anonymous visitors — they're
  // only stopped if they try to actually select a service to book (see
  // handleSelect below), since this service is patient-facing and
  // booking it under a doctor/hospital account doesn't make sense.
  const { role } = useAuth();
  const navigate = useNavigate();
  const isHospitalIntent = role === "patient" &&
    (typeof window !== "undefined" && localStorage.getItem("wc4a_login_portal") === "hospital");
  const isBlocked = role === "doctor" || role === "hospital";

  useEffect(() => {
    window.scrollTo(0,0);
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/home-healthcare/services`);
      const json = await res.json();
      setServices(json.services || []);
    } catch { setServices([]); }
    finally { setLoading(false); }
  };

  const handleSelect = (svc) => {
    if (isBlocked) { setShowRoleBlock(true); return; }
    if (isHospitalIntent) { navigate("/partner-with-us"); return; }
    setSelected(svc);
    setShowModal(true);
  };

  return (
    <div className="hh">
      <style>{G}</style>
      <SEO title="Home Healthcare" path="/home-healthcare"
        description="Book professional home healthcare visits — nursing care, physiotherapy, sample collection, and more — through We Care 4 'all'."
        jsonLd={HOME_HEALTHCARE_JSONLD} />

      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#071524,var(--wc-navy) 60%,#062818)",
        paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,
          backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{maxWidth:"1100px",margin:"0 auto",padding:"32px 20px 64px"}}>
          {/* Breadcrumb */}
          <div style={{display:"flex",gap:"6px",alignItems:"center",
            marginBottom:"16px",flexWrap:"wrap"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"12px",
              fontFamily:"'Inter',sans-serif"}}>{t("homeHealthcarePage.hero.breadcrumbHome")}</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"var(--wc-green-pale)",fontSize:"12px",
              fontFamily:"'Inter',sans-serif"}}>{t("homeHealthcarePage.hero.breadcrumbCurrent")}</span>
          </div>

          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.30)",
            borderRadius:"50px", padding:"6px 15px", marginBottom:"18px" }}>
            <span style={{ width:"7px",height:"7px",background:"var(--wc-green-light)",borderRadius:"50%",display:"block" }} />
            <span style={{ fontFamily:"'Inter',sans-serif",color:"var(--wc-green-pale)",
              fontSize:"11.5px",fontWeight:"700",letterSpacing:".4px" }}>CARE+</span>
          </div>

          <h1 style={{fontFamily:"'Manrope',sans-serif",
            fontSize:"clamp(28px,5vw,52px)",fontWeight:"700",
            color:"#fff",lineHeight:"1.1",marginBottom:"12px"}}>
            {t("homeHealthcarePage.hero.title")}{" "}
            <span style={{color:"var(--wc-green-lighter)"}}>{t("homeHealthcarePage.hero.titleHighlight")}</span>
          </h1>
          <p style={{fontFamily:"'Inter',sans-serif",
            fontSize:"clamp(14px,2vw,16px)",
            color:"rgba(255,255,255,.65)",maxWidth:"480px",
            fontWeight:"300",marginBottom:"24px",lineHeight:"1.75"}}>
            {t("homeHealthcarePage.hero.subtitle")}
          </p>

          {/* Trust badges */}
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {t("homeHealthcarePage.hero.badges",{returnObjects:true}).map(b=>(
              <span key={b} style={{background:"rgba(255,255,255,.10)",
                border:"1px solid rgba(255,255,255,.18)",
                color:"rgba(255,255,255,.82)",fontFamily:"'Inter',sans-serif",
                fontSize:"12px",fontWeight:"500",
                padding:"6px 12px",borderRadius:"50px"}}>
                {b}
              </span>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg"
          style={{display:"block",width:"100%",marginBottom:"-2px"}}>
          <path d="M0,34 C360,65 1080,8 1440,34 L1440,50 L0,50 Z" fill="#f0f6fc"/>
        </svg>
      </section>

      {/* Overview — detailed breakdown of what Home Healthcare covers.
          Kept as its own section rather than stuffed into the hero
          subtitle: that subtitle box is maxWidth:480px, built for a
          short 2-line tagline, and this is a full paragraph plus a
          9-item service breakdown that would badly overflow it. */}
      <section style={{padding:"48px 0 12px",background:"#f0f6fc"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 16px"}}>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",lineHeight:"1.85",
            color:"#475569",maxWidth:"860px",margin:"0 auto 32px",textAlign:"center"}}>
            {t("homeHealthcarePage.overview.intro")}
          </p>

          <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"clamp(20px,3vw,28px)",
            fontWeight:"700",color:"var(--wc-navy)",textAlign:"center",marginBottom:"20px"}}>
            {t("homeHealthcarePage.overview.physioTitle")}
          </h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(220px,100%),1fr))",
            gap:"16px",marginBottom:"36px"}}>
            {t("homeHealthcarePage.overview.physioItems",{returnObjects:true}).map((it,i)=>(
              <div key={i} style={{background:"#fff",border:"1px solid var(--wc-border)",borderRadius:"14px",
                padding:"20px",boxShadow:"0 2px 10px rgba(18,59,74,.05)"}}>
                <div style={{fontSize:"22px",marginBottom:"8px"}}>{it.icon}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:"14.5px",fontWeight:"700",
                  color:"var(--wc-navy)",marginBottom:"6px"}}>{it.title}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",lineHeight:"1.65",
                  color:"var(--wc-muted)"}}>{it.desc}</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(220px,100%),1fr))",
            gap:"16px",marginBottom:"12px"}}>
            {t("homeHealthcarePage.overview.otherItems",{returnObjects:true}).map((it,i)=>(
              <div key={i} style={{background:"#fff",border:"1px solid var(--wc-border)",borderRadius:"14px",
                padding:"20px",boxShadow:"0 2px 10px rgba(18,59,74,.05)"}}>
                <div style={{fontSize:"22px",marginBottom:"8px"}}>{it.icon}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:"14.5px",fontWeight:"700",
                  color:"var(--wc-navy)",marginBottom:"6px"}}>{it.title}</div>
                <div style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",lineHeight:"1.65",
                  color:"var(--wc-muted)"}}>{it.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{padding:"36px 0 60px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 16px"}}>
          <div style={{textAlign:"center",marginBottom:"28px"}}>
            <h2 style={{fontSize:"clamp(24px,4vw,38px)",fontWeight:"700",
              color:"var(--wc-navy)",marginBottom:"8px"}}>
              {t("homeHealthcarePage.availableServices")}
            </h2>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",
              color:"var(--wc-muted)",maxWidth:"420px",margin:"0 auto"}}>
              {t("homeHealthcarePage.clickToBook")}
            </p>
          </div>

          {loading ? (
            <div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{width:"36px",height:"36px",border:"3px solid var(--wc-border)",
                borderTop:"3px solid var(--wc-green)",borderRadius:"50%",
                animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
              <p style={{fontFamily:"'Inter',sans-serif",color:"#6b7688",
                fontSize:"14px"}}>{t("homeHealthcarePage.loadingServices")}</p>
            </div>
          ) : services.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:"44px",marginBottom:"14px"}}>🏠</div>
              <h3 style={{fontSize:"20px",fontWeight:"700",color:"var(--wc-navy)",
                marginBottom:"8px"}}>{t("homeHealthcarePage.comingSoonTitle")}</h3>
              <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",
                color:"var(--wc-muted)"}}>
                {t("homeHealthcarePage.comingSoonCall",{phone:"90257 86467"})}
              </p>
            </div>
          ) : (
            (() => {
              const groups = {};
              for (const svc of services) {
                const key = svc.category
                  ? svc.category.replace(/[-_]/g," ").replace(/\b\w/g, c=>c.toUpperCase())
                  : t("homeHealthcarePage.generalServices");
                (groups[key] = groups[key] || []).push(svc);
              }
              const groupEntries = Object.entries(groups);
              // Only one bucket (nothing categorized) — skip headers
              // entirely and render the original flat grid, so sites
              // with no categories set up yet look exactly as before.
              if (groupEntries.length <= 1) {
                return (
                  <div className="svc-grid">
                    {services.map(svc=>(
                      <ServiceCard key={svc.id} svc={svc}
                        selected={selected?.id===svc.id} onSelect={handleSelect}/>
                    ))}
                  </div>
                );
              }
              return groupEntries.map(([cat, svcs]) => (
                <div key={cat} style={{marginBottom:"32px"}}>
                  <h3 style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:"700",
                    color:"var(--wc-green)",letterSpacing:"1.5px",textTransform:"uppercase",
                    borderBottom:"1px solid var(--wc-border)",paddingBottom:"8px",marginBottom:"16px"}}>
                    {cat}
                  </h3>
                  <div className="svc-grid">
                    {svcs.map(svc=>(
                      <ServiceCard key={svc.id} svc={svc}
                        selected={selected?.id===svc.id} onSelect={handleSelect}/>
                    ))}
                  </div>
                </div>
              ));
            })()
          )}

          {/* How it works */}
          <div style={{marginTop:"48px",background:"#fff",
            border:"1px solid var(--wc-border)",borderRadius:"16px",padding:"28px 24px"}}>
            <h3 style={{fontSize:"22px",fontWeight:"700",color:"var(--wc-navy)",
              textAlign:"center",marginBottom:"24px"}}>
              {t("homeHealthcarePage.howItWorks")}
            </h3>
            <div style={{display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(min(200px,100%),1fr))",
              gap:"20px"}}>
              {["1️⃣","2️⃣","3️⃣","4️⃣"].map((icon,i)=>(
                <div key={icon} style={{textAlign:"center"}}>
                  <div style={{fontSize:"30px",marginBottom:"8px"}}>{icon}</div>
                  <h4 style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",
                    fontWeight:"700",color:"var(--wc-navy)",marginBottom:"4px"}}>{t("homeHealthcarePage.steps.titles",{returnObjects:true})[i]}</h4>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",
                    color:"var(--wc-muted)",margin:0}}>{t("homeHealthcarePage.steps.descs",{returnObjects:true})[i]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showModal && selected && !result && (
        <BookingModal
          svc={selected}
          onClose={()=>setShowModal(false)}
          onBooked={(r)=>{setResult(r);setShowModal(false);}}
        />
      )}
      {result && (
        <SuccessModal
          result={result}
          onClose={()=>{setResult(null);setSelected(null);}}
        />
      )}
      {showRoleBlock && (
        <RoleModal show={true} role={role}
          onLogin={()=>navigate("/login")}
          onCancel={()=>setShowRoleBlock(false)}/>
      )}
    </div>
  );
}
