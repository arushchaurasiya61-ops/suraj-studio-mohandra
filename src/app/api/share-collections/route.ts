import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '@/lib/supabase';
import { hasGalleryAccess } from '@/lib/gallery-access';

const schema = z.object({ eventId: z.string().uuid(), photoIds: z.array(z.string().min(1)).min(1).max(100) });

export async function POST(req: Request) {
  try {
    const d = schema.parse(await req.json());
    const { data: event, error: eventError } = await db().from('events').select('id,password_protected,allow_multi_photo_sharing').eq('id', d.eventId).maybeSingle();
    if (eventError) throw new Error(eventError.message);
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    if (!await hasGalleryAccess(d.eventId, event.password_protected)) return NextResponse.json({ error: 'Gallery authorization required.' }, { status: 401 });
    if (event.allow_multi_photo_sharing === false) return NextResponse.json({ error: 'Multiple photo sharing is disabled.' }, { status: 403 });

    const code = crypto.randomBytes(8).toString('base64url');
    const { error } = await db().from('share_collections').insert({ code, event_id: d.eventId, photo_ids: d.photoIds, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });
    if (error) throw new Error(error.message);
    return NextResponse.json({ code }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to share.' }, { status: 400 });
  }
}
