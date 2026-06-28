import LegalLayout from "./LegalLayout";
import SEO from "../../components/SEO";

export default function TermsAndConditions() {
  return (
    <>
      <SEO title="Terms & Conditions" path="/terms" noindex
        description="The terms governing your use of the We Care 4 'all' platform." />
      <LegalLayout title="Terms & Conditions" lastUpdated="18 June 2026">
        <p>
          These terms govern your use of We Care 4 "all" (the "platform"). By creating an
          account or booking a service through the platform, you agree to these terms. Please
          read them alongside our <a href="/privacy">Privacy Policy</a> and{" "}
          <a href="/disclaimer">Medical Disclaimer</a>.
        </p>

        <h2>1. What We Are</h2>
        <p>
          We Care 4 "all" is an independent healthcare consultancy and patient coordination
          platform. We connect patients with independently licensed doctors, accredited
          hospitals, and home healthcare staff. <strong>We do not employ the doctors on our
          platform, do not own or operate any hospital or clinic, and do not ourselves provide
          medical advice, diagnosis, or treatment.</strong> Every medical service you receive is
          provided by the independent licensed professional or institution you've chosen,
          who is solely responsible for the quality, accuracy, and outcome of that care.
        </p>

        <h2>2. Eligibility & Accounts</h2>
        <p>
          You must be at least 18 years old to create an account, or be booking on behalf of a
          minor under your guardianship. You're responsible for keeping your account credentials
          and OTP confidential, and for all activity that happens under your account. Let us know
          immediately if you suspect unauthorized access.
        </p>

        <h2>3. Booking & Appointments</h2>
        <p>
          When you book an appointment, our team reviews the booking and assigns or confirms the
          treating doctor. Appointments are subject to doctor availability and may be
          rescheduled or, in rare cases, declined by the assigned doctor — if that happens, we'll
          notify you and help you find an alternative. Showing up for video consultations
          requires a working internet connection and a compatible device on your end; we aren't
          responsible for call quality issues caused by your own connection or device.
        </p>

        <h2>4. Payments & Refunds</h2>
        <p>
          Consultation and service fees are shown to you before payment and are collected through
          our payment gateway, Razorpay. Payment is made to We Care 4 "all," not directly to the
          treating doctor or hospital — we handle settlement with providers separately. If a
          consultation is cancelled by us or by the assigned doctor before it takes place, you're
          entitled to a full refund of the amount paid for that appointment. If you cancel an
          appointment yourself, refund eligibility depends on how far in advance you cancel —
          check the specific terms shown at the time of booking, or contact support for help with
          a particular booking.
        </p>

        <h2>5. Home Healthcare Services</h2>
        <p>
          Home visit services (such as nursing care, sample collection, or physiotherapy) are
          delivered by staff arranged through the platform. Pricing may vary based on time of
          day, day of week, and service duration, as shown at the time of booking. You're
          responsible for providing a safe, accessible location for the visit.
        </p>

        <h2>6. Conduct</h2>
        <p>
          Please treat doctors, hospital staff, and our support team with respect. We may suspend
          or terminate accounts that engage in abusive behavior, fraudulent payment activity, or
          attempts to misuse the platform (including attempting to bypass our booking or payment
          process to transact directly with a provider you found through us).
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, We Care 4 "all" is not liable for the medical
          decisions, advice, treatment, or outcomes provided by independent doctors, hospitals,
          or home healthcare staff on the platform — those are matters between you and the
          treating professional or institution. Our role is limited to facilitating the
          connection, scheduling, and payment coordination between you and your chosen provider.
        </p>

        <h2>8. Changes to the Platform or These Terms</h2>
        <p>
          We may update these terms, or add, change, or discontinue features of the platform,
          from time to time. We'll update the date above when we do, and continued use of the
          platform after a change means you accept the updated terms.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These terms are governed by the laws of India. Any disputes will be subject to the
          jurisdiction of the courts where We Care 4 "all" is registered.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions about these terms? Reach us through our <a href="/contact">Contact page</a>.
        </p>
      </LegalLayout>
    </>
  );
}
