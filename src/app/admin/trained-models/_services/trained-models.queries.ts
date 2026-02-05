import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignModelToUsers,
  deleteModel,
  fetchModelAssignments,
  fetchModels,
  ModelSubModelSchemaType,
  updateModel,
} from "./admin-model.action";
import { ModelSchemaType } from "@/db/schema/models";
import { createAdminModel } from "./admin-model.action";

// Define types
export interface TrainedModel {
  id: string;
  externalId: string;
  name: string;
  type: "photo" | "video" | "audio";
  groupId: string | null;
  groupName: string | null;
  style: string | null;
  description: string | null;
  isPublished: boolean;
  assignToAll: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  type: "photo" | "video" | "audio";
  description: string | null;
}

// Query hooks
export const useTrainedModels = () => {
  return useQuery({
    queryKey: ["admin", "trained-models"],
    queryFn: async () => {
      const data = await fetchModels();
      return data;
    },
  });
};

// Mutation hooks
export const useUpdateTrainedModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ModelSubModelSchemaType;
    }) => {
      const res = await updateModel(id, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "trained-models"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteTrainedModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteModel(id),
    onSuccess: () => {
      toast.success("Model deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "trained-models"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useCreateTrainedModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ModelSubModelSchemaType) => createAdminModel(data),
    onSuccess: () => {
      toast.success("Trained model created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "trained-models"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useAssignModelToUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      modelId,
      userIds,
    }: {
      modelId: string;
      userIds: string[];
    }) => {
      await assignModelToUsers(modelId, userIds);
    },
    onSuccess: () => {
      toast.success("Model assignments updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "trained-models"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useFetchAssignedModelUsers = (modelId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["admin", "trained-models", "assigned-users", modelId],
    queryFn: async () => {
      const data = await fetchModelAssignments(modelId);
      return data;
    },
  });
};