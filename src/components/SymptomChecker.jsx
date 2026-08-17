/**
 * components/SymptomChecker.jsx — "What's the problem?" quick-picker.
 *
 * Rebuilt from a free-text keyword-matching version (kept giving
 * false-positive matches — e.g. "heart" containing "ear" wrongly
 * suggesting ENT, "delivery" wrongly suggesting Gastroenterology via
 * "liver" — inherent risk with any substring/keyword matching on
 * open text, no matter how it's tuned).
 *
 * This version is a deterministic click-to-select list instead:
 * COMMON_PROBLEMS below is a curated, patient-friendly translation of
 * each real specialty in the system (fetched live from GET
 * /specialties, so it always matches actual bookable doctor
 * categories — never suggests a specialty that doesn't exist or
 * isn't currently active). Typing only ever *filters this visible
 * list* by substring — it can never "interpret" free text into a
 * wrong specialty, since nothing is inferred from what's typed.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Patient-friendly problem label -> exact specialty name as stored in
// the specialties table / used by the doctor list's ?specialization=
// filter. Kept as a static curated list (rather than pulled from the
// specialties table's own "description" field) because a specialty
// name like "Endocrinology" isn't itself patient-friendly — this is
// deliberately the translation layer between how a patient describes
// a problem and the clinical specialty name the system uses.
const COMMON_PROBLEMS = [
  { label: "Fever, Cold & Flu",              icon: "🤒", specialty: "General Medicine" },
  { label: "Body Ache / Weakness",           icon: "🤕", specialty: "General Medicine" },
  { label: "Diabetes / Blood Sugar",         icon: "💉", specialty: "Diabetologist" },
  { label: "Child's Health / Vaccination",   icon: "🧒", specialty: "Paediatrics" },
  { label: "Chest Pain / Heart Concerns",    icon: "❤️", specialty: "Cardiology" },
  { label: "Headache / Migraine",            icon: "🧠", specialty: "Neurology" },
  { label: "Dizziness / Numbness / Memory",  icon: "🧠", specialty: "Neurology" },
  { label: "Joint / Back / Knee Pain",       icon: "🦴", specialty: "Orthopaedics" },
  { label: "Fracture / Sprain",              icon: "🦴", specialty: "Orthopaedics" },
  { label: "Lump / Tumour Concerns",         icon: "🎗️", specialty: "Oncology" },
  { label: "Stomach Pain / Acidity",         icon: "🍽️", specialty: "Gastroenterology" },
  { label: "Digestion / Liver Issues",       icon: "🍽️", specialty: "Gastroenterology" },
  { label: "Skin Rash / Allergy / Acne",     icon: "🧴", specialty: "Dermatology & Cosmetology" },
  { label: "Hair Fall",                      icon: "🧴", specialty: "Dermatology & Cosmetology" },
  { label: "Pregnancy / Women's Health",     icon: "🤰", specialty: "Gynaecology" },
  { label: "Periods / PCOD-PCOS",            icon: "🤰", specialty: "Gynaecology" },
  { label: "Anxiety / Stress / Sleep",       icon: "🧘", specialty: "Psychiatry" },
  { label: "Urine / Kidney Stone / Prostate",icon: "🫘", specialty: "Urology" },
  { label: "Physiotherapy / Mobility",       icon: "🤸", specialty: "Physiotherapy" },
  { label: "Breathing Trouble / Asthma",     icon: "🫁", specialty: "Pulmonology" },
  { label: "Kidney Concerns",                icon: "🫘", specialty: "Nephrology" },
  { label: "Thyroid / Hormone / Weight",     icon: "⚖️", specialty: "Endocrinology" },
  { label: "Eye / Vision Problems",          icon: "👁️", specialty: "Ophthalmology" },
  { label: "Ear / Nose / Throat",            icon: "👂", specialty: "ENT" },
  { label: "Joint Swelling / Autoimmune",    icon: "🦵", specialty: "Rheumatology" },
  { label: "Surgery Consultation",           icon: "🏥", specialty: "General Surgery" },
];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [availableSpecialties, setAvailableSpecialties] = useState(null); // null = not loaded yet
  const [introDone, setIntroDone] = useState(false); // true once the initial "show the label" period has passed
  const [hovering, setHovering] = useState(false);

  // Show the full "What's the problem?" label for a few seconds on
  // first load — enough to register what the button does — then
  // collapse to a compact icon so it stops competing for space with
  // page content below it (e.g. the homepage's own "Book Appointment"
  // button sits close by). Hovering/tapping still re-expands it.
  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const expanded = open || hovering || !introDone;

  // Only ever used to filter which real specialties this list is
  // allowed to link to — if a specialty has been deactivated by
  // admin, its problems quietly drop out of the list rather than
  // linking to an empty doctor search.
  useEffect(() => {
    if (!open || availableSpecialties) return;
    (async () => {
      try {
        const res = await fetch(`${API}/specialties`);
        const json = await res.json();
        setAvailableSpecialties(new Set((json.specialties || []).map((s) => s.name)));
      } catch { setAvailableSpecialties(new Set()); }
    })();
  }, [open]);

  const visibleProblems = COMMON_PROBLEMS.filter((p) => {
    if (availableSpecialties && availableSpecialties.size > 0 && !availableSpecialties.has(p.specialty)) return false;
    if (!search.trim()) return true;
    return p.label.toLowerCase().includes(search.trim().toLowerCase());
  });

  const goToDoctors = (specialty) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialty)}`);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      <style>{``}</style>

      {/* Floating trigger — shows the "What's the problem?" label
          briefly on load, then collapses to a compact icon so it
          doesn't crowd nearby page content; hovering/tapping expands
          it again. */}
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-label="What's the problem? Find the right doctor"
        title="What's the problem? Tap to find the right doctor"
        style={{
          position: "fixed", bottom: "24px", left: "20px", zIndex: 998,
          height: "52px", padding: expanded ? (open ? "0 18px" : "0 20px 0 16px") : 0,
          width: expanded ? "auto" : "52px",
          borderRadius: "30px", border: "none",
          background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", color: "#fff",
          cursor: "pointer", boxShadow: "0 6px 20px rgba(91,158,50,.4)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: expanded ? "9px" : 0,
          fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: "13.5px",
          whiteSpace: "nowrap", overflow: "hidden",
          transition: "width .3s ease, padding .3s ease, gap .3s ease",
        }}
      >
        <span style={{ fontSize: "22px", flexShrink: 0 }}>{open ? "✕" : "🩺"}</span>
        {!open && expanded && <span>What's the problem?</span>}
      </button>

      {open && (
        <div style={{
          position: "fixed", bottom: "84px", left: "20px", zIndex: 998,
          width: "min(360px, calc(100vw - 40px))", maxHeight: "72vh", display: "flex", flexDirection: "column",
          background: "#fff", borderRadius: "16px", boxShadow: "0 12px 40px rgba(0,0,0,.25)",
          fontFamily: "'Inter',sans-serif", border: "1px solid var(--wc-border)", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))", padding: "16px 18px", flexShrink: 0 }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>🩺 What's the problem?</p>
            <p style={{ color: "rgba(255,255,255,.85)", fontSize: 11.5, margin: "3px 0 0" }}>
              Tap what matches — we'll show you the right kind of doctor.
            </p>
          </div>

          {/* Search box — filters the visible list only, never
              interprets free text into a specialty. */}
          <div style={{ padding: "12px 16px 8px", flexShrink: 0 }}>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search (e.g. fever, skin, back pain…)"
              style={{ width: "100%", border: "1.5px solid var(--wc-border)", borderRadius: 9, padding: "9px 12px",
                fontFamily: "'Inter',sans-serif", fontSize: 13, outline: "none" }}
            />
          </div>

          {/* Problem list */}
          <div style={{ overflowY: "auto", padding: "4px 12px 12px" }}>
            {visibleProblems.length === 0 ? (
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "20px 8px" }}>
                No match — try a different word, or browse all doctors directly.
              </p>
            ) : visibleProblems.map((p) => (
              <button key={p.label} onClick={() => goToDoctors(p.specialty)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                background: "var(--wc-warm-white)", border: "1px solid #f1f5f9", borderRadius: 10,
                padding: "10px 12px", marginBottom: 6, cursor: "pointer" }}>
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--wc-navy)" }}>{p.label}</span>
                <span style={{ color: "var(--wc-green)", fontSize: 13 }}>→</span>
              </button>
            ))}
          </div>

          <p style={{ fontSize: 10, color: "#cbd5e1", textAlign: "center", padding: "0 16px 14px", margin: 0, flexShrink: 0 }}>
            This helps you find the right specialty — it isn't a diagnosis. For emergencies, call your nearest hospital directly.
          </p>
        </div>
      )}
    </>
  );
}
