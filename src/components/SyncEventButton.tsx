'use client';

import { useState } from 'react';

export function SyncEventButton({ eventId, disabled = false }: { eventId: string; disabled?: boolean }) {
  const [state, setState] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function sync() {
    setState('syncing');
    setMessage('');
    try {
      const response = await fetch('/api/admin/drive/sync', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Sync failed');
      setState('done');
      setMessage(`${data.total} photos • ${data.foldersScanned} folders`);
      window.setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Sync failed');
    }
  }

  return (
    <div className="sync-action">
      <button className="btn btn-ghost small-btn" type="button" onClick={sync} disabled={disabled || state === 'syncing'}>
        {state === 'syncing' ? 'Syncing…' : 'Sync Now'}
      </button>
      {message && <small className={state === 'error' ? 'error' : 'muted'}>{message}</small>}
    </div>
  );
}
