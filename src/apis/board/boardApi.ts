import { api } from '@/apis/http'

interface ApiResponse<T> {
  code: string
  isSuccess: boolean
  message: string
  result: T
}

export interface CreatePostRequest {
  title: string
  contents: string
  category: 'MAIN_DISH' | 'DESSERT'
}

export interface UpdatePostRequest {
  title: string
  contents: string
  category: 'MAIN_DISH' | 'DESSERT'
}

interface PostSummaryResponse {
  postId: number
  title: string
  category: 'MAIN_DISH' | 'DESSERT'
  views: number
  writerId: number
  writerNickname: string
  createdAt: string
}

interface PostPageResponse {
  posts: PostSummaryResponse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
}

interface PostSaveResponse {
  postId: number
}

interface PostDetailApiResponse {
  postId: number
  title: string
  contents: string
  category: 'MAIN_DISH' | 'DESSERT'
  views: number
  writerId: number
  writerNickname: string
  createdAt: string
  updatedAt: string
}

export interface PostDetailResponse {
  id: number
  category: 'MAIN_DISH' | 'DESSERT'
  title: string
  nickname: string
  thumbnailUrl?: string
  tags: string[]
  interestedCount: number
  churaiCount: number
  commentCount: number
  views: number
  createdAt: string
  contents?: string
  imageUrls?: string[]
  comments?: {
    id: number
    nickname: string
    contents: string
    parentId: number | null
    createdAt: string
  }[]
}

export interface CreateCommentRequest {
  contents: string
  parentId: number | null
}

export interface CommentResponse {
  id: number
  nickname: string
  contents: string
  parentId: number | null
  createdAt: string
}

export const createPost = async (
  requestBody: CreatePostRequest,
) => {
  const response = await api.post<ApiResponse<PostSaveResponse>>(
    '/posts',
    requestBody,
  )

  return {
    id: response.data.result.postId,
  }
}

export const getPostList = async () => {
  const response = await api.get<ApiResponse<PostPageResponse>>(
    '/posts',
  )

  return response.data.result.posts.map(toPostDetailResponse)
}

export const getPostDetail = async (
  postId: string,
) => {
  const response = await api.get<ApiResponse<PostDetailApiResponse>>(
    `/posts/${postId}`,
  )

  return toPostDetailResponse(response.data.result)
}

export const updatePost = async (
  postId: string,
  requestBody: UpdatePostRequest,
) => {
  const response = await api.put<
    ApiResponse<PostDetailApiResponse>
  >(`/posts/${postId}`, requestBody)

  return toPostDetailResponse(response.data.result)
}

export const getPostRanking = async () => {
  const response = await api.get<ApiResponse<PostPageResponse>>(
    '/posts?size=3',
  )

  return response.data.result.posts.map(toPostDetailResponse)
}

export const searchPosts = async (
  keyword: string,
) => {
  const response = await api.get<ApiResponse<PostPageResponse>>(
    `/posts?keyword=${encodeURIComponent(keyword)}`,
  )

  return response.data.result.posts.map(toPostDetailResponse)
}

export const createComment = async (
  postId: string,
  requestBody: CreateCommentRequest,
) => {
  const finalBody = {
    contents: requestBody.contents,
    parentId: requestBody.parentId,
  }

  const response = await api.post<
    ApiResponse<unknown>
  >(
    `/posts/${postId}/comments`,
    finalBody,
  )

  return response.data.result
}

export const getComments = async (
  postId: string,
) => {
  const response =
    await api.get<ApiResponse<CommentResponse[]>>(
      `/posts/${postId}/comments`,
    )

  return response.data.result
}

function toPostDetailResponse(
  post: PostSummaryResponse | PostDetailApiResponse,
): PostDetailResponse {
  return {
    id: post.postId,
    category: post.category,
    title: post.title,
    nickname: post.writerNickname,
    thumbnailUrl: undefined,
    tags: [],
    interestedCount: 0,
    churaiCount: 0,
    commentCount: 0,
    views: post.views,
    createdAt: post.createdAt,
    contents: 'contents' in post ? post.contents : undefined,
    imageUrls: [],
    comments: [],
  }
}
