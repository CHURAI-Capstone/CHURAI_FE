import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getPostPage, type PostDetailResponse } from '@/apis/board/boardApi'
import BackIcon from '@/assets/icons/back.svg?react'
import ListCard from '@/components/card/ListCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

const CATEGORY_LABEL: Record<string, string> = {
  MAIN_DISH: '식사',
  DESSERT: '디저트',
}

export function BoardPage() {
  useDocumentTitle('전체 레시피 | CHURAI')

  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostDetailResponse[]>([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    getPostPage()
      .then((result) => {
        if (cancelled) return
        setPosts(result.posts)
        setHasNext(result.hasNext)
      })
      .catch(() => {
        if (!cancelled) setErrorMessage('레시피를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const loadMore = async () => {
    if (isLoading || !hasNext) return

    try {
      setIsLoading(true)
      setErrorMessage('')
      const nextPage = page + 1
      const result = await getPostPage(nextPage)
      setPosts((current) => [...current, ...result.posts])
      setPage(nextPage)
      setHasNext(result.hasNext)
    } catch {
      setErrorMessage('레시피를 더 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="px-4 pb-10">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(routePaths.home)}
          className="flex h-9 w-9 shrink-0 items-center justify-center"
          aria-label="홈으로 이동"
        >
          <BackIcon className="h-5 w-5" />
        </button>
        <h1 className="heading1-semibold flex-1">전체 레시피</h1>
        <button
          type="button"
          onClick={() => navigate(routePaths.explore)}
          className="caption1-semibold text-main"
        >
          재료로 탐색
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {posts.map((post) => (
          <ListCard
            key={post.id}
            postId={post.id}
            imageUrl={post.thumbnailUrl}
            category={CATEGORY_LABEL[post.category] ?? post.category}
            nickname={post.nickname}
            title={post.title}
            heungMiCount={post.interestedCount}
            viewCount={post.views ?? 0}
            churaiCount={post.churaiCount}
            onClick={() => navigate(`/posts/${post.id}`)}
          />
        ))}
      </div>

      {isLoading && <p className="caption1-medium text-gray3 py-5 text-center">불러오는 중...</p>}
      {!isLoading && !errorMessage && posts.length === 0 && (
        <p className="caption1-medium text-gray3 py-5 text-center">등록된 레시피가 없습니다.</p>
      )}
      {errorMessage && <p className="caption1-medium text-main py-5 text-center" role="alert">{errorMessage}</p>}
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
    </main>
  )
}
