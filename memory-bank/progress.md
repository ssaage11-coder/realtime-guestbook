# 진행 상황

## 2026-05-04

### 현재 상태

- 단계: 마감/검증 직전.
- 등록 → 목록 → 상세/댓글의 핵심 사용자 흐름과 Realtime 구독 연결이 완료되었다.

### 단계별 진행 내역

1. 공통 기반 정리
   - Supabase client, 타입, 헬퍼 유틸을 추가했다.
   - `.env.local.example`에 필수 환경변수 템플릿을 추가했다.

2. 등록 화면 기능화
   - 캔버스 드로잉 + 사진 첨부/미리보기 + 빈 등록 차단 구현
   - 등록 시 Storage 업로드 + `guestbook_posts` insert 연결
   - 로딩/에러 상태 추가

3. 목록 화면 구현
   - `/posts` 라우트에서 초기 조회 및 빈/로딩/에러 상태 처리
   - `guestbook_posts` INSERT Realtime 구독

4. 상세/댓글 화면 구현
   - `/posts/[id]` 라우트에서 포스트/댓글 조회
   - 댓글 작성 폼 + insert
   - `comments` INSERT Realtime 구독
   - 컴포넌트 unmount 시 channel 정리

5. 배포 전 구성 보강
   - Supabase 초기 스키마/정책/Realtime/Storage SQL 파일 추가 (`supabase/sql/001_init_guestbook.sql`)
   - 아키텍처 문서를 실제 구현 라우트/모듈 기준으로 갱신

### 남은 작업 (검증 단계)

- `npm run lint`, `npm run build`, 필요 시 typecheck 실행
- 2개 브라우저 창으로 실시간 수동 검증
  - 포스트 등록 실시간 반영
  - 댓글 등록 실시간 반영
  - 그림 등록/사진 등록/지우기/빈 등록/에러 상태 점검
- 검증 결과를 본 문서에 추가 기록

### 메모

- 환경에 따라 npm registry 접근 제한이 있으면 의존성 설치 및 검증이 차단될 수 있다.
- Supabase 환경변수 미설정 시 클라이언트 초기화 오류가 발생한다.


## 2026-05-05

- 등록 버튼 클릭 시 일반 오류 문구만 노출되던 문제를 개선해 Storage/DB 단계별 실패 메시지를 표시하도록 수정했다.
- 운영 체크 포인트: Supabase에서는 bucket 생성만으로 충분하지 않으며 DB 테이블/정책/Realtime 설정(`supabase/sql/001_init_guestbook.sql`) 적용이 필요하다.
- Storage path 오류 가능성을 줄이기 위해 업로드 object 경로를 `posts/...` 형식으로 단순화하고, 버킷명은 `NEXT_PUBLIC_SUPABASE_BUCKET`으로 오버라이드 가능하게 수정했다.

- `NEXT_PUBLIC_SUPABASE_URL`에 경로가 포함돼도 동작하도록 origin으로 정규화하는 로직을 추가했다.
- Storage 업로드 오류 메시지에 bucket/path 디버그 정보를 포함해 원인 파악을 쉽게 했다.

## 2026-05-06

- 현재 방명록 웹사이트 구조를 인증/인가 관점에서 분석했다.
- 현재 상태는 로그인/세션/보호 라우트 없이 Supabase anon client가 공개 RLS 정책으로 `guestbook_posts`, `comments`, Storage 업로드를 직접 수행하는 구조다.
- 인증/인가 도입을 위한 작업 목록, DB 마이그레이션 계획, RLS 정책 초안, 단계별 구현 순서, 보안 체크리스트를 `memory-bank/implementation-plan.md`에 추가했다.
- 아키텍처 문서에 현재 인증/인가 부재 상태와 향후 `user_id` 기반 소유권 모델, 사용자 ID Storage prefix 전략을 기록했다.
- 인증/인가 1차 구현을 완료했다.
  - `/login` 이메일/비밀번호 로그인/가입 화면 추가
  - `AuthStatus` 세션 표시/로그아웃 컴포넌트 추가
  - 방명록 등록과 댓글 작성에 인증 사용자 검사 추가
  - `guestbook_posts`, `comments` insert 시 `user_id` 저장
  - Storage 업로드 경로를 `{user_id}/posts/...` 형식으로 변경
  - `supabase/sql/002_auth_rls_guestbook.sql` 마이그레이션 추가
  - 비대화형 lint를 위해 `.eslintrc.json` 추가
- 검증: `npm run lint`, `npm run build` 통과.
- 남은 운영 작업: Supabase Auth 이메일 provider/redirect URL 설정, `002_auth_rls_guestbook.sql` 적용, 실제 Supabase 프로젝트에서 인증/미인증/타 사용자 권한 수동 검증.
- Supabase SQL Editor에서 `002_auth_rls_guestbook.sql` 실행 중 `ERROR: 42501: must be owner of table objects`가 발생했다.
  - 원인: Supabase 관리 테이블인 `storage.objects`에 `alter table ... enable row level security`를 실행하려고 해서 소유권 오류가 발생했다.
  - 조치: `storage.objects` RLS 활성화 구문을 제거했다. Storage 정책 생성 구문은 유지한다.
- 사용자 프로필 기능 PRD를 `memory-bank/profile-prd.md`에 작성했다.
  - 목표와 기능 정의, 사용자 스토리, 필수 요구사항, 권장 요구사항을 포함했다.
  - 닉네임과 프로필 사진을 사용자별로 관리하는 `profiles` 테이블과 Storage/RLS 방향을 정리했다.
- `AGENTS.md`에 `memory-bank/profile-prd.md`를 필수 읽기 문서와 갱신 대상 문서로 추가했다.
- 사용자 프로필 기능 명세를 생성했다.
  - Spec Kit before_specify hook으로 `002-user-profiles` 브랜치를 생성/전환했다.
  - 기능 명세: `specs/001-user-profiles/spec.md`
  - 품질 체크리스트: `specs/001-user-profiles/checklists/requirements.md`
  - 현재 feature pointer: `.specify/feature.json`
  - PRD는 명세 작성에 충분해 수정하지 않았다.
- 사용자 프로필 기능 명세의 TODO를 정리했다.
  - 프로필 변경은 첫 릴리스에서 이미 열린 목록/상세 화면에 즉시 전파하지 않고, 이후 로드/재진입 시 반영하는 것으로 확정했다.
  - `specs/001-user-profiles/spec.md`에 Clarifications 섹션을 추가하고 TODO 섹션을 제거했다.
- 사용자 프로필 기능 구현 계획을 생성했다.
  - 현재 Next.js 14 App Router, TypeScript, TailwindCSS, Supabase 구성을 유지하는 방향으로 `specs/001-user-profiles/plan.md`를 작성했다.
  - `research.md`, `data-model.md`, `contracts/profile-data.md`, `contracts/profile-ui.md`, `quickstart.md`를 추가했다.
  - `AGENTS.md`의 Spec Kit 참조를 현재 plan 파일로 갱신했다.
  - `.specify/scripts/powershell/setup-plan.ps1`는 `pwsh`가 없어 실행하지 못했고, `.specify/feature.json` 기준 경로로 동일 산출물을 수동 생성했다.
- 사용자 프로필 기능 작업 목록을 생성했다.
  - 작업 파일: `specs/001-user-profiles/tasks.md`
  - 총 32개 작업을 Setup, Foundational, US1~US4, Polish 단계로 분리했다.
  - `.specify/scripts/powershell/setup-tasks.ps1`는 `pwsh`가 없어 실행하지 못했고, `.specify/feature.json` 기준 경로와 `.specify/templates/tasks-template.md` 구조를 사용했다.
- 사용자 프로필 Spec Kit 분석에서 발견한 이슈를 문서에 반영했다.
  - 공개 프로필 조회는 `user_id`, `nickname`, `avatar_url`만 노출하는 표시 전용 read surface를 사용하도록 plan/research/data-model/contracts/tasks를 보강했다.
  - 프로필 변경 2초 반영 확인, 작성자 표시 식별 확인, 공개 조회 개인정보 노출 확인을 quickstart/tasks 검증 항목에 추가했다.
  - `app/profile/page.tsx` placeholder 작업을 `app/profile/.gitkeep`로 바꿔 실제 구현 작업과의 중복을 줄였다.
  - tasks 총 작업 수는 33개로 갱신되었다.
- 사용자 프로필 기능 구현을 진행했다.
  - `supabase/sql/003_profiles.sql` 추가: `profiles`, `profile_public`, owner-only RLS, profile avatar Storage prefix 정책.
  - `Profile`, `AuthorProfileDisplay`, profile helper, default avatar asset 추가.
  - `/profile` 닉네임/프로필 이미지 설정 화면 추가.
  - `AuthStatus` 닉네임 우선 표시와 프로필 링크 추가.
  - `/posts`, `/posts/[id]` 작성자 닉네임/아바타 표시 및 default/historical fallback 적용.
  - 기존 포스트/댓글 Realtime insert 구독은 유지했다.
- 검증: `npm run lint` 통과.
- 검증: `npm run build` 통과.
- 남은 운영/수동 검증:
  - 실제 Supabase 프로젝트에 `supabase/sql/003_profiles.sql` 적용.
  - `/profile` 저장/재진입, avatar 업로드, invalid nickname/file 오류 확인.
  - 사용자 A/B 간 profile row 수정 및 다른 prefix Storage 업로드 차단 확인.
  - `profile_public`에서 `avatar_path`, `created_at`, `updated_at` 미노출 확인.
  - 프로필 변경 후 subsequent load/re-entry 2초 이내 반영 확인.
  - 기존 포스트/댓글 실시간 반영 회귀 확인.
- 다음 phase 검증을 시작했다.
  - 로컬 dev server를 `http://localhost:3000`에서 실행했고 `/profile`, `/posts` HTTP 200을 확인했다.
  - Supabase anon client로 원격 schema cache를 확인한 결과 `public.profiles`, `public.profile_public`가 아직 존재하지 않는다.
  - 따라서 T032/T033은 `supabase/sql/003_profiles.sql` 적용 전까지 완료 처리하지 않는다.
- 로컬 앱 검증 방식과 Supabase 운영 검증 기준을 정리했다.
  - 검증 포트는 `3000` 외에 `3001`도 사용할 수 있으며, 실행 예시는 `npm run dev -- -p 3001`이다.
  - `profile_public`은 Table Editor에서 `user_id`, `nickname`, `avatar_url`만 보이면 공개 필드 제한이 의도대로 적용된 것이다.
  - `profiles` 원본 테이블에 `avatar_path`, `created_at`, `updated_at`이 있는 것은 정상이며, 공개 view에 없어야 한다.
  - 사용자 B가 필요하지만 별도 메일 계정이 없을 때는 Supabase Dashboard > Authentication > Users에서 confirmed 테스트 유저를 직접 생성해 owner/RLS 검증에 사용한다.
