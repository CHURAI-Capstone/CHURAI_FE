import { useSyncExternalStore, type PropsWithChildren } from 'react'

import { login as requestLogin } from '@/apis/auth'
import { AuthContext } from '@/features/auth/auth.context'
import type { LoginRequest } from '@/features/auth/auth.types'
import {
  hasAccessToken,
  removeAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from '@/features/auth/tokenStorage'

export function AuthProvider({ children }: PropsWithChildren) {
  const isAuthenticated = useSyncExternalStore(
    subscribeToAccessToken,
    hasAccessToken,
  )

  const login = async (request: LoginRequest) => {
    const result = await requestLogin(request)

    setAccessToken(result.accessToken)
  }

  const logout = () => {
    removeAccessToken()
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
