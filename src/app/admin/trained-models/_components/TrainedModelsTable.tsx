"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, Plus } from "lucide-react";
import { format } from "date-fns";
import AssignUsersModal from "./AssignUsersModal";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useTrainedModels,
  useDeleteTrainedModel,
  type TrainedModel,
  type Group,
} from "../_services/trained-models.queries";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ModelSchemaTableType,
  updateModelVisibility,
} from "../_services/admin-model.action";
import CreateEditModel from "./CreateEditModel";
import { ModelSchemaType, ModelTableType } from "@/db/schema/models";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface TrainedModelsTableProps {
  initialModels: ModelSchemaType[];
  initialGroups: Group[];
  currentUserId: string;
}

export default function TrainedModelsTable({
  initialModels,
  initialGroups,
  currentUserId,
}: TrainedModelsTableProps) {
  const queryClient = useQueryClient();
  // Use React Query for data fetching
  const {
    data: models,
    isLoading: modelsLoading,
    refetch,
  } = useTrainedModels();
  const { mutate: deleteModel, isPending: isDeleting } =
    useDeleteTrainedModel();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "photo" | "video" | "audio"
  >("all");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] =
    useState<ModelSchemaTableType | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<ModelTableType | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState<ModelTableType | null>(
    null
  );
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>(
    {}
  );

  const filteredModels =
    models?.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        typeFilter === "all" ||
        (model.subModels || []).some(
          (subModel) =>
            subModel.type === typeFilter && subModel.status === "cloned"
        );

      return matchesSearch && matchesType;
      // && matchesGroup;
    }) || [];

  useEffect(() => {
    const map: Record<string, boolean> = {};
    filteredModels.forEach((m) => {
      map[m.id] = m.isVisibleToAllUsers;
    });
    setVisibilityMap(map);
  }, [JSON.stringify(filteredModels)]);

  const getTypeBadge = (type: string) => {
    const config = {
      photo: {
        label: "Photo",
        className: "bg-blue-50 text-blue-700 border-blue-200",
      },
      video: {
        label: "Video",
        className: "bg-purple-50 text-purple-700 border-purple-200",
      },
      audio: {
        label: "Audio",
        className: "bg-orange-50 text-orange-700 border-orange-200",
      },
    };

    const cfg = config[type as keyof typeof config] || {
      label: type,
      className: "bg-gray-50",
    };

    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    );
  };

  const handleDelete = (id: string) => {
    if (!showDeleteModal) return;

    deleteModel(id, {
      onSuccess: () => {
        setShowDeleteModal(null);
      },
    });
  };

  // Helper to invalidate queries
  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["admin", "trained-models"],
    });
  };

  // Handle success from modals
  const handleModalSuccess = async () => {
    await invalidateQueries();
  };

  const handleToggleVisibility = async (modelId: string, checked: boolean) => {
    const prev = visibilityMap[modelId];

    // 1️⃣ Optimistic UI update
    setVisibilityMap((prevMap) => ({
      ...prevMap,
      [modelId]: checked,
    }));

    try {
      await updateModelVisibility({
        modelId,
        isVisibleToAllUsers: checked,
      });

      toast.success(
        checked
          ? "Model is now visible to all users"
          : "Model visibility disabled"
      );
    } catch (err) {
      // 2️⃣ Rollback on failure
      setVisibilityMap((prevMap) => ({
        ...prevMap,
        [modelId]: prev,
      }));

      toast.error("Failed to update model visibility");
    }
  };

  if (modelsLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trained Models Management</h1>
          <p className="text-gray-500 mt-2">
            Manage AI models that can be assigned to users for generation
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Model
          </Button>
        </div>
      </div>
      <div className="p-4 bg-white rounded border">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search models by name, ID, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[300px] pl-5!">Model Details</TableHead>
                <TableHead>Enable Types</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Visible to All Users</TableHead>
                <TableHead className="text-right pr-5!">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.length > 0 &&
                filteredModels.map((model) => (
                  <TableRow key={model.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex flex-col pl-2">
                        <div className="flex items-center gap-2">
                          <Image
                            src={model.imageUrl || "/default-model-image.png"}
                            alt={model.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-md object-cover bg-gray-100"
                          />
                          <span className="font-semibold">{model.name}</span>
                        </div>
                        {model.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {model.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {model.subModels.filter((s) => s.status === "cloned")
                          .length > 0 ? (
                          model.subModels
                            .filter((s) => s.status === "cloned")
                            .map((s) => s.type)
                            .map((type) => (
                              <div key={type}>{getTypeBadge(type)}</div>
                            ))
                        ) : (
                          <span className="text-gray-400 text-sm">Pending</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {model.isDefaultModel ? (
                        <Badge variant="secondary">Default model</Badge>
                      ) : (
                        <span className="text-gray-400">Custom</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-[13px]">
                        {model.isPublishedByAdmin ? "Admin" : model.user.name}
                      </p>
                      <p className="text-[12px] text-gray-800 ">
                        {model.isPublishedByAdmin ? null : model.user.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {format(
                            new Date(model.createdAt || new Date()),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {model.isPublishedByAdmin ? (
                        <Switch
                          checked={visibilityMap[model.id] ?? false}
                          onCheckedChange={(checked) =>
                            handleToggleVisibility(model.id, checked)
                          }
                        />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const subModels = model.subModels.reduce(
                              (acc, sm) => {
                                acc[sm.type] = {
                                  enabled: sm.status === "cloned",
                                };
                                return acc;
                              },
                              {} as {
                                photo?: { enabled: boolean };
                                video?: { enabled: boolean };
                                audio?: { enabled: boolean };
                              }
                            );

                            const updatedModel = {
                              ...model,
                              subModels,
                            };

                            console.log(updatedModel);
                            setShowEditModal(updatedModel);
                          }}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowAssignModal(model)}
                          title="Assign Users"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowDeleteModal(model)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredModels.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-gray-500"
                  >
                    No trained models found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateEditModel
            createOpen={showCreateModal}
            setShowCreateModal={setShowCreateModal}
            mode="create"
            currentUserId={currentUserId}
          />
        )}

        {showEditModal && (
          <CreateEditModel
            createOpen={showEditModal !== null}
            setShowCreateModal={setShowEditModal as any}
            mode="edit"
            model={showEditModal}
            currentUserId={currentUserId}
          />
        )}

        {/* Assign Users Modal */}
        {showAssignModal && (
          <AssignUsersModal
            isOpen={!!showAssignModal}
            onClose={() => setShowAssignModal(null)}
            model={showAssignModal}
            onSuccess={handleModalSuccess}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <Dialog
            open={Boolean(showDeleteModal)}
            onOpenChange={(open) =>
              open || isDeleting ? null : setShowDeleteModal(null)
            }
          >
            <DialogContent
              aria-describedby={undefined}
              className="rounded-lg bg-white overflow-y-auto sm:max-w-md max-h-[94vh]"
            >
              <DialogHeader>
                <DialogTitle>Delete Trained Model</DialogTitle>
              </DialogHeader>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete &quot;{showDeleteModal.name}
                &quot;? This action cannot be undone and will remove all user
                assignments.
              </p>

              <DialogFooter className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => (isDeleting ? null : setShowDeleteModal(null))}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    isDeleting ? null : handleDelete(showDeleteModal.id)
                  }
                >
                  {isDeleting ? "Deleting..." : "Delete Permanently"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
