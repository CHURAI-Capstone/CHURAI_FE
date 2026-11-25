import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRankings } from '@/apis/ranking'
import type { ReactionType } from '@/apis/board/postEngagementApi'
import type { RankedPost, RankingCategory, RankingCriteria } from '@/apis/ranking'
import BackIcon from '@/assets/icons/back.svg?react'
import badge1 from '@/assets/icons/1st-badge.svg'
import badge2 from '@/assets/icons/2nd-badge.svg'
import badge3 from '@/assets/icons/3rd-badge.svg'
import EyeIcon from '@/assets/icons/eye.svg?react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

const CRITERIA: { value: RankingCriteria; label: string }[] = [
  { value: 'VIEWS', label: '조회수' },
  { value: 'TRIED', label: '먹어본 사람' },
  { value: 'DELICIOUS', label: '맛있었어요' },
  { value: 'UNIQUE_TASTE', label: '맛이 특이해요' },
  { value: 'SCRAP', label: '스크랩' },
]

const CATEGORIES: { value: RankingCategory | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'MAIN_DISH', label: '식사' },
  { value: 'DESSERT', label: '디저트' },
]

const BADGES: Record<number, string> = { 1: badge1, 2: badge2, 3: badge3 }

const REACTIONS: { value: ReactionType; label: string }[] = [
  { value: 'TRIED', label: '먹어봤어요' },
  { value: 'DELICIOUS', label: '맛있었어요' },
  { value: 'UNIQUE_TASTE', label: '맛이 특이해요' },
  { value: 'NOT_MY_TASTE', label: '내 취향은 아니에요' },
]

function getCriteriaCount(item: RankedPost, criteria: RankingCriteria) {
  if (criteria === 'VIEWS') return item.post.views
  if (criteria === 'SCRAP') return item.scrapCount
  return item.reactionCounts[criteria] ?? 0
}

export function RankingPage() {
  useDocumentTitle('인기 랭킹 | CHURAI')

  const navigate = useNavigate()
  const [criteria, setCriteria] = useState<RankingCriteria>('VIEWS')
  const [category, setCategory] = useState<RankingCategory | ''>('')
  const [rankings, setRankings] = useState<RankedPost[]>([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    getRankings(criteria, category || undefined)
      .then((result) => {
        if (cancelled) return
        setRankings(result.rankings)
        setPage(0)
        setHasNext(result.hasNext)
        setTotal(result.totalElements)
      })
      .catch(() => {
        if (!cancelled) setErrorMessage('랭킹을 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [criteria, category, retryKey])

  const changeCriteria = (value: RankingCriteria) => {
    if (value === criteria) return
    setRankings([])
    setHasNext(false)
    setIsLoading(true)
    setErrorMessage('')
    setCriteria(value)
  }

  const changeCategory = (value: RankingCategory | '') => {
    if (value === category) return
    setRankings([])
    setHasNext(false)
    setIsLoading(true)
    setErrorMessage('')
    setCategory(value)
  }

  const loadMore = async () => {
    if (isLoading || !hasNext) return

    setIsLoading(true)
    setErrorMessage('')
    try {
      const nextPage = page + 1
      const result = await getRankings(criteria, category || undefined, nextPage)
      setRankings((current) => [...current, ...result.rankings])
      setPage(nextPage)
      setHasNext(result.hasNext)
      setTotal(result.totalElements)
    } catch {
      setErrorMessage('다음 랭킹을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const retry = () => {
    setRankings([])
    setHasNext(false)
    setIsLoading(true)
    setErrorMessage('')
    setRetryKey((current) => current + 1)
  }

  return (
    <main className="px-4 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={() => navigate(routePaths.home)} aria-label="홈으로 이동" className="flex h-9 w-9 shrink-0 items-center justify-center">
          <BackIcon className="h-5 w-5" />
        </button>
        <h1 className="heading1-semibold">츄라이 랭킹</h1>
      </div>

      <p className="caption1-medium text-gray4 mb-4">좋아하는 조합을 기준별 순위로 확인해보세요.</p>

      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="랭킹 기준">
        {CRITERIA.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => changeCriteria(value)}
            aria-pressed={criteria === value}
            className={`caption1-medium shrink-0 rounded-full border px-3 py-1.5 ${criteria === value ? 'border-main bg-sub text-main' : 'border-gray2 bg-white text-gray4'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-2" role="group" aria-label="카테고리">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => changeCategory(value)}
            aria-pressed={category === value}
            className={`caption2-medium rounded-full border px-3 py-1.5 ${category === value ? 'border-main text-main' : 'border-gray2 text-gray3'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {!isLoading && !errorMessage && <p className="caption2-medium text-gray3 mb-3">전체 {total}개</p>}

      <div className="flex flex-col gap-2">
        {rankings.map((item) => (
          <button
            key={item.post.postId}
            type="button"
            onClick={() => navigate(`/posts/${item.post.postId}`)}
            className="w-full rounded-lg bg-white p-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray1 relative h-17.5 w-17.5 shrink-0 rounded-lg">
                {item.post.thumbnailUrl && <img src={item.post.thumbnailUrl} alt="" className="h-full w-full rounded-lg object-cover" />}
                {BADGES[item.rank] && <img src={BADGES[item.rank]} alt={`${item.rank}위`} className="absolute -top-2 -left-2 h-8 w-8" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="caption2-medium text-gray3">{!BADGES[item.rank] && `${item.rank}위 · `}{item.post.category === 'MAIN_DISH' ? '식사' : '디저트'} · {item.post.writerNickname}</p>
                <p className="caption1-semibold mt-1 truncate">{item.post.title}</p>
                <p className="caption2-medium text-main mt-1">{CRITERIA.find((option) => option.value === criteria)?.label} {getCriteriaCount(item, criteria).toLocaleString()}</p>
              </div>
            </div>
            <div className="caption2-medium text-gray4 mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-gray1 pt-2">
              <span className="inline-flex items-center gap-1"><EyeIcon className="h-3.5 w-3.5" />{item.post.views.toLocaleString()}</span>
              {REACTIONS.map(({ value, label }) => <span key={value}>{label} {item.reactionCounts[value] ?? 0}</span>)}
              <span>스크랩 {item.scrapCount}</span>
              <span>댓글 {item.commentCount}</span>
            </div>
          </button>
        ))}
      </div>

      {isLoading && <p className="caption1-medium text-gray3 py-6 text-center">불러오는 중...</p>}
      {!isLoading && !errorMessage && rankings.length === 0 && <p className="caption1-medium text-gray3 py-8 text-center">등록된 레시피가 없습니다.</p>}
      {errorMessage && (
        <div className="py-5 text-center">
          <p className="caption1-medium text-main" role="alert">{errorMessage}</p>
          {rankings.length === 0 && <button type="button" onClick={retry} className="caption1-semibold text-main mt-3">다시 시도</button>}
        </div>
      )}
      {hasNext && (
        <button type="button" onClick={loadMore} disabled={isLoading} className="caption1-semibold border-gray2 mt-4 h-10 w-full rounded-lg border bg-white disabled:opacity-60">더보기</button>
      )}
    </main>
  )
}
