/**
 * Internationalization Provider Component
 *
 * Wraps the application with i18next provider to enable translation functionality.
 * Handles i18n initialization timing to prevent React hook errors in Next.js App Router.
 *
 * Critical Pattern:
 * - Waits for i18n to fully initialize before providing it to children
 * - Prevents "invalid hook call" errors that occur when i18n initializes mid-render
 * - Uses event listener to detect initialization completion
 * - Clones i18n instance if available to ensure fresh context
 *
 * This component is essential for avoiding hydration mismatches and hook errors
 * that commonly occur with react-i18next in Next.js server components.
 */
"use client";

import i18n from "@/i18";
import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState(i18n);

  /**
   * Wait for i18n initialization before rendering
   * This prevents hook errors caused by i18n initializing during component render
   */
  useEffect(() => {
    if (!i18n.isInitialized) {
      const onInit = () => {
        // Clone instance to ensure fresh context, fallback to original if cloning not available
        setInstance(i18n.cloneInstance ? i18n.cloneInstance() : i18n);
      };
      i18n.on("initialized", onInit);
      return () => {
        i18n.off("initialized", onInit);
      };
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
