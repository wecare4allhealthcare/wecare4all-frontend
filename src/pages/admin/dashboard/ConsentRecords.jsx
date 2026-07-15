import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { API, Spinner, SectionHead } from "./shared";

// ── CONSENT RECORDS ──────────────────────────────────────────
// Phase 12 started recording consent_accepted_at when a patient ticks
// the mandatory T&C/Privacy Policy/Patient Rights checkbox at login,
// but there was never a screen to actually view those records — only
// a raw database column reachable by direct query. This is that screen.
export default function ConsentRecords({ token }) {
  const { t } = useTranslation();
  const [records, setRecords]   = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState("");
  const [status,  setStatus]    = useState("all"); // all | consented | not_consented
  const [page,    setPage]      = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (p = 1, s = search, st = status) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), page_size: "25" });
      if (s) params.set("search", s);
      if (st !== "all") params.set("status", st);
      const res = await fetch(`${API}/admin/consent-records?${params}`,
        { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setRecords(json.records || []);
      setSummary(json.summary || null);
      setTotalPages(json.total_pages || 1);
      setPage(json.page || 1);
    } catch { setRecords([]); }
    finally { setLoading(false); }
  }, [search, status, token]);

  useEffect(() => { load(1, search, status); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = (e) => {
    e?.preventDefault();
    load(1, search, status);
  };

  return (
    <div>
      <SectionHead title={t("adminPages.consentRecords.heading")} count={summary?.total_patients ?? 0} />

      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: "#fff", border: "1px solid #e2eaf4", borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "#6b7688", fontWeight: 600 }}>{t("adminPages.consentRecords.totalPatients")}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 700, color: "#0b1f3a" }}>{summary.total_patients}</div>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "#15803d", fontWeight: 600 }}>{t("adminPages.consentRecords.consented")}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 700, color: "#15803d" }}>{summary.consented_count}</div>
          </div>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "#b91c1c", fontWeight: 600 }}>{t("adminPages.consentRecords.notYetConsented")}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "26px", fontWeight: 700, color: "#b91c1c" }}>{summary.not_consented_count}</div>
          </div>
        </div>
      )}

      <form onSubmit={applyFilters} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t("adminPages.consentRecords.searchPlaceholder")}
          style={{ flex: "1 1 220px", padding: "9px 12px", borderRadius: "8px",
            border: "1.5px solid #e2eaf4", fontFamily: "'DM Sans',sans-serif", fontSize: "13px" }} />
        <select value={status} onChange={e => { setStatus(e.target.value); load(1, search, e.target.value); }}
          style={{ padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #e2eaf4",
            fontFamily: "'DM Sans',sans-serif", fontSize: "13px", background: "#fff" }}>
          <option value="all">{t("adminPages.consentRecords.filterAll")}</option>
          <option value="consented">{t("adminPages.consentRecords.filterConsentedOnly")}</option>
          <option value="not_consented">{t("adminPages.consentRecords.filterNotConsentedOnly")}</option>
        </select>
        <button type="submit" className="ad-btn">{t("adminPages.consentRecords.search")}</button>
      </form>

      {loading ? <Spinner /> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#6b7688",
          fontFamily: "'DM Sans',sans-serif" }}>{t("adminPages.consentRecords.none")}</div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2eaf4", textAlign: "left" }}>
                  <th style={{ padding: "10px 8px", color: "#6b7688", fontWeight: 600 }}>{t("adminPages.consentRecords.colName")}</th>
                  <th style={{ padding: "10px 8px", color: "#6b7688", fontWeight: 600 }}>{t("adminPages.consentRecords.colContact")}</th>
                  <th style={{ padding: "10px 8px", color: "#6b7688", fontWeight: 600 }}>{t("adminPages.consentRecords.colPortal")}</th>
                  <th style={{ padding: "10px 8px", color: "#6b7688", fontWeight: 600 }}>{t("adminPages.consentRecords.colStatus")}</th>
                  <th style={{ padding: "10px 8px", color: "#6b7688", fontWeight: 600 }}>{t("adminPages.consentRecords.colAcceptedOn")}</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 8px", color: "#0b1f3a", fontWeight: 600 }}>{r.full_name || t("adminPages.shared.dash")}</td>
                    <td style={{ padding: "10px 8px", color: "#374151" }}>
                      <div>{r.email || t("adminPages.shared.dash")}</div>
                      <div style={{ color: "#6b7688", fontSize: "12px" }}>{r.mobile || ""}</div>
                    </td>
                    <td style={{ padding: "10px 8px", color: "#374151", textTransform: "capitalize" }}>{r.portal_type || "healthcare"}</td>
                    <td style={{ padding: "10px 8px" }}>
                      {r.consent_accepted_at ? (
                        <span style={{ background: "#dcfce7", color: "#15803d", padding: "3px 10px",
                          borderRadius: "12px", fontSize: "11.5px", fontWeight: 700 }}>{t("adminPages.consentRecords.consentedBadge")}</span>
                      ) : (
                        <span style={{ background: "#fee2e2", color: "#991b1b", padding: "3px 10px",
                          borderRadius: "12px", fontSize: "11.5px", fontWeight: 700 }}>{t("adminPages.consentRecords.notYetBadge")}</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 8px", color: "#6b7688" }}>
                      {r.consent_accepted_at
                        ? new Date(r.consent_accepted_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                        : t("adminPages.shared.dash")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "18px" }}>
              <button disabled={page <= 1} onClick={() => load(page - 1, search, status)}
                className="btn-sm btn-outline" style={{ opacity: page <= 1 ? 0.5 : 1 }}>{t("adminPages.consentRecords.prev")}</button>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#6b7688", alignSelf: "center" }}>
                {t("adminPages.consentRecords.pageOf",{page,total:totalPages})}
              </span>
              <button disabled={page >= totalPages} onClick={() => load(page + 1, search, status)}
                className="btn-sm btn-outline" style={{ opacity: page >= totalPages ? 0.5 : 1 }}>{t("adminPages.consentRecords.next")}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
