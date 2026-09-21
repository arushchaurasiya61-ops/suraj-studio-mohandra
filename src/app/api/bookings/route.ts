import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase';

const schema = z.object({
  name: z.string().min(2).max(120),
  mobile: z.string().min(8).max(20),
  whatsapp: z.string().max(20).optional(),
  email: z.union([z.string().email(), z.literal('')]).optional(),
  eventType: z.string().min(2).max(120),
  eventDate: z.string().min(8),
  location: z.string().min(2).max(200),
  budget: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const d = schema.parse(await req.json());
    const { error } = await db().from('bookings').insert({
      name: d.name,
      mobile: d.mobile,
      whatsapp: d.whatsapp || null,
      email: d.email || null,
      event_type: d.eventType,
      event_date: d.eventDate,
      location: d.location,
      budget: d.budget || null,
      message: d.message || null,
      status: 'new',
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid request' }, { status: 400 });
  }
}
