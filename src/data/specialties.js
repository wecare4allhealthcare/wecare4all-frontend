/**
 * specialties.js — data source for the dedicated SEO specialty pages
 * (/specialties/:slug), keyed by slug (see ../utils/specialtySlug.js).
 *
 * REWRITTEN Aug 2026 — client feedback: "these specialities are created
 * by admin, show those specialities in home page ... and based on that
 * create the content page". The original version of this file used an
 * invented list of 18 generic specialty names that did NOT match what's
 * actually in the live `specialties` table (managed at
 * /admin/dashboard?tab=specialties) — e.g. it had "Pathology" and
 * "Physiotherapy" which don't exist in the real list, and was missing
 * real ones like "Bariatric and Metabolic Correction", "Plastic &
 * Cosmetic Surgery", "GastroIntestinal Surgery", "Adolescent Medicine",
 * etc. This meant a specialty page's live doctor list (which filters by
 * exact name match against GET /doctors?specialization=X) would come
 * back empty even when matching doctors existed.
 *
 * This version's `name` field for every entry is copied EXACTLY from
 * the live admin specialties list as of Aug 2026 (25 active entries).
 * IMPORTANT: Home.jsx's specialty chips and SpecialtyPage.jsx's live
 * doctor lookup both now fetch the current list from GET /specialties
 * at runtime — this file is a content/SEO-copy lookup keyed by slug,
 * not the source of truth for which specialties exist. If admin adds a
 * NEW specialty here that isn't in this file, SpecialtyPage.jsx falls
 * back to a generic auto-built page using the live `description` field
 * instead of failing — see SpecialtyPage.jsx's `buildFallbackContent()`.
 * When that happens, add a proper entry here so it gets full content.
 *
 * ⚠️ CLIENT / MEDICAL REVIEW REQUIRED BEFORE THIS CONTENT GOES LIVE ⚠️
 * Every "intro", "whenToConsult", "conditions", and "faq" string below
 * was drafted by Claude (AI), not a licensed doctor. It's written to be
 * generic, cautious, and non-diagnostic on purpose (no dosages, no
 * treatment guarantees, no "this cures X" claims), but it is still
 * medical-adjacent content on a live healthcare platform — a doctor on
 * your team (or one of your empanelled specialists) should read through
 * each entry once before it's published.
 */

export const SPECIALTIES = [
  {
    slug: "general-medicine",
    name: "General Medicine",
    icon: "🩺",
    metaTitle: "Online General Medicine Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online general physician consultation in Chennai for fever, cold, general health concerns, or a first opinion before seeing a specialist.",
    intro: "General Medicine physicians handle a wide range of everyday health concerns and act as a first point of contact for symptoms that may need specialist referral. Our general physicians are available online and in-person across Chennai for common illnesses, health check-ups, and ongoing care.",
    whenToConsult: ["Fever, cold, or flu-like symptoms", "General fatigue or unwellness", "Routine health check-up", "Unsure which specialist to see", "Common infections", "Follow-up on general health concerns"],
    conditions: ["Fever and viral infections", "Common cold and flu", "General health check-ups", "Lifestyle and preventive health guidance", "Referral to the right specialist"],
    faq: [
      { q: "When should I see a general physician instead of a specialist?", a: "If you're unsure what's causing your symptoms, a general physician is a good first step — they can refer you to the right specialist if needed." },
      { q: "Can common cold or fever be treated through video consultation?", a: "Yes, general physicians commonly manage these through online consultations, recommending an in-person visit if symptoms don't improve or worsen." },
      { q: "Can I get a health check-up done online?", a: "An online consultation can review your health history and guide you on which tests to book — actual lab tests can be scheduled through our Lab Test Booking service." },
    ],
  },
  {
    slug: "general-surgery",
    name: "General Surgery",
    icon: "🔪",
    metaTitle: "General Surgery Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a general surgeon in Chennai for hernia, appendicitis, gallbladder, and other common surgical concerns — online opinion or in-person visit.",
    intro: "General Surgery covers a broad range of surgical conditions, from hernias to appendicitis to gallbladder issues. Our general surgeons offer online consultations for an initial opinion and pre/post-surgical follow-up, with in-person visits for examination and any procedure itself.",
    whenToConsult: ["Suspected hernia (visible bulge or discomfort)", "Abdominal pain needing surgical opinion", "Gallbladder-related symptoms", "Pre-surgery consultation", "Post-surgery follow-up", "Second opinion on a recommended surgery"],
    conditions: ["Hernia", "Appendicitis follow-up care", "Gallstones and gallbladder concerns", "Minor surgical procedures", "Post-operative follow-up"],
    faq: [
      { q: "Can I get a second opinion on a recommended surgery online?", a: "Yes — share your reports and diagnosis details, and a general surgeon can review them with you over video before you decide." },
      { q: "What if I have sudden, severe abdominal pain?", a: "Severe or sudden abdominal pain can be a medical emergency — please go to the nearest emergency room rather than waiting for an online appointment." },
      { q: "Can post-surgery follow-up be done online?", a: "Yes, many routine post-operative follow-ups can be handled over video, with an in-person visit recommended if the surgeon needs to examine the site directly." },
    ],
  },
  {
    slug: "diabetology",
    name: "Diabetology",
    icon: "🩸",
    metaTitle: "Online Diabetology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a diabetologist online in Chennai for diabetes diagnosis, blood sugar management, and ongoing follow-up care.",
    intro: "Diabetology focuses specifically on the diagnosis and long-term management of diabetes. Our diabetologists offer online consultations and follow-ups across Chennai, helping patients manage blood sugar levels, review lab reports, and adjust care over time.",
    whenToConsult: ["New diabetes diagnosis", "Blood sugar levels difficult to control", "Reviewing an HbA1c or glucose report", "Diabetes-related complications", "Routine diabetes follow-up", "Family history of diabetes and prevention guidance"],
    conditions: ["Type 1 and Type 2 diabetes", "Blood sugar management", "Diabetes-related complications", "Pre-diabetes guidance", "Ongoing diabetes follow-up"],
    faq: [
      { q: "Can diabetes be managed entirely through online consultations?", a: "Many patients manage ongoing diabetes care through regular video follow-ups, combined with periodic lab tests and occasional in-person visits as needed." },
      { q: "Can I upload my HbA1c report before the call?", a: "Yes, upload your reports to Documents in your dashboard so the diabetologist can review them during your consultation." },
      { q: "Do you offer home sample collection for blood sugar tests?", a: "Yes, home-based lab sample collection can be booked through our Lab Test Booking service." },
    ],
  },
  {
    slug: "bariatric-and-metabolic-correction",
    name: "Bariatric and Metabolic Correction",
    icon: "⚖️",
    metaTitle: "Bariatric & Metabolic Surgery Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a specialist in Chennai about bariatric and metabolic surgery options for weight management and related health concerns.",
    intro: "Bariatric and Metabolic Correction covers surgical and medical approaches to significant weight management and related metabolic conditions. Our specialists offer online consultations for an initial discussion and eligibility questions, with in-person visits for full evaluation.",
    whenToConsult: ["Considering bariatric surgery options", "Weight-related health complications", "Struggling to manage weight through other approaches", "Questions about eligibility for a procedure", "Post-procedure follow-up care", "Metabolic syndrome concerns"],
    conditions: ["Severe obesity evaluation", "Weight-related metabolic conditions", "Pre-procedure counselling", "Post-procedure follow-up"],
    faq: [
      { q: "Can I find out if I'm eligible for bariatric surgery online?", a: "An online consultation is a good starting point to discuss your history and general eligibility criteria — a full evaluation typically needs in-person assessment and tests." },
      { q: "Is this only about surgery, or are non-surgical options discussed too?", a: "Our specialists can discuss the full range of options appropriate to your situation, not just surgical ones." },
      { q: "What kind of follow-up is needed after a procedure?", a: "Post-procedure care typically involves regular follow-ups — many of which can be done online — combined with periodic in-person check-ins as advised by your specialist." },
    ],
  },
  {
    slug: "plastic-cosmetic-surgery",
    name: "Plastic & Cosmetic Surgery",
    icon: "💉",
    metaTitle: "Plastic & Cosmetic Surgery Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a plastic and cosmetic surgery specialist in Chennai for reconstructive or aesthetic procedure questions and consultations.",
    intro: "Plastic & Cosmetic Surgery covers both reconstructive procedures and aesthetic/cosmetic concerns. Our specialists offer online consultations for an initial discussion of your goals and questions, with in-person visits for examination and any procedure itself.",
    whenToConsult: ["Considering a reconstructive procedure", "Questions about a cosmetic procedure", "Post-surgery or post-injury reconstruction needs", "Scar or skin concerns after an injury", "Follow-up after a previous procedure", "General questions about options available"],
    conditions: ["Reconstructive surgery consultations", "Cosmetic procedure consultations", "Scar management guidance", "Post-procedure follow-up"],
    faq: [
      { q: "Can I discuss a cosmetic procedure online before deciding?", a: "Yes, an initial online consultation is a good way to discuss your goals, ask questions, and understand what's involved before any in-person evaluation." },
      { q: "Is reconstructive surgery different from cosmetic surgery here?", a: "Yes — reconstructive procedures typically address injury, medical, or congenital concerns, while cosmetic procedures are elective; our specialists handle both, so mention which applies to you when booking." },
      { q: "Can follow-up after a procedure be done online?", a: "Many routine follow-up questions can be handled over video, with in-person visits recommended for direct examination when needed." },
    ],
  },
  {
    slug: "orthopaedics",
    name: "Orthopaedics",
    icon: "🦴",
    metaTitle: "Online Orthopaedics Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online orthopaedic consultation in Chennai for joint pain, back pain, fractures, or sports injuries with verified orthopaedic specialists.",
    intro: "Orthopaedics covers the bones, joints, ligaments, and muscles. Our orthopaedic specialists are available for online consultations, in-person visits, and home healthcare across Chennai — helpful for joint pain, back pain, post-injury follow-ups, and reviewing X-ray or MRI reports.",
    whenToConsult: ["Persistent joint or back pain", "Recent sports or accidental injury", "Swelling, stiffness, or reduced mobility", "Post-fracture or post-surgery follow-up", "Reviewing an X-ray or MRI report", "Chronic knee, hip, or shoulder discomfort"],
    conditions: ["Arthritis and joint pain", "Back and spine-related discomfort", "Sports injuries", "Fracture follow-up care", "Ligament and tendon concerns", "Post-surgical orthopaedic recovery"],
    faq: [
      { q: "Can an orthopaedic issue be assessed over video?", a: "An online consultation is useful for a first opinion, reviewing reports, and follow-ups, but a physical examination or in-person visit may be needed for a full assessment of injuries." },
      { q: "Do you offer physiotherapy alongside orthopaedic care?", a: "Yes — our Home Healthcare service includes physiotherapy, which many patients combine with ongoing orthopaedic follow-up." },
      { q: "Can I book a home visit if I can't travel due to a leg injury?", a: "Yes, home visits for both doctor consultations and physiotherapy can be booked from the Home Healthcare page." },
    ],
  },
  {
    slug: "cardiology",
    name: "Cardiology",
    icon: "❤️",
    metaTitle: "Online Cardiology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online cardiology consultation in Chennai with verified cardiologists. Discuss chest pain, blood pressure, cholesterol, and heart health from home.",
    intro: "Cardiology covers the diagnosis and ongoing care of conditions affecting the heart and blood vessels. Our verified cardiologists are available for online video consultations, in-person visits, and home healthcare across Chennai — useful for a first opinion, a routine follow-up, or reviewing recent test reports without a hospital visit.",
    whenToConsult: ["Chest discomfort, tightness, or pain", "Persistent high blood pressure readings", "Unusual shortness of breath or fatigue", "Family history of heart disease", "Irregular heartbeat or palpitations", "Reviewing an ECG, echo, or lipid profile report"],
    conditions: ["Hypertension (high blood pressure)", "Coronary artery disease", "Arrhythmia (irregular heartbeat)", "Cholesterol management", "Post-cardiac-event follow-up care", "Heart failure monitoring"],
    faq: [
      { q: "Can a cardiologist review my ECG or echo report online?", a: "Yes — upload your report as a document before or during your video consultation and the cardiologist can review it with you and explain the findings." },
      { q: "Is an online cardiology consultation suitable for chest pain?", a: "For sudden, severe chest pain, go to the nearest emergency room immediately — don't wait for an online appointment. Online consultations are appropriate for ongoing monitoring, follow-ups, and non-emergency concerns." },
      { q: "Can I book a home visit for blood pressure monitoring?", a: "Yes, our Home Healthcare service includes vitals monitoring and can be booked directly from the Home Healthcare page." },
    ],
  },
  {
    slug: "functional-restorative-neurology",
    name: "Functional & Restorative Neurology",
    icon: "🧠",
    metaTitle: "Functional & Restorative Neurology in Chennai | We Care 4 'all'",
    metaDescription: "Consult a functional and restorative neurology specialist in Chennai for nervous-system rehabilitation and ongoing recovery support.",
    intro: "Functional & Restorative Neurology focuses on rehabilitation and recovery support for nervous-system conditions — helping patients regain function after neurological events or manage ongoing neurological challenges. Our specialists offer online and in-person consultations across Chennai.",
    whenToConsult: ["Recovery support after a neurological event", "Ongoing rehabilitation planning", "Coordinating care with physiotherapy", "Follow-up on a neurological condition's progress", "Questions about functional recovery approaches"],
    conditions: ["Post-neurological-event rehabilitation support", "Functional recovery planning", "Ongoing neurological condition follow-up"],
    faq: [
      { q: "How is this different from general Neurology?", a: "Functional & Restorative Neurology focuses specifically on rehabilitation and functional recovery, often working alongside a treating neurologist and physiotherapy team." },
      { q: "Can rehabilitation planning be discussed online?", a: "Yes, care planning and progress follow-ups can often be discussed over video, with in-person or home visits for hands-on rehabilitation work." },
      { q: "Do you coordinate with physiotherapy for recovery?", a: "Yes — our Home Healthcare service includes physiotherapy, which is commonly combined with ongoing neurological rehabilitation care." },
    ],
  },
  {
    slug: "neurology",
    name: "Neurology",
    icon: "🧠",
    metaTitle: "Online Neurology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a neurologist online in Chennai for headaches, migraines, dizziness, memory concerns, or nerve-related symptoms — video, in-person, or home visits.",
    intro: "Neurology addresses conditions of the brain, spinal cord, and nervous system. Our neurologists offer online video consultations and in-person appointments in Chennai for symptoms ranging from recurring headaches to nerve-related discomfort, plus follow-up care for ongoing neurological conditions.",
    whenToConsult: ["Frequent or severe headaches and migraines", "Unexplained dizziness or balance issues", "Numbness, tingling, or weakness in limbs", "Memory or concentration difficulties", "Seizures or unusual episodes", "Follow-up after a neurological diagnosis"],
    conditions: ["Migraine and chronic headache", "Epilepsy and seizure disorders", "Peripheral neuropathy", "Stroke follow-up care", "Parkinson's disease management", "Sleep-related neurological concerns"],
    faq: [
      { q: "Can migraines be managed through online consultations?", a: "Yes — many patients manage ongoing migraine care through video follow-ups after an initial evaluation, adjusting care based on symptom patterns." },
      { q: "What if I have sudden weakness on one side of my body?", a: "This can be a sign of a medical emergency — go to the nearest emergency room immediately rather than booking an online appointment." },
      { q: "Do I need to bring past scan reports to my consultation?", a: "Yes, uploading any MRI, CT, or EEG reports beforehand helps the neurologist review your history more thoroughly during the call." },
    ],
  },
  {
    slug: "oncology",
    name: "Oncology",
    icon: "🎗️",
    metaTitle: "Online Oncology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Connect with oncology specialists in Chennai for a second opinion, report review, or ongoing follow-up care through online or in-person consultations.",
    intro: "Oncology focuses on the care and ongoing management of cancer. Our platform connects patients with oncology specialists for second opinions, review of diagnostic reports, and follow-up consultations — supporting patients and families through video calls, in-person visits, or coordination with our partner hospitals.",
    whenToConsult: ["Seeking a second opinion on a diagnosis", "Reviewing biopsy or imaging reports", "Follow-up during or after treatment", "Questions about symptoms or side effects", "Coordinating care with a partner hospital", "Family support and care planning discussions"],
    conditions: ["Second-opinion consultations", "Treatment follow-up support", "Report and diagnosis review", "Ongoing symptom monitoring", "Referral coordination with partner hospitals"],
    faq: [
      { q: "Can I get a second opinion online before starting treatment?", a: "Yes — upload your existing reports and an oncology specialist can review them with you over a video consultation." },
      { q: "Do you coordinate with hospitals for cancer treatment?", a: "We can help connect you with our partner hospitals for treatments that require in-person, hospital-based care." },
      { q: "Is emotional/family support available during this process?", a: "Our care team can help guide you toward appropriate support resources — speak with your specialist about what's available for your situation." },
    ],
  },
  {
    slug: "pulmonology",
    name: "Pulmonology",
    icon: "🫁",
    metaTitle: "Online Pulmonology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online pulmonology consultation in Chennai for breathing difficulties, asthma, chronic cough, or lung-related health concerns.",
    intro: "Pulmonology covers the diagnosis and ongoing management of lung and respiratory conditions. Our pulmonologists offer online and in-person consultations across Chennai for breathing difficulties, chronic cough, and follow-up care for existing respiratory conditions.",
    whenToConsult: ["Persistent or worsening cough", "Shortness of breath", "Wheezing or chest tightness", "Known asthma or COPD needing follow-up", "Reviewing a chest X-ray or PFT report", "Recurring respiratory infections"],
    conditions: ["Asthma management", "Chronic Obstructive Pulmonary Disease (COPD)", "Chronic cough", "Allergic respiratory conditions", "Post-infection lung follow-up care"],
    faq: [
      { q: "Can asthma be managed with online follow-ups?", a: "Yes, many patients manage ongoing asthma care through regular video follow-ups after an initial in-person evaluation." },
      { q: "What if I'm having severe difficulty breathing right now?", a: "Severe breathing difficulty is a medical emergency — go to the nearest emergency room immediately." },
      { q: "Can I get home healthcare support for oxygen monitoring?", a: "Our Home Healthcare service includes vitals monitoring — check the Home Healthcare page for what's available in your area." },
    ],
  },
  {
    slug: "urology",
    name: "Urology",
    icon: "🧬",
    metaTitle: "Online Urology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a urologist online in Chennai for urinary tract concerns, kidney stones, prostate health, and related conditions.",
    intro: "Urology covers the urinary tract and male reproductive health. Our urologists offer online consultations and in-person visits across Chennai for symptoms like urinary discomfort, suspected kidney stones, and prostate-related questions.",
    whenToConsult: ["Pain or burning during urination", "Frequent or urgent need to urinate", "Suspected kidney stones", "Blood in urine", "Prostate-related concerns", "Follow-up after a urological procedure"],
    conditions: ["Urinary tract infections", "Kidney stones", "Prostate health concerns", "Bladder-related conditions", "Post-procedure follow-up"],
    faq: [
      { q: "Can urinary symptoms be assessed over video?", a: "A urologist can review your symptoms and history online and advise on next steps, including whether tests or an in-person visit are needed." },
      { q: "What if I have severe pain suggesting a kidney stone?", a: "Severe, sudden flank pain can be a medical emergency — please visit the nearest emergency room rather than waiting for an online appointment." },
      { q: "Can I book home sample collection for a urine test?", a: "Yes, home-based sample collection is available through our Lab Test Booking service." },
    ],
  },
  {
    slug: "nephrology",
    name: "Nephrology",
    icon: "🫘",
    metaTitle: "Online Nephrology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a nephrologist online in Chennai for kidney health concerns, follow-up care, or reviewing kidney function test reports.",
    intro: "Nephrology focuses on kidney health. Our nephrologists offer online consultations and follow-up care across Chennai for patients managing kidney-related conditions, reviewing lab reports, or seeking guidance on kidney health.",
    whenToConsult: ["Reviewing a kidney function test (creatinine/eGFR) report", "Swelling in legs or around the eyes", "Changes in urination patterns", "Known kidney condition needing follow-up", "High blood pressure with kidney concerns", "Diabetes-related kidney health monitoring"],
    conditions: ["Chronic Kidney Disease (CKD) follow-up", "Kidney function monitoring", "Diabetes-related kidney health", "Hypertension-related kidney monitoring", "Post-treatment kidney follow-up"],
    faq: [
      { q: "Can kidney function reports be reviewed in an online consultation?", a: "Yes, upload your lab reports (creatinine, eGFR, etc.) and the nephrologist can review and explain them during your video consultation." },
      { q: "Is online consultation suitable for ongoing dialysis patients?", a: "Online consultations can support general follow-up and questions, but dialysis itself requires in-person, hospital-based care — speak with your specialist about coordinating both." },
      { q: "Can I get home sample collection for kidney function tests?", a: "Yes, home-based sample collection is available through our Lab Test Booking service." },
    ],
  },
  {
    slug: "gynaecology",
    name: "Gynaecology",
    icon: "🤰",
    metaTitle: "Online Gynaecology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book a private online gynaecology consultation in Chennai for women's health concerns, pregnancy questions, or routine follow-up care.",
    intro: "Gynaecology covers women's reproductive health, including pregnancy care and routine well-woman check-ups. Our gynaecologists offer private online consultations and in-person visits across Chennai, giving women a comfortable way to discuss health concerns.",
    whenToConsult: ["Menstrual irregularities", "Pregnancy-related questions", "Routine gynaecological check-up", "PCOS or hormonal concerns", "Post-delivery follow-up care", "General reproductive health questions"],
    conditions: ["Menstrual health", "Pregnancy care and follow-up", "PCOS/PCOD management", "Menopause-related concerns", "Routine well-woman check-ups"],
    faq: [
      { q: "Is online gynaecology consultation private and confidential?", a: "Yes, video consultations are conducted through our secure platform and your health information is kept confidential per our privacy policy." },
      { q: "Can pregnancy follow-ups be done through video calls?", a: "Many routine pregnancy follow-up discussions can happen over video, though in-person visits are needed for physical examinations and certain tests." },
      { q: "Can I book a female doctor for my consultation?", a: "You can browse doctor profiles and choose a specific gynaecologist you're comfortable with when booking through Find Doctor." },
    ],
  },
  {
    slug: "infertility",
    name: "Infertility",
    icon: "👶",
    metaTitle: "Online Infertility Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a fertility specialist online in Chennai for infertility concerns, initial evaluation, and guidance on next steps.",
    intro: "Our infertility specialists support individuals and couples exploring fertility concerns, offering online consultations for an initial discussion, history review, and guidance on next steps — with in-person visits for examinations and procedures.",
    whenToConsult: ["Difficulty conceiving over an extended period", "Questions about fertility evaluation options", "Reviewing previous fertility test results", "Seeking a second opinion on a fertility treatment plan", "General questions about fertility health"],
    conditions: ["Fertility evaluation guidance", "Second opinions on treatment plans", "Ongoing fertility treatment follow-up"],
    faq: [
      { q: "Can an initial fertility consultation be done online?", a: "Yes, an online consultation is a good way to discuss your history and understand what evaluation or next steps may be recommended." },
      { q: "Is this consultation private?", a: "Yes, all consultations are confidential and handled according to our privacy policy." },
      { q: "Can both partners join the same video consultation?", a: "Yes, both partners can join the same video call together when discussing fertility concerns." },
    ],
  },
  {
    slug: "paediatrics",
    name: "Paediatrics",
    icon: "🧸",
    metaTitle: "Online Paediatrician Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a paediatrician online in Chennai for your child's fever, cold, growth concerns, or general health questions from the comfort of home.",
    intro: "Paediatrics covers the health of infants, children, and adolescents. Our paediatricians offer online consultations and in-person visits across Chennai — a convenient option for common childhood illnesses, growth and development questions, and follow-up care.",
    whenToConsult: ["Fever or cold symptoms in a child", "Growth or development questions", "Feeding or nutrition concerns", "Vaccination-related questions", "Follow-up after a childhood illness", "General parenting health queries"],
    conditions: ["Common childhood illnesses", "Growth and development monitoring", "Vaccination guidance", "Nutrition and feeding concerns", "Follow-up care for ongoing conditions"],
    faq: [
      { q: "Can I consult a paediatrician online for my child's fever?", a: "Yes, many common childhood illnesses can be assessed over video — the paediatrician will advise if an in-person visit is needed based on symptoms." },
      { q: "Can vaccination schedules be discussed online?", a: "Yes, you can discuss your child's vaccination schedule with a paediatrician, though the actual vaccination needs to be administered in person." },
      { q: "What if my child has a high fever with other severe symptoms?", a: "For a child with a very high fever, difficulty breathing, or other severe symptoms, please visit an emergency room immediately rather than waiting for an online appointment." },
    ],
  },
  {
    slug: "paediatric-cardiology",
    name: "Paediatric Cardiology",
    icon: "🧸",
    metaTitle: "Online Paediatric Cardiology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a paediatric cardiologist online in Chennai for children's heart health concerns, follow-up care, or reviewing test reports.",
    intro: "Paediatric Cardiology focuses on heart health in infants, children, and adolescents. Our paediatric cardiologists offer online consultations and follow-up care across Chennai, helping parents understand test results and manage ongoing heart-related conditions in children.",
    whenToConsult: ["Doctor-recommended paediatric cardiology referral", "Reviewing a child's ECG or echo report", "Follow-up after a heart-related diagnosis in a child", "Unusual fatigue or breathlessness in a child", "Family history of congenital heart conditions"],
    conditions: ["Congenital heart condition follow-up", "Paediatric heart health monitoring", "Report review and second opinions"],
    faq: [
      { q: "Can my child's heart test reports be reviewed online?", a: "Yes, upload the reports to Documents in your dashboard and the paediatric cardiologist can review them with you during a video consultation." },
      { q: "Is online consultation appropriate for a newly diagnosed condition?", a: "Online consultations are useful for discussion, second opinions, and follow-up, but a new diagnosis typically also involves in-person examination as part of the overall care plan." },
      { q: "Can both parents join the consultation?", a: "Yes, both parents (and the child, if appropriate) can join the same video consultation." },
    ],
  },
  {
    slug: "gastroenterology",
    name: "Gastroenterology",
    icon: "🍽️",
    metaTitle: "Online Gastroenterology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online gastroenterology consultation in Chennai for digestive issues, stomach pain, acidity, or gut health concerns.",
    intro: "Gastroenterology covers the digestive system, including the stomach, intestines, and liver. Our gastroenterologists offer online and in-person consultations across Chennai for digestive discomfort, ongoing gut health concerns, and follow-up after procedures.",
    whenToConsult: ["Persistent stomach pain or discomfort", "Acidity or frequent heartburn", "Changes in bowel habits", "Unexplained weight loss with digestive symptoms", "Follow-up after an endoscopy or colonoscopy", "Ongoing digestive conditions"],
    conditions: ["Acid reflux (GERD)", "Irritable Bowel Syndrome (IBS)", "Digestive discomfort and bloating", "Liver-related follow-up care", "Post-procedure digestive follow-up"],
    faq: [
      { q: "Can digestive issues be assessed through an online consultation?", a: "Yes, a gastroenterologist can review your symptoms and history over video and advise if any tests or an in-person visit are needed." },
      { q: "Can I discuss my endoscopy report online?", a: "Yes, upload your report to Documents in your dashboard and the specialist can review it with you during your consultation." },
      { q: "What if I have severe abdominal pain right now?", a: "Severe, sudden abdominal pain can be a medical emergency — please visit the nearest emergency room rather than waiting for an online appointment." },
    ],
  },
  {
    slug: "gastrointestinal-surgery",
    name: "GastroIntestinal Surgery",
    icon: "🏥",
    metaTitle: "GastroIntestinal Surgery Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult a GI surgery specialist in Chennai for surgical digestive conditions — online opinion, pre-surgery discussion, or post-surgery follow-up.",
    intro: "GastroIntestinal Surgery addresses digestive-system conditions that may require a surgical approach. Our specialists offer online consultations for an initial opinion and follow-up care, with in-person visits for examination and any procedure.",
    whenToConsult: ["Digestive condition requiring surgical opinion", "Pre-surgery discussion and questions", "Post-surgery follow-up", "Second opinion on a recommended GI procedure", "Ongoing recovery monitoring"],
    conditions: ["Surgical digestive conditions", "Pre- and post-operative follow-up", "Second-opinion consultations"],
    faq: [
      { q: "Can I get a second opinion on GI surgery online?", a: "Yes — share your reports and diagnosis details, and the specialist can review them with you over video before you decide." },
      { q: "Can recovery follow-up be handled through video calls?", a: "Many routine post-operative questions can be handled over video, with in-person visits recommended when a direct examination is needed." },
      { q: "What if I develop severe symptoms after surgery?", a: "Severe pain, fever, or other concerning symptoms after surgery need urgent in-person medical attention — contact your surgical team or visit an emergency room." },
    ],
  },
  {
    slug: "dentistry",
    name: "Dentistry",
    icon: "🦷",
    metaTitle: "Online Dental Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Get an online dental consultation in Chennai for tooth pain, gum issues, or general dental concerns before visiting a dentist in person.",
    intro: "Dentistry covers oral and dental health. Our dental specialists offer online consultations for an initial assessment of dental concerns, with in-person visits recommended for procedures like fillings, extractions, or cleanings that require hands-on treatment.",
    whenToConsult: ["Tooth pain or sensitivity", "Bleeding or swollen gums", "Concerns before a dental procedure", "Follow-up after a dental treatment", "General oral hygiene guidance", "Reviewing a dental X-ray"],
    conditions: ["Tooth pain and sensitivity", "Gum disease (gingivitis/periodontitis)", "Cavities — initial assessment", "Post-procedure follow-up", "Oral hygiene guidance"],
    faq: [
      { q: "Can a dentist diagnose a cavity over video?", a: "A video consultation can help assess symptoms and guide next steps, but most dental procedures and thorough exams require an in-person visit." },
      { q: "Is online dental consultation useful for severe tooth pain?", a: "Yes, for guidance and initial assessment — but for severe pain, swelling, or trauma, an in-person or emergency dental visit is recommended." },
      { q: "Can I get post-treatment follow-up online?", a: "Yes, follow-up questions after a filling, extraction, or other procedure can often be handled through a video consultation." },
    ],
  },
  {
    slug: "ophthalmology",
    name: "Ophthalmology",
    icon: "👁️",
    metaTitle: "Online Ophthalmology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online eye consultation in Chennai for vision concerns, eye irritation, or routine eye check-ups with verified ophthalmologists.",
    intro: "Ophthalmology covers eye health and vision care. Our ophthalmologists offer online consultations for general eye concerns and follow-ups, along with in-person visits for examinations that need specialized equipment, across Chennai.",
    whenToConsult: ["Blurred or reduced vision", "Eye redness, irritation, or discharge", "Frequent headaches linked to eye strain", "Routine vision check-up", "Follow-up after eye surgery", "Reviewing a prescription or eye test report"],
    conditions: ["Refractive errors (near/far-sightedness)", "Conjunctivitis and eye infections", "Dry eye syndrome", "Cataract follow-up and referral", "Diabetic eye check-up guidance"],
    faq: [
      { q: "Can an eye number/prescription check be done online?", a: "An online consultation can review symptoms and existing prescriptions, but a full vision test typically needs an in-person visit with proper equipment." },
      { q: "What if I have sudden vision loss?", a: "Sudden vision loss needs urgent in-person medical attention — please visit an emergency room or eye hospital directly rather than waiting for an online appointment." },
      { q: "Can I consult about eye redness without visiting a clinic?", a: "Yes, general eye irritation and redness can often be assessed over video, with in-person follow-up recommended if needed." },
    ],
  },
  {
    slug: "dermatology-cosmetology",
    name: "Dermatology & Cosmetology",
    icon: "🧴",
    metaTitle: "Online Dermatology & Cosmetology Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Book an online dermatology consultation in Chennai for skin, hair, or nail concerns, plus cosmetology guidance, with verified specialists.",
    intro: "Dermatology & Cosmetology covers skin, hair, and nail health, as well as cosmetic skin treatments. Our specialists offer online video consultations across Chennai — a convenient way to get an opinion on skin concerns, often supported by sharing clear photos of the affected area before your call.",
    whenToConsult: ["Persistent acne or breakouts", "Skin rashes or irritation", "Hair loss or scalp concerns", "Unusual moles or skin changes", "Questions about cosmetic skin treatments", "Follow-up after a dermatology treatment"],
    conditions: ["Acne and breakouts", "Skin rashes and allergies", "Hair loss and scalp conditions", "Eczema and dry skin", "Cosmetic skin treatment guidance"],
    faq: [
      { q: "Can skin conditions really be diagnosed over a video call?", a: "For many common skin conditions, a specialist can assess visually over video, especially with clear photos shared beforehand — some cases may need an in-person exam for a closer look." },
      { q: "Should I send photos before my consultation?", a: "Yes, uploading clear, well-lit photos of the affected area to Documents before your appointment helps the specialist prepare and gives a clearer view than the video call alone." },
      { q: "Can cosmetic treatment options be discussed online?", a: "Yes, an initial discussion of options and suitability can happen over video, with an in-person visit needed for the actual treatment." },
    ],
  },
  {
    slug: "ent",
    name: "ENT",
    icon: "👂",
    metaTitle: "Online ENT Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult an ENT (Ear, Nose & Throat) specialist online in Chennai for sinus issues, hearing concerns, throat infections, and more.",
    intro: "ENT (Ear, Nose & Throat) specialists care for conditions affecting hearing, breathing, and the throat. Our ENT doctors are available online and in-person across Chennai for common concerns like sinus issues, throat infections, and hearing-related questions.",
    whenToConsult: ["Persistent sinus congestion or pressure", "Sore throat or difficulty swallowing", "Ear pain or reduced hearing", "Chronic cough or throat irritation", "Snoring or breathing concerns", "Recurring ear infections"],
    conditions: ["Sinusitis", "Tonsillitis and throat infections", "Ear infections", "Hearing-related concerns", "Allergic rhinitis"],
    faq: [
      { q: "Can sinus problems be treated through an online consultation?", a: "An ENT specialist can assess symptoms and guide initial care online; some cases may need an in-person exam depending on severity." },
      { q: "Can hearing loss be discussed in a video consultation?", a: "Yes, for an initial discussion — a full hearing test typically requires in-person equipment and may be recommended as a next step." },
      { q: "Do you treat children's ENT issues?", a: "Yes, our ENT specialists see both adult and paediatric patients — mention your child's age when booking." },
    ],
  },
  {
    slug: "adolescent-medicine",
    name: "Adolescent Medicine",
    icon: "🧑",
    metaTitle: "Online Adolescent Medicine Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Consult an adolescent medicine specialist in Chennai for teen health concerns — physical, developmental, and general wellbeing.",
    intro: "Adolescent Medicine focuses on the physical and developmental health of teenagers, bridging the gap between paediatric and adult care. Our specialists offer online and in-person consultations across Chennai for common teen health concerns.",
    whenToConsult: ["General teen health check-up", "Growth or development questions during adolescence", "Common illnesses in teenagers", "Questions specific to teen physical health", "Follow-up on an ongoing condition"],
    conditions: ["Adolescent growth and development", "General teen health concerns", "Follow-up care for ongoing conditions"],
    faq: [
      { q: "At what age does adolescent medicine apply?", a: "This specialty generally covers the teenage years, bridging paediatric and adult care — ask our team if you're unsure whether this or Paediatrics is the right fit for your child's age." },
      { q: "Can consultations be done privately with the teenager?", a: "Consultation arrangements can be discussed with the specialist directly — speak with them about what's appropriate for your family's situation." },
      { q: "Can this be done as an online consultation?", a: "Yes, many general health discussions and follow-ups can be handled over video, with in-person visits recommended when a physical examination is needed." },
    ],
  },
  {
    slug: "psychiatry",
    name: "Psychiatry",
    icon: "🛋️",
    metaTitle: "Online Psychiatry Consultation in Chennai | We Care 4 'all'",
    metaDescription: "Speak with a psychiatrist online in Chennai in a private, judgement-free space for anxiety, stress, sleep issues, or mental health support.",
    intro: "Psychiatry supports mental and emotional wellbeing. Our psychiatrists offer private, confidential online consultations across Chennai, making it easier to seek support for stress, anxiety, sleep difficulties, and other mental health concerns from the comfort of home.",
    whenToConsult: ["Persistent stress or anxiety", "Sleep difficulties", "Low mood lasting more than a couple of weeks", "Difficulty coping with daily life", "Follow-up on an existing mental health condition", "Seeking a confidential space to talk"],
    conditions: ["Anxiety-related concerns", "Sleep difficulties", "Stress management", "Mood-related concerns", "Ongoing mental health follow-up care"],
    faq: [
      { q: "Is my online psychiatry consultation confidential?", a: "Yes, all consultations are private and your information is handled according to our privacy policy — video calls run on our own secure system." },
      { q: "Can I talk to a psychiatrist without anyone finding out?", a: "Your consultation and health records are confidential and visible only to you and your treating doctor, in line with our privacy practices." },
      { q: "If I'm in crisis right now, should I book an online appointment?", a: "If you are in immediate crisis or having thoughts of self-harm, please contact a crisis helpline or go to the nearest emergency room right away rather than waiting for an online appointment." },
    ],
  },
];

export function getSpecialtyBySlug(slug) {
  return SPECIALTIES.find((s) => s.slug === slug) || null;
}
