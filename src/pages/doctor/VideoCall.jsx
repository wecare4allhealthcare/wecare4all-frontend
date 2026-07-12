/**
 * VideoCall.jsx (doctor) — native video consultation page, mirrors the
 * patient version. No external video service — talks directly to our
 * own backend's WebSocket signaling endpoint.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import NativeVideoCall from "../../components/NativeVideoCall";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap');
.vc{font-family:'DM Sans',sans-serif;background:#060f1c;min-height:100vh;color:#fff;}
.vc *{box-sizing:border-box;}
`;

export default function DoctorVideoCall() {
  const { appointmentId } = useParams();
  const navigate           = useNavigate();
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    document.title = "Video Consultation — We Care 4 'all'";
  }, []);

  const handleEnd = async () => {
    try {
      const token = localStorage.getItem("wc4a_token");
      await fetch(`${API}/video/session/${appointmentId}/end`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    navigate("/doctor/dashboard");
  };

  if (joined) {
    return <NativeVideoCall appointmentId={appointmentId} onEnd={handleEnd} />;
  }

  return (
    <div className="vc" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{G}</style>
      <div style={{maxWidth:"480px",width:"100%",padding:"24px"}}>
        <div style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",
          borderRadius:"20px",padding:"36px",textAlign:"center",backdropFilter:"blur(12px)"}}>

          <div style={{width:"72px",height:"72px",background:"linear-gradient(135deg,#0b1f3a,#1e3a5f)",
            borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 20px",fontSize:"28px"}}>🎥</div>

          <h2 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"22px",fontWeight:"700",
            marginBottom:"8px"}}>Ready to Join?</h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
            color:"rgba(255,255,255,.6)",marginBottom:"24px",lineHeight:"1.7"}}>
            Your patient's video consultation is ready.<br/>
            Make sure your <strong>camera and microphone</strong> are allowed.
          </p>

          <button onClick={() => setJoined(true)} style={{
            width:"100%",padding:"14px",borderRadius:"10px",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#0b1f3a,#1e3a5f)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",
            boxShadow:"0 4px 18px rgba(11,31,58,.45)",transition:"all .25s",
          }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            🎥 Join Video Consultation
          </button>

          <Link to="/doctor/dashboard" style={{display:"block",marginTop:"14px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"rgba(255,255,255,.45)"}}>← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
