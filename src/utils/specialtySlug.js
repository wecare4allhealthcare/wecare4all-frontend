/**
 * specialtySlug.js — one shared function to turn a specialty's real
 * `name` (from the live `specialties` table / GET /specialties, the
 * same one the admin panel manages) into a URL slug for
 * /specialties/{slug}.
 *
 * IMPORTANT: this must be the ONLY place this conversion happens.
 * Home.jsx's specialty chips and SpecialtyPage.jsx's route/live-doctor
 * lookup both import this — if they ever used two different local
 * copies of this logic and drifted, a chip could link to a URL that
 * SpecialtyPage.jsx doesn't parse back to the same name, silently
 * breaking the link or showing the wrong doctors.
 *
 * Handles the real admin specialty names seen in production (Aug 2026),
 * which include "&" and multi-word names — e.g. "Plastic & Cosmetic
 * Surgery" → "plastic-cosmetic-surgery", "Bariatric and Metabolic
 * Correction" → "bariatric-and-metabolic-correction".
 */
export function specialtyToSlug(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/&/g, "")            // "Plastic & Cosmetic" → "plastic  cosmetic"
    .replace(/[^a-z0-9\s-]/g, "") // strip anything else non-URL-safe
    .trim()
    .replace(/\s+/g, "-")         // spaces → hyphens
    .replace(/-+/g, "-");         // collapse any double hyphens left by the above
}
