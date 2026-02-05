'use client';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form'; 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

import { useAuth } from '@/context/AuthContext';
import {
  CreatePhotoVideoAudioSchema,
  CreatePhotoVideoAudioSchemaType,
  SubModelTableType,
} from '@/db/schema/sub-model';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createSubModel,
  updateSubModel,
} from '../_services/sub-model/subModel.actions';
import { useCreateNotification } from '@/app/_others/notification/actions/use-notification.action';
import { uploadToDrive } from '@/lib/utils-functions/upload-to-drive';
type Props = {
  subModelType: 'audio' | 'video' | 'photo';
  subModelDataById?: SubModelTableType;
  modelName: string;
};
// ------------------------------------------------------------------------
export default function CreatePhotoVideoSubModel({
  subModelType,
  subModelDataById,
  modelName,
}: Props) {
  const initialValue = {
    items: [],
    description: subModelDataById ? subModelDataById.description : '',
  };
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const router = useRouter();
  const title = subModelType?.[0]?.toUpperCase() + subModelType?.slice(1);
  const { currentUser } = useAuth();
  const createNotification = useCreateNotification();
  const form = useForm<CreatePhotoVideoAudioSchemaType>({
    resolver: zodResolver(CreatePhotoVideoAudioSchema),
    defaultValues: initialValue,
  });
  const onDrop = (acceptedFiles: File[]) => {
    if (isCloning) return;
    const newFiles = [...uploadedFiles, ...acceptedFiles];
    setUploadedFiles(newFiles);
    form.setValue('items', newFiles, { shouldValidate: true });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: true,
    disabled: isCloning,
  });
  const removeFile = (index: number) => {
    if (isCloning) return;
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    form.setValue('items', newFiles, { shouldValidate: true });
  };
  const onSubmit = async (values: CreatePhotoVideoAudioSchemaType) => {
    if (!currentUser) {
      toast.error('User not found');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    startTransition(async () => {
      try {
        toast.loading('Uploading images...');

        // Unique folder name per user + model + type
        const folderName = `${currentUser.name || currentUser.id}-${modelName}-${subModelType}`;

        // Create FormData object to pass to server action
        const formData = new FormData();
        formData.append('folderName', folderName);

        uploadedFiles.forEach((file) => {
          formData.append('files', file);
        });

        // Call the server action with FormData
        const uploadResult = await uploadToDrive(formData);

        if (!uploadResult.success) {
          throw new Error(uploadResult.message || 'Upload failed');
        }

        toast.dismiss();
        toast.success('Images uploaded successfully!');

        // Now proceed with your DB logic
        let res;
        if (subModelDataById) {
          res = await updateSubModel(subModelDataById.id, {
            description: values.description || subModelDataById.description,
            itemsLength: uploadedFiles.length,
          });
        } else {
          res = await createSubModel({
            ...values,
            modelId: params.id as string,
            userId: currentUser.id,
            type: subModelType,
            itemsLength: uploadedFiles.length,
            status: 'pending',
            driveLink: `https://drive.google.com/drive/folders/${uploadResult.folderId}`,
            description: values.description || ''
          });
        }

        if (res.id) {
          toast.success('Clone started successfully!');
          form.reset();
          setUploadedFiles([]);
          router.push(`/user/my-models/${params.id}`);
        }
      } catch (error: any) {
        console.error(error);
        toast.dismiss();
        toast.error(error.message || 'Upload or cloning failed');
      }
    });
  };
  const handleCancel = () => {
    form.reset();
    setUploadedFiles([]);
    setIsCloning(false);
  };
  return (
    <div className="w-full ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* --- NEW: Description --- */}
          <div className="grid grid-cols-1 gap-6 place-items-start">
            {/* Description Textarea field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-semibold text-gray-700">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description"
                      className="bg-gray-50 border-gray-200 rounded-lg placeholder:text-gray-400 min-h-[100px]"
                      disabled={isCloning}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
          {/* --- END NEW Row --- */}
          {/* Upload Photos Section */}
          <FormField
            control={form.control}
            name="items"
            render={({ fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700">
                  Upload {title}s
                </FormLabel>
                <FormControl>
                  <div>
                    <div
                      {...getRootProps()}
                      className={`relative border-2 border-dashed rounded-xl p-12 transition-colors ${
                        isCloning
                          ? 'cursor-not-allowed border-gray-100 bg-gray-50'
                          : 'cursor-pointer hover:border-gray-400 border-gray-200 bg-gray-50'
                      } ${
                        isDragActive && !isCloning
                          ? 'border-gray-900 bg-gray-100'
                          : ''
                      } ${fieldState.error ? 'border-red-500 bg-red-50' : ''}`}
                    >
                      <input {...getInputProps()} disabled={isCloning} />
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload
                          className={`w-10 h-10 mb-4 ${isCloning ? 'text-gray-300' : 'text-gray-400'}`}
                          strokeWidth={1.5}
                        />
                        <p className="text-gray-500 text-sm mb-1 font-medium">
                          {isCloning
                            ? 'Processing in background...'
                            : isDragActive
                              ? 'Drop the files here...'
                              : 'Drag & Drop or click to upload files'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          <strong>Note:</strong> Upload at least{' '}
                          <strong>100 {subModelType}</strong> for the best
                          result.
                        </p>
                      </div>
                    </div>
                    {/* Display uploaded files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 p-4 border rounded-lg bg-white">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Uploaded Files ({uploadedFiles.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {uploadedFiles.map((file: any, index) => (
                            <div
                              key={file.name + index}
                              className="relative group border border-gray-100 rounded-lg shadow-sm p-2 bg-white transition-shadow hover:shadow-md"
                            >
                              <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                                {file && typeof file === 'object' ? (
                                  <Image
                                    src={URL.createObjectURL(file)}
                                    fill
                                    alt={file.name || `uploaded-${index}`}
                                    className="object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-8 h-8 text-gray-300" />
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                disabled={isCloning}
                                className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 transition-opacity ${
                                  isCloning
                                    ? 'cursor-not-allowed'
                                    : 'group-hover:opacity-100 hover:bg-red-600'
                                }`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </form>
      </Form>
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="h-10 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
          disabled={isCloning}
        >
          Cancel
        </Button>
        <Button
          disabled={isPending}
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          className="h-11 px-8 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium"
        >
          Start Cloning
        </Button>
      </div>
    </div>
  );
}
