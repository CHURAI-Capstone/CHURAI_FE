import BadgeFirst from '../../assets/icons/1st-badge.svg'
import BadgeSecond from '../../assets/icons/2nd-badge.svg'
import BadgeThird from '../../assets/icons/3rd-badge.svg'
import GoodIcon from '../../assets/icons/good.svg?react'
import EyeIcon from '../../assets/icons/eye.svg?react'
import ForkIcon from '../../assets/icons/fork.svg?react'
import { usePostActions } from '../../hooks/usePostActions'

interface SquareCardProps {
  postId: number
  rank?: number
  imageSrc?: string
  title: string
  likes: number
  views: number
  shares: number
  onClick?: () => void
}

export default function SquareCard({
  postId,
  rank,
  imageSrc,
  title,
  likes,
  views,
  shares,
  onClick,
}: SquareCardProps) {
  const { churaid, toggleChurai, interested, toggleInterested } = usePostActions(postId)

  const rankBadges: Record<number, string> = {
    1: BadgeFirst,
    2: BadgeSecond,
    3: BadgeThird,
  }

  return (
    <div
      onClick={onClick}
      className="border-gray2 relative flex w-60 cursor-pointer flex-col overflow-visible rounded-2xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {rank && rankBadges[rank] && (
        <img
          src={rankBadges[rank]}
          alt={`${rank}등 뱃지`}
          className="pointer-events-none absolute -top-7 left-1/2 z-20 h-12 w-12 -translate-x-1/2 object-contain drop-shadow-sm"
        />
      )}

      <div className="bg-gray1 h-35 w-full shrink-0 overflow-hidden rounded-t-2xl">
        {imageSrc ? (
          <img src={imageSrc} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(45deg,#f4f5f6_25%,transparent_25%),linear-gradient(-45deg,#f4f5f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f4f5f6_75%),linear-gradient(-45deg,transparent_75%,#f4f5f6_75%)] bg-size-[20px_20px] bg-position-[0_0,0_10px,10px_-10px,-10px_0]" />
        )}
      </div>

      <div className="flex min-w-0 flex-col overflow-hidden rounded-b-2xl bg-white p-3">
        <h3 className="body2-medium truncate text-black" title={title}>
          {title}
        </h3>

        <div className="caption1-regular text-gray2 flex items-center gap-2">
          <button
            className={`flex items-center gap-0.5 transition-colors duration-200 ${churaid ? 'text-main' : 'text-gray2'}`}
            onClick={e => {
              e.stopPropagation()
              toggleChurai()
            }}
          >
            <ForkIcon className="h-4 w-4" />
            <span>{shares + (churaid ? 1 : 0)}</span>
          </button>

          <button
            className={`flex items-center gap-0.5 font-medium transition-colors duration-200 ${interested ? 'text-main' : 'text-gray2'}`}
            onClick={e => {
              e.stopPropagation()
              toggleInterested()
            }}
          >
            <GoodIcon className="h-4 w-4" />
            <span>{likes + (interested ? 1 : 0)}</span>
          </button>

          <div className="flex items-center gap-0.5">
            <EyeIcon className="h-4 w-4" />
            <span>{views}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
