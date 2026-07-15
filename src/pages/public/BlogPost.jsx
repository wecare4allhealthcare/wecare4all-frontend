import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useRoleBooking, RoleModal } from "../../components/RoleModal";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.blp{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}
.blp *{box-sizing:border-box;} .blp a{text-decoration:none;}
.blp h1,.blp h2,.blp h3{font-family:'Cormorant Garamond',Georgia,serif;}
.blp-body{font-family:'DM Sans',sans-serif;font-size:16px;line-height:1.85;color:#334155;}
.blp-body h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:26px;color:#0b1f3a;margin:32px 0 12px;}
.blp-body h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:21px;color:#0b1f3a;margin:24px 0 10px;}
.blp-body p{margin:0 0 16px;}
.blp-body ul,.blp-body ol{margin:0 0 16px;padding-left:22px;}
.blp-body li{margin-bottom:6px;}
.blp-body img{max-width:100%;border-radius:10px;margin:16px 0;}
.blp-body a{color:#047857;text-decoration:underline;}
`;
const W=({children,s={}})=><div style={{maxWidth:"760px",margin:"0 auto",padding:"0 24px",...s}}>{children}</div>;

export default function BlogPost(){
  const { slug } = useParams();
  const { showModal, handleBookingClick, closeModal, role, navigate } = useRoleBooking();
  const [post, setPost] = useState(null);   // null = loading, false = not found
  const [related, setRelated] = useState([]);

  useEffect(()=>{window.scrollTo(0,0);},[slug]);

  useEffect(() => {
    (async () => {
      setPost(null);
      try {
        const res = await fetch(`${API}/blog/posts/${slug}`);
        if (!res.ok) { setPost(false); return; }
        const json = await res.json();
        setPost(json.post);

        // Best-effort "more articles" strip — quietly skipped on failure,
        // the post itself is the important part of this page.
        const listRes = await fetch(`${API}/blog/posts?page=1&page_size=4`);
        if (listRes.ok) {
          const listJson = await listRes.json();
          setRelated((listJson.posts || []).filter(p => p.slug !== slug).slice(0, 3));
        }
      } catch { setPost(false); }
    })();
  }, [slug]);

  if (post === null) {
    return (
      <div className="blp"><style>{G}</style>
        <div style={{padding:"120px 24px",textAlign:"center",color:"#6b7688",
          fontFamily:"'DM Sans',sans-serif"}}>Loading article…</div>
      </div>
    );
  }

  if (post === false) {
    return (
      <div className="blp"><style>{G}</style>
        <SEO title="Article Not Found" path={`/blog/${slug}`} noindex/>
        <div style={{padding:"100px 24px",textAlign:"center"}}>
          <div style={{fontSize:"40px",marginBottom:"12px"}}>🔍</div>
          <h1 style={{fontSize:"24px",fontWeight:"700",color:"#0b1f3a",marginBottom:"10px"}}>
            Article Not Found
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",color:"#64748b",marginBottom:"22px"}}>
            This article may have been moved or unpublished.
          </p>
          <Link to="/blog" style={{padding:"11px 24px",borderRadius:"9px",
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px"}}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})
    : "";

  return (
    <div className="blp">
      <style>{G}</style>
      <SEO
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.cover_image_url}
        type="article"
        jsonLd={{
          "@type": "Article",
          "headline": post.title,
          "description": post.excerpt,
          "image": post.cover_image_url || undefined,
          "author": { "@type": "Organization", "name": post.author_name },
          "datePublished": post.published_at,
          "dateModified": post.updated_at,
          "publisher": { "@type": "Organization", "name": "We Care 4 'all'" },
        }}
      />

      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",paddingTop:"40px"}}>
        <W s={{padding:"40px 24px 60px"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"20px",flexWrap:"wrap"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Home</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <Link to="/blog" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Blog</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"#6ee7b7",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"200px"}}>{post.title}</span>
          </div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4.5vw,44px)",
            fontWeight:"700",color:"#fff",lineHeight:"1.2",marginBottom:"16px"}}>
            {post.title}
          </h1>
          <div style={{display:"flex",gap:"14px",flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"rgba(255,255,255,.65)"}}>
              {post.author_name}
            </span>
            {publishedDate && <>
              <span style={{color:"rgba(255,255,255,.3)"}}>·</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"rgba(255,255,255,.65)"}}>
                {publishedDate}
              </span>
            </>}
          </div>
        </W>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{display:"block",width:"100%",marginBottom:"-2px"}}>
          <path d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z" fill="#f0f6fc"/>
        </svg>
      </section>

      <section style={{background:"#f0f6fc",padding:"50px 0 70px"}}>
        <W>
          {post.cover_image_url && (
            <img src={post.cover_image_url} alt={post.title}
              style={{width:"100%",maxHeight:"420px",objectFit:"cover",borderRadius:"16px",marginBottom:"30px"}}/>
          )}
          <div className="blp-body" dangerouslySetInnerHTML={{ __html: post.content_html || "" }}/>

          {post.tags?.length > 0 && (
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginTop:"30px"}}>
              {post.tags.map(tag => (
                <span key={tag} style={{background:"#f0fdf4",color:"#047857",fontSize:"12px",
                  fontWeight:"600",padding:"5px 12px",borderRadius:"50px",
                  fontFamily:"'DM Sans',sans-serif"}}>#{tag}</span>
              ))}
            </div>
          )}
        </W>
      </section>

      {related.length > 0 && (
        <section style={{background:"#fff",padding:"50px 0 70px",borderTop:"1px solid #e2eaf4"}}>
          <div style={{maxWidth:"1000px",margin:"0 auto",padding:"0 24px"}}>
            <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",marginBottom:"20px"}}>
              More Articles
            </h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"18px"}}>
              {related.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} style={{background:"#f8fafc",
                  border:"1px solid #e2eaf4",borderRadius:"12px",padding:"16px",display:"block"}}>
                  <h3 style={{fontSize:"15px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 6px"}}>{p.title}</h3>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                    fontWeight:"700",color:"#047857"}}>Read →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
