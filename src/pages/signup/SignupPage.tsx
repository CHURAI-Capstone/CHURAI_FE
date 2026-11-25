import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { signup } from '@/apis/auth'
import { Button } from '@/components/ui/Button'
import {
  AuthFeedback,
  AuthField,
  AuthLayout,
} from '@/features/auth/components'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SignupPage() {
  useDocumentTitle('회원가입 | CHURAI')
  const navigate = useNavigate()

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const normalizedNickname = nickname.trim()
    const normalizedEmail = email.trim()

    if (!normalizedNickname || !normalizedEmail || !password || !passwordConfirm) {
      setErrorMessage('모든 항목을 입력해주세요.')
      return
    }

    if (normalizedNickname.length > 20) {
      setErrorMessage('닉네임은 20자 이하로 입력해주세요.')
      return
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setErrorMessage('올바른 이메일 형식을 입력해주세요.')
      return
    }

    if (normalizedEmail.length > 100) {
      setErrorMessage('이메일은 100자 이하로 입력해주세요.')
      return
    }

    if (password.length < 8 || password.length > 64) {
      setErrorMessage('비밀번호는 8자 이상 64자 이하로 입력해주세요.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      setIsSubmitting(true)
      await signup({
        email: normalizedEmail,
        password,
        nickname: normalizedNickname,
      })
      navigate(routePaths.login, {
        replace: true,
        state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' },
      })
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="회원가입" description="츄라이와 함께 새로운 꿀조합을 찾아보세요.">
        <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <AuthField
            id="nickname"
            label="닉네임"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="닉네임을 입력해주세요."
            autoComplete="nickname"
            maxLength={20}
            disabled={isSubmitting}
          />

          <AuthField
            id="signup-email"
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="이메일을 입력해주세요."
            autoComplete="email"
            maxLength={100}
            disabled={isSubmitting}
          />

          <AuthField
            id="signup-password"
            label="비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8자 이상 64자 이하로 입력해주세요."
            autoComplete="new-password"
            minLength={8}
            maxLength={64}
            disabled={isSubmitting}
          />

          <AuthField
            id="password-confirm"
            label="비밀번호 확인"
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="비밀번호를 다시 입력해주세요."
            autoComplete="new-password"
            minLength={8}
            maxLength={64}
            disabled={isSubmitting}
          />

          {errorMessage && (
            <AuthFeedback>{errorMessage}</AuthFeedback>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="mt-2 w-full bg-main text-white hover:bg-main/90"
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <div className="mt-7 flex items-center justify-center gap-2 text-sm">
          <span className="text-gray3">이미 회원이신가요?</span>
          <Link to={routePaths.login} className="font-semibold text-main hover:underline">
            로그인
          </Link>
        </div>
    </AuthLayout>
  )
}
