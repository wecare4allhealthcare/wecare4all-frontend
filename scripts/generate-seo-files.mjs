#!/usr/bin/env node
/**
 * scripts/generate-seo-files.mjs
 *
 * Regenerates public/robots.txt and public/sitemap.xml right before
 * every production build, using the REAL deployed domain instead of
 * the hardcoded "localhost:5173" both files previously had baked in
 * permanently. A sitemap pointing at localhost is functionally
 * useless to Google — this was silently broken in production the
 * whole time these files were static and hand-edited.
 *
 * Also pulls in every currently-published blog post from the backend
 * (GET /blog/posts) so new posts show up in the sitemap automatically
 * on the next deploy, with no manual sitemap editing ever needed again.
 *
 * WHERE THE DOMAIN COMES FROM:
 * Reads VITE_SITE_URL from the environment (set this in your
 * hosting provider's dashboard — Vercel/Netlify/etc — as a real build
 * environment variable, same place VITE_API_BASE_URL is already set).
 * Falls back to a clearly-fake placeholder domain with a loud warning
 * if it's missing, rather than silently shipping localhost again.
 *
 * Wired into `npm run build` (see package.json) — runs automatically,
 * nothing to remember to do manually before each deploy.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const SITE_URL = (process.env.VITE_SITE_URL || "").replace(/\/$/, "");
const API_BASE = (process.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

if (!SITE_URL) {
  console.warn(
    "\n⚠️  VITE_SITE_URL is not set — robots.txt and sitemap.xml will be " +
    "written with a placeholder domain (https://YOUR-DOMAIN-HERE.example) " +
    "instead of your real one. Set VITE_SITE_URL in your hosting " +
    "provider's environment variables (same place VITE_API_BASE_URL is " +
    "set) before deploying to production.\n"
  );
}
const domain = SITE_URL || "https://YOUR-DOMAIN-HERE.example";

// Static pages this site actually has PUBLICLY reachable — i.e. not
// behind a <ProtectedRoute> in App.jsx.
// /home-healthcare, /international-patients, and /partner-with-us were
// made public earlier (Aug 2026 — the "Care+" and Medical Tourism
// positioning work). /about, /doctors, /our-hospitals, and
// /our-hospitals/:id were found and fixed in a follow-up SEO audit —
// /about had an unrelated AboutRouteGuard restricting it to admin/
// hospital-partner accounts only (with no form on the page, no reason
// for that gate to exist), and /doctors + /our-hospitals were still
// behind <ProtectedRoute> despite being exactly the pages the client's
// own keyword list ("best doctors in chennai", hospital directory
// searches, etc) needs indexable. All four had this list and the
// robots.txt Disallow list below out of sync with App.jsx more than
// once now — double-check both together whenever a route's gating
// changes.
const STATIC_PAGES = [
  { path: "/",                     changefreq: "weekly",  priority: "1.0" },
  { path: "/about",                changefreq: "monthly", priority: "0.7" },
  { path: "/healthcare-provider",  changefreq: "monthly", priority: "0.6" },
  { path: "/corporate-wellness",   changefreq: "monthly", priority: "0.6" },
  { path: "/home-healthcare",      changefreq: "monthly", priority: "0.8" },
  { path: "/international-patients", changefreq: "monthly", priority: "0.8" },
  { path: "/partner-with-us",      changefreq: "monthly", priority: "0.5" },
  { path: "/hospital-consultancy", changefreq: "monthly", priority: "0.7" },
  { path: "/healthcare-consultancy", changefreq: "monthly", priority: "0.9" },
  { path: "/doctors",              changefreq: "weekly",  priority: "0.9" },
  { path: "/our-hospitals",        changefreq: "weekly",  priority: "0.8" },
  { path: "/blog",                 changefreq: "weekly",  priority: "0.7" },
  { path: "/contact",              changefreq: "yearly",  priority: "0.5" },
  { path: "/privacy",              changefreq: "yearly",  priority: "0.3" },
  { path: "/terms",                changefreq: "yearly",  priority: "0.3" },
  { path: "/disclaimer",           changefreq: "yearly",  priority: "0.3" },
  { path: "/rights",               changefreq: "yearly",  priority: "0.3" },
];

async function fetchPublishedBlogSlugs() {
  // Best-effort — a build should never fail just because the backend
  // was briefly unreachable at build time. Falls back to "no blog
  // posts in the sitemap this deploy" rather than failing the whole
  // build.
  try {
    const res = await fetch(`${API_BASE}/blog/posts?page=1&page_size=200`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.posts || []).map(p => ({ slug: p.slug, updated_at: p.published_at }));
  } catch (e) {
    console.warn(`⚠️  Couldn't fetch blog posts for the sitemap (${e.message}) — continuing without them.`);
    return [];
  }
}

// Was completely missing: /specialties/:slug pages (SpecialtyPage.jsx)
// are public, have real per-specialty SEO keywords/meta already built
// in, and are exactly the kind of page the client's given keyword list
// ("best gastroenterologist in chennai", "dermatologist in chennai",
// "best neuro near me", etc) needs to rank for — but none of the 25
// admin-managed specialties were ever in the sitemap, so Google had to
// find them purely by crawling homepage links, with no priority signal
// and no guarantee of discovery at all for a newer/lower-authority
// domain. Same best-effort pattern as the blog fetch above.
async function fetchActiveSpecialtySlugs() {
  try {
    const res = await fetch(`${API_BASE}/specialties`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.specialties || [])
      .filter(s => s.is_active)
      .map(s => s.slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  } catch (e) {
    console.warn(`⚠️  Couldn't fetch specialties for the sitemap (${e.message}) — continuing without them.`);
    return [];
  }
}

// /our-hospitals/:id (HospitalProfile.jsx) is public now too — real
// partner-hospital profile pages are exactly what "best hospitals in
// chennai" style searches need to surface. Same best-effort pattern.
async function fetchPartnerHospitalIds() {
  try {
    const res = await fetch(`${API_BASE}/empanelment/partner-hospitals`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.hospitals || []).map(h => h.id).filter(Boolean);
  } catch (e) {
    console.warn(`⚠️  Couldn't fetch partner hospitals for the sitemap (${e.message}) — continuing without them.`);
    return [];
  }
}

function buildSitemap(blogSlugs, specialtySlugs, hospitalIds) {
  const urlEntries = STATIC_PAGES.map(p =>
    `  <url>\n` +
    `    <loc>${domain}${p.path}</loc>\n` +
    `    <changefreq>${p.changefreq}</changefreq>\n` +
    `    <priority>${p.priority}</priority>\n` +
    `  </url>`
  );

  // /blog went public in App.jsx (ProtectedRoute wrapper removed) —
  // real blog post URLs now included in the sitemap.
  const BLOG_IS_PUBLIC = true;
  if (BLOG_IS_PUBLIC) {
    for (const post of blogSlugs) {
      urlEntries.push(
        `  <url>\n` +
        `    <loc>${domain}/blog/${post.slug}</loc>\n` +
        (post.updated_at ? `    <lastmod>${new Date(post.updated_at).toISOString().slice(0,10)}</lastmod>\n` : "") +
        `    <changefreq>monthly</changefreq>\n` +
        `    <priority>0.6</priority>\n` +
        `  </url>`
      );
    }
  }

  // /specialties/:slug is public (see App.jsx) — each one already has
  // dedicated per-specialty SEO keywords/meta (SpecialtyPage.jsx), it
  // just was never listed here for Google to prioritize/discover.
  for (const slug of specialtySlugs) {
    urlEntries.push(
      `  <url>\n` +
      `    <loc>${domain}/specialties/${slug}</loc>\n` +
      `    <changefreq>monthly</changefreq>\n` +
      `    <priority>0.7</priority>\n` +
      `  </url>`
    );
  }

  // /our-hospitals/:id is public now too (see App.jsx SEO audit note).
  for (const id of hospitalIds) {
    urlEntries.push(
      `  <url>\n` +
      `    <loc>${domain}/our-hospitals/${id}</loc>\n` +
      `    <changefreq>monthly</changefreq>\n` +
      `    <priority>0.6</priority>\n` +
      `  </url>`
    );
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!-- Auto-generated by scripts/generate-seo-files.mjs at build time — do not hand-edit, it will be overwritten on the next build. -->\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urlEntries.join("\n") + "\n" +
    `</urlset>\n`
  );
}

function buildRobotsTxt() {
  return (
    `User-agent: *\n` +
    `Allow: /\n` +
    // Dashboards/portals — nothing here has indexing value, and it's
    // all behind a login wall anyway.
    `Disallow: /admin\n` +
    `Disallow: /doctor\n` +
    `Disallow: /patient\n` +
    `Disallow: /hospital/dashboard\n` +
    `Disallow: /pharmacy\n` +
    `Disallow: /login\n` +
    // /doctors and /our-hospitals removed from this list (SEO audit,
    // Aug 2026) — both are now public in App.jsx (ProtectedRoute
    // removed; /doctors' own booking click handler already redirects
    // to /login independently, so nothing else needed to change).
    // /hospital-consultancy was here too for a while ("genuinely
    // gated, real hospital-partner portal") — client decision reversed
    // that: it's the pitch page a hospital reads BEFORE applying via
    // /partner-with-us, so it needed to be public same as the rest.
    // Now listed in STATIC_PAGES above instead.
    `\n` +
    `Sitemap: ${domain}/sitemap.xml\n`
  );
}

async function main() {
  const blogSlugs = await fetchPublishedBlogSlugs();
  const specialtySlugs = await fetchActiveSpecialtySlugs();
  const hospitalIds = await fetchPartnerHospitalIds();
  writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), buildSitemap(blogSlugs, specialtySlugs, hospitalIds));
  writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), buildRobotsTxt());
  console.log(`✅ Generated sitemap.xml (${STATIC_PAGES.length} static + ${blogSlugs.length} blog + ${specialtySlugs.length} specialty + ${hospitalIds.length} hospital pages) and robots.txt for ${domain}`);
}

main();
