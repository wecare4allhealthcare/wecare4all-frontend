/**
 * patient/Profile.jsx — Fix 3
 * FIXES:
 * 1. Mobile responsive — single column on small screens
 * 2. Shows all registration details: name, email, mobile, designation
 * 3. Pre-fills form from /auth/me response
 * 4. Save updates backend via /patients/profile
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
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.pp-inp{
  width:100%;border:1.5px solid #e2eaf4;border-radius:9px;
  padding:11px 13px;font-family:'DM Sans',sans-serif;font-size:14px;
  color:#1e293b;background:#f8fafc;outline:none;transition:all .2s;
  -webkit-appearance:none;
}
.pp-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.pp-inp:disabled{background:#f1f5f9;color:#6b7688;cursor:not-allowed;}
.pp-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.pp-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;
  padding:20px;margin-bottom:14px;animation:fadeUp .4s ease forwards;}
.pp-sec{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;
  color:#047857;letter-spacing:1.5px;text-transform:uppercase;
  padding-bottom:8px;border-bottom:1.5px solid #e2eaf4;margin-bottom:16px;}
.save-btn{background:linear-gradient(135deg,#047857,#059669);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:13px 28px;border-radius:9px;border:none;cursor:pointer;
  box-shadow:0 4px 16px rgba(4,120,87,.35);transition:all .25s;
  width:100%;}
.save-btn:hover{transform:translateY(-1px);}
.save-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
/* 2-col grid on tablet+, 1-col on mobile */
.pp-grid{display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:560px){
  .pp-grid{grid-template-columns:1fr 1fr;}
  .pp-full{grid-column:span 2;}
  .save-btn{width:auto;}
}
`;

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const STATES = [
  "Tamil Nadu","Kerala","Karnataka","Andhra Pradesh","Telangana",
  "Maharashtra","Delhi","Gujarat","Rajasthan","Punjab",
  "West Bengal","Odisha","Bihar","Uttar Pradesh","Madhya Pradesh","Others"
];
const DESIGNATIONS = [
  "Patient","Patient Caretaker","Student","Software Engineer",
  "Doctor","Nurse","Teacher","Business Owner","Government Employee",
  "Homemaker","Retired","Other",
];

export default function PatientProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name:"", email:"", mobile:"", designation:"Patient",
    date_of_birth:"", gender:"", blood_group:"",
    address:"", city:"", state:"", pincode:"", emergency_contact:"",
  });
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved,    setSaved]    = useState(false);
  const [err,      setErr]      = useState("");

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
      if (res.ok) {
        setForm(p => ({
          ...p,
          full_name:         json.name          || json.full_name    || "",
          email:             json.email         || "",
          mobile:            json.mobile        || "",
          designation:       json.designation   || "Patient",
          date_of_birth:     json.date_of_birth || "",
          gender:            json.gender        || "",
          blood_group:       json.blood_group   || "",
          address:           json.address       || "",
          city:              json.city          || "",
          state:             json.state         || "",
          pincode:           json.pincode       || "",
          emergency_contact: json.emergency_contact || "",
        }));
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
    } finally {
      setFetching(false);
    }
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
        body: JSON.stringify({
          full_name:         form.full_name,
          date_of_birth:     form.date_of_birth || null,
          gender:            form.gender        || null,
          blood_group:       form.blood_group   || null,
          address:           form.address       || null,
          city:              form.city          || null,
          state:             form.state         || null,
          pincode:           form.pincode       || null,
          emergency_contact: form.emergency_contact || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.detail || "Update failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Loading spinner
  if (fetching) return (
    <div className="pp" style={{display:"flex",alignItems:"center",
      justifyContent:"center",minHeight:"100vh"}}>
      <style>{G}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:"36px",height:"36px",border:"3px solid #e2eaf4",
          borderTop:"3px solid #047857",borderRadius:"50%",
          animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
        <p style={{fontFamily:"'DM Sans',sans-serif",color:"#6b7688",fontSize:"14px"}}>
          Loading profile…
        </p>
      </div>
    </div>
  );

  const initials = (form.full_name || user?.name || "P")[0].toUpperCase();

  return (
    <div className="pp">
      <style>{G}</style>

      {/* ── Header bar ── */}
      <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",
        padding:"20px 20px 24px"}}>
        <div style={{maxWidth:"720px",margin:"0 auto",
          display:"flex",justifyContent:"space-between",
          alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.5)",marginBottom:"4px",
              textTransform:"uppercase",letterSpacing:"1px"}}>
              Patient Profile
            </p>
            <h1 style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:"700",
              color:"#fff",margin:0}}>
              {form.full_name || user?.name || "My Profile"}
            </h1>
          </div>
          <Link to="/patient/dashboard" style={{
            padding:"9px 18px",borderRadius:"8px",
            background:"rgba(255,255,255,.12)",
            border:"1px solid rgba(255,255,255,.20)",
            color:"#fff",fontFamily:"'DM Sans',sans-serif",
            fontWeight:"500",fontSize:"13px",
          }}>
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{maxWidth:"720px",margin:"0 auto",padding:"20px 16px 40px"}}>

        {/* Avatar card */}
        <div className="pp-card" style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{
            width:"64px",height:"64px",flexShrink:0,
            background:"linear-gradient(135deg,#0b1f3a,#047857)",
            borderRadius:"50%",display:"flex",alignItems:"center",
            justifyContent:"center",
          }}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",
              fontSize:"28px",fontWeight:"700",color:"#fff"}}>
              {initials}
            </span>
          </div>
          <div style={{minWidth:0}}>
            <h2 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",
              margin:"0 0 4px",overflow:"hidden",textOverflow:"ellipsis",
              whiteSpace:"nowrap"}}>
              {form.full_name || "Add Your Name"}
            </h2>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
              color:"#6b7688",margin:0,overflow:"hidden",
              textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {form.email || form.mobile || ""}
              {form.designation && form.designation !== "Patient" &&
                <span style={{marginLeft:"8px",padding:"2px 8px",
                  background:"#f0fdf4",color:"#047857",borderRadius:"50px",
                  fontSize:"11px",fontWeight:"600"}}>
                  {form.designation}
                </span>}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>

          {/* ── Account Info (read-only) ── */}
          <div className="pp-card">
            <p className="pp-sec">Account Information</p>
            <div className="pp-grid">
              <div>
                <label className="pp-lbl" htmlFor="patient-profile-email-address">Email Address</label>
                <input id="patient-profile-email-address" value={form.email} disabled className="pp-inp"
                  placeholder="Not set"/>
              </div>
              <div>
                <label className="pp-lbl" htmlFor="patient-profile-mobile-number">Mobile Number</label>
                <input id="patient-profile-mobile-number" value={form.mobile ? `+91 ${form.mobile}` : ""} disabled
                  className="pp-inp" placeholder="Not set"/>
              </div>
              <div className="pp-full">
                <label className="pp-lbl" htmlFor="patient-profile-designation">Designation</label>
                <input id="patient-profile-designation" value={form.designation} disabled className="pp-inp"/>
              </div>
            </div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"#6b7688",marginTop:"10px",marginBottom:0}}>
              ℹ️ Email, mobile and designation are set at registration. Contact support to change.
            </p>
          </div>

          {/* ── Personal Info ── */}
          <div className="pp-card">
            <p className="pp-sec">Personal Information</p>
            <div className="pp-grid">
              <div className="pp-full">
                <label className="pp-lbl" htmlFor="patient-profile-full-name">Full Name *</label>
                <input id="patient-profile-full-name" value={form.full_name}
                  onChange={e => set("full_name", e.target.value)}
                  className="pp-inp" placeholder="e.g. Priya Venkatesh"/>
              </div>
              <div>
                <label className="pp-lbl" htmlFor="patient-profile-date-of-birth">Date of Birth</label>
                <input id="patient-profile-date-of-birth" type="date" value={form.date_of_birth}
                  onChange={e => set("date_of_birth", e.target.value)}
                  className="pp-inp"/>
              </div>
              <div>
                <label className="pp-lbl" htmlFor="patient-profile-gender">Gender</label>
                <select id="patient-profile-gender" value={form.gender}
                  onChange={e => set("gender", e.target.value)}
                  className="pp-inp">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="pp-lbl" htmlFor="patient-profile-blood-group">Blood Group</label>
                <select id="patient-profile-blood-group" value={form.blood_group}
                  onChange={e => set("blood_group", e.target.value)}
                  className="pp-inp">
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(b =>
                    <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="pp-lbl" htmlFor="patient-profile-emergency-contact">Emergency Contact</label>
                <input id="patient-profile-emergency-contact" type="tel" value={form.emergency_contact}
                  onChange={e => set("emergency_contact", e.target.value)}
                  className="pp-inp" placeholder="90XXXXXXXX"/>
              </div>
            </div>
          </div>

          {/* ── Address ── */}
          <div className="pp-card">
            <p className="pp-sec">Address</p>
            <div className="pp-grid">
              <div className="pp-full">
                <label className="pp-lbl" htmlFor="patient-profile-street-address">Street Address</label>
                <textarea id="patient-profile-street-address" value={form.address}
                  onChange={e => set("address", e.target.value)}
                  className="pp-inp" rows={2}
                  style={{resize:"vertical"}}
                  placeholder="Door No., Street, Area, Landmark"/>
              </div>
              <div>
                <label className="pp-lbl" htmlFor="patient-profile-city">City</label>
                <input id="patient-profile-city" value={form.city}
                  onChange={e => set("city", e.target.value)}
                  className="pp-inp" placeholder="Chennai"/>
              </div>
              <div>
                <label className="pp-lbl" htmlFor="patient-profile-state">State</label>
                <select id="patient-profile-state" value={form.state}
                  onChange={e => set("state", e.target.value)}
                  className="pp-inp">
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="pp-lbl" htmlFor="patient-profile-pincode">Pincode</label>
                <input id="patient-profile-pincode" value={form.pincode}
                  onChange={e => set("pincode", e.target.value)}
                  className="pp-inp" placeholder="600017" maxLength={6}/>
              </div>
            </div>
          </div>

          {/* Error / Success */}
          {err && (
            <div style={{background:"#fef2f2",border:"1px solid #fecaca",
              borderRadius:"10px",padding:"12px 16px",marginBottom:"14px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",
                fontSize:"13px",margin:0}}>⚠ {err}</p>
            </div>
          )}
          {saved && (
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",
              borderRadius:"10px",padding:"12px 16px",marginBottom:"14px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",color:"#15803d",
                fontSize:"13px",margin:0}}>✅ Profile updated successfully!</p>
            </div>
          )}

          {/* Save button */}
          <button type="submit" disabled={loading} className="save-btn">
            {loading ? "Saving…" : "Save Profile →"}
          </button>
        </form>
      </div>
    </div>
  );
}
