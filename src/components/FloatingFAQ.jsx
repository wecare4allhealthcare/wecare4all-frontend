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
const FAQ = {
  patient: {
    label:    "Patient",
    icon:     "🧑‍💼",
    color:    "#047857",
    bg:       "#f0fdf4",
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
    color:    "#0369a1",
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
    color:    "#0369a1",
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
    .faq-q-row:hover { background:#f8fafc!important; transform:translateX(3px); }
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
              ? "#0b1f3a"
              : "linear-gradient(135deg,#047857,#059669)",
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
            border:       "1px solid #e2eaf4",
            display:      "flex",
            flexDirection:"column",
            overflow:     "hidden",
          }}>

          {/* Header */}
          <div style={{
            background:  "linear-gradient(135deg,#047857,#059669)",
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

          {/* Tamil-language notice (client feedback, Aug 2026: "when we
              change the language to tamil, chat bot is still in english?")
              — the widget chrome (this header, category tabs, back button)
              now follows the site language via i18n. The ~45 Q&A answers
              underneath are still English-only: they're long medical/policy
              text that needs a careful, reviewed Tamil translation rather
              than a quick auto-translation, so instead of silently showing
              wrong-language text, we tell the visitor plainly what's going
              on and give them the phone number as a same-language fallback. */}
          {isTamil && (
            <div style={{
              background:"#fffbeb", borderBottom:"1px solid #fde68a",
              padding:"8px 14px", flexShrink:0,
            }}>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                color:"#92400e", margin:0, lineHeight:1.4 }}>
                {t("faq.taNotice", "இந்த பதில்கள் தற்போது ஆங்கிலத்தில் மட்டுமே உள்ளன. தமிழில் உதவி வேண்டுமா? 90257 86467 என்ற எண்ணில் அழைக்கவும்.")}
              </p>
            </div>
          )}
          {/* Category tabs — was display:flex with flex:1 per tab, sized
              for exactly 3 categories. Now that Pharmacy/Lab/Company are
              included (6 total), equal-flex would squeeze each tab into
              an unreadable ~55px sliver on the 360px panel. Switched to a
              horizontally-scrollable row of fixed-width tabs instead. */}
          <div style={{
            display:    "flex",
            overflowX:  "auto",
            borderBottom:"1px solid #e2eaf4",
            background: "#f8fafc",
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
                    color:       sel ? c.color : "#64748b",
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
                      color:       "#0b1f3a",
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
                    color:      "#64748b",
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
                    background:"linear-gradient(135deg,#047857,#059669)",
                    display:"flex", alignItems:"center",
                    justifyContent:"center", fontSize:"14px", flexShrink:0,
                  }}>💊</div>
                  <div style={{
                    flex:         1,
                    background:   "#f8fafc",
                    border:       "1px solid #e2eaf4",
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
                  background:   "#f8fafc",
                  border:       "1px solid #e2eaf4",
                  borderRadius: "10px",
                  padding:      "10px 12px",
                  animation:    "faq-fade-in .3s .35s ease both",
                }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:"11.5px",
                    color:"#64748b", margin:"0 0 8px" }}>
                    Still have questions?
                  </p>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    <a href="/contact"
                      style={{
                        padding:      "6px 12px",
                        borderRadius: "8px",
                        background:   "linear-gradient(135deg,#047857,#059669)",
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
                        color:        "#0369a1",
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
