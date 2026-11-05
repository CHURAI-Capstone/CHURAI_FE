import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getMyInfo } from '@/apis/auth'
import {
  deletePost,
  getPostDetail,
  type PostDetailResponse,
} from '@/apis/board/boardApi'
import {
  cancelPostReaction,
  cancelPostScrap,
  getPostReactions,
  scrapPost,
  selectPostReaction,
  type ReactionCounts,
  type ReactionType,
} from '@/apis/board/postEngagementApi'
import BackIcon from '@/assets/icons/back.svg?react'
import DeleteIcon from '@/assets/icons/delete.svg?react'
import EyeIcon from '@/assets/icons/eye.svg?react'
import ImageIcon from '@/assets/icons/image.svg?react'
import WriteIcon from '@/assets/icons/write.svg?react'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { getAccessToken } from '@/features/auth/tokenStorage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

const CATEGORY_LABEL = {
  MAIN_DISH: '식사류',
  DESSERT: '디저트류',
} as const

const EMPTY_REACTION_COUNTS: ReactionCounts = {
  TRIED: 0,
  DELICIOUS: 0,
  UNIQUE_TASTE: 0,
  NOT_MY_TASTE: 0,
}

const REACTION_OPTIONS: Array<{
  type: ReactionType
  emoji: string
  label: string
  description: string
}> = [
  {
    type: 'TRIED',
    emoji: '🥄',
    label: '먹어봤어요',
    description: '이 조합을 직접 먹어봤어요',
  },
  {
    type: 'DELICIOUS',
    emoji: '😋',
    label: '맛있었어요',
    description: '맛있어서 또 먹고 싶어요',
  },
  {
    type: 'UNIQUE_TASTE',
    emoji: '✨',
    label: '맛이 특이해요',
    description: '색다르고 독특한 맛이에요',
  },
  {
    type: 'NOT_MY_TASTE',
    emoji: '🤔',
    label: '내 취향은 아니에요',
    description: '내 입맛과는 조금 달라요',
  },
]

export function BoardDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const numericPostId = Number(postId)

  const [post, setPost] = useState<PostDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>(
    EMPTY_REACTION_COUNTS,
  )
  const [myReactions, setMyReactions] = useState<ReactionType[]>([])
  const [pendingReaction, setPendingReaction] = useState<ReactionType | null>(
    null,
  )
  const [isReactionLoading, setIsReactionLoading] = useState(true)
  const [reactionMessage, setReactionMessage] = useState('')
  const [isScrapped, setIsScrapped] = useState(false)
  const [scrapCount, setScrapCount] = useState(0)
  const [isScrapPending, setIsScrapPending] = useState(false)
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
          setIsScrapped(data.scrapped ?? false)
          setScrapCount(data.scrapCount ?? 0)
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

  useEffect(() => {
    if (!postId || !isValidPostId) {
      return
    }

    let cancelled = false

    getPostReactions(postId)
      .then((result) => {
        if (!cancelled) {
          setReactionCounts(result.counts)
          setMyReactions(result.myReactions)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReactionMessage('반응 정보를 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsReactionLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isValidPostId, postId, reloadKey])

  useEffect(() => {
    if (!getAccessToken()) {
      return
    }

    let cancelled = false
    getMyInfo()
      .then((me) => {
        if (!cancelled) {
          setCurrentUserId(me.userId)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCurrentUserId(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleRetry = () => {
    setPost(null)
    setErrorMessage('')
    setReactionMessage('')
    setIsLoading(true)
    setIsReactionLoading(true)
    setReloadKey((currentKey) => currentKey + 1)
  }

  const handleDelete = async () => {
    if (!postId || !post || post.writerId !== currentUserId || isDeleting) {
      return
    }

    if (!window.confirm('이 레시피를 삭제하시겠습니까?')) {
      return
    }

    try {
      setActionMessage('')
      setIsDeleting(true)
      await deletePost(postId)
      navigate(routePaths.home, { replace: true })
    } catch (error) {
      setActionMessage(getAuthErrorMessage(error, '레시피 삭제에 실패했습니다.'))
    } finally {
      setIsDeleting(false)
    }
  }

  const requireLogin = () => {
    if (getAccessToken()) {
      return true
    }

    navigate(routePaths.login, {
      state: {
        from: postId
          ? routePaths.postDetail.replace(':postId', postId)
          : routePaths.home,
        message: '반응과 스크랩 기능은 로그인 후 이용할 수 있습니다.',
      },
    })
    return false
  }

  const handleReaction = async (type: ReactionType) => {
    if (!postId || pendingReaction || !requireLogin()) {
      return
    }

    const isSelected = myReactions.includes(type)

    try {
      setPendingReaction(type)
      setReactionMessage('')
      const result = isSelected
        ? await cancelPostReaction(postId, type)
        : await selectPostReaction(postId, type)

      setReactionCounts(result.counts)
      setMyReactions(result.myReactions)
      setReactionMessage(
        isSelected ? '반응을 취소했습니다.' : '반응을 남겼습니다.',
      )
    } catch (error) {
      setReactionMessage(
        getAuthErrorMessage(error, '반응을 처리하지 못했습니다.'),
      )
    } finally {
      setPendingReaction(null)
    }
  }

  const handleScrap = async () => {
    if (!postId || isScrapPending || !requireLogin()) {
      return
    }

    try {
      setIsScrapPending(true)
      setActionMessage('')
      const result = isScrapped
        ? await cancelPostScrap(postId)
        : await scrapPost(postId)

      setIsScrapped(result.scrapped)
      setScrapCount(result.scrapCount)
      setActionMessage(
        result.scrapped
          ? '꿀조합을 스크랩했습니다.'
          : '스크랩을 취소했습니다.',
      )
    } catch (error) {
      setActionMessage(
        getAuthErrorMessage(error, '스크랩을 처리하지 못했습니다.'),
      )
    } finally {
      setIsScrapPending(false)
    }
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
  const isOwner = currentUserId !== null && post.writerId === currentUserId

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

        {isOwner && (
          <div className="border-gray1 flex items-center justify-end gap-3 border-b py-3">
            <button
              type="button"
              onClick={() => navigate(routePaths.postEdit.replace(':postId', String(post.id)))}
              disabled={isDeleting}
              className="caption2-medium text-gray4 flex items-center gap-1 disabled:opacity-60"
            >
              <WriteIcon className="h-4 w-4" />
              수정
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="caption2-medium text-main flex items-center gap-1 disabled:opacity-60"
            >
              <DeleteIcon className="h-4 w-4" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
        {actionMessage && (
          <p className="caption2-medium bg-sub text-main mt-3 rounded-lg px-3 py-2" role="alert">
            {actionMessage}
          </p>
        )}

        <section className="pt-5">
          <h1 className="heading1-semibold break-words">{post.title}</h1>

          <div className="mt-3 flex items-center justify-between gap-3">
            {post.views != null ? (
              <StatItem
                icon={<EyeIcon className="h-4 w-4" />}
                label="조회"
                count={post.views}
              />
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={handleScrap}
              disabled={isScrapPending}
              aria-pressed={isScrapped}
              className={`caption2-medium flex h-9 items-center gap-1.5 rounded-full border px-3 transition-colors disabled:opacity-60 ${
                isScrapped
                  ? 'border-main bg-sub text-main'
                  : 'border-gray2 bg-white text-gray4'
              }`}
            >
              <BookmarkIcon filled={isScrapped} />
              {isScrapPending
                ? '처리 중...'
                : isScrapped
                  ? '스크랩됨'
                  : '스크랩'}
              {scrapCount > 0 && <span>{scrapCount}</span>}
            </button>
          </div>
        </section>

        <InfoSection title="이 조합, 어땠나요?">
          <p className="caption2-regular text-gray3 -mt-1 mb-3">
            먹어본 여부와 맛 평가를 선택해주세요.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {REACTION_OPTIONS.map((option) => {
              const isSelected = myReactions.includes(option.type)
              const isPending = pendingReaction === option.type

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleReaction(option.type)}
                  disabled={isReactionLoading || pendingReaction !== null}
                  aria-pressed={isSelected}
                  aria-label={`${option.label} ${reactionCounts[option.type]}명`}
                  className={`flex min-h-22 flex-col items-start justify-between rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? 'border-main bg-sub shadow-sm'
                      : 'border-gray1 bg-white hover:border-gray2'
                  }`}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="text-xl" aria-hidden="true">
                      {option.emoji}
                    </span>
                    <span
                      className={`caption2-medium rounded-full px-2 py-0.5 font-semibold ${
                        isSelected
                          ? 'bg-main text-white'
                          : 'bg-gray1 text-gray3'
                      }`}
                    >
                      {isPending ? '...' : reactionCounts[option.type]}
                    </span>
                  </span>
                  <span>
                    <strong
                      className={`caption1-semibold block ${
                        isSelected ? 'text-main' : 'text-gray4'
                      }`}
                    >
                      {option.label}
                    </strong>
                    <span className="caption2-regular text-gray3 mt-0.5 block">
                      {option.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          {reactionMessage && (
            <p
              className="caption2-medium bg-gray1 text-gray4 mt-3 rounded-lg px-3 py-2"
              role="status"
            >
              {reactionMessage}
            </p>
          )}
        </InfoSection>

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

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z" />
    </svg>
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
