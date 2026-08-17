import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "../components/SEO";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f6fc",padding:"24px"}}>
      <SEO title={t("notFoundPage.title")} noindex />
      <div style={{textAlign:"center",maxWidth:"420px"}}>
        <p style={{fontFamily:"'Manrope',sans-serif",fontSize:"100px",fontWeight:"700",color:"var(--wc-green)",lineHeight:1,margin:"0 0 12px"}}>404</p>
        <h1 style={{fontFamily:"'Manrope',sans-serif",fontSize:"28px",fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 12px"}}>{t("notFoundPage.title")}</h1>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",color:"var(--wc-muted)",margin:"0 0 30px",lineHeight:1.6}}>{t("notFoundPage.subtitle")}</p>
        <Link to="/" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"15px",padding:"13px 28px",borderRadius:"8px",textDecoration:"none",boxShadow:"0 4px 16px rgba(91,158,50,.35)"}}>{t("notFoundPage.backToHome")}</Link>
      </div>
    </div>
  );
}
