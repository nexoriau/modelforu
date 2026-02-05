/**
 * Activity Management Hook
 *
 * Custom React Query hook for fetching and filtering user activity logs.
 * Primarily used in admin dashboard for monitoring user actions and system events.
 */
import { useQuery } from "@tanstack/react-query";

/**
 * Filter parameters for activity queries
 * All filters are optional and can be combined
 */
type ActivityFilters = {
  userName?: string; // Filter by user's display name
  email?: string; // Filter by user's email address
  date?: string; // Filter by activity date (ISO format)
};

/**
 * Activity record structure
 * Represents a single user activity with associated metadata
 */
type Activity = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  activityType: string; // Type of activity (e.g., 'image_generated', 'purchase_made')
  description: string; // Human-readable activity description
  createdAt: string | null;
  tokensUsed: number; // Number of tokens consumed by this activity
  generationTime: number | null; // Time taken for generation (milliseconds)
  modelName: string | null; // Name of model used (if applicable)
};

/**
 * Fetches filtered activity logs from the API
 *
 * Uses React Query for automatic caching, refetching, and state management.
 * Query key includes filters to ensure proper cache invalidation.
 *
 * @param filters - Optional filtering criteria for activities
 * @returns React Query result with activities data, loading state, and error handling
 *
 * @example
 * const { data: activities, isLoading } = useGetActivities({ userName: 'John' });
 */
export function useGetActivities(filters?: ActivityFilters) {
  return useQuery({
    queryKey: ["activities", filters], // Cache key includes filters for proper invalidation
    queryFn: async () => {
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters?.userName) params.append("userName", filters.userName);
      if (filters?.email) params.append("email", filters.email);
      if (filters?.date) params.append("date", filters.date);

      const response = await fetch(
        `/api/admin/activities?${params.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch activities");

      const data = await response.json();
      return data.data as Activity[];
    },
  });
}
