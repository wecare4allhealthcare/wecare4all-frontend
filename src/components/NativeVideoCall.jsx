/**
 * NativeVideoCall.jsx — the actual video call screen. No iframe, no
 * external video service — this talks directly to our own backend's
 * WebSocket signaling endpoint (app/routes/webrtc.py) and then connects
 * peer-to-peer straight to the other person's browser using WebRTC,
 * a standard capability built into every modern browser.
 *
 * Used by both the doctor and patient video call pages — pass
 * `appointmentId` and it handles the rest. Nothing here needs to know
 * or care which role it's running as; the backend already worked that
 * out during signaling.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API    = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
// Same host as the REST API, just swapping http(s):// for ws(s)://
const WS_BASE = API.replace(/^http/, "ws");

export default function NativeVideoCall({ appointmentId, onEnd }) {
  const navigate = useNavigate();
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef     = useRef(null);   // RTCPeerConnection
  const wsRef     = useRef(null);   // signaling WebSocket
  const localStreamRef = useRef(null);
  // ICE candidates that arrive before the remote description is set
  // must be queued, not applied immediately — applying one too early
  // throws. This is a normal, expected part of WebRTC's handshake
  // timing, not an error case.
  const pendingCandidates = useRef([]);

  const [status, setStatus]   = useState("connecting"); // connecting | waiting | connected | ended | error
  const [errorMsg, setErrorMsg] = useState("");
  const [micOn, setMicOn]     = useState(true);
  const [camOn, setCamOn]     = useState(true);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const token = localStorage.getItem("wc4a_token");
      if (!token) { setStatus("error"); setErrorMsg("Not logged in."); return; }

      // 1. Get the ICE server list from our own backend (currently
      // just Google's free public STUN — see webrtc.py's
      // get_ice_servers() for why no TURN server is needed yet).
      let iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
      try {
        const res = await fetch(`${API}/webrtc/ice-servers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { const j = await res.json(); iceServers = j.ice_servers || iceServers; }
      } catch { /* fall back to the default above */ }

      // 2. Get the camera/mic. Must happen before creating the peer
      // connection so tracks exist to attach to it.
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (err) {
        setStatus("error");
        // Different underlying causes need different fixes — showing
        // the real reason instead of one generic message.
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMsg("Camera/microphone access was denied. Open your browser's site settings for this page and set Camera and Microphone to \"Allow\", then reload.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMsg("No camera or microphone was found on this device.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setErrorMsg("Your camera is already being used by another app or browser tab. Close it there and try again.");
        } else {
          setErrorMsg(`Couldn't access camera/microphone (${err.name || "unknown error"}). Check your browser's permission settings for this site.`);
        }
        return;
      }
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // 3. Set up the peer connection.
      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("connected");
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") {
          setStatus("error");
          setErrorMsg("Couldn't establish a direct connection — this can happen on some restrictive networks (hotel/office WiFi, some mobile carriers). Try a different network, or contact support.");
        }
      };

      // 4. Connect to our own signaling WebSocket.
      const ws = new WebSocket(`${WS_BASE}/ws/video/${appointmentId}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => setStatus("waiting");

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "ready") {
          // Both participants are now present. Only the assigned
          // "offerer" starts the handshake — see webrtc.py's module
          // docstring for why this fixed assignment matters.
          if (msg.role === "offerer") {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(JSON.stringify({ type: "offer", sdp: offer }));
          }
          // The "answerer" just waits for an "offer" message below.
        }

        else if (msg.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          for (const c of pendingCandidates.current) await pc.addIceCandidate(c);
          pendingCandidates.current = [];
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "answer", sdp: answer }));
        }

        else if (msg.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          for (const c of pendingCandidates.current) await pc.addIceCandidate(c);
          pendingCandidates.current = [];
        }

        else if (msg.type === "ice-candidate") {
          const candidate = new RTCIceCandidate(msg.candidate);
          if (pc.remoteDescription) await pc.addIceCandidate(candidate);
          else pendingCandidates.current.push(candidate);
        }

        else if (msg.type === "peer-left" || msg.type === "peer-hangup") {
          setStatus("ended");
        }
      };

      ws.onerror = () => { setStatus("error"); setErrorMsg("Connection to the server was lost."); };
      ws.onclose = (event) => {
        if (cancelled) return;
        if (event.code === 4401) { setStatus("error"); setErrorMsg("Your session has expired — please log in again."); }
        else if (event.code === 4403) { setStatus("error"); setErrorMsg("You're not authorized to join this call."); }
        else if (event.code === 4409) { setStatus("error"); setErrorMsg("This call already has two participants."); }
        else setStatus(s => s === "connected" ? "ended" : s);
      };
    };

    start();

    return () => {
      cancelled = true;
      wsRef.current?.close();
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [appointmentId]);

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(v => !v);
  };
  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(v => !v);
  };
  const hangUp = () => {
    wsRef.current?.send(JSON.stringify({ type: "hangup" }));
    wsRef.current?.close();
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    if (onEnd) onEnd(); else navigate(-1);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"#0b1220", display:"flex", flexDirection:"column" }}>
      <div style={{ flex:1, position:"relative", minHeight:0 }}>
        <video ref={remoteVideoRef} autoPlay playsInline
          style={{ width:"100%", height:"100%", objectFit:"cover", background:"#111827" }} />

        {status !== "connected" && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:"14px", color:"#fff",
            fontFamily:"'DM Sans',sans-serif", textAlign:"center", padding:"24px" }}>
            {status === "connecting" && <p style={{fontSize:"15px"}}>Setting up your camera…</p>}
            {status === "waiting"    && <p style={{fontSize:"15px"}}>Waiting for the other person to join…</p>}
            {status === "ended"      && <p style={{fontSize:"15px"}}>The call has ended.</p>}
            {status === "error"      && (
              <>
                <p style={{fontSize:"15px",color:"#fca5a5",maxWidth:"420px"}}>{errorMsg}</p>
                <button onClick={()=>window.location.reload()}
                  style={{marginTop:"8px",padding:"9px 20px",borderRadius:"8px",border:"1px solid rgba(255,255,255,.3)",
                    background:"rgba(255,255,255,.08)",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  Try Again
                </button>
              </>
            )}
          </div>
        )}

        <video ref={localVideoRef} autoPlay playsInline muted
          style={{ position:"absolute", bottom:"90px", right:"16px", width:"140px", height:"105px",
            borderRadius:"10px", objectFit:"cover", border:"2px solid rgba(255,255,255,.25)",
            background:"#1f2937", boxShadow:"0 4px 16px rgba(0,0,0,.4)" }} />
      </div>

      <div style={{ padding:"18px", display:"flex", justifyContent:"center", gap:"14px",
        background:"rgba(0,0,0,.4)", flexShrink:0 }}>
        <button onClick={toggleMic} style={ctrlBtnStyle(micOn)}>{micOn ? "🎤" : "🔇"}</button>
        <button onClick={toggleCam} style={ctrlBtnStyle(camOn)}>{camOn ? "🎥" : "📵"}</button>
        <button onClick={hangUp} style={{...ctrlBtnStyle(true), background:"#dc2626"}}>📞</button>
      </div>
    </div>
  );
}

function ctrlBtnStyle(active) {
  return {
    width:"52px", height:"52px", borderRadius:"50%", border:"none",
    background: active ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.06)",
    color:"#fff", fontSize:"20px", cursor:"pointer",
    display:"flex", alignItems:"center", justifyContent:"center",
  };
}
