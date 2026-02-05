// export const imageToBase64 = async (file: File): Promise<string> => {
//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);
//   return `data:${file.type};base64,${buffer.toString('base64')}`;
// };

export const urlToBase64 = async (imageUrl: string): Promise<string> => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/png';

  const base64 = buffer.toString('base64');

  return `data:${contentType};base64,${base64}`;
};
