/**
 * hospital/Portal.jsx — token-based hospital partner portal.
 * No login form — the token in the URL itself is the credential
 * (see app/routes/hospital_portal.py for the backend side of this).
 */
import { useEffect, useState } from "react";
import { showToast } from "../../components/Toast";
import { useParams } from "react-router-dom";
import SEO from "../../components/SEO";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.hpp{font-family:'DM Sans',sans-serif;color:#1e293b;min-height:100vh;background:#f0f6fc;}
.hpp *{box-sizing:border-box;}
.hpp h1,.hpp h2,.hpp h3{font-family:'Cormorant Garamond',serif;color:#0b1f3a;}
.hpp-tab{padding:10px 18px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;
  font-weight:600;cursor:pointer;border:1px solid #e2eaf4;background:#fff;color:#64748b;}
.hpp-tab.on{background:#047857;color:#fff;border-color:#047857;}
.hpp-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:8px;padding:10px 12px;
  font-family:'DM Sans',sans-serif;font-size:14px;outline:none;}
.hpp-inp:focus{border-color:#047857;}
.hpp-card{background:#fff;border-radius:14px;padding:24px;box-shadow:0 2px 10px rgba(11,31,58,.06);}
@keyframes spin{to{transform:rotate(360deg)}}
`;

function Spinner() {
  return <div style={{textAlign:"center",padding:"60px"}}>
    <div style={{width:"30px",height:"30px",border:"3px solid #e2eaf4",borderTop:"3px solid #047857",
      borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
  </div>;
}

export default function HospitalPortal() {
  const { token } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState("profile");
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({});
  const [commissions, setCommissions] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res  = await fetch(`${API}/hospital-portal/${token}`);
      if (!res.ok) { setError("This portal link is invalid or no longer active."); return; }
      const json = await res.json();
      setProfile(json);
      setForm({
        contact_person: json.contact_person || "",
        designation:    json.designation || "",
        mobile:         json.mobile || "",
        website:        json.website || "",
        notes:          json.notes || "",
      });
    } catch { setError("Couldn't load your portal right now. Please try again shortly."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, [token]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/hospital-portal/${token}`, {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form),
      });
      fetchProfile();
    } catch {}
    finally { setSaving(false); }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/hospital-portal/${token}/photos`, {
        method:"POST", body:fd,
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Upload failed", "error"); return; }
      setProfile(p => ({ ...p, photos: json.photos }));
    } catch { showToast("Upload failed. Please try again.", "error"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const removePhoto = async (url) => {
    if (!window.confirm("Remove this photo?")) return;
    try {
      const res  = await fetch(`${API}/hospital-portal/${token}/photos`, {
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ url }),
      });
      const json = await res.json();
      setProfile(p => ({ ...p, photos: json.photos }));
    } catch {}
  };

  const loadCommissions = async () => {
    if (commissions) return;
    try {
      const res  = await fetch(`${API}/hospital-portal/${token}/commissions`);
      const json = await res.json();
      setCommissions(json.commissions || []);
    } catch { setCommissions([]); }
  };

  if (loading) return <div className="hpp"><style>{G}</style><Spinner/></div>;

  if (error) {
    return (
      <div className="hpp" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
        <style>{G}</style>
        <div className="hpp-card" style={{textAlign:"center",maxWidth:"420px"}}>
          <div style={{fontSize:"36px",marginBottom:"12px"}}>🔒</div>
          <h2 style={{fontSize:"19px",marginBottom:"8px"}}>Portal Link Not Found</h2>
          <p style={{fontSize:"13.5px",color:"#64748b"}}>{error}</p>
          <p style={{fontSize:"12.5px",color:"#94a3b8",marginTop:"14px"}}>
            If you believe this is a mistake, contact We Care 4 "all" support and we'll
            issue you a fresh link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hpp">
      <style>{G}</style>
      <SEO title="Hospital Partner Portal" noindex description="Hospital partner portal" />

      <div style={{background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",padding:"32px 24px"}}>
        <div style={{maxWidth:"880px",margin:"0 auto"}}>
          <p style={{color:"rgba(255,255,255,.5)",fontSize:"12px",letterSpacing:"1px",
            textTransform:"uppercase",marginBottom:"6px"}}>Partner Portal</p>
          <h1 style={{color:"#fff",fontSize:"clamp(22px,3vw,30px)",margin:0}}>{profile.hospital_name}</h1>
          <span style={{display:"inline-block",marginTop:"8px",background:"rgba(255,255,255,.12)",
            color:"#6ee7b7",fontSize:"11px",fontWeight:"700",padding:"4px 12px",borderRadius:"50px",
            textTransform:"uppercase"}}>
            {profile.tier || "basic"} partner
          </span>
        </div>
      </div>

      <div style={{maxWidth:"880px",margin:"0 auto",padding:"24px"}}>
        <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
          <button className={`hpp-tab${tab==="profile"?" on":""}`} onClick={()=>setTab("profile")}>Profile</button>
          <button className={`hpp-tab${tab==="photos"?" on":""}`} onClick={()=>setTab("photos")}>Photos</button>
          <button className={`hpp-tab${tab==="commissions"?" on":""}`}
            onClick={()=>{setTab("commissions");loadCommissions();}}>Commissions</button>
        </div>

        {tab==="profile" && (
          <div className="hpp-card">
            <h3 style={{fontSize:"16px",marginBottom:"4px"}}>Contact Details</h3>
            <p style={{fontSize:"12.5px",color:"#94a3b8",marginBottom:"16px"}}>
              Hospital name, tier, and verified specialties are managed by our team — contact
              support if any of those need updating. Everything below, you can edit yourself.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"14px"}}>
              <div>
                <label style={{fontSize:"12px",color:"#64748b",fontWeight:"600"}}>Contact Person</label>
                <input className="hpp-inp" style={{marginTop:"4px"}} value={form.contact_person}
                  onChange={e=>setForm({...form,contact_person:e.target.value})}/>
              </div>
              <div>
                <label style={{fontSize:"12px",color:"#64748b",fontWeight:"600"}}>Designation</label>
                <input className="hpp-inp" style={{marginTop:"4px"}} value={form.designation}
                  onChange={e=>setForm({...form,designation:e.target.value})}/>
              </div>
              <div>
                <label style={{fontSize:"12px",color:"#64748b",fontWeight:"600"}}>Mobile</label>
                <input className="hpp-inp" style={{marginTop:"4px"}} value={form.mobile}
                  onChange={e=>setForm({...form,mobile:e.target.value})}/>
              </div>
              <div>
                <label style={{fontSize:"12px",color:"#64748b",fontWeight:"600"}}>Website</label>
                <input className="hpp-inp" style={{marginTop:"4px"}} value={form.website}
                  onChange={e=>setForm({...form,website:e.target.value})}/>
              </div>
            </div>
            <div style={{marginTop:"14px"}}>
              <label style={{fontSize:"12px",color:"#64748b",fontWeight:"600"}}>About Your Hospital</label>
              <textarea className="hpp-inp" style={{marginTop:"4px",minHeight:"90px",resize:"vertical"}}
                value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
            </div>
            <button onClick={saveProfile} disabled={saving}
              style={{marginTop:"16px",background:"linear-gradient(135deg,#047857,#059669)",
                color:"#fff",border:"none",borderRadius:"8px",padding:"11px 26px",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"13.5px",cursor:"pointer"}}>
              {saving?"Saving…":"Save Changes"}
            </button>
          </div>
        )}

        {tab==="photos" && (
          <div className="hpp-card">
            <h3 style={{fontSize:"16px",marginBottom:"4px"}}>Hospital Photos</h3>
            <p style={{fontSize:"12.5px",color:"#94a3b8",marginBottom:"16px"}}>
              JPEG, PNG, or WebP, up to 5MB each. These may be used to showcase your hospital
              on our site.
            </p>
            <label style={{display:"inline-flex",alignItems:"center",gap:"8px",
              background:"#f0fdf4",border:"1.5px dashed #86efac",borderRadius:"10px",
              padding:"14px 20px",cursor:"pointer",fontSize:"13px",fontWeight:"600",
              color:"#15803d",marginBottom:"18px"}}>
              📷 {uploading?"Uploading…":"Upload a Photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto}
                disabled={uploading} style={{display:"none"}}/>
            </label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"12px"}}>
              {(profile.photos||[]).length===0 ? (
                <p style={{fontSize:"13px",color:"#94a3b8",gridColumn:"1/-1"}}>No photos uploaded yet.</p>
              ) : profile.photos.map((url,i) => (
                <div key={i} style={{position:"relative",borderRadius:"10px",overflow:"hidden",
                  aspectRatio:"1",background:"#f1f5f9"}}>
                  <img src={url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <button onClick={()=>removePhoto(url)}
                    style={{position:"absolute",top:"6px",right:"6px",width:"24px",height:"24px",
                      borderRadius:"50%",background:"rgba(0,0,0,.55)",color:"#fff",border:"none",
                      cursor:"pointer",fontSize:"13px",lineHeight:1}}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="commissions" && (
          <div className="hpp-card">
            <h3 style={{fontSize:"16px",marginBottom:"4px"}}>Commission History</h3>
            <p style={{fontSize:"12.5px",color:"#94a3b8",marginBottom:"16px"}}>
              Referral and partnership amounts recorded by our team.
            </p>
            {commissions===null ? <Spinner/> : commissions.length===0 ? (
              <p style={{fontSize:"13px",color:"#94a3b8"}}>No commission records yet.</p>
            ) : commissions.map(c => (
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",padding:"12px 0",borderBottom:"1px solid #f1f5f9"}}>
                <div>
                  <strong style={{fontSize:"14px",color:"#0b1f3a"}}>₹{c.amount_due}</strong>
                  {c.commission_rate && <span style={{fontSize:"12px",color:"#94a3b8",marginLeft:"8px"}}>
                    ({c.commission_rate}%)</span>}
                  <p style={{fontSize:"11.5px",color:"#94a3b8",margin:"2px 0 0"}}>
                    {new Date(c.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                  </p>
                </div>
                <span style={{fontSize:"11px",fontWeight:"700",padding:"4px 12px",borderRadius:"50px",
                  background: c.status==="received" ? "#dcfce7" : "#fef9c3",
                  color: c.status==="received" ? "#15803d" : "#854d0e"}}>
                  {c.status==="received" ? `Received ₹${c.amount_received}` : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
