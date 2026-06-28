import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";

// LanguageDetector intentionally removed.
// It reads localStorage and switches to 'ta'/'hi' which only have
// 7 keys — causing the entire home page to display raw key names.
// Tamil and Hindi translations must be completed before re-enabling.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
    hi: { translation: hi },
  },
  lng:         "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
