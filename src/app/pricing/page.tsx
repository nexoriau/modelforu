import React from "react";
import { auth } from "../auth/_services/auth";
import { getSubscriptionsPricing } from "../admin/manage-pricing/_services/manageSubscriptionPricing.actions";
import { getPaymentCards } from "../admin/manage-pricing/_services/managePaymentPricing.action";
import SubscriptionPlans from "../subscription/_components/SubscriptionComp";

async function Pricing() {
  const session = await auth();
  const subscriptionPricingCards = await getSubscriptionsPricing();
  const paymentPricingCards = await getPaymentCards();

  return (
    <div>
      <SubscriptionPlans
        currentUser={session?.user}
        subscriptionPricingCards={subscriptionPricingCards}
        paymentPricingCards={paymentPricingCards}
      />
    </div>
  );
}

export default Pricing;
