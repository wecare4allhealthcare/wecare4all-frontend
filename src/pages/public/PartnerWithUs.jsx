import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO, { breadcrumbJsonLd } from "../../components/SEO";

import { W, getTiers } from "./partner-with-us/shared";
import WhyPartnerSection from "./partner-with-us/WhyPartnerSection";
import EmpanelForm from "./partner-with-us/EmpanelForm";
const G = `
.pw{font-family:'Inter',sans-serif;color:#1e293b;overflow-x:hidden;}.pw *{box-sizing:border-box;}.pw a{text-decoration:none;}
.pw h1,.pw h2,.pw h3,.pw h4{font-family:'Manrope',sans-serif;}
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease;}.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
.stagger.in>*{opacity:1;transform:translateY(0);}
.stagger.in>*:nth-child(1){transition-delay:.04s}.stagger.in>*:nth-child(2){transition-delay:.10s}
.stagger.in>*:nth-child(3){transition-delay:.16s}.stagger.in>*:nth-child(4){transition-delay:.22s}
.stagger.in>*:nth-child(5){transition-delay:.28s}.stagger.in>*:nth-child(6){transition-delay:.34s}
.tier-card{transition:all .25s;}.tier-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(18,59,74,.14)!important;}
.benefit-card{transition:all .25s;}.benefit-card:hover{border-color:var(--wc-green)!important;background:var(--wc-sage)!important;transform:translateY(-3px);}
.pw-inp{width:100%;border:1.5px solid var(--wc-border);border-radius:9px;padding:11px 14px;font-family:'Inter',sans-serif;font-size:14px;color:#1e293b;background:var(--wc-warm-white);transition:all .2s;outline:none;}
.pw-inp:focus{border-color:var(--wc-green);background:#fff;box-shadow:0 0 0 3px rgba(91,158,50,.09);}
.pw-inp.err{border-color:#ef4444;background:#fef2f2;}
.pw-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.pw-chip{display:flex;align-items:center;gap:5px;padding:6px 12px;border:1.5px solid var(--wc-border);border-radius:8px;cursor:pointer;transition:all .2s;font-family:'Inter',sans-serif;font-size:12px;color:#374151;user-select:none;}
.pw-chip:hover{border-color:var(--wc-green);background:var(--wc-sage);color:var(--wc-green);}
.pw-chip.on{border-color:var(--wc-green);background:#dcfce7;color:var(--wc-green);font-weight:600;}
.sec-ttl{font-family:'Inter',sans-serif;font-size:11px;font-weight:700;color:var(--wc-green);letter-spacing:1.5px;text-transform:uppercase;padding:8px 0 7px;border-bottom:1px solid var(--wc-border);margin-bottom:14px;}
.btn-p{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;font-family:'Inter',sans-serif;font-weight:700;font-size:15px;padding:13px 28px;border-radius:9px;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(91,158,50,.38);transition:all .25s;text-decoration:none;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(91,158,50,.48);}
.btn-p:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,.4);border-top:2px solid #fff;border-radius:50%;animation:spin .75s linear infinite;display:inline-block;}
@media(max-width:900px){
  .tier-grid{grid-template-columns:1fr!important;}
  .pw-grid{grid-template-columns:1fr!important;}
  .fw2,.fw3{grid-template-columns:1fr 1fr!important;}
}
@media(max-width:600px){
  .fw2,.fw3{grid-template-columns:1fr!important;}
  .tier-grid{grid-template-columns:1fr!important;}
}
`;
// Module-level — no interactive state on this page, content is fully
// static, same stability pattern as the other pages in this pass.
const PARTNER_WITH_US_JSONLD = [
  breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Partner With Us", path: "/partner-with-us" }]),
  {
    "@type": "Service",
    "serviceType": "Hospital Partnership / Empanelment",
    "name": "Partner With We Care 4 'all'",
    "description": "Hospitals and healthcare institutions can partner with We Care 4 'all' to reach more patients through our verified doctor and hospital network.",
    "provider": {
      "@type": "MedicalBusiness",
      "name": "We Care 4 'all'",
      "url": "https://www.wecare4all.in/",
    },
    "areaServed": "Chennai, Tamil Nadu, India",
    "audience": { "@type": "BusinessAudience", "audienceType": "Hospitals and Healthcare Institutions" },
  },
];

export default function PartnerWithUs() {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const [r1, v1] = useScrollAnimation();
  const [r2, v2] = useScrollAnimation();
  const tiers = getTiers(t);
  return (
    <div className="pw">
      <style>{G}</style>
      <SEO title="Partner With Us" path="/partner-with-us"
        description="Hospitals and healthcare institutions — partner with We Care 4 'all' to reach more patients."
        jsonLd={PARTNER_WITH_US_JSONLD} />
      <section
        style={{
          background: "linear-gradient(135deg,#071524,var(--wc-navy) 60%,#062818)",
          paddingTop: "112px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",
            backgroundSize: "36px 36px",
            pointerEvents: "none",
          }}
        />
        <W s={{ padding: "52px 24px 80px" }}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <Link
              to="/"
              style={{
                color: "rgba(255,255,255,.5)",
                fontSize: "13px",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {t("nav.home")}
            </Link>
            <span style={{ color: "rgba(255,255,255,.25)" }}>/</span>
            <span
              style={{
                color: "var(--wc-green-pale)",
                fontSize: "13px",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {t("partnerWithUsPage.breadcrumb")}
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "11px",
              fontWeight: "700",
              color: "var(--wc-green-pale)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            {t("partnerWithUsPage.eyebrow")}
          </p>
          <h1
            style={{
              fontFamily: "'Manrope',sans-serif",
              fontSize: "clamp(34px,5vw,58px)",
              fontWeight: "700",
              color: "#fff",
              lineHeight: "1.1",
              marginBottom: "14px",
            }}
          >
            {t("partnerWithUsPage.heroTitle1")}
            <br />
            <span style={{ color: "var(--wc-green-lighter)" }}>{t("partnerWithUsPage.heroTitle2")}</span>
          </h1>
          <p
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "17px",
              color: "rgba(255,255,255,.68)",
              lineHeight: "1.78",
              maxWidth: "490px",
              fontWeight: "300",
            }}
          >
            {t("partnerWithUsPage.heroSub")}
          </p>
          <Link to="/login?staff=hospital" style={{
            display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "18px",
            padding: "11px 20px", borderRadius: "9px", textDecoration: "none",
            border: "1.5px solid rgba(52,211,153,.5)", background: "rgba(52,211,153,.08)",
            color: "var(--wc-green-pale)", fontFamily: "'Inter',sans-serif", fontWeight: "700", fontSize: "13.5px",
          }}>
            {t("partnerWithUsPage.alreadyEmpanelled")}
          </Link>
        </W>
        <svg
          viewBox="0 0 1440 60"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", width: "100%", marginBottom: "-2px" }}
        >
          <path
            d="M0,44 C360,80 1080,10 1440,44 L1440,60 L0,60 Z"
            fill="#f0f6fc"
          />
        </svg>
      </section>
      <WhyPartnerSection />
      <section style={{ background: "#f0f6fc", padding: "68px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                color: "var(--wc-green)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              {t("partnerWithUsPage.tiersEyebrow")}
            </p>
            <h2
              style={{
                fontSize: "clamp(24px,3.5vw,40px)",
                fontWeight: "700",
                color: "var(--wc-navy)",
                margin: "0 0 10px",
              }}
            >
              {t("partnerWithUsPage.tiersTitle")}
            </h2>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "14px",
                color: "var(--wc-muted)",
                maxWidth: "440px",
                margin: "0 auto",
                fontWeight: "300",
              }}
            >
              {t("partnerWithUsPage.tiersSub")}
            </p>
          </div>
          <div
            ref={r1}
            className={`tier-grid stagger${v1 ? " in" : ""}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: "22px",
            }}
          >
            {tiers.map(
              ({ icon, label, price, color, bg, border, badge, features }) => (
                <div
                  key={label}
                  className="tier-card"
                  style={{
                    background: bg,
                    border: `2px solid ${border}`,
                    borderRadius: "16px",
                    padding: "26px 22px",
                    position: "relative",
                    boxShadow: "0 2px 12px rgba(18,59,74,.06)",
                  }}
                >
                  {badge && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-11px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: color,
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: "700",
                        padding: "3px 14px",
                        borderRadius: "50px",
                        fontFamily: "'Inter',sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {badge}
                    </span>
                  )}
                  <div style={{ fontSize: "26px", marginBottom: "10px" }}>
                    {icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "var(--wc-navy)",
                      margin: "0 0 4px",
                    }}
                  >
                    {label}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: "13px",
                      fontWeight: "700",
                      color: color,
                      margin: "0 0 16px",
                    }}
                  >
                    {price}
                  </p>
                  <ul
                    style={{
                      paddingLeft: 0,
                      listStyle: "none",
                      marginBottom: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "7px",
                    }}
                  >
                    {features.map((f) => (
                      <li
                        key={f}
                        style={{
                          display: "flex",
                          gap: "7px",
                          fontFamily: "'Inter',sans-serif",
                          fontSize: "13px",
                          color: "#475569",
                          fontWeight: "300",
                        }}
                      >
                        <span
                          style={{ color, fontWeight: "700", flexShrink: 0 }}
                        >
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#empanelment"
                    style={{
                      display: "block",
                      textAlign: "center",
                      padding: "11px",
                      background: color,
                      color: "#fff",
                      borderRadius: "9px",
                      fontFamily: "'Inter',sans-serif",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {t("aboutPage.applyNow")}
                  </a>
                </div>
              ),
            )}
          </div>
        </W>
      </section>
      <section style={{ background: "#fff", padding: "68px 0" }}>
        <W>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                color: "var(--wc-green)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              {t("partnerWithUsPage.benefitsEyebrow")}
            </p>
            <h2
              style={{
                fontSize: "clamp(24px,3.5vw,38px)",
                fontWeight: "700",
                color: "var(--wc-navy)",
                margin: 0,
              }}
            >
              {t("partnerWithUsPage.benefitsTitle")}
            </h2>
          </div>
          <div
            ref={r2}
            className={`stagger${v2 ? " in" : ""}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(min(220px,100%),1fr))",
              gap: "16px",
            }}
          >
            {[
              ["📈", "referrals"],
              ["🌐", "visibility"],
              ["🏢", "corporate"],
              ["🌍", "international"],
              ["📊", "analytics"],
              ["🏅", "credibility"],
            ].map(([ic, id]) => (
              <div
                key={id}
                className="benefit-card"
                style={{
                  background: "var(--wc-warm-white)",
                  border: "1px solid var(--wc-border)",
                  borderRadius: "13px",
                  padding: "20px",
                  cursor: "default",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "9px" }}>
                  {ic}
                </div>
                <h3
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--wc-navy)",
                    margin: "0 0 6px",
                  }}
                >
                  {t(`partnerWithUsPage.benefits.${id}.t`)}
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "13px",
                    color: "#6b7688",
                    lineHeight: "1.65",
                    margin: 0,
                    fontWeight: "300",
                  }}
                >
                  {t(`partnerWithUsPage.benefits.${id}.d`)}
                </p>
              </div>
            ))}
          </div>
        </W>
      </section>
      {/* Hospital Network CTA */}
      <section style={{background:"linear-gradient(135deg,var(--wc-navy) 0%,#112d52 100%)",padding:"56px 24px"}}>
        <div style={{maxWidth:"900px",margin:"0 auto",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          flexWrap:"wrap",gap:"28px"}}>
          <div>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"rgba(52,211,153,.8)",letterSpacing:"2px",textTransform:"uppercase",
              marginBottom:"10px"}}>{t("partnerWithUsPage.networkEyebrow")}</p>
            <h2 style={{fontFamily:"'Manrope',sans-serif",
              fontSize:"clamp(24px,3.5vw,36px)",fontWeight:"700",color:"#fff",
              margin:"0 0 10px",lineHeight:1.15}}>
              {t("partnerWithUsPage.networkTitle")}
            </h2>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",
              color:"rgba(255,255,255,.6)",margin:0,maxWidth:"440px",lineHeight:1.65}}>
              {t("partnerWithUsPage.networkSub")}
            </p>
          </div>
          <a href="/our-hospitals"
            style={{display:"inline-flex",alignItems:"center",gap:"10px",
              background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",
              padding:"14px 30px",borderRadius:"12px",
              fontFamily:"'Inter',sans-serif",fontWeight:"700",fontSize:"15px",
              textDecoration:"none",boxShadow:"0 6px 24px rgba(91,158,50,.35)",
              flexShrink:0,whiteSpace:"nowrap"}}>
            {t("partnerWithUsPage.viewAllHospitals")}
          </a>
        </div>
      </section>
      <section
        id="empanelment"
        style={{ background: "#f0f6fc", padding: "68px 0" }}
      >
        <W>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                color: "var(--wc-green)",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              {t("partnerWithUsPage.applyEyebrow")}
            </p>
            <h2
              style={{
                fontSize: "clamp(24px,3.5vw,38px)",
                fontWeight: "700",
                color: "var(--wc-navy)",
                margin: "0 0 9px",
              }}
            >
              {t("partnerWithUsPage.applyTitle")}
            </h2>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "14px",
                color: "var(--wc-muted)",
                maxWidth: "460px",
                margin: "0 auto",
                fontWeight: "300",
              }}
            >
              {t("partnerWithUsPage.applySub")}
            </p>
          </div>
          <div ref={formRef}
            style={{
              maxWidth: "840px",
              margin: "0 auto",
              background: "#fff",
              border: "1px solid var(--wc-border)",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(18,59,74,.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
                padding: "18px 24px",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#fff",
                  margin: "0 0 2px",
                }}
              >
                {t("partnerWithUsPage.formTitle")}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,.78)",
                }}
              >
                {t("partnerWithUsPage.formSub")}
              </p>
            </div>
            <EmpanelForm formRef={formRef} />
          </div>
        </W>
      </section>
      <section
        style={{
          background: "linear-gradient(135deg,var(--wc-navy),#112d52)",
          padding: "52px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "26px",
                fontWeight: "700",
                color: "#fff",
                margin: "0 0 5px",
              }}
            >
              {t("partnerWithUsPage.questionsTitle")}
            </h3>
            <p
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "14px",
                color: "rgba(255,255,255,.62)",
              }}
            >
              {t("partnerWithUsPage.questionsSub")}
            </p>
          </div>
          <div style={{ display: "flex", gap: "11px", flexWrap: "wrap" }}>
            <a href="tel:+919025786467" className="btn-p">
              📞 90257 86467
            </a>
            <Link
              to="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                border: "1.5px solid rgba(255,255,255,.30)",
                color: "#fff",
                fontFamily: "'Inter',sans-serif",
                fontWeight: "500",
                fontSize: "15px",
                padding: "13px 26px",
                borderRadius: "9px",
              }}
            >
              {t("partnerWithUsPage.contactUs")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
