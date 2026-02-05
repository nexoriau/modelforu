/**
 * Payment Dialogs Component
 *
 * Manages display of payment-related dialogs based on URL parameters:
 * - Success dialog after successful payment
 * - Cancel dialog when payment is canceled
 * - OAuth error dialog when OAuth account linking fails
 *
 * Features:
 * - Reads payment status from URL search params
 * - Automatically shows appropriate dialog
 * - Cleans up URL params after dialog closes
 * - Refetches user data after successful payment
 *
 * URL Parameters:
 * - success=true: Show success dialog
 * - canceled=true: Show cancel dialog
 * - error=OAuthAccountNotLinked: Show OAuth error
 * - session_id: Stripe session ID
 * - subscription=true: Indicates subscription payment
 */
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SuccessPaymentDialog from "./SuccessPaymentDialog";
import CancelPaymentDialog from "./CancelPaymentDialog";
import OAuthAccountNotLinkedDialog from "./OAuthAccountNotLinkedDialog";
import { useAuth } from "@/context/AuthContext";

function PaymentDialogs() {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showOAuthErrorDialog, setShowOAuthErrorDialog] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSubscription, setIsSubscription] = useState(false);
  const { refetchUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Check URL params on mount and param changes
   * Determines which dialog to show based on payment result
   */
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const sessionIdParam = searchParams.get("session_id");
    const error = searchParams.get("error");

    if (success === "true") {
      setSessionId(sessionIdParam);
      setShowSuccessDialog(true);
      setIsSubscription(searchParams.get("subscription") === "true");
    } else if (canceled === "true") {
      setShowCancelDialog(true);
    } else if (error === "OAuthAccountNotLinked") {
      setShowOAuthErrorDialog(true);
    }
  }, [searchParams]);

  /**
   * Closes dialog and cleans up URL parameters
   * Refetches user data to update token balance
   */
  const handleDialogClose = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("success");
    newParams.delete("canceled");
    newParams.delete("session_id");
    newParams.delete("subscription");
    newParams.delete("error");

    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    refetchUser(); // Update user data after payment
    setShowSuccessDialog(false);
    setShowCancelDialog(false);
    setShowOAuthErrorDialog(false);
    setSessionId(null);
  };

  return (
    <div>
      <SuccessPaymentDialog
        isSubscription={isSubscription}
        showSuccessDialog={showSuccessDialog}
        handleDialogClose={handleDialogClose}
      />

      <CancelPaymentDialog
        showCancelDialog={showCancelDialog}
        handleDialogClose={handleDialogClose}
      />

      <OAuthAccountNotLinkedDialog
        showOAuthErrorDialog={showOAuthErrorDialog}
        handleDialogClose={handleDialogClose}
      />
    </div>
  );
}

export default PaymentDialogs;
