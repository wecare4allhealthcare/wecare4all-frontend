import { Link } from "react-router-dom";

const G = `
.legal{font-family:'Inter',sans-serif;color:#1e293b;overflow-x:hidden;}
.legal *{box-sizing:border-box;}.legal a{color:var(--wc-green);}
.legal h1,.legal h2,.legal h3{font-family:'Manrope',sans-serif;color:var(--wc-navy);}
.legal h2{font-size:22px;font-weight:700;margin:36px 0 12px;}
.legal h3{font-size:17px;font-weight:700;margin:22px 0 8px;}
.legal p,.legal li{font-size:14.5px;line-height:1.85;color:#475569;font-weight:300;}
.legal ul,.legal ol{padding-left:22px;margin:10px 0;}
.legal li{margin-bottom:6px;}
.legal strong{color:#1e293b;font-weight:600;}
`;

const W = ({children}) => <div style={{maxWidth:"760px",margin:"0 auto",padding:"0 24px"}}>{children}</div>;

export default function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div className="legal">
      <style>{G}</style>
      <section style={{background:"linear-gradient(135deg,var(--wc-navy-deepest),var(--wc-navy) 60%,var(--wc-navy-deep))",
        padding:"44px 0 56px"}}>
        <W>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"16px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px"}}>Home</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"var(--wc-green-pale)",fontSize:"13px"}}>{title}</span>
          </div>
          <h1 style={{fontFamily:"'Manrope',sans-serif",fontSize:"clamp(28px,4vw,42px)",
            fontWeight:"700",color:"#fff",margin:"0 0 8px"}}>{title}</h1>
          <p style={{color:"rgba(255,255,255,.55)",fontSize:"13px"}}>Last updated: {lastUpdated}</p>
        </W>
      </section>
      <section style={{padding:"48px 0 80px",background:"#fff"}}>
        <W>{children}</W>
      </section>
    </div>
  );
}
