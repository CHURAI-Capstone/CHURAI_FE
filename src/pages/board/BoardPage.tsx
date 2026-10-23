import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getPostPage, type PostDetailResponse } from '@/apis/board/boardApi'
import BackIcon from '@/assets/icons/back.svg?react'
import SearchIcon from '@/assets/icons/search.svg?react'
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
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<'ALL' | PostDetailResponse['category']>('ALL')
  const [sort, setSort] = useState<'latest' | 'popular'>('latest')

  const normalizedKeyword = keyword.trim().toLocaleLowerCase()
  const visiblePosts = posts
    .filter((post) => category === 'ALL' || post.category === category)
    .filter((post) => post.title.toLocaleLowerCase().includes(normalizedKeyword))
    .sort((first, second) => sort === 'popular'
      ? (second.views ?? 0) - (first.views ?? 0)
      : Date.parse(second.createdAt) - Date.parse(first.createdAt))

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

      <div className="border-gray2 mb-4 flex h-11 items-center gap-2 rounded-lg border bg-white px-3">
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="레시피명 검색"
          aria-label="레시피명 검색"
          className="caption1-medium min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray2"
        />
        <SearchIcon className="text-main h-5 w-5 shrink-0" aria-hidden="true" />
      </div>

      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex gap-1.5" role="group" aria-label="카테고리">
          {([
            ['ALL', '전체'],
            ['MAIN_DISH', '식사'],
            ['DESSERT', '디저트'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              aria-pressed={category === value}
              className={`caption2-medium h-8 rounded-full border px-3 ${category === value ? 'border-main text-main' : 'border-gray2 text-gray3'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as 'latest' | 'popular')}
          aria-label="정렬"
          className="caption1-medium text-gray4 min-w-0 bg-transparent"
        >
          <option value="latest">최신순</option>
          <option value="popular">조회순</option>
        </select>
      </div>

      <p className="caption2-regular text-gray3 mb-3">검색·정렬은 불러온 레시피에 적용됩니다.</p>

      <div className="flex flex-col gap-2">
        {visiblePosts.map((post) => (
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
      {!isLoading && !errorMessage && posts.length > 0 && visiblePosts.length === 0 && (
        <p className="caption1-medium text-gray3 py-5 text-center">일치하는 레시피가 없습니다.</p>
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
