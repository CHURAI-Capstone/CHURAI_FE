import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { getMyInfo, updateMyInfo } from '@/apis/auth'
import type { MyInfoResult } from '@/features/auth/auth.types'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useAuth } from '@/features/auth/useAuth'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

export function MyPage() {
  useDocumentTitle('마이페이지 | CHURAI')

  const navigate = useNavigate()
  const { logout } = useAuth()
  const [profile, setProfile] = useState<MyInfoResult | null>(null)
  const [nickname, setNickname] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    getMyInfo()
      .then((result) => {
        if (!cancelled) {
          setProfile(result)
          setNickname(result.nickname)
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(
            getAuthErrorMessage(error, '프로필 정보를 불러오지 못했습니다.'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const handleRetry = () => {
    setErrorMessage('')
    setIsLoading(true)
    setReloadKey((current) => current + 1)
  }

  const handleEdit = () => {
    if (!profile) {
      return
    }

    setNickname(profile.nickname)
    setErrorMessage('')
    setSuccessMessage('')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setNickname(profile?.nickname ?? '')
    setErrorMessage('')
    setIsEditing(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!profile || isSubmitting) {
      return
    }

    const normalizedNickname = nickname.trim()
    setErrorMessage('')
    setSuccessMessage('')

    if (!normalizedNickname) {
      setErrorMessage('닉네임을 입력해주세요.')
      return
    }

    if (normalizedNickname.length > 20) {
      setErrorMessage('닉네임은 20자 이하로 입력해주세요.')
      return
    }

    if (normalizedNickname === profile.nickname) {
      setIsEditing(false)
      return
    }

    try {
      setIsSubmitting(true)
      const updatedProfile = await updateMyInfo({
        nickname: normalizedNickname,
      })
      setProfile(updatedProfile)
      setNickname(updatedProfile.nickname)
      setSuccessMessage('프로필이 수정되었습니다.')
      setIsEditing(false)
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, '프로필을 수정하지 못했습니다.'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate(routePaths.login, { replace: true })
  }

  if (isLoading) {
    return <MyPageLoading />
  }

  if (!profile) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="bg-sub text-main flex h-14 w-14 items-center justify-center rounded-full">
          <UserIcon className="h-7 w-7" />
        </div>
        <h1 className="heading1-semibold mt-4">프로필을 불러오지 못했어요</h1>
        <p className="caption1-regular text-gray3 mt-2">
          {errorMessage || '잠시 후 다시 시도해주세요.'}
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="caption1-semibold bg-main mt-5 rounded-xl px-5 py-2.5 text-white"
        >
          다시 시도
        </button>
      </main>
    )
  }

  return (
    <main className="flex-1 px-4 pb-10">
      <section className="rounded-2xl bg-white px-5 py-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-sub text-main flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-semibold">
            {profile.nickname.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="heading1-semibold truncate">{profile.nickname}</p>
            <p className="caption1-regular text-gray3 mt-0.5 truncate">
              {profile.email}
            </p>
            <span className="caption2-medium bg-sub text-main mt-2 inline-block rounded-full px-2.5 py-1">
              츄라이 회원
            </span>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-white px-5 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="body1-semibold">내 프로필</h1>
            <p className="caption2-regular text-gray3 mt-0.5">
              회원 정보를 확인하고 수정할 수 있어요.
            </p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="caption1-semibold text-main flex items-center gap-1"
            >
              <EditIcon className="h-4 w-4" />
              수정
            </button>
          )}
        </div>

        {isEditing ? (
          <form className="mt-5" onSubmit={handleSubmit} noValidate>
            <label htmlFor="profile-nickname" className="caption1-semibold block">
              닉네임
            </label>
            <div className="relative mt-2">
              <input
                id="profile-nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={20}
                autoComplete="nickname"
                disabled={isSubmitting}
                className="caption1-regular border-gray2 focus:border-main h-12 w-full rounded-xl border px-4 pr-14 outline-none disabled:bg-gray1"
                placeholder="닉네임을 입력해주세요."
              />
              <span className="caption2-regular text-gray3 absolute top-1/2 right-4 -translate-y-1/2">
                {nickname.length}/20
              </span>
            </div>
            <p className="caption2-regular text-gray3 mt-2">
              다른 사용자에게 표시되는 이름입니다.
            </p>

            {errorMessage && (
              <p className="caption2-medium bg-sub text-main mt-4 rounded-lg px-3 py-2" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="caption1-semibold border-gray2 text-gray4 h-11 rounded-xl border disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="caption1-semibold bg-main h-11 rounded-xl text-white disabled:opacity-60"
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        ) : (
          <dl className="mt-5 divide-y divide-gray1">
            <ProfileRow label="닉네임" value={profile.nickname} />
            <ProfileRow label="이메일" value={profile.email} />
            <ProfileRow label="가입일" value={formatDate(profile.createdAt)} />
          </dl>
        )}

        {successMessage && !isEditing && (
          <p className="caption2-medium mt-4 rounded-lg bg-[#EAF8F1] px-3 py-2 text-[#16835B]" role="status">
            {successMessage}
          </p>
        )}
      </section>

      <section className="mt-4 rounded-2xl bg-white px-5 py-2 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(routePaths.board)}
          className="flex w-full items-center justify-between py-4 text-left"
        >
          <span className="flex items-center gap-3">
            <span className="bg-gray1 text-gray4 flex h-9 w-9 items-center justify-center rounded-full">
              <RecipeIcon className="h-5 w-5" />
            </span>
            <span>
              <strong className="caption1-semibold block">꿀조합 둘러보기</strong>
              <span className="caption2-regular text-gray3">새로운 조합을 확인해보세요.</span>
            </span>
          </span>
          <ChevronIcon className="text-gray2 h-5 w-5" />
        </button>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="caption1-medium text-gray3 mt-6 w-full py-3 underline underline-offset-4"
      >
        로그아웃
      </button>
    </main>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <dt className="caption1-medium text-gray3 shrink-0">{label}</dt>
      <dd className="caption1-medium text-gray4 min-w-0 truncate text-right">{value}</dd>
    </div>
  )
}

function MyPageLoading() {
  return (
    <main className="flex-1 animate-pulse px-4 pb-10">
      <section className="flex items-center gap-4 rounded-2xl bg-white px-5 py-6">
        <div className="bg-gray1 h-16 w-16 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="bg-gray1 h-6 w-24 rounded" />
          <div className="bg-gray1 h-4 w-40 rounded" />
        </div>
      </section>
      <section className="mt-4 rounded-2xl bg-white px-5 py-5">
        <div className="bg-gray1 h-6 w-28 rounded" />
        <div className="mt-6 flex flex-col gap-4">
          <div className="bg-gray1 h-12 rounded-xl" />
          <div className="bg-gray1 h-12 rounded-xl" />
          <div className="bg-gray1 h-12 rounded-xl" />
        </div>
      </section>
    </main>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="m4 20 4.2-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
      <path d="m14.5 6.7 2.8 2.8" />
    </svg>
  )
}

function RecipeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
