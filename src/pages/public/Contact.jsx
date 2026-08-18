import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../../components/Toast";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { authAPI } from "../../services/api";
import SEO, { breadcrumbJsonLd } from "../../components/SEO";
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
.ct{font-family:'Inter',sans-serif;color:#1e293b;overflow-x:hidden;}.ct *{box-sizing:border-box;}.ct a{text-decoration:none;}
.ct h1,.ct h2,.ct h3,.ct h4{font-family:'Manrope',sans-serif;}
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease;}.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
.stagger.in>*:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.05s}.stagger.in>*:nth-child(2){opacity:1;transform:translateY(0);transition-delay:.12s}
.stagger.in>*:nth-child(3){opacity:1;transform:translateY(0);transition-delay:.19s}.stagger.in>*:nth-child(4){opacity:1;transform:translateY(0);transition-delay:.26s}
.ct-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:11px 14px;font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);transition:all .2s;outline:none;}
.ct-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(91,158,50,.09);}
.ct-inp.err{border-color:#ef4444;background:#fef2f2;}
.ct-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.faq-item{border:1.5px solid var(--wc-border);border-radius:12px;overflow:hidden;transition:border-color .2s;}.faq-item:hover{border-color:var(--wc-green);}
.info-card{transition:all .25s;}.info-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(18,59,74,.10)!important;}
.btn-p{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;font-family:'Inter',sans-serif;font-weight:600;font-size:15px;padding:13px 28px;border-radius:8px;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(91,158,50,.40);transition:all .25s;text-decoration:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.4);border-top:2px solid #fff;border-radius:50%;animation:spin .75s linear infinite;display:inline-block;}
@media(max-width:800px){.ct-grid{grid-template-columns:1fr!important;}.info-cols{grid-template-columns:1fr 1fr!important;}}
@media(max-width:500px){.info-cols{grid-template-columns:1fr!important;}}
`;
const W=({children,s={}})=><div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 24px",...s}}>{children}</div>;
function ContactForm(){
  const { t } = useTranslation();
  const SUBJECTS = t("contactPage.form.subjects", { returnObjects: true });
  const [form,setForm]=useState({full_name:"",email:"",mobile:"",subject:"",message:""});
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const validate=()=>{const e={};if(!form.full_name.trim())e.full_name=t("contactPage.form.errors.name");if(!/\S+@\S+\.\S+/.test(form.email))e.email=t("contactPage.form.errors.email");if(!form.mobile.trim())e.mobile=t("contactPage.form.errors.mobile");if(!form.subject)e.subject=t("contactPage.form.errors.subject");if(form.message.trim().length<10)e.message=t("contactPage.form.errors.message");return e;};
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
  showToast(t("contactPage.form.errors.sendFailed"), "error");
}finally{setLoading(false);}};
  if(done)return(
    <div style={{padding:"52px 32px",textAlign:"center"}}>
      <div style={{width:"68px",height:"68px",background:"#dcfce7",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",fontSize:"30px"}}>✅</div>
      <h3 style={{fontSize:"24px",fontWeight:"700",color:"var(--wc-navy)",marginBottom:"8px"}}>{t("contactPage.form.successTitle")}</h3>
      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",color:"var(--wc-muted)",marginBottom:"22px"}}>{t("contactPage.form.successSub")}</p>
      <button onClick={()=>{setDone(false);setForm({full_name:"",email:"",mobile:"",subject:"",message:""});}} style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",fontWeight:"600",color:"var(--wc-green)",background:"transparent",border:"1.5px solid var(--wc-green)",padding:"10px 22px",borderRadius:"8px",cursor:"pointer"}}>{t("contactPage.form.sendAnother")}</button>
    </div>
  );
  return(
    <form onSubmit={handleSubmit} noValidate style={{padding:"28px 28px 32px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
        {[["full_name",t("contactPage.form.fullName"),t("contactPage.form.fullNamePh"),"text"],["email",t("contactPage.form.email"),t("contactPage.form.emailPh"),"email"],["mobile",t("contactPage.form.mobile"),t("contactPage.form.mobilePh"),"tel"]].map(([name,lbl,ph,type])=>(
          <div key={name} style={{gridColumn:name==="full_name"?"span 2":"span 1"}}>
            <label className="ct-lbl" htmlFor={`public-contact-${name}`}>{lbl}</label>
            <input id={`public-contact-${name}`} name={name} type={type} value={form[name]} onChange={handleChange} placeholder={ph} className={`ct-inp${errors[name]?" err":""}`}/>
            {errors[name]&&<p style={{color:"#ef4444",fontSize:"11px",marginTop:"3px",fontFamily:"'Inter',sans-serif"}}>⚠ {errors[name]}</p>}
          </div>
        ))}
        <div style={{gridColumn:"span 2"}}>
          <label className="ct-lbl" htmlFor="public-contact-subject">{t("contactPage.form.subject")}</label>
          <select id="public-contact-subject" name="subject" value={form.subject} onChange={handleChange} className={`ct-inp${errors.subject?" err":""}`}>
            <option value="">{t("contactPage.form.subjectPlaceholder")}</option>
            {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          {errors.subject&&<p style={{color:"#ef4444",fontSize:"11px",marginTop:"3px",fontFamily:"'Inter',sans-serif"}}>⚠ {errors.subject}</p>}
        </div>
        <div style={{gridColumn:"span 2"}}>
          <label className="ct-lbl" htmlFor="public-contact-message">{t("contactPage.form.message")}</label>
          <textarea id="public-contact-message" name="message" value={form.message} onChange={handleChange} rows={4} placeholder={t("contactPage.form.messagePh")} className={`ct-inp${errors.message?" err":""}`} style={{resize:"vertical",minHeight:"100px"}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"3px"}}>
            {errors.message?<p style={{color:"#ef4444",fontSize:"11px",fontFamily:"'Inter',sans-serif"}}>⚠ {errors.message}</p>:<span/>}
            <p style={{color:"#6b7688",fontSize:"11px",fontFamily:"'Inter',sans-serif"}}>{t("contactPage.form.charCount",{count:form.message.length})}</p>
          </div>
        </div>
      </div>
      <button type="submit" disabled={loading} style={{width:"100%",background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"15px",padding:"14px",borderRadius:"10px",border:"none",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",boxShadow:"0 4px 16px rgba(91,158,50,.35)"}}>
        {loading?<><span className="spinner"/>{t("contactPage.form.sending")}</>:t("contactPage.form.send")}
      </button>
    </form>
  );
}
// Static — hoisted out of the component so it's never recreated on
// re-render. An inline object literal here would be a brand-new object
// every render, which made SEO's meta-tag effect re-fire constantly
// (see SEO.jsx for the full story — this was actually causing the page
// to silently scroll back to top on every re-render before that fix).
const CONTACT_JSONLD_BASE = {
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
  // TODO: these coordinates are only an approximate T.Nagar-area
  // centroid, NOT your exact office location — I checked, and there's
  // no publicly indexed geocode precise enough for "Kanchi Colony,
  // South Boag Road" specifically, only neighborhood-level results.
  // To get your exact pin (takes under a minute):
  //   1. Open https://maps.google.com and search your office address
  //   2. Right-click the exact spot on the map where your office is
  //   3. Click the lat/lng shown at the top of the menu that appears
  //      (it copies to your clipboard) — paste those two numbers below
  // This matters directly for "near me" / local-pack search accuracy —
  // an approximate pin can put you a few streets off in Google's eyes.
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 13.0335099,
    "longitude": 80.2411259,
  },
};

// Combined at module level (not per-render) — same stability reasoning
// as CONTACT_JSONLD_BASE above.
const CONTACT_JSONLD = [
  breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]),
  CONTACT_JSONLD_BASE,
];

export default function Contact(){
  const { t } = useTranslation();
  useEffect(()=>{window.scrollTo(0,0);},[]);
  const { role } = useAuth();
  const PATIENT_FAQS = t("contactPage.patientFaqs", { returnObjects: true });
  const HOSPITAL_FAQS = t("contactPage.hospitalFaqs", { returnObjects: true });
  const FAQS = isHospitalPortal(role) ? HOSPITAL_FAQS : PATIENT_FAQS;
  const [r1,v1]=useScrollAnimation();
  const [r2,v2]=useScrollAnimation();
  const [open,setOpen]=useState(null);
  const CARDS=[
    {ic:"📞",t:t("contactPage.cards.callTitle"),lines:[t("contactPage.cards.callLine1"),t("contactPage.cards.callLine2")],href:"tel:+919025786467",c:"var(--wc-green)"},
    {ic:"✉️",t:t("contactPage.cards.emailTitle"),lines:[t("contactPage.cards.emailLine1"),t("contactPage.cards.emailLine2")],href:"mailto:wecare4allchennai@gmail.com",c:"var(--wc-teal)"},
    {ic:"📍",t:t("contactPage.cards.officeTitle"),lines:[t("contactPage.cards.officeLine1"),t("contactPage.cards.officeLine2")],href:"https://maps.google.com/?q=Block+K+No.31+Kanchi+Colony+South+Boag+Road+T.Nagar+Chennai+600017",c:"#7c3aed"},
    {ic:"🕐",t:t("contactPage.cards.hoursTitle"),lines:[t("contactPage.cards.hoursLine1"),t("contactPage.cards.hoursLine2")],href:null,c:"#b45309"},
  ];
  return(
    <div className="ct">
      <style>{G}</style>
      <SEO title="Contact Us — We Care 4 'all', Healthcare Consultancy in T.Nagar Chennai" path="/contact"
        description="Get in touch with We Care 4 'all' — affordable, personalized care in Chennai. Call, email, or visit our healthcare consultancy office in T.Nagar, Chennai for tele consultation, online consultation, or hospital consultancy enquiries."
        keywords="we care 4 all, affordable care in chennai, healthcare consultancy in chennai, hospital consultancy, tele consultation, online consultation, contact chennai healthcare"
        jsonLd={CONTACT_JSONLD} />
      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,var(--wc-navy-deepest),var(--wc-navy) 60%,var(--wc-navy-deep))",paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <W s={{padding:"52px 24px 80px"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"20px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'Inter',sans-serif"}}>{t("contactPage.breadcrumbHome")}</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"var(--wc-green-pale)",fontSize:"13px",fontFamily:"'Inter',sans-serif"}}>{t("contactPage.breadcrumbContact")}</span>
          </div>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",fontWeight:"700",color:"var(--wc-green-pale)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"14px"}}>{t("contactPage.eyebrow")}</p>
          <h1 style={{fontFamily:"'Manrope',sans-serif",fontSize:"clamp(34px,5vw,58px)",fontWeight:"700",color:"#fff",lineHeight:"1.1",marginBottom:"14px"}}>{t("contactPage.heroTitle")}</h1>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"17px",color:"rgba(255,255,255,.68)",lineHeight:"1.78",maxWidth:"480px",fontWeight:"300"}}>{t("contactPage.heroSubtitle")}</p>
        </W>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{display:"block",width:"100%",marginBottom:"-2px"}}><path d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z" fill="#f0f6fc"/></svg>
      </section>
      {/* Info cards */}
      <section style={{background:"#f0f6fc",padding:"48px 0 0"}}>
        <W>
          <div ref={r1} className={`info-cols stagger${v1?" in":""}`} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px"}}>
            {CARDS.map(({ic,t,lines,href,c})=>{
              const inner=<div className="info-card" style={{background:"#fff",border:"1px solid var(--wc-border)",borderRadius:"14px",padding:"22px 18px",textAlign:"center",boxShadow:"0 2px 10px rgba(18,59,74,.05)",cursor:href?"pointer":"default"}}>
                <div style={{width:"50px",height:"50px",background:`${c}14`,border:`1.5px solid ${c}30`,borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",margin:"0 auto 12px"}}>{ic}</div>
                <p style={{fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"14px",color:"var(--wc-navy)",marginBottom:"7px"}}>{t}</p>
                {lines.map((l,i)=><p key={i} style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",color:i===0?c:"#6b7688",margin:"2px 0",fontWeight:i===0?"600":"400"}}>{l}</p>)}
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
              <a href="https://maps.google.com/?q=Block+K+No.31+Kanchi+Colony+South+Boag+Road+T.Nagar+Chennai+600017+600017" target="_blank" rel="noreferrer" style={{background:"var(--wc-border)",borderRadius:"14px",overflow:"hidden",height:"200px",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #d1dce8",textDecoration:"none"}}>
                <div style={{textAlign:"center",color:"var(--wc-navy)"}}>
                  <div style={{fontSize:"36px",marginBottom:"8px"}}>🗺️</div>
                  <p style={{fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"14px",color:"var(--wc-navy)"}}>{t("contactPage.mapCta")}</p>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"var(--wc-muted)",textAlign:"center"}}>{t("contactPage.mapAddress")}<br/>{t("contactPage.mapAddress2")}</p>
                </div>
              </a>
              <div style={{background:"linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))",borderRadius:"13px",padding:"20px",display:"flex",alignItems:"center",gap:"13px"}}>
                <div style={{width:"44px",height:"44px",background:"#fff",borderRadius:"9px",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                  <img loading="lazy" src="/assets/img/logo/euro_logo.jpeg" alt="Euro Cert" style={{width:"40px",height:"40px",objectFit:"contain"}} onError={e=>{e.target.parentElement.innerHTML=`<span style="font-size:8px;font-weight:800;color:var(--wc-navy);text-align:center;line-height:1.2">EURO<br/>CERT</span>`;}}/>
                </div>
                <div>
                  <p style={{fontFamily:"'Inter',sans-serif",color:"#fff",fontWeight:"700",fontSize:"14px",margin:0}}>{t("contactPage.euroCert")}</p>
                  <p style={{fontFamily:"'Inter',sans-serif",color:"var(--wc-green-pale)",fontSize:"12px",margin:"3px 0 0"}}>{t("contactPage.euroCertSub")}</p>
                </div>
              </div>
            </div>
            <div style={{background:"#fff",border:"1px solid var(--wc-border)",borderRadius:"16px",boxShadow:"0 4px 20px rgba(18,59,74,.07)",overflow:"hidden"}}>
              <div style={{background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",padding:"20px 28px"}}>
                <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>{t("contactPage.formHeading")}</h2>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"rgba(255,255,255,.78)"}}>{t("contactPage.formSub")}</p>
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
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",fontWeight:"700",color:"var(--wc-green)",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>{t("contactPage.faqEyebrow")}</p>
            <h2 style={{fontSize:"clamp(24px,3.5vw,38px)",fontWeight:"700",color:"var(--wc-navy)",margin:0}}>{t("contactPage.faqHeading")}</h2>
          </div>
          <div ref={r2} className={`reveal${v2?" in":""}`} style={{display:"flex",flexDirection:"column",gap:"9px"}}>
            {FAQS.map(({q,a},i)=>(
              <div key={q} className="faq-item">
                <button onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",textAlign:"left",padding:"16px 18px",background:open===i?"var(--wc-sage)":"#fff",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"11px"}}>
                  <span style={{fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"14px",color:"var(--wc-navy)"}}>{q}</span>
                  <span style={{color:"var(--wc-green)",fontSize:"18px",flexShrink:0,transition:"transform .2s",display:"block",transform:open===i?"rotate(45deg)":"none"}}>+</span>
                </button>
                {open===i&&<div style={{padding:"0 18px 16px",background:"var(--wc-sage)",borderTop:"1px solid #dcfce7"}}>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"#475569",lineHeight:"1.75",margin:0,fontWeight:"300"}}>{a}</p>
                </div>}
              </div>
            ))}
          </div>
        </W>
      </section>
      {/* CTA strip */}
      <section style={{background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",padding:"52px 24px"}}>
        <div style={{maxWidth:"700px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"22px"}}>
          <div>
            <h3 style={{fontSize:"26px",fontWeight:"700",color:"#fff",margin:"0 0 5px"}}>{t("contactPage.ctaTitle")}</h3>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"rgba(255,255,255,.78)"}}>{t("contactPage.ctaSub")}</p>
          </div>
          <a href="tel:+919025786467" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"#fff",color:"var(--wc-green)",fontFamily:"'Inter',sans-serif",fontWeight:"800",fontSize:"15px",padding:"13px 26px",borderRadius:"8px",textDecoration:"none",boxShadow:"0 4px 16px rgba(0,0,0,.18)",whiteSpace:"nowrap"}}>
            {t("contactPage.ctaCall")}
          </a>
        </div>
      </section>
    </div>
  );
}
