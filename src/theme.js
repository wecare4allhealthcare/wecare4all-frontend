/**
 * theme.js — SINGLE SOURCE OF TRUTH for all colors
 * Change here → updates entire website
 */
export const COLORS = {
  primary:       "#047857",
  primaryDark:   "#065f46",
  primaryLight:  "#059669",
  primaryBg:     "#f0fdf4",
  primaryBorder: "#86efac",
  navy:          "#0b1f3a",
  navyDark:      "#071524",
  navyMid:       "#112d52",
  teal:          "#0e7490",
  sky:           "#0369a1",
  violet:        "#7c3aed",
  amber:         "#b45309",
  rose:          "#be123c",
  text:          "#1e293b",
  muted:         "#64748b",
  light:         "#94a3b8",
  bgLight:       "#f0f6fc",
  bgMid:         "#f8fafc",
  border:        "#e2eaf4",
  white:         "#ffffff",
  onDarkAccent:  "#34d399",
  onDarkSub:     "rgba(255,255,255,0.70)",
  onDarkMuted:   "rgba(255,255,255,0.45)",
  gradPrimary:   "linear-gradient(135deg,#047857,#059669)",
  gradNavy:      "linear-gradient(135deg,#0b1f3a,#112d52)",
  gradHero:      "linear-gradient(-45deg,#071524,#0b1f3a,#0a2e52,#062818,#0b1f3a)",
  gradCTA:       "linear-gradient(135deg,#065f46,#047857,#059669)",
};
export const FONTS = {
  heading: "'Cormorant Garamond',Georgia,serif",
  body:    "'DM Sans',system-ui,sans-serif",
};
export const CSS_VARS = `
  :root {
    --green:     ${COLORS.primary};
    --green-d:   ${COLORS.primaryDark};
    --green-l:   ${COLORS.primaryLight};
    --green-bg:  ${COLORS.primaryBg};
    --navy:      ${COLORS.navy};
    --navy-d:    ${COLORS.navyDark};
    --navy-m:    ${COLORS.navyMid};
    --text:      ${COLORS.text};
    --muted:     ${COLORS.muted};
    --border:    ${COLORS.border};
    --bg:        ${COLORS.bgLight};
    --white:     ${COLORS.white};
    --shadow-sm: 0 2px 8px rgba(11,31,58,.06);
    --shadow-md: 0 4px 20px rgba(11,31,58,.09);
    --shadow-lg: 0 12px 36px rgba(11,31,58,.13);
    --shadow-xl: 0 20px 60px rgba(11,31,58,.16);
  }
`;
export const ANIMATIONS = `
  @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulseDot  { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.45)} 50%{box-shadow:0 0 0 8px rgba(16,185,129,0)} }
  @keyframes floatY    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes spinSlow  { to{transform:translateY(-50%) rotate(360deg)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes countUp   { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
`;
