/**
 * hospital/Dashboard.jsx — the real hospital panel, replacing the old
 * token-link portal as the primary way a hospital manages their
 * presence. Three tabs: Profile, Photos, Commissions.
 */
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.hd{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.hd *{box-sizing:border-box;}
.hd h1,.hd h2{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.hd-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:10px 13px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;
  outline:none;transition:all .2s;}
.hd-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.hd-inp:disabled{background:#f1f5f9;color:#94a3b8;cursor:not-allowed;}
.hd-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.hd-tab{padding:9px 18px;border-radius:8px;border:none;background:transparent;
  font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;color:#64748b;cursor:pointer;}
.hd-tab.active{background:#0b1f3a;color:#fff;}
.hd-btn{background:linear-gradient(135deg,#047857,#059669);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:12px 24px;border-radius:9px;border:none;cursor:pointer;
  box-shadow:0 4px 16px rgba(4,120,87,.30);}
.hd-btn:disabled{opacity:.6;cursor:not-allowed;}
.hd-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;padding:20px;}
`;

const TIER_META = {
  basic:      { label: "Basic Association", color: "#64748b" },
  growth:     { label: "Growth Partner",    color: "#047857" },
  strategic:  { label: "Strategic Partner", color: "#0369a1" },
};

function ProfileTab({ profile, token, onUpdated }) {
  const [form, setForm] = useState({
    contact_person: profile.contact_person || "",
    designation:    profile.designation || "",
    mobile:         profile.mobile || "",
    website:        profile.website || "",
    notes:          profile.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSave = async (e) => {
    e.preventDefault(); setErr(""); setSaved(false); setSaving(true);
    try {
      const res = await fetch(`${API}/hospital/my-profile`, {
        method: "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.detail || "Couldn't save"); }
      setSaved(true);
      onUpdated();
      setTimeout(()=>setSaved(false), 3000);
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="hd-card">
      <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"4px"}}>Hospital Profile</h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#94a3b8",marginBottom:"18px"}}>
        Hospital name, tier, and accreditations are managed by our team to keep partner profiles verified — contact support to change those.
      </p>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"16px"}}>
        <div>
          <label className="hd-lbl">Hospital Name</label>
          <input className="hd-inp" value={profile.hospital_name || ""} disabled/>
        </div>
        <div>
          <label className="hd-lbl">Partnership Tier</label>
          <input className="hd-inp" value={TIER_META[profile.tier]?.label || profile.tier} disabled/>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
          <div>
            <label className="hd-lbl">Contact Person</label>
            <input className="hd-inp" value={form.contact_person} onChange={e=>set("contact_person",e.target.value)}/>
          </div>
          <div>
            <label className="hd-lbl">Designation</label>
            <input className="hd-inp" value={form.designation} onChange={e=>set("designation",e.target.value)}/>
          </div>
          <div>
            <label className="hd-lbl">Mobile</label>
            <input className="hd-inp" value={form.mobile} onChange={e=>set("mobile",e.target.value)}/>
          </div>
          <div>
            <label className="hd-lbl">Website</label>
            <input className="hd-inp" value={form.website} onChange={e=>set("website",e.target.value)} placeholder="https://"/>
          </div>
          <div style={{gridColumn:"span 2"}}>
            <label className="hd-lbl">Notes</label>
            <textarea className="hd-inp" rows={3} style={{resize:"vertical"}}
              value={form.notes} onChange={e=>set("notes",e.target.value)}/>
          </div>
        </div>
        {err && <p style={{color:"#dc2626",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginBottom:"10px"}}>⚠ {err}</p>}
        {saved && <p style={{color:"#15803d",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginBottom:"10px"}}>✅ Saved</p>}
        <button type="submit" disabled={saving} className="hd-btn">{saving ? "Saving…" : "Save Changes"}</button>
      </form>

      <ChangePasswordCard token={token}/>
    </div>
  );
}

function ChangePasswordCard({ token }) {
  const [current, setCurrent] = useState("");
  const [next, setNext]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");
  const [saved, setSaved]     = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setSaved(false);
    if (next.length < 8) { setErr("New password must be at least 8 characters"); return; }
    if (next !== confirm) { setErr("Passwords don't match"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/hospital/change-password`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Couldn't update password");
      setCurrent(""); setNext(""); setConfirm("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="hd-card" style={{ marginTop:"18px" }}>
      <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"4px"}}>Change Password</h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#94a3b8",marginBottom:"18px"}}>
        Update your login password any time — you don't need to wait until it's forced.
      </p>
      <form onSubmit={submit}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"14px"}}>
          <div style={{gridColumn:"span 2"}}>
            <label className="hd-lbl">Current Password</label>
            <input type="password" className="hd-inp" value={current} onChange={e=>setCurrent(e.target.value)}/>
          </div>
          <div>
            <label className="hd-lbl">New Password</label>
            <input type="password" className="hd-inp" value={next} onChange={e=>setNext(e.target.value)} placeholder="At least 8 characters"/>
          </div>
          <div>
            <label className="hd-lbl">Confirm New Password</label>
            <input type="password" className="hd-inp" value={confirm} onChange={e=>setConfirm(e.target.value)}/>
          </div>
        </div>
        {err && <p style={{color:"#dc2626",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginBottom:"10px"}}>⚠ {err}</p>}
        {saved && <p style={{color:"#15803d",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginBottom:"10px"}}>✅ Password updated</p>}
        <button type="submit" disabled={saving} className="hd-btn">{saving ? "Updating…" : "Update Password"}</button>
      </form>
    </div>
  );
}

function PhotosTab({ profile, token, onUpdated }) {
  const [photos, setPhotos] = useState(profile.photos || []);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      setErr("Only JPEG, PNG, or WebP images are allowed"); e.target.value=""; return;
    }
    if (file.size > 5*1024*1024) {
      setErr("Image must be under 5MB"); e.target.value=""; return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API}/hospital/my-profile/photos`, {
        method: "POST",
        headers: { Authorization:`Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Upload failed");
      setPhotos(json.photos);
      onUpdated();
    } catch (ex) { setErr(ex.message); }
    finally { setUploading(false); e.target.value=""; }
  };

  const handleRemove = async (url) => {
    try {
      const res = await fetch(`${API}/hospital/my-profile/photos`, {
        method: "DELETE",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (res.ok) { setPhotos(json.photos); onUpdated(); }
    } catch {}
  };

  return (
    <div className="hd-card">
      <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"4px"}}>Hospital Photos</h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#94a3b8",marginBottom:"18px"}}>
        Exterior with branding, reception, OT, ICU, patient rooms — used for your public listing.
      </p>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} style={{display:"none"}}/>
      <button onClick={()=>fileRef.current?.click()} disabled={uploading} className="hd-btn" style={{marginBottom:"16px"}}>
        {uploading ? "Uploading…" : "📤 Upload Photo"}
      </button>
      {err && <p style={{color:"#dc2626",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginBottom:"12px"}}>⚠ {err}</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"12px"}}>
        {photos.map(url => (
          <div key={url} style={{position:"relative",borderRadius:"10px",overflow:"hidden",aspectRatio:"1"}}>
            <img src={url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <button onClick={()=>handleRemove(url)} style={{position:"absolute",top:"6px",right:"6px",
              background:"rgba(0,0,0,.6)",color:"#fff",border:"none",width:"24px",height:"24px",
              borderRadius:"6px",cursor:"pointer",fontSize:"14px"}}>×</button>
          </div>
        ))}
        {photos.length===0 && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"13px"}}>No photos uploaded yet.</p>}
      </div>
    </div>
  );
}

// Same pattern as patient/Payment.jsx — loaded once, reused for the
// hospital subscription checkout below.
function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function BillingTab({ profile, token }) {
  const [sub, setSub] = useState(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const fetchSub = async () => {
    try {
      const res  = await fetch(`${API}/hospital/my-subscription`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setSub(json.subscription);
    } catch { setSub(null); }
  };
  useEffect(() => { fetchSub(); }, []);

  const handlePay = async () => {
    setPaying(true); setError("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load payment gateway. Check your internet.");

      const res = await fetch(`${API}/hospital/subscription/create-order`, {
        method: "POST", headers: { Authorization:`Bearer ${token}` },
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.detail || "Order creation failed");

      const rz = new window.Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: "We Care 4 'all'",
        description: `${order.tier === "strategic" ? "Strategic" : "Growth"} Partnership Subscription — ${profile.hospital_name}`,
        order_id: order.order_id,
        theme: { color: "#047857" },
        handler: async (response) => {
          try {
            const vRes = await fetch(`${API}/hospital/subscription/verify`, {
              method: "POST",
              headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const vJson = await vRes.json();
            if (!vRes.ok) throw new Error(vJson.detail || "Verification failed");
            fetchSub();
          } catch (ex) {
            setError(`Payment received but verification failed: ${ex.message}. Please contact support.`);
          } finally { setPaying(false); }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rz.open();
    } catch (ex) { setError(ex.message); setPaying(false); }
  };

  return (
    <div className="hd-card">
      <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"4px"}}>Billing</h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#94a3b8",marginBottom:"18px"}}>
        Growth and Strategic partnerships are individually priced — our team agrees the amount with you directly,
        then it shows here to pay securely online.
      </p>

      {sub===null ? (
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",padding:"16px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"#15803d",margin:0}}>
            ✅ No outstanding payment — your account is in good standing.
          </p>
        </div>
      ) : sub.status==="paid" ? (
        <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",padding:"16px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",fontWeight:700,color:"#15803d",margin:"0 0 4px"}}>
            ✅ Subscription Active
          </p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#374151",margin:0}}>
            ₹{parseFloat(sub.amount).toLocaleString("en-IN")} / {sub.billing_cycle} — paid{" "}
            {sub.paid_at && new Date(sub.paid_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
          </p>
        </div>
      ) : (
        <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:"10px",padding:"18px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:700,color:"#92400e",
            letterSpacing:"1px",textTransform:"uppercase",margin:"0 0 6px"}}>Payment Due</p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",fontWeight:700,color:"#0b1f3a",margin:"0 0 4px"}}>
            ₹{parseFloat(sub.amount).toLocaleString("en-IN")}
          </p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",margin:"0 0 16px"}}>
            {sub.tier==="strategic"?"Strategic":"Growth"} Partnership — billed {sub.billing_cycle}
          </p>
          <button onClick={handlePay} disabled={paying} className="hd-btn">
            {paying ? "Processing…" : "Pay Now →"}
          </button>
          {error && <p style={{color:"#dc2626",fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif",marginTop:"10px"}}>⚠ {error}</p>}
        </div>
      )}
    </div>
  );
}

function CommissionsTab({ token }) {
  const [list, setList] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/hospital/my-commissions`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        setList(json.commissions || []);
      } catch { setList([]); }
    })();
  }, []);

  return (
    <div className="hd-card">
      <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"16px"}}>Commission Ledger</h3>
      {list===null ? (
        <div style={{textAlign:"center",padding:"30px"}}>
          <div style={{width:"24px",height:"24px",border:"3px solid #e2eaf4",borderTop:"3px solid #047857",
            borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : list.length===0 ? (
        <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"13px"}}>No commission records yet.</p>
      ) : list.map(c => (
        <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"12px 0",borderBottom:"1px solid #f1f5f9"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",color:"#0b1f3a",margin:0}}>
              ₹{parseFloat(c.amount||0).toLocaleString("en-IN")}
            </p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#94a3b8",margin:"2px 0 0"}}>
              {new Date(c.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
            </p>
          </div>
          <span style={{padding:"3px 10px",borderRadius:"50px",fontFamily:"'DM Sans',sans-serif",
            fontSize:"11px",fontWeight:"700",
            background: c.status==="settled" ? "#dcfce7" : "#fffbeb",
            color: c.status==="settled" ? "#15803d" : "#92400e"}}>
            {c.status==="settled" ? "Settled" : "Pending"}
          </span>
        </div>
      ))}
    </div>
  );
}



/* ══ PAYMENT REQUIRED GATE ══ */
function PaymentRequired({ onGoToBilling, tier }) {
  const tierLabel = tier === "strategic" ? "Strategic Partner" : "Growth Partner";
  return (
    <div className="hd-card" style={{textAlign:"center",padding:"56px 24px",border:"2px dashed #fde68a",background:"#fffbeb"}}>
      <div style={{fontSize:"48px",marginBottom:"16px"}}>💳</div>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"24px",color:"#0b1f3a",marginBottom:"8px"}}>
        Complete Payment to Unlock
      </h3>
      <p style={{fontSize:"13.5px",color:"#92400e",maxWidth:"400px",margin:"0 auto 24px",lineHeight:"1.6"}}>
        Your account is on the <strong>{tierLabel}</strong> plan, but your subscription payment is pending.
        Complete payment to unlock banners, videos, and featured placement on our website.
      </p>
      <button onClick={onGoToBilling}
        style={{background:"linear-gradient(135deg,#b45309,#d97706)",color:"#fff",
          fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
          padding:"13px 28px",borderRadius:"9px",border:"none",cursor:"pointer",
          boxShadow:"0 4px 14px rgba(180,83,9,.35)"}}>
        💳 Go to Billing & Pay Now →
      </button>
    </div>
  );
}

/* ══ BANNERS TAB — Growth + Strategic ══ */
function BannersTab({ profile, token, onUpdated }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState(null);
  const banners = profile.banners || [];

  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setErr(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res  = await fetch(`${API}/hospital/my-profile/banners`,
        { method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:fd });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Upload failed"); return; }
      onUpdated();
    } catch { setErr("Network error"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const remove = async (url) => {
    try {
      await fetch(`${API}/hospital/my-profile/banners`,
        { method:"DELETE", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
          body:JSON.stringify({ url }) });
      onUpdated();
    } catch { setErr("Remove failed"); }
  };

  return (
    <div className="hd-card">
      <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"6px"}}>🖼️ Promotional Banners</h2>
      <p style={{fontSize:"13px",color:"#64748b",marginBottom:"16px"}}>
        Upload banner images to feature on our website — patient-facing promotions, seasonal offers, or awareness campaigns.
      </p>
      {err && <p style={{color:"#dc2626",fontSize:"13px",marginBottom:"12px"}}>❌ {err}</p>}
      <button onClick={()=>fileRef.current?.click()} disabled={uploading} className="hd-btn" style={{marginBottom:"16px"}}>
        {uploading ? "Uploading…" : "📤 Upload Banner"}
      </button>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload}
        disabled={uploading} style={{display:"none"}}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"12px"}}>
        {banners.length === 0 && <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"13px"}}>No banners uploaded yet.</p>}
        {banners.map((b,i) => (
          <div key={i} style={{position:"relative",borderRadius:"10px",overflow:"hidden",border:"1px solid #e2eaf4"}}>
            <img src={b.url||b} alt={`Banner ${i+1}`} style={{width:"100%",height:"160px",objectFit:"cover",display:"block"}}/>
            <button onClick={()=>remove(b.url||b)}
              style={{position:"absolute",top:"8px",right:"8px",background:"rgba(0,0,0,.6)",color:"#fff",
                border:"none",borderRadius:"6px",padding:"4px 8px",cursor:"pointer",fontSize:"12px"}}>
              ✕ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ VIDEOS TAB — Strategic only ══ */
function VideosTab({ profile, token, onUpdated }) {
  const videoRef     = useRef(null);
  const interviewRef = useRef(null);
  const [uploading, setUploading] = useState(null); // 'video' | 'interview' | null
  const [err, setErr] = useState(null);
  const videos     = profile.videos || [];
  const interviews = profile.doctor_interviews || [];

  const upload = async (e, type) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(type); setErr(null);
    const fd = new FormData(); fd.append("file", file);
    const endpoint = type === "video" ? "videos" : "interviews";
    try {
      const res  = await fetch(`${API}/hospital/my-profile/${endpoint}`,
        { method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:fd });
      const json = await res.json();
      if (!res.ok) { setErr(json.detail || "Upload failed"); return; }
      onUpdated();
    } catch { setErr("Network error"); }
    finally { setUploading(null); e.target.value = ""; }
  };

  const remove = async (url, type) => {
    const endpoint = type === "video" ? "videos" : "interviews";
    try {
      await fetch(`${API}/hospital/my-profile/${endpoint}`,
        { method:"DELETE", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
          body:JSON.stringify({ url }) });
      onUpdated();
    } catch { setErr("Remove failed"); }
  };

  const VideoCard = ({ item, type }) => (
    <div style={{border:"1px solid #e2eaf4",borderRadius:"10px",overflow:"hidden",background:"#f8fafc"}}>
      <video src={item.url||item} controls style={{width:"100%",height:"180px",objectFit:"cover",background:"#000"}}/>
      <div style={{padding:"10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:"12px",color:"#64748b"}}>{item.title || "Video"}</span>
        <button onClick={()=>remove(item.url||item, type)}
          style={{background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:"6px",
            padding:"4px 10px",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>
          ✕ Remove
        </button>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
      {err && <p style={{color:"#dc2626",fontSize:"13px"}}>❌ {err}</p>}

      {/* Promo Videos */}
      <div className="hd-card">
        <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"6px"}}>🎬 Promotional Videos</h2>
        <p style={{fontSize:"13px",color:"#64748b",marginBottom:"16px"}}>
          Showcase your hospital — facilities, services, patient testimonials, awareness content.
        </p>
        <button onClick={()=>videoRef.current?.click()} disabled={!!uploading} className="hd-btn" style={{marginBottom:"16px"}}>
          {uploading==="video" ? "Uploading…" : "📤 Upload Video"}
        </button>
        <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime"
          onChange={e=>upload(e,"video")} disabled={!!uploading} style={{display:"none"}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px"}}>
          {videos.length === 0 && <p style={{color:"#94a3b8",fontSize:"13px"}}>No videos uploaded yet.</p>}
          {videos.map((v,i) => <VideoCard key={i} item={v} type="video"/>)}
        </div>
      </div>

      {/* Doctor Interviews */}
      <div className="hd-card">
        <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"6px"}}>🩺 Doctor Interview Videos</h2>
        <p style={{fontSize:"13px",color:"#64748b",marginBottom:"16px"}}>
          Feature your specialist doctors — interviews, expert talks, health education videos.
        </p>
        <button onClick={()=>interviewRef.current?.click()} disabled={!!uploading} className="hd-btn" style={{marginBottom:"16px"}}>
          {uploading==="interview" ? "Uploading…" : "📤 Upload Interview"}
        </button>
        <input ref={interviewRef} type="file" accept="video/mp4,video/webm,video/quicktime"
          onChange={e=>upload(e,"interview")} disabled={!!uploading} style={{display:"none"}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px"}}>
          {interviews.length === 0 && <p style={{color:"#94a3b8",fontSize:"13px"}}>No interview videos uploaded yet.</p>}
          {interviews.map((v,i) => <VideoCard key={i} item={v} type="interview"/>)}
        </div>
      </div>
    </div>
  );
}

/* ══ UPGRADE LOCKED CARD ══ */
function LockedFeature({ requiredTier, children }) {
  const tierLabel = { growth: "Growth Partner", strategic: "Strategic Partner" };
  return (
    <div className="hd-card" style={{textAlign:"center",padding:"48px 24px",border:"2px dashed #e2eaf4"}}>
      <div style={{fontSize:"40px",marginBottom:"12px"}}>🔒</div>
      <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",color:"#0b1f3a",marginBottom:"8px"}}>
        {tierLabel[requiredTier]} Feature
      </h3>
      <p style={{fontSize:"13px",color:"#64748b",maxWidth:"380px",margin:"0 auto 20px"}}>
        {children}
      </p>
      <a href="mailto:query@wecare4all.in?subject=Partnership Upgrade Request"
        style={{display:"inline-block",background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
          fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13px",padding:"11px 24px",
          borderRadius:"9px",textDecoration:"none",boxShadow:"0 4px 14px rgba(4,120,87,.3)"}}>
        Contact Us to Upgrade
      </a>
    </div>
  );
}


/* ── Subscription Management Tab ─────────────────────────────── */
function UpgradePlanTab({ profile, token, onRefresh }) {
  const [view, setView]             = useState("main"); // main | upgrade | downgrade | cancel
  const [sub,  setSub]              = useState(null);
  const [loading, setLoading]       = useState(true);
  const [selectedPlan, setSelected] = useState("");
  const [message, setMessage]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState("");
  const [err, setErr]               = useState("");

  const tierOrder = { basic:0, growth:1, strategic:2 };
  const currentTier = profile.tier || "basic";

  const PLAN_META = {
    growth:   { icon:"🚀", label:"Growth Partner",   color:"#047857", bg:"#f0fdf4", border:"#86efac",
      features:["Priority listing","Digital campaigns","Blog & awareness","Health camps","Featured recommendations"] },
    strategic:{ icon:"⭐", label:"Strategic Partner", color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe",
      features:["Everything in Growth","Dedicated campaigns","Video & doctor interviews","International patient exposure","All major branding","Corporate tie-ups"] },
    basic:    { icon:"🌿", label:"Basic Association", color:"#64748b", bg:"#f8fafc", border:"#e2eaf4",
      features:["Hospital listed in network","Eligible for patient referrals","Merit-based inclusion"] },
  };

  useEffect(()=>{
    (async()=>{
      try {
        const res  = await fetch(`${API}/hospital/my-subscription`,{headers:{Authorization:`Bearer ${token}`}});
        const json = await res.json();
        setSub(json.subscription);
      } catch {}
      setLoading(false);
    })();
  },[]);

  const submitRequest = async (type) => {
    setSubmitting(true); setErr("");
    try {
      const body = {
        requested_tier: type==="upgrade" ? selectedPlan : type==="downgrade" ? selectedPlan : currentTier,
        message,
        hospital_name: profile.hospital_name,
        type,
      };
      const res  = await fetch(`${API}/hospital/upgrade-request`,{
        method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok){ setErr(json.detail||"Failed"); return; }
      setDone(type);
    } catch { setErr("Network error"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{textAlign:"center",padding:"40px",color:"#94a3b8"}}>Loading...</div>;

  if (done) return (
    <div style={{textAlign:"center",padding:"40px 20px",maxWidth:"480px",margin:"0 auto"}}>
      <div style={{fontSize:"48px",marginBottom:"16px"}}>
        {done==="cancel" ? "❌" : done==="downgrade" ? "⬇️" : "✅"}
      </div>
      <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"20px",fontWeight:"700",
        color:"#0b1f3a",margin:"0 0 10px"}}>
        {done==="cancel"   ? "Cancellation Request Sent"
        :done==="downgrade"? "Downgrade Request Sent"
        :                    "Upgrade Request Sent!"}
      </h3>
      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b",margin:0}}>
        {done==="cancel"
          ? "Your cancellation request has been received. Your plan will remain active until the current billing period ends."
          :done==="downgrade"
          ? "Your downgrade request is received. The change will take effect at the start of your next billing cycle."
          : "Our team will review your request, set the pricing, and contact you within 1-2 business days."}
      </p>
    </div>
  );

  // ── MAIN VIEW ──
  if (view==="main") return (
    <div>
      {/* Current plan card */}
      <div style={{background:"#f8faff",border:"1.5px solid #e2eaf4",borderRadius:"14px",
        padding:"20px",marginBottom:"24px"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
          color:"#94a3b8",textTransform:"uppercase",letterSpacing:"1px",margin:"0 0 10px"}}>
          Current Plan
        </p>
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
          <span style={{fontSize:"28px"}}>{PLAN_META[currentTier]?.icon}</span>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"17px",
              color:PLAN_META[currentTier]?.color,margin:0}}>
              {PLAN_META[currentTier]?.label}
            </p>
            {sub?.status==="paid" && sub?.expires_at && (
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",margin:"2px 0 0"}}>
                Active until {new Date(sub.expires_at).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
          {currentTier!=="basic" && (
            <span style={{marginLeft:"auto",padding:"4px 12px",borderRadius:"50px",
              background: sub?.status==="paid"?"#dcfce7":"#fef9c3",
              color:      sub?.status==="paid"?"#15803d":"#92400e",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"11px"}}>
              {sub?.status==="paid" ? "✅ Active" : "⏳ Payment Pending"}
            </span>
          )}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
          {PLAN_META[currentTier]?.features.map((f,i)=>(
            <span key={i} style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"50px",
              padding:"3px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#475569"}}>
              ✓ {f}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
        {/* Upgrade */}
        {(tierOrder[currentTier]||0) < 2 && (
          <button onClick={()=>{ setView("upgrade"); setSelected(currentTier==="basic"?"growth":"strategic"); }}
            style={{padding:"14px 20px",borderRadius:"12px",border:"none",cursor:"pointer",
              background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
              display:"flex",alignItems:"center",gap:"10px",
              boxShadow:"0 4px 14px rgba(4,120,87,.25)"}}>
            <span style={{fontSize:"18px"}}>⬆️</span>
            <div style={{textAlign:"left"}}>
              <p style={{margin:0,fontSize:"14px"}}>
                Upgrade to {currentTier==="basic" ? "Growth Partner 🚀" : "Strategic Partner ⭐"}
              </p>
              <p style={{margin:0,fontSize:"11px",opacity:.8}}>Unlock more features</p>
            </div>
          </button>
        )}

        {/* Downgrade (only for growth/strategic, not basic) */}
        {(tierOrder[currentTier]||0) > 0 && (
          <button onClick={()=>{ setView("downgrade"); setSelected(currentTier==="strategic"?"growth":"basic"); }}
            style={{padding:"14px 20px",borderRadius:"12px",
              border:"1.5px solid #e2eaf4",background:"#fff",cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",
              display:"flex",alignItems:"center",gap:"10px",color:"#64748b"}}>
            <span style={{fontSize:"18px"}}>⬇️</span>
            <div style={{textAlign:"left"}}>
              <p style={{margin:0,fontSize:"14px"}}>
                Downgrade to {currentTier==="strategic" ? "Growth Partner" : "Basic (Free)"}
              </p>
              <p style={{margin:0,fontSize:"11px",opacity:.7}}>Takes effect next billing cycle</p>
            </div>
          </button>
        )}

        {/* Cancel (only paid tiers) */}
        {currentTier!=="basic" && (
          <button onClick={()=>setView("cancel")}
            style={{padding:"14px 20px",borderRadius:"12px",
              border:"1.5px solid #fee2e2",background:"#fff",cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",
              display:"flex",alignItems:"center",gap:"10px",color:"#dc2626"}}>
            <span style={{fontSize:"18px"}}>❌</span>
            <div style={{textAlign:"left"}}>
              <p style={{margin:0,fontSize:"14px"}}>Cancel Subscription</p>
              <p style={{margin:0,fontSize:"11px",opacity:.7}}>Plan stays active until end of billing period</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );

  // ── UPGRADE VIEW ──
  if (view==="upgrade") {
    const upgradablePlans = Object.entries(PLAN_META)
      .filter(([id])=>(tierOrder[id]||0) > (tierOrder[currentTier]||0))
      .map(([id,meta])=>({id,...meta}));
    return (
      <div>
        <button onClick={()=>setView("main")}
          style={{background:"none",border:"none",cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
            marginBottom:"20px",display:"flex",alignItems:"center",gap:"6px"}}>
          ← Back
        </button>
        <h3 style={{fontFamily:"'DM Sans',sans-serif",fontSize:"17px",fontWeight:"700",
          color:"#0b1f3a",margin:"0 0 6px"}}>Choose Upgrade Plan</h3>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
          margin:"0 0 20px"}}>
          Our team will contact you with pricing after reviewing your request.
        </p>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${upgradablePlans.length},1fr)`,
          gap:"14px",marginBottom:"20px"}}>
          {upgradablePlans.map(plan=>(
            <div key={plan.id} onClick={()=>setSelected(plan.id)}
              style={{background:selectedPlan===plan.id?plan.bg:"#fff",
                border:`2px solid ${selectedPlan===plan.id?plan.color:"#e2eaf4"}`,
                borderRadius:"14px",padding:"16px",cursor:"pointer",transition:"all .2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                <span style={{fontSize:"20px"}}>{plan.icon}</span>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                  fontSize:"14px",color:plan.color,margin:0}}>{plan.label}</p>
                {selectedPlan===plan.id&&<span style={{marginLeft:"auto",color:plan.color,fontWeight:"700"}}>✓</span>}
              </div>
              {plan.features.map((f,i)=>(
                <p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",
                  color:"#475569",margin:"0 0 4px",display:"flex",gap:"6px"}}>
                  <span style={{color:plan.color,flexShrink:0}}>✓</span>{f}
                </p>
              ))}
            </div>
          ))}
        </div>
        <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",fontWeight:"700",
          color:"#374151",display:"block",marginBottom:"6px"}}>Message (optional)</label>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
          placeholder="Any specific requirements or expected patient volume..."
          style={{width:"100%",padding:"10px 12px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
            fontFamily:"'DM Sans',sans-serif",fontSize:"13px",resize:"vertical",
            outline:"none",boxSizing:"border-box",marginBottom:"14px"}}/>
        {err&&<p style={{color:"#dc2626",fontSize:"13px",marginBottom:"10px"}}>❌ {err}</p>}
        <button onClick={()=>submitRequest("upgrade")} disabled={submitting||!selectedPlan}
          style={{padding:"12px 28px",borderRadius:"10px",border:"none",cursor:"pointer",
            background:"linear-gradient(135deg,#047857,#059669)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
            opacity:submitting?0.7:1,boxShadow:"0 4px 14px rgba(4,120,87,.3)"}}>
          {submitting?"Sending...":"Request Upgrade →"}
        </button>
      </div>
    );
  }

  // ── DOWNGRADE VIEW ──
  if (view==="downgrade") {
    const downgradeTo = currentTier==="strategic" ? "growth" : "basic";
    const meta = PLAN_META[downgradeTo];
    return (
      <div>
        <button onClick={()=>setView("main")}
          style={{background:"none",border:"none",cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
            marginBottom:"20px",display:"flex",alignItems:"center",gap:"6px"}}>
          ← Back
        </button>
        <div style={{background:"#fffbeb",border:"1.5px solid #fde68a",borderRadius:"14px",
          padding:"18px",marginBottom:"20px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:"700",
            color:"#92400e",margin:"0 0 8px"}}>⚠️ Downgrade to {meta.label}</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#78350f",margin:0,lineHeight:"1.6"}}>
            Your current plan will remain active until the end of the billing period.
            At renewal, your plan will switch to <strong>{meta.label}</strong> and
            {downgradeTo==="basic"?" no subscription fee will be charged.":" the Growth Partner fee will apply."}
          </p>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
          color:"#374151",marginBottom:"6px"}}>Features you will lose:</p>
        {currentTier==="strategic"&&(
          <div style={{marginBottom:"16px"}}>
            {["Video features / doctor interviews","International patient exposure",
              "Dedicated campaigns","Major branding","Corporate tie-ups"].map((f,i)=>(
              <p key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
                color:"#dc2626",margin:"0 0 4px",display:"flex",gap:"6px"}}>
                <span>✕</span>{f}
              </p>
            ))}
          </div>
        )}
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={2}
          placeholder="Reason for downgrade (optional)..."
          style={{width:"100%",padding:"10px 12px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
            fontFamily:"'DM Sans',sans-serif",fontSize:"13px",resize:"vertical",
            outline:"none",boxSizing:"border-box",marginBottom:"14px"}}/>
        {err&&<p style={{color:"#dc2626",fontSize:"13px",marginBottom:"10px"}}>❌ {err}</p>}
        <button onClick={()=>submitRequest("downgrade")} disabled={submitting}
          style={{padding:"12px 28px",borderRadius:"10px",border:"1.5px solid #e2eaf4",
            background:"#f8fafc",color:"#374151",cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px"}}>
          {submitting?"Sending...":"Confirm Downgrade Request"}
        </button>
      </div>
    );
  }

  // ── CANCEL VIEW ──
  if (view==="cancel") return (
    <div>
      <button onClick={()=>setView("main")}
        style={{background:"none",border:"none",cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",
          marginBottom:"20px",display:"flex",alignItems:"center",gap:"6px"}}>
        ← Back
      </button>
      <div style={{background:"#fef2f2",border:"1.5px solid #fca5a5",borderRadius:"14px",
        padding:"18px",marginBottom:"20px"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:"700",
          color:"#dc2626",margin:"0 0 8px"}}>❌ Cancel Subscription</p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#7f1d1d",
          margin:0,lineHeight:"1.6"}}>
          Your plan will remain active until the end of current billing period.
          After that, your account will revert to <strong>Basic (Free)</strong> plan.
          All premium content (banners, videos) will be hidden from public listing.
        </p>
      </div>
      <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={2}
        placeholder="Reason for cancellation (optional)..."
        style={{width:"100%",padding:"10px 12px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
          fontFamily:"'DM Sans',sans-serif",fontSize:"13px",resize:"vertical",
          outline:"none",boxSizing:"border-box",marginBottom:"14px"}}/>
      {err&&<p style={{color:"#dc2626",fontSize:"13px",marginBottom:"10px"}}>❌ {err}</p>}
      <button onClick={()=>submitRequest("cancel")} disabled={submitting}
        style={{padding:"12px 28px",borderRadius:"10px",border:"1.5px solid #fca5a5",
          background:"#fef2f2",color:"#dc2626",cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px"}}>
        {submitting?"Sending...":"Confirm Cancellation Request"}
      </button>
    </div>
  );

  return null;
}


export default function HospitalDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("wc4a_token");
  const [profile, setProfile] = useState(null);
  const [isPaid, setIsPaid]   = useState(false); // subscription paid?
  const [tab, setTab] = useState("profile");
  const [hasCommissions, setHasCommissions] = useState(false);

  const fetchProfile = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(`${API}/hospital/my-profile`,      { headers:{ Authorization:`Bearer ${token}` }}),
        fetch(`${API}/hospital/my-subscription`, { headers:{ Authorization:`Bearer ${token}` }}),
      ]);
      const pJson = await pRes.json();
      const sJson = await sRes.json().catch(() => ({}));
      setProfile(pJson);
      // basic tier → no payment needed (free), treat as paid for profile access
      // growth/strategic → must have paid subscription
      const tier = pJson.tier || "basic";
      if (tier === "basic") {
        setIsPaid(true); // free tier, always active
      } else {
        setIsPaid(sJson?.subscription?.status === "paid");
      }
    } catch { setProfile({}); setIsPaid(false); }
  };

  const checkCommissions = async () => {
    try {
      const res = await fetch(`${API}/hospital/my-commissions`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setHasCommissions((json.commissions || []).length > 0);
    } catch { setHasCommissions(false); }
  };

  useEffect(() => { document.title = "Hospital Dashboard — We Care 4 'all'"; fetchProfile(); checkCommissions(); }, []);

  if (!profile) return (
    <div className="hd" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <style>{G}</style>
      <div style={{width:"32px",height:"32px",border:"3px solid #e2eaf4",borderTop:"3px solid #047857",
        borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
    </div>
  );

  const tierMeta = TIER_META[profile.tier] || TIER_META.basic;

  return (
    <div className="hd">
      <style>{G}</style>
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"24px 0"}}>
        <div style={{maxWidth:"880px",margin:"0 auto",padding:"0 20px",
          display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <Link to="/" style={{textDecoration:"none"}}>
              <h1 style={{fontSize:"24px",fontWeight:"700",color:"#fff",margin:0}}>{profile.hospital_name}</h1>
            </Link>
            <span style={{display:"inline-block",marginTop:"6px",padding:"3px 12px",borderRadius:"50px",
              background:"rgba(255,255,255,.12)",color:tierMeta.color==="#64748b"?"#cbd5e1":"#6ee7b7",
              fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700"}}>
              {tierMeta.label}
            </span>
          </div>
          <button onClick={()=>{logout();navigate("/");}} style={{padding:"9px 18px",borderRadius:"8px",
            background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",color:"#fff",
            fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"13px",cursor:"pointer"}}>
            Logout
          </button>
        </div>
      </div>

      <div style={{maxWidth:"880px",margin:"0 auto",padding:"24px 20px 60px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
          {[
            ["profile","🏥 Profile"],
            ["photos","📷 Photos"],
            ...(["growth","strategic"].includes(profile.tier) ? [["banners","🖼️ Banners"]] : []),
            ...(profile.tier==="strategic" ? [["videos","🎬 Videos & Interviews"]] : []),
            ["billing","💳 Billing"],
            ...(hasCommissions ? [["commissions","💰 Commissions"]] : []),
            ...(["basic","growth"].includes(profile.tier) ? [["upgrade","⬆️ Upgrade Plan"]] : []),
          ].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} className={`hd-tab${tab===id?" active":""}`}>{label}</button>
          ))}
        </div>

        {tab==="profile"     && <ProfileTab profile={profile} token={token} onUpdated={fetchProfile}/>}
        {tab==="photos"      && <PhotosTab profile={profile} token={token} onUpdated={fetchProfile}/>}
        {tab==="banners"     && (
          !["growth","strategic"].includes(profile.tier)
            ? <LockedFeature requiredTier="growth">Upload promotional banners to feature your hospital on our website. Available from Growth Partner plan.</LockedFeature>
            : !isPaid
              ? <PaymentRequired onGoToBilling={()=>setTab("billing")} tier={profile.tier}/>
              : <BannersTab profile={profile} token={token} onUpdated={fetchProfile}/>
        )}
        {tab==="videos"      && (
          profile.tier!=="strategic"
            ? <LockedFeature requiredTier="strategic">Upload promotional videos and doctor interview videos. Available on Strategic Partner plan.</LockedFeature>
            : !isPaid
              ? <PaymentRequired onGoToBilling={()=>setTab("billing")} tier={profile.tier}/>
              : <VideosTab profile={profile} token={token} onUpdated={fetchProfile}/>
        )}
        {tab==="billing"     && <BillingTab profile={profile} token={token} onPaySuccess={()=>setIsPaid(true)}/>}
        {tab==="commissions" && <CommissionsTab token={token}/>}
        {tab==="upgrade"     && <UpgradePlanTab profile={profile} token={token}/>}
      </div>
    </div>
  );
}
