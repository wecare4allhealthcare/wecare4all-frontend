import { useRoleBooking, RoleModal } from "../../components/RoleModal";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

// Specialty icons started out as emoji-only. Renders a real <img> instead
// whenever the value looks like a URL (e.g. an icon pasted from
// Flaticon), while staying fully backward-compatible with every
// specialty that already uses an emoji.
function SpecialtyIcon({ icon, size = 20 }) {
  const val = typeof icon === "string" ? icon.trim() : "";
  const isUrl = /^(https?:\/\/|\/)/.test(val);
  const looksLikeHtml = val.startsWith("<");
  if (isUrl) {
    return <img src={icon} alt="" width={size} height={size} style={{objectFit:"contain",flexShrink:0}}/>;
  }
  return <span style={{fontSize:size,flexShrink:0}}>{looksLikeHtml ? "🏥" : (icon || "🏥")}</span>;
}
import SEO from "../../components/SEO";
import HospitalCarousel from "../../components/HospitalCarousel";
const G=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.hp{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}.hp *{box-sizing:border-box;}.hp a{text-decoration:none;}
.hp h1,.hp h2,.hp h3{font-family:'Cormorant Garamond',Georgia,serif;}
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease;}.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
.stagger.in>*{opacity:1;transform:translateY(0);}
.stagger.in>*:nth-child(1){transition-delay:.04s}.stagger.in>*:nth-child(2){transition-delay:.08s}
.stagger.in>*:nth-child(3){transition-delay:.12s}.stagger.in>*:nth-child(4){transition-delay:.16s}
.stagger.in>*:nth-child(5){transition-delay:.20s}.stagger.in>*:nth-child(6){transition-delay:.24s}
.stagger.in>*:nth-child(7){transition-delay:.28s}.stagger.in>*:nth-child(8){transition-delay:.32s}
.stagger.in>*:nth-child(9){transition-delay:.36s}.stagger.in>*:nth-child(10){transition-delay:.40s}
.stagger.in>*:nth-child(11){transition-delay:.44s}.stagger.in>*:nth-child(12){transition-delay:.48s}
.stagger.in>*:nth-child(13){transition-delay:.52s}.stagger.in>*:nth-child(14){transition-delay:.56s}
.stagger.in>*:nth-child(15){transition-delay:.60s}.stagger.in>*:nth-child(16){transition-delay:.64s}
.stagger.in>*:nth-child(17){transition-delay:.68s}.stagger.in>*:nth-child(18){transition-delay:.72s}
.spec-card{transition:all .25s;border:1px solid #e2eaf4;}.spec-card:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(11,31,58,.12)!important;border-color:#047857!important;}
.svc-card{transition:all .28s;}.svc-card:hover{transform:translateY(-5px);}
.btn-p{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#047857,#059669);color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;padding:13px 28px;border-radius:8px;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(4,120,87,.40);transition:all .25s;text-decoration:none;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(4,120,87,.50);}
@media(max-width:900px){
  .hp-grid{grid-template-columns:1fr!important;}
  .g3{grid-template-columns:1fr 1fr!important;}
  .g2-svc{grid-template-columns:1fr!important;}  /* services stack on tablet */
}
@media(max-width:600px){
  .g3{grid-template-columns:1fr!important;}
  .g2-svc{grid-template-columns:1fr!important;}
  .hp-pricing{grid-template-columns:1fr!important;}
}
`;
const W=({children,s={}})=><div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 24px",...s}}>{children}</div>;
const SPEC_ICONS=["❤️","🧠","🦴","🎗️","👁️","👂","🫁","🧬","🦷","💊","👶","🌸","🧘","🧪","🧩","🔬","🏥","🩺"];
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const SVC_META=[
  {ic:"🎥",c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd",link:"/doctors"},
  {ic:"🏠",c:"#047857",bg:"#f0fdf4",bd:"#86efac",link:"/home-healthcare"},
  {ic:"🌍",c:"#be123c",bg:"#fff1f2",bd:"#fecdd3",link:"/international-patients"},
];
const PRICING_ICONS=["🔊","🔉","🧘","👩‍⚕️","🧪","🩹"];
export default function HealthcareProvider(){
  const { showModal, handleBookingClick, handleGatedNavigate, closeModal, role, navigate } = useRoleBooking();
  const { t } = useTranslation();
  useEffect(()=>{window.scrollTo(0,0);},[]);
  const [r1,v1]=useScrollAnimation();
  const [r2,v2]=useScrollAnimation({threshold:0.05});
  const [r3,v3]=useScrollAnimation();

  const svcTitles = Array.isArray(t("hp.core.svcTitles",{returnObjects:true})) ? t("hp.core.svcTitles",{returnObjects:true}) : [];
  const svcDescs  = Array.isArray(t("hp.core.svcDescs",{returnObjects:true}))  ? t("hp.core.svcDescs",{returnObjects:true})  : [];
  const SVCS = SVC_META.map((m,i)=>({...m, t:svcTitles[i]||"", desc:svcDescs[i]||""}));

  const [SPECS, setSpecs] = useState([]);
  const [specsLoading, setSpecsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/specialties`);
        const json = await res.json();
        const list = json.specialties || [];
        if (list.length > 0) {
          setSpecs(list.map(s => ({ ic: s.icon || "🏥", name: s.name, desc: s.description || "" })));
        } else {
          // Fallback to en.json if DB empty
          const names = Array.isArray(t("hp.specs.names",{returnObjects:true})) ? t("hp.specs.names",{returnObjects:true}) : [];
          const descs = Array.isArray(t("hp.specs.descs",{returnObjects:true})) ? t("hp.specs.descs",{returnObjects:true}) : [];
          setSpecs(SPEC_ICONS.map((ic,i) => ({ ic, name: names[i]||"", desc: descs[i]||"" })));
        }
      } catch {
        const names = Array.isArray(t("hp.specs.names",{returnObjects:true})) ? t("hp.specs.names",{returnObjects:true}) : [];
        const descs = Array.isArray(t("hp.specs.descs",{returnObjects:true})) ? t("hp.specs.descs",{returnObjects:true}) : [];
        setSpecs(SPEC_ICONS.map((ic,i) => ({ ic, name: names[i]||"", desc: descs[i]||"" })));
      } finally { setSpecsLoading(false); }
    })();
  }, []);

  const pricingSvc   = Array.isArray(t("hp.home.pricingSvc",{returnObjects:true}))   ? t("hp.home.pricingSvc",{returnObjects:true})   : [];
  const pricingDesc  = Array.isArray(t("hp.home.pricingDesc",{returnObjects:true}))  ? t("hp.home.pricingDesc",{returnObjects:true})  : [];
  const PRICING = PRICING_ICONS.map((ic,i)=>[ic, pricingSvc[i]||"", pricingDesc[i]||""]);

  const stepTitles = Array.isArray(t("hp.home.stepTitles",{returnObjects:true})) ? t("hp.home.stepTitles",{returnObjects:true}) : [];
  const stepDescs  = Array.isArray(t("hp.home.stepDescs",{returnObjects:true}))  ? t("hp.home.stepDescs",{returnObjects:true})  : [];
  const STEPS = ["01","02","03","04"].map((n,i)=>[n, stepTitles[i]||"", stepDescs[i]||""]);
  return(
    <div className="hp">
      <style>{G}</style>
      <SEO title="Services & Specialties" path="/healthcare-provider"
        description="Explore the medical specialties and home healthcare services available through We Care 4 'all' — from cardiology to physiotherapy."
        keywords="healthcare services Chennai, medical specialties Chennai, healthcare consultancy services, video consultation services Chennai, home healthcare services Chennai, cardiology services Chennai, physiotherapy services Chennai, medical services near me, healthcare service provider Chennai, telemedicine services India, doctor consultation services, specialist services Chennai, diagnostic services Chennai, patient care services India, healthcare packages Chennai, medical consultation types, in-person consultation Chennai, home visit doctor services, healthcare service list, hospital coordination services, health checkup services Chennai, medical specialty list India, healthcare service booking, We Care 4 all services, comprehensive healthcare services, primary care services Chennai, specialist referral services, healthcare provider network Chennai, medical services online booking" />
      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <W s={{padding:"52px 24px 80px"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"20px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>{t("common.home")}</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"#6ee7b7",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>{t("hp.breadcrumb")}</span>
          </div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"14px"}}>{t("hp.eyebrow")}</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,58px)",fontWeight:"700",color:"#fff",lineHeight:"1.1",marginBottom:"16px"}}>
            {t("hp.title1")}<br/><span style={{color:"#34d399"}}>{t("hp.title2")}</span>
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"17px",color:"rgba(255,255,255,.68)",lineHeight:"1.78",maxWidth:"500px",fontWeight:"300",marginBottom:"28px"}}>
            {t("hp.subtitle")}
          </p>
          <><button onClick={handleBookingClick} className="btn-p" style={{cursor:"pointer",border:"none"}}>{t("hp.bookConsult")}</button><RoleModal show={showModal} role={role} onLogin={()=>{closeModal();navigate("/login");}} onCancel={closeModal}/></>
        </W>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{display:"block",width:"100%",marginBottom:"-2px"}}><path d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z" fill="#f0f6fc"/></svg>
      </section>
      {/* Core Services */}
      <section style={{background:"#f0f6fc",padding:"72px 0"}}>
        <W>
          <div style={{textAlign:"center",marginBottom:"44px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#047857",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>{t("hp.core.eyebrow")}</p>
            <h2 style={{fontSize:"clamp(24px,3.5vw,40px)",fontWeight:"700",color:"#0b1f3a",margin:0}}>{t("hp.core.heading")}</h2>
          </div>
          <div ref={r1} className={`g2-svc stagger${v1?" in":""}`} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"22px"}}>
            {SVCS.map(({ic,t:title,c,bg,bd,desc,link})=>(
              <div key={title} className="svc-card" style={{background:bg,border:`1px solid ${bd}`,borderLeft:`4px solid ${c}`,borderRadius:"14px",padding:"26px 22px",boxShadow:"0 2px 10px rgba(11,31,58,.05)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"11px",marginBottom:"12px"}}>
                  <div style={{width:"46px",height:"46px",background:`${c}14`,borderRadius:"11px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>{ic}</div>
                  <h3 style={{fontSize:"19px",fontWeight:"700",color:"#0b1f3a"}}>{title}</h3>
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",lineHeight:"1.72",margin:"0 0 14px",fontWeight:"300"}}>{desc}</p>
                <button onClick={(e)=>handleGatedNavigate(e,link)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",color:c,background:"none",border:"none",cursor:"pointer",padding:0}}>{t("hp.bookNow")}</button>
              </div>
            ))}
          </div>
        </W>
      </section>
      {/* Featured hospital partners — reuses the same live partner-hospitals
          data as Home's marquee and Our Hospitals, sits right before the
          Partner CTA since a visitor reading Services is already thinking
          about hospitals. */}
      <HospitalCarousel/>
      {/* For Hospitals — Partner With Us entry point. Partner-With-Us is
          no longer a top-level navbar link (see Navbar.jsx) — this is
          the actual "tab under Healthcare Providers" the page is now
          reachable from, since hospitals are a fundamentally different
          kind of visitor than patients browsing services. */}
      <section style={{background:"#fff",padding:"0 0 8px"}}>
        <W>
          <Link to="/partner-with-us" style={{display:"flex",alignItems:"center",justifyContent:"space-between",
            gap:"20px",flexWrap:"wrap",background:"linear-gradient(135deg,#0b1f3a,#112d52)",
            borderRadius:"16px",padding:"28px 32px",textDecoration:"none",
            boxShadow:"0 8px 28px rgba(11,31,58,.18)"}}>
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
                color:"#6ee7b7",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"8px"}}>
                For Hospitals
              </p>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:"700",
                color:"#fff",margin:"0 0 6px"}}>
                Partner With We Care 4 'all'
              </h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"rgba(255,255,255,.72)",
                margin:0,maxWidth:"480px",fontWeight:"300"}}>
                Reach patients actively seeking reliable medical guidance, gain digital visibility,
                and access medical tourism opportunities through our partner network.
              </p>
            </div>
            <span style={{flexShrink:0,display:"inline-flex",alignItems:"center",gap:"8px",
              background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
              padding:"12px 24px",borderRadius:"9px",whiteSpace:"nowrap"}}>
              Become a Partner →
            </span>
          </Link>
        </W>
      </section>
      {/* Specialties */}
      <section style={{background:"#fff",padding:"72px 0"}}>
        <W>
          <div style={{textAlign:"center",marginBottom:"44px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#047857",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>{t("hp.specs.eyebrow")}</p>
            <h2 style={{fontSize:"clamp(24px,3.5vw,40px)",fontWeight:"700",color:"#0b1f3a",margin:"0 0 10px"}}>{t("hp.specs.heading")}</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#64748b",maxWidth:"460px",margin:"0 auto",fontWeight:"300"}}>{t("hp.specs.sub")}</p>
          </div>
          <div ref={r2} className={`g3 stagger${v2?" in":""}`} style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px"}}>
            {SPECS.map(({ic,name,desc})=>(
              <div key={name} className="spec-card" style={{background:"#f8fafc",borderRadius:"12px",padding:"18px",boxShadow:"0 1px 6px rgba(11,31,58,.04)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"7px"}}>
                  <SpecialtyIcon icon={ic} size={20}/>
                  <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:"700",color:"#0b1f3a"}}>{name}</h3>
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8",lineHeight:"1.6",margin:0,fontWeight:"300"}}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:"36px"}}>
            <button onClick={handleBookingClick} className="btn-p" style={{cursor:"pointer",border:"none"}}>{t("hp.bookAnySpecialty")}</button>
          </div>
        </W>
      </section>
      {/* Home Healthcare detail */}
      <section style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"88px 0"}}>
        <W>
          <div style={{textAlign:"center",maxWidth:"640px",margin:"0 auto 48px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"14px"}}>{t("hp.home.eyebrow")}</p>
            <h2 style={{fontSize:"clamp(26px,3.8vw,42px)",fontWeight:"700",color:"#fff",margin:"0 0 16px",lineHeight:1.2}}>{t("hp.home.heading")}</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15.5px",color:"rgba(255,255,255,.68)",lineHeight:"1.78",fontWeight:"300"}}>{t("hp.home.subtitle")}</p>
          </div>

          <div ref={r3} className={`reveal${v3?" in":""}`}
            style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:"16px",marginBottom:"56px"}}>
            {PRICING.map(([ic,svc,desc])=>(
              <div key={svc}
                style={{padding:"22px 20px",background:"rgba(255,255,255,.05)",
                  border:"1px solid rgba(255,255,255,.1)",borderRadius:"16px",
                  transition:"all .2s",cursor:"default"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.09)";e.currentTarget.style.borderColor="rgba(52,211,153,.4)";e.currentTarget.style.transform="translateY(-3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.05)";e.currentTarget.style.borderColor="rgba(255,255,255,.1)";e.currentTarget.style.transform="translateY(0)";}}>
                <div style={{width:"48px",height:"48px",background:"rgba(52,211,153,.15)",
                  border:"1px solid rgba(52,211,153,.3)",borderRadius:"12px",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"22px",marginBottom:"14px"}}>{ic}</div>
                <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15.5px",fontWeight:"700",
                  color:"#fff",margin:"0 0 7px"}}>{svc}</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                  color:"rgba(255,255,255,.5)",lineHeight:"1.6",margin:0,fontWeight:"300"}}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"18px",marginBottom:"40px"}}>
            {STEPS.map(([n,title,d])=>(
              <div key={n} style={{padding:"22px 18px",background:"rgba(255,255,255,.05)",
                border:"1px solid rgba(255,255,255,.08)",borderRadius:"14px"}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"30px",
                  fontWeight:"700",color:"#34d399",display:"block",marginBottom:"8px",lineHeight:1}}>{n}</span>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",color:"#fff",
                  fontSize:"14.5px",margin:"0 0 6px"}}>{title}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                  color:"rgba(255,255,255,.55)",lineHeight:"1.68",margin:0,fontWeight:"300"}}>{d}</p>
              </div>
            ))}
          </div>

          <div style={{textAlign:"center"}}>
            <button onClick={(e)=>handleGatedNavigate(e,"/home-healthcare")}
              style={{background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",
                padding:"15px 40px",borderRadius:"10px",border:"none",cursor:"pointer",
                boxShadow:"0 8px 24px rgba(4,120,87,.35)"}}>
              {t("hp.bookHomeHealthcare")} →
            </button>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
              color:"rgba(255,255,255,.45)",marginTop:"12px"}}>
              See live pricing and book your slot on the next page
            </p>
          </div>
        </W>
      </section>
    </div>
  );
}
