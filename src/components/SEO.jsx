/**
 * SEO.jsx — per-page title/meta/OG/Twitter/canonical/JSON-LD, set via
 * useEffect rather than a library like react-helmet. Every page in this
 * app already did `document.title = "..."` directly in a useEffect (you
 * can find that exact pattern in Home.jsx, AboutUs.jsx, Contact.jsx, etc)
 * — this is that same convention, extended to also set the meta tags
 * that were previously only ever set once, statically, in index.html.
 *
 * IMPORTANT — what this does and doesn't fix:
 * Google's crawler executes JavaScript before indexing, so these tags
 * genuinely help search results and rich snippets. Social link-preview
 * crawlers (WhatsApp, Facebook, LinkedIn, iMessage, etc) do NOT execute
 * JavaScript — they only ever read whatever's already in the raw HTML
 * response, which for a page like this is whatever's hardcoded in
 * index.html. So sharing a specific doctor's page or a blog post link in
 * WhatsApp will still show the same generic site preview, not that
 * page's specific title/image, no matter what this component sets.
 * Fixing that for real needs server-side rendering or per-route
 * prerendering at build time — a bigger, separate project, not something
 * this component can do from inside a client-rendered SPA. What this DOES
 * fix: accurate browser tab titles, accurate bookmarks/history entries,
 * and — the part that actually matters most here — what Google shows in
 * search results and how Google's own rich-snippet features render.
 *
 * Usage:
 *   <SEO title="About Us" description="..." />
 *   <SEO title="..." description="..." jsonLd={{ "@type": "MedicalOrganization", ... }} />
 */
import { useEffect } from "react";

const SITE_NAME = "We Care 4 'all'";
const DEFAULT_OG_IMAGE = "/assets/img/logo/logo-light.png";
const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  path,           // e.g. "/about" — used for canonical + og:url
  type = "website",
  jsonLd,         // optional object — rendered as a <script type="application/ld+json">
  noindex = false,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;
    window.scrollTo(0, 0);

    if (description) setMeta("name", "description", description);
    if (keywords)    setMeta("name", "keywords", keywords);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    const url = path ? `${SITE_URL}${path}` : window.location.href;
    setLink("canonical", url);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description || "");
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", url);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:image", image || `${SITE_URL}${DEFAULT_OG_IMAGE}`);

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description || "");
    setMeta("name", "twitter:image", image || `${SITE_URL}${DEFAULT_OG_IMAGE}`);

    // JSON-LD structured data
    const existing = document.getElementById("seo-jsonld");
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = "seo-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({ "@context": "https://schema.org", ...jsonLd });
      document.head.appendChild(script);
    }

    return () => {
      const cleanup = document.getElementById("seo-jsonld");
      if (cleanup) cleanup.remove();
    };
  }, [title, description, keywords, image, path, type, jsonLd, noindex]);

  return null;
}
