'use server';

import { google } from 'googleapis';
import { Readable } from 'stream';

// This is your central folder ID in Google Drive (e.g., "Website Uploads")
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

export async function uploadToDrive(formData: FormData) {
  try {
    // 1. Get data from the form (you can modify folder naming as needed)
    const folderName =
      (formData.get('folderName') as string) || `user-${Date.now()}`;
    const files = formData.getAll('files') as File[];

    // Basic validation
    if (files.length === 0) {
      throw new Error('No files selected for upload.');
    }

    // 2. Authenticate using OAuth 2.0 credentials for your central account
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    // Set the credentials using the refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });

    // Explicitly refresh the access token upfront
    await oauth2Client.refreshAccessToken();

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // 3. Create or find a user-specific folder inside your central ROOT_FOLDER_ID
    let userFolderId: string;

    // Search for an existing folder with the same name
    const existingFolder = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${encodeURIComponent(folderName)}' and '${ROOT_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (existingFolder.data.files && existingFolder.data.files.length > 0) {
      // Folder exists, use its ID
      userFolderId = existingFolder.data.files[0].id!;
    } else {
      // Create a new folder
      const createdFolder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [ROOT_FOLDER_ID],
        },
        fields: 'id',
      });
      userFolderId = createdFolder.data.id!;
    }

    // 4. Upload all files to the user's folder
    const uploadPromises = files.map(async (file) => {
      // Convert the File object to a readable stream for Google Drive
      const buffer = Buffer.from(await file.arrayBuffer());
      const stream = Readable.from(buffer);

      // Execute the upload
      const result = await drive.files.create({
        requestBody: {
          name: file.name,
          parents: [userFolderId],
        },
        media: {
          mimeType: file.type,
          body: stream,
        },
        fields: 'id, name, webViewLink',
      });

      return {
        id: result.data.id,
        name: result.data.name,
        webViewLink: result.data.webViewLink,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    // 5. Return success response
    return {
      success: true,
      message: `${files.length} file(s) uploaded successfully!`,
      folderName: folderName,
      folderId: userFolderId,
      files: uploadedFiles,
    };
  } catch (error: any) {
    // Log the error and return a user-friendly message
    console.log('Google Drive upload error:', JSON.stringify(error, null, 2));

    // Provide more specific error messages if possible
    let errorMessage = 'Upload failed due to a server error.';
    if (error.code === 400 && error.message.includes('invalid_request')) {
      errorMessage = 'Invalid or expired refresh token. Re-generate a new one.';
    } else if (error.code === 403) {
      errorMessage = 'Access denied. Please check Google Drive permissions.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}
