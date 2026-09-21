import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { listDriveFolders } from '@/lib/google-drive';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const parentId = req.nextUrl.searchParams.get('parentId') || 'root';
    const folders = await listDriveFolders(admin.uid, parentId);
    return NextResponse.json({ folders, parentId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load Drive folders' },
      { status: 400 },
    );
  }
}
