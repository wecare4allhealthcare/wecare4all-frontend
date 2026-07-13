import { useState, useEffect, useRef } from "react";
import { showToast } from "../../../components/Toast";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { API } from "./shared";

const emptyMedicine = { medicine_name:"", dosage:"", frequency:"", duration:"", instructions:"" };


export default function NotesModal({ appt, token, onClose, onSaved }) {
  const [notes, setNotes] = useState(appt.prescription || "");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const boxRef = useRef(null);
  useModalA11y(boxRef, onClose);

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
