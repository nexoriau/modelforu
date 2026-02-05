"use client";

import { format } from "date-fns";
import {
  ArrowUpDown,
  Eye,
  FileImage,
  Loader2,
  Mic,
  RefreshCcw,
  Search,
  Trash2,
  Video,
  Trash,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

// Shadcn UI Component Imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { useGetSoftDeletedGenerationsByUserId } from "../my-models/_services/generate/generate-use-queries";
import { useQueryClient } from "@tanstack/react-query";
import {
  restoreSoftDeletedGeneration,
  permanentlyDeleteAllSoftDeleted,
  permanentlyDeleteGeneration,
} from "../my-models/_services/generate/generate.actions";
import { GenerateTableType } from "@/db/schema/generate";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Import Alert Dialog components
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

type SortConfig = {
  key: "type" | "createdAt" | "model";
  direction: "asc" | "desc";
};

export default function TrashPageComp({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const { refetchUser } = useAuth();

  const {
    softDeletedGenerationsByUserIdData,
    softDeletedGenerationsByUserIdLoading,
  } = useGetSoftDeletedGenerationsByUserId(userId);

  // State for Search and Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "createdAt",
    direction: "desc",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [isEmptyTrashLoading, setIsEmptyTrashLoading] = useState(false);
  const [deletingItems, setDeletingItems] = useState<Record<string, boolean>>(
    {},
  );

  const queryClient = useQueryClient();

  const restoreData = async (genData: GenerateTableType) => {
    setIsLoading(true);
    setSelected(genData.id);
    const res = await restoreSoftDeletedGeneration(genData.id);
    setIsLoading(false);
    if (res.error) {
      toast.error(res.message);
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: ["generations", "trash", genData.userId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["generations", "active", genData.userId],
    });
    refetchUser();
    toast.success(t("user.trash.toasts.restored"));
  };

  const handleEmptyTrash = async () => {
    setIsEmptyTrashLoading(true);
    const res = await permanentlyDeleteAllSoftDeleted(userId);
    setIsEmptyTrashLoading(false);

    if (res.error) {
      toast.error(res.message);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["generations", "trash", userId],
    });
    toast.success(t("user.trash.toasts.emptied"));
  };

  const handlePermanentlyDeleteItem = async (genData: GenerateTableType) => {
    setDeletingItems((prev) => ({ ...prev, [genData.id]: true }));

    const res = await permanentlyDeleteGeneration(genData.id, userId);

    setDeletingItems((prev) => ({ ...prev, [genData.id]: false }));

    if (res.error) {
      toast.error(res.message);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ["generations", "trash", userId],
    });

    toast.success(t("user.trash.toasts.deleted"));
  };

  // Handle Sorting Logic
  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Helper to render type icons/badges
  const getTypeBadge = (type: string) => {
    const styles = {
      photo: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
      video: "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
      audio: "bg-orange-100 text-orange-700 hover:bg-orange-100/80",
    };

    const icons = {
      photo: <FileImage className="w-3 h-3 mr-1" />,
      video: <Video className="w-3 h-3 mr-1" />,
      audio: <Mic className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge
        variant="secondary"
        className={`capitalize shadow-none ${styles[type as keyof typeof styles] || "bg-gray-100 text-gray-700"}`}
      >
        {icons[type as keyof typeof icons]}
        {type}
      </Badge>
    );
  };

  // Process Data: Filter -> Sort
  const processedData = useMemo(() => {
    if (!softDeletedGenerationsByUserIdData) return [];

    let data = [...softDeletedGenerationsByUserIdData];

    // 1. Search Filter (Model Name or Description)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.model?.name?.toLowerCase().includes(lowerQuery) ||
          item.description?.toLowerCase().includes(lowerQuery),
      );
    }

    // 2. Sorting
    data.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case "model":
          aValue = a.model?.name || "";
          bValue = b.model?.name || "";
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [softDeletedGenerationsByUserIdData, searchQuery, sortConfig]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("user.trash.title")}
          </h2>
          <p className="text-sm text-gray-500">{t("user.sidebar.trashBin")}</p>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={t("user.trash.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Empty Trash Button */}
          {processedData.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={
                    isEmptyTrashLoading || softDeletedGenerationsByUserIdLoading
                  }
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  {isEmptyTrashLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("user.trash.emptying")}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      {t("user.trash.emptyTrash")}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Trash className="h-5 w-5 text-destructive" />
                    {t("user.trash.dialog.emptyTrash")}
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-2">
                      <span className="block">
                        {t("user.trash.dialog.emptyTrashDesc")}
                      </span>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                        <li>
                          • {t("user.trash.dialog.allDeletedWillBeRemoved")}
                        </li>
                        <li>
                          • {t("user.trash.dialog.actionCannotBeReversed")}
                        </li>
                        <li>• {t("user.trash.dialog.makeSureYouDontNeed")}</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isEmptyTrashLoading}>
                    {t("user.gallery.dialog.cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEmptyTrash}
                    disabled={isEmptyTrashLoading}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {isEmptyTrashLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("user.trash.dialog.deleting")}
                      </>
                    ) : (
                      t("user.trash.dialog.deletePermanently")
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-md shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
              <TableHead className="w-[150px] cursor-pointer hover:text-black transition-colors">
                {t("user.trash.table.media")}
              </TableHead>
              <TableHead
                className="w-[150px] cursor-pointer hover:text-black transition-colors"
                onClick={() => handleSort("type")}
              >
                <div className="flex items-center gap-1">
                  {t("user.trash.table.type")}
                  <ArrowUpDown
                    className={`h-3 w-3 ${sortConfig.key === "type" ? "opacity-100" : "opacity-40"}`}
                  />
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer hover:text-black transition-colors"
                onClick={() => handleSort("model")}
              >
                <div className="flex items-center gap-1">
                  {t("user.trash.table.model")}
                  <ArrowUpDown
                    className={`h-3 w-3 ${sortConfig.key === "model" ? "opacity-100" : "opacity-40"}`}
                  />
                </div>
              </TableHead>

              <TableHead>{t("user.trash.table.description")}</TableHead>

              <TableHead
                className="w-[200px] cursor-pointer hover:text-black transition-colors"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center gap-1">
                  {t("user.trash.table.dateCreated")}
                  <ArrowUpDown
                    className={`h-3 w-3 ${sortConfig.key === "createdAt" ? "opacity-100" : "opacity-40"}`}
                  />
                </div>
              </TableHead>

              <TableHead className="w-[50px]">
                {t("user.trash.table.restore")}
              </TableHead>
              <TableHead className="w-[50px]">
                {t("user.trash.table.delete")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {softDeletedGenerationsByUserIdLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("user.trash.loading")}
                  </div>
                </TableCell>
              </TableRow>
            ) : processedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-gray-500"
                >
                  {searchQuery
                    ? `${t("user.trash.noResultsFor")} "${searchQuery}"`
                    : t("user.trash.noItems")}
                </TableCell>
              </TableRow>
            ) : (
              processedData.map((gen) => (
                <TableRow key={gen.id} className="group hover:bg-gray-50/50">
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="size-24 relative rounded-md overflow-hidden group cursor-pointer">
                          <div className="hidden group-hover:flex items-center justify-center absolute inset-0 z-50 bg-black/60 text-white ">
                            <Eye />
                          </div>
                          {gen.type === "photo" && (
                            <Image
                              src={
                                (gen.softDelete
                                  ? gen.images
                                  : gen.images.filter(
                                      (im) => im.isDiscarded,
                                    ))[0]?.imageUrl
                              }
                              alt="Generated content"
                              fill
                              className="w-full h-full absolute object-cover transition-transform duration-300"
                            />
                          )}
                          {gen.type === "video" && (
                            <video
                              src={gen.mediaUrl[0]!}
                              autoPlay
                              loop
                              playsInline
                              muted
                              className="w-full h-full absolute object-cover transition-transform duration-300"
                            />
                          )}
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogTitle>
                          {t("user.trash.dialog.generationDetails")}
                        </DialogTitle>
                        <div className="space-y-4">
                          {/* Media Preview */}
                          {gen.type === "photo" &&
                            (() => {
                              // If the generation itself is soft deleted, show all images.
                              // If not, show only the discarded individual images.
                              const imagesToShow = gen.softDelete
                                ? gen.images
                                : gen.images.filter((img) => img.isDiscarded);

                              if (imagesToShow.length === 0) return null;

                              const getGridCols = () => {
                                if (imagesToShow.length === 1)
                                  return "grid-cols-1";
                                if (imagesToShow.length === 2)
                                  return "grid-cols-2";
                                if (imagesToShow.length === 3)
                                  return "grid-cols-3";
                                return "grid-cols-2 sm:grid-cols-3";
                              };

                              const getImageClass = () => {
                                if (imagesToShow.length === 1)
                                  return "h-[450px]";
                                if (imagesToShow.length === 2)
                                  return "h-[300px]";
                                return "aspect-square";
                              };

                              return (
                                <div className={`grid gap-2 ${getGridCols()}`}>
                                  {imagesToShow.map((image, index) => (
                                    <div
                                      key={image.id || index}
                                      className={`relative border border-gray-200 bg-gray-50 rounded-lg overflow-hidden ${getImageClass()}`}
                                    >
                                      {/* Watermark only if discarded */}
                                      {image.isDiscarded && (
                                        <>
                                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-50">
                                            <span className="text-red-600/50 text-4xl md:text-4xl font-black select-none uppercase tracking-widest transform -rotate-45 whitespace-nowrap border-4 border-red-600/30 px-4 py-2">
                                              {t("user.discarded.watermark")}
                                            </span>
                                          </div>
                                          {/* Overlay with Restore Button */}
                                          <div className="absolute inset-0 bg-black/60 opacity-50 group-hover:opacity-100 transition flex items-center justify-center z-60"></div>
                                        </>
                                      )}
                                      <Image
                                        src={
                                          image.imageUrl || "/placeholder.webp"
                                        }
                                        alt={`Generated content ${index + 1}`}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-300 aspect-square"
                                      />

                                      {imagesToShow.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                          {index + 1}/{imagesToShow.length}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}

                          {gen.type === "video" && (
                            <div
                              className={`grid gap-2 ${
                                gen.mediaUrl.length === 1
                                  ? "grid-cols-1"
                                  : "grid-cols-2"
                              }`}
                            >
                              {gen.mediaUrl.map((url, index) => (
                                <div
                                  key={index}
                                  className={`relative border border-gray-200 bg-gray-50 rounded-lg overflow-hidden ${
                                    gen.mediaUrl.length === 1
                                      ? "h-[450px]"
                                      : "aspect-video"
                                  }`}
                                >
                                  <video
                                    src={url}
                                    controls
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Details */}
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Model
                                </p>
                                <p className="text-sm">
                                  {gen.model?.name || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  Type
                                </p>
                                <p className="text-sm capitalize">
                                  {gen.subModel?.type || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* SubModel Details */}
                            {gen.subModel && (
                              <div className="border-t pt-3 space-y-2">
                                <h4 className="font-medium text-sm">
                                  SubModel Details
                                </h4>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Status
                                    </p>
                                    <p
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                        gen.subModel.status === "cloned"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                          : gen.subModel.status === "pending" ||
                                              gen.subModel.status === "cloning"
                                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                            : gen.subModel.status === "canceled"
                                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                      }`}
                                    >
                                      {gen.subModel.status}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Items
                                    </p>
                                    <p>{gen.subModel.itemsLength}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Created
                                    </p>
                                    <p>
                                      {gen.subModel.createdAt
                                        ? new Date(
                                            gen.subModel.createdAt,
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                </div>

                                {gen.subModel.description && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Description
                                    </p>
                                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                      {gen.subModel.description}
                                    </p>
                                  </div>
                                )}

                                {gen.subModel.driveLink && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Drive Link
                                    </p>
                                    <a
                                      href={gen.subModel.driveLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                                    >
                                      {gen.subModel.driveLink}
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>{getTypeBadge(gen.type)}</TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {gen.model?.name || "Unknown Model"}
                  </TableCell>
                  <TableCell
                    className="max-w-[300px] truncate text-gray-500"
                    title={gen.description}
                  >
                    {gen.description}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {gen.createdAt
                      ? format(new Date(gen.createdAt), "MMM dd, yyyy")
                      : "-"}
                    <span className="block text-xs text-gray-400">
                      {gen.createdAt
                        ? format(new Date(gen.createdAt), "p")
                        : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    {((gen.type === "video" && gen.mediaUrl.length > 0) ||
                      (gen.type === "photo" && gen.images.length > 0)) && (
                      <div
                        className="flex items-center justify-center"
                        onMouseEnter={() => setSelected(gen.id)}
                      >
                        <Button
                          size={"icon-sm"}
                          variant={"ghost"}
                          className="rounded-full flex items-center justify-center hover:bg-green-100 hover:text-green-700 transition-colors"
                          disabled={isLoading && gen.id === selected}
                          onClick={() => restoreData(gen)}
                          title="Restore item"
                        >
                          <RefreshCcw
                            className={`w-4 h-4 ${isLoading && gen.id === selected ? "animate-spin" : ""}`}
                          />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {((gen.type === "video" && gen.mediaUrl.length > 0) ||
                      (gen.type === "photo" && gen.images.length > 0)) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size={"icon-sm"}
                            variant={"ghost"}
                            className="rounded-full flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors opacity-70 group-hover:opacity-100"
                            disabled={deletingItems[gen.id]}
                            title="Permanently delete item"
                          >
                            {deletingItems[gen.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <Trash className="h-5 w-5 text-destructive" />
                              Delete Permanently
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                              <div className="space-y-2">
                                <span className="block font-medium text-red-600 dark:text-red-400">
                                  Warning: This action cannot be undone!
                                </span>
                                <span className="block">
                                  You are about to permanently delete this
                                  generation:
                                </span>
                                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-1">
                                  <p className="text-sm">
                                    <span className="font-medium">Model:</span>{" "}
                                    {gen.model?.name || "Unknown"}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Type:</span>{" "}
                                    {gen.type}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Created:
                                    </span>{" "}
                                    {gen.createdAt
                                      ? format(
                                          new Date(gen.createdAt),
                                          "MMM dd, yyyy",
                                        )
                                      : "N/A"}
                                  </p>
                                </div>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                                  <li>
                                    • This item will be removed permanently
                                  </li>
                                  <li>• This action cannot be reversed</li>
                                  <li>
                                    • Make sure you don&apos;t need this item
                                  </li>
                                  <li>
                                    • This will also remove any related images
                                    from the Discarded tab
                                  </li>
                                </ul>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletingItems[gen.id]}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handlePermanentlyDeleteItem(gen)}
                              disabled={deletingItems[gen.id]}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              {deletingItems[gen.id] ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                "Delete Permanently"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer / Count */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>
          Showing {processedData.length} item
          {processedData.length !== 1 ? "s" : ""} in trash
        </div>
        {processedData.length > 0 && (
          <div className="text-xs text-gray-500">
            Items will be permanently deleted after 10 days
          </div>
        )}
      </div>
    </div>
  );
}
