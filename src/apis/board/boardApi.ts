import { api, fileApi } from '@/apis/http'

interface ApiResponse<T> {
  code: string
  isSuccess: boolean
  message: string
  result: T
}

export interface CreatePostRequest {
  title: string
  contents: string
  nickname: string
  password: string
  category: 'MAIN_DISH' | 'DESSERT'
  images: File[]
  tags: string[]
}

export interface UpdatePostRequest {
  title?: string
  contents?: string
  category?: 'MAIN_DISH' | 'DESSERT'
  imageUrls?: string[]
  tags?: string[]
}

export interface PostDetailResponse {
  id: number
  category: string
  title: string
  nickname: string
  thumbnailUrl: string
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
  const formData = new FormData()

  formData.append('title', requestBody.title)
  formData.append('contents', requestBody.contents)
  formData.append('nickname', requestBody.nickname)
  formData.append('password', requestBody.password)
  formData.append('category', requestBody.category)

  if (requestBody.tags.length !== 0) {
    requestBody.tags.forEach((tag) => {
      formData.append('tags', tag)
    })
  }

  if (requestBody.images.length !== 0) {
    requestBody.images.forEach((file) => {
      formData.append('images', file)
    })
  }

  const response = await fileApi.post(
    '/posts',
    formData,
  )

  return response.data.result
}

export const getPostList = async () => {
  const response =
    await api.get<ApiResponse<PostDetailResponse[]>>(
      '/posts',
    )

  return response.data.result
}

export const getPostDetail = async (
  postId: string,
) => {
  const response =
    await api.get<ApiResponse<PostDetailResponse>>(
      `/posts/${postId}`,
    )

  return response.data.result
}

export const updatePost = async (
  postId: string,
  requestBody: UpdatePostRequest,
) => {
  const response = await api.patch<
    ApiResponse<{ id: number }>
  >(`/posts/${postId}`, requestBody)

  return response.data.result
}

export const getPostRanking = async () => {
  const response =
    await api.get<ApiResponse<PostDetailResponse[]>>(
      '/posts/ranking',
    )

  return response.data.result
}

export const searchPosts = async (
  keyword: string,
) => {
  const response =
    await api.get<ApiResponse<PostDetailResponse[]>>(
      `/posts/search?keyword=${encodeURIComponent(keyword)}`,
    )

  return response.data.result
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