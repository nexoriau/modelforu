import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_DRIVE_CLIENT_SECRET?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const folderName =
      (formData.get('folderName') as string) || `user-${Date.now()}`;
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files' }, { status: 400 });
    }

    // Create or find user-specific folder
    let userFolderId: string;
    const existing = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${ROOT_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id)',
    });

    if (existing.data.files?.length) {
      userFolderId = existing.data.files[0].id!;
    } else {
      const folder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [ROOT_FOLDER_ID],
        },
        fields: 'id',
      });
      userFolderId = folder.data.id!;
    }

    // Upload all files
    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        const res = await drive.files.create({
          requestBody: { name: file.name, parents: [userFolderId] },
          media: { mimeType: file.type, body: stream },
          fields: 'id, webViewLink',
        });

        return { id: res.data.id, name: file.name, link: res.data.webViewLink };
      })
    );

    return NextResponse.json({
      success: true,
      folder: folderName,
      files: results,
    });
  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
