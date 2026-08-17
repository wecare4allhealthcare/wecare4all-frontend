import { useState, useEffect } from "react";
import { API, Spinner, SectionHead, DeleteButton } from "./shared";

/**
 * admin/dashboard/FlaggedAccounts.jsx — accounts an admin has flagged
 * (from the Patients tab) as "not actually a patient", almost always
 * a hospital/nursing home/clinic that signed up through the old
 * Hospital OTP portal before commit d8bbae4 removed it. That old flow
 * silently created a real Patient ID for them with portal_type left
 * at the 'healthcare' default, so there's no automatic way to tell
 * these apart from a genuine patient — hence the manual flag.
 *
 * Reuses GET /admin/patients (same data Patients.jsx already fetches)
 * rather than adding a second list endpoint, and just filters to
 * is_flagged_business === true. Fine at this dataset size (limit 200
 * on the shared endpoint).
 */
export default function FlaggedAccounts({ token }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/patients`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setData((json.patients || []).filter(p => p.is_flagged_business));
    } catch { setData([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const unflag = async (p) => {
    try {
      const res = await fetch(`${API}/admin/patients/${p.id}/flag-business`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(d => d.filter(x => x.id !== p.id));
      else alert("Couldn't unflag this account.");
    } catch { alert("Couldn't unflag this account."); }
  };

  return (
    <div>
      <SectionHead title="Flagged Accounts" count={data.length} />
      <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:"10px",
        padding:"10px 14px",marginBottom:"16px"}}>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#92400e",margin:0}}>
          Accounts here were flagged from the Patients tab as hospitals, nursing homes, or other
          businesses that ended up with a patient account by mistake (usually a leftover from
          before the Hospital OTP portal was removed). They're hidden from the Patients list.
          Unflag to send an account back to Patients, or delete it if it's not needed.
        </p>
      </div>

      {loading ? <Spinner /> : data.length === 0 ? (
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#6b7688"}}>
          No flagged accounts right now.
        </p>
      ) : data.map(p => (
        <div key={p.id} className="data-row">
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
            <div>
              <strong style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",color:"var(--wc-navy)"}}>
                {p.full_name || "—"}
              </strong>
              <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginTop:"4px"}}>
                {[p.email, p.mobile, p.created_at ? `Joined ${new Date(p.created_at).toLocaleDateString("en-IN")}` : null]
                  .filter(Boolean).map((v,i)=>(
                    <span key={i} style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",color:"var(--wc-muted)"}}>{v}</span>
                  ))}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0,flexWrap:"wrap"}}>
              <button onClick={()=>unflag(p)}
                style={{padding:"6px 14px",borderRadius:"8px",
                  background:"var(--wc-sage)",border:"1.5px solid #86efac",
                  color:"var(--wc-green)",fontFamily:"'DM Sans',sans-serif",
                  fontSize:"12px",fontWeight:"600",cursor:"pointer",whiteSpace:"nowrap"}}>
                ↩️ Unflag — send back to Patients
              </button>
              <DeleteButton small
                confirmText={`Permanently delete "${p.full_name||"this account"}"? This cannot be undone.`}
                onDelete={async()=>{
                  const res=await fetch(`${API}/admin/patients/${p.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
                  if(res.ok) setData(d=>d.filter(x=>x.id!==p.id)); else alert("Couldn't delete this account.");
                }}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
