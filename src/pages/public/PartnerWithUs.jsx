import { useRef } from "react";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import SEO from "../../components/SEO";

import { W, TIERS } from "./partner-with-us/shared";
import WhyPartnerSection from "./partner-with-us/WhyPartnerSection";
import EmpanelForm from "./partner-with-us/EmpanelForm";
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.pw{font-family:'DM Sans',sans-serif;color:#1e293b;overflow-x:hidden;}.pw *{box-sizing:border-box;}.pw a{text-decoration:none;}
.pw h1,.pw h2,.pw h3,.pw h4{font-family:'Cormorant Garamond',Georgia,serif;}
.reveal{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease;}.reveal.in{opacity:1;transform:translateY(0);}
.stagger>*{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
.stagger.in>*{opacity:1;transform:translateY(0);}
.stagger.in>*:nth-child(1){transition-delay:.04s}.stagger.in>*:nth-child(2){transition-delay:.10s}
.stagger.in>*:nth-child(3){transition-delay:.16s}.stagger.in>*:nth-child(4){transition-delay:.22s}
.stagger.in>*:nth-child(5){transition-delay:.28s}.stagger.in>*:nth-child(6){transition-delay:.34s}
.tier-card{transition:all .25s;}.tier-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(11,31,58,.14)!important;}
.benefit-card{transition:all .25s;}.benefit-card:hover{border-color:#047857!important;background:#f0fdf4!important;transform:translateY(-3px);}
.pw-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:11px 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;transition:all .2s;outline:none;}
.pw-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.pw-inp.err{border-color:#ef4444;background:#fef2f2;}
.pw-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.pw-chip{display:flex;align-items:center;gap:5px;padding:6px 12px;border:1.5px solid #e2eaf4;border-radius:8px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-size:12px;color:#374151;user-select:none;}
.pw-chip:hover{border-color:#047857;background:#f0fdf4;color:#047857;}
.pw-chip.on{border-color:#047857;background:#dcfce7;color:#047857;font-weight:600;}
.sec-ttl{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;color:#047857;letter-spacing:1.5px;text-transform:uppercase;padding:8px 0 7px;border-bottom:1px solid #e2eaf4;margin-bottom:14px;}
.btn-p{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#047857,#059669);color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;padding:13px 28px;border-radius:9px;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(4,120,87,.38);transition:all .25s;text-decoration:none;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(4,120,87,.48);}
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
export default function PartnerWithUs() {
  const formRef = useRef(null);
  const [r1, v1] = useScrollAnimation();
  const [r2, v2] = useScrollAnimation();
  return (
    <div className="pw">
      <style>{G}</style>
      <SEO title="Partner With Us" path="/partner-with-us"
        description="Hospitals and healthcare institutions — partner with We Care 4 'all' to reach more patients." />
      <section
        style={{
          background: "linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",
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
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Home
            </Link>
            <span style={{ color: "rgba(255,255,255,.25)" }}>/</span>
            <span
              style={{
                color: "#6ee7b7",
                fontSize: "13px",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Partner With Us
            </span>
          </div>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "11px",
              fontWeight: "700",
              color: "#6ee7b7",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Hospital Partnership
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(34px,5vw,58px)",
              fontWeight: "700",
              color: "#fff",
              lineHeight: "1.1",
              marginBottom: "14px",
            }}
          >
            Grow Your Hospital
            <br />
            <span style={{ color: "#34d399" }}>With Our Network.</span>
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: "17px",
              color: "rgba(255,255,255,.68)",
              lineHeight: "1.78",
              maxWidth: "490px",
              fontWeight: "300",
            }}
          >
            Join 50+ partner hospitals. Gain digital visibility, patient
            referrals, corporate tie-ups and campaign support through our
            three-tier partnership programme.
          </p>
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
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                color: "#047857",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Partnership Tiers
            </p>
            <h2
              style={{
                fontSize: "clamp(24px,3.5vw,40px)",
                fontWeight: "700",
                color: "#0b1f3a",
                margin: "0 0 10px",
              }}
            >
              Choose Your Partnership Level
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                color: "#64748b",
                maxWidth: "440px",
                margin: "0 auto",
                fontWeight: "300",
              }}
            >
              Pricing for Growth and Strategic tiers is set by our admin team —
              contact us for a quote.
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
            {TIERS.map(
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
                    boxShadow: "0 2px 12px rgba(11,31,58,.06)",
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
                        fontFamily: "'DM Sans',sans-serif",
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
                      color: "#0b1f3a",
                      margin: "0 0 4px",
                    }}
                  >
                    {label}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'DM Sans',sans-serif",
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
                          fontFamily: "'DM Sans',sans-serif",
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
                      fontFamily: "'DM Sans',sans-serif",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    Apply Now →
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
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                color: "#047857",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Benefits
            </p>
            <h2
              style={{
                fontSize: "clamp(24px,3.5vw,38px)",
                fontWeight: "700",
                color: "#0b1f3a",
                margin: 0,
              }}
            >
              Why Partner With We Care 4 'all'?
            </h2>
          </div>
          <div
            ref={r2}
            className={`stagger${v2 ? " in" : ""}`}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              gap: "16px",
            }}
          >
            {[
              [
                "📈",
                "Patient Referrals",
                "Qualified patients referred directly to your specialties.",
              ],
              [
                "🌐",
                "Digital Visibility",
                "Featured listings, blog mentions and social campaigns.",
              ],
              [
                "🏢",
                "Corporate Tie-ups",
                "Access to corporate clients for employee health programmes.",
              ],
              [
                "🌍",
                "International Patients",
                "Exposure to medical tourists reaching India from other countries.",
              ],
              [
                "📊",
                "Analytics & Insights",
                "Monthly reports on referral count, views and enquiries.",
              ],
              [
                "🏅",
                "Credibility & Trust",
                "Euro Cert certified platform builds patient confidence.",
              ],
            ].map(([ic, t, d]) => (
              <div
                key={t}
                className="benefit-card"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2eaf4",
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
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#0b1f3a",
                    margin: "0 0 6px",
                  }}
                >
                  {t}
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "13px",
                    color: "#94a3b8",
                    lineHeight: "1.65",
                    margin: 0,
                    fontWeight: "300",
                  }}
                >
                  {d}
                </p>
              </div>
            ))}
          </div>
        </W>
      </section>
      {/* Hospital Network CTA */}
      <section style={{background:"linear-gradient(135deg,#0b1f3a 0%,#112d52 100%)",padding:"56px 24px"}}>
        <div style={{maxWidth:"900px",margin:"0 auto",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          flexWrap:"wrap",gap:"28px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
              color:"rgba(52,211,153,.8)",letterSpacing:"2px",textTransform:"uppercase",
              marginBottom:"10px"}}>OUR PARTNER NETWORK</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",
              fontSize:"clamp(24px,3.5vw,36px)",fontWeight:"700",color:"#fff",
              margin:"0 0 10px",lineHeight:1.15}}>
              Hospitals Already With Us
            </h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
              color:"rgba(255,255,255,.6)",margin:0,maxWidth:"440px",lineHeight:1.65}}>
              Browse our verified partner hospitals — Strategic, Growth & Network tier hospitals
              with full profiles, banners, videos and more.
            </p>
          </div>
          <a href="/our-hospitals"
            style={{display:"inline-flex",alignItems:"center",gap:"10px",
              background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
              padding:"14px 30px",borderRadius:"12px",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",
              textDecoration:"none",boxShadow:"0 6px 24px rgba(4,120,87,.35)",
              flexShrink:0,whiteSpace:"nowrap"}}>
            🏥 View All Partner Hospitals →
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
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "11px",
                fontWeight: "700",
                color: "#047857",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              Apply Now
            </p>
            <h2
              style={{
                fontSize: "clamp(24px,3.5vw,38px)",
                fontWeight: "700",
                color: "#0b1f3a",
                margin: "0 0 9px",
              }}
            >
              Hospital Empanelment Application
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                color: "#64748b",
                maxWidth: "460px",
                margin: "0 auto",
                fontWeight: "300",
              }}
            >
              Fill in your hospital details across 4 easy steps. Our team will
              review and respond within 3 business days.
            </p>
          </div>
          <div ref={formRef}
            style={{
              maxWidth: "840px",
              margin: "0 auto",
              background: "#fff",
              border: "1px solid #e2eaf4",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(11,31,58,.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,#047857,#059669)",
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
                Empanelment Request Form
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: "12px",
                  color: "rgba(255,255,255,.78)",
                }}
              >
                Fields marked * are required
              </p>
            </div>
            <EmpanelForm formRef={formRef} />
          </div>
        </W>
      </section>
      <section
        style={{
          background: "linear-gradient(135deg,#0b1f3a,#112d52)",
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
              Have Questions Before Applying?
            </h3>
            <p
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: "14px",
                color: "rgba(255,255,255,.62)",
              }}
            >
              Call us Monday – Saturday, 9 AM – 6 PM
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
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: "500",
                fontSize: "15px",
                padding: "13px 26px",
                borderRadius: "9px",
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
