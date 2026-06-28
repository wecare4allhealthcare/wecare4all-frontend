import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// patientOnly: true  → patient dashboard; non-patient logged in → alert+login; guest → login
// public: true        → everyone can access directly
const COLS = [
  { title:"Services", links:[
    {to:"/doctors",            label:"Video Consultation",  patientOnly:true },
    {to:"/home-healthcare",    label:"Home Healthcare",     patientOnly:true },
    {to:"/healthcare-provider",label:"Hospital Consultancy",public:true      },
    {to:"/partner-with-us",    label:"Hospital Partnership",public:true      },
    {to:"/healthcare-provider",label:"International Patients",public:true    },
    {to:"/healthcare-provider",label:"Corporate Health",    public:true      },
  ]},
  { title:"Company", links:[
    {to:"/about",         label:"About Us",       public:true },
    {to:"/about",         label:"Our Founder",    public:true },
    {to:"/blog",          label:"Blog",           public:true },
    {to:"/partner-with-us",label:"Partner With Us",public:true},
    {to:"/contact",       label:"Contact Us",     public:true },
  ]},
  { title:"Legal", links:[
    {to:"/terms",   label:"Terms & Conditions", public:true },
    {to:"/privacy", label:"Privacy Policy",     public:true },
    {to:"/rights",  label:"Patient Rights",     public:true },
    {to:"/contact", label:"Feedback",           public:true },
  ]},
];


function FooterRoleModal({ role, onLogin, onCancel }) {
  if (!role) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",
      alignItems:"center",justifyContent:"center",padding:"20px",
      background:"rgba(11,31,58,.55)",backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:"20px",padding:"32px 28px",
        maxWidth:"400px",width:"100%",
        boxShadow:"0 24px 60px rgba(11,31,58,.25)",
        animation:"modalIn .22s ease"}}>
        <style>{"@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}"}</style>
        <div style={{width:"52px",height:"52px",borderRadius:"14px",
          background:"#fff7ed",border:"1.5px solid #fed7aa",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"24px",marginBottom:"16px"}}>⚠️</div>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
          fontWeight:"700",color:"#0b1f3a",margin:"0 0 8px"}}>
          Wrong Account Type
        </h3>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
          color:"#64748b",margin:"0 0 24px",lineHeight:"1.6"}}>
          You are currently logged in as a{" "}
          <strong style={{color:"#0b1f3a",textTransform:"capitalize"}}>{role}</strong>.
          Please log in with a <strong style={{color:"#047857"}}>patient account</strong>{" "}
          to access this.
        </p>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={onCancel}
            style={{flex:1,padding:"11px 0",borderRadius:"10px",
              border:"1.5px solid #e2eaf4",background:"#f8fafc",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
              fontSize:"14px",color:"#64748b",cursor:"pointer"}}>
            Cancel
          </button>
          <button onClick={onLogin}
            style={{flex:1,padding:"11px 0",borderRadius:"10px",border:"none",
              background:"linear-gradient(135deg,#047857,#059669)",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
              fontSize:"14px",color:"#fff",cursor:"pointer",
              boxShadow:"0 4px 14px rgba(4,120,87,.3)"}}>
            Login as Patient →
          </button>
        </div>
      </div>
    </div>
  );
}

// Smart footer link — respects role-based access
function FooterLink({ to, label, patientOnly, public: isPublic }) {
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e) => {
    if (isPublic) { navigate(to); return; }
    if (!isLoggedIn) { e.preventDefault(); navigate("/login"); return; }
    if (role === "admin") { navigate(to); return; }
    if (role === "patient") { navigate("/patient/dashboard"); return; }
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      <Link to={to} className="ft-link" onClick={handleClick}>
        <span style={{color:"rgba(52,211,153,.4)",fontSize:"10px"}}>▸</span>{label}
      </Link>
      {showModal && (
        <FooterRoleModal
          role={role}
          onLogin={() => { setShowModal(false); navigate("/login"); }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
}

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
              {[["📞","90257 86467","tel:+919025786467"],["✉️","wecare4allchennai@gmail.com","mailto:wecare4allchennai@gmail.com"],["📍","Blk K, No.31, Kanchi Colony, T.Nagar, Chennai 600017",null]].map(([ic,txt,href])=>(
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
              <a href="https://www.whatsapp.com/channel/0029VaA5EpiLSmbiUlUFYj02"
                target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp" className="ft-social"
                title="WhatsApp Channel">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.122 1.522 5.855L.057 23.882l6.197-1.624A11.93 11.93 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.002-1.368l-.358-.213-3.718.975.993-3.617-.234-.371A9.78 9.78 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/chennaihomehealth?mibextid=ZbWKwL"
                target="_blank" rel="noopener noreferrer"
                aria-label="Facebook" className="ft-social"
                title="Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@wecare4all2009"
                target="_blank" rel="noopener noreferrer"
                aria-label="YouTube" className="ft-social"
                title="YouTube">
                <svg width="16" height="12" viewBox="0 0 24 17" fill="currentColor">
                  <path d="M23.495 2.205a3.02 3.02 0 0 0-2.122-2.136C19.505 0 12 0 12 0S4.495 0 2.627.069a3.02 3.02 0 0 0-2.122 2.136C0 4.069 0 8.507 0 8.507s0 4.438.505 6.302a3.02 3.02 0 0 0 2.122 2.136C4.495 17 12 17 12 17s7.505 0 9.373-.054a3.02 3.02 0 0 0 2.122-2.137C24 12.945 24 8.507 24 8.507s0-4.438-.505-6.302zM9.545 12.143V4.87l6.273 3.637-6.273 3.636z"/>
                </svg>
              </a>
            </div>
          </div>
          {/* Link columns */}
          {COLS.map(({title,links})=>(
            <div key={title}>
              <p style={{fontSize:"11px",fontWeight:"700",color:"#34d399",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"16px"}}>{title}</p>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {links.map(({to,label,patientOnly,public:pub})=>(
                  <FooterLink key={label} to={to} label={label} patientOnly={patientOnly} public={pub} />
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
