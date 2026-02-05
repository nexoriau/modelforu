import { useQuery } from '@tanstack/react-query';
import { getAllSubModelsByModelId } from './subModel.queries';

export function useGetSubModelsByModelId(modelId?: string) {
  const { data: subModelsByModelIdData, isLoading: subModelsByModelIdLoading } =
    useQuery({
      queryKey: ['sub-models', modelId],
      queryFn: () => getAllSubModelsByModelId(modelId),
      enabled: !!modelId, // only run if modelId exists
    });

  return { subModelsByModelIdData, subModelsByModelIdLoading };
}
