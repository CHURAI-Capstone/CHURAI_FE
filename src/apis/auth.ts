import { api } from '@/apis/http'
import type {
  LoginRequest,
  LoginResult,
  SignupRequest,
  SignupResult,
} from '@/features/auth/auth.types'
import type { ApiResponse } from '@/types/api'

const AUTH_ENDPOINTS = {
  login: '/auth/login',
  signup: '/auth/signup',
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

export async function signup(request: SignupRequest): Promise<SignupResult> {
  const { data } = await api.post<ApiResponse<SignupResult>>(
    AUTH_ENDPOINTS.signup,
    request,
  )

  if (!data.isSuccess || data.result?.userId == null) {
    throw new Error(data.message || '회원가입에 실패했습니다.')
  }

  return data.result
}
