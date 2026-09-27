import { useState, type PropsWithChildren } from 'react'

import { login as requestLogin } from '@/apis/auth'
import { AuthContext } from '@/features/auth/auth.context'
import type { LoginRequest } from '@/features/auth/auth.types'
import {
  hasAccessToken,
  removeAccessToken,
  setAccessToken,
} from '@/features/auth/tokenStorage'

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasAccessToken)

  const login = async (request: LoginRequest) => {
    const result = await requestLogin(request)

    setAccessToken(result.accessToken)
    setIsAuthenticated(true)
  }

  const logout = () => {
    removeAccessToken()
    setIsAuthenticated(false)
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