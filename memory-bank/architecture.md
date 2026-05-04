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
  - 이미지 업로드 + `guestbook_posts` insert
- `/posts` : 포스트 목록
  - 초기 조회(`created_at desc`)
  - `guestbook_posts` insert Realtime 구독
- `/posts/[id]` : 포스트 상세/댓글
  - 단일 포스트 조회
  - 댓글 조회/작성
  - `comments` insert Realtime 구독

## 데이터 모델

### `guestbook_posts`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `image_url` | `text` | 렌더링 URL |
| `image_path` | `text` | Storage 내부 경로 |
| `image_type` | `text` | `drawing` / `photo` |
| `created_at` | `timestamptz` | 생성시각 |

### `comments`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `post_id` | `uuid` | `guestbook_posts(id)` FK (cascade delete) |
| `author_name` | `text` | 작성자 이름 |
| `content` | `text` | 댓글 내용 |
| `created_at` | `timestamptz` | 생성시각 |

## Storage 전략

- 버킷: `guestbook-images` (public)
- 그림: canvas PNG blob 업로드
- 사진: 사용자 선택 이미지 파일 업로드
- 파일 경로: `buildStoragePath()`로 prefix + timestamp + random 생성

## 실시간 규칙

- polling/수동 새로고침 사용 금지
- 목록: `guestbook_posts` INSERT 구독
- 상세: `comments` INSERT 구독 (`post_id` filter)
- 모든 구독은 컴포넌트 unmount 시 `supabase.removeChannel()`로 정리

## 공통 모듈

- `lib/supabase.ts`: 브라우저 Supabase client
- `lib/types.ts`: `GuestbookPost`, `Comment`, `ImageType`
- `lib/helpers.ts`: storage path 생성, canvas blob 변환, 한국어 상대시간 포맷

## Supabase 설정 자산

- SQL: `supabase/sql/001_init_guestbook.sql`
  - 테이블 생성
  - RLS 정책(v1 공개 읽기/쓰기)
  - Realtime publication 등록
  - Storage bucket 생성/보정

## 환경변수

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
