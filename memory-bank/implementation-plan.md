# 구현 계획

## 1. 프로젝트 설정

- Next.js 14 App Router 프로젝트를 TypeScript 기반으로 생성하거나 기존 프로젝트를 사용한다.
- TailwindCSS를 설정한다.
- Supabase client 의존성을 설치한다.
- `.env.local.example`에 다음 환경변수를 문서화한다.
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `sketch/` 폴더의 이미지를 UI 참고 자료로 유지한다.

완료 기준:

- `npm run dev`로 앱이 로컬에서 실행된다.
- TypeScript와 TailwindCSS가 동작한다.
- Supabase 환경변수가 문서화되어 있다.

## 2. Supabase 설정

- `guestbook_posts`와 `comments` SQL schema를 작성한다.
- `guestbook-images` Storage bucket을 만든다.
- v1 이미지 렌더링을 위해 public read 접근을 허용한다.
- 로그인 없는 공개 방명록에 맞는 insert/select policy를 설정한다.
- `guestbook_posts`와 `comments`에 Realtime을 활성화한다.

완료 기준:

- anon key로 테이블 select와 insert가 가능하다.
- 업로드된 이미지를 public URL로 렌더링할 수 있다.
- 브라우저 클라이언트에서 insert Realtime 이벤트를 받을 수 있다.

## 3. 공통 클라이언트와 타입

- 브라우저용 Supabase client 모듈을 만든다.
- TypeScript 타입을 정의한다.
  - `GuestbookPost`
  - `Comment`
  - `ImageType = "drawing" | "photo"`
- 공통 헬퍼를 추가한다.
  - 안전한 Storage path 생성
  - 캔버스 내용을 PNG `Blob`으로 변환
  - 한국어 상대 시간 라벨 포맷팅

완료 기준:

- UI 컴포넌트가 하나의 Supabase client를 import해서 사용한다.
- Supabase에서 반환되는 데이터 타입이 명확하다.
- 시간 라벨이 `방금 전`, `1분 전`, `5분 전` 같은 형식으로 표시된다.

## 4. 등록 화면

- `sketch/screen1.png`를 기준으로 첫 화면을 구현한다.
- pointer, mouse, touch 입력을 지원하는 드로잉 캔버스를 추가한다.
- 이미지 첨부와 미리보기 동작을 구현한다.
- `사진첨부`, `지우기`, `등록` 버튼을 추가한다.
- 그림 또는 사진이 없는 경우 등록을 막는다.
- 등록 시 다음 순서로 처리한다.
  - 그림 모드인 경우 캔버스를 PNG로 변환한다.
  - 이미지를 `guestbook-images`에 업로드한다.
  - `guestbook_posts`에 row를 저장한다.
  - 포스트잇 목록 화면으로 이동한다.

완료 기준:

- 사용자가 그림을 등록할 수 있다.
- 사용자가 사진을 등록할 수 있다.
- 빈 등록이 차단된다.
- 로딩과 에러 상태가 표시된다.

## 5. 포스트잇 목록 화면

- `sketch/screen2.png`를 기준으로 목록 화면을 구현한다.
- 초기 `guestbook_posts`를 일관된 정렬 기준으로 조회한다.
- 각 포스트를 손그림 느낌의 둥근 포스트잇으로 렌더링한다.
- Supabase Realtime으로 `guestbook_posts` insert 이벤트를 구독한다.
- 새 포스트를 새로고침 없이 화면 목록에 추가한다.
- 각 포스트잇을 상세 화면으로 연결한다.
- 새 방명록 작성 화면으로 이동하는 버튼을 제공한다.

완료 기준:

- 기존 포스트가 로드 시 표시된다.
- 다른 브라우저 창에서 새 포스트를 등록하면 현재 창에 새로고침 없이 표시된다.
- 포스트를 클릭하면 상세 화면이 열린다.
- 빈 목록 상태가 처리된다.

## 6. 상세 및 댓글 화면

- `sketch/screen3.png`를 기준으로 상세 화면을 구현한다.
- 선택한 `id`의 포스트를 조회한다.
- 해당 포스트의 댓글을 조회한다.
- 작성자 이름, 댓글 내용, 상대 시간 라벨을 표시한다.
- 작성자 이름과 댓글 내용을 입력하는 댓글 폼을 추가한다.
- 댓글을 Supabase에 insert한다.
- 선택한 `post_id`에 대한 `comments` insert 이벤트를 구독한다.
- 댓글 등록 성공 후 폼을 초기화한다.

완료 기준:

- 기존 댓글이 로드 시 표시된다.
- 다른 브라우저 창에서 새 댓글을 작성하면 현재 창에 새로고침 없이 표시된다.
- 빈 댓글 상태가 처리된다.
- 로딩과 에러 상태가 표시된다.

## 7. 반응형 스타일과 마감

- TailwindCSS로 손그림 스타일 UI를 적용한다.
- 모바일과 데스크톱에서 읽기 쉬운 레이아웃을 유지한다.
- 버튼, 포스트잇 카드, 폼 안에서 텍스트가 넘치지 않게 한다.
- 파일 업로드와 폼 입력에 접근 가능한 label을 제공한다.
- 손그림 방명록 컨셉에 맞게 시각 계층을 작고 실용적으로 유지한다.

완료 기준:

- 등록, 목록, 상세 화면이 모바일 너비에서도 동작한다.
- 버튼과 입력 필드가 사용 가능하다.
- UI가 스케치 참고 자료와 가까운 느낌을 유지한다.

## 8. 검증

- 설정되어 있다면 type check와 lint를 실행한다.
- production build를 실행한다.
- 두 개의 브라우저 창으로 수동 테스트한다.
  - 한 창에서 포스트를 만들고 다른 창에서 실시간 반영을 확인한다.
  - 한 창에서 댓글을 추가하고 다른 창에서 실시간 반영을 확인한다.
  - 그림 등록, 사진 등록, 지우기 버튼, 빈 등록 검증, 에러 상태를 확인한다.

완료 기준:

- build가 통과한다.
- polling이나 새로고침 없이 실시간 동작이 확인된다.
- 검증 결과와 진행 상태가 `memory-bank/progress.md`에 반영된다.

## 9. 인증/인가 도입 계획

현재 앱은 기존 실시간 UX는 유지하되, 쓰기 작업과 Storage 업로드를 인증된 사용자로 제한하고 작성자 소유권을 데이터 모델에 남기는 방향으로 구현을 시작했다.

구현 완료:

- `/login` 이메일/비밀번호 로그인/가입 화면
- `AuthStatus` 세션 표시/로그아웃 컴포넌트
- 등록 화면 인증 사용자 제한
- 댓글 작성 인증 사용자 제한
- `guestbook_posts`, `comments` insert payload에 `user_id` 포함
- Storage path를 `{user_id}/posts/...` 형식으로 변경
- `supabase/sql/002_auth_rls_guestbook.sql` 추가
- `npm run lint`, `npm run build` 통과

### 작업 목록

- Supabase Auth 설정
  - 이메일/비밀번호 방식을 우선 구현했다.
  - 로컬/배포 redirect URL을 Supabase Auth 설정에 등록한다.
  - 현재는 추가 패키지 없이 `@supabase/supabase-js` 브라우저 Auth를 사용한다.
- 앱 인증 구조
  - `/login` 라우트를 추가했다.
  - `AuthStatus`와 각 쓰기 폼에서 세션을 확인한다.
  - 등록 화면(`/`)과 댓글 작성은 인증 사용자만 실행 가능하게 했다.
  - 목록(`/posts`)과 상세(`/posts/[id]`) 조회는 공개 유지한다.
- 데이터 모델
  - `guestbook_posts.user_id uuid references auth.users(id)` 마이그레이션을 추가했다.
  - `comments.user_id uuid references auth.users(id)` 마이그레이션을 추가했다.
  - 신규 insert 시 `user_id = auth.uid()`가 강제되도록 RLS와 클라이언트 insert payload를 정리했다.
  - 기존 익명 데이터 backfill 정책을 정한다. 예: `user_id nullable` 유지 후 기존 row 읽기만 허용, 또는 관리자 계정으로 귀속.
- Storage
  - 업로드 경로를 `{user_id}/posts/{timestamp-random}.{ext}` 형식으로 변경했다.
  - `storage.objects` RLS를 추가해 인증 사용자만 자신의 prefix에 업로드할 수 있게 했다.
  - Supabase 관리 테이블인 `storage.objects`에는 `alter table ... enable row level security`를 실행하지 않는다.
  - public bucket은 유지한다.
- UI/UX
  - 로그인/로그아웃 상태 표시를 추가했다.
  - 미인증 상태에서 등록/댓글 작성 시 로그인으로 유도한다.
  - 인증 실패, 세션 만료, 권한 거부 메시지를 구분해 표시한다.
- 검증
  - 미인증 insert/upload 차단
  - 인증 사용자 insert/upload 성공
  - 타 사용자 Storage prefix 업로드 차단
  - Realtime 구독 유지
  - 기존 공개 조회 정책이 의도대로 동작하는지 확인

### DB 마이그레이션 계획

새 마이그레이션 파일 예시: `supabase/sql/002_auth_rls_guestbook.sql`

1. 현재 공개 쓰기 정책 제거
   - `guestbook_posts_insert_all`
   - `comments_insert_all`
2. 소유자 컬럼 추가
   - `guestbook_posts.user_id uuid references auth.users(id)`
   - `comments.user_id uuid references auth.users(id)`
3. 기존 데이터 처리
   - 기존 익명 row를 유지해야 하면 `user_id`는 우선 nullable로 둔다.
   - 새 row부터는 RLS `with check (auth.uid() is not null and user_id = auth.uid())`로 소유자를 강제한다.
   - 운영 데이터 이관이 완료된 뒤 `user_id set not null`을 별도 마이그레이션으로 검토한다.
4. 읽기 정책 결정
   - 공개 방명록이면 `select using (true)` 유지
   - 비공개 방명록이면 `select using (auth.uid() is not null)` 또는 `user_id = auth.uid()`로 축소
5. 쓰기 정책 추가
   - 인증 사용자만 포스트/댓글 insert 가능
   - update/delete를 지원한다면 소유자만 허용
6. Storage 정책 추가
   - `storage.objects`에서 bucket id와 첫 번째 path segment가 `auth.uid()`와 일치하는지 검사
   - public bucket 유지 시 read 정책은 공개 허용
   - private bucket 전환 시 read도 인증/소유권 정책으로 제한하고 signed URL 생성 흐름 추가

### RLS 정책 초안

```sql
-- tables
alter table public.guestbook_posts add column if not exists user_id uuid references auth.users(id);
alter table public.comments add column if not exists user_id uuid references auth.users(id);

drop policy if exists "guestbook_posts_insert_all" on public.guestbook_posts;
drop policy if exists "comments_insert_all" on public.comments;

-- 공개 조회를 유지하는 방명록 정책
drop policy if exists "guestbook_posts_select_all" on public.guestbook_posts;
create policy "guestbook_posts_select_public" on public.guestbook_posts
for select using (true);

drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_public" on public.comments
for select using (true);

create policy "guestbook_posts_insert_authenticated_owner" on public.guestbook_posts
for insert
with check (auth.uid() is not null and user_id = auth.uid());

create policy "comments_insert_authenticated_owner" on public.comments
for insert
with check (auth.uid() is not null and user_id = auth.uid());

create policy "guestbook_posts_update_owner" on public.guestbook_posts
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "guestbook_posts_delete_owner" on public.guestbook_posts
for delete
using (user_id = auth.uid());

create policy "comments_update_owner" on public.comments
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "comments_delete_owner" on public.comments
for delete
using (user_id = auth.uid());
```

```sql
-- storage.objects 정책 초안: bucket은 public read 유지, write는 사용자 prefix 제한
create policy "guestbook_images_select_public" on storage.objects
for select
using (bucket_id = 'guestbook-images');

create policy "guestbook_images_insert_owner_prefix" on storage.objects
for insert
with check (
  bucket_id = 'guestbook-images'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "guestbook_images_update_owner_prefix" on storage.objects
for update
using (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "guestbook_images_delete_owner_prefix" on storage.objects
for delete
using (
  bucket_id = 'guestbook-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

### 단계별 구현 순서

1. 인증 방식과 공개 범위 결정
   - 목록/상세 조회 공개 여부
   - 댓글 작성 인증 필수 여부
   - 기존 익명 데이터 처리 방식
2. Supabase Auth 및 환경 설정
   - Auth provider 설정
   - redirect URL 등록
   - 필요 시 `@supabase/ssr` 설치
3. Supabase client 구조 분리
   - browser client
   - server client 또는 middleware client
   - 현재 `lib/supabase.ts` 단일 client 의존성 정리
4. 로그인/로그아웃 UI 추가
   - `/login`
   - header 또는 각 화면의 세션 상태 표시
5. DB 마이그레이션 적용
   - `user_id` 컬럼 추가
   - RLS 공개 쓰기 정책 제거
   - 인증 사용자 쓰기 정책 추가
   - Storage prefix 정책 추가
6. 쓰기 흐름 수정
   - 등록 전 세션 확인
   - Storage path에 `user.id` 포함
   - `guestbook_posts` insert에 `user_id` 포함
   - 댓글 insert에 `user_id` 포함
7. 권한/오류 UX 보강
   - 미로그인
   - 세션 만료
   - RLS 거부
   - Storage 정책 거부
8. 검증
   - `npm run lint` 통과
   - `npm run build` 통과
   - 인증/미인증/타 사용자 권한 수동 테스트
   - Realtime insert 반영 회귀 테스트

### 보안 체크리스트

- anon key만 클라이언트에 노출하고 service role key는 절대 브라우저 번들에 포함하지 않는다.
- 미인증 사용자는 `guestbook_posts`, `comments`, `storage.objects` insert가 실패해야 한다.
- insert payload의 `user_id`가 현재 `auth.uid()`와 다르면 실패해야 한다.
- Storage object path 첫 segment가 현재 사용자 ID와 다르면 업로드/수정/삭제가 실패해야 한다.
- owner-only 정책 검증에는 실제 사용자 2명이 필요하다. 별도 메일 계정이 없으면 Supabase Dashboard의 Authentication > Users에서 confirmed 테스트 유저를 직접 생성하거나, 이메일 provider 설정에 맞춰 plus alias 또는 테스트용 이메일을 사용한다.
- public bucket 유지 시 이미지 URL은 누구나 접근 가능하다는 제품 결정을 명시한다.
- private bucket 전환 시 signed URL 만료 시간과 재발급 흐름을 구현한다.
- 파일 크기와 MIME type 제한을 클라이언트와 Storage 정책/운영 설정에서 함께 적용한다.
- 댓글 `author_name`, `content` 길이 제한을 DB check constraint로도 보강한다.
- update/delete 기능을 추가할 때는 소유자 정책을 먼저 만든 뒤 UI를 노출한다.
- Realtime은 RLS 정책 영향을 받으므로 인증 전후 구독 이벤트 수신 범위를 다시 검증한다.
- Auth redirect URL은 로컬/운영 도메인만 허용한다.
- 에러 메시지에 토큰, 내부 경로, 민감한 계정 정보가 노출되지 않게 한다.

## 10. 사용자 프로필 기능 구현 계획

Spec Kit 산출물:

- 기능 명세: `specs/001-user-profiles/spec.md`
- 구현 계획: `specs/001-user-profiles/plan.md`
- 리서치 결정: `specs/001-user-profiles/research.md`
- 데이터 모델: `specs/001-user-profiles/data-model.md`
- 계약 문서: `specs/001-user-profiles/contracts/profile-data.md`, `specs/001-user-profiles/contracts/profile-ui.md`
- 빠른 검증 가이드: `specs/001-user-profiles/quickstart.md`

### 기술 접근

- 현재 적용된 Next.js 14 App Router, TypeScript, TailwindCSS, Supabase Auth/Database/Storage/Realtime 구성을 그대로 사용한다.
- 별도 백엔드 API 계층을 추가하지 않고 기존 브라우저 Supabase client + RLS 구조를 유지한다.
- 프로필 변경은 첫 릴리스에서 이미 열린 목록/상세 화면에 즉시 전파하지 않는다.
- 기존 방명록 글/댓글 insert Realtime 구독은 유지하고 polling/수동 새로고침 기반 실시간 구현은 추가하지 않는다.

### 구현 순서

1. `supabase/sql/003_profiles.sql` 추가
   - `profiles` 테이블 생성
   - 공개 작성자 표시는 `user_id`, `nickname`, `avatar_url`만 노출하는 `profile_public` 같은 표시 전용 view/조회 표면으로 제한
   - `nickname` 1~20자, 공백 제거 기준 check constraint
   - `updated_at` 갱신 처리
   - 공개 조회 정책과 본인 insert/update/delete 정책
   - `guestbook-images` 버킷 내 `{user_id}/profile/...` Storage 정책
2. TypeScript 타입/헬퍼 추가
   - `Profile`
   - `AuthorProfileDisplay`
   - 기본 닉네임/기본 아바타 표시 헬퍼
   - 프로필 이미지 MIME/크기 검증
3. `/profile` 라우트 추가
   - 미로그인 사용자는 `/login?next=/profile`로 유도
   - 현재 프로필 조회
   - 프로필이 없으면 기본값 표시 후 저장 시 생성
   - 닉네임/프로필 이미지 업로드/미리보기/저장 상태 처리
4. `AuthStatus` 연동
   - 가능하면 닉네임 우선 표시
   - 프로필 설정 화면으로 이동하는 링크 추가
   - 기존 로그인/로그아웃 동작 유지
5. 목록/상세 화면 작성자 표시 연동
   - 포스트/댓글의 `user_id` 기준으로 프로필 표시 정보 조회
   - 프로필 누락 시 기본 닉네임/기본 아바타 사용
   - 과거 댓글의 `author_name` fallback 유지
6. 댓글 작성 흐름 조정
   - 현재 사용자의 프로필 닉네임을 기본 작성자 이름으로 사용
   - 프로필 닉네임이 없으면 기존 호환 흐름 유지
7. 검증
   - `npm run lint`
   - `npm run build`
   - 공개 작성자 조회에서 `avatar_path`, `created_at`, `updated_at`이 노출되지 않는지 확인
   - 프로필 변경이 이후 로드/재진입 화면에 2초 이내 반영되는지 확인
   - 작성자 닉네임/아바타 위치를 사용자가 식별할 수 있는지 간단 확인
   - 미로그인 프로필 저장 실패
   - 사용자 A/B 간 프로필 수정/Storage prefix 차단
   - 프로필 있는/없는 글과 댓글 표시
   - 기존 글/댓글 실시간 반영 회귀 테스트

### 2026-05-06 구현 결과

- `supabase/sql/003_profiles.sql`를 추가했다.
  - `profiles` owner-only RLS와 `profile_public` 표시 전용 view를 포함한다.
  - 프로필 avatar Storage write/delete는 `{user_id}/profile/...` prefix로 제한한다.
- `Profile`, `AuthorProfileDisplay`, 프로필 avatar 검증/경로/fallback 헬퍼와 `lib/profiles.ts` 조회/업서트 헬퍼를 추가했다.
- `/profile` 라우트를 추가해 닉네임 저장, avatar 선택/검증/미리보기/업로드, 성공/오류 상태를 구현했다.
- `AuthStatus`는 프로필 닉네임을 우선 표시하고 `/profile` 링크를 제공한다.
- `/posts`와 `/posts/[id]`는 작성자 닉네임/아바타를 표시하고, 프로필 조회 실패 또는 누락 시 기본값과 과거 `author_name` fallback을 사용한다.
- 기존 `guestbook_posts`/`comments` INSERT Realtime 구독과 unmount cleanup은 유지했다.
- 검증: `npm run lint`, `npm run build` 통과.
- 남은 검증: 실제 Supabase 프로젝트에 003 SQL 적용 후 `/profile` 저장, A/B 사용자 권한, public view 노출 필드, 2초 이후 로드 반영, 기존 실시간 회귀를 브라우저에서 확인한다.

### 운영 검증 메모

- 로컬 검증 포트는 `3000`이 아니어도 된다. 예: `npm run dev -- -p 3001` 후 `http://localhost:3001/profile`에서 확인 가능하다.
- Supabase Auth redirect URL을 엄격하게 쓰는 경우, 검증 포트도 Dashboard의 허용 redirect/site URL 설정에 반영한다.
- 공개 표시 전용 view는 Supabase Table Editor에서 `profile_public`을 열어 확인한다.
  - 정상 컬럼: `user_id`, `nickname`, `avatar_url`
  - 노출되면 안 되는 컬럼: `avatar_path`, `created_at`, `updated_at`
  - `profiles` 원본 테이블에는 `avatar_path`, `created_at`, `updated_at`이 존재하는 것이 정상이다.
- 사용자 B 검증 계정은 실제 메일 수신 계정이 없어도 Supabase Dashboard > Authentication > Users에서 직접 생성할 수 있다.
  - 예: `test-b@example.com`과 테스트 비밀번호를 만들고 confirmed 상태로 둔다.
  - 이메일 확인을 요구하는 프로젝트에서는 테스트 후 provider 설정을 원래대로 되돌린다.
- SQL 적용 여부를 빠르게 판단하려면 `profile_public`이 schema cache/Table Editor에 보이는지 먼저 확인한다. 보이지 않으면 앱 검증보다 `supabase/sql/003_profiles.sql` 적용이 선행되어야 한다.
