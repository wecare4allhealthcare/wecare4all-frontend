/**
 * "Skip to main content" — invisible until keyboard-focused, then
 * appears at the top-left of the screen. Lets someone navigating by
 * keyboard (or using a screen reader) jump straight past the navbar's
 * ~10 links instead of tabbing through all of them on every single
 * page load, which is the standard, expected pattern on any site with
 * a persistent top navigation.
 *
 * Targets #main-content, which Layout.jsx's <main> tag has (covers
 * every public page — Home, About, Contact, Doctors, Blog, Home
 * Healthcare, International Patients, Partner With Us, Corporate
 * Wellness, Our Hospitals). Dashboard pages (patient/doctor/admin/
 * hospital) render their own header without this shared Layout, so
 * this specific skip link doesn't yet have a target there — clicking
 * it on a dashboard page is a harmless no-op rather than an error,
 * but it's not yet doing anything useful for those pages either.
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      onClick={(e) => {
        const target = document.getElementById("main-content");
        if (target) {
          e.preventDefault();
          target.focus();
          target.scrollIntoView({ block: "start" });
        }
        // If there's no #main-content on this page (dashboard routes),
        // let the browser's default anchor behavior happen — it just
        // won't scroll anywhere, which is a harmless no-op.
      }}
      style={{
        position: "absolute",
        left: "-9999px",
        top: "0",
        zIndex: 10000,
        background: "#047857",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "0 0 8px 0",
        fontFamily: "'DM Sans',sans-serif",
        fontWeight: 700,
        fontSize: "14px",
        textDecoration: "none",
      }}
      onFocus={(e) => { e.currentTarget.style.left = "0"; }}
      onBlur={(e) => { e.currentTarget.style.left = "-9999px"; }}
    >
      Skip to main content
    </a>
  );
}
