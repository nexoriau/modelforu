/**
 * Authentication Context Provider
 *
 * Manages global user authentication state across the application.
 * Provides current user data, loading states, and refetch capabilities.
 *
 * Key Features:
 * - Automatic user data fetching based on userId
 * - Optimized re-renders using useMemo and useCallback
 * - Transition-based async state updates for better UX
 * - Centralized error handling for user fetch failures
 */
"use client";

import { UserTableType } from "@/db/schema/auth";
import { getUserById } from "@/lib/utils-functions/getUserById";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  useCallback,
  useMemo,
} from "react";

/**
 * Shape of the authentication context
 * @property currentUser - Currently authenticated user data or null if not authenticated
 * @property loadingCurrentUser - Indicates if user data is being fetched
 * @property refetchUser - Function to manually trigger user data refresh
 */
type AuthContextType = {
  currentUser: UserTableType | null;
  loadingCurrentUser: boolean;
  refetchUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Context Provider Component
 *
 * Wraps the application tree to provide authentication state to all child components.
 * Automatically fetches and maintains user data based on the provided userId.
 *
 * @param children - React components to be wrapped with auth context
 * @param userId - Optional user ID to fetch data for (typically from session)
 */
export const AuthContextProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) => {
  const [currentUser, setCurrentUser] = useState<UserTableType | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  /**
   * Fetches user data from the database
   * Uses useCallback to prevent unnecessary re-renders and maintain referential equality
   * Wrapped in startTransition to mark state updates as non-urgent for better UX
   */
  const fetchUser = useCallback(() => {
    // Clear user state if no userId is provided
    if (!userId) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    // Use transition to avoid blocking UI during async fetch
    startTransition(async () => {
      try {
        const userData = await getUserById(userId);
        // Spread operator creates new object reference to ensure React detects changes
        setCurrentUser(userData ? { ...userData } : null);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, [userId]);

  // Fetch user data when userId changes
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Memoize context value to prevent unnecessary re-renders of consuming components
   * Only updates when currentUser, loading state, or fetchUser function changes
   */
  const value = useMemo(
    () => ({
      currentUser,
      loadingCurrentUser: loading,
      refetchUser: fetchUser,
    }),
    [currentUser, loading, fetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access authentication context
 *
 * Must be used within a component wrapped by AuthContextProvider.
 * Provides access to current user data, loading state, and refetch function.
 *
 * @throws {Error} If used outside of AuthContextProvider
 * @returns {AuthContextType} Authentication context value
 *
 * @example
 * const { currentUser, loadingCurrentUser, refetchUser } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
