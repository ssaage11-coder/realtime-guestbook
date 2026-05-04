# 진행 상황

## 2026-05-04

### 현재 상태

- 단계: 등록/목록/상세 핵심 흐름 연결 진행 중.
- 로컬 개발서버에서 첫 화면 접근은 가능하며, 등록 이후 목록/상세 라우트 골격까지 동작한다.

### 완료됨

- 공통 Supabase 기반 확장.
  - `.env.local.example`로 필수 환경변수 템플릿 제공
  - `lib/supabase.ts`, `lib/types.ts`, `lib/helpers.ts` 추가
  - 한국어 상대 시간 포맷터(`formatRelativeKoreanTime`) 추가
- 등록 화면 기능 확장.
  - 사진첨부 파일 선택/미리보기
  - 빈 등록 차단, 등록 중 상태, 오류 표시
  - Storage 업로드 + `guestbook_posts` insert 처리
- 목록 화면 구현 (`/posts`).
  - 초기 `guestbook_posts` 조회 및 정렬
  - `guestbook_posts` insert Realtime 구독
  - 빈 상태/로딩/에러 상태 처리
  - 포스트 클릭 시 상세 페이지 이동
- 상세/댓글 화면 구현 (`/posts/[id]`).
  - 단일 포스트 조회
  - 댓글 조회 및 렌더링
  - 댓글 작성 폼 + insert
  - `comments` insert Realtime 구독
  - 컴포넌트 unmount 시 채널 정리

### 다음 작업

- Supabase SQL schema / RLS / Realtime enable 여부를 실제 프로젝트에 맞게 점검한다.
- 등록/댓글 실패 케이스별 사용자 메시지를 세분화한다.
- 목록/상세 UI를 스케치 기준 손그림 스타일에 더 가깝게 다듬는다.
- build/lint/typecheck와 2창 실시간 수동 테스트를 완료한다.

### 메모

- 현재 구현은 Supabase 프로젝트가 준비되어 있다는 전제에서 동작한다.
- 환경변수가 비어 있으면 Supabase client 초기화 오류가 발생한다.
