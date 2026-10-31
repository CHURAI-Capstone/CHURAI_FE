import { api } from '@/apis/http'

interface ApiResponse<T> {
  code: string
  isSuccess: boolean
  message: string
  result: T
}

export type ReactionType =
  | 'TRIED'
  | 'DELICIOUS'
  | 'UNIQUE_TASTE'
  | 'NOT_MY_TASTE'

export type ReactionCounts = Record<ReactionType, number>

export interface ReactionResult {
  counts: ReactionCounts
  myReactions: ReactionType[]
}

export interface ScrapResult {
  scrapped: boolean
  scrapCount: number
}

export const getPostReactions = async (postId: string) => {
  const response = await api.get<ApiResponse<ReactionResult>>(
    `/posts/${postId}/reactions`,
  )

  return response.data.result
}

export const selectPostReaction = async (
  postId: string,
  type: ReactionType,
) => {
  const response = await api.post<ApiResponse<ReactionResult>>(
    `/posts/${postId}/reactions`,
    { type },
  )

  return response.data.result
}

export const cancelPostReaction = async (
  postId: string,
  type: ReactionType,
) => {
  const response = await api.delete<ApiResponse<ReactionResult>>(
    `/posts/${postId}/reactions`,
    { params: { type } },
  )

  return response.data.result
}

export const scrapPost = async (postId: string) => {
  const response = await api.post<ApiResponse<ScrapResult>>(
    `/posts/${postId}/scrap`,
  )

  return response.data.result
}

export const cancelPostScrap = async (postId: string) => {
  const response = await api.delete<ApiResponse<ScrapResult>>(
    `/posts/${postId}/scrap`,
  )

  return response.data.result
}
