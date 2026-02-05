import { useQuery } from '@tanstack/react-query';

export interface TrainedModel {
    id: string;
    externalId: string; // This is the "character" ID like 'asuka'
    name: string;
    type: 'photo' | 'video' | 'audio';
    groupName: string | null;
    isPublished: boolean;
    assignToAll: boolean;
    style?: string | null;
}

// Hook to get user's assigned models for photo generation
export const useUserPhotoModels = () => {
    return useQuery<TrainedModel[]>({
        queryKey: ['user', 'trained-models', 'photo'],
        queryFn: async () => {
            const response = await fetch('/api/user/trained-models?type=photo');
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch trained models');
            }
            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};