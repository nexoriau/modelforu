import React from 'react';
import SubscriptionPlans from './_components/SubscriptionComp';
import { auth } from '../auth/_services/auth';
import { getSubscriptionsPricing } from '../admin/manage-pricing/_services/manageSubscriptionPricing.actions';
import { getPaymentCards } from '../admin/manage-pricing/_services/managePaymentPricing.action';

export const dynamic = 'force-dynamic';

export default async function SubscriptionPage() {
  const session = await auth();

  const [subscriptionPricingCards, paymentPricingCards] = await Promise.all([
    getSubscriptionsPricing(),
    getPaymentCards(),
  ]);

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
