import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  NotificationTableType,
  CreateNotificationType,
} from '@/db/schema/notification'; // Adjust path as needed
import {
  createNotification,
  getNotification,
  updateNotification,
} from './notification.action';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export const useGetNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotification,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: CreateNotificationType) =>
      createNotification(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // IMPORTANT: Ensure your server action accepts an object with { id, ...data }
    mutationFn: (data: { id: string } & Partial<NotificationTableType>) =>
      updateNotification(data),

    // 1. When mutation starts (Optimistic Update)
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData<
        NotificationTableType[]
      >(NOTIFICATIONS_QUERY_KEY);

      // Optimistically update to the new value
      if (previousNotifications) {
        queryClient.setQueryData<NotificationTableType[]>(
          NOTIFICATIONS_QUERY_KEY,
          (old) => {
            if (!old) return [];
            return old.map((n) =>
              n.id === newItem.id ? { ...n, ...newItem } : n
            );
          }
        );
      }

      // Return a context object with the snapshotted value
      return { previousNotifications };
    },

    // 2. If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newItem, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          context.previousNotifications
        );
      }
    },

    // 3. Always refetch after error or success to ensure data validity
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};
