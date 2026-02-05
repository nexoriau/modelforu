export const dynamic = 'force-dynamic';

import { Card, CardContent } from '@/components/ui/card';
import { ManagePaymentPricingComp } from './_components/ManagePaymentPricingComp';
import { ManageSubscriptionPricingComp } from './_components/ManageSubscriptoinPricingComp';
import { getPaymentCards } from './_services/managePaymentPricing.action';
import { getSubscriptionsPricing } from './_services/manageSubscriptionPricing.actions';
import { ManageModelPricingComp } from './_components/ManageModelPricingComp';
import { getModelCards } from './_services/manageModelPricing.action';

export default async function ManagePricing() {
const [
  subscriptionPricingCards,
  paymentPricingCards,
  modelPricingCards,
] = await Promise.all([
  getSubscriptionsPricing(),
  getPaymentCards(),
  getModelCards(),
]);

  return (
    <Card className="py-3!">
      <CardContent className="py-0!">
        <ManageSubscriptionPricingComp data={subscriptionPricingCards} />
        <ManagePaymentPricingComp data={paymentPricingCards} />
        <ManageModelPricingComp data={modelPricingCards} />
      </CardContent>
    </Card>
  );
}
