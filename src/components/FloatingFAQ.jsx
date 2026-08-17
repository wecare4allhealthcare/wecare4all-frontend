/**
 * FloatingFAQ.jsx — floating bottom-right FAQ chat widget.
 *
 * Appears on every public page (imported in Layout.jsx).
 * Completely self-contained: no API calls, no props needed,
 * all Q&A is hardcoded here.
 *
 * UX flow:
 *   1. Floating green button (bottom-right corner, always visible)
 *   2. Click → panel slides up showing category tabs
 *   3. Pick category (Patient / Doctor / Hospital)
 *   4. Pick a question from the list
 *   5. Question appears as a "you" bubble, answer as a "WeCare" bubble
 *   6. "← Back" returns to the question list
 *   7. Click the X or the button again to close
 */
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// ── FAQ content ───────────────────────────────────────────────
const FAQ_EN = {
  patient: {
    label:    "Patient",
    icon:     "🧑‍💼",
    color:    "var(--wc-green)",
    bg:       "var(--wc-sage)",
    border:   "#86efac",
    questions: [
      {
        q: "How do I book an appointment?",
        a: "Go to 'Find Doctor' from the menu, browse or search for a doctor by specialization, then click their card. For a video consultation, booking is instant — there's no date or slot to pick, just confirm and pay, and the doctor accepts from there. For an in-person or home visit, pick a date and an available time slot instead. Either way, you'll receive an email confirmation immediately, and the doctor accepts or rejects within a short time.",
      },
      {
        q: "Can I book for a family member?",
        a: "Yes! Once logged in, go to 'Family Members' in your dashboard and add your family member (name, relationship, date of birth). When booking, select that family member from the 'Booking for' dropdown and their details will be filled automatically.",
      },
      {
        q: "What if all slots are booked for a date?",
        a: "For in-person or home visits, you can join the Waitlist for that doctor on that date — click 'Join Waitlist' when no slots are available. If a slot opens up (cancellation or rejection), you'll get an instant notification. You can view and cancel your waitlist entries from the Waitlist section in your dashboard.",
      },
      {
        q: "How do I join my video consultation?",
        a: "Once the doctor accepts your appointment and your payment is confirmed, a 'Join Video Call' button appears on your appointment card in the dashboard — video consultations are instant, so there's no scheduled window to wait for. The call runs on our own secure video system straight from your browser, with no app download or third-party video service needed.",
      },
      {
        q: "How do I cancel an appointment?",
        a: "Go to your Patient Dashboard, find the appointment under Upcoming, and click 'Cancel'. You can cancel any pending or approved appointment that hasn't started yet. If you've already paid, the payment is flagged for refund and our team processes it within 5–7 working days.",
      },
      {
        q: "Is my payment secure?",
        a: "Yes. You can pay via Razorpay or Stripe — both trusted payment gateways — and choose whichever you prefer at checkout. We never see or store your card details. The amount is set by us on the server and cannot be altered by the app. You'll receive a payment confirmation email with a reference ID.",
      },
      {
        q: "How do I view my prescription?",
        a: "After your appointment is marked completed, go to your dashboard and click '📋 Prescription' on the appointment card to view it on screen, or '⬇ Summary PDF' to download a personal copy. The PDF includes the doctor's notes and full medicine list.",
      },
      {
        q: "What is the home healthcare service?",
        a: "We offer professional healthcare at your doorstep — nursing care, physiotherapy, doctor home visits, ECG, blood sample collection, and more. Visit 'Home Healthcare' from the menu, browse services, pick a date and time, and we'll send a verified professional to your address.",
      },
      {
        q: "How do I contact my doctor after the appointment?",
        a: "Once a doctor has confirmed at least one appointment with you, they show up as a conversation in 'Messages' (💬 in your dashboard) — open it to message them directly. Support is also always available there as its own conversation, even before your first appointment. Chat with a specific doctor only unlocks after they've confirmed an appointment with you.",
      },
      {
        q: "How do I update my health profile?",
        a: "Log in → go to 'Health Profile' in your dashboard. You can add your height, weight, allergies, chronic conditions, current medications, and past surgeries. Doctors you consult with can view this before your appointment — it helps them prepare better.",
      },
      {
        q: "Can I leave a review for my doctor?",
        a: "Yes. Once an appointment is marked completed, a '⭐ Leave a Review' button appears on that appointment card in your dashboard. Rate your visit and add an optional comment — you can only review a completed appointment once, and it feeds into that doctor's public rating shown on the Find Doctors page.",
      },
      {
        q: "Can I upload lab reports or documents for my doctor to see?",
        a: "Yes, go to 'Documents' in your dashboard to upload lab reports, scans, or other files. Any doctor you've had an appointment with can view them under your Patient Brief when preparing for or reviewing your visit.",
      },
      // ── Added Aug 2026 (client feedback: "your FAQ is very limited") ──
      {
        q: "I didn't receive my OTP. What do I do?",
        a: "Wait 60 seconds and tap 'Resend OTP' — a fresh code is sent by SMS and email. Check your spam/promotions folder for the email copy. If it still hasn't arrived after two attempts, call our helpline at 90257 86467 and our team will verify your account manually.",
      },
      {
        q: "My payment was deducted but the appointment shows unpaid. What now?",
        a: "This can happen if the bank confirmation is delayed. Don't retry the payment immediately — check your Payment History in the dashboard first. If it still shows unpaid after 30 minutes, contact us at wecare4allchennai@gmail.com or 90257 86467 with your transaction/reference ID and we'll reconcile it, refunding any duplicate charge.",
      },
      {
        q: "How do I check my refund status?",
        a: "Go to your Patient Dashboard → Payment History. Refunds show a status of Pending, Processing, or Completed against the original appointment. Refunds are processed within 5–7 working days of a cancellation and the amount is returned to your original payment method.",
      },
      {
        q: "Can I reschedule an appointment instead of cancelling it?",
        a: "For in-person or home-visit appointments, cancel the current booking and book a new date/time slot with the same doctor — there's no separate reschedule button. For video consultations, since there's no fixed slot, simply cancel and book again when you're ready; the doctor accepts your new request just like the first time.",
      },
      {
        q: "What's the difference between a video consultation, in-person visit, and home healthcare?",
        a: "Video consultation: instant online call with a doctor from your phone/laptop, no travel. In-person visit: you go to the doctor's/hospital's location at a booked time slot. Home healthcare: a verified nurse, physiotherapist, or technician comes to your home for services like ECG, sample collection, or physiotherapy. Choose whichever fits your situation from the relevant menu item.",
      },
      {
        q: "How do I delete my account or request my data under DPDP?",
        a: "Email wecare4allchennai@gmail.com from your registered email address with the subject 'Data/Account Request'. Under India's DPDP Act, we'll respond with your data export or complete account deletion within the statutory timeline, after verifying your identity.",
      },
      {
        q: "What is the Digital Health Locker and Family Health Plan?",
        a: "The Digital Health Locker (in your dashboard) securely stores your prescriptions, reports, and documents in one place, accessible to any doctor you consult. Family Health Plans let you link family members under one account and manage everyone's appointments and records together — see 'Family Members' and 'Family Health Plans' in your dashboard menu.",
      },
    ],
  },

  doctor: {
    label:    "Doctor",
    icon:     "👨‍⚕️",
    color:    "var(--wc-teal)",
    bg:       "#eff8ff",
    border:   "#93c5fd",
    questions: [
      {
        q: "How do I join as a doctor?",
        a: "Doctor accounts are created by our admin team after credential verification. Contact us at wecare4allchennai@gmail.com or call 90257 86467 with your details (name, specialization, registration number). We verify your credentials and send your login details by email within 2 working days.",
      },
      {
        q: "How do I accept or reject appointments?",
        a: "Log in to your Doctor Dashboard. New appointment requests appear in the 'Today' and 'Upcoming' tabs with an Accept / Decline option. Before accepting, expand the 'Patient Brief' panel on each card to see the patient's health profile, past visits with you, and uploaded documents. Click Accept to confirm — the patient is notified instantly.",
      },
      {
        q: "How do I set my availability?",
        a: "Go to 'My Availability' from the doctor menu. Add weekly recurring slots by picking a day of the week, start time, end time, and slot duration in minutes (e.g. 15-min or 30-min slots). Patients will only be able to book within these windows. You can add multiple slots for the same day.",
      },
      {
        q: "What is 'Available Now' and how does it work?",
        a: "'Available Now' is an instant-consult flag. Toggle it on from your dashboard when you're free for immediate consultations — your card shows a green 'Available Now' badge on the public doctor listing. It auto-expires after 3 hours. Toggle it off any time. Patients can filter the doctor list to show only Available Now doctors.",
      },
      {
        q: "How do I block a date when I'm unavailable?",
        a: "Go to 'My Availability' and scroll to the 'Leave / Block Dates' section. Add a start and end date (even a single day). This blocks all slots on those dates regardless of your weekly schedule. Any patients waitlisted for those dates are notified automatically — you don't need to contact them manually.",
      },
      {
        q: "How do I transfer a patient to another doctor?",
        a: "On any pending or approved appointment, click '↪️ Transfer'. Select the target doctor from the dropdown and optionally add a reason. A real message is sent to that doctor in your shared chat thread. They see an Accept / Decline option on their dashboard. If they accept, the appointment moves to them automatically and the patient is notified.",
      },
      {
        q: "How do I add a prescription after the consultation?",
        a: "On your dashboard, click '📝 Notes' on an approved appointment. You can type free-form prescription notes and add structured medicines — medicine name, dosage, frequency, duration, and instructions per item. When you save, the appointment is marked completed and the patient can immediately download their prescription PDF.",
      },
      {
        q: "How do I see a patient's medical history before a consult?",
        a: "Every appointment card has a '👤 Patient Brief' button. Click it to open a panel with three tabs — History, Health Profile, and Documents. The History tab shows the patient's full appointment record (up to their 20 most recent visits) across every doctor on the platform, not just with you, giving you the complete clinical picture. Health Profile shows allergies, conditions, and medications, and Documents shows any lab reports or files they've uploaded.",
      },
    ],
  },

  hospital: {
    label:    "Hospital",
    icon:     "🏥",
    color:    "#6d28d9",
    bg:       "#faf5ff",
    border:   "#d8b4fe",
    questions: [
      {
        q: "How does our hospital partner with WeCare4All?",
        a: "Visit our 'Partner With Us' page (link in the footer or top menu) and fill the empanelment application. It covers your hospital profile, specialties, infrastructure, accreditations, and an authorised declaration. Once submitted, our admin team reviews it and contacts you within 3–5 working days.",
      },
      {
        q: "What are the partnership tiers?",
        a: "We offer three tiers — Basic, Growth, and Strategic — each with increasing visibility and features on the platform. Tier is assigned by our team based on your hospital's profile, capacity, and scope of services. You can discuss upgrading your tier with our team at any point.",
      },
      {
        q: "How do I access my hospital dashboard?",
        a: "Once your empanelment is approved, login credentials are emailed to your registered contact. Go to wecare4all.in/login and choose the 'Hospital' tab. Your dashboard gives you access to your profile, photos, commission records, and subscription billing.",
      },
      {
        q: "What can I manage from the hospital dashboard?",
        a: "From your dashboard you can: update your contact details and website, upload hospital photos, view commission records (updated by our team), and pay your subscription fee via Razorpay. If you're on a Growth or Strategic plan (once your subscription payment is complete), you also get a 'Banners' tab to upload promotional images and, on Strategic, a 'Videos' tab for promotional videos and doctor interview videos — these appear on your public hospital profile. Profile changes like tier, specialties, and accreditations are managed by our admin team to maintain verified status.",
      },
      {
        q: "How do commissions work?",
        a: "Commissions are tracked by our admin team based on agreed terms. When a commission becomes due or is settled, you'll see it appear in the 'Commissions' tab of your dashboard with the status and amount. All commission rates are agreed upon at the time of empanelment and documented in your partnership agreement.",
      },
      {
        q: "How is our hospital displayed publicly?",
        a: "Approved hospital partners get a teaser preview shown to every visitor — a rotating card/marquee on the Home page and other public pages, sorted by tier (Strategic first, then Growth, then Basic). The full listing at 'Our Hospitals' and each hospital's detailed profile page (bed count, specialties, infrastructure, Gallery, and — once uploaded — Growth+ 'Promotions' banners and Strategic 'Videos') is only visible to people logged in as a patient, hospital, or admin account — a visitor is prompted to log in before they can open the full list or a hospital's profile.",
      },
      {
        q: "What do I do if I forgot my hospital login password?",
        a: "Contact us at wecare4allchennai@gmail.com or call 90257 86467. Our admin team can reset your password and send new credentials to your registered email within the same working day.",
      },
    ],
  },

  pharmacy: {
    label:    "Pharmacy",
    icon:     "💊",
    color:    "#b45309",
    bg:       "#fffbeb",
    border:   "#fde68a",
    questions: [
      {
        q: "How do I register my pharmacy?",
        a: "Go to the Pharmacy sign-up page (or pick 'Pharmacy' on the staff login screen and follow the sign-up link) and fill in your pharmacy name, owner/contact person, email, phone, address, and Drug License Number. This creates your account instantly with 'Application under review' status — no waiting for admin to create it for you.",
      },
      {
        q: "How long until my pharmacy goes live?",
        a: "After sign-up your application shows 'Application under review' while our team verifies it. Once approved, your dashboard's Plan & Billing tab unlocks — choose a plan and complete payment (Razorpay or manual UPI, verified by admin) to go live. Only after both application approval AND an active subscription will you start receiving orders.",
      },
      {
        q: "How do I receive and fulfil orders?",
        a: "Once live, the Orders tab lists incoming prescription orders from patients (sent there by their doctor after a completed appointment, or placed directly by the patient). Open an order to see the prescription and patient details, enter the total amount, then move it forward: Confirm Order → Start Preparing → Mark Out for Delivery → Mark Delivered. The patient sees each status update on their own Pharmacy Orders page.",
      },
      {
        q: "Can I cancel an order?",
        a: "Yes, from the order detail view. Cancelling asks for confirmation first since it notifies the patient.",
      },
      {
        q: "What if my subscription payment needs verification?",
        a: "If you pay via manual UPI, your subscription shows 'Pending Verification' until admin confirms the payment reference — this usually clears within the same working day. Razorpay payments are verified instantly.",
      },
      {
        q: "What do I do if I forgot my pharmacy login password?",
        a: "Contact us at wecare4allchennai@gmail.com or call 90257 86467. Our admin team can reset your password and send new credentials to your registered email within the same working day.",
      },
    ],
  },

  lab: {
    label:    "Lab Center",
    icon:     "🧪",
    color:    "var(--wc-teal)",
    bg:       "#eff8ff",
    border:   "#93c5fd",
    questions: [
      {
        q: "How do I register my lab center?",
        a: "Go to the Lab Center sign-up page (or pick 'Lab Center' on the staff login screen and follow the sign-up link) and fill in your lab name, owner/contact person, email, phone, address, and NABL / Registration Number. Your account is created instantly with 'Application under review' status.",
      },
      {
        q: "How long until my lab goes live?",
        a: "Same process as pharmacy partners: after admin approves your application, your dashboard's Plan & Billing tab unlocks — choose a plan and complete payment to go live. You need both an approved application AND an active subscription before test booking requests start coming in.",
      },
      {
        q: "How do I handle an incoming test booking?",
        a: "Live bookings appear in your Bookings tab as 'New Request'. Accept or reject it — once accepted, move it forward through the flow: Confirm → Mark Sample Collected → Start Processing → Mark Report Ready. Home-collection bookings show the patient's address; center-visit bookings don't need one. The patient tracks the same status from their own dashboard.",
      },
      {
        q: "Can I reject a booking?",
        a: "Yes, but only while it's still at 'New Request' — once you've confirmed it, it can only be cancelled, not rejected, since the patient is already expecting the service.",
      },
      {
        q: "What do I do if I forgot my lab login password?",
        a: "Contact us at wecare4allchennai@gmail.com or call 90257 86467. Our admin team can reset your password and send new credentials to your registered email within the same working day.",
      },
    ],
  },

  company: {
    label:    "Company",
    icon:     "🏢",
    color:    "#6d28d9",
    bg:       "#faf5ff",
    border:   "#d8b4fe",
    questions: [
      {
        q: "How does our company sign up for Corporate Wellness?",
        a: "There's no open self-registration — start with the enquiry form on the Corporate Wellness page ('Need a custom package instead?'). Fill in your company name, contact person, work email, mobile, and team size. Our admin team reviews it and, once approved, emails your contact person a one-time invite link to complete account setup — that link is the only way to reach the actual sign-up page.",
      },
      {
        q: "How do I add employees once we're set up?",
        a: "From your Company Dashboard's Employees tab, add employees one at a time or in bulk. Each employee gets a Patient ID starting with your company's assigned prefix (e.g. ACME-0001) and a temporary password, emailed to them automatically as a welcome email.",
      },
      {
        q: "How do employees log in?",
        a: "Employees log in with their Patient ID + password at the Employee Login page (also linked from the main login screen's staff dropdown) — not with an OTP, since their account was created for them directly rather than through self-signup.",
      },
      {
        q: "Can employees book appointments and use home healthcare?",
        a: "Yes — once logged in, an added employee has the same booking access as any patient account (find a doctor, book appointments, home healthcare, lab tests), and your company's booking mode (self-pay or company-sponsored) determines who's billed.",
      },
      {
        q: "How do we manage billing?",
        a: "The Billing tab in your Company Dashboard shows your current plan and lets you subscribe or change plans. Some sections of the dashboard — Employees, Appointments, Analytics — stay locked until your company's subscription is active.",
      },
      {
        q: "What do I do if an HR admin forgot their password?",
        a: "Contact us at wecare4allchennai@gmail.com or call 90257 86467. Our admin team can reset the password and send new credentials to the registered email within the same working day.",
      },
    ],
  },
};

// ── தமிழ் மொழிபெயர்ப்பு (Tamil translation) ──────────────────────
// Added Aug 2026 per client feedback: "when we change the language to
// tamil, chat bot is still in english?" — mirrors FAQ_EN exactly
// (same categories, same order, same colors/icons) so switching FAQ_EN
// ⇄ FAQ_TA in the component below just swaps language, nothing else.
// NOTE FOR CLIENT: this is a first-pass translation of medical/policy
// content — please have a Tamil-speaking team member read through it
// before treating it as final, especially the payment/refund and DPDP
// wording, since those carry legal weight.
const FAQ_TA = {
  patient: {
    label:    "நோயாளி",
    icon:     "🧑‍💼",
    color:    "var(--wc-green)",
    bg:       "var(--wc-sage)",
    border:   "#86efac",
    questions: [
      {
        q: "நான் எப்படி அப்பாயின்மென்ட் பதிவு செய்வது?",
        a: "மெனுவிலிருந்து 'Find Doctor' சென்று, சிறப்பு பிரிவின் அடிப்படையில் மருத்துவரைத் தேடி, அவரது கார்டை கிளிக் செய்யவும். வீடியோ கலந்தாலோசனைக்கு உடனடி பதிவு — தேதி/நேரம் தேர்வு தேவையில்லை, உறுதிப்படுத்தி பணம் செலுத்தினால் போதும், மருத்துவர் ஏற்றுக்கொள்வார். நேரடி சந்திப்பு அல்லது வீட்டு வருகைக்கு தேதி மற்றும் நேர இடைவெளியைத் தேர்ந்தெடுக்கவும். இரண்டு விதத்திலும் உடனடியாக ஈமெயில் உறுதிப்படுத்தல் கிடைக்கும், மருத்துவர் சிறிது நேரத்தில் ஏற்பார் அல்லது நிராகரிப்பார்.",
      },
      {
        q: "குடும்ப உறுப்பினருக்காக பதிவு செய்யலாமா?",
        a: "ஆம்! உள்நுழைந்தபின், உங்கள் டாஷ்போர்டில் 'Family Members' சென்று உங்கள் குடும்ப உறுப்பினரைச் சேர்க்கவும் (பெயர், உறவு, பிறந்த தேதி). பதிவு செய்யும்போது 'Booking for' dropdown-ல் அவரைத் தேர்ந்தெடுத்தால் விவரங்கள் தானாக நிரப்பப்படும்.",
      },
      {
        q: "ஒரு தேதிக்கு எல்லா ஸ்லாட்களும் நிரம்பியிருந்தால்?",
        a: "நேரடி சந்திப்பு அல்லது வீட்டு வருகைக்கு, அந்த மருத்துவருக்கு அந்த தேதிக்கான Waitlist-ல் சேரலாம் — ஸ்லாட் இல்லாதபோது 'Join Waitlist' கிளிக் செய்யவும். ஒரு ஸ்லாட் காலியானால் (ரத்து/நிராகரிப்பு), உடனடி அறிவிப்பு வரும். உங்கள் டாஷ்போர்டின் Waitlist பிரிவில் உங்கள் entries-ஐ பார்க்கவும், ரத்து செய்யவும் முடியும்.",
      },
      {
        q: "என் வீடியோ கலந்தாலோசனையில் எப்படி இணைவது?",
        a: "மருத்துவர் உங்கள் அப்பாயின்மென்டை ஏற்று, பணம் உறுதிப்படுத்தப்பட்டவுடன், டாஷ்போர்டில் உங்கள் அப்பாயின்மென்ட் கார்டில் 'Join Video Call' பட்டன் தோன்றும் — வீடியோ கலந்தாலோசனைகள் உடனடியானவை, குறிப்பிட்ட நேரத்திற்காக காத்திருக்க வேண்டியதில்லை. கால் எங்கள் சொந்த பாதுகாப்பான வீடியோ சிஸ்டத்தில் உங்கள் பிரவுசரிலேயே நடக்கும் — எந்த ஆப் தேவையில்லை.",
      },
      {
        q: "அப்பாயின்மென்டை எப்படி ரத்து செய்வது?",
        a: "உங்கள் Patient Dashboard சென்று, Upcoming-ல் அப்பாயின்மென்டைக் கண்டறிந்து 'Cancel' கிளிக் செய்யவும். தொடங்காத எந்த pending/approved அப்பாயின்மென்டையும் ரத்து செய்யலாம். ஏற்கனவே பணம் செலுத்தியிருந்தால், அது ரீஃபண்டுக்கு flag செய்யப்பட்டு எங்கள் குழு 5–7 வேலை நாட்களில் செயல்படுத்தும்.",
      },
      {
        q: "என் பணம் செலுத்துதல் பாதுகாப்பானதா?",
        a: "ஆம். Razorpay அல்லது Stripe மூலம் செலுத்தலாம் — இரண்டும் நம்பகமான payment gateways — checkout-ல் நீங்கள் விரும்பியதைத் தேர்ந்தெடுக்கலாம். உங்கள் கார்டு விவரங்களை நாங்கள் ஒருபோதும் பார்க்க/சேமிக்க மாட்டோம். தொகை சர்வரில் நாங்களே நிர்ணயிக்கிறோம், ஆப் மாற்ற முடியாது. reference ID-உடன் payment confirmation ஈமெயில் கிடைக்கும்.",
      },
      {
        q: "என் மருந்துச் சீட்டை (prescription) எப்படி பார்ப்பது?",
        a: "உங்கள் அப்பாயின்மென்ட் completed என குறிக்கப்பட்டவுடன், டாஷ்போர்டில் அப்பாயின்மென்ட் கார்டில் '📋 Prescription' கிளிக் செய்து திரையில் பார்க்கலாம், அல்லது '⬇ Summary PDF' மூலம் download செய்யலாம். PDF-ல் மருத்துவரின் notes மற்றும் முழு மருந்துப் பட்டியல் இருக்கும்.",
      },
      {
        q: "Home Healthcare சேவை என்றால் என்ன?",
        a: "உங்கள் வீட்டு வாசலிலேயே தொழில்முறை சுகாதார சேவை — நர்சிங், பிசியோதெரபி, மருத்துவர் வீட்டு வருகை, ECG, இரத்த மாதிரி சேகரிப்பு மற்றும் பல. மெனுவிலிருந்து 'Home Healthcare' சென்று, சேவைகளைப் பாருங்கள், தேதி/நேரத்தைத் தேர்ந்தெடுத்தால், சரிபார்க்கப்பட்ட நிபுணரை உங்கள் முகவரிக்கு அனுப்புவோம்.",
      },
      {
        q: "அப்பாயின்மென்டுக்குப் பின் என் மருத்துவரை எப்படி தொடர்பு கொள்வது?",
        a: "மருத்துவர் உங்களுடன் குறைந்தது ஒரு அப்பாயின்மென்டை உறுதிப்படுத்தியவுடன், உங்கள் டாஷ்போர்டில் 'Messages' (💬) பிரிவில் அவர் ஒரு conversation-ஆக தோன்றுவார் — திறந்து நேரடியாக message அனுப்பலாம். Support conversation எப்போதும் கிடைக்கும், முதல் அப்பாயின்மென்டுக்கு முன்பே. ஒரு குறிப்பிட்ட மருத்துவருடன் chat, அவர் அப்பாயின்மென்ட் ஏற்றபின்தான் திறக்கும்.",
      },
      {
        q: "என் ஹெல்த் ப்ரொஃபைலை எப்படி புதுப்பிப்பது?",
        a: "உள்நுழைந்து → டாஷ்போர்டில் 'Health Profile' செல்லவும். உயரம், எடை, அலர்ஜிகள், நீண்டகால நோய்கள், தற்போதைய மருந்துகள், முந்தைய அறுவை சிகிச்சைகளைச் சேர்க்கலாம். நீங்கள் கலந்தாலோசிக்கும் மருத்துவர்கள் அப்பாயின்மென்டுக்கு முன் இதைப் பார்க்க முடியும் — சிறப்பாக தயார் செய்ய உதவும்.",
      },
      {
        q: "என் மருத்துவருக்கு review கொடுக்கலாமா?",
        a: "ஆம். அப்பாயின்மென்ட் completed ஆனவுடன், டாஷ்போர்டில் அந்த கார்டில் '⭐ Leave a Review' பட்டன் தோன்றும். உங்கள் அனுபவத்தை rate செய்து, விருப்பமான கமெண்டையும் சேர்க்கலாம் — ஒரு completed அப்பாயின்மென்டுக்கு ஒரே ஒரு review மட்டும், இது Find Doctors பக்கத்தில் அந்த மருத்துவரின் public rating-ஐ பாதிக்கும்.",
      },
      {
        q: "என் மருத்துவர் பார்க்க lab reports/documents upload செய்யலாமா?",
        a: "ஆம், உங்கள் டாஷ்போர்டில் 'Documents' சென்று lab reports, scans அல்லது பிற கோப்புகளை upload செய்யலாம். உங்களுடன் அப்பாயின்மென்ட் வைத்திருந்த எந்த மருத்துவரும் உங்கள் Patient Brief-ல் இவற்றைப் பார்க்க முடியும்.",
      },
      {
        q: "எனக்கு OTP வரவில்லை. என்ன செய்வது?",
        a: "60 விநாடிகள் காத்திருந்து 'Resend OTP' தட்டவும் — SMS மற்றும் ஈமெயில் மூலம் புதிய குறியீடு அனுப்பப்படும். ஈமெயில் spam/promotions folder-ஐயும் சரிபார்க்கவும். இரண்டு முறை முயற்சித்தும் வரவில்லை என்றால், 90257 86467-ல் அழைக்கவும், எங்கள் குழு உங்கள் கணக்கை நேரடியாக சரிபார்க்கும்.",
      },
      {
        q: "பணம் கழிக்கப்பட்டது, ஆனால் அப்பாயின்மென்ட் 'unpaid' என்று காட்டுகிறது. என்ன செய்வது?",
        a: "வங்கி உறுதிப்படுத்தல் தாமதமானால் இது நடக்கலாம். உடனடியாக மீண்டும் பணம் செலுத்த வேண்டாம் — முதலில் டாஷ்போர்டில் Payment History-ஐ சரிபார்க்கவும். 30 நிமிடங்களுக்குப் பின்பும் unpaid என்றால், transaction/reference ID-உடன் wecare4allchennai@gmail.com அல்லது 90257 86467-ல் தொடர்பு கொள்ளவும் — நாங்கள் சரிசெய்து, இரட்டை கட்டணம் இருந்தால் ரீஃபண்ட் செய்வோம்.",
      },
      {
        q: "என் ரீஃபண்ட் நிலையை எப்படி பார்ப்பது?",
        a: "உங்கள் Patient Dashboard → Payment History சென்று பாருங்கள். ரீஃபண்டுகள் Pending, Processing அல்லது Completed என்ற நிலையில் அசல் அப்பாயின்மென்டுக்கு எதிராக காட்டப்படும். ரத்து செய்த 5–7 வேலை நாட்களில் ரீஃபண்ட் செயல்படுத்தப்பட்டு, உங்கள் அசல் payment method-க்கு தொகை திரும்பும்.",
      },
      {
        q: "ரத்து செய்யாமல் அப்பாயின்மென்டை reschedule செய்யலாமா?",
        a: "நேரடி சந்திப்பு/வீட்டு வருகைக்கு, தற்போதைய பதிவை ரத்து செய்து அதே மருத்துவருடன் புதிய தேதி/நேரத்தை பதிவு செய்யவும் — தனி reschedule பட்டன் இல்லை. வீடியோ கலந்தாலோசனைக்கு, குறிப்பிட்ட ஸ்லாட் இல்லாததால், ரத்து செய்து தயாராகும்போது மீண்டும் பதிவு செய்யலாம்; மருத்துவர் முதல் முறை போலவே ஏற்றுக்கொள்வார்.",
      },
      {
        q: "வீடியோ கலந்தாலோசனை, நேரடி சந்திப்பு, Home Healthcare — வேறுபாடு என்ன?",
        a: "வீடியோ கலந்தாலோசனை: உங்கள் ஃபோன்/லேப்டாப்பில் இருந்து உடனடி ஆன்லைன் கால், பயணம் தேவையில்லை. நேரடி சந்திப்பு: பதிவு செய்த நேரத்தில் மருத்துவர்/மருத்துவமனை இடத்திற்கு நீங்கள் செல்ல வேண்டும். Home Healthcare: சரிபார்க்கப்பட்ட நர்ஸ், பிசியோதெரபிஸ்ட் அல்லது டெக்னீஷியன் உங்கள் வீட்டிற்கு வந்து ECG, மாதிரி சேகரிப்பு, பிசியோதெரபி போன்ற சேவைகளை செய்வார். உங்கள் தேவைக்கு ஏற்ப மெனுவிலிருந்து தேர்ந்தெடுக்கவும்.",
      },
      {
        q: "DPDP சட்டத்தின் கீழ் என் கணக்கை நீக்க அல்லது தரவைக் கோர எப்படி?",
        a: "'Data/Account Request' என்ற subject-உடன் உங்கள் பதிவு செய்யப்பட்ட ஈமெயிலிலிருந்து wecare4allchennai@gmail.com-க்கு ஈமெயில் அனுப்பவும். இந்தியாவின் DPDP சட்டத்தின் கீழ், உங்கள் அடையாளத்தை சரிபார்த்தபின், சட்டப்பூர்வ காலவரையறைக்குள் உங்கள் தரவு export அல்லது முழுமையான கணக்கு நீக்கத்துடன் பதிலளிப்போம்.",
      },
      {
        q: "Digital Health Locker மற்றும் Family Health Plan என்றால் என்ன?",
        a: "Digital Health Locker (உங்கள் டாஷ்போர்டில்) உங்கள் மருந்துச் சீட்டுகள், reports, documents ஆகியவற்றை ஒரே இடத்தில் பாதுகாப்பாக சேமிக்கும், நீங்கள் கலந்தாலோசிக்கும் எந்த மருத்துவரும் அணுகலாம். Family Health Plans மூலம் குடும்ப உறுப்பினர்களை ஒரே கணக்கின் கீழ் இணைத்து, அனைவரின் அப்பாயின்மென்ட்கள் மற்றும் records-ஐ ஒன்றாக நிர்வகிக்கலாம் — உங்கள் டாஷ்போர்டு மெனுவில் 'Family Members' மற்றும் 'Family Health Plans' பார்க்கவும்.",
      },
    ],
  },

  doctor: {
    label:    "மருத்துவர்",
    icon:     "👨‍⚕️",
    color:    "var(--wc-teal)",
    bg:       "#eff8ff",
    border:   "#93c5fd",
    questions: [
      {
        q: "மருத்துவராக நான் எப்படி சேர்வது?",
        a: "தகுதி சரிபார்ப்புக்குப் பின் எங்கள் admin குழுவால் மருத்துவர் கணக்குகள் உருவாக்கப்படும். wecare4allchennai@gmail.com அல்லது 90257 86467-ல் உங்கள் விவரங்களுடன் (பெயர், சிறப்புத்துறை, பதிவு எண்) தொடர்பு கொள்ளவும். உங்கள் தகுதிகளை சரிபார்த்து, 2 வேலை நாட்களில் உள்நுழைவு விவரங்களை ஈமெயில் மூலம் அனுப்புவோம்.",
      },
      {
        q: "அப்பாயின்மென்ட்களை எப்படி ஏற்பது/நிராகரிப்பது?",
        a: "உங்கள் Doctor Dashboard-ல் உள்நுழையவும். புதிய அப்பாயின்மென்ட் கோரிக்கைகள் 'Today' மற்றும் 'Upcoming' tabs-ல் Accept/Decline விருப்பத்துடன் தோன்றும். ஏற்கும் முன், ஒவ்வொரு கார்டிலும் 'Patient Brief' panel-ஐ விரித்து நோயாளியின் health profile, முந்தைய வருகைகள், upload செய்த documents-ஐ பாருங்கள். Accept கிளிக் செய்தால், நோயாளிக்கு உடனடி அறிவிப்பு போகும்.",
      },
      {
        q: "என் கிடைக்கும் நேரத்தை (availability) எப்படி அமைப்பது?",
        a: "மருத்துவர் மெனுவிலிருந்து 'My Availability' செல்லவும். வார நாள், தொடக்க நேரம், முடிவு நேரம், ஸ்லாட் நீளம் (நிமிடங்களில்) தேர்ந்தெடுத்து recurring ஸ்லாட்களைச் சேர்க்கலாம். நோயாளிகள் இந்த window-க்குள் மட்டுமே பதிவு செய்ய முடியும். ஒரே நாளுக்கு பல ஸ்லாட்களையும் சேர்க்கலாம்.",
      },
      {
        q: "'Available Now' என்றால் என்ன, எப்படி வேலை செய்கிறது?",
        a: "'Available Now' ஒரு உடனடி-கலந்தாலோசனை flag. உடனடி கலந்தாலோசனைக்கு நேரம் இருக்கும்போது, உங்கள் டாஷ்போர்டில் இதை ஆன் செய்யவும் — public doctor listing-ல் உங்கள் கார்டில் பச்சை 'Available Now' badge தோன்றும். இது 3 மணி நேரத்தில் தானாக expire ஆகும். எப்போது வேண்டுமானாலும் ஆஃப் செய்யலாம். Available Now மருத்துவர்களை மட்டும் காட்ட நோயாளிகள் filter செய்யலாம்.",
      },
      {
        q: "நான் இல்லாத தேதியை எப்படி block செய்வது?",
        a: "'My Availability' சென்று 'Leave / Block Dates' பிரிவுக்கு scroll செய்யவும். தொடக்க மற்றும் முடிவு தேதியைச் சேர்க்கவும் (ஒரு நாள் கூட ஆகலாம்). இது உங்கள் வார அட்டவணையை பொருட்படுத்தாமல் அந்த தேதிகளில் உள்ள எல்லா ஸ்லாட்களையும் block செய்யும். அந்த தேதிகளுக்கு waitlist-ல் உள்ள நோயாளிகளுக்கு தானாக அறிவிப்பு போகும்.",
      },
      {
        q: "ஒரு நோயாளியை மற்றொரு மருத்துவருக்கு எப்படி transfer செய்வது?",
        a: "எந்த pending/approved அப்பாயின்மென்டிலும் '↪️ Transfer' கிளிக் செய்யவும். dropdown-ல் இருந்து இலக்கு மருத்துவரைத் தேர்ந்தெடுத்து, விருப்பமான காரணத்தையும் சேர்க்கலாம். அந்த மருத்துவருக்கு உங்கள் shared chat thread-ல் ஒரு உண்மையான message போகும். அவர் dashboard-ல் Accept/Decline பார்ப்பார். ஏற்றால், அப்பாயின்மென்ட் தானாக அவருக்கு மாறும், நோயாளிக்கும் அறிவிப்பு போகும்.",
      },
      {
        q: "கலந்தாலோசனைக்குப் பிறகு prescription-ஐ எப்படி சேர்ப்பது?",
        a: "டாஷ்போர்டில், approved அப்பாயின்மென்டில் '📝 Notes' கிளிக் செய்யவும். free-form prescription notes எழுதலாம், structured medicines-ஐயும் (மருந்து பெயர், dosage, frequency, duration, instructions) சேர்க்கலாம். save செய்தவுடன், அப்பாயின்மென்ட் completed என குறிக்கப்பட்டு நோயாளி உடனடியாக prescription PDF-ஐ download செய்யலாம்.",
      },
      {
        q: "கலந்தாலோசனைக்கு முன் நோயாளியின் medical history-ஐ எப்படி பார்ப்பது?",
        a: "ஒவ்வொரு அப்பாயின்மென்ட் கார்டிலும் '👤 Patient Brief' பட்டன் உள்ளது. கிளிக் செய்தால் History, Health Profile, Documents என மூன்று tabs கொண்ட panel திறக்கும். History tab நோயாளியின் முழு platform-முழுவதிலான appointment record-ஐ (சமீபத்திய 20 வரை) காட்டும் — உங்களுடன் மட்டுமல்ல, முழுமையான picture கிடைக்கும். Health Profile allergies, conditions, medications-ஐயும், Documents அவர்கள் upload செய்த lab reports/files-ஐயும் காட்டும்.",
      },
    ],
  },

  hospital: {
    label:    "மருத்துவமனை",
    icon:     "🏥",
    color:    "#6d28d9",
    bg:       "#faf5ff",
    border:   "#d8b4fe",
    questions: [
      {
        q: "எங்கள் மருத்துவமனை WeCare4All-உடன் எப்படி partner ஆகும்?",
        a: "எங்கள் 'Partner With Us' பக்கத்திற்குச் சென்று (footer அல்லது மேல் மெனுவில் லிங்க்) empanelment விண்ணப்பத்தை நிரப்பவும். இதில் உங்கள் மருத்துவமனை profile, சிறப்புத்துறைகள், infrastructure, accreditations, ஒரு authorised declaration அடங்கும். சமர்ப்பித்தபின், எங்கள் admin குழு அதை review செய்து 3–5 வேலை நாட்களில் உங்களைத் தொடர்பு கொள்ளும்.",
      },
      {
        q: "partnership tiers என்னென்ன?",
        a: "நாங்கள் மூன்று tiers வழங்குகிறோம் — Basic, Growth, Strategic — ஒவ்வொன்றும் platform-ல் அதிகரிக்கும் visibility மற்றும் features கொண்டது. உங்கள் மருத்துவமனையின் profile, capacity, சேவை scope அடிப்படையில் எங்கள் குழு tier ஒதுக்கும். எப்போது வேண்டுமானாலும் உங்கள் tier-ஐ upgrade செய்ய எங்கள் குழுவுடன் பேசலாம்.",
      },
      {
        q: "என் மருத்துவமனை dashboard-ஐ எப்படி access செய்வது?",
        a: "உங்கள் empanelment approve ஆனவுடன், உங்கள் பதிவு செய்யப்பட்ட contact-க்கு உள்நுழைவு விவரங்கள் ஈமெயில் செய்யப்படும். wecare4all.in/login சென்று 'Hospital' tab-ஐ தேர்ந்தெடுக்கவும். உங்கள் dashboard-ல் profile, photos, commission records, subscription billing அணுக முடியும்.",
      },
      {
        q: "hospital dashboard-ல் இருந்து என்ன manage செய்ய முடியும்?",
        a: "உங்கள் dashboard-ல் இருந்து: contact details மற்றும் website-ஐ update செய்யலாம், hospital photos upload செய்யலாம், commission records பார்க்கலாம் (எங்கள் குழுவால் update செய்யப்படும்), Razorpay மூலம் subscription fee செலுத்தலாம். Growth அல்லது Strategic plan-ல் இருந்தால் (subscription payment முடிந்தபின்), promotional images upload செய்ய 'Banners' tab-ஐயும், Strategic-ல் promotional/doctor interview videos-க்கு 'Videos' tab-ஐயும் பெறுவீர்கள் — இவை உங்கள் public hospital profile-ல் தோன்றும். Tier, சிறப்புத்துறைகள், accreditations போன்ற profile மாற்றங்கள் verified status பராமரிக்க எங்கள் admin குழுவால் நிர்வகிக்கப்படும்.",
      },
      {
        q: "commissions எப்படி வேலை செய்யும்?",
        a: "ஒப்புக்கொள்ளப்பட்ட நிபந்தனைகளின் அடிப்படையில் commissions எங்கள் admin குழுவால் கண்காணிக்கப்படும். ஒரு commission due ஆகும்போது அல்லது settle ஆகும்போது, உங்கள் dashboard-ன் 'Commissions' tab-ல் status மற்றும் தொகையுடன் தோன்றும். எல்லா commission rates-ம் empanelment நேரத்தில் ஒப்புக்கொள்ளப்பட்டு உங்கள் partnership agreement-ல் documented செய்யப்படும்.",
      },
      {
        q: "எங்கள் மருத்துவமனை public-ஆக எப்படி காட்டப்படும்?",
        a: "Approved hospital partners-க்கு ஒவ்வொரு visitor-க்கும் ஒரு teaser preview காட்டப்படும் — Home பக்கம் மற்றும் பிற public பக்கங்களில் rotating card/marquee, tier அடிப்படையில் sort செய்யப்பட்டு (Strategic முதலில், பின் Growth, பின் Basic). 'Our Hospitals'-ல் உள்ள முழு listing மற்றும் ஒவ்வொரு மருத்துவமனையின் விரிவான profile பக்கமும் (bed count, சிறப்புத்துறைகள், infrastructure, Gallery, மற்றும் upload செய்யப்பட்டால் Growth+ 'Promotions' banners, Strategic 'Videos') patient/hospital/admin கணக்குடன் login செய்தவர்களுக்கு மட்டுமே தெரியும் — ஒரு visitor முழு list அல்லது profile-ஐ திறக்க முன் login செய்ய கேட்கப்படுவார்.",
      },
      {
        q: "என் hospital login password மறந்துவிட்டால் என்ன செய்வது?",
        a: "wecare4allchennai@gmail.com அல்லது 90257 86467-ல் தொடர்பு கொள்ளவும். எங்கள் admin குழு உங்கள் password-ஐ reset செய்து, அதே வேலை நாளில் புதிய credentials-ஐ உங்கள் பதிவு செய்யப்பட்ட ஈமெயிலுக்கு அனுப்பும்.",
      },
    ],
  },

  pharmacy: {
    label:    "மருந்தகம்",
    icon:     "💊",
    color:    "#b45309",
    bg:       "#fffbeb",
    border:   "#fde68a",
    questions: [
      {
        q: "என் மருந்தகத்தை எப்படி register செய்வது?",
        a: "Pharmacy sign-up பக்கத்திற்குச் செல்லவும் (அல்லது staff login screen-ல் 'Pharmacy' தேர்ந்தெடுத்து sign-up லிங்கைப் பின்பற்றவும்) மற்றும் உங்கள் மருந்தக பெயர், உரிமையாளர்/தொடர்பு நபர், ஈமெயில், போன், முகவரி, Drug License Number-ஐ நிரப்பவும். இது 'Application under review' நிலையுடன் உடனடியாக உங்கள் கணக்கை உருவாக்கும் — admin காத்திருக்க வேண்டாம்.",
      },
      {
        q: "என் மருந்தகம் எப்போது live ஆகும்?",
        a: "sign-up செய்தபின் உங்கள் விண்ணப்பம் 'Application under review' காட்டும், எங்கள் குழு சரிபார்க்கும்போது. approve ஆனவுடன், dashboard-ன் Plan & Billing tab திறக்கும் — ஒரு plan தேர்ந்தெடுத்து பணம் செலுத்தி (Razorpay அல்லது manual UPI, admin-ஆல் verify செய்யப்படும்) live ஆகலாம். விண்ணப்ப approval மற்றும் active subscription இரண்டும் இருந்தால் மட்டுமே orders வரத் தொடங்கும்.",
      },
      {
        q: "orders-ஐ எப்படி பெறுவது/நிறைவேற்றுவது?",
        a: "live ஆனவுடன், Orders tab-ல் நோயாளிகளிடமிருந்து வரும் prescription orders பட்டியலிடப்படும் (அப்பாயின்மென்ட் முடிந்தபின் மருத்துவரால் அனுப்பப்படும், அல்லது நோயாளியால் நேரடியாக வைக்கப்படும்). ஒரு order-ஐத் திறந்து prescription மற்றும் patient details பாருங்கள், மொத்த தொகையை உள்ளிட்டு, முன்னேற்றுங்கள்: Confirm Order → Start Preparing → Mark Out for Delivery → Mark Delivered. நோயாளி தன் Pharmacy Orders பக்கத்தில் ஒவ்வொரு status update-ஐயும் பார்ப்பார்.",
      },
      {
        q: "ஒரு order-ஐ ரத்து செய்யலாமா?",
        a: "ஆம், order detail view-ல் இருந்து. ரத்து செய்வது நோயாளிக்கு அறிவிப்பதால், முதலில் உறுதிப்படுத்தல் கேட்கும்.",
      },
      {
        q: "என் subscription payment verification தேவைப்பட்டால்?",
        a: "manual UPI மூலம் செலுத்தினால், admin payment reference-ஐ உறுதிப்படுத்தும் வரை subscription 'Pending Verification' காட்டும் — வழக்கமாக அதே வேலை நாளில் clear ஆகும். Razorpay payments உடனடியாக verify ஆகும்.",
      },
      {
        q: "என் pharmacy login password மறந்துவிட்டால் என்ன செய்வது?",
        a: "wecare4allchennai@gmail.com அல்லது 90257 86467-ல் தொடர்பு கொள்ளவும். எங்கள் admin குழு password-ஐ reset செய்து, அதே வேலை நாளில் புதிய credentials-ஐ உங்கள் பதிவு செய்யப்பட்ட ஈமெயிலுக்கு அனுப்பும்.",
      },
    ],
  },

  lab: {
    label:    "லேப் சென்டர்",
    icon:     "🧪",
    color:    "var(--wc-teal)",
    bg:       "#eff8ff",
    border:   "#93c5fd",
    questions: [
      {
        q: "என் லேப் சென்டரை எப்படி register செய்வது?",
        a: "Lab Center sign-up பக்கத்திற்குச் செல்லவும் (அல்லது staff login screen-ல் 'Lab Center' தேர்ந்தெடுத்து sign-up லிங்கைப் பின்பற்றவும்) மற்றும் லேப் பெயர், உரிமையாளர்/தொடர்பு நபர், ஈமெயில், போன், முகவரி, NABL/Registration Number-ஐ நிரப்பவும். உங்கள் கணக்கு 'Application under review' நிலையுடன் உடனடியாக உருவாக்கப்படும்.",
      },
      {
        q: "என் லேப் எப்போது live ஆகும்?",
        a: "pharmacy partners போலவே: admin உங்கள் விண்ணப்பத்தை approve செய்தபின், dashboard-ன் Plan & Billing tab திறக்கும் — plan தேர்ந்தெடுத்து பணம் செலுத்தி live ஆகலாம். approved விண்ணப்பம் மற்றும் active subscription இரண்டும் தேவை, test booking requests வருவதற்கு முன்.",
      },
      {
        q: "வரும் test booking-ஐ எப்படி handle செய்வது?",
        a: "Live bookings உங்கள் Bookings tab-ல் 'New Request'-ஆக தோன்றும். ஏற்கவும்/நிராகரிக்கவும் — ஏற்றபின், Confirm → Mark Sample Collected → Start Processing → Mark Report Ready என்ற flow-ல் முன்னேற்றவும். வீட்டு-சேகரிப்பு bookings நோயாளியின் முகவரியைக் காட்டும்; center-visit bookings தேவையில்லை. நோயாளி தன் dashboard-ல் அதே status-ஐ track செய்வார்.",
      },
      {
        q: "ஒரு booking-ஐ நிராகரிக்கலாமா?",
        a: "ஆம், ஆனால் அது இன்னும் 'New Request' நிலையில் இருக்கும்போது மட்டுமே — நீங்கள் confirm செய்தபின், அதை ரத்து மட்டுமே செய்ய முடியும், நிராகரிக்க முடியாது, ஏனெனில் நோயாளி ஏற்கனவே சேவையை எதிர்பார்க்கிறார்.",
      },
      {
        q: "என் lab login password மறந்துவிட்டால் என்ன செய்வது?",
        a: "wecare4allchennai@gmail.com அல்லது 90257 86467-ல் தொடர்பு கொள்ளவும். எங்கள் admin குழு password-ஐ reset செய்து, அதே வேலை நாளில் புதிய credentials-ஐ உங்கள் பதிவு செய்யப்பட்ட ஈமெயிலுக்கு அனுப்பும்.",
      },
    ],
  },

  company: {
    label:    "நிறுவனம்",
    icon:     "🏢",
    color:    "#6d28d9",
    bg:       "#faf5ff",
    border:   "#d8b4fe",
    questions: [
      {
        q: "எங்கள் நிறுவனம் Corporate Wellness-க்கு எப்படி sign up செய்வது?",
        a: "திறந்த self-registration இல்லை — Corporate Wellness பக்கத்தில் உள்ள enquiry படிவத்தில் ('Need a custom package instead?') தொடங்கவும். நிறுவனத்தின் பெயர், தொடர்பு நபர், work ஈமெயில், மொபைல், குழு அளவைச் சேர்க்கவும். எங்கள் admin குழு review செய்து, approve ஆனவுடன், உங்கள் தொடர்பு நபருக்கு account setup முடிக்க ஒரு one-time invite link ஈமெயில் செய்யப்படும் — உண்மையான sign-up பக்கத்தை அணுக இது மட்டுமே வழி.",
      },
      {
        q: "நாங்கள் setup ஆனபின் employees-ஐ எப்படி சேர்ப்பது?",
        a: "உங்கள் Company Dashboard-ன் Employees tab-ல் இருந்து, ஒவ்வொருவராக அல்லது bulk-ஆக employees சேர்க்கலாம். ஒவ்வொரு employee-க்கும் உங்கள் நிறுவனத்தின் prefix-உடன் தொடங்கும் Patient ID (எ.கா. ACME-0001) மற்றும் ஒரு temporary password, welcome ஈமெயிலாக தானாக அனுப்பப்படும்.",
      },
      {
        q: "employees எப்படி login செய்வார்கள்?",
        a: "Employees Patient ID + password மூலம் Employee Login பக்கத்தில் login செய்வார்கள் (main login screen-ன் staff dropdown-லும் லிங்க் உள்ளது) — OTP இல்லை, ஏனெனில் அவர்கள் கணக்கு self-signup மூலம் அல்ல, நேரடியாக அவர்களுக்காக உருவாக்கப்பட்டது.",
      },
      {
        q: "employees அப்பாயின்மென்ட்கள் பதிவு செய்யலாமா, home healthcare பயன்படுத்தலாமா?",
        a: "ஆம் — login செய்தவுடன், சேர்க்கப்பட்ட ஒரு employee-க்கு எந்த patient கணக்குக்கும் உள்ள அதே booking அணுகல் உள்ளது (மருத்துவரைக் கண்டறிதல், அப்பாயின்மென்ட்கள், home healthcare, lab tests), உங்கள் நிறுவனத்தின் booking mode (self-pay அல்லது company-sponsored) யாருக்கு பில் ஆகும் என்பதை தீர்மானிக்கும்.",
      },
      {
        q: "billing-ஐ எப்படி manage செய்வது?",
        a: "உங்கள் Company Dashboard-ன் Billing tab உங்கள் தற்போதைய plan-ஐ காட்டும், subscribe செய்யவோ plan மாற்றவோ அனுமதிக்கும். dashboard-ன் சில பகுதிகள் — Employees, Appointments, Analytics — உங்கள் நிறுவனத்தின் subscription active ஆகும் வரை lock ஆகியிருக்கும்.",
      },
      {
        q: "ஒரு HR admin password மறந்துவிட்டால் என்ன செய்வது?",
        a: "wecare4allchennai@gmail.com அல்லது 90257 86467-ல் தொடர்பு கொள்ளவும். எங்கள் admin குழு password-ஐ reset செய்து, அதே வேலை நாளில் பதிவு செய்யப்பட்ட ஈமெயிலுக்கு புதிய credentials அனுப்பும்.",
      },
    ],
  },
};

const CATEGORIES = ["patient", "doctor", "hospital", "pharmacy", "lab", "company"];

// ── Component ─────────────────────────────────────────────────
export default function FloatingFAQ() {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language?.startsWith("ta");
  const [open,     setOpen]     = useState(false);
  const [category, setCategory] = useState("patient");
  const [active,   setActive]   = useState(null); // { q, a } | null
  const [visible,  setVisible]  = useState(false); // controls CSS animation
  const [entered,  setEntered]  = useState(false); // true after initial render delay
  const panelRef  = useRef(null);
  const bottomRef = useRef(null);

  // Delay the button appearance slightly so it doesn't flash on first paint
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Animate panel in/out
  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      // let the CSS exit animation finish before unmounting
      const t = setTimeout(() => setVisible(false), 280);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Scroll to latest message when a question is selected
  useEffect(() => {
    if (active && bottomRef.current) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  }, [active]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const FAQ = isTamil ? FAQ_TA : FAQ_EN;
  const cat = FAQ[category];

  const CSS = `
    @keyframes faq-slide-up {
      from { opacity:0; transform:translateY(24px) scale(.97); }
      to   { opacity:1; transform:translateY(0)    scale(1);   }
    }
    @keyframes faq-slide-down {
      from { opacity:1; transform:translateY(0)    scale(1);   }
      to   { opacity:0; transform:translateY(24px) scale(.97); }
    }
    @keyframes faq-bounce {
      0%,100%{ transform:scale(1);    }
      40%    { transform:scale(1.12); }
      60%    { transform:scale(.95);  }
    }
    @keyframes faq-fade-in {
      from { opacity:0; transform:translateY(8px); }
      to   { opacity:1; transform:translateY(0);   }
    }
    @keyframes faq-bubble {
      from { opacity:0; transform:translateY(6px) scale(.97); }
      to   { opacity:1; transform:translateY(0)   scale(1);   }
    }
    .faq-panel-enter { animation: faq-slide-up   .28s cubic-bezier(.22,.68,0,1.2) forwards; }
    .faq-panel-exit  { animation: faq-slide-down .25s ease forwards; }
    .faq-q-row { transition: background .15s, transform .15s; }
    .faq-q-row:hover { background:var(--wc-warm-white)!important; transform:translateX(3px); }
    .faq-cat-tab { transition: all .15s; }
    .faq-cat-tab:hover { opacity:.85; }
    .faq-btn-pulse { animation: faq-bounce 2.8s ease infinite; }
  `;

  return (
    <>
      <style>{CSS}</style>

      {/* ── Floating trigger button ── */}
      <div style={{
        position:   "fixed",
        bottom:     "24px",
        right:      "20px",
        zIndex:     9999,
        opacity:    entered ? 1 : 0,
        transform:  entered ? "scale(1)" : "scale(.7)",
        transition: "opacity .4s, transform .4s",
      }}>
        <button
          onClick={() => { setOpen(o => !o); if (!open) setActive(null); }}
          className={open ? "" : "faq-btn-pulse"}
          title="Help & FAQ"
          aria-label="Open FAQ chat"
          style={{
            width:        "58px",
            height:       "58px",
            borderRadius: "50%",
            background:   open
              ? "var(--wc-navy)"
              : "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
            boxShadow:    open
              ? "0 8px 24px rgba(11,31,58,.45)"
              : "0 8px 24px rgba(4,120,87,.45)",
            border:       open ? "2px solid rgba(255,255,255,.85)" : "none",
            cursor:       "pointer",
            display:      "flex",
            alignItems:   "center",
            justifyContent:"center",
            fontSize:     "26px",
            color:        "#fff",
            fontWeight:   "700",
            lineHeight:   1,
            transition:   "background .2s, box-shadow .2s",
          }}>
          {open ? "✕" : "💬"}
        </button>

        {/* Unread badge — shown when panel is closed to invite first interaction */}
        {!open && entered && (
          <span style={{
            position:     "absolute",
            top:          "-4px",
            right:        "-4px",
            background:   "#ef4444",
            color:        "#fff",
            borderRadius: "50%",
            width:        "20px",
            height:       "20px",
            fontSize:     "11px",
            fontWeight:   "700",
            fontFamily:   "'DM Sans',sans-serif",
            display:      "flex",
            alignItems:   "center",
            justifyContent:"center",
            boxShadow:    "0 2px 6px rgba(0,0,0,.2)",
          }}>?</span>
        )}
      </div>

      {/* ── Chat panel ── */}
      {visible && (
        <div
          ref={panelRef}
          className={open ? "faq-panel-enter" : "faq-panel-exit"}
          style={{
            position:     "fixed",
            bottom:       "92px",
            right:        "20px",
            zIndex:       9998,
            width:        "min(360px, calc(100vw - 32px))",
            maxHeight:    "min(560px, calc(100vh - 120px))",
            background:   "#fff",
            borderRadius: "18px",
            boxShadow:    "0 20px 60px rgba(11,31,58,.18), 0 4px 16px rgba(0,0,0,.08)",
            border:       "1px solid var(--wc-border)",
            display:      "flex",
            flexDirection:"column",
            overflow:     "hidden",
          }}>

          {/* Header */}
          <div style={{
            background:  "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
            padding:     "14px 16px",
            flexShrink:  0,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{
                width:"36px", height:"36px", borderRadius:"50%",
                background:"rgba(255,255,255,.2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"18px", flexShrink:0,
              }}>💊</div>
              <div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:"700",
                  fontSize:"14px", color:"#fff", margin:0 }}>
                  {t("faq.widgetTitle", "WeCare Support")}
                </p>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                  color:"rgba(255,255,255,.8)", margin:"1px 0 0" }}>
                  {t("faq.widgetSubtitle", "We Care 4 'all' · Frequently Asked Questions")}
                </p>
              </div>
            </div>
          </div>

          {/* Tamil translation (client feedback, Aug 2026: "when we change
              the language to tamil, chat bot is still in english?") — the
              full FAQ_TA dataset above now mirrors FAQ_EN, so the widget
              (chrome + all ~51 Q&A answers) follows the site language.
              IMPORTANT FOR CLIENT: this is a first-pass machine-assisted
              translation of medical/policy content — have a Tamil-speaking
              team member proofread it (especially payment/refund/DPDP
              wording) before treating it as final; see the long comment
              above FAQ_TA for the same note. A small "content may need
              review" banner is intentionally NOT shown to visitors — that
              would undermine trust in the very content it's showing. */}
          {/* Category tabs — was display:flex with flex:1 per tab, sized
              for exactly 3 categories. Now that Pharmacy/Lab/Company are
              included (6 total), equal-flex would squeeze each tab into
              an unreadable ~55px sliver on the 360px panel. Switched to a
              horizontally-scrollable row of fixed-width tabs instead. */}
          <div style={{
            display:    "flex",
            overflowX:  "auto",
            borderBottom:"1px solid var(--wc-border)",
            background: "var(--wc-warm-white)",
            flexShrink: 0,
            scrollbarWidth: "none",
          }}>
            {CATEGORIES.map(key => {
              const c   = FAQ[key];
              const sel = category === key;
              return (
                <button
                  key={key}
                  className="faq-cat-tab"
                  onClick={() => { setCategory(key); setActive(null); }}
                  style={{
                    flex:        "0 0 auto",
                    whiteSpace:  "nowrap",
                    padding:     "10px 12px",
                    border:      "none",
                    borderBottom:sel ? `2.5px solid ${c.color}` : "2.5px solid transparent",
                    background:  "transparent",
                    cursor:      "pointer",
                    fontFamily:  "'DM Sans',sans-serif",
                    fontSize:    "12px",
                    fontWeight:  sel ? "700" : "500",
                    color:       sel ? c.color : "var(--wc-muted)",
                  }}>
                  {c.icon} {t(`faq.cat.${key}`, c.label)}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px" }}>
            {!active ? (
              /* Question list */
              <>
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:"11.5px",
                  color:"#6b7688", margin:"0 0 10px", textAlign:"center",
                }}>
                  {t("faq.selectQuestion", "Select a question below")}
                </p>
                {cat.questions.map((item, i) => (
                  <button
                    key={i}
                    className="faq-q-row"
                    onClick={() => setActive(item)}
                    style={{
                      display:     "block",
                      width:       "100%",
                      textAlign:   "left",
                      padding:     "10px 12px",
                      marginBottom:"6px",
                      borderRadius:"10px",
                      border:      `1px solid ${cat.border}`,
                      background:  cat.bg,
                      cursor:      "pointer",
                      fontFamily:  "'DM Sans',sans-serif",
                      fontSize:    "12.5px",
                      fontWeight:  "500",
                      color:       "var(--wc-navy)",
                      lineHeight:  "1.5",
                    }}>
                    <span style={{ color:cat.color, marginRight:"6px",
                      fontWeight:"700" }}>›</span>
                    {item.q}
                  </button>
                ))}
              </>
            ) : (
              /* Chat conversation view */
              <div>
                {/* Back button */}
                <button
                  onClick={() => setActive(null)}
                  style={{
                    display:    "flex",
                    alignItems: "center",
                    gap:        "5px",
                    background: "none",
                    border:     "none",
                    cursor:     "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize:   "12px",
                    color:      "var(--wc-muted)",
                    padding:    "0 0 12px",
                    fontWeight: "600",
                  }}>
                  ← {t("faq.backToQuestions", "Back to questions")}
                </button>

                {/* User bubble (the question) */}
                <div style={{
                  display:       "flex",
                  justifyContent:"flex-end",
                  marginBottom:  "12px",
                  animation:     "faq-bubble .25s ease",
                }}>
                  <div style={{
                    maxWidth:     "80%",
                    background:   cat.color,
                    color:        "#fff",
                    borderRadius: "14px 14px 2px 14px",
                    padding:      "10px 13px",
                    fontFamily:   "'DM Sans',sans-serif",
                    fontSize:     "13px",
                    lineHeight:   "1.5",
                    boxShadow:    "0 2px 8px rgba(0,0,0,.12)",
                  }}>
                    {active.q}
                  </div>
                </div>

                {/* Bot bubble (the answer) */}
                <div style={{
                  display:      "flex",
                  alignItems:   "flex-start",
                  gap:          "8px",
                  marginBottom: "16px",
                  animation:    "faq-bubble .3s .12s ease both",
                }}>
                  <div style={{
                    width:"30px", height:"30px", borderRadius:"50%",
                    background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
                    display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:"14px", flexShrink:0,
                  }}>💊</div>
                  <div style={{
                    flex:         1,
                    background:   "var(--wc-warm-white)",
                    border:       "1px solid var(--wc-border)",
                    borderRadius: "2px 14px 14px 14px",
                    padding:      "11px 13px",
                    fontFamily:   "'DM Sans',sans-serif",
                    fontSize:     "13px",
                    color:        "#1e293b",
                    lineHeight:   "1.65",
                  }}>
                    {active.a}
                  </div>
                </div>

                {/* CTA strip */}
                <div style={{
                  background:   "var(--wc-warm-white)",
                  border:       "1px solid var(--wc-border)",
                  borderRadius: "10px",
                  padding:      "10px 12px",
                  animation:    "faq-fade-in .3s .35s ease both",
                }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11.5px",
                    color:"var(--wc-muted)", margin:"0 0 8px" }}>
                    Still have questions?
                  </p>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    <a href="/contact"
                      style={{
                        padding:      "6px 12px",
                        borderRadius: "8px",
                        background:   "linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
                        color:        "#fff",
                        fontFamily:   "'DM Sans',sans-serif",
                        fontSize:     "11.5px",
                        fontWeight:   "600",
                        textDecoration:"none",
                        whiteSpace:   "nowrap",
                      }}>
                      📬 Contact Us
                    </a>
                    <a href="tel:+919025786467"
                      style={{
                        padding:      "6px 12px",
                        borderRadius: "8px",
                        background:   "#eff8ff",
                        border:       "1px solid #93c5fd",
                        color:        "var(--wc-teal)",
                        fontFamily:   "'DM Sans',sans-serif",
                        fontSize:     "11.5px",
                        fontWeight:   "600",
                        textDecoration:"none",
                        whiteSpace:   "nowrap",
                      }}>
                      📞 Call Us
                    </a>
                  </div>
                </div>
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding:     "8px 14px",
            borderTop:   "1px solid #f1f5f9",
            background:  "#fafafa",
            flexShrink:  0,
          }}>
            <p style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize:   "10.5px",
              color:      "#c0ccd8",
              margin:     0,
              textAlign:  "center",
            }}>
              We Care 4 'all' · wecare4all.in · 90257 86467
            </p>
          </div>
        </div>
      )}
    </>
  );
}
