import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import Logo from '@/assets/icons/logo.svg?react'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export function SignupPage() {
  useDocumentTitle('회원가입 | CHURAI')

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const normalizedNickname = nickname.trim()
    const normalizedEmail = email.trim()

    if (!normalizedNickname || !normalizedEmail || !password || !passwordConfirm) {
      setErrorMessage('모든 항목을 입력해주세요.')
      return
    }

    if (normalizedNickname.length < 2 || normalizedNickname.length > 12) {
      setErrorMessage('닉네임은 2자 이상 12자 이하로 입력해주세요.')
      return
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setErrorMessage('올바른 이메일 형식을 입력해주세요.')
      return
    }

    if (!PASSWORD_PATTERN.test(password)) {
      setErrorMessage('비밀번호는 영문과 숫자를 포함해 8자 이상 입력해주세요.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않습니다.')
      return
    }

    setSuccessMessage('입력 정보가 확인되었습니다.')
  }

  const inputClassName = 'h-13 w-full rounded-lg border border-[#CDD1D5] bg-white px-4 text-[15px] text-[#0A0A0A] outline-none transition placeholder:text-[#8A949E] focus:border-[#FD4A12] focus:ring-3 focus:ring-[#FD4A12]/10'
  const labelClassName = 'mb-2 block text-sm font-semibold text-[#464C53]'

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
            회원가입
          </h1>

          <p className="mt-2 text-sm text-[#8A949E]">
            츄라이와 함께 새로운 꿀조합을 찾아보세요.
          </p>
        </div>

        <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="nickname" className={labelClassName}>닉네임</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="닉네임을 입력해주세요."
              autoComplete="nickname"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="signup-email" className={labelClassName}>이메일</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력해주세요."
              autoComplete="email"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="signup-password" className={labelClassName}>비밀번호</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="영문, 숫자 포함 8자 이상 입력해주세요."
              autoComplete="new-password"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="password-confirm" className={labelClassName}>비밀번호 확인</label>
            <input
              id="password-confirm"
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              placeholder="비밀번호를 다시 입력해주세요."
              autoComplete="new-password"
              className={inputClassName}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="rounded-lg bg-[#FFEDE7] px-4 py-3 text-sm font-medium text-[#FD4A12]">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p role="status" className="rounded-lg bg-[#FFEDE7] px-4 py-3 text-sm font-medium text-[#FD4A12]">
              {successMessage}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full bg-[#FD4A12] text-white hover:bg-[#FD4A12]/90"
          >
            회원가입
          </Button>
        </form>

        <div className="mt-7 flex items-center justify-center gap-2 text-sm">
          <span className="text-[#8A949E]">이미 회원이신가요?</span>
          <Link to={routePaths.login} className="font-semibold text-[#FD4A12] hover:underline">
            로그인
          </Link>
        </div>
      </section>
    </main>
  )
}
