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
// Non-text metadata for the translated tier cards (icon/color/id) — the
// actual label/price/features come from locales/*.json under
// aboutPage.tiers.<id>, reusing the exact same content already entered
// there for AboutUs.jsx's tier section rather than duplicating it a
// third time. Call getTiers(t) from a component that has
// useTranslation()'s `t` available (see PartnerWithUs.jsx). TIERS
// (below) stays as the static English fallback so EmpanelForm.jsx,
// which doesn't yet have i18n wiring, keeps working unchanged.
const TIER_META = [
  { icon: "🌿", id: "basic",     color: "#64748b", bg: "#f8fafc", border: "#e2eaf4" },
  { icon: "🚀", id: "growth",    color: "#047857", bg: "#f0fdf4", border: "#86efac" },
  { icon: "⭐", id: "strategic", color: "#0369a1", bg: "#eff8ff", border: "#93c5fd" },
];
export function getTiers(t) {
  return TIER_META.map((m) => ({
    ...m,
    label: t(`aboutPage.tiers.${m.id}.label`),
    price: t(`aboutPage.tiers.${m.id}.price`),
    badge: t(`aboutPage.tiers.${m.id}.badge`, { defaultValue: "" }),
    features: t(`aboutPage.tiers.${m.id}.features`, { returnObjects: true }),
  }));
}

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
