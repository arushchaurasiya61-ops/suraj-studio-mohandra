import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { db } from '@/lib/supabase';
import { z } from 'zod';
import crypto from 'crypto';
import { hashPassword } from '@/lib/gallery-access';

const schema = z.object({
  eventName: z.string().min(2).max(120),
  brideName: z.string().max(80).optional().or(z.literal('')),
  groomName: z.string().max(80).optional().or(z.literal('')),
  clientName: z.string().min(2).max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  whatsapp: z.string().max(20).optional().or(z.literal('')),
  eventDate: z.string().min(8),
  eventType: z.string().max(80).optional().or(z.literal('')),
  location: z.string().max(180).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  visibility: z.enum(['public', 'unlisted', 'password']),
  password: z.string().max(100).optional().or(z.literal('')),
  driveFolderId: z.string().max(200).optional().or(z.literal('')),
  driveFolderName: z.string().max(200).optional().or(z.literal('')),
  allowOriginalDownload: z.boolean().optional(),
  allowOptimizedDownload: z.boolean().optional(),
  allowBulkDownload: z.boolean().optional(),
  allowSelectedDownload: z.boolean().optional(),
  allowGallerySharing: z.boolean().optional(),
  allowPhotoSharing: z.boolean().optional(),
  allowMultiPhotoSharing: z.boolean().optional(),
  allowQR: z.boolean().optional(),
  watermarkEnabled: z.boolean().optional(),
  sharedPreviewWatermark: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const { data, error } = await db().from('events').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return NextResponse.json({
      events: (data || []).map((e: any) => ({
        id: e.id,
        eventCode: e.event_code,
        eventName: e.event_name,
        clientName: e.client_name,
        brideName: e.bride_name || '',
        groomName: e.groom_name || '',
        eventDate: e.event_date,
        location: e.location || '',
        visibility: e.visibility,
        slug: e.slug,
        photoCount: e.photo_count || 0,
        syncStatus: e.sync_status || 'never',
        syncError: e.sync_error,
        driveFolderId: e.drive_folder_id || '',
        driveFolderName: e.drive_folder_name || '',
        lastSyncedAt: e.last_synced_at,
        
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const d = schema.parse(await req.json());
    if (d.visibility === 'password' && !d.password) throw new Error('Password is required for a password-protected gallery.');

    const { data: nextNumber, error: counterError } = await db().rpc('next_event_number');
    if (counterError) throw new Error(counterError.message);
    const n = Number(nextNumber || 1);
    const year = new Date(d.eventDate).getFullYear() || new Date().getFullYear();
    const eventCode = `SSM-${year}-${String(n).padStart(4, '0')}`;
    const suffix = crypto.randomBytes(4).toString('base64url').slice(0, 5).toUpperCase();
    const base = (d.brideName && d.groomName ? `${d.brideName}-${d.groomName}` : d.eventName)
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'event';
    const slug = `${base}-${suffix}`;
    const passwordSalt = d.visibility === 'password' ? crypto.randomBytes(16).toString('hex') : null;
    const passwordHash = d.visibility === 'password' && d.password ? hashPassword(d.password, passwordSalt!) : null;

    const { data, error } = await db().from('events').insert({
      event_code: eventCode,
      slug,
      event_name: d.eventName,
      client_name: d.clientName,
      bride_name: d.brideName || null,
      groom_name: d.groomName || null,
      phone: d.phone || null,
      whatsapp: d.whatsapp || null,
      event_date: d.eventDate,
      event_type: d.eventType || null,
      location: d.location || null,
      description: d.description || null,
      visibility: d.visibility,
      password_protected: d.visibility === 'password',
      password_salt: passwordSalt,
      password_hash: passwordHash,
      drive_folder_id: d.driveFolderId || null,
      drive_folder_name: d.driveFolderName || null,
      allow_original_download: d.allowOriginalDownload ?? false,
      allow_optimized_download: d.allowOptimizedDownload ?? true,
      allow_bulk_download: d.allowBulkDownload ?? false,
      allow_selected_download: d.allowSelectedDownload ?? true,
      allow_gallery_sharing: d.allowGallerySharing ?? true,
      allow_photo_sharing: d.allowPhotoSharing ?? true,
      allow_multi_photo_sharing: d.allowMultiPhotoSharing ?? true,
      allow_qr: d.allowQR ?? true,
      watermark_enabled: d.watermarkEnabled ?? true,
      shared_preview_watermark: d.sharedPreviewWatermark ?? true,
      photo_count: 0,
      sync_status: d.driveFolderId ? 'never' : 'not-linked',
    }).select('id').single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ id: data.id, eventCode, slug }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create event' }, { status: 400 });
  }
}
