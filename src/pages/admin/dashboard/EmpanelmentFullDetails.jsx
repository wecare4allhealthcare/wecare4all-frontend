
// ── Empanelment full details panel ───────────────────────────
export default function EmpanelmentFullDetails({ e }){
  const Row=({label,value})=>{
    if(value===null||value===undefined||value==="")return null;
    return(
      <div style={{display:"flex",padding:"6px 0",borderBottom:"1px solid #f1f5f9",
        fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px"}}>
        <div style={{width:"180px",flexShrink:0,color:"#94a3b8"}}>{label}</div>
        <div style={{color:"#1e293b",fontWeight:500,wordBreak:"break-word"}}>
          {Array.isArray(value)?value.join(", "):String(value)}
        </div>
      </div>
    );
  };
  const parseJ=(v)=>{
    if(!v)return null;
    if(Array.isArray(v))return v;
    try{const p=JSON.parse(v);return Array.isArray(p)?p:[String(p)];}
    catch{return [String(v)];}
  };
  const Section=({title,children})=>(
    <div style={{marginTop:"14px"}}>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"15px",
        fontWeight:700,color:"#0b1f3a",marginBottom:"4px"}}>{title}</div>
      {children}
    </div>
  );
  return(
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"10px",
      padding:"16px 20px",marginTop:"12px"}}>

      <Section title="🏥 Hospital Info">
        <Row label="Registration Number" value={e.reg_number}/>
        <Row label="Year Established" value={e.year_established}/>
        <Row label="Hospital Type" value={e.hospital_type}/>
        <Row label="Ownership" value={e.ownership}/>
        <Row label="Website" value={e.website}/>
      </Section>

      <Section title="👤 Contact">
        <Row label="Contact Person" value={e.contact_person}/>
        <Row label="Designation" value={e.designation}/>
        <Row label="Email" value={e.email}/>
        <Row label="Mobile" value={e.mobile}/>
        <Row label="Alt Mobile" value={e.alt_mobile}/>
      </Section>

      <Section title="📍 Address">
        <Row label="Address" value={e.address}/>
        <Row label="City" value={e.city}/>
        <Row label="District" value={e.district}/>
        <Row label="State" value={e.state}/>
        <Row label="Pincode" value={e.pincode}/>
        <Row label="Country" value={e.country}/>
      </Section>

      <Section title="📊 Capacity">
        <Row label="Total Beds" value={e.total_beds}/>
        <Row label="ICU Beds" value={e.icu_beds}/>
        <Row label="Doctors Count" value={e.doctors_count}/>
        <Row label="Nurses Count" value={e.nurses_count}/>
        <Row label="Annual Patients" value={e.annual_patients}/>
        <Row label="Avg Occupancy" value={e.avg_occupancy}/>
      </Section>

      <Section title="🏷️ Specialties & Infrastructure">
        <Row label="Specialties" value={parseJ(e.specialties)}/>
        <Row label="Infrastructure" value={parseJ(e.infrastructure)}/>
        <Row label="Accreditations" value={parseJ(e.accreditations)}/>
        <Row label="Key Specialists" value={parseJ(e.key_specialists)}/>
      </Section>

      <Section title="🛡️ Insurance">
        <Row label="Insurance Status" value={e.ins_status}/>
        <Row label="Insurance List" value={e.ins_list}/>
      </Section>

      <Section title="🌐 International Patients">
        <Row label="Treats International" value={e.treats_international?"Yes":"No"}/>
        <Row label="Interpreter Languages" value={e.interpreter_languages}/>
        <Row label="Visa Assistance" value={e.visa_assistance?"Yes":"No"}/>
        <Row label="Accommodation Assistance" value={e.accommodation_assistance?"Yes":"No"}/>
      </Section>

      <Section title="📝 About">
        <Row label="About Hospital" value={e.about_hospital}/>
      </Section>

      <Section title="✅ Declaration">
        <Row label="Declared By" value={e.declaration_name}/>
        <Row label="Designation" value={e.declaration_designation}/>
        <Row label="Confirmed" value={e.declaration_confirmed?"Yes":"No"}/>
        <Row label="Declaration Date" value={e.declaration_date ? new Date(e.declaration_date).toLocaleString("en-IN") : null}/>
      </Section>

    </div>
  );
}
