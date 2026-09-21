import { requireAdmin } from '@/lib/admin-session';
import { db } from '@/lib/supabase';
import { GlassCard } from '@/components/GlassCard';

export default async function GoogleDrivePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const admin = await requireAdmin();
  const { data, error: dbError } = await db().from('drive_connections').select('refresh_token,connected_at').eq('user_id', admin.uid).maybeSingle();
  if (dbError) throw new Error(dbError.message);
  const params = await searchParams;
  const connected = Boolean(data?.refresh_token);
  const success = params.connected === '1';
  const error = typeof params.error === 'string' ? params.error : '';

  return (
    <>
      <div className="admin-page-head"><div><h1>Google Drive</h1><p className="muted">Secure OAuth connection used for studio event folders and photo sync.</p></div></div>
      {success && <div className="notice success-notice">Google Drive connected successfully.</div>}
      {error && <div className="notice error-notice">{error}</div>}
      <div className="grid drive-status-grid">
        <GlassCard className="drive-status-card">
          <span className={`status-dot ${connected ? 'online' : ''}`} />
          <h3>{connected ? 'Drive Connected' : 'Drive Not Connected'}</h3>
          <p className="muted">{connected ? 'Refresh token is encrypted server-side. Event folders can now be selected and synced.' : 'Connect the Google account that owns or can access your Suraj Studio event folders.'}</p>
          {connected && data?.connected_at && <p className="tiny muted">Connected: {new Date(data.connected_at).toLocaleString('en-IN')}</p>}
          <a className="btn btn-primary" href="/api/drive/connect">{connected ? 'Reconnect Google Drive' : 'Connect Google Drive'}</a>
        </GlassCard>
        <GlassCard>
          <h3>Recommended Drive Structure</h3>
          <pre className="drive-tree">Suraj Studio Mohandra/{'\n'}└── Events/{'\n'}    └── Rahul-Priya-Wedding-2026/{'\n'}        ├── Wedding/{'\n'}        ├── Haldi/{'\n'}        ├── Mehndi/{'\n'}        └── Reception/</pre>
          <p className="muted tiny">The sync engine recursively scans event folders and uses the nearest folder name as the gallery category.</p>
        </GlassCard>
      </div>
    </>
  );
}
