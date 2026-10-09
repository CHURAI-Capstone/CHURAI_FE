import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { createPost } from '@/apis/board/boardApi'
import BowlIcon from '@/assets/icons/boul.svg?react'
import ImageIcon from '@/assets/icons/image.svg?react'
import SnackIcon from '@/assets/icons/snacks.svg?react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

type PostCategory = 'MEAL' | 'DESSERT'

interface ImagePreview {
  file: File
  url: string
}

const MAX_IMAGE_COUNT = 3

export function BoardCreatePage() {
  useDocumentTitle('레시피 작성 | CHURAI')

  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [contents, setContents] = useState('')
  const [category, setCategory] = useState<PostCategory | ''>('')
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [imagePreviews])

  const isFormValid =
    title.trim() !== '' &&
    contents.trim() !== '' &&
    category !== '' &&
    !isSubmitting

  const handleBackNavigation = () => {
    const isConfirmed = window.confirm('작성 중인 내용을 취소하시겠습니까?')

    if (isConfirmed) {
      navigate(-1)
    }
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    if (imagePreviews.length + files.length > MAX_IMAGE_COUNT) {
      setMessage('이미지는 최대 3장까지 업로드할 수 있습니다.')
      event.target.value = ''
      return
    }

    const nextPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))

    setImagePreviews((prev) => [...prev, ...nextPreviews])
    setMessage('')
    event.target.value = ''
  }

  const handleImageDelete = (targetUrl: string) => {
    setImagePreviews((prev) => {
      const targetPreview = prev.find((preview) => preview.url === targetUrl)

      if (targetPreview) {
        URL.revokeObjectURL(targetPreview.url)
      }

      return prev.filter((preview) => preview.url !== targetUrl)
    })
  }

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()

    const nextTag = tagInput.trim()

    if (!nextTag) {
      return
    }

    if (tags.includes(nextTag)) {
      setTagInput('')
      return
    }

    setTags((prev) => [...prev, nextTag])
    setTagInput('')
  }

  const handleTagDelete = (targetTag: string) => {
    setTags((prev) => prev.filter((tag) => tag !== targetTag))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!isFormValid || category === '') {
      setMessage('필수 항목을 모두 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      const data = await createPost({
        title: title.trim(),
        contents: contents.trim(),
        category,
        images: imagePreviews.map((preview) => preview.file),
        tags,
      })

      window.alert('레시피 작성이 완료되었습니다.')

      if (data?.id) {
        navigate(`/boardDetail/${data.id}`)
        return
      }

      navigate(routePaths.home)
    } catch {
      setMessage('레시피 작성에 실패했습니다. 잠시 후 다시 시도해주세요.')
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
          <h1 className="body2-semibold">레시피 작성</h1>

          <button
            type="button"
            onClick={handleBackNavigation}
            className="absolute right-7 flex h-6 w-6 items-center justify-center text-white"
            aria-label="작성 취소"
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
              onChange={(event) => setTitle(event.target.value)}
              placeholder="레시피명을 입력해주세요"
              disabled={isSubmitting}
              className="caption2-regular focus:border-main h-11 rounded-xl border border-gray-200 px-3.5 outline-none placeholder:text-gray-300 disabled:bg-gray1"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">카테고리*</span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategory('MEAL')}
                disabled={isSubmitting}
                className={`caption2-medium flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border text-black transition-colors ${
                  category === 'MEAL'
                    ? 'border-main bg-sub font-semibold'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <BowlIcon className="h-4 w-4" />
                <span>식사류</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('DESSERT')}
                disabled={isSubmitting}
                className={`caption2-medium flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border text-black transition-colors ${
                  category === 'DESSERT'
                    ? 'border-main bg-sub font-semibold'
                    : 'border-gray-200 bg-white'
                }`}
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
              onChange={(event) => setContents(event.target.value)}
              placeholder={`자유롭게 레시피를 작성해주세요.\n재료:\n만드는 방법:\n1.\n2.\n3.`}
              disabled={isSubmitting}
              className="caption2-regular focus:border-main resize-none rounded-xl border border-gray-200 p-3.5 leading-relaxed outline-none placeholder:text-gray-300 disabled:bg-gray1"
            />
          </label>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="caption2-regular flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 text-gray3 transition-colors hover:bg-gray1 disabled:cursor-not-allowed"
            >
              <ImageIcon className="h-4 w-4" />
              <span>사진 업로드</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((preview) => (
                  <div
                    key={preview.url}
                    className="group relative mt-1 h-14 w-14 overflow-hidden rounded-lg border border-gray-200"
                  >
                    <img
                      src={preview.url}
                      alt="업로드 이미지 미리보기"
                      className="h-full w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleImageDelete(preview.url)}
                      className="caption2-medium absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="caption2-medium text-gray4">태그 설정</span>
            <input
              type="text"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="태그를 입력하고 Enter"
              disabled={isSubmitting}
              className="caption2-regular focus:border-main h-11 rounded-xl border border-gray-200 px-3.5 outline-none placeholder:text-gray-300 disabled:bg-gray1"
            />
          </label>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="caption2-medium inline-flex h-8 items-center gap-1.5 rounded-full border border-gray2 px-3 text-gray3"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleTagDelete(tag)}
                    className="text-gray3"
                    aria-label={`${tag} 태그 삭제`}
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}

          {message && (
            <p className="caption2-medium rounded-lg bg-sub px-3 py-2 text-main">
              {message}
            </p>
          )}

          <footer className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleBackNavigation}
              disabled={isSubmitting}
              className="caption1-semibold h-10 flex-1 rounded-xl border border-gray2 bg-white text-black disabled:opacity-60"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`caption1-semibold h-10 flex-1 rounded-xl transition-colors ${
                isFormValid
                  ? 'bg-main text-white'
                  : 'cursor-not-allowed bg-gray2 text-gray3'
              }`}
            >
              {isSubmitting ? '등록 중...' : '작성 완료'}
            </button>
          </footer>
        </div>
      </form>
    </main>
  )
}
