"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import CheckoutButton from "@/components/shared/CheckoutButton";
import CheckoutSubscriptionButton from "@/components/shared/CheckoutSubscriptionButton";
import { User } from "next-auth";
import { SubscriptionsCardTableType } from "@/db/schema/subscription-card";
import { PaymentCardTableType } from "@/db/schema/payment-card";
import { usePathname } from "next/navigation";
import { ModelCardTableType } from "@/db/schema/model-card";
import CheckoutModelButton from "@/components/shared/CheckoutModelButton";
import { useTranslation } from "react-i18next";

const SubscriptionPlans = ({
  currentUser,
  subscriptionPricingCards,
  paymentPricingCards,
  modelPricingCards,
  bg = "bg-gray-50",
}: {
  currentUser?: User;
  subscriptionPricingCards: SubscriptionsCardTableType[];
  paymentPricingCards: PaymentCardTableType[];
  modelPricingCards?: ModelCardTableType[];
  bg?: string;
}) => {
  const [billingCycle, setBillingCycle] = useState<"year" | "month">("year");
  const pathname = usePathname();
  const { t } = useTranslation();

  // Helper to present credits nicely (e.g. 44000 => "44K")
  const formatCredits = (n: number) => (n >= 1000 ? `${n / 1000}K` : `${n}`);

  return (
    <div className={`"min-h-screen ${bg} py-12 px-4 sm:px-6 lg:px-8"`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-2"
            suppressHydrationWarning
          >
            {t("subscription.title")}
          </h1>
          <p className="text-gray-600 text-sm" suppressHydrationWarning>
            {t("subscription.desc")}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full bg-white p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setBillingCycle("year")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "year"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              suppressHydrationWarning
            >
              {t("subscription.annual")}
            </button>
            <button
              onClick={() => setBillingCycle("month")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "month"
                  ? "bg-black text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              suppressHydrationWarning
            >
              {t("subscription.monthly")}
            </button>
          </div>
        </div>

        {/* Subscription Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {subscriptionPricingCards?.map((plan, index) => {
            const currentPrice =
              billingCycle === "year" ? plan.annualPrice : plan.monthlyPrice;
            const currentCredits =
              billingCycle === "year"
                ? plan.annualCredits
                : plan.monthlyCredits;
            const currentDescription =
              billingCycle === "year"
                ? plan.annualDescription
                : plan.monthlyDescription;
            const modelQuantity = plan.model;

            // Role-based filtering logic
            const shouldShowPlan = () => {
              if (!currentUser) return true;
              if (currentUser?.role === "admin") {
                // Admin sees all plans
                return true;
              } else if (currentUser?.role === "agency") {
                // Agency sees only agency plans
                return plan.forAgency === true;
              } else {
                // Regular users see all plans except agency plans
                return plan.forAgency !== true;
              }
            };

            // Don't render if plan shouldn't be shown
            if (!shouldShowPlan()) {
              return null;
            }

            return (
              <div
                key={index}
                className={`rounded-2xl p-6 relative ${
                  plan.highlighted
                    ? "bg-black text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                {/* Agency Badge */}
                {plan.forAgency && (
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        plan.highlighted
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span suppressHydrationWarning>
                        {t("user.currentSubscription.misc.agencyPlanTag")}
                      </span>
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 pr-20">{plan.name}</h3>
                  <p
                    className={`text-sm ${
                      plan.highlighted ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {currentDescription}
                  </p>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline mb-1">
                    <span className="text-3xl font-bold">${currentPrice}</span>
                    <span
                      className={`ml-2 text-sm ${
                        plan.highlighted ? "text-gray-400" : "text-gray-600"
                      }`}
                      suppressHydrationWarning
                    >
                      {billingCycle === "year"
                        ? t("user.currentSubscription.misc.perYear")
                        : t("user.currentSubscription.misc.perMonth")}
                    </span>
                  </div>
                  {/* Display the 'model' quantity here 👇 */}
                  <p
                    className={`text-sm mb-1 ${
                      plan.highlighted ? "text-gray-400" : "text-gray-600"
                    }`}
                    suppressHydrationWarning
                  >
                    {modelQuantity}{" "}
                    {modelQuantity !== 1
                      ? t("user.currentSubscription.misc.modelsUnitPlural")
                      : t("user.currentSubscription.misc.modelsUnit")}
                  </p>
                  {/* Display credits */}
                  <p
                    className={`text-sm ${
                      plan.highlighted ? "text-gray-400" : "text-gray-600"
                    }`}
                    suppressHydrationWarning
                  >
                    {formatCredits(currentCredits)}{" "}
                    {billingCycle === "year"
                      ? t("user.currentSubscription.misc.creditsPerYear")
                      : t("user.currentSubscription.misc.creditsPerMonth")}
                  </p>
                </div>

                <CheckoutSubscriptionButton
                  currentUser={currentUser}
                  interval={billingCycle}
                  planName={plan.name}
                  price={currentPrice}
                  modelQuantity={modelQuantity}
                  tokenQuantity={currentCredits}
                  highlighted={plan.highlighted ?? false}
                />

                <div>
                  <p
                    className={`text-sm font-semibold mb-3 ${
                      plan.highlighted ? "text-white" : "text-gray-900"
                    }`}
                    suppressHydrationWarning
                  >
                    {t("user.currentSubscription.misc.whatsIncluded")}
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check
                          className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${
                            plan.highlighted ? "text-white" : "text-gray-900"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            plan.highlighted ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Credits Section */}
        {pathname.includes("/user/subscription") && (
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-gray-900 mb-5"
              suppressHydrationWarning
            >
              {t("purchase.tokens.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentPricingCards?.map((pkg, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-gray-900 font-medium"
                      suppressHydrationWarning
                    >
                      {pkg.credits.toLocaleString()}{" "}
                      {t("user.currentSubscription.misc.unitCredits")}
                    </span>
                    <span className="text-gray-900 font-bold">
                      ${pkg.price}
                    </span>
                  </div>
                  <CheckoutButton
                    planName={pkg.name}
                    price={pkg.price}
                    quantity={pkg.credits}
                    currentUser={currentUser}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {pathname.includes("/user/subscription") &&
          currentUser?.role === "agency" &&
          modelPricingCards && (
            <div>
              <h2
                className="text-2xl font-bold text-gray-900 mb-5"
                suppressHydrationWarning
              >
                {t("purchase.models.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modelPricingCards?.map((pkg, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-gray-900 font-medium"
                        suppressHydrationWarning
                      >
                        {pkg.quantity.toLocaleString()}{" "}
                        {t("user.currentSubscription.misc.unitModels")}
                      </span>
                      <span className="text-gray-900 font-bold">
                        ${pkg.price}
                      </span>
                    </div>
                    <CheckoutModelButton
                      planName={pkg.name}
                      price={pkg.price}
                      quantity={pkg.quantity}
                      currentUser={currentUser}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
