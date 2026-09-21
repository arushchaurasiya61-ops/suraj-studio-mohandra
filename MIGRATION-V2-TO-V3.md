# V2 -> V3 migration

V3 does not use your old Firebase `.env.local` values.

## Do this

1. Extract V3 into a new folder. Do not overwrite V2 until V3 is tested.
2. Create a Supabase project.
3. Run `supabase/schema.sql` in Supabase SQL Editor.
4. In Supabase Authentication -> Users, create the admin email/password user.
5. Copy `.env.example` to `.env.local`.
6. Fill the Supabase URL, anon key, service-role key and exact admin email.
7. Generate `ADMIN_SESSION_SECRET`, `DRIVE_TOKEN_ENCRYPTION_KEY`, and `GALLERY_ACCESS_SECRET` using the commands in README.
8. Copy only your Google OAuth values from V2 if they are still valid.
9. Run `npm install` and `npm run dev`.
10. Login at `/admin/login`, connect Google Drive again, then create/sync an event.

## Important

Firebase Auth users and Firestore data are not automatically copied to Supabase. V3 starts with the Supabase database you create from `supabase/schema.sql`.

Never copy `FIREBASE_*` values into V3. Never expose `SUPABASE_SERVICE_ROLE_KEY`, Google client secret, Drive encryption key, or admin session secret in browser code or GitHub.
