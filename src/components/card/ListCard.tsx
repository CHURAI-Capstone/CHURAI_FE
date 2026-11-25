import ForkIcon from '../../assets/icons/fork.svg?react'
import LikeIcon from '../../assets/icons/good.svg?react'
import LookIcon from '../../assets/icons/eye.svg?react'
import { usePostActions } from '../../hooks/usePostActions'
import badge1 from '../../assets/icons/1st-badge.svg'
import badge2 from '../../assets/icons/2nd-badge.svg'
import badge3 from '../../assets/icons/3rd-badge.svg'

interface PostCardProps {
  postId: number
  imageUrl?: string
  category: string
  nickname: string
  title: string
  heungMiCount: number
  viewCount: number
  churaiCount: number
  rank?: number
  onClick?: () => void
}

const BADGE: Record<number, string> = { 1: badge1, 2: badge2, 3: badge3 }

const PostCard = ({
  postId,
  imageUrl,
  category,
  nickname,
  title,
  heungMiCount,
  viewCount,
  churaiCount,
  onClick,
  rank,
}: PostCardProps) => {
  const { churaid, toggleChurai, interested, toggleInterested } = usePostActions(postId)

  return (
    <article
      className="rounded-medium4 relative flex h-23.5 w-full cursor-pointer items-center gap-3 bg-white p-3"
      onClick={onClick}
    >
      <div className="rounded-small bg-gray1 h-17.5 w-17.5 shrink-0 overflow-hidden">
        {imageUrl && <img src={imageUrl} alt={title} className="h-full w-full object-cover" />}
      </div>
      {rank && BADGE[rank] && (
        <img src={BADGE[rank]} alt={`${rank}등`} className="absolute top-2 right-2" />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-1">
          <span className="caption2-medium text-gray4 max-w-7.75 truncate">{category}</span>
          <span className="caption2-medium text-gray4">|</span>
          <span className="caption2-medium text-gray2 max-w-10.5 truncate">{nickname}</span>
        </div>

        <h3 className="caption1-semibold line-clamp-1 text-black">{title}</h3>

        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-0.5 ${churaid ? 'text-main' : 'text-gray2'}`}
            onClick={e => {
              e.stopPropagation()
              toggleChurai()
            }}
          >
            <ForkIcon className="h-4 w-4" />
            <span className="caption2-medium">{churaiCount + (churaid ? 1 : 0)}</span>
          </button>

          <button
            className={`flex items-center gap-0.5 ${interested ? 'text-main' : 'text-gray2'}`}
            onClick={e => {
              e.stopPropagation()
              toggleInterested()
            }}
          >
            <LikeIcon className="h-4 w-4" />
            <span className="caption2-medium">{heungMiCount + (interested ? 1 : 0)}</span>
          </button>

          <div className="text-gray2 flex items-center gap-0.5">
            <LookIcon className="h-4 w-4" />
            <span className="caption2-medium">{viewCount}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default PostCard
