/**
 * patient/Profile.jsx — Patient Profile
 * View and edit personal health details
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.pp{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.pp *{box-sizing:border-box;} .pp a{text-decoration:none;}
.pp h1,.pp h2,.pp h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.pp-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:10px 13px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;
  background:#f8fafc;outline:none;transition:all .2s;}
.pp-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.pp-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:4px;}
.pp-sec{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;
  color:#047857;letter-spacing:1.5px;text-transform:uppercase;
  padding-bottom:8px;border-bottom:1px solid #e2eaf4;margin-bottom:16px;}
.save-btn{background:linear-gradient(135deg,#047857,#059669);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:12px 28px;border-radius:9px;border:none;cursor:pointer;
  box-shadow:0 4px 16px rgba(4,120,87,.35);transition:all .25s;}
.save-btn:hover{transform:translateY(-1px);}
.save-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
@media(max-width:680px){.pp-grid{grid-template-columns:1fr!important;}}
`;

export default function PatientProfile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    full_name:"", date_of_birth:"", gender:"",
    blood_group:"", address:"", city:"",
    state:"", pincode:"", emergency_contact:"",
  });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved]       = useState(false);
  const [err, setErr]           = useState("");

  useEffect(() => {
    document.title = "My Profile — We Care 4 'all'";
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setForm(p => ({
        ...p,
        full_name:         json.name       || "",
        date_of_birth:     json.date_of_birth || "",
        gender:            json.gender      || "",
        blood_group:       json.blood_group  || "",
        address:           json.address     || "",
        city:              json.city        || "",
        state:             json.state       || "",
        pincode:           json.pincode     || "",
        emergency_contact: json.emergency_contact || "",
      }));
    } catch {}
    finally { setFetching(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setErr(""); setSaved(false);
    if (!form.full_name.trim()) { setErr("Full name is required"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/patients/profile`, {
        method:  "PUT",
        headers: { "Content-Type":"application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.detail || "Update failed"); }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (ex) { setErr(ex.message); }
    finally { setLoading(false); }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const ip = (k, type="text", ph="") => ({
    type, value: form[k], placeholder: ph,
    className: "pp-inp",
    onChange: e => set(k, e.target.value),
  });

  if (fetching) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#f0f6fc" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:"36px", height:"36px", border:"3px solid #e2eaf4",
          borderTop:"3px solid #047857", borderRadius:"50%",
          animation:"spin .8s linear infinite", margin:"0 auto 12px" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#94a3b8" }}>Loading profile…</p>
      </div>
    </div>
  );

  return (
    <div className="pp">
      <style>{G}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#0b1f3a,#112d52)",
        padding:"28px 24px" }}>
        <div style={{ maxWidth:"860px", margin:"0 auto",
          display:"flex", justifyContent:"space-between",
          alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
              color:"rgba(255,255,255,.5)", marginBottom:"4px" }}>Patient Profile</p>
            <h1 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:"700",
              color:"#fff", margin:0 }}>
              {form.full_name || user?.email || "My Profile"}
            </h1>
          </div>
          <Link to="/patient/dashboard" style={{ padding:"9px 18px",
            borderRadius:"8px", background:"rgba(255,255,255,.10)",
            border:"1px solid rgba(255,255,255,.20)", color:"#fff",
            fontFamily:"'DM Sans',sans-serif", fontWeight:"500", fontSize:"13px" }}>
            ← Dashboard
          </Link>
        </div>
      </div>

      <div style={{ maxWidth:"860px", margin:"0 auto", padding:"28px 24px" }}>
        <form onSubmit={handleSave}>

          {/* Avatar */}
          <div style={{ background:"#fff", border:"1px solid #e2eaf4",
            borderRadius:"16px", padding:"24px", marginBottom:"20px",
            display:"flex", alignItems:"center", gap:"20px" }}>
            <div style={{ width:"72px", height:"72px",
              background:"linear-gradient(135deg,#0b1f3a,#047857)",
              borderRadius:"50%", display:"flex", alignItems:"center",
              justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif",
                fontSize:"30px", fontWeight:"700", color:"#fff" }}>
                {(form.full_name || user?.email || "P")[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 style={{ fontSize:"20px", fontWeight:"700", color:"#0b1f3a",
                margin:"0 0 4px" }}>
                {form.full_name || "Add Your Name"}
              </h2>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
                color:"#94a3b8", margin:0 }}>
                {user?.email || user?.mobile || ""}
              </p>
            </div>
          </div>

          {/* Personal Info */}
          <div style={{ background:"#fff", border:"1px solid #e2eaf4",
            borderRadius:"16px", padding:"24px", marginBottom:"16px" }}>
            <p className="pp-sec">Personal Information</p>
            <div className="pp-grid" style={{ display:"grid",
              gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
              <div style={{ gridColumn:"span 2" }}>
                <label className="pp-lbl">Full Name *</label>
                <input {...ip("full_name","text","e.g. Priya Venkatesh")}/>
              </div>
              <div>
                <label className="pp-lbl">Date of Birth</label>
                <input {...ip("date_of_birth","date")}/>
              </div>
              <div>
                <label className="pp-lbl">Gender</label>
                <select value={form.gender} onChange={e=>set("gender",e.target.value)} className="pp-inp">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="pp-lbl">Blood Group</label>
                <select value={form.blood_group} onChange={e=>set("blood_group",e.target.value)} className="pp-inp">
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="pp-lbl">Emergency Contact</label>
                <input {...ip("emergency_contact","tel","e.g. 90XXXXXXXX")}/>
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={{ background:"#fff", border:"1px solid #e2eaf4",
            borderRadius:"16px", padding:"24px", marginBottom:"20px" }}>
            <p className="pp-sec">Address</p>
            <div className="pp-grid" style={{ display:"grid",
              gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
              <div style={{ gridColumn:"span 2" }}>
                <label className="pp-lbl">Street Address</label>
                <textarea value={form.address} onChange={e=>set("address",e.target.value)}
                  className="pp-inp" rows={2} style={{ resize:"vertical" }}
                  placeholder="Door No., Street, Area, Landmark"/>
              </div>
              <div>
                <label className="pp-lbl">City</label>
                <input {...ip("city","text","Chennai")}/>
              </div>
              <div>
                <label className="pp-lbl">State</label>
                <select value={form.state} onChange={e=>set("state",e.target.value)} className="pp-inp">
                  <option value="">Select state</option>
                  {["Tamil Nadu","Kerala","Karnataka","Andhra Pradesh",
                    "Telangana","Maharashtra","Delhi","Gujarat","Others"].map(s=>(
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="pp-lbl">Pincode</label>
                <input {...ip("pincode","text","600017")} maxLength={6}/>
              </div>
            </div>
          </div>

          {/* Error / Success */}
          {err &&
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca",
              borderRadius:"10px", padding:"12px 16px", marginBottom:"16px" }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#dc2626",
                fontSize:"13px", margin:0 }}>⚠ {err}</p>
            </div>}
          {saved &&
            <div style={{ background:"#f0fdf4", border:"1px solid #86efac",
              borderRadius:"10px", padding:"12px 16px", marginBottom:"16px" }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#15803d",
                fontSize:"13px", margin:0 }}>✅ Profile updated successfully!</p>
            </div>}

          <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? "Saving…" : "Save Profile →"}
            </button>
            <Link to="/patient/dashboard" style={{ fontFamily:"'DM Sans',sans-serif",
              fontSize:"14px", color:"#94a3b8" }}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
