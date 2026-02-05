"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModelTableType } from "@/db/schema/models";
import Image from "next/image";
import { ModelFormSchema, ModelFormData } from "./MainModelsComp";
import { Switch } from "@/components/ui/switch";
import { ModelSchemaTableType } from "@/app/admin/trained-models/_services/admin-model.action";

interface ModelFormProps {
  model?: ModelSchemaTableType | null;
  onSubmit: (
    data: ModelFormData,
    imageFile: File | null,
    existingImageUrl?: string
  ) => Promise<void>;
  onCancel?: () => void;
  isSubmitting: boolean;
  uploadProgress: number;
  submitButtonText?: string;
  mode: "create" | "edit";
  isAdmin?: boolean;
}

export default function ModelForm({
  model,
  onSubmit,
  onCancel,
  isSubmitting,
  uploadProgress,
  submitButtonText,
  mode = "create",
  isAdmin = false,
}: ModelFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const defaultSubModels = {
    photo: { enabled: false },
    video: { enabled: false },
    audio: { enabled: false },
  };

  const form = useForm<ModelFormData>({
    resolver: zodResolver(ModelFormSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: [],
      gender: model?.gender || "",
      imageUrl: "",
      character: model?.character || "",
      subModels: model?.subModels || defaultSubModels,
    },
  });
  useEffect(() => {
    if (model) {
      form.reset({
        name: model.name,
        description: model.description || "",
        tags: model.tags || [],
        gender: model.gender || "",
        imageUrl: model.imageUrl || "",
        character: model.character || "",
        subModels:model?.subModels || defaultSubModels,
      });
      setImagePreview(model.imageUrl || null);
    } else {
      form.reset({
        name: "",
        description: "",
        tags: [],
        gender: "",
        imageUrl: "",
        character: "",
        subModels: defaultSubModels,
      });
      setImagePreview(null);
    }
    setSelectedFile(null);
    setTagInput("");
    setImageError(null);
  }, [model, form]);

  const validateImageFile = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, or WEBP)";
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return "Image size must be less than 5MB";
    }
    return null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(null);

    if (!file) {
      setImageError("Please select an image file");
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      setImageError(validationError);
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageError(null);

    const fileInput = document.getElementById(
      `${mode}-dropzone-file`
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().replace(/,$/, "");
    if (tag) {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(tag)) {
        form.setValue("tags", [...currentTags, tag]);
      }
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((t: string) => t !== tag)
    );
  };

  const handleSubmit = async (data: ModelFormData) => {
    setImageError(null);

    // Validate image based on mode
    if (mode === "create" && !selectedFile && !imagePreview) {
      setImageError("Image is required");
      return;
    }

    if (mode === "edit" && !imagePreview && !selectedFile) {
      setImageError("Image is required");
      return;
    }
    const payload = {
      ...data,
      subModels: isAdmin ? data.subModels : undefined,
    };

    await onSubmit(payload, selectedFile, model?.imageUrl);

    // await onSubmit(data, selectedFile, model?.imageUrl);
  };

  const renderFormField = (
    id: keyof ModelFormData,
    label: string,
    type: "input" | "textarea" = "input"
  ) => (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor={`${mode}-${id}`} className="text-right pt-2">
        {label}
      </Label>
      <div className="col-span-3">
        {type === "input" ? (
          <Input id={`${mode}-${id}`} {...form.register(id)} />
        ) : (
          <Textarea id={`${mode}-${id}`} {...form.register(id)} />
        )}
        {form.formState.errors[id] && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors[id]?.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderGenderField = () => (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right pt-2">Gender</Label>
      <div className="col-span-3">
        <Controller
          control={form.control}
          name="gender"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.gender && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.gender.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderCharacterField = () => (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor={`${mode}-character`} className=" pt-2">
        Trained Character
      </Label>
      <div className="col-span-3">
        <Input id={`${mode}-character`} {...form.register("character")} placeholder="e.g asuka, remilia" />
        {form.formState.errors.character && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.character?.message}
          </p>
        )}
      </div>
    </div>
  );

  const renderAdminSubModels = () => (
    <div className="border-t pt-6 space-y-4">
      <h3 className="text-lg font-semibold">Sub Models</h3>

      {(["photo", "video", "audio"] as const).map((type) => (
        <div key={type} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="capitalize">Enable {type} model</Label>
            <Controller
              control={form.control}
              name={`subModels.${type}.enabled`}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderImageUpload = () => (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right pt-2">
        Image <span className="text-red-500">*</span>
      </Label>
      <div className="col-span-3">
        <div className="flex flex-col gap-4">
          {imagePreview ? (
            <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden border border-border">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-2">
                  <div
                    className="bg-blue-500 h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor={`${mode}-dropzone-file`}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  imageError
                    ? "border-red-300 bg-red-50 hover:bg-red-100"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload
                    className={`w-8 h-8 mb-2 ${imageError ? "text-red-500" : "text-gray-500"}`}
                  />
                  <p
                    className={`text-sm ${imageError ? "text-red-500" : "text-gray-500"}`}
                  >
                    <span className="font-semibold">Click to upload</span>
                  </p>
                  <p
                    className={`text-xs ${imageError ? "text-red-500" : "text-gray-500"}`}
                  >
                    PNG, JPG or WEBP (max 5MB)
                  </p>
                </div>
                <Input
                  id={`${mode}-dropzone-file`}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageSelect}
                />
              </label>
            </div>
          )}
          {imageError && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <X size={14} />
              {imageError}
            </p>
          )}
          {!imageError && !imagePreview && (
            <p className="text-xs text-gray-500 mt-1">
              Required field. Supported formats: JPEG, PNG, WEBP. Max size: 5MB
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTagField = () => (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor={`${mode}-tags`} className="text-right pt-2">
        Tags
      </Label>
      <div className="col-span-3">
        <Input
          id={`${mode}-tags`}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          placeholder="Type tag and press Enter or ,"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {form.watch("tags")?.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 rounded-full p-0.5 hover:bg-black/10 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const getSubmitButtonText = () => {
    if (submitButtonText) return submitButtonText;
    return mode === "create" ? "Create" : "Save Changes";
  };

  const isSubmitDisabled = () => {
    if (isSubmitting) return true;
    if (mode === "create") return !selectedFile;
    if (mode === "edit") return !imagePreview && !selectedFile;
    return false;
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="grid gap-4 py-4">
        {renderImageUpload()}
        {renderFormField("name", "Name")}
        {renderGenderField()}
        {renderFormField("description", "Description", "textarea")}
        {renderTagField()}
        {isAdmin && renderCharacterField()}
        {isAdmin && renderAdminSubModels()}
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitDisabled()}
          className="min-w-20"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {uploadProgress > 0
                ? `Uploading... ${uploadProgress}%`
                : `${getSubmitButtonText()}...`}
            </div>
          ) : (
            getSubmitButtonText()
          )}
        </Button>
      </div>
    </form>
  );
}
