import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  getPostDetail,
  type PostDetailResponse,
} from '@/apis/board/boardApi'
import BackIcon from '@/assets/icons/back.svg?react'
import EyeIcon from '@/assets/icons/eye.svg?react'
import ForkIcon from '@/assets/icons/fork.svg?react'
import GoodIcon from '@/assets/icons/good.svg?react'
import ImageIcon from '@/assets/icons/image.svg?react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePostActions } from '@/hooks/usePostActions'

const CATEGORY_LABEL = {
  MAIN_DISH: '식사류',
  DESSERT: '디저트류',
} as const

export function BoardDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const numericPostId = Number(postId)
  const { churaid, toggleChurai, interested, toggleInterested } =
    usePostActions(numericPostId)

  const [post, setPost] = useState<PostDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const isValidPostId =
    Boolean(postId) && Number.isInteger(numericPostId) && numericPostId > 0

  useDocumentTitle(
    post ? `${post.title} | CHURAI` : '꿀조합 상세 | CHURAI',
  )

  useEffect(() => {
    if (!postId || !isValidPostId) {
      return
    }

    let cancelled = false

    getPostDetail(postId)
      .then((data) => {
        if (!cancelled) {
          setPost(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage('꿀조합을 불러오지 못했습니다.')
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
  }, [isValidPostId, postId, reloadKey])

  const handleRetry = () => {
    setPost(null)
    setErrorMessage('')
    setIsLoading(true)
    setReloadKey((currentKey) => currentKey + 1)
  }

  if (!isValidPostId) {
    return (
      <DetailError
        message="올바르지 않은 게시글 주소입니다."
        onBack={() => navigate(-1)}
      />
    )
  }

  if (isLoading) {
    return <BoardDetailLoading onBack={() => navigate(-1)} />
  }

  if (!post || errorMessage) {
    return (
      <DetailError
        message={errorMessage || '레시피 정보가 없습니다.'}
        onBack={() => navigate(-1)}
        onRetry={handleRetry}
      />
    )
  }

  const imageUrls = post.imageUrls ?? []

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-107.5 bg-white pb-10">
      <DetailHeader onBack={() => navigate(-1)} />

      <section
        aria-label="꿀조합 이미지"
        className="scrollbar-none flex h-55 snap-x gap-2 overflow-x-auto bg-gray1 p-2"
      >
        {imageUrls.length > 0 ? (
          imageUrls.map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              src={imageUrl}
              alt={`${post.title} 이미지 ${index + 1}`}
              className="h-full min-w-[82%] snap-center rounded-xl object-cover"
            />
          ))
        ) : (
          <div className="text-gray2 flex h-full w-full flex-col items-center justify-center gap-2">
            <ImageIcon className="h-8 w-8" />
            <span className="caption2-medium">등록된 사진이 없습니다.</span>
          </div>
        )}
      </section>

      <div className="px-6 pt-5">
        <section className="border-gray1 flex items-center gap-3 border-b pb-4">
          <div className="bg-sub text-main flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold">
            {post.nickname.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="caption1-semibold truncate">{post.nickname}</p>
            <p className="caption2-regular text-gray3">
              {post.writerId ? `회원 #${post.writerId} · ` : ''}
              {formatDate(post.createdAt)}
            </p>
          </div>
          <span className="caption2-medium bg-gray1 text-gray4 rounded-full px-3 py-1">
            {CATEGORY_LABEL[post.category]}
          </span>
        </section>

        <section className="pt-5">
          <h1 className="heading1-semibold break-words">{post.title}</h1>

          <div className="mt-3 flex items-center gap-3">
            <StatItem
              icon={<ForkIcon className="h-4 w-4" />}
              label="츄라이"
              count={post.churaiCount + (churaid ? 1 : 0)}
              active={churaid}
            />
            <StatItem
              icon={<GoodIcon className="h-4 w-4" />}
              label="흥미"
              count={post.interestedCount + (interested ? 1 : 0)}
              active={interested}
            />
            {post.views != null && (
              <StatItem
                icon={<EyeIcon className="h-4 w-4" />}
                label="조회"
                count={post.views}
              />
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={toggleChurai}
              className={`caption1-semibold flex h-11 items-center justify-center gap-1.5 rounded-xl border transition-colors ${
                churaid
                  ? 'border-main bg-sub text-main'
                  : 'border-sub bg-sub text-main'
              }`}
            >
              <ForkIcon className="h-4 w-4" />
              츄라이
            </button>
            <button
              type="button"
              onClick={toggleInterested}
              className={`caption1-semibold flex h-11 items-center justify-center gap-1.5 rounded-xl border transition-colors ${
                interested
                  ? 'border-gray3 bg-gray1 text-gray4'
                  : 'border-gray2 bg-white text-gray3'
              }`}
            >
              <GoodIcon className="h-4 w-4" />
              흥미로워요
            </button>
          </div>
        </section>

        <InfoSection title="재료">
          {post.ingredients.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {post.ingredients.map((ingredient, index) => (
                <li
                  key={`${ingredient.name}-${index}`}
                  className="caption2-medium bg-gray1 flex min-h-10 items-center justify-between gap-2 rounded-lg px-3 py-2"
                >
                  <span className="break-words">{ingredient.name}</span>
                  {ingredient.amount && (
                    <span className="text-gray3 shrink-0">
                      {ingredient.amount}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyInfo text="등록된 재료 정보가 없습니다." />
          )}
        </InfoSection>

        <InfoSection title="조합 방법">
          <p className="caption1-regular border-gray1 whitespace-pre-wrap break-words rounded-xl border p-4 leading-relaxed text-gray4">
            {post.combinationMethod || '등록된 조합 방법이 없습니다.'}
          </p>
        </InfoSection>

        <InfoSection title="태그">
          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="caption2-medium bg-sub text-main rounded-full px-3 py-1.5"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : (
            <EmptyInfo text="등록된 태그가 없습니다." />
          )}
        </InfoSection>
      </div>
    </main>
  )
}

function DetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="bg-main relative flex h-14 items-center justify-center text-white">
      <button
        type="button"
        onClick={onBack}
        className="absolute left-6 flex h-9 w-9 items-center justify-center"
        aria-label="이전 화면으로 이동"
      >
        <BackIcon className="h-6 w-6" />
      </button>
      <h1 className="body2-semibold">꿀조합 상세</h1>
    </header>
  )
}

function DetailError({
  message,
  onBack,
  onRetry,
}: {
  message: string
  onBack: () => void
  onRetry?: () => void
}) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-107.5 flex-col bg-white">
      <DetailHeader onBack={onBack} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="caption1-medium text-gray3">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="caption1-semibold bg-main rounded-xl px-5 py-2.5 text-white"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  )
}

function BoardDetailLoading({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-107.5 bg-white">
      <DetailHeader onBack={onBack} />
      <div className="bg-gray1 h-55 animate-pulse" />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-gray1 h-10 w-36 animate-pulse rounded-lg" />
        <div className="bg-gray1 h-7 w-3/4 animate-pulse rounded-lg" />
        <div className="bg-gray1 h-24 animate-pulse rounded-xl" />
      </div>
    </div>
  )
}

function InfoSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="border-gray1 mt-6 border-t pt-5">
      <h2 className="caption1-semibold mb-3">{title}</h2>
      {children}
    </section>
  )
}

function EmptyInfo({ text }: { text: string }) {
  return (
    <p className="caption2-regular bg-gray1 text-gray3 rounded-xl px-4 py-3">
      {text}
    </p>
  )
}

function StatItem({
  icon,
  label,
  count,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  count: number
  active?: boolean
}) {
  return (
    <span
      className={`caption2-medium flex items-center gap-1 ${
        active ? 'text-main' : 'text-gray3'
      }`}
      aria-label={`${label} ${count}`}
    >
      {icon}
      {count}
    </span>
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
