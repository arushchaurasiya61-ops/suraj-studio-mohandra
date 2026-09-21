import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get('q') || '').trim();
  if (raw.length < 2) return NextResponse.json({ error: 'Enter at least 2 characters.' }, { status: 400 });
  const q = raw.replace(/[,%()]/g, ' ').trim();
  try {
    const { data, error } = await db().from('events')
      .select('slug,visibility')
      .or(`event_code.ilike.%${q}%,event_name.ilike.%${q}%,bride_name.ilike.%${q}%,groom_name.ilike.%${q}%,client_name.ilike.%${q}%`)
      .neq('visibility', 'private')
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return NextResponse.json({ error: 'No matching gallery found.' }, { status: 404 });
    return NextResponse.json({ slug: data.slug });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Search failed' }, { status: 500 });
  }
}
