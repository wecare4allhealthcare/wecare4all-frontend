/**
 * patient/Documents.jsx — upload and manage lab reports, scans, and
 * old prescriptions. A doctor can view these too, but only once they
 * have an appointment relationship with this patient (enforced
 * server-side in documents.py) — that side isn't built in this page,
 * it'll show up in the doctor's patient-history view.
 */
import { useEffect, useState, useRef } from "react";
import { showToast } from "../../components/Toast";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
.dc{font-family:'DM Sans',sans-serif;color:#1e293b;background:#f0f6fc;min-height:100vh;}
.dc *{box-sizing:border-box;} .dc a{text-decoration:none;}
.dc h1,.dc h2,.dc h3{font-family:'Cormorant Garamond',Georgia,serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.dc-card{background:#fff;border:1px solid #e2eaf4;border-radius:14px;padding:16px;margin-bottom:10px;}
.dc-inp{border:1.5px solid #e2eaf4;border-radius:9px;padding:9px 12px;
  font-family:'DM Sans',sans-serif;font-size:13.5px;background:#f8fafc;outline:none;}
.dc-btn{background:linear-gradient(135deg,#047857,#059669);color:#fff;
  font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;
  padding:11px 22px;border-radius:9px;border:none;cursor:pointer;
  box-shadow:0 4px 16px rgba(4,120,87,.30);transition:all .2s;}
.dc-btn:hover{transform:translateY(-1px);}
.dc-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
`;

const DOC_TYPES = [
  { value:"lab_report", label:"🧪 Lab Report" },
  { value:"scan", label:"🩻 Scan / Imaging" },
  { value:"prescription", label:"💊 Old Prescription" },
  { value:"other", label:"📄 Other" },
];
const TYPE_LABELS = Object.fromEntries(DOC_TYPES.map(t=>[t.value,t.label]));

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(0)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}

export default function Documents() {
  const [docs, setDocs] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [docType, setDocType] = useState("lab_report");
  const [forWhom, setForWhom] = useState("self");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("wc4a_token");

  const fetchDocs = async () => {
    try {
      const res = await fetch(`${API}/patient-documents`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      setDocs(json.documents || []);
    } catch { setDocs([]); }
  };

  useEffect(() => {
    document.title = "My Documents — We Care 4 'all'";
    fetchDocs();
    (async () => {
      try {
        const res = await fetch(`${API}/family-members`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        setFamilyMembers(json.family_members || []);
      } catch {}
    })();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");

    if (!["application/pdf","image/jpeg","image/png","image/webp"].includes(file.type)) {
      setErr("Only PDF, JPEG, PNG, or WebP files are allowed");
      e.target.value = "";
      return;
    }
    if (file.size > 10*1024*1024) {
      setErr("File must be under 10MB");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", docType);
      if (forWhom !== "self") formData.append("family_member_id", forWhom);

      const res = await fetch(`${API}/patient-documents`, {
        method: "POST",
        headers: { Authorization:`Bearer ${token}` }, // no Content-Type — browser sets the multipart boundary itself
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Upload failed");
      fetchDocs();
    } catch (ex) { setErr(ex.message); }
    finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res  = await fetch(`${API}/patient-documents/${doc.id}/download`, { headers:{ Authorization:`Bearer ${token}` }});
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Couldn't get download link");
      window.open(json.url, "_blank");
    } catch (ex) { showToast(ex.message, "info"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document permanently?")) return;
    try {
      await fetch(`${API}/patient-documents/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` }});
      fetchDocs();
    } catch {}
  };

  return (
    <div className="dc">
      <style>{G}</style>
      <div style={{maxWidth:"680px",margin:"0 auto",padding:"20px 16px 60px"}}>
        <Link to="/patient/dashboard" style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b"}}>← Back to Dashboard</Link>
        <h1 style={{fontSize:"28px",fontWeight:"700",color:"#0b1f3a",margin:"6px 0 4px"}}>My Documents</h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#64748b",marginBottom:"18px"}}>
          Lab reports, scans, and old prescriptions — viewable by a doctor once you have an appointment with them.
        </p>

        <div className="dc-card">
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"12px"}}>
            <select value={docType} onChange={e=>setDocType(e.target.value)} className="dc-inp">
              {DOC_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {familyMembers.length > 0 && (
              <select value={forWhom} onChange={e=>setForWhom(e.target.value)} className="dc-inp">
                <option value="self">For Myself</option>
                {familyMembers.map(m=><option key={m.id} value={m.id}>For {m.full_name}</option>)}
              </select>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect} disabled={uploading}
            style={{display:"none"}}/>
          <button onClick={()=>fileInputRef.current?.click()} disabled={uploading} className="dc-btn">
            {uploading ? "Uploading…" : "📤 Upload Document"}
          </button>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",color:"#6b7688",marginTop:"8px"}}>
            PDF, JPEG, PNG, or WebP — up to 10MB
          </p>
          {err && <p style={{color:"#dc2626",fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif",marginTop:"6px"}}>⚠ {err}</p>}
        </div>

        {docs===null ? (
          <div style={{textAlign:"center",padding:"30px"}}>
            <div style={{width:"24px",height:"24px",border:"3px solid #e2eaf4",borderTop:"3px solid #047857",
              borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto"}}/>
          </div>
        ) : docs.length===0 ? (
          <div className="dc-card" style={{textAlign:"center",padding:"30px",color:"#6b7688"}}>
            No documents uploaded yet.
          </div>
        ) : docs.map(d => (
          <div key={d.id} className="dc-card" style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
            <div>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"14px",color:"#0b1f3a",margin:0}}>
                {TYPE_LABELS[d.document_type] || "📄"} {d.file_name}
              </p>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11.5px",color:"#6b7688",margin:"3px 0 0"}}>
                {d.family_members?.full_name ? `For ${d.family_members.full_name} · ` : ""}
                {new Date(d.uploaded_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                {d.file_size_bytes ? ` · ${formatSize(d.file_size_bytes)}` : ""}
              </p>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>handleDownload(d)} style={{padding:"7px 14px",borderRadius:"7px",
                background:"#eff8ff",border:"1px solid #93c5fd",color:"#0369a1",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                Download
              </button>
              <button onClick={()=>handleDelete(d.id)} style={{padding:"7px 14px",borderRadius:"7px",
                background:"#fef2f2",border:"1px solid #fecaca",color:"#991b1b",
                fontFamily:"'DM Sans',sans-serif",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
