# Suraj Studio Mohandra — V3

Firebase-free production foundation for the Suraj Studio Mohandra photography platform.

## V3 stack

- Next.js 16 + React + TypeScript
- Tailwind CSS 4 + existing Black/Gold Liquid Glass UI
- Supabase PostgreSQL database
- Supabase Auth for admin email/password accounts
- Server-issued signed admin session cookie
- Google Drive OAuth 2.0 for studio photo storage/sync
- Vercel-ready deployment
- GitHub-ready source repository

Firebase and Firestore are completely removed from V3.

## 1. Create Supabase

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Paste and run `supabase/schema.sql` once.
4. Open **Authentication -> Users** and create the admin email/password account.
5. Open **Project Settings -> API** and copy:
   - Project URL
   - anon/public key
   - service_role key (server secret; never expose it in browser code)

## 2. Environment setup

Copy `.env.example` to `.env.local`.

Required Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=your-admin-email@example.com
ADMIN_SESSION_SECRET=...
```

Generate `ADMIN_SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Generate Drive encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Generate gallery access secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Google Drive OAuth

Configure Google OAuth credentials and use this local callback exactly:

```text
http://localhost:3000/api/drive/callback
```

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and `DRIVE_TOKEN_ENCRYPTION_KEY` in `.env.local`.

## 4. Run locally

```bash
npm install
npm run dev
```

V3 intentionally uses Webpack for development because the target Windows PC previously failed to load Next.js native Turbopack/SWC bindings.

Open:

- `http://localhost:3000`
- `http://localhost:3000/admin/login`

## 5. Admin flow

1. Create admin user in Supabase Auth.
2. Put the exact same email in `ADMIN_EMAILS`.
3. Login at `/admin/login`.
4. Connect Google Drive at `/admin/google-drive`.
5. Create an event and select its Drive folder.
6. Open `/admin/events` and click **Sync Now**.

The Drive sync recursively indexes image files into PostgreSQL while keeping raw Drive URLs private.

## 6. GitHub + Vercel

Do not commit `.env.local`.

Push the project to GitHub, import the repository into Vercel, then add the same environment variables in **Vercel Project -> Settings -> Environment Variables**.

For production Google OAuth, add the Vercel production callback URL in Google Cloud and set:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
GOOGLE_REDIRECT_URI=https://your-domain.com/api/drive/callback
```

## Security notes

- Supabase `service_role` is server-only.
- All application tables have RLS enabled with no direct anonymous policies; public/client operations go through validated Next.js server routes.
- Google Drive refresh tokens are AES-256-GCM encrypted before database storage.
- Admin sessions are HttpOnly, SameSite=Lax, signed, short-lived cookies and are revalidated against the current Supabase Auth user.
- Gallery passwords are hashed with scrypt; plaintext passwords are never stored.
- `.env.local`, secrets and Google service credentials are excluded by `.gitignore`.
