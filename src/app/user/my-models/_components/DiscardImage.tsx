"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { discardGeneratedImage } from "../_services/generate/generate.actions";
import { getGenerationsById } from "../_services/generate/generate.queries";
import { toast } from "sonner";
import { GenerateImageTableType } from "@/db/schema/generated-images";
import { Loader2, Trash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

type Discarding = {
  status: boolean;
  imageId: string;
};
type Props = {
  imageId: string;
  generatedId: string;
  setGeneratedImages: (url: GenerateImageTableType[]) => void;
  generatedImages: GenerateImageTableType[] | [];
  setDialogOpen: (open: boolean) => void;
  isDiscarding: Discarding;
  setIsDiscarding: (e: Discarding) => void;
  skipConfirmation?: boolean; // New prop
};

export default function DiscardImageDialog({
  imageId,
  generatedId,
  setGeneratedImages,
  generatedImages,
  setDialogOpen,
  isDiscarding,
  setIsDiscarding,
  skipConfirmation = false, // Default to false
}: Props) {
  const [open, setOpen] = useState(false);
  const { refetchUser } = useAuth();
  const queryClient = useQueryClient();

  const handleDiscardImage = async () => {
    setIsDiscarding({ status: true, imageId });
    try {
      const res = await discardGeneratedImage(imageId);
      if (!res.error) {
        toast.success(res.message);
        const updatedGeneration = await getGenerationsById(generatedId);
        setGeneratedImages(updatedGeneration?.images || []);
        refetchUser();

        // ✅ Invalidate caches so trash and discarded items update
        queryClient.invalidateQueries({
          queryKey: ["generations", "active"],
        });
        queryClient.invalidateQueries({
          queryKey: ["generations", "trash"],
        });
        queryClient.invalidateQueries({
          queryKey: ["discarded-images"],
        });

        return;
      }

      toast.error(res.message);
      // Revert the change if there was an error
    } catch (error: any) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setOpen(false);
      setIsDiscarding({ status: false, imageId: "" });
    }
  };

  return (
    <>
      <Button
        className="bg-red-500 hover:bg-red-600 text-white absolute top-2 right-2 z-20 rounded-full "
        size={"sm"}
        disabled={
          generatedImages.filter((img) => !img.isDiscarded).length <= 1 ||
          isDiscarding.status
        }
        onClick={(e) => {
          e.stopPropagation();
          if (skipConfirmation) {
            handleDiscardImage();
          } else {
            setOpen(true);
          }
        }}
      >
        <Trash className="h-4 w-4" />
      </Button>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (isDiscarding.status) return; // 🚫 block auto-close
          setOpen(val);
          setDialogOpen(val);
        }}
      >
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            if (isDiscarding.status) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isDiscarding.status) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Discard image</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to discard this image? You cannot discard the
            last remaining image.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isDiscarding.status}
              // onClick={() => setOpen(false)}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={isDiscarding.status}
              // onClick={handleDiscardImage}
              onClick={(e) => {
                e.stopPropagation();
                handleDiscardImage();
              }}
              className="gap-2"
            >
              {isDiscarding.status && isDiscarding.imageId === imageId && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
