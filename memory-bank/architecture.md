# 아키텍처

## 프로젝트 목표

이 프로젝트는 실시간 전자 방명록이다. 방문자는 캔버스에 직접 그림을 그리거나 사진을 첨부해 방명록 포스트를 등록할 수 있다. 등록된 포스트는 손그림 느낌의 포스트잇 카드로 표시되며, 각 포스트를 열면 댓글을 읽고 실시간으로 새 댓글을 작성할 수 있다.

UI는 저장소 루트의 스케치 이미지를 기준으로 한다.

- `sketch/screen1.png`: 그림/사진 등록 화면
- `sketch/screen2.png`: 포스트잇 목록 화면
- `sketch/screen3.png`: 포스트 상세 및 댓글 화면

## 필수 기술 스택

- Next.js 14 App Router
- TypeScript
- TailwindCSS
- Supabase Database
- Supabase Storage
- Supabase Realtime
- HTML Canvas API 또는 React drawing canvas 라이브러리
- 모바일/데스크톱 반응형 UI

실시간 동작은 polling을 사용하지 않는다. 반드시 Supabase Realtime 구독으로 구현한다.

## 화면 구성

### 등록 화면

- 앱의 첫 화면이다.
- 제목 `전자 방명록`을 표시한다.
- 중앙에 그림을 그릴 수 있는 캔버스를 배치한다.
- 방문자는 직접 그림을 그리거나 사진을 첨부할 수 있다.
- 주요 버튼은 다음 세 가지다.
  - `사진첨부`: 이미지 파일을 선택한다.
  - `지우기`: 캔버스를 초기화하거나 첨부 사진을 제거한다.
  - `등록`: 그림 또는 사진을 업로드하고 방명록 포스트를 생성한다.
- 빈 캔버스이면서 첨부 사진도 없는 경우 등록을 막는다.
- 등록에 성공하면 포스트잇 목록 화면으로 이동한다.

### 포스트잇 목록 화면

- 등록된 포스트를 흰색 둥근 사각형과 검은 손그림 테두리의 포스트잇 카드로 표시한다.
- 화면 너비에 따라 가로 배치 또는 반응형 그리드를 사용한다.
- `guestbook_posts` insert 이벤트를 구독해 새 포스트를 새로고침 없이 목록에 추가한다.
- 포스트잇을 클릭하면 상세/댓글 화면으로 이동한다.
- 새 방명록을 작성할 수 있는 진입 버튼을 제공한다.

### 상세 및 댓글 화면

- 선택한 포스트 이미지를 상단에 표시한다.
- 이미지 아래에 댓글 목록을 표시한다.
- 각 댓글은 작성자 이름, 댓글 내용, 상대 시간 텍스트를 표시한다.
  - 예: `방금 전`, `1분 전`, `5분 전`
- 작성자 이름, 댓글 내용, 등록 버튼으로 구성된 댓글 입력 폼을 제공한다.
- 선택한 `post_id`에 대한 `comments` insert 이벤트를 구독한다.
- 댓글 등록에 성공하면 입력 폼을 초기화한다.

## Supabase 데이터 모델

### `guestbook_posts`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `image_url` | `text` | 필수. 클라이언트가 이미지를 렌더링할 때 사용하는 URL |
| `image_path` | `text` | 필수. Supabase Storage 내부 경로 |
| `image_type` | `text` | 필수. `drawing` 또는 `photo` |
| `created_at` | `timestamptz` | 기본값 `now()` |

### `comments`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `post_id` | `uuid` | `guestbook_posts(id)`를 참조하며 삭제 시 cascade |
| `author_name` | `text` | 필수 |
| `content` | `text` | 필수 |
| `created_at` | `timestamptz` | 기본값 `now()` |

### Storage

- bucket 이름: `guestbook-images`
- 캔버스 그림은 PNG로 변환해 업로드한다.
- 첨부 사진은 이미지 파일로 업로드한다.
- v1 기본값은 public URL을 사용한 이미지 렌더링이다.
- 파일명은 UUID 또는 timestamp 기반으로 생성해 충돌을 피한다.

## 실시간 흐름

- 목록 화면:
  - 초기 `guestbook_posts`를 `created_at` 기준으로 조회한다.
  - `guestbook_posts`의 `postgres_changes` insert 이벤트를 구독한다.
  - 수신한 row를 새로고침 없이 목록에 추가한다.

- 상세 화면:
  - 선택한 포스트와 댓글을 조회한다.
  - 선택한 `post_id`에 해당하는 `comments`의 `postgres_changes` insert 이벤트를 구독한다.
  - 수신한 댓글을 새로고침 없이 목록에 추가한다.

- Supabase channel을 여는 모든 컴포넌트는 unmount 시 channel을 정리한다.

## 환경변수

필수 환경변수:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## UI 원칙

- 첫 화면은 랜딩페이지가 아니라 실제 방명록 등록 경험이어야 한다.
- 흰 배경과 검은 손그림 선 스타일을 사용한다.
- 디자인은 스케치에 가깝게 미니멀하게 유지한다.
- 포스트잇 카드는 둥근 검은 테두리의 손그림 느낌이어야 한다.
- 대시보드형 카드 UI, 마케팅 히어로 섹션, 장식용 그라데이션을 피한다.
- 모바일 화면에서도 캔버스, 버튼, 이미지 미리보기, 댓글 목록, 입력 폼이 잘리지 않아야 한다.
