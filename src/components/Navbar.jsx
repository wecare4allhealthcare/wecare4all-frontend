/**
 * Navbar.jsx — FINAL CORRECT FIX
 *
 * Key insight from project analysis:
 * - Ticker (38px) lives in Home.jsx, position:relative (scrolls with page)
 * - Navbar is position:fixed, top:0, height:72px
 * - On initial page load, transparent navbar = text invisible on dark background
 *
 * ROOT CAUSE OF ALL ISSUES:
 * CSS inside <style> tag is injected AFTER React renders, causing a flash where
 * the media query .nb-desktop{display:none} hasn't loaded yet — then it loads
 * and overrides the inline display:flex. On dark pages this looks like links
 * disappear. The .nb-drawer{display:none} permanently hides the drawer.
 *
 * SOLUTION: No CSS classes for show/hide. Pure React conditional rendering.
 * isMobile initialized with window.innerWidth on first render — no flash.
 */
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

// Client decision (Aug 2026, overriding the earlier "no dropdowns" rule
// specifically for this): both "For Patients" and "For Hospitals" are
// grouped dropdowns that stay visible together in the navbar for every
// visitor — logged out, patient, hospital, or admin — rather than the
// old pattern of 4 separate flat per-role arrays (PUBLIC_LINKS,
// PATIENT_LINKS, HOSPITAL_LINKS, ADMIN_LINKS) that grew to 9+ items in
// one unbroken row for logged-in patients/admins (the horizontal-scroll
// navbar this replaces). Two side benefits of unifying into one
// structure: (1) logged-out visitors can now reach pages that were
// login-gated until the Aug 2026 SEO audit (/doctors, /home-healthcare,
// /our-hospitals) — PUBLIC_LINKS never had them since they used to
// 404-via-redirect for a logged-out visitor; (2) one navbar definition
// instead of four to keep in sync going forward.
const TOP_LEVEL_LINKS = [
  { to:"/",         key:"nav.home"    },
  { to:"/about",     key:"nav.about"   },
  { to:"/blog",       key:"nav.blog"    },
  { to:"/contact",   key:"nav.contact" },
];

const PATIENT_GROUP_LINKS = [
  { to:"/doctors",                key:"nav.findDoctor"            },
  { to:"/home-healthcare",        key:"nav.homeHealthcare"        },
  { to:"/our-hospitals",          key:"nav.ourHospitals"          },
  { to:"/international-patients", key:"nav.internationalPatients" },
];

const HOSPITAL_GROUP_LINKS = [
  { to:"/hospital-consultancy", key:"nav.hospitalConsultancy" },
  { to:"/partner-with-us",      key:"nav.partner"             },
  { to:"/corporate-wellness",   key:"nav.corporate"           },
];

const DARK_PAGES = [
  "/","/about","/contact","/healthcare-provider",
  "/partner-with-us","/doctors","/blog","/our-hospitals","/international-patients",
  "/home-healthcare",
];

const LANGS = [
  { code:"en", label:"EN",     flag:"🇬🇧" },
  { code:"ta", label:"தமிழ்", flag:"🇮🇳" },
];

// Click-to-toggle (not hover-only — more reliable on touch/hybrid
// devices, and doesn't fire accidentally on scroll-past like a hover
// menu can). Closes on outside click and on route change so it never
// gets stuck open after a navigation.
function NavDropdown({ label, links, linkColor, activeClr, onDark, isActive, t }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display:"flex", alignItems:"center", gap:"4px",
          padding:"7px 11px", borderRadius:"7px", border:"none", cursor:"pointer",
          fontFamily:"'Inter',sans-serif", fontSize:"13px",
          fontWeight: isActive || open ? "700" : "500",
          color: isActive || open ? activeClr : linkColor,
          background: (isActive || open) ? (onDark ? "rgba(91,158,50,0.18)" : "rgba(91,158,50,0.08)") : "transparent",
          whiteSpace:"nowrap",
        }}>
        {label}
        <span aria-hidden="true" style={{ fontSize:"10px", transform: open ? "rotate(180deg)" : "none", transition:"transform .15s" }}>▾</span>
      </button>
      {open && (
        <div role="menu" style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, minWidth:"200px",
          background:"#fff", borderRadius:"11px", border:"1px solid var(--wc-border)",
          boxShadow:"0 14px 40px rgba(18,59,74,.18)", padding:"6px", zIndex:1001,
        }}>
          {links.map(({ to, key }) => (
            <NavLink key={to} to={to} role="menuitem" onClick={() => setOpen(false)}
              className="nbl"
              style={({ isActive }) => ({
                display:"block", padding:"10px 12px", borderRadius:"8px",
                fontFamily:"'Inter',sans-serif", fontSize:"13.5px",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "var(--wc-green)" : "#1e293b",
                background: isActive ? "var(--wc-sage)" : "transparent",
                textDecoration:"none",
              })}>
              {t(key)}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { isLoggedIn, role, logout, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Initialize with actual value — no "false then true" flash
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" ? window.innerWidth <= 900 : false
  );

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isDark = DARK_PAGES.includes(location.pathname);
  const onDark = isDark && !scrolled;

  // A "patient" role covers two different intents: genuine Healthcare
  // Consultancy (has a real medical dashboard) and someone who chose
  // Hospital Consultancy at login just to browse/apply for empanelment
  // (no dashboard of their own — they log back in with real hospital
  // credentials once approved instead). Login.jsx remembers which one.
  const isHospitalIntent = role === "patient" &&
    (typeof window !== "undefined" && localStorage.getItem("wc4a_login_portal") === "hospital");

  // Same top-level links + both grouped dropdowns for every role now —
  // see the constants above for why the old 4-array per-role split was
  // replaced with one unified structure.
  const navLinks = TOP_LEVEL_LINKS;

  const dashLink = isHospitalIntent ? "/patient/hospital-consultancy" : {
    patient:  "/patient/dashboard",
    doctor:   "/doctor/dashboard",
    admin:    "/admin/dashboard",
    hospital: "/hospital/dashboard",
  }[role] || "/";

  const dashLabel = {
    admin:  t("nav.dashboardAdmin"),
    doctor: t("nav.dashboardDoctor"),
  }[role] || t("nav.dashboard");

  // Language switcher — reads/writes the same key i18n.js checks on
  // init, so the choice survives a full page reload, not just SPA nav.
  const changeLang = (code) => {
    i18n.changeLanguage(code);
    try { localStorage.setItem("wc4a_lang", code); } catch {}
  };

  // ── Style helpers ──
  const linkColor  = onDark ? "rgba(255,255,255,0.90)" : "#374151";
  const activeClr  = onDark ? "var(--wc-green-lighter)" : "var(--wc-green)";
  const bdrColor   = onDark ? "rgba(255,255,255,0.22)" : "var(--wc-border)";
  const logoColor  = onDark ? "#ffffff" : "var(--wc-navy)";

  return (
    <>
      {/* ✅ NO media queries, NO display:none anywhere in CSS */}
      <style>{`
                .nb { font-family:'Inter',sans-serif; }
        .nb * { box-sizing:border-box; }
        .nbl { text-decoration:none; transition:opacity 0.18s; }
        .nbl:hover { opacity:0.72; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="nb" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        height:"72px",
        background: onDark ? "rgba(18,59,74,0.97)" : "#ffffff",
        borderBottom: onDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid var(--wc-border)",
        boxShadow: scrolled ? "0 2px 16px rgba(18,59,74,0.10)" : "none",
        transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
      }}>
        <div style={{
          maxWidth:"1200px", margin:"0 auto", padding:"0 20px",
          height:"100%", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:"8px",
        }}>

          {/* Logo */}
          <Link to="/" className="nbl" style={{
            display:"flex", alignItems:"center", gap:"9px", flexShrink:0,
          }}>
            <img src="/assets/img/logo/final.png" alt="logo" width="36" height="36"
              style={{ height:"36px", width:"auto" }}
              onError={e => { e.target.style.display = "none"; }}/>
            <span style={{
              fontFamily:"'Manrope',sans-serif",
              fontSize:"18px", fontWeight:"700",
              color: logoColor, whiteSpace:"nowrap",
              // Client feedback (Aug 2026): "we care for all itself is not
              // clear due to the background colour" — on the video hero
              // the nav bg is already ~95% opaque navy, but the extra
              // shadow gives the wordmark a guaranteed-legible edge in the
              // brief moment before/if that opacity is ever reduced again.
              textShadow: onDark ? "0 1px 6px rgba(0,0,0,0.55)" : "none",
            }}>
              We Care 4 <span style={{
                color:"var(--wc-green-light)",
                textShadow: onDark ? "0 1px 6px rgba(0,0,0,0.55)" : "none",
              }}>'all'</span>
            </span>
          </Link>

          {/* ✅ Desktop nav — rendered ONLY when not mobile, no CSS hiding.
              overflowX:auto + minWidth:0 is the fix for Tamil labels: they run
              30-40% longer than English, so at typical desktop widths (or with
              9 links) the row no longer fits. The row scrolls horizontally
              instead of silently clipping the last item(s) off-screen.
              IMPORTANT: the scrollbar stays visible (just styled thin/subtle)
              — an earlier version hid it, which meant a scrolled-past item
              looked identical to a permanently missing one, with nothing
              telling the visitor there was more to see. */}
          {!isMobile && (
            <div className="nb-navlinks" style={{
              display:"flex", alignItems:"center", gap:"2px",
              flex:1, minWidth:0, justifyContent:"safe center",
              flexWrap:"wrap",
            }}>
              <style>{`
                .nb-navlinks{ scrollbar-width:thin; scrollbar-color:rgba(91,158,50,.35) transparent; padding-bottom:2px; }
                .nb-navlinks::-webkit-scrollbar{ height:4px; }
                .nb-navlinks::-webkit-scrollbar-track{ background:transparent; }
                .nb-navlinks::-webkit-scrollbar-thumb{ background:rgba(91,158,50,.35); border-radius:4px; }
              `}</style>
              {navLinks.slice(0, 1).map(({ to, key }) => (
                <NavLink key={to} to={to} end={to === "/"}
                  className="nbl"
                  style={({ isActive }) => ({
                    padding:"7px 11px", borderRadius:"7px",
                    fontSize:"13px",
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? activeClr : linkColor,
                    background: isActive
                      ? (onDark ? "rgba(91,158,50,0.18)" : "rgba(91,158,50,0.08)")
                      : "transparent",
                    borderBottom: `2px solid ${isActive ? activeClr : "transparent"}`,
                    whiteSpace:"nowrap",
                  })}>
                  {t(key)}
                </NavLink>
              ))}
              <NavDropdown label={t("nav.forPatients")} links={PATIENT_GROUP_LINKS}
                linkColor={linkColor} activeClr={activeClr} onDark={onDark} t={t}
                isActive={PATIENT_GROUP_LINKS.some(l => l.to === location.pathname)} />
              <NavDropdown label={t("nav.forHospitals")} links={HOSPITAL_GROUP_LINKS}
                linkColor={linkColor} activeClr={activeClr} onDark={onDark} t={t}
                isActive={HOSPITAL_GROUP_LINKS.some(l => l.to === location.pathname)} />
              {navLinks.slice(1).map(({ to, key }) => (
                <NavLink key={to} to={to} end={to === "/"}
                  className="nbl"
                  style={({ isActive }) => ({
                    padding:"7px 11px", borderRadius:"7px",
                    fontSize:"13px",
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? activeClr : linkColor,
                    background: isActive
                      ? (onDark ? "rgba(91,158,50,0.18)" : "rgba(91,158,50,0.08)")
                      : "transparent",
                    borderBottom: `2px solid ${isActive ? activeClr : "transparent"}`,
                    whiteSpace:"nowrap",
                  })}>
                  {t(key)}
                </NavLink>
              ))}
            </div>
          )}

          {/* ✅ Desktop right — rendered ONLY when not mobile */}
          {!isMobile && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
              {/* Language picker — EN/Tamil, per client requirement.
                  Only these two are exposed since only these two are
                  fully translated (home.*, hp.*, nav.* namespaces);
                  Hindi resources stay loaded but unused in the UI. */}
              <div style={{ display:"flex", alignItems:"center", gap:"2px",
                background: onDark ? "rgba(255,255,255,.08)" : "#f1f5f9",
                borderRadius:"7px", padding:"2px", marginRight:"2px" }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={()=>changeLang(l.code)}
                    aria-pressed={i18n.language === l.code}
                    style={{
                      padding:"5px 9px", borderRadius:"5px", border:"none",
                      cursor:"pointer", fontSize:"12px", fontWeight:"700",
                      fontFamily:"'Inter',sans-serif",
                      background: i18n.language === l.code
                        ? (onDark ? "rgba(255,255,255,.18)" : "#fff")
                        : "transparent",
                      color: i18n.language === l.code ? activeClr : linkColor,
                      boxShadow: i18n.language === l.code ? "0 1px 3px rgba(18,59,74,.12)" : "none",
                    }}>
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Auth */}
              {loading ? (
                <div style={{width:"120px",height:"34px",borderRadius:"8px",
                  background:"rgba(255,255,255,.08)",animation:"navPulse 1.2s ease-in-out infinite"}}/>
              ) : isLoggedIn ? (
                <>
                  {dashLink && (
                    <Link to={dashLink} style={{
                      padding:"8px 16px", borderRadius:"8px",
                      background:"var(--wc-navy)", color:"#fff",
                      fontSize:"13px", fontWeight:"600",
                      textDecoration:"none",
                      fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap",
                    }}>
                      {dashLabel}
                    </Link>
                  )}
                  <button onClick={() => { logout(); navigate("/"); }} style={{
                    padding:"8px 13px", borderRadius:"8px",
                    background:"transparent",
                    border:`1px solid ${bdrColor}`,
                    color: linkColor,
                    fontSize:"13px", fontWeight:"500", cursor:"pointer",
                    fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap",
                  }}>
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <Link to="/login" style={{
                  padding:"8px 18px", borderRadius:"8px",
                  background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
                  color:"#fff", fontSize:"13px", fontWeight:"600",
                  textDecoration:"none", whiteSpace:"nowrap",
                  fontFamily:"'Inter',sans-serif",
                  boxShadow:"0 2px 10px rgba(91,158,50,0.35)",
                }}>
                  {t("nav.login")}
                </Link>
              )}
            </div>
          )}

          {/* ✅ Mobile hamburger — rendered ONLY when mobile, always visible */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle navigation"
              style={{
                background:"none", border:"none", cursor:"pointer",
                padding:"6px", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                borderRadius:"8px",
              }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke={onDark ? "#ffffff" : "var(--wc-navy)"}
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* ✅ Mobile drawer — only in DOM when mobile, transform-only open/close */}
      {isMobile && (
        <>
          {/* Drawer */}
          <div style={{
            position:"fixed",
            top:0, right:0, bottom:0,
            width:"78%", maxWidth:"300px",
            background:"#ffffff",
            zIndex:1100,
            // ✅ Only transform controls visibility — NO display:none
            transform: menuOpen ? "translateX(0)" : "translateX(110%)",
            transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "-6px 0 30px rgba(18,59,74,0.20)",
            display:"flex",
            flexDirection:"column",
            overflowY:"auto",
          }}>

            {/* Drawer header */}
            <div style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"16px 18px", flexShrink:0,
              background:"linear-gradient(135deg,var(--wc-navy),#112d52)",
              position:"sticky", top:0, zIndex:2,
            }}>
              <span style={{
                fontFamily:"'Manrope',sans-serif",
                fontSize:"17px", fontWeight:"700", color:"#fff",
              }}>
                We Care 4 <span style={{ color:"var(--wc-green-lighter)" }}>'all'</span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  background:"rgba(255,255,255,0.15)", border:"none",
                  color:"#fff", width:"36px", height:"36px",
                  borderRadius:"8px", cursor:"pointer", fontSize:"22px",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  lineHeight:1,
                }}>
                ×
              </button>
            </div>

            {/* Nav links */}
            <div style={{ padding:"10px 14px", flex:1, overflowY:"auto" }}>
              {navLinks.slice(0, 1).map(({ to, key }) => (
                <NavLink key={to} to={to} end={to === "/"}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    display:"block", padding:"13px 16px", borderRadius:"9px",
                    fontSize:"15px", fontWeight: isActive ? "700" : "500",
                    color: isActive ? "var(--wc-green)" : "#1e293b",
                    background: isActive ? "var(--wc-sage)" : "transparent",
                    textDecoration:"none", marginBottom:"4px",
                    borderLeft: `3px solid ${isActive ? "var(--wc-green)" : "transparent"}`,
                    fontFamily:"'Inter',sans-serif",
                  })}>
                  {t(key)}
                </NavLink>
              ))}

              {/* Grouped sections — both always shown together, no
                  expand/collapse needed since the drawer already
                  scrolls vertically. Small uppercase header labels the
                  same way the two dropdowns above do on desktop. */}
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", fontWeight:"700",
                color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase",
                margin:"14px 16px 6px" }}>{t("nav.forPatients")}</p>
              {PATIENT_GROUP_LINKS.map(({ to, key }) => (
                <NavLink key={to} to={to}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    display:"block", padding:"12px 16px", borderRadius:"9px",
                    fontSize:"14.5px", fontWeight: isActive ? "700" : "500",
                    color: isActive ? "var(--wc-green)" : "#1e293b",
                    background: isActive ? "var(--wc-sage)" : "transparent",
                    textDecoration:"none", marginBottom:"3px",
                    borderLeft: `3px solid ${isActive ? "var(--wc-green)" : "transparent"}`,
                    fontFamily:"'Inter',sans-serif",
                  })}>
                  {t(key)}
                </NavLink>
              ))}

              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:"11px", fontWeight:"700",
                color:"#94a3b8", letterSpacing:"1px", textTransform:"uppercase",
                margin:"14px 16px 6px" }}>{t("nav.forHospitals")}</p>
              {HOSPITAL_GROUP_LINKS.map(({ to, key }) => (
                <NavLink key={to} to={to}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    display:"block", padding:"12px 16px", borderRadius:"9px",
                    fontSize:"14.5px", fontWeight: isActive ? "700" : "500",
                    color: isActive ? "var(--wc-green)" : "#1e293b",
                    background: isActive ? "var(--wc-sage)" : "transparent",
                    textDecoration:"none", marginBottom:"3px",
                    borderLeft: `3px solid ${isActive ? "var(--wc-green)" : "transparent"}`,
                    fontFamily:"'Inter',sans-serif",
                  })}>
                  {t(key)}
                </NavLink>
              ))}

              <div style={{ height:"1px", background:"var(--wc-border)", margin:"14px 16px" }} />

              {navLinks.slice(1).map(({ to, key }) => (
                <NavLink key={to} to={to} end={to === "/"}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    display:"block", padding:"13px 16px", borderRadius:"9px",
                    fontSize:"15px", fontWeight: isActive ? "700" : "500",
                    color: isActive ? "var(--wc-green)" : "#1e293b",
                    background: isActive ? "var(--wc-sage)" : "transparent",
                    textDecoration:"none", marginBottom:"4px",
                    borderLeft: `3px solid ${isActive ? "var(--wc-green)" : "transparent"}`,
                    fontFamily:"'Inter',sans-serif",
                  })}>
                  {t(key)}
                </NavLink>
              ))}
            </div>

            {/* Language buttons */}
            <div style={{ display:"flex", gap:"8px", padding:"0 14px 14px", flexShrink:0 }}>
              {LANGS.map(l => (
                <button key={l.code} onClick={()=>changeLang(l.code)}
                  aria-pressed={i18n.language === l.code}
                  style={{
                    flex:1, padding:"10px", borderRadius:"9px",
                    border:`1.5px solid ${i18n.language === l.code ? "var(--wc-green)" : "var(--wc-border)"}`,
                    background: i18n.language === l.code ? "var(--wc-sage)" : "#fff",
                    color: i18n.language === l.code ? "var(--wc-green)" : "var(--wc-muted)",
                    fontFamily:"'Inter',sans-serif", fontWeight:"700",
                    fontSize:"13px", cursor:"pointer",
                  }}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>

            {/* Auth */}
            <div style={{ padding:"14px", flexShrink:0 }}>
              {isLoggedIn ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {dashLink && (
                    <Link to={dashLink} onClick={() => setMenuOpen(false)} style={{
                      display:"flex", justifyContent:"center",
                      padding:"13px", borderRadius:"10px",
                      background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
                      color:"#fff", textDecoration:"none",
                      fontFamily:"'Inter',sans-serif",
                      fontWeight:"600", fontSize:"14px",
                    }}>
                      {dashLabel}
                    </Link>
                  )}
                  <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }}
                    style={{
                      padding:"13px", borderRadius:"10px",
                      background:"var(--wc-warm-white)", border:"1px solid var(--wc-border)",
                      color:"var(--wc-muted)", cursor:"pointer",
                      fontFamily:"'Inter',sans-serif",
                      fontSize:"14px", fontWeight:"600",
                    }}>
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  display:"flex", justifyContent:"center",
                  padding:"14px", borderRadius:"10px",
                  background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
                  color:"#fff", textDecoration:"none",
                  fontFamily:"'Inter',sans-serif",
                  fontWeight:"600", fontSize:"14px",
                }}>
                  {t("nav.login")}
                </Link>
              )}
            </div>

            {/* Helpline */}
            <div style={{
              margin:"0 14px 18px",
              background:"#fef2f2", border:"1px solid #fecaca",
              borderRadius:"10px", padding:"12px 14px",
              display:"flex", alignItems:"center", gap:"10px",
              flexShrink:0,
            }}>
              <span style={{ fontSize:"18px" }}>📞</span>
              <div>
                <p style={{
                  fontFamily:"'Inter',sans-serif", fontSize:"11px",
                  fontWeight:"700", color:"#991b1b", margin:0,
                }}>{t("nav.helpline", "Immediate Help")}</p>
                <a href="tel:+919025786467" style={{
                  fontFamily:"'Inter',sans-serif", fontSize:"14px",
                  fontWeight:"700", color:"#dc2626", textDecoration:"none",
                }}>90257 86467</a>
              </div>
            </div>
          </div>

          {/* Overlay — only when open */}
          {menuOpen && (
            <div
              onClick={() => setMenuOpen(false)}
              style={{
                position:"fixed", inset:0,
                background:"rgba(0,0,0,0.52)",
                zIndex:1050,
              }}
            />
          )}
        </>
      )}
    </>
  );
}
