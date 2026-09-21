import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase';
import { hasGalleryAccess } from '@/lib/gallery-access';

const schema = z.object({ eventId: z.string().uuid(), clientName: z.string().min(2).max(120), phone: z.string().min(8).max(20), photoIds: z.array(z.string()).min(1).max(500) });

export async function POST(req: Request) {
  try {
    const d = schema.parse(await req.json());
    const { data: event, error: eventError } = await db().from('events').select('id,password_protected').eq('id', d.eventId).maybeSingle();
    if (eventError) throw new Error(eventError.message);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    if (!await hasGalleryAccess(d.eventId, event.password_protected)) return NextResponse.json({ error: 'Gallery authorization required' }, { status: 401 });

    const { data, error } = await db().from('album_selections').insert({
      event_id: d.eventId,
      client_name: d.clientName,
      phone: d.phone,
      photo_ids: d.photoIds,
      photo_count: d.photoIds.length,
      status: 'submitted',
    }).select('id').single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to submit selection' }, { status: 400 });
  }
}
