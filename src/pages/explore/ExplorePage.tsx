import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { getPostList, type PostDetailResponse } from '@/apis/board/boardApi'
import BackIcon from '@/assets/icons/back.svg?react'
import ListCard from '@/components/card/ListCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

const SPECTRUM_STAGES = [
  '익숙한 조합',
  '퓨전',
  '신메뉴',
  '실험적 조합',
] as const

const CATEGORY_LABEL: Record<string, string> = {
  MAIN_DISH: '식사',
  DESSERT: '디저트',
}

export function ExplorePage() {
  useDocumentTitle('재료 탐색 | CHURAI')

  const navigate = useNavigate()
  const [ingredientInput, setIngredientInput] = useState('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [recentPosts, setRecentPosts] = useState<PostDetailResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false

    getPostList()
      .then((posts) => {
        if (!cancelled) setRecentPosts(posts)
      })
      .catch(() => {
        if (!cancelled) setHasError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const addIngredient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextIngredient = ingredientInput.trim()

    if (nextIngredient && !ingredients.includes(nextIngredient)) {
      setIngredients((current) => [...current, nextIngredient])
    }
    setIngredientInput('')
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
        <h1 className="heading1-semibold">재료로 탐색</h1>
      </div>

      <section className="border-gray2 border-b pb-6">
        <h2 className="body2-semibold mb-3">핵심 재료</h2>
        <form onSubmit={addIngredient} className="flex gap-2">
          <input
            type="text"
            value={ingredientInput}
            onChange={(event) => setIngredientInput(event.target.value)}
            maxLength={30}
            placeholder="재료 이름"
            aria-label="핵심 재료"
            className="caption1-medium border-gray2 focus:border-main h-11 min-w-0 flex-1 rounded-lg border bg-white px-3 outline-none"
          />
          <button
            type="submit"
            disabled={!ingredientInput.trim()}
            className="caption1-semibold bg-main h-11 min-w-14 rounded-lg px-3 text-white disabled:opacity-50"
          >
            추가
          </button>
        </form>
        {ingredients.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="caption2-medium border-gray2 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5"
              >
                {ingredient}
                <button
                  type="button"
                  onClick={() => setIngredients((current) => current.filter((item) => item !== ingredient))}
                  aria-label={`${ingredient} 제거`}
                  className="text-gray3"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="border-gray2 border-b py-6">
        <h2 className="body2-semibold mb-3">조합 스펙트럼</h2>
        <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="조합 스펙트럼 단계">
          {SPECTRUM_STAGES.map((stage, index) => (
            <button
              key={stage}
              type="button"
              onClick={() => setSelectedStage((current) => current === stage ? null : stage)}
              aria-pressed={selectedStage === stage}
              className={`flex min-h-16 min-w-0 flex-col items-center justify-center rounded-lg border px-1 py-2 transition-colors ${
                selectedStage === stage
                  ? 'border-main bg-sub text-main'
                  : 'border-gray2 bg-white text-gray4'
              }`}
            >
              <span className="caption2-medium">0{index + 1}</span>
              <span className="caption2-medium break-keep text-center">{stage}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="py-6">
        <h2 className="body2-semibold mb-3">탐색 결과</h2>
        <p className="caption1-medium text-gray3 bg-white px-1 py-5 text-center">
          재료와 스펙트럼에 맞는 결과는 서버 탐색 기능이 제공된 후 표시됩니다.
        </p>
      </section>

      <section className="border-gray2 border-t pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="body2-semibold">최근 레시피</h2>
          <button
            type="button"
            onClick={() => navigate(routePaths.board)}
            className="caption1-medium text-main"
          >
            전체 보기
          </button>
        </div>
        {isLoading && <p className="caption1-medium text-gray3 py-4 text-center">불러오는 중...</p>}
        {hasError && <p className="caption1-medium text-main py-4 text-center" role="alert">레시피를 불러오지 못했습니다.</p>}
        {!isLoading && !hasError && recentPosts.length === 0 && (
          <p className="caption1-medium text-gray3 py-4 text-center">등록된 레시피가 없습니다.</p>
        )}
        <div className="flex flex-col gap-2">
          {recentPosts.slice(0, 3).map((post) => (
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
      </section>
    </main>
  )
}
