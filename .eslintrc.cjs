module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: "detect" } },
  ignorePatterns: ["dist", "node_modules", "*.config.js"],
  plugins: ["react-refresh"],
  rules: {
    // ── Deliberately OFF: these would flag this codebase's actual,
    // intentional style (every component uses style={{...}} instead of
    // Tailwind/CSS classes; that's a project-wide architecture choice
    // documented throughout this whole engagement, not something a
    // linter should treat as an error) ──
    "react/prop-types": "off",          // no PropTypes anywhere in this codebase — not adopting mid-project
    "react/no-unknown-property": "off", // false positives on some SVG/custom attrs used here
    "react/react-in-jsx-scope": "off",  // Vite's JSX transform doesn't need React in scope
    // Flags every apostrophe/quote in ordinary English text ("don't",
    // "We Care 4 'all'" itself, etc.) as an "error" — not a real bug,
    // just HTML-entity pedantry, and this site has a LOT of prose
    // content. Off, same reasoning as the two above.
    "react/no-unescaped-entities": "off",

    // ── ON: these catch actual bugs, not style preferences ──
    "no-unused-vars": ["warn", { args: "none", varsIgnorePattern: "^_" }],
    "no-undef": "error",                 // using a variable that was never imported/declared
    "react-hooks/rules-of-hooks": "error",   // hooks called conditionally/in loops — real runtime bugs
    "react-hooks/exhaustive-deps": "warn",   // stale-closure bugs in useEffect/useCallback
    "no-dupe-keys": "error",             // duplicate object/JSX prop keys
    "no-unreachable": "error",
    "no-fallthrough": "warn",
    "react/jsx-key": "error",            // missing key= in a .map() — a real React correctness issue
    "no-constant-condition": ["warn", { checkLoops: false }],
    // Empty catch{} is a deliberate, pervasive pattern in this codebase
    // for non-critical "best effort" async calls (a background refresh
    // failing shouldn't show the user an error toast) — allowing it
    // specifically here, while still flagging an empty if/for/while
    // block elsewhere, which usually IS a sign of leftover/incomplete
    // code worth a second look.
    "no-empty": ["error", { allowEmptyCatch: true }],
  },
};
