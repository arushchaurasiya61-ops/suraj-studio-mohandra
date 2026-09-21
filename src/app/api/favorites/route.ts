import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase';
import { hasGalleryAccess } from '@/lib/gallery-access';

const schema = z.object({ eventId: z.string().uuid(), photoId: z.string(), clientKey: z.string().min(8).max(100), favorite: z.boolean() });

export async function POST(req: Request) {
  try {
    const d = schema.parse(await req.json());
    const { data: event, error: eventError } = await db().from('events').select('id,password_protected').eq('id', d.eventId).maybeSingle();
    if (eventError) throw new Error(eventError.message);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    if (!await hasGalleryAccess(d.eventId, event.password_protected)) return NextResponse.json({ error: 'Gallery authorization required' }, { status: 401 });

    const id = `${d.eventId}_${d.clientKey}_${d.photoId}`;
    if (d.favorite) {
      const { error } = await db().from('favorites').upsert({ id, event_id: d.eventId, photo_id: d.photoId, client_key: d.clientKey });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await db().from('favorites').delete().eq('id', id);
      if (error) throw new Error(error.message);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Favorite failed' }, { status: 400 });
  }
}
