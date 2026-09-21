import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { driveAuthUrl } from '@/lib/google-drive';

export async function GET() {
  try {
    await requireAdmin();
    const state = crypto.randomBytes(32).toString('hex');
    const response = NextResponse.redirect(driveAuthUrl(state));
    response.cookies.set('ssm_drive_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    });
    return response;
  } catch {
    return NextResponse.redirect(
      new URL('/admin/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    );
  }
}
