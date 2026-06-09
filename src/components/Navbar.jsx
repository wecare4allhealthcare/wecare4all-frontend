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
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const LINKS = [
  { to:"/",                    label:"Home"          },
  { to:"/about",               label:"About Us"      },
  { to:"/healthcare-provider", label:"Services"      },
  { to:"/doctors",             label:"Find Doctor"   },
  { to:"/partner-with-us",     label:"For Hospitals" },
  { to:"/blog",                label:"Blog"          },
  { to:"/contact",             label:"Contact"       },
];

const DARK_PAGES = [
  "/","/about","/contact","/healthcare-provider",
  "/partner-with-us","/doctors","/blog",
];

const LANGS = [
  { code:"en", label:"EN",     flag:"🇬🇧" },
  { code:"ta", label:"தமிழ்", flag:"🇮🇳" },
  { code:"hi", label:"हिं",    flag:"🇮🇳" },
];

export default function Navbar() {
  const { isLoggedIn, role, logout } = useAuth();
  const { i18n }  = useTranslation();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

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

  useEffect(() => {
    const fn = () => setLangOpen(false);
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isDark = DARK_PAGES.includes(location.pathname);
  const onDark = isDark && !scrolled;

  const dashLink  = {
    patient:"/patient/dashboard",
    doctor: "/doctor/dashboard",
    admin:  "/admin/dashboard",
  }[role] || "/";

  const dashLabel = {
    admin:  "⚙️ Admin",
    doctor: "👨‍⚕️ Panel",
  }[role] || "👤 Dashboard";

  // ── Style helpers ──
  const linkColor  = onDark ? "rgba(255,255,255,0.90)" : "#374151";
  const activeClr  = onDark ? "#34d399" : "#047857";
  const bdrColor   = onDark ? "rgba(255,255,255,0.22)" : "#e2eaf4";
  const logoColor  = onDark ? "#ffffff" : "#0b1f3a";

  return (
    <>
      {/* ✅ NO media queries, NO display:none anywhere in CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        .nb { font-family:'DM Sans',sans-serif; }
        .nb * { box-sizing:border-box; }
        .nbl { text-decoration:none; transition:opacity 0.18s; }
        .nbl:hover { opacity:0.72; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="nb" style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        height:"72px",
        background: onDark ? "rgba(11,31,58,0.95)" : "#ffffff",
        borderBottom: onDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid #e2eaf4",
        boxShadow: scrolled ? "0 2px 16px rgba(11,31,58,0.10)" : "none",
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
            <img src="/assets/img/logo/final.png" alt="logo"
              style={{ height:"36px", width:"auto" }}
              onError={e => { e.target.style.display = "none"; }}/>
            <span style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:"18px", fontWeight:"700",
              color: logoColor, whiteSpace:"nowrap",
            }}>
              We Care 4 <span style={{ color:"#047857" }}>'all'</span>
            </span>
          </Link>

          {/* ✅ Desktop nav — rendered ONLY when not mobile, no CSS hiding */}
          {!isMobile && (
            <div style={{
              display:"flex", alignItems:"center", gap:"2px",
              flex:1, justifyContent:"center",
            }}>
              {LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === "/"}
                  className="nbl"
                  style={({ isActive }) => ({
                    padding:"7px 11px", borderRadius:"7px",
                    fontSize:"13px",
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? activeClr : linkColor,
                    background: isActive
                      ? (onDark ? "rgba(4,120,87,0.18)" : "rgba(4,120,87,0.08)")
                      : "transparent",
                    borderBottom: `2px solid ${isActive ? activeClr : "transparent"}`,
                    whiteSpace:"nowrap",
                  })}>
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* ✅ Desktop right — rendered ONLY when not mobile */}
          {!isMobile && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>

              {/* Language picker */}
              <div style={{ position:"relative" }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setLangOpen(v => !v)} style={{
                  display:"flex", alignItems:"center", gap:"5px",
                  padding:"6px 11px", borderRadius:"8px",
                  background:"transparent", cursor:"pointer",
                  border:`1px solid ${bdrColor}`,
                  color: linkColor,
                  fontSize:"12px", fontWeight:"600",
                  fontFamily:"'DM Sans',sans-serif",
                }}>
                  {LANGS.find(l => l.code === i18n.language)?.flag || "🌐"}
                  {" "}{LANGS.find(l => l.code === i18n.language)?.label || "EN"}
                </button>
                {langOpen && (
                  <div style={{
                    position:"absolute", top:"calc(100% + 6px)", right:0,
                    background:"#fff", border:"1px solid #e2eaf4",
                    borderRadius:"10px",
                    boxShadow:"0 8px 24px rgba(11,31,58,0.12)",
                    minWidth:"130px", overflow:"hidden", zIndex:200,
                  }}>
                    {LANGS.map(l => (
                      <button key={l.code}
                        onClick={() => { i18n.changeLanguage(l.code); setLangOpen(false); }}
                        style={{
                          display:"flex", alignItems:"center", gap:"8px",
                          padding:"10px 14px", width:"100%", border:"none",
                          cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                          background: i18n.language===l.code ? "#f0fdf4" : "transparent",
                          color:      i18n.language===l.code ? "#047857" : "#374151",
                          fontSize:"13px",
                          fontWeight: i18n.language===l.code ? "700" : "400",
                        }}>
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth */}
              {isLoggedIn ? (
                <>
                  <Link to={dashLink} style={{
                    padding:"8px 16px", borderRadius:"8px",
                    background:"#0b1f3a", color:"#fff",
                    fontSize:"13px", fontWeight:"600",
                    textDecoration:"none",
                    fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap",
                  }}>
                    {dashLabel}
                  </Link>
                  <button onClick={() => { logout(); navigate("/"); }} style={{
                    padding:"8px 13px", borderRadius:"8px",
                    background:"transparent",
                    border:`1px solid ${bdrColor}`,
                    color: linkColor,
                    fontSize:"13px", fontWeight:"500", cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap",
                  }}>
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" style={{
                  padding:"8px 18px", borderRadius:"8px",
                  background:"linear-gradient(135deg,#047857,#059669)",
                  color:"#fff", fontSize:"13px", fontWeight:"600",
                  textDecoration:"none", whiteSpace:"nowrap",
                  fontFamily:"'DM Sans',sans-serif",
                  boxShadow:"0 2px 10px rgba(4,120,87,0.35)",
                }}>
                  Login / Register
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
                stroke={onDark ? "#ffffff" : "#0b1f3a"}
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
            boxShadow: "-6px 0 30px rgba(11,31,58,0.20)",
            display:"flex",
            flexDirection:"column",
            overflowY:"auto",
          }}>

            {/* Drawer header */}
            <div style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"16px 18px", flexShrink:0,
              background:"linear-gradient(135deg,#0b1f3a,#112d52)",
              position:"sticky", top:0, zIndex:2,
            }}>
              <span style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontSize:"17px", fontWeight:"700", color:"#fff",
              }}>
                We Care 4 <span style={{ color:"#34d399" }}>'all'</span>
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
            <div style={{ padding:"10px 14px", flex:1 }}>
              {LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === "/"}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    display:"block",
                    padding:"13px 16px",
                    borderRadius:"9px",
                    fontSize:"15px",
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? "#047857" : "#1e293b",
                    background: isActive ? "#f0fdf4" : "transparent",
                    textDecoration:"none",
                    marginBottom:"4px",
                    borderLeft: `3px solid ${isActive ? "#047857" : "transparent"}`,
                    fontFamily:"'DM Sans',sans-serif",
                  })}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Language buttons */}
            <div style={{
              display:"flex", gap:"6px", padding:"12px 14px",
              borderTop:"1px solid #f1f5f9",
              borderBottom:"1px solid #f1f5f9",
              flexShrink:0,
            }}>
              {LANGS.map(l => (
                <button key={l.code}
                  onClick={() => i18n.changeLanguage(l.code)}
                  style={{
                    flex:1, padding:"8px 4px", borderRadius:"8px",
                    fontSize:"11px", fontWeight:"600", cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif",
                    border:`1.5px solid ${i18n.language===l.code ? "#047857" : "#e2eaf4"}`,
                    background: i18n.language===l.code ? "#f0fdf4" : "#fff",
                    color:      i18n.language===l.code ? "#047857" : "#64748b",
                  }}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>

            {/* Auth */}
            <div style={{ padding:"14px", flexShrink:0 }}>
              {isLoggedIn ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  <Link to={dashLink} onClick={() => setMenuOpen(false)} style={{
                    display:"flex", justifyContent:"center",
                    padding:"13px", borderRadius:"10px",
                    background:"linear-gradient(135deg,#047857,#059669)",
                    color:"#fff", textDecoration:"none",
                    fontFamily:"'DM Sans',sans-serif",
                    fontWeight:"600", fontSize:"14px",
                  }}>
                    {dashLabel}
                  </Link>
                  <button onClick={() => { logout(); navigate("/"); setMenuOpen(false); }}
                    style={{
                      padding:"13px", borderRadius:"10px",
                      background:"#f8fafc", border:"1px solid #e2eaf4",
                      color:"#64748b", cursor:"pointer",
                      fontFamily:"'DM Sans',sans-serif",
                      fontSize:"14px", fontWeight:"600",
                    }}>
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  display:"flex", justifyContent:"center",
                  padding:"14px", borderRadius:"10px",
                  background:"linear-gradient(135deg,#047857,#059669)",
                  color:"#fff", textDecoration:"none",
                  fontFamily:"'DM Sans',sans-serif",
                  fontWeight:"600", fontSize:"14px",
                }}>
                  Login / Register
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
                  fontFamily:"'DM Sans',sans-serif", fontSize:"11px",
                  fontWeight:"700", color:"#991b1b", margin:0,
                }}>24×7 Helpline</p>
                <a href="tel:+919025786467" style={{
                  fontFamily:"'DM Sans',sans-serif", fontSize:"14px",
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
