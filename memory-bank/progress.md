# 진행 상황

## 2026-05-03

### 현재 상태

- 단계: UI 구현 시작 (등록 화면 중심).
- Next.js 14 + TypeScript + TailwindCSS 기본 프로젝트 구조를 생성했다.
- 첫 화면을 랜딩이 아닌 실제 방명록 작성 화면으로 구성했다.
- 캔버스 드로잉과 기본 버튼 UI(사진첨부/지우기/등록) 골격을 구현했다.
- 로컬 실행 오류 원인이었던 `next.config.ts`를 `next.config.mjs`로 교체해 Next.js 설정 로딩 오류를 해소했다.
- 유사 오류 재발 방지를 위해 `predev/prebuild/prestart`에서 `next.config.ts`를 자동 제거하는 안전 스크립트를 추가했다.

### 완료됨

- 프로젝트 실행을 위한 기본 파일 구성.
  - `package.json`, `tsconfig.json`, `next.config.mjs`, `.env.local.example`
  - `app/layout.tsx`, `app/page.tsx`, `app/posts/page.tsx`, `app/globals.css`
  - `tailwind.config.ts`, `postcss.config.js`
  - `lib/supabase.ts`, `lib/types.ts`, `lib/helpers.ts`
- 손그림 스타일 등록 화면 기능 확장.
  - `components/drawing-board.tsx`에서 Pointer 기반 캔버스 드로잉 지원
  - 사진첨부 파일 선택/미리보기 상태 연결
  - 빈 등록 차단, 등록 중 상태, 오류 메시지 표시
  - Storage 업로드 + `guestbook_posts` insert + `/posts` 라우트 이동 연결
- UI 기준을 반영.
  - 흰 배경 + 검은 테두리 + 손글씨 폰트 중심의 미니멀 톤
  - 첫 화면을 곧바로 방명록 등록 경험으로 제공
- 실행 이슈 대응.
  - Next.js가 TypeScript 설정 파일(`next.config.ts`)을 지원하지 않아 dev 서버가 종료되던 문제를 `next.config.mjs` 전환으로 수정
  - 로컬 작업 디렉터리에 `next.config.ts`가 다시 생겨도 실행 전에 자동 제거되도록 보호 로직 추가

### 다음 작업

- `posts` 목록 화면에서 Supabase 조회 + 실시간 insert 구독을 구현한다.
- 상세/댓글 화면 라우트를 추가하고 댓글 실시간 구독을 구현한다.
- 업로드/등록 실패 케이스를 사용자 친화적인 메시지로 세분화한다.
- `.env.local.example` 안내와 실제 Supabase 프로젝트 설정 가이드를 보강한다.

### 메모

- 현재는 UI 골격 단계이며 Supabase 연동 전 상태다.
- Realtime 로직은 목록/상세 화면 구현 단계에서 Supabase channel 구독으로만 추가한다.
- 구조 변화가 생기면 `architecture.md`, 구현 순서 변화가 생기면 `implementation-plan.md`를 추가 갱신한다.
