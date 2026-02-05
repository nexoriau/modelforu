'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { UserFormType } from '@/db/schema/auth';
import { UserForm } from './UserForm';
import { createUser } from '../_services/users.actions';
import { toast } from 'sonner';

export default function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formSubmit = (formData: UserFormType) => {
    startTransition(async () => {
      const res = await createUser(formData);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success('User created successfully');
      setOpen(false);
    });
  };

  return (
    <>
      <Button
        className="btn-grad w-full md:w-fit"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" /> Add User
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <fieldset disabled={isPending}>
            <UserForm formSubmit={formSubmit} />
          </fieldset>
        </DialogContent>
      </Dialog>
    </>
  );
}
