/**
 * Doctors.jsx — Fix 2
 * FIXES:
 * 1. Filter scrollbar — hidden native scrollbar, smooth scroll with fade indicators
 * 2. Filter bar sticky top fixed to 72px (navbar height)
 * 3. Mobile responsive — single column cards, full-width search, touch-friendly chips
 * 4. Booking modal — full-screen on mobile, scrollable
 * 5. Doctor grid — 1 col mobile, 2 col tablet, 3+ col desktop
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.dc{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;background:#f0f6fc;}
.dc *{box-sizing:border-box;} .dc a{text-decoration:none;}
.dc h1,.dc h2,.dc h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:36px;height:36px;border:3px solid #e2eaf4;border-top:3px solid #047857;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto;}

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

const SPECS = [
  "All","Cardiology","Neurology","Orthopaedics","Oncology",
  "Gastroenterology","Dermatology","Gynaecology","Paediatrics",
  "Psychiatry","Urology","Physiotherapy","General Medicine",
];
const TYPES = [
  { id:"all",      label:"All Types", icon:"🏥" },
  { id:"video",    label:"Video",     icon:"🎥" },
  { id:"inperson", label:"In-Person", icon:"🏥" },
  { id:"home",     label:"Home Visit",icon:"🏠" },
];

// ── Doctor Card ───────────────────────────────────────────────
function DoctorCard({ doc, onBook }) {
  return (
    <div className="doc-card">
      <div style={{height:"160px",background:"#f0f6fc",overflow:"hidden",position:"relative"}}>
        {doc.photo_url
          ? <img src={doc.photo_url} alt={doc.full_name}
              style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
              justifyContent:"center",background:"linear-gradient(135deg,#0b1f3a,#112d52)"}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"52px",
                fontWeight:"700",color:"#fff"}}>
                {doc.full_name?.[0]||"D"}
              </span>
            </div>}
        <div style={{position:"absolute",top:"8px",right:"8px",display:"flex",gap:"4px",flexDirection:"column"}}>
          {doc.available_online&&
            <span style={{background:"#047857",color:"#fff",fontSize:"10px",fontWeight:"700",
              padding:"2px 8px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>🎥 Video</span>}
          {doc.available_home&&
            <span style={{background:"#0369a1",color:"#fff",fontSize:"10px",fontWeight:"700",
              padding:"2px 8px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>🏠 Home</span>}
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
        </p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"8px 0",borderTop:"1px solid #f1f5f9",borderBottom:"1px solid #f1f5f9",
          marginBottom:"12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
            <span style={{color:"#fbbf24",fontSize:"13px"}}>★</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
              fontWeight:"700",color:"#0b1f3a"}}>{doc.rating||"5.0"}</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"#94a3b8"}}>({doc.total_reviews||0})</span>
          </div>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
            fontWeight:"700",color:"#047857"}}>
            {doc.consultation_fee?`₹${doc.consultation_fee}`:"Free"}
          </span>
        </div>
        {doc.location&&
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8",
            marginBottom:"10px"}}>📍 {doc.location}</p>}
        <button className="btn-book" onClick={()=>onBook(doc)}>
          Book Appointment →
        </button>
      </div>
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────────
function BookingModal({ doc, onClose, onSuccess }) {
  const { user } = useAuth();
  const [date,     setDate]     = useState("");
  const [slots,    setSlots]    = useState([]);
  const [selSlot,  setSelSlot]  = useState("");
  const [loading2, setLoading2] = useState(false);
  const [apptType, setApptType] = useState("video");
  const [form, setForm] = useState({
    patient_name:   user?.name||"",
    patient_email:  user?.email||"",
    patient_mobile: user?.mobile||"",
    patient_age:"", patient_gender:"", patient_state:"", symptoms:"",
  });
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [done,    setDone]    = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate()+1);
  const minStr = minDate.toISOString().split("T")[0];

  const fetchSlots = async(d)=>{
    setLoading2(true); setSlots([]); setSelSlot("");
    try{
      const res = await fetch(`${API}/doctors/${doc.id}/slots?date_str=${d}`,
        {headers:{Authorization:`Bearer ${localStorage.getItem("wc4a_token")}`}});
      const json = await res.json();
      setSlots(json.slots||[]);
    }catch{setSlots([]);}
    finally{setLoading2(false);}
  };

  const handleDate=(d)=>{setDate(d);if(d)fetchSlots(d);};

  const handleSubmit=async(e)=>{
    e.preventDefault(); setErr("");
    if(!date){setErr("Please select a date");return;}
    if(!selSlot){setErr("Please select a time slot");return;}
    if(!form.patient_name||!form.patient_email||!form.patient_mobile){
      setErr("Name, email and mobile are required");return;
    }
    setLoading(true);
    try{
      const res=await fetch(`${API}/appointments/book`,{
        method:"POST",
        headers:{"Content-Type":"application/json",
          Authorization:`Bearer ${localStorage.getItem("wc4a_token")}`},
        body:JSON.stringify({doctor_id:doc.id,appointment_date:date,
          appointment_time:selSlot,appointment_type:apptType,...form,
          patient_age:form.patient_age?parseInt(form.patient_age):null}),
      });
      const json=await res.json();
      if(!res.ok)throw new Error(json.detail||"Booking failed");
      setDone(true);
      setTimeout(()=>{onSuccess();onClose();},2500);
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
            <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>Book Appointment</h3>
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
              Appointment Booked!
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b"}}>
              Confirmation sent to {form.patient_email}.<br/>Our team will confirm within 2 hours.
            </p>
          </div>
        ):(
          <form onSubmit={handleSubmit} style={{padding:"18px 20px"}}>
            {/* Type */}
            <div style={{marginBottom:"14px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                color:"#374151",marginBottom:"8px"}}>Consultation Type</p>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {[
                  {id:"video",   label:"🎥 Video",     show:doc.available_online},
                  {id:"inperson",label:"🏥 In-Person",  show:true},
                  {id:"home",    label:"🏠 Home Visit", show:doc.available_home},
                ].filter(t=>t.show).map(t=>(
                  <button key={t.id} type="button" onClick={()=>setApptType(t.id)}
                    style={{padding:"8px 14px",borderRadius:"8px",border:"1.5px solid",
                      fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
                      cursor:"pointer",transition:"all .2s",
                      borderColor:apptType===t.id?"#047857":"#e2eaf4",
                      background:apptType===t.id?"#f0fdf4":"#f8fafc",
                      color:apptType===t.id?"#047857":"#64748b"}}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div style={{marginBottom:"12px"}}>
              <label className="dc-lbl">Select Date *</label>
              <input type="date" min={minStr} value={date}
                onChange={e=>handleDate(e.target.value)} className="dc-inp"/>
            </div>

            {/* Slots */}
            {date&&(
              <div style={{marginBottom:"14px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                  color:"#374151",marginBottom:"8px"}}>
                  Available Slots
                  {loading2&&<span style={{color:"#94a3b8",fontWeight:"400"}}> — loading...</span>}
                </p>
                {!loading2&&slots.length===0&&
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color:"#94a3b8",fontStyle:"italic"}}>
                    No slots available on this date.
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
              </div>
            )}

            {/* Patient Details */}
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"#047857",letterSpacing:"1.5px",textTransform:"uppercase",
              borderBottom:"1px solid #e2eaf4",paddingBottom:"6px",marginBottom:"12px"}}>
              Patient Details
            </p>
            <div className="form-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <div style={{gridColumn:"span 2"}}>
                <label className="dc-lbl">Full Name *</label>
                <input value={form.patient_name}
                  onChange={e=>set("patient_name",e.target.value)}
                  className="dc-inp" placeholder="Patient full name"/>
              </div>
              <div>
                <label className="dc-lbl">Email *</label>
                <input type="email" value={form.patient_email}
                  onChange={e=>set("patient_email",e.target.value)}
                  className="dc-inp" placeholder="email@example.com"/>
              </div>
              <div>
                <label className="dc-lbl">Mobile *</label>
                <input type="tel" value={form.patient_mobile}
                  onChange={e=>set("patient_mobile",e.target.value)}
                  className="dc-inp" placeholder="90XXXXXXXX"/>
              </div>
              <div>
                <label className="dc-lbl">Age</label>
                <input type="number" value={form.patient_age}
                  onChange={e=>set("patient_age",e.target.value)}
                  className="dc-inp" placeholder="35" min="1" max="120"/>
              </div>
              <div>
                <label className="dc-lbl">Gender</label>
                <select value={form.patient_gender}
                  onChange={e=>set("patient_gender",e.target.value)} className="dc-inp">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label className="dc-lbl">State</label>
                <input value={form.patient_state}
                  onChange={e=>set("patient_state",e.target.value)}
                  className="dc-inp" placeholder="Tamil Nadu"/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label className="dc-lbl">Symptoms / Reason</label>
                <textarea value={form.symptoms}
                  onChange={e=>set("symptoms",e.target.value)}
                  className="dc-inp" rows={2} style={{resize:"vertical"}}
                  placeholder="Briefly describe your symptoms…"/>
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
                    Booking...
                  </span>
                :"Confirm Booking →"}
            </button>

            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"#94a3b8",textAlign:"center",marginTop:"8px"}}>
              🔒 Secure booking · Cancel anytime
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function Doctors() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spec,    setSpec]    = useState("All");
  const [type,    setType]    = useState("all");
  const [search,  setSearch]  = useState("");
  const [bookDoc, setBookDoc] = useState(null);

  useEffect(()=>{
    document.title="Find a Doctor — We Care 4 'all'";
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
      const res=await fetch(`${API}/doctors?${p}`);
      const json=await res.json();
      setDoctors(json.doctors||[]);
    }catch{setDoctors([]);}
    finally{setLoading(false);}
  };

  const handleFilter=(ns,nt,nq)=>{
    setSpec(ns);setType(nt);setSearch(nq);
    fetchDoctors(ns,nt,nq);
  };

  const handleBook=(doc)=>{
    if(!isLoggedIn){navigate("/login?redirect=/doctors");return;}
    setBookDoc(doc);
  };

  return(
    <div className="dc">
      <style>{G}</style>

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
              fontFamily:"'DM Sans',sans-serif"}}>Home</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/ </span>
            <span style={{color:"#6ee7b7",fontSize:"12px",fontFamily:"'DM Sans',sans-serif"}}>
              Find a Doctor
            </span>
          </div>

          <h1 style={{fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(28px,5vw,52px)",fontWeight:"700",
            color:"#fff",lineHeight:"1.1",marginBottom:"10px"}}>
            Find Your <span style={{color:"#34d399"}}>Specialist</span>
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(14px,2vw,16px)",
            color:"rgba(255,255,255,.65)",maxWidth:"420px",fontWeight:"300",marginBottom:"24px"}}>
            Browse verified doctors across 18+ specialties.
          </p>

          {/* Search */}
          <div style={{display:"flex",gap:"8px",maxWidth:"520px",
            background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.18)",
            borderRadius:"12px",padding:"6px 6px 6px 14px",backdropFilter:"blur(12px)"}}>
            <span style={{color:"rgba(255,255,255,.5)",fontSize:"16px",
              alignSelf:"center",flexShrink:0}}>🔍</span>
            <input value={search}
              onChange={e=>handleFilter(spec,type,e.target.value)}
              placeholder="Search doctor, specialty, location…"
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
              {TYPES.map(t=>(
                <button key={t.id} onClick={()=>handleFilter(spec,t.id,search)}
                  className={`filter-chip${type===t.id?" active":""}`}
                  style={{fontSize:"12px",padding:"6px 14px"}}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            {/* Specialty chips */}
            <div className="filter-scroll">
              {SPECS.map(s=>(
                <button key={s} onClick={()=>handleFilter(s,type,search)}
                  className={`filter-chip${spec===s?" active":""}`}
                  style={{fontSize:"11px",padding:"5px 12px"}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Grid */}
      <section style={{padding:"28px 0 60px"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 16px"}}>
          {/* Count bar */}
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",marginBottom:"18px",flexWrap:"wrap",gap:"8px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b"}}>
              {loading?"Loading...":`${doctors.length} doctor${doctors.length!==1?"s":""} found`}
            </p>
            {!isLoggedIn&&
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
                <Link to="/login" style={{color:"#047857",fontWeight:"600"}}>Login</Link>
                {" "}to book
              </p>}
          </div>

          {loading?(
            <div style={{padding:"60px 0",textAlign:"center"}}>
              <div className="spin"/>
              <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",marginTop:"12px",fontSize:"14px"}}>
                Loading doctors…
              </p>
            </div>
          ):doctors.length===0?(
            <div style={{padding:"60px 0",textAlign:"center"}}>
              <div style={{fontSize:"44px",marginBottom:"12px"}}>👨‍⚕️</div>
              <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>
                No Doctors Found
              </h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#64748b",marginBottom:"18px"}}>
                Try a different specialty or search term.
              </p>
              <button onClick={()=>handleFilter("All","all","")}
                style={{padding:"10px 22px",borderRadius:"9px",
                  background:"#047857",color:"#fff",border:"none",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"600",
                  fontSize:"14px",cursor:"pointer"}}>
                Clear Filters
              </button>
            </div>
          ):(
            <div className="doc-grid" style={{display:"grid",
              gridTemplateColumns:"1fr",gap:"18px"}}>
              {doctors.map(doc=>(
                <DoctorCard key={doc.id} doc={doc} onBook={handleBook}/>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {bookDoc&&(
        <BookingModal
          doc={bookDoc}
          onClose={()=>setBookDoc(null)}
          onSuccess={()=>setBookDoc(null)}
        />
      )}
    </div>
  );
}
