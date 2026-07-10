/**
 * formatDoctorName.js — prevents "Dr. Dr. [Name]" showing up anywhere a
 * doctor's name is displayed with a "Dr." prefix added.
 *
 * Some doctor records were entered (or migrated from an older system) with
 * "Dr." already included in full_name — e.g. "Dr. M. Maran" instead of just
 * "M. Maran". Every place in the app that hardcodes `Dr. {full_name}` then
 * shows "Dr. Dr. M. Maran". This strips any existing "Dr"/"Dr."/"DR."
 * prefix (with optional trailing period/space) before re-adding exactly one,
 * so it renders correctly regardless of how the name was originally stored.
 *
 * Handles the prefix being entered more than once too — e.g. a name
 * literally saved as "Dr. Dr. M. Maran" (easy mistake to make, since the
 * Add Doctor form's own placeholder text reads "Dr. Full Name", which reads
 * like part of the expected value rather than just a format hint). The
 * regex below strips repeated leading occurrences, not just one.
 *
 * Usage: withDrPrefix(doctor.full_name) → "Dr. M. Maran" either way.
 */
export function withDrPrefix(name) {
  if (!name) return "";
  const cleaned = name.trim().replace(/^(?:dr\.?\s+)+/i, "");
  return `Dr. ${cleaned}`;
}
