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
  category: 'MAIN_DISH' | 'DESSERT'
  images?: File[]
}

export interface UpdatePostRequest {
  title: string
  contents: string
  category: 'MAIN_DISH' | 'DESSERT'
  deleteImageIds?: number[]
  images?: File[]
}

interface PostSummaryResponse {
  postId: number
  title: string
  category: 'MAIN_DISH' | 'DESSERT'
  views: number
  writerId: number
  writerNickname: string
  createdAt: string
  thumbnailUrl?: string | null
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
  views?: number
  writerId?: number
  writerNickname?: string
  nickname?: string
  createdAt: string
  updatedAt?: string
  thumbnailUrl?: string
  imageUrls?: string[]
  images?: Array<
    | string
    | {
        imageId?: number
        imageUrl?: string
        url?: string
      }
  >
  ingredients?: Array<
    | string
    | {
        name?: string
        amount?: string
        quantity?: string
      }
  >
  tags?: Array<
    | string
    | {
        name?: string
        tagName?: string
      }
  >
  interestedCount?: number
  heungMiCount?: number
  churaiCount?: number
  chuRaiCount?: number
  commentCount?: number
}

export interface PostIngredient {
  name: string
  amount?: string
}

export interface PostImageResponse {
  imageId: number
  imageUrl: string
}

export interface PostDetailResponse {
  id: number
  writerId?: number
  category: 'MAIN_DISH' | 'DESSERT'
  title: string
  nickname: string
  thumbnailUrl?: string
  tags: string[]
  interestedCount: number
  churaiCount: number
  commentCount: number
  views?: number
  createdAt: string
  updatedAt?: string
  contents?: string
  combinationMethod: string
  imageUrls?: string[]
  ingredients: PostIngredient[]
  images?: PostImageResponse[]
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
  const response = await fileApi.post<ApiResponse<PostSaveResponse>>(
    '/posts',
    toPostFormData(requestBody),
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
  const response = await fileApi.put<
    ApiResponse<PostDetailApiResponse>
  >(`/posts/${postId}`, toPostFormData(requestBody))

  return toPostDetailResponse(response.data.result)
}

export const deletePost = async (postId: string) => {
  await api.delete<ApiResponse<null>>(`/posts/${postId}`)
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
  const isDetail = 'contents' in post

  return {
    id: post.postId,
    writerId: post.writerId,
    category: post.category,
    title: post.title,
    nickname: isDetail
      ? (post.writerNickname ?? post.nickname ?? '알 수 없는 사용자')
      : post.writerNickname,
    thumbnailUrl: isDetail
      ? (normalizeImageUrls(post)[0] ?? post.thumbnailUrl)
      : (post.thumbnailUrl ?? undefined),
    tags: isDetail ? normalizeTags(post.tags) : [],
    interestedCount: isDetail
      ? (post.interestedCount ?? post.heungMiCount ?? 0)
      : 0,
    churaiCount: isDetail
      ? (post.churaiCount ?? post.chuRaiCount ?? 0)
      : 0,
    commentCount: isDetail ? (post.commentCount ?? 0) : 0,
    views: post.views,
    createdAt: post.createdAt,
    updatedAt: isDetail ? post.updatedAt : undefined,
    contents: isDetail ? post.contents : undefined,
    combinationMethod: isDetail
      ? extractCombinationMethod(post.contents)
      : '',
    imageUrls: isDetail ? normalizeImageUrls(post) : [],
    ingredients: isDetail
      ? normalizeIngredients(post.ingredients, post.contents)
      : [],
    images: isDetail ? normalizeEditableImages(post.images) : undefined,
    comments: [],
  }
}

function extractCombinationMethod(contents: string) {
  const method = contents.match(
    /(?:^|\n)\s*(?:순서|방법|만드는\s*방법|조리법)\s*:\s*([\s\S]*)$/,
  )?.[1]

  if (method?.trim()) {
    return method.trim()
  }

  const hasIngredientSection = /(?:^|\n)\s*재료\s*:/.test(contents)

  return hasIngredientSection ? '' : contents.trim()
}

function normalizeImageUrls(post: PostDetailApiResponse) {
  const urls = [
    ...(post.imageUrls ?? []),
    ...(post.images ?? []).map((image) => {
      if (typeof image === 'string') {
        return image
      }

      return image.imageUrl ?? image.url ?? ''
    }),
  ].filter(Boolean)

  return [...new Set(urls)]
}

function normalizeEditableImages(images: PostDetailApiResponse['images']) {
  return (images ?? []).flatMap((image) => {
    if (typeof image === 'string' || image.imageId == null || !image.imageUrl) {
      return []
    }

    return [{ imageId: image.imageId, imageUrl: image.imageUrl }]
  })
}

function normalizeTags(tags: PostDetailApiResponse['tags']) {
  return (tags ?? [])
    .map((tag) => {
      if (typeof tag === 'string') {
        return tag
      }

      return tag.name ?? tag.tagName ?? ''
    })
    .filter(Boolean)
}

function normalizeIngredients(
  ingredients: PostDetailApiResponse['ingredients'],
  contents: string,
): PostIngredient[] {
  const normalizedIngredients = (ingredients ?? [])
    .map((ingredient) => {
      if (typeof ingredient === 'string') {
        return {
          name: ingredient,
        }
      }

      return {
        name: ingredient.name ?? '',
        amount: ingredient.amount ?? ingredient.quantity,
      }
    })
    .filter((ingredient) => ingredient.name !== '')

  if (normalizedIngredients.length > 0) {
    return normalizedIngredients
  }

  const ingredientBlock = contents.match(
    /(?:^|\n)\s*재료\s*:\s*([\s\S]*?)(?=\n\s*(?:순서|방법|만드는\s*방법|조리법)\s*:|$)/,
  )?.[1]

  if (!ingredientBlock) {
    return []
  }

  return ingredientBlock
    .split(/[,\n·]/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name }))
}

function toPostFormData(request: CreatePostRequest | UpdatePostRequest) {
  const formData = new FormData()
  formData.append('title', request.title)
  formData.append('contents', request.contents)
  formData.append('category', request.category)

  if ('deleteImageIds' in request) {
    request.deleteImageIds?.forEach((imageId) => {
      formData.append('deleteImageIds', String(imageId))
    })
  }

  request.images?.forEach((image) => {
    formData.append('images', image)
  })

  return formData
}
