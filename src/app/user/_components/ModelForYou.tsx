"use client";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ModelForYouHero() {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <div className="relative bg-[#1a1a1a] rounded-3xl overflow-hidden px-8 py-12 md:px-16 md:py-16">
        {/* Decorative circles - top left */}
        <div className="absolute -top-14 -left-14 w-32 h-32 opacity-40">
          <div className="absolute inset-0 border border-gray-50 rounded-full"></div>
          <div className="absolute inset-2 border border-gray-50 rounded-full"></div>
          <div className="absolute inset-4 border border-gray-50 rounded-full"></div>
          <div className="absolute inset-6 border border-gray-50 rounded-full"></div>
          <div className="absolute inset-8 border border-gray-50 rounded-full"></div>
        </div>

        {/* Decorative circles - bottom right */}
        <div className="absolute -bottom-14 -right-14 w-32 h-32 opacity-40">
          <div className="absolute inset-0 border border-gray-50 rounded-full"></div>
          <div className="absolute inset-2 border border-gray-50 rounded-full"></div>
          <div className="absolute inset-4 border border-gray-50 rounded-full"></div>
          <div className="absolute inset-6 border border-gray-50 rounded-full"></div>
          <div className="absolute inset-8 border border-gray-50 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-6">
          {/* Main Heading */}
          <h1
            suppressHydrationWarning
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight"
          >
            {t("user.dashboard.hero.title")}
          </h1>

          {/* Subtitle */}
          <p
            suppressHydrationWarning
            className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto leading-relaxed"
          >
            {t("user.dashboard.hero.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative">
              <input
                suppressHydrationWarning
                type="text"
                placeholder={t("user.dashboard.hero.searchPlaceholder")}
                className="w-full bg-[#2a2a2a] text-white placeholder-gray-500 rounded-full py-4 px-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2.5 hover:bg-gray-200 transition-colors">
                <ArrowRight className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
