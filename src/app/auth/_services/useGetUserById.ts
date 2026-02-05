import { getUserById } from '@/lib/utils-functions/getUserById';
import { useQuery } from '@tanstack/react-query';

export const useGetUserById = (userId?: string) => {
  const { data: userByIdData, isLoading: userByIdDataLoading } = useQuery({
    queryKey: ['users', userId],
    queryFn: async () => await getUserById(userId),
    enabled: !!userId,
  });

  return { userByIdData, userByIdDataLoading };
};
