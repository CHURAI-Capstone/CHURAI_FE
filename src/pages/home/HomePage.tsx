import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

import ArrowIcon from '@/assets/icons/arrow-down.svg?react'
import dujjonku from '@/assets/images/dujjonku.png'
import ListCard from '@/components/card/ListCard'
import SquareCard from '@/components/card/SquareCard'
import {
  getPostList,
  getPostRanking,
} from '@/apis/board/boardApi'
import type { PostDetailResponse } from '@/apis/board/boardApi'

const CATEGORY_LABEL: Record<string, string> = {
  MEAL: '식사',
  DESSERT: '디저트',
}

export function HomePage() {
  const navigate = useNavigate()

  const [top3, setTop3] = useState<PostDetailResponse[]>([])
  const [postList, setPostList] = useState<PostDetailResponse[]>([])

  useEffect(() => {
    getPostRanking()
      .then((data) => {
        setTop3(data ?? [])
      })
      .catch(console.error)

    getPostList()
      .then((data) => {
        setPostList(data ?? [])
      })
      .catch(console.error)
  }, [])

  return (
    <main className="px-3">
      <section className="relative h-20 overflow-hidden rounded-lg bg-linear-to-b from-[#ECECB8] to-[#DCDC8D]">
        <div className="absolute bottom-3 left-3 text-[#5D3426]">
          <p className="caption1-medium">
            제 2의 두쫀쿠 내가 만들어 볼까?
          </p>

          <p className="body2-semibold">
            다음 트렌드가 될 레시피를 공유해주세요!
          </p>
        </div>

        <div className="absolute top-0 right-0">
          <img src={dujjonku} alt="두쫀쿠" />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="heading1-semibold">
          츄라이 레시피 Top3
        </h2>

        <p className="body2-medium text-gray3">
          이번주 가장 핫한 꿀조합 확인하기
        </p>

        <div className="mt-4">
          <Swiper
            modules={[Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            spaceBetween={12}
            slidesPerView="auto"
            className="overflow-visible!"
          >
            {top3.slice(0, 3).map((item, index) => (
              <SwiperSlide
                key={item.id ?? index}
                className="w-auto!"
              >
                <SquareCard
                  postId={item.id}
                  rank={index + 1}
                  title={item.title}
                  imageSrc={item.thumbnailUrl}
                  likes={item.interestedCount}
                  views={item.views}
                  shares={item.churaiCount}
                  onClick={() =>
                    navigate(`/boardDetail/${item.id}`)
                  }
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="mt-6 mb-10">
        <div className="flex items-center justify-between">
          <h3 className="body2-semibold">
            츄라이 레시피를 확인해보세요!
          </h3>

          <button
            type="button"
            className="caption1-regular text-gray3 flex items-center gap-1"
            onClick={() => navigate('/board')}
          >
            <span>더보기</span>
            <ArrowIcon className="h-4 w-4 rotate-270" />
          </button>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {postList.map((item, index) => (
            <ListCard
              key={item.id ?? index}
              postId={item.id}
              imageUrl={item.thumbnailUrl}
              category={
                CATEGORY_LABEL[item.category] ?? item.category
              }
              nickname={item.nickname}
              title={item.title}
              heungMiCount={item.interestedCount}
              viewCount={item.views}
              churaiCount={item.churaiCount}
              onClick={() =>
                navigate(`/boardDetail/${item.id}`)
              }
            />
          ))}
        </div>

        <div className="mt-3 flex justify-center">
          <button
            type="button"
            className="caption1-regular text-gray3 flex items-center gap-1"
            onClick={() => navigate('/board')}
          >
            <span>더보기</span>
            <ArrowIcon className="h-4 w-4 rotate-270" />
          </button>
        </div>
      </section>
    </main>
  )
}