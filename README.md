# CHURAI Frontend

React, TypeScript, Vite, Tailwind CSS 기반의 CHURAI 프론트엔드 프로젝트입니다.

## 시작하기

```bash
pnpm install
pnpm dev
```

## 명령어

```bash
pnpm dev      # 개발 서버 실행
pnpm build    # 타입 검사 및 프로덕션 빌드
pnpm lint     # ESLint 검사
pnpm preview  # 프로덕션 빌드 미리보기
```

## 디렉터리 구조

```text
src/
├─ api/                 # HTTP 클라이언트와 API 모듈
├─ app/                 # 전역 Provider와 앱 초기화
├─ assets/              # 이미지, 아이콘, 폰트 등 정적 리소스
├─ components/
│  ├─ layout/           # Header, Footer를 포함한 공통 레이아웃
│  └─ ui/               # 재사용 가능한 기본 UI 컴포넌트
├─ constants/           # 환경 설정과 공통 상수
├─ features/            # 도메인 기능 단위 모듈
├─ hooks/               # 공통 React 훅
├─ lib/                 # 외부 라이브러리 연동과 핵심 헬퍼
├─ pages/               # 라우트 단위 페이지
├─ routes/              # 라우트 경로와 라우터 설정
├─ stores/              # 클라이언트 전역 상태
├─ styles/              # 전역 스타일과 디자인 토큰
├─ types/               # 공통 TypeScript 타입
├─ utils/               # 범용 순수 유틸리티
├─ App.tsx              # 루트 앱 컴포넌트
└─ main.tsx             # 브라우저 진입점
```

## 설계 원칙

- 내부 모듈은 `@/` 경로 별칭을 사용합니다.
- 공통 색상과 폰트, 그림자는 `src/styles/globals.css`의 `@theme`에서 관리합니다.
- 기본 UI 컴포넌트는 스타일 변형을 컴포넌트 내부에 모아 일관성을 유지합니다.
- 환경 변수는 `VITE_` 접두사를 사용하고 `.env.example`에 키를 문서화합니다.
