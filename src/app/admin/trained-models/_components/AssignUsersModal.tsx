"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, User, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModelTableType } from "@/db/schema/models";
import { getAllUsers } from "../../users/_services/users.queries";
import {
  useAssignModelToUsers,
  useFetchAssignedModelUsers,
} from "../_services/trained-models.queries";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface AssignUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelTableType;
  onSuccess?: () => void;
}

export default function AssignUsersModal({
  isOpen,
  onClose,
  model,
  onSuccess,
}: AssignUsersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { mutateAsync: assignModel } = useAssignModelToUsers();
  const { data } = useFetchAssignedModelUsers(model.id);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const allUsers = await getAllUsers();
          setUsers(allUsers);
        } catch (error) {
          console.error("Failed to load users:", error);
          toast.error("Failed to load users");
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, model.id]);

  const assignments = useMemo(() => data || [], [data]);

  useEffect(() => {
    const assignedUserIds = assignments.map((a: any) => a.userId);
    setSelectedUsers(new Set(assignedUserIds));
  }, [assignments]);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((user) => user.id)));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userIds = Array.from(selectedUsers);
      await assignModel({ modelId: model.id, userIds });
      onClose();
    } catch (error) {
      toast.error("Error saving assignments");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="rounded-lg bg-white overflow-y-auto sm:max-w-4xl max-h-[94vh]"
      >
        <DialogHeader>
          <DialogTitle>Assign Users to Model</DialogTitle>
          <DialogDescription>
            Select users who can use <strong>{model.name}</strong>
          </DialogDescription>
        </DialogHeader>
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Selection Summary */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedUsers.size} selected
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-auto p-1 text-sm"
                  >
                    {selectedUsers.size === filteredUsers.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`relative flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.has(user.id)
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleToggleUser(user.id)}
                  >
                    {model.userId === user.id ? (
                      <Badge
                        variant="outline"
                        className="absolute top-1 right-1 text-[10px]"
                      >
                        Creator
                      </Badge>
                    ) : null}
                    <div className="relative flex items-center gap-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name || "No name"}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleToggleUser(user.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No users found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-end gap-3 pt-6 border-t">
          <p className="text-sm text-gray-600">
            {selectedUsers.size} user{selectedUsers.size !== 1 ? "s" : ""}{" "}
            selected
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Assignments"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
