import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface TrainedModel {
    id: string;
    externalId: string;
    name: string;
    type: 'photo' | 'video' | 'audio';
    groupName: string | null;
    isPublished: boolean;
    assignToAll: boolean;
}

// Get all trained models
export const useAllTrainedModels = () => {
    return useQuery<TrainedModel[]>({
        queryKey: ['admin', 'trained-models'],
        queryFn: async () => {
            const response = await fetch('/api/admin/trained-models');
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch trained models');
            }
            return response.json();
        },
        staleTime: 5 * 60 * 1000,
    });
};

// Get user's assigned models
export const useUserAssignedModels = (userId: string) => {
    return useQuery<TrainedModel[]>({
        queryKey: ['admin', 'user-models', userId],
        queryFn: async () => {
            const response = await fetch(`/api/admin/users/${userId}/assigned-models`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch assigned models');
            }
            return response.json();
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
};

// Assign models to user
export const useAssignModelsToUser = (userId: string) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (modelIds: string[]) => {
            const response = await fetch(`/api/admin/users/${userId}/assign-models`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelIds }),
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to assign models');
            }
            
            return response.json();
        },
        onSuccess: () => {
            toast.success('Models assigned successfully');
            queryClient.invalidateQueries({ 
                queryKey: ['admin', 'user-models', userId] 
            });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};