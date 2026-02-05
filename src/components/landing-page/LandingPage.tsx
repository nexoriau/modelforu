"use client";
import SubscriptionPlans from "@/app/subscription/_components/SubscriptionComp";
import { Button as ButtonShad } from "@/components/ui/button";
import { SubscriptionsCardTableType } from "@/db/schema/subscription-card";
import { motion } from "framer-motion";
import { User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import VisualCreationsGallery from "./LandingPageCarousel";
import FAQSection from "./LandingPageFaq";
import FeaturesSection from "./LandingPageFeatureSection";
import StepByStepProcess from "./StepByStepProcess";
import { useTranslation } from "react-i18next";

export default function LaunchLanding({
  currentUser,
  subscriptionPricingCards,
}: {
  currentUser?: User;
  subscriptionPricingCards: SubscriptionsCardTableType[];
}) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen  text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-gray-50 to-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(99,102,241,0.08),rgba(255,255,255,0)_70%)]" />

        <div className="mx-auto flex flex-col-reverse lg:flex-row max-w-7xl gap-6 md:gap-10 lg:gap-20 px-4 sm:px-6 py-12 md:py-16 lg:py-20">
          {/* Text Content */}
          <div className="flex-1 flex flex-col text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-gray-900"
              suppressHydrationWarning
            >
              {t("landingPage.hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-gray-600 mx-auto lg:mx-0"
              suppressHydrationWarning
            >
              {t("landingPage.hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-4 sm:mt-6 flex flex-wrap justify-center lg:justify-start gap-2 text-xs sm:text-sm text-gray-500"
            >
              <span
                className="rounded-full border border-gray-300 bg-white px-2 sm:px-3 py-1 whitespace-nowrap"
                suppressHydrationWarning
              >
                {t("landingPage.hero.badges.noSpam")}
              </span>
              <span
                className="rounded-full border border-gray-300 bg-white px-2 sm:px-3 py-1 whitespace-nowrap"
                suppressHydrationWarning
              >
                {t("landingPage.hero.badges.secure")}
              </span>
              <span
                className="rounded-full border border-gray-300 bg-white px-2 sm:px-3 py-1 whitespace-nowrap"
                suppressHydrationWarning
              >
                {t("landingPage.hero.badges.perks")}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-4 sm:mt-6 flex justify-center lg:justify-start"
            >
              <ButtonShad
                size={"lg"}
                className="w-full sm:w-fit text-sm sm:text-base"
              >
                <Link href={"/subscription"} suppressHydrationWarning>
                  {t("landingPage.hero.getStarted")}
                </Link>
              </ButtonShad>
            </motion.div>
          </div>

          {/* Image Content */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[370px] lg:h-[390px] rounded-2xl overflow-hidden"
            >
              <Image
                src="/on-dark.png"
                alt="AI-generated custom media content"
                fill={true}
                className="rounded-2xl object-cover"
                priority
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <StepByStepProcess />

      {/* Preview Gallery */}
      <section>
        <VisualCreationsGallery />
      </section>

      <section>
        <div>
          <SubscriptionPlans
            currentUser={currentUser}
            subscriptionPricingCards={subscriptionPricingCards}
            paymentPricingCards={[]}
            bg="bg-white"
          />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      <section className="relative min-h-[80vh] flex items-center justify-center bg-white overflow-hidden">
        {/* Background Gradient Blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-[70%] -translate-y-[30%] w-[600px] h-[600px] bg-linear-to-r from-gray-100 to-gray-50 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute top-1/2 right-0 translate-x-[30%] -translate-y-[40%] w-[500px] h-[500px] bg-linear-to-l from-gray-100 to-transparent rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="container mx-auto px-6 text-center max-w-[1100px]">
          {/* Main Heading */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6"
            suppressHydrationWarning
          >
            {t("landingPage.cta.title")}
          </h1>

          {/* Subheading */}
          <p
            className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
            suppressHydrationWarning
          >
            {t("landingPage.cta.subtitle")}
          </p>

          {/* CTA Button */}
          <ButtonShad
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 py-6 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl text-base"
          >
            <Link href={"/subscription"} suppressHydrationWarning>
              {t("landingPage.cta.button")}
            </Link>
          </ButtonShad>
        </div>
      </section>
    </div>
  );
}
