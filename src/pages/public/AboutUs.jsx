import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
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
@media(max-width:500px){.team-grid{grid-template-columns:1fr!important;}}
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
const TIERS=[
  {icon:"🌿",id:"basic",label:"Basic Association",price:"Free",color:"#64748b",bg:"#f8fafc",border:"#e2eaf4",
   features:["Listed in hospital network","Eligible for patient referrals","Merit-based inclusion","Basic portal access","Download Certificate"]},
  {icon:"🚀",id:"growth",label:"Growth Partner",price:"Contact for Pricing",color:"#047857",bg:"#f0fdf4",border:"#86efac",badge:"Popular",
   features:["Priority website listing","Featured recommendations","Digital campaign inclusion","Blog & awareness content","Health camps participation","Full portal access","Monthly analytics","Download Certificate"]},
  {icon:"⭐",id:"strategic",label:"Strategic Partner",price:"Contact for Pricing",color:"#0369a1",bg:"#eff8ff",border:"#93c5fd",badge:"Premium",
   features:["Dedicated promotion campaigns","Doctor video features","International patient exposure","All major initiative branding","Corporate & institutional tie-ups","Unlimited profiles","Commission portal","Dedicated account manager","Download Certificate"]},
];
export default function AboutUs(){
  useEffect(()=>{document.title="About Us — We Care 4 all";window.scrollTo(0,0);},[]);
  const [s1,v1]=useScrollAnimation();
  const [s2,v2]=useScrollAnimation();
  const [s3,v3]=useScrollAnimation();
  const [s4,v4]=useScrollAnimation();
  return(
    <div className="au">
      <style>{G}</style>
      {/* Hero */}
      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <W s={{padding:"52px 24px 80px"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"20px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Home</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"#6ee7b7",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>About Us</span>
          </div>
          <div className="au-grid" style={{display:"grid",gridTemplateColumns:"1.2fr 0.8fr",gap:"56px",alignItems:"center"}}>
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"14px"}}>Our Story</p>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,62px)",fontWeight:"700",color:"#fff",lineHeight:"1.1",marginBottom:"18px"}}>
                Bridging Patients<br/><span style={{color:"#34d399"}}>to Better Care</span>
              </h1>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"17px",color:"rgba(255,255,255,.68)",lineHeight:"1.78",maxWidth:"480px",fontWeight:"300"}}>
                Founded in 2009 with a simple but powerful mission — ensuring every person has access to the right medical care, from the right specialist, at the right time.
              </p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"13px"}}>
              {[["16+","Years Active"],["500+","Lives Touched"],["50+","Hospital Partners"],["18+","Specializations"]].map(([n,l])=>(
                <div key={l} style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.10)",borderRadius:"13px",padding:"18px",textAlign:"center"}}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"30px",fontWeight:"700",color:"#34d399",margin:0,lineHeight:1}}>{n}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"rgba(255,255,255,.50)",marginTop:"5px"}}>{l}</p>
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
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#047857",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"10px"}}>Who We Are</p>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(24px,3.5vw,40px)",fontWeight:"700",color:"#0b1f3a",margin:"0 0 20px",lineHeight:1.2}}>A Healthcare Consultancy Built on Compassion</h2>
              {["We Care 4 'all' was established in Chennai with the belief that quality healthcare guidance should be accessible to everyone — not just those who know the right people.",
                "Our founder brings together clinical expertise, hospital management knowledge and strategic business acumen to serve patients, hospitals and healthcare professionals alike.",
                "Whether you are a patient navigating complex medical decisions, a hospital seeking growth, or an employer managing workforce health — we stand beside you."].map((t,i)=>(
                <p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"#475569",lineHeight:"1.78",borderLeft:`3px solid ${i===0?"#047857":i===1?"#0e7490":"#7c3aed"}`,paddingLeft:"16px",marginBottom:"14px",fontWeight:"300"}}>{t}</p>
              ))}
            </div>
            <div ref={s2} className={`reveal${v2?" in":""}`}>
              <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",borderRadius:"22px",padding:"36px",boxShadow:"0 20px 50px rgba(11,31,58,.22)"}}>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",fontStyle:"italic",color:"#a7f3d0",lineHeight:"1.65",marginBottom:"22px"}}>
                  "Quality healthcare becomes truly meaningful only when patients can access the right treatment, from the right specialists, at the right time. That is the gap we exist to close."
                </p>
                <div style={{display:"flex",alignItems:"center",gap:"13px"}}>
                  <div style={{width:"46px",height:"46px",background:"linear-gradient(135deg,#047857,#10b981)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",fontWeight:"700",color:"#fff",fontFamily:"'Cormorant Garamond',serif"}}>R</div>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",color:"#fff",fontSize:"15px",margin:0}}>R.V. Raman</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",fontSize:"12px",margin:0}}>Founder, We Care 4 'all'</p>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"11px",marginTop:"20px",padding:"12px 14px",background:"rgba(4,120,87,.15)",border:"1px solid rgba(16,185,129,.22)",borderRadius:"10px"}}>
                  <div style={{width:"32px",height:"32px",background:"#fff",borderRadius:"7px",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                    <img src="/assets/img/logo/euro_logo.jpeg" alt="Euro Cert" style={{width:"28px",height:"28px",objectFit:"contain"}} onError={e=>{e.target.parentElement.innerHTML=`<span style="font-size:7px;font-weight:800;color:#0b1f3a;text-align:center;line-height:1.2">EURO<br/>CERT</span>`;}}/>
                  </div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6ee7b7",fontSize:"12px",fontWeight:"600",margin:0}}>Euro Cert Certified Quality Standard</p>
                </div>
              </div>
            </div>
          </div>
        </W>
      </section>
      {/* Founder */}
      <section style={{background:"#fff",padding:"72px 0"}}>
        <W>
          <SH badge="Leadership" title="Meet Our Founder"/>
          <div ref={s3} className={`reveal${v3?" in":""}`} style={{maxWidth:"880px",margin:"0 auto",background:"#f0f6fc",border:"1px solid #e2eaf4",borderRadius:"18px",padding:"36px",boxShadow:"0 4px 20px rgba(11,31,58,.07)"}}>
            <div className="au-grid" style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"36px",alignItems:"start"}}>
              <div style={{textAlign:"center"}}>
                <div style={{width:"110px",height:"110px",background:"linear-gradient(135deg,#0b1f3a,#047857)",borderRadius:"18px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:"0 8px 24px rgba(11,31,58,.22)",overflow:"hidden",fontSize:"48px",fontFamily:"'Cormorant Garamond',serif",color:"#fff",fontWeight:"700"}}>R</div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",color:"#0b1f3a",fontSize:"15px",margin:"0 0 3px"}}>R.V. Raman</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#047857",fontWeight:"600"}}>Founder & Principal Consultant</p>
              </div>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#475569",lineHeight:"1.78",marginBottom:"20px",fontWeight:"300"}}>
                  A pioneering healthcare professional combining deep clinical knowledge with strategic business leadership. Recognised as the first woman in South India to complete an Advanced Executive Programme in Strategic Branding in the Healthcare Sector from IIM Trichy.
                </p>
                <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                  {[
                    ["🎓","B.Sc. Cardio Thoracic Perfusion Technology","Sri Ramachandra University, Chennai"],
                    ["🏛️","MBA — Hospital & Health Systems Management","Sri Ramachandra University, Chennai"],
                    ["📈","Advanced Executive Programme — Strategic Branding & Advertising","IIM Trichy (First woman in South India — Healthcare Sector)"],
                    ["⏱️","16+ Years Clinical & Healthcare Consulting Experience","Hospitals, corporate clients and international patients"],
                  ].map(([ic,lbl,sub])=>(
                    <div key={lbl} style={{display:"flex",alignItems:"flex-start",gap:"11px",padding:"11px 14px",background:"#fff",border:"1px solid #e2eaf4",borderRadius:"9px"}}>
                      <span style={{fontSize:"16px",flexShrink:0}}>{ic}</span>
                      <div>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",color:"#0b1f3a",margin:0}}>{lbl}</p>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#94a3b8",margin:"2px 0 0"}}>{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </W>
      </section>
      {/* VMV */}
      <section style={{background:"#f0f6fc",padding:"72px 0"}}>
        <W>
          <SH badge="Our Purpose" title="Vision, Mission & Values"/>
          <div ref={s4} className={`stagger${v4?" in":""}`} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"22px"}}>
            {[
              {ic:"🔭",t:"Vision",c:"#0369a1",bg:"#eff8ff",bd:"#bae6fd",
               txt:"To become India's most trusted healthcare consultancy — a platform where every patient finds the right specialist, every hospital finds the right partner, and quality care is never out of reach."},
              {ic:"🎯",t:"Mission",c:"#047857",bg:"#f0fdf4",bd:"#86efac",
               txt:"Deliver honest, patient-centred guidance that navigates the complexities of the Indian healthcare system — connecting people with verified specialists, ethical hospitals and home-based care."},
              {ic:"💎",t:"Values",c:"#7c3aed",bg:"#faf5ff",bd:"#ddd6fe",
               items:["Compassion — every interaction guided by empathy","Transparency — clear, honest communication always","Excellence — continuously raising the bar on quality","Integrity — ethical practice, no compromise","Accessibility — quality healthcare for everyone"]},
            ].map(({ic,t,c,bg,bd,txt,items})=>(
              <div key={t} className="val-card" style={{background:bg,border:`1px solid ${bd}`,borderRadius:"15px",padding:"26px 22px",boxShadow:"0 2px 10px rgba(11,31,58,.05)"}}>
                <div style={{fontSize:"30px",marginBottom:"12px"}}>{ic}</div>
                <h3 style={{fontSize:"22px",fontWeight:"700",color:c,margin:"0 0 13px"}}>{t}</h3>
                {txt?<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#475569",lineHeight:"1.75",fontWeight:"300"}}>{txt}</p>
                  :<ul style={{paddingLeft:"16px"}}>{items.map(item=><li key={item} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#475569",lineHeight:"1.75",marginBottom:"6px",fontWeight:"300"}}>{item}</li>)}</ul>}
              </div>
            ))}
          </div>
        </W>
      </section>
      {/* Tiers */}
      <section style={{background:"#fff",padding:"72px 0"}}>
        <W>
          <SH badge="For Hospitals" title="Hospital Partnership Tiers" sub="Three structured tiers designed to match every hospital's ambition and scale"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"22px"}}>
            {TIERS.map(({icon,label,price,color,bg,border,badge,features})=>(
              <div key={label} className="tier-card" style={{background:bg,border:`2px solid ${border}`,borderRadius:"16px",padding:"28px 22px",position:"relative",boxShadow:"0 2px 12px rgba(11,31,58,.06)"}}>
                {badge&&<span style={{position:"absolute",top:"-11px",left:"50%",transform:"translateX(-50%)",background:color,color:"#fff",fontSize:"10px",fontWeight:"700",padding:"3px 14px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{badge}</span>}
                <div style={{fontSize:"26px",marginBottom:"11px"}}>{icon}</div>
                <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 5px"}}>{label}</h3>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"700",color:color,margin:"0 0 16px"}}>{price}</p>
                <ul style={{paddingLeft:0,listStyle:"none",marginBottom:"20px",display:"flex",flexDirection:"column",gap:"8px"}}>
                  {features.map(f=><li key={f} style={{display:"flex",gap:"7px",alignItems:"flex-start",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#475569",fontWeight:"300"}}><span style={{color,marginTop:"1px",fontWeight:"700",flexShrink:0}}>✓</span>{f}</li>)}
                </ul>
                <Link to="/partner-with-us" style={{display:"block",textAlign:"center",padding:"11px",background:color,color:"#fff",borderRadius:"9px",fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px"}}>Apply Now →</Link>
              </div>
            ))}
          </div>
        </W>
      </section>
      {/* CTA */}
      <section style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"64px 24px",textAlign:"center"}}>
        <div style={{maxWidth:"540px",margin:"0 auto"}}>
          <h2 style={{fontSize:"clamp(26px,4vw,44px)",fontWeight:"700",color:"#fff",margin:"0 0 14px"}}>Ready to Experience Better Healthcare?</h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"16px",color:"rgba(255,255,255,.68)",marginBottom:"30px",lineHeight:1.7,fontWeight:"300"}}>Whether you need a specialist, a home visit, or hospital guidance — we are here to help.</p>
          <div style={{display:"flex",gap:"13px",justifyContent:"center",flexWrap:"wrap"}}>
            <Link to="/login" className="btn-p">Book Appointment →</Link>
            <Link to="/contact" className="btn-ol">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
