/**
 * pages/lab/Dashboard.jsx — Lab partner dashboard, built on the shared
 * PartnerDashboardShell (see components/PartnerDashboardShell.jsx) for
 * the header/status-gate/Profile/Plan tabs — exact same shell
 * pharmacy/Dashboard.jsx uses. This file's own job is just the
 * "Bookings" tab: accept/reject incoming test requests and advance
 * them through collection → processing → report ready. Structurally
 * a 1:1 mirror of pharmacy/Dashboard.jsx's order list (same fetch/
 * expand/advance pattern), against /lab-portal/bookings instead of
 * /pharmacy-portal/orders — see app/routes/lab_bookings.py for the
 * status flow this UI drives:
 *   booked → confirmed → sample_collected → processing → report_ready
 *          ↘ rejected (from 'booked' only)
 */
import { useEffect, useState } from "react";
import PartnerDashboardShell from "../../components/PartnerDashboardShell";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.lb{font-family:'DM Sans',sans-serif;color:#1e293b;}
.lb *{box-sizing:border-box;}
@keyframes lb-spin{to{transform:rotate(360deg)}}
.lb-inp{width:100%;border:1.5px solid #e2eaf4;border-radius:9px;padding:9px 12px;
  font-family:'DM Sans',sans-serif;font-size:13.5px;color:#1e293b;background:#f8fafc;outline:none;}
`;

const STATUS_META = {
  booked:            { label: "New Request",      bg: "#fef9c3", color: "#854d0e" },
  confirmed:         { label: "Confirmed",         bg: "#eff8ff", color: "#0369a1" },
  sample_collected:  { label: "Sample Collected",  bg: "#faf5ff", color: "#7c3aed" },
  processing:        { label: "Processing",        bg: "#fff7ed", color: "#c2410c" },
  report_ready:      { label: "Report Ready",      bg: "#f0fdf4", color: "#15803d" },
  rejected:          { label: "Rejected",          bg: "#fef2f2", color: "#991b1b" },
  cancelled:         { label: "Cancelled",         bg: "#fef2f2", color: "#991b1b" },
};
const NEXT_STATUS = {
  confirmed: "sample_collected", sample_collected: "processing", processing: "report_ready",
};
const NEXT_LABEL = {
  confirmed: "Mark Sample Collected", sample_collected: "Start Processing", processing: "Mark Report Ready",
};

function LabBookingsPanel() {
  const token = typeof window !== "undefined" ? localStorage.getItem("wc4a_token") : null;
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("active"); // active | all | report_ready | rejected
  const [openId,   setOpenId]   = useState(null);
  const [detail,   setDetail]   = useState(null);
  const [labNotes, setLabNotes] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  // Previously fetched every booking this lab has ever received in one
  // request, then filtered active/report_ready/rejected entirely in
  // JS — load time only ever grew over the lab's lifetime. Status
  // filtering is now server-side too (see lab_list_bookings in
  // routes/lab_bookings.py), so `bookings` IS the already-filtered,
  // already-paginated page.
  const fetchBookings = async (f = filter, p = page) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/lab-portal/bookings?status_filter=${f}&page=${p}&page_size=${PAGE_SIZE}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setBookings(json.bookings || []);
      setTotalPages(Math.max(1, Math.ceil((json.total||0)/PAGE_SIZE)));
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchBookings(filter, 1); setPage(1); }, [filter]);

  const openBooking = async (id) => {
    if (openId === id) { setOpenId(null); setDetail(null); return; }
    setOpenId(id); setDetail(null);
    try {
      const res  = await fetch(`${API}/lab-portal/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setDetail(json.booking);
      setLabNotes(json.booking.lab_notes || "");
      setReportUrl(json.booking.report_url || "");
    } catch { /* leave detail null — the card still shows summary info */ }
  };

  const updateStatus = async (booking, newStatus, extra = {}) => {
    setSaving(true);
    try {
      await fetch(`${API}/lab-portal/bookings/${booking.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: newStatus,
          lab_notes: labNotes || undefined,
          report_url: reportUrl || undefined,
          ...extra,
        }),
      });
      await fetchBookings(filter, page);
      if (openId === booking.id) openBooking(booking.id);
    } finally { setSaving(false); }
  };

  const accept = (booking) => updateStatus(booking, "confirmed");

  const reject = (booking) => {
    const reason = window.prompt("Reason for declining this request (shown to the patient):", "");
    if (reason === null) return; // cancelled the prompt
    updateStatus(booking, "rejected", { rejection_reason: reason || undefined });
  };

  // Filtering is now server-side (see fetchBookings) — `bookings` IS
  // the already-filtered page.
  const filtered = bookings;

  return (
    <div className="lb">
      <style>{G}</style>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["active", "all", "report_ready", "rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
              border: filter === f ? "1.5px solid #047857" : "1.5px solid #e2eaf4",
              background: filter === f ? "#f0fdf4" : "#fff",
              color: filter === f ? "#047857" : "#64748b",
              fontFamily: "'DM Sans',sans-serif", fontWeight: "600", fontSize: "12.5px" }}>
            {f === "active" ? "Active" : f === "all" ? "All" : f === "report_ready" ? "Report Ready" : "Rejected"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ width: "30px", height: "30px", border: "3px solid #e2eaf4",
            borderTop: "3px solid #047857", borderRadius: "50%", animation: "lb-spin .8s linear infinite", margin: "0 auto" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#6b7688" }}>
          No booking requests here right now.
        </div>
      ) : (
        filtered.map(b => {
          const meta = STATUS_META[b.status] || STATUS_META.booked;
          const isOpen = openId === b.id;
          return (
            <div key={b.id} style={{ background: "#fff", border: "1px solid #e2eaf4",
              borderRadius: "14px", marginBottom: "12px", overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: "10px", cursor: "pointer" }}
                onClick={() => openBooking(b.id)}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "14px", color: "#0b1f3a" }}>
                      Booking #{b.id.slice(-8).toUpperCase()}
                    </strong>
                    <span style={{ background: meta.bg, color: meta.color, fontSize: "11px", fontWeight: "700",
                      padding: "2px 10px", borderRadius: "50px" }}>
                      {meta.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: 0 }}>
                    🧪 {(b.test_names || []).join(", ") || `${(b.test_ids || []).length} test(s)`} · 📅 {b.scheduled_date}
                    {b.scheduled_time_slot ? ` (${b.scheduled_time_slot})` : ""}
                    {b.collection_type === "home" ? " · 🏠 Home collection" : " · 🏥 At center"}
                  </p>
                </div>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{isOpen ? "▲ Hide" : "▼ View"}</span>
              </div>

              {isOpen && (
                <div style={{ padding: "0 18px 18px", borderTop: "1px solid #f1f5f9" }}>
                  {!detail ? (
                    <p style={{ fontSize: "13px", color: "#6b7688", paddingTop: "14px" }}>Loading…</p>
                  ) : (
                    <>
                      <div style={{ marginTop: "14px", marginBottom: "14px" }}>
                        <p style={{ fontSize: "12px", fontWeight: "700", color: "#047857",
                          letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                          Tests Requested
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {(detail.tests || []).map(test => (
                            <div key={test.id} style={{ background: "#f8fafc", borderRadius: "8px", padding: "8px 12px" }}>
                              <span style={{ fontSize: "13px", fontWeight: "700", color: "#0b1f3a" }}>{test.name}</span>
                              <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px" }}>₹{test.price}</span>
                              {test.prep_instructions && (
                                <p style={{ fontSize: "11.5px", color: "#94a3b8", margin: "3px 0 0" }}>{test.prep_instructions}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {detail.patient && (
                        <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "6px" }}>
                          👤 {detail.patient.full_name} {detail.patient.mobile ? `· 📱 ${detail.patient.mobile}` : ""}
                        </p>
                      )}
                      {detail.collection_type === "home" && detail.address && (
                        <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "6px" }}>📍 {detail.address}</p>
                      )}
                      {detail.notes && (
                        <p style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "14px" }}>📝 Patient note: {detail.notes}</p>
                      )}

                      {!["report_ready", "rejected", "cancelled"].includes(b.status) && (
                        <div style={{ marginBottom: "14px" }}>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "600",
                            color: "#374151", marginBottom: "4px" }} htmlFor={`notes-${b.id}`}>
                            Lab Notes (optional)
                          </label>
                          <input id={`notes-${b.id}`} className="lb-inp" value={labNotes}
                            onChange={e => setLabNotes(e.target.value)} placeholder="Visible to admin, not the patient" />
                        </div>
                      )}

                      {b.status === "processing" && (
                        <div style={{ marginBottom: "14px" }}>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: "600",
                            color: "#374151", marginBottom: "4px" }} htmlFor={`report-${b.id}`}>
                            Report URL (paste before marking Report Ready)
                          </label>
                          <input id={`report-${b.id}`} className="lb-inp" value={reportUrl}
                            onChange={e => setReportUrl(e.target.value)} placeholder="https://…" />
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {b.status === "booked" && (
                          <>
                            <button disabled={saving} onClick={() => accept(b)}
                              style={{ padding: "9px 18px", borderRadius: "8px", border: "none",
                                background: "linear-gradient(135deg,#047857,#059669)", color: "#fff",
                                fontWeight: "700", fontSize: "12.5px", cursor: saving ? "wait" : "pointer" }}>
                              {saving ? "Saving…" : "Accept Request"}
                            </button>
                            <button disabled={saving} onClick={() => reject(b)}
                              style={{ padding: "9px 18px", borderRadius: "8px", border: "1.5px solid #fecaca",
                                background: "#fef2f2", color: "#dc2626", fontWeight: "700", fontSize: "12.5px",
                                cursor: saving ? "wait" : "pointer" }}>
                              Decline
                            </button>
                          </>
                        )}
                        {NEXT_STATUS[b.status] && (
                          <button disabled={saving} onClick={() => updateStatus(b, NEXT_STATUS[b.status])}
                            style={{ padding: "9px 18px", borderRadius: "8px", border: "none",
                              background: "linear-gradient(135deg,#047857,#059669)", color: "#fff",
                              fontWeight: "700", fontSize: "12.5px", cursor: saving ? "wait" : "pointer" }}>
                            {saving ? "Saving…" : NEXT_LABEL[b.status]}
                          </button>
                        )}
                      </div>

                      {(detail.events || []).length > 0 && (
                        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                          <p style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8",
                            letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Timeline</p>
                          {detail.events.map(ev => (
                            <p key={ev.id} style={{ fontSize: "12px", color: "#64748b", margin: "2px 0" }}>
                              {(STATUS_META[ev.status] || {}).label || ev.status}
                              {ev.note ? ` — ${ev.note}` : ""}
                              {" · "}{new Date(ev.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 16 }}>
          <button disabled={page <= 1 || loading}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e2eaf4", background: "#fff",
              fontSize: 12.5, cursor: page <= 1 || loading ? "not-allowed" : "pointer", opacity: page <= 1 || loading ? 0.5 : 1 }}
            onClick={() => { const p = page - 1; setPage(p); fetchBookings(filter, p); }}>← Prev</button>
          <span style={{ fontSize: 12.5, color: "#64748b" }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages || loading}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e2eaf4", background: "#fff",
              fontSize: 12.5, cursor: page >= totalPages || loading ? "not-allowed" : "pointer", opacity: page >= totalPages || loading ? 0.5 : 1 }}
            onClick={() => { const p = page + 1; setPage(p); fetchBookings(filter, p); }}>Next →</button>
        </div>
      )}
    </div>
  );
}

export default function LabDashboard() {
  return (
    <PartnerDashboardShell type="lab" liveTabLabel="Bookings">
      <LabBookingsPanel />
    </PartnerDashboardShell>
  );
}
