/**
 * admin/Dashboard.jsx — Admin Dashboard
 * Sections: Overview, Appointments, Doctors, Empanelments, Contacts, Patients
 */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.ad{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.ad *{box-sizing:border-box;}
.ad h1,.ad h2,.ad h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{width:28px;height:28px;border:3px solid #e2eaf4;border-top:3px solid #047857;
  border-radius:50%;animation:spin .8s linear infinite;margin:0 auto;}

/* ── DESKTOP Sidebar (>= 700px) ── */
.ad-sidebar{
  position:fixed;left:0;top:0;bottom:0;width:220px;
  background:linear-gradient(180deg,#071524,#0b1f3a);
  z-index:100;overflow-y:auto;display:flex;flex-direction:column;
}
.ad-sidebar::-webkit-scrollbar{width:3px}
.ad-sidebar::-webkit-scrollbar-thumb{background:#047857;border-radius:3px}
.ad-content{margin-left:220px;padding:24px;padding-bottom:80px;}
.nav-item{
  display:flex;align-items:center;gap:10px;padding:12px 20px;
  font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;
  color:rgba(255,255,255,.58);cursor:pointer;transition:all .2s;
  border-left:3px solid transparent;text-decoration:none;border:none;
  background:transparent;width:100%;text-align:left;
}
.nav-item:hover{color:#fff;background:rgba(255,255,255,.07);}
.nav-item.active{color:#6ee7b7;border-left:3px solid #047857;background:rgba(4,120,87,.12);}

/* ── MOBILE Bottom tab bar (<= 699px) ── */
@media(max-width:699px){
  .ad-sidebar{display:none!important;}
  .ad-content{margin-left:0!important;padding:14px 12px 90px!important;}
  .ad-bottom-bar{display:flex!important;}
  /* Stack stat grid to 2 cols on mobile */
  .stat-grid-8{grid-template-columns:repeat(2,1fr)!important;}
  /* Data rows — stack action buttons below */
  .data-row-inner{flex-direction:column!important;align-items:flex-start!important;}
  .row-actions{flex-direction:row!important;flex-wrap:wrap!important;}
  /* Search inputs full width */
  .ad-inp.search{width:100%!important;}
  /* Modal full screen from bottom */
  .modal-bg{align-items:flex-end!important;padding:0!important;}
  .modal-box{border-radius:20px 20px 0 0!important;max-height:95vh!important;}
}
/* Bottom bar hidden on desktop */
.ad-bottom-bar{
  display:none;position:fixed;bottom:0;left:0;right:0;
  background:#0b1f3a;border-top:1px solid rgba(255,255,255,.12);
  z-index:200;height:60px;
}
.tab-btn{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:2px;border:none;background:transparent;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-size:9px;font-weight:600;
  color:rgba(255,255,255,.5);transition:all .2s;padding:6px 4px;
}
.tab-btn.active{color:#34d399;}
.tab-btn span.ti{font-size:18px;line-height:1;}

/* Cards */
.stat-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;padding:16px;
  transition:all .25s;box-shadow:0 2px 8px rgba(11,31,58,.05);}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(11,31,58,.10);}
.data-row{background:#fff;border:1px solid #e2eaf4;border-radius:11px;
  padding:12px 14px;margin-bottom:10px;transition:all .2s;}
.data-row:hover{box-shadow:0 4px 14px rgba(11,31,58,.08);}
.badge{display:inline-flex;align-items:center;font-size:11px;font-weight:700;
  padding:3px 10px;border-radius:50px;font-family:'DM Sans',sans-serif;white-space:nowrap;}
.ad-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:9px 12px;
  font-family:'DM Sans',sans-serif;font-size:13px;color:#1e293b;
  background:#f8fafc;outline:none;transition:all .2s;}
.ad-inp:focus{border-color:#047857;background:#fff;box-shadow:0 0 0 3px rgba(4,120,87,.09);}
.btn-sm{padding:6px 12px;border-radius:7px;border:none;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;transition:all .2s;}
.btn-green{background:#047857;color:#fff;}.btn-green:hover{background:#059669;}
.btn-navy{background:#0b1f3a;color:#fff;}.btn-navy:hover{background:#112d52;}
.btn-red{background:#dc2626;color:#fff;}.btn-red:hover{background:#b91c1c;}
.btn-amber{background:#d97706;color:#fff;}.btn-amber:hover{background:#b45309;}
.btn-outline{background:transparent;border:1.5px solid #e2eaf4;color:#64748b;}
.btn-outline:hover{border-color:#047857;color:#047857;}
/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2000;
  display:flex;align-items:center;justify-content:center;padding:16px;}
.modal-box{background:#fff;border-radius:18px;width:100%;max-width:480px;
  max-height:88vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.25);}
/* Filter chips - scrollable on mobile */
.filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.fchip{padding:7px 14px;border-radius:50px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:12px;
  font-weight:600;cursor:pointer;transition:all .2s;color:#64748b;white-space:nowrap;}
.fchip:hover{border-color:#047857;color:#047857;}
.fchip.on{background:#047857;border-color:#047857;color:#fff;}
/* Responsive 860px - compact sidebar */
@media(min-width:700px) and (max-width:860px){
  .ad-sidebar{width:64px;}
  .nav-label{display:none!important;}
  .ad-content{margin-left:64px;}
}
`;

const STATUSES = {
  pending:   {bg:"#fef9c3",color:"#854d0e"},
  approved:  {bg:"#dcfce7",color:"#15803d"},
  completed: {bg:"#dbeafe",color:"#1e40af"},
  cancelled: {bg:"#fee2e2",color:"#991b1b"},
  rejected:  {bg:"#fee2e2",color:"#991b1b"},
  new:       {bg:"#eff8ff",color:"#0369a1"},
  read:      {bg:"#f1f5f9",color:"#64748b"},
};

function Badge({ status }) {
  const s = STATUSES[status] || {bg:"#f1f5f9",color:"#64748b"};
  return <span className="badge" style={{background:s.bg,color:s.color}}>{status}</span>;
}

function Spinner() {
  return <div style={{padding:"60px 0",textAlign:"center"}}><div className="spin"/></div>;
}

function SectionHead({ title, count, action }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
      <div>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>{title}</h2>
        {count !== undefined && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#94a3b8",margin:"2px 0 0"}}>{count} records</p>}
      </div>
      {action}
    </div>
  );
}

// ── ADD DOCTOR MODAL ──────────────────────────────────────────
function AddDoctorModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name:"", email:"", password:"", specialization:"",
    sub_specialization:"", qualification:"", experience_yrs:"",
    phone:"", location:"", consultation_fee:"",
    available_online:true, available_home:false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [result, setResult]   = useState(null);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr("");
    if (!form.full_name||!form.email||!form.password) { setErr("Name, email and password required"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/admin/doctors`,{
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({...form,experience_yrs:parseInt(form.experience_yrs)||0,consultation_fee:parseInt(form.consultation_fee)||0}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail||"Failed");
      setResult(json.credentials);
      onSaved();
    } catch(ex){ setErr(ex.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div style={{background:"linear-gradient(135deg,#0b1f3a,#112d52)",padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3 style={{color:"#fff",fontSize:"17px",fontWeight:"700",margin:0}}>Add New Doctor</h3>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",color:"#fff",width:"30px",height:"30px",borderRadius:"7px",cursor:"pointer",fontSize:"16px"}}>×</button>
        </div>
        {result ? (
          <div style={{padding:"32px",textAlign:"center"}}>
            <div style={{fontSize:"40px",marginBottom:"14px"}}>✅</div>
            <h3 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",marginBottom:"8px"}}>Doctor Created!</h3>
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",padding:"16px",textAlign:"left",marginBottom:"16px"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",color:"#15803d",marginBottom:"8px"}}>Share with Doctor (securely):</p>
              {[["Email",result.email],["Password",result.password]].map(([l,v])=>(
                <div key={l} style={{display:"flex",gap:"8px",marginBottom:"5px"}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",minWidth:"70px"}}>{l}:</span>
                  <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#0b1f3a"}}>{v}</strong>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="btn-sm btn-navy" style={{padding:"10px 22px",fontSize:"13px"}}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{padding:"20px 22px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Full Name *</label>
                <input value={form.full_name} onChange={e=>set("full_name",e.target.value)} className="ad-inp" placeholder="Dr. Full Name"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Email *</label>
                <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} className="ad-inp" placeholder="doctor@email.com"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Password *</label>
                <input type="text" value={form.password} onChange={e=>set("password",e.target.value)} className="ad-inp" placeholder="Temp password"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Specialization</label>
                <input value={form.specialization} onChange={e=>set("specialization",e.target.value)} className="ad-inp" placeholder="Cardiology"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Qualification</label>
                <input value={form.qualification} onChange={e=>set("qualification",e.target.value)} className="ad-inp" placeholder="MBBS, MD"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Experience (yrs)</label>
                <input type="number" value={form.experience_yrs} onChange={e=>set("experience_yrs",e.target.value)} className="ad-inp" placeholder="10"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Consultation Fee (₹)</label>
                <input type="number" value={form.consultation_fee} onChange={e=>set("consultation_fee",e.target.value)} className="ad-inp" placeholder="500"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Phone</label>
                <input value={form.phone} onChange={e=>set("phone",e.target.value)} className="ad-inp" placeholder="90XXXXXXXX"/>
              </div>
              <div>
                <label style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",color:"#374151",display:"block",marginBottom:"4px"}}>Location</label>
                <input value={form.location} onChange={e=>set("location",e.target.value)} className="ad-inp" placeholder="Chennai, Tamil Nadu"/>
              </div>
              <div style={{gridColumn:"span 2",display:"flex",gap:"16px"}}>
                {[["available_online","🎥 Video Consult"],["available_home","🏠 Home Visit"]].map(([k,l])=>(
                  <label key={k} style={{display:"flex",alignItems:"center",gap:"7px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500",color:"#374151"}}>
                    <input type="checkbox" checked={form[k]} onChange={e=>set(k,e.target.checked)} style={{width:"15px",height:"15px",cursor:"pointer"}}/>
                    {l}
                  </label>
                ))}
              </div>
            </div>
            {err&&<p style={{fontFamily:"'DM Sans',sans-serif",color:"#dc2626",fontSize:"13px",marginTop:"10px"}}>⚠ {err}</p>}
            <div style={{display:"flex",gap:"10px",marginTop:"16px"}}>
              <button type="submit" disabled={loading} className="btn-sm btn-navy" style={{padding:"10px 22px",fontSize:"13px"}}>
                {loading?"Creating…":"Create Doctor →"}
              </button>
              <button type="button" onClick={onClose} className="btn-sm btn-outline" style={{padding:"10px 18px",fontSize:"13px"}}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── SECTIONS ─────────────────────────────────────────────────

function Overview({ stats }) {
  if (!stats) return <Spinner/>;
  const CARDS = [
    {label:"Pending",   value:stats.appointments.pending,   icon:"⏳",color:"#d97706",bg:"#fffbeb"},
    {label:"Approved",  value:stats.appointments.approved,  icon:"✅",color:"#047857",bg:"#f0fdf4"},
    {label:"Completed", value:stats.appointments.completed, icon:"🏆",color:"#0369a1",bg:"#eff8ff"},
    {label:"Today New", value:stats.appointments.today,     icon:"📅",color:"#7c3aed",bg:"#faf5ff"},
    {label:"Doctors",   value:stats.doctors.active,         icon:"👨‍⚕️",color:"#0b1f3a",bg:"#f0f6fc"},
    {label:"Patients",  value:stats.patients.total,         icon:"🧑‍💼",color:"#be123c",bg:"#fff1f2"},
    {label:"New Contacts",value:stats.contacts.new,         icon:"📬",color:"#b45309",bg:"#fffbeb"},
    {label:"Empanelments",value:stats.empanelments.pending, icon:"🏥",color:"#6d28d9",bg:"#faf5ff"},
  ];
  return (
    <div>
      <h2 style={{fontSize:"24px",fontWeight:"700",color:"#0b1f3a",marginBottom:"20px"}}>Overview</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"14px",marginBottom:"28px"}}>
        {CARDS.map(({label,value,icon,color,bg})=>(
          <div key={label} className="stat-card" style={{background:bg,border:`1px solid ${color}20`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",margin:"0 0 6px"}}>{label}</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"32px",fontWeight:"700",color,margin:0,lineHeight:1}}>{value ?? 0}</p>
              </div>
              <div style={{width:"40px",height:"40px",background:`${color}15`,borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}>{icon}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Revenue card */}
      <div style={{background:"linear-gradient(135deg,#047857,#059669)",borderRadius:"14px",padding:"22px 26px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"14px"}}>
        <div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"rgba(255,255,255,.7)",margin:"0 0 5px"}}>Total Revenue (Completed)</p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"36px",fontWeight:"700",color:"#fff",margin:0,lineHeight:1}}>
            ₹{(stats.revenue?.total||0).toLocaleString("en-IN")}
          </p>
        </div>
        <div style={{textAlign:"right"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"rgba(255,255,255,.7)",margin:"0 0 4px"}}>New patients this month</p>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"28px",fontWeight:"700",color:"#a7f3d0",margin:0}}>{stats.patients.this_month}</p>
        </div>
      </div>
    </div>
  );
}

function Appointments({ token }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");

  const fetchData = useCallback(async (f=filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f !== "all") params.set("status", f);
      const res  = await fetch(`${API}/admin/appointments?${params}&limit=100`,{headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      setData(json.appointments||[]);
    } catch { setData([]); }
    finally { setLoading(false); }
  },[token,filter]);

  useEffect(()=>{ fetchData(); },[]);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API}/admin/appointments/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({status}),
      });
      fetchData();
    } catch {}
  };

  const filtered = search ? data.filter(a=>
    (a.patient_name||"").toLowerCase().includes(search.toLowerCase())||
    (a.patient_mobile||"").includes(search)
  ) : data;

  return (
    <div>
      <SectionHead title="Appointments" count={filtered.length}/>
      <div className="filter-bar">
        <input value={search} onChange={e=>setSearch(e.target.value)}
          className="ad-inp" style={{width:"220px"}} placeholder="🔍 Search patient…"/>
        {["all","pending","approved","completed","cancelled"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);fetchData(f);}}
            className={`fchip${filter===f?" on":""}`}>{f}</button>
        ))}
      </div>
      {loading ? <Spinner/> : filtered.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",fontFamily:"'DM Sans',sans-serif"}}>No appointments found.</div>
      ) : filtered.map(a => {
        const doc = a.doctors;
        return (
          <div key={a.id} className="data-row">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginBottom:"6px"}}>
                  <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>{a.patient_name}</strong>
                  <Badge status={a.status}/>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>#{a.id}</span>
                </div>
                <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
                  {[["📅",`${a.appointment_date} ${a.appointment_time?.slice(0,5)||""}`],
                    ["📱",a.patient_mobile||""],["✉️",a.patient_email||""],
                    ["👨‍⚕️",doc?.full_name||"Unassigned"],
                    ["💰",a.payment_amount?`₹${a.payment_amount}`:"Free"],
                  ].map(([ic,val])=>(
                    <span key={ic} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>{ic} {val}</span>
                  ))}
                </div>
                {a.symptoms&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8",fontStyle:"italic",margin:"5px 0 0"}}>"{a.symptoms}"</p>}
              </div>
              <div style={{display:"flex",gap:"6px",flexWrap:"wrap",flexShrink:0}}>
                {a.status==="pending"&&<>
                  <button className="btn-sm btn-green" onClick={()=>updateStatus(a.id,"approved")}>Approve</button>
                  <button className="btn-sm btn-red"   onClick={()=>updateStatus(a.id,"cancelled")}>Cancel</button>
                </>}
                {a.status==="approved"&&
                  <button className="btn-sm btn-navy" onClick={()=>updateStatus(a.id,"completed")}>Complete</button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Doctors({ token }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/doctors`,{headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      setData(json.doctors||[]);
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetchData(); },[]);

  const toggle = async (id, is_active) => {
    try {
      await fetch(`${API}/admin/doctors/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({is_active:!is_active}),
      });
      fetchData();
    } catch {}
  };

  return (
    <div>
      <SectionHead title="Doctors" count={data.length}
        action={<button className="btn-sm btn-navy" style={{padding:"9px 18px",fontSize:"13px"}} onClick={()=>setShowAdd(true)}>+ Add Doctor</button>}/>
      {loading ? <Spinner/> : data.map(d=>(
        <div key={d.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"5px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>{d.full_name}</strong>
                <span className="badge" style={{background:d.is_active?"#dcfce7":"#fee2e2",color:d.is_active?"#15803d":"#991b1b"}}>
                  {d.is_active?"Active":"Inactive"}
                </span>
              </div>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
                {[d.specialization,d.qualification,`${d.experience_yrs||0}yrs exp`,d.email,d.phone].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
            </div>
            <button className={`btn-sm ${d.is_active?"btn-red":"btn-green"}`}
              onClick={()=>toggle(d.id,d.is_active)}>
              {d.is_active?"Deactivate":"Activate"}
            </button>
          </div>
        </div>
      ))}
      {showAdd&&<AddDoctorModal onClose={()=>setShowAdd(false)} onSaved={fetchData}/>}
    </div>
  );
}

function Empanelments({ token }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("pending");

  const fetchData = async (f=filter) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/empanelments?status=${f}`,{headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      setData(json.empanelments||[]);
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetchData(); },[]);

  const update = async (id, status) => {
    try {
      await fetch(`${API}/admin/empanelments/${id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({status}),
      });
      fetchData();
    } catch {}
  };

  return (
    <div>
      <SectionHead title="Hospital Empanelments" count={data.length}/>
      <div className="filter-bar">
        {["pending","approved","rejected","all"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);fetchData(f);}}
            className={`fchip${filter===f?" on":""}`}>{f}</button>
        ))}
      </div>
      {loading ? <Spinner/> : data.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",fontFamily:"'DM Sans',sans-serif"}}>No applications found.</div>
      ) : data.map(e=>(
        <div key={e.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"10px"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>{e.hospital_name}</strong>
                <Badge status={e.status}/>
                <span className="badge" style={{background:"#eff8ff",color:"#0369a1"}}>{e.partnership_tier?.toUpperCase()}</span>
              </div>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
                {[[e.contact_person],[e.email],[e.mobile],[`${e.city}, ${e.state}`],[e.hospital_type]].map(([v],i)=>v&&(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
              {e.about_hospital&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8",margin:"5px 0 0",fontStyle:"italic"}}>"{e.about_hospital.slice(0,100)}…"</p>}
            </div>
            {e.status==="pending"&&(
              <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                <button className="btn-sm btn-green" onClick={()=>update(e.id,"approved")}>Approve</button>
                <button className="btn-sm btn-red"   onClick={()=>update(e.id,"rejected")}>Reject</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Contacts({ token }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const res  = await fetch(`${API}/admin/contacts`,{headers:{Authorization:`Bearer ${token}`}});
        const json = await res.json();
        setData(json.contacts||[]);
      } catch { setData([]); }
      finally { setLoading(false); }
    })();
  },[]);

  const markRead = async (id) => {
    try {
      await fetch(`${API}/admin/contacts/${id}/read`,{method:"PUT",headers:{Authorization:`Bearer ${token}`}});
      setData(p=>p.map(c=>c.id===id?{...c,status:"read"}:c));
    } catch {}
  };

  return (
    <div>
      <SectionHead title="Contact Submissions" count={data.length}/>
      {loading ? <Spinner/> : data.length === 0 ? (
        <div style={{textAlign:"center",padding:"60px",color:"#94a3b8",fontFamily:"'DM Sans',sans-serif"}}>No contact submissions.</div>
      ) : data.map(c=>(
        <div key={c.id} className="data-row" style={{borderLeft:`3px solid ${c.status==="new"?"#0369a1":"#e2eaf4"}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"8px"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px",flexWrap:"wrap"}}>
                <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>{c.full_name}</strong>
                <Badge status={c.status||"new"}/>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>{new Date(c.created_at).toLocaleDateString("en-IN")}</span>
              </div>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginBottom:"6px"}}>
                {[c.email,c.mobile,c.subject].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",margin:0,lineHeight:"1.6"}}>{c.message}</p>
            </div>
            {c.status==="new"&&(
              <button className="btn-sm btn-outline" onClick={()=>markRead(c.id)} style={{flexShrink:0}}>Mark Read</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Patients({ token }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const res  = await fetch(`${API}/admin/patients`,{headers:{Authorization:`Bearer ${token}`}});
        const json = await res.json();
        setData(json.patients||[]);
      } catch { setData([]); }
      finally { setLoading(false); }
    })();
  },[]);

  const filtered = search ? data.filter(p=>
    (p.full_name||"").toLowerCase().includes(search.toLowerCase())||
    (p.email||"").toLowerCase().includes(search.toLowerCase())||
    (p.mobile||"").includes(search)
  ) : data;

  return (
    <div>
      <SectionHead title="Registered Patients" count={filtered.length}/>
      <input value={search} onChange={e=>setSearch(e.target.value)}
        className="ad-inp" style={{width:"260px",marginBottom:"16px"}} placeholder="🔍 Search by name, email, mobile…"/>
      {loading ? <Spinner/> : filtered.map(p=>(
        <div key={p.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
            <div>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>{p.full_name||"—"}</strong>
              <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginTop:"4px"}}>
                {[p.email,p.mobile,p.gender,`${p.city||""}${p.state?`, ${p.state}`:""}`,`Joined: ${new Date(p.created_at).toLocaleDateString("en-IN")}`].filter(Boolean).map((v,i)=>(
                  <span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b"}}>{v}</span>
                ))}
              </div>
            </div>
            <span className="badge" style={{background:p.is_active?"#dcfce7":"#fee2e2",color:p.is_active?"#15803d":"#991b1b"}}>{p.is_active?"Active":"Inactive"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────
const NAV = [
  { id:"overview",      icon:"📊", label:"Overview"      },
  { id:"appointments",  icon:"📅", label:"Appointments"  },
  { id:"doctors",       icon:"👨‍⚕️", label:"Doctors"       },
  { id:"empanelments",  icon:"🏥", label:"Empanelments"  },
  { id:"contacts",      icon:"📬", label:"Contacts"      },
  { id:"patients",      icon:"🧑‍💼", label:"Patients"      },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const token            = localStorage.getItem("wc4a_token");
  const [section, setSection] = useState("overview");
  const [stats,   setStats]   = useState(null);

  useEffect(() => {
    document.title = "Admin Dashboard — We Care 4 'all'";
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res  = await fetch(`${API}/admin/stats`,{headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      setStats(json);
    } catch {}
  };

  return (
    <div className="ad">
      <style>{G}</style>

      {/* ── Desktop Sidebar ── */}
      <div className="ad-sidebar">
        <div style={{padding:"18px 16px 12px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"16px",fontWeight:"700",color:"#fff",margin:0}}>
            We Care 4 <span style={{color:"#34d399"}}>'all'</span>
          </p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"rgba(255,255,255,.38)",margin:"3px 0 0"}}>Admin Panel</p>
        </div>
        <nav style={{padding:"10px 0",flex:1}}>
          {NAV.map(({id,icon,label})=>(
            <button key={id} onClick={()=>setSection(id)}
              className={`nav-item${section===id?" active":""}`}>
              <span style={{fontSize:"16px",flexShrink:0}}>{icon}</span>
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"rgba(255,255,255,.45)",
            marginBottom:"8px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {user?.name||user?.email||"Admin"}
          </p>
          <button onClick={()=>{logout();navigate("/");}}
            style={{width:"100%",padding:"8px",borderRadius:"8px",
              background:"rgba(220,38,38,.15)",border:"1px solid rgba(220,38,38,.25)",
              color:"#fca5a5",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",cursor:"pointer"}}>
            Logout
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="ad-content">
        {/* Mobile top bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          marginBottom:"16px",padding:"10px 0",
          borderBottom:"1px solid #e2eaf4"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"#94a3b8",margin:0,textTransform:"uppercase",letterSpacing:"1px"}}>
              Admin Panel
            </p>
            <h2 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
              {NAV.find(n=>n.id===section)?.label||"Overview"}
            </h2>
          </div>
          <button onClick={()=>{logout();navigate("/");}}
            style={{padding:"7px 14px",borderRadius:"8px",
              background:"#fef2f2",border:"1px solid #fecaca",
              color:"#dc2626",fontFamily:"'DM Sans',sans-serif",
              fontSize:"12px",fontWeight:"600",cursor:"pointer",
              display:"none"}}
            className="mobile-logout">
            Logout
          </button>
        </div>

        {section==="overview"     && <Overview stats={stats}/>}
        {section==="appointments" && <Appointments token={token}/>}
        {section==="doctors"      && <Doctors token={token}/>}
        {section==="empanelments" && <Empanelments token={token}/>}
        {section==="contacts"     && <Contacts token={token}/>}
        {section==="patients"     && <Patients token={token}/>}
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="ad-bottom-bar">
        {NAV.map(({id,icon,label})=>(
          <button key={id} onClick={()=>setSection(id)}
            className={`tab-btn${section===id?" active":""}`}>
            <span className="ti">{icon}</span>
            <span>{label.slice(0,6)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
