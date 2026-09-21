'use client';

import { useState } from 'react';
import { DriveFolderPicker } from './DriveFolderPicker';

const toggles = [
  ['allowOptimizedDownload', 'Optimized Download', true],
  ['allowOriginalDownload', 'Original Download', false],
  ['allowSelectedDownload', 'Selected Download', true],
  ['allowBulkDownload', 'Bulk Download', false],
  ['allowGallerySharing', 'Gallery Sharing', true],
  ['allowPhotoSharing', 'Photo Sharing', true],
  ['allowMultiPhotoSharing', 'Multi-photo Sharing', true],
  ['allowQR', 'QR Sharing', true],
  ['watermarkEnabled', 'Gallery Watermark', true],
  ['sharedPreviewWatermark', 'Shared Preview Watermark', true],
] as const;

export function CreateEventForm() {
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [folder, setFolder] = useState({ id: '', name: '' });
  const [visibility, setVisibility] = useState('unlisted');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus('');
    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(form.entries());
    for (const [key] of toggles) body[key] = form.get(key) === 'on';

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create event');
      setStatus(`Event created: ${data.eventCode} • /gallery/${data.slug}`);
      e.currentTarget.reset();
      setFolder({ id: '', name: '' });
      setVisibility('unlisted');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to create event');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="glass gold card form event-form" onSubmit={submit}>
      <div className="form-grid two-col">
        <label>Event Name<input className="input" name="eventName" placeholder="Rahul & Priya Wedding" required /></label>
        <label>Client Name<input className="input" name="clientName" placeholder="Client name" required /></label>
        <label>Bride Name<input className="input" name="brideName" placeholder="Bride name" /></label>
        <label>Groom Name<input className="input" name="groomName" placeholder="Groom name" /></label>
        <label>Phone<input className="input" name="phone" inputMode="tel" placeholder="Mobile number" /></label>
        <label>WhatsApp<input className="input" name="whatsapp" inputMode="tel" placeholder="WhatsApp number" /></label>
        <label>Event Date<input className="input" type="date" name="eventDate" required /></label>
        <label>Event Type<input className="input" name="eventType" placeholder="Wedding / Pre-Wedding / Birthday" /></label>
        <label className="span-2">Location<input className="input" name="location" placeholder="Venue / city" /></label>
        <label className="span-2">Description<textarea className="input" name="description" rows={3} placeholder="Optional gallery description" /></label>
      </div>

      <div className="form-section">
        <h3>Gallery Access</h3>
        <div className="form-grid two-col">
          <label>Visibility
            <select className="input" name="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="password">Password Protected</option>
            </select>
          </label>
          {visibility === 'password' && <label>Gallery Password<input className="input" name="password" type="password" minLength={4} required placeholder="Set gallery password" /></label>}
        </div>
      </div>

      <DriveFolderPicker value={folder.id} folderName={folder.name} onChange={(id, name) => setFolder({ id, name })} />

      <div className="form-section">
        <h3>Downloads, Sharing & Watermark</h3>
        <div className="toggle-grid">
          {toggles.map(([name, label, defaultChecked]) => (
            <label className="toggle-row" key={name}>
              <input type="checkbox" name={name} defaultChecked={defaultChecked} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create Event'}</button>
      {status && <p className={status.startsWith('Event created') ? 'success' : 'error'}>{status}</p>}
    </form>
  );
}
