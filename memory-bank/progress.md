# 진행 상황

## 2026-05-03

### 현재 상태

- 단계: UI 구현 시작 (등록 화면 중심).
- Next.js 14 + TypeScript + TailwindCSS 기본 프로젝트 구조를 생성했다.
- 첫 화면을 랜딩이 아닌 실제 방명록 작성 화면으로 구성했다.
- 캔버스 드로잉과 기본 버튼 UI(사진첨부/지우기/등록) 골격을 구현했다.

### 완료됨

- 프로젝트 실행을 위한 기본 파일 구성.
  - `package.json`, `tsconfig.json`, `next.config.ts`
  - `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
  - `tailwind.config.ts`, `postcss.config.js`
- 손그림 스타일 등록 화면 초안 구현.
  - `components/drawing-board.tsx`에서 Pointer 기반 캔버스 드로잉 지원
  - `지우기` 버튼 캔버스 초기화 동작 연결
- UI 기준을 반영.
  - 흰 배경 + 검은 테두리 + 손글씨 폰트 중심의 미니멀 톤
  - 첫 화면을 곧바로 방명록 등록 경험으로 제공

### 다음 작업

- `사진첨부` 버튼에 파일 선택/미리보기 상태를 연결한다.
- `등록` 버튼에 빈 상태 차단, 로딩/에러 상태를 추가한다.
- Supabase client 및 타입 정의를 추가한다.
- 이미지 업로드(Storage) + `guestbook_posts` insert를 연결한다.
- 등록 완료 후 포스트잇 목록 화면 라우트를 구현한다.

### 메모

- 현재는 UI 골격 단계이며 Supabase 연동 전 상태다.
- Realtime 로직은 목록/상세 화면 구현 단계에서 Supabase channel 구독으로만 추가한다.
- 구조 변화가 생기면 `architecture.md`, 구현 순서 변화가 생기면 `implementation-plan.md`를 추가 갱신한다.
