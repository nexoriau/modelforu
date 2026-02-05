import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";
import { softDeleteGeneration } from "../my-models/_services/generate/generate.actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GenerateTableType } from "@/db/schema/generate";

export function LatestGenerationsDeleteAlert({
  genData,
}: {
  genData: GenerateTableType;
}) {
  const [openAlert, setOpenAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await softDeleteGeneration(genData.id);
    setIsLoading(false);
    queryClient.invalidateQueries({
      queryKey: ["generations", "active", genData.userId],
    });
    if (res.error) {
      toast.error(res.message);
      return;
    }
    setOpenAlert(false);
    toast.success(res.message);
  };

  const mediaTypeLabel = genData.type === "image" ? "image" : "video";

  return (
    <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
      {/* The button that opens the dialog */}
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-red-500 hover:bg-red-50 rounded-full hover:text-red-500"
          size={"icon-sm"}
        >
          <Trash />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
          <AlertDialogDescription>
            This {mediaTypeLabel} will be moved to the Trash bin. You can
            restore it anytime within the next <strong>10 days</strong>. After
            that, it will be permanently deleted from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant={"destructive"}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
