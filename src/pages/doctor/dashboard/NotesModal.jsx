import { useState, useEffect, useRef } from "react";
import { showToast } from "../../../components/Toast";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API } from "./shared";

const emptyMedicine = { medicine_name:"", dosage:"", frequency:"", duration:"", instructions:"" };


export default function NotesModal({ appt, token, onClose, onSaved }) {
  const [notes, setNotes] = useState(appt.prescription || "");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [doctorCanSend, setDoctorCanSend] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);

  // Two ways to record the prescription: type out each medicine in the
  // structured form (default — keeps pharmacy hand-off working, since
  // that reads prescription_items), or upload a photo/scan of a
  // handwritten prescription instead, for a doctor who'd rather not
  // retype it. Either is saved independently — switching tabs doesn't
  // discard whichever one you've already filled in.
  const [mode, setMode] = useState("manual"); // "manual" | "image"
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const imageInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/appointments/${appt.id}/prescription-image`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        if (json.url) { setExistingImageUrl(json.url); setMode("image"); }
      } catch {}
    })();
  }, [appt.id]);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/pharmacy-settings`, { headers:{ Authorization:`Bearer ${token}` }});
        const json = await res.json();
        setDoctorCanSend(!!json.doctor_can_send);
      } catch {}
    })();
  }, []);

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

  const pickImage = (file) => {
    if (!file) return;
    setImageError("");
    const allowed = ["image/jpeg","image/png","image/webp","application/pdf"];
    if (!allowed.includes(file.type)) { setImageError("Only JPEG, PNG, WebP, or PDF files are allowed"); return; }
    if (file.size > 10*1024*1024) { setImageError("File must be under 10MB"); return; }
    setImageFile(file);
    setImagePreviewUrl(file.type === "application/pdf" ? null : URL.createObjectURL(file));
  };

  const saveImage = async () => {
    if (!imageFile) return;
    setUploadingImage(true);
    setImageError("");
    try {
      const fd = new FormData();
      fd.append("file", imageFile);
      const res  = await fetch(`${API}/appointments/${appt.id}/prescription-image`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}` }, body:fd,
      });
      const json = await res.json();
      if (!res.ok) { setImageError(json.detail || "Upload failed"); return; }
      setExistingImageUrl(json.url);
      setImageFile(null);
      setImagePreviewUrl(null);
      onSaved();
      onClose();
    } catch { setImageError("Upload failed"); }
    finally { setUploadingImage(false); }
  };

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
      if (doctorCanSend && validItems.length > 0) {
        setJustSaved(true); // stay open — offer to send straight to the pharmacy
      } else {
        onClose();
      }
    } catch { showToast("Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const sendToPharmacy = async () => {
    setSending(true);
    try {
      const res  = await fetch(`${API}/pharmacy/orders`, {
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
        body: JSON.stringify({ appointment_id: appt.id }),
      });
      const json = await res.json();
      if (!res.ok) { showToast(json.detail || "Failed to send to pharmacy", "error"); return; }
      setSent(true);
      showToast("Sent to pharmacy — patient will add delivery details before it ships", "success");
    } catch { showToast("Failed to send to pharmacy", "error"); }
    finally { setSending(false); }
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:2000,
      display:"flex",alignItems:"flex-end",justifyContent:"center",padding:0}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="Add Notes or Prescription"
        style={{background:"#fff",width:"100%",maxWidth:"500px",borderRadius:"18px 18px 0 0",
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

        {!justSaved && (
          <div style={{display:"flex",gap:"6px",marginBottom:"16px",background:"#f1f5f9",
            borderRadius:"9px",padding:"4px"}}>
            <button onClick={()=>setMode("manual")} style={{flex:1,padding:"8px",border:"none",
              borderRadius:"7px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
              fontSize:"12.5px",background:mode==="manual"?"#fff":"transparent",
              color:mode==="manual"?"#0b1f3a":"#64748b",
              boxShadow:mode==="manual"?"0 1px 3px rgba(0,0,0,.1)":"none"}}>
              📝 Type Medicines
            </button>
            <button onClick={()=>setMode("image")} style={{flex:1,padding:"8px",border:"none",
              borderRadius:"7px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
              fontSize:"12.5px",background:mode==="image"?"#fff":"transparent",
              color:mode==="image"?"#0b1f3a":"#64748b",
              boxShadow:mode==="image"?"0 1px 3px rgba(0,0,0,.1)":"none"}}>
              📷 Upload Prescription
            </button>
          </div>
        )}

        {mode==="image" && !justSaved ? (
          <div>
            {existingImageUrl && !imageFile && (
              <div style={{marginBottom:"14px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"700",
                  color:"#374151",marginBottom:"8px"}}>Currently uploaded</p>
                <a href={existingImageUrl} target="_blank" rel="noopener noreferrer"
                  style={{display:"block",border:"1px solid #e2eaf4",borderRadius:"9px",overflow:"hidden"}}>
                  <img src={existingImageUrl} alt="Prescription" style={{width:"100%",display:"block",maxHeight:"260px",objectFit:"contain",background:"#f8fafc"}}/>
                </a>
              </div>
            )}
            <input ref={imageInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf"
              style={{display:"none"}} onChange={e=>pickImage(e.target.files?.[0])}/>
            {imageFile ? (
              <div style={{border:"1px solid #e2eaf4",borderRadius:"9px",padding:"10px",marginBottom:"10px"}}>
                {imagePreviewUrl
                  ? <img src={imagePreviewUrl} alt="Preview" style={{width:"100%",maxHeight:"240px",objectFit:"contain",borderRadius:"7px",marginBottom:"8px"}}/>
                  : <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",color:"#374151",marginBottom:"8px"}}>📄 {imageFile.name}</p>}
                <button onClick={()=>{setImageFile(null);setImagePreviewUrl(null);}}
                  style={{background:"#fef2f2",border:"none",color:"#991b1b",borderRadius:"7px",
                    padding:"6px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600"}}>
                  Remove
                </button>
              </div>
            ) : (
              <button onClick={()=>imageInputRef.current?.click()} style={{width:"100%",
                border:"1.5px dashed #86efac",background:"#f0fdf4",borderRadius:"10px",
                padding:"28px 14px",cursor:"pointer",color:"#15803d",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"600",fontSize:"13px"}}>
                📷 {existingImageUrl ? "Upload a new prescription image" : "Choose a photo or PDF of the prescription"}
              </button>
            )}
            {imageError && <p style={{color:"#dc2626",fontSize:"12px",fontFamily:"'DM Sans',sans-serif",marginTop:"8px"}}>{imageError}</p>}
            <div style={{display:"flex",gap:"10px",marginTop:"16px"}}>
              <button onClick={saveImage} disabled={!imageFile || uploadingImage}
                style={{flex:1,background:"linear-gradient(135deg,#047857,#059669)",
                  color:"#fff",border:"none",borderRadius:"9px",padding:"12px",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
                  cursor:(!imageFile||uploadingImage)?"default":"pointer",
                  opacity:(!imageFile||uploadingImage)?0.6:1}}>
                {uploadingImage?"Uploading…":"Save & Complete →"}
              </button>
              <button onClick={onClose}
                style={{padding:"12px 18px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
                  background:"#fff",color:"#64748b",fontFamily:"'DM Sans',sans-serif",
                  fontSize:"14px",cursor:"pointer"}}>
                Cancel
              </button>
            </div>
          </div>
        ) : justSaved ? (
          <div style={{textAlign:"center",padding:"18px 4px"}}>
            <p style={{fontSize:"34px",margin:"0 0 8px"}}>{sent ? "✅" : "💊"}</p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"15px",
              color:"#0b1f3a",margin:"0 0 6px"}}>
              {sent ? "Sent to pharmacy" : "Notes saved"}
            </p>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px",color:"#6b7688",
              margin:"0 0 18px",lineHeight:1.6}}>
              {sent
                ? "The pharmacy can now start preparing the order. The patient will add their delivery address before it ships."
                : "Send this prescription straight to the pharmacy now, or leave it for the patient to send themselves."}
            </p>
            {!sent && (
              <button onClick={sendToPharmacy} disabled={sending}
                style={{width:"100%",background:"linear-gradient(135deg,#047857,#059669)",
                  color:"#fff",border:"none",borderRadius:"9px",padding:"12px",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",fontSize:"14px",
                  cursor:"pointer",marginBottom:"10px"}}>
                {sending ? "Sending…" : "💊 Send to Pharmacy"}
              </button>
            )}
            <button onClick={onClose}
              style={{width:"100%",padding:"11px",borderRadius:"9px",border:"1.5px solid #e2eaf4",
                background:"#fff",color:"#64748b",fontFamily:"'DM Sans',sans-serif",
                fontWeight:"600",fontSize:"13.5px",cursor:"pointer"}}>
              {sent ? "Done" : "Skip for now"}
            </button>
          </div>
        ) : (
        <>
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
        </>
        )}
      </div>
    </div>
  );
}
