import { useEffect, useState } from "react";
import { useRoleBooking, RoleModal } from "../../components/RoleModal";
import { Link } from "react-router-dom";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.bl{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}
.bl *{box-sizing:border-box;} .bl a{text-decoration:none;}
.bl h1,.bl h2,.bl h3{font-family:'Cormorant Garamond',Georgia,serif;}
.bl-card{background:#fff;border:1px solid #e2eaf4;border-radius:16px;overflow:hidden;
  box-shadow:var(--sh-sm);transition:transform .2s,box-shadow .2s;display:flex;flex-direction:column;}
.bl-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(11,31,58,.12);}
`;
const W=({children,s={}})=><div style={{maxWidth:"1200px",margin:"0 auto",padding:"0 24px",...s}}>{children}</div>;

export default function Blog(){
  const { showModal, handleBookingClick, closeModal, role, navigate } = useRoleBooking();
  const [posts, setPosts]     = useState(null); // null = loading
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const PAGE_SIZE = 12;

  useEffect(()=>{window.scrollTo(0,0);},[]);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/blog/posts?page=${page}&page_size=${PAGE_SIZE}`);
        const json = await res.json();
        setPosts(json.posts || []);
        setTotal(json.total || 0);
      } catch { setPosts([]); }
    })();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return(
    <div className="bl">
      <style>{G}</style>
      <SEO title="Blog" path="/blog"
        description="Health tips, platform updates, and articles from We Care 4 'all'."
        jsonLd={{ "@type":"Blog", "name":"We Care 4 'all' Blog",
          "description":"Health tips, platform updates, and articles from We Care 4 'all'." }} />
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
          {posts === null ? (
            <div style={{textAlign:"center",padding:"60px 0",color:"#6b7688",
              fontFamily:"'DM Sans',sans-serif"}}>Loading articles…</div>
          ) : posts.length === 0 ? (
            <div style={{textAlign:"center",padding:"60px 0"}}>
              <div style={{fontSize:"40px",marginBottom:"12px"}}>📝</div>
              <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"6px"}}>
                No articles published yet
              </h3>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b"}}>
                Check back soon — we're working on our first posts.
              </p>
            </div>
          ) : (
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"22px",marginBottom:"36px"}}>
                {posts.map(p => (
                  <Link key={p.id} to={`/blog/${p.slug}`} className="bl-card">
                    {p.cover_image_url ? (
                      <img src={p.cover_image_url} alt={p.title} loading="lazy"
                        style={{width:"100%",height:"170px",objectFit:"cover"}}/>
                    ) : (
                      <div style={{width:"100%",height:"170px",background:"linear-gradient(135deg,#f0fdf4,#eff8ff)",
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:"36px"}}>📄</div>
                    )}
                    <div style={{padding:"18px 20px",flex:1,display:"flex",flexDirection:"column"}}>
                      {p.published_at && (
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                          color:"#047857",fontWeight:"600",marginBottom:"6px"}}>
                          {new Date(p.published_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}
                        </span>
                      )}
                      <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",
                        margin:"0 0 8px",lineHeight:"1.35"}}>{p.title}</h3>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
                        lineHeight:"1.6",margin:"0 0 12px",flex:1,
                        display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                        {p.excerpt}
                      </p>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                        fontWeight:"700",color:"#047857"}}>Read more →</span>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div style={{display:"flex",justifyContent:"center",gap:"10px"}}>
                  <button disabled={page<=1} onClick={()=>{setPage(p=>p-1);window.scrollTo(0,0);}}
                    style={{padding:"9px 18px",borderRadius:"8px",border:"1px solid #e2eaf4",
                      background:"#fff",color:"#374151",fontFamily:"'DM Sans',sans-serif",
                      fontWeight:"600",fontSize:"13px",cursor:page<=1?"default":"pointer",
                      opacity:page<=1?0.5:1}}>← Previous</button>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color:"#64748b",alignSelf:"center"}}>Page {page} of {totalPages}</span>
                  <button disabled={page>=totalPages} onClick={()=>{setPage(p=>p+1);window.scrollTo(0,0);}}
                    style={{padding:"9px 18px",borderRadius:"8px",border:"1px solid #e2eaf4",
                      background:"#fff",color:"#374151",fontFamily:"'DM Sans',sans-serif",
                      fontWeight:"600",fontSize:"13px",cursor:page>=totalPages?"default":"pointer",
                      opacity:page>=totalPages?0.5:1}}>Next →</button>
                </div>
              )}
            </>
          )}
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
