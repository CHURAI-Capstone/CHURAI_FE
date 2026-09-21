import type { PropsWithChildren } from 'react'

// 전역 상태, 서버 상태, 테마 Provider는 이 컴포넌트에서 조합합니다.
export function AppProviders({ children }: PropsWithChildren) {
  return children
}
