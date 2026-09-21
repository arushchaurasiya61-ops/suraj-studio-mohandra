import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authClient } from '@/lib/supabase';
import { createAdminSession } from '@/lib/admin-session';

const schema = z.object({ email: z.string().email(), password: z.string().min(6).max(200) });

export async function POST(req: Request) {
  try {
    const { email, password } = schema.parse(await req.json());
    const supabase = authClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message || 'Invalid email or password.');

    const normalized = data.user.email?.toLowerCase() || '';
    const allowed = (process.env.ADMIN_EMAILS || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (!normalized || !allowed.includes(normalized)) return NextResponse.json({ error: 'This account is not an approved admin.' }, { status: 403 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set('ssm_admin_session', createAdminSession({ uid: data.user.id, email: normalized }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to login' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('ssm_admin_session', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
