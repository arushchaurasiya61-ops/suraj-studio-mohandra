import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from './supabase';

export type AdminUser = { uid: string; email: string };

type SessionPayload = { uid: string; email: string; exp: number };

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  return value;
}

function sign(encoded: string) {
  return crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
}

export function createAdminSession(user: AdminUser, hours = 24) {
  const payload: SessionPayload = { ...user, exp: Date.now() + hours * 60 * 60 * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

function decodeAdminSession(token: string): SessionPayload | null {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const token = (await cookies()).get('ssm_admin_session')?.value;
  if (!token) throw new Error('UNAUTHENTICATED');
  const session = decodeAdminSession(token);
  if (!session) throw new Error('UNAUTHENTICATED');

  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes(session.email.toLowerCase())) throw new Error('FORBIDDEN');

  const { data, error } = await db().auth.admin.getUserById(session.uid);
  const email = data.user?.email?.toLowerCase() || '';
  if (error || !data.user || email !== session.email.toLowerCase() || !allowed.includes(email)) throw new Error('UNAUTHENTICATED');
  return { uid: session.uid, email };
}
