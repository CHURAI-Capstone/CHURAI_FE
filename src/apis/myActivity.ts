import { api } from '@/apis/http'
import type { CommentType } from '@/apis/board/boardApi'
import type { ApiResponse } from '@/types/api'

export type MyPostCategory = 'MAIN_DISH' | 'DESSERT'
export type TasteType = 'DELICIOUS' | 'UNIQUE_TASTE' | 'NOT_MY_TASTE'

export interface MyPost {
  postId: number
  title: string
  summary?: string | null
  category: MyPostCategory
  views: number
  writerNickname: string
  thumbnailUrl?: string | null
  createdAt: string
}

export interface MyReaction {
  reactionType: TasteType
  reactionDescription: string
  reactedAt: string
  post: MyPost
}

export interface MyComment {
  commentId: number
  type: CommentType
  contents: string
  parentId: number | null
  postId: number
  postTitle: string
  createdAt: string
  updatedAt: string
}

export interface ActivityPage<T> {
  items: T[]
  hasNext: boolean
  totalElements: number
}

interface PageMeta {
  hasNext: boolean
  totalElements: number
}

interface PostPageResponse extends PageMeta {
  posts: MyPost[]
}

interface ReactionPageResponse extends PageMeta {
  reactions: MyReaction[]
}

interface CommentPageResponse extends PageMeta {
  comments: MyComment[]
}

const PAGE_SIZE = 10

async function getPage<T>(path: string, page: number, type?: string): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(path, {
    params: { page, size: PAGE_SIZE, ...(type ? { type } : {}) },
  })

  if (!data.isSuccess || !data.result) {
    throw new Error(data.message || '활동 내역을 불러오지 못했습니다.')
  }

  return data.result
}

async function getPostActivity(path: string, page: number): Promise<ActivityPage<MyPost>> {
  const result = await getPage<PostPageResponse>(path, page)
  return {
    items: result.posts,
    hasNext: result.hasNext,
    totalElements: result.totalElements,
  }
}

export const getMyPosts = (page = 0) => getPostActivity('/users/me/posts', page)
export const getMyScraps = (page = 0) => getPostActivity('/users/me/scraps', page)
export const getMyTriedPosts = (page = 0) => getPostActivity('/users/me/tried', page)

export async function getMyReactions(page = 0, type?: TasteType): Promise<ActivityPage<MyReaction>> {
  const result = await getPage<ReactionPageResponse>('/users/me/reactions', page, type)
  return {
    items: result.reactions,
    hasNext: result.hasNext,
    totalElements: result.totalElements,
  }
}

export async function getMyComments(page = 0, type?: CommentType): Promise<ActivityPage<MyComment>> {
  const result = await getPage<CommentPageResponse>('/users/me/comments', page, type)
  return {
    items: result.comments,
    hasNext: result.hasNext,
    totalElements: result.totalElements,
  }
}
