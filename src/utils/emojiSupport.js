/**
 * emojiSupport.js — detects whether the current browser/OS can actually
 * render a given emoji character.
 *
 * Some specialty records (Cardiology, Pulmonology, Infertility, Dermatology
 * & Cosmetology, etc.) were saved with emoji added to Unicode in 2020-22
 * (e.g. anatomical heart, lungs, people-hugging, bubbles). Those glyphs
 * are missing from the emoji font on older Windows/Chrome installs, so
 * they render as an empty box instead of the icon — exactly what shows up
 * blank in the admin Specialties grid. The picker itself was already
 * fixed to only offer pre-2019 emoji, but existing saved records still
 * hold the old codepoints.
 *
 * Rather than hardcoding a blacklist of "bad" emoji (which only covers
 * the ones we know about today), this rasterizes the character to an
 * offscreen canvas and compares it against a guaranteed-unsupported
 * reference codepoint (an unassigned Unicode Private Use Area character,
 * which every browser renders as "no glyph found"). If the two look
 * identical, the browser drew a blank box for our character too, so we
 * know to fall back to a safe icon — no matter what emoji shows up here
 * in the future.
 */

let ctx = null;
let unsupportedFingerprint = null;
const cache = new Map();

const SIZE = 28;

function getCtx() {
  if (!ctx) {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
  }
  return ctx;
}

function fingerprint(ch) {
  const c = getCtx();
  if (!c) return null;
  c.clearRect(0, 0, SIZE, SIZE);
  c.textBaseline = "top";
  c.font = `20px sans-serif`;
  c.fillText(ch, 2, 2);
  return c.getImageData(0, 0, SIZE, SIZE).data.join(",");
}

/**
 * Returns true if `ch` is (probably) renderable as a real glyph in this
 * browser, false if it would show up as a blank/placeholder box.
 * Safe to call during render — results are memoized per character and
 * gracefully assumes "supported" if canvas isn't available (SSR, etc.).
 */
export function isEmojiSupported(ch) {
  if (typeof document === "undefined" || !ch) return true;
  if (cache.has(ch)) return cache.get(ch);

  try {
    if (unsupportedFingerprint === null) {
      // U+10FFFD — last valid codepoint in the Unicode range, permanently
      // unassigned, so every browser renders it as "no glyph found".
      unsupportedFingerprint = fingerprint("\u{10FFFD}");
    }
    const supported = fingerprint(ch) !== unsupportedFingerprint;
    cache.set(ch, supported);
    return supported;
  } catch {
    return true;
  }
}
