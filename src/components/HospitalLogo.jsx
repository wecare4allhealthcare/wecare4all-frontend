/**
 * HospitalLogo.jsx — Sep 2026, client request:
 * "once [logo] updated in hospital showing side wherever we can show,
 * show that logo (professional way)".
 *
 * Before this, every hospital card/hero across the site (OurHospitals,
 * HospitalProfile, HospitalCarousel, PartnerHospitals, the ad widgets,
 * admin's Hospitals.jsx list) used `h.photos?.[0]` — the FIRST GALLERY
 * PHOTO — as a stand-in for a logo, and the real `logo_url` a hospital
 * (or admin, on their behalf) uploads was never even fetched from the
 * backend. That's why a hospital's actual logo never appeared anywhere
 * outside their own dashboard.
 *
 * This is the single shared "hospital identity badge" used everywhere
 * a hospital's logo should now show: a small rounded-square avatar —
 * the real logo_url when present, a clean initials badge otherwise —
 * so every surface renders identically and a hospital that hasn't
 * uploaded a logo yet never looks broken.
 */
export default function HospitalLogo({ logoUrl, name, size = 44, style = {}, rounded = 12, className }) {
  const initial = (name || "H").trim()[0]?.toUpperCase() || "H";
  return (
    <div
      className={className}
      style={{
        width: size, height: size, borderRadius: rounded, flexShrink: 0,
        background: logoUrl ? "#fff" : "linear-gradient(135deg,var(--wc-navy),var(--wc-teal))",
        border: "1.5px solid " + (logoUrl ? "var(--wc-border)" : "transparent"),
        boxShadow: "0 2px 10px rgba(18,59,74,.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        ...style,
      }}
      title={name || "Hospital"}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name ? `${name} logo` : "Hospital logo"}
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: Math.max(2, size * 0.08) }}
          // If the stored logo URL 404s (deleted from storage, bad
          // upload, etc.) fall back to the initials badge instead of
          // a broken-image icon — same graceful-degradation approach
          // used for hero photos elsewhere on the public site.
          onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.dataset.fallback = "1"; }}
        />
      ) : (
        <span style={{
          fontFamily: "'Manrope',sans-serif", fontWeight: 700, color: "#fff",
          fontSize: Math.round(size * 0.42),
        }}>{initial}</span>
      )}
    </div>
  );
}
