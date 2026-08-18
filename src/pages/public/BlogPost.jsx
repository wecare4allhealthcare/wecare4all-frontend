import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import { useRoleBooking, RoleModal } from "../../components/RoleModal";
import SEO from "../../components/SEO";
import { BLOG_DEFAULT_KEYWORDS } from "../../constants/seoKeywords";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G=`
.blp{font-family:'Inter',sans-serif;color:#1e293b;overflow-x:hidden;}
.blp *{box-sizing:border-box;} .blp a{text-decoration:none;}
.blp h1,.blp h2,.blp h3{font-family:'Manrope',sans-serif;}
.blp-body{font-family:'Inter',sans-serif;font-size:16px;line-height:1.85;color:#334155;}
.blp-body h2{font-family:'Manrope',sans-serif;font-size:26px;color:var(--wc-navy);margin:32px 0 12px;}
.blp-body h3{font-family:'Manrope',sans-serif;font-size:21px;color:var(--wc-navy);margin:24px 0 10px;}
.blp-body p{margin:0 0 16px;}
.blp-body ul,.blp-body ol{margin:0 0 16px;padding-left:22px;}
.blp-body li{margin-bottom:6px;}
.blp-body img{max-width:100%;border-radius:10px;margin:16px 0;}
.blp-body a{color:var(--wc-green);text-decoration:underline;}
`;
const W=({children,s={}})=><div style={{maxWidth:"760px",margin:"0 auto",padding:"0 24px",...s}}>{children}</div>;

export default function BlogPost(){
  const { t } = useTranslation();
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
          fontFamily:"'Inter',sans-serif"}}>{t("blogPage.loadingArticle")}</div>
      </div>
    );
  }

  if (post === false) {
    return (
      <div className="blp"><style>{G}</style>
        <SEO title="Article Not Found" path={`/blog/${slug}`} noindex/>
        <div style={{padding:"100px 24px",textAlign:"center"}}>
          <div style={{fontSize:"40px",marginBottom:"12px"}}>🔍</div>
          <h1 style={{fontSize:"24px",fontWeight:"700",color:"var(--wc-navy)",marginBottom:"10px"}}>
            {t("blogPage.notFoundTitle")}
          </h1>
          <p style={{fontFamily:"'Inter',sans-serif",color:"var(--wc-muted)",marginBottom:"22px"}}>
            {t("blogPage.notFoundSub")}
          </p>
          <Link to="/blog" style={{padding:"11px 24px",borderRadius:"9px",
            background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
            fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"14px"}}>
            {t("blogPage.backToBlog")}
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
        keywords={post.meta_keywords || BLOG_DEFAULT_KEYWORDS}
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

      <section style={{background:"linear-gradient(135deg,var(--wc-navy-deepest),var(--wc-navy) 60%,var(--wc-navy-deep))",paddingTop:"40px"}}>
        <W s={{padding:"40px 24px 60px"}}>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"20px",flexWrap:"wrap"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'Inter',sans-serif"}}>{t("nav.home")}</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <Link to="/blog" style={{color:"rgba(255,255,255,.5)",fontSize:"13px",fontFamily:"'Inter',sans-serif"}}>{t("nav.blog")}</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"var(--wc-green-pale)",fontSize:"13px",fontFamily:"'Inter',sans-serif",
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"200px"}}>{post.title}</span>
          </div>
          <h1 style={{fontFamily:"'Manrope',sans-serif",fontSize:"clamp(28px,4.5vw,44px)",
            fontWeight:"700",color:"#fff",lineHeight:"1.2",marginBottom:"16px"}}>
            {post.title}
          </h1>
          <div style={{display:"flex",gap:"14px",flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontFamily:"'Inter',sans-serif",fontSize:"13.5px",color:"rgba(255,255,255,.65)"}}>
              {post.author_name}
            </span>
            {publishedDate && <>
              <span style={{color:"rgba(255,255,255,.3)"}}>·</span>
              <span style={{fontFamily:"'Inter',sans-serif",fontSize:"13.5px",color:"rgba(255,255,255,.65)"}}>
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
          <div className="blp-body" dangerouslySetInnerHTML={{
            // Blog content is admin-authored HTML stored as-is in the DB
            // (see admin_create_post / admin_update_post in blog.py) with
            // no server-side sanitization — sanitizing here, right before
            // render, is what actually stops a compromised admin account
            // or a bad Blogger-import from becoming a stored-XSS hole for
            // every visitor to this public page.
            __html: DOMPurify.sanitize(post.content_html || ""),
          }}/>

          {post.tags?.length > 0 && (
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginTop:"30px"}}>
              {post.tags.map(tag => (
                <span key={tag} style={{background:"var(--wc-sage)",color:"var(--wc-green)",fontSize:"12px",
                  fontWeight:"600",padding:"5px 12px",borderRadius:"50px",
                  fontFamily:"'Inter',sans-serif"}}>#{tag}</span>
              ))}
            </div>
          )}
        </W>
      </section>

      {related.length > 0 && (
        <section style={{background:"#fff",padding:"50px 0 70px",borderTop:"1px solid var(--wc-border)"}}>
          <div style={{maxWidth:"1000px",margin:"0 auto",padding:"0 24px"}}>
            <h2 style={{fontSize:"22px",fontWeight:"700",color:"var(--wc-navy)",marginBottom:"20px"}}>
              {t("blogPage.moreArticles")}
            </h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(240px,100%),1fr))",gap:"18px"}}>
              {related.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} style={{background:"var(--wc-warm-white)",
                  border:"1px solid var(--wc-border)",borderRadius:"12px",padding:"16px",display:"block"}}>
                  <h3 style={{fontSize:"15px",fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 6px"}}>{p.title}</h3>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",
                    fontWeight:"700",color:"var(--wc-green)"}}>{t("blogPage.readArrow")}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{background:"linear-gradient(135deg,var(--wc-navy),var(--wc-navy-mid))",padding:"52px 24px"}}>
        <div style={{maxWidth:"640px",margin:"0 auto",textAlign:"center"}}>
          <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"28px",fontWeight:"700",color:"#fff",margin:"0 0 10px"}}>{t("blogPage.ctaTitle")}</h3>
          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",color:"rgba(255,255,255,.65)",marginBottom:"24px"}}>{t("blogPage.ctaSub")}</p>
          <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
            <><button onClick={handleBookingClick} style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"15px",padding:"13px 28px",borderRadius:"8px",border:"none",cursor:"pointer"}}>{t("blogPage.bookConsultation")}</button><RoleModal show={showModal} role={role} onLogin={()=>{closeModal();navigate("/login");}} onCancel={closeModal}/></>
            <Link to="/contact" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"transparent",border:"1.5px solid rgba(255,255,255,.30)",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:"500",fontSize:"15px",padding:"13px 26px",borderRadius:"8px",textDecoration:"none"}}>{t("blogPage.contactUs")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
