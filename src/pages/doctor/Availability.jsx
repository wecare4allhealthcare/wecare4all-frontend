/**
 * doctor/Availability.jsx — Doctor manages own consultation slots
 * Add/remove availability by day of week + time range
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.da{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.da *{box-sizing:border-box;}
@keyframes spin{to{transform:rotate(360deg)}}
.da-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:10px 12px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:#1e293b;background:#f8fafc;
  outline:none;transition:all .2s;}
.da-inp:focus{border-color:#0369a1;background:#fff;box-shadow:0 0 0 3px rgba(3,105,161,.09);}
.day-card{background:#fff;border:1.5px solid #e2eaf4;border-radius:13px;padding:16px;margin-bottom:12px;}
.day-card.has-slots{border-color:#86efac;}
.slot-tag{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;
  background:#f0fdf4;border:1px solid #86efac;border-radius:50px;
  font-family:'DM Sans',sans-serif;font-size:12px;fontWeight:600;color:#15803d;margin:4px;}
.add-btn{background:linear-gradient(135deg,#0369a1,#0284c7);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:13px;
  padding:10px 20px;border-radius:8px;border:none;cursor:pointer;transition:all .2s;}
.add-btn:hover{transform:translateY(-1px);}
.add-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
`;

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_LABELS = {
  monday:"Monday",tuesday:"Tuesday",wednesday:"Wednesday",
  thursday:"Thursday",friday:"Friday",saturday:"Saturday",sunday:"Sunday"
};
const DAY_ICONS = {
  monday:"Mon",tuesday:"Tue",wednesday:"Wed",thursday:"Thu",
  friday:"Fri",saturday:"Sat",sunday:"Sun"
};

export default function DoctorAvailability() {
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    day_of_week:"monday", from_time:"09:00", to_time:"17:00", slot_mins:30,
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    document.title = "My Availability — We Care 4 'all'";
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/doctors/my-availability`, {
        headers:{ Authorization:`Bearer ${token}` },
      });
      const json  = await res.json();
      setSlots(json.availability || []);
    } catch { setSlots([]); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setMsg("");
    if (form.from_time >= form.to_time) {
      setMsg("End time must be after start time"); return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/doctors/my-availability`, {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`},
        body: JSON.stringify(form),
      });
      if (!res.ok) { const j=await res.json(); throw new Error(j.detail||"Failed"); }
      setMsg("✅ Slot added successfully!");
      fetchSlots();
      setTimeout(()=>setMsg(""), 3000);
    } catch(ex) { setMsg("⚠ "+ex.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this availability slot?")) return;
    try {
      const token = localStorage.getItem("wc4a_token");
      await fetch(`${API}/doctors/my-availability/${id}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${token}` },
      });
      fetchSlots();
    } catch {}
  };

  // Group slots by day
  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = slots.filter(s => s.day_of_week === d);
    return acc;
  }, {});

  return (
    <div className="da">
      <style>{G}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0369a1,#0284c7)",padding:"20px 20px 24px"}}>
        <div style={{maxWidth:"720px",margin:"0 auto",display:"flex",
          justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
              color:"rgba(255,255,255,.6)",marginBottom:"3px",textTransform:"uppercase",letterSpacing:"1px"}}>
              Doctor Panel
            </p>
            <h1 style={{fontSize:"clamp(18px,3vw,24px)",fontWeight:"700",
              fontFamily:"'Cormorant Garamond',serif",color:"#fff",margin:0}}>
              My Availability
            </h1>
          </div>
          <Link to="/doctor/dashboard" style={{padding:"9px 18px",borderRadius:"8px",
            background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.22)",
            color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:"500",fontSize:"13px"}}>
            ← Dashboard
          </Link>
        </div>
      </div>

      <div style={{maxWidth:"720px",margin:"0 auto",padding:"20px 16px 40px"}}>
        {/* Add slot form */}
        <div style={{background:"#fff",border:"1px solid #e2eaf4",borderRadius:"14px",
          padding:"20px",marginBottom:"20px"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",fontWeight:"700",
            color:"#0369a1",letterSpacing:"1.5px",textTransform:"uppercase",
            paddingBottom:"8px",borderBottom:"1.5px solid #e2eaf4",marginBottom:"16px"}}>
            Add New Slot
          </p>
          <form onSubmit={handleAdd}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"12px",marginBottom:"14px"}}>
              <div>
                <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"4px"}}>Day</label>
                <select value={form.day_of_week}
                  onChange={e=>setForm(p=>({...p,day_of_week:e.target.value}))}
                  className="da-inp">
                  {DAYS.map(d=><option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"4px"}}>From</label>
                <input type="time" value={form.from_time}
                  onChange={e=>setForm(p=>({...p,from_time:e.target.value}))}
                  className="da-inp"/>
              </div>
              <div>
                <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"4px"}}>To</label>
                <input type="time" value={form.to_time}
                  onChange={e=>setForm(p=>({...p,to_time:e.target.value}))}
                  className="da-inp"/>
              </div>
              <div>
                <label style={{display:"block",fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"4px"}}>Slot (mins)</label>
                <select value={form.slot_mins}
                  onChange={e=>setForm(p=>({...p,slot_mins:parseInt(e.target.value)}))}
                  className="da-inp">
                  {[15,20,30,45,60].map(m=><option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
            </div>
            {msg && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
              color:msg.startsWith("✅")?"#15803d":"#dc2626",marginBottom:"10px"}}>{msg}</p>}
            <button type="submit" disabled={saving} className="add-btn">
              {saving ? "Adding…" : "+ Add Slot"}
            </button>
          </form>
        </div>

        {/* Current slots by day */}
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"20px",
          fontWeight:"700",color:"#0b1f3a",marginBottom:"14px"}}>
          Current Schedule
        </h2>

        {loading ? (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #0369a1",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto"}}/>
          </div>
        ) : (
          DAYS.map(day => {
            const daySlots = byDay[day];
            return (
              <div key={day} className={`day-card${daySlots.length>0?" has-slots":""}`}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <span style={{background: daySlots.length>0?"#047857":"#94a3b8",
                      color:"#fff",fontSize:"11px",fontWeight:"700",padding:"3px 10px",
                      borderRadius:"50px",fontFamily:"'DM Sans',sans-serif"}}>
                      {DAY_ICONS[day]}
                    </span>
                    <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                      color:"#0b1f3a"}}>{DAY_LABELS[day]}</strong>
                    {daySlots.length === 0 &&
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                        color:"#94a3b8",fontStyle:"italic"}}>— No slots</span>}
                  </div>
                </div>
                {daySlots.length > 0 && (
                  <div style={{marginTop:"10px"}}>
                    {daySlots.map(s => (
                      <span key={s.id} className="slot-tag">
                        🕐 {s.from_time?.slice(0,5)} – {s.to_time?.slice(0,5)}
                        &nbsp;({s.slot_mins}min)
                        <button onClick={()=>handleDelete(s.id)}
                          style={{background:"none",border:"none",cursor:"pointer",
                            color:"#dc2626",fontSize:"14px",padding:"0",lineHeight:1}}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
