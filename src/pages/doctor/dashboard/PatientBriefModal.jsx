import { useState, useEffect } from "react";
import { showToast } from "../../../components/Toast";
import { API } from "./shared";


// ── Patient Brief Modal ───────────────────────────────────────
// Three data sources loaded in parallel on open:
//   1. Full appointment history (GET /appointments/patient/{id}/history)
//   2. Health profile (GET /health-profile/patient/{id})
//   3. Uploaded documents list (GET /patient-documents/patient/{id})
// A fourth call (download URL) fires only when the doctor clicks a
// specific document — not preloaded.
export default function PatientBriefModal({ appt, token, onClose }) {
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
                          {h.doctors.full_name}
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
