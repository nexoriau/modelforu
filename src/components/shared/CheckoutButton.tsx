/**
 * Checkout Button Component
 *
 * Handles token purchase flow through Stripe payment integration.
 * Redirects unauthenticated users to sign-in and creates Stripe checkout sessions.
 *
 * Features:
 * - Stripe payment integration
 * - Authentication check before checkout
 * - Loading states during payment processing
 * - Internationalized error messages
 * - Automatic redirect to Stripe checkout
 */
"use client";
import { CreditCard, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { User } from "next-auth";
import { useTranslation } from "react-i18next";

// Initialize Stripe with publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

/**
 * Button component for initiating token purchase checkout
 *
 * @param price - Price of the token package
 * @param quantity - Number of tokens in the package
 * @param planName - Name of the token plan
 * @param currentUser - Currently authenticated user (if any)
 */
function CheckoutButton({
  price,
  quantity,
  planName,
  currentUser,
}: {
  price: string;
  quantity: number;
  planName: string;
  currentUser?: User;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Handles checkout button click
   * - Redirects to sign-in if not authenticated
   * - Creates Stripe checkout session
   * - Redirects to Stripe payment page
   */
  const handleClick = async () => {
    // Require authentication before checkout
    if (!currentUser) {
      router.push("/auth/sign-in");
      return;
    }

    try {
      setIsLoading(true);

      // Create Stripe checkout session via API
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price,
          quantity,
          userId: currentUser.id,
          planName,
          userEmail: currentUser.email,
          type: "token", // Indicates token purchase (vs subscription)
        }),
      });

      if (!res.ok) {
        toast.error(t("purchase.checkout.errors.sessionCreation"));
      }

      const { sessionUrl } = await res.json();

      // Load Stripe instance
      const stripe = await stripePromise;

      if (!stripe) {
        toast.error(t("purchase.checkout.errors.stripeInit"));
        return;
      }

      // Redirect to Stripe checkout page
      if (sessionUrl) {
        window.location.href = sessionUrl;
      } else {
        toast.error(t("purchase.checkout.errors.sessionCreation"));
      }
    } catch (error) {
      console.log(error);
      toast.error(t("purchase.checkout.errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button disabled={isLoading} onClick={handleClick}>
        {isLoading ? (
          <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
        ) : (
          <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
        )}
        <span suppressHydrationWarning>{t("purchase.tokens.purchase")}</span>
      </Button>
    </div>
  );
}

export default CheckoutButton;
