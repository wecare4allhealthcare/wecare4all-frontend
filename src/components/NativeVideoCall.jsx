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
 *
 * Includes: screen sharing (swap the outgoing video track without
 * renegotiating the whole connection) and auto-reconnect (if the
 * signaling WebSocket drops unexpectedly — not from a deliberate
 * hangup — this retries a few times with backoff, reusing the already-
 * granted camera/mic stream rather than asking for permission again).
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API    = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
// Same host as the REST API, just swapping http(s):// for ws(s)://
const WS_BASE = API.replace(/^http/, "ws");

const MAX_RECONNECT_ATTEMPTS = 5;

export default function NativeVideoCall({ appointmentId, onEnd }) {
  const navigate = useNavigate();
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef     = useRef(null);   // RTCPeerConnection
  const wsRef     = useRef(null);   // signaling WebSocket
  const localStreamRef  = useRef(null); // camera+mic — kept alive across reconnects
  const screenStreamRef = useRef(null); // only set while screen-sharing
  const iceServersRef   = useRef([{ urls: "stun:stun.l.google.com:19302" }]);
  // ICE candidates that arrive before the remote description is set
  // must be queued, not applied immediately — applying one too early
  // throws. This is a normal, expected part of WebRTC's handshake
  // timing, not an error case.
  const pendingCandidates = useRef([]);
  const deliberateEndRef  = useRef(false); // true only when the user clicks hang up
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef   = useRef(null);

  const [status, setStatus]   = useState("connecting"); // connecting | waiting | connected | reconnecting | ended | error
  const [errorMsg, setErrorMsg] = useState("");
  const [micOn, setMicOn]     = useState(true);
  const [camOn, setCamOn]     = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);

  const cleanupConnection = () => {
    wsRef.current?.close();
    pcRef.current?.close();
    wsRef.current = null;
    pcRef.current = null;
    pendingCandidates.current = [];
  };

  // Sets up the WebRTC peer connection + signaling WebSocket. Reusable
  // both for the initial connection and for reconnect attempts — does
  // NOT touch localStreamRef, so the camera/mic stay on and no new
  // permission prompt is triggered on a reconnect.
  const connectSignaling = useCallback(() => {
    cleanupConnection();

    const token = localStorage.getItem("wc4a_token");
    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
    pcRef.current = pc;

    const stream = localStreamRef.current;
    if (stream) stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setStatus("connected");
      reconnectAttemptRef.current = 0; // a fresh successful connection resets the retry counter
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ice-candidate", candidate: event.candidate }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" && !deliberateEndRef.current) {
        attemptReconnect();
      }
    };

    const ws = new WebSocket(`${WS_BASE}/ws/video/${appointmentId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setStatus(s => s === "reconnecting" ? "reconnecting" : "waiting");

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "ready") {
        if (msg.role === "offerer") {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          ws.send(JSON.stringify({ type: "offer", sdp: offer }));
        }
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

    ws.onerror = () => {
      if (!deliberateEndRef.current) attemptReconnect();
    };
    ws.onclose = (event) => {
      if (deliberateEndRef.current) return;
      if (event.code === 4401) { setStatus("error"); setErrorMsg("Your session has expired — please log in again."); return; }
      if (event.code === 4403) { setStatus("error"); setErrorMsg("You're not authorized to join this call."); return; }
      if (event.code === 4409) { setStatus("error"); setErrorMsg("This call already has two participants."); return; }
      // Anything else (network drop, server restart, etc.) — retry.
      attemptReconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const attemptReconnect = useCallback(() => {
    if (deliberateEndRef.current) return;
    if (reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setStatus("error");
      setErrorMsg("Lost connection and couldn't reconnect. Please check your internet connection and try again.");
      return;
    }
    reconnectAttemptRef.current += 1;
    setStatus("reconnecting");
    const delay = Math.min(1000 * reconnectAttemptRef.current, 5000); // 1s, 2s, 3s, 4s, 5s cap
    reconnectTimerRef.current = setTimeout(() => {
      if (!deliberateEndRef.current) connectSignaling();
    }, delay);
  }, [connectSignaling]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const token = localStorage.getItem("wc4a_token");
      if (!token) { setStatus("error"); setErrorMsg("Not logged in."); return; }

      try {
        const res = await fetch(`${API}/webrtc/ice-servers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { const j = await res.json(); iceServersRef.current = j.ice_servers || iceServersRef.current; }
      } catch { /* keep the default STUN server already set */ }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (err) {
        setStatus("error");
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

      connectSignaling();
    };

    init();

    return () => {
      cancelled = true;
      deliberateEndRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      cleanupConnection();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(v => !v);
  };
  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(v => !v);
  };

  // Screen sharing — swaps the outgoing video track on the existing
  // peer connection (RTCRtpSender.replaceTrack) rather than
  // renegotiating the whole call, so the other person sees the switch
  // instantly with no reconnect/flicker.
  const startScreenShare = async () => {
    let screenStream;
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    } catch {
      return; // user cancelled the "choose what to share" browser dialog — not an error
    }
    screenStreamRef.current = screenStream;
    const screenTrack = screenStream.getVideoTracks()[0];

    const sender = pcRef.current?.getSenders().find(s => s.track && s.track.kind === "video");
    if (sender) await sender.replaceTrack(screenTrack);
    if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

    // The browser's own "Stop sharing" control (outside our UI) also
    // needs to trigger reverting back to the camera.
    screenTrack.onended = () => stopScreenShare();

    setSharingScreen(true);
  };

  const stopScreenShare = async () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;

    const cameraStream = localStreamRef.current;
    const cameraTrack = cameraStream?.getVideoTracks()[0];
    const sender = pcRef.current?.getSenders().find(s => s.track && s.track.kind === "video");
    if (sender && cameraTrack) await sender.replaceTrack(cameraTrack);
    if (localVideoRef.current) localVideoRef.current.srcObject = cameraStream;

    setSharingScreen(false);
  };
  const toggleScreenShare = () => { sharingScreen ? stopScreenShare() : startScreenShare(); };

  const hangUp = () => {
    deliberateEndRef.current = true;
    clearTimeout(reconnectTimerRef.current);
    wsRef.current?.send(JSON.stringify({ type: "hangup" }));
    cleanupConnection();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
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
            {status === "reconnecting" && (
              <>
                <p style={{fontSize:"15px"}}>Connection lost — reconnecting…</p>
                <p style={{fontSize:"12px",color:"rgba(255,255,255,.5)"}}>Attempt {reconnectAttemptRef.current} of {MAX_RECONNECT_ATTEMPTS}</p>
              </>
            )}
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

        {sharingScreen && (
          <div style={{ position:"absolute", top:"14px", left:"14px", background:"#dc2626",
            color:"#fff", padding:"5px 12px", borderRadius:"6px", fontSize:"12px",
            fontFamily:"'DM Sans',sans-serif", fontWeight:"600" }}>
            🖥️ Sharing your screen
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
        <button onClick={toggleScreenShare} style={ctrlBtnStyle(!sharingScreen)} title={sharingScreen ? "Stop sharing" : "Share screen"}>
          {sharingScreen ? "🛑" : "🖥️"}
        </button>
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
