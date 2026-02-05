'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash } from 'lucide-react';
import { useState, useTransition } from 'react';
import { deleteUser } from '../_services/users.actions';

type Props = {
  userId: string;
};

export default function DeleteUserDialog({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteUser(userId);
      setOpen(false);
    });
  };

  return (
    <>
      <Button
        className="bg-red-500 hover:bg-red-600 text-white"
        size={'sm'}
        onClick={() => setOpen(true)}
      >
        <Trash className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action will not be reversible, Are you sure you want to delete
            that user?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={isPending}
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
