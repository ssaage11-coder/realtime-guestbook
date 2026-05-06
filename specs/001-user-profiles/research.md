# Research: User Profiles

## Decision: Keep the current Next.js and Supabase stack

**Rationale**: The existing app already uses Next.js 14 App Router, TypeScript, TailwindCSS, Supabase Auth, Database, Storage, and Realtime. The user explicitly requested keeping the currently applied Next.js and Supabase setup. Reusing the current stack keeps implementation small and reduces regression risk for existing guestbook creation, listing, detail, comment, and realtime flows.

**Alternatives considered**:

- Add a separate backend API layer: Rejected because Supabase RLS can remain the authorization boundary and the current app already uses direct browser Supabase access.
- Introduce a new profile service: Rejected as unnecessary for a small owner-managed profile feature.

## Decision: Add a `profiles` table keyed by authenticated user id

**Rationale**: The PRD defines profiles as a one-to-one extension of the signed-in user. A `user_id` primary key keeps ownership checks simple and allows post/comment rows to resolve author display through their existing `user_id` values.

**Alternatives considered**:

- Store nickname/avatar in each post/comment: Rejected because profile changes should appear on subsequent loads without rewriting historical content.
- Store profile data only in auth metadata: Rejected because public guestbook screens need a controlled minimum public display surface.

## Decision: Public profile display reads use a display-only surface

**Rationale**: Guestbook list and comment screens are public in the current product. They need enough author data to render identity, but no private user information. The public display contract is limited to `user_id`, nickname, and avatar URL through a display-only read surface such as a `profile_public` view or equivalent constrained select contract. The underlying profile row still keeps `avatar_path` and timestamps for owner-managed profile editing.

**Alternatives considered**:

- Require login to view profiles: Rejected because the guestbook list/detail read experience is currently public.
- Expose email fallback publicly: Rejected because the PRD says email should not be the preferred display identity.
- Publicly select all `profiles` columns: Rejected because `avatar_path` and timestamps are not needed for public author display.

## Decision: Owner-only profile writes enforced by row ownership

**Rationale**: Users must only edit their own profile. Matching profile `user_id` to the authenticated user keeps insert/update/delete behavior testable and consistent with the existing post/comment ownership model.

**Alternatives considered**:

- Client-only ownership checks: Rejected because client checks are not sufficient as the final permission boundary.
- Admin-mediated profile edits: Rejected because the feature goal is self-service identity expression.

## Decision: Store avatars in the existing public image bucket under a user prefix

**Rationale**: Existing guestbook images already use a public Supabase Storage bucket with owner-prefixed paths. Reusing the bucket and path style keeps public rendering simple and keeps storage policies consistent. Profile avatars use `{user_id}/profile/{timestamp-random}.{ext}`.

**Alternatives considered**:

- Add a separate private avatar bucket: Rejected because it would require signed URL handling and adds complexity not needed for public author avatars.
- Store avatars as database blobs: Rejected because the app already uses Storage for images.

## Decision: Allow duplicate nicknames in the first release

**Rationale**: The PRD recommends duplicate nicknames initially. Duplicate display names are acceptable for a lightweight guestbook and avoid extra conflict UX during profile setup.

**Alternatives considered**:

- Enforce globally unique nicknames: Deferred because it requires additional validation, error handling, and case-insensitive uniqueness policy.

## Decision: Reflect profile changes on subsequent list/detail loads, not already-open screens

**Rationale**: The clarification decision limits first-release scope. Existing post/comment realtime behavior must stay live, but profile update propagation to already-open screens is not required.

**Alternatives considered**:

- Subscribe guestbook screens to profile updates: Rejected for first release because it adds realtime channel scope and more complex profile-map synchronization.
- Update only the current user's open screen immediately: Rejected to keep behavior consistent and simple.

## Decision: Keep `comments.author_name` for compatibility

**Rationale**: Existing comments already carry an author name. Keeping the field avoids migration risk and preserves readability for old rows. New comments can use the current profile nickname as the default author display name when available.

**Alternatives considered**:

- Remove `author_name`: Rejected because it would break historical data compatibility and require a broader migration.
