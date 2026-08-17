import { useTranslation } from "react-i18next";
import { W } from "./shared";

export default function WhyPartnerSection() {
  const { t } = useTranslation();
  const why = t("whyPartnerSection.why", { returnObjects: true });
  const who = t("whyPartnerSection.who", { returnObjects: true });
  const visibility = t("whyPartnerSection.visibility", { returnObjects: true });
  const photos = t("whyPartnerSection.photos", { returnObjects: true });
  // Icons are decorative, not translatable text, so they stay code-side —
  // paired with the title/desc looked up from whyPartnerSection.approach.<id>.
  const APPROACH_IDS = [
    { icon: "🩺", id: "clinical" },
    { icon: "🏗️", id: "infrastructure" },
    { icon: "👥", id: "team" },
    { icon: "🤝", id: "ethical" },
  ];

  return (
    <>
      {/* Mission */}
      <section style={{ background: "#fff", padding: "60px 0 40px" }}>
        <W s={{ maxWidth: "760px" }}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"15px", color:"#475569", lineHeight:1.85, fontWeight:300, textAlign:"center" }}>
            {t("whyPartnerSection.missionText")}
          </p>
        </W>
      </section>

      {/* Why Partner */}
      <section style={{ background: "var(--wc-warm-white)", padding: "56px 0" }}>
        <W>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:700, color:"var(--wc-navy)", textAlign:"center", marginBottom:"30px" }}>
            {t("whyPartnerSection.whyTitle")}
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(260px,100%),1fr))", gap:"14px", maxWidth:"900px", margin:"0 auto" }}>
            {why.map(w => (
              <div key={w} style={{ display:"flex", gap:"10px", alignItems:"flex-start", background:"#fff", border:"1px solid var(--wc-border)", borderRadius:"11px", padding:"14px 16px" }}>
                <span style={{ color:"var(--wc-green)", fontWeight:700, flexShrink:0 }}>✓</span>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"13.5px", color:"#374151", lineHeight:1.6 }}>{w}</span>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* Our Approach */}
      <section style={{ background: "#fff", padding: "56px 0" }}>
        <W>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:700, color:"var(--wc-navy)", textAlign:"center", marginBottom:"8px" }}>
            {t("whyPartnerSection.approachTitle")}
          </h2>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13.5px", color:"var(--wc-muted)", textAlign:"center", maxWidth:"560px", margin:"0 auto 30px" }}>
            {t("whyPartnerSection.approachSub")}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(200px,100%),1fr))", gap:"16px" }}>
            {APPROACH_IDS.map(({ icon, id }) => (
              <div key={id} style={{ textAlign:"center", padding:"18px 14px" }}>
                <div style={{ fontSize:"30px", marginBottom:"10px" }}>{icon}</div>
                <h3 style={{ fontFamily:"'Inter',sans-serif", fontSize:"14px", fontWeight:700, color:"var(--wc-navy)", marginBottom:"6px" }}>{t(`whyPartnerSection.approach.${id}.title`)}</h3>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"12.5px", color:"var(--wc-muted)", lineHeight:1.6, fontWeight:300 }}>{t(`whyPartnerSection.approach.${id}.desc`)}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* Who Can Partner */}
      <section style={{ background: "var(--wc-sage)", padding: "56px 0" }}>
        <W s={{ maxWidth: "760px" }}>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:700, color:"var(--wc-navy)", textAlign:"center", marginBottom:"10px" }}>
            {t("whyPartnerSection.whoTitle")}
          </h2>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13.5px", color:"var(--wc-muted)", textAlign:"center", marginBottom:"26px" }}>
            {t("whyPartnerSection.whoSub")}
          </p>
          <ul style={{ display:"flex", flexDirection:"column", gap:"10px", paddingLeft:0, listStyle:"none" }}>
            {who.map(w => (
              <li key={w} style={{ display:"flex", gap:"10px", alignItems:"flex-start", fontFamily:"'Inter',sans-serif", fontSize:"14px", color:"#374151" }}>
                <span style={{ color:"var(--wc-green)", fontWeight:700, flexShrink:0 }}>✓</span>{w}
              </li>
            ))}
          </ul>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"12.5px", color:"var(--wc-muted)", textAlign:"center", marginTop:"22px", fontStyle:"italic" }}>
            {t("whyPartnerSection.whoFooter")}
          </p>
        </W>
      </section>

      {/* Partnership Opportunities / Visibility */}
      <section style={{ background: "#fff", padding: "56px 0" }}>
        <W>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:700, color:"var(--wc-navy)", textAlign:"center", marginBottom:"8px" }}>
            {t("whyPartnerSection.opportunitiesTitle")}
          </h2>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13.5px", color:"var(--wc-muted)", textAlign:"center", maxWidth:"600px", margin:"0 auto 30px" }}>
            {t("whyPartnerSection.opportunitiesSub")}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(240px,100%),1fr))", gap:"12px", maxWidth:"880px", margin:"0 auto 26px" }}>
            {visibility.map(v => (
              <div key={v} style={{ display:"flex", gap:"9px", alignItems:"flex-start", background:"#eff8ff", border:"1px solid #bae6fd", borderRadius:"10px", padding:"12px 14px" }}>
                <span style={{ color:"var(--wc-teal)" }}>▪️</span>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px", color:"#0c4a6e" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"10px", padding:"16px 20px", maxWidth:"640px", margin:"0 auto", textAlign:"center" }}>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"13px", color:"#92400e", fontStyle:"italic", lineHeight:1.7, margin:0 }}>
              {t("whyPartnerSection.opportunitiesQuote")}
            </p>
          </div>
        </W>
      </section>

      {/* Photos required */}
      <section style={{ background: "var(--wc-warm-white)", padding: "48px 0" }}>
        <W s={{ maxWidth: "780px" }}>
          <h3 style={{ fontSize:"19px", fontWeight:700, color:"var(--wc-navy)", textAlign:"center", marginBottom:"6px" }}>
            {t("whyPartnerSection.photosTitle")}
          </h3>
          <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"12.5px", color:"var(--wc-muted)", textAlign:"center", marginBottom:"18px" }}>
            {t("whyPartnerSection.photosSub")}
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center" }}>
            {photos.map(p => (
              <span key={p} style={{ background:"#fff", border:"1px solid var(--wc-border)", borderRadius:"50px",
                padding:"6px 14px", fontFamily:"'Inter',sans-serif", fontSize:"12px", color:"#374151" }}>{p}</span>
            ))}
          </div>
        </W>
      </section>
    </>
  );
}
