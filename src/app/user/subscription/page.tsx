import { getPaymentCards } from '@/app/admin/manage-pricing/_services/managePaymentPricing.action';
import { getSubscriptionsPricing } from '@/app/admin/manage-pricing/_services/manageSubscriptionPricing.actions';
import { auth } from '@/app/auth/_services/auth';
import SubscriptionPlans from '@/app/subscription/_components/SubscriptionComp';
import React from 'react';
import CurrentSubscriptionDetailCard from './_components/CurrentSubscriptionDetailCard';
import { getModelCards } from '@/app/admin/manage-pricing/_services/manageModelPricing.action';

async function SubscriptionPage() {
  const session = await auth();
  const subscriptionPricingCards = await getSubscriptionsPricing();
  const paymentPricingCards = await getPaymentCards();
  const modelPricingCards = await getModelCards();

  return (
    <div>
      <CurrentSubscriptionDetailCard />
      <SubscriptionPlans
        currentUser={session?.user}
        subscriptionPricingCards={subscriptionPricingCards}
        paymentPricingCards={paymentPricingCards}
        modelPricingCards={modelPricingCards}
      />
    </div>
  );
}

export default SubscriptionPage;
