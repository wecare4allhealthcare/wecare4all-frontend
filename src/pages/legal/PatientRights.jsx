import LegalLayout from "./LegalLayout";
import SEO from "../../components/SEO";

export default function PatientRights() {
  return (
    <>
      <SEO title="Patient Rights & Responsibilities" path="/rights" noindex
        description="Your rights and responsibilities as a patient using the We Care 4 'all' platform." />
      <LegalLayout title="Patient Rights & Responsibilities" lastUpdated="18 June 2026">
        <p>
          As a patient using We Care 4 "all," you have certain rights in how you're treated and
          how your information is handled — and a few responsibilities that help your care go
          smoothly. This page sets both out clearly.
        </p>

        <h2>Your Rights</h2>
        <h3>Respectful, non-discriminatory care</h3>
        <p>
          You have the right to be treated with dignity and respect by every doctor, hospital
          staff member, home healthcare worker, and support team member you interact with through
          this platform, regardless of your background, condition, or how you're paying for care.
        </p>
        <h3>Information about your provider</h3>
        <p>
          You have the right to know the name, specialization, and qualifications of the doctor
          you're booking with before your appointment, and to ask questions about their
          experience relevant to your condition.
        </p>
        <h3>Informed consent</h3>
        <p>
          You have the right to receive clear information about your diagnosis, treatment
          options, and any associated risks, in language you can understand, before agreeing to
          any treatment, test, or procedure. You have the right to ask questions until you're
          satisfied, and to say no.
        </p>
        <h3>Privacy and confidentiality</h3>
        <p>
          You have the right to have your health information shared only with the specific
          provider treating you, handled in line with our <a href="/privacy">Privacy Policy</a>,
          and not disclosed to anyone else without your consent except where required by law.
        </p>
        <h3>Access to your own records</h3>
        <p>
          You have the right to access the consultation notes, prescriptions, and appointment
          history associated with your own account at any time.
        </p>
        <h3>A second opinion</h3>
        <p>
          You're free to seek a second opinion from another doctor, on or off this platform, at
          any point — no provider should discourage you from doing so.
        </p>
        <h3>Fair pricing information</h3>
        <p>
          You have the right to see the cost of a consultation or service before you pay for it,
          and to a clear explanation of what that fee covers.
        </p>
        <h3>To raise a concern</h3>
        <p>
          You have the right to raise a complaint or concern about any aspect of your experience,
          through our <a href="/contact">Contact page</a>, without it affecting your ability to
          continue using the platform.
        </p>

        <h2>Your Responsibilities</h2>
        <h3>Provide accurate information</h3>
        <p>
          Give your treating provider complete and honest information about your symptoms,
          medical history, current medications, and allergies. Incomplete or inaccurate
          information can directly affect the quality of care you receive.
        </p>
        <h3>Attend or cancel on time</h3>
        <p>
          Join video consultations a few minutes early to allow for any connection setup, and
          cancel or reschedule as early as possible if you can't make an appointment, out of
          fairness to your doctor and to other patients waiting for a slot.
        </p>
        <h3>Follow through on care instructions</h3>
        <p>
          Follow the treatment plan, medication instructions, and any follow-up advice given by
          your treating provider, and let them know if something isn't working or if you're
          experiencing side effects, rather than simply stopping on your own.
        </p>
        <h3>Use the platform as intended</h3>
        <p>
          Use video consultations and home healthcare bookings for their intended purpose, and
          don't use the platform to attempt to bypass scheduling, payment, or coordination
          processes that exist to keep things fair and accountable for everyone using it.
        </p>
        <h3>Seek emergency care when needed</h3>
        <p>
          Recognize when a situation needs emergency, in-person care rather than a scheduled
          consultation — see our <a href="/disclaimer">Medical Disclaimer</a> for more on this —
          and act accordingly rather than waiting for a platform appointment.
        </p>

        <h2>Questions or Concerns</h2>
        <p>
          If you feel any of these rights weren't respected during your experience with us,
          please tell us through our <a href="/contact">Contact page</a> — we take this
          seriously and will follow up.
        </p>
      </LegalLayout>
    </>
  );
}
