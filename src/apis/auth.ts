import { api } from '@/apis/http'
import type { LoginRequest, LoginResult } from '@/features/auth/auth.types'
import type { ApiResponse } from '@/types/api'

const AUTH_ENDPOINTS = {
  login: '/v1/auth/login',
} as const

export async function login(request: LoginRequest): Promise<LoginResult> {
  const { data } = await api.post<ApiResponse<LoginResult>>(
    AUTH_ENDPOINTS.login,
    request,
  )

  if (!data.isSuccess || !data.result?.accessToken) {
    throw new Error(data.message || '로그인에 실패했습니다.')
  }

  return data.result
}
