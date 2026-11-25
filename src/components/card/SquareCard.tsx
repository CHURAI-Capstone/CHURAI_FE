import BadgeFirst from '@/assets/icons/1st-badge.svg'
import BadgeSecond from '@/assets/icons/2nd-badge.svg'
import BadgeThird from '@/assets/icons/3rd-badge.svg'
import EyeIcon from '@/assets/icons/eye.svg?react'

interface SquareCardProps {
  rank?: number
  imageSrc?: string
  title: string
  summary?: string
  category?: string
  nickname?: string
  views: number
  onClick?: () => void
}

const RANK_BADGES: Record<number, string> = {
  1: BadgeFirst,
  2: BadgeSecond,
  3: BadgeThird,
}

export default function SquareCard({
  rank,
  imageSrc,
  title,
  summary,
  category,
  nickname,
  views,
  onClick,
}: SquareCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-gray2 relative flex w-[min(68vw,15rem)] shrink-0 snap-start flex-col overflow-visible rounded-2xl border bg-white text-left transition-all duration-200 active:scale-[0.98]"
    >
      {rank && RANK_BADGES[rank] && (
        <img
          src={RANK_BADGES[rank]}
          alt={`${rank}위`}
          className="pointer-events-none absolute -top-6 left-3 z-20 h-11 w-11 object-contain drop-shadow-sm"
        />
      )}

      <div className="bg-gray1 h-34 w-full shrink-0 overflow-hidden rounded-t-2xl">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="text-gray2 flex h-full items-center justify-center text-3xl" aria-hidden="true">🍯</div>
        )}
      </div>

      <div className="flex min-h-27 min-w-0 flex-col p-3">
        {(category || nickname) && (
          <p className="caption2-medium text-gray3 truncate">
            {[category, nickname].filter(Boolean).join(' · ')}
          </p>
        )}
        <h3 className="caption1-semibold mt-0.5 truncate text-black" title={title}>{title}</h3>
        {summary && <p className="caption2-regular text-gray3 mt-1 line-clamp-1">{summary}</p>}
        <span className="caption2-medium text-gray3 mt-auto flex items-center gap-1 pt-2">
          <EyeIcon className="h-4 w-4" />
          {views.toLocaleString()}
        </span>
      </div>
    </button>
  )
}
