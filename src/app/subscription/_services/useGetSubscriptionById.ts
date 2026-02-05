import { useQuery } from '@tanstack/react-query';
import { getSubscriptionById } from './getSubscriptionById.action';

export const useGetSubscriptionById = (subscriptionId?: string | null) => {
  const { data: subscriptionByIdData, isLoading: subscriptionByIdDataLoading } =
    useQuery({
      queryKey: ['user_subscriptions', subscriptionId],
      queryFn: async () => await getSubscriptionById(subscriptionId),
      enabled: !!subscriptionId,
    });

  return { subscriptionByIdData, subscriptionByIdDataLoading };
};
