import { W } from "./shared";

export default function WhyPartnerSection() {
  const WHY = [
    "Reach patients actively seeking reliable medical guidance",
    "Receive referrals for specialized consultations and treatments",
    "Enhance visibility among domestic and international patients",
    "Access opportunities in medical tourism",
    "Work with a healthcare consultancy that prioritizes ethical practices and patient welfare",
  ];
  const APPROACH = [
    ["🩺", "Clinical Expertise", "We understand a hospital's specialties and clinical strengths before any association begins."],
    ["🏗️", "Infrastructure", "Treatment facilities and infrastructure are reviewed to ensure they meet real patient needs."],
    ["👥", "Medical Team", "We look at the experience and depth of a hospital's medical team."],
    ["🤝", "Ethical Commitment", "Every partner hospital reflects our commitment to ethical, transparent medical practice."],
  ];
  const WHO = [
    "Maintain high standards of medical care",
    "Have qualified and experienced specialists",
    "Follow ethical and transparent treatment practices",
    "Offer patient-focused healthcare services",
    "Are committed to quality and affordability",
  ];
  const VISIBILITY = [
    "Featured placement on our platform",
    "Promotion through patient awareness campaigns",
    "Doctor and hospital highlight features",
    "Digital and social media visibility",
    "Access to medical tourism patient flow",
    "Participation in health awareness initiatives and camps",
  ];
  const PHOTOS = [
    "Exterior with branding", "Emergency", "Reception & patient waiting area",
    "Consultation Room", "OT", "ICU", "NICU", "CCU", "Gynaecological OT", "Patient Rooms",
  ];

  return (
    <>
      {/* Mission */}
      <section style={{ background: "#fff", padding: "60px 0 40px" }}>
        <W s={{ maxWidth: "760px" }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"15px", color:"#475569", lineHeight:1.85, fontWeight:300, textAlign:"center" }}>
            Quality healthcare becomes truly meaningful only when patients can access the right
            treatment at the right time from the right specialists. Many patients today struggle
            to identify trustworthy hospitals, understand treatment options, or navigate the
            healthcare system effectively. We Care 4 'all' was founded with the vision of bridging
            this gap by guiding patients toward ethical, experienced, and patient-focused
            healthcare providers — working closely with a carefully selected network of hospitals
            and specialists who share our commitment to transparent medical practices.
          </p>
        </W>
      </section>

      {/* Why Partner */}
      <section style={{ background: "#f8fafc", padding: "56px 0" }}>
        <W>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:700, color:"#0b1f3a", textAlign:"center", marginBottom:"30px" }}>
            Why Partner With Us
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"14px", maxWidth:"900px", margin:"0 auto" }}>
            {WHY.map(w => (
              <div key={w} style={{ display:"flex", gap:"10px", alignItems:"flex-start", background:"#fff", border:"1px solid #e2eaf4", borderRadius:"11px", padding:"14px 16px" }}>
                <span style={{ color:"#047857", fontWeight:700, flexShrink:0 }}>✓</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#374151", lineHeight:1.6 }}>{w}</span>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* Our Approach */}
      <section style={{ background: "#fff", padding: "56px 0" }}>
        <W>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:700, color:"#0b1f3a", textAlign:"center", marginBottom:"8px" }}>
            Our Approach
          </h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#64748b", textAlign:"center", maxWidth:"560px", margin:"0 auto 30px" }}>
            Before associating with hospitals, we carefully understand their clinical expertise,
            infrastructure, medical team, and commitment to ethical practice.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"16px" }}>
            {APPROACH.map(([icon,title,desc]) => (
              <div key={title} style={{ textAlign:"center", padding:"18px 14px" }}>
                <div style={{ fontSize:"30px", marginBottom:"10px" }}>{icon}</div>
                <h3 style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"14px", fontWeight:700, color:"#0b1f3a", marginBottom:"6px" }}>{title}</h3>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", color:"#64748b", lineHeight:1.6, fontWeight:300 }}>{desc}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* Who Can Partner */}
      <section style={{ background: "#f0fdf4", padding: "56px 0" }}>
        <W s={{ maxWidth: "760px" }}>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:700, color:"#0b1f3a", textAlign:"center", marginBottom:"10px" }}>
            Who Can Partner With Us
          </h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#64748b", textAlign:"center", marginBottom:"26px" }}>
            We welcome hospitals that:
          </p>
          <ul style={{ display:"flex", flexDirection:"column", gap:"10px", paddingLeft:0, listStyle:"none" }}>
            {WHO.map(w => (
              <li key={w} style={{ display:"flex", gap:"10px", alignItems:"flex-start", fontFamily:"'DM Sans',sans-serif", fontSize:"14px", color:"#374151" }}>
                <span style={{ color:"#047857", fontWeight:700, flexShrink:0 }}>✓</span>{w}
              </li>
            ))}
          </ul>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", color:"#64748b", textAlign:"center", marginTop:"22px", fontStyle:"italic" }}>
            Hospitals across multi-specialty, super-specialty, and specialty care are encouraged to connect with us.
          </p>
        </W>
      </section>

      {/* Partnership Opportunities / Visibility */}
      <section style={{ background: "#fff", padding: "56px 0" }}>
        <W>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:700, color:"#0b1f3a", textAlign:"center", marginBottom:"8px" }}>
            Partnership Opportunities
          </h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13.5px", color:"#64748b", textAlign:"center", maxWidth:"600px", margin:"0 auto 30px" }}>
            All empanelled hospitals benefit from patient referrals. Hospitals looking to expand
            their reach can also opt into structured visibility & growth programs:
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"12px", maxWidth:"880px", margin:"0 auto 26px" }}>
            {VISIBILITY.map(v => (
              <div key={v} style={{ display:"flex", gap:"9px", alignItems:"flex-start", background:"#eff8ff", border:"1px solid #bae6fd", borderRadius:"10px", padding:"12px 14px" }}>
                <span style={{ color:"#0369a1" }}>▪️</span>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px", color:"#0c4a6e" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"10px", padding:"16px 20px", maxWidth:"640px", margin:"0 auto", textAlign:"center" }}>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px", color:"#92400e", fontStyle:"italic", lineHeight:1.7, margin:0 }}>
              "Hospital recommendations are always based on clinical suitability and patient needs.
              Promotional partnerships do not influence medical guidance."
            </p>
          </div>
        </W>
      </section>

      {/* Photos required */}
      <section style={{ background: "#f8fafc", padding: "48px 0" }}>
        <W s={{ maxWidth: "780px" }}>
          <h3 style={{ fontSize:"19px", fontWeight:700, color:"#0b1f3a", textAlign:"center", marginBottom:"6px" }}>
            Photos Required From Hospitals
          </h3>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", color:"#64748b", textAlign:"center", marginBottom:"18px" }}>
            Once approved, you'll be able to upload these from your hospital dashboard.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center" }}>
            {PHOTOS.map(p => (
              <span key={p} style={{ background:"#fff", border:"1px solid #e2eaf4", borderRadius:"50px",
                padding:"6px 14px", fontFamily:"'DM Sans',sans-serif", fontSize:"12px", color:"#374151" }}>{p}</span>
            ))}
          </div>
        </W>
      </section>
    </>
  );
}
