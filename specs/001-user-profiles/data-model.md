# Data Model: User Profiles

## Profile

Represents public display information for one signed-in user.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `user_id` | `uuid` | Yes | Primary key; references the authenticated user; one profile per user |
| `nickname` | `text` | Yes | Trimmed display name, 1-20 visible characters |
| `avatar_url` | `text` | No | Public URL for the current profile image |
| `avatar_path` | `text` | No | Storage object path for the current profile image |
| `created_at` | `timestamptz` | Yes | Set when the profile is created |
| `updated_at` | `timestamptz` | Yes | Updated whenever profile fields change |

### Validation Rules

- `nickname` must be trimmed before save.
- `nickname` must not be empty after trimming.
- `nickname` length must be between 1 and 20 visible characters.
- Duplicate nicknames are allowed in the first release.
- `avatar_url` and `avatar_path` are nullable.
- Profile image uploads accept PNG, JPEG, and WebP only.
- Profile image uploads must be 2MB or smaller.
- Profile image paths use `{user_id}/profile/{timestamp-random}.{ext}`.

### Authorization Rules

- Public readers may access only `user_id`, `nickname`, and `avatar_url` through a display-only profile read surface.
- A logged-in user may insert, update, or delete only the profile whose `user_id` matches their own user id.
- A logged-in user may write avatar files only under their own first path segment.

### Lifecycle

```text
Missing profile
  -> profile screen shows default nickname/avatar
  -> user saves valid nickname and optional avatar
Created profile
  -> user edits nickname and/or avatar
Updated profile
  -> subsequent guestbook list/detail loads display new profile fields
```

## Guestbook Post

Existing entity representing a drawing or photo post.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `uuid` | Yes | Primary key |
| `user_id` | `uuid` | No | Existing nullable author link for compatibility with old rows |
| `image_url` | `text` | Yes | Public image URL |
| `image_path` | `text` | Yes | Storage object path |
| `image_type` | `drawing` or `photo` | Yes | Existing post image type |
| `created_at` | `timestamptz` | Yes | Post creation time |

### Profile Display Relationship

- When `user_id` matches a profile, display that profile's nickname and avatar.
- When `user_id` is null, the profile is missing, or the avatar is null, use default author display as specified in the feature spec.
- Post creation and realtime insert behavior remain unchanged except for the author display enrichment on reads.

## Public Profile Display

Read-only author display shape used by public guestbook screens.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `user_id` | `uuid` | Yes | Key used to match posts/comments to profiles |
| `nickname` | `text` | Yes | Public display name |
| `avatar_url` | `text` | No | Public avatar URL; null falls back to default avatar |

### Privacy Rules

- Public guestbook screens must not require or expose `avatar_path`.
- Public guestbook screens must not expose profile timestamps.
- Owner profile editing can still read the full profile row for the current user.

## Comment

Existing entity representing a reply to a guestbook post.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `uuid` | Yes | Primary key |
| `post_id` | `uuid` | Yes | References the guestbook post |
| `user_id` | `uuid` | No | Existing nullable author link for compatibility with old rows |
| `author_name` | `text` | Yes | Retained for historical compatibility and fallback display |
| `content` | `text` | Yes | Comment body |
| `created_at` | `timestamptz` | Yes | Comment creation time |

### Profile Display Relationship

- New comment forms default the author display name from the current user's profile nickname when available.
- Comment lists prefer profile nickname/avatar when `user_id` resolves to a profile.
- If no profile exists, display `author_name` when usable, otherwise the default nickname and default avatar.

## TypeScript Type Additions

```ts
export interface Profile {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthorProfileDisplay {
  user_id: string | null;
  nickname: string;
  avatar_url: string | null;
}
```
