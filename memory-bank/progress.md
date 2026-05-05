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
