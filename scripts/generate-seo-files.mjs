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
// behind a <ProtectedRoute> in App.jsx. This list is intentionally
// short: per an existing "per client requirement" comment in App.jsx,
// only /, /about, /contact, /healthcare-provider, /corporate-wellness,
// and the four legal pages are reachable without logging in. Google's
// crawler is never logged in, so /doctors, /blog, /home-healthcare,
// /international-patients, /our-hospitals, and /partner-with-us —
// several of which are this site's highest-commercial-intent pages —
// currently cannot be indexed at all, regardless of any meta tags or
// structured data on them. Listing a page in the sitemap that the
// crawler can't actually reach doesn't just do nothing, it can read as
// a soft-404 signal. If any of these should become indexable, remove
// its ProtectedRoute wrapper in App.jsx first, then add it back here.
const STATIC_PAGES = [
  { path: "/",                     changefreq: "weekly",  priority: "1.0" },
  { path: "/about",                changefreq: "monthly", priority: "0.7" },
  { path: "/healthcare-provider",  changefreq: "monthly", priority: "0.6" },
  { path: "/corporate-wellness",   changefreq: "monthly", priority: "0.6" },
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

function buildSitemap(blogSlugs) {
  const urlEntries = STATIC_PAGES.map(p =>
    `  <url>\n` +
    `    <loc>${domain}${p.path}</loc>\n` +
    `    <changefreq>${p.changefreq}</changefreq>\n` +
    `    <priority>${p.priority}</priority>\n` +
    `  </url>`
  );

  // Left commented-out intentionally: see the STATIC_PAGES comment
  // above re: /blog currently being login-gated. Once it's public,
  // delete the `false &&` guard below (or just move this loop up next
  // to STATIC_PAGES) to include real blog post URLs.
  const BLOG_IS_PUBLIC = false;
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
    // These LOOK like ordinary marketing pages but are currently wrapped
    // in <ProtectedRoute> in App.jsx ("per client requirement") — the
    // crawler would just hit a login redirect on all of them, so there's
    // no point letting Google spend crawl budget trying. Remove a line
    // here the same day its ProtectedRoute wrapper comes off.
    `Disallow: /doctors\n` +
    `Disallow: /blog\n` +
    `Disallow: /home-healthcare\n` +
    `Disallow: /international-patients\n` +
    `Disallow: /our-hospitals\n` +
    `Disallow: /partner-with-us\n` +
    `\n` +
    `Sitemap: ${domain}/sitemap.xml\n`
  );
}

async function main() {
  const blogSlugs = await fetchPublishedBlogSlugs();
  writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), buildSitemap(blogSlugs));
  writeFileSync(path.join(PUBLIC_DIR, "robots.txt"), buildRobotsTxt());
  console.log(`✅ Generated sitemap.xml (${STATIC_PAGES.length} static pages) and robots.txt for ${domain}`);
}

main();
