// Shared between PartnerWithUs.jsx (main), WhyPartnerSection.jsx, and
// EmpanelForm.jsx — extracted here in Phase 14 rather than duplicated,
// since both W (layout wrapper) and TIERS (partnership tier data) are
// used in more than one of those files.

export const W = ({ children, s = {} }) => (
  <div
    style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", ...s }}
  >
    {children}
  </div>
);
export const TIERS = [
  {
    icon: "🌿",
    id: "basic",
    label: "Basic Association",
    price: "Free / Selective",
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2eaf4",
    features: [
      "Hospital listed in network",
      "Eligible for patient referrals",
      "Included based on merit and evaluation",
    ],
  },
  {
    icon: "🚀",
    id: "growth",
    label: "Growth Partner",
    price: "Paid",
    color: "#047857",
    bg: "#f0fdf4",
    border: "#86efac",
    badge: "Popular",
    features: [
      "Priority listing on website",
      "Featured in patient recommendations (where appropriate)",
      "Inclusion in digital campaigns",
      "Visibility in blogs / awareness content",
      "Participation in health camps / outreach programs",
    ],
  },
  {
    icon: "⭐",
    id: "strategic",
    label: "Strategic Partner",
    price: "Premium",
    color: "#0369a1",
    bg: "#eff8ff",
    border: "#93c5fd",
    badge: "Premium",
    features: [
      "Dedicated promotion campaigns",
      "Video features / doctor interviews",
      "International patient exposure (medical tourism)",
      "Branding in all major initiatives",
      "Corporate & institutional tie-ups via your network",
    ],
  },
];
