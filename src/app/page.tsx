import LaunchLanding from '@/components/landing-page/LandingPage';
import { getPaymentCards } from './admin/manage-pricing/_services/managePaymentPricing.action';
import { getSubscriptionsPricing } from './admin/manage-pricing/_services/manageSubscriptionPricing.actions';
import { auth } from './auth/_services/auth';

async function HomePage() {
  const session = await auth();
  const subscriptionPricingCards = await getSubscriptionsPricing();
  return (
    <LaunchLanding
      currentUser={session?.user}
      subscriptionPricingCards={subscriptionPricingCards}
    />
  );
}

export default HomePage;
