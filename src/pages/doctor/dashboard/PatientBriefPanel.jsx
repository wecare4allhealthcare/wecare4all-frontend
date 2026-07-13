import { useState } from "react";
import { showToast } from "../../../components/Toast";
import { API } from "./shared";


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
export default function PatientBriefPanel({ appt, token, myDoctorId }) {
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
