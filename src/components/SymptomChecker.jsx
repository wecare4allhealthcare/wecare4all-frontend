/**
 * components/SymptomChecker.jsx — Floating "What's wrong?" widget that
 * suggests a specialty from symptom keywords and links straight into
 * /doctors?specialization=X. Deliberately rule-based (keyword
 * matching), not an AI API call — zero ongoing cost, zero external
 * dependency, and good enough for "which kind of doctor do I need"
 * (as opposed to actual diagnosis, which this explicitly is not).
 *
 * Positioned bottom-left so it doesn't collide with FloatingFAQ
 * (bottom-right) — both can be on screen at once without overlapping.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Keyword → specialty map. Keys are matched as substrings against the
// lowercased symptom text, so e.g. "chest pain" matches "chest" AND
// "pain" as two separate hits — a symptom can and often should map to
// more than one plausible specialty (chest pain → Cardiology AND
// General Medicine, since it's not always cardiac).
const SYMPTOM_MAP = [
  { keywords: ["chest pain", "chest tightness", "palpitation", "heart"], specialty: "Cardiology", icon: "❤️" },
  { keywords: ["fever", "cold", "cough", "flu", "body ache", "weakness", "tired", "fatigue"], specialty: "General Medicine", icon: "🩺" },
  { keywords: ["sugar", "diabetes", "thirst", "frequent urination"], specialty: "Diabetologist", icon: "💉" },
  { keywords: ["child", "baby", "infant", "kid fever", "vaccination"], specialty: "Paediatrician", icon: "🧒" },
  { keywords: ["headache", "migraine", "seizure", "numbness", "dizziness", "memory"], specialty: "Neurology", icon: "🧠" },
  { keywords: ["joint pain", "back pain", "knee pain", "fracture", "bone", "sprain", "arthritis"], specialty: "Orthopaedics", icon: "🦴" },
  { keywords: ["lump", "tumor", "tumour", "cancer", "biopsy"], specialty: "Oncology", icon: "🎗️" },
  { keywords: ["stomach", "acidity", "vomiting", "diarrhea", "diarrhoea", "constipation", "digestion", "liver"], specialty: "Gastroenterology", icon: "🍽️" },
  { keywords: ["skin", "rash", "itching", "acne", "allergy", "hair fall"], specialty: "Dermatology", icon: "🧴" },
  { keywords: ["pregnancy", "period", "menstrual", "pcod", "pcos", "gynaec"], specialty: "Gynaecology", icon: "🤰" },
  { keywords: ["anxiety", "depression", "stress", "sleep", "insomnia", "mood", "panic"], specialty: "Psychiatry", icon: "🧘" },
  { keywords: ["urine", "kidney stone", "prostate", "bladder"], specialty: "Urology", icon: "🫘" },
  { keywords: ["physio", "muscle weakness", "mobility", "rehab"], specialty: "Physiotherapy", icon: "🤸" },
  { keywords: ["breathless", "breathing", "asthma", "wheeze", "lungs"], specialty: "Pulmonology", icon: "🫁" },
  { keywords: ["kidney", "creatinine", "dialysis"], specialty: "Nephrology", icon: "🫘" },
  { keywords: ["thyroid", "hormone", "weight gain", "weight loss"], specialty: "Endocrinology", icon: "⚖️" },
  { keywords: ["eye", "vision", "blurry", "cataract", "glasses"], specialty: "Ophthalmology", icon: "👁️" },
  { keywords: ["ear", "nose", "throat", "sinus", "tonsil", "hearing"], specialty: "ENT", icon: "👂" },
  { keywords: ["joint swelling", "autoimmune", "lupus"], specialty: "Rheumatology", icon: "🦵" },
  { keywords: ["surgery", "hernia", "gallbladder", "appendix"], specialty: "General Surgery", icon: "🏥" },
];

const QUICK_CHIPS = ["Fever & cold", "Chest pain", "Headache", "Stomach pain", "Skin rash", "Joint pain", "Child's health", "Anxiety/stress"];

function matchSpecialties(text) {
  const t = text.toLowerCase();
  const hits = new Map();
  for (const entry of SYMPTOM_MAP) {
    for (const kw of entry.keywords) {
      if (t.includes(kw)) {
        hits.set(entry.specialty, entry.icon);
        break;
      }
    }
  }
  return Array.from(hits.entries()).map(([specialty, icon]) => ({ specialty, icon }));
}

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [results, setResults] = useState(null); // null = not searched yet, [] = no match

  const check = (queryText) => {
    const q = queryText ?? text;
    if (!q.trim()) return;
    setText(q);
    setResults(matchSpecialties(q));
  };

  const goToDoctors = (specialty) => {
    navigate(`/doctors?specialization=${encodeURIComponent(specialty)}`);
    setOpen(false);
  };

  const reset = () => { setText(""); setResults(null); };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Floating trigger button — bottom-left, mirrors FloatingFAQ's bottom-right positioning */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Symptom Checker"
        style={{
          position: "fixed", bottom: "24px", left: "20px", zIndex: 998,
          width: "56px", height: "56px", borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg,#0369a1,#0284c7)", color: "#fff",
          fontSize: "24px", cursor: "pointer", boxShadow: "0 6px 20px rgba(3,105,161,.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {open ? "✕" : "🩺"}
      </button>

      {open && (
        <div style={{
          position: "fixed", bottom: "92px", left: "20px", zIndex: 998,
          width: "min(340px, calc(100vw - 40px))", maxHeight: "70vh", overflowY: "auto",
          background: "#fff", borderRadius: "16px", boxShadow: "0 12px 40px rgba(0,0,0,.25)",
          fontFamily: "'DM Sans',sans-serif", border: "1px solid #e2eaf4",
        }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#0369a1,#0284c7)", padding: "16px 18px", borderRadius: "16px 16px 0 0" }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>🩺 Symptom Checker</p>
            <p style={{ color: "rgba(255,255,255,.8)", fontSize: 11.5, margin: "3px 0 0" }}>
              Tell us what's wrong — we'll suggest the right kind of doctor.
            </p>
          </div>

          <div style={{ padding: "16px 18px" }}>
            {!results ? (
              <>
                <textarea
                  value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. I have a fever and body ache since yesterday…"
                  rows={3}
                  style={{ width: "100%", border: "1.5px solid #e2eaf4", borderRadius: 10, padding: "10px 12px",
                    fontFamily: "'DM Sans',sans-serif", fontSize: 13.5, resize: "vertical", outline: "none", marginBottom: 10 }}
                />
                <button onClick={() => check()} disabled={!text.trim()} style={{
                  width: "100%", background: "linear-gradient(135deg,#0369a1,#0284c7)", color: "#fff", border: "none",
                  borderRadius: 9, padding: "11px", fontWeight: 700, fontSize: 13.5, cursor: text.trim() ? "pointer" : "default",
                  opacity: text.trim() ? 1 : 0.5, marginBottom: 14 }}>
                  Check Symptoms
                </button>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 8px" }}>Or pick one that matches:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {QUICK_CHIPS.map((c) => (
                    <button key={c} onClick={() => check(c)} style={{
                      background: "#eff8ff", border: "1px solid #bae6fd", color: "#0369a1", borderRadius: 20,
                      padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic", margin: "0 0 12px" }}>"{text}"</p>
                {results.length === 0 ? (
                  <div>
                    <p style={{ fontSize: 13.5, color: "#374151", marginBottom: 12 }}>
                      We couldn't match that to a specific specialty — a General Medicine doctor is a safe place to start for most symptoms.
                    </p>
                    <button onClick={() => goToDoctors("General Medicine")} style={{
                      width: "100%", background: "linear-gradient(135deg,#047857,#059669)", color: "#fff", border: "none",
                      borderRadius: 9, padding: "11px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 8 }}>
                      🩺 Find a General Medicine Doctor
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0b1f3a", marginBottom: 10 }}>
                      Based on what you shared, these specialists may help:
                    </p>
                    {results.map(({ specialty, icon }) => (
                      <button key={specialty} onClick={() => goToDoctors(specialty)} style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                        background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10,
                        padding: "11px 14px", marginBottom: 8, cursor: "pointer" }}>
                        <span style={{ fontSize: 20 }}>{icon}</span>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#15803d" }}>{specialty}</span>
                        <span style={{ color: "#15803d", fontSize: 13 }}>→</span>
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={reset} style={{
                  width: "100%", background: "none", border: "1.5px solid #e2eaf4", color: "#64748b",
                  borderRadius: 9, padding: "9px", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
                  ← Try a different symptom
                </button>
              </>
            )}
            <p style={{ fontSize: 10, color: "#cbd5e1", textAlign: "center", marginTop: 12, marginBottom: 0 }}>
              This suggests a specialty only — it isn't a diagnosis. For emergencies, call your nearest hospital directly.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
