import { useEffect, useState } from "react";
import { showToast } from "../../components/Toast";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { authAPI } from "../../services/api";
import SEO from "../../components/SEO";
import { useAuth } from "../../context/AuthContext";
// Same hospital-portal detection used in Footer.jsx / Home.jsx — a real
// hospital-role login, or a patient-role account that came through the
// hospital signup intent.
function isHospitalPortal(role) {
  if (role === "hospital") return true;
  if (role === "patient" && typeof window !== "undefined" &&
      localStorage.getItem("wc4a_login_portal") === "hospital") return true;
  return false;
}
const G=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.ct{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}.ct *{box-sizing:border-box;}.ct a{text-decoration:none;}
.ct h1,.ct h2,.ct h3,.ct h4{font-family:'Cormorant Garamond',Georgia,serif;}
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease;}.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
.stagger.in>*:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.05s}.stagger.in>*:nth-child(2){opacity:1;transform:translateY(0);transition-delay:.12s}
.stagger.in>*:nth-child(3){opacity:1;transform:translateY(0);transition-delay:.19s}.stagger.in>*:nth-child(4){opacity:1;transform:translateY(0);transition-delay:.26s}
.ct-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;transition:all .2s;outline:none;}
.ct-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.ct-inp.err{border-color:#ef4444;background:#fef2f2;}
.ct-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.faq-item{border:1.5px solid #e2eaf4;border-radius:12px;overflow:hidden;transition:border-color .2s;}.faq-item:hover{border-color:#047857;}
.info-card{transition:all .25s;}.info-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(11,31,58,.10)!important;}
.btn-p{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#047857,#059669);color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;padding:13px 28px;border-radius:8px;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(4,120,87,.40);transition:all .25s;text-decoration:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.4);border-top:2px solid #fff;border-radius:50%;animation:spin .75s linear infinite;display:inline-block;}
@media(max-width:800px){.ct-grid{grid-template-columns:1fr!important;}.info-cols{grid-template-columns:1fr 1fr!important;}}
@media(max-width:500px){.info-cols{grid-template-columns:1fr!important;}}
`;
const W=({children,s={}})=><div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 24px",...s}}>{children}</div>;
const SUBJECTS=["General Enquiry","Book an Appointment","Hospital Partnership","Home Healthcare","Video Consultation","International Patient","Feedback","Other"];
// Patient / healthcare-consultancy visitors
const PATIENT_FAQS=[
  {q:"How do I book an appointment?",a:"Login with OTP, browse doctors, select your specialist, choose date and time, and pay securely. Confirmation is sent instantly."},
  {q:"Are video consultations secure?",a:"Yes. All sessions are encrypted. Your conversation and medical details are never stored or shared without your explicit consent."},
  {q:"What areas do you cover for home healthcare?",a:"We currently cover Chennai and major Tamil Nadu cities. Contact us to check availability in your area."},
  {q:"Is international patient support available?",a:"Yes. We assist patients from UAE, UK, USA, Singapore and more with specialist access, documentation and travel coordination."},
];
// Hospital / nursing home visitors — hospital consultancy questions only
const HOSPITAL_FAQS=[
  {q:"How can my hospital apply for empanelment?",a:"Navigate to 'Partner With Us', fill the empanelment form and our team will respond within 3 business days."},
  {q:"What partnership tiers are available?",a:"We offer Basic Association, Growth Partner and Strategic Partner tiers, each with different levels of visibility, referrals and campaign support."},
  {q:"What does We Care 4 'all' handle for hospital partners?",a:"Marketing and branding, accreditation support, insurance empanelments, back-office coordination, staffing solutions and digital visibility."},
  {q:"How is referral and enquiry performance reported?",a:"Partner hospitals receive monthly reports covering referral counts, page views and enquiries generated through the platform."},
];
function ContactForm(){
  const [form,setForm]=useState({full_name:"",email:"",mobile:"",subject:"",message:""});
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const validate=()=>{const e={};if(!form.full_name.trim())e.full_name="Name required";if(!/\S+@\S+\.\S+/.test(form.email))e.email="Valid email required";if(!form.mobile.trim())e.mobile="Mobile required";if(!form.subject)e.subject="Select a subject";if(form.message.trim().length<10)e.message="Minimum 10 characters";return e;};
  const handleChange=e=>{const{name,value}=e.target;setForm(p=>({...p,[name]:value}));if(errors[name])setErrors(p=>({...p,[name]:""}));};
  const handleSubmit=async e=>{e.preventDefault();const errs=validate();if(Object.keys(errs).length){setErrors(errs);return;}setLoading(true);try {
  const res = await fetch(
    (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1")
    + "/auth/contact",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.full_name,
        email:     form.email,
        mobile:    form.mobile,
        subject:   form.subject,
        message:   form.message,
      }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || "Failed to send");
  setDone(true);
} catch (err) {
  showToast("Failed to send message. Please call 90257 86467", "error");
}finally{setLoading(false);}};
  if(done)return(
    <div style={{padding:"52px 32px",textAlign:"center"}}>
      <div style={{width:"68px",height:"68px",background:"#dcfce7",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:"30px"}}>✅</div>
      <h3 style={{fontSize:"24px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>Message Sent!</h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#64748b",marginBottom:"22px"}}>Our team will get back to you within 24 hours.</p>
      <button onClick={()=>{setDone(false);setForm({full_name:"",email:"",mobile:"",subject:"",message:""});}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:"600",color:"#047857",background:"transparent",border:"1.5px solid #047857",padding:"10px 22px",borderRadius:"8px",cursor:"pointer"}}>Send Another</button>
    </div>
  );
  return(
    <form onSubmit={handleSubmit} noValidate style={{padding:"28px 28px 32px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
        {[["full_name","Full Name *","Your full name","text"],["email","Email Address *","your@email.com","email"],["mobile","Mobile Number *","+91 90257 86467","tel"]].map(([name,lbl,ph,type])=>(
          <div key={name} style={{gridColumn:name==="full_name"?"span 2":"span 1"}}>
            <label className="ct-lbl">{lbl}</label>
            <input name={name} type={type} value={form[name]} onChange={handleChange} placeholder={ph} className={`ct-inp${errors[name]?" err":""}`}/>
            {errors[name]&&<p style={{color:"#ef4444",fontSize:"11px",marginTop:"3px",fontFamily:"'DM Sans',sans-serif"}}>⚠ {errors[name]}</p>}
          </div>
        ))}
        <div style={{gridColumn:"span 2"}}>
          <label className="ct-lbl">Subject *</label>
          <select name="subject" value={form.subject} onChange={handleChange} className={`ct-inp${errors.subject?" err":""}`}>
            <option value="">Select a subject</option>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          {errors.subject&&<p style={{color:"#ef4444",fontSize:"11px",marginTop:"3px",fontFamily:"'DM Sans',sans-serif"}}>⚠ {errors.subject}</p>}
        </div>
        <div style={{gridColumn:"span 2"}}>
          <label className="ct-lbl">Message *</label>
          <textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="Tell us how we can help you..." className={`ct-inp${errors.message?" err":""}`} style={{resize:"vertical",minHeight:"100px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"3px"}}>
            {errors.message?<p style={{color:"#ef4444",fontSize:"11px",fontFamily:"'DM Sans',sans-serif"}}>⚠ {errors.message}</p>:<span/>}
            <p style={{color:"#94a3b8",fontSize:"11px",fontFamily:"'DM Sans',sans-serif"}}>{form.message.length}/500</p>
          </div>
        </div>
      </div>
      <button type="submit" disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",padding:"14px",borderRadius:"10px",border:"none",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",boxShadow:"0 4px 16px rgba(4,120,87,.35)"}}>
        {loading?<><span className="spinner"/>Sending...</>:"Send Message ✉️"}
      </button>
    </form>
  );
}
// Static — hoisted out of the component so it's never recreated on
// re-render. An inline object literal here would be a brand-new object
// every render, which made SEO's meta-tag effect re-fire constantly
// (see SEO.jsx for the full story — this was actually causing the page
// to silently scroll back to top on every re-render before that fix).
const CONTACT_JSONLD = {
  "@type": "LocalBusiness",
  "name": "We Care 4 'all'",
  "telephone": "+91-90257-86467",
  "email": "wecare4allchennai@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Block K, No.31, Kanchi Colony, South Boag Road",
    "addressLocality": "T.Nagar, Chennai",
    "addressRegion": "Tamil Nadu",
    "postalCode": "600017",
    "addressCountry": "IN",
  },
  // TODO: replace with your exact GPS pin from Google Maps (right-click
  // the pin on your business listing → the lat/lng shown there) —
  // placeholder coordinates below are only an approximate T.Nagar
  // centroid, NOT your exact office location. Getting this precise
  // matters directly for "near me" / local-pack matching accuracy.
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 13.0418,
    "longitude": 80.2341,
  },
};

export default function Contact(){
  useEffect(()=>{window.scrollTo(0,0);},[]);
  const { role } = useAuth();
  const FAQS = isHospitalPortal(role) ? HOSPITAL_FAQS : PATIENT_FAQS;
  const [r1,v1]=useScrollAnimation();
  const [r2,v2]=useScrollAnimation();
  const [open,setOpen]=useState(null);
  const CARDS=[
    {ic:"📞",t:"Call Us",lines:["90257 86467","Mon–Sat: 9 AM – 6 PM"],href:"tel:+919025786467",c:"#047857"},
    {ic:"✉️",t:"Email Us",lines:["wecare4allchennai@gmail.com","We reply within 24 hrs"],href:"mailto:wecare4allchennai@gmail.com",c:"#0369a1"},
    {ic:"📍",t:"Our Office",lines:["Block K, No.31, Kanchi Colony","Block K, No.31, Kanchi Colony, South Boag Road, T.Nagar, Chennai 600017"],href:"https://maps.google.com/?q=Block+K+No.31+Kanchi+Colony+South+Boag+Road+T.Nagar+Chennai+600017",c:"#7c3aed"},
    {ic:"🕐",t:"Working Hours",lines:["Monday – Saturday","9:00 AM – 6:00 PM IST"],href:null,c:"#b45309"},
  ];
  return(
    <div className="ct">
      <style>{G}</style>
      <SEO title="Contact Us — We Care 4 'all', T.Nagar Chennai" path="/contact"
        description="Get in touch with We Care 4 'all' — call, email, or visit our office in T.Nagar, Chennai."
        keywords="We Care 4 all contact, healthcare consultancy Chennai contact, hospital near me Chennai, medical consultancy T Nagar Chennai, healthcare consultancy phone number, We Care 4 all address, healthcare consultancy near me, contact healthcare consultant Chennai, medical consultancy office Chennai, healthcare helpline Chennai, We Care 4 all email, book appointment contact Chennai, healthcare support Chennai, patient helpline India, healthcare consultancy location Chennai, get in touch healthcare Chennai, We Care 4 all office address, healthcare enquiry Chennai, medical consultancy contact details, T Nagar healthcare office"
        jsonLd={CONTACT_JSONLD} />
      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <W s={{padding:"52px 24px 80px"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"20px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Home</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"#6ee7b7",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Contact</span>
          </div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"14px"}}>Get in Touch</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,58px)",fontWeight:"700",color:"#fff",lineHeight:"1.1",marginBottom:"14px"}}>We're Here to Help</h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"17px",color:"rgba(255,255,255,.68)",lineHeight:"1.78",maxWidth:"480px",fontWeight:"300"}}>Questions, partnership enquiries, or guidance on your healthcare journey — reach out and we'll respond within 24 hours.</p>
        </W>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{display:"block",width:"100%",marginBottom:"-2px"}}><path d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z" fill="#f0f6fc"/></svg>
      </section>
      {/* Info cards */}
      <section style={{background:"#f0f6fc",padding:"48px 0 0"}}>
        <W>
          <div ref={r1} className={`info-cols stagger${v1?" in":""}`} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px"}}>
            {CARDS.map(({ic,t,lines,href,c})=>{
              const inner=<div className="info-card" style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"14px",padding:"22px 18px",textAlign:"center",boxShadow:"0 2px 10px rgba(11,31,58,.05)",cursor:href?"pointer":"default"}}>
                <div style={{width:"50px",height:"50px",background:`${c}14`,border:`1.5px solid ${c}30`,borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",margin:"0 auto 12px"}}>{ic}</div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",color:"#0b1f3a",marginBottom:"7px"}}>{t}</p>
                {lines.map((l,i)=><p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:i===0?c:"#94a3b8",margin:"2px 0",fontWeight:i===0?"600":"400"}}>{l}</p>)}
              </div>;
              return href?<a key={t} href={href} target={href.startsWith("http")?"_blank":undefined} rel="noreferrer" style={{textDecoration:"none"}}>{inner}</a>:<div key={t}>{inner}</div>;
            })}
          </div>
        </W>
      </section>
      {/* Form + map */}
      <section style={{background:"#f0f6fc",padding:"40px 0 72px"}}>
        <W>
          <div className="ct-grid" style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:"24px"}}>
            <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
              <a href="https://maps.google.com/?q=Block+K+No.31+Kanchi+Colony+South+Boag+Road+T.Nagar+Chennai+600017+600017" target="_blank" rel="noreferrer" style={{background:"#e2eaf4",borderRadius:"14px",overflow:"hidden",height:"200px",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #d1dce8",textDecoration:"none"}}>
                <div style={{textAlign:"center",color:"#0b1f3a"}}>
                  <div style={{fontSize:"36px",marginBottom:"8px"}}>🗺️</div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",color:"#0b1f3a"}}>Open in Google Maps</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",textAlign:"center"}}>Block K, No.31, Kanchi Colony,<br/>South Boag Road, T.Nagar, Chennai 600017</p>
                </div>
              </a>
              <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",borderRadius:"13px",padding:"20px",display:"flex",alignItems:"center",gap:"13px"}}>
                <div style={{width:"44px",height:"44px",background:"#fff",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                  <img src="/assets/img/logo/euro_logo.jpeg" alt="Euro Cert" style={{width:"40px",height:"40px",objectFit:"contain"}} onError={e=>{e.target.parentElement.innerHTML=`<span style="font-size:8px;font-weight:800;color:#0b1f3a;text-align:center;line-height:1.2">EURO<br/>CERT</span>`;}}/>
                </div>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",color:"#fff",fontWeight:"700",fontSize:"14px",margin:0}}>Euro Cert Certified</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",fontSize:"12px",margin:"3px 0 0"}}>✓ International Quality Standard</p>
                </div>
              </div>
            </div>
            <div style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"16px",boxShadow:"0 4px 20px rgba(11,31,58,.07)",overflow:"hidden"}}>
              <div style={{background:"linear-gradient(135deg,#047857,#059669)",padding:"20px 28px"}}>
                <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>Send Us a Message</h2>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"rgba(255,255,255,.78)"}}>We respond within 24 hours on business days</p>
              </div>
              <ContactForm/>
            </div>
          </div>
        </W>
      </section>
      {/* FAQ */}
      <section style={{background:"#fff",padding:"72px 0"}}>
        <W s={{maxWidth:"780px"}}>
          <div style={{textAlign:"center",marginBottom:"44px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#047857",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>Quick Answers</p>
            <h2 style={{fontSize:"clamp(24px,3.5vw,38px)",fontWeight:"700",color:"#0b1f3a",margin:0}}>Frequently Asked Questions</h2>
          </div>
          <div ref={r2} className={`reveal${v2?" in":""}`} style={{display:"flex",flexDirection:"column",gap:"9px"}}>
            {FAQS.map(({q,a},i)=>(
              <div key={q} className="faq-item">
                <button onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",textAlign:"left",padding:"16px 18px",background:open===i?"#f0fdf4":"#fff",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"11px"}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",color:"#0b1f3a"}}>{q}</span>
                  <span style={{color:"#047857",fontSize:"18px",flexShrink:0,transition:"transform .2s",display:"block",transform:open===i?"rotate(45deg)":"none"}}>+</span>
                </button>
                {open===i&&<div style={{padding:"0 18px 16px",background:"#f0fdf4",borderTop:"1px solid #dcfce7"}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#475569",lineHeight:"1.75",margin:0,fontWeight:"300"}}>{a}</p>
                </div>}
              </div>
            ))}
          </div>
        </W>
      </section>
      {/* CTA strip */}
      <section style={{background:"linear-gradient(135deg,#047857,#059669)",padding:"52px 24px"}}>
        <div style={{maxWidth:"700px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"22px"}}>
          <div>
            <h3 style={{fontSize:"26px",fontWeight:"700",color:"#fff",margin:"0 0 5px"}}>Need Immediate Help?</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"rgba(255,255,255,.78)"}}>Call us Monday – Saturday, 9 AM to 6 PM IST</p>
          </div>
          <a href="tel:+919025786467" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"#fff",color:"#047857",fontFamily:"'DM Sans',sans-serif",fontWeight:"800",fontSize:"15px",padding:"13px 26px",borderRadius:"8px",textDecoration:"none",boxShadow:"0 4px 16px rgba(0,0,0,.18)",whiteSpace:"nowrap"}}>
            📞 90257 86467
          </a>
        </div>
      </section>
    </div>
  );
}
