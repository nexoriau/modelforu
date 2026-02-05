/**
 * Application Providers Wrapper
 *
 * Configures and provides React Query (TanStack Query) to the entire application.
 * Enables server state management, caching, and automatic refetching for API calls.
 *
 * Note: AuthContextProvider is applied separately in the layout to access session data.
 */
"use client";
import { AuthContextProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = {
  children: React.ReactNode;
};

// Create a single QueryClient instance for the entire application
const queryClient = new QueryClient();

/**
 * Wraps children with React Query provider
 * Provides access to useQuery, useMutation, and other React Query hooks
 */
function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default Providers;
