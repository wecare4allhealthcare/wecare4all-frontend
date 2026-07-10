/**
 * HomeHealthcare.jsx — Public service catalog + booking form
 * Shows all available home services with prices, book without login
 * redirects to login then back here
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.hh{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;background:#f0f6fc;}
.hh *{box-sizing:border-box;} .hh a{text-decoration:none;}
.hh h1,.hh h2,.hh h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.svc-card{background:#fff;border:1.5px solid #e2eaf4;border-radius:16px;
  padding:20px;cursor:pointer;transition:all .25s;
  box-shadow:0 2px 10px rgba(11,31,58,.06);}
.svc-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(11,31,58,.13);
  border-color:#86efac;}
.svc-card.selected{border-color:#047857;background:#f0fdf4;
  box-shadow:0 0 0 3px rgba(4,120,87,.12);}
.book-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;
  padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;
  color:#1e293b;background:#f8fafc;outline:none;transition:all .2s;
  -webkit-appearance:none;}
.book-inp:focus{border-color:#047857;background:#fff;
  box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.book-lbl{display:block;font-size:12px;font-weight:600;
  color:#374151;margin-bottom:5px;}
.book-btn{width:100%;background:linear-gradient(135deg,#047857,#059669);
  color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;
  padding:14px;border-radius:10px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(4,120,87,.38);transition:all .25s;}
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
  const unit = {
    per_visit:"/ visit", per_hour:"/ hour", per_shift:"/ shift"
  }[svc.price_unit] || "";
  return (
    <div className={`svc-card${selected?" selected":""}`} onClick={()=>onSelect(svc)}>
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"flex-start",marginBottom:"10px"}}>
        <span style={{fontSize:"28px"}}>{getIcon(svc.name)}</span>
        {selected && (
          <span style={{background:"#047857",color:"#fff",fontSize:"11px",
            fontWeight:"700",padding:"3px 10px",borderRadius:"50px",
            fontFamily:"'DM Sans',sans-serif"}}>✓ Selected</span>
        )}
      </div>
      <h3 style={{fontSize:"15px",fontWeight:"700",color:"#0b1f3a",
        margin:"0 0 6px",lineHeight:"1.3"}}>{svc.name}</h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
        color:"#64748b",margin:"0 0 12px",lineHeight:"1.6"}}>
        {svc.description}
      </p>
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"center",paddingTop:"10px",borderTop:"1px solid #f1f5f9"}}>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
          fontWeight:"700",color:"#047857"}}>
          ₹{parseFloat(svc.base_price).toLocaleString("en-IN")}
        </span>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
          color:"#94a3b8"}}>{unit}</span>
      </div>
      {(svc.weekend_multiplier > 1 || svc.night_extra > 0) && (
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
          color:"#d97706",marginTop:"6px",marginBottom:0}}>
          {svc.weekend_multiplier > 1 && `+${((svc.weekend_multiplier-1)*100).toFixed(0)}% weekends`}
          {svc.night_extra > 0 && ` · +₹${svc.night_extra} nights`}
        </p>
      )}
    </div>
  );
}

function BookingModal({ svc, onClose, onBooked }) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_name:   user?.name  || "",
    patient_mobile: user?.mobile|| "",
    patient_email:  user?.email || "",
    booking_date:   "",
    time_slot:      TIME_SLOTS[0],
    duration_hours: "",
    visit_address:  "",
    visit_city:     "Chennai",
    notes:          "",
  });
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

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
    if (!form.booking_date) { setErr("Please select a date"); return; }
    if (!form.visit_address.trim()) { setErr("Please enter your address"); return; }
    if (!form.patient_name.trim()) { setErr("Name required"); return; }
    if (!form.patient_mobile.trim()) { setErr("Mobile required"); return; }

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
          duration_hours: form.duration_hours
            ? parseInt(form.duration_hours) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail||"Booking failed");
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
        <div style={{background:"linear-gradient(135deg,#047857,#059669)",
          padding:"16px 20px",display:"flex",justifyContent:"space-between",
          alignItems:"center",position:"sticky",top:0,zIndex:1}}>
          <div>
            <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>
              Book Home Visit
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"rgba(255,255,255,.78)",
              fontSize:"12px",margin:0}}>{svc.name}</p>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",
            border:"none",color:"#fff",width:"34px",height:"34px",
            borderRadius:"8px",cursor:"pointer",fontSize:"20px",
            display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{padding:"18px 20px"}}>
          {/* Price summary */}
          <div style={{background:"#f0fdf4",border:"1px solid #86efac",
            borderRadius:"10px",padding:"12px 14px",marginBottom:"16px",
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
              color:"#374151",fontWeight:"600"}}>Base Price</span>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
              fontWeight:"700",color:"#047857"}}>
              ₹{parseFloat(svc.base_price).toLocaleString("en-IN")}
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#94a3b8",fontWeight:"400"}}> /{
                {per_visit:"visit",per_hour:"hr",per_shift:"shift"}[svc.price_unit]||""
              }</span>
            </span>
          </div>

          <div className="form-grid">
            {/* Personal details */}
            <div className="form-full">
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                fontWeight:"700",color:"#047857",letterSpacing:"1.5px",
                textTransform:"uppercase",borderBottom:"1px solid #e2eaf4",
                paddingBottom:"6px",marginBottom:"12px"}}>
                Contact Details
              </p>
            </div>
            <div>
              <label className="book-lbl">Full Name *</label>
              <input value={form.patient_name}
                onChange={e=>set("patient_name",e.target.value)}
                className="book-inp" placeholder="Patient name"/>
            </div>
            <div>
              <label className="book-lbl">Mobile *</label>
              <input type="tel" value={form.patient_mobile}
                onChange={e=>set("patient_mobile",e.target.value)}
                className="book-inp" placeholder="90XXXXXXXX"/>
            </div>
            <div className="form-full">
              <label className="book-lbl">Email</label>
              <input type="email" value={form.patient_email}
                onChange={e=>set("patient_email",e.target.value)}
                className="book-inp" placeholder="For confirmation email"/>
            </div>

            {/* Visit details */}
            <div className="form-full">
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                fontWeight:"700",color:"#047857",letterSpacing:"1.5px",
                textTransform:"uppercase",borderBottom:"1px solid #e2eaf4",
                paddingBottom:"6px",marginBottom:"12px",marginTop:"4px"}}>
                Visit Details
              </p>
            </div>
            <div>
              <label className="book-lbl">Date *</label>
              <input type="date" min={minStr} value={form.booking_date}
                onChange={e=>set("booking_date",e.target.value)}
                className="book-inp"/>
            </div>
            <div>
              <label className="book-lbl">Time Slot</label>
              <select value={form.time_slot}
                onChange={e=>set("time_slot",e.target.value)}
                className="book-inp">
                {TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {isHourly && (
              <div>
                <label className="book-lbl">Duration (hours)</label>
                <input type="number" onWheel={e=>e.currentTarget.blur()} value={form.duration_hours}
                  onChange={e=>set("duration_hours",e.target.value)}
                  className="book-inp" placeholder="e.g. 4" min="1" max="24"/>
              </div>
            )}
            <div className="form-full">
              <label className="book-lbl">Visit Address *</label>
              <textarea value={form.visit_address}
                onChange={e=>set("visit_address",e.target.value)}
                className="book-inp" rows={2} style={{resize:"vertical"}}
                placeholder="Door No., Street, Area, Landmark"/>
            </div>
            <div>
              <label className="book-lbl">City</label>
              <input value={form.visit_city}
                onChange={e=>set("visit_city",e.target.value)}
                className="book-inp" placeholder="Chennai"/>
            </div>
            <div>
              <label className="book-lbl">Special Notes</label>
              <input value={form.notes}
                onChange={e=>set("notes",e.target.value)}
                className="book-inp" placeholder="Medical conditions, access info…"/>
            </div>
          </div>

          {err && (
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",
              fontSize:"13px",margin:"10px 0 0"}}>⚠ {err}</p>
          )}

          {!isLoggedIn && (
            <div style={{background:"#fffbeb",border:"1px solid #fcd34d",
              borderRadius:"9px",padding:"11px 14px",marginTop:"12px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                color:"#92400e",margin:0}}>
                ⚠️ You need to{" "}
                <button onClick={()=>navigate("/login?redirect=/home-healthcare")}
                  style={{color:"#047857",fontWeight:"700",background:"none",
                    border:"none",cursor:"pointer",padding:0,fontSize:"inherit"}}>
                  login
                </button>
                {" "}to book a home visit.
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
                Booking…
              </span>
            ) : isLoggedIn ? "Confirm Booking →" : "Login to Book →"}
          </button>

          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
            color:"#94a3b8",textAlign:"center",marginTop:"8px"}}>
            Our team confirms within 2 hours · Cancel anytime before visit
          </p>
        </form>
      </div>
    </div>
  );
}

function SuccessModal({ result, onClose }) {
  return (
    <div className="modal-bg">
      <div className="modal-box" style={{padding:"36px 28px",textAlign:"center",
        borderRadius:"20px"}}>
        <div style={{fontSize:"52px",marginBottom:"16px"}}>✅</div>
        <h2 style={{fontSize:"24px",fontWeight:"700",color:"#0b1f3a",
          marginBottom:"10px"}}>
          Home Visit Booked!
        </h2>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
          color:"#64748b",marginBottom:"20px",lineHeight:"1.7"}}>
          <strong>{result.service}</strong> has been booked successfully.<br/>
          Our team will call you to confirm within 2 hours.
        </p>
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",
          borderRadius:"12px",padding:"16px",marginBottom:"22px",
          textAlign:"left"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            fontWeight:"700",color:"#15803d",marginBottom:"8px"}}>
            Booking Details
          </p>
          {[["Service",result.service],
            ["Estimated Price",`₹${result.price?.toLocaleString("en-IN")}`],
            ["Booking ID",result.booking_id?.slice(-8).toUpperCase()],
          ].map(([l,v])=>(
            <div key={l} style={{display:"flex",gap:"12px",marginBottom:"5px"}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#64748b",minWidth:"100px"}}>{l}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                fontWeight:"600",color:"#0b1f3a"}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"10px",justifyContent:"center",
          flexWrap:"wrap"}}>
          <Link to="/patient/dashboard"
            style={{padding:"12px 22px",borderRadius:"9px",
              background:"linear-gradient(135deg,#047857,#059669)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"600",fontSize:"14px"}}>
            Go to Dashboard →
          </Link>
          <button onClick={onClose}
            style={{padding:"12px 22px",borderRadius:"9px",
              background:"#f8fafc",border:"1px solid #e2eaf4",
              color:"#64748b",fontFamily:"'DM Sans',sans-serif",
              fontWeight:"600",fontSize:"14px",cursor:"pointer"}}>
            Book Another
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomeHealthcarePage() {
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [result,    setResult]    = useState(null);

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
    setSelected(svc);
    setShowModal(true);
  };

  return (
    <div className="hh">
      <style>{G}</style>
      <SEO title="Home Healthcare" path="/home-healthcare"
        description="Book professional home healthcare visits — nursing care, physiotherapy, sample collection, and more — through We Care 4 'all'." />

      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",
        paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,
          backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <div style={{maxWidth:"1100px",margin:"0 auto",padding:"32px 20px 64px"}}>
          {/* Breadcrumb */}
          <div style={{display:"flex",gap:"6px",alignItems:"center",
            marginBottom:"16px",flexWrap:"wrap"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"12px",
              fontFamily:"'DM Sans',sans-serif"}}>Home</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"#6ee7b7",fontSize:"12px",
              fontFamily:"'DM Sans',sans-serif"}}>Home Healthcare</span>
          </div>

          <h1 style={{fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(28px,5vw,52px)",fontWeight:"700",
            color:"#fff",lineHeight:"1.1",marginBottom:"12px"}}>
            Healthcare at Your{" "}
            <span style={{color:"#34d399"}}>Doorstep.</span>
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",
            fontSize:"clamp(14px,2vw,16px)",
            color:"rgba(255,255,255,.65)",maxWidth:"480px",
            fontWeight:"300",marginBottom:"24px",lineHeight:"1.75"}}>
            Nurses, physiotherapists, lab technicians and caregivers —
            professional care at home, on your schedule.
          </p>

          {/* Trust badges */}
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {["✅ Verified Professionals","📞 24×7 Support",
              "🏠 Pan-Chennai Coverage","⚡ 2-Hour Confirmation",
            ].map(t=>(
              <span key={t} style={{background:"rgba(255,255,255,.10)",
                border:"1px solid rgba(255,255,255,.18)",
                color:"rgba(255,255,255,.82)",fontFamily:"'DM Sans',sans-serif",
                fontSize:"12px",fontWeight:"500",
                padding:"6px 12px",borderRadius:"50px"}}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 1440 50" xmlns="http://www.w3.org/2000/svg"
          style={{display:"block",width:"100%",marginBottom:"-2px"}}>
          <path d="M0,34 C360,65 1080,8 1440,34 L1440,50 L0,50 Z" fill="#f0f6fc"/>
        </svg>
      </section>

      {/* Services */}
      <section style={{padding:"36px 0 60px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 16px"}}>
          <div style={{textAlign:"center",marginBottom:"28px"}}>
            <h2 style={{fontSize:"clamp(24px,4vw,38px)",fontWeight:"700",
              color:"#0b1f3a",marginBottom:"8px"}}>
              Available Services
            </h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",
              color:"#64748b",maxWidth:"420px",margin:"0 auto"}}>
              Click any service to book a home visit
            </p>
          </div>

          {loading ? (
            <div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{width:"36px",height:"36px",border:"3px solid #e2eaf4",
                borderTop:"3px solid #047857",borderRadius:"50%",
                animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
              <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",
                fontSize:"14px"}}>Loading services…</p>
            </div>
          ) : services.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontSize:"44px",marginBottom:"14px"}}>🏠</div>
              <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",
                marginBottom:"8px"}}>Services Coming Soon</h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                color:"#64748b"}}>
                Call <strong>90257 86467</strong> to book a home visit now.
              </p>
            </div>
          ) : (
            <div className="svc-grid">
              {services.map(svc=>(
                <ServiceCard
                  key={svc.id}
                  svc={svc}
                  selected={selected?.id===svc.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}

          {/* How it works */}
          <div style={{marginTop:"48px",background:"#fff",
            border:"1px solid #e2eaf4",borderRadius:"16px",padding:"28px 24px"}}>
            <h3 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",
              textAlign:"center",marginBottom:"24px"}}>
              How It Works
            </h3>
            <div style={{display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
              gap:"20px"}}>
              {[
                ["1️⃣","Choose Service","Pick the service you need from above"],
                ["2️⃣","Book Online","Fill your address and preferred time"],
                ["3️⃣","Confirmation","We call to confirm within 2 hours"],
                ["4️⃣","Home Visit","Professional arrives at your doorstep"],
              ].map(([n,t,d])=>(
                <div key={t} style={{textAlign:"center"}}>
                  <div style={{fontSize:"30px",marginBottom:"8px"}}>{n}</div>
                  <h4 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                    fontWeight:"700",color:"#0b1f3a",marginBottom:"4px"}}>{t}</h4>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                    color:"#64748b",margin:0}}>{d}</p>
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
    </div>
  );
}
