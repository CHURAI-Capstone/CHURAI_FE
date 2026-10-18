import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getMyInfo } from '@/apis/auth'
import {
  getPostDetail,
  updatePost,
  type PostImageResponse,
} from '@/apis/board/boardApi'
import BowlIcon from '@/assets/icons/boul.svg?react'
import ImageIcon from '@/assets/icons/image.svg?react'
import SnackIcon from '@/assets/icons/snacks.svg?react'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

type PostCategory = 'MAIN_DISH' | 'DESSERT'

interface NewImagePreview {
  file: File
  url: string
}

const MAX_IMAGE_COUNT = 3
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function BoardEditPage() {
  useDocumentTitle('레시피 수정 | CHURAI')

  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlsRef = useRef<Set<string>>(new Set())

  const [title, setTitle] = useState('')
  const [contents, setContents] = useState('')
  const [category, setCategory] = useState<PostCategory | ''>('')
  const [existingImages, setExistingImages] = useState<PostImageResponse[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])
  const [newImages, setNewImages] = useState<NewImagePreview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formMessage, setFormMessage] = useState('')

  const isValidPostId =
    Boolean(postId) && Number.isSafeInteger(Number(postId)) && Number(postId) > 0
  const canSubmit = Boolean(title.trim() && contents.trim() && category) && !isSubmitting

  useEffect(() => {
    const previewUrls = previewUrlsRef.current
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  useEffect(() => {
    if (!postId || !isValidPostId) {
      return
    }

    let cancelled = false

    Promise.all([getPostDetail(postId), getMyInfo()])
      .then(([post, me]) => {
        if (cancelled) {
          return
        }

        if (post.writerId !== me.userId) {
          setErrorMessage('게시글 작성자만 수정할 수 있습니다.')
          return
        }

        setTitle(post.title)
        setContents(post.contents ?? '')
        setCategory(post.category)
        setExistingImages(post.images ?? [])
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(getAuthErrorMessage(error, '레시피를 불러오지 못했습니다.'))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isValidPostId, postId])

  const detailPath = postId
    ? routePaths.postDetail.replace(':postId', postId)
    : routePaths.home

  const handleCancel = () => {
    if (window.confirm('수정 중인 내용을 취소하시겠습니까?')) {
      navigate(detailPath)
    }
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (files.some((file) => !SUPPORTED_IMAGE_TYPES.includes(file.type))) {
      setFormMessage('JPG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.')
      return
    }

    if (existingImages.length + newImages.length + files.length > MAX_IMAGE_COUNT) {
      setFormMessage('이미지는 최대 3장까지 첨부할 수 있습니다.')
      return
    }

    const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }))
    previews.forEach((preview) => previewUrlsRef.current.add(preview.url))
    setNewImages((current) => [...current, ...previews])
    setFormMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormMessage('')

    if (!postId || !canSubmit || !category) {
      setFormMessage('필수 항목을 모두 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      await updatePost(postId, {
        title: title.trim(),
        contents: contents.trim(),
        category,
        deleteImageIds: deletedImageIds,
        images: newImages.map((image) => image.file),
      })
      window.alert('레시피가 수정되었습니다.')
      navigate(detailPath, { replace: true })
    } catch (error) {
      setFormMessage(getAuthErrorMessage(error, '레시피 수정에 실패했습니다.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isValidPostId) {
    return <EditState message="올바르지 않은 게시글 주소입니다." onBack={() => navigate(routePaths.home)} />
  }

  if (isLoading) {
    return <EditState message="레시피를 불러오는 중..." onBack={() => navigate(detailPath)} />
  }

  if (errorMessage) {
    return <EditState message={errorMessage} onBack={() => navigate(detailPath)} />
  }

  return (
    <main className="px-4 pb-10">
      <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl bg-white shadow-sm" noValidate>
        <header className="bg-main relative flex h-15 items-center justify-center px-7 text-white">
          <h1 className="body2-semibold">레시피 수정</h1>
          <button
            type="button"
            onClick={handleCancel}
            className="absolute right-7 flex h-6 w-6 items-center justify-center text-white"
            aria-label="수정 취소"
          >
            <span className="text-2xl leading-none">x</span>
          </button>
        </header>

        <div className="flex flex-col gap-5 p-6">
          <label className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">레시피명*</span>
            <input
              type="text"
              value={title}
              maxLength={100}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
              className="caption2-regular focus:border-main h-11 rounded-xl border border-gray-200 px-3.5 outline-none disabled:bg-gray1"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">카테고리*</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategory('MAIN_DISH')}
                disabled={isSubmitting}
                className={`caption2-medium flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border text-black ${category === 'MAIN_DISH' ? 'border-main bg-sub font-semibold' : 'border-gray-200 bg-white'}`}
              >
                <BowlIcon className="h-4 w-4" />
                <span>식사류</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('DESSERT')}
                disabled={isSubmitting}
                className={`caption2-medium flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border text-black ${category === 'DESSERT' ? 'border-main bg-sub font-semibold' : 'border-gray-200 bg-white'}`}
              >
                <SnackIcon className="h-4 w-4" />
                <span>디저트류</span>
              </button>
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">레시피 설명*</span>
            <textarea
              rows={6}
              value={contents}
              maxLength={5000}
              onChange={(event) => setContents(event.target.value)}
              disabled={isSubmitting}
              className="caption2-regular focus:border-main resize-none rounded-xl border border-gray-200 p-3.5 leading-relaxed outline-none disabled:bg-gray1"
            />
          </label>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting || existingImages.length + newImages.length >= MAX_IMAGE_COUNT}
              className="caption2-regular flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 text-gray3 disabled:cursor-not-allowed"
            >
              <ImageIcon className="h-4 w-4" />
              <span>사진 업로드</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            {(existingImages.length > 0 || newImages.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {existingImages.map((image) => (
                  <div key={image.imageId} className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200">
                    <img src={image.imageUrl} alt="등록된 레시피 이미지" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setExistingImages((current) => current.filter((item) => item.imageId !== image.imageId))
                        setDeletedImageIds((current) => [...current, image.imageId])
                      }}
                      disabled={isSubmitting}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white"
                      aria-label="등록된 이미지 삭제"
                    >
                      x
                    </button>
                  </div>
                ))}
                {newImages.map((image) => (
                  <div key={image.url} className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200">
                    <img src={image.url} alt="새 이미지 미리보기" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(image.url)
                        previewUrlsRef.current.delete(image.url)
                        setNewImages((current) => current.filter((item) => item.url !== image.url))
                      }}
                      disabled={isSubmitting}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white"
                      aria-label="새 이미지 삭제"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formMessage && <p className="caption2-medium rounded-lg bg-sub px-3 py-2 text-main" role="alert">{formMessage}</p>}

          <footer className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="caption1-semibold h-10 flex-1 rounded-xl border border-gray2 bg-white text-black disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`caption1-semibold h-10 flex-1 rounded-xl ${canSubmit ? 'bg-main text-white' : 'cursor-not-allowed bg-gray2 text-gray3'}`}
            >
              {isSubmitting ? '수정 중...' : '수정 완료'}
            </button>
          </footer>
        </div>
      </form>
    </main>
  )
}

function EditState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <main className="flex min-h-80 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="caption1-medium text-gray3">{message}</p>
      <button type="button" onClick={onBack} className="caption1-semibold bg-main rounded-xl px-5 py-2.5 text-white">
        돌아가기
      </button>
    </main>
  )
}
