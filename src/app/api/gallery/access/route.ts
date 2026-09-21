import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase';
import { accessToken, verifyPassword } from '@/lib/gallery-access';

const schema = z.object({ eventId: z.string().uuid(), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  try {
    const d = schema.parse(await req.json());
    const { data: event, error } = await db().from('events').select('password_protected,password_salt,password_hash').eq('id', d.eventId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!event) return NextResponse.json({ error: 'Gallery not found.' }, { status: 404 });
    if (!event.password_protected) return NextResponse.json({ ok: true });
    if (!event.password_salt || !event.password_hash || !verifyPassword(d.password, event.password_salt, event.password_hash)) {
      return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(`gallery_access_${d.eventId}`, accessToken(d.eventId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60,
      path: '/',
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Access failed' }, { status: 400 });
  }
}
