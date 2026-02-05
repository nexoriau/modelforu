"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Settings } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const handleManageSubscription = async () => {
    if (!currentUser) {
      toast.error(t("user.currentSubscription.buttons.toast.loginRequired"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to access billing portal");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || t("user.currentSubscription.buttons.toast.error"),
      );
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={isLoading}
      className="group w-full h-12 text-lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-7 w-7 animate-spin" />
          <span>{t("user.currentSubscription.buttons.loading")}</span>
        </>
      ) : (
        <>
          <Settings className="h-7 w-7 group-hover:rotate-90 transition-transform duration-300" />
          <span>
            {t("user.currentSubscription.buttons.manageSubscription")}
          </span>
        </>
      )}
    </Button>
  );
}
