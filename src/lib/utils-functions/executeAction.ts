/**
 * Server Action Execution Wrapper
 *
 * Provides standardized error handling and success messaging for server actions.
 * Wraps async operations with consistent error catching, toast notifications,
 * and response formatting.
 *
 * Key Features:
 * - Centralized error handling for server actions
 * - Optional toast notifications for user feedback
 * - Handles Next.js redirect errors properly (re-throws them)
 * - Consistent response format for all actions
 * - Optional authentication protection (placeholder for future implementation)
 */
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { toast } from "sonner";

/**
 * Configuration options for executing a server action
 */
type Options<T> = {
  actionFn: () => Promise<T>; // The async function to execute
  isProtected?: boolean; // Whether to check authentication (not yet implemented)
  serverErrorMessage?: string; // Error message to return on failure
  clientSuccessMessage?: string; // Success message to show/return
  showToast?: boolean; // Whether to display toast notification
};

/**
 * Executes a server action with standardized error handling and messaging
 *
 * This wrapper provides consistent behavior across all server actions:
 * - Catches and logs errors without crashing
 * - Handles Next.js redirects properly by re-throwing them
 * - Optionally shows toast notifications
 * - Returns standardized success/error response
 *
 * @param options - Configuration for the action execution
 * @returns Promise resolving to success status and message
 *
 * @example
 * const result = await executeAction({
 *   actionFn: async () => await createUser(data),
 *   clientSuccessMessage: 'User created successfully',
 *   showToast: true
 * });
 */
export async function executeAction<T>({
  actionFn,
  isProtected = true,
  serverErrorMessage = "Error executing action",
  clientSuccessMessage = "Operation was successful",
  showToast = false,
}: Options<T>): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Add authentication check when isProtected is true
    if (isProtected) {
      console.log("add protected code here");
    }

    await actionFn();

    // Show success toast if requested
    if (showToast) {
      toast.success(clientSuccessMessage);
    }

    return {
      success: true,
      message: clientSuccessMessage,
    };
  } catch (error) {
    // Re-throw redirect errors to allow Next.js navigation to work
    if (isRedirectError(error)) {
      throw error;
    }

    console.error(serverErrorMessage, error);
    return {
      success: false,
      message: serverErrorMessage,
    };
  }
}
