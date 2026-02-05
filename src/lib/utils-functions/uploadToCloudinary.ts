import { toast } from 'sonner';

// Generic upload function that detects input type
export const uploadToCloudinary = async (
  fileInput: File | string
): Promise<string> => {
  if (typeof fileInput === 'string') {
    if (fileInput.startsWith('blob:')) {
      return uploadVideoFromBlobUrl(fileInput);
    } else if (fileInput.startsWith('data:')) {
      return uploadImageFromBase64(fileInput);
    }
    throw new Error('Invalid string format. Expected blob: or data: URL');
  }

  if (fileInput instanceof File) {
    return uploadFileToCloudinary(fileInput);
  }

  throw new Error('Invalid input type');
};

// Upload file object (handles both images and videos)
export const uploadFileToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  const isVideo = file.type.startsWith('video/');
  const endpoint = isVideo ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    toast.error('Upload failed. Please try again.');
    throw error;
  }
};

// Upload video from blob URL
export const uploadVideoFromBlobUrl = async (
  blobUrl: string
): Promise<string> => {
  try {
    // Fetch the blob from the blob URL
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    // Create a File object from the blob
    const file = new File([blob], 'video.mp4', { type: blob.type });
    return await uploadFileToCloudinary(file);
  } catch (error) {
    console.error('Error processing blob URL:', error);
    toast.error('Video upload failed. Please try again.');
    throw error;
  }
};

// Upload image from base64 string
export const uploadImageFromBase64 = async (
  base64String: string
): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', base64String);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    toast.error('Image upload failed. Please try again.');
    throw error;
  }
};
