"use client";
import React from "react";
import { UserPlus, Sparkles, Zap, Download, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

const ShadcnStepProcess = () => {
  const { t } = useTranslation();
  const steps = [
    {
      id: 1,
      title: t("landingPage.steps.list.signup.title"),
      description: t("landingPage.steps.list.signup.desc"),
      icon: UserPlus,
    },
    {
      id: 2,
      title: t("landingPage.steps.list.create.title"),
      description: t("landingPage.steps.list.create.desc"),
      icon: Sparkles,
    },
    {
      id: 3,
      title: t("landingPage.steps.list.generate.title"),
      description: t("landingPage.steps.list.generate.desc"),
      icon: Zap,
    },
    {
      id: 4,
      title: t("landingPage.steps.list.export.title"),
      description: t("landingPage.steps.list.export.desc"),
      icon: Download,
    },
    {
      id: 5,
      title: t("landingPage.steps.list.enjoy.title"),
      description: t("landingPage.steps.list.enjoy.desc"),
      icon: Check,
    },
  ];

  return (
    <div className="w-full bg-linear-to-b from-gray-50 to-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span
              className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
              suppressHydrationWarning
            >
              {t("landingPage.steps.badge")}
            </span>
          </div>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6"
            suppressHydrationWarning
          >
            {t("landingPage.steps.title")}
            <span className="block mt-2" suppressHydrationWarning>
              {t("landingPage.steps.subtitle")}
            </span>
          </h2>
          <p
            className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto leading-relaxed"
            suppressHydrationWarning
          >
            {t("landingPage.steps.description")}
          </p>
        </div>

        {/* Steps Container - Desktop */}
        <div className="hidden lg:block relative">
          {/* Connecting Line */}
          <div
            className="absolute top-24 left-0 right-0 h-[2px] bg-border"
            style={{
              left: "calc(10% + 96px)",
              right: "calc(10% + 96px)",
            }}
          />

          <div className="relative grid grid-cols-5 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative">
                  {/* Step Card */}
                  <div className="relative z-10 flex flex-col items-center group">
                    {/* Icon Circle */}
                    <div className="relative w-48 h-48 mb-6">
                      <div className="absolute inset-0 rounded-2xl border-2 border-border bg-background shadow-sm group-hover:border-foreground/20 group-hover:shadow-md transition-all duration-300" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-xl bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-10 h-10" strokeWidth={2} />
                        </div>
                      </div>

                      {/* Number Badge */}
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold border-4 border-background shadow-sm">
                        {step.id}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center px-2">
                      <h3
                        className="text-lg font-semibold mb-2 group-hover:text-foreground transition-colors"
                        suppressHydrationWarning
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm text-muted-foreground leading-relaxed"
                        suppressHydrationWarning
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Steps Container - Mobile/Tablet */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-12 top-28 w-[2px] h-full bg-border z-0" />
                )}

                {/* Step Card */}
                <div className="relative z-10 flex items-start gap-6">
                  {/* Icon Circle */}
                  <div className="shrink-0 relative">
                    <div className="w-24 h-24 rounded-xl border-2 border-border bg-background shadow-sm flex items-center justify-center">
                      <div className="w-16 h-16 rounded-lg bg-foreground text-background flex items-center justify-center">
                        <Icon className="w-8 h-8" strokeWidth={2} />
                      </div>
                    </div>

                    {/* Number Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold border-4 border-background shadow-sm">
                      {step.id}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3
                      className="text-lg font-semibold mb-2"
                      suppressHydrationWarning
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground leading-relaxed"
                      suppressHydrationWarning
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button asChild size={"lg"} className="text-base">
            <Link href={"/subscription"} suppressHydrationWarning>
              {t("landingPage.steps.button")}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShadcnStepProcess;
