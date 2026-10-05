import { useState, type FormEvent } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import {
  AuthFeedback,
  AuthField,
  AuthLayout,
} from '@/features/auth/components'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAuth } from '@/features/auth/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'
interface LoginLocationState {
  from?: string
  message?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const [noticeMessage, setNoticeMessage] = useState(locationState?.message ?? '')

  if (isAuthenticated) {
    return <Navigate to={routePaths.home} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setNoticeMessage('')

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
      setErrorMessage(
        getAuthErrorMessage(
          error,
          '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="로그인" description="나만의 꿀조합을 발견하고 공유해보세요.">
        <form
          className="mt-8 flex flex-col gap-5"
          onSubmit={handleSubmit}
          noValidate
        >
          <AuthField
            id="email"
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="이메일을 입력해주세요."
            autoComplete="email"
            disabled={isSubmitting}
          />

          <AuthField
            id="password"
            label="비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력해주세요."
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          {errorMessage && (
            <AuthFeedback>{errorMessage}</AuthFeedback>
          )}

          {noticeMessage && (
            <AuthFeedback tone="success">{noticeMessage}</AuthFeedback>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="mt-2 w-full bg-main text-white hover:bg-main/90"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-7 flex items-center justify-center gap-2 text-sm">
          <span className="text-gray3">
            아직 회원이 아니신가요?
          </span>

          <Link
            to={routePaths.signup}
            className="font-semibold text-main hover:underline"
          >
            회원가입
          </Link>
        </div>
    </AuthLayout>
  )
}
