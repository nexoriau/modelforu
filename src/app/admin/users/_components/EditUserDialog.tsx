'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Box, Edit } from 'lucide-react';
import { useState, useTransition } from 'react';
import { UserForm } from './UserForm';
import { UserFormType, UserTableType } from '@/db/schema/auth';
import { editUser } from '../_services/users.actions';
import { toast } from 'sonner';
// import AssignModelsToUser from './AssignModelsToUser';

export default function EditUserDialog({ user }: { user: UserTableType }) {
  const [open, setOpen] = useState(false);
  // const [showAssignModels, setShowAssignModels] = useState(false);
  const [isPending, startTransition] = useTransition();

  const formSubmit = (formData: UserFormType) => {
    startTransition(async () => {
      const res = await editUser({
        formData: { ...formData, email: user.email },
        userId: user.id,
      });
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success('User updated successfully');
      setOpen(false);
    });
  };
  return (
    <>
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white"
        size={'sm'}
        onClick={() => setOpen(true)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      {/* <Button
        className="bg-purple-500 hover:bg-purple-600 text-white"
        size={'sm'}
        onClick={() => setShowAssignModels(true)}
        title="Assign Models"
      >
        <Box className="h-4 w-4" />
      </Button> */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <fieldset disabled={isPending}>
            <UserForm
              formSubmit={formSubmit}
              isEdit={true}
              defaultValues={{
                name: user.name ?? '',
                email: user.email,
                role: user.role,
                tokens: Number(user.tokens),
                status: user.status ?? 'approved',
                models: user.models
                // isSubscribed: user?.isSubscribed,
                // haveVoices: user?.haveVoices,
                // assignedVoices: user?.assignedVoices,
              }}
            />
          </fieldset>
        </DialogContent>
      </Dialog>
      {/* Assign Models Dialog */}
      {/* {showAssignModels && (
        <AssignModelsToUser
          user={{
            id: user.id,
            name: user.name,
            email: user.email
          }}
          isOpen={showAssignModels}
          onClose={() => setShowAssignModels(false)}
        />
      )} */}
    </>
  );
}
