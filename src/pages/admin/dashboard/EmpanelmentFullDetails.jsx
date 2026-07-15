import { useTranslation } from "react-i18next";

// ── Empanelment full details panel ───────────────────────────
export default function EmpanelmentFullDetails({ e }){
  const { t } = useTranslation();
  const Row=({label,value})=>{
    if(value===null||value===undefined||value==="")return null;
    return(
      <div style={{display:"flex",padding:"6px 0",borderBottom:"1px solid #f1f5f9",
        fontFamily:"'DM Sans',sans-serif",fontSize:"12.5px"}}>
        <div style={{width:"180px",flexShrink:0,color:"#6b7688"}}>{label}</div>
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
  const yn = (v) => v ? t("adminPages.empanelmentDetails.yes") : t("adminPages.empanelmentDetails.no");
  return(
    <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"10px",
      padding:"16px 20px",marginTop:"12px"}}>

      <Section title={t("adminPages.empanelmentDetails.hospitalInfo")}>
        <Row label={t("adminPages.empanelmentDetails.regNumber")} value={e.reg_number}/>
        <Row label={t("adminPages.empanelmentDetails.yearEstablished")} value={e.year_established}/>
        <Row label={t("adminPages.empanelmentDetails.hospitalType")} value={e.hospital_type}/>
        <Row label={t("adminPages.empanelmentDetails.ownership")} value={e.ownership}/>
        <Row label={t("adminPages.empanelmentDetails.website")} value={e.website}/>
      </Section>

      <Section title={t("adminPages.empanelmentDetails.contact")}>
        <Row label={t("adminPages.empanelmentDetails.contactPerson")} value={e.contact_person}/>
        <Row label={t("adminPages.empanelmentDetails.designation")} value={e.designation}/>
        <Row label={t("adminPages.empanelmentDetails.email")} value={e.email}/>
        <Row label={t("adminPages.empanelmentDetails.mobile")} value={e.mobile}/>
        <Row label={t("adminPages.empanelmentDetails.altMobile")} value={e.alt_mobile}/>
      </Section>

      <Section title={t("adminPages.empanelmentDetails.address")}>
        <Row label={t("adminPages.empanelmentDetails.addressLabel")} value={e.address}/>
        <Row label={t("adminPages.empanelmentDetails.city")} value={e.city}/>
        <Row label={t("adminPages.empanelmentDetails.district")} value={e.district}/>
        <Row label={t("adminPages.empanelmentDetails.state")} value={e.state}/>
        <Row label={t("adminPages.empanelmentDetails.pincode")} value={e.pincode}/>
        <Row label={t("adminPages.empanelmentDetails.country")} value={e.country}/>
      </Section>

      <Section title={t("adminPages.empanelmentDetails.capacity")}>
        <Row label={t("adminPages.empanelmentDetails.totalBeds")} value={e.total_beds}/>
        <Row label={t("adminPages.empanelmentDetails.icuBeds")} value={e.icu_beds}/>
        <Row label={t("adminPages.empanelmentDetails.doctorsCount")} value={e.doctors_count}/>
        <Row label={t("adminPages.empanelmentDetails.nursesCount")} value={e.nurses_count}/>
        <Row label={t("adminPages.empanelmentDetails.annualPatients")} value={e.annual_patients}/>
        <Row label={t("adminPages.empanelmentDetails.avgOccupancy")} value={e.avg_occupancy}/>
      </Section>

      <Section title={t("adminPages.empanelmentDetails.specialtiesInfra")}>
        <Row label={t("adminPages.empanelmentDetails.specialties")} value={parseJ(e.specialties)}/>
        <Row label={t("adminPages.empanelmentDetails.infrastructure")} value={parseJ(e.infrastructure)}/>
        <Row label={t("adminPages.empanelmentDetails.accreditations")} value={parseJ(e.accreditations)}/>
        <Row label={t("adminPages.empanelmentDetails.keySpecialists")} value={parseJ(e.key_specialists)}/>
      </Section>

      <Section title={t("adminPages.empanelmentDetails.insurance")}>
        <Row label={t("adminPages.empanelmentDetails.insuranceStatus")} value={e.ins_status}/>
        <Row label={t("adminPages.empanelmentDetails.insuranceList")} value={e.ins_list}/>
      </Section>

      <Section title={t("adminPages.empanelmentDetails.international")}>
        <Row label={t("adminPages.empanelmentDetails.treatsInternational")} value={e.treats_international?yn(true):yn(false)}/>
        <Row label={t("adminPages.empanelmentDetails.interpreterLanguages")} value={e.interpreter_languages}/>
        <Row label={t("adminPages.empanelmentDetails.visaAssistance")} value={e.visa_assistance?yn(true):yn(false)}/>
        <Row label={t("adminPages.empanelmentDetails.accommodationAssistance")} value={e.accommodation_assistance?yn(true):yn(false)}/>
      </Section>

      <Section title={t("adminPages.empanelmentDetails.about")}>
        <Row label={t("adminPages.empanelmentDetails.aboutHospital")} value={e.about_hospital}/>
      </Section>

      <Section title={t("adminPages.empanelmentDetails.declaration")}>
        <Row label={t("adminPages.empanelmentDetails.declaredBy")} value={e.declaration_name}/>
        <Row label={t("adminPages.empanelmentDetails.designation")} value={e.declaration_designation}/>
        <Row label={t("adminPages.empanelmentDetails.confirmed")} value={e.declaration_confirmed?yn(true):yn(false)}/>
        <Row label={t("adminPages.empanelmentDetails.declarationDate")} value={e.declaration_date ? new Date(e.declaration_date).toLocaleString("en-IN") : null}/>
      </Section>

    </div>
  );
}
