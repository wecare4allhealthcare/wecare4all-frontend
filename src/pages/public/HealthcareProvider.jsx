import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
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
const SPECS=[
  {ic:"❤️",name:"Cardiology",desc:"Heart disease, ECG, angiography, interventional procedures."},
  {ic:"🧠",name:"Neurology",desc:"Brain, spine, nerve conditions, stroke management."},
  {ic:"🦴",name:"Orthopaedics",desc:"Bone & joint care, fractures, arthroscopy, replacement."},
  {ic:"🎗️",name:"Oncology",desc:"Cancer screening, chemotherapy coordination, palliative care."},
  {ic:"👁️",name:"Ophthalmology",desc:"Eye conditions, cataract, retina, LASIK guidance."},
  {ic:"👂",name:"ENT & Audiology",desc:"Ear, nose, throat, hearing assessment, audiometry."},
  {ic:"🫁",name:"Pulmonology",desc:"Lung disorders, asthma, COPD, sleep apnoea."},
  {ic:"🧬",name:"Gastroenterology",desc:"Digestive disorders, endoscopy, liver, IBD."},
  {ic:"🦷",name:"Nephrology",desc:"Kidney disease, dialysis coordination, transplant guidance."},
  {ic:"💊",name:"Endocrinology",desc:"Diabetes, thyroid, hormonal & metabolic disorders."},
  {ic:"👶",name:"Paediatrics",desc:"Children's health, growth, vaccination, development."},
  {ic:"🌸",name:"Gynaecology",desc:"Women's health, maternity, fertility, menopause."},
  {ic:"🧘",name:"Physiotherapy",desc:"Rehabilitation, sports injuries, post-surgery recovery."},
  {ic:"🧪",name:"Dermatology",desc:"Skin, hair, nail conditions, cosmetic dermatology."},
  {ic:"🧩",name:"Psychiatry",desc:"Mental health, anxiety, depression, behavioural therapy."},
  {ic:"🔬",name:"Urology",desc:"Urinary tract, kidney stones, prostate, bladder health."},
  {ic:"🏥",name:"General Medicine",desc:"Primary care consultations, preventive health checks."},
  {ic:"🩺",name:"Internal Medicine",desc:"Complex multi-system conditions, diagnostics, monitoring."},
];
const SVCS=[
  {ic:"🎥",t:"Video Consultation",c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd",desc:"Secure HD video calls with verified specialists. Book same-day appointments without leaving home. Available for 18+ specialties."},
  {ic:"🏠",t:"Home Healthcare",c:"#047857",bg:"#f0fdf4",bd:"#86efac",desc:"Qualified nurses, physiotherapists and lab technicians at your door. Post-surgery care, chronic disease management, sample collection."},
  {ic:"🏥",t:"Hospital Consultancy",c:"#7c3aed",bg:"#faf5ff",bd:"#ddd6fe",desc:"Strategic support for hospitals — accreditation, NABH guidance, insurance empanelment, corporate tie-ups and operational transformation."},
  {ic:"🌍",t:"International Patients",c:"#be123c",bg:"#fff1f2",bd:"#fecdd3",desc:"End-to-end coordination for patients travelling to India — specialist matching, visa letters, accommodation, airport transfers and interpreters."},
];
const PRICING=[
  ["🔊","Pure Tone Audiometry (PTA)","₹600 per visit"],
  ["🔉","Impedance Audiometry","₹700 per visit"],
  ["🧘","Physiotherapy Session","From ₹800 per visit"],
  ["👩‍⚕️","Nursing Care (8 hrs)","₹1,500 per shift"],
  ["🧪","Lab Sample Collection","₹300 per visit"],
  ["🩹","Post-Surgery Care","From ₹1,000 per visit"],
];
export default function HealthcareProvider(){
  useEffect(()=>{document.title="Services & Specialties — We Care 4 all";window.scrollTo(0,0);},[]);
  const [r1,v1]=useScrollAnimation();
  const [r2,v2]=useScrollAnimation({threshold:0.05});
  const [r3,v3]=useScrollAnimation();
  return(
    <div className="hp">
      <style>{G}</style>
      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <W s={{padding:"52px 24px 80px"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"20px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Home</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"#6ee7b7",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Services</span>
          </div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"14px"}}>Healthcare Services</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,58px)",fontWeight:"700",color:"#fff",lineHeight:"1.1",marginBottom:"16px"}}>
            Expert Care,<br/><span style={{color:"#34d399"}}>Every Specialty.</span>
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"17px",color:"rgba(255,255,255,.68)",lineHeight:"1.78",maxWidth:"500px",fontWeight:"300",marginBottom:"28px"}}>
            Access 18+ medical specialties through video consultation, home visits or referrals to our trusted partner hospitals.
          </p>
          <Link to="/login" className="btn-p">Book a Consultation →</Link>
        </W>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{display:"block",width:"100%",marginBottom:"-2px"}}><path d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z" fill="#f0f6fc"/></svg>
      </section>
      {/* Core Services */}
      <section style={{background:"#f0f6fc",padding:"72px 0"}}>
        <W>
          <div style={{textAlign:"center",marginBottom:"44px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#047857",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>What We Provide</p>
            <h2 style={{fontSize:"clamp(24px,3.5vw,40px)",fontWeight:"700",color:"#0b1f3a",margin:0}}>Core Healthcare Services</h2>
          </div>
          <div ref={r1} className={`g2-svc stagger${v1?" in":""}`} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"22px"}}>
            {SVCS.map(({ic,t,c,bg,bd,desc})=>(
              <div key={t} className="svc-card" style={{background:bg,border:`1px solid ${bd}`,borderLeft:`4px solid ${c}`,borderRadius:"14px",padding:"26px 22px",boxShadow:"0 2px 10px rgba(11,31,58,.05)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"11px",marginBottom:"12px"}}>
                  <div style={{width:"46px",height:"46px",background:`${c}14`,borderRadius:"11px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>{ic}</div>
                  <h3 style={{fontSize:"19px",fontWeight:"700",color:"#0b1f3a"}}>{t}</h3>
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",lineHeight:"1.72",margin:"0 0 14px",fontWeight:"300"}}>{desc}</p>
                <Link to="/login" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",color:c}}>Book Now →</Link>
              </div>
            ))}
          </div>
        </W>
      </section>
      {/* Specialties */}
      <section style={{background:"#fff",padding:"72px 0"}}>
        <W>
          <div style={{textAlign:"center",marginBottom:"44px"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#047857",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>Medical Expertise</p>
            <h2 style={{fontSize:"clamp(24px,3.5vw,40px)",fontWeight:"700",color:"#0b1f3a",margin:"0 0 10px"}}>Our Specializations</h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#64748b",maxWidth:"460px",margin:"0 auto",fontWeight:"300"}}>18 medical specialties — accessible via video, home visit or hospital referral</p>
          </div>
          <div ref={r2} className={`g3 stagger${v2?" in":""}`} style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px"}}>
            {SPECS.map(({ic,name,desc})=>(
              <div key={name} className="spec-card" style={{background:"#f8fafc",borderRadius:"12px",padding:"18px",boxShadow:"0 1px 6px rgba(11,31,58,.04)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"7px"}}>
                  <span style={{fontSize:"20px"}}>{ic}</span>
                  <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:"700",color:"#0b1f3a"}}>{name}</h3>
                </div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8",lineHeight:"1.6",margin:0,fontWeight:"300"}}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:"36px"}}>
            <Link to="/login" className="btn-p">Book Any Specialty →</Link>
          </div>
        </W>
      </section>
      {/* Home Healthcare detail */}
      <section style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"72px 0"}}>
        <W>
          <div ref={r3} className="hp-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"56px",alignItems:"center"}}>
            <div className={`reveal${v3?" in":""}`}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"14px"}}>At Your Doorstep</p>
              <h2 style={{fontSize:"clamp(24px,3.5vw,40px)",fontWeight:"700",color:"#fff",margin:"0 0 14px",lineHeight:1.2}}>Home Healthcare Services</h2>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"rgba(255,255,255,.68)",lineHeight:"1.78",marginBottom:"24px",fontWeight:"300"}}>Professional healthcare staff at your home. Scheduled, insured and fully verified. Transparent pricing with no hidden charges.</p>
              <div className="hp-pricing" style={{display:"flex",flexDirection:"column",gap:"9px"}}>
                {PRICING.map(([ic,svc,price])=>(
                  <div key={svc} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"11px",padding:"11px 15px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"9px"}}>
                      <span style={{fontSize:"15px"}}>{ic}</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#fff",fontWeight:"500"}}>{svc}</span>
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#6ee7b7",fontWeight:"700",whiteSpace:"nowrap"}}>{price}</span>
                  </div>
                ))}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"rgba(255,255,255,.38)",marginTop:"10px"}}>* Prices may vary by location. Final price confirmed at booking.</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              {[["01","Book Online","Select service, date, time and address. Pay via UPI or card."],
                ["02","Staff Assigned","Admin assigns a verified healthcare professional for your slot."],
                ["03","Confirmation Sent","You receive staff name, mobile and arrival time via SMS & email."],
                ["04","Home Visit Done","Professional arrives, completes service, provides report."]].map(([n,t,d])=>(
                <div key={n} style={{display:"flex",gap:"15px",alignItems:"flex-start",padding:"16px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"12px"}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:"700",color:"#34d399",flexShrink:0,lineHeight:1}}>{n}</span>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",color:"#fff",fontSize:"14px",margin:"0 0 3px"}}>{t}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"rgba(255,255,255,.52)",lineHeight:"1.65",margin:0,fontWeight:"300"}}>{d}</p>
                  </div>
                </div>
              ))}
              <Link to="/login" className="btn-p" style={{justifyContent:"center",marginTop:"4px"}}>Book Home Healthcare →</Link>
            </div>
          </div>
        </W>
      </section>
    </div>
  );
}
