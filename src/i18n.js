import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";

// LanguageDetector intentionally NOT used here — it reads the browser's
// Accept-Language header and can land a visitor on 'hi', which still
// only has the original 7 nav keys (not translated as part of the
// Language Support feature — client asked for English + Tamil only).
// Instead we read our own saved preference below, restricted to
// languages that are actually fully translated.
//
// 'ta' now has full coverage for the nav/home/hp namespaces (the
// public marketing pages + navbar) — see Navbar.jsx's language
// switcher, which is the only place this key gets written.
const FULLY_TRANSLATED = ["en", "ta"];
let savedLang = "en";
try {
  const stored = localStorage.getItem("wc4a_lang");
  if (stored && FULLY_TRANSLATED.includes(stored)) savedLang = stored;
} catch { /* localStorage unavailable (SSR/privacy mode) — default to en */ }

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
    hi: { translation: hi },
  },
  lng:         savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
