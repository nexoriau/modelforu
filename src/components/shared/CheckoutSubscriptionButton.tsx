"use client";
import { useGetUserById } from "@/app/auth/_services/useGetUserById";
import { useGetSubscriptionById } from "@/app/subscription/_services/useGetSubscriptionById";
import { cn } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { User } from "next-auth";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function CheckoutSubscriptionButton({
  price,
  tokenQuantity,
  modelQuantity,
  interval,
  planName,
  highlighted,
  currentUser,
}: {
  price: string;
  tokenQuantity: number;
  modelQuantity: number;
  interval: string;
  planName: string;
  highlighted: boolean;
  currentUser?: User;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const { userByIdData } = useGetUserById(currentUser?.id);
  const { subscriptionByIdData, subscriptionByIdDataLoading } =
    useGetSubscriptionById(userByIdData?.subscriptionId);
  const { t } = useTranslation();
  const dateA = subscriptionByIdData
    ? moment(subscriptionByIdData?.currentPeriodEnd)
    : null;

  const dateB = moment();

  const isAfter = dateA ? dateA.isAfter(dateB) : true;
  const isSubscribed = !!(
    subscriptionByIdData &&
    subscriptionByIdData.planName === planName &&
    interval === subscriptionByIdData.interval &&
    isAfter
  );

  const handleClick = async () => {
    if (!userByIdData) {
      router.push("/auth/sign-in");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price,
          tokenQuantity,
          modelQuantity,
          interval,
          planName,
          userId: userByIdData.id,
          userEmail: userByIdData.email,
          remainingTokens: userByIdData.tokens,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(
          error.error || t("purchase.checkout.errors.sessionCreation"),
        );
        return;
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

  return pathname === "/user/subscription" ? (
    <Button
      disabled={isLoading || isSubscribed || subscriptionByIdDataLoading}
      onClick={handleClick}
      className={cn(
        "w-full py-6 text-lg shadow-lg flex mt-2 mb-3 items-center justify-center",
        isSubscribed ? "bg-muted text-muted-foreground cursor-default" : "",
        highlighted
          ? "bg-white text-black  hover:bg-white/90"
          : "bg-black text-white ",
      )}
    >
      {isLoading && (
        <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
      )}
      <span suppressHydrationWarning>
        {isSubscribed
          ? t("subscription.currentPlan")
          : t("subscription.getStarted")}
      </span>
    </Button>
  ) : (
    <Button
      asChild
      className={cn(
        "w-full py-6 text-lg shadow-lg flex mt-2 mb-3 items-center justify-center",
        highlighted
          ? "bg-white text-black  hover:bg-white/90"
          : "bg-black text-white ",
      )}
    >
      <Link
        href={
          userByIdData
            ? userByIdData.role === "user"
              ? "/user/subscription"
              : "/admin/manage-pricing"
            : "/auth/sign-in"
        }
      >
        <span suppressHydrationWarning>{t("subscription.getStarted")}</span>
      </Link>
    </Button>
  );
}

export default CheckoutSubscriptionButton;
