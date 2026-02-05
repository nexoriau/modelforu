'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelTableType } from '@/db/schema/models';
import { UserTableType } from '@/db/schema/auth';

// Import your existing dialogs
import EditModelDialog from './EditModelDialog';
import DeleteModelDialog from './DeleteModelDialog';

interface ModelActionsProps {
  model: ModelTableType;
  user?: UserTableType; // Make user optional or required based on your auth setup
}

export default function ModelActions({ model, user }: ModelActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex gap-2">
      {/* Edit Button */}
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setIsEditOpen(true)}
      >
        <Edit className="h-4 w-4" />
        Edit
      </Button>

      {/* Delete Button */}
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        onClick={() => setIsDeleteOpen(true)}
      >
        <Trash className="h-4 w-4" />
        Delete
      </Button>

      {/* Edit Dialog */}
      <EditModelDialog
        model={model}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={user}
        onSuccess={() => {}}
      />

      {/* Delete Dialog */}
      <DeleteModelDialog
        model={model}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={() => {
          router.push('/user/my-models');
        }}
      />
    </div>
  );
}
