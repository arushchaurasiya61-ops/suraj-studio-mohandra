'use client';

import { useEffect, useState } from 'react';

type Folder = { id: string; name: string };

type Props = {
  value: string;
  folderName: string;
  onChange: (id: string, name: string) => void;
};

export function DriveFolderPicker({ value, folderName, onChange }: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [parentId, setParentId] = useState('root');
  const [trail, setTrail] = useState<Array<{ id: string; name: string }>>([{ id: 'root', name: 'My Drive' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load(id: string) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/drive/folders?parentId=${encodeURIComponent(id)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load Drive folders');
      setFolders(data.folders || []);
      setParentId(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load Drive folders');
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load('root');
  }, []);

  function open(folder: Folder) {
    setTrail((current) => [...current, folder]);
    load(folder.id);
  }

  function jump(index: number) {
    const target = trail[index];
    setTrail((current) => current.slice(0, index + 1));
    load(target.id);
  }

  return (
    <div className="drive-picker glass">
      <div className="drive-picker-head">
        <div>
          <strong>Google Drive Event Folder</strong>
          <div className="muted tiny">Select the folder that contains this event&apos;s photos and category folders.</div>
        </div>
        {value ? <span className="status-chip success-chip">Selected</span> : <span className="status-chip">Not selected</span>}
      </div>

      <div className="breadcrumbs">
        {trail.map((item, index) => (
          <button type="button" key={`${item.id}-${index}`} onClick={() => jump(index)}>
            {item.name}
          </button>
        ))}
      </div>

      {error && <p className="error">{error} — Connect Drive from Admin → Google Drive.</p>}
      {loading ? <p className="muted">Loading folders…</p> : (
        <div className="folder-list">
          {folders.length === 0 && !error && <div className="muted">No child folders here.</div>}
          {folders.map((folder) => (
            <div className="folder-row" key={folder.id}>
              <button type="button" className="folder-open" onClick={() => open(folder)}>📁 {folder.name}</button>
              <button type="button" className="btn btn-ghost small-btn" onClick={() => onChange(folder.id, folder.name)}>Select</button>
            </div>
          ))}
        </div>
      )}

      {value && (
        <div className="selected-folder">
          <span>Selected: <strong>{folderName || value}</strong></span>
          <button type="button" className="text-button" onClick={() => onChange('', '')}>Clear</button>
        </div>
      )}
      <input type="hidden" name="driveFolderId" value={value} readOnly />
      <input type="hidden" name="driveFolderName" value={folderName} readOnly />
      <input type="hidden" value={parentId} readOnly aria-hidden="true" />
    </div>
  );
}
