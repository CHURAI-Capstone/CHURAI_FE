import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

import { getHome, type HomeData } from '@/apis/home'
import ArrowIcon from '@/assets/icons/arrow-down.svg?react'
import dujjonku from '@/assets/images/dujjonku.png'
import SquareCard from '@/components/card/SquareCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { routePaths } from '@/router/paths'

const CATEGORY_PRESENTATION = {
  MAIN_DISH: {
    label: '든든한 식사',
    description: '한 끼로 즐기는 꿀조합',
    emoji: '🍽️',
  },
  DESSERT: {
    label: '달콤한 디저트',
    description: '기분 좋아지는 꿀조합',
    emoji: '🍰',
  },
} as const

export function HomePage() {
  useDocumentTitle('홈 | CHURAI')

  const navigate = useNavigate()
  const [home, setHome] = useState<HomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    getHome()
      .then((result) => {
        if (!cancelled) setHome(result)
      })
      .catch(() => {
        if (!cancelled) setErrorMessage('홈 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [retryKey])

  const retry = () => {
    setHome(null)
    setErrorMessage('')
    setIsLoading(true)
    setRetryKey((current) => current + 1)
  }

  if (isLoading) return <HomeLoading />

  if (!home || errorMessage) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <span className="text-4xl" aria-hidden="true">🍯</span>
        <h1 className="heading1-semibold mt-4">홈을 불러오지 못했어요</h1>
        <p className="caption1-regular text-gray3 mt-2">{errorMessage || '잠시 후 다시 시도해주세요.'}</p>
        <button type="button" onClick={retry} className="caption1-semibold bg-main mt-5 rounded-xl px-5 py-2.5 text-white">다시 시도</button>
      </main>
    )
  }

  return (
    <main className="px-3 pb-24">
      <HeroBanner onCreate={() => navigate(routePaths.boardCreate)} />

      <HomeSection
        title="지금 인기 있는 꿀조합"
        description="츄라이에서 가장 주목받는 조합이에요"
        actionLabel="전체 랭킹"
        onAction={() => navigate(routePaths.ranking)}
      >
        {home.popularPosts.length > 0 ? (
          <div className="scrollbar-none -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pt-7 pb-1">
            {home.popularPosts.map((post, index) => (
              <SquareCard
                key={post.postId}
                rank={index + 1}
                imageSrc={post.thumbnailUrl ?? undefined}
                title={post.title}
                summary={post.summary}
                category={post.category === 'MAIN_DISH' ? '식사' : '디저트'}
                nickname={post.writerNickname}
                views={post.views}
                onClick={() => navigate(`/posts/${post.postId}`)}
              />
            ))}
          </div>
        ) : (
          <EmptySection text="아직 인기 꿀조합이 없습니다." />
        )}
      </HomeSection>

      <HomeSection title="카테고리로 둘러보기" description="오늘 끌리는 조합을 골라보세요">
        <div className="grid grid-cols-2 gap-2.5">
          {home.categories.map((item) => {
            const presentation = CATEGORY_PRESENTATION[item.category]

            return (
              <button
                key={item.category}
                type="button"
                onClick={() => navigate(`${routePaths.board}?category=${item.category}`)}
                className="border-gray1 min-w-0 rounded-2xl border bg-white p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
              >
                <span className="text-2xl" aria-hidden="true">{presentation.emoji}</span>
                <strong className="caption1-semibold mt-3 block truncate">{presentation.label}</strong>
                <span className="caption2-regular text-gray3 mt-0.5 block truncate">{presentation.description}</span>
                <span className="caption2-medium text-main mt-3 block">{item.postCount.toLocaleString()}개의 레시피</span>
              </button>
            )
          })}
        </div>
      </HomeSection>

      <HomeSection
        title="새로 올라온 꿀조합"
        description="따끈따끈한 최신 레시피를 확인해보세요"
        actionLabel="전체 보기"
        onAction={() => navigate(routePaths.board)}
      >
        {home.latestPosts.length > 0 ? (
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            spaceBetween={12}
            slidesPerView="auto"
            className="overflow-visible!"
          >
            {home.latestPosts.map((post) => (
              <SwiperSlide key={post.postId} className="w-auto!">
                <SquareCard
                  imageSrc={post.thumbnailUrl ?? undefined}
                  title={post.title}
                  summary={post.summary}
                  category={post.category === 'MAIN_DISH' ? '식사' : '디저트'}
                  nickname={post.writerNickname}
                  views={post.views}
                  onClick={() => navigate(`/posts/${post.postId}`)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <EmptySection text="새로 등록된 꿀조합이 없습니다." />
        )}
      </HomeSection>
    </main>
  )
}

function HeroBanner({ onCreate }: { onCreate: () => void }) {
  return (
    <button
      type="button"
      onClick={onCreate}
      className="relative block h-24 w-full overflow-hidden rounded-xl bg-linear-to-b from-[#ECECB8] to-[#DCDC8D] text-left"
    >
      <span className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-[#5D3426]">
        <span className="caption2-medium block">제2의 두쫀쿠, 내가 만들어 볼까?</span>
        <strong className="caption1-semibold mt-1 block max-w-58">다음 트렌드가 될 꿀조합을 공유해주세요!</strong>
      </span>
      <img src={dujjonku} alt="" className="absolute top-0 right-0 h-full w-30 object-cover object-left" />
    </button>
  )
}

function HomeSection({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  children: React.ReactNode
}) {
  return (
    <section className="mt-7">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="heading1-semibold truncate">{title}</h2>
          <p className="caption1-regular text-gray3 mt-0.5 truncate">{description}</p>
        </div>
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className="caption2-medium text-main flex shrink-0 items-center gap-0.5">
            {actionLabel}
            <ArrowIcon className="h-4 w-4 rotate-270" />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function EmptySection({ text }: { text: string }) {
  return <p className="caption1-regular bg-white text-gray3 rounded-xl px-4 py-8 text-center">{text}</p>
}

function HomeLoading() {
  return (
    <main className="flex-1 animate-pulse px-3 pb-24">
      <div className="bg-gray2 h-24 rounded-xl" />
      {[1, 2, 3].map((section) => (
        <section key={section} className="mt-7">
          <div className="bg-gray2 h-6 w-44 rounded" />
          <div className="bg-gray2 mt-2 h-4 w-56 rounded" />
          <div className="mt-4 flex gap-3 overflow-hidden">
            <div className="h-56 min-w-55 rounded-2xl bg-white" />
            <div className="h-56 min-w-55 rounded-2xl bg-white" />
          </div>
        </section>
      ))}
    </main>
  )
}
