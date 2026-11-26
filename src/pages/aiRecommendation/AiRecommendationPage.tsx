import axios from 'axios'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { getAiRecommendations, type RecommendedPost } from '@/apis/aiRecommendation'
import BackIcon from '@/assets/icons/back.svg?react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

const EXAMPLES = [
  { label: '🌶️ 매콤한 야식', prompt: '오늘 매콤하고 간단하게 먹을 수 있는 야식 추천해줘!' },
  { label: '🍰 달콤한 디저트', prompt: '달콤한 디저트로 즐길 수 있는 꿀조합을 추천해줘!' },
  { label: '🍚 든든한 한 끼', prompt: '오늘 든든한 한 끼로 먹기 좋은 꿀조합을 추천해줘!' },
] as const

function getRequestErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return '로그인이 필요합니다. 다시 로그인해주세요.'
    if (error.response?.status === 429) return '요청이 많습니다. 잠시 후 다시 시도해주세요.'
    if (error.response?.status === 502 || error.response?.status === 503) {
      return 'AI 추천 서비스를 이용하기 어렵습니다. 잠시 후 다시 시도해주세요.'
    }
    if (error.code === 'ECONNABORTED') return '추천 요청 시간이 초과되었습니다. 다시 시도해주세요.'
    if (!error.response) return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
    return '추천을 불러오지 못했습니다. 다시 시도해주세요.'
  }

  return error instanceof Error ? error.message : '추천을 불러오지 못했습니다. 다시 시도해주세요.'
}

export function AiRecommendationPage() {
  useDocumentTitle('AI 꿀조합 추천 | CHURAI')

  const navigate = useNavigate()
  const controllerRef = useRef<AbortController | null>(null)
  const [prompt, setPrompt] = useState('')
  const [recommendations, setRecommendations] = useState<RecommendedPost[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => () => controllerRef.current?.abort(), [])

  const changePrompt = (value: string) => {
    setPrompt(value)
    setRecommendations(null)
    setErrorMessage('')
  }

  const requestRecommendations = async () => {
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt || trimmedPrompt.length > 250 || controllerRef.current) return

    const controller = new AbortController()
    controllerRef.current = controller
    setIsLoading(true)
    setErrorMessage('')
    setRecommendations(null)

    try {
      const result = await getAiRecommendations(trimmedPrompt, controller.signal)
      if (!controller.signal.aborted) setRecommendations(result.recommendations)
    } catch (error) {
      if (controller.signal.aborted) return
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate(routePaths.login, {
          replace: true,
          state: { from: routePaths.aiRecommendations, message: '로그인이 필요합니다. 다시 로그인해주세요.' },
        })
        return
      }
      setErrorMessage(getRequestErrorMessage(error))
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
      if (!controller.signal.aborted) setIsLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void requestRecommendations()
  }

  return (
    <main className="px-4 pb-24">
      <div className="mb-5 flex items-center gap-3">
        <button type="button" onClick={() => navigate(routePaths.home)} aria-label="홈으로 이동" className="flex h-9 w-9 shrink-0 items-center justify-center">
          <BackIcon className="h-5 w-5" />
        </button>
        <h1 className="heading1-semibold">AI 꿀조합 추천</h1>
      </div>

      <p className="body2-medium text-gray4 mb-5">오늘 뭐 먹을지 고민된다면, 츄라이 AI에게 물어보세요!</p>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-4 shadow-sm">
        <label htmlFor="recommendation-prompt" className="caption1-semibold mb-2 block">어떤 조합이 먹고 싶나요?</label>
        <textarea
          id="recommendation-prompt"
          value={prompt}
          onChange={(event) => changePrompt(event.target.value)}
          maxLength={250}
          rows={5}
          disabled={isLoading}
          placeholder="예) 오늘 매콤하고 간단하게 먹을 수 있는 야식 추천해줘!"
          className="caption1-regular border-gray2 focus:border-main w-full resize-none rounded-xl border p-3 outline-none placeholder:text-gray3 disabled:bg-gray1"
        />
        <p className="caption2-regular text-gray3 mb-4 text-right">{prompt.length}/250</p>
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="caption1-semibold bg-main flex h-11 w-full items-center justify-center rounded-xl text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? '추천받는 중...' : 'AI 추천받기'}
        </button>
      </form>

      <section className="mt-6" aria-label="추천 예시">
        <h2 className="caption1-semibold mb-3">이렇게 물어보세요</h2>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => changePrompt(example.prompt)}
              disabled={isLoading}
              className="caption2-medium border-gray2 rounded-full border bg-white px-3 py-2 disabled:opacity-50"
            >
              {example.label}
            </button>
          ))}
        </div>
      </section>

      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-10" role="status">
          <span className="border-main h-8 w-8 animate-spin rounded-full border-3 border-t-transparent" aria-hidden="true" />
          <p className="caption1-medium text-gray4">츄라이 AI가 취향에 맞는 꿀조합을 찾고 있어요...</p>
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 rounded-xl bg-white px-4 py-5 text-center">
          <p className="caption1-medium text-main" role="alert">{errorMessage}</p>
          <button type="button" onClick={() => void requestRecommendations()} className="caption1-semibold text-main mt-3">다시 시도</button>
        </div>
      )}

      {!isLoading && recommendations && (
        <section className="mt-7" aria-label="AI 추천 결과">
          <h2 className="heading1-semibold mb-4">추천 꿀조합</h2>
          {recommendations.length === 0 ? (
            <div className="rounded-xl bg-white px-4 py-6 text-center">
              <p className="caption1-medium text-gray4">조건에 맞는 꿀조합을 찾지 못했어요.</p>
              <button type="button" onClick={() => void requestRecommendations()} className="caption1-semibold text-main mt-3">다시 시도</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recommendations.slice(0, 3).map(({ post, reason }) => (
                <button
                  key={post.postId}
                  type="button"
                  onClick={() => navigate(routePaths.postDetail.replace(':postId', String(post.postId)))}
                  className="w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm"
                  aria-label={`${post.title} 레시피 보러가기`}
                >
                  <div className="bg-gray1 h-36 w-full">
                    {post.thumbnailUrl ? (
                      <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray2 flex h-full items-center justify-center text-3xl" aria-hidden="true">🍯</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="caption2-medium text-gray3">{post.category === 'MAIN_DISH' ? '식사' : '디저트'} · {post.writerNickname}</p>
                    <h3 className="body2-semibold mt-1">{post.title}</h3>
                    {post.summary && <p className="caption1-regular text-gray4 mt-1">{post.summary}</p>}
                    <p className="caption1-medium bg-sub text-main mt-3 rounded-lg p-3">{reason}</p>
                    <span className="caption2-medium text-main mt-3 block text-right">레시피 보러가기 →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  )
}
