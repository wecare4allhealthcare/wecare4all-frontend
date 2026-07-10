/**
 * doctor/Dashboard.jsx — Phase B update
 * Added: Profile link, Availability link, Appointment Notes
 */
import { useEffect, useState } from "react";
import { showToast } from "../../components/Toast";
import { withDrPrefix } from "../../utils/formatDoctorName";
import { confirmAction } from "../../components/ConfirmDialog";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../../components/NotificationBell";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.dd{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.dd *{box-sizing:border-box;} .dd a{text-decoration:none;}
.dd h1,.dd h2,.dd h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.dd-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;}
@media(min-width:600px){.dd-stats{grid-template-columns:repeat(4,1fr);}}
.appt-row{background:#fff;border:1px solid #e2eaf4;border-radius:12px;
  padding:14px 16px;transition:all .22s;margin-bottom:10px;}
.appt-row:hover{box-shadow:0 6px 20px rgba(11,31,58,.09);}
.dd-tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;
  -ms-overflow-style:none;scrollbar-width:none;margin-bottom:16px;}
.dd-tabs::-webkit-scrollbar{display:none;}
.tab-btn{padding:9px 18px;border-radius:9px;border:1.5px solid #e2eaf4;
  background:#fff;font-family:'DM Sans',sans-serif;font-size:13px;
  font-weight:600;cursor:pointer;transition:all .2s;color:#64748b;
  white-space:nowrap;flex-shrink:0;}
.tab-btn.active{background:#0369a1;border-color:#0369a1;color:#fff;}
.appt-detail{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;}
.appt-detail span{font-family:'DM Sans',sans-serif;font-size:12px;color:#64748b;}
.quick-link{display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:16px 12px;background:#fff;border:1.5px solid #e2eaf4;border-radius:12px;
  text-decoration:none;transition:all .22s;text-align:center;}
.quick-link:hover{border-color:#0369a1;background:#eff8ff;transform:translateY(-3px);}
`;

const STATUS_STYLES = {
  pending:   {bg:"#fef9c3",color:"#854d0e",label:"⏳ Pending"},
  approved:  {bg:"#dcfce7",color:"#15803d",label:"✅ Confirmed"},
  rejected:  {bg:"#fee2e2",color:"#991b1b",label:"⚠️ Declined"},
  completed: {bg:"#dbeafe",color:"#1e40af",label:"✔️ Completed"},
  cancelled: {bg:"#fee2e2",color:"#991b1b",label:"❌ Cancelled"},
};
const TYPE_LABELS = {video:"🎥 Video",inperson:"🏥 In-Person",home:"🏠 Home Visit"};

function CreateVideoBtn({ appointmentId, token, appt }) {
  const [loading, setLoading] = useState(false);
  const [roomUrl, setRoomUrl] = useState("");

  let scheduledAt = null;
  try {
    const d = appt?.appointment_date;
    const t = (appt?.appointment_time || "00:00:00").slice(0,8);
    scheduledAt = new Date(`${d}T${t}`);
  } catch { scheduledAt = null; }
  const joinOpensAt = scheduledAt ? new Date(scheduledAt.getTime() - 15*60*1000) : null;
  const canJoinNow = joinOpensAt ? new Date() >= joinOpensAt : true;
  const joinOpensLabel = joinOpensAt
    ? joinOpensAt.toLocaleString("en-IN", {day:"numeric",month:"short",hour:"numeric",minute:"2-digit",hour12:true})
    : "";

  const create = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/video/create-session?appointment_id=${appointmentId}`,
        {method:"POST",headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      if (res.ok) setRoomUrl(json.join_url);
      else showToast(json.detail||"Failed", "error");
    } catch { showToast("Error", "error"); }
    finally { setLoading(false); }
  };
  if (!canJoinNow) return (
    <span title={`Join opens ${joinOpensLabel}`}
      style={{padding:"7px 14px",borderRadius:"7px",background:"#f1f5f9",
        color:"#94a3b8",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
        fontWeight:"600",border:"1px solid #e2eaf4",whiteSpace:"nowrap",cursor:"not-allowed"}}>
      🔒 Opens {joinOpensLabel}
    </span>
  );
  if (roomUrl) return (
    <a href={roomUrl} target="_blank" rel="noreferrer"
      style={{padding:"7px 14px",borderRadius:"7px",background:"#047857",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>
      🎥 Join Room
    </a>
  );
  return (
    <button onClick={create} disabled={loading}
      style={{padding:"7px 14px",borderRadius:"7px",background:"#0369a1",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",
        border:"none",cursor:"pointer",opacity:loading?0.7:1,whiteSpace:"nowrap"}}>
      {loading?"Creating…":"🎥 Create Room"}
    </button>
  );
}

const emptyMedicine = { medicine_name:"", dosage:"", frequency:"", duration:"", instructions:"" };

function NotesModal({ appt, token, onClose, onSaved }) {
  const [notes, setNotes] = useState(appt.prescription || "");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/appointments/${appt.id}/prescription-items`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        setItems((json.items || []).map(i => ({
          medicine_name: i.medicine_name || "", dosage: i.dosage || "",
          frequency: i.frequency || "", duration: i.duration || "", instructions: i.instructions || "",
        })));
      } catch {}
    })();
  }, [appt.id]);

  const addMedicine = () => setItems(p => [...p, { ...emptyMedicine }]);
  const removeMedicine = (idx) => setItems(p => p.filter((_,i) => i!==idx));
  const updateMedicine = (idx, key, val) => setItems(p => p.map((it,i) => i===idx ? {...it,[key]:val} : it));

  const save = async () => {
    setSaving(true);
    try {
      // Only send items that actually have a medicine name — an empty
      // row left over from clicking "+ Add Medicine" without filling it
      // in shouldn't get saved as a blank prescription line.
      const validItems = items.filter(it => it.medicine_name.trim());
      await fetch(`${API}/appointments/${appt.id}/notes`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({notes,status:"completed",prescription_items:validItems}),
      });
      onSaved();
      onClose();
    } catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",width:"100%",maxWidth:"500px",borderRadius:"18px 18px 0 0",
        padding:"20px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Add Notes / Prescription
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"12px"}}>
          Patient: <strong>{appt.patient_name}</strong> · {new Date(appt.appointment_date).toLocaleDateString("en-IN")}
        </p>

        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
          color:"#374151",marginBottom:"8px"}}>Medicines</p>
        {items.map((it, idx) => (
          <div key={idx} style={{background:"#f8fafc",border:"1px solid #e2eaf4",borderRadius:"9px",
            padding:"10px",marginBottom:"8px"}}>
            <div style={{display:"flex",gap:"6px",marginBottom:"6px"}}>
              <input value={it.medicine_name} onChange={e=>updateMedicine(idx,"medicine_name",e.target.value)}
                placeholder="Medicine name" style={{flex:1,border:"1px solid #e2eaf4",borderRadius:"7px",
                  padding:"7px 9px",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",outline:"none"}}/>
              <button onClick={()=>removeMedicine(idx)} style={{background:"#fef2f2",border:"none",
                color:"#991b1b",width:"30px",borderRadius:"7px",cursor:"pointer",fontSize:"16px",flexShrink:0}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"6px",marginBottom:"6px"}}>
              <input value={it.dosage} onChange={e=>updateMedicine(idx,"dosage",e.target.value)}
                placeholder="Dosage (500mg)" style={{border:"1px solid #e2eaf4",borderRadius:"7px",
                  padding:"7px 9px",fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",outline:"none",minWidth:0}}/>
              <input value={it.frequency} onChange={e=>updateMedicine(idx,"frequency",e.target.value)}
                placeholder="Frequency (1-0-1)" style={{border:"1px solid #e2eaf4",borderRadius:"7px",
                  padding:"7px 9px",fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",outline:"none",minWidth:0}}/>
              <input value={it.duration} onChange={e=>updateMedicine(idx,"duration",e.target.value)}
                placeholder="Duration (5 days)" style={{border:"1px solid #e2eaf4",borderRadius:"7px",
                  padding:"7px 9px",fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",outline:"none",minWidth:0}}/>
            </div>
            <input value={it.instructions} onChange={e=>updateMedicine(idx,"instructions",e.target.value)}
              placeholder="Instructions (e.g. after food)" style={{width:"100%",border:"1px solid #e2eaf4",
                borderRadius:"7px",padding:"7px 9px",fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",outline:"none"}}/>
          </div>
        ))}
        <button onClick={addMedicine} style={{background:"#f0fdf4",border:"1px dashed #86efac",
          color:"#15803d",borderRadius:"8px",padding:"8px 14px",fontFamily:"'DM Sans',sans-serif",
          fontWeight:"600",fontSize:"12.5px",cursor:"pointer",marginBottom:"14px",width:"100%"}}>
          + Add Medicine
        </button>

        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
          color:"#374151",marginBottom:"8px"}}>General Notes</p>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)}
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"12px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",
            minHeight:"90px",outline:"none"}}
          placeholder="Diagnosis, follow-up instructions, anything not covered above…"/>
        <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
          <button onClick={save} disabled={saving}
            style={{flex:1,background:"linear-gradient(135deg,#047857,#059669)",
              color:"#fff",border:"none",borderRadius:"9px",padding:"12px",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",cursor:"pointer"}}>
            {saving?"Saving…":"Save & Complete →"}
          </button>
          <button onClick={onClose}
            style={{padding:"12px 18px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
              background:"#fff",color:"#64748b",fontFamily:"'DM Sans',sans-serif",
              fontSize:"14px",cursor:"pointer"}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ appt, token, onClose, onSaved }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!reason.trim()) { showToast("Please give a reason — the patient will see this.", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/appointments/${appt.id}/reject`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({reason}),
      });
      if (!res.ok) { const j=await res.json(); throw new Error(j.detail||"Failed"); }
      onSaved();
      onClose();
    } catch (e) { showToast(e.message || "Failed to reject", "error"); }
    finally { setSaving(false); }
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",width:"100%",maxWidth:"500px",borderRadius:"18px 18px 0 0",
        padding:"20px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Decline Appointment
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"12px"}}>
          Patient: <strong>{appt.patient_name}</strong> · this reason will be emailed to them.
        </p>
        <textarea value={reason} onChange={e=>setReason(e.target.value)}
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"12px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",
            minHeight:"100px",outline:"none"}}
          placeholder="e.g. Not available at this time, please rebook for next week…"/>
        <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
          <button onClick={submit} disabled={saving}
            style={{flex:1,background:"#b91c1c",
              color:"#fff",border:"none",borderRadius:"9px",padding:"12px",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",cursor:"pointer"}}>
            {saving?"Sending…":"Decline & Notify Patient"}
          </button>
          <button onClick={onClose}
            style={{padding:"12px 18px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
              background:"#fff",color:"#64748b",fontFamily:"'DM Sans',sans-serif",
              fontSize:"14px",cursor:"pointer"}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function TransferModal({ appt, token, onClose, onSent }) {
  const [doctors, setDoctors] = useState(null);
  const [toDoctorId, setToDoctorId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/chat/doctors`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        // Don't list yourself as a transfer target
        setDoctors((json.doctors || []).filter(d => String(d.id) !== String(appt.doctor_id)));
      } catch { setDoctors([]); }
    })();
  }, []);

  const submit = async () => {
    setErr("");
    if (!toDoctorId) { setErr("Please choose a doctor to transfer to"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/appointments/${appt.id}/transfer-request`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ to_doctor_id: toDoctorId, reason: reason || null }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.detail || "Failed"); }
      onSent();
      onClose();
    } catch (e) { setErr(e.message || "Failed to send transfer request"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#fff",width:"100%",maxWidth:"500px",borderRadius:"18px 18px 0 0",
        padding:"20px",maxHeight:"70vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"18px",
            fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Transfer to Another Doctor
          </h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",
            width:"32px",height:"32px",borderRadius:"8px",cursor:"pointer",fontSize:"18px"}}>×</button>
        </div>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"12px"}}>
          Patient: <strong>{appt.patient_name}</strong> — a message will be sent to the doctor's chat,
          and the appointment moves to them automatically if they accept.
        </p>

        {doctors===null ? (
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#94a3b8"}}>Loading doctors…</p>
        ) : (
          <select value={toDoctorId} onChange={e=>setToDoctorId(e.target.value)}
            style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"11px",
              fontFamily:"'DM Sans',sans-serif",fontSize:"14px",marginBottom:"10px",outline:"none"}}>
            <option value="">Select a doctor…</option>
            {doctors.map(d=>(
              <option key={d.id} value={d.id}>{d.full_name}{d.specialization?` — ${d.specialization}`:""}</option>
            ))}
          </select>
        )}

        <textarea value={reason} onChange={e=>setReason(e.target.value)}
          style={{width:"100%",border:"1.5px solid #e2eaf4",borderRadius:"9px",padding:"12px",
            fontFamily:"'DM Sans',sans-serif",fontSize:"14px",resize:"vertical",
            minHeight:"70px",outline:"none"}}
          placeholder="Optional — let them know why (e.g. outside my specialty, fully booked)…"/>

        {err && <p style={{color:"#dc2626",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",marginTop:"10px"}}>⚠ {err}</p>}

        <div style={{display:"flex",gap:"10px",marginTop:"14px"}}>
          <button onClick={submit} disabled={saving}
            style={{flex:1,background:"linear-gradient(135deg,#047857,#059669)",
              color:"#fff",border:"none",borderRadius:"9px",padding:"12px",
              fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",cursor:"pointer"}}>
            {saving?"Sending…":"Send Transfer Request"}
          </button>
          <button onClick={onClose}
            style={{padding:"12px 18px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
              background:"#fff",color:"#64748b",fontFamily:"'DM Sans',sans-serif",
              fontSize:"14px",cursor:"pointer"}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Patient Brief Panel (inline, collapsible) ─────────────────
// Lives inside the appointment card itself, not a separate modal.
// Specifically for the pre-acceptance moment: doctor sees patient
// name + symptoms → wants context before clicking Accept.
//
// Three sections, all lazy-loaded on first expand:
//   1. Health profile highlights — the clinical flags (allergies,
//      conditions, medications) that matter before any consult
//   2. Last 3 appointments with THIS doctor — prior relationship
//      context (how the patient presented before, what was prescribed)
//   3. Uploaded documents — list with one-click download
//
// Distinct from the full PatientBriefModal (which shows all 20
// appointments across all doctors in a separate bottom sheet).
// This is the "quick glance before deciding" — not the "deep research"
// view. Both exist for different moments in the doctor's workflow.
function PatientBriefPanel({ appt, token, myDoctorId }) {
  const [open,     setOpen]     = useState(false);
  const [loaded,   setLoaded]   = useState(false); // true once first fetch completes
  const [loading,  setLoading]  = useState(false);
  const [health,   setHealth]   = useState(null);
  const [history,  setHistory]  = useState([]);    // last 3 with THIS doctor only
  const [docs,     setDocs]     = useState([]);
  const [err,      setErr]      = useState("");
  const [dlBusy,   setDlBusy]   = useState({});   // { [docId]: bool }

  const toggle = () => {
    setOpen(prev => {
      // Lazy-load: only fetch on first open
      if (!prev && !loaded) load();
      return !prev;
    });
  };

  const load = () => {
    if (!appt.patient_id) { setErr("No patient ID on this appointment."); return; }
    setLoading(true);
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/health-profile/patient/${appt.patient_id}`, { headers: h }).then(r => r.json()),
      fetch(`${API}/appointments/patient/${appt.patient_id}/history`, { headers: h }).then(r => r.json()),
      fetch(`${API}/patient-documents/patient/${appt.patient_id}`, { headers: h }).then(r => r.json()),
    ]).then(([hlth, hist, dcmts]) => {
      setHealth(hlth);
      // Filter to only this doctor's previous appointments with the patient,
      // take the 3 most recent (endpoint returns newest-first already),
      // exclude the current appointment itself.
      const mine = (hist.history || [])
        .filter(a => String(a.doctor_id) === String(myDoctorId) && a.id !== appt.id)
        .slice(0, 3);
      setHistory(mine);
      setDocs(dcmts.documents || []);
      setLoaded(true);
    }).catch(() => setErr("Couldn't load patient brief."))
    .finally(() => setLoading(false));
  };

  const download = async (doc) => {
    setDlBusy(p => ({ ...p, [doc.id]: true }));
    try {
      const res  = await fetch(`${API}/patient-documents/${doc.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Download failed");
      window.open(json.url, "_blank");
    } catch (e) { showToast(e.message || "Download failed", "error"); }
    finally { setDlBusy(p => ({ ...p, [doc.id]: false })); }
  };

  // Small label pill
  const chip = (text, color = "#6d28d9", bg = "#faf5ff") => (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: "20px",
      background: bg, color, fontSize: "11px", fontWeight: "700",
      fontFamily: "'DM Sans',sans-serif", marginRight: "5px", marginBottom: "3px",
    }}>{text}</span>
  );

  // One labelled field row
  const row = (icon, label, value) => !value ? null : (
    <div style={{ display: "flex", gap: "6px", marginBottom: "7px", alignItems: "flex-start" }}>
      <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>{icon}</span>
      <div>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px",
          fontWeight: "700", color: "#374151" }}>{label}: </span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px",
          color: "#1e293b" }}>{value}</span>
      </div>
    </div>
  );

  const hasHealthData = health && health.exists !== false &&
    (health.allergies || health.chronic_conditions ||
     health.current_medications || health.past_surgeries);

  const STATUS_C = { completed:"#047857", approved:"#0369a1",
                     cancelled:"#991b1b", pending:"#854d0e" };
  const STATUS_B = { completed:"#f0fdf4", approved:"#eff8ff",
                     cancelled:"#fef2f2", pending:"#fefce8" };

  return (
    <div style={{ marginTop: "10px", borderTop: "1px dashed #e2eaf4", paddingTop: "10px" }}>

      {/* Toggle trigger */}
      <button onClick={toggle}
        style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: "6px",
          fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px",
          fontWeight: "600", color: open ? "#6d28d9" : "#64748b",
          transition: "color .15s",
        }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "20px", height: "20px", borderRadius: "50%",
          background: open ? "#faf5ff" : "#f1f5f9",
          fontSize: "11px", transition: "all .2s",
          transform: open ? "rotate(180deg)" : "none",
        }}>▼</span>
        {open ? "Hide" : "Show"} Patient Brief
        {!loaded && !open && (
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px",
            color: "#94a3b8", fontWeight: "400" }}>
            · health profile, past visits, documents
          </span>
        )}
      </button>

      {/* Collapsible body */}
      {open && (
        <div style={{
          marginTop: "12px",
          background: "#faf5ff",
          border: "1px solid #e9d5ff",
          borderRadius: "10px",
          padding: "14px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
        }}>
          {loading && (
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
              color: "#94a3b8", gridColumn: "1/-1", margin: 0 }}>
              Loading…
            </p>
          )}
          {err && (
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
              color: "#dc2626", gridColumn: "1/-1", margin: 0 }}>
              ⚠ {err}
            </p>
          )}

          {!loading && !err && (
            <>
              {/* ── Section 1: Health Profile ── */}
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px",
                  fontWeight: "700", color: "#6d28d9", margin: "0 0 8px",
                  textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  🩺 Health Profile
                </p>
                {!hasHealthData ? (
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
                    color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
                    Not filled yet
                  </p>
                ) : (
                  <>
                    {health.height_cm && health.weight_kg && (
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
                        color: "#374151", margin: "0 0 6px" }}>
                        {health.height_cm}cm · {health.weight_kg}kg ·{" "}
                        <strong style={{ color: "#047857" }}>
                          BMI {(health.weight_kg / ((health.height_cm / 100) ** 2)).toFixed(1)}
                        </strong>
                      </p>
                    )}
                    {row("⚠️", "Allergies",           health.allergies)}
                    {row("🔄", "Conditions",          health.chronic_conditions)}
                    {row("💊", "Medications",         health.current_medications)}
                    {row("🔪", "Past Surgeries",      health.past_surgeries)}
                    {!health.allergies && !health.chronic_conditions &&
                     !health.current_medications && !health.past_surgeries && (
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
                        color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
                        Profile exists — all fields empty
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* ── Section 2: Last 3 visits with this doctor ── */}
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px",
                  fontWeight: "700", color: "#6d28d9", margin: "0 0 8px",
                  textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  📋 Your Past Visits
                </p>
                {history.length === 0 ? (
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
                    color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
                    First time with you
                  </p>
                ) : history.map(h => (
                  <div key={h.id} style={{
                    marginBottom: "8px", paddingBottom: "8px",
                    borderBottom: "1px solid #e9d5ff",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "3px", gap: "6px" }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
                        fontWeight: "600", color: "#0b1f3a" }}>
                        {new Date(h.appointment_date).toLocaleDateString("en-IN",
                          { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {chip(h.status, STATUS_C[h.status] || "#374151",
                                     STATUS_B[h.status] || "#f1f5f9")}
                    </div>
                    {h.symptoms && (
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11.5px",
                        color: "#64748b", fontStyle: "italic", margin: "0 0 3px" }}>
                        "{h.symptoms}"
                      </p>
                    )}
                    {h.prescription && (
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11.5px",
                        color: "#047857", margin: 0 }}>
                        Rx: {h.prescription.length > 80
                          ? h.prescription.slice(0, 80) + "…"
                          : h.prescription}
                      </p>
                    )}
                    {h.prescription_items?.length > 0 && (
                      <div style={{ marginTop: "3px" }}>
                        {h.prescription_items.slice(0, 3).map((m, i) => (
                          <span key={i} style={{ fontFamily: "'DM Sans',sans-serif",
                            fontSize: "11px", color: "#374151",
                            display: "inline-block", marginRight: "6px" }}>
                            💊 {m.medicine_name}
                            {i < Math.min(h.prescription_items.length, 3) - 1 ? "," : ""}
                          </span>
                        ))}
                        {h.prescription_items.length > 3 && (
                          <span style={{ fontFamily: "'DM Sans',sans-serif",
                            fontSize: "11px", color: "#94a3b8" }}>
                            +{h.prescription_items.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Section 3: Uploaded Documents ── */}
              <div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px",
                  fontWeight: "700", color: "#6d28d9", margin: "0 0 8px",
                  textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  📁 Documents ({docs.length})
                </p>
                {docs.length === 0 ? (
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px",
                    color: "#94a3b8", fontStyle: "italic", margin: 0 }}>
                    No uploads yet
                  </p>
                ) : docs.slice(0, 5).map(doc => {
                  const TYPE_ICON = { lab_report:"🧪", prescription:"💊",
                    imaging:"🔬", other:"📄" };
                  return (
                    <div key={doc.id} style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "6px", gap: "6px",
                    }}>
                      <span style={{ fontFamily: "'DM Sans',sans-serif",
                        fontSize: "11.5px", color: "#374151",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        flex: 1, minWidth: 0 }}>
                        {TYPE_ICON[doc.document_type] || "📄"} {doc.file_name}
                      </span>
                      <button onClick={() => download(doc)} disabled={dlBusy[doc.id]}
                        style={{
                          flexShrink: 0, padding: "3px 9px", borderRadius: "6px",
                          background: "#eff8ff", border: "1px solid #93c5fd",
                          color: "#0369a1", fontFamily: "'DM Sans',sans-serif",
                          fontSize: "11px", fontWeight: "600",
                          cursor: dlBusy[doc.id] ? "wait" : "pointer",
                        }}>
                        {dlBusy[doc.id] ? "…" : "Open"}
                      </button>
                    </div>
                  );
                })}
                {docs.length > 5 && (
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px",
                    color: "#94a3b8", margin: "4px 0 0", fontStyle: "italic" }}>
                    +{docs.length - 5} more in Patient Brief
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Patient Brief Modal ───────────────────────────────────────
// Three data sources loaded in parallel on open:
//   1. Full appointment history (GET /appointments/patient/{id}/history)
//   2. Health profile (GET /health-profile/patient/{id})
//   3. Uploaded documents list (GET /patient-documents/patient/{id})
// A fourth call (download URL) fires only when the doctor clicks a
// specific document — not preloaded.
function PatientBriefModal({ appt, token, onClose }) {
  const patientId = appt.patient_id;
  const [tab,      setTab]      = useState("history"); // "history" | "health" | "docs"
  const [history,  setHistory]  = useState(null);
  const [health,   setHealth]   = useState(null);
  const [docs,     setDocs]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState("");
  const [dlLoading,setDlLoading]= useState({}); // { [docId]: true/false }

  useEffect(() => {
    if (!patientId) { setErr("No patient ID on this appointment."); setLoading(false); return; }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/appointments/patient/${patientId}/history`,     { headers }).then(r=>r.json()),
      fetch(`${API}/health-profile/patient/${patientId}`,           { headers }).then(r=>r.json()),
      fetch(`${API}/patient-documents/patient/${patientId}`,        { headers }).then(r=>r.json()),
    ]).then(([hist, hlth, dcmts]) => {
      setHistory(hist.history  || []);
      setHealth(hlth);
      setDocs(dcmts.documents  || []);
    }).catch(() => setErr("Could not load patient brief. Try again."))
    .finally(() => setLoading(false));
  }, [patientId]);

  const downloadDoc = async (doc) => {
    setDlLoading(p => ({ ...p, [doc.id]: true }));
    try {
      const res  = await fetch(`${API}/patient-documents/${doc.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Download failed");
      window.open(json.url, "_blank");
    } catch (e) { showToast(e.message || "Download failed", "error"); }
    finally { setDlLoading(p => ({ ...p, [doc.id]: false })); }
  };

  const TAB_STYLE = (active) => ({
    flex: 1, padding: "9px 4px", border: "none", cursor: "pointer",
    fontFamily: "'DM Sans',sans-serif", fontSize: "13px", fontWeight: "600",
    background: active ? "linear-gradient(135deg,#047857,#059669)" : "#f8fafc",
    color: active ? "#fff" : "#64748b",
    borderBottom: active ? "none" : "2px solid #e2eaf4",
    transition: "all .2s",
  });

  const CARD = { background:"#f8fafc", border:"1px solid #e2eaf4",
    borderRadius:"10px", padding:"12px 14px", marginBottom:"10px" };

  const pill = (label, color="#047857", bg="#f0fdf4") => (
    <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:"20px",
      background:bg, color, fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
      fontWeight:"700", marginRight:"6px" }}>{label}</span>
  );

  const STATUS_COLOR = { completed:"#047857", approved:"#0369a1",
    cancelled:"#991b1b", pending:"#854d0e" };
  const STATUS_BG    = { completed:"#f0fdf4", approved:"#eff8ff",
    cancelled:"#fef2f2", pending:"#fefce8" };

  const fieldRow = (label, value) => value ? (
    <div style={{ display:"flex", gap:"8px", marginBottom:"8px", flexWrap:"wrap" }}>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
        fontWeight:"700", color:"#374151", minWidth:"130px", flexShrink:0 }}>{label}</span>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
        color:"#1e293b", flex:1 }}>{value}</span>
    </div>
  ) : null;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)",
      zIndex:3000, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", width:"100%", maxWidth:"600px",
        borderRadius:"20px 20px 0 0", maxHeight:"85vh", display:"flex",
        flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ padding:"18px 20px 0", borderBottom:"1px solid #e2eaf4", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
            marginBottom:"14px" }}>
            <div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"20px",
                fontWeight:"700", color:"#0b1f3a", margin:0 }}>
                Patient Brief
              </h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
                color:"#64748b", margin:"3px 0 0" }}>
                {appt.patient_name}
                {appt.patient_age ? ` · ${appt.patient_age} yrs` : ""}
                {appt.patient_gender ? ` · ${appt.patient_gender}` : ""}
              </p>
            </div>
            <button onClick={onClose}
              style={{ background:"#f1f5f9", border:"none", width:"32px", height:"32px",
                borderRadius:"8px", cursor:"pointer", fontSize:"18px", lineHeight:"1",
                color:"#64748b", flexShrink:0 }}>×</button>
          </div>
          {/* Tabs */}
          <div style={{ display:"flex", gap:0 }}>
            {[["history","📋 History"],["health","🩺 Health Profile"],["docs","📁 Documents"]].map(([id,label])=>(
              <button key={id} style={TAB_STYLE(tab===id)} onClick={()=>setTab(id)}>{label}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY:"auto", flex:1, padding:"16px 20px" }}>
          {loading && (
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
              color:"#94a3b8", textAlign:"center", padding:"30px 0" }}>
              Loading patient brief…
            </p>
          )}
          {err && (
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
              color:"#dc2626", textAlign:"center", padding:"20px 0" }}>⚠ {err}</p>
          )}
          {!loading && !err && (
            <>
              {/* ── HISTORY TAB ── */}
              {tab === "history" && (
                <>
                  {history.length === 0 ? (
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
                      color:"#94a3b8", fontStyle:"italic", textAlign:"center", padding:"20px 0" }}>
                      No past appointment records found for this patient.
                    </p>
                  ) : history.map(h => (
                    <div key={h.id} style={CARD}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"flex-start", flexWrap:"wrap", gap:"6px" }}>
                        <div>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:"700",
                            fontSize:"13.5px", color:"#0b1f3a" }}>
                            {new Date(h.appointment_date).toLocaleDateString("en-IN",
                              { day:"numeric", month:"short", year:"numeric" })}
                            {" "}{h.appointment_time?.slice(0,5)}
                          </span>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                            color:"#64748b", marginLeft:"10px" }}>
                            {h.appointment_type === "video" ? "📹 Video" :
                             h.appointment_type === "home"  ? "🏠 Home Visit" : "🏥 In-Person"}
                          </span>
                        </div>
                        {pill(h.status, STATUS_COLOR[h.status]||"#374151",
                                        STATUS_BG[h.status]||"#f1f5f9")}
                      </div>

                      {h.doctors && (
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                          color:"#0369a1", margin:"6px 0 0" }}>
                          {withDrPrefix(h.doctors.full_name)}
                          {h.doctors.specialization ? ` · ${h.doctors.specialization}` : ""}
                        </p>
                      )}

                      {h.symptoms && (
                        <div style={{ marginTop:"8px" }}>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                            fontWeight:"700", color:"#374151" }}>Symptoms: </span>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                            color:"#1e293b" }}>{h.symptoms}</span>
                        </div>
                      )}

                      {h.prescription && (
                        <div style={{ marginTop:"8px", padding:"8px 10px",
                          background:"#f0fdf4", borderRadius:"7px",
                          borderLeft:"3px solid #86efac" }}>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                            fontWeight:"700", color:"#047857", display:"block",
                            marginBottom:"3px" }}>Prescription Notes</span>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                            color:"#1e293b" }}>{h.prescription}</span>
                        </div>
                      )}

                      {h.prescription_items?.length > 0 && (
                        <div style={{ marginTop:"8px" }}>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                            fontWeight:"700", color:"#047857", margin:"0 0 5px" }}>
                            Medicines Prescribed
                          </p>
                          {h.prescription_items.map((m, i) => (
                            <div key={i} style={{ fontFamily:"'DM Sans',sans-serif",
                              fontSize:"12px", color:"#1e293b", marginBottom:"3px",
                              paddingLeft:"8px", borderLeft:"2px solid #86efac" }}>
                              <strong>{m.medicine_name}</strong>
                              {m.dosage     ? ` · ${m.dosage}`     : ""}
                              {m.frequency  ? ` · ${m.frequency}`  : ""}
                              {m.duration   ? ` · ${m.duration}`   : ""}
                              {m.instructions ? <span style={{color:"#64748b"}}> — {m.instructions}</span> : ""}
                            </div>
                          ))}
                        </div>
                      )}

                      {h.doctor_notes && (
                        <div style={{ marginTop:"8px" }}>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                            fontWeight:"700", color:"#374151" }}>Doctor Notes: </span>
                          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"12px",
                            color:"#64748b", fontStyle:"italic" }}>{h.doctor_notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* ── HEALTH PROFILE TAB ── */}
              {tab === "health" && (
                <>
                  {!health || health.exists === false ? (
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
                      color:"#94a3b8", fontStyle:"italic", textAlign:"center", padding:"20px 0" }}>
                      This patient hasn't filled their health profile yet.
                    </p>
                  ) : (
                    <div style={CARD}>
                      {(health.height_cm || health.weight_kg) && (
                        <div style={{ display:"flex", gap:"20px", marginBottom:"12px",
                          padding:"10px", background:"#eff8ff", borderRadius:"8px" }}>
                          {health.height_cm &&
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"18px",
                                fontWeight:"700", color:"#0369a1" }}>{health.height_cm}<span style={{fontSize:"11px"}}>cm</span></div>
                              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                                color:"#64748b" }}>Height</div>
                            </div>}
                          {health.weight_kg &&
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"18px",
                                fontWeight:"700", color:"#0369a1" }}>{health.weight_kg}<span style={{fontSize:"11px"}}>kg</span></div>
                              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                                color:"#64748b" }}>Weight</div>
                            </div>}
                          {health.height_cm && health.weight_kg &&
                            <div style={{ textAlign:"center" }}>
                              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"18px",
                                fontWeight:"700", color:"#047857" }}>
                                {(health.weight_kg / ((health.height_cm/100)**2)).toFixed(1)}
                              </div>
                              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                                color:"#64748b" }}>BMI</div>
                            </div>}
                        </div>
                      )}
                      {fieldRow("Allergies",           health.allergies)}
                      {fieldRow("Chronic Conditions",  health.chronic_conditions)}
                      {fieldRow("Current Medications", health.current_medications)}
                      {fieldRow("Past Surgeries",      health.past_surgeries)}
                      {fieldRow("Notes",               health.notes)}
                      {!health.allergies && !health.chronic_conditions &&
                       !health.current_medications && !health.past_surgeries &&
                       !health.notes && !health.height_cm && !health.weight_kg && (
                        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
                          color:"#94a3b8", fontStyle:"italic", margin:0 }}>
                          Profile exists but all fields are empty.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ── DOCUMENTS TAB ── */}
              {tab === "docs" && (
                <>
                  {docs.length === 0 ? (
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"13px",
                      color:"#94a3b8", fontStyle:"italic", textAlign:"center", padding:"20px 0" }}>
                      No documents uploaded by this patient yet.
                    </p>
                  ) : docs.map(doc => {
                    const TYPE_ICON = { lab_report:"🧪", prescription:"💊",
                      imaging:"🔬", other:"📄" };
                    return (
                      <div key={doc.id} style={{ ...CARD, display:"flex",
                        justifyContent:"space-between", alignItems:"center", gap:"10px" }}>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:"600",
                            fontSize:"13px", color:"#0b1f3a", margin:0,
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {TYPE_ICON[doc.document_type] || "📄"} {doc.file_name}
                          </p>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                            color:"#94a3b8", margin:"3px 0 0" }}>
                            {doc.document_type?.replace("_"," ")}
                            {doc.family_members?.full_name
                              ? ` · ${doc.family_members.full_name}` : ""}
                            {" · "}{new Date(doc.uploaded_at).toLocaleDateString("en-IN",
                              { day:"numeric", month:"short", year:"numeric" })}
                          </p>
                        </div>
                        <button onClick={() => downloadDoc(doc)}
                          disabled={dlLoading[doc.id]}
                          style={{ flexShrink:0, padding:"7px 13px", borderRadius:"8px",
                            background:"#eff8ff", border:"1.5px solid #93c5fd",
                            color:"#0369a1", fontFamily:"'DM Sans',sans-serif",
                            fontSize:"12px", fontWeight:"600",
                            cursor: dlLoading[doc.id] ? "wait" : "pointer" }}>
                          {dlLoading[doc.id] ? "…" : "⬇ Open"}
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AcceptRejectButtons({ appt, token, onChanged, onReject }) {
  const [accepting, setAccepting] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [fee, setFee] = useState("");
  const [feeErr, setFeeErr] = useState("");

  const needsFee = !appt.payment_amount || Number(appt.payment_amount) <= 0;

  const doAccept = async (consultationFee) => {
    setAccepting(true);
    try {
      const res = await fetch(`${API}/appointments/${appt.id}/accept`,{
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`,
        },
        body: JSON.stringify(consultationFee ? { consultation_fee: Number(consultationFee) } : {}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed");
      setShowFeeModal(false);
      onChanged();
    } catch (e) { showToast(e.message || "Failed to accept", "error"); }
    finally { setAccepting(false); }
  };

  const accept = () => {
    if (needsFee) { setFeeErr(""); setFee(""); setShowFeeModal(true); return; }
    doAccept();
  };

  const confirmFee = () => {
    const n = Number(fee);
    if (!fee || isNaN(n) || n <= 0) { setFeeErr("Enter a valid fee amount"); return; }
    doAccept(n);
  };

  return (
    <>
      <button onClick={accept} disabled={accepting}
        style={{padding:"7px 14px",borderRadius:"7px",
          background:"linear-gradient(135deg,#047857,#059669)",border:"none",
          color:"#fff",fontFamily:"'DM Sans',sans-serif",
          fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
        {accepting ? "Accepting…" : "✅ Accept"}
      </button>
      <button onClick={()=>onReject(appt)} disabled={accepting}
        style={{padding:"7px 14px",borderRadius:"7px",
          background:"#fff",border:"1.5px solid #fecaca",
          color:"#b91c1c",fontFamily:"'DM Sans',sans-serif",
          fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
        ❌ Decline
      </button>

      {showFeeModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(11,31,58,.55)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"16px"}}
          onClick={()=>!accepting && setShowFeeModal(false)}>
          <div style={{background:"#fff",borderRadius:"14px",padding:"24px",
            maxWidth:"360px",width:"100%"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"19px",
              fontWeight:700,color:"#0b1f3a",margin:"0 0 6px"}}>Set Consultation Fee</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",
              color:"#64748b",margin:"0 0 16px"}}>
              No fee was set on your profile for this booking. Enter the amount
              you'd like to charge — the patient will pay this before the
              appointment proceeds.
            </p>
            <input type="number" onWheel={e=>e.currentTarget.blur()} min="1" value={fee}
              onChange={e=>{setFee(e.target.value);setFeeErr("");}}
              placeholder="e.g. 500" autoFocus
              style={{width:"100%",padding:"10px 12px",borderRadius:"8px",
                border:`1.5px solid ${feeErr?"#fca5a5":"#e2eaf4"}`,
                fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                boxSizing:"border-box"}}/>
            {feeErr && <p style={{color:"#dc2626",fontSize:"12px",
              fontFamily:"'DM Sans',sans-serif",margin:"6px 0 0"}}>{feeErr}</p>}
            <div style={{display:"flex",gap:"8px",marginTop:"18px"}}>
              <button onClick={()=>setShowFeeModal(false)} disabled={accepting}
                style={{flex:1,padding:"10px",borderRadius:"8px",
                  background:"#f1f5f9",border:"none",color:"#64748b",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:600,
                  fontSize:"13px",cursor:"pointer"}}>Cancel</button>
              <button onClick={confirmFee} disabled={accepting}
                style={{flex:1,padding:"10px",borderRadius:"8px",
                  background:"linear-gradient(135deg,#047857,#059669)",
                  border:"none",color:"#fff",fontFamily:"'DM Sans',sans-serif",
                  fontWeight:600,fontSize:"13px",cursor:"pointer"}}>
                {accepting ? "Accepting…" : "Confirm & Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MyReviews({ token }) {
  const [reviews, setReviews] = useState(null);
  const [stats,   setStats]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const meRes  = await fetch(`${API}/doctors/my-profile`, { headers:{ Authorization:`Bearer ${token}` }});
        const me     = await meRes.json();
        setStats({ rating: me.rating, total_reviews: me.total_reviews });
        if (me.id) {
          const res  = await fetch(`${API}/doctors/${me.id}/reviews`);
          const json = await res.json();
          setReviews(json.reviews || []);
        }
      } catch { setReviews([]); }
    })();
  }, [token]);

  return (
    <div style={{padding:"20px 0"}}>
      {stats && (
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"18px",
          background:"#fffbeb",border:"1px solid #fde68a",borderRadius:"12px",padding:"16px 20px"}}>
          <span style={{fontSize:"28px",fontWeight:"700",color:"#b45309",
            fontFamily:"'Cormorant Garamond',serif"}}>{stats.rating || "—"}</span>
          <div>
            <span style={{color:"#fbbf24",fontSize:"15px"}}>★★★★★</span>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#92400e",margin:"2px 0 0"}}>
              from {stats.total_reviews || 0} review{stats.total_reviews===1?"":"s"}
            </p>
          </div>
        </div>
      )}
      {reviews === null ? (
        <div style={{textAlign:"center",padding:"40px"}}>
          <div style={{width:"28px",height:"28px",border:"3px solid #e2eaf4",borderTop:"3px solid #0369a1",
            borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
        </div>
      ) : reviews.length === 0 ? (
        <div style={{padding:"40px 20px",textAlign:"center",background:"#fff",
          borderRadius:"14px",border:"1px solid #e2eaf4"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"14px"}}>
            No reviews yet — they'll show up here once patients start leaving them after
            completed appointments.
          </p>
        </div>
      ) : reviews.map(r => (
        <div key={r.id} className="appt-row" style={{marginBottom:"10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
            <span style={{color:"#fbbf24",fontSize:"14px"}}>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
              {r.patient_name} · {new Date(r.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
            </span>
          </div>
          {r.review_text && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",
            color:"#1e293b",margin:0}}>{r.review_text}</p>}
        </div>
      ))}
    </div>
  );
}

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("wc4a_token");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab,     setTab]       = useState("today");
  const [notesAppt, setNotesAppt] = useState(null);
  const [rejectAppt,   setRejectAppt]   = useState(null);
  const [transferAppt, setTransferAppt] = useState(null);
  const [briefAppt,    setBriefAppt]    = useState(null);
  const [incomingTransfers, setIncomingTransfers] = useState([]);
  const [upcomingLeave, setUpcomingLeave] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [availableNow,  setAvailableNow]  = useState(false);
  const [toggling,      setToggling]      = useState(false);
  const [myDoctorId,    setMyDoctorId]    = useState(null);

  useEffect(() => {
    document.title = "Doctor Panel — We Care 4 'all'";
    fetchAppointments();
    fetchUnread();
    fetchProfile();
    fetchIncomingTransfers();
    fetchUpcomingLeave();
    const t = setInterval(fetchUnread, 30000); // refresh badge every 30s
    return () => clearInterval(t);
  }, []);

  const fetchUpcomingLeave = async () => {
    try {
      const res  = await fetch(`${API}/doctor-leave`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      const todayStr = new Date().toISOString().slice(0,10);
      // Only current/upcoming blocks — past leave isn't useful on a dashboard summary.
      setUpcomingLeave((json.leave || []).filter(l => l.end_date >= todayStr));
    } catch { setUpcomingLeave([]); }
  };

  const fetchIncomingTransfers = async () => {
    try {
      const res  = await fetch(`${API}/appointments/transfer-requests/incoming`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setIncomingTransfers(json.requests || []);
    } catch { setIncomingTransfers([]); }
  };

  const respondToTransfer = async (requestId, accept) => {
    try {
      const res  = await fetch(`${API}/appointments/transfer-requests/${requestId}/respond`, {
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body:JSON.stringify({accept}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Failed");
      fetchIncomingTransfers();
      fetchAppointments();

      // Accepted, but this date/time falls outside the doctor's declared
      // weekly schedule (or they're on leave that day) — the appointment
      // still moved over, but their calendar won't reflect it until they
      // add the slot. Offer to take them straight there.
      if (accept && json.needs_availability && json.availability_gap) {
        const g = json.availability_gap;
        showToast(
          `Transfer accepted — but you don't have ${g.day.charAt(0).toUpperCase()+g.day.slice(1)} ${g.time} set as an available slot yet.`,
          "warning", 7000,
        );
        if (window.confirm(
          `This appointment is on ${g.date} at ${g.time}, outside your current availability. ` +
          `Add that slot now so it shows correctly on your calendar?`
        )) {
          navigate("/doctor/availability");
        }
      } else if (accept) {
        showToast("Transfer accepted — appointment moved to you.", "success");
      }
    } catch (e) { showToast(e.message || "Failed to respond", "error"); }
  };

  const fetchProfile = async () => {
    try {
      const res  = await fetch(`${API}/doctors/my-profile`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setAvailableNow(!!json.available_now);
      setMyDoctorId(json.id || null); // needed for inline patient brief to filter history
    } catch {}
  };

  const toggleAvailableNow = async () => {
    setToggling(true);
    try {
      const res  = await fetch(`${API}/doctors/my-availability-now`,
        { method:"PUT", headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      if (res.ok) setAvailableNow(json.available_now);
    } catch {}
    finally { setToggling(false); }
  };

  const fetchUnread = async () => {
    try {
      const res  = await fetch(`${API}/chat/unread-count`,
        { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setUnreadCount(json.count || 0);
    } catch {}
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/appointments/doctor`,{headers:{Authorization:`Bearer ${token}`}});
      const json = await res.json();
      setAppointments(json.appointments||[]);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  };

  const today         = new Date().toISOString().split("T")[0];
  const todayAppts    = appointments.filter(a=>a.appointment_date===today&&!["cancelled","rejected"].includes(a.status));
  const upcomingAppts = appointments.filter(a=>a.appointment_date>today&&!["cancelled","rejected"].includes(a.status));
  const pastAppts     = appointments.filter(a=>a.appointment_date<today&&!["cancelled","rejected"].includes(a.status));
  const cancelledAppts= appointments.filter(a=>["cancelled","rejected"].includes(a.status));
  const displayed     = tab==="today"?todayAppts:tab==="upcoming"?upcomingAppts:tab==="cancelled"?cancelledAppts:pastAppts;

  const STATS = [
    {label:"Today",    value:todayAppts.length,    icon:"📅",color:"#047857"},
    {label:"Upcoming", value:upcomingAppts.length, icon:"⏰",color:"#0369a1"},
    {label:"Completed",value:appointments.filter(a=>a.status==="completed").length,icon:"✅",color:"#7c3aed"},
    {label:"Total",    value:appointments.length,  icon:"📋",color:"#b45309"},
  ];

  return (
    <div className="dd">
      <style>{G}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0369a1,#0284c7)",padding:"20px 20px 24px"}}>
        <div style={{maxWidth:"1100px",margin:"0 auto",display:"flex",
          justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <Link to="/" style={{textDecoration:"none"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                color:"rgba(255,255,255,.65)",marginBottom:"4px",textTransform:"uppercase",letterSpacing:"1px"}}>
                Doctor Panel
              </p>
            </Link>
            <h1 style={{fontSize:"clamp(18px,3vw,26px)",fontWeight:"700",color:"#fff",margin:0}}>
              {withDrPrefix(user?.name||user?.email||"Doctor")}
            </h1>
          </div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <button onClick={toggleAvailableNow} disabled={toggling}
              style={{padding:"8px 16px",borderRadius:"8px",cursor:toggling?"default":"pointer",
                background: availableNow ? "#10b981" : "rgba(255,255,255,.15)",
                border: availableNow ? "1px solid #10b981" : "1px solid rgba(255,255,255,.25)",
                color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"600",
                display:"inline-flex",alignItems:"center",gap:"6px",opacity:toggling?0.7:1}}
              title={availableNow ? "Patients can see you're available for an instant consult right now — click to turn off" : "Flag yourself as available for an instant video consult right now (auto-expires after 3 hours)"}>
              {availableNow ? "🟢 Available Now" : "⚪ Available Now: Off"}
            </button>
            <Link to="/doctor/profile" style={{padding:"8px 16px",borderRadius:"8px",
              background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500"}}>
              👤 Profile
            </Link>
            <Link to="/doctor/availability" style={{padding:"8px 16px",borderRadius:"8px",
              background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500"}}>
              🕐 Availability
            </Link>
            <NotificationBell/>
            <Link to="/doctor/chat" style={{padding:"8px 16px",borderRadius:"8px",
              background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",
              color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:"500",
              display:"inline-flex",alignItems:"center",gap:"6px",position:"relative"}}>
              💬 Messages
              {unreadCount > 0 && (
                <span style={{background:"#dc2626",color:"#fff",fontSize:"10px",
                  fontWeight:"700",padding:"1px 6px",borderRadius:"50px",
                  minWidth:"18px",textAlign:"center",lineHeight:"16px"}}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
            <button onClick={()=>{logout();navigate("/");}}
              style={{padding:"8px 16px",borderRadius:"8px",background:"rgba(255,255,255,.15)",
                border:"1px solid rgba(255,255,255,.25)",color:"#fff",
                fontFamily:"'DM Sans',sans-serif",fontSize:"13px",cursor:"pointer"}}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"20px 14px 40px"}}>
        {/* Stats */}
        <div className="dd-stats">
          {STATS.map(({label,value,icon,color})=>(
            <div key={label} style={{background:"#fff",border:"1px solid #e2eaf4",
              borderRadius:"12px",padding:"14px 16px",textAlign:"center",
              boxShadow:"0 2px 8px rgba(11,31,58,.05)"}}>
              <div style={{fontSize:"20px",marginBottom:"5px"}}>{icon}</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"26px",
                fontWeight:"700",color,margin:"0 0 2px",lineHeight:1}}>{value}</p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                color:"#94a3b8",margin:0}}>{label}</p>
            </div>
          ))}
        </div>

        {upcomingLeave.length>0&&(
          <div style={{marginBottom:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
              <h2 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
                🏖️ Your Blocked Dates
              </h2>
              <Link to="/doctor/availability" style={{fontFamily:"'DM Sans',sans-serif",
                fontSize:"12.5px",color:"#047857",fontWeight:"600",textDecoration:"none"}}>
                Manage →
              </Link>
            </div>
            {upcomingLeave.map(l=>{
              const todayStr = new Date().toISOString().slice(0,10);
              const isOngoing = l.start_date <= todayStr && l.end_date >= todayStr;
              return (
                <div key={l.id} style={{background: isOngoing ? "#fef2f2" : "#fffbeb",
                  border:`1px solid ${isOngoing ? "#fca5a5" : "#fde68a"}`,
                  borderRadius:"10px",padding:"10px 16px",marginBottom:"8px",
                  display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color: isOngoing ? "#991b1b" : "#92400e"}}>
                    {isOngoing ? "● Currently on leave" : "Upcoming leave"} —{" "}
                    {new Date(l.start_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                    {" → "}
                    {new Date(l.end_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                    {l.reason ? ` · ${l.reason}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {incomingTransfers.length>0&&(
          <div style={{marginBottom:"20px"}}>
            <h2 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",margin:"0 0 10px"}}>
              🔔 Transfer Requests
            </h2>
            {incomingTransfers.map(r=>(
              <div key={r.id} style={{background:"#eff8ff",border:"1px solid #93c5fd",
                borderRadius:"12px",padding:"14px 16px",marginBottom:"8px",
                display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13.5px",color:"#0b1f3a",margin:0}}>
                    <strong>{withDrPrefix(r.from?.full_name||"A doctor")}</strong> wants you to take over{" "}
                    <strong>{r.appointments?.patient_name||"a patient"}</strong>
                  </p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#64748b",margin:"3px 0 0"}}>
                    {r.appointments?.appointment_date&&new Date(r.appointments.appointment_date).toLocaleDateString("en-IN",
                      {day:"numeric",month:"short",year:"numeric"})}
                    {" "}{r.appointments?.appointment_time?.slice(0,5)}
                    {r.reason&&<> · {r.reason}</>}
                  </p>
                </div>
                <div style={{display:"flex",gap:"6px",flexShrink:0}}>
                  <button onClick={()=>respondToTransfer(r.id,true)}
                    style={{padding:"7px 14px",borderRadius:"7px",
                      background:"linear-gradient(135deg,#047857,#059669)",border:"none",
                      color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      fontWeight:"600",cursor:"pointer"}}>
                    Accept
                  </button>
                  <button onClick={async()=>{
                      const ok = await confirmAction({
                        title: "Decline this transfer?",
                        message: `${r.appointments?.patient_name||"This patient"}'s appointment stays assigned to you. ${withDrPrefix(r.from?.full_name||"the requesting doctor")} will be notified so they can reassign it elsewhere.`,
                        confirmLabel: "Decline",
                      });
                      if (ok) respondToTransfer(r.id,false);
                    }}
                    style={{padding:"7px 14px",borderRadius:"7px",
                      background:"#fef2f2",border:"1px solid #fecaca",
                      color:"#991b1b",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      fontWeight:"600",cursor:"pointer"}}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          marginBottom:"10px",flexWrap:"wrap",gap:"10px"}}>
          <h2 style={{fontSize:"20px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
            Patient Appointments
          </h2>
        </div>
        <div className="dd-tabs">
          {[["today",`Today (${todayAppts.length})`],
            ["upcoming",`Upcoming (${upcomingAppts.length})`],
            ["past",`Past (${pastAppts.length})`],
            ["cancelled",`Cancelled (${cancelledAppts.length})`],
            ["reviews","⭐ Reviews"]
          ].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`tab-btn${tab===t?" active":""}`}>{l}</button>
          ))}
        </div>

        {tab==="reviews" ? <MyReviews token={token}/> : (<>
        {/* List */}
        {loading ? (
          <div style={{padding:"60px 0",textAlign:"center"}}>
            <div style={{width:"32px",height:"32px",border:"3px solid #e2eaf4",
              borderTop:"3px solid #0369a1",borderRadius:"50%",
              animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",color:"#94a3b8",fontSize:"14px"}}>
              Loading…
            </p>
          </div>
        ) : displayed.length===0 ? (
          <div style={{padding:"48px 20px",textAlign:"center",background:"#fff",
            borderRadius:"14px",border:"1px solid #e2eaf4"}}>
            <div style={{fontSize:"40px",marginBottom:"12px"}}>📋</div>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#0b1f3a",marginBottom:"6px"}}>
              No Appointments
            </h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#64748b"}}>
              No {tab} appointments found.
            </p>
          </div>
        ) : displayed.map(appt=>{
          const s=STATUS_STYLES[appt.status]||STATUS_STYLES.pending;
          return(
            <div key={appt.id} className="appt-row">
              <div style={{display:"flex",justifyContent:"space-between",
                alignItems:"flex-start",gap:"10px",flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",
                    flexWrap:"wrap",marginBottom:"4px"}}>
                    <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"#0b1f3a"}}>
                      {appt.patient_name}
                    </strong>
                    <span style={{background:s.bg,color:s.color,fontSize:"11px",
                      fontWeight:"700",padding:"2px 9px",borderRadius:"50px",
                      fontFamily:"'DM Sans',sans-serif"}}>
                      {s.label}
                    </span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"#94a3b8"}}>
                      {TYPE_LABELS[appt.appointment_type]||appt.appointment_type}
                    </span>
                  </div>
                  <div className="appt-detail">
                    <span>📅 {new Date(appt.appointment_date).toLocaleDateString("en-IN",
                      {day:"numeric",month:"short",year:"numeric"})}</span>
                    <span>🕐 {appt.appointment_time?.slice(0,5)||""}</span>
                    {appt.patient_mobile&&<span>📱 {appt.patient_mobile}</span>}
                    {appt.patient_email&&<span>✉️ {appt.patient_email}</span>}
                    {appt.payment_amount>0&&
                      <span style={{color:"#047857",fontWeight:"600"}}>💰 ₹{appt.payment_amount}</span>}
                  </div>
                  {appt.symptoms&&
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                      color:"#94a3b8",fontStyle:"italic",margin:"5px 0 0"}}>
                      {appt.symptoms}
                    </p>}
                  {appt.prescription&&
                    <div style={{background:"#f0fdf4",border:"1px solid #86efac",
                      borderRadius:"8px",padding:"8px 12px",marginTop:"8px"}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                        fontWeight:"700",color:"#15803d",margin:"0 0 3px"}}>Notes:</p>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                        color:"#374151",margin:0}}>{appt.prescription}</p>
                    </div>}
                  {/* Inline collapsible patient brief — lazy loads on first expand */}
                  {appt.patient_id&&
                    <PatientBriefPanel
                      appt={appt}
                      token={token}
                      myDoctorId={myDoctorId}
                    />}
                </div>
                <div style={{display:"flex",gap:"6px",flexShrink:0,flexWrap:"wrap"}}>
                  {/* Patient Brief — available on every appointment */}
                  {appt.patient_id&&
                    <button onClick={()=>setBriefAppt(appt)}
                      style={{padding:"7px 14px",borderRadius:"7px",
                        background:"#faf5ff",border:"1.5px solid #d8b4fe",
                        color:"#6d28d9",fontFamily:"'DM Sans',sans-serif",
                        fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                      👤 Patient Brief
                    </button>}
                  {appt.status==="pending"&&
                    <AcceptRejectButtons appt={appt} token={token}
                      onChanged={fetchAppointments} onReject={setRejectAppt}/>}
                  {appt.status==="approved"&&appt.appointment_type==="video"&&
                    <CreateVideoBtn appointmentId={appt.id} token={token} appt={appt}/>}
                  {appt.status==="approved"&&
                    <button onClick={()=>setNotesAppt(appt)}
                      style={{padding:"7px 14px",borderRadius:"7px",
                        background:"#f0fdf4",border:"1.5px solid #86efac",
                        color:"#047857",fontFamily:"'DM Sans',sans-serif",
                        fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                      📝 Notes
                    </button>}
                  {["pending","approved"].includes(appt.status)&&
                    <button onClick={()=>setTransferAppt(appt)}
                      style={{padding:"7px 14px",borderRadius:"7px",
                        background:"#eff8ff",border:"1.5px solid #93c5fd",
                        color:"#0369a1",fontFamily:"'DM Sans',sans-serif",
                        fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                      ↪️ Transfer
                    </button>}
                </div>
              </div>
            </div>
          );
        })}
        </>)}
      </div>

      {briefAppt&&(
        <PatientBriefModal
          appt={briefAppt}
          token={token}
          onClose={()=>setBriefAppt(null)}
        />
      )}
      {notesAppt&&(
        <NotesModal
          appt={notesAppt}
          token={token}
          onClose={()=>setNotesAppt(null)}
          onSaved={fetchAppointments}
        />
      )}
      {rejectAppt&&(
        <RejectModal
          appt={rejectAppt}
          token={token}
          onClose={()=>setRejectAppt(null)}
          onSaved={fetchAppointments}
        />
      )}
      {transferAppt&&(
        <TransferModal
          appt={transferAppt}
          token={token}
          onClose={()=>setTransferAppt(null)}
          onSent={fetchAppointments}
        />
      )}
    </div>
  );
}
