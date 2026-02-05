'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import {
  CreatePhotoVideoAudioSchema,
  CreatePhotoVideoAudioSchemaType,
  SubModelTableType,
} from '@/db/schema/sub-model';
import { zodResolver } from '@hookform/resolvers/zod';
import { Music, Upload, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  createSubModel,
  updateSubModel,
} from '../_services/sub-model/subModel.actions';
import { useCreateNotification } from '@/app/_others/notification/actions/use-notification.action';
import { uploadToDrive } from '@/lib/utils-functions/upload-to-drive';

type Props = {
  subModelDataById?: SubModelTableType;
  modelName: string;
};

export default function CreateAudioModel({
  subModelDataById,
  modelName,
}: Props) {
  const initialValue = {
    description: subModelDataById ? subModelDataById.description : '',
    audioFiles: [],
  };
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const { currentUser } = useAuth();
  const [isPending, startTransition] = useTransition();
  const createNotification = useCreateNotification();
  const router = useRouter();
  const params = useParams();

  const form = useForm<CreatePhotoVideoAudioSchemaType>({
    resolver: zodResolver(CreatePhotoVideoAudioSchema),
    defaultValues: initialValue,
  });

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = [...uploadedFiles, ...acceptedFiles];
    setUploadedFiles(newFiles);
    form.setValue('items', newFiles, { shouldValidate: true });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav', '.wave', '.x-wav'],
      'audio/ogg': ['.ogg'],
      'audio/flac': ['.flac'],
      'audio/m4a': ['.m4a'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    form.setValue('items', newFiles, { shouldValidate: true });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const onSubmit = async (values: CreatePhotoVideoAudioSchemaType) => {
    if (!currentUser) {
      toast.error('User not found');
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one audio file');
      return;
    }

    startTransition(async () => {
      try {
        toast.loading('Uploading audio files...');

        // Unique folder name per user + model + type
        const folderName = `${currentUser.name || currentUser.id}-${modelName}-audio`;

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
        toast.success('Audios uploaded successfully!');

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
            type: 'audio',
            itemsLength: uploadedFiles.length,
            status: 'pending',
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
    <div className="w-full">
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-6">
          <div className="grid grid-cols-1 gap-6 place-items-start">
            {/* Description Textarea field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-semibold text-gray-900">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter description"
                      className="bg-gray-50 min-h-[100px] border-gray-200 rounded-lg placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Upload Audio Files Section */}
          <FormField
            control={form.control}
            name="items"
            render={() => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-900">
                  Upload Audio Files
                </FormLabel>
                <FormControl>
                  <div>
                    <div
                      {...getRootProps()}
                      className={`relative border-2 border-dashed rounded-xl p-12 transition-colors cursor-pointer ${
                        isDragActive
                          ? 'border-gray-900 bg-gray-100'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center justify-center text-center">
                        <Upload
                          className="w-10 h-10 text-gray-300 mb-4"
                          strokeWidth={1.5}
                        />
                        <p className="text-gray-400 text-sm mb-1">
                          {isDragActive
                            ? 'Drop the audio files here...'
                            : 'Drag & Drop and voice to clone voices'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          <strong>Note:</strong> Upload at least{' '}
                          <strong>100 audio</strong> for the best result.
                        </p>
                      </div>
                    </div>

                    {/* Display uploaded files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Uploaded Files ({uploadedFiles.length})
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="relative group bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="shrink-0 w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                  <Music className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(file.size)}
                                    </p>
                                    <span className="text-xs text-gray-400">
                                      •
                                    </span>
                                    <p className="text-xs text-gray-500">
                                      {file.type.split('/')[1]?.toUpperCase() ||
                                        'N/A'}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="shrink-0 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Status Message */}
      {isCloning && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            Cloning started. You will be notified when the model is ready
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="h-11 px-8 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
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
