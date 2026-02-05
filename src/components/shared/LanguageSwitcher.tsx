/**
 * Language Switcher Component
 *
 * Dropdown menu for changing the application language.
 * Integrates with react-i18next for internationalization.
 *
 * Supported Languages:
 * - English (en)
 * - Español (es)
 * - Português (pt)
 * - Deutsch (de)
 * - Italiano (it)
 * - हिन्दी (hi)
 *
 * Features:
 * - Country flag icons for visual identification
 * - Checkmark for current language
 * - Mobile and desktop responsive layouts
 * - Persists language selection via i18next
 *
 * @param setIsOpen - Optional callback to close parent menu (for mobile nav)
 * @param isMobile - Whether to use mobile layout (full label vs code)
 */
"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";

/**
 * Available language configurations
 * Each includes language code, display label, and country code for flag
 */
const locales = [
  { code: "en", label: "English", country: "US" },
  { code: "es", label: "Español", country: "ES" },
  { code: "pt", label: "Português", country: "PT" },
  { code: "de", label: "Deutsch", country: "DE" },
  { code: "it", label: "Italiano", country: "IT" },
  { code: "hi", label: "हिन्दी", country: "IN" },
  //   { code: 'cz', label: 'Čeština', country: 'CZ' },
  //   { code: 'uk', label: 'Українська', country: 'UA' },
];

interface LanguageSwitcherProps {
  setIsOpen?: (open: boolean) => void; // Close parent menu on selection
  isMobile?: boolean; // Use mobile layout
}

export function LanguageSwitcher({
  setIsOpen,
  isMobile = false,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language || "en";

  // Find current language config or default to English
  const currentLang =
    locales.find((l) => l.code === currentLocale) || locales[0];

  /**
   * Changes the application language
   * Persists via i18next and closes parent menu if provided
   */
  const handleLanguageChange = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    if (setIsOpen) setIsOpen(false);
  };

  // Trigger button content (flag + language code/label)
  const triggerContent = (
    <div className="flex items-center gap-2">
      <ReactCountryFlag
        svg
        countryCode={currentLang.country}
        title={currentLang.label}
        style={{ width: "1.25rem", height: "1.25rem" }}
        className="rounded-sm"
      />
      <span suppressHydrationWarning>
        {isMobile ? currentLang.label : currentLang.code.toUpperCase()}
      </span>
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start md:w-auto md:justify-center",
            isMobile && "h-12 text-base",
          )}
        >
          {triggerContent}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => handleLanguageChange(lang.code)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-3">
                <ReactCountryFlag
                  svg
                  countryCode={lang.country}
                  title={lang.label}
                  style={{ width: "1.25rem", height: "1.25rem" }}
                  className="rounded-sm"
                />
                <span className="text-sm">{lang.label}</span>
              </span>
              {/* Show checkmark for current language */}
              {currentLocale === lang.code && (
                <Check className="ml-2 h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
