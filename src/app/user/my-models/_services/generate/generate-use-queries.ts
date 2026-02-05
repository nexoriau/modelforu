import { useQuery } from "@tanstack/react-query";
import {
  getDiscardedImagesByUser,
  getGenerationsByModelId,
  getGenerationsByModelIdAndUserId,
  getGenerationsByUserId,
  getSoftDeletedGenerationsByUserId,
} from "./generate.queries";

export function useGetGenerationsByModelAndUserId(
  modelId: string,
  userId?: string,
) {
  const {
    data: generationsByModelIdAndUserIdData,
    isLoading: generationsByModelIdAndUserIdLoading,
  } = useQuery({
    queryKey: ["generations", modelId, userId],
    queryFn: () => getGenerationsByModelIdAndUserId(modelId, userId),
    enabled: !!(modelId && userId), // only run if modelId exists
  });

  return {
    generationsByModelIdAndUserIdData,
    generationsByModelIdAndUserIdLoading,
  };
}
export function useGetGenerationsByUserId(
  userId: string,
  limit: number = 20,
  offset: number = 0,
) {
  const {
    data: generationsByUserIdData,
    isLoading: generationsByUserIdLoading,
  } = useQuery({
    queryKey: ["generations", "active", userId, limit, offset],
    queryFn: () => getGenerationsByUserId(userId, limit, offset),
    enabled: !!userId, // only run if userId exists
  });

  return { generationsByUserIdData, generationsByUserIdLoading };
}

export function useGetSoftDeletedGenerationsByUserId(userId: string) {
  const {
    data: softDeletedGenerationsByUserIdData,
    isLoading: softDeletedGenerationsByUserIdLoading,
  } = useQuery({
    queryKey: ["generations", "trash", userId],
    queryFn: () => getSoftDeletedGenerationsByUserId(userId),
    enabled: !!userId, // only run if userId exists
  });

  return {
    softDeletedGenerationsByUserIdData,
    softDeletedGenerationsByUserIdLoading,
  };
}

export const useGetDiscardedImages = (userId: string) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["discarded-images", userId],
    queryFn: () => getDiscardedImagesByUser(userId),
  });
  return {
    data,
    isLoading,
    refetch,
  };
};
