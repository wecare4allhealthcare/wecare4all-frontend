import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n.js";
import "./styles/global.css";
import App from "./App.jsx";

// Clear any previously stored language (set by old LanguageDetector)
// so 'ta'/'hi' from a prior session can't override our fixed 'en'.
localStorage.removeItem("i18nextLng");

// Service worker — production only.
// In dev, unregister any previously installed SW so Vite HMR works.
if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
      if (regs.length > 0)
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    });
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode><App /></StrictMode>
);
