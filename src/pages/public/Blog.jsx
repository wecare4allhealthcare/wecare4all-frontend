import { useEffect } from "react";
import { useRoleBooking, RoleModal } from "../../components/RoleModal";
import { Link } from "react-router-dom";
import SEO from "../../components/SEO";
const G=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.bl{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}
.bl *{box-sizing:border-box;} .bl a{text-decoration:none;}
.bl h1,.bl h2,.bl h3{font-family:'Cormorant Garamond',Georgia,serif;}
.commonninja_component{width:100%!important;}
`;
const W=({children,s={}})=><div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 24px",...s}}>{children}</div>;
export default function Blog(){
  const { showModal, handleBookingClick, closeModal, role, navigate } = useRoleBooking();
  useEffect(()=>{window.scrollTo(0,0);},[]);
  return(
    <div className="bl">
      <style>{G}</style>
      <SEO title="Blog" path="/blog"
        description="Health tips, platform updates, and articles from We Care 4 'all'." />
      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",paddingTop:"40px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"36px 36px",pointerEvents:"none"}}/>
        <W s={{padding:"52px 24px 80px"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"20px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Home</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"#6ee7b7",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Blog</span>
          </div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#6ee7b7",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"14px"}}>Healthcare Insights</p>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,58px)",fontWeight:"700",color:"#fff",lineHeight:"1.1",marginBottom:"14px"}}>
            Latest Articles &<br/><span style={{color:"#34d399"}}>Health Guides.</span>
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"17px",color:"rgba(255,255,255,.68)",lineHeight:"1.78",maxWidth:"490px",fontWeight:"300"}}>
            Expert insights on healthcare, hospital management, patient care and medical tourism.
          </p>
        </W>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{display:"block",width:"100%",marginBottom:"-2px"}}>
          <path d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z" fill="#f0f6fc"/>
        </svg>
      </section>
      <section style={{background:"#f0f6fc",padding:"60px 0 80px"}}>
        <W>
          <div style={{minHeight:"400px"}}>
            {/* CommonNinja Blog Widget */}
            <div className="commonninja_component pid-b301ce56-e66f-4ea3-8b22-abc819ea0d68"/>
          </div>
        </W>
      </section>
      <section style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"52px 24px"}}>
        <div style={{maxWidth:"640px",margin:"0 auto",textAlign:"center"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",fontWeight:"700",color:"#fff",margin:"0 0 10px"}}>Need Medical Advice?</h3>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"15px",color:"rgba(255,255,255,.65)",marginBottom:"24px"}}>Our specialists are available for video consultations and home visits.</p>
          <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
            <><button onClick={handleBookingClick} style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",padding:"13px 28px",borderRadius:"8px",border:"none",cursor:"pointer"}}>Book Consultation →</button><RoleModal show={showModal} role={role} onLogin={()=>{closeModal();navigate("/login");}} onCancel={closeModal}/></>
            <Link to="/contact" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"transparent",border:"1.5px solid rgba(255,255,255,.30)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"500",fontSize:"15px",padding:"13px 26px",borderRadius:"8px",textDecoration:"none"}}>Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
