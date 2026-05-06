# Quickstart: User Profiles

## Prerequisites

- Existing app dependencies installed with `npm install`.
- `.env.local` contains:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_BUCKET=guestbook-images
```

- Supabase Auth email/password provider and redirect URLs are configured.
- Existing guestbook migrations have been applied before the profile migration.

## Implementation Order

1. Add a new Supabase SQL migration, expected as `supabase/sql/003_profiles.sql`.
2. Add `Profile` and author display types in `lib/types.ts`.
3. Add helper logic for avatar validation, default author display, and profile avatar storage paths.
4. Add `/profile` route with nickname/avatar form, preview, loading, success, and error states.
5. Update `AuthStatus` to prefer nickname and link to profile settings.
6. Update `/posts` to load author profiles for visible posts and show nickname/avatar with default fallback.
7. Update `/posts/[id]` to load author profiles for the post and comments, default comment author name from profile nickname, and preserve existing comment behavior.
8. Verify existing post/comment realtime subscriptions still work and are cleaned up on unmount.
9. Run validation commands and manual browser checks.

## Suggested SQL Migration Scope

`003_profiles.sql` should cover:

- Create `public.profiles`.
- Create a display-only public profile read surface such as `public.profile_public` with only `user_id`, `nickname`, and `avatar_url`.
- Add nickname length/blank checks.
- Maintain `updated_at`.
- Enable RLS on `profiles`.
- Public select for minimum display fields.
- Owner-only insert/update/delete.
- Storage write/delete policies for `{user_id}/profile/...` paths in `guestbook-images`.
- Avoid `alter table storage.objects enable row level security` because Supabase manages that table.

## Validation Commands

```bash
npm run lint
npm run build
```

## Manual Validation

1. Logged-out user visits `/profile` and is guided to `/login?next=/profile`.
2. User A saves nickname only; profile screen reload shows saved nickname and default avatar.
3. User A uploads a valid PNG/JPEG/WebP avatar under 2MB; preview and saved avatar render.
4. Invalid nickname, unsupported image type, and image over 2MB produce user-readable errors.
5. User A cannot modify User B's profile or upload into User B's storage prefix.
6. Guestbook list shows author nickname/avatar for posts with profiles.
7. Guestbook list shows default nickname/avatar for posts without profiles.
8. Post detail comments show profile nickname/avatar when available and preserve historical `author_name` fallback.
9. Creating a post in one browser still appears in another browser without reload.
10. Creating a comment in one browser still appears in another browser without reload.
11. Changing a profile appears on subsequent list/detail load or re-entry; already-open screens are not required to update immediately.
12. Public author profile reads do not expose `avatar_path`, `created_at`, or `updated_at`.
13. A quick author-display usability check confirms users can identify where the author nickname/avatar appears on a post or comment.
