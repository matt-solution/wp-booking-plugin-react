import React from "react";
import { createRoot } from "react-dom/client";
import VisBookComponent from "./components/common/VisBookComponent";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationsEn from "./locales/en.json"; // English translations
import translationsNb from "./locales/nb.json"; // Norwegian translations
import "./styles/VisBookComponent.scss";

// Initialize i18next for language detection and translation
i18next.use(LanguageDetector).init({
  resources: {
    en: {
      translation: translationsEn,
    },
    nb: {
      translation: translationsNb,
    },
  },
  fallbackLng: "en", // Fallback language if translation not found
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

// Create a root container for the app
const container = document.getElementById("visbook-root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nextProvider i18n={i18next}>
        <VisBookComponent />
      </I18nextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
