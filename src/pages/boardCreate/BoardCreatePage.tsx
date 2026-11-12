import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  createPost,
  type Spectrum,
} from '@/apis/board/boardApi'
import BowlIcon from '@/assets/icons/boul.svg?react'
import ImageIcon from '@/assets/icons/image.svg?react'
import SnackIcon from '@/assets/icons/snacks.svg?react'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

type PostCategory = 'MAIN_DISH' | 'DESSERT'

interface ImagePreview {
  file: File
  url: string
}

const MAX_IMAGE_COUNT = 3
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_INGREDIENT_COUNT = 20
const MAX_TAG_COUNT = 5

const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

// 현재 백엔드에서 spectrum 값이 필수이므로
// 작성 화면에서는 별도 선택 UI 없이 기본값을 전달합니다.
const DEFAULT_SPECTRUM: Spectrum = 'FAMILIAR'

function parseIngredients(value: string) {
  return value
    .split(/[,，\n]/)
    .map((ingredient) => ingredient.trim())
    .filter(Boolean)
}

export function BoardCreatePage() {
  useDocumentTitle('레시피 작성 | CHURAI')

  const navigate = useNavigate()

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  const previewUrlsRef =
    useRef<Set<string>>(new Set())

  const [title, setTitle] =
    useState('')

  const [summary, setSummary] =
    useState('')

  const [contents, setContents] =
    useState('')

  const [category, setCategory] =
    useState<PostCategory | ''>('')

  const [
    ingredientInput,
    setIngredientInput,
  ] = useState('')

  const [
    ingredients,
    setIngredients,
  ] = useState<string[]>([])

  const [
    imagePreviews,
    setImagePreviews,
  ] = useState<ImagePreview[]>([])

  const [
    tagInput,
    setTagInput,
  ] = useState('')

  const [tags, setTags] =
    useState<string[]>([])

  const [message, setMessage] =
    useState('')

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const pendingIngredients =
    parseIngredients(ingredientInput)

  const hasIngredients =
    ingredients.length > 0 ||
    pendingIngredients.length > 0

  const isFormValid =
    title.trim() !== '' &&
    summary.trim() !== '' &&
    contents.trim() !== '' &&
    category !== '' &&
    hasIngredients &&
    !isSubmitting

  useEffect(() => {
    const previewUrls =
      previewUrlsRef.current

    return () => {
      previewUrls.forEach((url) =>
        URL.revokeObjectURL(url),
      )
    }
  }, [])

  const handleBackNavigation = () => {
    const isConfirmed =
      window.confirm(
        '작성 중인 내용을 취소하시겠습니까?',
      )

    if (isConfirmed) {
      navigate(-1)
    }
  }

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files =
      Array.from(
        event.target.files ?? [],
      )

    if (files.length === 0) {
      return
    }

    if (
      files.some(
        (file) =>
          !SUPPORTED_IMAGE_TYPES.includes(
            file.type,
          ),
      )
    ) {
      setMessage(
        'JPG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.',
      )

      event.target.value = ''
      return
    }

    if (
      files.some(
        (file) =>
          file.size > MAX_IMAGE_SIZE,
      )
    ) {
      setMessage(
        '이미지는 장당 5MB 이하로 업로드할 수 있습니다.',
      )

      event.target.value = ''
      return
    }

    if (
      imagePreviews.length +
        files.length >
      MAX_IMAGE_COUNT
    ) {
      setMessage(
        '이미지는 최대 3장까지 업로드할 수 있습니다.',
      )

      event.target.value = ''
      return
    }

    const nextPreviews =
      files.map((file) => ({
        file,
        url: URL.createObjectURL(
          file,
        ),
      }))

    nextPreviews.forEach(
      (preview) =>
        previewUrlsRef.current.add(
          preview.url,
        ),
    )

    setImagePreviews(
      (current) => [
        ...current,
        ...nextPreviews,
      ],
    )

    setMessage('')
    event.target.value = ''
  }

  const handleImageDelete = (
    targetUrl: string,
  ) => {
    setImagePreviews(
      (current) => {
        const targetPreview =
          current.find(
            (preview) =>
              preview.url ===
              targetUrl,
          )

        if (targetPreview) {
          URL.revokeObjectURL(
            targetPreview.url,
          )

          previewUrlsRef.current.delete(
            targetPreview.url,
          )
        }

        return current.filter(
          (preview) =>
            preview.url !== targetUrl,
        )
      },
    )
  }

  const addIngredients = (
    value: string,
  ) => {
    const nextIngredients =
      parseIngredients(value)

    if (
      nextIngredients.length === 0
    ) {
      return
    }

    if (
      nextIngredients.some(
        (ingredient) =>
          ingredient.length > 50,
      )
    ) {
      setMessage(
        '재료 이름은 50자 이하로 입력해주세요.',
      )
      return
    }

    const uniqueIngredients = [
      ...new Set([
        ...ingredients,
        ...nextIngredients,
      ]),
    ]

    if (
      uniqueIngredients.length >
      MAX_INGREDIENT_COUNT
    ) {
      setMessage(
        '재료는 최대 20개까지 등록할 수 있습니다.',
      )
      return
    }

    setIngredients(
      uniqueIngredients,
    )

    setIngredientInput('')
    setMessage('')
  }

  const handleIngredientKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()

    addIngredients(
      ingredientInput,
    )
  }

  const handleIngredientDelete = (
    targetIngredient: string,
  ) => {
    setIngredients(
      (current) =>
        current.filter(
          (ingredient) =>
            ingredient !==
            targetIngredient,
        ),
    )
  }

  const handleTagKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()

    const nextTag =
      tagInput
        .trim()
        .replace(/^#+/, '')
        .trim()

    if (!nextTag) {
      return
    }

    if (nextTag.length > 30) {
      setMessage(
        '태그는 30자 이하로 입력해주세요.',
      )
      return
    }

    if (
      tags.length >=
      MAX_TAG_COUNT
    ) {
      setMessage(
        '태그는 최대 5개까지 등록할 수 있습니다.',
      )
      return
    }

    if (tags.includes(nextTag)) {
      setTagInput('')
      return
    }

    setTags(
      (current) => [
        ...current,
        nextTag,
      ],
    )

    setTagInput('')
    setMessage('')
  }

  const handleTagDelete = (
    targetTag: string,
  ) => {
    setTags(
      (current) =>
        current.filter(
          (tag) =>
            tag !== targetTag,
        ),
    )
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setMessage('')

    const selectedCategory =
      category

    const finalIngredients = [
      ...new Set([
        ...ingredients,
        ...parseIngredients(
          ingredientInput,
        ),
      ]),
    ]

    if (
      !title.trim() ||
      !summary.trim() ||
      !contents.trim() ||
      !selectedCategory ||
      finalIngredients.length === 0
    ) {
      setMessage(
        '필수 항목을 모두 입력해주세요.',
      )
      return
    }

    if (
      finalIngredients.some(
        (ingredient) =>
          ingredient.length > 50,
      )
    ) {
      setMessage(
        '재료 이름은 50자 이하로 입력해주세요.',
      )
      return
    }

    if (
      finalIngredients.length >
      MAX_INGREDIENT_COUNT
    ) {
      setMessage(
        '재료는 최대 20개까지 등록할 수 있습니다.',
      )
      return
    }

    try {
      setIsSubmitting(true)

      await createPost({
        title:
          title.trim(),

        summary:
          summary.trim(),

        contents:
          contents.trim(),

        category:
          selectedCategory,

        ingredients:
          finalIngredients,

        // coreIngredient를 보내지 않으면
        // 백엔드에서 첫 번째 재료를 사용합니다.
        coreIngredient:
          undefined,

        // 현재 백엔드에서 필수값
        spectrum:
          DEFAULT_SPECTRUM,

        tags,

        images:
          imagePreviews.map(
            (preview) =>
              preview.file,
          ),
      })

      window.alert(
        '레시피 작성이 완료되었습니다.',
      )

      navigate(
        routePaths.home,
      )
    } catch (error) {
      setMessage(
        getAuthErrorMessage(
          error,
          '레시피 작성에 실패했습니다. 잠시 후 다시 시도해주세요.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="px-4 pb-10">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-white shadow-sm"
        noValidate
      >
        <header className="bg-main relative flex h-15 items-center justify-center px-7 text-white">
          <h1 className="body2-semibold">
            레시피 작성
          </h1>

          <button
            type="button"
            onClick={
              handleBackNavigation
            }
            className="absolute right-7 flex h-6 w-6 items-center justify-center text-white"
            aria-label="작성 취소"
          >
            <span className="text-2xl leading-none">
              x
            </span>
          </button>
        </header>

        <div className="flex flex-col gap-5 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">
              레시피명*
            </span>

            <input
              type="text"
              value={title}
              maxLength={100}
              onChange={(
                event,
              ) =>
                setTitle(
                  event.target
                    .value,
                )
              }
              placeholder="레시피명을 입력해주세요"
              disabled={
                isSubmitting
              }
              className="caption2-regular focus:border-main h-11 rounded-xl border border-gray-200 px-3.5 outline-none placeholder:text-gray-300 disabled:bg-gray1"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">
              한 줄 소개*
            </span>

            <input
              type="text"
              value={summary}
              maxLength={100}
              onChange={(
                event,
              ) =>
                setSummary(
                  event.target
                    .value,
                )
              }
              placeholder="이 조합을 한 줄로 소개해주세요"
              disabled={
                isSubmitting
              }
              className="caption2-regular focus:border-main h-11 rounded-xl border border-gray-200 px-3.5 outline-none placeholder:text-gray-300 disabled:bg-gray1"
            />

            <span className="caption2-regular text-right text-gray3">
              {summary.length}
              /100
            </span>
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">
              카테고리*
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setCategory(
                    'MAIN_DISH',
                  )
                }
                disabled={
                  isSubmitting
                }
                className={`caption2-medium flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border text-black transition-colors ${
                  category ===
                  'MAIN_DISH'
                    ? 'border-main bg-sub font-semibold'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <BowlIcon className="h-4 w-4" />
                <span>
                  식사류
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCategory(
                    'DESSERT',
                  )
                }
                disabled={
                  isSubmitting
                }
                className={`caption2-medium flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border text-black transition-colors ${
                  category ===
                  'DESSERT'
                    ? 'border-main bg-sub font-semibold'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <SnackIcon className="h-4 w-4" />
                <span>
                  디저트류
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">
              재료*
            </span>

            <input
              type="text"
              value={
                ingredientInput
              }
              maxLength={500}
              onChange={(
                event,
              ) =>
                setIngredientInput(
                  event.target
                    .value,
                )
              }
              onKeyDown={
                handleIngredientKeyDown
              }
              onBlur={() => {
                if (
                  ingredientInput.trim()
                ) {
                  addIngredients(
                    ingredientInput,
                  )
                }
              }}
              placeholder="예) 열라면, 순두부, 계란"
              disabled={
                isSubmitting
              }
              className="caption2-regular focus:border-main h-11 rounded-xl border border-gray-200 px-3.5 outline-none placeholder:text-gray-300 disabled:bg-gray1"
            />

            <p className="caption2-regular text-gray3">
              쉼표로 여러 재료를
              입력할 수 있으며,
              최소 1개에서 최대
              20개까지 등록할 수
              있습니다.
            </p>

            {ingredients.length >
              0 && (
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map(
                  (
                    ingredient,
                  ) => (
                    <span
                      key={
                        ingredient
                      }
                      className="caption2-medium border-gray2 inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-gray4"
                    >
                      {
                        ingredient
                      }

                      <button
                        type="button"
                        onClick={() =>
                          handleIngredientDelete(
                            ingredient,
                          )
                        }
                        className="text-gray3"
                        aria-label={`${ingredient} 재료 삭제`}
                      >
                        ×
                      </button>
                    </span>
                  ),
                )}
              </div>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">
              조합 방법*
            </span>

            <textarea
              rows={6}
              value={contents}
              maxLength={5000}
              onChange={(
                event,
              ) =>
                setContents(
                  event.target
                    .value,
                )
              }
              placeholder={`조합 방법을 자유롭게 작성해주세요.\n1. 재료를 준비합니다.\n2. 재료를 조합합니다.\n3. 맛있게 즐깁니다.`}
              disabled={
                isSubmitting
              }
              className="caption2-regular focus:border-main resize-none rounded-xl border border-gray-200 p-3.5 leading-relaxed outline-none placeholder:text-gray-300 disabled:bg-gray1"
            />
          </label>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() =>
                fileInputRef
                  .current
                  ?.click()
              }
              disabled={
                isSubmitting
              }
              className="caption2-regular flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 text-gray3 transition-colors hover:bg-gray1 disabled:cursor-not-allowed"
            >
              <ImageIcon className="h-4 w-4" />

              <span>
                사진 업로드
              </span>
            </button>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={
                handleImageChange
              }
              className="hidden"
            />

            {imagePreviews.length >
              0 && (
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map(
                  (preview) => (
                    <div
                      key={
                        preview.url
                      }
                      className="group relative mt-1 h-14 w-14 overflow-hidden rounded-lg border border-gray-200"
                    >
                      <img
                        src={
                          preview.url
                        }
                        alt="업로드 이미지 미리보기"
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleImageDelete(
                            preview.url,
                          )
                        }
                        className="caption2-medium absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        삭제
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">
              태그 설정
            </span>

            <input
              type="text"
              value={tagInput}
              maxLength={30}
              onChange={(
                event,
              ) =>
                setTagInput(
                  event.target
                    .value,
                )
              }
              onKeyDown={
                handleTagKeyDown
              }
              placeholder="태그를 입력하고 Enter"
              disabled={
                isSubmitting
              }
              className="caption2-regular focus:border-main h-11 rounded-xl border border-gray-200 px-3.5 outline-none placeholder:text-gray-300 disabled:bg-gray1"
            />

            <p className="caption2-regular text-gray3">
              선택 항목이며 최대
              5개까지 등록할 수
              있습니다.
            </p>

            {tags.length >
              0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="caption2-medium border-gray2 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-gray3"
                    >
                      #{tag}

                      <button
                        type="button"
                        onClick={() =>
                          handleTagDelete(
                            tag,
                          )
                        }
                        className="text-gray3"
                        aria-label={`${tag} 태그 삭제`}
                      >
                        ×
                      </button>
                    </span>
                  ),
                )}
              </div>
            )}
          </div>

          {message && (
            <p
              className="caption2-medium bg-sub text-main rounded-lg px-3 py-2"
              role="alert"
            >
              {message}
            </p>
          )}

          <footer className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={
                handleBackNavigation
              }
              disabled={
                isSubmitting
              }
              className="caption1-semibold border-gray2 h-10 flex-1 rounded-xl border bg-white text-black disabled:opacity-60"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={
                !isFormValid
              }
              className={`caption1-semibold h-10 flex-1 rounded-xl transition-colors ${
                isFormValid
                  ? 'bg-main text-white'
                  : 'bg-gray2 text-gray3 cursor-not-allowed'
              }`}
            >
              {isSubmitting
                ? '등록 중...'
                : '작성 완료'}
            </button>
          </footer>
        </div>
      </form>
    </main>
  )
}