/**
 * File Utilities
 *
 * Helper functions for file naming and download URL generation.
 * Used primarily for downloading generated images and videos from Cloudinary.
 */

/**
 * Generates a unique filename for downloaded files
 *
 * Creates timestamped filenames to prevent collisions and identify file type.
 *
 * @param url - Original file URL (used to extract extension)
 * @param type - Type of content (e.g., 'image', 'video')
 * @returns Generated filename with timestamp
 *
 * @example
 * getFileName('https://example.com/image.png', 'image')
 * // "Modelforyu-image-1706438400000.png"
 */
export function getFileName(url: string, type: string) {
  const ext = url.split(".").pop(); // Extract file extension
  const fileName = `Modelforyu-${type}-${Date.now()}.${ext}`;
  return fileName;
}

/**
 * Generates Cloudinary download URL with attachment flag
 *
 * Adds Cloudinary transformation parameter to force file download
 * instead of displaying in browser.
 *
 * @param url - Original Cloudinary URL
 * @param filename - Desired filename for download
 * @returns Modified URL with download parameter
 *
 * @example
 * getDownloadUrl('https://res.cloudinary.com/...', 'my-image.png')
 * // "https://res.cloudinary.com/...?fl_attachment=my-image.png"
 */
export function getDownloadUrl(url: string, filename: string) {
  return `${url}?fl_attachment=${filename}`;
}
