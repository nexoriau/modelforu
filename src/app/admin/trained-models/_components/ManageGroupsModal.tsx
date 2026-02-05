"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Check, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

interface Group {
  id: string;
  name: string;
  type: "photo" | "video" | "audio";
  description: string | null;
  createdAt: Date;
}

interface ManageGroupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export default function ManageGroupsModal({
  isOpen,
  onClose,
  currentUserId,
}: ManageGroupsModalProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: "",
    type: "photo" as "photo" | "video" | "audio",
    description: "",
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/admin/trained-models/groups");
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Failed to load groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    try {
      const response = await fetch("/api/admin/trained-models/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newGroup,
        }),
      });

      if (response.ok) {
        toast.success("Group created successfully");
        setNewGroup({ name: "", type: "photo", description: "" });
        fetchGroups();
        await queryClient.invalidateQueries({
          queryKey: ["admin", "trained-model-groups"],
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to create group");
      }
    } catch (error) {
      toast.error("Error creating group");
    }
  };

  const handleUpdateGroup = async (group: Group) => {
    if (!editingGroup) return;

    try {
      const response = await fetch("/api/admin/trained-models/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGroup.id,
          name: editingGroup.name,
          description: editingGroup.description,
        }),
      });

      if (response.ok) {
        toast.success("Group updated successfully");
        setEditingGroup(null);
        fetchGroups();
        await queryClient.invalidateQueries({
          queryKey: ["admin", "trained-model-groups"],
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update group");
      }
    } catch (error) {
      toast.error("Error updating group");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this group? This will not delete the models in it."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/trained-models/groups?id=${groupId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Group deleted successfully");
        fetchGroups();
        await queryClient.invalidateQueries({
          queryKey: ["admin", "trained-model-groups"],
        });
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete group");
      }
    } catch (error) {
      toast.error("Error deleting group");
    }
  };

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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="rounded-lg bg-white overflow-y-auto sm:max-w-4xl max-h-[94vh]"
      >
        <DialogHeader>
          <DialogTitle>Manage Groups</DialogTitle>
          <DialogDescription>
            Organize trained models into groups
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {/* Create New Group */}
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">Create New Group</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newGroupName">Group Name</Label>
                <Input
                  id="newGroupName"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Anime Characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newGroupType">Type</Label>
                <select
                  id="newGroupType"
                  value={newGroup.type}
                  onChange={(e) =>
                    setNewGroup((prev) => ({
                      ...prev,
                      type: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newGroupDescription">Description</Label>
                <Input
                  id="newGroupDescription"
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleCreateGroup}>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </div>
          </div>

          {/* Groups List */}
          <div>
            <h3 className="font-semibold mb-4">
              Existing Groups ({groups.length})
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No groups created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    {editingGroup?.id === group.id ? (
                      <div className="flex-1 flex items-center gap-4">
                        <div className="flex-1">
                          <Input
                            value={editingGroup.name}
                            onChange={(e) =>
                              setEditingGroup((prev) =>
                                prev ? { ...prev, name: e.target.value } : null
                              )
                            }
                            className="mb-2"
                          />
                          <Textarea
                            value={editingGroup.description || ""}
                            onChange={(e) =>
                              setEditingGroup((prev) =>
                                prev
                                  ? { ...prev, description: e.target.value }
                                  : null
                              )
                            }
                            placeholder="Description"
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleUpdateGroup(group)}
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingGroup(null)}
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{group.name}</span>
                            {getTypeBadge(group.type)}
                          </div>
                          {group.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {group.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingGroup(group)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-end p-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
