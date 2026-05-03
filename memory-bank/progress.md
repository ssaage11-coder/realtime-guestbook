# 진행 상황

## 2026-05-03

### 현재 상태

- 단계: 기획 및 문서화.
- 실시간 전자 방명록 제품 프롬프트가 정의되었다.
- 참고 스케치가 `sketch/`에 있다.
  - `screen1.png`: 등록 화면
  - `screen2.png`: 포스트잇 목록 화면
  - `screen3.png`: 상세 및 댓글 화면
- 필수 기술 스택이 확정되었다.
  - Next.js 14 App Router
  - TypeScript
  - TailwindCSS
  - Supabase Database
  - Supabase Storage
  - Supabase Realtime

### 완료됨

- 핵심 사용자 흐름을 정의했다.
  - 그림 그리기 또는 사진 첨부
  - 포스트잇으로 등록
  - 실시간 포스트잇 목록 확인
  - 상세 화면 열기
  - 댓글 작성 및 실시간 댓글 확인
- 초기 Supabase 데이터 모델을 정의했다.
  - `guestbook_posts`
  - `comments`
  - `guestbook-images` Storage bucket
- v1 기본값을 선택했다.
  - 로그인 없는 공개 방명록
  - public Storage URL
  - polling이 아닌 Supabase Realtime 구독

### 다음 작업

- Next.js 14 앱을 생성하거나 기존 앱을 채운다.
- TailwindCSS와 Supabase client를 설정한다.
- Supabase SQL schema와 Storage policy 안내를 작성한다.
- 등록 화면을 구현한다.
- 실시간 포스트 구독을 포함한 포스트잇 목록을 구현한다.
- 실시간 댓글 구독을 포함한 상세/댓글 화면을 구현한다.
- 두 개의 브라우저 창으로 실시간 동작을 검증한다.

### 메모

- `sketch/` 이미지를 항상 시각 기준 자료로 유지한다.
- 구현 상태가 바뀌면 이 파일을 갱신한다.
- 제품, 데이터, 실시간 흐름, 기술 구조가 바뀌면 `architecture.md`를 갱신한다.
- 구현 순서나 완료 기준이 바뀌면 `implementation-plan.md`를 갱신한다.
