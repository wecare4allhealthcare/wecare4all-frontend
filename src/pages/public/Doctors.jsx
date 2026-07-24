/**
 * Doctors.jsx — Fix 2
 * FIXES:
 * 1. Filter scrollbar — hidden native scrollbar, smooth scroll with fade indicators
 * 2. Filter bar sticky top fixed to 72px (navbar height)
 * 3. Mobile responsive — single column cards, full-width search, touch-friendly chips
 * 4. Booking modal — full-screen on mobile, scrollable
 * 5. Doctor grid — 1 col mobile, 2 col tablet, 3+ col desktop
 */
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.dc{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;background:#f0f6fc;}
.dc *{box-sizing:border-box;} .dc a{text-decoration:none;}
.dc h1,.dc h2,.dc h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(1.4);}}
.spin{width:36px;height:36px;border:3px solid #e2eaf4;border-top:3px solid #047857;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto;}

/* Calendar day buttons — the inline "outline" style on each button is
   used to show which day is currently SELECTED, which meant keyboard
   focus had no visible indicator at all on any day that wasn't already
   selected (inline styles beat this class for outline, so this only
   fires when the button's own outline isn't set to "none"). Selection
   is already shown via background color + box-shadow, so this is safe
   to add without conflicting. */
.dc-daybtn:focus-visible{outline:2px solid #0369a1 !important;outline-offset:2px;}

/* Doctor cards */
.doc-card{background:#fff;border:1px solid #e2eaf4;border-radius:16px;overflow:hidden;transition:all .28s;box-shadow:0 2px 10px rgba(11,31,58,.06);}
.doc-card:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(11,31,58,.13);border-color:#86efac;}

/* Filter chips */
.filter-chip{
  padding:8px 16px;border-radius:50px;border:1.5px solid #e2eaf4;background:#fff;
  font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .2s;
  white-space:nowrap;flex-shrink:0;
}
.filter-chip:hover{border-color:#047857;color:#047857;}
.filter-chip.active{border-color:#047857;background:#047857;color:#fff;}

/* Hide native scrollbar on filter rows — cross-browser */
.filter-scroll{
  display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;
  -ms-overflow-style:none;scrollbar-width:none;
}
.filter-scroll::-webkit-scrollbar{display:none;}

/* Slot buttons */
.slot-btn{padding:8px 12px;border-radius:8px;border:1.5px solid #e2eaf4;background:#f8fafc;
  font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;}
.slot-btn:hover:not(:disabled){border-color:#047857;background:#f0fdf4;color:#047857;}
.slot-btn.sel{border-color:#047857;background:#047857;color:#fff;}
.slot-btn:disabled{opacity:.4;cursor:not-allowed;}

/* Form inputs */
.dc-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:10px 14px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;
  outline:none;transition:all .2s;}
.dc-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.dc-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;}
.btn-book{width:100%;background:linear-gradient(135deg,#047857,#059669);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;padding:13px;
  border-radius:9px;border:none;cursor:pointer;transition:all .25s;
  box-shadow:0 4px 16px rgba(4,120,87,.35);}
.btn-book:hover{transform:translateY(-1px);}
.btn-book:disabled{opacity:.6;cursor:not-allowed;transform:none;}

/* Modal — full screen on mobile */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2000;
  display:flex;align-items:flex-end;justify-content:center;padding:0;}
.modal-box{background:#fff;width:100%;max-width:540px;
  max-height:95vh;overflow-y:auto;border-radius:20px 20px 0 0;
  box-shadow:0 -8px 40px rgba(0,0,0,.25);}

/* Responsive grid */
@media(min-width:640px){
  .modal-bg{align-items:center;padding:16px;}
  .modal-box{border-radius:18px;max-height:90vh;}
}
@media(min-width:480px){
  .doc-grid{grid-template-columns:repeat(2,1fr)!important;}
}
@media(min-width:900px){
  .doc-grid{grid-template-columns:repeat(3,1fr)!important;}
}
@media(min-width:1100px){
  .doc-grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))!important;}
}
/* Mobile form grid — single column */
@media(max-width:480px){
  .form-grid{grid-template-columns:1fr!important;}
  .form-grid>div[style*="span 2"]{grid-column:span 1!important;}
}
`;

// ── Doctor Card ───────────────────────────────────────────────
function DoctorCard({ doc, onBook }) {
  const { t } = useTranslation();
  return (
    <div className="doc-card">
      <div style={{height:"220px",background:"#f0f6fc",overflow:"hidden",position:"relative"}}>
        {doc.photo_url
          ? <img loading="lazy" src={doc.photo_url} alt={doc.full_name}
              style={{width:"100%",height:"100%",objectFit:"contain",objectPosition:"center",background:"#f0f6fc"}}/>
          : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
              justifyContent:"center",background:"linear-gradient(135deg,#0b1f3a,#112d52)"}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"52px",
                fontWeight:"700",color:"#fff"}}>
                {doc.full_name?.[0]||"D"}
              </span>
            </div>}
        {doc.available_now&&
          <div style={{position:"absolute",top:"8px",left:"8px",display:"flex",alignItems:"center",gap:"5px",
            background:"#10b981",color:"#fff",fontSize:"10px",fontWeight:"700",
            padding:"3px 9px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif",
            boxShadow:"0 2px 8px rgba(16,185,129,.45)"}}>
            <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#fff",
              display:"inline-block",animation:"pulse 1.6s ease-in-out infinite"}}/>
            {t("doctorsPage.card.availableNow")}
          </div>}
        <div style={{position:"absolute",top:"8px",right:"8px",display:"flex",gap:"4px",flexDirection:"column"}}>
          {doc.available_online&&
            <span style={{background:"#047857",color:"#fff",fontSize:"10px",fontWeight:"700",
              padding:"2px 8px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>{t("doctorDashboard.type.video")}</span>}
          {doc.available_in_person&&
            <span style={{background:"#7c3aed",color:"#fff",fontSize:"10px",fontWeight:"700",
              padding:"2px 8px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>{t("doctorDashboard.type.inperson")}</span>}
          {doc.available_home&&
            <span style={{background:"#0369a1",color:"#fff",fontSize:"10px",fontWeight:"700",
              padding:"2px 8px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>{t("doctorDashboard.type.home")}</span>}
        </div>
      </div>
      <div style={{padding:"16px"}}>
        <h3 style={{fontSize:"17px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 2px"}}>
          {doc.full_name}
        </h3>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#047857",
          fontWeight:"600",margin:"0 0 4px"}}>{doc.specialization}</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",
          margin:"0 0 10px",fontWeight:"300"}}>
          {[doc.qualification,doc.experience_yrs&&`${doc.experience_yrs}+ yrs`].filter(Boolean).join(" · ")}
          {doc.registration_number&&
            <><br/><span style={{fontSize:"10.5px",color:"#6b7688"}}>{t("doctorsPage.card.regNo")} {doc.registration_number}</span></>}
        </p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"8px 0",borderTop:"1px solid #f1f5f9",borderBottom:"1px solid #f1f5f9",
          marginBottom:"12px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"4px",marginBottom:"5px"}}>
              <span style={{color:"#fbbf24",fontSize:"13px"}}>★</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                fontWeight:"700",color:"#0b1f3a"}}>{doc.rating||"—"}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                color:"#6b7688"}}>{t("doctorsPage.card.reviews",{count:doc.total_reviews||0})}</span>
            </div>
            {doc.rating_breakdown && doc.total_reviews > 0 && (
              <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
                {[5,4,3,2,1].map(star => {
                  const count = doc.rating_breakdown[String(star)] || 0;
                  const pct   = doc.total_reviews > 0
                    ? Math.round((count / doc.total_reviews) * 100) : 0;
                  return (
                    <div key={star} style={{display:"flex",alignItems:"center",gap:"4px"}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",
                        color:"#6b7688",width:"6px",textAlign:"right",flexShrink:0}}>
                        {star}
                      </span>
                      <span style={{color:"#fbbf24",fontSize:"8px",flexShrink:0}}>★</span>
                      <div style={{flex:1,height:"4px",background:"#f1f5f9",
                        borderRadius:"2px",overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",borderRadius:"2px",
                          background: star>=4?"#fbbf24":star===3?"#fb923c":"#f87171",
                          transition:"width .3s"}}/>
                      </div>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",
                        color:"#6b7688",width:"16px",textAlign:"right",flexShrink:0}}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {doc.consultation_fee>0&&
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              fontWeight:"700",color:"#047857",flexShrink:0,alignSelf:"flex-start"}}>
              ₹{doc.consultation_fee}
            </span>}
        </div>
        {doc.location&&
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688",
            marginBottom:"10px"}}>📍 {doc.location}</p>}
        <button className="btn-book" onClick={()=>onBook(doc)}>
          {t("doctorsPage.card.bookBtn")}
        </button>
      </div>
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────────
function BookingModal({ doc, onClose, onSuccess }) {
  const { t } = useTranslation();
  const { user, isLoggedIn } = useAuth();
  const [date,     setDate]     = useState("");
  const [slots,    setSlots]    = useState([]);
  const [onLeave,  setOnLeave]  = useState(null); // null | reason string
  const [selSlot,  setSelSlot]  = useState("");
  const [loading2, setLoading2] = useState(false);
  const [preview,     setPreview]     = useState([]); // 7-day availability preview
  const [previewWeek, setPreviewWeek] = useState(0);  // week offset from today
  const [previewLoad, setPreviewLoad] = useState(false);
  const [apptType, setApptType] = useState(
    doc.available_online ? "video" : doc.available_in_person ? "inperson" : "home"
  );
  const [familyMembers, setFamilyMembers] = useState([]);
  const [bookingFor,    setBookingFor]    = useState("self"); // "self" | a family_member id
  const [form, setForm] = useState({
    patient_name:   user?.name||"",
    patient_email:  user?.email||"",
    patient_mobile: user?.mobile||"",
    patient_age:"", patient_gender:"", patient_state:"", symptoms:"", patient_address:"",
  });
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [done,    setDone]    = useState(false);
  const [sponsored, setSponsored] = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate()+1);
  const minStr = minDate.toISOString().split("T")[0];

  // Fetch 7-day availability preview — fires on mount and when the
  // doctor picker week changes (← / → buttons in the mini-calendar).
  const fetchPreview = async (weekOffset = 0) => {
    setPreviewLoad(true);
    try {
      const base   = new Date();
      base.setDate(base.getDate() + 1 + weekOffset * 7); // start from tomorrow
      const from   = base.toISOString().split("T")[0];
      const res    = await fetch(`${API}/doctors/${doc.id}/availability-preview?from_date=${from}`);
      const json   = await res.json();
      setPreview(json.preview || []);
    } catch { setPreview([]); }
    finally { setPreviewLoad(false); }
  };

  useEffect(() => { fetchPreview(0); }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const token = localStorage.getItem("wc4a_token");
        const res   = await fetch(`${API}/family-members`, { headers:{ Authorization:`Bearer ${token}` }});
        const json  = await res.json();
        setFamilyMembers(json.family_members || []);
      } catch { setFamilyMembers([]); }
    })();
  }, [isLoggedIn]);

  const calcAge = (dob) => {
    if (!dob) return "";
    const d = new Date(dob), now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    if (now.getMonth() < d.getMonth() || (now.getMonth()===d.getMonth() && now.getDate()<d.getDate())) age--;
    return age >= 0 ? String(age) : "";
  };

  const handleBookingForChange = (val) => {
    setBookingFor(val);
    if (val === "self") {
      setForm(p => ({ ...p,
        patient_name: user?.name||"", patient_age:"", patient_gender:"" }));
    } else {
      const m = familyMembers.find(fm => fm.id === val);
      if (m) {
        setForm(p => ({ ...p,
          patient_name: m.full_name,
          patient_age:  calcAge(m.date_of_birth),
          patient_gender: m.gender || "",
        }));
      }
    }
  };

  const [waitlistStatus, setWaitlistStatus] = useState(null); // null | "joining" | "joined" | "error"
  const [waitlistMsg, setWaitlistMsg] = useState("");

  const joinWaitlist = async () => {
    setWaitlistStatus("joining");
    try {
      const res = await fetch(`${API}/waitlist`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${localStorage.getItem("wc4a_token")}` },
        body: JSON.stringify({ doctor_id: doc.id, preferred_date: date }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || t("doctorsPage.modal.errors.waitlistFailed"));
      setWaitlistMsg(json.message);
      setWaitlistStatus("joined");
    } catch (ex) {
      setWaitlistMsg(ex.message);
      setWaitlistStatus("error");
    }
  };

  const fetchSlots = async(d)=>{
    setLoading2(true); setSlots([]); setSelSlot(""); setOnLeave(null);
    try{
      const res = await fetch(`${API}/doctors/${doc.id}/slots?date_str=${d}`,
        {headers:{Authorization:`Bearer ${localStorage.getItem("wc4a_token")}`}});
      const json = await res.json();
      setSlots(json.slots||[]);
      setOnLeave(json.on_leave ? (json.message || t("doctorsPage.modal.errors.onLeave")) : null);
    }catch{setSlots([]);}
    finally{setLoading2(false);}
  };

  const handleDate=(d)=>{setDate(d);setWaitlistStatus(null);if(d)fetchSlots(d);};

  const handleSubmit=async(e)=>{
    e.preventDefault(); setErr("");
    // Video is an immediate/on-demand booking — no calendar slot to
    // validate, book for right now and let the doctor accept from there.
    const isVideo = apptType === "video";
    let bookDate = date, bookTime = selSlot;
    if (isVideo) {
      const now = new Date();
      bookDate = now.toISOString().split("T")[0];
      bookTime = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    } else {
      if(!date){setErr(t("doctorsPage.modal.errors.selectDate"));return;}
      if(!selSlot){setErr(t("doctorsPage.modal.errors.selectSlot"));return;}
    }
    if(!form.patient_name||!form.patient_email||!form.patient_mobile){
      setErr(t("doctorsPage.modal.errors.requiredFields"));return;
    }
    if(apptType==="home" && !form.patient_address?.trim()){
      setErr(t("doctorsPage.modal.errors.homeAddressRequired"));return;
    }
    setLoading(true);
    try{
      const res=await fetch(`${API}/appointments/book`,{
        method:"POST",
        headers:{"Content-Type":"application/json",
          Authorization:`Bearer ${localStorage.getItem("wc4a_token")}`},
        body:JSON.stringify({doctor_id:doc.id,appointment_date:bookDate,
          appointment_time:bookTime,appointment_type:apptType,...form,
          patient_age:form.patient_age?parseInt(form.patient_age):null,
          family_member_id: bookingFor!=="self" ? bookingFor : null}),
      });
      const json=await res.json();
      if(!res.ok)throw new Error(json.detail||t("doctorsPage.modal.errors.bookingFailed"));
      setSponsored(!!json.is_company_sponsored);
      setDone(true);
      setTimeout(()=>{onSuccess(json.appointment_id, json.is_company_sponsored);onClose();},2000);
    }catch(ex){setErr(ex.message);}
    finally{setLoading(false);}
  };

  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#047857,#059669)",
          padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",
          position:"sticky",top:0,zIndex:1}}>
          <div>
            <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>{t("doctorsPage.modal.title")}</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"rgba(255,255,255,.78)",
              fontSize:"12px",margin:0}}>{doc.full_name} · {doc.specialization}</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",
            color:"#fff",width:"34px",height:"34px",borderRadius:"8px",cursor:"pointer",
            fontSize:"20px",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        {done?(
          <div style={{padding:"48px 24px",textAlign:"center"}}>
            <div style={{fontSize:"48px",marginBottom:"14px"}}>✅</div>
            <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>
              {t("doctorsPage.modal.bookedTitle")}
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b"}}>
              {t("doctorsPage.modal.bookedDesc",{email:form.patient_email})}<br/>
              {sponsored
                ? "This consultation is covered by your employer — no payment needed."
                : t("doctorsPage.modal.bookedRedirect")}
            </p>
          </div>
        ):(
          <form onSubmit={handleSubmit} style={{padding:"18px 20px"}}>
            {(doc.registration_number||doc.certifications||doc.awards)&&
              <div style={{background:"#f8fafc",border:"1px solid #e2eaf4",borderRadius:"9px",
                padding:"11px 13px",marginBottom:"14px"}}>
                {doc.registration_number&&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#64748b",margin:"0 0 4px"}}>
                    <strong style={{color:"#374151"}}>{t("doctorsPage.modal.regNo")}</strong> {doc.registration_number}
                  </p>}
                {doc.certifications&&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#64748b",margin:"0 0 4px"}}>
                    <strong style={{color:"#374151"}}>{t("doctorsPage.modal.certifications")}</strong> {doc.certifications}
                  </p>}
                {doc.awards&&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#64748b",margin:0}}>
                    <strong style={{color:"#374151"}}>{t("doctorsPage.modal.awards")}</strong> {doc.awards}
                  </p>}
              </div>}
            {/* Type */}
            <div style={{marginBottom:"14px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                color:"#374151",marginBottom:"8px"}}>{t("doctorsPage.modal.consultType")}</p>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {[
                  {id:"video",    label:t("doctorDashboard.type.video"),     show:doc.available_online},
                  {id:"inperson", label:t("doctorDashboard.type.inperson"),  show:doc.available_in_person},
                  {id:"home",     label:t("doctorDashboard.type.home"), show:doc.available_home},
                ].filter(ty=>ty.show).map(ty=>(
                  <button key={ty.id} type="button" onClick={()=>setApptType(ty.id)}
                    style={{padding:"8px 14px",borderRadius:"8px",border:"1.5px solid",
                      fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
                      cursor:"pointer",transition:"all .2s",
                      borderColor:apptType===ty.id?"#047857":"#e2eaf4",
                      background:apptType===ty.id?"#f0fdf4":"#f8fafc",
                      color:apptType===ty.id?"#047857":"#64748b"}}>
                    {ty.label}
                  </button>
                ))}
              </div>
            </div>

            {apptType === "video" && (
              <div style={{background:"#eff8ff",border:"1px solid #93c5fd",borderRadius:"9px",
                padding:"11px 13px",marginBottom:"14px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                  color:"#0369a1",margin:0,lineHeight:"1.6"}}>
                  {t("doctorsPage.modal.videoNote")}
                </p>
              </div>
            )}

            {/* Date + Slots — only for In-Person / Home Visit. Video is an
                immediate/on-demand booking: no calendar slot to pick,
                the doctor accepts and the call happens as soon as
                they're ready, so none of this applies. */}
            {apptType !== "video" && (
              <>
            <div style={{marginBottom:"12px"}}>
              <p className="dc-lbl">{t("doctorsPage.modal.selectDate")}</p>

              {/* 7-day availability preview mini-calendar */}
              <div style={{marginBottom:"10px"}}>
                {/* Week navigation */}
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:"6px"}}>
                  <button type="button"
                    onClick={()=>{const w=previewWeek-1;setPreviewWeek(w);fetchPreview(w);}}
                    disabled={previewWeek<=0}
                    style={{background:"none",border:"none",cursor:previewWeek<=0?"not-allowed":"pointer",
                      color:previewWeek<=0?"#e2eaf4":"#64748b",fontSize:"16px",padding:"0 4px"}}>
                    ‹
                  </button>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                    color:"#6b7688",fontWeight:"600"}}>
                    {previewLoad ? t("doctorsPage.modal.loading") : t("doctorsPage.modal.tapDateToSelect")}
                  </span>
                  <button type="button"
                    onClick={()=>{const w=previewWeek+1;setPreviewWeek(w);fetchPreview(w);}}
                    style={{background:"none",border:"none",cursor:"pointer",
                      color:"#64748b",fontSize:"16px",padding:"0 4px"}}>
                    ›
                  </button>
                </div>

                {/* 7 day cells */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"4px"}}>
                  {preview.map(day => {
                    const d       = new Date(day.date + "T00:00:00");
                    const dayNum  = d.getDate();
                    const dayName = d.toLocaleDateString("en-IN",{weekday:"short"}).slice(0,2);
                    const isSelected = date === day.date;
                    const isPast     = day.date < minStr;
                    const DOT_COLOR  = {
                      available: "#22c55e",
                      limited:   "#f59e0b",
                      full:      "#ef4444",
                      none:      "#e2eaf4",
                    };
                    const BG = isSelected ? "#047857" : "#f8fafc";
                    const TXT = isSelected ? "#fff" : isPast ? "#d1d5db" : "#0b1f3a";
                    return (
                      <button key={day.date} type="button" className="dc-daybtn"
                        disabled={isPast || day.status==="none" || day.status==="full"}
                        onClick={()=>!isPast && day.status!=="none" && handleDate(day.date)}
                        aria-pressed={isSelected}
                        aria-label={`${dayName} ${dayNum}, ${day.status==="none"||day.status==="full"?"unavailable":day.status}`}
                        style={{
                          display:"flex",flexDirection:"column",alignItems:"center",
                          gap:"3px",padding:"6px 2px",borderRadius:"8px",border:"none",
                          background: BG,
                          cursor: isPast||day.status==="none"||day.status==="full"
                            ? "not-allowed" : "pointer",
                          opacity: isPast ? 0.4 : 1,
                          boxShadow: isSelected ? "0 2px 8px rgba(4,120,87,.3)" : "none",
                          transition:"all .15s",
                        }}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",
                          fontWeight:"600",color:isSelected?"rgba(255,255,255,.8)":"#6b7688"}}>
                          {dayName}
                        </span>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                          fontWeight:"700",color:TXT}}>
                          {dayNum}
                        </span>
                        <div style={{width:"5px",height:"5px",borderRadius:"50%",
                          background: isSelected ? "rgba(255,255,255,.8)"
                            : DOT_COLOR[day.status] || "#e2eaf4",
                          flexShrink:0}}/>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{display:"flex",gap:"10px",marginTop:"5px",
                  justifyContent:"flex-end",flexWrap:"wrap"}}>
                  {[["#22c55e",t("doctorsPage.modal.legend.available")],["#f59e0b",t("doctorsPage.modal.legend.limited")],
                    ["#ef4444",t("doctorsPage.modal.legend.full")],["#e2eaf4",t("doctorsPage.modal.legend.unavailable")]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:"3px"}}>
                      <div style={{width:"6px",height:"6px",borderRadius:"50%",background:c}}/>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"9px",
                        color:"#6b7688"}}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <input type="date" min={minStr} value={date}
                onChange={e=>handleDate(e.target.value)} className="dc-inp"/>
            </div>

            {/* Slots */}
            {date&&(
              <div style={{marginBottom:"14px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                  color:"#374151",marginBottom:"8px"}}>
                  {t("doctorsPage.modal.availableSlots")}
                  {loading2&&<span style={{color:"#6b7688",fontWeight:"400"}}>{t("doctorsPage.modal.loadingSlots")}</span>}
                </p>
                {!loading2&&slots.length===0&&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color:"#6b7688",fontStyle:"italic"}}>
                    {t("doctorsPage.modal.noSlots")}
                  </p>}
                <div style={{display:"flex",flexWrap:"wrap",gap:"7px"}}>
                  {slots.map(s=>(
                    <button key={s.time_24} type="button" disabled={!s.available}
                      onClick={()=>setSelSlot(s.time_24)}
                      className={`slot-btn${selSlot===s.time_24?" sel":""}`}>
                      {s.time_12}
                    </button>
                  ))}
                </div>
                {apptType==="inperson" && selSlot && (() => {
                  const addr = slots.find(s=>s.time_24===selSlot)?.address;
                  return addr ? (
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                      color:"#0369a1",marginTop:"8px",background:"#eff8ff",
                      border:"1px solid #bae6fd",borderRadius:"8px",padding:"8px 11px"}}>
                      📍 <strong>{t("doctorsPage.modal.clinicAddress")}</strong> {addr}
                    </p>
                  ) : (
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      color:"#92400e",marginTop:"8px",fontStyle:"italic"}}>
                      {t("doctorsPage.modal.clinicAddressUnset")}
                    </p>
                  );
                })()}
                {!loading2 && !slots.some(s=>s.available) && (
                  <div style={{marginTop:"10px",background: onLeave?"#fef2f2":"#fffbeb",
                    border:`1px solid ${onLeave?"#fecaca":"#fde68a"}`,
                    borderRadius:"9px",padding:"11px 13px"}}>
                    {onLeave ? (
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#991b1b",margin:0}}>
                        🚫 {t("doctorsPage.modal.chooseDifferentDate",{reason:onLeave})}
                      </p>
                    ) : waitlistStatus==="joined" ? (
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#15803d",margin:0}}>
                        ✅ {waitlistMsg}
                      </p>
                    ) : (
                      <>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#92400e",margin:"0 0 8px"}}>
                          {t("doctorsPage.modal.waitlistPrompt")}
                        </p>
                        <button type="button" onClick={joinWaitlist} disabled={waitlistStatus==="joining"}
                          style={{padding:"8px 16px",borderRadius:"8px",background:"#d97706",
                            border:"none",color:"#fff",fontFamily:"'DM Sans',sans-serif",
                            fontWeight:"600",fontSize:"12.5px",cursor:"pointer"}}>
                          {waitlistStatus==="joining" ? t("doctorsPage.modal.joining") : t("doctorsPage.modal.joinWaitlist")}
                        </button>
                        {waitlistStatus==="error" &&
                          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#dc2626",margin:"6px 0 0"}}>
                            ⚠ {waitlistMsg}
                          </p>}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
              </>
            )}

            {/* Booking for — only shown if the patient has saved family members */}
            {familyMembers.length > 0 && (
              <div style={{marginBottom:"14px"}}>
                <label className="dc-lbl" htmlFor="public-doctors-booking-for">{t("doctorsPage.modal.bookingFor")}</label>
                <select id="public-doctors-booking-for" value={bookingFor} onChange={e=>handleBookingForChange(e.target.value)} className="dc-inp">
                  <option value="self">{t("doctorsPage.modal.myself")}</option>
                  {familyMembers.map(m=>(
                    <option key={m.id} value={m.id}>{m.full_name} ({m.relationship})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Patient Details */}
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"#047857",letterSpacing:"1.5px",textTransform:"uppercase",
              borderBottom:"1px solid #e2eaf4",paddingBottom:"6px",marginBottom:"12px"}}>
              {t("doctorsPage.modal.patientDetails")}
            </p>
            <div className="form-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <div style={{gridColumn:"span 2"}}>
                <label className="dc-lbl" htmlFor="public-doctors-full-name">{t("doctorsPage.modal.fullName")}</label>
                <input id="public-doctors-full-name" value={form.patient_name}
                  onChange={e=>set("patient_name",e.target.value)}
                  className="dc-inp" placeholder={t("doctorsPage.modal.fullNamePlaceholder")}/>
              </div>
              {apptType==="home" && (
                <div style={{gridColumn:"span 2"}}>
                  <label className="dc-lbl" htmlFor="public-doctors-home-address">
                    {t("doctorsPage.modal.homeVisitAddress")}
                  </label>
                  <textarea id="public-doctors-home-address" value={form.patient_address}
                    onChange={e=>set("patient_address",e.target.value)}
                    className="dc-inp" rows={2} style={{resize:"vertical"}}
                    placeholder={t("doctorsPage.modal.homeVisitAddressPlaceholder")}/>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                    color:"#6b7688",marginTop:"4px"}}>
                    {t("doctorsPage.modal.homeVisitNote")}
                  </p>
                </div>
              )}
              <div>
                <label className="dc-lbl" htmlFor="public-doctors-email">{t("doctorsPage.modal.email")}</label>
                <input id="public-doctors-email" type="email" value={form.patient_email}
                  onChange={e=>set("patient_email",e.target.value)}
                  className="dc-inp" placeholder={t("doctorsPage.modal.emailPlaceholder")}/>
              </div>
              <div>
                <label className="dc-lbl" htmlFor="public-doctors-mobile">{t("doctorsPage.modal.mobile")}</label>
                <input id="public-doctors-mobile" type="tel" value={form.patient_mobile}
                  onChange={e=>set("patient_mobile",e.target.value)}
                  className="dc-inp" placeholder={t("doctorsPage.modal.mobilePlaceholder")}/>
              </div>
              <div>
                <label className="dc-lbl" htmlFor="public-doctors-age">{t("doctorsPage.modal.age")}</label>
                <input id="public-doctors-age" type="number" onWheel={e=>e.currentTarget.blur()} value={form.patient_age}
                  onChange={e=>set("patient_age",e.target.value)}
                  className="dc-inp" placeholder="35" min="1" max="120"/>
              </div>
              <div>
                <label className="dc-lbl" htmlFor="public-doctors-gender">{t("doctorsPage.modal.gender")}</label>
                <select id="public-doctors-gender" value={form.patient_gender}
                  onChange={e=>set("patient_gender",e.target.value)} className="dc-inp">
                  <option value="">{t("doctorsPage.modal.genderSelect")}</option>
                  <option value="male">{t("doctorsPage.modal.genderMale")}</option>
                  <option value="female">{t("doctorsPage.modal.genderFemale")}</option>
                  <option value="other">{t("doctorsPage.modal.genderOther")}</option>
                </select>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label className="dc-lbl" htmlFor="public-doctors-state">{t("doctorsPage.modal.state")}</label>
                <input id="public-doctors-state" value={form.patient_state}
                  onChange={e=>set("patient_state",e.target.value)}
                  className="dc-inp" placeholder={t("doctorsPage.modal.statePlaceholder")}/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label className="dc-lbl" htmlFor="public-doctors-symptoms-reason">{t("doctorsPage.modal.symptoms")}</label>
                <textarea id="public-doctors-symptoms-reason" value={form.symptoms}
                  onChange={e=>set("symptoms",e.target.value)}
                  className="dc-inp" rows={2} style={{resize:"vertical"}}
                  placeholder={t("doctorsPage.modal.symptomsPlaceholder")}/>
              </div>
            </div>

            {err&&<p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",
              fontSize:"13px",margin:"10px 0 0"}}>⚠ {err}</p>}

            <button type="submit" disabled={loading} className="btn-book"
              style={{marginTop:"14px"}}>
              {loading
                ?<span style={{display:"inline-flex",alignItems:"center",gap:"8px",justifyContent:"center"}}>
                    <span style={{width:"14px",height:"14px",border:"2px solid rgba(255,255,255,.4)",
                      borderTop:"2px solid #fff",borderRadius:"50%",
                      animation:"spin .75s linear infinite",display:"inline-block"}}/>
                    {t("doctorsPage.modal.booking")}
                  </span>
                :t("doctorsPage.modal.confirmBooking")}
            </button>

            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"#6b7688",textAlign:"center",marginTop:"8px"}}>
              {t("doctorsPage.modal.secureNote")}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function Doctors() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [availNowOnly, setAvailNowOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spec,    setSpec]    = useState("All");
  const [type,    setType]    = useState("all");
  const [search,  setSearch]  = useState("");
  const [bookDoc, setBookDoc] = useState(null);

  const SPEC_VALUES = [
    "All",
    // Common first - most searched
    "Physician",
    "Diabetologist",
    "Paediatrician",
    "General Medicine",
    // Specialists
    "Cardiology",
    "Neurology",
    "Orthopaedics",
    "Oncology",
    "Gastroenterology",
    "Dermatology",
    "Gynaecology",
    "Psychiatry",
    "Urology",
    "Physiotherapy",
    "Pulmonology",
    "Nephrology",
    "Endocrinology",
    "Ophthalmology",
    "ENT",
    "Rheumatology",
    "General Surgery",
  ];
  const TYPES = [
    { id:"all",      label:t("doctorsPage.types.all"), icon:"🏥" },
    { id:"video",    label:t("doctorsPage.types.video"),     icon:"🎥" },
    { id:"inperson", label:t("doctorsPage.types.inperson"), icon:"🏥" },
    { id:"home",     label:t("doctorsPage.types.home"),icon:"🏠" },
  ];

  useEffect(()=>{
    window.scrollTo(0,0);
    fetchDoctors();
  },[]);

  const fetchDoctors=async(s="All",t="all",q="")=>{
    setLoading(true);
    try{
      const p=new URLSearchParams();
      if(s!=="All")p.set("specialization",s);
      if(t!=="all")p.set("type",t);
      if(q)p.set("search",q);
      p.set("page","1");
      const res=await fetch(`${API}/doctors?${p}`);
      const json=await res.json();
      setDoctors(json.doctors||[]);
      setHasMore(!!json.has_more);
      setPage(1);
    }catch{setDoctors([]);setHasMore(false);}
    finally{setLoading(false);}
  };

  // Fetches the next page and appends it to the existing list, rather
  // than replacing it — this is what the pagination added on the
  // backend (list_doctors) is actually for. With today's doctor count
  // this button won't even appear (hasMore stays false until there's
  // more than one page), but it's ready as soon as that changes.
  const loadMoreDoctors=async()=>{
    setLoadingMore(true);
    try{
      const p=new URLSearchParams();
      if(spec!=="All")p.set("specialization",spec);
      if(type!=="all")p.set("type",type);
      if(search)p.set("search",search);
      const nextPage=page+1;
      p.set("page",String(nextPage));
      const res=await fetch(`${API}/doctors?${p}`);
      const json=await res.json();
      setDoctors(prev=>[...prev,...(json.doctors||[])]);
      setHasMore(!!json.has_more);
      setPage(nextPage);
    }catch{ /* leave existing list as-is on failure */ }
    finally{setLoadingMore(false);}
  };

  const handleFilter=(ns,nt,nq)=>{
    setSpec(ns);setType(nt);setSearch(nq);
    fetchDoctors(ns,nt,nq);
  };

  const handleBook=(doc)=>{
    if(!isLoggedIn){navigate("/login?redirect=/doctors");return;}
    setBookDoc(doc);
  };

  const visibleDoctors = useMemo(
    () => availNowOnly ? doctors.filter(d=>d.available_now) : doctors,
    [doctors, availNowOnly]
  );

  // Memoized — an inline object literal here (recreated every render)
  // made SEO's meta-tag effect re-fire on every re-render, including
  // ones unrelated to the doctor list (e.g. typing in an unrelated
  // filter). See SEO.jsx for the full story — this pattern was also
  // silently scrolling the page back to top.
  const doctorsJsonLd = useMemo(() => (
    visibleDoctors.length > 0 ? {
      "@type": "ItemList",
      "itemListElement": visibleDoctors.slice(0, 30).map((d, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Physician",
          "name": d.full_name,
          "medicalSpecialty": d.specialization,
          // No per-doctor detail page exists yet (flagged in the SEO
          // audit as a real gap — long-tail "Dr. X specialty city"
          // searches rank fastest on a dedicated URL, not a shared
          // listing page). Pointing url at this listing page for now
          // is still valid schema, just not the ideal long-term setup.
          "url": "https://www.wecare4all.in/doctors",
          ...(d.qualification || d.experience_yrs ? {
            "description": [d.qualification, d.experience_yrs && `${d.experience_yrs}+ years experience`].filter(Boolean).join(" · "),
          } : {}),
          ...(d.photo_url ? { "image": d.photo_url } : {}),
          ...(d.location ? {
            "address": { "@type": "PostalAddress", "addressLocality": d.location, "addressCountry": "IN" },
          } : {}),
          ...(d.consultation_fee > 0 ? {
            "priceRange": `₹${d.consultation_fee}`,
          } : {}),
        },
      })),
    } : null
  ), [visibleDoctors]);

  return(
    <div className="dc">
      <style>{G}</style>
      <SEO title="Find a Doctor Near Me — Specialists in Chennai" path="/doctors"
        description="Find verified specialist doctors near you in Chennai — book video consultations, in-person visits, or home visits. Physicians, Diabetologists, Paediatricians, Cardiologists and 18+ specialties."
        jsonLd={doctorsJsonLd}
      />

      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",
        paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,
          backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{maxWidth:"1200px",margin:"0 auto",padding:"32px 20px 64px"}}>
          {/* Breadcrumb */}
          <div style={{display:"flex",gap:"6px",alignItems:"center",marginBottom:"14px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"12px",
              fontFamily:"'DM Sans',sans-serif"}}>{t("doctorsPage.hero.breadcrumbHome")}</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/ </span>
            <span style={{color:"#6ee7b7",fontSize:"12px",fontFamily:"'DM Sans',sans-serif"}}>
              {t("doctorsPage.hero.breadcrumbCurrent")}
            </span>
          </div>

          <h1 style={{fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(28px,5vw,52px)",fontWeight:"700",
            color:"#fff",lineHeight:"1.1",marginBottom:"10px"}}>
            {t("doctorsPage.hero.title")} <span style={{color:"#34d399"}}>{t("doctorsPage.hero.titleHighlight")}</span>
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(14px,2vw,16px)",
            color:"rgba(255,255,255,.65)",maxWidth:"420px",fontWeight:"300",marginBottom:"24px"}}>
            {t("doctorsPage.hero.subtitle")}
          </p>

          {/* Search */}
          <div style={{display:"flex",gap:"8px",maxWidth:"520px",
            background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.18)",
            borderRadius:"12px",padding:"6px 6px 6px 14px",backdropFilter:"blur(12px)"}}>
            <span style={{color:"rgba(255,255,255,.5)",fontSize:"16px",
              alignSelf:"center",flexShrink:0}}>🔍</span>
            <input value={search}
              onChange={e=>handleFilter(spec,type,e.target.value)}
              placeholder={t("doctorsPage.hero.searchPlaceholder")}
              style={{flex:1,background:"transparent",border:"none",outline:"none",
                fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#fff",padding:"8px 0"}}/>
            {search&&
              <button onClick={()=>handleFilter(spec,type,"")}
                style={{background:"rgba(255,255,255,.15)",border:"none",color:"#fff",
                  borderRadius:"8px",padding:"6px 10px",cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",fontSize:"12px"}}>✕</button>}
          </div>
        </div>
        <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg"
          style={{display:"block",width:"100%",marginBottom:"-2px"}}>
          <path d="M0,34 C360,65 1080,8 1440,34 L1440,50 L0,50 Z" fill="#f0f6fc"/>
        </svg>
      </section>

      {/* Filters — sticky below 72px navbar */}
      <section style={{background:"#fff",borderBottom:"1px solid #e2eaf4",
        padding:"12px 0",position:"sticky",top:"72px",zIndex:80}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 16px"}}>
          {/* Scroll hint gradient */}
          <div style={{position:"relative"}}>
            {/* Type chips */}
            <div className="filter-scroll" style={{marginBottom:"8px"}}>
              {TYPES.map(ty=>(
                <button key={ty.id} onClick={()=>handleFilter(spec,ty.id,search)}
                  className={`filter-chip${type===ty.id?" active":""}`}
                  style={{fontSize:"12px",padding:"6px 14px"}}>
                  {ty.icon} {ty.label}
                </button>
              ))}
            </div>
            {/* Specialty dropdown — scrollable select */}
            <div style={{position:"relative",display:"inline-block",minWidth:"220px"}}>
              <div style={{
                display:"flex",alignItems:"center",gap:"8px",
                padding:"9px 14px",borderRadius:"50px",cursor:"pointer",
                background: spec!=="All"?"#f0fdf4":"#fff",
                border: spec!=="All"?"1.5px solid #047857":"1.5px solid #e2eaf4",
                fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color: spec!=="All"?"#047857":"#374151",fontWeight:"600",
                userSelect:"none",
              }}
              onClick={e=>{
                const el=document.getElementById("spec-dropdown");
                el.style.display=el.style.display==="block"?"none":"block";
                e.stopPropagation();
              }}>
                <span style={{fontSize:"14px"}}>🩺</span>
                {spec==="All" ? t("doctorsPage.allSpecialties") : spec}
                <span style={{marginLeft:"auto",fontSize:"10px",color:"#6b7688"}}>▼</span>
              </div>
              <div id="spec-dropdown" style={{
                display:"none",position:"absolute",top:"calc(100% + 6px)",left:0,
                zIndex:200,background:"#fff",borderRadius:"14px",
                boxShadow:"0 8px 32px rgba(0,0,0,.15)",
                border:"1px solid #e2eaf4",
                width:"220px",maxHeight:"280px",overflowY:"auto",
                scrollbarWidth:"thin",
              }}>
                {SPEC_VALUES.map((s,i)=>(
                  <div key={s}
                    onClick={e=>{
                      handleFilter(s,type,search);
                      document.getElementById("spec-dropdown").style.display="none";
                      e.stopPropagation();
                    }}
                    style={{
                      padding:"10px 16px",cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                      color: spec===s?"#047857":"#374151",
                      fontWeight: spec===s?"700":"400",
                      background: spec===s?"#f0fdf4":i===0?"#f8fafc":"#fff",
                      borderBottom:"1px solid #f1f5f9",
                      display:"flex",alignItems:"center",gap:"8px",
                      borderRadius: i===0?"14px 14px 0 0":
                        i===SPEC_VALUES.length-1?"0 0 14px 14px":"0",
                    }}
                    onMouseEnter={e=>e.target.style.background="#f0fdf4"}
                    onMouseLeave={e=>e.target.style.background=spec===s?"#f0fdf4":i===0?"#f8fafc":"#fff"}
                  >
                    {spec===s && <span style={{color:"#047857",fontSize:"11px"}}>✓</span>}
                    {s==="All"?`🏥 ${t("doctorsPage.allSpecialties")}`:s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Grid */}
      <section style={{padding:"28px 0 60px"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 16px"}}>
          {/* Count bar */}
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b"}}>
              {loading?t("doctorsPage.loading"):t("doctorsPage.doctorsFound",{count:visibleDoctors.length,plural:visibleDoctors.length!==1?"s":""})}
            </p>
            {!isLoggedIn&&
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6b7688"}}>
                <Link to="/login" style={{color:"#047857",fontWeight:"600"}}>{t("doctorsPage.login")}</Link>
                {" "}{t("doctorsPage.toBook")}
              </p>}
          </div>

          {!loading && doctors.some(d=>d.available_now) &&
            <button onClick={()=>setAvailNowOnly(v=>!v)}
              style={{display:"inline-flex",alignItems:"center",gap:"6px",marginBottom:"16px",
                padding:"7px 14px",borderRadius:"50px",cursor:"pointer",
                background: availNowOnly ? "#10b981" : "#f0fdf4",
                border: availNowOnly ? "1px solid #10b981" : "1px solid #86efac",
                color: availNowOnly ? "#fff" : "#15803d",
                fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",fontWeight:"700"}}>
              <span style={{width:"6px",height:"6px",borderRadius:"50%",
                background: availNowOnly ? "#fff" : "#10b981",display:"inline-block",
                animation:"pulse 1.6s ease-in-out infinite"}}/>
              {availNowOnly ? t("doctorsPage.showingAvailableOnly") : t("doctorsPage.availableNowOnly")}
            </button>}

          {loading?(
            <div style={{padding:"60px 0",textAlign:"center"}}>
              <div className="spin"/>
              <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6b7688",marginTop:"12px",fontSize:"14px"}}>
                {t("doctorsPage.loadingDoctors")}
              </p>
            </div>
          ):visibleDoctors.length===0?(
            <div style={{padding:"60px 0",textAlign:"center"}}>
              <div style={{fontSize:"44px",marginBottom:"12px"}}>👨‍⚕️</div>
              <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>
                {availNowOnly ? t("doctorsPage.noneAvailableNow") : t("doctorsPage.noDoctorsFound")}
              </h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#64748b",marginBottom:"18px"}}>
                {availNowOnly ? t("doctorsPage.tryAllDoctors") : t("doctorsPage.tryDifferentSearch")}
              </p>
              <button onClick={()=>{ setAvailNowOnly(false); handleFilter("All","all",""); }}
                style={{padding:"10px 22px",borderRadius:"9px",
                  background:"#047857",color:"#fff",border:"none",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"14px",cursor:"pointer"}}>
                {t("doctorsPage.clearFilters")}
              </button>
            </div>
          ):(
            <div className="doc-grid" style={{display:"grid",
              gridTemplateColumns:"1fr",gap:"18px"}}>
              {visibleDoctors.map(doc=>(
                <DoctorCard key={doc.id} doc={doc} onBook={handleBook}/>
              ))}
            </div>
          )}
          {hasMore && !availNowOnly && (
            <div style={{textAlign:"center",marginTop:"22px"}}>
              <button onClick={loadMoreDoctors} disabled={loadingMore}
                style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
                  color:"#047857",background:"#fff",border:"1.5px solid #047857",
                  padding:"11px 28px",borderRadius:"9px",
                  cursor:loadingMore?"not-allowed":"pointer",opacity:loadingMore?0.6:1}}>
                {loadingMore ? t("doctorsPage.modal.loading") : t("doctorsPage.loadMore")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {bookDoc&&(
        <BookingModal
          doc={bookDoc}
          onClose={()=>setBookDoc(null)}
            onSuccess={(appointmentId, isCompanySponsored)=>{
            setBookDoc(null);
            if(appointmentId && bookDoc.consultation_fee>0 && !isCompanySponsored) navigate(`/patient/payment/${appointmentId}`);
          }}
        />
      )}
    </div>
  );
}
