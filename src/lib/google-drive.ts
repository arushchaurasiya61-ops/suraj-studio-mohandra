import { google, drive_v3 } from 'googleapis';
import { db } from './supabase';
import { decryptText } from './crypto';

export function oauthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export function driveAuthUrl(state: string) {
  return oauthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: true,
    state,
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

export async function getDriveForAdmin(uid: string): Promise<drive_v3.Drive> {
  const { data, error } = await db().from('drive_connections').select('refresh_token').eq('user_id', uid).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.refresh_token) throw new Error('Google Drive is not connected.');

  const client = oauthClient();
  client.setCredentials({ refresh_token: decryptText(data.refresh_token) });
  return google.drive({ version: 'v3', auth: client });
}

export async function listDriveFolders(uid: string, parentId = 'root') {
  const drive = await getDriveForAdmin(uid);
  const folders: Array<{ id: string; name: string }> = [];
  let pageToken: string | undefined;
  do {
    const response = await drive.files.list({
      q: `'${parentId.replaceAll("'", "\\'")}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'nextPageToken,files(id,name)',
      orderBy: 'name',
      pageSize: 1000,
      pageToken,
    });
    for (const folder of response.data.files || []) {
      if (folder.id && folder.name) folders.push({ id: folder.id, name: folder.name });
    }
    pageToken = response.data.nextPageToken || undefined;
  } while (pageToken);
  return folders;
}
