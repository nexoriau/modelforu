"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  restoreGeneratedImage,
  restoreSoftDeletedGeneration,
} from "../my-models/_services/generate/generate.actions";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

export function RestoreImageAlert({
  item,
  onClose,
  onSuccess,
}: {
  item: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { refetchUser } = useAuth();
  const queryClient = useQueryClient();

  const handleRestore = () => {
    startTransition(async () => {
      try {
        let res;
        if (item.isImage) {
          res = await restoreGeneratedImage(item.id);
        } else {
          res = await restoreSoftDeletedGeneration(item.id);
        }

        if (res?.error) {
          toast.error(res.message);
          return;
        }

        toast.success(
          item.isImage ? "Item restored (-0.5 tokens)" : "Item restored",
        );
        onSuccess();
        refetchUser();

        // ✅ Invalidate caches so gallery and trash items update
        queryClient.invalidateQueries({
          queryKey: ["generations", "active"],
        });
        queryClient.invalidateQueries({
          queryKey: ["generations", "trash"],
        });
        queryClient.invalidateQueries({
          queryKey: ["discarded-images"],
        });
      } catch (err) {
        console.log(err);
      }
    });
  };

  return (
    <AlertDialog open>
      <AlertDialogContent
        onEscapeKeyDown={(e) => isPending && e.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>
            Restore {item.isImage ? "Image" : "Item"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {item.isImage ? (
              <>
                Restoring this image will cost{" "}
                <span className="font-semibold text-red-600">0.5 tokens</span>.
              </>
            ) : (
              "Are you sure you want to restore this item?"
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} onClick={onClose}>
            Cancel
          </AlertDialogCancel>

          {/* ✅ NORMAL BUTTON — NOT AlertDialogAction */}
          <Button
            onClick={handleRestore}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Restoring..." : "Restore"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
