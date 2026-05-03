# AGENTS.md

## 프로젝트 메모리 규칙

이 저장소에서 작업을 시작하기 전에 항상 아래 문서를 먼저 읽는다.

- `memory-bank/architecture.md`
- `memory-bank/implementation-plan.md`
- `memory-bank/progress.md`

이 문서들은 현재 제품 의도, 기술 구조, 구현 순서, 진행 상태의 기준 자료다.

## 문서 갱신 규칙

작업으로 프로젝트 상태가 바뀌면 반드시 memory-bank 문서를 갱신한다.

- 앱 구조, 데이터 모델, 실시간 흐름, 라우트, Storage 전략, 주요 UI 구조가 바뀌면 `memory-bank/architecture.md`를 갱신한다.
- 구현 순서, 완료 기준, 기술 접근 방식이 바뀌면 `memory-bank/implementation-plan.md`를 갱신한다.
- 의미 있는 작업을 완료했거나, 블로커를 발견했거나, 현재 상태가 바뀌면 `memory-bank/progress.md`를 갱신한다.

진행 상황과 중요한 결정은 채팅에만 남기지 말고 memory-bank에 기록한다.

## 제품 요구사항

실시간 전자 방명록을 만든다. 필수 기술 스택은 다음과 같다.

- Next.js 14 App Router
- TypeScript
- TailwindCSS
- Supabase Database
- Supabase Storage
- Supabase Realtime
- HTML Canvas API 또는 React drawing canvas 라이브러리

앱은 방문자가 직접 그림을 그리거나 사진을 첨부해 포스트잇으로 등록하고, 모든 포스트잇을 실시간으로 확인하며, 포스트잇을 열어 댓글을 실시간으로 작성하고 확인할 수 있어야 한다.

## 실시간 구현 규칙

실시간 업데이트는 Supabase Realtime 구독으로 구현한다.

polling이나 수동 새로고침 기반 방식으로 실시간 동작을 구현하지 않는다.

## UI 기준 자료

저장소 루트의 스케치 이미지를 앱의 시각 기준으로 사용한다.

- `sketch/screen1.png`
- `sketch/screen2.png`
- `sketch/screen3.png`

UI는 흰 배경, 검은 선, 손그림 느낌을 중심으로 미니멀하게 구성한다. 첫 화면은 랜딩페이지가 아니라 실제 방명록 등록 경험이어야 한다.

## 작업 방식

- 변경 범위는 요청된 작업에 맞게 유지한다.
- 구현이 생긴 뒤에는 기존 프로젝트 패턴을 우선한다.
- Supabase 데이터 타입은 TypeScript로 명확히 정의한다.
- 그림/사진 등록, 댓글 작성, 빈 상태, 로딩 상태, 에러 상태를 검증한다.
- Supabase Realtime channel은 컴포넌트 unmount 시 정리한다.
