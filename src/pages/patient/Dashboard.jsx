/**
 * patient/Dashboard.jsx — Phase C Update
 * ADDED:
 * 1. Mobile responsive (2-col stats on mobile)
 * 2. View prescription/doctor notes on completed appointments
 * 3. Re-book button on past appointments
 * 4. Payment history link
 * 5. Better quick actions
 */
import { useEffect, useState, useRef } from "react";
import { showToast } from "../../components/Toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import NotificationBell from "../../components/NotificationBell";
import { useModalA11y } from "../../hooks/useModalA11y";
import { downloadICS, googleCalendarUrl } from "../../utils/calendarExport";
import { downloadPrescriptionPDF, downloadAppointmentHistoryPDF, downloadAppointmentSummaryPDF } from "../../utils/pdfExport";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.pd{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.pd *{box-sizing:border-box;} .pd a{text-decoration:none;}
.pd h1,.pd h2,.pd h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:32px;height:32px;border:3px solid #e2eaf4;border-top:3px solid #047857;
  border-radius:50%;animation:spin .8s linear infinite;margin:0 auto;}
.appt-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;
  padding:16px;transition:all .25s;box-shadow:0 2px 8px rgba(11,31,58,.05);}
.appt-card:hover{box-shadow:0 8px 24px rgba(11,31,58,.10);}
/* Stats — 2 col mobile, 4 col desktop */
.stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:22px;}
@media(min-width:600px){.stat-grid{grid-template-columns:repeat(4,1fr);}}
/* Quick actions — 3 col mobile, auto desktop */
.quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
@media(min-width:500px){.quick-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));}}
.quick-btn{display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:14px 10px;background:#fff;border:1.5px solid #e2eaf4;border-radius:12px;
  text-decoration:none;transition:all .22s;text-align:center;}
.quick-btn:hover{border-color:#047857;background:#f0fdf4;transform:translateY(-2px);}
/* Tabs */
.tab-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;
  -ms-overflow-style:none;scrollbar-width:none;}
.tab-row::-webkit-scrollbar{display:none;}
.tab-btn{padding:8px 18px;border-radius:9px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:13px;
  font-weight:600;cursor:pointer;transition:all .2s;color:#64748b;
  white-space:nowrap;flex-shrink:0;}
.tab-btn.active{background:#0b1f3a;border-color:#0b1f3a;color:#fff;}
/* Action buttons */
.act-btn{padding:8px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;
  font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;
  text-decoration:none;display:inline-flex;align-items:center;gap:5px;border:none;}
`;

const STATUS_STYLES = {
  pending:   {bg:"#fef9c3",color:"#854d0e"},
  approved:  {bg:"#dcfce7",color:"#15803d"},
  rejected:  {bg:"#fee2e2",color:"#991b1b"},
  completed: {bg:"#dbeafe",color:"#1e40af"},
  cancelled: {bg:"#fee2e2",color:"#991b1b"},
};
// Labels come from t("patientDashboard.status.*") / t("patientDashboard.type.*")
// inside each component (translation needs the useTranslation hook, which
// can't be called at module scope) — see AppointmentCard/PrescriptionModal.

function ReviewModal({ appt, onClose, onSubmitted }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);

  const submit = async () => {
    if (rating === 0) { setError(t("patientDashboard.review.selectRating")); return; }
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/reviews`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({ appointment_id: appt.id, rating, review_text: text.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.detail || t("patientDashboard.review.submitFailed")); return; }
      onSubmitted();
    } catch { setError(t("patientDashboard.review.genericError")); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="Leave a Review" style={{background:"#fff",width:"100%",maxWidth:"480px",
        borderRadius:"18px 18px 0 0",padding:"22px",maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:"6px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>
            {t("patientDashboard.review.title")}
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
          margin:"0 0 18px"}}>
          {appt.doctors?.full_name ? appt.doctors.full_name : t("patientDashboard.review.yourDoctor")} —{" "}
          {new Date(appt.appointment_date).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
        </p>

        <div style={{display:"flex",justifyContent:"center",gap:"8px",marginBottom:"18px"}}>
          {[1,2,3,4,5].map(n => (
            <span key={n} onClick={()=>setRating(n)}
              onMouseEnter={()=>setHoverRating(n)} onMouseLeave={()=>setHoverRating(0)}
              style={{fontSize:"34px",cursor:"pointer",
                color: n <= (hoverRating||rating) ? "#fbbf24" : "#e2eaf4",
                transition:"color .1s"}}>★</span>
          ))}
        </div>

        <textarea value={text} onChange={e=>setText(e.target.value)}
          placeholder={t("patientDashboard.review.placeholder")}
          style={{width:"100%",minHeight:"90px",border:"1.5px solid #e2eaf4",
            borderRadius:"10px",padding:"12px",fontFamily:"'DM Sans',sans-serif",
            fontSize:"13.5px",resize:"vertical",outline:"none"}}/>

        {error && <p style={{color:"#dc2626",fontSize:"12.5px",margin:"8px 0 0"}}>{error}</p>}

        <button onClick={submit} disabled={submitting}
          style={{width:"100%",marginTop:"16px",background:"linear-gradient(135deg,#047857,#059669)",
            color:"#fff",border:"none",borderRadius:"10px",padding:"13px",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
            cursor:submitting?"default":"pointer",opacity:submitting?0.7:1}}>
          {submitting ? t("patientDashboard.review.submitting") : t("patientDashboard.review.submit")}
        </button>
      </div>
    </div>
  );
}

function PrescriptionModal({ appt, onClose }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("wc4a_token");
        const res   = await fetch(`${API}/appointments/${appt.id}/prescription-items`, { headers:{ Authorization:`Bearer ${token}` }});
        const json  = await res.json();
        setItems(json.items || []);
      } catch {}
    })();
  }, [appt.id]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="Prescription and Notes" style={{background:"#fff",width:"100%",maxWidth:"500px",
        borderRadius:"18px 18px 0 0",padding:"22px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",
          alignItems:"center",marginBottom:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>
            {t("patientDashboard.prescription.title")}
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <div style={{background:"#f8fafc",borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
          {[[t("patientDashboard.prescription.doctor"),   appt.doctors?.full_name||t("patientDashboard.card.doctorFallback")],
            [t("patientDashboard.prescription.date"),     new Date(appt.appointment_date).toLocaleDateString("en-IN",
                           {day:"numeric",month:"long",year:"numeric"})],
            [t("patientDashboard.prescription.time"),     appt.appointment_time?.slice(0,5)||""],
            [t("patientDashboard.prescription.type"),     t(`patientDashboard.type.${appt.appointment_type}`, appt.appointment_type)],
            ...(appt.appointment_type==="inperson" && appt.doctor_address
              ? [[t("patientDashboard.prescription.address"), appt.doctor_address]] : []),
            ...(appt.appointment_type==="home" && appt.patient_address
              ? [[t("patientDashboard.prescription.visitAt"), appt.patient_address]] : []),
          ].map(([l,v])=>(
            <div key={l} style={{display:"flex",gap:"12px",marginBottom:"6px"}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#6b7688",width:"60px",flexShrink:0}}>{l}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                fontWeight:"600",color:"#0b1f3a"}}>{v}</span>
            </div>
          ))}
        </div>
        {appt.status === "rejected" && appt.rejection_reason && (
          <div style={{background:"#fef2f2",border:"1px solid #fecaca",
            borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"#991b1b",margin:"0 0 6px",textTransform:"uppercase",letterSpacing:"1px"}}>
              {t("patientDashboard.prescription.reason")}
            </p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
              color:"#374151",margin:0}}>
              {appt.rejection_reason}
            </p>
          </div>
        )}
        {items.length > 0 && (
          <div style={{background:"#eff8ff",border:"1px solid #93c5fd",
            borderRadius:"10px",padding:"14px",marginBottom:"12px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"#0369a1",margin:"0 0 10px",textTransform:"uppercase",letterSpacing:"1px"}}>
              {t("patientDashboard.prescription.medicines")}
            </p>
            {items.map((it,i) => (
              <div key={i} style={{marginBottom: i<items.length-1 ? "10px" : 0,
                paddingBottom: i<items.length-1 ? "10px" : 0,
                borderBottom: i<items.length-1 ? "1px solid #bae6fd" : "none"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:"700",
                  color:"#0b1f3a",margin:0}}>{it.medicine_name}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#374151",margin:"2px 0 0"}}>
                  {[it.dosage, it.frequency, it.duration].filter(Boolean).join(" · ")}
                </p>
                {it.instructions &&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",
                    margin:"2px 0 0",fontStyle:"italic"}}>{it.instructions}</p>}
              </div>
            ))}
          </div>
        )}
        {appt.prescription ? (
          <div style={{background:"#f0fdf4",border:"1px solid #86efac",
            borderRadius:"10px",padding:"14px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"#15803d",margin:"0 0 8px",textTransform:"uppercase",letterSpacing:"1px"}}>
              {t("patientDashboard.prescription.generalNotes")}
            </p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              color:"#374151",lineHeight:"1.7",margin:0,whiteSpace:"pre-wrap"}}>
              {appt.prescription}
            </p>
          </div>
        ) : items.length === 0 ? (
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
            color:"#6b7688",fontStyle:"italic",textAlign:"center",padding:"20px"}}>
            {t("patientDashboard.prescription.none")}
          </p>
        ) : null}
        <div style={{display:"flex",gap:"10px",marginTop:"16px"}}>
          <button onClick={()=>downloadPrescriptionPDF(appt, items)} style={{flex:1,
            padding:"12px",borderRadius:"9px",background:"#eff8ff",
            border:"1.5px solid #93c5fd",color:"#0369a1",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"600",fontSize:"14px",cursor:"pointer"}}>
            {t("patientDashboard.prescription.downloadPdf")}
          </button>
          <button onClick={onClose} style={{flex:1,
            padding:"12px",borderRadius:"9px",background:"#0b1f3a",
            color:"#fff",border:"none",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"600",fontSize:"14px",cursor:"pointer"}}>
            {t("patientDashboard.prescription.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appt, onCancel, onViewPrescription, hasReview, onReview }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [calOpen,      setCalOpen]      = useState(false);
  const [dlSummary,    setDlSummary]    = useState(false); // true while fetching + generating PDF
  const docName = appt.doctors?.full_name ? appt.doctors.full_name : t("patientDashboard.card.yourDoctorLower");

  const downloadSummary = async () => {
    // Fetch the structured medicine list first, then generate the PDF
    // client-side. The prescription text is already on the appt object
    // from /appointments/my — only the items need a separate call.
    setDlSummary(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/appointments/${appt.id}/prescription-items`,
        { headers: { Authorization: `Bearer ${token}` } });
      const json  = await res.json();
      downloadAppointmentSummaryPDF(appt, json.items || []);
    } catch {
      downloadAppointmentSummaryPDF(appt, []); // still generate without items on fetch failure
    } finally {
      setDlSummary(false);
    }
  };

  const messageDoctor = async () => {
    const msg = window.prompt(t("patientDashboard.card.messagePrompt", { name: docName }));
    if (!msg || !msg.trim()) return;
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/chat/patient/message-doctor`, {
        method: "POST",
        headers: {"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify({ doctor_id: appt.doctor_id, message: msg.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || t("patientDashboard.card.sendFailed"), "error"); return; }
      navigate(`/patient/chat?open=${json.conversation_id}`);
    } catch { showToast(t("patientDashboard.card.genericError"), "error"); }
  };
  const s      = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
  // Same fix as the Upcoming/Past tab bucketing above — compare the
  // full scheduled date+time, not just the date, otherwise a same-day
  // appointment is wrongly treated as already past (see the note near
  // getScheduledAt for why). This also silently disabled Cancel on
  // legitimate same-day appointments, since canCancel depends on this.
  let scheduledForIsPast;
  try {
    const t = (appt.appointment_time || "00:00:00").slice(0, 8);
    scheduledForIsPast = new Date(`${appt.appointment_date}T${t}`);
  } catch { scheduledForIsPast = new Date(appt.appointment_date); }
  const isPast = scheduledForIsPast < new Date();
  const canCancel = ["pending","approved"].includes(appt.status) && !isPast;
  const doc    = appt.doctors;

  // Video join used to be gated to a 15-minute-before window, since
  // appointments were pre-scheduled. Video bookings are now immediate/
  // on-demand (booked for "right now" when the patient submits), so
  // there's no window to gate on — Join Video is always shown as soon
  // as the appointment is approved and paid (see the condition below).

  return (
    <div className="appt-card">
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"flex-start",marginBottom:"10px",flexWrap:"wrap",gap:"8px"}}>
        <div>
          <h3 style={{fontSize:"16px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 2px"}}>
            {doc?.full_name || t("patientDashboard.card.doctorFallback")}
          </h3>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            color:"#047857",fontWeight:"600",margin:0}}>
            {doc?.specialization || t("patientDashboard.card.specialistFallback")}
          </p>
        </div>
        <span style={{background:s.bg,color:s.color,fontSize:"11px",fontWeight:"700",
          padding:"3px 10px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
          {t(`patientDashboard.status.${appt.status}`, appt.status)}
        </span>
      </div>

      {/* Details grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",
        padding:"10px",background:"#f8fafc",borderRadius:"8px",marginBottom:"10px"}}>
        {[["📅",new Date(appt.appointment_date).toLocaleDateString("en-IN",
            {day:"numeric",month:"short",year:"numeric"})],
          ["🕐",appt.appointment_time?.slice(0,5)||""],
          ["📋",t(`patientDashboard.type.${appt.appointment_type}`, appt.appointment_type)],
          ["💰",appt.payment_amount?`₹${appt.payment_amount}`:(appt.status==="pending"?t("patientDashboard.card.feeTbc"):t("patientDashboard.card.dash"))],
        ].map(([ic,v])=>(
          <p key={ic} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            color:"#374151",margin:0,display:"flex",alignItems:"center",gap:"5px"}}>
            <span>{ic}</span><span style={{fontWeight:"600"}}>{v}</span>
          </p>
        ))}
      </div>

      {appt.symptoms &&
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",
          fontStyle:"italic",marginBottom:"10px",padding:"7px 10px",
          background:"#f8fafc",borderRadius:"7px"}}>
          "{appt.symptoms}"
        </p>}

      {appt.admin_notes &&
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",
          borderRadius:"8px",padding:"9px 12px",marginBottom:"10px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
            fontWeight:"700",color:"#15803d",margin:"0 0 2px"}}>{t("patientDashboard.card.adminNote")}</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            color:"#374151",margin:0}}>{appt.admin_notes}</p>
        </div>}

      {/* Actions */}
      <div style={{display:"flex",gap:"7px",flexWrap:"wrap",marginTop:"4px"}}>
        {/* Pay — available as soon as you book, not just after approval,
            since payment now happens right after booking rather than
            waiting on admin/doctor confirmation */}
        {["pending","approved"].includes(appt.status) && appt.payment_amount>0 &&
          !["paid","refund_pending","refunded"].includes(appt.payment_status) && !isPast &&
          <Link to={`/patient/payment/${appt.id}`}
            className="act-btn"
            style={{background:"linear-gradient(135deg,#d97706,#b45309)",color:"#fff"}}>
            {t("patientDashboard.card.pay", { amount: appt.payment_amount })}
          </Link>}
        {/* Refund status */}
        {appt.payment_status==="refund_pending" &&
          <span style={{padding:"8px 12px",borderRadius:"8px",background:"#fef9c3",
            border:"1px solid #fde047",color:"#854d0e",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"600",fontSize:"12px"}}>{t("patientDashboard.card.refundPending")}</span>}
        {appt.payment_status==="refunded" &&
          <span style={{padding:"8px 12px",borderRadius:"8px",background:"#f0fdf4",
            border:"1px solid #86efac",color:"#15803d",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"600",fontSize:"12px"}}>{t("patientDashboard.card.refunded")}</span>}
        {/* Join video — no timing gate. Video consultations are
            on-demand (booked for "right now" with no fixed slot), so
            "is this appointment in the past" doesn't apply the way it
            does for a scheduled in-person/home visit. As soon as the
            doctor accepts and payment is settled, the button shows —
            that's the only thing that should gate it. */}
        {appt.status==="approved" &&
          (appt.payment_status==="paid" || !appt.payment_amount) &&
          appt.appointment_type==="video" && (
            <Link to={`/patient/video/${appt.id}`}
              className="act-btn"
              style={{background:"linear-gradient(135deg,#047857,#059669)",color:"#fff"}}>
              {t("patientDashboard.card.joinVideo")}
            </Link>
          )}
        {/* Add to Calendar — only makes sense once a doctor has actually
            confirmed the slot, same condition as Join Video */}
        {appt.status==="approved" && !isPast &&
          <div style={{position:"relative"}}>
            <button onClick={()=>setCalOpen(v=>!v)}
              className="act-btn"
              style={{background:"#fffbeb",border:"1.5px solid #fde68a",color:"#b45309"}}>
              {t("patientDashboard.card.addToCalendar")}
            </button>
            {calOpen && (
              <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,zIndex:50,
                background:"#fff",border:"1px solid #e2eaf4",borderRadius:"10px",
                boxShadow:"0 8px 24px rgba(11,31,58,.14)",minWidth:"180px",overflow:"hidden"}}>
                <button onClick={()=>{ downloadICS(appt); setCalOpen(false); }}
                  style={{display:"block",width:"100%",textAlign:"left",padding:"10px 14px",
                    border:"none",background:"transparent",cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151"}}>
                  {t("patientDashboard.card.downloadIcs")}
                </button>
                <a href={googleCalendarUrl(appt)} target="_blank" rel="noreferrer"
                  onClick={()=>setCalOpen(false)}
                  style={{display:"block",width:"100%",textAlign:"left",padding:"10px 14px",
                    fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",
                    textDecoration:"none",borderTop:"1px solid #f1f5f9"}}>
                  {t("patientDashboard.card.googleCalendar")}
                </a>
              </div>
            )}
          </div>}
        {/* Paid badge */}
        {appt.payment_status==="paid" &&
          <span style={{padding:"8px 12px",borderRadius:"8px",background:"#f0fdf4",
            border:"1px solid #86efac",color:"#15803d",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"600",fontSize:"12px"}}>{t("patientDashboard.card.paid")}</span>}
        {/* Message doctor — only once they've confirmed, and only once
            paid if a fee applies (same gate as Join Video) */}
        {appt.status==="approved" &&
          (appt.payment_status==="paid" || !appt.payment_amount) &&
          <button onClick={messageDoctor}
            className="act-btn"
            style={{background:"#eff8ff",border:"1.5px solid #93c5fd",color:"#0369a1"}}>
            {t("patientDashboard.card.messageDoctor")}
          </button>}
        {/* View prescription */}
        {appt.status==="completed" &&
          <button onClick={()=>onViewPrescription(appt)}
            className="act-btn"
            style={{background:"#eff8ff",border:"1.5px solid #93c5fd",color:"#0369a1"}}>
            {t("patientDashboard.card.prescription")}
          </button>}
        {/* Download appointment summary PDF */}
        {appt.status==="completed" &&
          <button onClick={downloadSummary} disabled={dlSummary}
            className="act-btn"
            style={{background:"#f0fdf4",border:"1.5px solid #86efac",color:"#047857",
              opacity: dlSummary ? 0.7 : 1, cursor: dlSummary ? "wait" : "pointer"}}>
            {dlSummary ? t("patientDashboard.card.generating") : t("patientDashboard.card.summaryPdf")}
          </button>}
        {/* Review */}
        {appt.status==="completed" && (
          hasReview ? (
            <span style={{padding:"8px 12px",borderRadius:"8px",background:"#f0fdf4",
              border:"1px solid #86efac",color:"#15803d",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"600",fontSize:"12px"}}>{t("patientDashboard.card.reviewed")}</span>
          ) : (
            <button onClick={()=>onReview(appt)}
              className="act-btn"
              style={{background:"#fffbeb",border:"1.5px solid #fde68a",color:"#b45309"}}>
              {t("patientDashboard.card.leaveReview")}
            </button>
          )
        )}
        {/* Re-book */}
        {["completed","cancelled","rejected"].includes(appt.status) && doc &&
          <Link to={`/doctors?rebook=${appt.doctor_id}`}
            className="act-btn"
            style={{background:"#f8fafc",border:"1.5px solid #e2eaf4",color:"#64748b"}}>
            {t("patientDashboard.card.rebook")}
          </Link>}
        {/* Cancel */}
        {canCancel &&
          <button onClick={()=>onCancel(appt.id)}
            className="act-btn"
            style={{background:"#fff",border:"1.5px solid #fecaca",color:"#dc2626"}}>
            {t("patientDashboard.card.cancel")}
          </button>}
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "upcoming";
  const setTab = (id) => setSearchParams({ tab: id });
  const [prescAppt,    setPrescAppt]    = useState(null);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [reviewedIds,  setReviewedIds]  = useState(new Set());
  const [reviewAppt,   setReviewAppt]   = useState(null); // appointment currently being reviewed

  useEffect(() => {
    document.title = "My Dashboard — We Care 4 'all'";
    fetchAppointments();
    fetchUnread();
    fetchMyReviews();
    const t = setInterval(fetchUnread, 30000);
    return () => clearInterval(t);
  }, []);

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/reviews/my`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json  = await res.json();
      setReviewedIds(new Set((json.reviews||[]).map(r=>r.appointment_id)));
    } catch {}
  };

  const fetchUnread = async () => {
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/chat/unread-count`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json  = await res.json();
      setUnreadCount(json.count || 0);
    } catch {}
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/appointments/my`,
        {headers:{Authorization:`Bearer ${token}`}});
      const json  = await res.json();
      setAppointments(json.appointments||[]);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm(t("patientDashboard.confirmCancel"))) return;
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/appointments/${id}/cancel`,
        {method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      if (res.ok) fetchAppointments();
      else showToast(t("patientDashboard.cancelFailed"), "error");
    } catch { showToast(t("patientDashboard.genericError"), "error"); }
  };

  // Bug fixed here: this used to compare new Date(a.appointment_date)
  // — parsed as UTC midnight on that date — against `now`. Since IST is
  // UTC+5:30, UTC midnight on today's date has already passed by the
  // time anyone in India is awake, so ANY appointment scheduled for
  // later today was being misfiled as "Past" the instant it was
  // created — which is exactly why a same-day video appointment
  // disappeared from Upcoming and hid its Join Video button. Compare
  // the full scheduled date+time instead of just the date.
  const getScheduledAt = (a) => {
    try {
      const t = (a.appointment_time || "00:00:00").slice(0, 8);
      return new Date(`${a.appointment_date}T${t}`);
    } catch { return new Date(a.appointment_date); }
  };
  const now = new Date();

  // Video appointments are instant-booked (appointment_time is just
  // "whenever the patient clicked book", not a real future slot) — so
  // "has the original timestamp passed?" doesn't mean the consultation
  // actually happened. A video appointment the doctor just accepted
  // should show as Upcoming (joinable) regardless of how much clock
  // time has passed since booking, right up until it's actually
  // completed. In-person/home visits DO have a genuine future-scheduled
  // slot, so the datetime comparison still applies to those.
  const isUpcoming = (a) => {
    if (["cancelled","rejected"].includes(a.status)) return false;
    if (a.appointment_type === "video") return a.status !== "completed";
    return getScheduledAt(a) >= now;
  };
  const isPast = (a) => {
    if (["cancelled","rejected"].includes(a.status)) return false;
    if (a.appointment_type === "video") return a.status === "completed";
    return getScheduledAt(a) < now;
  };

  const upcoming = appointments.filter(isUpcoming);
  const past     = appointments.filter(isPast);
  const cancelled= appointments.filter(a => ["cancelled","rejected"].includes(a.status));
  const displayed = tab === "upcoming" ? upcoming : tab === "cancelled" ? cancelled : past;

  const STATS = [
    {label:t("patientDashboard.stats.total"),    value:appointments.length, icon:"📋",color:"#0369a1"},
    {label:t("patientDashboard.stats.upcoming"), value:upcoming.length,      icon:"📅",color:"#047857"},
    {label:t("patientDashboard.stats.completed"),value:appointments.filter(a=>a.status==="completed").length,icon:"✅",color:"#7c3aed"},
    {label:t("patientDashboard.stats.cancelled"),value:appointments.filter(a=>["cancelled","rejected"].includes(a.status)).length,icon:"❌",color:"#be123c"},
  ];

  return (
    <div className="pd">
      <style>{G}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"20px 16px 24px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"flex-start",flexWrap:"wrap",gap:"12px",marginBottom:"14px"}}>
            <div>
              <Link to="/" style={{textDecoration:"none"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"rgba(255,255,255,.5)",marginBottom:"3px"}}>{t("patientDashboard.welcomeBack")}</p>
              </Link>
              <h1 style={{fontSize:"clamp(20px,3vw,28px)",fontWeight:"700",
                color:"#fff",margin:0}}>
                {user?.name||user?.email||"Patient"}
              </h1>
            </div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
              <NotificationBell/>
              <Link to="/doctors" style={{padding:"8px 16px",borderRadius:"8px",
                background:"linear-gradient(135deg,#047857,#059669)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"600",fontSize:"13px"}}>
                {t("patientDashboard.bookBtn")}
              </Link>
              <Link to="/patient/chat" style={{padding:"8px 14px",borderRadius:"8px",
                background:"rgba(255,255,255,.10)",
                border:"1px solid rgba(255,255,255,.20)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                display:"inline-flex",alignItems:"center",gap:"6px",position:"relative"}}>
                {t("patientDashboard.messages")}
                {unreadCount > 0 && (
                  <span style={{background:"#dc2626",color:"#fff",fontSize:"10px",
                    fontWeight:"700",padding:"1px 6px",borderRadius:"50px",
                    minWidth:"18px",textAlign:"center",lineHeight:"16px"}}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/patient/profile" style={{padding:"8px 14px",borderRadius:"8px",
                background:"rgba(255,255,255,.10)",
                border:"1px solid rgba(255,255,255,.20)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px"}}>
                {t("patientDashboard.profile")}
              </Link>
              <button onClick={()=>{logout();navigate("/");}} style={{
                padding:"8px 13px",borderRadius:"8px",background:"transparent",
                border:"1px solid rgba(255,255,255,.20)",
                color:"rgba(255,255,255,.65)",fontFamily:"'DM Sans',sans-serif",
                fontSize:"13px",cursor:"pointer"}}>
                {t("patientDashboard.logout")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"18px 14px 40px"}}>
        {/* Stats */}
        <div className="stat-grid">
          {STATS.map(({label,value,icon,color})=>(
            <div key={label} style={{background:"#fff",border:"1px solid #e2eaf4",
              borderRadius:"12px",padding:"14px 16px",textAlign:"center",
              boxShadow:"0 2px 8px rgba(11,31,58,.05)"}}>
              <div style={{fontSize:"20px",marginBottom:"5px"}}>{icon}</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",
                fontWeight:"700",color,margin:"0 0 2px",lineHeight:1}}>{loading ? "…" : value}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                color:"#6b7688",margin:0}}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{marginBottom:"22px"}}>
          <h2 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"12px"}}>
            {t("patientDashboard.quickActions")}
          </h2>
          <div className="quick-grid">
            {[{to:"/doctors",            icon:"🔍",label:t("patientDashboard.quick.findDoctor")},
              {to:"/doctors?type=video", icon:"🎥",label:t("patientDashboard.quick.videoConsult")},
              {to:"/doctors?type=home",  icon:"🏠",label:t("patientDashboard.quick.homeVisit")},
              {to:"/patient/profile",    icon:"👤",label:t("patientDashboard.quick.myProfile")},
              {to:"/patient/family-members",icon:"👨‍👩‍👧",label:t("patientDashboard.quick.familyMembers")},
              {to:"/patient/health-profile",icon:"🩺",label:t("patientDashboard.quick.healthProfile")},
              {to:"/patient/documents",icon:"📄",label:t("patientDashboard.quick.myDocuments")},
              {to:"/patient/waitlist",icon:"🔔",label:t("patientDashboard.quick.myWaitlist")},
              {to:"/patient/pharmacy-orders",icon:"💊",label:t("patientDashboard.quick.pharmacyOrders")},
              {to:"/patient/chat",         icon:"💬",label:t("patientDashboard.quick.messages")},
              {to:"/patient/payments",     icon:"💳",label:t("patientDashboard.quick.payments")},
              {to:"/home-healthcare",      icon:"🏠",label:t("patientDashboard.quick.homeVisit")},
              {to:"/patient/home-bookings",icon:"📋",label:t("patientDashboard.quick.myVisits")},
              {to:"/contact",              icon:"📞",label:t("patientDashboard.quick.getHelp")},
            ].map(({to,icon,label})=>(
              <Link key={label} to={to} className="quick-btn">
                <span style={{fontSize:"22px"}}>{icon}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  fontWeight:"600",color:"#374151"}}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Appointments */}
        <div>
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
            <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
              {t("patientDashboard.myAppointments")}
            </h2>
            {appointments.length > 0 &&
              <button onClick={()=>downloadAppointmentHistoryPDF(appointments, user?.name)}
                style={{display:"flex",alignItems:"center",gap:"6px",padding:"7px 14px",
                  borderRadius:"8px",background:"#fff",border:"1px solid #e2eaf4",
                  color:"#374151",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"12.5px",cursor:"pointer"}}>
                {t("patientDashboard.downloadHistory")}
              </button>}
          </div>
          <div className="tab-row" style={{marginBottom:"14px"}}>
            {[["upcoming",t("patientDashboard.tabs.upcoming",{count:loading?"…":upcoming.length})],
              ["past",t("patientDashboard.tabs.past",{count:loading?"…":past.length})],
              ["cancelled",t("patientDashboard.tabs.cancelled",{count:loading?"…":cancelled.length})],
            ].map(([t2,l])=>(
              <button key={t2} onClick={()=>setTab(t2)}
                className={`tab-btn${tab===t2?" active":""}`}>{l}</button>
            ))}
          </div>

          {loading ? (
            <div style={{padding:"48px 0",textAlign:"center"}}>
              <div className="spin"/>
              <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6b7688",
                marginTop:"12px",fontSize:"14px"}}>{t("patientDashboard.loading")}</p>
            </div>
          ) : displayed.length === 0 ? (
            <div style={{padding:"48px 20px",textAlign:"center",background:"#fff",
              borderRadius:"14px",border:"1px solid #e2eaf4"}}>
              <div style={{fontSize:"40px",marginBottom:"12px"}}>📅</div>
              <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"7px"}}>
                {tab==="upcoming" ? t("patientDashboard.empty.upcomingTitle") : tab==="cancelled" ? t("patientDashboard.empty.cancelledTitle") : t("patientDashboard.empty.pastTitle")}
              </h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#64748b",marginBottom:"18px"}}>
                {tab==="upcoming"
                  ? t("patientDashboard.empty.upcomingDesc")
                  : tab==="cancelled"
                  ? t("patientDashboard.empty.cancelledDesc")
                  : t("patientDashboard.empty.pastDesc")}
              </p>
              {tab==="upcoming" &&
                <Link to="/doctors" style={{display:"inline-flex",alignItems:"center",
                  gap:"8px",background:"linear-gradient(135deg,#047857,#059669)",
                  color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"14px",padding:"12px 24px",borderRadius:"8px"}}>
                  {t("patientDashboard.empty.findDoctorBtn")}
                </Link>}
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {displayed.map(appt => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  onCancel={cancelAppointment}
                  onViewPrescription={setPrescAppt}
                  hasReview={reviewedIds.has(appt.id)}
                  onReview={setReviewAppt}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {prescAppt && (
        <PrescriptionModal
          appt={prescAppt}
          onClose={() => setPrescAppt(null)}
        />
      )}
      {reviewAppt && (
        <ReviewModal
          appt={reviewAppt}
          onClose={() => setReviewAppt(null)}
          onSubmitted={() => { setReviewAppt(null); fetchMyReviews(); }}
        />
      )}
    </div>
  );
}
