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

// Matches the backend's ALLOWED_TYPES in app/routes/video_chat.py exactly
// — kept in sync manually since there's no shared schema between the two.
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

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
  const [screenShareError, setScreenShareError] = useState("");
  // Computed once — whether this browser exposes the screen-capture
  // API at all. This is the same check that correctly detected the
  // unsupported mobile browser in testing (showed the "not supported"
  // message), so it's reliable to hide the button entirely on it
  // rather than showing a button that will just error every time.
  const [supportsScreenShare] = useState(() => !!navigator.mediaDevices?.getDisplayMedia);
  // Whether the OTHER person is currently sharing their screen — used
  // to switch the remote video's object-fit from "cover" (crops to
  // fill, fine for a face-camera feed) to "contain" (fits the whole
  // frame without cropping, essential for a screen-share so a wide
  // desktop screen isn't cropped down to a narrow vertical slice on a
  // mobile viewer's portrait screen).
  const [remoteIsSharingScreen, setRemoteIsSharingScreen] = useState(false);

  // Pin/unpin — in a 2-person call this just means "which video is the
  // big main view": the other person's (default, pinnedSelf=false) or
  // your own (pinnedSelf=true). Clicking either video tile toggles it.
  const [pinnedSelf, setPinnedSelf] = useState(false);
  const [connectedAt, setConnectedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status === "connected" && !connectedAt) setConnectedAt(Date.now());
  }, [status, connectedAt]);

  useEffect(() => {
    if (!connectedAt) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - connectedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [connectedAt]);

  const formatElapsed = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── Live chat + file sharing ──────────────────────────────────
  // Text messages are relayed live only (never touch the server beyond
  // the existing signaling socket — see migration_008's docstring for
  // why). Files ARE persisted server-side (video_call_files table) so
  // a shared prescription/lab report is still there after a reload or
  // once the call ends.
  const [chatOpen, setChatOpen]         = useState(false);
  const [messages, setMessages]         = useState([]); // {id, from:'me'|'peer', kind:'text'|'file', text?, fileName?, contentType?, url?, ts}
  const [chatInput, setChatInput]       = useState("");
  const [unreadCount, setUnreadCount]   = useState(0);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileError, setFileError]       = useState("");
  const chatFileInputRef = useRef(null);
  const chatEndRef        = useRef(null);
  const myUserIdRef       = useRef(null); // decoded once from the JWT's `sub` claim

  useEffect(() => {
    if (chatOpen) {
      setUnreadCount(0);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatOpen, messages]);

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
    const pc = new RTCPeerConnection({
      iceServers: iceServersRef.current,
      bundlePolicy: "max-bundle",     // one ICE negotiation for audio+video instead of two — faster to connect
      iceCandidatePoolSize: 4,        // pre-gather candidates before the offer/answer exchange starts
    });
    pcRef.current = pc;

    const stream = localStreamRef.current;
    if (stream) stream.getTracks().forEach(track => {
      const sender = pc.addTrack(track, stream);
      // Prioritize smooth, low-latency delivery over maximum resolution
      // when the network is constrained — degrading resolution first
      // keeps audio and motion smooth rather than everything stuttering.
      if (track.kind === "video" && sender.setParameters) {
        const params = sender.getParameters();
        params.degradationPreference = "maintain-framerate";
        try { sender.setParameters(params); } catch { /* not supported on this browser — fine, defaults still work */ }
      }
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      setStatus("connected");
      reconnectAttemptRef.current = 0; // a fresh successful connection resets the retry counter
      syncFiles(); // catch anything shared while we were disconnected
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
      else if (msg.type === "screen-share-status") {
        setRemoteIsSharingScreen(!!msg.sharing);
      }
      else if (msg.type === "chat-message") {
        setMessages(prev => [...prev, {
          id: `peer-${Date.now()}-${Math.random()}`,
          from: "peer",
          kind: msg.message_type === "file" ? "file" : "text",
          text: msg.text,
          fileName: msg.file_name,
          contentType: msg.content_type,
          url: msg.url,
          ts: Date.now(),
        }]);
        setChatOpen(open => { if (!open) setUnreadCount(c => c + 1); return open; });
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

  // Pulls in anything shared via the persisted video_call_files table
  // (prescriptions/reports) that this tab doesn't have yet — used both
  // on first load AND every time the connection is (re)established, so
  // a file shared while the peer was mid-reconnect still shows up
  // automatically instead of needing a manual page refresh.
  const syncFiles = useCallback(async () => {
    try {
      const token = localStorage.getItem("wc4a_token");
      const filesRes = await fetch(`${API}/video-chat/${appointmentId}/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!filesRes.ok) return;
      const { files } = await filesRes.json();
      setMessages(prev => {
        const known = new Set(prev.map(m => m.id));
        const fresh = (files || [])
          .filter(f => !known.has(f.id))
          .map(f => ({
            id: f.id,
            from: String(f.sender_id) === myUserIdRef.current ? "me" : "peer",
            kind: "file",
            fileName: f.file_name,
            contentType: f.content_type,
            url: f.url,
            ts: new Date(f.uploaded_at).getTime(),
          }));
        if (fresh.length === 0) return prev;
        return [...prev, ...fresh].sort((a, b) => a.ts - b.ts);
      });
    } catch { /* non-critical — chat history is a nice-to-have, not required to join the call */ }
  }, [appointmentId]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const token = localStorage.getItem("wc4a_token");
      if (!token) { setStatus("error"); setErrorMsg("Not logged in."); return; }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        myUserIdRef.current = String(payload.sub);
      } catch { /* worst case, file messages just all show as "peer" */ }

      // Pull in anything already shared in this call (e.g. the doctor
      // sent a prescription, then this tab reloaded) so it isn't lost
      // from view.
      await syncFiles();

      try {
        const res = await fetch(`${API}/webrtc/ice-servers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { const j = await res.json(); iceServersRef.current = j.ice_servers || iceServersRef.current; }
      } catch { /* keep the default STUN server already set */ }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width:       { ideal: 1280, max: 1920 },
            height:      { ideal: 720,  max: 1080 },
            frameRate:   { ideal: 30, max: 30 },
            facingMode:  "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl:  true,
          },
        });
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
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setScreenShareError("Screen sharing isn't supported on this browser/device. It generally only works on desktop browsers (Chrome, Edge, Firefox) — most mobile browsers don't support it yet.");
      return;
    }
    let screenStream;
    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    } catch (err) {
      // NotAllowedError here usually means the user just cancelled the
      // "choose what to share" browser dialog — not a real error worth
      // showing. Anything else (NotSupportedError etc.) is worth telling
      // them about, since silently doing nothing is confusing.
      if (err.name !== "NotAllowedError") {
        setScreenShareError("Couldn't start screen sharing on this device/browser.");
      }
      return;
    }
    setScreenShareError("");
    screenStreamRef.current = screenStream;
    const screenTrack = screenStream.getVideoTracks()[0];

    const sender = pcRef.current?.getSenders().find(s => s.track && s.track.kind === "video");
    if (sender) await sender.replaceTrack(screenTrack);
    if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

    // The browser's own "Stop sharing" control (outside our UI) also
    // needs to trigger reverting back to the camera.
    screenTrack.onended = () => stopScreenShare();

    setSharingScreen(true);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "screen-share-status", sharing: true }));
    }
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
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "screen-share-status", sharing: false }));
    }
  };
  const toggleScreenShare = () => { sharingScreen ? stopScreenShare() : startScreenShare(); };

  const [chatSendError, setChatSendError] = useState("");

  useEffect(() => {
    if (status === "connected" && chatSendError) setChatSendError("");
  }, [status, chatSendError]);

  const sendChatText = () => {
    const text = chatInput.trim();
    if (!text) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      setChatSendError("Connection lost — message not sent. It'll go through once you're reconnected.");
      return;
    }
    setChatSendError("");
    wsRef.current.send(JSON.stringify({ type: "chat-message", message_type: "text", text }));
    setMessages(prev => [...prev, {
      id: `me-${Date.now()}`, from: "me", kind: "text", text, ts: Date.now(),
    }]);
    setChatInput("");
  };

  const sendChatFile = async (file) => {
    if (!file) return;
    setFileError("");
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Only PDF, JPEG, PNG, or WebP files are allowed");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError("File must be under 10MB");
      return;
    }
    setUploadingFile(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/video-chat/${appointmentId}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets the multipart boundary itself
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Upload failed");
      const f = json.file;
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "chat-message", message_type: "file",
          file_name: f.file_name, content_type: f.content_type, url: f.url,
        }));
      }
      setMessages(prev => [...prev, {
        id: f.id || `me-${Date.now()}`, from: "me", kind: "file",
        fileName: f.file_name, contentType: f.content_type, url: f.url, ts: Date.now(),
      }]);
    } catch (ex) {
      setFileError(ex.message || "Upload failed");
    } finally {
      setUploadingFile(false);
    }
  };

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
    <div style={{ position:"fixed", inset:0, background:"linear-gradient(160deg,var(--wc-navy),#06101f)",
      display:"flex", flexDirection:"column", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes wc4a-spin { to { transform: rotate(360deg); } }`}</style>
      {/* Branded header — replaces the bare Gmeet-style dark screen with
          our own identity: logo, call status, and a running timer. */}
      <div style={{ flexShrink:0, padding:"12px 18px", display:"flex", alignItems:"center",
        justifyContent:"space-between", background:"rgba(11,31,58,.55)", backdropFilter:"blur(8px)",
        borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
          <span style={{ width:"30px", height:"30px", borderRadius:"9px",
            background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", display:"flex",
            alignItems:"center", justifyContent:"center", fontSize:"15px" }}>🩺</span>
          <span style={{ color:"#fff", fontWeight:"700", fontSize:"14px",
            fontFamily:"'Cormorant Garamond',serif" }}>We Care 4 'all' — Video Consultation</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          {status === "connected" && (
            <span style={{ display:"flex", alignItems:"center", gap:"6px", color:"var(--wc-green-pale)",
              fontSize:"12.5px", fontWeight:"600", background:"rgba(4,120,87,.18)",
              border:"1px solid rgba(16,185,129,.3)", borderRadius:"20px", padding:"4px 12px" }}>
              <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"var(--wc-green-light)" }}/>
              {formatElapsed(elapsed)}
            </span>
          )}
        </div>
      </div>

      <div style={{ flex:1, position:"relative", minHeight:0 }}>
        <video ref={remoteVideoRef} autoPlay playsInline
          onClick={()=>setPinnedSelf(false)}
          style={{ position:"absolute", cursor: pinnedSelf ? "pointer" : "default",
            transition:"all .25s ease",
            ...(pinnedSelf
              ? { bottom:"90px", right:"16px", width:"140px", height:"105px", borderRadius:"10px",
                  border:"2px solid rgba(255,255,255,.25)", boxShadow:"0 4px 16px rgba(0,0,0,.4)", zIndex:5 }
              : { inset:0, width:"100%", height:"100%", borderRadius:0, border:"none", boxShadow:"none", zIndex:1 }),
            objectFit: "contain",
            background:"#0d1826" }} />

        <video ref={localVideoRef} autoPlay playsInline muted
          onClick={()=>setPinnedSelf(true)}
          style={{ position:"absolute", cursor: pinnedSelf ? "default" : "pointer",
            transition:"all .25s ease",
            ...(pinnedSelf
              ? { inset:0, width:"100%", height:"100%", borderRadius:0, border:"none", boxShadow:"none", zIndex:1 }
              : { bottom:"90px", right:"16px", width:"140px", height:"105px", borderRadius:"10px",
                  border:"2px solid rgba(255,255,255,.25)", boxShadow:"0 4px 16px rgba(0,0,0,.4)", zIndex:5 }),
            objectFit:"contain", background:"#1f2937" }} />

        {/* Pin/unpin hint — only shown briefly to teach the interaction */}
        <div style={{ position:"absolute", top:"14px", right:"14px", zIndex:6,
          background:"rgba(11,31,58,.7)", color:"rgba(255,255,255,.75)", fontSize:"11px",
          padding:"5px 11px", borderRadius:"20px", pointerEvents:"none",
          display: status==="connected" ? "block" : "none" }}>
          📌 Tap a video to {pinnedSelf ? "unpin" : "pin"}
        </div>

        {status !== "connected" && (
          <div style={{ position:"absolute", inset:0, zIndex:10, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:"14px", color:"#fff",
            textAlign:"center", padding:"24px", background:"rgba(6,16,31,.55)" }}>
            {status === "connecting" && (
              <>
                <div style={{width:"36px",height:"36px",border:"3px solid rgba(255,255,255,.2)",
                  borderTop:"3px solid var(--wc-green-light)",borderRadius:"50%",animation:"wc4a-spin .8s linear infinite"}}/>
                <p style={{fontSize:"15px"}}>Setting up your camera…</p>
              </>
            )}
            {status === "waiting"    && (
              <>
                <div style={{width:"36px",height:"36px",border:"3px solid rgba(255,255,255,.2)",
                  borderTop:"3px solid var(--wc-green-light)",borderRadius:"50%",animation:"wc4a-spin .8s linear infinite"}}/>
                <p style={{fontSize:"15px"}}>Waiting for the other person to join…</p>
              </>
            )}
            {status === "reconnecting" && (
              <>
                <div style={{width:"36px",height:"36px",border:"3px solid rgba(255,255,255,.2)",
                  borderTop:"3px solid #f59e0b",borderRadius:"50%",animation:"wc4a-spin .8s linear infinite"}}/>
                <p style={{fontSize:"15px"}}>Connection lost — reconnecting…</p>
                <p style={{fontSize:"12px",color:"rgba(255,255,255,.5)"}}>Attempt {reconnectAttemptRef.current} of {MAX_RECONNECT_ATTEMPTS}</p>
              </>
            )}
            {status === "ended"      && <p style={{fontSize:"15px"}}>The call has ended.</p>}
            {status === "error"      && (
              <>
                <p style={{fontSize:"15px",color:"#fca5a5",maxWidth:"420px"}}>{errorMsg}</p>
                <button onClick={()=>window.location.reload()}
                  style={{marginTop:"8px",padding:"9px 20px",borderRadius:"9px",border:"1px solid rgba(255,255,255,.3)",
                    background:"rgba(255,255,255,.08)",color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:"600"}}>
                  Try Again
                </button>
              </>
            )}
          </div>
        )}

        {sharingScreen && (
          <div style={{ position:"absolute", top:"14px", left:"14px", zIndex:8, background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
            color:"#fff", padding:"6px 14px", borderRadius:"20px", fontSize:"12px",
            fontWeight:"700", boxShadow:"0 2px 10px rgba(0,0,0,.3)" }}>
            🖥️ Sharing your screen
          </div>
        )}

        {screenShareError && (
          <div style={{ position:"absolute", top:"14px", left:"50%", transform:"translateX(-50%)", zIndex:8,
            background:"rgba(11,31,58,.95)", border:"1px solid rgba(252,165,165,.4)",
            color:"#fca5a5", padding:"10px 16px", borderRadius:"10px", fontSize:"12.5px",
            maxWidth:"88%", textAlign:"center",
            display:"flex", alignItems:"center", gap:"10px" }}>
            <span>{screenShareError}</span>
            <button onClick={()=>setScreenShareError("")}
              style={{background:"none",border:"none",color:"#fca5a5",cursor:"pointer",fontSize:"14px",padding:0}}>✕</button>
          </div>
        )}


        {/* Chat panel — slides in from the right on desktop, full-width
            sheet on mobile so it doesn't crowd the video out entirely. */}
        {chatOpen && (
          <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"min(340px,100%)",
            background:"rgba(17,24,39,.97)", display:"flex", flexDirection:"column",
            borderLeft:"1px solid rgba(255,255,255,.1)", zIndex:20 }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,.1)",
              display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
              <span style={{ color:"#fff", fontFamily:"'DM Sans',sans-serif", fontWeight:"700", fontSize:"14px" }}>
                💬 Chat
              </span>
              <button onClick={()=>setChatOpen(false)}
                style={{ background:"none", border:"none", color:"rgba(255,255,255,.6)", cursor:"pointer", fontSize:"18px" }}>×</button>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:"10px" }}>
              {messages.length === 0 && (
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12.5px", color:"rgba(255,255,255,.4)",
                  textAlign:"center", marginTop:"20px" }}>
                  No messages yet. Say hello, or share a prescription/report.
                </p>
              )}
              {messages.map(m => (
                <div key={m.id} style={{ alignSelf: m.from==="me" ? "flex-end" : "flex-start", maxWidth:"85%" }}>
                  <div style={{
                    background: m.from==="me" ? "var(--wc-green)" : "rgba(255,255,255,.1)",
                    color:"#fff", borderRadius:"12px",
                    padding: m.kind==="file" ? "8px" : "9px 12px",
                    fontFamily:"'DM Sans',sans-serif", fontSize:"13px", lineHeight:"1.5",
                    wordBreak:"break-word",
                  }}>
                    {m.kind==="text" ? m.text : (
                      m.contentType?.startsWith("image/") ? (
                        <a href={m.url} target="_blank" rel="noopener noreferrer">
                          <img loading="lazy" src={m.url} alt={m.fileName}
                            style={{ maxWidth:"100%", borderRadius:"8px", display:"block" }}/>
                        </a>
                      ) : (
                        <a href={m.url} target="_blank" rel="noopener noreferrer"
                          style={{ color:"#fff", display:"flex", alignItems:"center", gap:"8px",
                            padding:"4px", textDecoration:"none" }}>
                          <span style={{fontSize:"20px"}}>📄</span>
                          <span style={{fontSize:"12.5px", textDecoration:"underline"}}>{m.fileName}</span>
                        </a>
                      )
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}/>
            </div>

            {fileError && (
              <p style={{ padding:"0 16px", fontFamily:"'DM Sans',sans-serif", fontSize:"11.5px",
                color:"#fca5a5", marginBottom:"6px" }}>{fileError}</p>
            )}

            {chatSendError && (
              <p style={{ padding:"0 16px", fontFamily:"'DM Sans',sans-serif", fontSize:"11.5px",
                color:"#fca5a5", marginBottom:"6px" }}>{chatSendError}</p>
            )}

            <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,.1)",
              display:"flex", gap:"8px", flexShrink:0 }}>
              <input ref={chatFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                style={{display:"none"}} disabled={uploadingFile}
                onChange={e => { sendChatFile(e.target.files?.[0]); e.target.value=""; }}/>
              <button onClick={()=>chatFileInputRef.current?.click()} disabled={uploadingFile}
                title="Share a file or image"
                style={{ width:"38px", height:"38px", borderRadius:"9px", border:"none",
                  background:"rgba(255,255,255,.1)", color:"#fff", fontSize:"16px",
                  cursor:uploadingFile?"wait":"pointer", flexShrink:0 }}>
                {uploadingFile ? "…" : "📎"}
              </button>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter") { e.preventDefault(); sendChatText(); } }}
                placeholder="Type a message…"
                style={{ flex:1, border:"1px solid rgba(255,255,255,.15)", borderRadius:"9px",
                  padding:"9px 12px", background:"rgba(255,255,255,.06)", color:"#fff",
                  fontFamily:"'DM Sans',sans-serif", fontSize:"13px", outline:"none" }}/>
              <button onClick={sendChatText} disabled={!chatInput.trim()}
                style={{ width:"38px", height:"38px", borderRadius:"9px", border:"none",
                  background: chatInput.trim() ? "var(--wc-green)" : "rgba(255,255,255,.1)", color:"#fff",
                  fontSize:"15px", cursor: chatInput.trim() ? "pointer" : "default", flexShrink:0 }}>
                ➤
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding:"16px 18px", display:"flex", justifyContent:"center", gap:"10px",
        background:"rgba(11,31,58,.55)", backdropFilter:"blur(8px)",
        borderTop:"1px solid rgba(255,255,255,.08)", flexShrink:0, flexWrap:"wrap" }}>
        <button onClick={toggleMic} style={ctrlBtnStyle(micOn)}>
          <span style={{fontSize:"18px"}}>{micOn ? "🎤" : "🔇"}</span>
          <span style={ctrlLabelStyle}>{micOn ? "Mute" : "Unmute"}</span>
        </button>
        <button onClick={toggleCam} style={ctrlBtnStyle(camOn)}>
          <span style={{fontSize:"18px"}}>{camOn ? "🎥" : "📵"}</span>
          <span style={ctrlLabelStyle}>{camOn ? "Stop Video" : "Start Video"}</span>
        </button>
        {supportsScreenShare && (
          <button onClick={toggleScreenShare} style={ctrlBtnStyle(!sharingScreen)}
            title={sharingScreen ? "Stop sharing" : "Share screen"}>
            <span style={{fontSize:"18px"}}>{sharingScreen ? "🛑" : "🖥️"}</span>
            <span style={ctrlLabelStyle}>{sharingScreen ? "Stop Share" : "Share"}</span>
          </button>
        )}
        <button onClick={()=>setChatOpen(o=>!o)} style={{...ctrlBtnStyle(chatOpen), position:"relative"}}
          title="Chat">
          <span style={{fontSize:"18px"}}>💬</span>
          <span style={ctrlLabelStyle}>Chat</span>
          {unreadCount > 0 && (
            <span style={{ position:"absolute", top:"3px", right:"10px", background:"#dc2626",
              color:"#fff", fontSize:"10px", fontWeight:"700", width:"17px", height:"17px",
              borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
              border:"2px solid #0b1220" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <button onClick={hangUp} style={{...ctrlBtnStyle(true), background:"linear-gradient(135deg,#dc2626,#b91c1c)",
          border:"1px solid rgba(255,255,255,.15)"}}>
          <span style={{fontSize:"18px"}}>📞</span>
          <span style={ctrlLabelStyle}>Leave</span>
        </button>
      </div>
    </div>
  );
}

const ctrlLabelStyle = { fontSize:"10.5px", fontWeight:"600", fontFamily:"'DM Sans',sans-serif" };

function ctrlBtnStyle(active) {
  return {
    minWidth:"64px", padding:"9px 14px", borderRadius:"14px",
    border: active ? "1px solid rgba(16,185,129,.35)" : "1px solid rgba(255,255,255,.12)",
    background: active ? "rgba(4,120,87,.22)" : "rgba(255,255,255,.06)",
    color:"#fff", cursor:"pointer",
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"3px",
    transition:"background .2s, border-color .2s",
  };
}
