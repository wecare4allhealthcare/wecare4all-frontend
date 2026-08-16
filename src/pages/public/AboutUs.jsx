import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRoleBooking, RoleModal } from "../../components/RoleModal";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";
// Same hospital-portal detection used in Footer.jsx / Contact.jsx / Home.jsx
function isHospitalPortal(role) {
  if (role === "hospital") return true;
  if (role === "patient" && typeof window !== "undefined" &&
      localStorage.getItem("wc4a_login_portal") === "hospital") return true;
  return false;
}
// Non-text metadata for the six hospital-services cards — the actual
// title/description text lives in locales/*.json under
// aboutPage.hospServices.<id> so it can be translated; this array just
// supplies the id + icon needed to look that up and render in order.
const HOSPITAL_SERVICE_IDS = [
  { id: "marketing",     ic: "📣" },
  { id: "branding",      ic: "🎨" },
  { id: "accreditation", ic: "🏅" },
  { id: "insurance",     ic: "🏦" },
  { id: "staffing",      ic: "👥" },
  { id: "empanelments",  ic: "📋" },
];
const G=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.au{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}
.au *{box-sizing:border-box;}.au a{text-decoration:none;}
.au h1,.au h2,.au h3,.au h4{font-family:'Cormorant Garamond',Georgia,serif;}
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease;}
.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
.stagger.in>*:nth-child(1){opacity:1;transform:translateY(0);transition-delay:.05s}
.stagger.in>*:nth-child(2){opacity:1;transform:translateY(0);transition-delay:.13s}
.stagger.in>*:nth-child(3){opacity:1;transform:translateY(0);transition-delay:.21s}
.stagger.in>*:nth-child(4){opacity:1;transform:translateY(0);transition-delay:.29s}
.val-card{transition:all .25s;}.val-card:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(11,31,58,.12)!important;}
.tier-card{transition:all .25s;}.tier-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(11,31,58,.14)!important;}
.btn-p{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#047857,#059669);color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;padding:13px 28px;border-radius:8px;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(4,120,87,.40);transition:all .25s;text-decoration:none;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(4,120,87,.50);}
.btn-ol{display:inline-flex;align-items:center;gap:8px;background:transparent;border:1.5px solid rgba(255,255,255,.30);color:#fff;font-family:'DM Sans',sans-serif;font-weight:500;font-size:15px;padding:13px 26px;border-radius:8px;cursor:pointer;transition:all .25s;text-decoration:none;}
.btn-ol:hover{background:rgba(255,255,255,.10);}
@media(max-width:800px){.au-grid{grid-template-columns:1fr!important;}.team-grid{grid-template-columns:1fr 1fr!important;}}
@media(max-width:500px){.team-grid{grid-template-columns:1fr!important;}
  /* Below the 1-column breakpoint the card is full-width, but its 160px
     fixed-width photo + 28px gap + 72px of padding left almost nothing for
     the bio/tags text (the empty-space-on-left / squeezed-text-on-right
     look in the mobile screenshot). Stack photo above text and trim the
     padding instead of running them side by side. */
  .team-card{flex-direction:column!important;align-items:center!important;
    text-align:center;padding:22px!important;}
  .team-card>div:last-child{width:100%;}
}
`;
const W=({children,s={}})=><div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 24px",...s}}>{children}</div>;
function SH({badge,title,sub,dark=false}){
  const [ref,vis]=useScrollAnimation();
  return(
    <div ref={ref} className={`reveal${vis?" in":""}`} style={{textAlign:"center",marginBottom:"48px"}}>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:dark?"#6ee7b7":"#047857",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>{badge}</p>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(26px,3.5vw,42px)",fontWeight:"700",color:dark?"#fff":"#0b1f3a",margin:"0 0 12px",lineHeight:1.15}}>{title}</h2>
      {sub&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",color:dark?"rgba(255,255,255,.62)":"#64748b",maxWidth:"520px",margin:"0 auto",lineHeight:1.75,fontWeight:"300"}}>{sub}</p>}
    </div>
  );
}
// Non-text metadata for the three partnership tiers — labels/prices/
// features come from locales/*.json under aboutPage.tiers.<id>.
const TIER_IDS=[
  {id:"basic",    icon:"🌿", color:"#64748b", bg:"#f8fafc", border:"#e2eaf4"},
  {id:"growth",   icon:"🚀", color:"#047857", bg:"#f0fdf4", border:"#86efac"},
  {id:"strategic",icon:"⭐", color:"#0369a1", bg:"#eff8ff", border:"#93c5fd"},
];
// Non-text metadata for the two team members — role/bio/tags/badge come
// from locales/*.json under aboutPage.team.<id>.
const TEAM_IDS=[
  {id:"raman",    img:"/assets/img/about/1.jpg", name:"R.V. Raman",       color:"#047857", linkedin:"https://www.linkedin.com/in/wecare4all2006/", badgeColor:"#047857"},
  {id:"vardhini", img:"/assets/img/about/9.png", name:"Vardhini Karthik", color:"#0369a1", linkedin:null,                                          badgeColor:"#0369a1"},
];
// Module-level, same reason TEAM_IDS above is — a stable object
// reference across re-renders (this page has scroll-triggered animation
// state via useScrollAnimation, which re-renders on visibility change).
const ABOUT_JSONLD = {
  "@type": "AboutPage",
  "name": "About We Care 4 'all'",
  "url": "https://www.wecare4all.in/about",
  "mainEntity": {
    "@type": "MedicalBusiness",
    "name": "We Care 4 'all'",
    "foundingDate": "2009",
    "description": "An independent healthcare consultancy connecting patients with verified doctors and accredited hospitals — a healthcare concierge, not just another listing site.",
    "founder": [
      { "@type": "Person", "name": "R.V. Raman" },
      { "@type": "Person", "name": "Vardhini Karthik" },
    ],
  },
};
export default function AboutUs(){
  const { t } = useTranslation();
  const { showModal, handleBookingClick, closeModal, role, navigate } = useRoleBooking();
  const hospitalPortal = isHospitalPortal(role);
  useEffect(()=>{window.scrollTo(0,0);},[]);
  const [s1,v1]=useScrollAnimation();
  const [s2,v2]=useScrollAnimation();
  const [s4,v4]=useScrollAnimation();
  return(
    <div className="au">
      <style>{G}</style>
      <SEO title="About Us" path="/about"
        description="Learn about We Care 4 'all' — an independent healthcare consultancy connecting patients with verified doctors and accredited hospitals."
        jsonLd={ABOUT_JSONLD} />
      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <W s={{padding:"52px 24px 80px"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"20px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>{t("nav.home")}</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"#6ee7b7",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>{t("aboutPage.breadcrumb")}</span>
          </div>
          <div className="au-grid" style={{display:"grid",gridTemplateColumns:"1.2fr 0.8fr",gap:"56px",alignItems:"center"}}>
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"14px"}}>{t("aboutPage.eyebrowStory")}</p>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,62px)",fontWeight:"700",color:"#fff",lineHeight:"1.1",marginBottom:"18px"}}>
                {t("aboutPage.heroTitle1")}<br/><span style={{color:"#34d399"}}>{t("aboutPage.heroTitle2")}</span>
              </h1>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"17px",color:"rgba(255,255,255,.68)",lineHeight:"1.78",maxWidth:"480px",fontWeight:"300"}}>
                {t("aboutPage.heroSub")}
              </p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"13px"}}>
              {[["16+","statYearsActive"],["500+","statLivesTouched"],["50+","statHospitalPartners"],["18+","statSpecializations"]].map(([n,key])=>(
                <div key={key} style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.10)",borderRadius:"13px",padding:"18px",textAlign:"center"}}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"30px",fontWeight:"700",color:"#34d399",margin:0,lineHeight:1}}>{n}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"rgba(255,255,255,.50)",marginTop:"5px"}}>{t(`aboutPage.${key}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </W>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{display:"block",width:"100%",marginBottom:"-2px"}}>
          <path d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z" fill="#f0f6fc"/>
        </svg>
      </section>
      {/* Story */}
      <section style={{background:"#f0f6fc",padding:"72px 0"}}>
        <W>
          <div className="au-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"56px",alignItems:"center"}}>
            <div ref={s1} className={`reveal${v1?" in":""}`}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#047857",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>{t("aboutPage.whoWeAreEyebrow")}</p>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(24px,3.5vw,40px)",fontWeight:"700",color:"#0b1f3a",margin:"0 0 20px",lineHeight:1.2}}>
                {hospitalPortal ? t("aboutPage.whoWeAreTitleHospital") : t("aboutPage.whoWeAreTitlePatient")}
              </h2>
              {(hospitalPortal
                ? [t("aboutPage.storyHospital1"), t("aboutPage.storyHospital2"), t("aboutPage.storyHospital3")]
                : [t("aboutPage.storyPatient1"), t("aboutPage.storyPatient2"), t("aboutPage.storyPatient3")]
              ).map((para,i)=>(
                <p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#475569",lineHeight:"1.78",borderLeft:`3px solid ${i===0?"#047857":i===1?"#0e7490":"#7c3aed"}`,paddingLeft:"16px",marginBottom:"14px",fontWeight:"300"}}>{para}</p>
              ))}
            </div>
            <div ref={s2} className={`reveal${v2?" in":""}`}>
              <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",borderRadius:"22px",padding:"36px",boxShadow:"0 20px 50px rgba(11,31,58,.22)"}}>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontStyle:"italic",color:"#a7f3d0",lineHeight:"1.65",marginBottom:"22px"}}>
                  {t("aboutPage.quote")}
                </p>
                <div style={{display:"flex",alignItems:"center",gap:"13px"}}>
                  <div style={{width:"46px",height:"46px",background:"linear-gradient(135deg,#047857,#10b981)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",fontWeight:"700",color:"#fff",fontFamily:"'Cormorant Garamond',serif"}}>R</div>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",color:"#fff",fontSize:"15px",margin:0}}>R.V. Raman</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",fontSize:"12px",margin:0}}>{t("aboutPage.founderTitle")}</p>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"11px",marginTop:"20px",padding:"12px 14px",background:"rgba(4,120,87,.15)",border:"1px solid rgba(16,185,129,.22)",borderRadius:"10px"}}>
                  <div style={{width:"32px",height:"32px",background:"#fff",borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                    <img loading="lazy" src="/assets/img/logo/euro_logo.jpeg" alt="Euro Cert" style={{width:"28px",height:"28px",objectFit:"contain"}} onError={e=>{e.target.parentElement.innerHTML=`<span style="font-size:7px;font-weight:800;color:#0b1f3a;text-align:center;line-height:1.2">EURO<br/>CERT</span>`;}}/>
                  </div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",fontSize:"12px",fontWeight:"600",margin:0}}>{t("aboutPage.euroCert")}</p>
                </div>
              </div>
            </div>
          </div>
        </W>
      </section>
      {/* What We Offer Hospitals — hospital-portal visitors only, per the
          client's explicit service list (patients never see this). */}
      {hospitalPortal && (
        <section style={{background:"#fff",padding:"72px 0"}}>
          <W>
            <SH badge={t("aboutPage.hospServicesEyebrow")} title={t("aboutPage.hospServicesTitle")}
              sub={t("aboutPage.hospServicesSub")}/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(260px,100%),1fr))",gap:"20px"}}>
              {HOSPITAL_SERVICE_IDS.map(({id,ic})=>(
                <div key={id} className="val-card" style={{background:"#f8fafc",border:"1px solid #e2eaf4",borderRadius:"14px",padding:"24px 20px",boxShadow:"0 2px 10px rgba(11,31,58,.05)"}}>
                  <div style={{fontSize:"26px",marginBottom:"10px"}}>{ic}</div>
                  <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 8px"}}>{t(`aboutPage.hospServices.${id}.t`)}</h3>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"#64748b",lineHeight:"1.7",margin:0,fontWeight:"300"}}>{t(`aboutPage.hospServices.${id}.d`)}</p>
                </div>
              ))}
            </div>
          </W>
        </section>
      )}
      {/* Team */}
      <section style={{background:"#fff",padding:"72px 0"}}>
        <W>
          <SH badge={t("aboutPage.teamEyebrow")} title={t("aboutPage.teamTitle")}/>
          <div className="team-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"22px"}}>
            {TEAM_IDS.map(({id,img,name,color,linkedin,badgeColor})=>{
              const tags = t(`aboutPage.team.${id}.tags`, {returnObjects:true});
              const awards = t(`aboutPage.team.${id}.awards`, {defaultValue:""});
              return (
              <div key={id} className="team-card"
                style={{background:"#f8fafc",border:"1px solid #e2eaf4",borderRadius:"16px",
                  padding:"36px",boxShadow:"0 2px 12px rgba(11,31,58,.06)",
                  display:"flex",gap:"28px",alignItems:"flex-start",
                  transition:"all .25s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(11,31,58,.12)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 12px rgba(11,31,58,.06)";}}>

                {/* LEFT — Photo */}
                <div style={{flexShrink:0,textAlign:"center"}}>
                  <div style={{position:"relative",display:"inline-block"}}>
                    <img loading="lazy" src={img} alt={name}
                      style={{width:"160px",height:"200px",borderRadius:"12px",
                        objectFit:"cover",objectPosition:"center top",
                        border:`3px solid ${color}`,display:"block",
                        boxShadow:"0 4px 14px rgba(11,31,58,.15)"}}
                      onError={e=>{
                        e.target.style.display="none";
                        e.target.nextSibling.style.display="flex";
                      }}/>
                    <div style={{width:"160px",height:"200px",borderRadius:"12px",
                      background:`linear-gradient(135deg,${color},${color}88)`,
                      display:"none",alignItems:"center",justifyContent:"center",
                      fontSize:"48px",fontWeight:"700",color:"#fff",
                      fontFamily:"'Cormorant Garamond',serif",
                      border:`3px solid ${color}`}}>
                      {name[0]}
                    </div>
                    <span style={{position:"absolute",bottom:"-8px",left:"50%",
                      transform:"translateX(-50%)",background:badgeColor,color:"#fff",
                      fontSize:"9px",fontWeight:"700",padding:"2px 8px",
                      borderRadius:"50px",fontFamily:"'DM Sans',sans-serif",
                      whiteSpace:"nowrap"}}>
                      {t(`aboutPage.team.${id}.badge`)}
                    </span>
                  </div>
                </div>

                {/* RIGHT — Details */}
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"19px",
                    fontWeight:"700",color:"#0b1f3a",margin:"0 0 2px"}}>{name}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
                    fontWeight:"600",color:color,margin:"0 0 8px"}}>{t(`aboutPage.team.${id}.role`)}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                    color:"#64748b",lineHeight:"1.65",margin:"0 0 8px",fontWeight:"300"}}>
                    {t(`aboutPage.team.${id}.bio`)}
                  </p>
                  {awards&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10.5px",
                    color:"#92400e",background:"#fffbeb",border:"1px solid #fde68a",
                    borderRadius:"6px",padding:"5px 9px",margin:"0 0 8px",lineHeight:"1.5"}}>
                    {awards}
                  </p>}
                  <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:linkedin?"10px":"0"}}>
                    {tags.map(tag=>(
                      <span key={tag} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"10px",
                        fontWeight:"600",color:color,background:`${color}14`,
                        padding:"3px 8px",borderRadius:"50px"}}>{tag}</span>
                    ))}
                  </div>
                  {linkedin&&(
                    <a href={linkedin} target="_blank" rel="noopener noreferrer"
                      style={{display:"inline-flex",alignItems:"center",gap:"4px",
                        fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",fontWeight:"600",
                        color:"#0369a1",textDecoration:"none",background:"#eff8ff",
                        padding:"3px 10px",borderRadius:"50px",border:"1px solid #bae6fd"}}>
                      🔗 LinkedIn
                    </a>
                  )}
                </div>
              </div>
            );})}
          </div>
        </W>
      </section>
      {/* VMV */}
      <section style={{background:"#f0f6fc",padding:"72px 0"}}>
        <W>
          <SH badge={t("aboutPage.vmvEyebrow")} title={t("aboutPage.vmvTitle")}/>
          <div ref={s4} className={`stagger${v4?" in":""}`} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(280px,100%),1fr))",gap:"22px"}}>
            {[
              {ic:"🔭",id:"vision",  c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd"},
              {ic:"🎯",id:"mission", c:"#047857",bg:"#f0fdf4",bd:"#86efac"},
              {ic:"💎",id:"values",  c:"#7c3aed",bg:"#faf5ff",bd:"#ddd6fe"},
            ].map(({ic,id,c,bg,bd})=>{
              const title = t(`aboutPage.vmv.${id}.title`);
              const txt = t(`aboutPage.vmv.${id}.txt`, {defaultValue:""});
              const items = txt ? null : t(`aboutPage.vmv.${id}.items`, {returnObjects:true});
              return (
              <div key={id} className="val-card" style={{background:bg,border:`1px solid ${bd}`,borderRadius:"15px",padding:"26px 22px",boxShadow:"0 2px 10px rgba(11,31,58,.05)"}}>
                <div style={{fontSize:"30px",marginBottom:"12px"}}>{ic}</div>
                <h3 style={{fontSize:"22px",fontWeight:"700",color:c,margin:"0 0 13px"}}>{title}</h3>
                {txt?<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#475569",lineHeight:"1.75",fontWeight:"300"}}>{txt}</p>
                  :<ul style={{paddingLeft:"16px"}}>{items.map(item=><li key={item} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#475569",lineHeight:"1.75",marginBottom:"6px",fontWeight:"300"}}>{item}</li>)}</ul>}
              </div>
            );})}
          </div>
        </W>
      </section>
      {/* Tiers */}
      <section style={{background:"#fff",padding:"72px 0"}}>
        <W>
          <SH badge={t("aboutPage.hospServicesEyebrow")} title={t("aboutPage.tiersTitle")} sub={t("aboutPage.tiersSub")}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(260px,100%),1fr))",gap:"22px"}}>
            {TIER_IDS.map(({id,icon,color,bg,border})=>{
              const label = t(`aboutPage.tiers.${id}.label`);
              const price = t(`aboutPage.tiers.${id}.price`);
              const badge = t(`aboutPage.tiers.${id}.badge`, {defaultValue:""});
              const features = t(`aboutPage.tiers.${id}.features`, {returnObjects:true});
              return (
              <div key={id} className="tier-card" style={{background:bg,border:`2px solid ${border}`,borderRadius:"16px",padding:"28px 22px",position:"relative",boxShadow:"0 2px 12px rgba(11,31,58,.06)"}}>
                {badge&&<span style={{position:"absolute",top:"-11px",left:"50%",transform:"translateX(-50%)",background:color,color:"#fff",fontSize:"10px",fontWeight:"700",padding:"3px 14px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{badge}</span>}
                <div style={{fontSize:"26px",marginBottom:"11px"}}>{icon}</div>
                <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 5px"}}>{label}</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:color,margin:"0 0 16px"}}>{price}</p>
                <ul style={{paddingLeft:0,listStyle:"none",marginBottom:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
                  {features.map(f=><li key={f} style={{display:"flex",gap:"7px",alignItems:"flex-start",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#475569",fontWeight:"300"}}><span style={{color,marginTop:"1px",fontWeight:"700",flexShrink:0}}>✓</span>{f}</li>)}
                </ul>
                <Link to="/partner-with-us" style={{display:"block",textAlign:"center",padding:"11px",background:color,color:"#fff",borderRadius:"9px",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px"}}>{t("aboutPage.applyNow")}</Link>
              </div>
            );})}
          </div>
        </W>
      </section>
      {/* CTA */}
      <section style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"64px 24px",textAlign:"center"}}>
        <div style={{maxWidth:"540px",margin:"0 auto"}}>
          <h2 style={{fontSize:"clamp(26px,4vw,44px)",fontWeight:"700",color:"#fff",margin:"0 0 14px"}}>
            {hospitalPortal ? t("aboutPage.ctaTitleHospital") : t("aboutPage.ctaTitlePatient")}
          </h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",color:"rgba(255,255,255,.68)",marginBottom:"30px",lineHeight:1.7,fontWeight:"300"}}>
            {hospitalPortal ? t("aboutPage.ctaSubHospital") : t("aboutPage.ctaSubPatient")}
          </p>
          <div style={{display:"flex",gap:"13px",justifyContent:"center",flexWrap:"wrap"}}>
            {hospitalPortal ? (
              <Link to="/partner-with-us" className="btn-p">{t("aboutPage.applyForPartnership")}</Link>
            ) : (
              <>
                <button onClick={handleBookingClick} className="btn-p"
                  style={{cursor:"pointer",border:"none"}}>{t("aboutPage.bookAppointment")}</button>
                <RoleModal show={showModal} role={role}
                  onLogin={()=>{closeModal();navigate("/login");}}
                  onCancel={closeModal}/>
              </>
            )}
            <Link to="/contact" className="btn-ol">{t("aboutPage.contactUs")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
