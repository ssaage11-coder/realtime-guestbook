# Contract: Profile UI

## `/profile`

### Access

- Logged-in users can view and save their profile.
- Logged-out users are guided to `/login?next=/profile`.

### Initial States

- Loading: show profile/session loading state.
- Existing profile: show saved nickname and current avatar preview.
- Missing profile: show default nickname/avatar display while allowing save to create a profile.
- Error: show a user-readable error and keep existing saved values intact.

### Inputs

- Nickname text input:
  - Required.
  - 1-20 visible characters after trimming.
  - Shows validation error for blank or too-long input.
- Avatar file input:
  - Accepts PNG, JPEG, WebP.
  - Maximum 2MB.
  - Shows local preview before save.

### Actions

- Save:
  - Disabled or guarded while unauthenticated, loading, or currently saving.
  - Uploads avatar first when a new avatar is selected.
  - Creates or updates the profile after validation.
  - Shows success or error state.

## Auth Status Area

### Signed in

- Prefer displaying profile nickname.
- Fall back to current email display when a profile nickname is not available.
- Provide a visible route to profile settings.
- Preserve logout behavior.

### Signed out

- Preserve login link behavior.

## Guestbook Post List

### Author Display

- Each post item shows author nickname and avatar.
- If no profile is available, show default nickname and default avatar.
- Existing post image, type, relative time, and detail navigation remain available.

### Realtime Behavior

- New guestbook posts still appear without page reload.
- Profile changes do not need to update already-open list screens in the first release.

## Post Detail and Comments

### Post Author Display

- The selected post can display author nickname/avatar when available.
- Missing author profile uses default display.

### Comment Author Display

- Each comment shows author nickname/avatar when profile data is available.
- If profile data is missing, use historical `author_name` when present and default avatar.
- If neither profile nor usable historical name is present, use default nickname and default avatar.

### Comment Form

- Logged-in users can write comments.
- When the current user's profile nickname exists, use it as the default author display name.
- If profile nickname is missing, keep a compatible fallback path so comment creation remains possible.
- Existing comment realtime insert behavior remains unchanged.
