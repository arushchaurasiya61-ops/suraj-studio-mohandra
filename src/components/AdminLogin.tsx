'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: String(form.get('email') || '').trim(),
          password: String(form.get('password') || ''),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="glass gold card form">
      <input className="input" type="email" name="email" placeholder="Admin email" autoComplete="email" required />
      <input className="input" type="password" name="password" placeholder="Password" autoComplete="current-password" required />
      <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
