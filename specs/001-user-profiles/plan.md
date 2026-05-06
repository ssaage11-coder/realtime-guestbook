# Implementation Plan: User Profiles

**Branch**: `002-user-profiles` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-user-profiles/spec.md`

**Note**: The automated PowerShell setup script could not run in this Linux environment because `pwsh` is not installed. The plan file was created with the same resolved paths from `.specify/feature.json`.

## Summary

Add user profile support to the existing realtime guestbook. Logged-in users can set a nickname and avatar, public guestbook post/comment displays use those profile fields when available, missing profiles fall back to default author display, and profile edits are limited to the owning user. The implementation keeps the current Next.js 14 App Router, TypeScript, TailwindCSS, Supabase Database, Supabase Storage, and Supabase Realtime stack.

The first profile release does not subscribe open guestbook screens to profile-update events. Profile changes must appear on subsequent list/detail loads or re-entry while existing post/comment realtime behavior remains unchanged.

## Technical Context

**Language/Version**: TypeScript 5.6.3, React 18.3.1, Next.js 14.2.33  
**Primary Dependencies**: `next`, `react`, `react-dom`, `@supabase/supabase-js`, TailwindCSS  
**Storage**: Supabase Postgres tables plus public Supabase Storage bucket `guestbook-images`  
**Testing**: `npm run lint`, `npm run build`, browser-based validation of auth, profile save, post/comment display, and realtime guestbook flows  
**Target Platform**: Browser web app served by Next.js App Router  
**Project Type**: Single Next.js web application with Supabase backend services  
**Performance Goals**: Profile save completes within 60 seconds for 95% of valid attempts; changed profile data appears on subsequently loaded list/detail screens within 2 seconds under normal network conditions  
**Constraints**: Preserve existing routes and realtime post/comment subscriptions; no polling or manual refresh for existing post/comment live updates; profile image uploads limited to PNG/JPEG/WebP and 2MB; public author display reads from a display-only profile surface exposing only `user_id`, `nickname`, and `avatar_url`  
**Scale/Scope**: One new profile route, one profile data model, one profile image path convention, author display integration on post list and comment detail screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file still contains template placeholders and does not define enforceable gates. Project-level requirements from `AGENTS.md` and `memory-bank/` are used as active gates for this plan:

- Keep the existing required stack: PASS.
- Use Supabase Realtime for existing realtime guestbook behavior and avoid polling/manual refresh for posts/comments: PASS.
- Keep first screen as the actual guestbook registration experience, not a landing page: PASS.
- Preserve current hand-drawn white-background visual direction: PASS.
- Define Supabase data types clearly in TypeScript: PASS.
- Clean up realtime channels on unmount: PASS for existing channels; no new profile realtime channel is planned for this release.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-profiles/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── profile-data.md
│   └── profile-ui.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
app/
├── login/page.tsx
├── page.tsx
├── posts/
│   ├── page.tsx
│   └── [id]/page.tsx
└── profile/
    └── page.tsx

components/
├── auth-status.tsx
└── drawing-board.tsx

lib/
├── helpers.ts
├── supabase.ts
└── types.ts

supabase/sql/
├── 001_init_guestbook.sql
├── 002_auth_rls_guestbook.sql
└── 003_profiles.sql
```

**Structure Decision**: Keep the existing single Next.js App Router structure. Add `/profile` as a route-level client experience, extend shared types/helpers in `lib/`, update existing post/comment screens in place, and add a new SQL migration for profile schema, policies, and storage constraints.

## Complexity Tracking

No constitution violations or complexity exceptions are required.

## Phase 0: Research Summary

See [research.md](./research.md).

Key decisions:

- Create `profiles` keyed by the authenticated user id.
- Use a public display-only profile read surface for `user_id`, `nickname`, and `avatar_url`, with owner-only writes on the underlying profile row.
- Store profile avatars under `{user_id}/profile/{timestamp-random}.{ext}` in the existing public image bucket.
- Keep nickname duplicates allowed for the first release.
- Do not add profile realtime subscriptions for first release.

## Phase 1: Design Summary

See [data-model.md](./data-model.md), [contracts/profile-data.md](./contracts/profile-data.md), [contracts/profile-ui.md](./contracts/profile-ui.md), and [quickstart.md](./quickstart.md).

Post-design constitution check remains PASS. The design keeps the existing stack, avoids polling, preserves public read for guestbook screens, and limits profile write permissions to the owner.
