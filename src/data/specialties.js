/**
 * specialties.js — data source for the dedicated SEO specialty pages
 * (/specialties/:slug), built per web-analysis recommendation (Aug 2026):
 * "Turn the list of 18 medical specialties into clickable links leading
 * to dedicated SEO pages. Optimize these pages for keywords like
 * 'Online [Specialist] Consultation in Chennai.'"
 *
 * ⚠️ CLIENT / MEDICAL REVIEW REQUIRED BEFORE THIS CONTENT GOES LIVE ⚠️
 * Every "intro", "whenToConsult", "conditions", and "faq" string below
 * was drafted by Claude (AI), not a licensed doctor. It's written to be
 * generic, cautious, and non-diagnostic on purpose (no dosages, no
 * treatment guarantees, no "this cures X" claims), but it is still
 * medical-adjacent content on a live healthcare platform — a doctor on
 * your team (or one of your empanelled specialists) should read through
 * each entry once before it's published. Flag anything that needs a
 * correction and it can be edited directly in this file — every page
 * pulls from here, so there's no duplicated content to fix in multiple
 * places.
 *
 * Each entry:
 *   slug        — URL segment → /specialties/{slug}
 *   name        — must exactly match the specialization value used in
 *                  the backend `doctors` table / GET /doctors?specialization=
 *                  filter, or the live doctor list on the page will come
 *                  back empty even when doctors exist.
 *   icon        — same emoji used in Home.jsx's specialty chips (SPEC_ICONS)
 *   metaTitle / metaDescription — the actual <title> and meta description
 *                  Google shows in search results; this is the whole
 *                  point of this feature, keep the target keyword
 *                  ("Online X Consultation in Chennai") near the front.
 *   intro       — 1 short paragraph shown at the top of the page.
 *   whenToConsult — bullet list, generic reasons to see this specialist.
 *   conditions  — bullet list, conditions commonly associated with this
 *                  specialty (NOT a diagnostic claim — phrased as "care
 *                  for" / "support for", not "we treat/cure").
 *   faq         — 3 short Q&A pairs specific to this specialty.
 */

export const SPECIALTIES = [
  {
    slug: "cardiology",
    name: "Cardiology",
    icon: "❤️",
    metaTitle: "Online Cardiology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online cardiology consultation in Chennai with verified cardiologists. Discuss chest pain, blood pressure, cholesterol, and heart health from home.",
    intro: "Cardiology covers the diagnosis and ongoing care of conditions affecting the heart and blood vessels. Our verified cardiologists are available for online video consultations, in-person visits, and home healthcare across Chennai — useful for a first opinion, a routine follow-up, or reviewing recent test reports without a hospital visit.",
    whenToConsult: [
      "Chest discomfort, tightness, or pain",
      "Persistent high blood pressure readings",
      "Unusual shortness of breath or fatigue",
      "Family history of heart disease",
      "Irregular heartbeat or palpitations",
      "Reviewing an ECG, echo, or lipid profile report",
    ],
    conditions: [
      "Hypertension (high blood pressure)",
      "Coronary artery disease",
      "Arrhythmia (irregular heartbeat)",
      "Cholesterol management",
      "Post-cardiac-event follow-up care",
      "Heart failure monitoring",
    ],
    faq: [
      { q: "Can a cardiologist review my ECG or echo report online?", a: "Yes — upload your report as a document before or during your video consultation and the cardiologist can review it with you and explain the findings." },
      { q: "Is an online cardiology consultation suitable for chest pain?", a: "For sudden, severe chest pain, go to the nearest emergency room immediately — don't wait for an online appointment. Online consultations are appropriate for ongoing monitoring, follow-ups, and non-emergency concerns." },
      { q: "Can I book a home visit for blood pressure monitoring?", a: "Yes, our Home Healthcare service includes vitals monitoring and can be booked directly from the Home Healthcare page." },
    ],
  },
  {
    slug: "neurology",
    name: "Neurology",
    icon: "🧠",
    metaTitle: "Online Neurology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a neurologist online in Chennai for headaches, migraines, dizziness, memory concerns, or nerve-related symptoms — video, in-person, or home visits.",
    intro: "Neurology addresses conditions of the brain, spinal cord, and nervous system. Our neurologists offer online video consultations and in-person appointments in Chennai for symptoms ranging from recurring headaches to nerve-related discomfort, plus follow-up care for ongoing neurological conditions.",
    whenToConsult: [
      "Frequent or severe headaches and migraines",
      "Unexplained dizziness or balance issues",
      "Numbness, tingling, or weakness in limbs",
      "Memory or concentration difficulties",
      "Seizures or unusual episodes",
      "Follow-up after a neurological diagnosis",
    ],
    conditions: [
      "Migraine and chronic headache",
      "Epilepsy and seizure disorders",
      "Peripheral neuropathy",
      "Stroke follow-up care",
      "Parkinson's disease management",
      "Sleep-related neurological concerns",
    ],
    faq: [
      { q: "Can migraines be managed through online consultations?", a: "Yes — many patients manage ongoing migraine care through video follow-ups after an initial evaluation, adjusting care based on symptom patterns." },
      { q: "What if I have sudden weakness on one side of my body?", a: "This can be a sign of a medical emergency — go to the nearest emergency room immediately rather than booking an online appointment." },
      { q: "Do I need to bring past scan reports to my consultation?", a: "Yes, uploading any MRI, CT, or EEG reports beforehand helps the neurologist review your history more thoroughly during the call." },
    ],
  },
  {
    slug: "orthopaedics",
    name: "Orthopaedics",
    icon: "🦴",
    metaTitle: "Online Orthopaedics Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online orthopaedic consultation in Chennai for joint pain, back pain, fractures, or sports injuries with verified orthopaedic specialists.",
    intro: "Orthopaedics covers the bones, joints, ligaments, and muscles. Our orthopaedic specialists are available for online consultations, in-person visits, and home healthcare across Chennai — helpful for joint pain, back pain, post-injury follow-ups, and reviewing X-ray or MRI reports.",
    whenToConsult: [
      "Persistent joint or back pain",
      "Recent sports or accidental injury",
      "Swelling, stiffness, or reduced mobility",
      "Post-fracture or post-surgery follow-up",
      "Reviewing an X-ray or MRI report",
      "Chronic knee, hip, or shoulder discomfort",
    ],
    conditions: [
      "Arthritis and joint pain",
      "Back and spine-related discomfort",
      "Sports injuries",
      "Fracture follow-up care",
      "Ligament and tendon concerns",
      "Post-surgical orthopaedic recovery",
    ],
    faq: [
      { q: "Can an orthopaedic issue be assessed over video?", a: "An online consultation is useful for a first opinion, reviewing reports, and follow-ups, but a physical examination or in-person visit may be needed for a full assessment of injuries." },
      { q: "Do you offer physiotherapy alongside orthopaedic care?", a: "Yes — our Home Healthcare service includes physiotherapy, which many patients combine with ongoing orthopaedic follow-up." },
      { q: "Can I book a home visit if I can't travel due to a leg injury?", a: "Yes, home visits for both doctor consultations and physiotherapy can be booked from the Home Healthcare page." },
    ],
  },
  {
    slug: "oncology",
    name: "Oncology",
    icon: "🎗️",
    metaTitle: "Online Oncology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Connect with oncology specialists in Chennai for a second opinion, report review, or ongoing follow-up care through online or in-person consultations.",
    intro: "Oncology focuses on the care and ongoing management of cancer. Our platform connects patients with oncology specialists for second opinions, review of diagnostic reports, and follow-up consultations — supporting patients and families through video calls, in-person visits, or coordination with our partner hospitals.",
    whenToConsult: [
      "Seeking a second opinion on a diagnosis",
      "Reviewing biopsy or imaging reports",
      "Follow-up during or after treatment",
      "Questions about symptoms or side effects",
      "Coordinating care with a partner hospital",
      "Family support and care planning discussions",
    ],
    conditions: [
      "Second-opinion consultations",
      "Treatment follow-up support",
      "Report and diagnosis review",
      "Ongoing symptom monitoring",
      "Referral coordination with partner hospitals",
    ],
    faq: [
      { q: "Can I get a second opinion online before starting treatment?", a: "Yes — upload your existing reports and an oncology specialist can review them with you over a video consultation." },
      { q: "Do you coordinate with hospitals for cancer treatment?", a: "We can help connect you with our partner hospitals for treatments that require in-person, hospital-based care." },
      { q: "Is emotional/family support available during this process?", a: "Our care team can help guide you toward appropriate support resources — speak with your specialist about what's available for your situation." },
    ],
  },
  {
    slug: "ophthalmology",
    name: "Ophthalmology",
    icon: "👁️",
    metaTitle: "Online Ophthalmology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online eye consultation in Chennai for vision concerns, eye irritation, or routine eye check-ups with verified ophthalmologists.",
    intro: "Ophthalmology covers eye health and vision care. Our ophthalmologists offer online consultations for general eye concerns and follow-ups, along with in-person visits for examinations that need specialized equipment, across Chennai.",
    whenToConsult: [
      "Blurred or reduced vision",
      "Eye redness, irritation, or discharge",
      "Frequent headaches linked to eye strain",
      "Routine vision check-up",
      "Follow-up after eye surgery",
      "Reviewing a prescription or eye test report",
    ],
    conditions: [
      "Refractive errors (near/far-sightedness)",
      "Conjunctivitis and eye infections",
      "Dry eye syndrome",
      "Cataract follow-up and referral",
      "Diabetic eye check-up guidance",
    ],
    faq: [
      { q: "Can an eye number/prescription check be done online?", a: "An online consultation can review symptoms and existing prescriptions, but a full vision test typically needs an in-person visit with proper equipment." },
      { q: "What if I have sudden vision loss?", a: "Sudden vision loss needs urgent in-person medical attention — please visit an emergency room or eye hospital directly rather than waiting for an online appointment." },
      { q: "Can I consult about eye redness without visiting a clinic?", a: "Yes, general eye irritation and redness can often be assessed over video, with in-person follow-up recommended if needed." },
    ],
  },
  {
    slug: "ent",
    name: "ENT",
    icon: "👂",
    metaTitle: "Online ENT Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult an ENT (Ear, Nose & Throat) specialist online in Chennai for sinus issues, hearing concerns, throat infections, and more.",
    intro: "ENT (Ear, Nose & Throat) specialists care for conditions affecting hearing, breathing, and the throat. Our ENT doctors are available online and in-person across Chennai for common concerns like sinus issues, throat infections, and hearing-related questions.",
    whenToConsult: [
      "Persistent sinus congestion or pressure",
      "Sore throat or difficulty swallowing",
      "Ear pain or reduced hearing",
      "Chronic cough or throat irritation",
      "Snoring or breathing concerns",
      "Recurring ear infections",
    ],
    conditions: [
      "Sinusitis",
      "Tonsillitis and throat infections",
      "Ear infections",
      "Hearing-related concerns",
      "Allergic rhinitis",
    ],
    faq: [
      { q: "Can sinus problems be treated through an online consultation?", a: "An ENT specialist can assess symptoms and guide initial care online; some cases may need an in-person exam depending on severity." },
      { q: "Can hearing loss be discussed in a video consultation?", a: "Yes, for an initial discussion — a full hearing test typically requires in-person equipment and may be recommended as a next step." },
      { q: "Do you treat children's ENT issues?", a: "Yes, our ENT specialists see both adult and paediatric patients — mention your child's age when booking." },
    ],
  },
  {
    slug: "pulmonology",
    name: "Pulmonology",
    icon: "🫁",
    metaTitle: "Online Pulmonology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online pulmonology consultation in Chennai for breathing difficulties, asthma, chronic cough, or lung-related health concerns.",
    intro: "Pulmonology covers the diagnosis and ongoing management of lung and respiratory conditions. Our pulmonologists offer online and in-person consultations across Chennai for breathing difficulties, chronic cough, and follow-up care for existing respiratory conditions.",
    whenToConsult: [
      "Persistent or worsening cough",
      "Shortness of breath",
      "Wheezing or chest tightness",
      "Known asthma or COPD needing follow-up",
      "Reviewing a chest X-ray or PFT report",
      "Recurring respiratory infections",
    ],
    conditions: [
      "Asthma management",
      "Chronic Obstructive Pulmonary Disease (COPD)",
      "Chronic cough",
      "Allergic respiratory conditions",
      "Post-infection lung follow-up care",
    ],
    faq: [
      { q: "Can asthma be managed with online follow-ups?", a: "Yes, many patients manage ongoing asthma care through regular video follow-ups after an initial in-person evaluation." },
      { q: "What if I'm having severe difficulty breathing right now?", a: "Severe breathing difficulty is a medical emergency — go to the nearest emergency room immediately." },
      { q: "Can I get home healthcare support for oxygen monitoring?", a: "Our Home Healthcare service includes vitals monitoring — check the Home Healthcare page for what's available in your area." },
    ],
  },
  {
    slug: "endocrinology",
    name: "Endocrinology",
    icon: "🧬",
    metaTitle: "Online Endocrinology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult an endocrinologist online in Chennai for diabetes, thyroid concerns, and other hormone-related health conditions.",
    intro: "Endocrinology focuses on hormone-related health, including diabetes and thyroid conditions. Our endocrinologists offer online consultations and follow-ups across Chennai, helping patients manage ongoing conditions and review lab reports without always needing an in-person visit.",
    whenToConsult: [
      "Diabetes diagnosis or management",
      "Thyroid-related symptoms (fatigue, weight change)",
      "Reviewing blood sugar or thyroid lab reports",
      "Unexplained weight gain or loss",
      "Hormonal imbalance symptoms",
      "Routine diabetes follow-up",
    ],
    conditions: [
      "Type 1 and Type 2 diabetes",
      "Thyroid disorders (hypo/hyperthyroidism)",
      "PCOS-related hormonal concerns",
      "Metabolic syndrome",
      "Ongoing hormone therapy follow-up",
    ],
    faq: [
      { q: "Can diabetes be managed entirely through online consultations?", a: "Many patients manage ongoing diabetes care through regular video follow-ups, combined with periodic lab tests and occasional in-person visits as needed." },
      { q: "Can I upload my HbA1c or thyroid report before the call?", a: "Yes, upload your reports to Documents in your dashboard so the endocrinologist can review them during your consultation." },
      { q: "Do you offer home sample collection for blood sugar tests?", a: "Yes, home-based lab sample collection can be booked through our Lab Test Booking service." },
    ],
  },
  {
    slug: "dentistry",
    name: "Dentistry",
    icon: "🦷",
    metaTitle: "Online Dental Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Get an online dental consultation in Chennai for tooth pain, gum issues, or general dental concerns before visiting a dentist in person.",
    intro: "Dentistry covers oral and dental health. Our dental specialists offer online consultations for an initial assessment of dental concerns, with in-person visits recommended for procedures like fillings, extractions, or cleanings that require hands-on treatment.",
    whenToConsult: [
      "Tooth pain or sensitivity",
      "Bleeding or swollen gums",
      "Concerns before a dental procedure",
      "Follow-up after a dental treatment",
      "General oral hygiene guidance",
      "Reviewing a dental X-ray",
    ],
    conditions: [
      "Tooth pain and sensitivity",
      "Gum disease (gingivitis/periodontitis)",
      "Cavities — initial assessment",
      "Post-procedure follow-up",
      "Oral hygiene guidance",
    ],
    faq: [
      { q: "Can a dentist diagnose a cavity over video?", a: "A video consultation can help assess symptoms and guide next steps, but most dental procedures and thorough exams require an in-person visit." },
      { q: "Is online dental consultation useful for severe tooth pain?", a: "Yes, for guidance and initial assessment — but for severe pain, swelling, or trauma, an in-person or emergency dental visit is recommended." },
      { q: "Can I get post-treatment follow-up online?", a: "Yes, follow-up questions after a filling, extraction, or other procedure can often be handled through a video consultation." },
    ],
  },
  {
    slug: "general-medicine",
    name: "General Medicine",
    icon: "🩺",
    metaTitle: "Online General Medicine Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online general physician consultation in Chennai for fever, cold, general health concerns, or a first opinion before seeing a specialist.",
    intro: "General Medicine physicians handle a wide range of everyday health concerns and act as a first point of contact for symptoms that may need specialist referral. Our general physicians are available online and in-person across Chennai for common illnesses, health check-ups, and ongoing care.",
    whenToConsult: [
      "Fever, cold, or flu-like symptoms",
      "General fatigue or unwellness",
      "Routine health check-up",
      "Unsure which specialist to see",
      "Common infections",
      "Follow-up on general health concerns",
    ],
    conditions: [
      "Fever and viral infections",
      "Common cold and flu",
      "General health check-ups",
      "Lifestyle and preventive health guidance",
      "Referral to the right specialist",
    ],
    faq: [
      { q: "When should I see a general physician instead of a specialist?", a: "If you're unsure what's causing your symptoms, a general physician is a good first step — they can refer you to the right specialist if needed." },
      { q: "Can common cold or fever be treated through video consultation?", a: "Yes, general physicians commonly manage these through online consultations, recommending an in-person visit if symptoms don't improve or worsen." },
      { q: "Can I get a health check-up done online?", a: "An online consultation can review your health history and guide you on which tests to book — actual lab tests can be scheduled through our Lab Test Booking service." },
    ],
  },
  {
    slug: "paediatrics",
    name: "Paediatrics",
    icon: "🧸",
    metaTitle: "Online Paediatrician Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a paediatrician online in Chennai for your child's fever, cold, growth concerns, or general health questions from the comfort of home.",
    intro: "Paediatrics covers the health of infants, children, and adolescents. Our paediatricians offer online consultations and in-person visits across Chennai — a convenient option for common childhood illnesses, growth and development questions, and follow-up care.",
    whenToConsult: [
      "Fever or cold symptoms in a child",
      "Growth or development questions",
      "Feeding or nutrition concerns",
      "Vaccination-related questions",
      "Follow-up after a childhood illness",
      "General parenting health queries",
    ],
    conditions: [
      "Common childhood illnesses",
      "Growth and development monitoring",
      "Vaccination guidance",
      "Nutrition and feeding concerns",
      "Follow-up care for ongoing conditions",
    ],
    faq: [
      { q: "Can I consult a paediatrician online for my child's fever?", a: "Yes, many common childhood illnesses can be assessed over video — the paediatrician will advise if an in-person visit is needed based on symptoms." },
      { q: "Can vaccination schedules be discussed online?", a: "Yes, you can discuss your child's vaccination schedule with a paediatrician, though the actual vaccination needs to be administered in person." },
      { q: "What if my child has a high fever with other severe symptoms?", a: "For a child with a very high fever, difficulty breathing, or other severe symptoms, please visit an emergency room immediately rather than waiting for an online appointment." },
    ],
  },
  {
    slug: "gynaecology",
    name: "Gynaecology",
    icon: "🤰",
    metaTitle: "Online Gynaecology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book a private online gynaecology consultation in Chennai for women's health concerns, pregnancy questions, or routine follow-up care.",
    intro: "Gynaecology covers women's reproductive health, including pregnancy care and routine well-woman check-ups. Our gynaecologists offer private online consultations and in-person visits across Chennai, giving women a comfortable way to discuss health concerns.",
    whenToConsult: [
      "Menstrual irregularities",
      "Pregnancy-related questions",
      "Routine gynaecological check-up",
      "PCOS or hormonal concerns",
      "Post-delivery follow-up care",
      "General reproductive health questions",
    ],
    conditions: [
      "Menstrual health",
      "Pregnancy care and follow-up",
      "PCOS/PCOD management",
      "Menopause-related concerns",
      "Routine well-woman check-ups",
    ],
    faq: [
      { q: "Is online gynaecology consultation private and confidential?", a: "Yes, video consultations are conducted through our secure platform and your health information is kept confidential per our privacy policy." },
      { q: "Can pregnancy follow-ups be done through video calls?", a: "Many routine pregnancy follow-up discussions can happen over video, though in-person visits are needed for physical examinations and certain tests." },
      { q: "Can I book a female doctor for my consultation?", a: "You can browse doctor profiles and choose a specific gynaecologist you're comfortable with when booking through Find Doctor." },
    ],
  },
  {
    slug: "psychiatry",
    name: "Psychiatry",
    icon: "🛋️",
    metaTitle: "Online Psychiatry Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Speak with a psychiatrist online in Chennai in a private, judgement-free space for anxiety, stress, sleep issues, or mental health support.",
    intro: "Psychiatry supports mental and emotional wellbeing. Our psychiatrists offer private, confidential online consultations across Chennai, making it easier to seek support for stress, anxiety, sleep difficulties, and other mental health concerns from the comfort of home.",
    whenToConsult: [
      "Persistent stress or anxiety",
      "Sleep difficulties",
      "Low mood lasting more than a couple of weeks",
      "Difficulty coping with daily life",
      "Follow-up on an existing mental health condition",
      "Seeking a confidential space to talk",
    ],
    conditions: [
      "Anxiety-related concerns",
      "Sleep difficulties",
      "Stress management",
      "Mood-related concerns",
      "Ongoing mental health follow-up care",
    ],
    faq: [
      { q: "Is my online psychiatry consultation confidential?", a: "Yes, all consultations are private and your information is handled according to our privacy policy — video calls run on our own secure system." },
      { q: "Can I talk to a psychiatrist without anyone finding out?", a: "Your consultation and health records are confidential and visible only to you and your treating doctor, in line with our privacy practices." },
      { q: "If I'm in crisis right now, should I book an online appointment?", a: "If you are in immediate crisis or having thoughts of self-harm, please contact a crisis helpline or go to the nearest emergency room right away rather than waiting for an online appointment." },
    ],
  },
  {
    slug: "gastroenterology",
    name: "Gastroenterology",
    icon: "🍽️",
    metaTitle: "Online Gastroenterology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online gastroenterology consultation in Chennai for digestive issues, stomach pain, acidity, or gut health concerns.",
    intro: "Gastroenterology covers the digestive system, including the stomach, intestines, and liver. Our gastroenterologists offer online and in-person consultations across Chennai for digestive discomfort, ongoing gut health concerns, and follow-up after procedures.",
    whenToConsult: [
      "Persistent stomach pain or discomfort",
      "Acidity or frequent heartburn",
      "Changes in bowel habits",
      "Unexplained weight loss with digestive symptoms",
      "Follow-up after an endoscopy or colonoscopy",
      "Ongoing digestive conditions",
    ],
    conditions: [
      "Acid reflux (GERD)",
      "Irritable Bowel Syndrome (IBS)",
      "Digestive discomfort and bloating",
      "Liver-related follow-up care",
      "Post-procedure digestive follow-up",
    ],
    faq: [
      { q: "Can digestive issues be assessed through an online consultation?", a: "Yes, a gastroenterologist can review your symptoms and history over video and advise if any tests or an in-person visit are needed." },
      { q: "Can I discuss my endoscopy report online?", a: "Yes, upload your report to Documents in your dashboard and the specialist can review it with you during your consultation." },
      { q: "What if I have severe abdominal pain right now?", a: "Severe, sudden abdominal pain can be a medical emergency — please visit the nearest emergency room rather than waiting for an online appointment." },
    ],
  },
  {
    slug: "nephrology",
    name: "Nephrology",
    icon: "🫘",
    metaTitle: "Online Nephrology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a nephrologist online in Chennai for kidney health concerns, follow-up care, or reviewing kidney function test reports.",
    intro: "Nephrology focuses on kidney health. Our nephrologists offer online consultations and follow-up care across Chennai for patients managing kidney-related conditions, reviewing lab reports, or seeking guidance on kidney health.",
    whenToConsult: [
      "Reviewing a kidney function test (creatinine/eGFR) report",
      "Swelling in legs or around the eyes",
      "Changes in urination patterns",
      "Known kidney condition needing follow-up",
      "High blood pressure with kidney concerns",
      "Diabetes-related kidney health monitoring",
    ],
    conditions: [
      "Chronic Kidney Disease (CKD) follow-up",
      "Kidney function monitoring",
      "Diabetes-related kidney health",
      "Hypertension-related kidney monitoring",
      "Post-treatment kidney follow-up",
    ],
    faq: [
      { q: "Can kidney function reports be reviewed in an online consultation?", a: "Yes, upload your lab reports (creatinine, eGFR, etc.) and the nephrologist can review and explain them during your video consultation." },
      { q: "Is online consultation suitable for ongoing dialysis patients?", a: "Online consultations can support general follow-up and questions, but dialysis itself requires in-person, hospital-based care — speak with your specialist about coordinating both." },
      { q: "Can I get home sample collection for kidney function tests?", a: "Yes, home-based sample collection is available through our Lab Test Booking service." },
    ],
  },
  {
    slug: "pathology",
    name: "Pathology",
    icon: "🔬",
    metaTitle: "Online Pathology Report Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Get help understanding your lab or pathology reports in Chennai — book an online consultation or home sample collection with We Care 4 'all'.",
    intro: "Pathology covers laboratory testing and diagnostic reports that support diagnosis and treatment decisions. While pathology itself is largely lab-based, our platform helps you book tests, arrange home sample collection, and consult a doctor to understand what your reports mean.",
    whenToConsult: [
      "Need help understanding a lab report",
      "Routine blood work or health screening",
      "Doctor-recommended diagnostic tests",
      "Home sample collection instead of visiting a lab",
      "Follow-up testing for an ongoing condition",
    ],
    conditions: [
      "Routine blood tests",
      "Diagnostic report interpretation support",
      "Health screening packages",
      "Follow-up lab monitoring",
    ],
    faq: [
      { q: "Can I book a lab test without visiting the lab in person?", a: "Yes, our Lab Test Booking service includes home sample collection in many areas — browse and book directly from the Lab Test Booking page." },
      { q: "Can a doctor help me understand my lab report over video?", a: "Yes, upload your report to Documents in your dashboard and book a consultation with a general physician or the relevant specialist to go through it." },
      { q: "How long do lab results usually take?", a: "Turnaround time varies by test and lab partner — your Lab Test Booking dashboard shows live status updates for each order." },
    ],
  },
  {
    slug: "physiotherapy",
    name: "Physiotherapy",
    icon: "🤸",
    metaTitle: "Online & Home Physiotherapy in Chennai | We Care 4 'all'",
    metaDescription: "Book physiotherapy sessions in Chennai — online guidance or a physiotherapist at your home — for back pain, post-surgery recovery, and mobility support.",
    intro: "Physiotherapy supports recovery from injury, surgery, and chronic pain through movement-based care. Our physiotherapists offer both online guidance sessions and in-home visits across Chennai, helping patients recover comfortably without frequent clinic travel.",
    whenToConsult: [
      "Back or joint pain affecting daily movement",
      "Post-surgery recovery and rehabilitation",
      "Sports injury recovery",
      "Mobility difficulties, especially for elderly patients",
      "Posture-related discomfort",
      "Doctor-recommended physiotherapy",
    ],
    conditions: [
      "Post-surgical rehabilitation",
      "Back and joint pain management",
      "Sports injury recovery",
      "Mobility and balance support for elderly patients",
      "Posture correction guidance",
    ],
    faq: [
      { q: "Can physiotherapy be done at home instead of a clinic?", a: "Yes, our Home Healthcare service includes in-home physiotherapy sessions — book directly from the Home Healthcare page." },
      { q: "Is online physiotherapy guidance effective?", a: "For many conditions, online sessions can effectively guide exercises and monitor progress, though hands-on techniques may need an in-person or home visit." },
      { q: "Do I need a doctor's referral for physiotherapy?", a: "Not always — you can book physiotherapy directly, though a doctor's recommendation can help the physiotherapist tailor your care plan." },
    ],
  },
  {
    slug: "dermatology",
    name: "Dermatology",
    icon: "🧴",
    metaTitle: "Online Dermatology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online dermatology consultation in Chennai for skin, hair, or nail concerns with verified dermatologists — from acne to allergies.",
    intro: "Dermatology covers skin, hair, and nail health. Our dermatologists offer online video consultations across Chennai — a convenient way to get an opinion on skin concerns, often supported by sharing clear photos of the affected area before your call.",
    whenToConsult: [
      "Persistent acne or breakouts",
      "Skin rashes or irritation",
      "Hair loss or scalp concerns",
      "Unusual moles or skin changes",
      "Allergic skin reactions",
      "Follow-up after a dermatology treatment",
    ],
    conditions: [
      "Acne and breakouts",
      "Skin rashes and allergies",
      "Hair loss and scalp conditions",
      "Eczema and dry skin",
      "Nail-related concerns",
    ],
    faq: [
      { q: "Can skin conditions really be diagnosed over a video call?", a: "For many common skin conditions, a dermatologist can assess visually over video, especially with clear photos shared beforehand — some cases may need an in-person exam for a closer look." },
      { q: "Should I send photos before my consultation?", a: "Yes, uploading clear, well-lit photos of the affected area to Documents before your appointment helps the dermatologist prepare and gives a clearer view than the video call alone." },
      { q: "Can hair loss be treated through online consultations?", a: "Yes, hair loss causes and care plans are commonly discussed and followed up through online consultations." },
    ],
  },
];

export function getSpecialtyBySlug(slug) {
  return SPECIALTIES.find((s) => s.slug === slug) || null;
}
