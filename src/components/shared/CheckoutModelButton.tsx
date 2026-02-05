"use client";
import { CreditCard, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { User } from "next-auth";
import { useTranslation } from "react-i18next";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function CheckoutModelButton({
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
  const handleClick = async () => {
    if (!currentUser) {
      router.push("/auth/sign-in");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/model-checkout", {
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
          type: "model",
        }),
      });

      if (!res.ok) {
        toast.error(t("purchase.checkout.errors.sessionCreation"));
      }
      const { sessionUrl } = await res.json();

      const stripe = await stripePromise;

      if (!stripe) {
        toast.error(t("purchase.checkout.errors.stripeInit"));
        return;
      }

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
        <span suppressHydrationWarning>{t("purchase.models.purchase")}</span>
      </Button>
    </div>
  );
}

export default CheckoutModelButton;
