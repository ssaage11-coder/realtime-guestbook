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
