# tyange-cms

`tyange-cms`는 `tyange-cms-api`와 함께 동작하는 내부 운영용 CMS 클라이언트 웹 앱입니다.
현재는 범용 CMS 솔루션이 아니라, **tyange 운영 흐름에 맞춘 전용 UI**를 목표로 합니다.

## 프로젝트 목적

- 콘텐츠(포스트) 운영 작업을 웹에서 빠르게 처리
- 예산/소비 관리 업무를 동일한 관리자 화면에서 처리
- `tyange-cms-api`의 관리자 기능을 브라우저에서 사용 가능하도록 제공

## 현재 제공 기능

- 관리자 로그인
- 블로그 포스트 목록 조회/등록/수정/삭제
- 포스트 이미지 업로드
- 태그/카테고리 데이터 조회
- 소비 내역 조회/등록/수정/삭제
- 카드 엑셀 기반 주간 예산 계산 및 주차 예산 저장

## 기술 스택

- Runtime / Package Manager: Bun
- Framework: Nuxt 4 (Vue 3, TypeScript)
- UI: `@nuxt/ui`, Tailwind CSS 4
- State: Pinia (+ persisted state)
- Editor: `md-editor-v3`, `nuxt-tiptap-editor`
