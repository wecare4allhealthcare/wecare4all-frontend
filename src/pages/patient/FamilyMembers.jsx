/**
 * patient/FamilyMembers.jsx — manage reusable family member profiles
 * (spouse/parent/child) so booking for them doesn't need a separate
 * login. Standalone page, same visual style as patient/Profile.jsx.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.fm{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.fm *{box-sizing:border-box;} .fm a{text-decoration:none;}
.fm h1,.fm h2,.fm h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.fm-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:10px 13px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;
  outline:none;transition:all .2s;-webkit-appearance:none;}
.fm-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.fm-lbl{display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;}
.fm-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;
  padding:18px;margin-bottom:12px;animation:fadeUp .4s ease forwards;}
.fm-grid{display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:560px){ .fm-grid{grid-template-columns:1fr 1fr;} .fm-full{grid-column:span 2;} }
.fm-btn{background:linear-gradient(135deg,#047857,#059669);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:12px 22px;border-radius:9px;border:none;cursor:pointer;
  box-shadow:0 4px 16px rgba(4,120,87,.30);transition:all .2s;}
.fm-btn:hover{transform:translateY(-1px);}
.fm-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
`;

const RELATIONSHIPS = ["Spouse","Parent","Child","Sibling","Other"];
const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const emptyForm = { full_name:"", relationship:"", date_of_birth:"", gender:"", blood_group:"", mobile:"", notes:"" };

export default function FamilyMembers() {
  const [members,  setMembers]  = useState(null);
  const [editing,  setEditing]  = useState(null); // null = not editing, "new" = adding, or an id
  const [form,     setForm]     = useState(emptyForm);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");

  useEffect(() => {
    document.title = "Family Members — We Care 4 'all'";
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/family-members`, { headers:{ Authorization:`Bearer ${token}` }});
      const json  = await res.json();
      setMembers(json.family_members || []);
    } catch { setMembers([]); }
  };

  const startAdd = () => { setForm(emptyForm); setEditing("new"); setErr(""); };
  const startEdit = (m) => {
    setForm({
      full_name: m.full_name || "", relationship: m.relationship || "",
      date_of_birth: m.date_of_birth || "", gender: m.gender || "",
      blood_group: m.blood_group || "", mobile: m.mobile || "", notes: m.notes || "",
    });
    setEditing(m.id); setErr("");
  };
  const cancelEdit = () => { setEditing(null); setForm(emptyForm); setErr(""); };
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSave = async (e) => {
    e.preventDefault(); setErr("");
    if (!form.full_name.trim()) { setErr("Name is required"); return; }
    if (!form.relationship) { setErr("Please select a relationship"); return; }

    setSaving(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const isNew = editing === "new";
      const res = await fetch(`${API}/family-members${isNew ? "" : `/${editing}`}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ ...form, date_of_birth: form.date_of_birth || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Couldn't save");
      cancelEdit();
      fetchMembers();
    } catch (ex) { setErr(ex.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this family member? Their past appointment history stays intact — this only removes the saved profile.")) return;
    try {
      const token = localStorage.getItem("wc4a_token");
      await fetch(`${API}/family-members/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
      fetchMembers();
    } catch {}
  };

  return (
    <div className="fm">
      <style>{G}</style>
      <div style={{maxWidth:"720px",margin:"0 auto",padding:"20px 16px 60px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
          <div>
            <Link to="/patient/dashboard" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b"}}>← Back to Dashboard</Link>
            <h1 style={{fontSize:"28px",fontWeight:"700",color:"#0b1f3a",margin:"6px 0 0"}}>Family Members</h1>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginTop:"2px"}}>
              Save a profile for a spouse, parent, or child to book for them quickly.
            </p>
          </div>
          {editing===null && (
            <button className="fm-btn" onClick={startAdd}>+ Add</button>
          )}
        </div>

        {(editing!==null) && (
          <form onSubmit={handleSave} className="fm-card">
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",color:"#047857",
              letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"14px"}}>
              {editing==="new" ? "Add Family Member" : "Edit Family Member"}
            </p>
            <div className="fm-grid">
              <div>
                <label className="fm-lbl">Full Name *</label>
                <input className="fm-inp" value={form.full_name} onChange={e=>set("full_name",e.target.value)} placeholder="e.g. Lakshmi Raman"/>
              </div>
              <div>
                <label className="fm-lbl">Relationship *</label>
                <select className="fm-inp" value={form.relationship} onChange={e=>set("relationship",e.target.value)}>
                  <option value="">Select</option>
                  {RELATIONSHIPS.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="fm-lbl">Date of Birth</label>
                <input type="date" className="fm-inp" value={form.date_of_birth} onChange={e=>set("date_of_birth",e.target.value)}/>
              </div>
              <div>
                <label className="fm-lbl">Gender</label>
                <select className="fm-inp" value={form.gender} onChange={e=>set("gender",e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="fm-lbl">Blood Group</label>
                <select className="fm-inp" value={form.blood_group} onChange={e=>set("blood_group",e.target.value)}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="fm-lbl">Mobile (if different from yours)</label>
                <input className="fm-inp" value={form.mobile} onChange={e=>set("mobile",e.target.value)} placeholder="90XXXXXXXX"/>
              </div>
              <div className="fm-full">
                <label className="fm-lbl">Notes (allergies, conditions, etc.)</label>
                <textarea className="fm-inp" rows={2} style={{resize:"vertical"}}
                  value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Optional"/>
              </div>
            </div>
            {err && <p style={{color:"#dc2626",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginTop:"10px"}}>⚠ {err}</p>}
            <div style={{display:"flex",gap:"10px",marginTop:"16px"}}>
              <button type="submit" disabled={saving} className="fm-btn">{saving ? "Saving…" : "Save"}</button>
              <button type="button" onClick={cancelEdit} style={{padding:"12px 22px",borderRadius:"9px",
                background:"#f8fafc",border:"1px solid #e2eaf4",color:"#64748b",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",cursor:"pointer"}}>Cancel</button>
            </div>
          </form>
        )}

        {members===null ? (
          <div style={{textAlign:"center",padding:"40px"}}>
            <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",borderTop:"3px solid #047857",
              borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
          </div>
        ) : members.length===0 && editing===null ? (
          <div style={{padding:"40px 20px",textAlign:"center",background:"#fff",borderRadius:"14px",border:"1px solid #e2eaf4"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"14px"}}>
              No family members saved yet. Add one to book appointments for them quickly next time.
            </p>
          </div>
        ) : members.map(m => (
          <div key={m.id} className="fm-card" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",color:"#0b1f3a",margin:0}}>{m.full_name}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#64748b",margin:"3px 0 0"}}>
                {m.relationship}{m.date_of_birth ? ` · ${new Date(m.date_of_birth).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}` : ""}{m.blood_group ? ` · ${m.blood_group}` : ""}
              </p>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>startEdit(m)} style={{padding:"7px 14px",borderRadius:"7px",
                background:"#eff8ff",border:"1px solid #93c5fd",color:"#0369a1",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>Edit</button>
              <button onClick={()=>handleDelete(m.id)} style={{padding:"7px 14px",borderRadius:"7px",
                background:"#fef2f2",border:"1px solid #fecaca",color:"#991b1b",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
