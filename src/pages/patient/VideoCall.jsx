/**
 * VideoCall.jsx — native video consultation page. No external video
 * service — this renders NativeVideoCall.jsx, which talks directly to
 * our own backend's WebSocket signaling endpoint and connects
 * peer-to-peer straight to the doctor's browser.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NativeVideoCall from "../../components/NativeVideoCall";

const G = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap');
.vc{font-family:'DM Sans',sans-serif;background:#060f1c;min-height:100vh;color:#fff;}
.vc *{box-sizing:border-box;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:36px;height:36px;border:3px solid rgba(255,255,255,.2);
  border-top:3px solid #10b981;border-radius:50%;
  animation:spin .8s linear infinite;margin:0 auto;}
`;

export default function VideoCall() {
  const { t } = useTranslation();
  const { appointmentId } = useParams();
  const navigate           = useNavigate();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    document.title = "Video Consultation — We Care 4 'all'";
  }, []);

  if (joined) {
    return <NativeVideoCall appointmentId={appointmentId} onEnd={() => navigate("/patient/dashboard")} />;
  }

  return (
    <div className="vc" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{G}</style>
      <div style={{maxWidth:"480px",width:"100%",padding:"24px"}}>
        <div style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",
          borderRadius:"20px",padding:"36px",textAlign:"center",backdropFilter:"blur(12px)"}}>

          <div style={{width:"72px",height:"72px",background:"linear-gradient(135deg,#047857,#059669)",
            borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 20px",fontSize:"28px"}}>🎥</div>

          <h2 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"22px",fontWeight:"700",
            marginBottom:"8px"}}>{t("videoCallPage.readyTitle")}</h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
            color:"rgba(255,255,255,.6)",marginBottom:"24px",lineHeight:"1.7"}}>
            {t("videoCallPage.readyDesc")}<br/>
            <strong>{t("videoCallPage.readyDescStrong")}</strong> {t("videoCallPage.readyDescSuffix")}
          </p>

          <div style={{background:"rgba(4,120,87,.15)",border:"1px solid rgba(16,185,129,.25)",
            borderRadius:"12px",padding:"16px",marginBottom:"24px",textAlign:"left"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
              color:"#6ee7b7",marginBottom:"10px"}}>{t("videoCallPage.beforeJoining")}</p>
            {t("videoCallPage.checklist",{returnObjects:true}).map((item,i) => (
              <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"7px"}}>
                <span style={{color:"#10b981",fontSize:"13px",flexShrink:0}}>✓</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                  color:"rgba(255,255,255,.7)"}}>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={() => setJoined(true)} style={{
            width:"100%",padding:"14px",borderRadius:"10px",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",
            boxShadow:"0 4px 18px rgba(4,120,87,.45)",transition:"all .25s",
          }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            {t("videoCallPage.joinBtn")}
          </button>

          <Link to="/patient/dashboard" style={{display:"block",marginTop:"14px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"rgba(255,255,255,.45)"}}>{t("videoCallPage.backToDashboard")}</Link>
        </div>
      </div>
    </div>
  );
}
