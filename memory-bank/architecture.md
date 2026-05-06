# 아키텍처

## 프로젝트 목표

실시간 전자 방명록을 제공한다. 방문자는 그림 또는 사진으로 포스트를 등록하고, 목록에서 실시간으로 새 포스트를 확인하며, 상세 화면에서 댓글을 실시간으로 작성/조회한다.

## 기준 스케치

- `sketch/screen1.png`: 등록 화면
- `sketch/screen2.png`: 포스트잇 목록 화면
- `sketch/screen3.png`: 포스트 상세/댓글 화면

## 기술 스택

- Next.js 14 App Router
- TypeScript
- TailwindCSS
- Supabase Database
- Supabase Storage
- Supabase Realtime
- HTML Canvas API

## 현재 라우트 구조

- `/` : 등록 화면
  - 캔버스 드로잉
  - 사진 첨부/미리보기
  - 빈 등록 차단
  - 로그인 사용자만 이미지 업로드 + `guestbook_posts` insert
- `/login` : 인증 화면
  - 이메일/비밀번호 로그인
  - 이메일/비밀번호 가입
  - `next` query를 통한 원래 화면 복귀
- `/posts` : 포스트 목록
  - 초기 조회(`created_at desc`)
  - `guestbook_posts` insert Realtime 구독
- `/posts/[id]` : 포스트 상세/댓글
  - 단일 포스트 조회
  - 댓글 조회/작성
  - 로그인 사용자만 댓글 작성
  - `comments` insert Realtime 구독
- `/profile` : 사용자 프로필 설정
  - 로그인 사용자 자신의 `profiles` row 조회/생성/수정
  - 닉네임 1~20자 검증
  - PNG/JPEG/WebP, 2MB 이하 프로필 이미지 미리보기/업로드
  - 미로그인 사용자는 `/login?next=/profile`로 유도

## 현재 인증/인가 상태

- `/login`에서 Supabase Auth 이메일/비밀번호 로그인과 가입을 제공한다.
- `AuthStatus` 컴포넌트가 각 주요 화면에서 현재 세션과 로그아웃을 처리한다.
- 목록과 상세 조회는 공개 유지한다.
- 방명록 등록, 댓글 작성, Storage 업로드는 인증 사용자만 가능하도록 앱 로직과 RLS 초안을 추가했다.
- 서버 미들웨어 기반 보호 라우트는 아직 없다. 현재 보호는 클라이언트 UX + Supabase RLS가 최종 권한 경계다.

## 인증/인가 도입 방향

- 등록과 댓글 작성은 인증 사용자만 허용한다.
- 목록과 상세 조회는 공개 방명록 경험을 유지하는 방향을 우선 검토한다.
- 작성자별 권한 판단을 위해 포스트와 댓글에 `auth.users(id)` 기반 `user_id`를 추가한다.
- Storage 업로드는 사용자 ID prefix 기반 경로와 `storage.objects` RLS 정책으로 제한한다.

## 데이터 모델

### `guestbook_posts`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `image_url` | `text` | 렌더링 URL |
| `image_path` | `text` | Storage 내부 경로 |
| `image_type` | `text` | `drawing` / `photo` |
| `created_at` | `timestamptz` | 생성시각 |
| `user_id` | `uuid` | `auth.users(id)` 참조, 포스트 작성자 |

### `comments`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `post_id` | `uuid` | `guestbook_posts(id)` FK (cascade delete) |
| `author_name` | `text` | 작성자 이름 |
| `content` | `text` | 댓글 내용 |
| `created_at` | `timestamptz` | 생성시각 |
| `user_id` | `uuid` | `auth.users(id)` 참조, 댓글 작성자 |

### `profiles`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `user_id` | `uuid` | Primary key, `auth.users(id)` 참조 |
| `nickname` | `text` | 1~20자 표시 닉네임 |
| `avatar_url` | `text` | 프로필 이미지 public URL, nullable |
| `avatar_path` | `text` | Storage 내부 경로, nullable |
| `created_at` | `timestamptz` | 생성시각 |
| `updated_at` | `timestamptz` | 수정시각 |

### `profile_public`

- 공개 작성자 표시 전용 view다.
- 노출 필드는 `user_id`, `nickname`, `avatar_url`로 제한한다.
- `avatar_path`, `created_at`, `updated_at`은 공개 화면에서 조회하지 않는다.

## Storage 전략

- 버킷: `guestbook-images` (public)
- 그림: canvas PNG blob 업로드
- 사진: 사용자 선택 이미지 파일 업로드
- 파일 경로: `buildStoragePath()`로 `{user_id}/posts/{timestamp-random}.{ext}` 생성
- 프로필 이미지 경로: `{user_id}/profile/{timestamp-random}.{ext}`
- Storage RLS는 첫 번째 path segment가 `auth.uid()`와 일치하는 사용자만 업로드/수정/삭제할 수 있게 제한한다.

## 실시간 규칙

- polling/수동 새로고침 사용 금지
- 목록: `guestbook_posts` INSERT 구독
- 상세: `comments` INSERT 구독 (`post_id` filter)
- 프로필 변경에 대한 별도 Realtime 구독은 첫 릴리스에서 추가하지 않았다. 프로필 변경은 이후 목록/상세 로드 또는 재진입 시 반영한다.
- 모든 구독은 컴포넌트 unmount 시 `supabase.removeChannel()`로 정리

## 공통 모듈

- `lib/supabase.ts`: 브라우저 Supabase client
- `lib/types.ts`: `GuestbookPost`, `Comment`, `ImageType`, `Profile`, `AuthorProfileDisplay`
- `lib/helpers.ts`: storage path 생성, profile avatar path 생성, avatar/nickname 검증, 기본 작성자 표시, canvas blob 변환, 한국어 상대시간 포맷
- `lib/profiles.ts`: 현재 사용자 프로필 조회/업서트, 공개 작성자 프로필 map 조회, 작성자 fallback 조합
- `components/auth-status.tsx`: 세션 표시, 닉네임 우선 표시, 프로필 링크, 로그아웃
- `components/drawing-board.tsx`: 인증 사용자 등록 및 Storage 업로드

## Supabase 설정 자산

- SQL: `supabase/sql/001_init_guestbook.sql`
  - 테이블 생성
  - RLS 정책(v1 공개 읽기/쓰기)
  - Realtime publication 등록
  - Storage bucket 생성/보정
- SQL: `supabase/sql/002_auth_rls_guestbook.sql`
  - `user_id` 컬럼 추가
  - 공개 쓰기 정책 제거
  - 인증 사용자 소유권 기반 insert/update/delete 정책 추가
  - Storage object 사용자 prefix 정책 추가
  - 댓글 길이/공백 check constraint 추가
- SQL: `supabase/sql/003_profiles.sql`
  - `profiles` 테이블과 `profile_public` view 추가
  - 프로필 owner-only select/insert/update/delete RLS 정책 추가
  - 프로필 avatar Storage insert/update/delete prefix 정책 추가

## 환경변수

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_BUCKET=guestbook-images
```
