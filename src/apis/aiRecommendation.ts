import { fileApi } from '@/apis/http'
import type { ApiResponse } from '@/types/api'

export interface AiRecommendationRequest {
  prompt: string
}

export interface RecommendedPost {
  post: {
    postId: number
    title: string
    summary: string | null
    category: 'MAIN_DISH' | 'DESSERT'
    spectrum: 'FAMILIAR' | 'FUSION' | 'NEW_MENU' | 'EXPERIMENTAL' | null
    coreIngredient: string | null
    tags: string[]
    views: number
    writerId: number
    writerNickname: string
    thumbnailUrl: string | null
    createdAt: string
  }
  reason: string
}

export interface AiRecommendationResult {
  recommendations: RecommendedPost[]
}

export async function getAiRecommendations(
  prompt: string,
  signal?: AbortSignal,
): Promise<AiRecommendationResult> {
  const request: AiRecommendationRequest = { prompt }
  const { data } = await fileApi.post<ApiResponse<AiRecommendationResult>>(
    '/ai/recommendations',
    request,
    { headers: { 'Content-Type': 'application/json' }, signal },
  )

  if (!data.isSuccess || !data.result || !Array.isArray(data.result.recommendations)) {
    throw new Error(data.message || '추천 결과를 확인할 수 없습니다.')
  }

  return data.result
}
