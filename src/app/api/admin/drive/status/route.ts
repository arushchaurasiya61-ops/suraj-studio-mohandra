import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { db } from '@/lib/supabase';

export async function GET() {
  try {
    const admin = await requireAdmin();
    const { data, error } = await db().from('drive_connections').select('refresh_token,connected_at,updated_at').eq('user_id', admin.uid).maybeSingle();
    if (error) throw new Error(error.message);
    return NextResponse.json({ connected: Boolean(data?.refresh_token), connectedAt: data?.connected_at || null, updatedAt: data?.updated_at || null });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
