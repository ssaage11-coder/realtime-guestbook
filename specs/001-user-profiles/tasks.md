# Tasks: User Profiles

**Input**: Design documents from `specs/001-user-profiles/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No separate automated test files are requested by the feature spec. Validation is handled through `npm run lint`, `npm run build`, and the manual checks in `quickstart.md`.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after shared foundations are complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and does not depend on an incomplete task.
- **[Story]**: User story label from `spec.md`.
- Every task includes an exact file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare configuration/documentation surfaces needed before profile work starts.

- [X] T001 Add or confirm `NEXT_PUBLIC_SUPABASE_BUCKET=guestbook-images` documentation in `.env.local.example`
- [X] T002 Create the profile route directory placeholder by adding `app/profile/.gitkeep`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schema, types, helpers, and profile data access required by all user stories.

**CRITICAL**: No user story implementation should begin until this phase is complete.

- [X] T003 Create profile schema, display-only `profile_public` read surface, constraints, RLS policies, and profile avatar Storage policies in `supabase/sql/003_profiles.sql`
- [X] T004 Add `Profile` and `AuthorProfileDisplay` TypeScript types in `lib/types.ts`
- [X] T005 Add default author display, avatar file validation, and profile avatar storage path helpers in `lib/helpers.ts`
- [X] T006 Create shared profile data helpers for current-profile lookup, profile upsert, and author profile map loading from the display-only public profile surface in `lib/profiles.ts`
- [X] T007 [P] Add hand-drawn default profile avatar asset in `public/default-avatar.svg`

**Checkpoint**: Profile schema/types/helpers are ready; user story work can proceed.

---

## Phase 3: User Story 1 - Set My Profile (Priority: P1) MVP

**Goal**: Logged-in users can create and update their nickname and profile image.

**Independent Test**: Log in, open `/profile`, save a valid nickname and optional avatar, leave and re-enter `/profile`, and confirm the saved values persist.

### Implementation for User Story 1

- [X] T008 [US1] Implement `/profile` session loading, logged-out redirect/link to `/login?next=/profile`, and missing-profile default display in `app/profile/page.tsx`
- [X] T009 [US1] Implement nickname input validation, trimming, save button states, success state, and error state in `app/profile/page.tsx`
- [X] T010 [US1] Implement PNG/JPEG/WebP avatar file selection, 2MB validation, preview, upload, public URL capture, and profile upsert in `app/profile/page.tsx`
- [X] T011 [US1] Ensure profile save failures preserve existing saved profile values and show user-readable errors in `app/profile/page.tsx`
- [X] T012 [US1] Update signed-in status to prefer profile nickname and expose a profile settings link in `components/auth-status.tsx`

**Checkpoint**: User Story 1 is functional and can be validated independently.

---

## Phase 4: User Story 2 - Identify Authors in Guestbook (Priority: P2)

**Goal**: Visitors can see profile nickname and avatar for guestbook posts and comments when profile data exists.

**Independent Test**: A user with a saved profile creates a post and a comment; the post list and detail screen display that nickname and avatar on subsequent load/re-entry.

### Implementation for User Story 2

- [X] T013 [US2] Load distinct post author profiles and render author nickname/avatar on post cards in `app/posts/page.tsx`
- [X] T014 [US2] Preserve existing `guestbook_posts` insert realtime handling while enriching newly inserted post cards with available author display data in `app/posts/page.tsx`
- [X] T015 [US2] Load the selected post author's profile and render author nickname/avatar near the post image in `app/posts/[id]/page.tsx`
- [X] T016 [US2] Load distinct comment author profiles and render nickname/avatar on comment items in `app/posts/[id]/page.tsx`
- [X] T017 [US2] Default the comment author display name from the current user's profile nickname when available in `app/posts/[id]/page.tsx`
- [X] T018 [US2] Preserve existing `comments` insert realtime handling while rendering new comments with available profile display data in `app/posts/[id]/page.tsx`

**Checkpoint**: User Story 2 is functional without requiring profile-update realtime subscriptions.

---

## Phase 5: User Story 3 - Show Defaults for Missing Profiles (Priority: P2)

**Goal**: Posts and comments remain readable with a default nickname and default avatar when profile data is absent.

**Independent Test**: View posts/comments where `user_id` is null, the profile row is missing, or `avatar_url` is null; default display appears and content remains readable.

### Implementation for User Story 3

- [X] T019 [US3] Apply default nickname/default avatar fallback for posts with missing profile data in `app/posts/page.tsx`
- [X] T020 [US3] Apply default nickname/default avatar fallback for selected post author display in `app/posts/[id]/page.tsx`
- [X] T021 [US3] Apply comment fallback order of profile nickname/avatar, historical `author_name`, then default nickname/default avatar in `app/posts/[id]/page.tsx`
- [X] T022 [US3] Verify post/comment body rendering remains intact when profile lookup fails or returns no rows in `app/posts/[id]/page.tsx`

**Checkpoint**: User Story 3 keeps old and incomplete data visually consistent.

---

## Phase 6: User Story 4 - Protect Profile Ownership (Priority: P3)

**Goal**: Users can modify only their own profile and cannot write avatar files under another user's prefix.

**Independent Test**: With users A and B, attempts by A to update B's profile row or upload under B's storage prefix fail and leave B's profile unchanged.

### Implementation for User Story 4

- [X] T023 [US4] Confirm `profiles` owner-only insert/update/delete policies reject mismatched `user_id` values and public reads expose only display fields in `supabase/sql/003_profiles.sql`
- [X] T024 [US4] Confirm profile avatar Storage write/delete policies reject paths whose first segment differs from the authenticated user id in `supabase/sql/003_profiles.sql`
- [X] T025 [US4] Ensure `/profile` always uses the authenticated user id for profile upsert and avatar path generation in `app/profile/page.tsx`
- [X] T026 [US4] Ensure profile save errors for authentication, authorization, and Storage policy failures are shown without exposing sensitive token or account details in `app/profile/page.tsx`

**Checkpoint**: User Story 4 is enforceable by Supabase policies and reflected in the profile UI.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate integration quality and update durable project memory.

- [X] T027 [P] Update architecture notes for `/profile`, `profiles`, author display, and avatar Storage strategy in `memory-bank/architecture.md`
- [X] T028 [P] Update profile PRD status or implementation notes if scope changed during implementation in `memory-bank/profile-prd.md`
- [X] T029 Update implementation progress and validation results in `memory-bank/progress.md`
- [X] T030 Run lint validation using the `npm run lint` script defined in `package.json`
- [X] T031 Run production build validation using the `npm run build` script defined in `package.json`
- [ ] T032 Execute timed subsequent-load profile reflection check for the 2-second success criterion from `specs/001-user-profiles/quickstart.md`
- [ ] T033 Execute manual profile, author-display usability, privacy, and realtime regression checks from `specs/001-user-profiles/quickstart.md`

### Phase 7 Validation Notes

- 2026-05-06: Local dev server started at `http://localhost:3000`; `/profile` and `/posts` returned HTTP 200.
- 2026-05-06: `npm run lint` and `npm run build` passed after the profile implementation.
- 2026-05-06: Supabase anon read check confirmed the remote project does not yet have `public.profiles` or `public.profile_public` in the schema cache.
- T032 is blocked until `supabase/sql/003_profiles.sql` is applied to the Supabase project and at least one profile update can be saved.
- T033 is partially blocked until the same SQL is applied and two authenticated test users are available for owner-policy, Storage-prefix, privacy, and realtime regression checks.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational; MVP.
- **US2 (Phase 4)**: Depends on Foundational and is more useful after US1, because profile data must exist to display real author identity.
- **US3 (Phase 5)**: Depends on Foundational; can be implemented alongside US2 after shared display helpers exist.
- **US4 (Phase 6)**: Depends on Foundational and should be verified before release.
- **Polish (Phase 7)**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 - Set My Profile**: No dependency on other user stories after Foundational.
- **US2 - Identify Authors in Guestbook**: Uses profile data created by US1 for end-to-end validation, but the display code can be built independently with seeded profile rows.
- **US3 - Show Defaults for Missing Profiles**: Can be built independently after Foundational using missing/null profile data.
- **US4 - Protect Profile Ownership**: Can be validated independently with two authenticated users after schema/policies and `/profile` save flow exist.

### Within Each User Story

- Shared types/helpers before UI work.
- Schema and RLS before relying on profile save behavior.
- Profile lookup helpers before author display integration.
- UI validation before manual acceptance checks.
- Story checkpoint validation before moving to lower-priority stories when working sequentially.

### Parallel Opportunities

- T007 can run in parallel with SQL/type/helper work because it only creates `public/default-avatar.svg`.
- After T003-T006 complete, US1 UI work and US2/US3 read-display work can proceed in parallel if seeded profile data is available.
- T013/T014 and T015/T016 can be split by route after shared profile helpers exist.
- T027 and T028 can run in parallel during polish because they update different memory-bank files.

---

## Parallel Example: User Story 2

```text
Task: "Load distinct post author profiles and render author nickname/avatar on post cards in app/posts/page.tsx"
Task: "Load the selected post author's profile and render author nickname/avatar near the post image in app/posts/[id]/page.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Apply default nickname/default avatar fallback for posts with missing profile data in app/posts/page.tsx"
Task: "Apply comment fallback order of profile nickname/avatar, historical author_name, then default nickname/default avatar in app/posts/[id]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup.
2. Complete Phase 2 Foundational tasks.
3. Complete Phase 3 User Story 1.
4. Stop and validate `/profile` creation/update independently.

### Incremental Delivery

1. Deliver US1 so users can create profile data.
2. Deliver US2 so profile data appears in guestbook author displays.
3. Deliver US3 so missing/old profile data has stable default display.
4. Deliver US4 ownership hardening before release.
5. Run polish validation and update memory-bank state.

### Notes

- Keep the current Next.js and Supabase stack.
- Do not add profile-update realtime subscriptions in the first release.
- Preserve existing post and comment realtime subscriptions and channel cleanup.
- Do not remove `comments.author_name`; keep it for historical fallback.
- Avoid service role keys in browser code.
