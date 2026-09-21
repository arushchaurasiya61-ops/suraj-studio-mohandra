import Link from 'next/link';
import { db } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-session';
import { GlassCard } from '@/components/GlassCard';

async function count(table: string) {
  const { count, error } = await db().from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

export default async function Admin() {
  const admin = await requireAdmin();
  const [events, photos, bookings, selections, drive] = await Promise.all([
    count('events'), count('photos'), count('bookings'), count('album_selections'),
    db().from('drive_connections').select('refresh_token').eq('user_id', admin.uid).maybeSingle(),
  ]);
  const driveConnected = Boolean(drive.data?.refresh_token);

  return (
    <>
      <div className="admin-page-head"><div><h1>Dashboard</h1><p className="muted">Suraj Studio Mohandra platform overview.</p></div><Link className="btn btn-primary" href="/admin/create-event">Create Event</Link></div>
      <div className="grid stats">
        {[["Total Events", events], ["Total Photos", photos], ["Bookings", bookings], ["Album Selections", selections]].map(([key, value]) => <GlassCard className="stat" key={String(key)}><span className="muted">{key}</span><br/><strong>{value}</strong></GlassCard>)}
      </div>
      <div className="section admin-section-tight">
        <GlassCard className="drive-dashboard-card">
          <div><span className={`status-dot ${driveConnected ? 'online' : ''}`} /><h3>Google Drive {driveConnected ? 'Connected' : 'Disconnected'}</h3><p className="muted">{driveConnected ? 'You can create events, choose Drive folders and sync galleries.' : 'Connect Drive before linking event folders.'}</p></div>
          <Link className="btn btn-ghost" href="/admin/google-drive">Manage Drive</Link>
        </GlassCard>
      </div>
    </>
  );
}
