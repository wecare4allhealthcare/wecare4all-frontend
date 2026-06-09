import { Link } from "react-router-dom";
const COLS = [
  { title:"Services", links:[
    {to:"/login",label:"Video Consultation"},{to:"/login",label:"Home Healthcare"},
    {to:"/healthcare-provider",label:"Hospital Consultancy"},{to:"/partner-with-us",label:"Hospital Partnership"},
    {to:"/login",label:"International Patients"},{to:"/login",label:"Corporate Health"},
  ]},
  { title:"Company", links:[
    {to:"/about",label:"About Us"},{to:"/about",label:"Our Founder"},{to:"/blog",label:"Blog"},
    {to:"/partner-with-us",label:"Partner With Us"},{to:"/contact",label:"Contact Us"},
  ]},
  { title:"Legal", links:[
    {to:"/terms",label:"Terms & Conditions"},{to:"/privacy",label:"Privacy Policy"},
    {to:"/rights",label:"Patient Rights"},{to:"/contact",label:"Feedback"},
  ]},
];
const CSS = `
.ft{background:#071524;font-family:'DM Sans',sans-serif;}
.ft *{box-sizing:border-box;}
.ft-link{color:rgba(255,255,255,.52);font-size:13px;text-decoration:none;display:flex;align-items:center;gap:6px;transition:color .2s;}
.ft-link:hover{color:#34d399;}
.ft-social{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.55);font-size:11px;font-weight:700;text-decoration:none;transition:all .2s;}
.ft-social:hover{background:rgba(52,211,153,.15);border-color:#34d399;color:#34d399;}
@media(max-width:900px){.ft-grid{grid-template-columns:1fr 1fr!important;}}
@media(max-width:540px){.ft-grid{grid-template-columns:1fr!important;}.ft-bottom{flex-direction:column!important;text-align:center;}}
`;
export default function Footer() {
  const yr = new Date().getFullYear();
  return (
    <footer className="ft">
      <style>{CSS}</style>
      <div style={{maxWidth:"1200px",margin:"0 auto",padding:"52px 24px 36px"}}>
        <div className="ft-grid" style={{display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr 1fr",gap:"40px"}}>
          {/* Brand */}
          <div>
            <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"10px",textDecoration:"none",marginBottom:"16px"}}>
              <img src="/assets/img/logo/final.png" alt="We Care 4 All" style={{height:"34px",width:"auto"}} onError={e=>{e.target.style.display="none";}}/>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",fontWeight:"700",color:"#fff"}}>
                We Care 4 <span style={{color:"#34d399"}}>'all'</span>
              </span>
            </Link>
            <p style={{fontSize:"13px",color:"rgba(255,255,255,.50)",lineHeight:"1.78",maxWidth:"250px",fontWeight:"300",marginBottom:"20px"}}>
              A trusted healthcare consultancy connecting patients with verified specialists, partner hospitals and home healthcare services across India.
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:"9px",marginBottom:"20px"}}>
              {[["📞","90257 86467","tel:+919025786467"],["✉️","info@wecare4all.com","mailto:info@wecare4all.com"],["📍","T.Nagar, Chennai 600017",null]].map(([ic,txt,href])=>(
                <div key={txt} style={{display:"flex",alignItems:"center",gap:"9px"}}>
                  <span style={{fontSize:"13px",width:"18px",flexShrink:0}}>{ic}</span>
                  {href
                    ? <a href={href} className="ft-link">{txt}</a>
                    : <span style={{color:"rgba(255,255,255,.50)",fontSize:"13px"}}>{txt}</span>
                  }
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:"7px"}}>
              {[["in","LinkedIn"],["f","Facebook"],["tw","Twitter"],["yt","YouTube"]].map(([ic,lbl])=>(
                <a key={lbl} href="#" aria-label={lbl} className="ft-social">{ic}</a>
              ))}
            </div>
          </div>
          {/* Link columns */}
          {COLS.map(({title,links})=>(
            <div key={title}>
              <p style={{fontSize:"11px",fontWeight:"700",color:"#34d399",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"16px"}}>{title}</p>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {links.map(({to,label})=>(
                  <Link key={label} to={to} className="ft-link">
                    <span style={{color:"rgba(52,211,153,.4)",fontSize:"10px"}}>▸</span>{label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div style={{margin:"36px 0 0",padding:"22px 24px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"18px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
            {/* Euro Cert logo — place euro_cert.png in /public/assets/img/logo/ */}
            <div style={{width:"64px",height:"64px",background:"#fff",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,padding:"4px",boxShadow:"0 2px 12px rgba(255,255,255,.12)"}}>
              <img src="/assets/img/logo/euro_cert.png"
                alt="Euro Cert"
                style={{width:"56px",height:"56px",objectFit:"contain"}}
                onError={e=>{
                  /* fallback to jpeg */
                  e.target.src="/assets/img/logo/euro_logo.jpeg";
                  e.target.onerror=ex=>{ex.target.parentElement.innerHTML=`<span style="font-size:10px;font-weight:800;color:#0b1f3a;text-align:center;line-height:1.3">EURO<br/>CERT</span>`;};
                }}/>
            </div>
            <div>
              <p style={{color:"#fff",fontSize:"13px",fontWeight:"700",margin:0}}>Euro Cert International Certified</p>
              <p style={{color:"#34d399",fontSize:"12px",margin:"2px 0 0"}}>✓ Quality Management System — Verified Annually</p>
            </div>
          </div>
          <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
            {["🔒 Secure & Encrypted","👨‍⚕️ Verified Doctors","🏥 Accredited Partners","⚡ 24×7 Support"].map(b=>(
              <span key={b} style={{fontSize:"12px",color:"rgba(255,255,255,.50)"}}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{borderTop:"1px solid rgba(255,255,255,.07)"}}>
        <div className="ft-bottom" style={{maxWidth:"1200px",margin:"0 auto",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px"}}>
          <p style={{fontSize:"12px",color:"rgba(255,255,255,.32)"}}>© {yr} We Care 4 'all' · All Rights Reserved · Chennai, India</p>
          <p style={{fontSize:"12px",color:"rgba(255,255,255,.22)"}}>Medical advice on this platform does not replace in-person clinical consultation.</p>
        </div>
      </div>
    </footer>
  );
}
