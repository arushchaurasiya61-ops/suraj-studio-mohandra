import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { oauthClient } from '@/lib/google-drive';
import { encryptText } from '@/lib/crypto';
import { db } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const adminUrl = new URL('/admin/google-drive', req.url);
  try {
    const admin = await requireAdmin();
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const expectedState = req.cookies.get('ssm_drive_oauth_state')?.value;
    if (!code) throw new Error('Missing OAuth code.');
    if (!state || !expectedState || state !== expectedState) throw new Error('Invalid OAuth state. Please reconnect.');

    const client = oauthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) throw new Error('Google did not return a refresh token. Remove prior app access in Google Account and reconnect.');

    const now = new Date().toISOString();
    const { error } = await db().from('drive_connections').upsert({
      user_id: admin.uid,
      refresh_token: encryptText(tokens.refresh_token),
      scope: tokens.scope || '',
      connected: true,
      connected_at: now,
      updated_at: now,
    }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);

    adminUrl.searchParams.set('connected', '1');
    const response = NextResponse.redirect(adminUrl);
    response.cookies.delete('ssm_drive_oauth_state');
    return response;
  } catch (error) {
    adminUrl.searchParams.set('error', error instanceof Error ? error.message : 'Drive connection failed');
    const response = NextResponse.redirect(adminUrl);
    response.cookies.delete('ssm_drive_oauth_state');
    return response;
  }
}
