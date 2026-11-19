import { api } from '@/apis/http'
import type { ApiResponse } from '@/types/api'

export type HomeCategory = 'MAIN_DISH' | 'DESSERT'

export interface HomePost {
  postId: number
  title: string
  summary: string
  category: HomeCategory
  spectrum: string
  coreIngredient: string
  tags: string[]
  views: number
  writerId: number
  writerNickname: string
  thumbnailUrl: string | null
  createdAt: string
}

export interface HomeCategoryCount {
  category: HomeCategory
  description: string
  postCount: number
}

export interface HomeData {
  popularPosts: HomePost[]
  latestPosts: HomePost[]
  categories: HomeCategoryCount[]
}

export async function getHome(): Promise<HomeData> {
  const { data } = await api.get<ApiResponse<HomeData>>('/home')

  if (!data.isSuccess || !data.result) {
    throw new Error(data.message || '홈 정보를 불러오지 못했습니다.')
  }

  return data.result
}
