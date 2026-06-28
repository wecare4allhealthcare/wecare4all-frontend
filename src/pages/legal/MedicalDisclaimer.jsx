import LegalLayout from "./LegalLayout";
import SEO from "../../components/SEO";

export default function MedicalDisclaimer() {
  return (
    <>
      <SEO title="Medical Disclaimer" path="/disclaimer" noindex
        description="Important information about the nature of services provided through We Care 4 'all'." />
      <LegalLayout title="Medical Disclaimer" lastUpdated="18 June 2026">
        <p>
          We Care 4 "all" is an independent healthcare consultancy and patient coordination
          service. We do not provide medical advice or treatment, nor do we own or operate any
          medical facility. Please read this page carefully before using our platform to book any
          consultation or service.
        </p>

        <h2>1. We Are a Coordination Platform, Not a Medical Provider</h2>
        <p>
          All medical services booked through We Care 4 "all" — video consultations, in-person
          visits, and home healthcare — are delivered exclusively by licensed physicians and
          accredited healthcare institutions, chosen by you. We verify that doctors listed on our
          platform hold valid medical registration, but we do not supervise, direct, or take
          responsibility for the clinical decisions they make. Treatment outcomes, timelines, and
          the specific course of care are determined solely by the treating provider, not by We
          Care 4 "all".
        </p>

        <h2>2. Not a Substitute for Emergency Care</h2>
        <p>
          <strong>If you are experiencing a medical emergency, do not use this platform — call
          your local emergency services number or go to the nearest emergency room
          immediately.</strong> Video consultations in particular are not appropriate for
          emergencies, time-critical conditions, or situations requiring immediate in-person
          examination.
        </p>

        <h2>3. Pricing and Cost Estimates</h2>
        <p>
          Cost estimates shown on the platform are indicative and non-binding; actual costs may
          vary based on the specifics of your case, as determined by the treating provider. Fees
          paid to We Care 4 "all" relate to coordination and platform/support services and are
          disclosed separately from any clinical fees set by the provider.
        </p>

        <h2>4. No Guarantee of Outcomes</h2>
        <p>
          No medical outcome is guaranteed by We Care 4 "all" or by any provider listed on the
          platform. Medicine involves inherent uncertainty, and individual results vary based on
          many factors outside any platform's control.
        </p>

        <h2>5. Your Responsibility</h2>
        <p>
          You're responsible for providing accurate, complete information about your symptoms
          and medical history to your treating provider, for following the care instructions they
          give you, and for seeking further or emergency care if your condition changes or
          worsens — regardless of what was discussed in a prior consultation through this
          platform.
        </p>

        <h2>6. Questions</h2>
        <p>
          If anything in this disclaimer is unclear, please reach out through our{" "}
          <a href="/contact">Contact page</a> before booking a service.
        </p>
      </LegalLayout>
    </>
  );
}
