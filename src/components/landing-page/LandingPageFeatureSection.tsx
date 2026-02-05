"use client";
import React from "react";
import {
  Copy,
  Briefcase,
  ImagePlus,
  Image,
  Mic,
  Video,
  Download,
  CreditCard,
  Lock,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: Copy,
      title: t("landingPage.features.list.cloning.title"),
      description: t("landingPage.features.list.cloning.desc"),
    },
    {
      icon: Briefcase,
      title: t("landingPage.features.list.agency.title"),
      description: t("landingPage.features.list.agency.desc"),
    },
    {
      icon: ImagePlus,
      title: t("landingPage.features.list.photoVideo.title"),
      description: t("landingPage.features.list.photoVideo.desc"),
    },
    {
      icon: Image,
      title: t("landingPage.features.list.gallery.title"),
      description: t("landingPage.features.list.gallery.desc"),
    },
    {
      icon: Mic,
      title: t("landingPage.features.list.voice.title"),
      description: t("landingPage.features.list.voice.desc"),
    },
    {
      icon: Video,
      title: t("landingPage.features.list.video.title"),
      description: t("landingPage.features.list.video.desc"),
    },
    {
      icon: Download,
      title: t("landingPage.features.list.download.title"),
      description: t("landingPage.features.list.download.desc"),
    },
    {
      icon: CreditCard,
      title: t("landingPage.features.list.platform.title"),
      description: t("landingPage.features.list.platform.desc"),
    },
    {
      icon: Lock,
      title: t("landingPage.features.list.secure.title"),
      description: t("landingPage.features.list.secure.desc"),
    },
  ];

  return (
    <div className="w-full bg-linear-to-b from-white to-gray-50 py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4"
            suppressHydrationWarning
          >
            {t("landingPage.features.title")}
          </h2>
          <p
            className="text-gray-500 text-sm sm:text-base max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-2 sm:px-0"
            suppressHydrationWarning
          >
            {t("landingPage.features.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-linear-to-br from-white to-gray-100 border border-gray-200 rounded-xl sm:rounded-lg p-6 sm:p-8 hover:shadow-lg transition-all duration-300 group hover:border-gray-300"
              >
                {/* Icon */}
                <div className="mb-4 sm:mb-6">
                  <Icon
                    className="w-7 h-7 sm:w-8 sm:h-8 text-gray-900"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title with underline */}
                <div className="mb-3 sm:mb-4">
                  <h3
                    className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-2"
                    suppressHydrationWarning
                  >
                    {feature.title}
                  </h3>
                  <div className="w-10 sm:w-12 h-0.5 bg-gray-900"></div>
                </div>

                {/* Description */}
                <p
                  className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:leading-relaxed"
                  suppressHydrationWarning
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
