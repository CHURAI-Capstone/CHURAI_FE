import axios from 'axios'
import { useState, type FormEvent } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import Logo from '@/assets/icons/logo.svg?react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'
import type { ApiErrorResponse } from '@/types/api'

interface LoginLocationState {
  from?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getLoginErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
}

export function LoginPage() {
  useDocumentTitle('로그인 | CHURAI')

  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locationState = location.state as LoginLocationState | null
  const redirectPath = locationState?.from ?? routePaths.home

  if (isAuthenticated) {
    return <Navigate to={routePaths.home} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const normalizedEmail = email.trim()

    if (!normalizedEmail || !password) {
      setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setErrorMessage('올바른 이메일 형식을 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      await login({
        email: normalizedEmail,
        password,
      })

      navigate(redirectPath, {
        replace: true,
      })
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-5 py-10">
      <section className="w-full max-w-[430px]">
        <div className="mb-12 text-center">
          <Link
            to={routePaths.home}
            className="inline-flex text-[#FD4A12]"
            aria-label="츄라이 홈"
          >
            <Logo className="h-14 w-auto" />
          </Link>

          <p className="mt-3 text-sm text-gray-500">
            비주류라고? 일단 츄라이!
          </p>
        </div>

        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-[#0A0A0A]">
            로그인
          </h1>

          <p className="mt-2 text-sm text-[#8A949E]">
            나만의 꿀조합을 발견하고 공유해보세요.
          </p>
        </div>

        <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#464C53]"
            >
              이메일
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력해주세요."
              autoComplete="email"
              disabled={isSubmitting}
              className="h-13 w-full rounded-lg border border-[#CDD1D5] bg-white px-4 text-[15px] text-[#0A0A0A] outline-none transition placeholder:text-[#8A949E] focus:border-[#FD4A12] focus:ring-3 focus:ring-[#FD4A12]/10 disabled:bg-[#F4F5F6]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-[#464C53]"
            >
              비밀번호
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해주세요."
              autoComplete="current-password"
              disabled={isSubmitting}
              className="h-13 w-full rounded-lg border border-[#CDD1D5] bg-white px-4 text-[15px] text-[#0A0A0A] outline-none transition placeholder:text-[#8A949E] focus:border-[#FD4A12] focus:ring-3 focus:ring-[#FD4A12]/10 disabled:bg-[#F4F5F6]"
            />
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg bg-[#FFEDE7] px-4 py-3 text-sm font-medium text-[#FD4A12]"
            >
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="mt-2 w-full bg-[#FD4A12] text-white hover:bg-[#FD4A12]/90"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-7 flex items-center justify-center gap-2 text-sm">
          <span className="text-[#8A949E]">
            아직 회원이 아니신가요?
          </span>

          <Link
            to={routePaths.signup}
            className="font-semibold text-[#FD4A12] hover:underline"
          >
            회원가입
          </Link>
        </div>
      </section>
    </main>
  )
}
