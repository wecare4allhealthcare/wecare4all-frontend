/**
 * IdealWeightCalculator.jsx — "Find your IDEAL BODY WEIGHT" homepage
 * attention banner + modal calculator (client request, Nov 2026).
 *
 * Flow
 *  1. Visitor taps the glowing banner on the homepage.
 *  2. Step 1 — lead capture ONLY: name, contact number, preferred contact
 *     method and consent to be contacted. Nothing health-related is
 *     collected here. Submitted to the existing POST /auth/contact
 *     endpoint (subject "Ideal Weight Calculator Lead") so it lands in the
 *     admin's existing Contacts inbox — no backend / DB change.
 *  3. Step 2 — height + weight, used ONLY to compute BMI in the browser.
 *     These two numbers are never sent to the server from this modal.
 *     Height, weight, age range and medical history are requested later,
 *     on the secure intake form on /lose-weight, with its own consent.
 *  4. Result — animated BMI scale (Underweight / Perfect weight /
 *     Overweight / Obese / Morbid Obese / Jumbo Obese), the person's ideal
 *     weight range, and a "Want to lose weight?" tab leading to
 *     /lose-weight.
 *
 * Self-contained: scoped CSS (prefix .iw-), no changes to any other
 * component, no new dependencies.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "./Toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// /auth/contact requires an email (and contact_submissions.email is NOT
// NULL), but this lead form asks for a phone number first. When the visitor
// does not give an email we send this clearly-marked placeholder so no
// backend or DB change is needed.
const NO_EMAIL = "no-email-provided@wecare4all.in";

const CONTACT_METHODS = ["Phone call", "WhatsApp", "SMS", "Email"];

// BMI zones (WHO adult cut-offs; "Morbid" ≥ 40 and "Jumbo" ≥ 50 follow the
// standard class III / super-obesity thresholds). `to` is the exclusive upper
// bound; the scale itself is drawn on 14 → 54.
const SCALE_MIN = 14;
const SCALE_MAX = 54;
const ZONES = [
  { key: "under",  label: "Underweight",    from: 0,    to: 18.5, color: "#38bdf8", tip: "Below the healthy range" },
  { key: "normal", label: "Perfect Weight", from: 18.5, to: 25,   color: "#22c55e", tip: "Within the healthy range" },
  { key: "over",   label: "Overweight",     from: 25,   to: 30,   color: "#facc15", tip: "Above the healthy range" },
  { key: "obese",  label: "Obese",          from: 30,   to: 40,   color: "#fb923c", tip: "Health risks are raised" },
  { key: "morbid", label: "Morbid Obese",   from: 40,   to: 50,   color: "#ef4444", tip: "Medical assessment strongly advised" },
  { key: "jumbo",  label: "Jumbo Obese",    from: 50,   to: 999,  color: "#b91c1c", tip: "Medical assessment strongly advised" },
];

const zoneFor = (bmi) => ZONES.find((z) => bmi >= z.from && bmi < z.to) || ZONES[ZONES.length - 1];
const pct = (bmi) => Math.max(0, Math.min(100, ((bmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));

const CSS = `
.iw-banner{position:relative;background:linear-gradient(135deg,var(--wc-navy-deepest),var(--wc-navy) 60%,var(--wc-navy-deep));padding:26px 0;overflow:hidden;}
.iw-banner-in{max-width:1200px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:center;gap:22px;flex-wrap:wrap;text-align:center;}
.iw-banner-txt{font-family:'Manrope',sans-serif;color:#fff;font-size:clamp(18px,2.4vw,26px);font-weight:700;line-height:1.25;margin:0;}
.iw-banner-txt span{color:#86efac;}
.iw-banner-sub{font-family:'Inter',sans-serif;font-size:13.5px;color:rgba(255,255,255,.7);margin:4px 0 0;font-weight:400;}
.iw-glow-btn{font-family:'Inter',sans-serif;font-weight:800;font-size:15px;letter-spacing:.3px;color:#052e16;background:linear-gradient(135deg,#bbf7d0,#4ade80);
  border:none;border-radius:999px;padding:15px 30px;cursor:pointer;animation:iwPulse 1.8s ease-in-out infinite;transition:transform .2s;}
.iw-glow-btn:hover{transform:scale(1.05);}
@keyframes iwPulse{0%{box-shadow:0 0 0 0 rgba(74,222,128,.75),0 0 18px 2px rgba(74,222,128,.55);}
  70%{box-shadow:0 0 0 18px rgba(74,222,128,0),0 0 30px 6px rgba(74,222,128,.25);}
  100%{box-shadow:0 0 0 0 rgba(74,222,128,0),0 0 18px 2px rgba(74,222,128,.55);}}
.iw-shine{position:absolute;top:0;left:-30%;width:30%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.07),transparent);animation:iwShine 4.5s ease-in-out infinite;pointer-events:none;}
@keyframes iwShine{0%{left:-30%}60%,100%{left:130%}}

.iw-overlay{position:fixed;inset:0;background:rgba(8,20,32,.65);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px;animation:iwFade .2s ease;}
@keyframes iwFade{from{opacity:0}to{opacity:1}}
.iw-modal{background:#fff;border-radius:20px;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 70px rgba(0,0,0,.35);position:relative;font-family:'Inter',sans-serif;color:#1e293b;}
.iw-modal *{box-sizing:border-box;}
.iw-head{padding:24px 26px 6px;}
.iw-head h2{font-family:'Manrope',sans-serif;font-size:22px;font-weight:800;color:var(--wc-navy);margin:0 0 4px;}
.iw-head p{font-size:13.5px;color:var(--wc-muted);margin:0;line-height:1.6;}
.iw-x{position:absolute;top:12px;right:14px;background:none;border:none;font-size:24px;line-height:1;color:#64748b;cursor:pointer;padding:4px 8px;}
.iw-body{padding:16px 26px 26px;}
.iw-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin:0 0 5px;}
.iw-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:11px 13px;font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);outline:none;}
.iw-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(14,116,144,.10);}
.iw-inp.err{border-color:#ef4444;background:#fef2f2;}
.iw-err{color:#ef4444;font-size:11px;margin:3px 0 0;}
.iw-row{margin-bottom:14px;}
.iw-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.iw-chips{display:flex;flex-wrap:wrap;gap:8px;}
.iw-chip{border:1.5px solid var(--wc-border);background:#fff;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;color:#374151;cursor:pointer;font-family:'Inter',sans-serif;}
.iw-chip.on{border-color:var(--wc-green);background:var(--wc-sage);color:var(--wc-green-dark);}
.iw-consent{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;line-height:1.55;color:#374151;background:var(--wc-warm-white);border:1px solid var(--wc-border);border-radius:10px;padding:12px;}
.iw-consent input{margin-top:3px;flex-shrink:0;}
.iw-btn{width:100%;border:none;border-radius:10px;padding:14px 20px;font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:#fff;cursor:pointer;
  background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));box-shadow:0 4px 16px rgba(14,116,144,.3);}
.iw-btn:disabled{opacity:.6;cursor:not-allowed;}
.iw-btn.ghost{background:#fff;color:var(--wc-green);border:1.5px solid var(--wc-green);box-shadow:none;}
.iw-note{font-size:11.5px;color:#64748b;line-height:1.6;margin:12px 0 0;}
.iw-seg{display:inline-flex;border:1.5px solid var(--wc-border);border-radius:8px;overflow:hidden;margin-bottom:10px;}
.iw-seg button{border:none;background:#fff;padding:6px 14px;font-size:12px;font-weight:700;color:#64748b;cursor:pointer;font-family:'Inter',sans-serif;}
.iw-seg button.on{background:var(--wc-green);color:#fff;}

.iw-result{text-align:center;}
.iw-bmi-num{font-family:'Manrope',sans-serif;font-size:54px;font-weight:800;line-height:1;margin:6px 0 0;}
.iw-bmi-cap{font-size:12px;font-weight:700;letter-spacing:1.5px;color:#64748b;margin:0 0 4px;}
.iw-cat{display:inline-block;font-family:'Manrope',sans-serif;font-size:20px;font-weight:800;color:#fff;border-radius:999px;padding:7px 22px;margin:10px 0 4px;animation:iwPop .6s cubic-bezier(.2,1.6,.4,1) both;animation-delay:1.1s;}
@keyframes iwPop{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}
.iw-tip{font-size:13px;color:var(--wc-muted);margin:0 0 6px;animation:iwFade .6s ease both;animation-delay:1.3s;}
.iw-scale{position:relative;margin:34px 4px 0;}
.iw-bar{display:flex;height:16px;border-radius:999px;overflow:hidden;}
.iw-bar div{height:100%;transition:opacity .4s;}
.iw-bar.dim div{opacity:.35;}
.iw-bar div.act{opacity:1;}
.iw-marker{position:absolute;top:-26px;width:0;transition:left 1.8s cubic-bezier(.22,1,.36,1);}
.iw-marker::before{content:"";position:absolute;left:-8px;top:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid var(--wc-navy);}
.iw-marker::after{content:"";position:absolute;left:-2px;top:12px;width:4px;height:28px;background:var(--wc-navy);border-radius:2px;}
.iw-zones{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin-top:10px;}
.iw-zone{font-size:10px;line-height:1.25;font-weight:700;color:#64748b;text-align:center;opacity:.55;transition:all .4s;}
.iw-zone.act{opacity:1;color:#1e293b;transform:scale(1.08);}
.iw-zone i{display:block;width:10px;height:10px;border-radius:50%;margin:0 auto 4px;}
.iw-ideal{margin:20px 0 0;background:var(--wc-sage);border:1.5px solid #86efac;border-radius:12px;padding:12px 14px;font-size:13.5px;color:#14532d;line-height:1.6;animation:iwFade .6s ease both;animation-delay:1.5s;}
.iw-lose{margin-top:18px;animation:iwFade .6s ease both;animation-delay:1.7s;}
.iw-lose-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;border:none;border-radius:12px;padding:16px;font-family:'Manrope',sans-serif;font-size:17px;font-weight:800;color:#fff;cursor:pointer;
  background:linear-gradient(135deg,#f97316,#dc2626);animation:iwPulseO 2s ease-in-out infinite;}
@keyframes iwPulseO{0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,.5)}50%{box-shadow:0 0 0 12px rgba(249,115,22,0)}}
@media(max-width:520px){.iw-grid2{grid-template-columns:1fr}.iw-zone{font-size:9px}.iw-body{padding:14px 18px 22px}.iw-head{padding:22px 18px 4px}}
@media(prefers-reduced-motion:reduce){.iw-glow-btn,.iw-lose-btn,.iw-shine{animation:none}.iw-marker{transition:none}}
`;

function useCountUp(target, run, ms = 1600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) { setV(0); return undefined; }
    let raf; const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return v;
}

function Calculator({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 lead · 2 measurements · 3 result
  const [lead, setLead] = useState({ name: "", mobile: "", method: "", email: "", consent: false });
  const [errs, setErrs] = useState({});
  const [sending, setSending] = useState(false);
  const [unit, setUnit] = useState("cm");
  const [m, setM] = useState({ cm: "", ft: "", inch: "", kg: "" });
  const [bmi, setBmi] = useState(null);
  const [animate, setAnimate] = useState(false);
  const firstRef = useRef(null);

  useEffect(() => { firstRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const shown = useCountUp(bmi || 0, animate);

  const setL = (k, v) => { setLead((p) => ({ ...p, [k]: v })); if (errs[k]) setErrs((p) => ({ ...p, [k]: "" })); };
  const setMeas = (k, v) => { setM((p) => ({ ...p, [k]: v })); if (errs[k]) setErrs((p) => ({ ...p, [k]: "" })); };

  const submitLead = async (e) => {
    e.preventDefault();
    const er = {};
    if (!lead.name.trim()) er.name = "Please enter your name";
    if (!/^[+\d][\d\s-]{8,15}$/.test(lead.mobile.trim())) er.mobile = "Enter a valid contact number";
    if (!lead.method) er.method = "Choose how you would like to be contacted";
    if (lead.method === "Email" && !/\S+@\S+\.\S+/.test(lead.email)) er.email = "Enter a valid email";
    if (!lead.consent) er.consent = "Consent is needed so our team may contact you";
    if (Object.keys(er).length) { setErrs(er); return; }
    setSending(true);
    try {
      const res = await fetch(`${API}/auth/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: lead.name.trim(),
          email: lead.method === "Email" ? lead.email.trim() : NO_EMAIL,
          mobile: lead.mobile.trim(),
          subject: "Ideal Weight Calculator Lead",
          message:
            "Visitor used the 'Find your Ideal Body Weight' calculator on the homepage.\n" +
            `Preferred contact method: ${lead.method}\n` +
            "Consent to be contacted: YES (ticked by visitor)\n" +
            "No health details collected at this stage.",
        }),
      });
      if (!res.ok) throw new Error("send failed");
      try {
        // Pre-fills name / number / method on /lose-weight. Contains no health data.
        sessionStorage.setItem("wc4a_wl_lead", JSON.stringify({ name: lead.name.trim(), mobile: lead.mobile.trim(), method: lead.method, email: lead.method === "Email" ? lead.email.trim() : "" }));
      } catch { /* storage unavailable — form just starts empty */ }
      setStep(2);
    } catch {
      showToast("Could not save your details. Please try again or call +91 90257 86467", "error");
    } finally {
      setSending(false);
    }
  };

  const calculate = (e) => {
    e.preventDefault();
    const er = {};
    let hCm;
    if (unit === "cm") {
      hCm = parseFloat(m.cm);
    } else {
      hCm = (parseFloat(m.ft || 0) * 12 + parseFloat(m.inch || 0)) * 2.54;
    }
    const kg = parseFloat(m.kg);
    if (!(hCm >= 90 && hCm <= 250)) er[unit === "cm" ? "cm" : "ft"] = "Enter a height between 90 and 250 cm";
    if (!(kg >= 20 && kg <= 350)) er.kg = "Enter a weight between 20 and 350 kg";
    if (Object.keys(er).length) { setErrs(er); return; }
    const value = kg / Math.pow(hCm / 100, 2);
    const hm = hCm / 100;
    setBmi(Math.round(value * 10) / 10);
    setM((p) => ({ ...p, lo: Math.round(18.5 * hm * hm * 10) / 10, hi: Math.round(24.9 * hm * hm * 10) / 10 }));
    setStep(3);
    setTimeout(() => setAnimate(true), 150);
  };

  const zone = bmi != null ? zoneFor(bmi) : null;
  const wtDiff = zone && bmi != null ? (() => {
    const kg = parseFloat(m.kg);
    if (bmi >= 25) return `That is about ${(kg - m.hi).toFixed(1)} kg above the top of your healthy range.`;
    if (bmi < 18.5) return `That is about ${(m.lo - kg).toFixed(1)} kg below the bottom of your healthy range.`;
    return "You are within your healthy weight range. Keep it up!";
  })() : "";

  return (
    <div className="iw-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="iw-modal" role="dialog" aria-modal="true" aria-labelledby="iw-title">
        <button className="iw-x" onClick={onClose} aria-label="Close">×</button>

        {step === 1 && (
          <>
            <div className="iw-head">
              <h2 id="iw-title">Find your ideal body weight</h2>
              <p>Tell us who you are and how to reach you, then you can see your result straight away.</p>
            </div>
            <form className="iw-body" onSubmit={submitLead} noValidate>
              <div className="iw-row">
                <label className="iw-lbl" htmlFor="iw-name">Your name *</label>
                <input ref={firstRef} id="iw-name" className={`iw-inp${errs.name ? " err" : ""}`} value={lead.name} onChange={(e) => setL("name", e.target.value)} placeholder="Full name" autoComplete="name" />
                {errs.name && <p className="iw-err">⚠ {errs.name}</p>}
              </div>
              <div className="iw-row">
                <label className="iw-lbl" htmlFor="iw-mobile">Contact number *</label>
                <input id="iw-mobile" type="tel" className={`iw-inp${errs.mobile ? " err" : ""}`} value={lead.mobile} onChange={(e) => setL("mobile", e.target.value)} placeholder="+91 90000 00000" autoComplete="tel" />
                {errs.mobile && <p className="iw-err">⚠ {errs.mobile}</p>}
              </div>
              <div className="iw-row">
                <span className="iw-lbl">Preferred contact method *</span>
                <div className="iw-chips" role="radiogroup" aria-label="Preferred contact method">
                  {CONTACT_METHODS.map((c) => (
                    <button type="button" key={c} role="radio" aria-checked={lead.method === c}
                      className={`iw-chip${lead.method === c ? " on" : ""}`} onClick={() => setL("method", c)}>{c}</button>
                  ))}
                </div>
                {errs.method && <p className="iw-err">⚠ {errs.method}</p>}
              </div>
              {lead.method === "Email" && (
                <div className="iw-row">
                  <label className="iw-lbl" htmlFor="iw-email">Email address *</label>
                  <input id="iw-email" type="email" className={`iw-inp${errs.email ? " err" : ""}`} value={lead.email} onChange={(e) => setL("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  {errs.email && <p className="iw-err">⚠ {errs.email}</p>}
                </div>
              )}
              <div className="iw-row">
                <label className="iw-consent">
                  <input type="checkbox" checked={lead.consent} onChange={(e) => setL("consent", e.target.checked)} />
                  <span>I agree that We Care 4 'all' may contact me using the details above about weight management and related healthcare services.</span>
                </label>
                {errs.consent && <p className="iw-err">⚠ {errs.consent}</p>}
              </div>
              <button className="iw-btn" type="submit" disabled={sending}>{sending ? "Please wait…" : "Continue →"}</button>
              <p className="iw-note">🔒 We only ask for contact details here. Health details such as medical history are requested later, in a separate secure form, and only if you choose to continue.</p>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="iw-head">
              <h2 id="iw-title">Your height and weight</h2>
              <p>Used only to calculate your result on this screen. These two numbers are not sent or stored.</p>
            </div>
            <form className="iw-body" onSubmit={calculate} noValidate>
              <div className="iw-seg" role="group" aria-label="Height unit">
                <button type="button" className={unit === "cm" ? "on" : ""} onClick={() => setUnit("cm")}>cm</button>
                <button type="button" className={unit === "ft" ? "on" : ""} onClick={() => setUnit("ft")}>ft / in</button>
              </div>
              <div className="iw-grid2">
                {unit === "cm" ? (
                  <div className="iw-row">
                    <label className="iw-lbl" htmlFor="iw-cm">Height (cm) *</label>
                    <input id="iw-cm" inputMode="decimal" className={`iw-inp${errs.cm ? " err" : ""}`} value={m.cm} onChange={(e) => setMeas("cm", e.target.value)} placeholder="e.g. 165" />
                    {errs.cm && <p className="iw-err">⚠ {errs.cm}</p>}
                  </div>
                ) : (
                  <div className="iw-row">
                    <label className="iw-lbl" htmlFor="iw-ft">Height (ft / in) *</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input id="iw-ft" inputMode="numeric" className={`iw-inp${errs.ft ? " err" : ""}`} value={m.ft} onChange={(e) => setMeas("ft", e.target.value)} placeholder="ft" />
                      <input aria-label="Inches" inputMode="decimal" className={`iw-inp${errs.ft ? " err" : ""}`} value={m.inch} onChange={(e) => setMeas("inch", e.target.value)} placeholder="in" />
                    </div>
                    {errs.ft && <p className="iw-err">⚠ {errs.ft}</p>}
                  </div>
                )}
                <div className="iw-row">
                  <label className="iw-lbl" htmlFor="iw-kg">Weight (kg) *</label>
                  <input id="iw-kg" inputMode="decimal" className={`iw-inp${errs.kg ? " err" : ""}`} value={m.kg} onChange={(e) => setMeas("kg", e.target.value)} placeholder="e.g. 72" />
                  {errs.kg && <p className="iw-err">⚠ {errs.kg}</p>}
                </div>
              </div>
              <button className="iw-btn" type="submit">Show my result</button>
            </form>
          </>
        )}

        {step === 3 && zone && (
          <div className="iw-body iw-result" style={{ paddingTop: 30 }}>
            <p className="iw-bmi-cap">YOUR BODY MASS INDEX</p>
            <p className="iw-bmi-num" style={{ color: zone.color }}>{shown.toFixed(1)}</p>
            {animate && <span className="iw-cat" style={{ background: zone.color, color: zone.key === "over" ? "#422006" : "#fff" }}>{zone.label}</span>}
            {animate && <p className="iw-tip">{zone.tip}</p>}

            <div className="iw-scale" aria-label={`BMI ${bmi}, ${zone.label}`}>
              <div className="iw-marker" style={{ left: `${animate ? pct(bmi) : 0}%` }} />
              <div className={`iw-bar${animate ? " dim" : ""}`}>
                {ZONES.map((z) => {
                  const lo = Math.max(SCALE_MIN, z.from || SCALE_MIN);
                  const hi = Math.min(SCALE_MAX, z.to);
                  return <div key={z.key} className={zone.key === z.key ? "act" : ""} style={{ width: `${((hi - lo) / (SCALE_MAX - SCALE_MIN)) * 100}%`, background: z.color }} />;
                })}
              </div>
              <div className="iw-zones">
                {ZONES.map((z) => (
                  <div key={z.key} className={`iw-zone${animate && zone.key === z.key ? " act" : ""}`}>
                    <i style={{ background: z.color }} />{z.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="iw-ideal">
              <strong>Your ideal weight range: {m.lo} – {m.hi} kg</strong><br />
              {wtDiff}
            </div>

            <div className="iw-lose">
              <button className="iw-lose-btn" onClick={() => { onClose(); navigate("/lose-weight"); }}>
                ⚖️ Want to lose weight? Start here →
              </button>
            </div>
            <p className="iw-note">BMI is a screening measure, not a diagnosis. It does not account for muscle, age or body shape, and health risks can begin at a lower BMI in South Asian adults. A doctor can tell you what it means for you.</p>
            <button className="iw-btn ghost" style={{ marginTop: 12 }} onClick={() => { setBmi(null); setAnimate(false); setStep(2); }}>Recalculate</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IdealWeightBanner() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <style>{CSS}</style>
      <section className="iw-banner" aria-label="Ideal body weight calculator">
        <div className="iw-shine" />
        <div className="iw-banner-in">
          <div>
            <p className="iw-banner-txt">Find your <span>IDEAL BODY WEIGHT</span></p>
            <p className="iw-banner-sub">Free, takes under a minute. See where you stand on the weight scale.</p>
          </div>
          <button className="iw-glow-btn" onClick={() => setOpen(true)}>⚖️ Check my ideal weight</button>
        </div>
      </section>
      {open && <Calculator onClose={() => setOpen(false)} />}
    </>
  );
}
