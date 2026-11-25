import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  searchPosts,
  type PostDetailResponse,
} from '@/apis/board/boardApi'
import BackIcon from '@/assets/icons/back.svg?react'
import SearchIcon from '@/assets/icons/search.svg?react'
import ListCard from '@/components/card/ListCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

type CategoryFilter = 'ALL' | PostDetailResponse['category']
type SortOption = 'latest' | 'popular'
type SearchType = 'food' | 'ingredient' | 'tag'

const RESULT_CHUNK_SIZE = 10

const CATEGORY_LABEL: Record<PostDetailResponse['category'], string> = {
  MAIN_DISH: '식사',
  DESSERT: '디저트',
}

const SEARCH_TYPE_OPTIONS: Array<{
  label: string
  value: SearchType
}> = [
  { label: '음식명', value: 'food' },
  { label: '재료', value: 'ingredient' },
  { label: '태그', value: 'tag' },
]

const SEARCH_PLACEHOLDER: Record<SearchType, string> = {
  food: '음식명 또는 작성자 검색',
  ingredient: '재료 이름 검색',
  tag: '태그 검색',
}

export function SearchPage() {
  useDocumentTitle('꿀조합 검색 | CHURAI')

  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [searchedKeyword, setSearchedKeyword] = useState('')
  const [posts, setPosts] = useState<PostDetailResponse[]>([])
  const [searchType, setSearchType] = useState<SearchType>('food')
  const [category, setCategory] = useState<CategoryFilter>('ALL')
  const [sort, setSort] = useState<SortOption>('latest')
  const [visibleCount, setVisibleCount] = useState(RESULT_CHUNK_SIZE)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const visiblePosts = useMemo(() => {
    const categoryFilteredPosts = posts.filter(
      (post) => category === 'ALL' || post.category === category,
    )

    return [...categoryFilteredPosts].sort((first, second) => {
      if (sort === 'popular') {
        return (second.views ?? 0) - (first.views ?? 0)
      }

      return Date.parse(second.createdAt) - Date.parse(first.createdAt)
    })
  }, [category, posts, sort])

  const displayedPosts = visiblePosts.slice(0, visibleCount)
  const hasMore = displayedPosts.length < visiblePosts.length

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextKeyword = keyword.trim()

    if (!nextKeyword || isLoading) return

    try {
      setIsLoading(true)
      setErrorMessage('')
      setSearchedKeyword(nextKeyword)
      setVisibleCount(RESULT_CHUNK_SIZE)

      if (searchType !== 'food') {
        setPosts([])
        return
      }

      const result = await searchPosts(nextKeyword)
      const normalizedKeyword = nextKeyword.toLocaleLowerCase('ko-KR')
      setPosts(
        result.filter((post) => {
          const title = post.title.toLocaleLowerCase('ko-KR')
          const nickname = post.nickname.toLocaleLowerCase('ko-KR')

          return (
            title.includes(normalizedKeyword) ||
            nickname.includes(normalizedKeyword)
          )
        }),
      )
    } catch {
      setPosts([])
      setErrorMessage('검색 결과를 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="px-4 pb-10">
      <div className="mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center"
          aria-label="이전 화면으로 이동"
        >
          <BackIcon className="h-5 w-5" />
        </button>
        <h1 className="heading1-semibold">꿀조합 검색</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <label className="border-gray2 focus-within:border-main flex h-11 min-w-0 flex-1 items-center rounded-lg border bg-white px-3">
          <span className="sr-only">검색어</span>
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER[searchType]}
            className="caption1-medium min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray2"
            autoFocus
          />
        </label>
        <button
          type="submit"
          disabled={!keyword.trim() || isLoading}
          className="bg-main flex h-11 w-11 items-center justify-center rounded-lg text-white disabled:bg-gray2"
          aria-label="검색"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </form>

      <section className="border-gray2 mt-5 border-b pb-5" aria-labelledby="search-type-heading">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 id="search-type-heading" className="caption1-semibold">
            검색 유형
          </h2>
          {searchType === 'ingredient' && (
            <button
              type="button"
              onClick={() => navigate(routePaths.explore)}
              className="caption2-medium text-main"
            >
              재료 탐색 화면
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {SEARCH_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSearchType(option.value)
                setKeyword('')
                setSearchedKeyword('')
                setPosts([])
              }}
              aria-pressed={searchType === option.value}
              className={`caption1-medium rounded-full border px-3.5 py-1.5 ${
                searchType === option.value
                  ? 'border-main bg-sub text-main'
                  : 'border-gray2 bg-white text-gray4'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="border-gray2 border-b py-5" aria-labelledby="category-heading">
        <h2 id="category-heading" className="caption1-semibold mb-2">
          카테고리
        </h2>
        <div className="flex gap-2" role="group" aria-label="카테고리 필터">
          {([
            ['ALL', '전체'],
            ['MAIN_DISH', '식사'],
            ['DESSERT', '디저트'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setCategory(value)
                setVisibleCount(RESULT_CHUNK_SIZE)
              }}
              aria-pressed={category === value}
              className={`caption1-medium rounded-full border px-3.5 py-1.5 ${
                category === value
                  ? 'border-main bg-sub text-main'
                  : 'border-gray2 bg-white text-gray3'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {searchedKeyword ? (
        <section className="pt-5" aria-live="polite">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
                <h2 className="body2-semibold truncate">
                  ‘{searchedKeyword}’ {SEARCH_TYPE_OPTIONS.find((option) => option.value === searchType)?.label} 검색 결과
                </h2>
              {!isLoading && !errorMessage && (
                <p className="caption2-regular text-gray3">총 {visiblePosts.length}개</p>
              )}
            </div>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as SortOption)
                setVisibleCount(RESULT_CHUNK_SIZE)
              }}
              aria-label="검색 결과 정렬"
              className="caption1-medium text-gray4 shrink-0 bg-transparent outline-none"
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
            </select>
          </div>

          {isLoading && <SearchResultSkeleton />}
          {errorMessage && (
            <p className="caption1-medium text-main bg-white py-8 text-center" role="alert">
              {errorMessage}
            </p>
          )}
          {!isLoading && !errorMessage && visiblePosts.length === 0 && (
            <p className="caption1-medium text-gray3 bg-white py-8 text-center">
              일치하는 꿀조합이 없습니다.
            </p>
          )}
          {!isLoading && !errorMessage && displayedPosts.length > 0 && (
            <div className="flex flex-col gap-2">
              {displayedPosts.map((post, index) => (
                <ListCard
                  key={post.id}
                  postId={post.id}
                  rank={sort === 'popular' && index < 3 ? index + 1 : undefined}
                  imageUrl={post.thumbnailUrl}
                  category={CATEGORY_LABEL[post.category]}
                  nickname={post.nickname}
                  title={post.title}
                  heungMiCount={post.interestedCount}
                  viewCount={post.views ?? 0}
                  churaiCount={post.churaiCount}
                  onClick={() => navigate(`/posts/${post.id}`)}
                />
              ))}
            </div>
          )}
          {!isLoading && !errorMessage && hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + RESULT_CHUNK_SIZE)}
              className="caption1-semibold border-gray2 mt-4 h-10 w-full rounded-lg border bg-white"
            >
              결과 더보기
            </button>
          )}
        </section>
      ) : (
        <p className="caption1-medium text-gray3 py-12 text-center">
          찾고 싶은 음식명을 검색해보세요.
        </p>
      )}
    </main>
  )
}

function SearchResultSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-label="검색 결과 불러오는 중">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-23.5 animate-pulse rounded-lg bg-white" />
      ))}
    </div>
  )
}
