/**
 * Internationalization (i18n) Configuration
 *
 * Configures react-i18next for multi-language support with Next.js App Router.
 * Uses different initialization strategies for client and server environments
 * to prevent hydration mismatches and hook-related errors.
 *
 * Key Features:
 * - Client-side: Dynamic language detection and loading from public folder
 * - Server-side: Static English fallback to ensure consistent SSR
 * - Language persistence via localStorage
 * - Suspense disabled to prevent rendering issues during language loading
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

import enTranslations from "../public/locales/en.json";

// Detect environment to apply appropriate initialization strategy
const isClient = typeof window !== "undefined";

/**
 * Client-side initialization
 * Uses HTTP backend to dynamically load translation files from /public/locales
 * Detects user language from localStorage or browser settings
 */
if (isClient) {
  i18n
    .use(Backend) // Load translations from server
    .use(LanguageDetector) // Auto-detect user language
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
      fallbackLng: "en", // Default language if detection fails
      //supportedLngs: ["en", "es", "pt", "de", "it", "hi"], // Future multi-language support
      supportedLngs: ["en"], // Currently only English is supported
      load: "languageOnly", // Load 'en' instead of 'en-US' for broader compatibility
      backend: {
        loadPath: "/locales/{{lng}}.json", // Path pattern for translation files
      },
      detection: {
        order: ["localStorage", "navigator"], // Check localStorage first, then browser language
        lookupLocalStorage: "i18nextLng", // Key name for localStorage
        caches: ["localStorage"], // Persist language choice
      },
      interpolation: {
        escapeValue: false, // React already escapes values to prevent XSS
      },
      react: {
        useSuspense: false, // Disable suspense to avoid loading states during language switch
      },
      debug: false, // Set to true for development debugging
    });
  /**
   * Server-side initialization
   * Uses pre-loaded English translations to ensure consistent SSR output
   * Prevents hydration mismatches by avoiding dynamic language detection on server
   */
} else {
  i18n.use(initReactI18next).init({
    lng: "en", // Always use English on server for consistency
    resources: {
      en: {
        translation: enTranslations, // Directly embed translations
      },
    },
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });
}

export default i18n;
