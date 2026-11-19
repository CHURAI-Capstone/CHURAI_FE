import { api, fileApi } from '@/apis/http'

interface ApiResponse<T> {
  code: string
  isSuccess: boolean
  message: string
  result: T
}

export type PostCategory =
  | 'MAIN_DISH'
  | 'DESSERT'

export type Spectrum =
  | 'FAMILIAR'
  | 'FUSION'
  | 'NEW_MENU'
  | 'EXPERIMENTAL'

export type CommentType =
  | 'GENERAL'
  | 'REVIEW'
  | 'VARIATION'

export interface CreatePostRequest {
  title: string
  contents: string
  category: PostCategory

  summary: string
  ingredients: string[]

  coreIngredient?: string
  spectrum: Spectrum
  tags?: string[]

  images?: File[]
}

export interface UpdatePostRequest {
  title: string
  contents: string
  category: PostCategory

  // 현재 수정 페이지가 아직 최신 DTO와
  // 완전히 맞춰지지 않았으므로 일단 optional 처리
  summary?: string
  ingredients?: string[]
  coreIngredient?: string
  spectrum?: Spectrum
  tags?: string[]

  deleteImageIds?: number[]
  images?: File[]
}

interface PostSummaryResponse {
  postId: number
  title: string
  summary?: string | null
  category: PostCategory

  spectrum?: Spectrum | null
  coreIngredient?: string | null
  tags?: string[]

  views: number
  writerId: number
  writerNickname: string

  thumbnailUrl?: string | null
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

interface ReactionSummaryResponse {
  counts?: {
    TRIED?: number
    DELICIOUS?: number
    UNIQUE_TASTE?: number
    NOT_MY_TASTE?: number
  }

  myReactions?: string[]
}

interface ScrapResponse {
  scrapped: boolean
  scrapCount: number
}

interface CommentApiResponse {
  commentId: number
  type: CommentType

  contents: string

  writerId: number
  writerNickname: string

  createdAt: string
  updatedAt: string

  replies: CommentApiResponse[]
}

interface PostDetailApiResponse {
  postId: number
  title: string

  summary?: string | null
  contents: string

  category: PostCategory

  spectrum?: Spectrum | null
  coreIngredient?: string | null

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

  // 이전 응답 구조 호환
  interestedCount?: number
  heungMiCount?: number
  churaiCount?: number
  chuRaiCount?: number
  commentCount?: number
  scrapped?: boolean
  scrapCount?: number

  // 현재 백엔드 응답 구조
  reactions?: ReactionSummaryResponse
  scrap?: ScrapResponse
  comments?: CommentApiResponse[]
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

  category: PostCategory

  title: string
  summary?: string

  nickname: string

  thumbnailUrl?: string

  tags: string[]

  spectrum?: Spectrum
  coreIngredient?: string

  interestedCount: number
  churaiCount: number
  commentCount: number

  scrapped?: boolean
  scrapCount?: number

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

export interface PostPage {
  posts: PostDetailResponse[]
  hasNext: boolean
}

export interface CreateCommentRequest {
  contents: string
  parentId: number | null
  type?: CommentType
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
  const response =
    await fileApi.post<ApiResponse<PostSaveResponse>>(
      '/posts',
      toPostFormData(requestBody),
    )

  return {
    id: response.data.result.postId,
  }
}

export const getPostPage = async (
  page = 0,
  size = 10,
): Promise<PostPage> => {
  const response =
    await api.get<ApiResponse<PostPageResponse>>(
      '/posts',
      {
        params: {
          page,
          size,
        },
      },
    )

  return {
    posts:
      response.data.result.posts.map(
        toPostDetailResponse,
      ),
    hasNext: response.data.result.hasNext,
  }
}

export const getPostList = async () =>
  (await getPostPage()).posts

export const getPostDetail = async (
  postId: string,
) => {
  const response =
    await api.get<
      ApiResponse<PostDetailApiResponse>
    >(`/posts/${postId}`)

  return toPostDetailResponse(
    response.data.result,
  )
}

export const updatePost = async (
  postId: string,
  requestBody: UpdatePostRequest,
) => {
  const response =
    await fileApi.put<
      ApiResponse<PostDetailApiResponse>
    >(
      `/posts/${postId}`,
      toPostFormData(requestBody),
    )

  return toPostDetailResponse(
    response.data.result,
  )
}

export const deletePost = async (
  postId: string,
) => {
  await api.delete<ApiResponse<null>>(
    `/posts/${postId}`,
  )
}

export const getRecentPosts = async () =>
  (await getPostPage(0, 3)).posts

export const searchPosts = async (
  keyword: string,
) => {
  const response =
    await api.get<ApiResponse<PostPageResponse>>(
      '/posts',
      {
        params: {
          keyword,
        },
      },
    )

  return response.data.result.posts.map(
    toPostDetailResponse,
  )
}

export const createComment = async (
  postId: string,
  requestBody: CreateCommentRequest,
) => {
  const response =
    await api.post<ApiResponse<unknown>>(
      `/posts/${postId}/comments`,
      {
        contents: requestBody.contents,
        parentId: requestBody.parentId,
        type:
          requestBody.type ??
          'GENERAL',
      },
    )

  return response.data.result
}

export const getComments = async (
  postId: string,
) => {
  const post = await getPostDetail(postId)

  return post.comments ?? []
}

function toPostDetailResponse(
  post:
    | PostSummaryResponse
    | PostDetailApiResponse,
): PostDetailResponse {
  const isDetail =
    'contents' in post

  if (!isDetail) {
    return {
      id: post.postId,

      writerId: post.writerId,

      category: post.category,

      title: post.title,
      summary:
        post.summary ?? undefined,

      nickname:
        post.writerNickname,

      thumbnailUrl:
        post.thumbnailUrl ??
        undefined,

      tags: post.tags ?? [],

      spectrum:
        post.spectrum ??
        undefined,

      coreIngredient:
        post.coreIngredient ??
        undefined,

      interestedCount: 0,
      churaiCount: 0,
      commentCount: 0,

      views: post.views,

      createdAt: post.createdAt,

      combinationMethod: '',

      ingredients: [],
      comments: [],
    }
  }

  const imageUrls =
    normalizeImageUrls(post)

  const comments =
    normalizeComments(
      post.comments ?? [],
    )

  return {
    id: post.postId,

    writerId:
      post.writerId,

    category:
      post.category,

    title:
      post.title,

    summary:
      post.summary ??
      undefined,

    nickname:
      post.writerNickname ??
      post.nickname ??
      '알 수 없는 사용자',

    thumbnailUrl:
      imageUrls[0] ??
      post.thumbnailUrl,

    tags:
      normalizeTags(post.tags),

    spectrum:
      post.spectrum ??
      undefined,

    coreIngredient:
      post.coreIngredient ??
      undefined,

    // 이전 프론트 카드와의 호환용
    interestedCount:
      post.interestedCount ??
      post.heungMiCount ??
      post.reactions?.counts?.DELICIOUS ??
      0,

    churaiCount:
      post.churaiCount ??
      post.chuRaiCount ??
      post.reactions?.counts?.TRIED ??
      0,

    commentCount:
      post.commentCount ??
      countComments(
        post.comments ?? [],
      ),

    scrapped:
      post.scrap?.scrapped ??
      post.scrapped,

    scrapCount:
      post.scrap?.scrapCount ??
      post.scrapCount,

    views:
      post.views,

    createdAt:
      post.createdAt,

    updatedAt:
      post.updatedAt,

    contents:
      post.contents,

    combinationMethod:
      extractCombinationMethod(
        post.contents,
      ),

    imageUrls,

    ingredients:
      normalizeIngredients(
        post.ingredients,
        post.contents,
      ),

    images:
      normalizeEditableImages(
        post.images,
      ),

    comments,
  }
}

function normalizeComments(
  comments: CommentApiResponse[],
): NonNullable<
  PostDetailResponse['comments']
> {
  return comments.flatMap(
    (comment) => [
      {
        id: comment.commentId,
        nickname:
          comment.writerNickname,
        contents:
          comment.contents,
        parentId: null,
        createdAt:
          comment.createdAt,
      },

      ...comment.replies.map(
        (reply) => ({
          id: reply.commentId,
          nickname:
            reply.writerNickname,
          contents:
            reply.contents,
          parentId:
            comment.commentId,
          createdAt:
            reply.createdAt,
        }),
      ),
    ],
  )
}

function countComments(
  comments: CommentApiResponse[],
): number {
  return comments.reduce<number>(
    (total, comment) =>
      total +
      1 +
      countComments(comment.replies ?? []),
    0,
  )
}
function extractCombinationMethod(
  contents: string,
) {
  const method =
    contents.match(
      /(?:^|\n)\s*(?:순서|방법|만드는\s*방법|조리법)\s*:\s*([\s\S]*)$/,
    )?.[1]

  if (method?.trim()) {
    return method.trim()
  }

  const hasIngredientSection =
    /(?:^|\n)\s*재료\s*:/.test(
      contents,
    )

  return hasIngredientSection
    ? ''
    : contents.trim()
}

function normalizeImageUrls(
  post: PostDetailApiResponse,
) {
  const urls = [
    ...(post.imageUrls ?? []),

    ...(post.images ?? []).map(
      (image) => {
        if (
          typeof image ===
          'string'
        ) {
          return image
        }

        return (
          image.imageUrl ??
          image.url ??
          ''
        )
      },
    ),
  ].filter(Boolean)

  return [...new Set(urls)]
}

function normalizeEditableImages(
  images:
    | PostDetailApiResponse['images']
    | undefined,
) {
  return (
    images ?? []
  ).flatMap((image) => {
    if (
      typeof image === 'string' ||
      image.imageId == null ||
      !image.imageUrl
    ) {
      return []
    }

    return [
      {
        imageId:
          image.imageId,
        imageUrl:
          image.imageUrl,
      },
    ]
  })
}

function normalizeTags(
  tags:
    | PostDetailApiResponse['tags']
    | undefined,
) {
  return (tags ?? [])
    .map((tag) => {
      if (
        typeof tag === 'string'
      ) {
        return tag
      }

      return (
        tag.name ??
        tag.tagName ??
        ''
      )
    })
    .filter(Boolean)
}

function normalizeIngredients(
  ingredients:
    | PostDetailApiResponse['ingredients']
    | undefined,
  contents: string,
): PostIngredient[] {
  const normalizedIngredients =
    (ingredients ?? [])
      .map((ingredient) => {
        if (
          typeof ingredient ===
          'string'
        ) {
          return {
            name: ingredient,
          }
        }

        return {
          name:
            ingredient.name ??
            '',
          amount:
            ingredient.amount ??
            ingredient.quantity,
        }
      })
      .filter(
        (ingredient) =>
          ingredient.name !== '',
      )

  if (
    normalizedIngredients.length >
    0
  ) {
    return normalizedIngredients
  }

  const ingredientBlock =
    contents.match(
      /(?:^|\n)\s*재료\s*:\s*([\s\S]*?)(?=\n\s*(?:순서|방법|만드는\s*방법|조리법)\s*:|$)/,
    )?.[1]

  if (!ingredientBlock) {
    return []
  }

  return ingredientBlock
    .split(/[,\n·]/)
    .map((name) =>
      name.trim(),
    )
    .filter(Boolean)
    .map((name) => ({
      name,
    }))
}

function toPostFormData(
  request:
    | CreatePostRequest
    | UpdatePostRequest,
) {
  const formData =
    new FormData()

  formData.append(
    'title',
    request.title,
  )

  formData.append(
    'contents',
    request.contents,
  )

  formData.append(
    'category',
    request.category,
  )

  if (request.summary != null) {
    formData.append(
      'summary',
      request.summary,
    )
  }

  request.ingredients?.forEach(
    (ingredient) => {
      formData.append(
        'ingredients',
        ingredient,
      )
    },
  )

  if (
    request.coreIngredient?.trim()
  ) {
    formData.append(
      'coreIngredient',
      request.coreIngredient.trim(),
    )
  }

  if (request.spectrum) {
    formData.append(
      'spectrum',
      request.spectrum,
    )
  }

  request.tags?.forEach(
    (tag) => {
      formData.append(
        'tags',
        tag,
      )
    },
  )

  if (
    'deleteImageIds' in request
  ) {
    request.deleteImageIds?.forEach(
      (imageId) => {
        formData.append(
          'deleteImageIds',
          String(imageId),
        )
      },
    )
  }

  request.images?.forEach(
    (image) => {
      formData.append(
        'images',
        image,
      )
    },
  )

  return formData
}