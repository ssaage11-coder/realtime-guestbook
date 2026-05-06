# Contract: Profile Data

## Purpose

Defines the data-level contract between the Next.js client and Supabase for the profile feature.

## Tables

### `profiles`

Required fields:

- `user_id`: authenticated user id; primary key.
- `nickname`: trimmed display name.
- `avatar_url`: nullable public avatar URL.
- `avatar_path`: nullable storage object path.
- `created_at`: creation timestamp.
- `updated_at`: last update timestamp.

Public display fields through a display-only read surface:

- `user_id`
- `nickname`
- `avatar_url`

Private/internal fields:

- `avatar_path`
- timestamps, unless needed by implementation diagnostics.

## Storage Objects

Profile avatar object path:

```text
{user_id}/profile/{timestamp-random}.{ext}
```

Allowed file types:

- `image/png`
- `image/jpeg`
- `image/webp`

Maximum file size:

- 2MB

## Read Contract

### Current user profile

Input:

- Current authenticated user id.

Result:

- Matching `profiles` row when present.
- Missing profile is not an error; UI displays default values.

### Author profiles for guestbook screens

Input:

- Distinct non-null author user ids from guestbook posts or comments.

Result:

- Public profile display map keyed by `user_id`, read from a display-only source such as `profile_public`.
- Missing map entries must fall back to default author display.
- Returned rows must not include `avatar_path`, `created_at`, or `updated_at`.

## Write Contract

### Create or update own profile

Input:

- `user_id`: current authenticated user id.
- `nickname`: trimmed 1-20 character string.
- Optional avatar fields after successful upload.

Result:

- Saved profile row.
- Failure if unauthenticated, nickname invalid, avatar invalid, or ownership does not match.

### Upload profile avatar

Input:

- Current authenticated user id.
- Valid image file.

Result:

- Public URL and object path.
- Failure if unauthenticated, file invalid, or path first segment does not match current user id.

## Authorization Contract

- Anyone can read only public author display fields required by guestbook screens.
- Only the owning authenticated user can insert, update, or delete their profile row.
- Only the owning authenticated user can write/delete avatar objects under their own user id prefix.
