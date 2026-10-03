import axios from 'axios'
import { useState, type FormEvent } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import Logo from '@/assets/icons/logo.svg?react'
import { useAuth } from '@/features/auth/useAuth'
import { routePaths } from '@/router/paths'
import type { ApiErrorResponse } from '@/types/api'

interface LoginLocationState {
  from?: string
}

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
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locationState = location.state as LoginLocationState | null
  const redirectPath = locationState?.from ?? routePaths.home

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    const normalizedEmail = email.trim()
    const normalizedPassword = password.trim()

    if (!normalizedEmail || !normalizedPassword) {
      setMessage('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      await login({
        email: normalizedEmail,
        password: normalizedPassword,
      })
      navigate(redirectPath, {
        replace: true,
      })
    } catch (error) {
      setMessage(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="bg-gray1 flex min-h-dvh items-center justify-center px-5">
      <section className="w-full max-w-107.5 rounded-2xl bg-white px-6 py-10">
        <div className="flex justify-center">
          <Logo className="text-main h-16 w-auto" />
        </div>

        <div className="mt-8">
          <h1 className="heading1-semibold text-black">
            로그인
          </h1>

          <p className="caption1-regular text-gray3 mt-2">
            츄라이에서 나만의 꿀조합을 만나보세요.
          </p>
        </div>

        <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="email"
              className="caption1-semibold text-gray4 mb-2 block"
            >
              이메일
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="이메일을 입력해주세요."
              autoComplete="email"
              disabled={isSubmitting}
              className="caption1-regular border-gray2 focus:border-main h-12 w-full rounded-lg border bg-white px-4 text-black outline-none placeholder:text-gray3"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="caption1-semibold text-gray4 mb-2 block"
            >
              비밀번호
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="비밀번호를 입력해주세요."
              autoComplete="current-password"
              disabled={isSubmitting}
              className="caption1-regular border-gray2 focus:border-main h-12 w-full rounded-lg border bg-white px-4 text-black outline-none placeholder:text-gray3"
            />
          </div>

          {message && (
            <p className="caption1-regular text-main">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="body2-semibold bg-main mt-2 h-12 w-full rounded-lg text-white"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="caption1-regular mt-6 flex justify-center gap-2">
          <span className="text-gray3">
            아직 회원이 아니신가요?
          </span>

          <Link
            to={routePaths.signup}
            className="text-main font-semibold"
          >
            회원가입
          </Link>
        </div>
      </section>
    </main>
  )
}
