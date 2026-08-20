/**
 * specialtyIcon.js — resolves a specialty's *display* icon to one of the
 * 25 illustrated SVGs at /public/assets/img/specialties/ when one exists
 * for that specialty, while staying fully backward-compatible with the
 * admin-managed `specialties` table (GET /specialties) and its `icon`
 * field.
 *
 * WHY THIS EXISTS (Aug 2026 client request): "connect this svg in the
 * specialist list in the services page and wherever specialist shows
 * those places add this img and make the ui best" — replacing the
 * plain emoji (🩺, ❤️, etc.) used everywhere a specialty is listed with
 * the illustrated icon set, sitewide, from one place.
 *
 * RULES (in order):
 *  1. If the admin has already set a real icon URL for this specialty
 *     in the dashboard (Specialties.jsx → upload/paste image URL),
 *     that is respected and returned as-is — admin's explicit choice
 *     always wins over this default set.
 *  2. Otherwise, if this specialty's name resolves (via the *same*
 *     specialtyToSlug() used for routing — see specialtySlug.js) to one
 *     of the 25 bundled illustrations, that SVG path is returned.
 *  3. Otherwise, whatever was passed in falls through unchanged (emoji
 *     fallback, same as before this file existed) — e.g. if admin adds
 *     a 26th specialty later, it just shows its emoji until a matching
 *     SVG is added to ICON_SLUGS/public/assets/img/specialties/.
 *
 * To add a new illustrated icon later: drop `{slug}.svg` into
 * public/assets/img/specialties/ and add `{slug}` to ICON_SLUGS below.
 */
import { specialtyToSlug } from "./specialtySlug";

// Must exactly match the .svg filenames in
// public/assets/img/specialties/ (no extension).
const ICON_SLUGS = new Set([
  "general-medicine", "general-surgery", "diabetology",
  "bariatric-and-metabolic-correction", "plastic-cosmetic-surgery",
  "orthopaedics", "cardiology", "functional-restorative-neurology",
  "neurology", "oncology", "pulmonology", "urology", "nephrology",
  "gynaecology", "infertility", "paediatrics", "paediatric-cardiology",
  "gastroenterology", "gastrointestinal-surgery", "dentistry",
  "ophthalmology", "dermatology-cosmetology", "ent",
  "adolescent-medicine", "psychiatry",
]);

const ICON_BASE_PATH = "/assets/img/specialties";

/**
 * @param {string} name          The specialty's real name (e.g. "Cardiology").
 * @param {string} currentIcon   Whatever icon value you already have for
 *                                it (emoji string, or an admin-set URL).
 * @returns {string}             URL/path to render via <SpecialtyIcon icon={...}/>
 *                                (or as a plain <img src>), or the
 *                                original emoji if no match/override.
 */
export function resolveSpecialtyIcon(name, currentIcon) {
  const val = typeof currentIcon === "string" ? currentIcon.trim() : "";
  const isAlreadyUrl = /^(https?:\/\/|\/)/.test(val);
  if (isAlreadyUrl) return currentIcon; // admin already customized this one — don't override

  const slug = specialtyToSlug(name);
  if (slug && ICON_SLUGS.has(slug)) {
    return `${ICON_BASE_PATH}/${slug}.svg`;
  }
  return currentIcon; // no illustration yet for this specialty — keep emoji fallback
}
