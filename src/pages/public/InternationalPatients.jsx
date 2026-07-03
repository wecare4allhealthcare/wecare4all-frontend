import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../../components/SEO";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.ip{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}
.ip *{box-sizing:border-box;} .ip a{text-decoration:none;}
.ip h1,.ip h2,.ip h3{font-family:'Cormorant Garamond',Georgia,serif;}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease;}
.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(20px);transition:opacity .55s ease,transform .55s ease;}
.stagger.in>*{opacity:1;transform:translateY(0);}
.stagger.in>*:nth-child(1){transition-delay:.04s} .stagger.in>*:nth-child(2){transition-delay:.08s}
.stagger.in>*:nth-child(3){transition-delay:.12s} .stagger.in>*:nth-child(4){transition-delay:.16s}
.stagger.in>*:nth-child(5){transition-delay:.20s} .stagger.in>*:nth-child(6){transition-delay:.24s}
.stagger.in>*:nth-child(7){transition-delay:.28s} .stagger.in>*:nth-child(8){transition-delay:.32s}
.ip-card{transition:all .25s;} .ip-card:hover{transform:translateY(-4px);box-shadow:0 16px 36px rgba(11,31,58,.12)!important;}
.btn-p{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#047857,#059669);color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;padding:13px 28px;border-radius:8px;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(4,120,87,.40);transition:all .25s;text-decoration:none;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(4,120,87,.50);}
.btn-ol{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;font-size:15px;padding:12px 26px;border-radius:8px;border:1.5px solid rgba(255,255,255,.30);text-decoration:none;transition:all .25s;}
.btn-ol:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.55);}
.ip-table{width:100%;border-collapse:collapse;}
.ip-table th{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;color:#fff;background:#0b1f3a;text-align:left;padding:14px 16px;text-transform:uppercase;letter-spacing:.5px;}
.ip-table td{font-family:'DM Sans',sans-serif;font-size:14px;color:#334155;padding:14px 16px;border-bottom:1px solid #e2eaf4;}
.ip-table tr:nth-child(even) td{background:#f8fafc;}
.ip-table td:first-child{font-weight:600;color:#0b1f3a;}
@media(max-width:900px){
  .ip-g2{grid-template-columns:1fr!important;}
  .ip-g3{grid-template-columns:1fr 1fr!important;}
  .ip-table{font-size:12px;}
}
@media(max-width:600px){
  .ip-g3{grid-template-columns:1fr!important;}
  .ip-table th,.ip-table td{padding:10px 8px;font-size:12px;}
}
`;
const W = ({ children, s = {} }) => <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px", ...s }}>{children}</div>;

const Eyebrow = ({ children, c = "#047857" }) => (
  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px", fontWeight:"700", color:c,
    letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>{children}</p>
);

const WHY_INDIA = [
  "Internationally trained and experienced specialists",
  "Modern diagnostic and surgical technologies",
  "High clinical success rates across multiple specialties",
  "Significantly lower treatment costs compared to many countries",
  "Shorter waiting times for consultations and procedures",
  "English-speaking healthcare professionals and coordinators",
];

const COMPARISON = [
  ["Treatment Cost", "Substantially lower", "Significantly higher"],
  ["Waiting Period", "Minimal or no waiting", "Often prolonged"],
  ["Consultant Access", "Direct access to senior doctors", "Limited availability"],
  ["Care Model", "Personalized", "Protocol-driven"],
  ["Recovery Environment", "Supportive and holistic", "Primarily clinical"],
];

const VETTING = [
  { ic:"🏅", t:"EURO CERT Accreditation", d:"Our platform and empanelment process are EURO CERT accredited, reflecting independently reviewed quality and safety standards." },
  { ic:"📋", t:"Documented Credentialing", d:"Every partner hospital's specialists, infrastructure, and accreditations are verified and recorded before empanelment — not taken on their word." },
  { ic:"🔍", t:"Ongoing Monitoring", d:"Partnerships are reviewed periodically, not just at onboarding — standards need to hold up over time, not just on day one." },
  { ic:"🗂️", t:"Transparent Records", d:"Accreditation and specialty information for each partner hospital is available to you before you commit to treatment there." },
];

const OUR_ROLE = [
  "Act solely in the patient's interest",
  "Provide unbiased medical guidance",
  "Simplify complex healthcare decisions",
  "Ensure transparency across treatment planning and execution",
];

const CARE_MODEL = [
  "We do not operate as a hospital sales channel",
  "We are not driven by institutional occupancy or revenue targets",
  "Treatment recommendations are independent of commercial incentives",
];

const FEE_STRUCTURE = [
  "Our professional service fee is 25%, disclosed upfront",
  "The fee is collected directly from the patient",
  "Hospitals and specialists are paid only for medical services rendered",
  "No bundled referral costs or undisclosed markups",
];

const SERVICES = [
  { ic:"💻", t:"Online Consultation",     d:"Medical consultations and case evaluation before you travel" },
  { ic:"📋", t:"Treatment Planning",       d:"Personalized treatment planning and transparent cost estimation" },
  { ic:"🛂", t:"Medical Visa Guidance",    d:"Visa invitation letters and complete documentation support" },
  { ic:"🏥", t:"Hospital Assistance",      d:"Appointment scheduling and coordination with your chosen hospital" },
  { ic:"✈️", t:"Travel Support",           d:"Airport pickup and complete transportation support in India" },
  { ic:"🏨", t:"Accommodation",            d:"Stay arrangements for patients and accompanying attendants" },
  { ic:"🗣️", t:"Interpreter Support",      d:"Language assistance so nothing is lost between you and your care team" },
  { ic:"❤️", t:"Follow-Up Care",           d:"Ongoing treatment follow-up and coordination after you're discharged" },
];

const JOURNEY = [
  { n:"01", t:"Enquiry & Case Review",     d:"Share your medical reports with us. Our team reviews your case and connects you with the right specialist for an initial opinion." },
  { n:"02", t:"Treatment Plan & Estimate",  d:"Once the specialist confirms a plan, we prepare a transparent cost estimate covering treatment, stay, and our coordination fee." },
  { n:"03", t:"Visa & Travel Arrangements", d:"We issue your medical visa invitation letter and help you plan flights, so paperwork never holds up your care." },
  { n:"04", t:"Arrival & Admission",        d:"Airport pickup, interpreter, and accommodation are arranged before you land. We accompany you through hospital admission." },
  { n:"05", t:"Treatment & Recovery",       d:"Your treatment proceeds under the specialist's care, with our team coordinating logistics and checking in throughout." },
  { n:"06", t:"Departure & Follow-Up",      d:"Once you're cleared to travel, we help plan your return and stay connected for follow-up consultations from home." },
];

const FAQS = [
  { q:"How do I get a medical opinion before deciding to travel?",
    a:"Share your existing medical reports and scans with us online. We connect you with an appropriate specialist for a video consultation so you have clarity on your treatment plan before committing to travel." },
  { q:"Is the total cost disclosed before I travel?",
    a:"Yes. Once your treatment plan is confirmed, you receive a written estimate covering hospital charges and our coordination fee separately, so there's no ambiguity about what you're paying for." },
  { q:"Do you help with the medical visa?",
    a:"Yes — we issue the hospital invitation letter you'll need for your visa application and guide you through the documentation. The final visa approval is issued by Indian consular authorities." },
  { q:"Can a family member or attendant travel with me?",
    a:"Yes, accompanying attendants are common. We factor this into accommodation and travel planning, and attendant visas follow the same invitation-letter process." },
  { q:"What if my international insurance doesn't directly settle with the hospital?",
    a:"Many hospitals in our network work with cashless/reimbursement processes for select international insurers. Where direct settlement isn't possible, we help you prepare the documentation your insurer needs for reimbursement claims." },
  { q:"What happens if I need urgent transfer to a different hospital?",
    a:"For time-critical cases, we're empanelled with Air Ambulance services for medically supervised transfers — see Emergency Transfers below." },
  { q:"Do you provide interpreter support during hospital visits?",
    a:"Yes, language assistance is arranged for consultations and hospital stays so nothing is lost in communication with your care team." },
];

function FAQAccordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
      {items.map(({ q, a }, i) => {
        const isOpen = open === i;
        return (
          <div key={q} style={{ border:"1px solid #e2eaf4", borderRadius:"12px", overflow:"hidden",
            background: isOpen ? "#f8fafc" : "#fff" }}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
              gap:"12px", padding:"16px 20px", background:"transparent", border:"none", cursor:"pointer",
              textAlign:"left",
            }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14.5px", fontWeight:"600", color:"#0b1f3a" }}>{q}</span>
              <span style={{ flexShrink:0, color:"#047857", fontSize:"18px", fontWeight:"700",
                transform: isOpen ? "rotate(45deg)" : "none", transition:"transform .2s" }}>+</span>
            </button>
            {isOpen && (
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#64748b",
                lineHeight:"1.75", fontWeight:"300", margin:0, padding:"0 20px 18px" }}>{a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function InternationalPatients() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [r1, v1] = useScrollAnimation();
  const [r2, v2] = useScrollAnimation();
  const [r3, v3] = useScrollAnimation();

  return (
    <div className="ip">
      <style>{G}</style>
      <SEO title="International Patients" path="/international-patients"
        description="Medical tourism to India with We Care 4 'all' — treatment planning, medical visa guidance, hospital coordination, accommodation, travel and interpreter support, and follow-up care for international patients." />

      {/* Hero */}
      <section style={{ background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)", paddingTop:"40px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize:"36px 36px", pointerEvents:"none" }}/>
        <W s={{ padding:"52px 24px 80px" }}>
          <div style={{ display:"flex", gap:"8px", alignItems:"center", marginBottom:"20px" }}>
            <Link to="/" style={{ color:"rgba(255,255,255,.5)", fontSize:"13px", fontFamily:"'DM Sans',sans-serif" }}>Home</Link>
            <span style={{ color:"rgba(255,255,255,.25)" }}>/</span>
            <span style={{ color:"#6ee7b7", fontSize:"13px", fontFamily:"'DM Sans',sans-serif" }}>International Patients</span>
          </div>
          <Eyebrow c="#6ee7b7">Medical Tourism</Eyebrow>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(34px,5vw,58px)", fontWeight:"700", color:"#fff", lineHeight:"1.1", marginBottom:"16px" }}>
            Welcome to India<br/><span style={{ color:"#34d399" }}>The Healthcare Hub.</span>
          </h1>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"17px", color:"rgba(255,255,255,.68)", lineHeight:"1.78", maxWidth:"560px", fontWeight:"300", marginBottom:"30px" }}>
            We connect international patients with India's trusted healthcare ecosystem — the right
            treatment, at the right time, in the right place. From your first medical opinion to a safe
            return home, we manage the entire journey with transparency, clinical integrity, and empathy.
          </p>
          <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", marginBottom:"36px" }}>
            <Link to="/doctors" className="btn-p">Book a Consultation →</Link>
            <Link to="/contact" className="btn-ol">Contact Us</Link>
          </div>

          {/* Trust badges */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
            {[
              { icon:"🏅", label:"EURO CERT Accredited" },
              { icon:"🏥", label:"50+ Partner Hospitals" },
              { icon:"🗣️", label:"Multilingual Care Coordination" },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:"8px",
                padding:"9px 16px", background:"rgba(255,255,255,.06)",
                border:"1px solid rgba(255,255,255,.14)", borderRadius:"50px" }}>
                <span style={{ fontSize:"15px" }}>{icon}</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", fontWeight:"600", color:"rgba(255,255,255,.85)" }}>{label}</span>
              </div>
            ))}
          </div>
        </W>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display:"block", width:"100%", marginBottom:"-2px" }}>
          <path d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z" fill="#f0f6fc"/>
        </svg>
      </section>

      {/* Why choose India */}
      <section style={{ background:"#f0f6fc", padding:"72px 0" }}>
        <W>
          <div ref={r1} className={`reveal${v1 ? " in" : ""}`} style={{ maxWidth:"760px", margin:"0 auto", textAlign:"center", marginBottom:"40px" }}>
            <Eyebrow>Why India</Eyebrow>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:"700", color:"#0b1f3a", margin:"0 0 14px" }}>
              World-Class Healthcare, Compassionately Delivered
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"15px", color:"#64748b", lineHeight:"1.8", fontWeight:"300" }}>
              India has become a leading global destination for medical travel — a balanced combination
              of medical expertise, advanced infrastructure, and affordability, where outcomes and access
              matter as much as cost.
            </p>
          </div>
          <div className="ip-g3 stagger in" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
            {WHY_INDIA.map((item) => (
              <div key={item} className="ip-card" style={{ background:"#fff", border:"1px solid #e2eaf4", borderLeft:"4px solid #047857",
                borderRadius:"12px", padding:"18px 20px", boxShadow:"0 1px 6px rgba(11,31,58,.04)" }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#334155", lineHeight:"1.6", margin:0, fontWeight:"500" }}>{item}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* Comparison table */}
      <section style={{ background:"#fff", padding:"72px 0" }}>
        <W>
          <div style={{ textAlign:"center", marginBottom:"36px" }}>
            <Eyebrow>The Comparison</Eyebrow>
            <h2 style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:"700", color:"#0b1f3a", margin:0 }}>India Compared With Other Countries</h2>
          </div>
          <div style={{ borderRadius:"14px", overflow:"hidden", boxShadow:"0 4px 20px rgba(11,31,58,.08)" }}>
            <table className="ip-table">
              <thead><tr><th>Key Aspect</th><th>India</th><th>Many Other Countries</th></tr></thead>
              <tbody>
                {COMPARISON.map(([aspect, india, other]) => (
                  <tr key={aspect}><td>{aspect}</td><td>{india}</td><td>{other}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#94a3b8", textAlign:"center", marginTop:"20px", maxWidth:"600px", marginLeft:"auto", marginRight:"auto", fontWeight:"300" }}>
            India combines clinical excellence with human-centered care — an effective and compassionate choice for international patients.
          </p>
        </W>
      </section>

      {/* Accreditation & vetting */}
      <section style={{ background:"#f0f6fc", padding:"72px 0" }}>
        <W>
          <div style={{ textAlign:"center", marginBottom:"40px" }}>
            <Eyebrow>Safety &amp; Accreditation</Eyebrow>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:"700", color:"#0b1f3a", margin:"0 0 12px" }}>How We Vet Our Partner Hospitals</h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14.5px", color:"#64748b", maxWidth:"640px", margin:"0 auto", lineHeight:"1.8", fontWeight:"300" }}>
              Accreditation is the foundation of trust in cross-border care. We hold ourselves — and every
              hospital we work with — to a documented standard, not just a reputation.
            </p>
          </div>
          <div className="ip-g3" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px" }}>
            {VETTING.map(({ ic, t, d }, i) => (
              <div key={t} className="ip-card" style={{ background:"#fff", border:"1px solid #e2eaf4",
                borderLeft:"4px solid #1d4ed8", borderRadius:"14px", padding:"22px 20px",
                boxShadow:"0 2px 10px rgba(11,31,58,.05)" }}>
                <div style={{ width:"44px", height:"44px", background:"#eff6ff", border:"1.5px solid #bfdbfe",
                  borderRadius:"11px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"19px", marginBottom:"12px", overflow:"hidden" }}>
                  {i === 0 ? (
                    <img src="/assets/img/logo/euro_logo.jpeg" alt="Euro Cert"
                      style={{ width:"30px", height:"30px", objectFit:"contain" }}
                      onError={e=>{e.target.style.display="none"; e.target.parentElement.textContent="🏅";}}/>
                  ) : ic}
                </div>
                <h3 style={{ fontSize:"15.5px", fontWeight:"700", color:"#0b1f3a", margin:"0 0 6px" }}>{t}</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", color:"#64748b", lineHeight:"1.62", margin:0, fontWeight:"300" }}>{d}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* Why We Care 4 'all + Care model */}
      <section style={{ background:"linear-gradient(135deg,#0b1f3a,#112d52)", padding:"76px 0" }}>
        <W>
          <div ref={r2} className="ip-g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"48px" }}>
            <div className={`reveal${v2 ? " in" : ""}`}>
              <Eyebrow c="#6ee7b7">Independent By Design</Eyebrow>
              <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:"700", color:"#fff", margin:"0 0 14px" }}>Why Choose We Care 4 'all?</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14.5px", color:"rgba(255,255,255,.72)", lineHeight:"1.8", marginBottom:"16px", fontWeight:"300" }}>
                We are an independent healthcare consultancy, created to guide patients — not promote
                institutions. We work directly with experienced specialists and ethically managed
                hospitals, so we can recommend treatment purely on clinical appropriateness, safety,
                and affordability.
              </p>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px", fontWeight:"700", color:"#34d399", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"10px" }}>Our role is to:</p>
              <ul style={{ margin:0, paddingLeft:"18px" }}>
                {OUR_ROLE.map(item => (
                  <li key={item} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14px", color:"rgba(255,255,255,.75)", marginBottom:"8px", lineHeight:"1.6" }}>{item}</li>
                ))}
              </ul>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#6ee7b7", fontWeight:"600", marginTop:"16px" }}>
                We are accountable to patients, not hospital networks.
              </p>
            </div>
            <div>
              <Eyebrow c="#6ee7b7">A Different Approach</Eyebrow>
              <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:"700", color:"#fff", margin:"0 0 14px" }}>How Our Care Model Is Different</h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14.5px", color:"rgba(255,255,255,.72)", lineHeight:"1.8", marginBottom:"16px", fontWeight:"300" }}>
                Unlike facilitation models built into hospital referral systems, we follow a
                patient-centric coordination approach.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {CARE_MODEL.map(item => (
                  <div key={item} style={{ display:"flex", gap:"10px", alignItems:"flex-start", padding:"12px 14px",
                    background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"10px" }}>
                    <span style={{ color:"#34d399", flexShrink:0 }}>✓</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"rgba(255,255,255,.78)", lineHeight:"1.6" }}>{item}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"rgba(255,255,255,.55)", marginTop:"16px", fontWeight:"300", lineHeight:"1.7" }}>
                This lets us focus on medical necessity, cost rationalization, and continuity of care.
              </p>
            </div>
          </div>
        </W>
      </section>

      {/* Fee structure */}
      <section style={{ background:"#fff", padding:"72px 0" }}>
        <W>
          <div style={{ textAlign:"center", marginBottom:"36px" }}>
            <Eyebrow>Transparency</Eyebrow>
            <h2 style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:"700", color:"#0b1f3a", margin:"0 0 12px" }}>Cost Structure &amp; Service Fees</h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14.5px", color:"#64748b", maxWidth:"620px", margin:"0 auto", lineHeight:"1.8", fontWeight:"300" }}>
              International patients see varying pricing structures depending on the facilitation model
              used. In some markets, coordination costs are embedded and hidden inside hospital billing.
              We do it differently.
            </p>
          </div>
          <div style={{ maxWidth:"720px", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }} className="ip-g2">
            {FEE_STRUCTURE.map(item => (
              <div key={item} className="ip-card" style={{ background:"#f0fdf4", border:"1px solid #86efac",
                borderRadius:"12px", padding:"18px 20px" }}>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#166534", lineHeight:"1.65", margin:0, fontWeight:"500" }}>{item}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#94a3b8", textAlign:"center", marginTop:"24px", maxWidth:"620px", marginLeft:"auto", marginRight:"auto", fontWeight:"300" }}>
            By separating our professional coordination fee from hospital billing, patients get greater cost clarity and better affordability.
          </p>
        </W>
      </section>

      {/* Treatment Journey */}
      <section style={{ background:"#f0f6fc", padding:"76px 0" }}>
        <W>
          <div style={{ textAlign:"center", marginBottom:"44px" }}>
            <Eyebrow>Step By Step</Eyebrow>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:"700", color:"#0b1f3a", margin:"0 0 12px" }}>Your Treatment Journey</h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14.5px", color:"#64748b", maxWidth:"600px", margin:"0 auto", lineHeight:"1.8", fontWeight:"300" }}>
              From your first message to us through to follow-up care back home — here's exactly what to expect.
            </p>
          </div>
          <div style={{ position:"relative" }}>
            <div className="ip-journey-line" style={{ position:"absolute", left:"27px", top:"8px", bottom:"8px", width:"2px", background:"#d1fae5" }}/>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {JOURNEY.map(({ n, t, d }) => (
                <div key={n} style={{ display:"flex", gap:"20px", padding:"14px 0" }}>
                  <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"#f0fdf4",
                    border:"2px solid #86efac", display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0, position:"relative", zIndex:1 }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"18px", fontWeight:"700", color:"#047857" }}>{n}</span>
                  </div>
                  <div style={{ paddingTop:"6px" }}>
                    <h3 style={{ fontSize:"17px", fontWeight:"700", color:"#0b1f3a", margin:"0 0 4px" }}>{t}</h3>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#64748b", lineHeight:"1.65", margin:0, fontWeight:"300", maxWidth:"620px" }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </W>
      </section>

      {/* End-to-end services */}
      <section style={{ background:"#fff", padding:"76px 0" }}>
        <W>
          <div style={{ textAlign:"center", marginBottom:"40px" }}>
            <Eyebrow>Start To Finish</Eyebrow>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:"700", color:"#0b1f3a", margin:0 }}>End-to-End International Patient Services</h2>
          </div>
          <div ref={r3} className={`ip-g3 stagger${v3 ? " in" : ""}`} style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px" }}>
            {SERVICES.map(({ ic, t, d }) => (
              <div key={t} className="ip-card" style={{ background:"#fff", border:"1px solid #e2eaf4",
                borderRadius:"14px", padding:"22px 18px", boxShadow:"0 2px 10px rgba(11,31,58,.05)" }}>
                <div style={{ width:"44px", height:"44px", background:"#f0fdf4", border:"1.5px solid #86efac",
                  borderRadius:"11px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"19px", marginBottom:"12px" }}>{ic}</div>
                <h3 style={{ fontSize:"15.5px", fontWeight:"700", color:"#0b1f3a", margin:"0 0 6px" }}>{t}</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", color:"#64748b", lineHeight:"1.62", margin:0, fontWeight:"300" }}>{d}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* Emergency + Insurance + Heritage */}
      <section style={{ background:"#f0f6fc", padding:"64px 0" }}>
        <W>
          {/* Insurance — featured callout */}
          <div style={{ background:"linear-gradient(135deg,#eff6ff,#f5f9ff)", border:"1.5px solid #bfdbfe",
            borderRadius:"20px", padding:"36px 32px", marginBottom:"20px",
            display:"flex", gap:"28px", alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ width:"64px", height:"64px", background:"#fff", border:"1.5px solid #bfdbfe",
              borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"30px", flexShrink:0 }}>🛡️</div>
            <div style={{ flex:"1", minWidth:"260px" }}>
              <h3 style={{ fontSize:"21px", fontWeight:"700", color:"#0b1f3a", margin:"0 0 8px" }}>International Insurance Support</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14px", color:"#475569", lineHeight:"1.75", margin:"0 0 14px", fontWeight:"300", maxWidth:"640px" }}>
                Insurance is often the most confusing part of planning care abroad. We help make sense of it
                before you travel, not after.
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
                {[
                  "Explain what your policy actually covers abroad",
                  "Prepare documentation insurers require for reimbursement",
                  "Coordinate with hospitals offering cashless processes for select insurers",
                ].map(item => (
                  <span key={item} style={{ display:"flex", alignItems:"center", gap:"7px",
                    background:"#fff", border:"1px solid #bfdbfe", borderRadius:"50px",
                    padding:"7px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                    fontWeight:"600", color:"#1d4ed8" }}>
                    <span style={{ color:"#1d4ed8" }}>✓</span>{item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency + Heritage */}
          <div className="ip-g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
            <div style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:"16px", padding:"28px 26px" }}>
              <div style={{ fontSize:"26px", marginBottom:"10px" }}>🚑</div>
              <h3 style={{ fontSize:"18px", fontWeight:"700", color:"#0b1f3a", margin:"0 0 8px" }}>Emergency Transfers &amp; Critical Care</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#64748b", lineHeight:"1.72", margin:0, fontWeight:"300" }}>
                For time-sensitive or critical cases, we're empanelled with Air Ambulance services —
                medically supervised international transfers and rapid response when immediate
                intervention is required.
              </p>
            </div>
            <div style={{ background:"#faf5ff", border:"1px solid #ddd6fe", borderRadius:"16px", padding:"28px 26px" }}>
              <div style={{ fontSize:"26px", marginBottom:"10px" }}>🕌</div>
              <h3 style={{ fontSize:"18px", fontWeight:"700", color:"#0b1f3a", margin:"0 0 8px" }}>Healing Beyond Treatment</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#64748b", lineHeight:"1.72", margin:0, fontWeight:"300" }}>
                Recovery extends beyond the procedure itself. Through our Heritage Tours association,
                patients and accompanying family may explore India's culture and heritage during
                recovery — supporting emotional well-being and holistic healing.
              </p>
            </div>
          </div>
        </W>
      </section>

      {/* Testimonials — placeholder, honestly labeled (no fabricated quotes) */}
      <section style={{ background:"#fff", padding:"64px 0" }}>
        <W>
          <div style={{ textAlign:"center", maxWidth:"620px", margin:"0 auto" }}>
            <Eyebrow>Patient Stories</Eyebrow>
            <h2 style={{ fontSize:"clamp(22px,3.5vw,32px)", fontWeight:"700", color:"#0b1f3a", margin:"0 0 12px" }}>What Our Patients Say</h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14px", color:"#64748b", lineHeight:"1.8", fontWeight:"300", marginBottom:"20px" }}>
              We're collecting testimonials from our international patients — real stories will appear
              here once we have their consent to share them.
            </p>
            <Link to="/contact" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", fontWeight:"700", color:"#047857" }}>
              Are you a past patient? Share your story →
            </Link>
          </div>
        </W>
      </section>

      {/* FAQs */}
      <section style={{ background:"#f0f6fc", padding:"72px 0" }}>
        <W s={{ maxWidth:"820px" }}>
          <div style={{ textAlign:"center", marginBottom:"36px" }}>
            <Eyebrow>Common Questions</Eyebrow>
            <h2 style={{ fontSize:"clamp(22px,3.5vw,34px)", fontWeight:"700", color:"#0b1f3a", margin:0 }}>Frequently Asked Questions</h2>
          </div>
          <FAQAccordion items={FAQS}/>
        </W>
      </section>

      {/* Closing CTA */}
      <section style={{ background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)", padding:"72px 0" }}>
        <W>
          <div style={{ textAlign:"center", maxWidth:"640px", margin:"0 auto" }}>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,36px)", fontWeight:"700", color:"#fff", margin:"0 0 14px" }}>
              A Responsible Partner in Your Healthcare Journey
            </h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"15px", color:"rgba(255,255,255,.68)", lineHeight:"1.8", fontWeight:"300", marginBottom:"28px" }}>
              India delivers care. We Care 4 'all' ensures it's done right — with ethical clarity,
              financial transparency, and clinical responsibility, every step of the way.
            </p>
            <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
              <Link to="/doctors" className="btn-p">Book a Consultation →</Link>
              <Link to="/contact" className="btn-ol">Talk to Our Team</Link>
            </div>
          </div>
        </W>
      </section>

      {/* Legal disclaimer — compliance footnote */}
      <section style={{ background:"#fff", padding:"32px 0 56px", borderTop:"1px solid #e2eaf4" }}>
        <W>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px", color:"#94a3b8", lineHeight:"1.75", maxWidth:"860px", margin:"0 auto", fontWeight:"300" }}>
            <strong style={{ color:"#64748b" }}>Legal Disclaimer:</strong> We Care 4 'all' is an
            independent healthcare consultancy and patient coordination service. We do not provide
            medical advice or treatment, nor do we own or operate any medical facility. All medical
            services are delivered exclusively by licensed physicians and accredited healthcare
            institutions chosen by the patient. Treatment outcomes, timelines, and costs are determined
            solely by the treatment provider. Cost estimates are indicative and non-binding.
            Professional service fees relate only to coordination and support services and are
            disclosed separately. No medical outcomes are guaranteed.
          </p>
        </W>
      </section>
    </div>
  );
}
