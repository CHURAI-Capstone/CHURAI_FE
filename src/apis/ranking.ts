import { api } from '@/apis/http'
import type { ReactionType } from '@/apis/board/postEngagementApi'
import type { ApiResponse } from '@/types/api'

export type RankingCriteria = 'VIEWS' | 'TRIED' | 'DELICIOUS' | 'UNIQUE_TASTE' | 'SCRAP'
export type RankingCategory = 'MAIN_DISH' | 'DESSERT'

export interface RankedPost {
  rank: number
  post: {
    postId: number
    title: string
    category: RankingCategory
    views: number
    writerNickname: string
    thumbnailUrl: string | null
  }
  reactionCounts: Record<ReactionType, number>
  scrapCount: number
  commentCount: number
}

export interface RankingPage {
  rankings: RankedPost[]
  hasNext: boolean
  totalElements: number
}

export async function getRankings(
  criteria: RankingCriteria,
  category: RankingCategory | undefined,
  page = 0,
): Promise<RankingPage> {
  const { data } = await api.get<ApiResponse<RankingPage>>('/rankings', {
    params: { criteria, ...(category ? { category } : {}), page, size: 10 },
  })

  if (!data.isSuccess || !data.result) {
    throw new Error(data.message || '랭킹을 불러오지 못했습니다.')
  }

  return data.result
}
