import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getMyInfo } from '@/apis/auth'
import type { CommentType } from '@/apis/board/boardApi'
import {
  getMyComments,
  getMyPosts,
  getMyReactions,
  getMyScraps,
  getMyTriedPosts,
  type ActivityPage,
  type MyComment,
  type MyPost,
  type MyReaction,
  type TasteType,
} from '@/apis/myActivity'
import BackIcon from '@/assets/icons/back.svg?react'
import NextIcon from '@/assets/icons/next.svg?react'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import type { MyInfoResult } from '@/features/auth/auth.types'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

type ActivityTab = 'posts' | 'scraps' | 'tried' | 'reactions' | 'comments'
type ActivityItem =
  | { kind: 'post'; data: MyPost }
  | { kind: 'reaction'; data: MyReaction }
  | { kind: 'comment'; data: MyComment }

const TABS: { value: ActivityTab; label: string; countKey: keyof NonNullable<MyInfoResult['activity']> }[] = [
  { value: 'posts', label: '작성한 꿀조합', countKey: 'postCount' },
  { value: 'scraps', label: '스크랩', countKey: 'scrapCount' },
  { value: 'tried', label: '먹어본 조합', countKey: 'triedCount' },
  { value: 'reactions', label: '맛 평가', countKey: 'tasteReactionCount' },
  { value: 'comments', label: '댓글·후기', countKey: 'commentCount' },
]

const CATEGORY_LABEL: Record<MyPost['category'], string> = {
  MAIN_DISH: '식사',
  DESSERT: '디저트',
}

const COMMENT_LABEL: Record<CommentType, string> = {
  GENERAL: '댓글',
  REVIEW: '후기',
  VARIATION: '변형 조합',
}

export function MyActivityPage() {
  useDocumentTitle('내 활동 | CHURAI')

  const navigate = useNavigate()
  const [me, setMe] = useState<MyInfoResult | null>(null)
  const [profileError, setProfileError] = useState('')
  const [tab, setTab] = useState<ActivityTab>('posts')
  const [tasteFilter, setTasteFilter] = useState<TasteType | ''>('')
  const [commentFilter, setCommentFilter] = useState<CommentType | ''>('')

  useEffect(() => {
    let cancelled = false

    getMyInfo()
      .then((result) => {
        if (!cancelled) setMe(result)
      })
      .catch((error: unknown) => {
        if (!cancelled) setProfileError(getAuthErrorMessage(error, '사용자 정보를 불러오지 못했습니다.'))
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="px-4 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(routePaths.home)}
          className="flex h-9 w-9 shrink-0 items-center justify-center"
          aria-label="홈으로 이동"
        >
          <BackIcon className="h-5 w-5" />
        </button>
        <h1 className="heading1-semibold">내 활동</h1>
      </div>

      <section className="border-gray2 border-b pb-5">
        <p className="body2-semibold">{me ? `${me.nickname}님` : '마이페이지'}</p>
        {profileError && <p className="caption2-medium text-main mt-2" role="alert">{profileError}</p>}
      </section>

      <div className="scrollbar-none border-gray2 -mx-4 mt-1 flex overflow-x-auto border-b px-4" role="tablist" aria-label="개인 활동">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            aria-controls="activity-panel"
            onClick={() => setTab(item.value)}
            className={`caption1-medium h-12 shrink-0 border-b-2 px-3 whitespace-nowrap ${tab === item.value ? 'border-main text-main' : 'border-transparent text-gray3'}`}
          >
            {item.label}
            {me?.activity && <span className="caption2-medium ml-1">{me.activity[item.countKey]}</span>}
          </button>
        ))}
      </div>

      {tab === 'reactions' && (
        <div className="mt-4 flex items-center justify-between">
          <label htmlFor="taste-filter" className="caption1-medium text-gray4">맛 평가 종류</label>
          <select
            id="taste-filter"
            value={tasteFilter}
            onChange={(event) => setTasteFilter(event.target.value as TasteType | '')}
            className="caption1-medium border-gray2 h-9 rounded-lg border bg-white px-2"
          >
            <option value="">전체</option>
            <option value="DELICIOUS">맛있었어요</option>
            <option value="UNIQUE_TASTE">맛이 특이해요</option>
            <option value="NOT_MY_TASTE">내 취향은 아니에요</option>
          </select>
        </div>
      )}

      {tab === 'comments' && (
        <div className="mt-4 flex items-center justify-between">
          <label htmlFor="comment-filter" className="caption1-medium text-gray4">작성 종류</label>
          <select
            id="comment-filter"
            value={commentFilter}
            onChange={(event) => setCommentFilter(event.target.value as CommentType | '')}
            className="caption1-medium border-gray2 h-9 rounded-lg border bg-white px-2"
          >
            <option value="">전체</option>
            <option value="GENERAL">댓글</option>
            <option value="REVIEW">후기</option>
            <option value="VARIATION">변형 조합</option>
          </select>
        </div>
      )}

      <ActivityList
        key={`${tab}-${tasteFilter}-${commentFilter}`}
        tab={tab}
        tasteFilter={tasteFilter || undefined}
        commentFilter={commentFilter || undefined}
      />
    </main>
  )
}

function ActivityList({
  tab,
  tasteFilter,
  commentFilter,
}: {
  tab: ActivityTab
  tasteFilter?: TasteType
  commentFilter?: CommentType
}) {
  const navigate = useNavigate()
  const [items, setItems] = useState<ActivityItem[]>([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    loadActivity(tab, 0, tasteFilter, commentFilter)
      .then((result) => {
        if (cancelled) return
        setItems(result.items)
        setHasNext(result.hasNext)
        setTotal(result.totalElements)
      })
      .catch((error: unknown) => {
        if (!cancelled) setErrorMessage(getAuthErrorMessage(error, '활동 내역을 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tab, tasteFilter, commentFilter, retryKey])

  const loadMore = async () => {
    if (isLoading || !hasNext) return

    setIsLoading(true)
    setErrorMessage('')
    try {
      const nextPage = page + 1
      const result = await loadActivity(tab, nextPage, tasteFilter, commentFilter)
      setItems((current) => [...current, ...result.items])
      setPage(nextPage)
      setHasNext(result.hasNext)
      setTotal(result.totalElements)
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, '다음 활동 내역을 불러오지 못했습니다.'))
    } finally {
      setIsLoading(false)
    }
  }

  const retry = () => {
    setErrorMessage('')
    setIsLoading(true)
    setRetryKey((current) => current + 1)
  }

  return (
    <section id="activity-panel" role="tabpanel" className="pt-4">
      {!isLoading && !errorMessage && <p className="caption2-medium text-gray3 mb-3">전체 {total}개</p>}

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          if (item.kind === 'post') {
            return <PostRow key={item.data.postId} post={item.data} onOpen={() => navigate(`/posts/${item.data.postId}`)} />
          }
          if (item.kind === 'reaction') {
            return (
              <div key={`${item.data.post.postId}-${item.data.reactionType}`}>
                <p className="caption2-medium text-main mb-1 pl-1">{item.data.reactionDescription} · {formatDate(item.data.reactedAt)}</p>
                <PostRow post={item.data.post} onOpen={() => navigate(`/posts/${item.data.post.postId}`)} />
              </div>
            )
          }
          return (
            <button
              key={item.data.commentId}
              type="button"
              onClick={() => navigate(`/posts/${item.data.postId}`)}
              className="w-full rounded-lg bg-white p-3 text-left"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="caption2-medium text-main shrink-0">{item.data.parentId ? '답글' : COMMENT_LABEL[item.data.type]}</span>
                <span className="caption2-regular text-gray3 shrink-0">{formatDate(item.data.createdAt)}</span>
              </div>
              <p className="caption1-semibold truncate">{item.data.postTitle}</p>
              <p className="caption1-regular text-gray4 mt-1 line-clamp-2 whitespace-pre-wrap break-words">{item.data.contents}</p>
            </button>
          )
        })}
      </div>

      {isLoading && <p className="caption1-medium text-gray3 py-6 text-center">불러오는 중...</p>}
      {!isLoading && !errorMessage && items.length === 0 && (
        <p className="caption1-medium text-gray3 py-8 text-center">활동 내역이 없습니다.</p>
      )}
      {errorMessage && (
        <div className="py-5 text-center">
          <p className="caption1-medium text-main" role="alert">{errorMessage}</p>
          {items.length === 0 && (
            <button type="button" onClick={retry} className="caption1-semibold text-main mt-3">다시 시도</button>
          )}
        </div>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={loadMore}
          disabled={isLoading}
          className="caption1-semibold border-gray2 mt-4 h-10 w-full rounded-lg border bg-white disabled:opacity-60"
        >
          더보기
        </button>
      )}
    </section>
  )
}

function PostRow({ post, onOpen }: { post: MyPost; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="flex min-h-23.5 w-full items-center gap-3 rounded-lg bg-white p-3 text-left">
      <div className="bg-gray1 h-17.5 w-17.5 shrink-0 overflow-hidden rounded-lg">
        {post.thumbnailUrl && <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="caption2-medium text-gray3">{CATEGORY_LABEL[post.category]} · {formatDate(post.createdAt)}</p>
        <p className="caption1-semibold mt-1 line-clamp-1">{post.title}</p>
        {post.summary && <p className="caption2-regular text-gray3 mt-1 line-clamp-1">{post.summary}</p>}
      </div>
      <NextIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
    </button>
  )
}

async function loadActivity(
  tab: ActivityTab,
  page: number,
  tasteFilter?: TasteType,
  commentFilter?: CommentType,
): Promise<ActivityPage<ActivityItem>> {
  if (tab === 'reactions') {
    const result = await getMyReactions(page, tasteFilter)
    return { ...result, items: result.items.map((data) => ({ kind: 'reaction' as const, data })) }
  }
  if (tab === 'comments') {
    const result = await getMyComments(page, commentFilter)
    return { ...result, items: result.items.map((data) => ({ kind: 'comment' as const, data })) }
  }

  const result = tab === 'posts'
    ? await getMyPosts(page)
    : tab === 'scraps'
      ? await getMyScraps(page)
      : await getMyTriedPosts(page)
  return { ...result, items: result.items.map((data) => ({ kind: 'post' as const, data })) }
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}
