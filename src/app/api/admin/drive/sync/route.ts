import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { db } from '@/lib/supabase';
import { getDriveForAdmin } from '@/lib/google-drive';
import { z } from 'zod';

const schema = z.object({ eventId: z.string().uuid() });
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const categoryFromPath = (path: string[]) => path.length ? path[path.length - 1] : 'Gallery';

export async function POST(req: Request) {
  let eventId = '';
  try {
    const admin = await requireAdmin();
    ({ eventId } = schema.parse(await req.json()));
    const { data: event, error: eventError } = await db().from('events').select('id,drive_folder_id').eq('id', eventId).maybeSingle();
    if (eventError) throw new Error(eventError.message);
    if (!event) throw new Error('Event not found.');
    if (!event.drive_folder_id) throw new Error('This event has no Google Drive folder selected.');

    await db().from('events').update({ sync_status: 'syncing', sync_error: null }).eq('id', eventId);
    const drive = await getDriveForAdmin(admin.uid);
    const discovered = new Set<string>();
    const rows: Record<string, unknown>[] = [];
    let foldersScanned = 0;

    async function scanFolder(parentId: string, path: string[], depth: number): Promise<void> {
      if (depth > 5) return;
      foldersScanned++;
      let pageToken: string | undefined;
      do {
        const response = await drive.files.list({
          q: `'${parentId.replaceAll("'", "\\'")}' in parents and trashed=false`,
          fields: 'nextPageToken,files(id,name,mimeType,imageMediaMetadata,createdTime,modifiedTime,size)',
          pageSize: 1000,
          pageToken,
        });
        for (const file of response.data.files || []) {
          if (!file.id || !file.name || !file.mimeType) continue;
          if (file.mimeType === FOLDER_MIME) {
            await scanFolder(file.id, [...path, file.name], depth + 1);
            continue;
          }
          if (!file.mimeType.startsWith('image/')) continue;
          discovered.add(file.id);
          rows.push({
            id: `${eventId}_${file.id}`,
            event_id: eventId,
            drive_file_id: file.id,
            file_name: file.name,
            mime_type: file.mimeType,
            public_photo_code: file.id.slice(-12),
            category: categoryFromPath(path),
            drive_path: path,
            width: file.imageMediaMetadata?.width || null,
            height: file.imageMediaMetadata?.height || null,
            size: file.size ? Number(file.size) : null,
            drive_created_at: file.createdTime || null,
            drive_modified_at: file.modifiedTime || null,
            active: true,
            created_at: file.createdTime || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        pageToken = response.data.nextPageToken || undefined;
      } while (pageToken);
    }

    await scanFolder(event.drive_folder_id, [], 0);
    for (let i = 0; i < rows.length; i += 300) {
      const { error } = await db().from('photos').upsert(rows.slice(i, i + 300), { onConflict: 'id' });
      if (error) throw new Error(error.message);
    }

    const { data: existing, error: existingError } = await db().from('photos').select('id,drive_file_id').eq('event_id', eventId);
    if (existingError) throw new Error(existingError.message);
    const staleIds = (existing || []).filter((p) => !discovered.has(p.drive_file_id)).map((p) => p.id);
    for (let i = 0; i < staleIds.length; i += 200) {
      const { error } = await db().from('photos').update({ active: false, updated_at: new Date().toISOString() }).in('id', staleIds.slice(i, i + 200));
      if (error) throw new Error(error.message);
    }

    const { error: updateError } = await db().from('events').update({
      photo_count: rows.length,
      last_synced_at: new Date().toISOString(),
      sync_status: 'ok',
      sync_error: null,
      folders_scanned: foldersScanned,
      updated_at: new Date().toISOString(),
    }).eq('id', eventId);
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ ok: true, photoCount: rows.length, foldersScanned, deactivated: staleIds.length });
  } catch (error) {
    if (eventId) await db().from('events').update({ sync_status: 'error', sync_error: error instanceof Error ? error.message : 'Sync failed', updated_at: new Date().toISOString() }).eq('id', eventId);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sync failed' }, { status: 400 });
  }
}
