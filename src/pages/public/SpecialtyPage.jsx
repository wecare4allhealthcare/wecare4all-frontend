/**
 * SpecialtyPage.jsx — dedicated SEO page for a single medical specialty,
 * rendered at /specialties/:slug. One reusable component, one page per
 * specialty — built per web-analysis recommendation (Aug 2026): "Turn
 * the list of 18 medical specialties into clickable links leading to
 * dedicated SEO pages. Optimize these pages for keywords like 'Online
 * [Specialist] Consultation in Chennai.'"
 *
 * REWRITTEN Aug 2026 — client feedback: "these specialities are created
 * by admin, show those specialities in home page ... and based on that
 * create the content page". This page now matches against the LIVE
 * admin-managed specialties list (GET /specialties — the same one
 * /admin/dashboard?tab=specialties manages and Home.jsx's chips now
 * pull from) rather than trusting only the static content file in
 * ../../data/specialties.js. Two cases:
 *   1. The slug matches BOTH a live specialty AND a hand-written entry
 *      in data/specialties.js → full rich content (intro, when-to-
 *      consult, conditions, FAQ) exactly as before.
 *   2. The slug matches a LIVE specialty but has no hand-written entry
 *      yet (admin added a new one that Claude hasn't drafted content
 *      for) → buildFallbackContent() below generates a shorter but
 *      still real, SEO-correct page using the admin's own `description`
 *      field, instead of showing a broken "not found" page. Flag these
 *      to Claude to get proper hand-written content added to
 *      data/specialties.js.
 * Either way, the live doctor list always filters by the EXACT name
 * from the live table — never the static file's `name`, even when a
 * static entry exists — so it can never silently show zero doctors due
 * to a spelling mismatch between the two.
 *
 * Public page (no login required) — the whole point is for Google (and
 * now AI answer engines, see FAQPage schema below) to index it. The
 * live doctor list uses GET /doctors?specialization=X directly, which
 * has no auth dependency on the backend (confirmed in routes/doctors.py)
 * even though the /doctors *route* itself is login-gated — so this page
 * can show real doctors without requiring login, and only sends the
 * visitor to /login when they actually try to book.
 */
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SEO, { breadcrumbJsonLd } from "../../components/SEO";
import { getSpecialtyBySlug, SPECIALTIES } from "../../data/specialties";
import { specialtyToSlug } from "../../utils/specialtySlug";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const W = ({ children, s = {} }) => (
  <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", ...s }}>{children}</div>
);

// Generic-but-real fallback for a live specialty that doesn't have
// hand-written content yet — uses the admin's own description instead
// of inventing medical claims for a specialty nobody has reviewed copy
// for. Kept deliberately short and factual.
function buildFallbackContent(liveSpec) {
  return {
    slug: specialtyToSlug(liveSpec.name),
    name: liveSpec.name,
    icon: liveSpec.icon || "🏥",
    metaTitle: `Online ${liveSpec.name} Consultation in Chennai | We Care 4 'all'`,
    metaDescription: liveSpec.description
      ? `${liveSpec.description} Book an online or in-person ${liveSpec.name} consultation in Chennai.`
      : `Book an online ${liveSpec.name} consultation in Chennai with verified specialists.`,
    intro: liveSpec.description
      ? `${liveSpec.description} Our ${liveSpec.name} specialists are available for online video consultations and in-person visits across Chennai.`
      : `Our ${liveSpec.name} specialists are available for online video consultations and in-person visits across Chennai.`,
    whenToConsult: [
      `Symptoms or concerns related to ${liveSpec.name}`,
      "Seeking a specialist opinion or diagnosis",
      "Follow-up on an existing condition",
      "Reviewing a test report with a specialist",
    ],
    conditions: [`General ${liveSpec.name} care and consultations`],
    faq: [
      { q: `Can I consult a ${liveSpec.name} specialist online?`, a: `Yes, online video consultations are available — the specialist will advise if an in-person visit is needed based on your situation.` },
      { q: "Is this booking secure and confidential?", a: "Yes, all consultations and health information are handled according to our privacy policy." },
    ],
  };
}

export default function SpecialtyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [liveSpecs, setLiveSpecs] = useState(null); // null = loading, [] = loaded/empty
  const [doctors, setDoctors] = useState(null); // null = loading

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        const res = await fetch(`${API}/specialties`);
        const json = await res.json();
        setLiveSpecs(json.specialties || []);
      } catch { setLiveSpecs([]); }
    })();
  }, []);

  // Match the URL slug against the LIVE list first (source of truth for
  // "does this specialty currently exist"), then look up rich content
  // by that live specialty's exact name — falling back to a generic
  // page if no hand-written content exists for it yet.
  const liveSpec = Array.isArray(liveSpecs)
    ? liveSpecs.find((s) => specialtyToSlug(s.name) === slug)
    : null;
  const staticSpec = liveSpec ? getSpecialtyBySlug(specialtyToSlug(liveSpec.name)) : null;
  // While liveSpecs is still loading, fall back to the static file alone
  // so the page doesn't flash "not found" before the fetch resolves.
  const spec = liveSpec
    ? (staticSpec || buildFallbackContent(liveSpec))
    : (liveSpecs === null ? getSpecialtyBySlug(slug) : null);

  useEffect(() => {
    if (!spec) return;
    (async () => {
      try {
        const p = new URLSearchParams({ specialization: spec.name, page_size: "4" });
        const res = await fetch(`${API}/doctors?${p}`);
        const json = await res.json();
        setDoctors(json.doctors || []);
      } catch { setDoctors([]); }
    })();
  }, [spec?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBook = () => {
    if (!isLoggedIn) { navigate(`/login?redirect=/doctors?specialization=${encodeURIComponent(spec?.name || "")}`); return; }
    navigate(`/doctors?specialization=${encodeURIComponent(spec?.name || "")}`);
  };

  // Local styles this page needs (btn-p / btn-ol) — every other page in
  // this app defines its own local copy of these two classes rather
  // than sharing one global stylesheet; this page previously used the
  // class names WITHOUT defining them, which rendered as an unstyled
  // browser-default button (the "white box" UI bug reported Aug 2026).
  const PAGE_CSS = `
    .btn-p{display:inline-flex;align-items:center;justify-content:center;gap:8px;
      background:linear-gradient(135deg,#047857,#059669);color:#fff;
      font-family:'DM Sans',sans-serif;font-weight:700;font-size:14.5px;
      padding:13px 26px;border-radius:9px;border:none;cursor:pointer;
      box-shadow:0 4px 18px rgba(4,120,87,.35);transition:all .25s;text-decoration:none;}
    .btn-p:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(4,120,87,.45);}
    .btn-ol{display:inline-flex;align-items:center;justify-content:center;gap:8px;
      background:transparent;color:#fff;font-family:'DM Sans',sans-serif;font-weight:600;
      font-size:14px;padding:12px 24px;border-radius:9px;border:1.5px solid;
      transition:all .25s;text-decoration:none;}
    .btn-ol:hover{background:rgba(255,255,255,.08);}
    @media(max-width:700px){ .spec-grid-2{ grid-template-columns:1fr!important; } }
  `;

  // Still resolving whether this slug is a real live specialty.
  if (liveSpecs === null && !spec) {
    return (
      <div style={{ padding:"120px 24px", textAlign:"center" }}>
        <style>{PAGE_CSS}</style>
        <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#94a3b8" }}>Loading…</p>
      </div>
    );
  }

  // Genuinely unknown slug — plain, honest message + links back, rather
  // than a silent redirect that could hide a typo'd/broken link.
  if (!spec) {
    return (
      <div style={{ padding:"120px 24px", textAlign:"center" }}>
        <style>{PAGE_CSS}</style>
        <SEO title="Specialty Not Found" path={`/specialties/${slug}`} />
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"28px", color:"#0b1f3a" }}>
          We couldn't find that specialty
        </h1>
        <p style={{ fontFamily:"'DM Sans',sans-serif", color:"#64748b", margin:"12px 0 24px" }}>
          Browse all specialists instead.
        </p>
        <Link to="/doctors" className="btn-p">Find a Doctor</Link>
      </div>
    );
  }

  const specJsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Specialties", path: "/doctors" },
      { name: spec.name, path: `/specialties/${spec.slug}` },
    ]),
    {
      "@type": "FAQPage",
      "mainEntity": spec.faq.map((f) => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a },
      })),
    },
  ];

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", color:"#1e293b" }}>
      <style>{PAGE_CSS}</style>
      <SEO title={spec.metaTitle} path={`/specialties/${spec.slug}`}
        description={spec.metaDescription}
        keywords={`online ${spec.name.toLowerCase()} consultation chennai, ${spec.name.toLowerCase()} doctor chennai, best ${spec.name.toLowerCase()} near me`}
        jsonLd={specJsonLd}
      />

      {/* Hero */}
      <section style={{ background:"linear-gradient(135deg,#071524,#0b1f3a 60%,#062818)",
        padding:"40px 0 56px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize:"36px 36px", pointerEvents:"none" }} />
        <W>
          <div style={{ display:"flex", gap:"6px", alignItems:"center", marginBottom:"16px" }}>
            <Link to="/" style={{ color:"rgba(255,255,255,.5)", fontSize:"12px" }}>Home</Link>
            <span style={{ color:"rgba(255,255,255,.25)" }}>/</span>
            <Link to="/doctors" style={{ color:"rgba(255,255,255,.5)", fontSize:"12px" }}>Specialties</Link>
            <span style={{ color:"rgba(255,255,255,.25)" }}>/</span>
            <span style={{ color:"#6ee7b7", fontSize:"12px" }}>{spec.name}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"14px" }}>
            <span style={{ fontSize:"38px" }} aria-hidden="true">{spec.icon}</span>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(24px,4vw,40px)",
              fontWeight:"700", color:"#fff", margin:0 }}>
              Online {spec.name} Consultation in Chennai
            </h1>
          </div>
          <p style={{ fontSize:"15.5px", color:"rgba(255,255,255,.75)", lineHeight:1.75,
            maxWidth:"680px", marginBottom:"26px" }}>
            {spec.intro}
          </p>
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
            <button onClick={handleBook} className="btn-p">
              Book {spec.name} Consultation
            </button>
            <Link to="/doctors" className="btn-ol" style={{ borderColor:"rgba(255,255,255,.3)" }}>
              Browse All Specialists
            </Link>
          </div>
        </W>
      </section>

      {/* When to consult + Conditions */}
      <section style={{ background:"#f0f6fc", padding:"56px 0" }}>
        <W>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"28px" }} className="spec-grid-2">
            <div style={{ background:"#fff", border:"1px solid #e2eaf4", borderRadius:"14px", padding:"24px" }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"20px", fontWeight:"700",
                color:"#0b1f3a", marginBottom:"14px" }}>
                When to consult a {spec.name} specialist
              </h2>
              <ul style={{ paddingLeft:"18px", margin:0 }}>
                {spec.whenToConsult.map((item) => (
                  <li key={item} style={{ fontSize:"13.5px", color:"#475569", marginBottom:"8px", lineHeight:1.6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background:"#fff", border:"1px solid #e2eaf4", borderRadius:"14px", padding:"24px" }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"20px", fontWeight:"700",
                color:"#0b1f3a", marginBottom:"14px" }}>
                {spec.name} care we support
              </h2>
              <ul style={{ paddingLeft:"18px", margin:0 }}>
                {spec.conditions.map((item) => (
                  <li key={item} style={{ fontSize:"13.5px", color:"#475569", marginBottom:"8px", lineHeight:1.6 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Medical-disclaimer link — this page describes symptoms/
              conditions in general terms, not a diagnosis; point to the
              real disclaimer page rather than repeating legal text here. */}
          <p style={{ fontSize:"11.5px", color:"#94a3b8", marginTop:"18px", textAlign:"center" }}>
            This page is for general information only and isn't a diagnosis.{" "}
            <Link to="/disclaimer" style={{ color:"#64748b", textDecoration:"underline" }}>
              Read our medical disclaimer
            </Link>.
          </p>
        </W>
      </section>

      {/* Live doctor list for this specialty */}
      <section style={{ background:"#fff", padding:"56px 0" }}>
        <W>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"22px", fontWeight:"700",
            color:"#0b1f3a", marginBottom:"18px" }}>
            {spec.name} Specialists Available
          </h2>
          {doctors === null ? (
            <p style={{ fontSize:"13.5px", color:"#94a3b8" }}>Loading doctors…</p>
          ) : doctors.length === 0 ? (
            <p style={{ fontSize:"13.5px", color:"#94a3b8" }}>
              No {spec.name.toLowerCase()} specialists are listed right now — check back soon, or{" "}
              <Link to="/doctors" style={{ color:"#047857" }}>browse all specialists</Link>.
            </p>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(240px,100%),1fr))", gap:"16px" }}>
              {doctors.map((d) => (
                <div key={d.id} style={{ border:"1px solid #e2eaf4", borderRadius:"12px", padding:"16px",
                  display:"flex", flexDirection:"column", gap:"4px" }}>
                  <p style={{ fontWeight:"700", fontSize:"14px", color:"#0b1f3a", margin:0 }}>{d.full_name}</p>
                  <p style={{ fontSize:"12px", color:"#64748b", margin:0 }}>{d.qualification || spec.name}</p>
                  {d.experience_yrs ? (
                    <p style={{ fontSize:"12px", color:"#94a3b8", margin:0 }}>{d.experience_yrs}+ years experience</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign:"center", marginTop:"28px" }}>
            <button onClick={handleBook} className="btn-p">
              View All {spec.name} Doctors & Book
            </button>
          </div>
        </W>
      </section>

      {/* FAQ */}
      <section style={{ background:"#f0f6fc", padding:"56px 0 72px" }}>
        <W>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"22px", fontWeight:"700",
            color:"#0b1f3a", marginBottom:"18px" }}>
            {spec.name} — Frequently Asked Questions
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {spec.faq.map((f) => (
              <div key={f.q} style={{ background:"#fff", border:"1px solid #e2eaf4",
                borderRadius:"12px", padding:"16px 20px" }}>
                <p style={{ fontWeight:"700", fontSize:"14px", color:"#0b1f3a", margin:"0 0 6px" }}>{f.q}</p>
                <p style={{ fontSize:"13.5px", color:"#475569", margin:0, lineHeight:1.65 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </W>
      </section>

      {/* Other specialties — internal linking helps SEO crawl depth too.
          Uses the LIVE list when loaded (so this always matches what's
          actually clickable on the homepage), falling back to the
          static content file's list only while that fetch is pending. */}
      <section style={{ background:"#fff", padding:"48px 0 64px", borderTop:"1px solid #e2eaf4" }}>
        <W>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"18px", fontWeight:"700",
            color:"#0b1f3a", marginBottom:"14px" }}>
            Other Specialties
          </h2>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"9px" }}>
            {(Array.isArray(liveSpecs) && liveSpecs.length > 0
              ? liveSpecs.map((s) => ({ slug: specialtyToSlug(s.name), name: s.name, icon: s.icon || "🏥" }))
              : SPECIALTIES
            ).filter((s) => s.slug !== spec.slug).map((s) => (
              <Link key={s.slug} to={`/specialties/${s.slug}`} style={{
                display:"inline-flex", alignItems:"center", gap:"6px",
                padding:"8px 14px", borderRadius:"999px", border:"1px solid #e2eaf4",
                fontSize:"12.5px", fontWeight:"600", color:"#0b1f3a", textDecoration:"none",
              }}>
                <span aria-hidden="true">{s.icon}</span> {s.name}
              </Link>
            ))}
          </div>
        </W>
      </section>
    </div>
  );
}
