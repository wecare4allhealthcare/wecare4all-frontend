import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../../components/Toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export default function ChangePassword() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (next.length < 8) { setErr("New password must be at least 8 characters"); return; }
    if (next !== confirm) { setErr("Passwords don't match"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/hospital/change-password`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Couldn't update password");
      // Clear the flag locally too, so ProtectedRoute stops redirecting here
      if (user) login({ ...user, must_change_password: false }, token);
      showToast("Password updated — welcome to your dashboard!", "success");
      navigate("/hospital/dashboard", { replace: true });
    } catch (ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:"linear-gradient(-45deg,#071524,#0b1f3a,#0a2e52,#062818)",
      backgroundSize:"400% 400%", padding:"24px",
    }}>
      <div style={{width:"100%",maxWidth:"420px",background:"#fff",borderRadius:"20px",
        boxShadow:"0 40px 80px rgba(0,0,0,0.45)",overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"26px 30px"}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>
            Set a New Password
          </h2>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.55)"}}>
            Required before you can access your Hospital Dashboard
          </p>
        </div>

        <form onSubmit={submit} style={{padding:"26px 30px",display:"flex",flexDirection:"column",gap:"14px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",lineHeight:"1.6",margin:0}}>
            For your account's security, please set a new password before continuing —
            you'll use this one going forward instead of the one emailed to you.
          </p>

          <div>
            <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}}>
              Current (Temporary) Password
            </label>
            <input type="password" value={current} onChange={e => setCurrent(e.target.value)}
              placeholder="From your approval email" autoFocus
              style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"11px 13px",
                fontFamily:"'DM Sans',sans-serif",fontSize:"14px"}}/>
          </div>

          <div>
            <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}}>
              New Password
            </label>
            <input type="password" value={next} onChange={e => setNext(e.target.value)}
              placeholder="At least 8 characters"
              style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"11px 13px",
                fontFamily:"'DM Sans',sans-serif",fontSize:"14px"}}/>
          </div>

          <div>
            <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}}>
              Confirm New Password
            </label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"11px 13px",
                fontFamily:"'DM Sans',sans-serif",fontSize:"14px"}}/>
          </div>

          {err && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#ef4444",fontSize:"12px",margin:0}}>⚠ {err}</p>}

          <button type="submit" disabled={loading} style={{
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
            padding:"13px",borderRadius:"10px",border:"none",
            cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,
          }}>
            {loading ? "Updating..." : "Set Password & Continue →"}
          </button>
        </form>
      </div>
    </div>
  );
}
