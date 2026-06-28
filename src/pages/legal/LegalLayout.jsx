import { Link } from "react-router-dom";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.legal{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}
.legal *{box-sizing:border-box;}.legal a{color:#047857;}
.legal h1,.legal h2,.legal h3{font-family:'Cormorant Garamond',Georgia,serif;color:#0b1f3a;}
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
      <section style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",
        padding:"44px 0 56px"}}>
        <W>
          <div style={{display:"flex",gap:"8px",alignItems:"center",marginBottom:"16px"}}>
            <Link to="/" style={{color:"rgba(255,255,255,.5)",fontSize:"13px"}}>Home</Link>
            <span style={{color:"rgba(255,255,255,.25)"}}>/</span>
            <span style={{color:"#6ee7b7",fontSize:"13px"}}>{title}</span>
          </div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4vw,42px)",
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
