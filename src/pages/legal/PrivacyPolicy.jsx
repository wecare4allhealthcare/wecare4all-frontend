import LegalLayout from "./LegalLayout";
import SEO from "../../components/SEO";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO title="Privacy Policy" path="/privacy" noindex
        description="How We Care 4 'all' collects, uses, and protects your personal and health information." />
      <LegalLayout title="Privacy Policy" lastUpdated="18 June 2026">
        <p>
          We Care 4 "all" ("we," "us," "the platform") is a healthcare consultancy and patient
          coordination service. We connect patients with independent, licensed doctors and
          accredited hospitals — we do not provide medical treatment ourselves. This policy
          explains what personal and health information we collect through our website and
          apps, why we collect it, who we share it with, and the choices you have.
        </p>

        <h2>1. Information We Collect</h2>
        <h3>Account information</h3>
        <p>
          When you register, we collect your name, email address, mobile number, and — if you
          choose to provide them — your date of birth, gender, blood group, and address. We
          verify your email or mobile number with a one-time passcode (OTP) at signup and login;
          we do not store passwords for patient accounts logging in this way.
        </p>
        <h3>Health information</h3>
        <p>
          When you book a consultation, you provide information about your symptoms, medical
          history, and the reason for your visit, which we share with the doctor you've chosen
          so they can prepare for your consultation. After a consultation, the treating doctor
          may add notes or a prescription to your record, visible to you and them.
        </p>
        <h3>Payment information</h3>
        <p>
          Consultation and service fees are processed through Razorpay, our payment gateway
          partner. We never see or store your card, UPI, or bank account details — Razorpay
          handles that directly and provides us only with a confirmation that a payment
          succeeded, its amount, and a transaction reference.
        </p>
        <h3>Video consultations</h3>
        <p>
          Video calls between you and your doctor take place through a secured video
          infrastructure. We do not record consultations by default. Access to a video room is
          restricted to the patient and doctor for that specific appointment, for a limited time
          window around the scheduled appointment.
        </p>
        <h3>Technical information</h3>
        <p>
          Like most websites, our servers automatically log standard technical information
          (browser type, approximate location inferred from IP address, pages visited, and
          timestamps) for security and troubleshooting purposes.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To create and manage your account, and verify your identity via OTP</li>
          <li>To connect you with a doctor, hospital, or home healthcare provider you've chosen, and to share the relevant health information you provide with that specific provider for your care</li>
          <li>To process payments for services booked through the platform</li>
          <li>To send appointment confirmations, reminders, and updates by email, SMS, or in-app/push notification</li>
          <li>To respond to support requests and improve the platform based on how it's used</li>
          <li>To meet legal, regulatory, and accounting obligations</li>
        </ul>

        <h2>3. Who We Share Information With</h2>
        <p>
          We share information with the specific doctor, hospital, or home healthcare staff
          assigned to your appointment — only the information relevant to that consultation, and
          only with the provider you're actually seeing. We also work with a small number of
          service providers who process data on our behalf under their own confidentiality and
          security commitments: a database and backend hosting provider, a payment gateway, an
          email delivery service, and an SMS delivery service. We do not sell your personal or
          health information to anyone, for any reason.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          We keep your account and appointment records for as long as your account is active, and
          for a reasonable period afterward to meet legal, tax, and medical record-keeping
          obligations. You can request deletion of your account at any time (see Section 6); some
          information may be retained where we're legally required to, such as completed
          transaction records.
        </p>

        <h2>5. Security</h2>
        <p>
          We use encrypted connections (HTTPS) throughout the platform, OTP-based verification
          rather than long-lived passwords for patients, and access controls that restrict who on
          our team — and which provider — can see any given piece of your information. No system
          is perfectly secure, and we encourage you to keep your OTP and account details private
          and to log out on shared devices.
        </p>

        <h2>6. Your Rights</h2>
        <p>You can, at any time:</p>
        <ul>
          <li>Access and review the personal information we hold about you, through your account dashboard or by contacting us</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your account and associated data, subject to the retention obligations described above</li>
          <li>Withdraw consent to non-essential communications (e.g. promotional messages), while still receiving essential service messages like appointment confirmations</li>
        </ul>
        <p>To exercise any of these, contact us using the details in Section 9.</p>

        <h2>7. Children's Information</h2>
        <p>
          Our services are intended for use by adults booking care for themselves or, where
          appropriate, on behalf of a minor under their guardianship. We do not knowingly collect
          information directly from children without the involvement of a parent or guardian.
        </p>

        <h2>8. Cookies and Similar Technologies</h2>
        <p>
          We use minimal, functional browser storage (such as keeping you logged in between
          visits) rather than third-party advertising trackers. Some embedded widgets on our
          public pages (such as a reviews widget) may set their own cookies under their own
          privacy practices, independent of us.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          For any privacy questions, concerns, or requests, reach out to us through our{" "}
          <a href="/contact">Contact page</a>, or write to us using the support email listed
          there.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time as our services evolve. We'll update the
          "Last updated" date above when we do, and material changes will be communicated through
          the platform.
        </p>
      </LegalLayout>
    </>
  );
}
