/**
 * VideoCall.jsx — Jitsi Meet video consultation page
 * Embedded in iframe — patient joins from here
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&display=swap');
.vc{font-family:'DM Sans',sans-serif;background:#060f1c;min-height:100vh;color:#fff;}
.vc *{box-sizing:border-box;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:36px;height:36px;border:3px solid rgba(255,255,255,.2);
  border-top:3px solid #10b981;border-radius:50%;
  animation:spin .8s linear infinite;margin:0 auto;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.pulse{animation:pulse 2s ease-in-out infinite;}
`;

export default function VideoCall() {
  const { appointmentId }     = useParams();
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [joinInfo, setJoinInfo] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [joined, setJoined]     = useState(false);
  const [ending, setEnding]     = useState(false);

  useEffect(() => {
    document.title = "Video Consultation — We Care 4 'all'";
    fetchJoinInfo();
  }, [appointmentId]);

  const fetchJoinInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/video/join/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json  = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed to get video link");
      setJoinInfo(json);
    } catch (ex) {
      setError(ex.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => setJoined(true);

  const handleEnd = async () => {
    if (!window.confirm("End this consultation?")) return;
    setEnding(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      await fetch(`${API}/video/session/${appointmentId}/end`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    navigate("/patient/dashboard");
  };

  if (loading) return (
    <div className="vc" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{G}</style>
      <div style={{textAlign:"center"}}>
        <div className="spin"/>
        <p style={{fontFamily:"'DM Sans',sans-serif",color:"rgba(255,255,255,.6)",marginTop:"14px"}}>
          Connecting to video session…
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div className="vc" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{G}</style>
      <div style={{textAlign:"center",maxWidth:"440px",padding:"24px"}}>
        <div style={{fontSize:"48px",marginBottom:"16px"}}>⚠️</div>
        <h2 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"22px",fontWeight:"700",marginBottom:"10px"}}>
          Cannot Join Call
        </h2>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
          color:"rgba(255,255,255,.6)",marginBottom:"24px",lineHeight:"1.7"}}>
          {error}
        </p>
        <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
          <Link to="/patient/dashboard" style={{padding:"11px 24px",borderRadius:"9px",
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px"}}>
            ← Back to Dashboard
          </Link>
          <a href="tel:+919025786467" style={{padding:"11px 24px",borderRadius:"9px",
            background:"rgba(255,255,255,.10)",border:"1px solid rgba(255,255,255,.20)",
            color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"500",fontSize:"14px"}}>
            📞 Call Support
          </a>
        </div>
      </div>
    </div>
  );

  if (!joined) return (
    <div className="vc" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{G}</style>
      <div style={{maxWidth:"480px",width:"100%",padding:"24px"}}>
        {/* Ready screen */}
        <div style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",
          borderRadius:"20px",padding:"36px",textAlign:"center",backdropFilter:"blur(12px)"}}>

          <div style={{width:"72px",height:"72px",background:"linear-gradient(135deg,#047857,#059669)",
            borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
            margin:"0 auto 20px",fontSize:"28px"}}>🎥</div>

          <h2 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"22px",fontWeight:"700",
            marginBottom:"8px"}}>Ready to Join?</h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
            color:"rgba(255,255,255,.6)",marginBottom:"24px",lineHeight:"1.7"}}>
            Your video consultation is ready.<br/>
            Make sure your <strong>camera and microphone</strong> are allowed.
          </p>

          {/* Pre-call checklist */}
          <div style={{background:"rgba(4,120,87,.15)",border:"1px solid rgba(16,185,129,.25)",
            borderRadius:"12px",padding:"16px",marginBottom:"24px",textAlign:"left"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
              color:"#6ee7b7",marginBottom:"10px"}}>Before Joining:</p>
            {["Allow camera & microphone when browser asks",
              "Use Chrome or Firefox for best experience",
              "Find a quiet, well-lit place",
              "Keep your prescription/reports ready",
            ].map((item,i) => (
              <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start",marginBottom:"7px"}}>
                <span style={{color:"#10b981",fontSize:"13px",flexShrink:0}}>✓</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                  color:"rgba(255,255,255,.7)"}}>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={handleJoin} style={{
            width:"100%",padding:"14px",borderRadius:"10px",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",
            boxShadow:"0 4px 18px rgba(4,120,87,.45)",transition:"all .25s",
          }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            🎥 Join Video Consultation
          </button>

          <Link to="/patient/dashboard" style={{display:"block",marginTop:"14px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
            color:"rgba(255,255,255,.45)"}}>← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );

  // Joined — show Jitsi iframe
  const displayName = encodeURIComponent(user?.name || user?.email || "Patient");
  const jitsiUrl = `${joinInfo.join_url}#userInfo.displayName="${displayName}"&config.startWithVideoMuted=false&config.startWithAudioMuted=false&config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","hangup","chat","tileview","fullscreen"]`;

  return (
    <div className="vc" style={{display:"flex",flexDirection:"column"}}>
      <style>{G}</style>

      {/* Top bar */}
      <div style={{background:"#0b1f3a",padding:"10px 20px",display:"flex",
        justifyContent:"space-between",alignItems:"center",flexShrink:0,
        borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"8px",height:"8px",background:"#10b981",borderRadius:"50%"}} className="pulse"/>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:"600"}}>
            Video Consultation — Live
          </span>
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          <a href={joinInfo.join_url} target="_blank" rel="noreferrer"
            style={{padding:"7px 16px",borderRadius:"7px",background:"rgba(255,255,255,.10)",
              border:"1px solid rgba(255,255,255,.15)",color:"#fff",
              fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"500"}}>
            ↗ Open in New Tab
          </a>
          <button onClick={handleEnd} disabled={ending} style={{
            padding:"7px 16px",borderRadius:"7px",background:"#dc2626",border:"none",
            color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
            fontWeight:"600",cursor:"pointer"}}>
            {ending ? "Ending…" : "End Call"}
          </button>
        </div>
      </div>

      {/* Jitsi iframe */}
      <iframe
        src={jitsiUrl}
        style={{flex:1,width:"100%",border:"none",minHeight:"calc(100vh - 54px)"}}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        allowFullScreen
        title="Video Consultation"
      />
    </div>
  );
}
